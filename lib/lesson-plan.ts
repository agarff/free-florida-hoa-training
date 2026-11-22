import type {Lesson} from './course';
import type {LearningVideo} from './videos';
const words=(text:string)=>text.trim().split(/\s+/).filter(Boolean).length;
// Conservative planning assumptions, not a measured learner-completion claim.
export function lessonPlan(l:Lesson,videos:LearningVideo[],pitfall:string,labels:string[]){
 const readingWords=words([l.title,l.intro,pitfall,...labels,...l.points,...videos.flatMap(v=>[v.title,v.clipTitle,v.publisher,v.scope,v.why,v.context??'',v.question]),'Read the guide. Watch both clips in order. Apply general practices using the Florida sources and your own documents. Note the key mistake to avoid. Keep a record of your decision. Optional references and extended recordings are outside this session.'].join(' '))+100;
 const quizWords=words(l.quiz.flatMap(q=>[q.question,...q.options,q.feedback]).join(' '))+25;
 const additionalCase=l.additionalCase;
 const caseWords=words([l.scenario,...l.prompts,...(additionalCase?[additionalCase.title,additionalCase.scenario,additionalCase.prompt]:[])].join(' '));
 const videoSeconds=videos.reduce((sum,v)=>sum+v.end-v.start,0);
 return {readingWords,quizWords,caseWords,videoSeconds,readingEstimateSeconds:Math.ceil(readingWords/120*60)+90,quizEstimateSeconds:Math.ceil(quizWords/120*60)+90,caseReadingSeconds:Math.ceil(caseWords/120*60),videoWithTransitionsSeconds:videoSeconds+30};
}
