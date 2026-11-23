import { getChatGPTUser } from '../../../chatgpt-auth';
import { isInstructorUser } from '../../../../lib/instructor';
import { contributionFailure, ContributionError, isContributionId, jsonInput, pageIndex, reply } from '../../../../lib/contribution-input';
import { statuses } from '../../../../lib/contribution-policy';
import { listReview, rateLimit, reviewThread } from '../../../../lib/contribution-store';
import { moderate } from '../../../../lib/contribution-moderation';
import { deliverSuggestionMail, queueSyntheticSuggestionMail, suggestionMailStatus } from '../../../../lib/suggestion-mail';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    if (!isInstructorUser(await getChatGPTUser())) throw new ContributionError(403, 'Owner access required.');
    const query = new URL(request.url).searchParams;
    const id = query.get('id');
    const page = pageIndex(query.get('page'));
    if (id !== null) {
      if (!isContributionId(id)) throw new ContributionError(404, 'The suggestion could not be found.');
      const thread = await reviewThread(id, page, pageIndex(query.get('auditPage')));
      return reply({ ...thread, notification: await suggestionMailStatus(id) });
    }
    const status = query.get('status');
    return reply(await listReview(page, status && (status === 'comments' || Object.hasOwn(statuses, status)) ? status : null));
  } catch (error) {
    return contributionFailure(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getChatGPTUser();
    if (!user || !isInstructorUser(user)) throw new ContributionError(403, 'Owner access required.');
    const input = await jsonInput(request);
    if (input.action === 'retry-email') {
      if (!isContributionId(input.id)) throw new ContributionError(400, 'Choose a suggestion to retry.');
      const result = await deliverSuggestionMail(input.id);
      return reply(result, { sent: 200, failed: 502, blocked: 409, missing: 404 }[result.status]);
    }
    if (input.action === 'test-email') {
      await rateLimit(request);
      const testId = await queueSyntheticSuggestionMail();
      if (!testId) throw new ContributionError(409, 'Owner notification is disabled or the mail settings are incomplete.');
      return reply({ testId }, 201);
    }
    await moderate(input, user.userId);
    return reply({ ok: true });
  } catch (error) {
    return contributionFailure(error);
  }
}
