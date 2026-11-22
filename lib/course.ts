export const VERSION = 'pilot-2026-11-18';
export const BRAND = 'Free Florida HOA Training';
export const TAGLINE = 'One topic. Twenty minutes. Every month.';
const law = (s:string) => `https://www.flsenate.gov/Laws/Statutes/2026/${s}`;
type DiscussionCase = {title:string;scenario:string;prompt:string;resolution:string};
export type Lesson = {id:string;version?:string;month:string;title:string;intro:string;points:string[];scenario:string;prompts:string[];resolution:string;additionalCase?:DiscussionCase;sources:{title:string;url:string}[];quiz:{question:string;options:string[];correct:number;feedback:string}[];noticeReference?:{title:string;paragraphs:string[]}};
export const lessons:Lesson[] = [
  {
    "id": "vendors",
    "version": "pilot-2026-11-22-vendor-authority-v1",
    "month": "January",
    "title": "Buy the right work",
    "intro": "A useful vendor comparison begins with scope and authority, not just price. Insurance and contract terms should fit the work and the association’s responsibilities.",
    "points": [
      "Write a comparable scope: location, deliverables, exclusions, timing, cleanup, permits where applicable and who accepts the work. Tree trimming and tree removal are different purchases.",
      "Section 720.3055 generally requires competitive bids when covered contract payments exceed ten percent of the annual budget including reserves, subject to its exceptions. It does not require accepting the lowest bid.",
      "Check contract duration, renewal, termination, insurance, licensing where required, indemnity and payment terms. Governing documents may impose additional approval limits.",
      "Disclose director interests in a vendor and follow the applicable interested-transaction process. Keep the proposals, decision and signed agreement in the records."
    ],
    "scenario": "One contractor offers $350 to trim a tree. Another offers $1,000 to remove it. The board describes the cheaper proposal as an equivalent bid.",
    "prompts": [
      "What differences in scope should the decision acknowledge?",
      "What qualifications and insurance would you check?"
    ],
    "resolution": "Decide the intended outcome and compare scope as well as price. Explain whether preservation or removal is appropriate using qualified information where needed. Record the actual selected work and spending authority.",
    "additionalCase": {
      "title": "Trash contract: who must approve?",
      "scenario": "A board unanimously approves a budgeted three-year trash contract. The HOA’s Articles of Incorporation require prior homeowner approval for covered contracts longer than one year. The president plans to sign this covered contract without that approval.",
      "prompt": "What must happen before signing, and what record would show the homeowners properly approved the contract?",
      "resolution": "Hold the signature until homeowners approve, unless an applicable exception permits signing without prior approval. Verify the applicable meeting and notice procedures, quorum and voting requirements. Keep the approval record, including the minutes and vote result. Budget funding, a unanimous board vote and signing authority do not replace required member approval. The one-year threshold comes from this HOA’s Articles, not a statewide requirement for every multi-year contract. If already signed, ask association counsel to assess authority and advise on corrective action. Do not assume the contract is automatically invalid or that a later vote automatically cures the problem."
    },
    "sources": [
      {
        "title": "§720.3055 — contracts and bids",
        "url": "https://www.flsenate.gov/Laws/Statutes/2026/720.3055"
      },
      {
        "title": "§720.3033(2) — interested transactions",
        "url": "https://www.flsenate.gov/Laws/Statutes/2026/720.3033"
      },
      {
        "title": "§720.306 — member meetings, quorum and voting",
        "url": "https://www.flsenate.gov/Laws/Statutes/2026/720.306"
      }
    ],
    "quiz": [
      {
        "question": "Must the board always accept the lowest bid?",
        "options": [
          "Yes",
          "No",
          "Only if it is half the price"
        ],
        "correct": 1,
        "feedback": "The statute does not require the lowest bid; scope and suitability matter."
      },
      {
        "question": "What belongs in a useful comparison?",
        "options": [
          "Price only",
          "Scope, qualifications, terms, authority and price",
          "The vendor’s advertising slogan"
        ],
        "correct": 1,
        "feedback": "Compare the work actually being purchased."
      },
      {
        "question": "The Articles require homeowner approval for this trash contract. No exception applies. When may the president sign?",
        "options": [
          "After the unanimous board vote",
          "After homeowners approve through the required process",
          "As soon as funding is budgeted"
        ],
        "correct": 1,
        "feedback": "Budgeting, board approval and signing authority cannot substitute for the required homeowner vote."
      }
    ]
  },
  {
    "id": "arc",
    "month": "February",
    "title": "Review applications without guessing boundaries",
    "intro": "A complete architectural review follows the authorized process and recognizes its limits. Decide the application using published standards; leave boundary certification to qualified evidence.",
    "points": [
      "Confirm authority and timing. Check committee appointments, authorized standards, application requirements and the declaration’s deadline. Log receipt, completeness and communications. Do not assume a statewide deadline applies to every HOA.",
      "Review the submitted plan. Apply authorized location, height, material and appearance standards consistently, using the required meeting and decision process. An application can require committee review even if the owner calls it a simple notice. Give written reasons identifying the rule and nonconforming part when denying.",
      "Do not certify boundaries. Use the survey, site plan and owner representations supported by the governing process. Approval does not establish title, resolve a boundary dispute or authorize encroachment onto a neighbor’s land, easement or common property. Escalate known conflicts; do not guess from an existing fence or aerial photo.",
      "Define approval limits. Identify the plan and authorized conditions. Leave correct placement, permits and third-party permissions with the owner. A disclaimer is not blanket immunity. Section 720.3035(1)(c) bars requiring an issued government permit before architectural review; construction may still require one."
    ],
    "scenario": "A resident starts a fence as a “simple notice” project. The declaration requires committee approval, and a neighbor disputes the proposed line. The application includes a sketch, but no reliable boundary evidence.",
    "prompts": [
      "What authority, deadline and supporting evidence should the board check?",
      "What can the board approve, and which questions need a surveyor or counsel?"
    ],
    "resolution": "Preserve the application and communications; follow the authorized review route and deadline. Request evidence the documents support, and escalate disputed boundaries. Give a written decision tied to the standards. Do not certify the line or treat an approval disclaimer as complete immunity.",
    "sources": [
      {
        "title": "§720.3035 — limits on architectural review",
        "url": "https://www.flsenate.gov/Laws/Statutes/2026/720.3035"
      },
      {
        "title": "§720.303(2) — architectural committee meetings",
        "url": "https://www.flsenate.gov/Laws/Statutes/2026/720.303"
      },
      {
        "title": "§163.04 — renewable-energy devices",
        "url": "https://www.flsenate.gov/Laws/Statutes/2026/163.04"
      },
      {
        "title": "Pinellas County fence guidance (local example)",
        "url": "https://pinellas.gov/fences-walls/"
      }
    ],
    "quiz": [
      {
        "question": "Does architectural approval establish the legal boundary or authorize an encroachment?",
        "options": [
          "Yes",
          "No",
          "Only if every director agrees"
        ],
        "correct": 1,
        "feedback": "Approval addresses authorized architectural standards. The owner must establish lawful placement and obtain any third-party rights."
      },
      {
        "question": "An owner labels work a simple notice project. What determines the actual review route?",
        "options": [
          "The owner’s label",
          "The applicable declaration, authorized standards and law",
          "Whether a contractor is already on site"
        ],
        "correct": 1,
        "feedback": "Follow the governing review process and deadline; document specific reasons for a denial and escalate disputed boundaries."
      }
    ],
    "version": "pilot-2026-11-18-architecture-r2",
    "noticeReference": {
      "title": "Fence approval wording and owner rights · optional reference",
      "paragraphs": [
        "Proposed wording for counsel to tailor to your documents: Approval is limited to compliance with the Association’s applicable architectural requirements for the submitted plan. It does not certify property boundaries or authorize encroachments. The owner remains responsible for verifying the fence location and obtaining necessary permits and third-party permissions before installation.",
        "This draft is not an adopted rule or a guarantee against liability. Ask counsel whether your declaration authorizes a survey/site-plan requirement, who must identify easements, how review deadlines operate, and how to handle a known dispute. Do not impose unsupported new conditions or refuse review solely because a permit has not yet been issued.",
        "Statutory owner protections, including solar equipment under §163.04 and hurricane protection under §720.3035, also limit architectural control. Apply the provisions relevant to the specific project.",
        "Retain receipt/completeness dates, the plan version, committee appointments, notice evidence, written reasons and any authorized conditions. Do not invent a new statewide review deadline or bypass the declaration’s required committee."
      ]
    }
  },
  {
    "id": "insurance",
    "version": "pilot-2026-11-18-insurance-v1",
    "month": "March",
    "title": "Protect the board: D&O and insurance",
    "intro": "Insurance supports a careful board; it does not replace sound decisions. Learn which policy may respond, what to ask the broker, and why renewal and claim-reporting details matter.",
    "points": [
      "Distinguish the policies. D&O addresses covered governance allegations. General liability addresses covered injury or property damage; property insurance protects scheduled association assets; fidelity/crime addresses covered theft or dishonesty. These policies do not automatically substitute for one another.",
      "Read the actual D&O coverage. Check insured people and entities, defense costs inside or outside the limit, deductibles, exclusions, prior-acts dates, nonmonetary claims and relevant architectural, discrimination or contract allegations. The policy and endorsements control coverage.",
      "Keep legal duties separate. Section 720.3033(5) requires insurance or a fidelity bond for people controlling funds, subject to its annual member-waiver procedure. This is not a general D&O mandate. Check additional duties in your documents; volunteer status and indemnification do not guarantee insurance coverage.",
      "Control renewals, reporting and broker authority. Calendar renewal and claim-reporting contacts. Claims-made policies can have strict notice conditions; report a demand promptly under the policy. Read a broker-of-record letter before signing: it changes carrier representation, not necessarily coverage or price."
    ],
    "scenario": "The HOA receives a lawyer’s letter challenging a fence decision one week before insurance renewal. A new broker promises a lower price and asks for a broker-of-record letter. Nobody has compared the D&O terms or reporting deadlines.",
    "prompts": [
      "What should the board report now, and which policy details must it check?",
      "What authority and service terms should it understand before changing brokers?"
    ],
    "resolution": "Follow the current policy’s notice instructions promptly and retain evidence of reporting. Ask the broker to compare insured parties, limits, defense costs, exclusions, prior-acts and reporting terms. Review broker authority before signing. Keep the decision and policy documents; do not assume a cheaper quote or a volunteer role removes exposure.",
    "sources": [
      {
        "title": "§720.3033(5) — funds-handler insurance or fidelity bond",
        "url": "https://www.flsenate.gov/Laws/Statutes/2026/720.3033"
      },
      {
        "title": "§617.0831 — nonprofit indemnification framework",
        "url": "https://www.flsenate.gov/Laws/Statutes/2026/617.0831"
      },
      {
        "title": "Community-association D&O, liability and crime coverage — insurer example",
        "url": "https://www.chubb.com/us-en/business-insurance/protection-for-community-association-leaders-crime.html"
      },
      {
        "title": "HOA management-liability insurance — insurer example",
        "url": "https://www.travelers.com/business-insurance/professional-liability-insurance/hoa"
      }
    ],
    "quiz": [
      {
        "question": "Does D&O insurance automatically replace fidelity/crime coverage?",
        "options": [
          "Yes",
          "No",
          "Only for a small HOA"
        ],
        "correct": 1,
        "feedback": "The coverages address different risks. Check §720.3033(5), your documents and the actual policy terms."
      },
      {
        "question": "A demand arrives just before renewal. What is the best first step?",
        "options": [
          "Wait until a lawsuit is filed",
          "Report it promptly as the current policy requires and preserve the record",
          "Assume the next policy will cover it"
        ],
        "correct": 1,
        "feedback": "A claims-made policy can impose strict reporting conditions. The broker and insurer should evaluate the actual notice and coverage terms."
      }
    ]
  },
  {
    "id": "enforcement",
    "month": "April",
    "title": "Enforce with a fair process",
    "intro": "A consistent process is easier to explain and defend than a series of improvised exceptions. Identify the rule, facts and remedy before moving to fines.",
    "points": [
      "Confirm that a restriction is enforceable and applies to the facts. Preserve objective evidence and distinguish an observation from an assumption. Consider the effect of amendments and protected rights.",
      "Separate a courtesy reminder, a board decision and an independent hearing committee’s role. The statutory fining committee has eligibility requirements; the board cannot assume it can fill every role itself.",
      "Section 720.305 specifies notice, hearing, cure and communication requirements. Read the current procedure before setting a hearing or collecting a fine. Old association policies may need updating.",
      "Use counsel for disputed interpretation, selective-enforcement questions, litigation and applicable presuit procedures. Do not use education discussion as an unannounced decision on a resident’s case."
    ],
    "scenario": "Two directors propose fining a neighbor immediately, then appointing themselves to approve the fine at a hearing.",
    "prompts": [
      "What roles must be separated?",
      "What notices and opportunities must the current process provide?"
    ],
    "resolution": "Use a properly constituted committee and the statutory procedure. Document the violation and the steps taken. The board’s belief that a violation is obvious does not eliminate procedural requirements.",
    "sources": [
      {
        "title": "§720.305 — enforcement and hearings",
        "url": "https://www.flsenate.gov/Laws/Statutes/2026/720.305"
      },
      {
        "title": "§720.311 — dispute resolution",
        "url": "https://www.flsenate.gov/Laws/Statutes/2026/720.311"
      }
    ],
    "quiz": [
      {
        "question": "Can the board automatically serve as its own statutory fining committee?",
        "options": [
          "Yes",
          "No",
          "Only for small associations"
        ],
        "correct": 1,
        "feedback": "Check the committee eligibility and independence requirements."
      },
      {
        "question": "Does an obvious violation eliminate notice and hearing requirements?",
        "options": [
          "No",
          "Yes",
          "Only for repeat violations"
        ],
        "correct": 0,
        "feedback": "Follow the applicable process even when the facts seem clear."
      }
    ]
  },
  {
    "id": "property",
    "month": "May",
    "title": "Prepare the property before the storm",
    "intro": "Maintenance planning begins with knowing who owns, operates and must maintain each asset. A nearby pond or landscape strip is not automatically the HOA’s responsibility.",
    "points": [
      "Create an asset-and-responsibility map using deeds, easements, permits, contracts and master-association documents. Separate owner, neighborhood HOA, master association and government obligations.",
      "Inspect drainage structures, trees, irrigation, entry lighting and other relevant assets through qualified people. Keep maintenance and incident records; do not alter permitted stormwater systems casually.",
      "Build a storm plan covering contacts, contractor availability, records backup, insurance notice and immediate hazards. Emergency authority under §720.316 has conditions and is not a substitute for ordinary procedures at all times. Keep an insurance calendar. Review D&O as well as property, general liability and fidelity/crime coverage with qualified advisers. Section 720.3033(5) separately requires insurance or a fidelity bond for persons controlling funds, subject to its annual member-waiver procedure; this is not the same as D&O.",
      "For wildlife concerns, distinguish state species-specific feeding restrictions from the association’s own proposed or adopted rules. Use current FWC guidance and qualified assistance."
    ],
    "scenario": "Water is backing up near a pond before a storm. A resident asks the board to lower the pond by cutting a new drainage channel.",
    "prompts": [
      "Who is the permitted operator and responsible maintenance party?",
      "What makes an improvised modification risky?"
    ],
    "resolution": "Identify the responsible operator and use qualified emergency and permitting guidance. Do not assume that ownership nearby gives authority to modify a permitted drainage system. Document the report, response and escalation.",
    "sources": [
      {
        "title": "§720.316 — emergency powers",
        "url": "https://www.flsenate.gov/Laws/Statutes/2026/720.316"
      },
      {
        "title": "SWFWMD: stormwater systems",
        "url": "https://www.swfwmd.state.fl.us/sites/default/files/store_products/stormwater_systems_1.pdf"
      },
      {
        "title": "FWC: feeding wildlife",
        "url": "https://myfwc.com/conservation/you-conserve/wildlife/feeding/"
      },
      {
        "title": "§720.3033(5) — funds-handler insurance or fidelity bond",
        "url": "https://www.flsenate.gov/Laws/Statutes/2026/720.3033"
      }
    ],
    "quiz": [
      {
        "question": "How should maintenance responsibility be established?",
        "options": [
          "By proximity alone",
          "By the applicable documents, permits and records",
          "By a neighborhood poll"
        ],
        "correct": 1,
        "feedback": "Use the actual allocation of responsibility."
      },
      {
        "question": "Are emergency powers unlimited year-round?",
        "options": [
          "Yes",
          "No",
          "Only for landscaping"
        ],
        "correct": 1,
        "feedback": "Emergency authority has statutory conditions and limits."
      }
    ]
  },
  {
    "id": "fair-housing",
    "month": "June",
    "title": "Recognize a request for accommodation",
    "intro": "An exception request connected with a disability deserves the appropriate fair-housing review. Consistency includes recognizing when the law requires an individualized accommodation.",
    "points": [
      "A request does not have to use a particular legal phrase before it deserves attention. Identify whether the resident is seeking an accommodation or modification connected with a disability.",
      "Assistance animals are not treated simply as ordinary pets under the applicable fair-housing framework. Do not apply a pet rule mechanically without reviewing the request.",
      "Protect sensitive information, request only appropriate documentation, and involve qualified counsel where the standard or facts are uncertain. Avoid public discussion of private medical details.",
      "Finish the education year by reconciling each director’s approved-course certificates separately from this pilot’s practice records. Pilot quiz completion is not proof of approved CE compliance."
    ],
    "scenario": "A resident asks for an exception to an animal restriction because of a disability. A director wants the resident to explain the diagnosis during an open board meeting.",
    "prompts": [
      "What information is appropriate to handle privately?",
      "How should the request be evaluated and recorded?"
    ],
    "resolution": "Use an appropriate confidential accommodation process and qualified guidance. A public explanation of medical details is not a sound default. Preserve the decision record without unnecessary disclosure.",
    "sources": [
      {
        "title": "HUD: assistance animals",
        "url": "https://www.hud.gov/helping-americans/assistance-animals"
      },
      {
        "title": "§720.3033 — education documentation",
        "url": "https://www.flsenate.gov/Laws/Statutes/2026/720.3033"
      }
    ],
    "quiz": [
      {
        "question": "Should an assistance-animal request always be treated as an ordinary pet request?",
        "options": [
          "Yes",
          "No",
          "Only if the resident owns the home"
        ],
        "correct": 1,
        "feedback": "Evaluate the fair-housing accommodation framework."
      },
      {
        "question": "Does finishing this pilot establish approved CE compliance?",
        "options": [
          "No",
          "Yes",
          "Only when all twelve are checked"
        ],
        "correct": 0,
        "feedback": "No CE credit or certificates are awarded by this unapproved pilot."
      }
    ]
  },
  {
    "id": "records",
    "month": "July",
    "title": "Keep records people can find",
    "intro": "A new education year is a useful moment to organize the records that explain what the association decided, spent and approved. Transparency works best as a routine, with privacy built into the process.",
    "points": [
      "Build an index of governing documents, adopted rules, meeting minutes, contracts, financial records and architectural decisions. Record the current version and the person responsible for maintaining each category.",
      "Owner access is governed by Chapter 720, including deadlines and exclusions. A document being convenient to post does not mean every part of it is appropriate for a public website. Separate public learning resources from private association files.",
      "Use a consistent intake process for records requests: record receipt, identify responsive records, check exclusions, document the response and retain evidence of delivery. Do not use scattered personal inboxes as the only archive.",
      "For board education, track initial certification separately from annual continuing education. A course being useful is different from its being approved for credit."
    ],
    "scenario": "An owner requests the landscaping contract, the latest financial report and every email concerning a neighbor’s disability accommodation. The manager proposes placing the whole folder on a publicly accessible drive.",
    "prompts": [
      "Which records need review before disclosure?",
      "How would you document the response without exposing the neighbor’s medical information?"
    ],
    "resolution": "Identify and provide the accessible association records through the applicable access process. Review protected and excluded information before sharing; disability-related material does not become public merely because it is in an association folder. Keep a request log and consult the relevant statutory exclusions.",
    "sources": [
      {
        "title": "§720.303 — official records and access",
        "url": "https://www.flsenate.gov/Laws/Statutes/2026/720.303"
      },
      {
        "title": "§720.3033 — education certificates",
        "url": "https://www.flsenate.gov/Laws/Statutes/2026/720.3033"
      }
    ],
    "quiz": [
      {
        "question": "Where should personal medical information used in a resident request go?",
        "options": [
          "In the public course library",
          "In appropriately restricted association records",
          "In every meeting announcement"
        ],
        "correct": 1,
        "feedback": "Separate restricted resident information from public educational material and check the statutory access exclusions."
      },
      {
        "question": "Does a helpful draft lesson automatically earn annual CE credit?",
        "options": [
          "Yes, if discussed by a quorum",
          "Yes, if the board votes for it",
          "No; approval and completion requirements still apply"
        ],
        "correct": 2,
        "feedback": "The pilot is practice material. No approved education credit is awarded."
      }
    ],
    "noticeReference": {
      "title": "Florida director education requirements · optional reference",
      "paragraphs": [
        "Initial education: §720.3033(1)(a) requires a certificate from a department-approved education provider within 90 days after election or appointment, repeated at least every four years. The named curriculum topics are financial literacy and transparency, recordkeeping, levying fines, and notice and meeting requirements.",
        "Annual continuing education is separate: at least four hours for directors of HOAs with fewer than 2,500 parcels, including this fictional 54-home association; at least eight hours for 2,500 or more parcels. Useful training material is not automatically an approved course.",
        "This pilot proposes both hybrid annual CE and a separate self-paced BMC track for initial and four-year certification. Both pilot paths are available to explore; neither is approved. Annual CE is additional to certification, including certification years; one completion is not automatically credit for both. The monthly guides revisit foundational subjects and additional practical topics, including insurance. D&O is not a separately named mandatory topic in §720.3033(1)(a)4. Course, provider, delivery method and credit documentation still require the applicable approval; this site awards no CE credit."
      ]
    }
  },
  {
    "id": "meetings",
    "month": "August",
    "title": "Run a clear, open meeting",
    "intro": "For a Chapter 720 HOA, a clear meeting begins with the right notice, specific agenda items, owner participation and a recorded decision. Check the current statute and your own governing documents together.",
    "points": [
      "Identify the meeting and business. A board quorum conducting HOA business triggers the meeting rules; covered spending committees and architectural decision bodies follow them too. Notice must specifically identify agenda items. A combined notice and agenda can do this; the general provision does not prescribe a separate attached sheet.",
      "Choose a lawful notice route. Ordinarily post conspicuously in the community at least 48 hours ahead; the individual mail/delivery alternative is at least 7 days. Electronic notice needs written consent and the applicable timing. Website/app posting supplements required notice; larger-HOA alternatives have specific conditions.",
      "Check for a longer deadline. Special assessments and amendments to parcel-use rules need at least 14-day individual notice plus property posting or permitted cable broadcast. State that assessments will be considered and describe their nature. A qualifying 20% owner petition also invokes 14-day notice. Genuine emergencies have separate rules.",
      "Read and align the documents. Declaration, articles, bylaws and amendments can add lawful requirements. A 48-hour sign does not erase a compatible bylaw requirement for individual delivery. Use the proper amendment process to simplify outdated provisions. State the action and record the vote; apply any bylaw-adopted small-board procedure subject to law."
    ],
    "scenario": "A 54-lot HOA posts a specific board agenda 48 hours ahead and sends an email. Its bylaws also require individual mailed or hand-delivered notice, and some owners never consented to electronic notice. The board wants to add a special assessment and a parcel-use rule that night.",
    "prompts": [
      "What statutory and governing-document notice requirements must the board check?",
      "How should it schedule the new items and simplify future notice requirements?"
    ],
    "resolution": "Check the actual bylaw delivery and timing requirements alongside conspicuous posting and written electronic-notice consent. Schedule the special assessment and parcel-use amendment with the required 14-day individual notice and posting or permitted broadcast, plus lawful additional document requirements. Review and formally amend outdated provisions rather than simply stopping compliance. This hypothetical does not decide whether a particular past meeting was valid.",
    "sources": [
      {
        "title": "§720.303(2) — HOA board and covered committee notice",
        "url": "https://www.flsenate.gov/Laws/Statutes/2026/720.303"
      },
      {
        "title": "§720.305(1) — compliance with statute and documents",
        "url": "https://www.flsenate.gov/Laws/Statutes/2026/720.305"
      },
      {
        "title": "§720.306(1) — governing-document amendments",
        "url": "https://www.flsenate.gov/Laws/Statutes/2026/720.306"
      }
    ],
    "quiz": [
      {
        "question": "Does a 48-hour sign automatically replace a compatible bylaw requirement for individual notice?",
        "options": [
          "Yes",
          "No",
          "Only for a small board"
        ],
        "correct": 1,
        "feedback": "Read and comply with the statute and lawful additional governing-document requirements; amend outdated provisions through the proper process."
      },
      {
        "question": "What is generally needed for a special-assessment or parcel-use-rule amendment meeting?",
        "options": [
          "Only a notice that says other business",
          "At least 14-day individual notice plus the required posting or permitted broadcast",
          "Only a same-day email"
        ],
        "correct": 1,
        "feedback": "§720.303(2)(c)2 imposes additional notice and content requirements; electronic delivery also requires the applicable consent."
      }
    ],
    "noticeReference": {
      "title": "Notice methods and HOA/condominium distinctions · optional reference",
      "paragraphs": [
        "Chapter 720 is the HOA track here, including single-family HOA communities. Chapter 718 governs condominiums. A building’s detached or attached appearance does not determine its legal regime; check the recorded structure.",
        "Ordinary HOA board notice: conspicuous community posting at least 48 hours before, except emergency. If community posting is not used, mail or deliver to every member at least 7 days before. Notices must specifically identify agenda items. §720.303(2)(c)1.",
        "Electronic transmission is permitted to members who provided the address/number for that purpose and consented in writing. Keep consent and delivery evidence; having an email address is not itself written consent. Do not assume a 48-hour email replaces the seven-day individual-notice alternative or a mandatory posting step.",
        "For communities with more than 100 members, bylaws may provide reasonable alternatives such as publication, a meeting schedule, or the prescribed closed-circuit cable method. Substitute broadcast has frequency and readable-display conditions. This size-dependent route does not apply to a 54-lot HOA merely because it has a website.",
        "A website/app notice-and-agenda rule can supplement the authorized methods, with same-period posting and email hyperlinks under the statutory conditions. The separate mandatory website/app regime for associations with 100 or more parcels adds online posting obligations; it is not the same threshold as more than 100 members. Website, Facebook or group-chat posting alone is not a universal replacement.",
        "Special assessments and amendments to parcel-use rules require at least 14-day individual written notice to members and parcel owners plus conspicuous property posting or the permitted cable broadcast. Disclose the nature of assessments and specific business. A qualifying 20% owner petition also triggers the 14-day procedure. §720.303(2)(c)2, (2)(d).",
        "Emergency exceptions are not a shortcut for planned business. Separate §720.316 emergency powers depend on a qualifying declared emergency, statutory conditions and reasonably necessary protective purposes. Covered spending and architectural decision committees follow the board-notice requirements. §720.303(2)(c)3.",
        "Condominiums also generally require 48 continuous hours of conspicuous board posting with specific agenda items, but §718.112(2)(c) has different rules: a designated posting location, a 14-day individual-notice fallback when no condominium property is available for posting, and different cable, emergency, video-meeting and assessment provisions. Do not import condominium alternatives into this HOA course.",
        "Documents may impose additional lawful notice, delivery, agenda and approval requirements. Mandatory statute controls a direct conflict, while an expressly authorized document alternative must meet the statute’s conditions. Obtain qualified review and use the required amendment vote and recording process. Stricter does not automatically mean unlawful or obsolete."
      ]
    }
  },
  {
    "id": "elections",
    "month": "September",
    "title": "Prepare for the annual meeting",
    "intro": "Work backward from the actual election and annual meeting dates. Election preparation often starts before the meeting month, so this lesson may need to move earlier.",
    "points": [
      "Distinguish owner decisions from board decisions. Membership meetings, elections, board vacancies and amendments have different procedures. Do not import condominium rules automatically into a Chapter 720 HOA.",
      "Read the election and notice provisions in the current bylaws alongside §720.306. Identify nomination procedures, notice recipients, voting eligibility, proxies and any applicable electronic-voting requirements.",
      "Calculate quorum and vote thresholds using the correct denominator: all voting interests, those present or votes cast may produce different results. Round up where needed to meet an actual threshold.",
      "Keep notice evidence, voting materials and the result in the appropriate records. An election schedule should include time to resolve missing records or inconsistent governing language."
    ],
    "scenario": "A board copies last year’s election notice. This year, the nomination procedure in the notice appears to conflict with the bylaws, and nobody checked the owner roster.",
    "prompts": [
      "Which sources and records should be reconciled before sending notices?",
      "Who should resolve an apparent conflict in the election procedure?"
    ],
    "resolution": "Verify the current governing provisions and statutory requirements, then correct the roster and procedure before issuing notices. Escalate a genuine legal conflict for qualified review. Repetition of last year’s practice is not proof of compliance.",
    "sources": [
      {
        "title": "§720.306 — membership meetings and elections",
        "url": "https://www.flsenate.gov/Laws/Statutes/2026/720.306"
      },
      {
        "title": "§720.317 — electronic voting",
        "url": "https://www.flsenate.gov/Laws/Statutes/2026/720.317"
      }
    ],
    "quiz": [
      {
        "question": "Can an HOA simply copy condominium election procedures?",
        "options": [
          "Always",
          "Only when the relevant law and documents support that procedure",
          "Only when the meeting is online"
        ],
        "correct": 1,
        "feedback": "Identify the rules applicable to the specific HOA and its documents."
      },
      {
        "question": "When should election procedure conflicts be checked?",
        "options": [
          "After voting",
          "Only if an owner complains",
          "Before notices and voting materials are finalized"
        ],
        "correct": 2,
        "feedback": "Resolve the procedure before the process relies on it."
      }
    ]
  },
  {
    "id": "directors",
    "month": "October",
    "title": "Know who does what",
    "intro": "Use the organizational meeting to connect each office with actual duties. A director’s experience helps, but the board acts through its legal authority and governing documents.",
    "points": [
      "Separate the board’s collective authority from each officer’s assigned role. A president is not automatically authorized to make every association decision alone. Document delegated authority and its limits.",
      "Identify the secretary’s records and notice duties, the treasurer’s financial oversight, and the president’s and vice president’s responsibilities in the bylaws. A management contract should clarify who performs each task. Review directors and officers (D&O) insurance with the broker: who is insured, defense costs, limits, exclusions and claim-notice deadlines. General liability and fidelity/crime coverage serve different purposes; do not assume one substitutes for another.",
      "Directors should act in good faith, with appropriate care, and in the association’s interests. Disclose potential conflicts and follow the specific statutory process for interested transactions.",
      "Confirm committee appointments and education records during the organizational cycle. Initial certification has its own deadline; a new director should not wait until next October for required training."
    ],
    "scenario": "After the annual meeting, a new president tells the manager that all contracts under $5,000 can be signed without a board vote. Nobody can locate a resolution authorizing that limit.",
    "prompts": [
      "Where would you look for spending and signing authority?",
      "How should a lawful delegation be defined and recorded?"
    ],
    "resolution": "Review the bylaws, statutes, adopted budget, contracts and any valid delegation. Do not infer a new spending power from the office title alone. If appropriate, the board can consider a specific delegation through the proper decision process.",
    "sources": [
      {
        "title": "§617.0830 — director standards",
        "url": "https://www.flsenate.gov/Laws/Statutes/2026/617.0830"
      },
      {
        "title": "§720.3033 — directors, conflicts and education",
        "url": "https://www.flsenate.gov/Laws/Statutes/2026/720.3033"
      }
    ],
    "quiz": [
      {
        "question": "Does becoming president automatically grant unlimited individual spending authority?",
        "options": [
          "Yes",
          "No",
          "Only for maintenance"
        ],
        "correct": 1,
        "feedback": "Authority comes from the applicable law, documents and valid board decisions."
      },
      {
        "question": "Should a new director wait for next October’s lesson to meet the initial certification deadline?",
        "options": [
          "No",
          "Yes",
          "Only if unpaid"
        ],
        "correct": 0,
        "feedback": "The statutory initial-certification deadline remains separate from this seasonal pilot."
      }
    ]
  },
  {
    "id": "budget",
    "month": "November",
    "title": "Read the budget before the vote",
    "intro": "Move this lesson before the association’s actual budget process. The goal is to understand the relationship between the plan, cash, obligations and financial reports.",
    "points": [
      "An annual budget is a plan; bank cash is a balance at a point in time. Neither alone explains every unpaid obligation or future replacement need. Read them together with financial statements and commitments.",
      "Compare actual spending with the approved budget and ask about significant differences. Check unpaid invoices, receivables, reserve balances and contract renewals before assuming a surplus is available.",
      "The required annual financial-report level depends on statutory criteria, including revenues. Do not assume every small association is exempt or that a report of receipts and expenditures is always sufficient.",
      "Assign responsibility for the budget, report preparation, owner delivery and review. Use a calendar and obtain appropriate accounting help for unfamiliar items."
    ],
    "scenario": "The bank balance is $25,000 and a director proposes a $10,000 landscaping upgrade. The balance includes reserve money and invoices that have not yet cleared.",
    "prompts": [
      "What additional figures are needed before deciding affordability?",
      "What would you ask the manager or accountant to explain?"
    ],
    "resolution": "Identify restricted reserves, outstanding obligations, expected receipts and authorized spending before deciding. A cash balance does not establish that money is unrestricted or that the proposed project has been authorized.",
    "sources": [
      {
        "title": "§720.303(6)–(8) — budgets, reporting and funds",
        "url": "https://www.flsenate.gov/Laws/Statutes/2026/720.303"
      }
    ],
    "quiz": [
      {
        "question": "Does the checking-account balance by itself establish spendable surplus?",
        "options": [
          "No",
          "Yes",
          "Yes, if statements are current"
        ],
        "correct": 0,
        "feedback": "Check obligations, restrictions, reserves and the budget as well."
      },
      {
        "question": "What helps determine the annual reporting level?",
        "options": [
          "The president’s preference alone",
          "The applicable statutory criteria, including revenues",
          "Whether the meeting lasted an hour"
        ],
        "correct": 1,
        "feedback": "Apply the reporting criteria to the actual association."
      }
    ]
  },
  {
    "id": "reserves",
    "month": "December",
    "title": "Plan ahead and collect fairly",
    "intro": "Routine upkeep, long-term replacements and overdue assessments require different decisions. Keep their purposes and procedures separate.",
    "points": [
      "Identify how the association’s reserve accounts were established and the requirements governing them. Labeling money “reserves” does not answer every legal question about its use or funding.",
      "Connect replacement planning with actual assets, remaining life, expected costs and existing balances. Do not import condominium structural-reserve requirements into a single-family HOA by assumption.",
      "Use the applicable assessment and collection process. Required notices and legal steps matter; a friendly reminder and a statutory demand are not interchangeable.",
      "Have qualified counsel handle uncertain lien, foreclosure or disputed-account questions. Track communications and provide accurate account information."
    ],
    "scenario": "A board wants to use the pond-repair reserve to pay ordinary mowing bills because several owners are late with assessments.",
    "prompts": [
      "What governs use of that reserve?",
      "What collection steps are appropriate before assuming the cash shortage can be solved by moving funds?"
    ],
    "resolution": "Review the reserve’s legal status and applicable authorization requirements before using it for another purpose. Separately follow the assessment and collection process. Convenience does not determine whether a transfer or collection action is permitted.",
    "sources": [
      {
        "title": "§720.303(6) — reserve provisions",
        "url": "https://www.flsenate.gov/Laws/Statutes/2026/720.303"
      },
      {
        "title": "§720.3085 — assessments and collections",
        "url": "https://www.flsenate.gov/Laws/Statutes/2026/720.3085"
      }
    ],
    "quiz": [
      {
        "question": "Are all reserve accounts automatically governed by condominium SIRS rules?",
        "options": [
          "Yes",
          "No",
          "Only in December"
        ],
        "correct": 1,
        "feedback": "Determine the law and reserve status applicable to the HOA."
      },
      {
        "question": "Can an informal reminder replace every required collection notice?",
        "options": [
          "Yes",
          "Only by unanimous agreement",
          "No"
        ],
        "correct": 2,
        "feedback": "Follow the applicable statutory and governing-document process."
      }
    ]
  }
];
const calendarMonths=['January','February','March','April','May','June','July','August','September','October','November','December'];
lessons.sort((a,b)=>calendarMonths.indexOf(a.month)-calendarMonths.indexOf(b.month));
export const sources = Array.from(new Map(lessons.flatMap(l=>l.sources).map(s=>[s.url,s])).values());

export const lessonVersion=(lesson:Lesson)=>lesson.version??VERSION;
export const archivedLessonTitles:Record<string,string>={improvements:"Approve design without guessing boundaries (previous guide)"};
