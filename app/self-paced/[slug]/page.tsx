import {notFound} from 'next/navigation';
import SelfPacedApp from '../self-paced-app';
import {getChatGPTUser} from '../../chatgpt-auth';
import {lessons} from '../../../lib/course';
import {guideSlugs} from '../../../lib/guide-routes';
import {selfPacedPath} from '../../../lib/self-paced';
export const dynamic='force-dynamic';
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props){const {slug}=await params;const l=lessons.find(l=>guideSlugs[l.id]===slug);return l?{title:`${l.title} — Self-paced | Free Florida HOA Training`,description:`Individual Chapter 720 study: ${l.intro} Unapproved pilot; no credit awarded.`,alternates:{canonical:'https://training.example'+selfPacedPath(l)}}:{title:'Module not found'}}
export default async function Module({params}:Props){const {slug}=await params;const l=lessons.find(l=>guideSlugs[l.id]===slug);if(!l)notFound();const u=await getChatGPTUser();return <SelfPacedApp signedIn={!!u} lessonId={l.id}/>}
