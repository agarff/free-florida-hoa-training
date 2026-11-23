const resendEndpoint = 'https://api.resend.com/emails';
const timeoutMs = 15_000;

export type TransportFailure = 'timeout' | 'aborted' | 'dns' | 'tls' | 'network' | 'invalid_receipt';
type TransportResult =
  | { status: number; elapsedMs: number; value: unknown }
  | { status: number | null; elapsedMs: number; error: TransportFailure };

export async function requestSuggestionMail(init: RequestInit): Promise<TransportResult> {
  const started = Date.now();
  const signal = AbortSignal.timeout(timeoutMs);
  let status: number | null = null;
  try {
    const response = await fetch(resendEndpoint, { ...init, redirect: 'error', signal });
    status = response.status;
    // Error bodies may echo submitted values. Do not read or log them when sending.
    if (init.method === 'POST' && !response.ok) {
      await response.body?.cancel();
      return { status, elapsedMs: Date.now() - started, value: null };
    }
    const value: unknown = await response.json();
    return { status, elapsedMs: Date.now() - started, value };
  } catch (error) {
    return { status, elapsedMs: Date.now() - started, error: classify(error, signal, status) };
  }
}

function classify(error: unknown, signal: AbortSignal, status: number | null): TransportFailure {
  const name = error instanceof Error ? error.name : '';
  if (signal.aborted || name === 'TimeoutError') return 'timeout';
  if (name === 'AbortError') return 'aborted';
  if (name === 'SyntaxError' && status !== null) return 'invalid_receipt';
  const message = error instanceof Error ? error.message : '';
  if (/dns|enotfound|eai_again|name resolution/i.test(message)) return 'dns';
  if (/\btls\b|certificate/i.test(message)) return 'tls';
  return 'network';
}
