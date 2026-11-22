import type {Metadata} from 'next';
import {notFound,permanentRedirect} from 'next/navigation';
import LearningApp from '../../learning-app';
import {getChatGPTUser} from '../../chatgpt-auth';
import {isInstructor} from '../../../lib/instructor';
import {lessons} from '../../../lib/course';
import {guidePath,guideSlugs,guideAliases} from '../../../lib/guide-routes';
export const dynamic='force-dynamic';
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {slug}=await params;const lesson=lessons.find(l=>guideSlugs[l.id]===slug||guideAliases[slug]===l.id);if(!lesson)return {title:'Guide not found'};
 return {title:`${lesson.title} | Free Florida HOA Training`,description:`Florida Chapter 720 HOA guide: ${lesson.intro} Unapproved beta; no CE credit.`,alternates:{canonical:'https://training.example'+guidePath(lesson)}};
}
export default async function Guide({params}:Props){
 const {slug}=await params;const lesson=lessons.find(l=>guideSlugs[l.id]===slug||guideAliases[slug]===l.id);if(!lesson)notFound();if(guideAliases[slug])permanentRedirect(guidePath(lesson));
 const user=await getChatGPTUser();return <LearningApp signedIn={!!user} name={user?.displayName??''} instructor={await isInstructor()} initialLessonId={lesson.id}/>;
}
