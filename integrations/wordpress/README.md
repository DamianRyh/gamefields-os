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

## Studio — przygotowane wejście WWW

Gateway obsługuje też `/studio` i `/studio/` oraz sceny WebP z `/studio/`. Najpierw opublikuj aplikację zawierającą trasę `app/studio/page.tsx`, następnie zaktualizuj gateway. Wyklucz obie trasy strony z cache; sceny mogą pozostać publicznie cacheowane. Dodaj pozycję Studio w menu WP i sprawdź bezpośredni link, przeładowanie, podglądy, wycenę i zapis konta. Gateway nie przechwytuje strony głównej WordPressa. Szczegółowy plan: `docs/WWW-ROLLOUT.md`.

## Alternative: install through the WordPress plugin panel

If the administrator can install plugins, SFTP is not required for the gateway itself. Build the ordinary plugin package with `pnpm build:wordpress` (requires the `zip` command), then use **Plugins → Add New → Upload Plugin** and select `dist/wordpress/gamefields-studio-play.zip`. The package contains the same gateway code under `gamefields-studio-play/gamefields-play.php`.

Before activation:

1. Back up the WordPress database and files.
2. Deploy the matching application and verify its health from the hosting network. A 403 at the upstream is a blocker until its access policy is understood and resolved.
3. Resolve the existing `/studio` redirect to `studio.webp`; identify its source and preserve the image. Configure session/API cache exclusions listed above.
4. Use **one** installation method. An old MU-plugin can intercept requests before the new normal plugin. Update or remove the old installation through the hosting administrator before enabling a second copy.
5. Activate **Gamefields Studio & PLAY**. Check `/studio`, scene images, `/play`, `/api/play/health`, a real quote, and account project save/reopen in two browsers.

Rollback for the ordinary plugin: deactivate it in the Plugins panel. For the MU-plugin: rename its file as described above. Keep the previous deployment and database backup available; deactivating the gateway does not undo application migrations.

If the upload option is missing or plugin installation is disabled, the administrator must use the hosting file manager/SFTP. `DISALLOW_FILE_EDIT` alone does not establish that plugin installation is disabled; the current site's permissions have not been verified.
