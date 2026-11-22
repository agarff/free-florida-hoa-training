import { and, eq, or } from 'drizzle-orm';
import { getDb } from '../../../db';
import { progress } from '../../../db/schema';
import { getChatGPTUser } from '../../chatgpt-auth';
import { lessons,lessonVersion } from '../../../lib/course';
import { sameOrigin } from '../../../lib/instructor';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store'};
export async function GET(){
 const u=await getChatGPTUser();if(!u)return Response.json({error:'Please sign in.'},{status:401,headers});
 const records=await getDb().select().from(progress).where(and(eq(progress.userId,u.userId),or(...lessons.map(l=>and(eq(progress.lessonId,l.id),eq(progress.version,lessonVersion(l)))))));
 return Response.json({records},{headers});
}
export async function POST(request:Request){
 const u=await getChatGPTUser();if(!u)return Response.json({error:'Please sign in.'},{status:401,headers});
 if(!sameOrigin(request))return Response.json({error:'Invalid request origin.'},{status:403,headers});
 let p:any;try{p=await request.json()}catch{return Response.json({error:'Invalid request.'},{status:400,headers})}
 if(!p||typeof p!=='object')return Response.json({error:'Invalid request.'},{status:400,headers});
 const lesson=lessons.find(l=>l.id===p.lessonId);
 if(!lesson||p.version!==lessonVersion(lesson)||!Array.isArray(p.answers)||p.answers.length!==lesson.quiz.length||!p.answers.every((a:number,i:number)=>Number.isInteger(a)&&a>=0&&a<lesson.quiz[i].options.length)||p.reviewed!==true)return Response.json({error:'Review the guide and answer every question.'},{status:400,headers});
 const score=lesson.quiz.reduce((n,q,i)=>n+(q.correct===p.answers[i]?1:0),0);const values={userId:u.userId,lessonId:lesson.id,version:lessonVersion(lesson),score,completed:score===lesson.quiz.length,updatedAt:new Date().toISOString()};
 await getDb().insert(progress).values(values).onConflictDoUpdate({target:[progress.userId,progress.lessonId,progress.version],set:{score,completed:values.completed,updatedAt:values.updatedAt}});
 return Response.json({record:values},{headers});
}
export async function DELETE(request:Request){
 const u=await getChatGPTUser();if(!u)return Response.json({error:'Please sign in.'},{status:401,headers});
 if(!sameOrigin(request))return Response.json({error:'Invalid request origin.'},{status:403,headers});
 await getDb().delete(progress).where(eq(progress.userId,u.userId));return Response.json({ok:true},{headers});
}
