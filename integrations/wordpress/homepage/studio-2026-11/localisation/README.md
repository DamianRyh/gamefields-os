# GLOBAL-04 — static localisation review
Run from this directory: python3 generate-review.py --out review-en
This is a review-only generator; it does not invoke build.py or modify Polish sources.
English dictionary is editorial draft. It preserves prices in PLN and source claims, not independent verification.
Important: production uses theme assets/js/home/gf-home.js, not historical script.js (see build.py). Next: inventory live gf-home.js strings and generated prices_html/surfaces_html/reals_html/paint_html/materials_html/jsonld. Preserve business keys and shared URLs. CF7 shortcode stays unchanged; do not publish until EN form exists. Routes and Studio CTA require release gating. Existing source text may be behind production 1.0.37; reconcile before release.
Review-report lists unmapped tokens including names, numbers, whitespace-separated text and proper nouns. Review each; no automatic claim of completeness. No generated EN content should be pushed to WordPress.
