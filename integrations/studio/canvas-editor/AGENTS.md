# Gamefields contributor guide

Owner decision (2026-10-08): Studio / court design and Radar / location concepts only. PLAY is retired.

Preserve all 300 patterns, palettes, sport profiles and prepared images, including hidden Kraków. Keep React 19, Next / Vinext, Cloudflare-compatible hosting and projectSchema validation. Routes are /, /radar and /radar/[slug]; APIs are /api/quote and /api/templates. Projects use validated JSON import/export, not retired account endpoints.

Historical applied SQL in drizzle/ is a frozen migration ledger, not an active feature. Never alter applied migrations, destroy production customer/project data or rewrite Git history during cleanup. Native WordPress plugin management may remove explicitly approved retired PLAY, but do not modify gateway source via the content API.

Open the existing Site source before edits; inspect status and preserve concurrent changes. Never commit secrets. Update README.md, docs/PROJECT_STATUS.md and docs/BACKLOG.md with evidence-backed state.

Checks: pnpm exec tsc --noEmit; pnpm test:studio; pnpm build; pnpm test:mobile (Chromium required). Verify Studio materials, cameras, JSON import/export and Radar filtering/detail navigation.
