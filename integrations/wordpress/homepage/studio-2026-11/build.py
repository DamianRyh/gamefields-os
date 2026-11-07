#!/usr/bin/env python3
"""Compose the WordPress payload for the Gamefields "Studio" homepage (page 3462).

Output:
  homepage.html  Gutenberg wp:html block (the exact content.raw to send to WordPress)
  index.html     local preview shell; the CF7 shortcode is replaced by a minimal stand-in form

The 3D models and the sample photo are served by jsDelivr from this repository, pinned to ASSET_COMMIT,
so the published page never changes when the branch moves.
"""
import base64
import html as htmllib
import re
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
ASSET_COMMIT = "02f3a62c4d9c71608dc827e6f30066d50a523f58"
REPO_BASE = f"https://cdn.jsdelivr.net/gh/DamianRyh/gamefields-os@{ASSET_COMMIT}/"
ASSET_BASE = REPO_BASE + "integrations/wordpress/homepage/studio-2026-11/assets/"
FONT = HERE / "assets" / "fonts" / "GHInter-sub.woff2"  # InterVariable subset: Latin + Polish + arrows (pyftsubset), 63 KB instead of 352 KB


def read(name):
    return (HERE / name).read_text(encoding="utf-8")


def jsonld(faq_html):
    """Structured data for the studio, its services and the FAQ. Facts only from the page itself, no prices."""
    qa = []
    for q, a in re.findall(r"<details><summary>(.*?)</summary><p>(.*?)</p></details>", faq_html, re.S):
        text = htmllib.unescape(re.sub(r"<[^>]+>", "", a)).strip()
        qa.append({"@type": "Question", "name": htmllib.unescape(q).strip(),
                   "acceptedAnswer": {"@type": "Answer", "text": text}})
    if len(qa) < 4:
        sys.exit("FAQ parse failed")
    site = "https://www.gamefields.eu/"
    services = [
        ("Projektowanie boisk miejskich", "Koncepcja miejsca gry: konstrukcja, nawierzchnia i grafika projektowane jako jeden przedmiot."),
        ("Modułowe boiska do panny i street footballu", "Panna Ring, Panna Play, Panna Court, Panna Octa, Panna Grid, Cage 90, Cage 180 i Street Arena 15."),
        ("Kolorowe nawierzchnie i grafika boisk", "Wzory nawierzchni malowanej, EPDM, płytek i trawy projektowane w Studiu 3D."),
        ("Plakaty boisk", "Plakat z wzorem nawierzchni i liniami boiska, projektowany w przeglądarce."),
        ("Piłki we wzorze boiska", "Projekt piłki w tym samym wzorze i kolorach co nawierzchnia."),
    ]
    graph = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "ProfessionalService",
                "@id": site + "#studio",
                "name": "Gamefields",
                "alternateName": "Gamefields — autorskie studio boisk miejskich",
                "url": site,
                "email": "info@gamefields.eu",
                "image": "https://www.gamefields.eu/wp-content/uploads/2026/10/Gamefields-Panna-Play-wide-v3-default.webp",
                "description": "Projektowanie, renowacje i realizacje boisk miejskich: street football, boiska panna, kolorowe nawierzchnie, murale i modułowe areny dla miast, szkół, deweloperów i marek.",
                "founder": {"@type": "Person", "name": "Damian Gawrych"},
                "address": {"@type": "PostalAddress", "addressLocality": "Warszawa", "addressCountry": "PL"},
                "parentOrganization": {"@id": site + "#organization"},
                "knowsAbout": ["boiska do panny", "street football", "boiska miejskie", "nawierzchnie sportowe", "projektowanie przestrzeni sportowych"],
                "hasOfferCatalog": {
                    "@type": "OfferCatalog",
                    "name": "Usługi Gamefields",
                    "itemListElement": [
                        {"@type": "Offer", "itemOffered": {"@type": "Service", "name": n, "description": d, "provider": {"@id": site + "#studio"}}}
                        for n, d in services
                    ],
                },
            },
            {"@type": "FAQPage", "@id": site + "#pytania", "inLanguage": "pl-PL", "mainEntity": qa},
        ],
    }
    return '<script type="application/ld+json">' + json.dumps(graph, ensure_ascii=False, separators=(",", ":")) + "</script>"


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

    # Court Art Pro engine for the poster lab. It contains double ampersands, which WordPress would break,
    # so it ships base64-encoded and is decoded in the browser into window.GFPRO.
    eng = (HERE.parent.parent.parent / "studio" / "surface-pro-2026-11" / "court-art-pro.mjs").read_text(encoding="utf-8").replace("\nexport ", "\n")
    sig = (HERE.parent.parent.parent / "studio" / "surface-pro-2026-11" / "signature-pro.json").read_text(encoding="utf-8")
    eng = eng.replace("export ", "", 1) if eng.startswith("export ") else eng
    eng = "(function(){" + eng + "\nwindow.GFPRO={renderPro:renderPro,courtLines:courtLines,recommendLineColor:recommendLineColor,lightness:lightness,mix:mix,PRO_FAMILIES:PRO_FAMILIES.map(function(f){return {id:f.id,name:f.name,short:f.short,group:f.group,description:f.description,inspiration:f.inspiration,masking:f.masking}}),PRO_PALETTES:PRO_PALETTES,SIG:" + sig.strip() + "};})();"
    eng_b64 = base64.b64encode(eng.encode("utf-8")).decode("ascii")
    loader = ('<script>(function(){try{var b=atob("' + eng_b64 + '"),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);'
              '(0,eval)(new TextDecoder().decode(u));}catch(e){console.warn("GFPRO",e)}})();</script>')

    font = base64.b64encode(FONT.read_bytes()).decode("ascii")
    font_face = ("@font-face{font-family:GHInter;font-style:normal;font-weight:100 900;font-display:swap;"
                 f"src:url(data:font/woff2;base64,{font}) format('woff2')}}")

    # On WordPress the Gamefields theme already serves (and preloads) the same subset as a cached file,
    # so the page links that file instead of carrying 84 KB of base64. The local preview keeps the inline font.
    THEME_FONT_FACE = ("@font-face{font-family:GHInter;font-style:normal;font-weight:100 900;font-display:swap;"
                       "src:url(/wp-content/themes/gamefields/assets/fonts/GHInter-sub.woff2) format('woff2')}")
    block = "\n".join([
        "<!-- wp:html -->",
        "<!-- Gamefields homepage studio-2026-11 · source: integrations/wordpress/homepage/studio-2026-11 · Inter SIL OFL: https://rsms.me/inter/ -->",
        f"<style>{THEME_FONT_FACE}\n{style}</style>",
        jsonld(faq),
        body.strip(),
        loader,
        "<script>" + (HERE.parent.parent.parent / "studio" / "ball-2026-11" / "ball-core.js").read_text(encoding="utf-8").strip() + "</script>",
        f"<script>\n{script.strip()}\n</script>",
        contact_scripts.strip(),
        "<!-- /wp:html -->",
    ]) + "\n"
    (HERE / "homepage.html").write_text(block, encoding="utf-8")

    stand_in = ('<form class="wpcf7-form" onsubmit="event.preventDefault()">'
                '<p><label>E-mail<input type="email" name="your-email"></label></p>'
                '<p><label>Szczegóły projektu<textarea name="project-details" rows="3"></textarea></label></p>'
                '<p><input type="submit" value="Wyślij zapytanie"></p></form>')
    preview = block.replace(THEME_FONT_FACE, font_face).replace('[contact-form-7 id="a71dc3a" title="Gamefields — zapytanie o projekt"]', stand_in)
    preview = preview.replace("<!-- wp:html -->", "").replace("<!-- /wp:html -->", "")
    (HERE / "index.html").write_text(
        '<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        "<title>Gamefields — podgląd lokalny</title></head><body>" + preview + "</body></html>\n",
        encoding="utf-8",
    )
    print(f"homepage.html {len(block)} bytes")


if __name__ == "__main__":
    main()
