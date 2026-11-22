import SiteBrand from './site-brand';
import { statuses, type PublicSuggestion } from '../lib/contribution-policy';

export function ContributionLayout({ children }: { children: React.ReactNode }) {
  return <>
    <div className="pilot beta-warning" role="note">
      <strong>NOT CURRENTLY APPROVED — BETA TESTING ONLY</strong>
      <span className="pilot-detail">No certification or CE credit awarded.</span>
    </div>
    <header>
      <SiteBrand />
      <nav aria-label="Main navigation">
        <a className="nav-link" href="/">Monthly guides</a>
        <a className="nav-link" href="/self-paced">Self-paced course</a>
        <a className="nav-link" href="/suggestions">Suggestions</a>
        <a className="nav-link" href="/contribute">Copy and contribute</a>
      </nav>
    </header>
    <main className="contribution-main">{children}</main>
    <footer><a href="/privacy">Privacy and pilot records</a><a href="/suggestions/review">Owner review</a></footer>
  </>;
}

const defaultExplanation = {
  received: 'Submitted and awaiting review of the proposed change.',
  review: 'The owner is reviewing the proposal and its supporting source.',
  awaiting: 'The proposed change is waiting for the maintainer to approve the exact wording.',
  published: 'The approved change is in the course edition listed here.',
  declined: 'The proposal was closed without a course change.',
};

export function SuggestionStatus({ suggestion }: { suggestion: Pick<PublicSuggestion, 'status' | 'publicNote' | 'approvedAt'> }) {
  return <>
    <p><strong>{suggestion.status === 'awaiting' && suggestion.approvedAt
      ? 'Exact wording approved by the maintainer · Awaiting publication'
      : statuses[suggestion.status]}</strong></p>
    <p className="contribution-text">{suggestion.publicNote ||
      (suggestion.status === 'awaiting' && suggestion.approvedAt
        ? 'Publication will be recorded after the approved wording appears in a new lesson edition.'
        : defaultExplanation[suggestion.status])}</p>
  </>;
}

export function PageLinks({ page, more, url, label = 'Results pages' }: { page: number; more: boolean; url: (page: number) => string; label?: string }) {
  if (page === 1 && !more) return null;
  return <nav className="contribution-pages" aria-label={label}>
    {page > 1 && <a href={url(page - 1)}>Previous</a>}
    <span>Page {page}</span>
    {more && <a href={url(page + 1)}>Next</a>}
  </nav>;
}

export function ContributionDate({ date }: { date: string }) {
  return <time dateTime={date}>{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'America/New_York' }).format(new Date(date))}</time>;
}
