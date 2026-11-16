#!/usr/bin/env python3
"""Compose the WordPress payload for the Gamefields "Studio" homepage (page 3462).

Output:
  homepage.html  Gutenberg wp:html block (the exact content.raw to send to WordPress)
  index.html     local preview shell; the CF7 shortcode is replaced by a minimal stand-in form

The 3D models and the sample photo are served by jsDelivr from this repository, pinned to ASSET_COMMIT,
so the published page never changes when the branch moves.
"""
import base64
import hashlib
import html as htmllib
import re
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
ASSET_COMMIT = "dc298dede4689c700ad901e78628a1938fd941b0"
REPO_BASE = f"https://cdn.jsdelivr.net/gh/DamianRyh/gamefields-os@{ASSET_COMMIT}/"
ASSET_BASE = REPO_BASE + "integrations/wordpress/homepage/studio-2026-11/assets/"
FONT = HERE / "assets" / "fonts" / "GHInter-sub.woff2"  # InterVariable subset: Latin + Polish + arrows (pyftsubset), 63 KB instead of 352 KB


def read(name):
    return (HERE / name).read_text(encoding="utf-8")


def prices_html():
    """Construction 'from' prices on the homepage, rendered from integrations/wordpress/offer/price-from.json."""
    data = json.loads((HERE.parent.parent / "offer" / "price-from.json").read_text(encoding="utf-8"))
    concrete = {m["id"]: m["net"] for m in json.loads((HERE.parent.parent / "offer" / "concrete-base.json").read_text(encoding="utf-8"))["models"]}
    paint = {m["id"]: m["net"]["plain"] for m in json.loads((HERE.parent.parent / "offer" / "surface-finish.json").read_text(encoding="utf-8"))["models"]}
    zl = lambda n: f"{n:,}".replace(",", " ") + " zł"
    rows = []
    for m in data["models"]:
        # Card layout (UX 2026-11-16): name and size, price, the "with surface" chip, then audience and the link.
        meta = " · ".join(x for x in [m["code"] or "wynajem i sprzedaż", m["dimensions"] if m["dimensions"] != "Różne" else "różne wymiary"] if x)
        who = m["forWhom"] or ""
        label = "Zobacz ofertę" if m["id"] == "mobile" else "Zaprojektuj"
        full = (f'<p class="full">Z nawierzchnią od {zl(m["constructionFromNet"] + concrete[m["id"]] + paint[m["id"]])} netto</p>'
                if m["id"] in concrete and m["id"] in paint else "")
        rows.append(f'<li><div class="name"><b>{htmllib.escape(m["name"])}</b><span>{htmllib.escape(meta)}</span></div>'
                    f'<div class="net"><b>od {zl(m["constructionFromNet"])}</b> <small>netto</small><span class="gross">od {zl(m["constructionFromGross"])} brutto</span></div>'
                    + full +
                    f'<div class="pfoot"><span class="who">{htmllib.escape(who)}</span><a class="go" href="{m["link"]}">{label} <span aria-hidden="true">→</span></a></div></li>')
    hint = f'<p class="swipe-hint" aria-hidden="true">Przesuń w bok: {len(rows)} modeli <span>→</span></p>'
    return '<ul class="prices" role="list">' + "".join(rows) + "</ul>" + hint, data


def surfaces_html():
    """Surface prices per m² (net) from the owner's price lists: concrete base and every finish, Standard to Premium."""
    fin = json.loads((HERE.parent.parent / "offer" / "surface-finish.json").read_text(encoding="utf-8"))
    base = json.loads((HERE.parent.parent / "offer" / "concrete-base.json").read_text(encoding="utf-8"))
    rng = lambda vs: f"{min(vs)}–{max(vs)}" if min(vs) != max(vs) else f"{vs[0]}"
    items = [("Płyta betonowa 12 cm z podbudową", str(base["rateNetPerM2"]), "podstawa pod każde wykończenie"),
             ("Malowanie farbą sportową", rng([v["netPerM2"] for v in fin["variants"]]), "jednokolorowe do wzoru zaawansowanego")]
    for key, name, note in [("acrylic", "Akryl Hard Court", "system warstwowy jak na kortach"), ("turf", "Sztuczna trawa", "z montażem na betonie"),
                            ("mats", "Maty gumowe", "ciągła nawierzchnia gumowa"), ("epdm", "Nawierzchnia EPDM wylewana", "PN-EN 14877"),
                            ("tiles", "Płytki sportowe PP", "szybki montaż bez klejenia"), ("rubber", "Płyty gumowe", "PN-EN 1177, atest PZH")]:
        items.append((name, rng([v["netPerM2"] for v in fin[key]["variants"]]), note))
    li = "".join(f'<li><b>{htmllib.escape(n)}</b><span class="rate">{r} zł/m² <small>netto</small></span><span>{htmllib.escape(t)}</span></li>' for n, r, t in items)
    return ('<details class="surf-rates"><summary>Nawierzchnie: ceny za m²</summary><ul role="list">' + li +
            '</ul><p>Warianty Standard, Standard+ i Premium. Metraż: powierzchnia konstrukcji z 10% zapasem. Dokładną cenę policzy Studio dla wybranego modelu.</p></details>')


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
        ("Modernizacja betonowych placów w kolorowe boiska", "Naprawa i gruntowanie starego betonu lub asfaltu, elastyczne farby sportowe z granulatem gumowym, wzór i linie do piłki, koszykówki i gry 3 na 3."),
        ("Plakaty boisk", "Plakat z wzorem nawierzchni i liniami boiska, projektowany w przeglądarce."),
        # ("Piłki we wzorze boiska", ...) — ukryte na start 2026-11-08, wraca razem z sekcją #pilka
    ]
    _, price_data = prices_html()
    offers = [{"@type": "Offer", "itemOffered": {"@type": "Product", "name": m["name"], **({"sku": m["code"]} if m["code"] else {})},
               "priceSpecification": {"@type": "PriceSpecification", "minPrice": m["constructionFromNet"], "priceCurrency": "PLN", "valueAddedTaxIncluded": False},
               "seller": {"@id": site + "#studio"}} for m in price_data["models"]]
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
                "founder": {"@type": "Person", "@id": site + "#damian-gawrych", "name": "Damian Gawrych", "url": site + "damian-gawrych/", "sameAs": ["https://www.instagram.com/damiangawrych/", "https://www.damiangawrych.pl/"]},
                "address": {"@type": "PostalAddress", "addressLocality": "Warszawa", "addressCountry": "PL"},
                "parentOrganization": {"@id": site + "#organization"},
                "knowsAbout": ["boiska do panny", "street football", "boiska miejskie", "nawierzchnie sportowe", "malowanie boisk", "renowacja boisk betonowych", "projektowanie przestrzeni sportowych"],
                "hasOfferCatalog": {
                    "@type": "OfferCatalog",
                    "name": "Usługi Gamefields",
                    "itemListElement": [
                        {"@type": "Offer", "itemOffered": {"@type": "Service", "name": n, "description": d, "provider": {"@id": site + "#studio"}}}
                        for n, d in services
                    ] + offers,
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

    body = body.replace("{{PRICES}}", prices_html()[0]).replace("{{SURFACES}}", surfaces_html())
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
    ball_core = (HERE.parent.parent.parent / "studio" / "ball-2026-11" / "ball-core.js").read_text(encoding="utf-8").strip()
    # On WordPress the three big scripts are cached files in the Gamefields theme, loaded with `defer` in this order
    # (pattern engine -> ball core -> page script); a file is not touched by WordPress, so no base64 wrapper is needed.
    # The theme must be uploaded before the page content that points at a new hash.
    jsdir = HERE.parent.parent / "theme" / "gamefields" / "assets" / "js" / "home"
    jsdir.mkdir(parents=True, exist_ok=True)
    files = [("gf-pro.js", eng), ("gf-ball-core.js", ball_core), ("gf-home.js", script.strip())]
    tags = []
    # gf-home.js is owned by the theme since hero R3 (PR #63, 2026-11-08): the hero code lives only there, so the build
    # no longer overwrites it and versions the theme file as it is. script.js stays as the historical source.
    # gf-pro.js likewise (2026-11-11): the deployed theme file is newer than surface-pro-2026-11, so the build keeps it as is.
    THEME_OWNED = {"gf-home.js", "gf-pro.js"}
    for name, code in files:
        if name in THEME_OWNED and (jsdir / name).exists():
            code = (jsdir / name).read_text(encoding="utf-8").rstrip("\n")
        else:
            (jsdir / name).write_text(code + "\n", encoding="utf-8")
        ver = hashlib.sha1(code.encode("utf-8")).hexdigest()[:10]
        tags.append(f'<script defer src="/wp-content/themes/gamefields/assets/js/home/{name}?v={ver}"></script>')
    # Since 2026-11-16 the page is a list of small wp:html blocks, one per section, so that a later change
    # replaces one small block instead of the whole page. Each block starts with "<!-- gf-blok: NAME -->";
    # the wrapper <div class="gfs"> opens in "naglowek" and closes in "kontakt", which WordPress keeps as is.
    # Every block is also written to bloki/NN-NAME.html, so a deployment can point at a single raw file.
    parts = re.split(r"<!--GF-BLOK:([a-z0-9-]+)-->", body.strip())
    sections = [("naglowek", parts[0])] + list(zip(parts[1::2], parts[2::2]))
    styl = "\n".join([
        "<!-- Gamefields homepage studio-2026-11 · source: integrations/wordpress/homepage/studio-2026-11 · Inter SIL OFL: https://rsms.me/inter/ -->",
        f"<style>{THEME_FONT_FACE}\n{style}</style>",
        jsonld(faq),
    ])

    def assemble(script_part):
        blocks = [("styl", styl)] + sections + [("skrypty", "\n".join(script_part + [contact_scripts.strip()]))]
        return blocks, "\n\n".join(f"<!-- wp:html -->\n<!-- gf-blok: {n} -->\n{c.strip()}\n<!-- /wp:html -->" for n, c in blocks) + "\n"

    blocks, block = assemble(tags)
    _, inline_block = assemble([loader, "<script>" + ball_core + "</script>", f"<script>\n{script.strip()}\n</script>"])
    out = HERE / "bloki"
    out.mkdir(exist_ok=True)
    for f in out.glob("*.html"):
        f.unlink()
    for i, (n, c) in enumerate(blocks, 1):
        (out / f"{i:02d}-{n}.html").write_text(f"<!-- wp:html -->\n<!-- gf-blok: {n} -->\n{c.strip()}\n<!-- /wp:html -->\n", encoding="utf-8")
    (HERE / "homepage.html").write_text(block, encoding="utf-8")

    stand_in = ('<form class="wpcf7-form" onsubmit="event.preventDefault()">'
                '<p><label>E-mail<input type="email" name="your-email"></label></p>'
                '<p><label>Szczegóły projektu<textarea name="project-details" rows="3"></textarea></label></p>'
                '<p><input type="submit" value="Wyślij zapytanie"></p></form>')
    preview = inline_block.replace(THEME_FONT_FACE, font_face).replace('[contact-form-7 id="a71dc3a" title="Gamefields — zapytanie o projekt"]', stand_in)
    preview = preview.replace("<!-- wp:html -->", "").replace("<!-- /wp:html -->", "")
    (HERE / "index.html").write_text(
        '<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        "<title>Gamefields — podgląd lokalny</title></head><body>" + preview + "</body></html>\n",
        encoding="utf-8",
    )
    print(f"homepage.html {len(block)} bytes, {len(blocks)} blocks")


if __name__ == "__main__":
    main()
