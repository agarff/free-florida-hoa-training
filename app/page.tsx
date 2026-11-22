import LearningApp from './learning-app';
import {getChatGPTUser} from './chatgpt-auth';
import {isInstructor} from '../lib/instructor';
import {lessons} from '../lib/course';
import {guidePath} from '../lib/guide-routes';
import {permanentRedirect} from 'next/navigation';
export const dynamic='force-dynamic';
export const metadata={alternates:{canonical:'https://training.example/'}};
export default async function Home({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const query=await searchParams;const month=typeof query.month==='string'?query.month.toLowerCase():'';
 const lesson=lessons.find(l=>l.month.toLowerCase()===month);if(lesson)permanentRedirect(guidePath(lesson));
 const view=typeof query.view==='string'&&['sources','progress','instructor','mistakes','privacy'].includes(query.view)?query.view:'lessons';
 const user=await getChatGPTUser();return <LearningApp signedIn={!!user} name={user?.displayName??''} instructor={await isInstructor()} initialView={view}/>;
}
