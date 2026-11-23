import { env, waitUntil } from 'cloudflare:workers';
import { isContributionId } from './contribution-input';
import { contributionLessons } from './contribution-policy';
import { requestSuggestionMail } from './suggestion-mail-transport';

const retryWindowMs = 23 * 60 * 60 * 1000; // Shorter than the provider's 24-hour deduplication window.
const retryDelayMs = 2 * 60 * 1000;
const address = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i;

function mailConfig() {
  const to = env.SUGGESTION_MAIL_TO?.trim().toLowerCase();
  const from = env.SUGGESTION_MAIL_FROM?.trim();
  const key = env.SUGGESTION_RESEND_API_KEY?.trim();
  const domain = env.SUGGESTION_MAIL_ORIGIN?.trim();
  if (env.SUGGESTION_MAIL_ENABLED !== 'true' || !to || !address.test(to) ||
      to !== env.INSTRUCTOR_EMAIL?.trim().toLowerCase() || !from || !address.test(from) || !key || !domain) return;
  try {
    const url = new URL(domain);
    if (url.protocol !== 'https:' || url.href !== url.origin + '/') return;
    return { to, from, key, origin: url.origin };
  } catch {
    return;
  }
}

export const suggestionMailEnabled = () => Boolean(mailConfig());

type NewSuggestion = {
  id: string; lessonId: string; track: string; edition: string; issue: string; proposal: string;
  source: string; displayName: string; contact: string; createdAt: string;
};

export async function persistSuggestion(suggestion: NewSuggestion, submissionKey: string | null, synthetic = false) {
  const { id, lessonId, track, edition, issue, proposal, source, displayName, contact, createdAt } = suggestion;
  const db = env.DB!;
  const [inserted] = await db.batch([
    db.prepare(`
      INSERT INTO course_suggestions (id, lesson_id, track, edition, issue, proposal, source, display_name, private_contact, created_at)
      SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      WHERE NOT EXISTS (SELECT 1 FROM course_suggestion_mail WHERE submission_key = ?)
    `).bind(id, lessonId, track, edition, issue, proposal, source, displayName, contact, createdAt, submissionKey),
    db.prepare(`
      INSERT INTO course_suggestion_mail (suggestion_id, submission_key, synthetic)
      SELECT id, ?, ? FROM course_suggestions WHERE id = ?
    `).bind(submissionKey, Number(synthetic), id),
  ]);
  if (inserted.meta.changes === 1 && mailConfig()) {
    const task = deliverSuggestionMail(id).catch(() => console.error('Suggestion mail could not update its delivery record.'));
    try { waitUntil(task); } catch { await task; }
  }
}

type MailRow = {
  synthetic: number; status: 'pending' | 'sending' | 'sent' | 'failed'; attempts: number;
  first_attempt_at: number | null; last_attempt_at: number | null; envelope_hash: string | null;
  accepted_at: number | null; failure: string | null; provider_id: string | null;
};

function retryBlock(row: MailRow, now: number) {
  if (row.status === 'sent') return 'The provider already accepted this notification.';
  if (row.first_attempt_at !== null && row.first_attempt_at <= now - retryWindowMs) {
    return 'The safe retry window expired. Check the provider’s activity before taking further action.';
  }
  if (row.last_attempt_at !== null && row.last_attempt_at > now - retryDelayMs) {
    return 'A delivery attempt is recent. Wait two minutes before retrying.';
  }
}

export async function suggestionMailStatus(id: string) {
  const db = env.DB!;
  const { results } = await db.prepare('SELECT * FROM course_suggestion_mail WHERE suggestion_id = ?').bind(id).all<MailRow>();
  const row = results[0];
  if (!row) return null;
  const now = Date.now();
  const interrupted = row.status === 'sending' && row.last_attempt_at !== null && row.last_attempt_at <= now - retryDelayMs;
  const blocked = retryBlock(row, now);
  return {
    status: row.status === 'sending' ? (interrupted ? 'failed' : 'pending') : row.status,
    synthetic: row.synthetic === 1,
    attempts: row.attempts,
    acceptedAt: row.accepted_at === null ? null : new Date(row.accepted_at).toISOString(),
    providerId: row.provider_id,
    failure: interrupted ? 'acceptance_unknown' : row.failure,
    retryBlocked: blocked ?? (!mailConfig() ? 'Owner notification is disabled or the mail settings are incomplete.' : null),
  };
}

export function suggestionMailFailureMessage(failure: string) {
  const descriptions: Record<string, string> = {
    provider_rejected: 'The provider rejected the request.',
    timeout: 'The connection to the mail provider timed out. Acceptance is unknown.',
    aborted: 'The request to the mail provider was interrupted. Acceptance is unknown.',
    dns: 'The runtime could not resolve the mail provider’s hostname.',
    tls: 'The runtime reported a TLS error while connecting to the mail provider.',
    network: 'The runtime could not complete the request. Acceptance is unknown.',
    invalid_receipt: 'The provider response did not include a valid acceptance reference.',
  };
  if (/^http_[45][0-9]{2}$/.test(failure)) return 'The mail endpoint returned HTTP ' + failure.slice(5) + '.';
  return descriptions[failure] ?? 'Provider acceptance is unknown.';
}

export async function queueSyntheticSuggestionMail() {
  if (!mailConfig()) return null;
  const id = crypto.randomUUID();
  const lesson = contributionLessons[0];
  await persistSuggestion({
    id, lessonId: lesson.id, track: 'guide', edition: lesson.guide,
    issue: 'SYNTHETIC TEST — owner notification check',
    proposal: 'This private test is not a proposed change.',
    source: '', displayName: '', contact: '', createdAt: new Date().toISOString(),
  }, null, true);
  return id;
}

type MailContext = MailRow & { id: string; lesson_id: string; edition: string; track: string; created_at: string };

export async function deliverSuggestionMail(id: string): Promise<{ status: 'sent' | 'failed' | 'blocked' | 'missing'; message: string }> {
  const config = mailConfig();
  if (!config) return { status: 'blocked', message: 'Owner notification is disabled or the mail settings are incomplete.' };

  const db = env.DB!;
  const { results } = await db.prepare(`
    SELECT m.*, s.id, s.lesson_id, s.edition, s.track, s.created_at
    FROM course_suggestion_mail m JOIN course_suggestions s ON s.id = m.suggestion_id
    WHERE m.suggestion_id = ?
  `).bind(id).all<MailContext>();
  const row = results[0];
  if (!row) return { status: 'missing', message: 'There is no notification for this suggestion.' };
  const now = Date.now();
  const blocked = retryBlock(row, now);
  if (blocked) return { status: 'blocked', message: blocked };

  const lesson = contributionLessons.find(item => item.id === row.lesson_id)?.title ?? row.lesson_id;
  const test = row.synthetic === 1;
  const link = new URL('/suggestions/review?id=' + encodeURIComponent(id), config.origin);
  const payload = JSON.stringify({
    from: config.from,
    to: [config.to],
    subject: (test ? '[SYNTHETIC TEST] ' : '') + 'Free Florida HOA Training suggestion',
    text: [
      test ? 'Synthetic test notification for Free Florida HOA Training.' : 'A new suggestion was received on Free Florida HOA Training.',
      'Lesson: ' + lesson + ' (' + row.lesson_id + ')',
      'Track: ' + (row.track === 'guide' ? 'Monthly guide' : 'Self-paced module'),
      'Edition: ' + row.edition,
      'Suggestion ID: ' + id,
      'Submitted (UTC): ' + row.created_at,
      'Review after signing in: ' + link.href,
    ].join('\n'),
  });
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(config.key + '\n' + payload));
  const hash = Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
  if (row.envelope_hash && row.envelope_hash !== hash) {
    return { status: 'blocked', message: 'The notification settings or message changed. Check the provider’s activity before taking further action.' };
  }

  const token = crypto.randomUUID();
  const claimed = await db.prepare(`
    UPDATE course_suggestion_mail
    SET status = 'sending', attempts = attempts + 1,
        first_attempt_at = COALESCE(first_attempt_at, ?), last_attempt_at = ?,
        claim_token = ?, envelope_hash = COALESCE(envelope_hash, ?), failure = NULL
    WHERE suggestion_id = ? AND status != 'sent'
      AND (last_attempt_at IS NULL OR last_attempt_at <= ?)
      AND (first_attempt_at IS NULL OR first_attempt_at > ?)
      AND (envelope_hash IS NULL OR envelope_hash = ?)
  `).bind(now, now, token, hash, id, now - retryDelayMs, now - retryWindowMs, hash).run();
  if (claimed.meta.changes !== 1) return { status: 'blocked', message: 'A notification attempt is already recorded. Refresh its status before retrying.' };

  const result = await requestSuggestionMail({
    method: 'POST',
    headers: { Authorization: 'Bearer ' + config.key, 'Content-Type': 'application/json', 'Idempotency-Key': 'hoa-suggestion/' + id },
    body: payload,
  });
  const receipt = 'value' in result && result.value && typeof result.value === 'object' && 'id' in result.value
    ? result.value.id : null;
  const providerId = result.status !== null && result.status >= 200 && result.status < 300 && isContributionId(receipt) ? receipt : null;
  const failure = !providerId && ('error' in result ? result.error
    : result.status >= 400 ? 'http_' + result.status : 'invalid_receipt');
  if (failure) {
    console.warn('Suggestion mail result', JSON.stringify({
      failure, status: result.status, elapsedMs: result.elapsedMs,
    }));
  }

  await db.prepare(`
    UPDATE course_suggestion_mail SET status = ?, failure = ?, provider_id = ?, accepted_at = ?, claim_token = NULL
    WHERE suggestion_id = ? AND claim_token = ?
  `).bind(providerId ? 'sent' : 'failed', failure || null, providerId, providerId ? Date.now() : null, id, token).run();

  return providerId
    ? { status: 'sent', message: 'The mail provider accepted the notification.' }
    : { status: 'failed', message: 'The mail provider did not confirm acceptance. Review the notification status before retrying.' };
}
