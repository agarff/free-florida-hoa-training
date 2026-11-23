import { persistSuggestion } from '../../../lib/suggestion-mail';
import {
  contactEmail, contributionFailure, ContributionError, isContributionId, jsonInput,
  pageIndex, publicText, reply, supportingSource,
} from '../../../lib/contribution-input';
import { contributionTarget, limits } from '../../../lib/contribution-policy';
import { insertComment, listSuggestions, listPublicChanges, publicThread, rateLimit } from '../../../lib/contribution-store';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const query = new URL(request.url).searchParams;
    const thread = query.get('id');
    const page = pageIndex(query.get('page'));
    if (thread !== null) {
      if (!isContributionId(thread)) throw new ContributionError(404, 'This suggestion is unavailable.');
      return reply(await publicThread(thread, page));
    }
    return reply(query.get('view') === 'log' ? await listPublicChanges(page) : await listSuggestions(page));
  } catch (error) {
    return contributionFailure(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = await jsonInput(request);
    if (input.website != null && input.website !== '') {
      throw new ContributionError(400, 'The submission could not be accepted. Reload the form and try again.');
    }
    const displayName = publicText(input.displayName, 'Display name', limits.displayName);
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    if (input.kind === 'suggestion') {
      const { lessonId, track, edition } = input;
      const currentEdition = contributionTarget(lessonId, track);
      if (!currentEdition || currentEdition !== edition || typeof lessonId !== 'string' || typeof track !== 'string') {
        throw new ContributionError(409, 'The lesson or edition has changed. Reopen the lesson and use its suggestion link.');
      }
      if (input.permission !== true) throw new ContributionError(400, 'Confirm you can share the proposed wording.');
      const issue = publicText(input.issue, 'Issue', limits.issue, 10);
      const proposal = publicText(input.proposal, 'Proposed wording', limits.proposal, 5);
      const source = supportingSource(input.source);
      const contact = contactEmail(input.contact);
      await rateLimit(request);
      const submissionKey = input.submissionKey;
      if (submissionKey != null && !isContributionId(submissionKey)) throw new ContributionError(400, 'The submission key is invalid.');
      await persistSuggestion({ id, lessonId, track, edition: currentEdition, issue, proposal, source, displayName, contact, createdAt },
        typeof submissionKey === 'string' ? submissionKey.toLowerCase() : null);
    } else if (input.kind === 'comment' && isContributionId(input.suggestionId)) {
      const body = publicText(input.body, 'Comment', limits.body, 5);
      await rateLimit(request);
      await insertComment(id, input.suggestionId, body, displayName, createdAt);
    } else {
      throw new ContributionError(400, 'Choose a suggestion or a public discussion.');
    }
    return reply({ status: 'received', message: 'Received. Your submission is private until the owner approves it for public display.' }, 201);
  } catch (error) {
    return contributionFailure(error);
  }
}
