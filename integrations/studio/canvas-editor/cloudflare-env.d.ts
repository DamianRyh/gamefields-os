declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    /** Owner key for the Workshop panel (/workshop-admin): a Sites secret, never in code. */
    WORKSHOP_ADMIN_KEY?: string;
  }
}
