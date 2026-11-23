import { env } from 'cloudflare:workers';
import { timingSafeEqual } from 'node:crypto';
import { ContributionError } from './contribution-input';
import { contributionLessons } from './contribution-policy';

const SITE_ORIGIN = 'https://training.example';
const leaseMs = 180_000;
const sendWindowMs = 60_000;
const tokenPattern = /^[a-f0-9]{64}$/;
export const pullMode = () => env.SUGGESTION_MAIL_TRANSPORT === 'cloudflare_pull';
export const pullQueueEnabled = () => pullMode() && tokenPattern.test(env.SUGGESTION_QUEUE_TOKEN ?? '');

export function authorizedPull(request: Request) {
  const supplied = request.headers.get('authorization')?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
  const configured = env.SUGGESTION_QUEUE_TOKEN;
  if (!pullQueueEnabled() || !supplied || !configured) return false;
  const encoder = new TextEncoder();
  if (!timingSafeEqual(encoder.encode(supplied), encoder.encode(configured))) return false;
  const url = new URL(request.url);
  return url.origin === SITE_ORIGIN && url.pathname === '/api/contributions/mail-queue' && !url.search;
}

export async function claimMail(limit: number) {
  const now = Date.now();
  const lease = crypto.randomUUID();
  const db = env.DB!;
  const [, , batch] = await db.batch([
    db.prepare(`UPDATE course_suggestion_pull_outbox SET status = 'uncertain'
      WHERE status = 'send_started' AND lease_until <= ?`).bind(now),
    db.prepare(`UPDATE course_suggestion_pull_outbox SET status = 'claimed', lease = ?, lease_until = ?
      WHERE suggestion_id IN (
        SELECT suggestion_id FROM course_suggestion_pull_outbox
        WHERE status IN ('pending', 'claimed') AND lease_until <= ?
        ORDER BY lease_until, suggestion_id LIMIT ?
      )`).bind(lease, now + leaseMs, now, limit),
    db.prepare(`SELECT s.id, s.lesson_id, s.edition, s.created_at
      FROM course_suggestion_pull_outbox q JOIN course_suggestions s ON s.id = q.suggestion_id
      WHERE q.status = 'claimed' AND q.lease = ?`).bind(lease),
  ]);
  return batch.results.map(raw => {
    const row = raw as { id: string; lesson_id: string; edition: string; created_at: string };
    return {
      id: row.id, lease, lessonId: row.lesson_id,
      lessonTitle: contributionLessons.find(item => item.id === row.lesson_id)?.title ?? row.lesson_id,
      edition: row.edition, createdAt: row.created_at,
      reviewUrl: SITE_ORIGIN + '/suggestions/review?id=' + encodeURIComponent(row.id),
    };
  });
}

export async function updateClaim(action: 'begin' | 'ack' | 'fail' | 'uncertain', id: string, lease: string, receipt?: string) {
  const db = env.DB!;
  const now = Date.now();
  switch (action) {
    case 'begin': {
      const result = await db.prepare(`UPDATE course_suggestion_pull_outbox
        SET status = 'send_started', attempts = attempts + 1, lease_until = ?
        WHERE suggestion_id = ? AND lease = ? AND status = 'claimed' AND lease_until > ?`)
        .bind(now + sendWindowMs, id, lease, now).run();
      return { send: result.meta.changes === 1 };
    }
    case 'ack': {
      const [result, read] = await db.batch([
        db.prepare(`UPDATE course_suggestion_pull_outbox SET status = 'accepted', provider_id = ?, accepted_at = ?
          WHERE suggestion_id = ? AND lease = ? AND status IN ('send_started', 'uncertain')`)
          .bind(receipt, now, id, lease),
        db.prepare(`SELECT 1 AS ok FROM course_suggestion_pull_outbox WHERE suggestion_id = ? AND lease = ?
          AND status = 'accepted' AND provider_id = ?`).bind(id, lease, receipt),
      ]);
      return { accepted: result.meta.changes === 1 || read.results.length === 1 };
    }
    case 'fail': {
      const result = await db.prepare(`UPDATE course_suggestion_pull_outbox
        SET status = 'pending', lease = NULL, lease_until = ?
        WHERE suggestion_id = ? AND lease = ? AND status = 'claimed'`).bind(now + leaseMs, id, lease).run();
      return { released: result.meta.changes === 1 };
    }
    case 'uncertain': {
      const result = await db.prepare(`UPDATE course_suggestion_pull_outbox SET status = 'uncertain'
        WHERE suggestion_id = ? AND lease = ? AND status IN ('send_started', 'uncertain')`).bind(id, lease).run();
      return { needsReview: result.meta.changes === 1 };
    }
  }
}

export function validReceipt(value: unknown): value is string {
  return typeof value === 'string' && /^[\x21-\x7e]{1,256}$/.test(value);
}

export async function pullMailStatus(id: string) {
  const row = await env.DB!.prepare(`SELECT status, attempts, provider_id, accepted_at, lease_until
    FROM course_suggestion_pull_outbox WHERE suggestion_id = ?`).bind(id)
    .first<{ status: string; attempts: number; provider_id: string | null; accepted_at: number | null; lease_until: number }>();
  if (!row) return null;
  const expired = row.lease_until <= Date.now();
  const status = row.status === 'send_started' && expired ? 'uncertain'
    : row.status === 'claimed' && expired ? 'pending' : row.status;
  return { status, attempts: row.attempts, providerId: row.provider_id,
    acceptedAt: row.accepted_at === null ? null : new Date(row.accepted_at).toISOString() };
}

export async function reconcilePullMail(id: string, owner: string, receipt?: string) {
  const now = Date.now();
  const result = await env.DB!.prepare(`UPDATE course_suggestion_pull_outbox
    SET status = ?, provider_id = ?, accepted_at = ?, reviewed_at = ?, reviewed_by = ?
    WHERE suggestion_id = ? AND (status = 'uncertain' OR (status = 'send_started' AND lease_until <= ?))`)
    .bind(receipt ? 'accepted' : 'closed', receipt ?? null, receipt ? now : null, now, owner, id, now).run();
  if (result.meta.changes !== 1) throw new ContributionError(409, 'This notification is not awaiting reconciliation.');
}
