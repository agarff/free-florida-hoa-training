import {and,eq,or} from 'drizzle-orm';
import {getDb} from '../../../db';
import {selfPacedProgress} from '../../../db/schema';
import {getChatGPTUser} from '../../chatgpt-auth';
import {sameOrigin} from '../../../lib/instructor';
import {lessons} from '../../../lib/course';
import {selfPacedVersion,validateSelfPaced,selfPacedResult} from '../../../lib/self-paced';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store'};
export async function GET(){
 const u=await getChatGPTUser();if(!u)return Response.json({error:'Please sign in.'},{status:401,headers});
 const rows=await getDb().select().from(selfPacedProgress).where(and(eq(selfPacedProgress.userId,u.userId),or(...lessons.map(l=>and(eq(selfPacedProgress.lessonId,l.id),eq(selfPacedProgress.version,selfPacedVersion(l)))))));
 return Response.json({records:rows.map(r=>({lessonId:r.lessonId,version:r.version,state:JSON.parse(r.state),completed:r.completed,updatedAt:r.updatedAt})),approvedHours:0},{headers});
}
export async function POST(request:Request){
 const u=await getChatGPTUser();if(!u)return Response.json({error:'Please sign in.'},{status:401,headers});
 if(!sameOrigin(request))return Response.json({error:'Invalid request origin.'},{status:403,headers});
 let p:any;try{const body=await request.text();if(body.length>16000)return Response.json({error:'Entry is too long.'},{status:413,headers});p=JSON.parse(body)}catch{return Response.json({error:'Invalid request.'},{status:400,headers})}
 const l=lessons.find(l=>l.id===p?.lessonId);const state=l?validateSelfPaced(l,p?.state):null;
 if(!l||p.version!==selfPacedVersion(l)||!state||!['save','complete'].includes(p.action))return Response.json({error:'Invalid lesson, edition or progress. Reload the module and try again.'},{status:400,headers});
 const result=selfPacedResult(l,state);if(p.action==='complete'&&!result.complete)return Response.json({error:'Confirm reading and clips, answer every case decision correctly, write at least 40 characters of reasoning, review the explanation, and answer every knowledge check correctly.'},{status:400,headers});
 const previous=await getDb().select({completed:selfPacedProgress.completed}).from(selfPacedProgress).where(and(eq(selfPacedProgress.userId,u.userId),eq(selfPacedProgress.lessonId,l.id),eq(selfPacedProgress.version,selfPacedVersion(l)))).get();
 const record={lessonId:l.id,version:selfPacedVersion(l),state,completed:result.complete&&(p.action==='complete'||previous?.completed===true),updatedAt:new Date().toISOString()};
 await getDb().insert(selfPacedProgress).values({...record,userId:u.userId,state:JSON.stringify(state)}).onConflictDoUpdate({target:[selfPacedProgress.userId,selfPacedProgress.lessonId,selfPacedProgress.version],set:{state:JSON.stringify(state),completed:record.completed,updatedAt:record.updatedAt}});
 return Response.json({record,approvedHours:0},{headers});
}
export async function DELETE(request:Request){
 const u=await getChatGPTUser();if(!u)return Response.json({error:'Please sign in.'},{status:401,headers});if(!sameOrigin(request))return Response.json({error:'Invalid request origin.'},{status:403,headers});
 await getDb().delete(selfPacedProgress).where(eq(selfPacedProgress.userId,u.userId));return Response.json({ok:true},{headers});
}
