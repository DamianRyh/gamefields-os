#!/usr/bin/env python3
"""/boiska-street-football/ (page 3465), rebuilt 23.11.2026 in the .gfb style. Footer link: "Boiska panna i street football".

Output: boiska-street-football.html (one wp:html block, the whole content of the page).

The eight constructions with prices (the old page said "Wycena jest indywidualna"): a filter by shape, height and
space, model cards with renders, specs, construction and with-surface prices, links to the shop, Studio and the 3D
viewer (/os/), a comparison table, what the price includes, the models in use (realizations), panna and street
football in short, FAQ. Specs from public/catalog/products.json, prices from offer/*.json, realizations as on the
Realizacje page, space ranges as on the old page.
"""
import html
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from gfb_common import (BASE, GFB_CSS, MOBILE, MODELS, PAINT, PRICE, SITE, SLAB, SLUG, UP, VAT, img, jump_html, faq_html, write, zl)  # noqa: E402

URL = SITE + "boiska-street-football/"
ROOT = HERE.parents[3]
CAT = {p["id"]: p for p in json.loads((ROOT / "public" / "catalog" / "products.json").read_text(encoding="utf-8"))["products"]}
RENDER = {"o1": "gf-play", "p1": "gf-court", "circle-cage-1": "gf-cage90", "circle-cage-2": "gf-cage180", "octagon": "gf-octa",
          "street-field": "gf-grid", "w1": "gf-ring", "street15": "gf-street15"}
OS = {"o1": "kids"}  # the 3D viewer module id of Panna Play
SHAPE = {"Okrąg": "okrag", "Prostokąt": "prostokat", "Oktagon": "oktagon"}
HEIGHT_M = {"w1": 1.0, "o1": 1.52, "p1": 1.22, "street15": 1.0, "circle-cage-1": 0.9, "circle-cage-2": 1.8, "street-field": 1.09, "octagon": 1.22}
FORMAT = {"street15": "3 na 3"}
REAL = {"w1": ("taras", "Taras pod Pałacem Kultury i Orlik w Grodzisku: 10 lat bez uszkodzeń"), "octagon": ("kutno", "Kutno, pasaż sportowy"),
        "circle-cage-1": ("krakow", "Kraków, park miejski"), "circle-cage-2": ("wake", "Wake For Friends, Grodzisk Mazowiecki")}
ORDER = [m["id"] for m in MODELS]


def full(mid):
    return PRICE_BY[mid]["constructionFromNet"] + SLAB[mid]["net"] + PAINT[mid]


PRICE_BY = {m["id"]: m for m in PRICE["models"]}

CSS = GFB_CSS + """
.gfb-hero figure.render{margin:0;background:#2457D6;overflow:hidden}
.gfb-hero figure.render img{display:block;width:100%;aspect-ratio:16/10;object-fit:cover}
.gfb-table a.nm{display:inline;min-height:0;padding:0;border:0;border-radius:0;font-size:inherit;color:inherit;text-decoration:underline;text-decoration-color:#CDBFC6;text-underline-offset:3px}
/* filter */
.gfb-filter{display:flex;flex-wrap:wrap;gap:10px 22px;align-items:center;margin:0 0 16px;padding:14px 16px;background:#fff;border:1px solid var(--line)}
.gfb-filter .grp{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
.gfb-filter .lb{margin-right:4px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.gfb-filter button{min-height:40px;padding:0 14px;border-radius:999px;border:1.5px solid #CDBFC6;background:#fff;color:var(--ink);font:inherit;font-size:14px;font-weight:700;cursor:pointer}
.gfb-filter button[aria-pressed=true]{border-color:var(--violet);background:#EEE8FF}
.gfb-filter .cnt{margin-left:auto;font-weight:800;font-size:14px}
/* model cards */
.gfb-models{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.gfb-models > li[hidden]{display:none}
.gfb-models article{display:flex;flex-direction:column;height:100%;background:#fff;border:1px solid var(--line);overflow:hidden;scroll-margin-top:120px}
.gfb-models .ph{position:relative;background:var(--bg,#E6E0DA);overflow:hidden}
.gfb-models .ph img{display:block;width:100%;aspect-ratio:16/10;object-fit:cover;transition:transform .8s cubic-bezier(.2,.7,.2,1)}
.gfb-models article:hover .ph img{transform:scale(1.03)}
.gfb-models .code{position:absolute;top:10px;left:10px;padding:5px 10px;border-radius:999px;background:rgba(28,9,18,.82);color:#fff;font-size:12px;font-weight:700}
.gfb-models .fmt{position:absolute;top:10px;right:10px;padding:5px 10px;border-radius:999px;background:var(--lime);color:#1F2A6B;font-size:12px;font-weight:800}
.gfb-models .tx{display:flex;flex-direction:column;gap:10px;flex:1;padding:20px 22px 22px}
.gfb-models h3{font-size:clamp(28px,2.6vw,40px);font-weight:800;letter-spacing:-.04em;line-height:1}
.gfb-models p.ds{margin:0;color:#5A4652;font-size:15px}
.gfb-models dl{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;margin:0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.gfb-models dl div{padding:10px 10px 10px 0}
.gfb-models dl div+div{padding-left:10px;border-left:1px solid var(--line)}
.gfb-models dt{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.gfb-models dd{margin:4px 0 0;font-size:15px;font-weight:700}
.gfb-models .pr{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 16px}
.gfb-models .pr b{font-size:clamp(24px,2.2vw,32px);font-weight:800;letter-spacing:-.03em}
.gfb-models .pr span{font-size:14px;color:var(--muted)}
.gfb-models .pr i{font-style:normal;font-size:14px;font-weight:700;color:var(--ink)}
.gfb-models .real{font-size:14px;color:var(--muted)}.gfb-models .real a{color:var(--violet);font-weight:700}
.gfb-models .act{display:flex;flex-wrap:wrap;gap:8px;margin-top:auto;padding-top:6px}
.gfb-models .act a{display:inline-flex;align-items:center;min-height:44px;padding:0 16px;border-radius:999px;border:1.5px solid #CDBFC6;text-decoration:none;font-weight:700;font-size:14px}
.gfb-models .act a.pri{background:var(--violet);border-color:var(--violet);color:#fff}
.gfb-models .act a:hover{border-color:var(--violet)}
.gfb-empty{margin:12px 0 0;padding:16px;background:#fff;border:1px dashed #CDBFC6;font-size:15px}
/* space guide */
.gfb-space{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.gfb-space li{display:flex;flex-direction:column;gap:8px;padding:22px;background:#fff;border:1px solid var(--line)}
.gfb-space b{font-size:clamp(26px,2.4vw,36px);font-weight:800;letter-spacing:-.04em;line-height:1;color:var(--violet)}
.gfb-space p{margin:0;color:#5A4652;font-size:15px}
.gfb-space .m{margin-top:auto;font-size:14px;font-weight:700}
/* games */
.gfb-games{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.gfb-games > div{padding:clamp(20px,2.4vw,32px);border:1px solid rgba(244,241,238,.2)}
.gfb-games h3{font-size:clamp(28px,2.8vw,44px);font-weight:800;letter-spacing:-.04em;line-height:1;color:#fff}
.gfb-games p{margin:12px 0 0;color:rgba(244,241,238,.85);font-size:16px}
.gfb-games ul{margin:12px 0 0;padding-left:18px;color:rgba(244,241,238,.85);font-size:15px;display:grid;gap:4px}
@media (max-width:1100px){.gfb-space{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:900px){.gfb-models,.gfb-games{grid-template-columns:minmax(0,1fr)}.gfb-filter .cnt{margin-left:0}}
@media (max-width:560px){.gfb-space{grid-template-columns:minmax(0,1fr)}.gfb-models dl{grid-template-columns:repeat(2,minmax(0,1fr))}.gfb-models dl div:nth-child(3){padding-left:0;border-left:0}.gfb-models dl div:nth-child(n+3){border-top:1px solid var(--line)}}
"""

BG = {"circle-cage-1": "#D23A26", "circle-cage-2": "#D8F24A", "o1": "#2457D6", "p1": "#FFB3C8", "octagon": "#47132D", "street-field": "#E8E1D8", "w1": "#6336F5", "street15": "#1F2A6B"}


def os_link(mid):
    return f'/os/?module={OS.get(mid, mid)}'


def card(mid):
    m, c = PRICE_BY[mid], CAT[mid]
    r = REAL.get(mid)
    real = f'<p class="real">W użyciu: <a href="/realizacje-gamefields/#{r[0]}">{html.escape(r[1])} →</a></p>' if r else ""
    who = f' · {html.escape(m["forWhom"])}' if m["forWhom"] else ""
    area = str(SLAB[mid]["areaM2"]).replace(".", ",")
    return (f'<li data-shape="{SHAPE[c["shape_label"]]}" data-h="{"low" if HEIGHT_M[mid] <= 1.1 else "high"}" data-a="{SLAB[mid]["areaM2"]}"><article id="m-{mid}">'
            f'<div class="ph" style="--bg:{BG[mid]}"><img src="{UP}2026/11/{RENDER[mid]}-1200.webp" srcset="{UP}2026/11/{RENDER[mid]}-720.webp 720w, {UP}2026/11/{RENDER[mid]}-1200.webp 1200w" '
            f'sizes="(max-width:900px) 100vw, 50vw" alt="{html.escape(m["name"])}, render konstrukcji" loading="lazy" decoding="async">'
            f'<span class="code">{m["code"]} · {c["shape_label"]}</span><span class="fmt">{FORMAT.get(mid, "1 na 1")}</span></div>'
            f'<div class="tx"><h3>{html.escape(c["name"])}</h3><p class="ds">{html.escape(c["description"])}{who}</p>'
            f'<dl><div><dt>Format</dt><dd>{html.escape(c["dimension_label"])}</dd></div><div><dt>Wysokość</dt><dd>{html.escape(c["height_label"])}</dd></div>'
            f'<div><dt>Panele</dt><dd>{html.escape(c["infill"])}</dd></div><div><dt>Nawierzchnia</dt><dd>{area} m²</dd></div></dl>'
            f'<p class="pr"><b>od {zl(m["constructionFromNet"])}</b><span>netto, konstrukcja · {zl(round(m["constructionFromNet"] * VAT))} brutto</span>'
            f'<i>z płytą i malowaniem od {zl(full(mid))} netto</i></p>{real}'
            f'<div class="act"><a class="pri" href="{m["link"]}">Zaprojektuj w Studio ↗</a><a href="/product/{SLUG[mid]}/">W sklepie</a><a href="{os_link(mid)}">Model 3D</a></div></div></article></li>')


cards = "".join(card(mid) for mid in ORDER)

rows = "".join(
    f'<tr><td><b><a class="nm" href="#m-{mid}">{html.escape(CAT[mid]["name"])}</a></b><br>{PRICE_BY[mid]["code"]} · {CAT[mid]["shape_label"]}</td>'
    f'<td data-l="Format">{html.escape(CAT[mid]["dimension_label"])}</td><td data-l="Wysokość">{html.escape(CAT[mid]["height_label"])}</td><td data-l="Panele">{html.escape(CAT[mid]["infill"])}</td>'
    f'<td class="r" data-l="Konstrukcja od">{zl(PRICE_BY[mid]["constructionFromNet"])}</td><td class="r" data-l="Z nawierzchnią od">{zl(full(mid))}</td></tr>' for mid in ORDER)
table = ('<div class="gfb-scroll"><table class="gfb-table"><thead><tr><th>Model</th><th>Format</th><th>Wysokość</th><th>Panele</th><th class="r">Konstrukcja od</th><th class="r">Z nawierzchnią od</th></tr></thead>'
         f"<tbody>{rows}</tbody></table></div>")

SPACE = [("30–60 m²", "Okrągłe albo kompaktowe boisko 1 na 1.", "Panna Ring, Play, Cage 90 i 180, Octa"),
         ("60–120 m²", "Większy format 1 na 1 albo strefa techniczna.", "Panna Court, Panna Grid"),
         ("120–250 m²", "Piłka uliczna 3 na 3 i rozwiązania indywidualne.", "Street Arena 15 (15 × 10 m)"),
         ("Nie wiesz?", "Wpisz wymiary placu w planerze albo pokaż mi miejsce.", "Planer „Zmieści się?”")]
space_html = "".join(f'<li><b>{a}</b><p>{d}</p><span class="m">{m}</span></li>' for a, d, m in SPACE)

FAQ = [
    ("Ile kosztuje boisko do panny?",
     f"Konstrukcje kosztują od {zl(min(m['constructionFromNet'] for m in MODELS))} netto (Panna Cage 90) do {zl(max(m['constructionFromNet'] for m in MODELS))} netto (Street Arena 15). Z płytą betonową i malowaniem, np. Panna Play od {zl(full('o1'))} netto. Montaż, transport i przygotowanie terenu liczę po zdjęciach placu."),
    ("Co zawiera cena konstrukcji?",
     "Konstrukcję z bramkami w podstawowej konfiguracji i standardowym kolorze. Bez nawierzchni, montażu, transportu i grafiki. Cena „z nawierzchnią” dodaje płytę betonową 12 cm z podbudową i malowanie jednokolorowe."),
    ("Czym różni się panna od street footballu 3 na 3?",
     "Panna to gra 1 na 1 na małej, zamkniętej arenie: liczy się technika i zagranie piłki między nogami rywala. Street football 3 na 3 to szybka gra drużynowa na większym boisku z bandami, u nas Street Arena 15 o wymiarach 15 × 10 m."),
    ("Ile miejsca potrzebuje boisko do panny?",
     "Najmniejsze areny mają około 5 m średnicy, a nawierzchnia z 10% zapasem to od 21,5 m² (Panna Ring). Boisko 3 na 3 ma 15 × 10 m. Do tego strefa bezpieczeństwa wokół. Wymiary placu sprawdzisz w planerze „Zmieści się?”."),
    ("Która arena jest najlepsza dla szkoły albo osiedla?",
     "Do szkół i osiedli najczęściej polecam Panna Cage 90 (niska, otwarta wizualnie) i Panna Play; dla gmin i parków Panna Octa; dla klubów i akademii Panna Cage 180 z wyższą zabudową. Ostateczny wybór zależy od miejsca i grupy wiekowej."),
    ("Czy mogę zobaczyć model, zanim zamówię?",
     "Tak. Każdy model obejrzysz w 3D, a w Studio dobierzesz kolor ramy, nawierzchnię i wzór i od razu zobaczysz cenę. Projekt pobierzesz jako kartę PDF."),
    ("Jak długo wytrzyma arena?",
     "Panna Ring stoi na Orliku OSiR w Grodzisku Mazowieckim od 10 lat bez żadnych uszkodzeń. Na realizacje daję 12 miesięcy gwarancji i stałą opiekę po odbiorze."),
    ("Czy można wynająć arenę na event?",
     f"Tak. Arena mobilna eventowa: wynajem i sprzedaż, od {zl(MOBILE['constructionFromNet'])} netto. Stała na turniejach, mistrzostwach i aktywacjach marek."),
]

FILTER_JS = """<script>(function(){var box=document.querySelector('.gfb [data-filter]');if(!box)return;var list=document.querySelector('.gfb [data-models]'),items=list.querySelectorAll(':scope > li'),cnt=box.querySelector('[data-cnt]'),empty=document.querySelector('.gfb [data-empty]');
var st={shape:'all',h:'all',a:'all'};
function ok(li){var a=parseFloat(li.getAttribute('data-a'));if(st.shape!=='all'){if(li.getAttribute('data-shape')!==st.shape)return false}
if(st.h!=='all'){if(li.getAttribute('data-h')!==st.h)return false}if(st.a==='s'){if(a>40)return false}if(st.a==='m'){if(a<=40){return false}if(a>120)return false}if(st.a==='l'){if(a<=120)return false}return true}
function render(){var n=0;items.forEach(function(li){var v=ok(li);li.hidden=!v;if(v)n++});cnt.textContent=n+(n===1?' model':(n>1?(n<5?' modele':' modeli'):' modeli'));empty.hidden=n>0}
box.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){var g=b.getAttribute('data-g');st[g]=b.getAttribute('data-v');box.querySelectorAll('button[data-g='+g+']').forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});render()})});render();})();</script>"""


def fbtn(g, items):
    return "".join(f'<button type="button" data-g="{g}" data-v="{v}" aria-pressed="{"true" if v == "all" else "false"}">{t}</button>' for v, t in items)


filt = ('<div class="gfb-filter" data-filter role="group" aria-label="Filtr modeli">'
        f'<div class="grp"><span class="lb">Kształt</span>{fbtn("shape", [("all", "Wszystkie"), ("okrag", "Okrąg"), ("prostokat", "Prostokąt"), ("oktagon", "Oktagon")])}</div>'
        f'<div class="grp"><span class="lb">Bandy</span>{fbtn("h", [("all", "Każde"), ("low", "Niskie do 1,1 m"), ("high", "Wyższe")])}</div>'
        f'<div class="grp"><span class="lb">Nawierzchnia</span>{fbtn("a", [("all", "Każda"), ("s", "do 40 m²"), ("m", "40–120 m²"), ("l", "ponad 120 m²")])}</div>'
        '<span class="cnt" data-cnt aria-live="polite">8 modeli</span></div>')

jump = [("modele", "Modele"), ("porownanie", "Porównanie"), ("miejsce", "Ile miejsca"), ("gry", "Panna i 3 na 3"), ("cena", "Co w cenie"), ("pytania", "Pytania")]

body = f"""
<section class="gfb-hero"><div class="w top">
  <div>
    <p class="gfb-crumbs"><a href="/">Gamefields</a> / Boiska panna i street football</p>
    <p class="k">Osiem konstrukcji, od 1 na 1 do 3 na 3</p>
    <h1 class="d">Boiska panna i street football.</h1>
    <p class="lead">Areny do panny 1 na 1 i boisko do street footballu 3 na 3. Porównaj kształt, wymiary, wysokość band i cenę, obejrzyj model w 3D i zaprojektuj go w Studio.</p>
    <div class="gfa-btns"><a class="gfa-btn" href="#modele">Zobacz 8 modeli ↓</a><a class="gfa-btn alt" href="/studio/">Zaprojektuj w Studio ↗</a></div>
  </div>
  <figure class="render"><img src="{UP}2026/11/gf-play-1200.webp" srcset="{UP}2026/11/gf-play-720.webp 720w, {UP}2026/11/gf-play-1200.webp 1200w" sizes="(max-width:900px) 100vw, 50vw" alt="Panna Play, render konstrukcji" loading="eager" decoding="async"></figure>
</div>
<div class="w">
  <dl class="gfb-nums">
    <div><dt>Modele</dt><dd>8<small>okrąg, prostokąt, oktagon</small></dd></div>
    <div><dt>Konstrukcja</dt><dd>od {zl(min(m['constructionFromNet'] for m in MODELS))}<small>netto, z bramkami</small></dd></div>
    <div><dt>Format</dt><dd>1 na 1 · 3 na 3<small>od ok. 5 m do 15 × 10 m</small></dd></div>
    <div><dt>Na Orliku</dt><dd>10 lat<small>Panna Ring bez uszkodzeń</small></dd></div>
  </dl>
</div></section>

<nav class="gfb-jump" aria-label="Na tej stronie"><div class="w"><ul role="list">{jump_html(jump)}</ul></div></nav>

<section class="gfa-sec" id="modele"><div class="w">
  <div class="gfa-head"><div><p class="k">Modele</p><h2 class="d">Wybierz konstrukcję.</h2></div><p>Filtruj po kształcie, wysokości band i metrażu. Każdy model ma cenę, wymiary, model 3D i link do Studia.</p></div>
  {filt}
  <ul class="gfb-models" data-models role="list">{cards}</ul>
  <p class="gfb-empty" data-empty hidden>Żaden model nie pasuje do tych filtrów. Zmień wybór albo <a href="/kontakt/">opisz mi miejsce</a>: dobiorę rozwiązanie indywidualne.</p>
</div></section>

<section class="gfa-sec" id="porownanie"><div class="w">
  <div class="gfa-head"><div><p class="k">Porównanie</p><h2 class="d">Wszystkie w jednej tabeli.</h2></div><p>Format, wysokość, panele i ceny „od” netto. Kliknij nazwę, żeby przejść do karty modelu.</p></div>
  {table}
</div></section>

<section class="gfa-sec" id="miejsce"><div class="w">
  <div class="gfa-head"><div><p class="k">Ile miejsca</p><h2 class="d">Zacznij od placu.</h2></div><p>Nie musisz znać nazwy produktu. Wystarczy metraż i informacja, kto będzie grał. <a href="/#planer">Planer „Zmieści się?” →</a></p></div>
  <ul class="gfb-space" role="list">{space_html}</ul>
</div></section>

<section class="gfa-band" id="gry"><div class="w">
  <div class="gfa-head"><div><p class="k">Panna i 3 na 3</p><h2 class="d">Dwie gry, jedno studio.</h2></div><p>Gram w pannę od 2005 roku, turnieje organizuję od 2008, a w 2017 zorganizowałem Mistrzostwa Świata Freestival Street Games. Konstrukcje projektuję pod grę, nie pod katalog.</p></div>
  <div class="gfb-games">
    <div><h3>Panna, 1 na 1</h3><p>Pojedynek na małej, zamkniętej arenie. Liczy się technika, odbicia od band i zagranie piłki między nogami rywala.</p>
      <ul><li>areny od ok. 5 m średnicy</li><li>okrąg, prostokąt albo oktagon</li><li>bandy od 0,90 do 1,80 m</li></ul></div>
    <div><h3>Street football, 3 na 3</h3><p>Szybka gra drużynowa na większym boisku z bandami. Dobra dla osiedli, gmin i turniejów.</p>
      <ul><li>Street Arena 15: 15 × 10 m</li><li>dwie bramki, gładkie bandy 1 m</li><li>miejsce na barwy i branding</li></ul></div>
  </div>
  <ul class="gfa-links"><li><a href="/damian-gawrych/">Kim jestem →</a></li><li><a href="/realizacje-gamefields/#eventy">Turnieje i eventy →</a></li></ul>
</div></section>

<section class="gfa-sec" id="cena"><div class="w">
  <div class="gfa-head"><div><p class="k">Co w cenie</p><h2 class="d">Konstrukcja, nawierzchnia, montaż.</h2></div><p>Ceny „od” są porównywalne między modelami, bo liczone tak samo. Pełną wycenę z montażem przygotuję po zdjęciach placu.</p></div>
  <div class="gfb-incl">
    <div><p class="k">Konstrukcja od</p><ul><li>bandy i bramki w podstawowej konfiguracji</li><li>standardowy kolor</li><li>bez nawierzchni, montażu, transportu i grafiki</li></ul></div>
    <div><p class="k">Z nawierzchnią od</p><ul><li>płyta betonowa 12 cm z podbudową ({BASE['rateNetPerM2']} zł/m²)</li><li>malowanie jednokolorowe</li><li>metraż: konstrukcja z 10% zapasem</li></ul></div>
  </div>
  <ul class="gfa-links"><li><a href="/budowa-boisk-sportowych/#kalkulator">Kalkulator budżetu →</a></li><li><a href="/nawierzchnie-sportowe/">Inne nawierzchnie →</a></li><li><a href="/wynajem-boisk-mobilnych/">Arena mobilna od {zl(MOBILE['constructionFromNet'])} →</a></li><li><a href="/dofinansowanie-boisk/">Dofinansowanie →</a></li></ul>
</div></section>

<section class="gfa-sec" id="pytania"><div class="w">
  <div class="gfa-head"><div><p class="k">Pytania</p><h2 class="d">Zanim wybierzesz arenę.</h2></div><p>Ceny, różnice między grami, miejsce, trwałość i wynajem.</p></div>
  <div class="gfa-faq">{faq_html(FAQ)}</div>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><div><p class="k">Dalej</p><h2 class="d">Od modelu do boiska.</h2></div><p>Wybrany model trzeba postawić na podłożu, nadać mu kolor i wpisać w miejsce.</p></div>
  <ul class="gfb-next" role="list">
    <li><a href="/budowa-boisk-sportowych/"><i>Pełny zakres</i><b>Budowa boisk</b><span>Płyta, nawierzchnia, konstrukcja i odbiór.</span></a></li>
    <li><a href="/realizacje-gamefields/"><i>W użyciu</i><b>Realizacje</b><span>Warszawa, Kutno, Kraków, Grodzisk i więcej.</span></a></li>
    <li><a href="/projektowanie-boisk/"><i>Koncepcja</i><b>Projektowanie boisk</b><span>Model wpisany w Twój plac.</span></a></li>
  </ul>
  <ul class="gfb-who" role="list"><li><a href="/boiska-dla-szkol/"><span>Dla</span>szkół</a></li><li><a href="/dla-miast/"><span>Dla</span>miast</a></li><li><a href="/boiska-dla-deweloperow/"><span>Dla</span>osiedli</a></li><li><a href="/boiska-dla-klubow/"><span>Dla</span>klubów</a></li><li><a href="/shop/">Sklep</a></li><li><a href="/os/">Gamefields OS 3D</a></li></ul>
</div></section>

<section class="gfa-cta"><div class="w">
  <h2 class="d">Który model<br>dla Twojego placu?</h2>
  <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Wyślij zdjęcia placu →</a><a class="gfa-btn alt" href="/studio/">Zaprojektuj w Studio ↗</a></div>
</div></section>
"""

ld = {"@context": "https://schema.org", "@graph": [
    {"@type": "ItemList", "name": "Boiska panna i street football Gamefields", "url": URL, "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "item": {"@type": "Product", "name": CAT[mid]["name"], "sku": PRICE_BY[mid]["code"], "url": SITE + f"product/{SLUG[mid]}/",
                                                          "image": f"{UP}2026/11/{RENDER[mid]}-1200.webp", "description": CAT[mid]["description"], "brand": {"@type": "Brand", "name": "Gamefields"},
                                                          "offers": {"@type": "Offer", "priceCurrency": "PLN", "price": PRICE_BY[mid]["constructionFromNet"],
                                                                     "priceSpecification": {"@type": "PriceSpecification", "minPrice": PRICE_BY[mid]["constructionFromNet"], "priceCurrency": "PLN", "valueAddedTaxIncluded": False},
                                                                     "url": SITE + f"product/{SLUG[mid]}/"}}} for i, mid in enumerate(ORDER)]},
    {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Gamefields", "item": SITE},
                                                    {"@type": "ListItem", "position": 2, "name": "Boiska panna i street football", "item": URL}]},
    {"@type": "FAQPage", "@id": URL + "#pytania", "inLanguage": "pl-PL",
     "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]}]}

write(HERE, "boiska-street-football", CSS, ld, body, FILTER_JS)
