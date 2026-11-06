# Conversion corrections — 2026-11-04

Applied to current Sites v158 source and live WordPress content, preserving the homepage design and existing CF7 mail destination.

WordPress targets:
- Page 3462: homepage readiness notification for Studio popup, accurate quote FAQ, second hero CTA, three inspected photographs from existing media (3108, 3105, 3112), enhanced three-step form.
- Page 3644: embedded Studio contact dialog, exact payload acknowledgement bound to iframe source and Studio origin; additional colour/seed/surface query parameters forwarded.
- CF7 form 3758 / hash a71dc3a: one shared need → place → contact flow. Only email is required; optional site photograph JPG/PNG/WebP ≤5 MB; mail attachments include project-photo. Save through CF7 REST with context=save.
- Page 3716: the same shared form on the contact page.
- Elementor page 757 displayed above /shop/: individual-quote copy replaces four hardcoded marketing prices, delivery timing confirmed individually, correct surfaces link and functional contact CTAs. Existing WooCommerce product prices are unchanged and have not been validated. The old banner contact-form URL was corrected by a match-once meta patch.
- Menu item 3734: dead #radar anchor changed to the verified public Studio Radar route after explicit user approval.

The JS/CSS and form template here reproduce the applied integration. Backups, before/after screenshots, browser logs and the user's pasted brief are in /Users/mac/Documents/Gamefields/outputs/conversion-2026-11-04. Backups include the full homepage, pages 3644/3716, CF7 properties and original Elementor data. Native content edits also create WordPress page revisions.

Studio adds an explicitly labelled conceptual top-down PNG export from the existing SVG renderer and a clearer inquiry CTA. No model, migration, rate card, pattern or backward-incompatible schema change.

One test email was explicitly approved by the user and submitted through the live form: WordPress reported sent. Inbox delivery is not independently verified. No additional submissions are made by automated QA. A synthetic optional photo is selected locally, without submitting it. Existing inquiry payloads carry graphic parameters but omit image file contents; full artwork remains in the project JSON and exported PNG, with files supplied separately.

QA: actual live WordPress flow at 390 and 1440 px, exact model/base/seed/estimate attachment, return to editor, one visible form step, email validity, photo input, three real photos and no horizontal overflow. PNG downloaded and visually inspected. See DEPLOYMENT.md for final required checks and Sites publication.
