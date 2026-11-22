import { env } from 'cloudflare:workers';
import { and, desc, eq, sql } from 'drizzle-orm';
import { getDb } from '../db';
import { contributionAudit, contributionComments, contributions } from '../db/schema';
import { ContributionError } from './contribution-input';
import { contributionPageSize } from './contribution-policy';

const publicColumns = {
  id: contributions.id, lessonId: contributions.lessonId, edition: contributions.edition, track: contributions.track,
  issue: contributions.issue, proposal: contributions.proposal, source: contributions.source, displayName: contributions.displayName,
  status: contributions.status, publicNote: contributions.publicNote, createdAt: contributions.createdAt,
  approvedAt: contributions.approvedAt, publishedEdition: contributions.publishedEdition, publishedAt: contributions.publishedAt,
};
const commentColumns = {
  id: contributionComments.id, body: contributionComments.body,
  displayName: contributionComments.displayName, createdAt: contributionComments.createdAt,
};

function paginate<T>(rows: T[]) {
  return { items: rows.slice(0, contributionPageSize), more: rows.length > contributionPageSize };
}
const offset = (page: number) => (page - 1) * contributionPageSize;

export async function listSuggestions(page: number) {
  return paginate(await getDb().select(publicColumns).from(contributions)
    .where(eq(contributions.visible, 1))
    .orderBy(desc(contributions.createdAt), desc(contributions.id))
    .limit(contributionPageSize + 1).offset(offset(page)));
}

export async function listPublicChanges(page: number) {
  // A finished change stays in the log even if its original discussion is later hidden.
  return paginate(await getDb().select({
    id: contributions.id, lessonId: contributions.lessonId, track: contributions.track,
    edition: contributions.edition, publishedEdition: contributions.publishedEdition,
    publishedAt: contributions.publishedAt, publicNote: contributions.publicNote,
    discussionVisible: contributions.visible,
  }).from(contributions).where(eq(contributions.status, 'published'))
    .orderBy(desc(contributions.publishedAt), desc(contributions.id))
    .limit(contributionPageSize + 1).offset(offset(page)));
}

export async function publicThread(id: string, page: number) {
  const db = getDb();
  const [suggestion, comments] = await db.batch([
    db.select(publicColumns).from(contributions).where(and(eq(contributions.id, id), eq(contributions.visible, 1))),
    db.select(commentColumns).from(contributionComments)
      .innerJoin(contributions, eq(contributionComments.suggestionId, contributions.id))
      .where(and(eq(contributions.id, id), eq(contributions.visible, 1), eq(contributionComments.moderation, 'visible')))
      .orderBy(desc(contributionComments.createdAt), desc(contributionComments.id))
      .limit(contributionPageSize + 1).offset(offset(page)),
  ]);
  if (!suggestion[0]) throw new ContributionError(404, 'This suggestion is unavailable.');
  return { suggestion: suggestion[0], comments: paginate(comments) };
}

export async function listReview(page: number, filter: string | null) {
  const pendingComments = sql<number>`(SELECT count(*) FROM course_suggestion_comments c
    WHERE c.suggestion_id = course_suggestions.id AND c.moderation = 'pending')`;
  return paginate(await getDb().select({
    id: contributions.id, lessonId: contributions.lessonId, issue: contributions.issue, status: contributions.status, pendingComments,
    visible: contributions.visible, approvedAt: contributions.approvedAt, createdAt: contributions.createdAt,
  }).from(contributions)
    .where(filter === 'comments' ? sql`${pendingComments} > 0` : filter ? eq(contributions.status, filter) : undefined)
    .orderBy(desc(contributions.createdAt), desc(contributions.id))
    .limit(contributionPageSize + 1).offset(offset(page)));
}

export async function reviewThread(id: string, page: number, auditPage: number) {
  const db = getDb();
  const [suggestion, comments, audit] = await db.batch([
    db.select().from(contributions).where(eq(contributions.id, id)),
    db.select({ ...commentColumns, moderation: contributionComments.moderation, revision: contributionComments.revision })
      .from(contributionComments).where(eq(contributionComments.suggestionId, id))
      .orderBy(desc(contributionComments.createdAt), desc(contributionComments.id))
      .limit(contributionPageSize + 1).offset(offset(page)),
    db.select({ id: contributionAudit.id, action: contributionAudit.action, details: contributionAudit.details, createdAt: contributionAudit.createdAt })
      .from(contributionAudit).where(eq(contributionAudit.suggestionId, id))
      .orderBy(desc(contributionAudit.createdAt), desc(contributionAudit.id))
      .limit(contributionPageSize + 1).offset(offset(auditPage)),
  ]);
  if (!suggestion[0]) throw new ContributionError(404, 'This suggestion is unavailable.');
  return { suggestion: suggestion[0], comments: paginate(comments), audit: paginate(audit) };
}

export async function rateLimit(request: Request) {
  const nowBucket = Math.floor(Date.now() / 900_000);
  // Cloudflare supplies this header at the edge. A missing address uses one shared bucket.
  const address = request.headers.get('cf-connecting-ip') || 'unknown';
  const prefix = address.includes(':') ? address.split(':').slice(0, 4).join(':') : address;
  const input = new TextEncoder().encode([env.AUTH_SECRET ?? '', nowBucket, prefix].join('|'));
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', input)), b => b.toString(16).padStart(2, '0')).join('');
  const db = env.DB!;
  const [result] = await db.batch([
    db.prepare(`
      INSERT INTO course_contribution_limits (bucket, client_key, hits)
      SELECT ?, ?, 1
      WHERE (SELECT COALESCE(SUM(hits), 0) FROM course_contribution_limits WHERE bucket = ?) < 120
      ON CONFLICT(bucket, client_key) DO UPDATE SET hits = hits + 1 WHERE hits < 5
    `).bind(nowBucket, hash, nowBucket),
    db.prepare('DELETE FROM course_contribution_limits WHERE bucket < ?').bind(nowBucket - 4),
  ]);
  if (result.meta.changes !== 1) throw new ContributionError(429, 'Too many submissions. Please try again in 15 minutes.');
}

export async function insertComment(id: string, parent: string, body: string, name: string, now: string) {
  const result = await env.DB!.prepare(`
    INSERT INTO course_suggestion_comments (id, suggestion_id, body, display_name, created_at)
    SELECT ?, id, ?, ?, ? FROM course_suggestions WHERE id = ? AND visible = 1
  `).bind(id, body, name, now, parent).run();
  if (result.meta.changes !== 1) throw new ContributionError(404, 'This discussion is unavailable.');
}
