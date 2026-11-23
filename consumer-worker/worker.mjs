const SITE = 'https://training.example';
const QUEUE = SITE + '/api/contributions/mail-queue';
const UUID = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const MAILBOX = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

function textField(value, max) {
  return typeof value === 'string' && value.length > 0 && value.length <= max &&
    !/[\u0000-\u001f\u007f]/u.test(value);
}

function valid(row) {
  return row && typeof row.id === 'string' && UUID.test(row.id) &&
    typeof row.lease === 'string' && UUID.test(row.lease) &&
    textField(row.lessonId, 80) && textField(row.lessonTitle, 200) &&
    textField(row.edition, 200) && textField(row.createdAt, 40) &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(row.createdAt) &&
    Number.isFinite(Date.parse(row.createdAt)) &&
    row.reviewUrl === SITE + '/suggestions/review?id=' + row.id;
}

export async function poll(env, io = {fetch, deadline: AbortSignal.timeout, send: timedSend}) {
  if (env.SUGGESTION_MAIL_TRANSPORT !== 'cloudflare_pull' ||
      !/^[a-f0-9]{64}$/.test(env.SUGGESTION_QUEUE_TOKEN ?? '') ||
      !MAILBOX.test(env.TEST_RECIPIENT ?? '') || !MAILBOX.test(env.NOTIFY_FROM ?? '') ||
      typeof env.NOTIFY_TEST_EMAIL?.send !== 'function') return;

  async function post(body) {
    try {
      const response = await io.fetch(QUEUE, {
        method: 'POST', redirect: 'error', signal: io.deadline(7000),
        headers: {Authorization: 'Bearer ' + env.SUGGESTION_QUEUE_TOKEN, 'Content-Type': 'application/json'},
        body: JSON.stringify(body),
      });
      return response.ok ? await response.json() : null;
    } catch { return null; }
  }

  const batch = await post({action: 'claim', limit: 5});
  if (!Array.isArray(batch?.items) || batch.items.length > 5) return;
  for (const row of batch.items) {
    if (!valid(row)) continue;
    const ref = {id: row.id, lease: row.lease};
    const start = await post({action: 'begin', ...ref});
    if (start?.send !== true) continue;

    let messageId;
    try {
      const result = await io.send(env.NOTIFY_TEST_EMAIL, {
        from: env.NOTIFY_FROM, to: env.TEST_RECIPIENT,
        subject: 'Free Florida HOA Training suggestion',
        text: [row.lessonTitle + ' (' + row.lessonId + ')', 'Edition ' + row.edition,
          'Suggestion ' + row.id, 'Submitted ' + row.createdAt, row.reviewUrl].join('\n'),
      });
      messageId = result?.messageId;
      if (!textField(messageId, 256)) throw new Error('Missing provider receipt');
    } catch {
      await post({action: 'uncertain', ...ref});
      continue;
    }

    for (let attempt = 0; attempt < 3; attempt++) {
      const receipt = await post({action: 'ack', ...ref, messageId});
      if (receipt?.accepted === true) break;
    }
  }
}

async function timedSend(binding, message) {
  let timer;
  try {
    return await Promise.race([
      binding.send(message),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Send outcome unknown')), 12000); }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

export default {
  fetch(request) {
    if (request.method === 'GET' && new URL(request.url).pathname === '/') {
      return new Response('ok', {headers: {'Cache-Control': 'no-store'}});
    }
    return new Response(null, {status: 404});
  },
  scheduled(_event, env, ctx) {
    ctx.waitUntil(poll(env));
  },
};
