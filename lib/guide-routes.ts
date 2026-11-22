import type {Lesson} from './course';
export const guideSlugs:Record<string,string>={
  "vendors": "buy-the-right-work",
  "arc": "review-architectural-applications",
  "insurance": "do-and-association-insurance",
  "enforcement": "enforce-with-a-fair-process",
  "property": "prepare-the-property-before-the-storm",
  "fair-housing": "recognize-a-request-for-accommodation",
  "records": "keep-records-people-can-find",
  "meetings": "run-a-clear-open-meeting",
  "elections": "prepare-for-the-annual-meeting",
  "directors": "know-who-does-what",
  "budget": "read-the-budget-before-the-vote",
  "reserves": "plan-ahead-and-collect-fairly"
};
export const guidePath=(lesson:Lesson)=>'/guides/'+guideSlugs[lesson.id];

export const guideAliases:Record<string,string>={"give-applications-a-clear-path":"arc","approve-design-without-guessing-boundaries":"arc"};
