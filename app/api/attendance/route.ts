import { and,eq,isNull } from 'drizzle-orm';
import { getDb } from '../../../db';
import { attendance } from '../../../db/schema';
import { getChatGPTUser } from '../../chatgpt-auth';
import { isInstructor,roster,sameOrigin } from '../../../lib/instructor';
import { lessons,lessonVersion } from '../../../lib/course';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store'};
export async function GET(){
 const u=await getChatGPTUser();if(!u)return Response.json({error:'Please sign in.'},{status:401,headers});
 if(await isInstructor())return Response.json({roster:roster.map(({id,name})=>({id,name})),records:await getDb().select().from(attendance)},{headers});
 const member=roster.find(m=>m.email.toLowerCase()===u.email.toLowerCase());
 return Response.json({records:member?await getDb().select().from(attendance).where(and(eq(attendance.memberId,member.id),isNull(attendance.voidedAt))):[]},{headers});
}
export async function POST(request:Request){
 const u=await getChatGPTUser();if(!u||!await isInstructor())return Response.json({error:'Instructor access required.'},{status:403,headers});
 if(!sameOrigin(request))return Response.json({error:'Invalid request origin.'},{status:403,headers});
 let p:any;try{p=await request.json()}catch{return Response.json({error:'Invalid request.'},{status:400,headers})}
 if(!p||typeof p!=='object')return Response.json({error:'Invalid request.'},{status:400,headers});
 const db=getDb();
 if(p.action==='void'){
  if(typeof p.id!=='string')return Response.json({error:'Choose a record.'},{status:400,headers});
  await db.update(attendance).set({voidedAt:new Date().toISOString()}).where(eq(attendance.id,p.id));return Response.json({ok:true},{headers});
 }
 const selectedLesson=lessons.find(l=>l.id===p.lessonId);
 if(!selectedLesson||!/^\d{4}-\d{2}-\d{2}$/.test(p.date)||!Number.isFinite(Date.parse(p.date))||new Date(p.date).toISOString().slice(0,10)!==p.date||p.date>new Date().toISOString().slice(0,10)||!Array.isArray(p.memberIds)||p.memberIds.length<1||p.memberIds.length>roster.length||new Set(p.memberIds).size!==p.memberIds.length||!p.memberIds.every((id:string)=>roster.some(m=>m.id===id))||!Number.isInteger(p.liveMinutes)||p.liveMinutes<1||p.liveMinutes>240||!Number.isInteger(p.prepMinutes)||p.prepMinutes<0||p.prepMinutes>240)return Response.json({error:'Choose a completed session, attendees and actual instructional minutes.'},{status:400,headers});
 const existing=await db.select().from(attendance).where(and(eq(attendance.lessonId,p.lessonId),eq(attendance.sessionDate,p.date),isNull(attendance.voidedAt)));
 if(existing.some(r=>p.memberIds.includes(r.memberId)))return Response.json({error:'A record already exists for an attendee on this lesson and date. Void the old record before correcting it.'},{status:409,headers});
 const records=p.memberIds.map((memberId:string)=>({id:crypto.randomUUID(),memberId,lessonId:p.lessonId,version:lessonVersion(selectedLesson),sessionDate:p.date,liveMinutes:p.liveMinutes,prepMinutes:p.prepMinutes,recordedBy:u.userId,recordedAt:new Date().toISOString()}));
 await db.insert(attendance).values(records);return Response.json({ok:true,records},{headers});
}
