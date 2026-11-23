'use client';

import { useState, type FormEvent } from 'react';
import { limits, type ExactChange, type ReviewComment, type ReviewSuggestion } from '../../../lib/contribution-policy';

function useModeration() {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  async function send(id: string, revision: number, action: string, fields: Record<string, string> = {}) {
    setSending(true);
    setError('');
    try {
      const response = await fetch('/api/contributions/moderate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, id, revision, action }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? 'Unable to update the record.');
      window.location.reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to update the record.');
      setSending(false);
    }
  }
  return { send, sending, error };
}

export function SuggestionActions({ suggestion }: { suggestion: Pick<ReviewSuggestion, 'id' | 'revision' | 'status' | 'visible' | 'approvedAt' | 'approvedText' | 'edition' | 'publicNote' | 'proposal'> }) {
  const { send, sending, error } = useModeration();
  const { id, revision, status, visible, approvedAt, approvedText } = suggestion;
  const exact: ExactChange | null = approvedText ? JSON.parse(approvedText) : null;
  const [transition, setTransition] = useState('');

  function actionForm(event: FormEvent<HTMLFormElement>, action: string) {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    void send(id, revision, action, fields);
  }

  return <section className="panel contribution-form">
    <h2>Moderate this suggestion</h2>
    <p>Before making it public, check the submitted text, attribution and source for private data, spam or harmful material. Contact email is always private.</p>
    <button className="primary" type="button" disabled={sending} onClick={() => void send(id, revision, visible ? 'hide' : 'show')}>
      {visible ? 'Hide public suggestion' : 'Make suggestion public'}
    </button>

    {status !== 'published' && <form className="contribution-form" onSubmit={event => actionForm(event, transition)}>
      <label>Review status
        <select required value={transition} disabled={sending} onChange={event => setTransition(event.target.value)}>
          <option value="">Choose an action</option>
          <option value="review">{approvedAt ? 'Reopen review and clear approval' : 'Move to Under review'}</option>
          {status === 'review' && <option value="await">Move to Awaiting maintainer approval</option>}
          <option value="decline">Decline suggestion</option>
        </select>
      </label>
      <label>Public explanation {transition !== 'decline' && <small>Optional</small>}
        <textarea name="note" rows={3} minLength={transition === 'decline' ? 10 : undefined}
          required={transition === 'decline'} maxLength={limits.note} defaultValue={suggestion.publicNote} />
      </label>
      <button className="primary" disabled={sending || !transition}>Update review status</button>
    </form>}

    {status === 'awaiting' && !approvedAt && <form className="contribution-form" onSubmit={event => actionForm(event, 'approve')}>
      <h3>Record the maintainer’s approval of exact wording</h3>
      <p>Paste an exact existing excerpt to remove or replace. Enter the exact approved text to add. Leave the existing field blank for additions and the new field blank for removals. Approval records the decision. Course editing and deployment are separate owner-authorized steps.</p>
      <label>Exact existing wording
        <textarea name="before" rows={3} maxLength={limits.proposal} />
      </label>
      <label>Exact new wording
        <textarea name="after" rows={5} maxLength={limits.proposal} defaultValue={suggestion.proposal} />
      </label>
      <button className="primary" disabled={sending}>Record exact-text approval</button>
    </form>}

    {exact && <div>
      <h3>Approved change</h3>
      <p>Approval recorded on {approvedAt} for <code>{suggestion.edition}</code>.</p>
      {exact.before && <><h4>Remove or replace</h4><p className="contribution-text">{exact.before}</p></>}
      {exact.after && <><h4>Add</h4><p className="contribution-text">{exact.after}</p></>}
    </div>}

    {status === 'awaiting' && approvedAt && <form className="contribution-form" onSubmit={event => actionForm(event, 'publish')}>
      <h3>Record a completed publication</h3>
      <p>After separately deploying the approved change, confirm it is live. The site verifies the exact wording and a new edition before recording it.</p>
      <label>Public change summary
        <textarea name="note" minLength={10} maxLength={limits.note} rows={3} required />
      </label>
      <button className="primary" disabled={sending}>Record live publication</button>
    </form>}

    {error && <p role="alert">{error}</p>}
  </section>;
}

export function CommentActions({ comment }: { comment: ReviewComment }) {
  const { send, sending, error } = useModeration();
  return <>
    <p>Moderation <strong>{comment.moderation}</strong></p>
    <button className="text-button" disabled={sending || comment.moderation === 'visible'}
      onClick={() => void send(comment.id, comment.revision, 'show-comment')}>Make comment public</button>
    <button className="text-button" disabled={sending || comment.moderation === 'hidden'}
      onClick={() => void send(comment.id, comment.revision, 'hide-comment')}>Hide comment</button>
    {error && <p role="alert">{error}</p>}
  </>;
}

export function NotificationAction({ suggestionId }: { suggestionId?: string }) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  async function send() {
    setSending(true);
    setError('');
    try {
      const response = await fetch('/api/contributions/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(suggestionId ? { action: 'retry-email', id: suggestionId } : { action: 'test-email' }),
      });
      const data = await response.json() as { status?: string; testId?: string; error?: string; message?: string };
      if (data.testId) {
        window.location.assign('/suggestions/review?id=' + encodeURIComponent(data.testId));
      } else if (response.ok || data.status === 'failed') {
        window.location.reload();
      } else {
        throw new Error(data.error ?? data.message ?? 'The email request could not be completed.');
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The email request could not be completed.');
      setSending(false);
    }
  }
  return <>
    <button className="primary" type="button" disabled={sending} onClick={() => void send()}>
      {sending ? 'Working…' : suggestionId ? 'Retry owner notification' : 'Queue synthetic test email'}
    </button>
    {error && <p role="alert">{error}</p>}
  </>;
}

export function PullReconciliation({ suggestionId }: { suggestionId: string }) {
  const [resolution, setResolution] = useState('accepted');
  const { send, sending, error } = useModeration();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    void send(suggestionId, 0, 'reconcile-pull-mail', {
      resolution, messageId: String(fields.get('messageId') ?? ''),
    });
  }
  return <form className="contribution-form" onSubmit={submit}>
    <p>Check provider activity for the original attempt. An uncertain notification cannot be sent again from this queue.</p>
    <label>Reconciliation
      <select value={resolution} onChange={event => setResolution(event.target.value)}>
        <option value="accepted">Record verified provider acceptance</option>
        <option value="closed">Close with acceptance unconfirmed</option>
      </select>
    </label>
    {resolution === 'accepted' && <label>Provider message ID <input name="messageId" maxLength={256} required /></label>}
    <button className="primary" disabled={sending}>Save reconciliation</button>
    {error && <p role="alert">{error}</p>}
  </form>;
}
