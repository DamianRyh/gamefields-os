# Studio skin 2026-11

Gives the Studio (gamefields-studio.ryhfs90.chatgpt.site) the same visual language as the new homepage (page 3462, `integrations/wordpress/homepage/studio-2026-11`): Inter only, paper background, plum ink, violet for the main action, pill chips, no blobs and no lavender gradients.

It is a **pure CSS layer**. It changes no component, data, Project JSON, pricing or 3D model. It was tested by injecting it into the live Studio in a single browser tab at 375, 768 and 1440 px (Nawierzchnia, Konstrukcja, Grafika tabs and the summary modal); nothing was published.

## What changes

- **Top bar:** paper background; the logo is set in Inter 800. The folder and download buttons are outline pills. "Podsumowanie" is a plum pill that turns violet on hover. The crew strip uses a plum pill instead of dark green.
- **Stage:** flat paper background. The pastel blob canvas is hidden.
- **Panel:** white, 6 px radius, thin rule and no glass effect.
  - Tool tabs (Konstrukcja / Nawierzchnia / Grafika) use an ink underline.
  - Options are homepage chips: outline when off, ink fill when chosen.
  - The main action is violet.
- **Summary ("Sprawdź swój projekt"):** the heading and price use Inter 800 at a large size, and the price block sits on paper. The buttons are pills, and "Zapytaj o realizację" is violet.
- **Phones (≤ 800 px), fixed bugs:**
  - Before, the top bar was 399 px wide and overlapped "Zapisz dla innych". Now the logo and actions sit on one row of 56 px, the crew strip is hidden, and the quote amount is hidden while the button stays.
  - Before, the panel floated over the model from x = 121 px and ran off the screen. Now the model takes the top 42 % and the panel is a sheet below it with its own scroll. The tabs stay pinned while scrolling.
  - Undo/redo and the construction arrows sit on the bottom edge of the model, and the "Nawierzchnie / Konstrukcje" switch is kept. There is no horizontal scroll at 375 px.

## Deploy (ChatGPT Sites project `appgprj_6abbd0ba26f0819197701343bf156f1b`)

1. Copy `studio-skin-2026-11.css` to `app/studio-skin-2026-11.css`.
2. Copy `InterVariable.woff2` to `public/fonts/InterVariable.woff2`. The font is under the SIL OFL licence, from https://rsms.me/inter/.
3. In `app/layout.tsx`, add `import "./studio-skin-2026-11.css";` as the **last** CSS import, after every other stylesheet.
4. Run `tsc`, `build`, `test:studio` and `test:mobile`. Publish a new version and record it in `DEPLOYMENT.md`.

Rollback: remove the import line and publish again.

### Prompt for Codex / ChatGPT, if it does the deploy

> In the Gamefields Studio Sites project add the stylesheet integrations/studio/skin-2026-11/studio-skin-2026-11.css from github.com/DamianRyh/gamefields-os (branch studio-skin-2026-11) as app/studio-skin-2026-11.css, add InterVariable.woff2 from the same folder as public/fonts/InterVariable.woff2, and import the stylesheet last in app/layout.tsx. Change nothing else. Run tsc, build, test:studio and test:mobile, publish, and add the version, commit and deployment id to DEPLOYMENT.md.

## Notes

- Class names were read from the live DOM on 2026-11-02 (Studio v105+). If a later Studio version renames `studio-panel`, `studio-panel-tool-tabs`, `studio-showroom-nav`, `studio-quote-badge`, `studio-workshop-save` or `studio-template-launch`, the matching rules simply stop applying.
- On phones, `height:auto` on the absolutely positioned panel does not stretch, because of the older stacked rules. That is why the sheet uses an explicit `height:58%`.
