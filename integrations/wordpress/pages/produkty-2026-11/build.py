#!/usr/bin/env python3
"""Product descriptions (the "Opis" tab) of the 16 shop products, 28.11.2026.

On 27-28.11.2026 the descriptions were written with ChatGPT and published as plain paragraphs, a Yoast FAQ block and
link lists. Their text is kept in opisy-2026-11-28.json (lead and questions as published). This build gives them the
site's look inside the product tab: lead, "see it built" cards (case studies and realizations), guides, questions as an
accordion with FAQPage data (it replaces the Yoast FAQ block, so the schema stays), matching surfaces or models, and
the next steps (Studio, planner, photos of the place).

Output: <slug>.html for each product, one wp:html block = the whole product description. The styles are scoped to
.gfpd and carry their own colours, because the product page does not load the content-page stylesheet.
Prices from integrations/wordpress/offer/*.json and the theme's data/studio-shop.json. The surface questions are
rebuilt from the same answers with correct names ("Ile kosztują płyty gumowe?").
"""
import html
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from gfb_common import BASE, FIN, PRICE, SURF, SLUG, SITE, rng, zl  # noqa: E402

SHOP = json.loads((HERE.parents[1] / "theme" / "gamefields" / "data" / "studio-shop.json").read_text(encoding="utf-8"))
P = {p["slug"]: p for p in SHOP["products"]}
TEXT = json.loads((HERE / "opisy-2026-11-28.json").read_text(encoding="utf-8"))
MID = {v: k for k, v in SLUG.items()}  # product slug -> Studio arena id
PRICE_M = {m["id"]: m for m in PRICE["models"]}

CSS = """
.gfpd{--ink:#47132D;--violet:#6336F5;--lime:#D8F24A;--muted:#74656D;--line:#E3DBDF;--paper:#F4F1EE;max-width:880px;color:var(--ink);font-size:16px;line-height:1.6}
.gfpd *{box-sizing:border-box}
.woocommerce-Tabs-panel--description > h2:first-child{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.woocommerce-Tabs-panel--description .gfpd > :first-child{margin-top:8px}
.gfpd h2{margin:clamp(28px,3vw,40px) 0 12px!important;font-size:clamp(24px,2.4vw,32px)!important;font-weight:800;letter-spacing:-.03em!important;line-height:1.05!important;color:var(--ink)}
.gfpd p{margin:0 0 12px;color:#5A4652}
.gfpd a{color:var(--ink)}
.gfpd .lead{margin:0;padding:20px 22px;background:#fff;border-left:5px solid var(--lime);font-size:18px;font-weight:500;line-height:1.5;color:var(--ink)}
.gfpd .facts{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 0;padding:0;list-style:none}
.gfpd .facts li{display:inline-flex;align-items:center;min-height:32px;padding:0 12px;border-radius:999px;background:#fff;border:1px solid var(--line);font-size:13px;font-weight:600}
.gfpd .cards{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.gfpd .cards a{display:grid;grid-template-columns:120px minmax(0,1fr);height:100%;background:#fff;border:1px solid var(--line);text-decoration:none;color:var(--ink);transition:border-color .2s ease}
.gfpd .cards a:hover{border-color:var(--violet)}
.gfpd .cards img{display:block;width:100%;height:100%;min-height:110px;object-fit:cover;background:#E6E0DA}
.gfpd .cards span{display:grid;align-content:center;gap:4px;padding:14px 16px;font-size:14px;color:var(--muted);line-height:1.35}
.gfpd .cards b{font-size:17px;letter-spacing:-.01em;color:var(--ink)}
.gfpd .cards i{font-style:normal;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--violet)}
.gfpd .chips{display:flex;flex-wrap:wrap;gap:8px;margin:0;padding:0;list-style:none}
.gfpd .chips a{display:inline-flex;align-items:center;min-height:40px;padding:0 16px;border-radius:999px;border:1.5px solid #CDBFC6;text-decoration:none;font-size:14px;font-weight:600;color:var(--ink);background:transparent;transition:border-color .2s ease,color .2s ease}
.gfpd .chips a:hover{border-color:var(--violet);color:var(--violet)}
.gfpd .chips a small{margin-left:6px;font-size:13px;font-weight:500;color:var(--muted)}
.gfpd .faq{border-top:1px solid var(--line)}
.gfpd .faq details{border-bottom:1px solid var(--line)}
.gfpd .faq summary{display:flex;justify-content:space-between;gap:14px;list-style:none;cursor:pointer;padding:16px 2px;font-size:17px;font-weight:700;color:var(--ink)}
.gfpd .faq summary::-webkit-details-marker{display:none}
.gfpd .faq summary::after{content:"+";font-size:22px;font-weight:400;line-height:1;color:var(--violet)}
.gfpd .faq details[open] summary::after{content:"\\2212"}
.gfpd .faq p{margin:0;padding:0 2px 18px;font-size:16px;color:var(--muted)}
.gfpd .next{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:0;padding:0;list-style:none}
.gfpd .next a{display:grid;gap:4px;height:100%;padding:18px;background:#fff;border:1px solid var(--line);text-decoration:none;color:var(--ink);transition:border-color .2s ease}
.gfpd .next a:hover{border-color:var(--violet)}
.gfpd .next b{font-size:18px;letter-spacing:-.02em}.gfpd .next span{font-size:14px;color:var(--muted);line-height:1.4}
.gfpd .next i{font-style:normal;font-weight:800;color:var(--violet)}
.gfpd .next li:first-child a{background:var(--ink);border-color:var(--ink);color:var(--paper)}
.gfpd .next li:first-child span{color:rgba(244,241,238,.8)}.gfpd .next li:first-child i{color:var(--lime)}
.gfpd .note{margin-top:14px;font-size:13px;color:var(--muted)}
@media (max-width:700px){.gfpd .cards,.gfpd .next{grid-template-columns:minmax(0,1fr)}.gfpd .lead{font-size:17px}.gfpd .cards a{grid-template-columns:96px minmax(0,1fr)}}
"""
UP = "https://www.gamefields.eu/wp-content/uploads/"
# Built places for each model: (url, photo, kind, title, place). Only realizations shown on /realizacje-gamefields/.
BUILT = {
    "panna-ring": [("/panna-ring-orlik-grodzisk-mazowiecki/", "2024/12/15-768x432.jpg", "Case study", "Panna Ring na Orliku", "Grodzisk Mazowiecki, 10 lat w użyciu"),
                   ("/taras-park-swietokrzyski-warszawa/", "2024/12/Areny-Panna-Football-Alternative-Soccer-Warszawa-3-768x576.jpg", "Case study", "Trzy areny przy Pałacu Kultury", "Warszawa, Park Świętokrzyski")],
    "panna-octa": [("/realizacje-gamefields/#kutno", "2025/06/IMG_6608-scaled-e1749983082809-768x696.jpg", "Realizacja", "Panna Octa w Kutnie", "pasaż sportowy, Urząd Miasta Kutno")],
    "panna-octa-cage-90": [("/realizacje-gamefields/#krakow", "2026/11/Krakow-Panna-Arena-Octa-Cage-90-Gamefields-768x768.jpg", "Realizacja", "Kraków: od planu do parku", "teren miejski")],
    "panna-octa-cage-180": [("/realizacje-gamefields/#wake", "2024/12/12-3-768x768.jpg", "Realizacja", "Wake For Friends", "Grodzisk Mazowiecki, park wakeboardowy")],
}
GUIDES = {
    "ile": ("/ile-kosztuje-boisko-do-panny/", "Ile kosztuje boisko do panny?"),
    "naw": ("/jak-wybrac-nawierzchnie-na-boisko-do-panny/", "Jak wybrać nawierzchnię na boisko do panny?"),
    "osiedle": ("/boisko-do-panny-na-osiedlu/", "Boisko do panny na osiedlu"),
    "event": ("/mobilne-boisko-na-event-wynajem-czy-zakup/", "Mobilne boisko na event"),
    "orlik": ("/modernizacja-orlika-epdm-trawa-czy-plyty/", "Modernizacja Orlika: EPDM, trawa czy płyty?"),
    "beton": ("/boisko-na-starym-betonie-malowanie/", "Boisko na starym betonie"),
    "dof": ("/dofinansowanie-boisk-2027-jak-przygotowac-wniosek/", "Dofinansowanie boisk 2027"),
    "wym": ("/wymiary-boiska-wielofunkcyjnego/", "Wymiary boiska wielofunkcyjnego"),
}
MODEL_GUIDES = {"panna-octa-cage-90": ["ile", "osiedle", "naw"], "panna-play": ["ile", "event", "naw"], "panna-ring": ["ile", "osiedle", "orlik"],
                "panna-octa": ["ile", "dof", "naw"], "panna-grid": ["naw", "ile", "osiedle"], "panna-octa-cage-180": ["naw", "ile", "event"],
                "panna-court": ["naw", "osiedle", "ile"], "street-arena-15": ["naw", "dof", "wym"]}
# Surface -> guides, the models it is used on most (by the plan of 28.11: each surface links its usual models).
SURF_KEY = {s[3]: s for s in SURF}
SURF_GUIDES = {"malowanie-farba-sportowa": ["beton", "naw"], "nawierzchnia-epdm": ["orlik", "naw"], "sztuczna-trawa": ["orlik", "naw"],
               "plyty-gumowe": ["orlik", "naw"], "plytki-sportowe": ["naw", "orlik"], "akryl-hard-court": ["naw", "beton"],
               "maty-gumowe-nawierzchnia": ["naw", "orlik"], "plyta-betonowa": ["beton", "naw"]}
SURF_MODELS = {"malowanie-farba-sportowa": ["panna-octa-cage-90", "panna-ring", "street-arena-15"], "nawierzchnia-epdm": ["panna-play", "panna-court", "street-arena-15"],
               "sztuczna-trawa": ["panna-octa-cage-180", "panna-court", "panna-grid"], "plyty-gumowe": ["panna-play", "panna-octa", "panna-court"],
               "plytki-sportowe": ["street-arena-15", "panna-court", "panna-grid"], "akryl-hard-court": ["street-arena-15", "panna-court", "panna-octa"],
               "maty-gumowe-nawierzchnia": ["panna-play", "panna-octa-cage-90", "panna-ring"], "plyta-betonowa": ["panna-octa-cage-90", "panna-play", "street-arena-15"]}
MODEL_SURF = ["malowanie-farba-sportowa", "nawierzchnia-epdm", "sztuczna-trawa"]
PLURAL = {"plytki-sportowe", "plyty-gumowe", "maty-gumowe-nawierzchnia"}


def chips(items):
    return '<ul class="chips" role="list">' + "".join(f'<li><a href="{u}">{t}</a></li>' for u, t in items) + "</ul>"


def faq_block(faq):
    return '<div class="faq">' + "".join(f"<details><summary>{html.escape(q)}</summary><p>{html.escape(a)}</p></details>" for q, a in faq) + "</div>"


def surf_from(slug):
    p = P[slug]
    if slug == "plyta-betonowa":
        return f"{BASE['rateNetPerM2']} zł/m²"
    key = SURF_KEY[slug][0]
    return f"{rng(key)} zł/m²"


def model_desc(slug):
    p, t = P[slug], TEXT[slug]
    s = p["show"]
    aid = MID[slug]
    facts = [s["dims"], f"konstrukcja od {zl(p['net'])} netto", f"z nawierzchnią od {zl(s['fullNet'])} netto"] + ([s["forWhom"]] if s["forWhom"] else [])
    body = f'<p class="lead">{html.escape(t["lead"])}</p><ul class="facts">' + "".join(f"<li>{html.escape(f)}</li>" for f in facts) + "</ul>"
    if slug in BUILT:
        body += "<h2>Zobacz na miejscu</h2><ul class=\"cards\" role=\"list\">" + "".join(
            f'<li><a href="{u}"><img src="{UP}{ph}" alt="{html.escape(ti)}" loading="lazy" decoding="async"><span><i>{k}</i><b>{ti}</b>{pl}</span></a></li>' for u, ph, k, ti, pl in BUILT[slug]) + "</ul>"
    name = p["name"]
    body += "<h2>Najczęstsze pytania</h2>" + faq_block(t["faq"])
    body += "<h2>Nawierzchnia pod to boisko</h2>" + chips([(f"/product/{x}/", f"{P[x]['name']}<small>{surf_from(x)}</small>") for x in MODEL_SURF] + [("/shop/#nawierzchnie", "Wszystkie nawierzchnie")])
    body += "<h2>Poradniki</h2>" + chips([GUIDES[g] for g in MODEL_GUIDES[slug]])
    studio = PRICE_M[aid]["link"]
    body += ('<h2>Następny krok</h2><ul class="next" role="list">'
             f'<li><a href="{studio}"><i>↗</i><b>Zaprojektuj w Studio 3D</b><span>Kolory, wzór i nawierzchnia. Cena liczy się na bieżąco.</span></a></li>'
             '<li><a href="/#planer"><i>→</i><b>Zmieści się?</b><span>Wpisz wymiary placu i sprawdź, czy model się zmieści.</span></a></li>'
             '<li><a href="/kontakt/"><i>→</i><b>Wyślij zdjęcia placu</b><span>Policzę montaż, transport i przygotowanie terenu.</span></a></li></ul>'
             '<p class="note">Ceny orientacyjne „od”, netto. Montaż, transport i przygotowanie terenu wyceniamy osobno. <a href="/realizacje-gamefields/">Zobacz realizacje Gamefields</a>.</p>')
    return body, t["faq"]


def surface_desc(slug):
    # A surface added later needs only data/studio-shop.json and offer/surface-finish.json (+ SURF in gfb_common.py);
    # without published questions it gets the standard four answers built from its price.
    p = P[slug]
    t = TEXT.get(slug) or {"faq": [("", f"{p['name']} od {p['net']} zł/m² netto. Kwota dotyczy 1 m². Dokładna cena zależy od wariantu i powierzchni projektu.")] + [tuple(x) for x in TEXT["sztuczna-trawa"]["faq"][1:]]}
    name = p["name"]
    if slug == "plyta-betonowa":
        lead = f"{name}: podstawa pod każde wykończenie, {BASE['rateNetPerM2']} zł/m² netto. Wykończenie sportowe wybierasz i wyceniasz osobno."
    else:
        note = SURF_KEY[slug][4]
        lead = f"{name}: {note}. Od {surf_from(slug).replace('–', ' do ')} netto, w zależności od wariantu. Kładziemy na płycie betonowej (osobna pozycja) albo na stabilnym, istniejącym placu."
    verb = "kosztują" if slug in PLURAL else "kosztuje"
    faq = [(f"Ile {verb} {name[0].lower() + name[1:] if slug not in ('akryl-hard-court',) else name}?", t["faq"][0][1])] + [tuple(x) for x in t["faq"][1:]]
    body = f'<p class="lead">{html.escape(lead)}</p>'
    body += "<h2>Najczęstsze pytania</h2>" + faq_block(faq)
    body += "<h2>Najczęściej na tych boiskach</h2>" + chips([(f"/product/{m}/", f"{P[m]['name']}<small>od {zl(P[m]['net'])}</small>") for m in SURF_MODELS.get(slug, ["panna-play", "panna-court", "street-arena-15"])] + [("/shop/", "Wszystkie boiska")])
    body += "<h2>Poradniki</h2>" + chips([GUIDES[g] for g in SURF_GUIDES.get(slug, ["naw", "orlik"])])
    body += ('<h2>Następny krok</h2><ul class="next" role="list">'
             '<li><a href="/studio/"><i>↗</i><b>Zobacz w Studio 3D</b><span>Zmień nawierzchnię na wybranym boisku i porównaj cenę.</span></a></li>'
             '<li><a href="/nawierzchnie-sportowe/"><i>→</i><b>Nawierzchnie sportowe</b><span>Wszystkie wykończenia, warianty i ceny za m².</span></a></li>'
             '<li><a href="/kontakt/"><i>→</i><b>Wyślij zdjęcia placu</b><span>Ocenię podłoże i zakres prac.</span></a></li></ul>'
             '<p class="note">Ceny orientacyjne za m² netto, liczone od powierzchni konstrukcji z 10% zapasem.</p>')
    return body, faq


for slug in P:
    body, faq = (model_desc if P[slug]["kind"] == "arena" else surface_desc)(slug)
    ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]}
    out = ("<!-- wp:html -->\n<style>\n" + CSS.strip() + "\n</style>\n<script type=\"application/ld+json\">" + json.dumps(ld, ensure_ascii=False, separators=(",", ":"))
           + "</script>\n<div class=\"gfpd\">\n" + body + "\n</div>\n<!-- /wp:html -->\n")
    if "&&" in out:
        raise SystemExit(f"{slug}: double ampersand would break in WordPress")
    (HERE / f"{slug}.html").write_text(out, encoding="utf-8")
    print(f"{slug}.html {len(out)} bytes")
