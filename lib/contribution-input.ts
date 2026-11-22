import { sameOrigin } from './instructor';
import { limits } from './contribution-policy';

const maxRequestBytes = 16_384;
const email = /^[^\s@<>]+@[^\s@<>.]+(?:\.[^\s@<>.]+)+$/u;
const emailInText = /[^\s@<>]+@[^\s@<>]+\.[a-z]{2,}/iu;

export class ContributionError extends Error {
  constructor(readonly status: number, message: string) { super(message); }
}

export function reply(data: unknown, status = 200, extra?: HeadersInit) {
  const headers = new Headers(extra);
  headers.set('Cache-Control', 'private, no-store');
  headers.set('X-Content-Type-Options', 'nosniff');
  return Response.json(data, { status, headers });
}

export function contributionFailure(error: unknown) {
  if (error instanceof ContributionError) {
    return reply({ error: error.message }, error.status, error.status === 429 ? { 'Retry-After': '900' } : undefined);
  }
  console.error('Contribution operation failed');
  return reply({ error: 'Contributions are temporarily unavailable. Please try again.' }, 503);
}

export async function jsonInput(request: Request): Promise<Record<string, unknown>> {
  if (!sameOrigin(request) || request.headers.get('sec-fetch-site') === 'cross-site') {
    throw new ContributionError(403, 'Submit this request from the training site.');
  }
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    throw new ContributionError(415, 'Submit using the site form.');
  }
  if (Number(request.headers.get('content-length')) > maxRequestBytes) {
    throw new ContributionError(413, 'This submission is too long.');
  }
  const reader = request.body?.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let body = '';
  let bytes = 0;
  try {
    while (reader) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxRequestBytes) {
        await reader.cancel();
        throw new ContributionError(413, 'This submission is too long.');
      }
      body += decoder.decode(value, { stream: true });
    }
    const parsed: unknown = JSON.parse(body + decoder.decode());
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
  } catch (error) {
    if (error instanceof ContributionError) throw error;
  }
  throw new ContributionError(400, 'The form could not be read.');
}

export function field(value: unknown, label: string, max: number, min = 0) {
  if (value == null && min === 0) return '';
  if (typeof value !== 'string') throw new ContributionError(400, 'Check the ' + label + ' field.');
  const text = value.replace(/\r\n?/g, '\n').trim();
  if (text.length < min || text.length > max || /[\u0000-\u0008\u000b-\u001f\u007f\u202a-\u202e\u2066-\u2069]/u.test(text)) {
    throw new ContributionError(400, label + ' must contain ' + min + '–' + max + ' characters of ordinary text.');
  }
  return text;
}

export function publicText(value: unknown, label: string, max: number, min = 0) {
  const text = field(value, label, max, min);
  if (emailInText.test(text)) throw new ContributionError(400, 'Keep email addresses out of fields that may become public.');
  if ((text.match(/https?:\/\//gi) ?? []).length > 3) throw new ContributionError(400, 'Use at most three links in a text field.');
  return text;
}

export function contactEmail(value: unknown) {
  const text = field(value, 'Private contact email', limits.contact);
  if (text && !email.test(text)) throw new ContributionError(400, 'Enter a valid private email or leave it blank.');
  return text;
}

export function supportingSource(value: unknown) {
  const text = publicText(value, 'Supporting source URL', limits.source, 8);
  try {
    const url = new URL(text);
    if (url.protocol === 'https:' && !url.username && !url.password && url.hostname.includes('.') &&
        !/^(?:\d+\.){3}\d+$/.test(url.hostname) && !/\.(?:local|internal|localhost)$/i.test(url.hostname) &&
        !emailInText.test(decodeURIComponent(url.href)) &&
        ![...url.searchParams.keys()].some(key => /token|secret|password|signature|credential|^key$/i.test(key))) return url.href;
  } catch { /* Report the invalid URL below. */ }
  throw new ContributionError(400, 'Use a public HTTPS source link without credentials or private information.');
}

export function isContributionId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(value);
}

export function pageIndex(value: string | null) {
  return value && /^\d{1,5}$/.test(value) ? Math.max(1, Number(value)) : 1;
}
