import type { Metadata } from 'next';
import { ContributionDate, ContributionLayout, PageLinks, SuggestionStatus } from '../contribution-ui';
import SubmissionForm from './submission-form';
import { ContributionError, isContributionId, pageIndex } from '../../lib/contribution-input';
import { contributionLessons, contributionTarget, type PublicSuggestion, type PublicComment, type Track } from '../../lib/contribution-policy';
import { listPublicChanges, listSuggestions, publicThread } from '../../lib/contribution-store';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Course suggestions | Free Florida HOA Training' };

type Query = { lesson?: string; track?: string; edition?: string; id?: string; page?: string; view?: string };
const lessonTitle = (id: string) => contributionLessons.find(lesson => lesson.id === id)?.title ?? 'Course lesson';

function PublicThread({ suggestion, comments, page, more }: { suggestion: PublicSuggestion; comments: PublicComment[]; page: number; more: boolean }) {
  return <>
    <a className="text-button" href="/suggestions">All suggestions</a>
    <h1>{lessonTitle(suggestion.lessonId)}</h1>
    <p className="fine">{suggestion.track === 'guide' ? 'Monthly guide' : 'Self-paced module'} · Edition <code>{suggestion.edition}</code></p>
    <section className="panel">
      <SuggestionStatus suggestion={suggestion} />
      <p>Submitted by {suggestion.displayName || 'Anonymous'} on <ContributionDate date={suggestion.createdAt} /></p>
      <h2>Issue</h2><p className="contribution-text">{suggestion.issue}</p>
      <h2>Proposed wording</h2><p className="contribution-text">{suggestion.proposal}</p>
      <p><a href={suggestion.source} target="_blank" rel="nofollow ugc noopener noreferrer">Read supporting source</a></p>
      {suggestion.publishedAt && <p>Published in <code>{suggestion.publishedEdition}</code> · Recorded <ContributionDate date={suggestion.publishedAt} /></p>}
    </section>
    <section aria-label="Public discussion">
      <h2>Discussion</h2>
      {comments.length ? <ul className="contribution-list">
        {comments.map(comment => <li key={comment.id} className="panel">
          <p><strong>{comment.displayName || 'Anonymous'}</strong> · <ContributionDate date={comment.createdAt} /></p>
          <p className="contribution-text">{comment.body}</p>
        </li>)}
      </ul> : <p>No moderated comments on this page.</p>}
      <PageLinks page={page} more={more} url={p => '/suggestions?id=' + suggestion.id + '&page=' + p} label="Discussion pages" />
    </section>
    <SubmissionForm suggestionId={suggestion.id} />
  </>;
}

export default async function SuggestionsPage({ searchParams }: { searchParams: Promise<Query> }) {
  const query = await searchParams;
  const page = pageIndex(query.page ?? null);
  if (query.id !== undefined) {
    if (isContributionId(query.id)) {
      try {
        const { suggestion, comments } = await publicThread(query.id, page);
        return <ContributionLayout><PublicThread suggestion={suggestion as PublicSuggestion} comments={comments.items} page={page} more={comments.more} /></ContributionLayout>;
      } catch (error) {
        if (!(error instanceof ContributionError) || error.status !== 404) {
          return <ContributionLayout><h1>Discussion temporarily unavailable</h1><p>Please try again later.</p></ContributionLayout>;
        }
      }
    }
    return <ContributionLayout><h1>Suggestion unavailable</h1><a href="/suggestions">Back to suggestions</a></ContributionLayout>;
  }

  const log = query.view === 'log';
  const linked = typeof query.lesson === 'string' && (query.track === 'guide' || query.track === 'self-paced') && typeof query.edition === 'string';
  const isCurrent = linked && contributionTarget(query.lesson, query.track) === query.edition;
  const target = isCurrent ? { lessonId: query.lesson!, track: query.track as Track, edition: query.edition! } : undefined;
  const unavailable = <p role="status">The public list is temporarily unavailable. Please try again later.</p>;
  let entries = unavailable;
  try {
    if (log) {
      const { items, more } = await listPublicChanges(page);
      entries = <>
        {items.length === 0 ? <p>No published suggestion changes appear on this page.</p> :
          <ul className="contribution-list">{items.map(item => <li key={item.id} className="panel">
            <h2>{item.discussionVisible ? <a href={'/suggestions?id=' + item.id}>{lessonTitle(item.lessonId)}</a> : lessonTitle(item.lessonId)}</h2>
            <p className="contribution-text">{item.publicNote}</p>
            <p>Published in <code>{item.publishedEdition}</code>{item.publishedAt && <> · Recorded <ContributionDate date={item.publishedAt} /></>}</p>
            <p>Based on edition <code>{item.edition}</code></p>
          </li>)}</ul>}
        <PageLinks page={page} more={more} url={p => '/suggestions?view=log&page=' + p} />
      </>;
    } else {
      const { items, more } = await listSuggestions(page);
      entries = <>
        {items.length === 0 ? <p>No moderated suggestions appear on this page.</p> :
          <ul className="contribution-list">{items.map(item => <li key={item.id} className="panel">
            <h2><a href={'/suggestions?id=' + item.id}>{lessonTitle(item.lessonId)}</a></h2>
            <SuggestionStatus suggestion={item as PublicSuggestion} />
            <p className="contribution-text">{item.issue}</p>
            <p className="fine">Edition <code>{item.edition}</code> · <ContributionDate date={item.createdAt} /></p>
          </li>)}</ul>}
        <PageLinks page={page} more={more} url={p => '/suggestions?page=' + p} />
      </>;
    }
  } catch { /* Leave the form available with an accurate list status. */ }

  return <ContributionLayout>
    <h1>{log ? 'Course change log' : 'Course suggestions'}</h1>
    <p>Read moderated suggestions and discussions, or propose a change to an existing lesson. the maintainer approves exact course changes before publication.</p>
    <nav className="contribution-pages" aria-label="Suggestions navigation">
      <a href="/suggestions" aria-current={!log ? 'page' : undefined}>Suggestions</a>
      <a href="/suggestions?view=log" aria-current={log ? 'page' : undefined}>Change log</a>
      <a href="/suggestions#suggest">Suggest a correction or addition</a>
    </nav>
    {query.lesson && !isCurrent && <p role="status" className="panel">That link refers to an earlier or unavailable edition. Choose the current lesson and track in the form before submitting.</p>}
    {entries}
    {!log && <section id="suggest"><SubmissionForm target={target} /></section>}
  </ContributionLayout>;
}
