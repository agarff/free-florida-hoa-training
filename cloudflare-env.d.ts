declare namespace Cloudflare {
  interface Env {
    INSTRUCTOR_EMAIL?: string;
    SITE_ORIGIN?: string;
    MAINTAINER_CONTACT_URL?: string;
    SUGGESTION_MAIL_ENABLED?: string;
    SUGGESTION_MAIL_TO?: string;
    SUGGESTION_MAIL_FROM?: string;
    SUGGESTION_MAIL_ORIGIN?: string;
    SUGGESTION_RESEND_API_KEY?: string;
    PUBLIC_SOURCE_REPOSITORY_URL?: string;
    AUTH_SECRET?: string;
    AUTH_GOOGLE_ID?: string;
    AUTH_GOOGLE_SECRET?: string;
    AUTH_APPLE_ID?: string;
    AUTH_APPLE_TEAM_ID?: string;
    AUTH_APPLE_KEY_ID?: string;
    AUTH_APPLE_PRIVATE_KEY?: string;
    DB?: D1Database;
    BUCKET?: R2Bucket;
  }
}
