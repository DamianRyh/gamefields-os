# Gamefields project status

Updated: 2026-10-04

## Source and delivery

- `main` includes Studio v2.3 from PR #23 at commit `a8b1febe`.
- Open concurrent work: PR #13, Gamefields PLAY v0.13 community redesigns.
- Public Studio: `https://gamefields-studio.ryhfs90.chatgpt.site` (Sites version 13).
- Target public PLAY origin: `https://gamefields.eu/play`.
- WordPress MU gateway still requires hosting file-manager or SFTP installation when not already present.

## Current Studio work

- Branch: `feat/studio-live-design-preview`.
- Organic Flow, Urban Contrast and Classic Lines have dedicated realistic WebP previews.
- Preview assets are preloaded and swap with the selected direction without navigation or server generation.
- The plan/realistic toggle keeps the selected direction.
- Local validation: TypeScript and production build pass; browser interaction QA passes with no console errors.
- This branch is not yet published or merged.

## Known limitations

- Dedicated photorealistic previews currently cover the three curated guided-design directions, not every pattern-library combination.
- Builder projects use account persistence where connected; JSON export remains the backup path.
