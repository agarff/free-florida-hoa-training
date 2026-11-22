export const teaching:Record<string,{pitfall:string;labels:string[]}>={
 records:{pitfall:'Losing track of an owner’s records request—or releasing information that should stay private.',labels:['Keep an index','Protect privacy','Track requests','Track education']},
 meetings:{pitfall:'Making board decisions without the required notice, open meeting or recorded vote.',labels:['Identify the business','Choose the notice route','Check special deadlines','Align the documents']},
 elections:{pitfall:'Copying a condominium election procedure instead of checking the HOA’s own documents and Chapter 720.',labels:['Read your documents','Plan the notice','Calculate the threshold','Keep the evidence']},
 directors:{pitfall:'Treating the president’s preference as a board decision or assuming an officer title gives unlimited authority.',labels:['Confirm delegated authority','Know officer duties','Disclose conflicts','Appoint and educate']},
 budget:{pitfall:'Treating the bank balance as money available to spend without checking reserves, bills and commitments.',labels:['Separate cash and budget','Compare actual spending','Check reporting duties','Assign responsibility']},
 reserves:{pitfall:'Using reserve money for ordinary operating bills without checking the rules governing that reserve.',labels:['Identify reserve status','Plan replacements','Follow collection steps','Get qualified advice']},
 vendors:{pitfall:'Choosing the cheapest proposal before checking that the vendors are pricing the same work.',labels:['Define the scope','Check bid requirements','Review the terms','Disclose interests']},
 arc:{pitfall:'Treating architectural approval as boundary certification, or bypassing the authorized review process.',labels:['Confirm authority and timing','Review the plan','Do not certify boundaries','Define approval limits']},
 insurance:{pitfall:'Assuming a volunteer role, a generic liability policy or a cheaper premium guarantees protection for the board.',labels:['Distinguish the policies','Read D&O coverage','Separate legal duties','Control reporting and authority']},
 enforcement:{pitfall:'Fining first and checking authority, notice, hearing requirements and consistency afterward.',labels:['Confirm enforceability','Separate committee roles','Follow current procedure','Involve counsel']},
 property:{pitfall:'Waiting for a storm or loss before deciding who maintains the asset and who handles the response.',labels:['Map responsibility','Inspect and maintain','Plan before the storm','Check wildlife rules']},
 'fair-housing':{pitfall:'Automatically rejecting a disability-related request because the resident’s proposal conflicts with an ordinary rule.',labels:['Recognize a request','Review assistance animals','Protect private information','Reconcile education records']}
};
export const commonMistakes=[
 {title:'Deciding by email',text:'Use the required board-meeting process for decisions. Sharing information by email does not authorize an email vote.',lesson:'meetings',source:'720.303',cite:'§720.303(2)–(3)'},
 {title:'Skipping notice',text:'Identify the meeting type, agenda and notice requirements before taking action. A budget, rule change or assessment may need a different notice.',lesson:'meetings',source:'720.303',cite:'§720.303(2)'},
 {title:'Confusing cash with surplus',text:'Check reserves, unpaid obligations and authorized spending before relying on a bank balance.',lesson:'budget',source:'720.303',cite:'§720.303(6)–(8)'},
 {title:'Ignoring records requests',text:'Track owner requests, meet the applicable access requirements and protect excluded information.',lesson:'records',source:'720.303',cite:'§720.303(4)–(5)'},
 {title:'Guessing at ARC authority',text:'Check the declaration, committee appointment, deadlines and written reasons before deciding an application.',lesson:'arc',source:'720.3035',cite:'§720.3035'},
 {title:'Fining without due process',text:'Check authority, notices, hearing procedures and consistent treatment before imposing a fine.',lesson:'enforcement',source:'720.305',cite:'§720.305(2)'},
 {title:'Borrowing condo procedures',text:'Start with Chapter 720 and your HOA documents. Chapter 718 is a different statute.',lesson:'elections',source:'720.306',cite:'§720.306'},
 {title:'Acting alone',text:'Confirm delegated authority and conflicts of interest. An officer’s title does not replace a required board decision.',lesson:'directors',source:'720.3033',cite:'§720.3033; governing documents'}
];
