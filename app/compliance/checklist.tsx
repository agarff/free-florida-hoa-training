'use client';
import {useState} from 'react';
import {complianceItems} from '../../lib/compliance';
import {lessons} from '../../lib/course';
import {guidePath} from '../../lib/guide-routes';
const categories=['All','State law','Governing documents','Recommended practice'] as const;
export default function Checklist(){const[category,setCategory]=useState<string>('All');return <><div className="compliance-controls"><div role="group" aria-label="Filter compliance checklist">{categories.map(c=><button key={c} aria-pressed={category===c} onClick={()=>setCategory(c)}>{c}</button>)}</div><button className="text-button" onClick={()=>window.print()}>Print checklist</button></div><div className="compliance-grid">{complianceItems.filter(i=>category==='All'||i.kind===category).map(item=><article className="compliance-card" key={item.title}><span className="compliance-kind">{item.kind}</span><h2>{item.title}</h2><p>{item.action}</p><dl><dt>When</dt><dd>{item.when}</dd><dt>Suggested owner</dt><dd>{item.owner}</dd><dt>Proof to keep</dt><dd>{item.evidence}</dd></dl><div className="compliance-card-links"><a href={guidePath(lessons.find(l=>l.id===item.lesson)!)}>Open related guide</a>{item.source&&<a href={item.source.url} target="_blank" rel="noreferrer">{item.source.title}</a>}</div></article>)}</div></>}
