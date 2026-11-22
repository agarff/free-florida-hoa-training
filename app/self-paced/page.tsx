import SelfPacedApp from './self-paced-app';
import {getChatGPTUser} from '../chatgpt-auth';
export const dynamic='force-dynamic';
export const metadata={title:'Self-paced Certification Pilot | Free Florida HOA Training',description:'Twelve self-paced Chapter 720 modules with individual case exercises and saved pilot progress. Unapproved beta; no certification or CE credit awarded.',alternates:{canonical:'https://training.example/self-paced'}};
export default async function SelfPaced(){const u=await getChatGPTUser();return <SelfPacedApp signedIn={!!u}/>}
