# Suggestion mail consumer

This Worker pulls saved suggestion metadata from one fixed training site and uses a native Cloudflare Email Service binding. Its public root reports health. The example cron is part of the template and runs only after the owner deploys this Worker. No storage binding is required.

## Owner setup

1. In the private deployment copy of `worker.mjs`, replace the fixed `SITE` placeholder `https://training.example` with the training site's exact public HTTPS origin, without a path or trailing slash. Use the same fixed origin as Sites in `lib/suggestion-pull-queue.ts`. Keep the placeholder in the public export.
2. Copy `wrangler.example.jsonc` to a private deployment configuration. Substitute the existing owner Worker name, its fixed verified sender, and its existing single-recipient binding restriction. Keep the filled file private. Include `global_fetch_strictly_public` in the actual Worker compatibility flags so a fetch to the Worker's own zone uses Cloudflare's public entry point. [Cloudflare compatibility flags](https://developers.cloudflare.com/workers/configuration/compatibility-flags/#global-fetch-strictly-public)
3. With the required approval, configure the same 32 random bytes encoded as 64 lowercase hex characters as secret `SUGGESTION_QUEUE_TOKEN` on both Workers. Set secret `TEST_RECIPIENT` only on the consumer, matching the platform binding restriction. The consumer reads the sender from `NOTIFY_FROM`. Never commit filled settings or secret values.
4. Set `SUGGESTION_MAIL_TRANSPORT=cloudflare_pull` on Sites and the consumer only when authorized to activate. Sites rejects queue requests if either the transport selection or the queue token is missing. Existing Resend records are separate and are never pulled.
5. Deploy the consumer to the owner account with the authorized binding and cron. The owner can verify the next poll and provider receipt using one controlled site submission.

## Queue requests

Use JSON POST to the fixed `/api/contributions/mail-queue` route with a bearer queue token. Claim requests contain `action: "claim"` and an integer `limit` from one to five. Each entry includes `id`, `lease`, `lessonId`, `lessonTitle`, `edition`, `createdAt`, and `reviewUrl`. Keep the lease private.

Send `{action:"begin", id, lease}` immediately before handing a message to the binding. Only a successful `send: true` response authorizes a send. A lost response removes permission to proceed. An expired claim can be reclaimed before begin. A started send with no confirmed receipt becomes uncertain and stays outside the claim pool.

Send `{action:"ack", id, lease, messageId}` after the binding returns its receipt. Retry the identical acknowledgment if the response is lost. Acknowledging the same original receipt does not send mail. The owner can reconcile an uncertain send with a verified provider message ID or close it with acceptance unconfirmed.

The worker can release a pre-send claim with `{action:"fail", id, lease}`. After begin, report an uncertain result with `{action:"uncertain", id, lease}`. The consumer never retries the native send. A process crash after sending can lose the receipt and require owner reconciliation. Provider acceptance is distinct from inbox delivery.
