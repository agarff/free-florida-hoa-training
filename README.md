# Free Florida HOA Training

A reusable Vinext/React and Cloudflare D1 website for an unapproved training pilot for Florida Chapter 720 HOA boards. It includes the monthly guides, self-paced modules, compliance material, and a moderated suggestion workflow. Completing the pilot earns no certification or CE credit.

## Run a local copy

1. Install Node.js 22.13 or newer and npm. Unzip this archive into a new directory.
2. Run `npm ci`.
3. Run `npm run db:migrate:local` to create a new local database from the included SQL schema migrations. The archive contains no production database or sample user records.
4. Run `npm run dev` and open the URL printed by Vite. Public lessons, suggestions and comments work without account setup. To test a submission locally, open a lesson, follow its suggestion link, and submit fictional material.
5. Run `npm run build` to compile the Worker and browser assets.

## Configure an independently hosted copy

Create your own D1 database and set its ID and name in `wrangler.jsonc`. Apply its migrations using Wrangler before deploying. Deploy the built Worker to your own Cloudflare account. Use Cloudflare’s D1 and Vite deployment documentation for the target environment.

The example site origin is `https://training.example`. Set `SITE_ORIGIN` to your own HTTPS origin in the Worker configuration. Update any canonical placeholder URLs in page metadata and public files to match before publishing.

Auth remains disabled until you configure your own provider credentials and a random `AUTH_SECRET` of at least 32 characters. Use Cloudflare secrets in production and an ignored `.dev.vars` file for local HTTPS testing. Configure Google with `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`, or Apple with `AUTH_APPLE_ID`, `AUTH_APPLE_TEAM_ID`, `AUTH_APPLE_KEY_ID`, and `AUTH_APPLE_PRIVATE_KEY`. Register your own callbacks at `/api/auth/callback/google` or `/api/auth/callback/apple`. This portable export verifies provider sessions, using verified email for sign-in. It does not accept identity from hosting headers. Auth cookies remain Secure.

Set `INSTRUCTOR_EMAIL` to the verified provider address of your own designated owner as a secret. Leave it unset until configured to keep the review queue and attendance controls closed. The attendance roster starts empty. Configure any authorized roster privately in your own deployment and exclude it from public source. Set `MAINTAINER_CONTACT_URL` to your own HTTPS private-reporting page.

To offer the copy’s source download, place an audited ZIP under `public/downloads/free-florida-hoa-training-source.zip`. Set `PUBLIC_SOURCE_REPOSITORY_URL` only after confirming the HTTPS GitHub repository is public and belongs to your project. The copied site has no connection to the original hosting, repository, learner accounts, or attendance.

See `lessons/` for readable exports, and `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, and `LICENSE-NOTICES.md` for contributions and reuse.

## Optional owner notifications

With an existing authorized Resend sender, set `SUGGESTION_RESEND_API_KEY` (sending-only secret), `SUGGESTION_MAIL_FROM` (verified sender), `SUGGESTION_MAIL_TO` (private recipient matching `INSTRUCTOR_EMAIL`), and `SUGGESTION_MAIL_ORIGIN` (this copy’s HTTPS origin). Set `SUGGESTION_MAIL_ENABLED=true` to enable notifications. Store credentials and private addresses only in local secret files or the hosting runtime secret store. The copy ships with no configured sender or recipient.

The owner review queue offers a private synthetic test and displays whether the provider accepted a notification. Confirm inbox receipt separately. A failed attempt can be retried through owner review within the provider’s deduplication window. Comments do not send notifications.

The optional Cloudflare pull transport uses a separate owner Worker and a private queue token. See [consumer-worker/README.md](consumer-worker/README.md) for the deployment template and queue contract.
