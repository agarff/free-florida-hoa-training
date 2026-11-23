'use client';

import { useRef, useState, type FormEvent } from 'react';
import { contributionLessons, limits, type Track } from '../../lib/contribution-policy';

type Target = { lessonId: string; track: Track; edition: string };
type Props = { suggestionId: string; target?: never } | { suggestionId?: never; target?: Target };

export default function SubmissionForm({ suggestionId, target }: Props) {
  const [lessonId, setLessonId] = useState(target?.lessonId ?? '');
  const [track, setTrack] = useState<Track>(target?.track ?? 'guide');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string }>();
  const lesson = contributionLessons.find(l => l.id === lessonId);
  const edition = target?.edition ?? lesson?.[track];
  const comment = Boolean(suggestionId);
  const lastSubmission = useRef<{ body: string; key: string } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    const payload = comment
      ? { ...fields, kind: 'comment', suggestionId }
      : { ...fields, kind: 'suggestion', lessonId, track, edition, permission: fields.permission === 'on' };
    const body = JSON.stringify(payload);
    if (!comment && lastSubmission.current?.body !== body) {
      lastSubmission.current = { body, key: crypto.randomUUID() };
    }
    setSending(true);
    setResult(undefined);
    try {
      const response = await fetch('/api/contributions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: comment ? body : JSON.stringify({ ...payload, submissionKey: lastSubmission.current?.key }),
      });
      const data = await response.json() as { error?: string; message?: string };
      if (!response.ok) throw new Error(data.error ?? 'Unable to submit.');
      lastSubmission.current = null;
      form.reset();
      setResult({ success: true, message: data.message ?? 'Received and pending moderation.' });
    } catch (error) {
      setResult({ success: false, message: error instanceof Error ? error.message : 'Unable to submit.' });
    } finally {
      setSending(false);
    }
  }

  return <form className="contribution-form panel" onSubmit={submit}>
    <h2>{comment ? 'Add a discussion comment' : 'Suggest a correction or addition'}</h2>
    <p>Anyone may submit. New submissions are private until moderated. Text marked public may appear on this site after review. Keep resident names, addresses, case details, account information and other private data out of these fields.</p>
    {!comment && <>
      {target ? <p><strong>{lesson?.title}</strong> · {track === 'guide' ? 'Monthly guide' : 'Self-paced module'} · <code>{edition}</code></p> :
        <div className="contribution-fields">
          <label>Lesson
            <select value={lessonId} onChange={event => setLessonId(event.target.value)} required>
              <option value="">Choose a lesson</option>
              {contributionLessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
            </select>
          </label>
          <label>Course track
            <select value={track} onChange={event => setTrack(event.target.value as Track)}>
              <option value="guide">Monthly guide</option>
              <option value="self-paced">Self-paced module</option>
            </select>
          </label>
        </div>}
      {!target && edition && <p>Edition <code>{edition}</code></p>}
      <label>Issue <small>Public after moderation</small>
        <textarea name="issue" rows={3} minLength={10} maxLength={limits.issue} required />
      </label>
      <label>Proposed wording <small>Public after moderation</small>
        <textarea name="proposal" rows={5} minLength={5} maxLength={limits.proposal} required />
      </label>
      <label>Supporting source <small>Public HTTPS link</small>
        <input name="source" type="url" placeholder="https://" maxLength={limits.source} required />
      </label>
    </>}
    {comment && <label>Comment <small>Public after moderation</small>
      <textarea name="body" rows={4} minLength={5} maxLength={limits.body} required />
    </label>}
    <label>Display name <small>Optional and public after moderation. A pseudonym is welcome.</small>
      <input name="displayName" maxLength={limits.displayName} autoComplete="off" />
    </label>
    {!comment && <>
      <fieldset className="private-contact">
        <legend>Optional private contact</legend>
        <label>Contact email <small>Only the owner can see this. Leave it blank to submit without contact details.</small>
          <input name="contact" type="email" maxLength={limits.contact} autoComplete="email" />
        </label>
      </fieldset>
      <label className="check">
        <input type="checkbox" name="permission" required />
        <span>I can share this wording and allow its use in the course under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> if adopted.</span>
      </label>
    </>}
    <div hidden aria-hidden="true">
      <label>Leave this field blank <input name="website" tabIndex={-1} autoComplete="off" /></label>
    </div>
    <button className="primary" type="submit" disabled={sending}>{sending ? 'Sending…' : comment ? 'Submit comment' : 'Submit suggestion'}</button>
    {result && <p className="feedback" role={result.success ? 'status' : 'alert'}>{result.message}</p>}
  </form>;
}
