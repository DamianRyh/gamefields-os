#!/usr/bin/env python3
"""Knowledge base of gamefields.eu (16.11.2026): /baza-wiedzy/ and its five guides.

Output (next to this file), each one wp:html block, the whole content of the page:
  baza-wiedzy.html                            page 3717  /baza-wiedzy/
  ile-kosztuje-budowa-boiska-sportowego.html  page 3710
  budowa-boiska-krok-po-kroku.html            page 3711
  jak-wybrac-nawierzchnie-sportowa.html       page 3712
  renowacja-czy-budowa-nowego-boiska.html     page 3713
  wymiary-boiska-wielofunkcyjnego.html        page 3714
  preview.html                                local preview of all six (not deployed)

Same look as the other content pages (gfa-style.css). Content: everything the guides said on 16.11.2026 is kept,
and every guide now ties the general advice to Gamefields facts from the repository: prices from
integrations/wordpress/offer/*.json (sale prices, net), approved model cards (public/catalog/products.json), the
owner's statements on the homepage (12-month warranty and care, producers' documents, norms) and the Studio rule for
surface area (+10%, rounded up to 100 zł). Nothing else is claimed.
"""
import html
import json
import math
import pathlib
import re

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[3]
OFFER = HERE.parent.parent / "offer"
UP = "https://www.gamefields.eu/wp-content/uploads/"
SITE = "https://www.gamefields.eu/"
MOD = "https://cdn.jsdelivr.net/gh/DamianRyh/gamefields-os@dc298dede4689c700ad901e78628a1938fd941b0/integrations/wordpress/homepage/studio-2026-11/assets/modernizacja/"
UPDATED = "16.11.2026"
BASE_CSS = (HERE.parent / "gfa-style.css").read_text(encoding="utf-8").split("\n", 1)[1]

load = lambda n: json.loads((OFFER / n).read_text(encoding="utf-8"))
PRICE, BASE, FIN = load("price-from.json"), load("concrete-base.json"), load("surface-finish.json")
CAT = {p["code"]: p for p in json.loads((ROOT / "public" / "catalog" / "products.json").read_text(encoding="utf-8"))["products"]}
SLAB = {m["id"]: m for m in BASE["models"]}
PAINT = {m["id"]: m["net"]["plain"] for m in FIN["models"]}


def zl(n):
    return f"{n:,.0f}".replace(",", " ") + " zł"


def cost(area, rate):
    return math.ceil(round(area * rate, 2) / 100) * 100


MODELS = [m for m in PRICE["models"] if m["id"] in SLAB]
MOBILE = next(m for m in PRICE["models"] if m["id"] == "mobile")
CHEAPEST = min(MODELS, key=lambda m: m["constructionFromNet"])
PLAY = next(m for m in MODELS if m["id"] == "o1")
PLAY_SLAB, PLAY_PAINT = SLAB["o1"]["net"], PAINT["o1"]
SURF = [  # (name, key or None, image, short note)
    ("Malowanie farbą sportową", "paint", UP + "2026/11/malowanie-macro.webp", "na płycie albo starym placu"),
    ("Sztuczna trawa", "turf", UP + "2026/11/trawa-macro.webp", "klasyczna murawa"),
    ("Akryl Hard Court", "acrylic", UP + "2026/11/akryl-macro.webp", "jak na kortach"),
    ("Maty gumowe", "mats", UP + "2026/11/maty-gumowe-macro.webp", "ciągła guma, R11"),
    ("Nawierzchnia EPDM wylewana", "epdm", UP + "2026/11/granulat-macro.webp", "PN-EN 14877"),
    ("Płytki sportowe PP", "tiles", UP + "2026/11/plytki-macro.webp", "montaż bez klejenia"),
    ("Płyty gumowe", "rubber", UP + "2026/11/plyty-gumowe-macro.webp", "PN-EN 1177, atest PZH"),
]


def rates(key):
    vs = FIN["variants"] if key == "paint" else FIN[key]["variants"]
    return [v["netPerM2"] for v in vs]


def rng(key):
    v = rates(key)
    return f"{min(v)}–{max(v)} zł/m²"


EXTRA_CSS = """
.gfa-hero h1{font-size:clamp(48px,7.4vw,124px)}
.gfw-a .gfa-hero h1{font-size:clamp(42px,5.4vw,88px)}
.gfa-hero figure.bg img{background:transparent!important;object-fit:contain;padding:6%}
.gfa-hero figure.bg{display:block}
.gfa-faq{border-top:1px solid var(--line)}
.gfa-faq details{border-bottom:1px solid var(--line)}
.gfa-faq summary{display:flex;justify-content:space-between;gap:14px;list-style:none;cursor:pointer;padding:20px 4px;font-size:18px;font-weight:700}
.gfa-faq summary::-webkit-details-marker{display:none}
.gfa-faq summary::after{content:"+";font-size:24px;font-weight:400;color:var(--violet)}
.gfa-faq details[open] summary::after{content:"\2212"}
.gfa-faq details p{max-width:780px;margin:0;padding:0 4px 22px;font-size:16px;color:var(--muted)}
.gfw-crumbs{margin:0 0 18px;font-size:13px;color:var(--muted)}.gfw-crumbs a{text-decoration:none}
.gfw-meta{display:flex;flex-wrap:wrap;gap:8px;margin:20px 0 0;padding:0;list-style:none}
.gfw-meta li{display:inline-flex;align-items:center;min-height:32px;padding:0 12px;border-radius:999px;background:#fff;border:1px solid var(--line);font-size:13px;font-weight:600}
/* hub cards */
.gfw-cards{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px}
.gfw-cards li{grid-column:span 2}
.gfw-cards li:first-child{grid-column:span 4;grid-row:span 2}
.gfw-cards li:nth-child(2){grid-column:span 2}
.gfw-cards li:nth-child(n+4){grid-column:span 3}
.gfw-card{position:relative;display:flex;flex-direction:column;height:100%;background:#fff;border:1px solid var(--line);text-decoration:none;color:var(--ink);overflow:hidden;transition:border-color .2s ease,transform .25s ease}
.gfw-card:hover{border-color:var(--violet);transform:translateY(-3px)}
.gfw-card .ph{position:relative;aspect-ratio:16/10;overflow:hidden;background:var(--bg,#E6E0DA)}
.gfw-cards li:first-child .ph{aspect-ratio:auto;flex:1;min-height:320px}
.gfw-card .ph img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.2,.7,.2,1)}
.gfw-card .ph img.fit{object-fit:contain;padding:6%}
.gfw-card:hover .ph img{transform:scale(1.05)}
.gfw-card .num{position:absolute;top:12px;left:12px;padding:6px 10px;border-radius:999px;background:var(--lime);color:#1F2A6B;font-weight:800;font-size:13px}
.gfw-card .tx{display:grid;gap:6px;padding:18px 20px 20px}
.gfw-card .cat{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--violet)}
.gfw-card b{font-size:clamp(21px,1.8vw,28px);letter-spacing:-.03em;line-height:1.08}
.gfw-cards li:first-child .gfw-card b{font-size:clamp(28px,3vw,46px)}
.gfw-card p{margin:0;color:var(--muted);font-size:15px}
.gfw-card .key{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:6px;font-size:13px;font-weight:700}
.gfw-card .key span:first-child{color:var(--violet)}
/* numbers band */
.gfw-nums{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:0}
.gfw-nums div{padding:20px;border:1px solid rgba(244,241,238,.2)}
.gfw-nums dt{font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:rgba(244,241,238,.75)}
.gfw-nums dd{margin:8px 0 0;font-size:clamp(28px,3vw,44px);font-weight:800;letter-spacing:-.04em;line-height:1}
.gfw-nums dd small{display:block;margin-top:6px;font-size:14px;font-weight:500;letter-spacing:0;color:rgba(244,241,238,.78)}
/* tools */
.gfw-tools{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.gfw-tools a{display:grid;gap:6px;height:100%;padding:22px;background:#fff;border:1px solid var(--line);text-decoration:none;transition:border-color .2s ease}
.gfw-tools a:hover{border-color:var(--violet)}
.gfw-tools b{font-size:20px;letter-spacing:-.02em}.gfw-tools span{color:var(--muted);font-size:15px}
.gfw-tools i{font-style:normal;color:var(--violet);font-weight:800}
/* article */
.gfw-art{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,9fr);gap:clamp(24px,4vw,64px);align-items:start}
.gfw-toc{position:sticky;top:96px;display:grid;gap:4px;font-size:14px}
.gfw-toc p{margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.gfw-toc a{display:block;padding:7px 0 7px 12px;border-left:2px solid var(--line);text-decoration:none;color:var(--muted);line-height:1.3}
.gfw-toc a:hover{border-color:var(--violet);color:var(--ink)}
.gfw-body{max-width:820px}
.gfw-body > section{padding:0 0 clamp(28px,3vw,44px);scroll-margin-top:96px}
.gfw-body h2{font-size:clamp(32px,3.6vw,56px);font-weight:800;letter-spacing:-.045em;line-height:.95;margin:0 0 16px}
.gfw-body h3{font-size:21px;font-weight:800;letter-spacing:-.02em;margin:22px 0 8px}
.gfw-body p,.gfw-body li{font-size:17px;line-height:1.6;color:#5A4652}
.gfw-body p{margin:0 0 12px}
.gfw-body ul,.gfw-body ol{margin:0 0 12px;padding-left:22px;display:grid;gap:6px}
.gfw-body b{color:var(--ink)}
.gfw-short{margin:0 0 clamp(28px,3vw,44px);padding:22px 24px;background:#fff;border-left:5px solid var(--lime)}
.gfw-short p:last-child{margin:0}
.gfw-short .k{margin-bottom:8px}
.gfw-short p{font-size:19px;color:var(--ink);font-weight:600;line-height:1.45}
.gfw-gf{margin:18px 0 0;padding:20px 22px;background:var(--ink);color:var(--paper)}
.gfw-gf .k{color:var(--lime);margin-bottom:8px}
.gfw-gf p,.gfw-gf li{color:rgba(244,241,238,.88)}
.gfw-gf b{color:#fff}
.gfw-gf a{color:var(--lime)}
.gfw-rows{margin:0;border-top:1px solid var(--line)}
.gfw-rows div{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,8fr);gap:16px;padding:14px 0;border-bottom:1px solid var(--line)}
.gfw-rows dt{font-weight:800;color:var(--ink)}.gfw-rows dt span{display:block;color:var(--violet);font-size:13px;letter-spacing:.06em}
.gfw-rows dd{margin:0;color:#5A4652;font-size:16px;line-height:1.55}
.gfw-table{width:100%;border-collapse:collapse;margin:8px 0 12px;background:#fff;font-size:15px}
.gfw-table th{text-align:left;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);padding:12px 14px;border-bottom:1px solid var(--line)}
.gfw-table td{padding:12px 14px;border-top:1px solid var(--line);vertical-align:top;color:#5A4652}
.gfw-table td b{color:var(--ink)}
.gfw-table td.r,.gfw-table th.r{text-align:right;white-space:nowrap;font-weight:700;color:var(--ink)}
.gfw-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
.gfw-sw{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:12px 0}
.gfw-sw figure{margin:0;background:#fff}
.gfw-sw img{display:block;width:100%;aspect-ratio:1;object-fit:cover}
.gfw-sw figcaption{padding:8px 10px;font-size:13px;line-height:1.3;color:var(--muted)}.gfw-sw figcaption b{display:block;color:var(--ink);font-size:14px}
.gfw-ph{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:14px 0}
.gfw-ph img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;background:#E6E0DA}
.gfw-ph figcaption{grid-column:1/-1;font-size:14px;color:var(--muted)}
.gfw-steps{list-style:none;margin:0;padding:0!important;display:grid;gap:10px!important;counter-reset:s}
.gfw-steps li{display:grid;grid-template-columns:56px minmax(0,1fr);gap:16px;padding:18px;background:#fff;border:1px solid var(--line);counter-increment:s}
.gfw-steps li::before{content:counter(s,decimal-leading-zero);display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:#EEE8FF;color:var(--violet);font-weight:800}
.gfw-steps h3{margin:4px 0 6px;font-size:22px}
.gfw-steps p{margin:0 0 8px}
.gfw-steps .gf{display:block;margin-top:6px;padding:10px 12px;background:var(--paper);font-size:15px;color:var(--ink)}
.gfw-steps .gf::before{content:"W Gamefields: ";font-weight:800;color:var(--violet)}
.gfw-related{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.gfw-related .gfw-card .ph{aspect-ratio:16/9}
@media (max-width:1100px){.gfw-cards{grid-template-columns:repeat(2,minmax(0,1fr))}.gfw-cards li,.gfw-cards li:first-child,.gfw-cards li:nth-child(2){grid-column:span 1;grid-row:auto}.gfw-cards li:first-child{grid-column:1/-1}.gfw-cards li:first-child .ph{min-height:260px;flex:none;aspect-ratio:16/9}
 .gfw-nums,.gfw-tools{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:900px){.gfw-art{grid-template-columns:minmax(0,1fr)}.gfw-toc{position:static;grid-auto-flow:column;grid-auto-columns:max-content;overflow-x:auto;gap:6px;padding-bottom:4px}.gfw-toc p{display:none}
 .gfw-toc a{border:1.5px solid #CDBFC6;border-radius:999px;padding:8px 14px;white-space:nowrap}
 .gfw-related{grid-template-columns:minmax(0,1fr)}.gfw-sw{grid-template-columns:repeat(2,minmax(0,1fr))}.gfw-rows div{grid-template-columns:minmax(0,1fr);gap:4px}}
@media (max-width:560px){.gfw-cards{grid-template-columns:minmax(0,1fr)}.gfw-nums,.gfw-tools{grid-template-columns:minmax(0,1fr)}.gfw-steps li{grid-template-columns:minmax(0,1fr);gap:8px}
 .gfw-body p,.gfw-body li{font-size:16px}.gfw-short p{font-size:17px}}
"""

GUIDES = [  # slug, short title, category, teaser, image, image class, background, key facts
    ("ile-kosztuje-budowa-boiska-sportowego", "Ile kosztuje budowa boiska?", "Budżet",
     "Z czego składa się cena boiska i od jakich kwot zaczynają się konstrukcje i nawierzchnie Gamefields.",
     UP + "2026/11/gf-play-1200.webp", "fit", "#2457D6",
     [f"od {zl(MOBILE['constructionFromNet'])} netto", "8 modeli z cenami"]),
    ("budowa-boiska-krok-po-kroku", "Budowa boiska krok po kroku", "Proces",
     "Siedem etapów od analizy placu do pierwszego meczu, na przykładzie areny w Krakowie.",
     UP + "2026/11/Gamefields-x-Panna-Cage-x-Krakow-montaz-768x576.jpg", "", "", ["7 etapów", "od planu do parku"]),
    ("jak-wybrac-nawierzchnie-sportowa", "Jak wybrać nawierzchnię?", "Technologia",
     "Trawa, poliuretan, płytki, guma czy farba: jak porównywać systemy i ile kosztuje metr.",
     UP + "2026/11/granulat-macro.webp", "", "", [f"od {min(rates('paint'))} zł/m²", "8 nawierzchni"]),
    ("renowacja-czy-budowa-nowego-boiska", "Renowacja czy nowe boisko?", "Modernizacja",
     "Kiedy stary beton wystarczy odnowić, a kiedy trzeba budować od podstaw.",
     MOD + "pole-mokotowskie-po-720.webp", "", "", ["stary beton → nowe boisko", f"od {min(rates('paint'))} zł/m²"]),
    ("wymiary-boiska-wielofunkcyjnego", "Jak dobrać wielkość boiska?", "Wymiary",
     "Sporty, strefy bezpieczeństwa i metraż. Co zmieścić, gdy miejsca jest mało.",
     UP + "2026/11/gf-street15-1200.webp", "fit", "#1F2A6B", ["Orlik: min. 19 × 32 m", "areny od Ø ~5 m"]),
]
GUIDE = {g[0]: g for g in GUIDES}


def card(slug, big=False):
    s, title, cat, teaser, image, cls, bg, keys = GUIDE[slug]
    n = [g[0] for g in GUIDES].index(slug) + 1
    style = f' style="--bg:{bg}"' if bg else ""
    return (f'<a class="gfw-card" href="/{s}/"><span class="ph"{style}><img class="{cls}" src="{image}" alt="" loading="lazy" decoding="async">'
            f'<span class="num">{n:02d} · {cat}</span></span><span class="tx"><b>{title}</b><p>{teaser}</p>'
            f'<span class="key">' + "".join(f"<span>{html.escape(k)}</span>" for k in keys) + f'<span>[[READ:{s}]] min czytania</span></span></span></a>')


READ = {}


def read_time(slug):
    return READ.get(slug, 4)


def page(body, ld, css=EXTRA_CSS):
    return ("<!-- wp:html -->\n<style>\n" + BASE_CSS + css + "</style>\n<script type=\"application/ld+json\">" +
            json.dumps(ld, ensure_ascii=False, separators=(",", ":")) + "</script>\n" +
            '<div class="gfa">\n' + body.strip() + "\n</div>\n<!-- /wp:html -->\n")


CTA = """
<section class="gfa-cta"><div class="w">
  <h2 class="d">Od wiedzy<br>do projektu.</h2>
  <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Wyślij zdjęcia placu →</a><a class="gfa-btn alt" href="/studio/">Zaprojektuj w Studio 3D ↗</a></div>
</div></section>"""


def article(slug, title, lead, short, sections, related, faq=None):
    """sections: list of (id, heading, html)."""
    words = len(re.sub(r"<[^>]+>", " ", lead + short + "".join(s[2] for s in sections)).split())
    READ[slug] = max(3, round(words / 200))
    _, short_title, cat, _, image, cls, bg, _ = GUIDE[slug]
    toc = "".join(f'<a href="#{i}">{html.escape(h)}</a>' for i, h, _ in sections)
    body_secs = "".join(f'<section id="{i}"><h2>{h}</h2>{c}</section>' for i, h, c in sections)
    style = f' class="bg" style="background:{bg}"' if bg else ""
    hero_img = f'<img src="{image}" alt="" loading="eager" decoding="async">'
    body = f"""
<div class="gfw-a"><section class="gfa-hero"><div class="w">
  <div>
    <p class="gfw-crumbs"><a href="/baza-wiedzy/">Baza wiedzy</a> / {cat}</p>
    <p class="k">Poradnik inwestora · {cat}</p>
    <h1 class="d">{title}</h1>
    <p class="lead">{lead}</p>
    <ul class="gfw-meta"><li>{READ[slug]} min czytania</li><li>Aktualizacja {UPDATED}</li><li>Ceny netto ze Studia</li></ul>
  </div>
  <figure{style}>{hero_img}</figure>
</div></section>

<section class="gfa-sec"><div class="w gfw-art">
  <nav class="gfw-toc" aria-label="Spis treści"><p>W tym poradniku</p>{toc}</nav>
  <div class="gfw-body">
    <div class="gfw-short"><p class="k">Krótka odpowiedź</p>{short}</div>
    {body_secs}
  </div>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><h2 class="d">Czytaj dalej.</h2><p>Pozostałe poradniki z bazy wiedzy Gamefields.</p></div>
  <ul class="gfw-related" role="list">{"".join(f"<li>{card(r)}</li>" for r in related)}</ul>
  <ul class="gfa-links"><li><a href="/baza-wiedzy/">← Wszystkie poradniki</a></li></ul>
</div></section>
{CTA}</div>"""
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "Article", "headline": title, "description": re.sub(r"<[^>]+>", "", lead), "inLanguage": "pl-PL",
         "dateModified": "2026-11-16", "author": {"@type": "Person", "name": "Damian Gawrych", "url": SITE + "damian-gawrych/"},
         "publisher": {"@type": "Organization", "name": "Gamefields", "url": SITE}, "mainEntityOfPage": SITE + slug + "/"},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Gamefields", "item": SITE},
            {"@type": "ListItem", "position": 2, "name": "Baza wiedzy", "item": SITE + "baza-wiedzy/"},
            {"@type": "ListItem", "position": 3, "name": short_title, "item": SITE + slug + "/"}]}]}
    if faq:
        ld["@graph"].append({"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]})
    return page(body, ld)


def gf(inner):
    return f'<div class="gfw-gf"><p class="k">W Gamefields</p>{inner}</div>'


def price_table():
    rows = "".join(f'<tr><td><b>{html.escape(m["name"])}</b><br>{html.escape(CAT[m["code"]]["dimension_label"])} · {html.escape(m["code"])}</td>'
                   f'<td class="r">{zl(m["constructionFromNet"])}</td><td class="r">{zl(m["constructionFromNet"] + SLAB[m["id"]]["net"] + PAINT[m["id"]])}</td></tr>' for m in MODELS)
    return ('<div class="gfw-scroll"><table class="gfw-table"><thead><tr><th>Model</th><th class="r">Konstrukcja od</th><th class="r">Z nawierzchnią od</th></tr></thead>'
            f"<tbody>{rows}</tbody></table></div>")


def surf_table(area=None, label=None):
    head = '<th class="r">Za m² netto</th>' + (f'<th class="r">{label}</th>' if area else "")
    rows = f'<tr><td><b>Płyta betonowa 12 cm z podbudową</b><br>podstawa pod każde wykończenie</td><td class="r">{BASE["rateNetPerM2"]} zł</td>' + (f'<td class="r">{zl(cost(area, BASE["rateNetPerM2"]))}</td>' if area else "") + "</tr>"
    for name, key, _, note in SURF:
        rows += f'<tr><td><b>{name}</b><br>{note}</td><td class="r">{rng(key).replace(" zł/m²", " zł")}</td>' + (f'<td class="r">od {zl(cost(area, min(rates(key))))}</td>' if area else "") + "</tr>"
    return f'<div class="gfw-scroll"><table class="gfw-table"><thead><tr><th>Nawierzchnia</th>{head}</tr></thead><tbody>{rows}</tbody></table></div>'


# ---------------------------------------------------------------- 1. cost
ILE = article(
    "ile-kosztuje-budowa-boiska-sportowego", "Ile kosztuje budowa boiska sportowego?",
    "Koszt boiska zależy od powierzchni, podbudowy, nawierzchni, wyposażenia i infrastruktury wokół. Zamiast jednej ceny warto rozbić inwestycję na elementy, które naprawdę tworzą budżet. Poniżej także ceny Gamefields.",
    f"<p>Nie ma jednej ceny „za boisko”: dwa obiekty o podobnym metrażu mogą kosztować zupełnie inaczej, jeśli jeden powstaje na gotowej podbudowie, a drugi wymaga robót ziemnych, odwodnienia, ogrodzenia i oświetlenia. Punkt startowy w Gamefields: konstrukcja od {zl(CHEAPEST['constructionFromNet'])} netto ({CHEAPEST['name']}), całe boisko z płytą i malowaniem np. {PLAY['name']} od {zl(PLAY['constructionFromNet'] + PLAY_SLAB + PLAY_PAINT)} netto.</p>",
    [
        ("czynniki", "Co najbardziej wpływa na koszt boiska?",
         '<dl class="gfw-rows">'
         '<div><dt><span>01</span>Stan terenu</dt><dd>Największa różnica pojawia się między realizacją na gotowej, stabilnej powierzchni a inwestycją wymagającą korytowania, robót ziemnych i wykonania pełnej podbudowy.</dd></div>'
         '<div><dt><span>02</span>Powierzchnia</dt><dd>Metraż wpływa na ilość materiału i robocizny, ale nie wszystkie koszty rosną liniowo. Małe boisko nadal potrzebuje projektu, transportu i wyposażenia.</dd></div>'
         '<div><dt><span>03</span>Nawierzchnia</dt><dd>Sztuczna trawa, poliuretan, system modułowy i przygotowana nawierzchnia twarda mają inną konstrukcję, koszt wykonania i sposób utrzymania.</dd></div>'
         '<div><dt><span>04</span>Wyposażenie</dt><dd>Bramki, kosze, siatki, bandy, piłkochwyty, ogrodzenie, ławki czy oświetlenie mogą stanowić znaczącą część inwestycji.</dd></div>'
         '<div><dt><span>05</span>Logistyka</dt><dd>Transport, dostęp ciężkiego sprzętu, fundamenty oraz montaż zależą od lokalizacji i warunków na miejscu.</dd></div></dl>'),
        ("ceny-gamefields", "Ceny Gamefields: konstrukcja i całe boisko",
         "<p>Konstrukcja to bandy i bramki w podstawowej konfiguracji i standardowym kolorze. „Z nawierzchnią” dodaje płytę betonową 12 cm z podbudową i malowanie jednokolorowe, liczone od powierzchni konstrukcji z 10% zapasem.</p>"
         + price_table() +
         f"<p>Arena mobilna eventowa (wynajem i sprzedaż): od {zl(MOBILE['constructionFromNet'])} netto. Ceny orientacyjne „od”, netto; brutto z VAT 23%.</p>"
         + gf(f"<p><b>Przykład: {PLAY['name']}.</b> Konstrukcja {zl(PLAY['constructionFromNet'])} + płyta betonowa {zl(PLAY_SLAB)} + malowanie {zl(PLAY_PAINT)} = <b>{zl(PLAY['constructionFromNet'] + PLAY_SLAB + PLAY_PAINT)} netto</b> za {str(SLAB['o1']['areaM2']).replace('.', ',')} m² nawierzchni.</p>"
              "<p>Studio 3D liczy cenę na bieżąco dla wybranego modelu, kolorów i nawierzchni. <a href=\"/studio/\">Otwórz Studio →</a></p>")),
        ("nawierzchnie", "Ile kosztuje metr nawierzchni?",
         f"<p>Wykończenia kładziemy na płycie betonowej (osobna pozycja) albo na istniejącym, stabilnym placu. Ceny za m² netto, od wariantu Standard do Premium:</p>" + surf_table()
         + '<p><a href="/jak-wybrac-nawierzchnie-sportowa/">Jak wybrać nawierzchnię →</a></p>'),
        ("poza-cena", "Co zawiera cena, a co liczę osobno?",
         "<p>Płyta betonowa w Gamefields zawiera:</p><ul>" + "".join(f"<li>{x}</li>" for x in BASE["includes"]) + "</ul>"
         "<p>Osobno, po zdjęciach placu, liczymy:</p><ul>" + "".join(f"<li>{x}</li>" for x in BASE["excludes"] if "Konstrukcja" not in x and "Wykończenie" not in x)
         + "<li>Montaż i transport konstrukcji</li></ul>"),
        ("internet", "Dlaczego ceny z internetu bywają mylące?",
         "<p>Fraza „koszt budowy boiska” często zestawia zupełnie różne inwestycje. Sama warstwa nawierzchni to nie to samo co kompletne boisko. W zamówieniach publicznych z 2026 roku widać inwestycje wielofunkcyjne o wartościach liczonych w setkach tysięcy złotych, ale zakres obejmuje m.in. roboty ziemne, drenaż, nawierzchnię, ogrodzenia i małą architekturę. Takich kwot nie należy traktować jako cennika dla każdego projektu.</p>"),
        ("wycena", "Jak przygotować dane do wstępnej wyceny?",
         "<p>Do pierwszego budżetu potrzebujemy pięciu informacji: lokalizacji, przybliżonych wymiarów, zdjęć istniejącego terenu, sportów lub sposobu użytkowania oraz oczekiwanego zakresu. Jeśli nie znasz technologii nawierzchni, nie jest to problem: właśnie po to jest etap koncepcji.</p>"
         "<h3>Najtańszy wariant nie zawsze oznacza najniższy koszt inwestycji</h3><p>Warto patrzeć także na trwałość, możliwość naprawy, koszty utrzymania i przyszłą zmianę funkcji. Dobrze zaprojektowana podbudowa i logiczne wyposażenie potrafią ograniczyć późniejsze poprawki.</p>"
         + gf("<p>Wyślij zdjęcia placu i lokalizację, a policzę montaż, transport i przygotowanie terenu. Projekt i cenę zobaczysz najpierw w Studio 3D. Dla gmin i szkół przygotuję też dokumenty do wniosku o <a href=\"/dofinansowanie-boisk/\">dofinansowanie</a>.</p>")),
    ],
    ["jak-wybrac-nawierzchnie-sportowa", "budowa-boiska-krok-po-kroku", "renowacja-czy-budowa-nowego-boiska"],
    faq=[("Ile kosztuje boisko do panny?", f"Konstrukcje Gamefields kosztują od {zl(CHEAPEST['constructionFromNet'])} netto, a całe boisko z płytą betonową i malowaniem np. {PLAY['name']} od {zl(PLAY['constructionFromNet'] + PLAY_SLAB + PLAY_PAINT)} netto. Montaż, transport i przygotowanie terenu liczymy po zdjęciach placu."),
         ("Ile kosztuje metr nawierzchni boiska?", f"Płyta betonowa 12 cm z podbudową {BASE['rateNetPerM2']} zł/m² netto, wykończenia od {min(rates('paint'))} zł/m² (malowanie) do {max(rates('rubber'))} zł/m² (płyty gumowe Premium) netto.")])

# ---------------------------------------------------------------- 2. process
STEPS = [
    ("Analiza miejsca", "Na początku trzeba znać rzeczywiste wymiary, dostęp do działki, ukształtowanie terenu, istniejące nawierzchnie i otoczenie. Już na tym etapie można wyeliminować formaty, które są zbyt duże lub źle pasują do sąsiedztwa.",
     "zdjęcia placu i wymiary wystarczą na start; planer „Zmieści się?” na stronie głównej pokazuje, które modele pasują.", ""),
    ("Określenie użytkowników i sportów", "Inaczej planuje się obiekt szkolny, inaczej strefę osiedlową, a jeszcze inaczej boisko klubowe. Liczy się liczba użytkowników, ich wiek, intensywność gry oraz to, czy przestrzeń ma działać także poza treningami.",
     "osiem modeli od kameralnej areny 1 na 1 do boiska 3 na 3; dobieramy je do grupy użytkowników.", ""),
    ("Koncepcja i geometria", "W tej fazie powstaje układ boiska, stref bezpieczeństwa, komunikacji oraz lokalizacji wyposażenia. To najlepszy moment na porównanie kilku wariantów i decyzję, czy lepsze będzie jedno duże boisko, kilka mniejszych funkcji czy rozwiązanie wielofunkcyjne.",
     "koncepcja powstaje w Studio 3D, razem z ceną i kartą projektu PDF.", UP + "2026/11/Gamefields-x-boiska-x-Projekt-Krakow--768x768.jpg"),
    ("Podbudowa i odwodnienie", "To część, której użytkownik prawie nie widzi, a która w ogromnym stopniu decyduje o trwałości obiektu. Konstrukcja warstw musi odpowiadać warunkom gruntowym i wybranej nawierzchni. Woda powinna być odprowadzana w przewidywalny sposób.",
     f"płyta betonowa 12 cm (C20/25) ze spadkami i dylatacjami, na geowłókninie i podbudowie kruszywowej, z siatką zbrojeniową: {BASE['rateNetPerM2']} zł/m² netto.", ""),
    ("Nawierzchnia sportowa", "Wybór nawierzchni powinien wynikać z dominującej dyscypliny, intensywności użytkowania i sposobu utrzymania. Nie warto wybierać jej wyłącznie na podstawie ceny za metr kwadratowy.",
     f"osiem nawierzchni, od malowania ({min(rates('paint'))} zł/m²) po płyty gumowe z atestem PZH; wybierasz je w Studio.", UP + "2026/11/granulat-macro.webp"),
    ("Wyposażenie i infrastruktura", "Bramki, kosze, słupki, bandy, ogrodzenia, piłkochwyty i oświetlenie wymagają odpowiednich fundamentów i zachowania stref bezpieczeństwa. Ich rozmieszczenie powinno być ustalone przed wykonaniem końcowych warstw.",
     "konstrukcja areny z bandami i bramkami to jeden system modułowy, montowany na płycie.", UP + "2026/11/Gamefields-x-Panna-Cage-x-Krakow-montaz-768x576.jpg"),
    ("Linie, design i odbiór", "Na koniec pojawiają się oznaczenia sportowe, kolorystyka oraz elementy identyfikacji. Przed oddaniem obiektu należy sprawdzić wykonanie, stabilność wyposażenia i zgodność z projektem.",
     "rok gwarancji i stała opieka nad renowacją po odbiorze; karty techniczne i certyfikaty producentów do dokumentacji.", UP + "2026/11/Krakow-Panna-Arena-Octa-Cage-90-Gamefields-768x768.jpg"),
]
steps_html = '<ol class="gfw-steps">' + "".join(
    f'<li><div><h3>{t}</h3><p>{d}</p>' + (f'<div class="gfw-ph" style="grid-template-columns:minmax(0,1fr)"><img src="{im}" alt="{t}, Kraków" loading="lazy" decoding="async"></div>' if im else "")
    + f'<span class="gf">{g}</span></div></li>' for t, d, g, im in STEPS) + "</ol>"
KROK = article(
    "budowa-boiska-krok-po-kroku", "Budowa boiska krok po kroku",
    "Budowa boiska to kolejność decyzji: od analizy terenu, przez projekt, podbudowę i nawierzchnię, po wyposażenie, linie i odbiór. Przy każdym etapie piszę, jak wygląda to w Gamefields.",
    "<p>Najpierw miejsce i użytkownicy, potem koncepcja, a dopiero na końcu nawierzchnia i kolory. W Gamefields koncepcję i cenę widzisz w Studio 3D, zanim cokolwiek podpiszemy.</p>",
    [("etapy", "Siedem etapów", steps_html),
     ("krakow", "Przykład: Kraków, od planu do parku",
      f'<figure class="gfw-ph"><img src="{UP}2026/11/Gamefields-x-boiska-x-Projekt-Krakow--768x768.jpg" alt="Plan zagospodarowania z arenami Gamefields, Kraków" loading="lazy">'
      f'<img src="{UP}2026/11/Krakow-Panna-Arena-Octa-Cage-90-Gamefields-768x768.jpg" alt="Panna Octa Cage 90 w parku, Kraków" loading="lazy">'
      "<figcaption>Panna Octa Cage 90 na terenie miejskim: projekt na planie i gotowa arena w parku.</figcaption></figure>"
      '<p><a href="/realizacje-dla-miast/">Więcej realizacji dla miast →</a></p>'),
     ("start", "Masz lokalizację? To wystarczy, żeby zacząć.",
      "<p>Nie musisz mieć gotowej dokumentacji. Pokaż miejsce, a przełożę je na kolejność decyzji i możliwy zakres inwestycji.</p>"
      + gf('<p>Wyślij zdjęcia placu i lokalizację. Odpowiadam osobiście, a koncepcję możesz od razu zacząć w <a href="/studio/">Studio 3D</a>.</p>'))],
    ["ile-kosztuje-budowa-boiska-sportowego", "jak-wybrac-nawierzchnie-sportowa", "wymiary-boiska-wielofunkcyjnego"])

# ---------------------------------------------------------------- 3. surfaces
sw = '<div class="gfw-sw">' + "".join(
    f'<figure><img src="{im}" alt="{n}" loading="lazy" decoding="async"><figcaption><b>{n}</b>od {min(rates(k))} zł/m²</figcaption></figure>' for n, k, im, _ in SURF[:4]) + "</div>"
sw2 = '<div class="gfw-sw">' + "".join(
    f'<figure><img src="{im}" alt="{n}" loading="lazy" decoding="async"><figcaption><b>{n}</b>od {min(rates(k))} zł/m²</figcaption></figure>' for n, k, im, _ in SURF[4:]) + \
    f'<figure><img src="{UP}2026/11/beton-macro.webp" alt="Płyta betonowa" loading="lazy" decoding="async"><figcaption><b>Płyta betonowa</b>{BASE["rateNetPerM2"]} zł/m²</figcaption></figure></div>'
epdm_rows = "".join(f"<li><b>{v['name']}:</b> {v['description']} {v['netPerM2']} zł/m² netto.</li>" for v in FIN["epdm"]["variants"])
NAW = article(
    "jak-wybrac-nawierzchnie-sportowa", "Jak wybrać nawierzchnię sportową na boisko?",
    "Porównujemy sztuczną trawę, poliuretan, systemy modułowe, gumę, beton i farbę sportową: zastosowania, kryteria wyboru i ceny za m² w Gamefields.",
    "<p>Nawierzchnia powinna wynikać z dyscypliny, intensywności użytkowania, podłoża i sposobu utrzymania, a nie z samej ceny za metr. W Gamefields każde wykończenie leży na płycie betonowej albo na stabilnym, istniejącym placu.</p>",
    [("systemy", "Systemy nawierzchni",
      "<h3>Sztuczna trawa</h3><p>Naturalny kierunek dla wielu boisk piłkarskich. Pozwala stworzyć przewidywalną powierzchnię gry i dobrze współpracuje z większymi obiektami. Kluczowe są parametry systemu, prawidłowa podbudowa, odwodnienie oraz sposób wypełnienia.</p>"
      "<h3>Nawierzchnie poliuretanowe (EPDM)</h3><p>Często stosowane na boiskach wielofunkcyjnych, szkolnych i obiektach do koszykówki lub siatkówki. Pozwalają wykonywać kolorowe strefy i oznaczenia dla kilku dyscyplin. Konstrukcja całego systemu powinna być dobrana do podłoża oraz wymaganej przepuszczalności.</p>"
      f"<ul>{epdm_rows}</ul>"
      "<h3>Nawierzchnie modułowe</h3><p>Systemy z prefabrykowanych modułów mogą być dobrym rozwiązaniem tam, gdzie liczy się szybki montaż, możliwość punktowej wymiany elementów i intensywne użytkowanie. Ich zastosowanie powinno uwzględniać bazową powierzchnię oraz konkretne sporty.</p>"
      "<h3>Guma: płyty i maty</h3><p>Stabilizowane płyty gumowe (PN-EN 1177, atest PZH, antypoślizg R11) i ciągłe maty gumowe dobrze amortyzują i są wodoprzepuszczalne w wersji płyt. Sprawdzają się tam, gdzie liczy się bezpieczeństwo upadku.</p>"
      "<h3>Beton, asfalt i farba sportowa</h3><p>Istniejące twarde powierzchnie nie zawsze trzeba usuwać. Jeśli są stabilne i odpowiednio równe, mogą zostać poddane renowacji, malowaniu albo wykorzystane jako baza pod wybrany system. Najpierw trzeba jednak ocenić pęknięcia, ubytki i odwodnienie.</p>"),
     ("ceny", "Osiem nawierzchni Gamefields i ich ceny", sw + sw2 + surf_table(SLAB["o1"]["areaM2"], "Panna Play") +
      f"<p>Ostatnia kolumna: koszt dla {str(SLAB['o1']['areaM2']).replace('.', ',')} m² (Panna Play z 10% zapasem), najtańszy wariant, zaokrąglony w górę do 100 zł.</p>"),
     ("kryteria", "Jak porównywać rozwiązania?",
      '<dl class="gfw-rows"><div><dt>Dyscyplina</dt><dd>Sprawdź, jakie ruchy i obciążenia dominują na obiekcie.</dd></div>'
      '<div><dt>Użytkownicy</dt><dd>Szkoła i ogólnodostępne boisko mają zwykle większą intensywność niż prywatny obiekt.</dd></div>'
      '<div><dt>Podłoże</dt><dd>Stan istniejącej konstrukcji może zdecydować, czy potrzebna jest pełna przebudowa.</dd></div>'
      '<div><dt>Utrzymanie</dt><dd>Porównuj nie tylko koszt wykonania, ale też czyszczenie, serwis i łatwość napraw.</dd></div>'
      '<div><dt>Design</dt><dd>Jeżeli istotna jest kolorystyka i branding, uwzględnij to już przy wyborze technologii.</dd></div></dl>'),
     ("studio", "Nie wybieraj nawierzchni w oderwaniu od całego boiska",
      "<p>Zacznij od sportu i miejsca. Nawierzchnia powinna być konsekwencją funkcji, a nie przypadkowym pierwszym wyborem.</p>"
      + gf('<p>W <a href="/studio/">Studio 3D</a> zmieniasz nawierzchnię na wybranym boisku i od razu widzisz wygląd i cenę. Wszystkie nawierzchnie z cenami są też w <a href="/shop/#nawierzchnie">sklepie</a>.</p>'))],
    ["ile-kosztuje-budowa-boiska-sportowego", "renowacja-czy-budowa-nowego-boiska", "wymiary-boiska-wielofunkcyjnego"])

# ---------------------------------------------------------------- 4. renovation
paint_rows = "".join(f"<li><b>{v['name']}</b>: {FIN['descriptions'].get(v['id'], '')} {v['netPerM2']} zł/m² netto.</li>" for v in FIN["variants"])
REN = article(
    "renowacja-czy-budowa-nowego-boiska", "Renowacja czy budowa nowego boiska?",
    "Kiedy warto odnowić stare boisko, a kiedy zbudować nowe? Sprawdź stan podbudowy, odwodnienie, nawierzchnię, wyposażenie i planowaną funkcję. Na końcu: jak zamieniam stary beton w kolorowe boisko.",
    f"<p>Jeśli podłoże jest stabilne, a problemy dotyczą głównie nawierzchni, linii i wyposażenia, renowacja zwykle wystarczy. W Gamefields malowanie starego placu farbą sportową zaczyna się od {min(rates('paint'))} zł/m² netto.</p>",
    [("renowacja", "Kiedy renowacja ma sens?",
      "<ul><li>podłoże nie ma rozległych zapadnięć i pracujących pęknięć,</li><li>odwodnienie działa lub można je poprawić bez pełnej rozbiórki,</li>"
      "<li>wymiary i lokalizacja nadal odpowiadają użytkownikom,</li><li>większość problemów dotyczy nawierzchni, linii i wyposażenia,</li><li>nowa funkcja może wykorzystać istniejącą geometrię.</li></ul>"),
     ("nowe", "Kiedy rozważyć budowę od nowa?",
      "<ul><li>podbudowa jest niestabilna i powoduje trwałe deformacje,</li><li>obiekt ma poważne problemy z wodą,</li><li>istniejące wymiary nie pozwalają zrealizować potrzebnych funkcji,</li>"
      "<li>konieczna jest całkowita zmiana nawierzchni wraz z konstrukcją pod nią,</li><li>planowana infrastruktura wymaga nowych fundamentów i przebudowy terenu.</li></ul>"
      f"<p>Wtedy w Gamefields zaczynamy od płyty betonowej 12 cm z podbudową ({BASE['rateNetPerM2']} zł/m² netto), na której kładziemy wybraną nawierzchnię.</p>"),
     ("posrednio", "Najlepszy scenariusz często jest pośredni",
      "<p>Modernizacja nie musi oznaczać wyłącznie malowania starego boiska. Można zachować część konstrukcji, przebudować lokalnie podłoże, wykonać nową warstwę użytkową, dodać wyposażenie i całkowicie zmienić charakter wizualny przestrzeni. Taki zakres powinien wynikać z oględzin, a nie z założenia z góry.</p>"),
     ("stary-beton", "Stary beton, nowe boisko",
      f'<figure class="gfw-ph"><img src="{MOD}pole-mokotowskie-przed-720.webp" alt="Przed: szary betonowy plac do koszykówki, Pole Mokotowskie" loading="lazy">'
      f'<img src="{MOD}pole-mokotowskie-po-720.webp" alt="Koncepcja po modernizacji, Pole Mokotowskie" loading="lazy">'
      "<figcaption>Pole Mokotowskie, Warszawa: plac do koszykówki (Google Street View, 2017) i koncepcja Organic Flow. Wizualizacja, nie realizacja.</figcaption></figure>"
      '<ol class="gfw-steps"><li><div><h3>Ocena placu</h3><p>Ze zdjęć i wymiarów sprawdzam pęknięcia, spadki, odwodnienie i stan betonu. Mówię wprost, czy wystarczy malowanie, czy trzeba naprawić podłoże.</p></div></li>'
      '<li><div><h3>Naprawa i grunt</h3><p>Mycie, szlifowanie, wypełnienie rys i ubytków, grunt do betonu i warstwa wyrównująca. Od tego zależy trwałość koloru.</p></div></li>'
      '<li><div><h3>Farby z gumą</h3><p>Elastyczna powłoka sportowa z granulatem gumowym: amortyzuje krok, nie ślizga się i przykrywa drobne rysy. Na wyższe wymagania natrysk poliuretanowy z EPDM.</p></div></li>'
      '<li><div><h3>Wzór i linie</h3><p>Wzór Signature albo Twój projekt ze Studio 3D. Linie do piłki, koszykówki, 3 na 3 albo kilku gier naraz.</p></div></li></ol>'
      f"<h3>Ceny malowania</h3><ul>{paint_rows}</ul>"
      "<p>Farby sportowe kładziemy na suchy beton przy dodatniej temperaturze, zwykle od wiosny do jesieni. Naprawy podłoża wyceniam po oględzinach.</p>"),
     ("zdjecia", "Co warto sfotografować przed konsultacją?",
      "<p>Całą powierzchnię, miejsca z pęknięciami i ubytkami, krawędzie, odpływy, miejsca zalegania wody, fundamenty urządzeń oraz obecne wyposażenie. Przydatne są też wymiary i lokalizacja obiektu.</p>"
      + gf('<p>Wyślij stare boisko zamiast od razu planować jego rozbiórkę. Na podstawie zdjęć, wymiarów i planowanej funkcji wstępnie ocenię, czy warto iść w renowację, modernizację czy nową konstrukcję. Zobacz też <a href="/malowanie-boisk/">malowanie boisk</a> i <a href="/renowacja-boisk/">renowację boisk</a>.</p>'))],
    ["jak-wybrac-nawierzchnie-sportowa", "ile-kosztuje-budowa-boiska-sportowego", "budowa-boiska-krok-po-kroku"])

# ---------------------------------------------------------------- 5. sizes
size_rows = "".join(f'<tr><td><b>{html.escape(m["name"])}</b><br>{html.escape(CAT[m["code"]]["shape_label"])}, bandy {html.escape(CAT[m["code"]]["height_label"])}</td>'
                    f'<td>{html.escape(CAT[m["code"]]["dimension_label"])}</td><td class="r">{str(SLAB[m["id"]]["areaM2"]).replace(".", ",")} m²</td></tr>'
                    for m in sorted(MODELS, key=lambda m: SLAB[m["id"]]["areaM2"]))
WYM = article(
    "wymiary-boiska-wielofunkcyjnego", "Wymiary boiska wielofunkcyjnego",
    "Jak dobrać wymiary boiska do sportów i miejsca? Wyjaśniam geometrię, strefy bezpieczeństwa, przykład programu Orlik i formaty Gamefields na mały metraż.",
    "<p>Zacznij od dyscypliny głównej i dostępnego metrażu, pamiętając o strefach poza liniami. Gdy miejsca jest mało, nie rezygnuj ze sportu: arena 1 na 1 albo boisko 3 na 3 to osobny format, a nie pomniejszone duże boisko.</p>",
    [("scenariusze", "Różne miejsca, różna geometria",
      "<p>Boisko przy szkole może potrzebować koszykówki, siatkówki i piłki ręcznej. Na osiedlu priorytetem może być basketball 3×3 oraz mała piłka nożna. W parku ważniejsza może być otwarta rekreacja. Każdy z tych scenariuszy prowadzi do innej geometrii.</p>"),
     ("dyscyplina", "Zacznij od dyscypliny głównej",
      "<p>Najbardziej czytelny projekt ma wyraźny priorytet. Pozostałe sporty powinny być wpisane w układ tak, żeby ich linie i wyposażenie nie niszczyły funkcji podstawowej. To szczególnie ważne przy wielu kolorach oznaczeń.</p>"),
     ("strefy", "Nie zapominaj o strefach poza liniami",
      "<p>Samo pole gry nie jest całym obiektem. Trzeba uwzględnić strefy bezpieczeństwa, fundamenty wyposażenia, ogrodzenie, dojścia, ewentualne ławki oraz przestrzeń potrzebną do serwisu.</p>"),
     ("orlik", "Przykład z programu Orlik 2026",
      '<p>W aktualnej edycji programu budowy kompleksów sportowych Orlik 2026 Ministerstwo Sportu i Turystyki wskazuje boisko wielofunkcyjne o minimalnych wymiarach 19 × 32 m oraz nawierzchni poliuretanowej. Jest to ważny punkt odniesienia dla inwestycji realizowanych w tym programie, ale prywatne, szkolne lub osiedlowe projekty mogą mieć inne założenia. <a href="https://www.gov.pl/web/sport/program-budowy-nowych-orlikow-trwa-nabor-wnioskow">Źródło: gov.pl</a></p>'
      '<p>O naborach na 2027 rok i źródłach finansowania piszę na stronie <a href="/dofinansowanie-boisk/">dofinansowanie boisk</a>.</p>'),
     ("maly-metraz", "Co jeśli miejsca jest mniej?",
      "<p>Nie zawsze trzeba rezygnować ze sportu. Można zmniejszyć liczbę funkcji, przejść na format 3×3, half court, 1v1 albo stworzyć specjalnie zaprojektowaną strefę aktywności. W Gamefields traktujemy mały metraż jako osobny problem projektowy, a nie „pomniejszoną wersję” dużego boiska.</p>"
      "<h3>Formaty Gamefields od najmniejszego</h3>"
      f'<div class="gfw-scroll"><table class="gfw-table"><thead><tr><th>Model</th><th>Wymiary</th><th class="r">Nawierzchnia</th></tr></thead><tbody>{size_rows}</tbody></table></div>'
      "<p>Kolumna „Nawierzchnia”: powierzchnia konstrukcji z 10% zapasem, czyli metraż płyty i wykończenia.</p>"
      + gf('<p>Wpisz wymiary placu w planerze <a href="/#planer">„Zmieści się?”</a>: od razu zobaczysz, które modele się mieszczą razem ze strefą bezpieczeństwa. Potem zaprojektuj wybrany model w <a href="/studio/">Studio 3D</a>.</p>'))],
    ["budowa-boiska-krok-po-kroku", "ile-kosztuje-budowa-boiska-sportowego", "jak-wybrac-nawierzchnie-sportowa"])

# ---------------------------------------------------------------- hub
FAQ = [
    ("Ile kosztuje boisko do panny?", f"Konstrukcje od {zl(CHEAPEST['constructionFromNet'])} netto, całe boisko z płytą i malowaniem np. {PLAY['name']} od {zl(PLAY['constructionFromNet'] + PLAY_SLAB + PLAY_PAINT)} netto. Montaż, transport i przygotowanie terenu liczę po zdjęciach placu."),
    ("Czy da się zrobić boisko na starym betonie?", "Zwykle tak. Jeśli beton jest stabilny, naprawiam rysy i ubytki, gruntuję podłoże i kładę elastyczną farbę sportową z granulatem gumowym, a na niej wzór i linie. Gdy podłoże jest poważnie uszkodzone, najpierw trzeba je przebudować."),
    ("Ile miejsca potrzebuję?", "To zależy od konstrukcji i strefy bezpieczeństwa. Najmniejsze areny mają około 5 m średnicy, boisko 3 na 3 ma 15 × 10 m. Wpisz wymiary placu w planerze „Zmieści się?”."),
    ("Jaka jest gwarancja?", "Rok gwarancji i stała opieka nad renowacją po odbiorze. Karty techniczne i certyfikaty producentów dołączam do oferty i dokumentacji."),
    ("Czy pomagacie w dofinansowaniu?", "Tak. Przygotuję część techniczną wniosku: koncepcję, wizualizację, opis i cenę orientacyjną do kosztorysu."),
]
hub_body = f"""
<section class="gfa-hero"><div class="w">
  <div>
    <p class="k">Baza wiedzy</p>
    <h1 class="d">Zanim powstanie boisko.</h1>
    <p class="lead">Pięć krótkich poradników dla inwestorów: koszt, proces, nawierzchnie, wymiary i decyzja między renowacją a nową budową. Bez katalogowego żargonu, z cenami ze Studia.</p>
    <ul class="gfa-links"><li><a href="#poradniki">Poradniki</a></li><li><a href="#liczby">Liczby</a></li><li><a href="#pytania">Szybkie odpowiedzi</a></li><li><a href="#narzedzia">Narzędzia</a></li></ul>
  </div>
  <figure><img src="{UP}2026/11/Krakow-Panna-Arena-Octa-Cage-90-Gamefields-768x768.jpg" alt="Panna Octa Cage 90 w parku, Kraków" loading="eager" decoding="async"><figcaption><b>Panna Octa Cage 90</b>Kraków, teren miejski</figcaption></figure>
</div></section>

<section class="gfa-sec" id="poradniki"><div class="w">
  <div class="gfa-head"><h2 class="d">Zacznij od pytania.</h2><p>Każdy poradnik ma krótką odpowiedź na górze, a pod nią szczegóły i konkretne liczby z oferty Gamefields.</p></div>
  <ul class="gfw-cards" role="list">{"".join(f"<li>{card(g[0])}</li>" for g in GUIDES)}</ul>
</div></section>

<section class="gfa-band" id="liczby"><div class="w">
  <div class="gfa-head"><div><p class="k">Liczby, które warto znać</p><h2 class="d">Punkt startowy budżetu.</h2></div><p>Ceny orientacyjne „od”, netto, te same co w Studio 3D i w sklepie. Montaż i transport liczę po zdjęciach placu.</p></div>
  <dl class="gfw-nums">
    <div><dt>Konstrukcja</dt><dd>od {zl(CHEAPEST['constructionFromNet'])}<small>{CHEAPEST['name']}, bandy i bramki</small></dd></div>
    <div><dt>Całe boisko</dt><dd>od {zl(PLAY['constructionFromNet'] + PLAY_SLAB + PLAY_PAINT)}<small>{PLAY['name']} z płytą i malowaniem</small></dd></div>
    <div><dt>Płyta betonowa</dt><dd>{BASE['rateNetPerM2']} zł/m²<small>12 cm z podbudową, metraż +10%</small></dd></div>
    <div><dt>Gwarancja</dt><dd>12 miesięcy<small>i stała opieka nad renowacją</small></dd></div>
  </dl>
</div></section>

<section class="gfa-sec" id="pytania"><div class="w">
  <div class="gfa-head"><h2 class="d">Szybkie odpowiedzi.</h2><p>Najczęstsze pytania przed pierwszą rozmową.</p></div>
  <div class="gfa-faq">{"".join(f"<details><summary>{html.escape(q)}</summary><p>{html.escape(a)}</p></details>" for q, a in FAQ)}</div>
</div></section>

<section class="gfa-sec" id="narzedzia"><div class="w">
  <div class="gfa-head"><h2 class="d">Od czytania do działania.</h2><p>Narzędzia, które skracają drogę od pomysłu do wyceny.</p></div>
  <ul class="gfw-tools" role="list">
    <li><a href="/studio/"><i>↗</i><b>Studio 3D</b><span>Zaprojektuj boisko, kolory i nawierzchnię. Cena liczy się na bieżąco.</span></a></li>
    <li><a href="/#planer"><i>→</i><b>Zmieści się?</b><span>Wpisz wymiary placu i zobacz, które modele pasują.</span></a></li>
    <li><a href="/shop/"><i>→</i><b>Ceny w sklepie</b><span>8 boisk i 8 nawierzchni z cenami netto i brutto.</span></a></li>
    <li><a href="/dofinansowanie-boisk/"><i>→</i><b>Dofinansowanie</b><span>Nabory, źródła finansowania i dokumenty do wniosku.</span></a></li>
  </ul>
</div></section>
{CTA}"""
hub_ld = {"@context": "https://schema.org", "@graph": [
    {"@type": "CollectionPage", "name": "Baza wiedzy Gamefields", "url": SITE + "baza-wiedzy/", "inLanguage": "pl-PL",
     "hasPart": [{"@type": "Article", "headline": g[1], "url": SITE + g[0] + "/"} for g in GUIDES]},
    {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]}]}
HUB = page(hub_body, hub_ld)

OUT = {"baza-wiedzy": HUB, "ile-kosztuje-budowa-boiska-sportowego": ILE, "budowa-boiska-krok-po-kroku": KROK,
       "jak-wybrac-nawierzchnie-sportowa": NAW, "renowacja-czy-budowa-nowego-boiska": REN, "wymiary-boiska-wielofunkcyjnego": WYM}
OUT = {k: re.sub(r"\[\[READ:([a-z-]+)\]\]", lambda m: str(READ[m.group(1)]), v) for k, v in OUT.items()}
for name, content in OUT.items():
    if "[[READ:" in content:
        raise SystemExit(f"{name}: unresolved reading time")
    if "&&" in content:
        raise SystemExit(f"{name}: double ampersand would break in WordPress")
    (HERE / f"{name}.html").write_text(content, encoding="utf-8")
    print(f"{name}.html {len(content)} bytes")
prev = "".join(f'<h2 style="font:700 14px Arial;margin:0;padding:10px;background:#ff0">{n}</h2>' + c.replace("<!-- wp:html -->", "").replace("<!-- /wp:html -->", "") for n, c in OUT.items())
(HERE / "preview.html").write_text('<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Baza wiedzy, podgląd</title></head><body style="margin:0">' + prev + "</body></html>", encoding="utf-8")
