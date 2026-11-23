import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { getDb } from '../db';
import { contributionComments, contributions } from '../db/schema';
import { ContributionError, isContributionId, publicText } from './contribution-input';
import { contributionTarget, includesCourseText, limits, type ExactChange, type Track } from './contribution-policy';

const conflict = (message: string) => new ContributionError(409, message);
const refresh = 'The record changed. Refresh and review it before trying again.';

export async function moderate(input: Record<string, unknown>, actor: string) {
  const { id, action, revision } = input;
  if (!isContributionId(id) || typeof revision !== 'number' || !Number.isSafeInteger(revision) || revision < 0) {
    throw new ContributionError(400, 'Select a current review record.');
  }
  const eventId = crypto.randomUUID();
  const now = new Date().toISOString();
  if (action === 'show-comment' || action === 'hide-comment') {
    await moderateComment(id, revision, action, actor, eventId, now);
    return;
  }

  const row = await getDb().select().from(contributions).where(eq(contributions.id, id)).get();
  if (!row) throw new ContributionError(404, 'The suggestion could not be found.');
  if (row.revision !== revision) throw conflict(refresh);

  const next = { ...row };
  const details: Record<string, unknown> = { priorStatus: row.status, baseEdition: row.edition };
  const { results: notification } = await env.DB!.prepare('SELECT synthetic FROM course_suggestion_mail WHERE suggestion_id = ?')
    .bind(id).all<{ synthetic: number }>();
  if (notification[0]?.synthetic === 1) throw conflict('Synthetic tests always stay private.');

  if (action === 'show' || action === 'hide') {
    next.visible = Number(action === 'show');
    details.visible = next.visible === 1;
  } else if (row.status === 'published') {
    throw conflict('The publication record is final. You can still change its public visibility.');
  } else if (action === 'approve') {
    if (row.status !== 'awaiting' || row.approvedAt) throw conflict('Move the suggestion to Awaiting maintainer approval before approving wording.');
    if (contributionTarget(row.lessonId, row.track) !== row.edition) {
      throw conflict('This suggestion targets an older edition. Ask for an updated suggestion before approving wording.');
    }
    const before = publicText(input.before, 'Exact existing wording', limits.proposal);
    const after = publicText(input.after, 'Exact new wording', limits.proposal);
    const track = row.track as Track;
    if ((!before && !after) || before === after ||
        (before && !includesCourseText(row.lessonId, track, before)) ||
        (after && includesCourseText(row.lessonId, track, after))) {
      throw conflict('Use exact existing and new excerpts. Existing wording must be present and new wording must be absent in this edition.');
    }
    const exact: ExactChange = { before, after };
    next.approvedText = JSON.stringify(exact);
    next.approvedAt = now;
    details.exact = exact;
  } else if (action === 'publish') {
    if (row.status !== 'awaiting' || !row.approvedAt || !row.approvedText) throw conflict('Record the maintainer’s exact-text approval first.');
    const liveEdition = contributionTarget(row.lessonId, row.track);
    const exact = JSON.parse(row.approvedText) as ExactChange;
    const track = row.track as Track;
    if (!liveEdition || liveEdition === row.edition ||
        (exact.before && includesCourseText(row.lessonId, track, exact.before)) ||
        (exact.after && !includesCourseText(row.lessonId, track, exact.after))) {
      throw conflict('Publish the approved wording in a new lesson edition first. The running course does not yet match that approval.');
    }
    next.publicNote = publicText(input.note, 'Public change summary', limits.note, 10);
    next.status = 'published';
    next.publishedAt = now;
    next.publishedEdition = liveEdition;
    details.publishedEdition = liveEdition;
    details.exact = exact;
    details.publicNote = next.publicNote;
  } else if (action === 'review' || action === 'await' || action === 'decline') {
    if (action === 'await' && row.status !== 'review') throw conflict('Move the suggestion to Under review before requesting approval.');
    next.status = action === 'await' ? 'awaiting' : action === 'decline' ? 'declined' : 'review';
    next.publicNote = publicText(input.note, 'Public explanation', limits.note, action === 'decline' ? 10 : 0);
    next.approvedAt = null;
    next.approvedText = null;
    details.publicNote = next.publicNote;
    details.clearedApproval = Boolean(row.approvedAt);
  } else {
    throw new ContributionError(400, 'Choose a valid moderation action.');
  }

  details.status = next.status;
  const db = env.DB!;
  const [updated] = await db.batch([
    db.prepare(`
      UPDATE course_suggestions
      SET status = ?, public_note = ?, visible = ?, approved_text = ?, approved_at = ?,
          published_edition = ?, published_at = ?, revision = revision + 1, action_id = ?
      WHERE id = ? AND revision = ?
    `).bind(next.status, next.publicNote, next.visible, next.approvedText, next.approvedAt,
      next.publishedEdition, next.publishedAt, eventId, id, revision),
    db.prepare(`
      INSERT INTO course_suggestion_audit (id, suggestion_id, actor, action, details, created_at)
      SELECT ?, id, ?, ?, ?, ? FROM course_suggestions WHERE id = ? AND action_id = ?
    `).bind(eventId, actor, action, JSON.stringify(details), now, id, eventId),
  ]);
  if (updated.meta.changes !== 1) throw conflict(refresh);
}

async function moderateComment(id: string, revision: number, action: string, actor: string, eventId: string, now: string) {
  const row = await getDb().select({ id: contributionComments.id }).from(contributionComments)
    .where(eq(contributionComments.id, id)).get();
  if (!row) throw new ContributionError(404, 'The comment could not be found.');
  const moderation = action === 'show-comment' ? 'visible' : 'hidden';
  const db = env.DB!;
  const [updated] = await db.batch([
    db.prepare(`
      UPDATE course_suggestion_comments SET moderation = ?, revision = revision + 1, action_id = ?
      WHERE id = ? AND revision = ?
    `).bind(moderation, eventId, id, revision),
    db.prepare(`
      INSERT INTO course_suggestion_audit (id, suggestion_id, actor, action, details, created_at)
      SELECT ?, suggestion_id, ?, ?, ?, ? FROM course_suggestion_comments WHERE id = ? AND action_id = ?
    `).bind(eventId, actor, action, JSON.stringify({ commentId: id, moderation }), now, id, eventId),
  ]);
  if (updated.meta.changes !== 1) throw conflict(refresh);
}
