import { contributionFailure, ContributionError, isContributionId, jsonInput, reply } from '../../../../lib/contribution-input';
import { authorizedPull, claimMail, updateClaim, validReceipt } from '../../../../lib/suggestion-pull-queue';

export const dynamic = 'force-dynamic';

export function GET() {
  return reply({ error: 'Method not allowed.' }, 405, { Allow: 'POST' });
}

export async function POST(request: Request) {
  if (!authorizedPull(request)) return reply({ error: 'Queue unavailable.' }, 403);
  try {
    const input = await jsonInput(request, { authenticatedService: true, maxBytes: 4096 });
    const { action, id, lease, limit, messageId } = input;
    const exact = (...fields: string[]) => Object.keys(input).length === fields.length &&
      fields.every(field => Object.hasOwn(input, field));
    if (action === 'claim' && exact('action', 'limit') && typeof limit === 'number' &&
        Number.isInteger(limit) && limit >= 1 && limit <= 5) return reply({ items: await claimMail(limit) });
    if (isContributionId(id) && isContributionId(lease)) {
      if (action === 'ack' && exact('action', 'id', 'lease', 'messageId') && validReceipt(messageId)) {
        return reply(await updateClaim(action, id, lease, messageId));
      }
      if ((action === 'begin' || action === 'fail' || action === 'uncertain') && exact('action', 'id', 'lease')) {
        return reply(await updateClaim(action, id, lease));
      }
    }
    throw new ContributionError(400, 'Invalid queue action.');
  } catch (error) {
    return contributionFailure(error);
  }
}
