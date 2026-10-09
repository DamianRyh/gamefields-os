# Gamefields homepage — autorskie studio

Source of truth: WordPress page **3462**, https://www.gamefields.eu/. The repository application is the separate Builder at `/konfigurator-boisk/`; its `app/page.tsx` is not the marketing homepage.

`homepage-studio.html` is the Gutenberg custom HTML block exported after the live update on 2026-10-09. Paste the complete block in the WordPress text editor when restoring or updating this homepage. Existing theme Custom CSS supplies the logo and GamefieldsSans font. Scoped `data-author-studio` rules preserve the current cream/black identity despite older global theme overrides.

The page includes the supplied author-studio copy, Damian section, service and audience links, Studio direction switcher, Radar map, separate place-report form, and existing project-contact form.

## WordPress settings

- SEO title: Gamefields — autorskie studio boisk miejskich Damiana Gawrycha
- Meta description: Projektowanie, renowacje i realizacje boisk miejskich: street football, boiska panna, kolorowe nawierzchnie, murale, modułowe areny i koncepcje przestrzeni sportowych dla miast, szkół, deweloperów i marek.
- Existing project form: CF7 post 3758 (unchanged).
- New place form: CF7 post 3824, shortcode `ff9375c`, title `Gamefields — zgłoś miejsce`.
- Place form recipient: `info@gamefields.eu`; sender: `[_site_title] <wordpress@gamefields.eu>`; Reply-To: `[your-email]`.
- Attachments: `[place-photo-1]`, `[place-photo-2]`, `[place-photo-3]`, each JPG/PNG/WebP up to 3 MB.

## Verification

Live page opens with the new SEO title and description, one H1, no duplicate IDs, no missing internal anchor targets, and working image loads. CTA clicks reach the contact and report sections. Desktop 1440 px and mobile 390 px layouts were visually inspected; mobile hero has no horizontal overflow. Both CF7 forms render with their expected fields. Radar loads the existing map.

Email delivery and attachment delivery were not tested by sending a submission. The existing WordPress portrait (media 3681, 918 × 1140) is now used in the Damian section and personal contact. Hero retains the field concept image. GitHub merge does not deploy this WordPress page automatically. WordPress revisions are the rollback mechanism for the live page.

Local HTML integrity and inline JavaScript syntax checks passed. Repository `pnpm lint` and `pnpm build` were attempted, but could not start because this checkout has no `node_modules` (missing eslint/vinext). The Builder application code is unchanged.

Polish: homepage menu now reads Oferta / Studio / Realizacje / Builder / Kontakt / Zgłoś miejsce; the mobile layout remains Oferta / Studio / Zgłoś miejsce / Kontakt. Contact has a portrait, a direct invitation to talk, a named email CTA, and a labelled phone link. Subpage copy is deferred to the next stage.
