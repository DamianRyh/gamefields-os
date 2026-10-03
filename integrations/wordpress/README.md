# Gamefields PLAY on gamefields.eu

The existing WordPress homepage stays in place. The application is served directly at `https://gamefields.eu/play` without an iframe. The PHP gateway uses the existing application and Cloudflare D1 backend; Gamefields accounts work independently of hosting accounts.

## Install after the application deployment is healthy

1. Take the normal hosting backup.
2. Upload `gamefields-play.php` to `wp-content/mu-plugins/gamefields-play.php` using the hosting file manager or SFTP. Create `mu-plugins` if it does not exist. WordPress loads this integration automatically. This method does not require disabling `DISALLOW_FILE_EDIT`.
3. Exclude `/play*`, `/api/play*`, `/api/quote` and `/api/templates`, `/api/projects` from the hosting/CDN full-page cache. Exclude requests carrying `gf_play_session`. Purge old cached responses for those paths.
4. Verify `/api/play/health` returns HTTP 200 with `schemaReady: true`, then open `/play/auth` in two independent browsers. Check registration, login, logout, check-in, READY, game creation, joining, readiness, result submission and opposite-team confirmation.
5. Check that `gamefields.eu` and the site's existing `www` redirect preserve the full path. All application pages should resolve on the canonical Gamefields origin.

The integration forwards only the PLAY session cookie. WordPress login cookies, hosting identity and arbitrary destination URLs are excluded. POST requests validate the Gamefields origin before proxying. TLS verification remains enabled. Application responses use `private, no-store`.

## Rollback

Rename the integration file to `gamefields-play.php.disabled`. No WordPress content, theme or database schema is changed by the gateway.

## Current access limitation

The connected WordPress API reports `DISALLOW_FILE_EDIT`. It cannot install this file. Upload through the hosting file manager/SFTP is the remaining infrastructure action; do not weaken the file editing protection just for this integration.
