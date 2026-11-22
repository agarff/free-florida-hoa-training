import {Auth,type AuthConfig} from '@auth/core';
import Google from '@auth/core/providers/google';
import Apple from '@auth/core/providers/apple';
import {D1Adapter} from '@auth/d1-adapter';
import {getToken} from '@auth/core/jwt';
import {importPKCS8,SignJWT} from 'jose';
import {env} from 'cloudflare:workers';
const authOrigin = () => env.SITE_ORIGIN || 'https://training.example';
export const SESSION_COOKIE='__Secure-hoa-example.session-token';
export type ProviderId='google'|'apple';
export function providerAvailability(){return {
 google:!!(env.AUTH_SECRET&&env.AUTH_GOOGLE_ID&&env.AUTH_GOOGLE_SECRET),
 apple:!!(env.AUTH_SECRET&&env.AUTH_APPLE_ID&&env.AUTH_APPLE_TEAM_ID&&env.AUTH_APPLE_KEY_ID&&env.AUTH_APPLE_PRIVATE_KEY)
};}
export async function readProviderUser(h:Headers){
 if(!env.AUTH_SECRET||!env.DB)return null;
 const token=await getToken({req:{headers:h},secret:env.AUTH_SECRET,cookieName:SESSION_COOKIE,salt:SESSION_COOKIE,secureCookie:true,logger:{error(){},warn(){},debug(){}}});
 if(!token?.sub)return null;
 const user=await env.DB.prepare('SELECT id,email,name FROM users WHERE id = ?').bind(token.sub).first<{id:string;email:string;name:string|null}>();
 return user?.email?{userId:user.id,email:user.email,displayName:user.name||user.email,fullName:user.name}:null;
}
async function appleSecret(){
 const key=await importPKCS8(env.AUTH_APPLE_PRIVATE_KEY!.replace(/\\n/g,'\n'),'ES256');
 return new SignJWT({}).setProtectedHeader({alg:'ES256',kid:env.AUTH_APPLE_KEY_ID!}).setIssuer(env.AUTH_APPLE_TEAM_ID!).setAudience('https://appleid.apple.com').setSubject(env.AUTH_APPLE_ID!).setIssuedAt().setExpirationTime('10m').sign(key);
}
export async function authConfig():Promise<AuthConfig>{
 if(!env.AUTH_SECRET||env.AUTH_SECRET.length<32||!env.DB)throw new Error('Sign-in configuration incomplete');
 const availability=providerAvailability();
 const adapter=D1Adapter(env.DB);
 const originalCreate=adapter.createUser!,originalUpdate=adapter.updateUser!;
 adapter.createUser=async user=>originalCreate({...user,image:null});
 adapter.updateUser=async user=>originalUpdate({...user,image:null});
 const originalLink=adapter.linkAccount!;
 // Identity-only login does not need retained provider access or refresh tokens.
 adapter.linkAccount=async a=>{await originalLink({...a,access_token:undefined,refresh_token:undefined,id_token:undefined});};
 const flowCookie=(name:string)=>({name:'__Secure-hoa-example.'+name,options:{httpOnly:true,secure:true,sameSite:'none' as const,path:'/',maxAge:900}});
 return {
  secret:env.AUTH_SECRET,trustHost:true,basePath:'/api/auth',adapter,
  session:{strategy:'jwt',maxAge:7*24*60*60},
  providers:[...(availability.google?[Google({clientId:env.AUTH_GOOGLE_ID!,clientSecret:env.AUTH_GOOGLE_SECRET!,authorization:{params:{scope:'openid email profile'}},checks:['pkce','state','nonce']})]:[]),...(availability.apple?[Apple({clientId:env.AUTH_APPLE_ID!,clientSecret:await appleSecret()})]:[])],
  cookies:{sessionToken:{name:SESSION_COOKIE,options:{httpOnly:true,secure:true,sameSite:'none',path:'/'}},state:flowCookie('state'),nonce:flowCookie('nonce'),pkceCodeVerifier:flowCookie('pkce'),callbackUrl:flowCookie('callback-url'),csrfToken:{name:'__Host-hoa-example.csrf',options:{httpOnly:true,secure:true,sameSite:'lax',path:'/'}}},
  pages:{signIn:'/login',error:'/login'},
  callbacks:{
   async signIn({account,profile,user}){if(!account||!profile||!['google','apple'].includes(account.provider))return false;const emailVerified=(profile as Record<string,unknown>).email_verified;const verified=emailVerified===true||emailVerified==='true';if(!verified||!user.email)return false;user.email=user.email.toLowerCase();return true;},
   async jwt({token,user}){if(user){token.sub=user.id;token.email=user.email;token.name=user.name;delete token.picture;}return token;},
   async session({session,token}){if(session.user){session.user.id=token.sub!;session.user.email=String(token.email??'');}return session;},
   async redirect({url}){const target=new URL(url,authOrigin());return target.origin===authOrigin()?target.href:authOrigin();}
  },
  logger:{error(error){console.error('HOA sign-in failed:',error.name)},warn(code){console.warn('HOA sign-in:',code)},debug(){}}
 };
}
export async function handleAuth(request:Request){
 const url=new URL(request.url);
 if(url.origin!==authOrigin())return Response.redirect(authOrigin()+url.pathname+url.search,307);
 if(!env.AUTH_SECRET)return Response.json({error:'Additional sign-in methods are not configured yet.'},{status:503,headers:{'Cache-Control':'no-store'}});
 const response=await Auth(request,await authConfig());const safeHeaders=new Headers(response.headers);safeHeaders.set('Cache-Control','private, no-store');return new Response(response.body,{status:response.status,statusText:response.statusText,headers:safeHeaders});
}
