#!/usr/bin/env python3
"""Compose the WordPress payload for the Gamefields "Studio" homepage (page 3462).

Output:
  homepage.html  Gutenberg wp:html block (the exact content.raw to send to WordPress)
  index.html     local preview shell; the CF7 shortcode is replaced by a minimal stand-in form

The 3D models and the sample photo are served by jsDelivr from this repository, pinned to ASSET_COMMIT,
so the published page never changes when the branch moves.
"""
import base64
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
ASSET_COMMIT = "02f3a62c4d9c71608dc827e6f30066d50a523f58"
REPO_BASE = f"https://cdn.jsdelivr.net/gh/DamianRyh/gamefields-os@{ASSET_COMMIT}/"
ASSET_BASE = REPO_BASE + "integrations/wordpress/homepage/studio-2026-11/assets/"
FONT = HERE.parent / "premium-2026-10-26" / "assets" / "InterVariable.woff2"


def read(name):
    return (HERE / name).read_text(encoding="utf-8")


def main():
    style = read("style.css")
    body = read("body.html")
    script = read("script.js")
    workshop = read("kept-workshop.html")
    faq, contact_scripts = read("kept-faq-contact.html").split("<!--CONTACT_SCRIPTS-->")

    if "&&" in script:
        sys.exit("script.js contains a double ampersand; WordPress would break it")
    for token in ("{{ASSET}}", "{{KEPT_WORKSHOP}}", "{{KEPT_FAQ}}"):
        if body.count(token) != 1 and token != "{{ASSET}}":
            sys.exit(f"missing {token}")

    body = body.replace("{{ASSET}}", ASSET_BASE)
    body = body.replace("{{KEPT_WORKSHOP}}", workshop.strip())
    body = body.replace("{{KEPT_FAQ}}", faq.strip())
    body = body.replace(
        'data-homepage-version="studio-2026-11"',
        f'data-homepage-version="studio-2026-11" data-asset-base="{ASSET_BASE}" data-repo-base="{REPO_BASE}"',
        1,
    )

    font = base64.b64encode(FONT.read_bytes()).decode("ascii")
    font_face = ("@font-face{font-family:GHInter;font-style:normal;font-weight:100 900;font-display:swap;"
                 f"src:url(data:font/woff2;base64,{font}) format('woff2')}}")

    block = "\n".join([
        "<!-- wp:html -->",
        "<!-- Gamefields homepage studio-2026-11 · source: integrations/wordpress/homepage/studio-2026-11 · Inter SIL OFL: https://rsms.me/inter/ -->",
        f"<style>{font_face}\n{style}</style>",
        body.strip(),
        f"<script>\n{script.strip()}\n</script>",
        contact_scripts.strip(),
        "<!-- /wp:html -->",
    ]) + "\n"
    (HERE / "homepage.html").write_text(block, encoding="utf-8")

    stand_in = ('<form class="wpcf7-form" onsubmit="event.preventDefault()">'
                '<p><label>E-mail<input type="email" name="your-email"></label></p>'
                '<p><label>Szczegóły projektu<textarea name="project-details" rows="3"></textarea></label></p>'
                '<p><input type="submit" value="Wyślij zapytanie"></p></form>')
    preview = block.replace('[contact-form-7 id="a71dc3a" title="Gamefields — zapytanie o projekt"]', stand_in)
    preview = preview.replace("<!-- wp:html -->", "").replace("<!-- /wp:html -->", "")
    (HERE / "index.html").write_text(
        '<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        "<title>Gamefields — podgląd lokalny</title></head><body>" + preview + "</body></html>\n",
        encoding="utf-8",
    )
    print(f"homepage.html {len(block)} bytes")


if __name__ == "__main__":
    main()
