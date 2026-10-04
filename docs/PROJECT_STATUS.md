# Gamefields project status

Updated: 2026-10-04

## Source and delivery

- `main` includes the live design-preview workflow from PR #24 at commit `d66d9ddf`.
- Open concurrent work: PR #13, Gamefields PLAY v0.13 community redesigns.
- Public Studio: `https://gamefields-studio.ryhfs90.chatgpt.site` (Sites version 14).
- Target public PLAY origin: `https://gamefields.eu/play`.
- WordPress MU gateway still requires hosting file-manager or SFTP installation when not already present.

## Current Studio work

- Branch: `feat/studio-multisport-realistic-previews`.
- Organic Flow, Urban Contrast and Classic Lines have dedicated realistic WebP previews for Street Football 3×3 and Basketball 3×3.
- Preview assets are preloaded and selected through a `sport × design` mapping, so switching stays instant and never shows imagery for the wrong sport.
- The plan/realistic toggle keeps the selected direction.
- Studio version 14 is published; the Basketball 3×3 extension is the current unpublished iteration.

## Known limitations

- Dedicated photorealistic previews currently cover two sports and three curated directions, not every sport or pattern-library combination.
- The next rendering architecture should use one clean realistic scene and perspective mask per sport, then composite colors and graphics client-side with Canvas/WebGL instead of storing every combination as a separate bitmap.
- Builder projects use account persistence where connected; JSON export remains the backup path.
