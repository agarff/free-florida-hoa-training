import { getChatGPTUser } from '../../../chatgpt-auth';
import { isInstructorUser } from '../../../../lib/instructor';
import { contributionFailure, ContributionError, isContributionId, jsonInput, pageIndex, reply } from '../../../../lib/contribution-input';
import { statuses } from '../../../../lib/contribution-policy';
import { listReview, reviewThread } from '../../../../lib/contribution-store';
import { moderate } from '../../../../lib/contribution-moderation';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    if (!isInstructorUser(await getChatGPTUser())) throw new ContributionError(403, 'Owner access required.');
    const query = new URL(request.url).searchParams;
    const id = query.get('id');
    const page = pageIndex(query.get('page'));
    if (id !== null) {
      if (!isContributionId(id)) throw new ContributionError(404, 'The suggestion could not be found.');
      return reply(await reviewThread(id, page, pageIndex(query.get('auditPage'))));
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
    await moderate(await jsonInput(request), user.userId);
    return reply({ ok: true });
  } catch (error) {
    return contributionFailure(error);
  }
}
