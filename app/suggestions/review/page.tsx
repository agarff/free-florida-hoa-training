import type { Metadata } from 'next';
import { ContributionDate, ContributionLayout, PageLinks, SuggestionStatus } from '../../contribution-ui';
import { getChatGPTUser } from '../../chatgpt-auth';
import { isInstructorUser } from '../../../lib/instructor';
import { isContributionId, pageIndex } from '../../../lib/contribution-input';
import { contributionLessons, statuses, type ContributionStatus, type ReviewSuggestion } from '../../../lib/contribution-policy';
import { listReview, reviewThread } from '../../../lib/contribution-store';
import { CommentActions, SuggestionActions } from './actions';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Owner contribution review', robots: { index: false, follow: false } };

type Query = { id?: string; page?: string; auditPage?: string; status?: string };
const root = '/suggestions/review';
const lessonTitle = (id: string) => contributionLessons.find(lesson => lesson.id === id)?.title ?? id;

async function Thread({ id, page, auditPage }: { id: string; page: number; auditPage: number }) {
  const { suggestion, comments, audit } = await reviewThread(id, page, auditPage);
  return <>
    <a href={root}>Back to review queue</a>
    <h1>{lessonTitle(suggestion.lessonId)}</h1>
    <p>{suggestion.track === 'guide' ? 'Monthly guide' : 'Self-paced module'} · Edition <code>{suggestion.edition}</code></p>
    <section className="panel">
      <SuggestionStatus suggestion={suggestion as ReviewSuggestion} />
      <p>{suggestion.visible ? 'Publicly visible' : 'Private'} · Submitted <ContributionDate date={suggestion.createdAt} /></p>
      <p>Display name <strong>{suggestion.displayName || 'Anonymous'}</strong></p>
      <h2>Issue</h2><p className="contribution-text">{suggestion.issue}</p>
      <h2>Proposed wording</h2><p className="contribution-text">{suggestion.proposal}</p>
      <p><a href={suggestion.source} target="_blank" rel="nofollow ugc noopener noreferrer">Read supporting source</a></p>
      {suggestion.publishedAt && <p>Published in <code>{suggestion.publishedEdition}</code> · <ContributionDate date={suggestion.publishedAt} /></p>}
    </section>
    <section className="panel private-contact">
      <h2>Private contact</h2>
      <p>Owner-only information. Keep it out of all public fields.</p>
      <p>{suggestion.contact || 'No contact email supplied.'}</p>
    </section>
    <SuggestionActions suggestion={{
      id: suggestion.id, revision: suggestion.revision, status: suggestion.status as ContributionStatus,
      visible: suggestion.visible, approvedAt: suggestion.approvedAt, approvedText: suggestion.approvedText,
      edition: suggestion.edition, publicNote: suggestion.publicNote, proposal: suggestion.proposal,
    }} />
    <section>
      <h2>Discussion moderation</h2>
      {comments.items.length ? <ul className="contribution-list">{comments.items.map(comment => <li className="panel" key={comment.id}>
        <p><strong>{comment.displayName || 'Anonymous'}</strong> · <ContributionDate date={comment.createdAt} /></p>
        <p className="contribution-text">{comment.body}</p>
        <CommentActions comment={comment} />
      </li>)}</ul> : <p>No comments on this page.</p>}
      <PageLinks page={page} more={comments.more} url={p => root + '?id=' + id + '&page=' + p + '&auditPage=' + auditPage} label="Comment moderation pages" />
    </section>
    <section>
      <h2>Private audit history</h2>
      {audit.items.length ? <ul className="contribution-list">{audit.items.map(event => <li className="panel" key={event.id}>
        <p><strong>{event.action}</strong> · <time dateTime={event.createdAt}>{event.createdAt}</time></p>
        <pre>{JSON.stringify(JSON.parse(event.details), null, 2)}</pre>
      </li>)}</ul> : <p>No moderation actions on this page.</p>}
      <PageLinks page={auditPage} more={audit.more} url={p => root + '?id=' + id + '&page=' + page + '&auditPage=' + p} label="Audit pages" />
    </section>
  </>;
}

export default async function ReviewPage({ searchParams }: { searchParams: Promise<Query> }) {
  const user = await getChatGPTUser();
  if (!isInstructorUser(user)) return <ContributionLayout>
    <h1>Owner access required</h1>
    {user ? <p>This account does not have access to the review queue.</p> :
      <p><a href={'/login?returnTo=' + encodeURIComponent(root)}>Sign in to the owner account</a></p>}
  </ContributionLayout>;

  const query = await searchParams;
  const page = pageIndex(query.page ?? null);
  if (query.id !== undefined) {
    if (!isContributionId(query.id)) return <ContributionLayout><h1>Suggestion unavailable</h1><a href={root}>Back to review queue</a></ContributionLayout>;
    try {
      const thread = await Thread({ id: query.id, page, auditPage: pageIndex(query.auditPage ?? null) });
      return <ContributionLayout>{thread}</ContributionLayout>;
    } catch {
      return <ContributionLayout><h1>Suggestion unavailable</h1><a href={root}>Back to review queue</a></ContributionLayout>;
    }
  }

  const filter = query.status && (query.status === 'comments' || Object.hasOwn(statuses, query.status)) ? query.status : null;
  let results: Awaited<ReturnType<typeof listReview>> | undefined;
  try { results = await listReview(page, filter); } catch { /* Report an unavailable queue, never an empty one. */ }
  return <ContributionLayout>
    <h1>Contribution review queue</h1>
    <p>Review new and pending suggestions, then open a suggestion to moderate its discussion or record an approval.</p>
    <form className="contribution-fields" action={root}>
      <label>Filter by status
        <select name="status" defaultValue={filter ?? ''}>
          <option value="">All suggestions</option><option value="comments">Pending comments</option>
          {Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <button className="primary">Filter</button>
    </form>
    {!results ? <p role="status">The review queue is temporarily unavailable.</p> :
      results.items.length ? <ul className="contribution-list">{results.items.map(item => <li key={item.id} className="panel">
        <h2><a href={root + '?id=' + item.id}>{lessonTitle(item.lessonId)}</a></h2>
        <p><strong>{item.status === 'awaiting' && item.approvedAt ? 'Exact wording approved · Awaiting publication' : statuses[item.status as ContributionStatus]}</strong> · {item.visible ? 'Public' : 'Private'} · <ContributionDate date={item.createdAt} /></p>
        <p className="contribution-text">{item.issue}</p>
        {item.pendingComments > 0 && <p>Pending comments: {item.pendingComments}</p>}
      </li>)}</ul> : <p>No suggestions match this view.</p>}
    {results && <PageLinks page={page} more={results.more} url={p => root + '?page=' + p + (filter ? '&status=' + filter : '')} />}
  </ContributionLayout>;
}
