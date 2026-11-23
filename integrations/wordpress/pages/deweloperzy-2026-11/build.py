#!/usr/bin/env python3
"""/boiska-dla-deweloperow/ (page 3702), rebuilt 23.11.2026 in the .gfb style. Footer link: "Deweloperzy i osiedla".

Output: boiska-dla-deweloperow.html (one wp:html block, the whole content of the page).

For developers and housing estates: sport as an amenity, the eight models as a masterplan table (area, panels, prices),
the "Osiedle" kit, design matching the architecture (frame and panel colours, 732 patterns, the five kits), what I
check in the masterplan (from the live page), materials for sales, process, FAQ. Facts from the live page,
public/catalog/products.json, offer/*.json, the homepage kits and Studio facts. No developer reference is invented.
"""
import html
import json
import pathlib
import sys
from urllib.parse import urlencode

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from gfb_common import (BASE, GFB_CSS, MODELS, PAINT, PRICE, SITE, SLAB, SLUG, UP, img, jump_html, faq_html, write, zl)  # noqa: E402

URL = SITE + "boiska-dla-deweloperow/"
ROOT = HERE.parents[3]
CAT = {p["id"]: p for p in json.loads((ROOT / "public" / "catalog" / "products.json").read_text(encoding="utf-8"))["products"]}
PB = {m["id"]: m for m in PRICE["models"]}
KITS_URL = "/wp-content/themes/gamefields/assets/js/home/kits/"


def kit_link(arena, pattern, variant, palette, panel, frame):
    return "/studio/?" + urlencode({"arena": arena, "pattern": pattern, "variant": str(variant), "palette": palette, "panel": panel, "frame": frame}).replace("&", "&amp;")


ESTATE_KIT = kit_link("p1", "pro-ndebele", 3, "ndebele", "F4C430", "141414")


def full(mid):
    return PB[mid]["constructionFromNet"] + SLAB[mid]["net"] + PAINT[mid]


CSS = GFB_CSS + """
.gfb-hero figure.kit{margin:0;background:#FFB3C8;overflow:hidden;position:relative}
.gfb-hero figure.kit img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover}
.gfa .gfb-hero figure.kit figcaption{position:absolute;left:10px;bottom:10px;margin:0;padding:6px 10px;background:rgba(28,9,18,.84);color:#fff;font-size:13px}
.gfb-val{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.gfb-val li{display:flex;flex-direction:column;gap:8px;padding:22px;background:#fff;border:1px solid var(--line)}
.gfb-val .n{font-size:13px;font-weight:800;letter-spacing:.06em;color:var(--violet)}
.gfb-val b{font-size:22px;letter-spacing:-.025em;line-height:1.1}
.gfb-val p{margin:0;color:#5A4652;font-size:15px}
.gfb-table a.nm{display:inline;min-height:0;padding:0;border:0;border-radius:0;font-size:inherit;color:inherit;text-decoration:underline;text-decoration-color:#CDBFC6;text-underline-offset:3px}
.gfb-kitb{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,6fr);gap:clamp(20px,3vw,48px);align-items:center}
.gfb-kitb img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;background:#FFB3C8}
.gfb-kitb ul{margin:14px 0 0;padding-left:20px;display:grid;gap:6px;font-size:16px;color:rgba(244,241,238,.88)}
.gfb-kitb .pr{margin:14px 0 0;font-size:18px;font-weight:800;color:#fff}
.gfb-kitb p.l{margin:16px 0 0;font-size:18px;color:rgba(244,241,238,.85)}
.gfb-kitb .gfa-btn{background:var(--lime);color:#1F2A6B!important}
.gfb-kitb .gfa-btn.alt{background:transparent;border:1.5px solid rgba(244,241,238,.5);color:var(--paper)!important}
/* design */
.gfb-des{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:12px}
.gfb-des .opts{display:grid;gap:8px;align-content:start}
.gfb-des .opts div{padding:16px 18px;background:#fff;border:1px solid var(--line)}
.gfb-des .opts b{display:block;font-size:18px;letter-spacing:-.02em}
.gfb-des .opts span{font-size:15px;color:#5A4652}
.gfb-des .gal{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.gfb-des .gal li:first-child{grid-column:span 2;grid-row:span 2}
.gfb-des .gal a{display:block;position:relative;height:100%;background:#E6E0DA;overflow:hidden}
.gfb-des .gal img{display:block;width:100%;height:100%;aspect-ratio:1;object-fit:cover;transition:transform .8s cubic-bezier(.2,.7,.2,1)}
.gfb-des .gal a:hover img{transform:scale(1.05)}
.gfb-des .gal span{position:absolute;left:6px;bottom:6px;padding:4px 8px;background:rgba(28,9,18,.82);color:#fff;font-size:12px;font-weight:700}
/* checks */
.gfb-chk{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.gfb-chk li{padding:20px 22px;background:#fff;border:1px solid var(--line)}
.gfb-chk b{display:block;font-size:19px;letter-spacing:-.02em}
.gfb-chk span{display:block;margin-top:6px;font-size:15px;color:#5A4652}
.gfb-dl{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:0}
.gfb-dl div{padding:20px 22px;border:1px solid rgba(244,241,238,.2)}
.gfb-dl dt{font-size:19px;font-weight:800;letter-spacing:-.02em;color:#fff}
.gfb-dl dd{margin:6px 0 0;font-size:15px;color:rgba(244,241,238,.85)}
@media (max-width:1100px){.gfb-val,.gfb-dl{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:900px){.gfb-table td[data-l]:not(.r)::before{content:attr(data-l);display:block;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}.gfb-kitb,.gfb-des,.gfb-chk{grid-template-columns:minmax(0,1fr)}}
@media (max-width:560px){.gfb-val,.gfb-dl{grid-template-columns:minmax(0,1fr)}.gfb-des .gal{grid-template-columns:repeat(2,minmax(0,1fr))}.gfb-des .gal li:first-child{grid-column:1/-1;grid-row:auto}}
"""

VAL = [("01", "Mała powierzchnia", "Formaty sportowe dla ograniczonego metrażu: arena 1 na 1 mieści się na placu o boku 5–7 m."),
       ("02", "Design osiedla", "Kolor ramy, paneli i wzór nawierzchni spójne z architekturą i identyfikacją inwestycji."),
       ("03", "Wartość dla mieszkańców", "Codzienna aktywność, integracja i rozpoznawalny punkt osiedla, bez zapisów i rezerwacji."),
       ("04", "Materiały do sprzedaży", "Rendery ze Studia, wizualizacja na zdjęciu działki i opis funkcji do prospektu.")]
val_html = "".join(f'<li><span class="n">{n}</span><b>{t}</b><p>{d}</p></li>' for n, t, d in VAL)

ordered = sorted(MODELS, key=lambda m: SLAB[m["id"]]["areaM2"])
rows = "".join(
    f'<tr><td><b><a class="nm" href="{m["link"]}">{html.escape(CAT[m["id"]]["name"])}</a></b><br>{CAT[m["id"]]["shape_label"]} · {html.escape(CAT[m["id"]]["dimension_label"])}</td>'
    f'<td data-l="Nawierzchnia">{str(SLAB[m["id"]]["areaM2"]).replace(".", ",")} m²</td><td data-l="Panele">{html.escape(CAT[m["id"]]["infill"])}, {html.escape(CAT[m["id"]]["height_label"])}</td>'
    f'<td class="r" data-l="Konstrukcja od">{zl(m["constructionFromNet"])}</td><td class="r" data-l="Komplet od">{zl(full(m["id"]))}</td></tr>' for m in ordered)
table = ('<div class="gfb-scroll"><table class="gfb-table"><thead><tr><th>Model i wymiary</th><th>Nawierzchnia</th><th>Panele i wysokość</th><th class="r">Konstrukcja od</th><th class="r">Komplet od</th></tr></thead>'
         f"<tbody>{rows}</tbody></table></div>")

KITS = [("osiedle", "Ndebele na Panna Court", ESTATE_KIT),
        ("miasto", "Garden Plan na Panna Cage 90", kit_link("circle-cage-1", "pro-garden", 3, "burle-marx", "1F5E3A", "1B1B1B")),
        ("szkola", "Neo-Plastic na Panna Play", kit_link("o1", "pro-neoplastic", 6, "stijl", "1F4E9C", "111111")),
        ("klub", "Munich Chevrons na Cage 180", kit_link("circle-cage-2", "pro-munich", 2, "aicher", "2E9C5E", "0F5B3A")),
        ("marka", "Overprint na Street Arena 15", kit_link("street15", "pro-overprint", 1, "martens", "E5383B", "1E1E1E"))]
gal_html = "".join(f'<li><a href="{h}"><img src="{KITS_URL}{f}{"" if i == 0 else "-480"}.webp" alt="{t}, widok ze Studio 3D" loading="lazy" decoding="async"><span>{t}</span></a></li>' for i, (f, t, h) in enumerate(KITS))

CHECKS = [("Położenie w masterplanie", "Relacja z budynkami, dojściami i strefami rekreacji; strefa bezpieczeństwa wokół areny."),
          ("Sąsiedztwo mieszkań", "Lokalizacja, rodzaj gry i rodzaj band dobrane do sąsiedztwa okien. Analizuję to na etapie koncepcji."),
          ("Rodzaj paneli", "Siatka, stal perforowana, pręty albo pełne panele: inna przejrzystość i charakter."),
          ("Format gry", "1 na 1 na małym dziedzińcu, 3 na 3 na większym placu, albo dwie areny obok siebie."),
          ("Podłoże", f"Płyta betonowa 12 cm z podbudową ({BASE['rateNetPerM2']} zł/m²) albo istniejąca, stabilna nawierzchnia."),
          ("Harmonogram budowy", "Montaż areny i wykończenie nawierzchni wpisane w etap zagospodarowania terenu.")]
chk_html = "".join(f'<li><b>{t}</b><span>{d}</span></li>' for t, d in CHECKS)

SALES = [("Rendery ze Studia 3D", "Model w kolorach inwestycji, w wysokiej jakości, do prospektu i strony."),
         ("Arena na zdjęciu działki", "Wizualizacja na zdjęciu placu albo dziedzińca z planu."),
         ("Karta projektu PDF", "Model, nawierzchnia, wymiary i cena: gotowe do budżetu inwestycji."),
         ("Opis funkcji", "Krótki tekst o strefie sportowej do materiałów sprzedażowych.")]
sales_html = "".join(f"<div><dt>{t}</dt><dd>{d}</dd></div>" for t, d in SALES)

STEPS = [("Plan zagospodarowania", "Wysyłasz fragment planu albo wymiary dziedzińca.", "dobór formatu do metrażu."),
         ("Koncepcja", "Format, położenie, rodzaj band, kolory zgodne z architekturą.", "warianty do porównania."),
         ("Materiały sprzedażowe", "Rendery i wizualizacja na zdjęciu działki do prospektu.", "Studio 3D i karta PDF."),
         ("Realizacja", "Płyta, nawierzchnia, montaż areny w harmonogramie budowy.", "farby od wiosny do jesieni."),
         ("Odbiór i opieka", "Odbiór z zarządcą, potem opieka nad nawierzchnią.", "12 miesięcy gwarancji.")]
steps_html = "".join(f'<li><b>{t}</b><p>{d}</p><span class="gf">{g}</span></li>' for t, d, g in STEPS) + \
    "".join(f'<li class="ph">{img(p, a)}</li>' for p, a in [("2026/11/Gamefields-x-boiska-x-Projekt-Krakow--768x768.jpg", "Plan zagospodarowania z arenami"),
                                                          ("2026/11/gf-court-720.webp", "Panna Court, render"), ("2026/11/Gamefields-x-Panna-Cage-x-Krakow-montaz-768x576.jpg", "Montaż areny")])

FAQ = [
    ("Ile miejsca potrzebuje boisko na osiedlu?",
     "Arena 1 na 1 mieści się na placu o boku 5–7 m; najmniejsza nawierzchnia z zapasem to 21,5 m² (Panna Ring). Boisko 3 na 3 ma 15 × 10 m. Do tego strefa bezpieczeństwa wokół."),
    ("Ile kosztuje strefa sportowa na osiedlu?",
     f"Konstrukcje od {zl(min(m['constructionFromNet'] for m in MODELS))} netto. Zestaw „Osiedle” (Panna Court) od {zl(PB['p1']['constructionFromNet'])} netto za konstrukcję, z płytą i malowaniem od {zl(full('p1'))} netto. Montaż i transport liczę po zdjęciach działki."),
    ("Czy kolory mogą pasować do architektury inwestycji?",
     "Tak. W Studio 3D zmieniasz kolor ramy i paneli oraz wzór nawierzchni: 732 wzory w 12 wariantach, z paletami. Mogę też przygotować wzór w kolorach identyfikacji inwestycji."),
    ("Czy można ograniczyć uciążliwość dla mieszkańców?",
     "Lokalizację, rodzaj gry i rodzaj band dobieram do sąsiedztwa mieszkań już na etapie koncepcji. Do wyboru są siatka, stal perforowana, pręty albo pełne panele."),
    ("Czy przygotujecie materiały do sprzedaży mieszkań?",
     "Tak. Rendery ze Studia w kolorach inwestycji, wizualizację na zdjęciu działki, kartę projektu PDF i krótki opis funkcji do prospektu."),
    ("Kiedy montować arenę w harmonogramie budowy?",
     "Na etapie zagospodarowania terenu, gdy gotowe są dojścia i podłoże. Farby i nawierzchnie kładę na suchym podłożu przy dodatniej temperaturze, zwykle od wiosny do jesieni."),
    ("Kto zajmie się boiskiem po oddaniu osiedla?",
     "Na realizację daję 12 miesięcy gwarancji i stałą opiekę nad nawierzchnią. Po latach malowanie można odświeżyć bez wymiany konstrukcji."),
    ("Czy arena jest trwała w przestrzeni ogólnodostępnej?",
     "Panna Ring stoi na ogólnodostępnym Orliku w Grodzisku Mazowieckim od 10 lat bez żadnych uszkodzeń. Konstrukcje są stalowe, z certyfikatami producentów."),
]

jump = [("wartosc", "Wartość"), ("formaty", "Formaty"), ("osiedle", "Zestaw Osiedle"), ("design", "Design"), ("masterplan", "Masterplan"),
        ("sprzedaz", "Do sprzedaży"), ("proces", "Proces"), ("pytania", "Pytania")]

body = f"""
<section class="gfb-hero"><div class="w top">
  <div>
    <p class="gfb-crumbs"><a href="/">Gamefields</a> / Deweloperzy i osiedla</p>
    <p class="k">Amenity, które nie jest dekoracją</p>
    <h1 class="d">Boiska dla deweloperów i osiedli.</h1>
    <p class="lead">Kompaktowa arena albo boisko 3 na 3 jako wyróżnik inwestycji. Mały metraż, kolory zgodne z architekturą i materiały do sprzedaży mieszkań, a potem realizacja w harmonogramie budowy.</p>
    <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Wyślij plan zagospodarowania →</a><a class="gfa-btn alt" href="{ESTATE_KIT}">Zestaw „Osiedle” w Studio ↗</a></div>
  </div>
  <figure class="kit"><img src="{KITS_URL}osiedle.webp" alt="Panna Court z nawierzchnią Ndebele, zestaw dla osiedla, widok ze Studio 3D" loading="eager" decoding="async"><figcaption>Zestaw „Osiedle”: Panna Court + Ndebele</figcaption></figure>
</div>
<div class="w">
  <dl class="gfb-nums">
    <div><dt>Arena</dt><dd>od {zl(min(m['constructionFromNet'] for m in MODELS))}<small>netto, konstrukcja</small></dd></div>
    <div><dt>Plac</dt><dd>5–7 m<small>tyle wystarczy na arenę 1 na 1</small></dd></div>
    <div><dt>Design</dt><dd>732<small>wzory nawierzchni w Studio</small></dd></div>
    <div><dt>Trwałość</dt><dd>10 lat<small>Panna Ring bez uszkodzeń</small></dd></div>
  </dl>
</div></section>

<nav class="gfb-jump" aria-label="Na tej stronie"><div class="w"><ul role="list">{jump_html(jump)}</ul></div></nav>

<section class="gfa-sec" id="wartosc"><div class="w">
  <div class="gfa-head"><div><p class="k">Wartość</p><h2 class="d">Sport podnosi jakość inwestycji.</h2></div><p>Na nowych osiedlach przestrzeń jest cenna. Zamiast dużego obiektu proponuję kompaktową funkcję, która codziennie pracuje.</p></div>
  <ul class="gfb-val" role="list">{val_html}</ul>
</div></section>

<section class="gfa-sec" id="formaty"><div class="w">
  <div class="gfa-head"><div><p class="k">Formaty</p><h2 class="d">Do masterplanu.</h2></div><p>Osiem modeli od najmniejszego. Nawierzchnia z 10% zapasem, panele, ceny „od” netto: konstrukcja i komplet z płytą betonową i malowaniem. <a href="/boiska-street-football/">Karty modeli →</a></p></div>
  {table}
</div></section>

<section class="gfa-band" id="osiedle"><div class="w">
  <div class="gfb-kitb">
    <img src="{KITS_URL}osiedle.webp" alt="Zestaw Osiedle: Panna Court z nawierzchnią Ndebele" loading="lazy" decoding="async">
    <div><p class="k">Zestaw „Osiedle”</p><h2 class="d" style="font-size:clamp(40px,5vw,80px)">Wyróżnik wpisany w zieleń.</h2>
      <p class="l">Mieści się na placu o boku 5–7 m. Dziedziniec, zieleń osiedlowa.</p>
      <ul><li>Panna Court: 7,14 × 5,57 m, perforowane bandy</li><li>nawierzchnia Ndebele: płaskie figury w czarnych konturach</li><li>kolor ramy i paneli do zmiany w Studio</li></ul>
      <p class="pr">konstrukcja od {zl(PB['p1']['constructionFromNet'])} netto · komplet od {zl(full('p1'))}</p>
      <div class="gfa-btns" style="margin-top:18px"><a class="gfa-btn" href="{ESTATE_KIT}">Otwórz zestaw w Studio ↗</a><a class="gfa-btn alt" href="/product/panna-court/">Panna Court w sklepie</a></div></div>
  </div>
</div></section>

<section class="gfa-sec" id="design"><div class="w">
  <div class="gfa-head"><div><p class="k">Design</p><h2 class="d">Spójny z architekturą.</h2></div><p>Kolor konstrukcji, paneli i nawierzchni dobierasz do elewacji i zieleni. Kliknij zestaw, żeby otworzyć go w Studio i zmienić kolory.</p></div>
  <div class="gfb-des">
    <div class="opts">
      <div><b>Kolor ramy i paneli</b><span>Dobierany w Studio 3D, z podglądem na żywo.</span></div>
      <div><b>Wzór nawierzchni</b><span>732 wzory w 12 wariantach, w tym 8 kierunków Masters II.</span></div>
      <div><b>Barwy inwestycji</b><span>Wzór w kolorach identyfikacji osiedla albo dewelopera.</span></div>
      <div><b>Malowalne</b><span>Pasy od ok. 20 cm, do 5 farb, symetria: wzór da się namalować. <a href="/malowanie-boisk/#malowalne" style="color:var(--violet);font-weight:700">Zasady →</a></span></div>
    </div>
    <ul class="gal" role="list">{gal_html}</ul>
  </div>
</div></section>

<section class="gfa-sec" id="masterplan"><div class="w">
  <div class="gfa-head"><div><p class="k">Masterplan</p><h2 class="d">Co sprawdzam w koncepcji.</h2></div><p>Łączę architekturę przestrzeni z doświadczeniem gracza. Te decyzje zapadają, zanim wejdzie ekipa.</p></div>
  <ul class="gfb-chk" role="list">{chk_html}</ul>
</div></section>

<section class="gfa-band" id="sprzedaz"><div class="w">
  <div class="gfa-head"><div><p class="k">Do sprzedaży</p><h2 class="d">Materiały dla działu sprzedaży.</h2></div><p>Strefa sportowa pokazana tak, jak będzie wyglądać, zanim powstanie.</p></div>
  <dl class="gfb-dl">{sales_html}</dl>
  <ul class="gfa-links"><li><a href="/projektowanie-boisk/">Projektowanie boisk →</a></li><li><a href="/#gfs-site">Postaw boisko na zdjęciu →</a></li></ul>
</div></section>

<section class="gfa-sec" id="proces"><div class="w">
  <div class="gfa-head"><div><p class="k">Proces</p><h2 class="d">Od planu do odbioru.</h2></div><p>Pięć kroków, jedna osoba kontaktowa od koncepcji po opiekę po oddaniu osiedla.</p></div>
  <ol class="gfb-steps">{steps_html}</ol>
</div></section>

<section class="gfa-sec" id="pytania"><div class="w">
  <div class="gfa-head"><div><p class="k">Pytania</p><h2 class="d">Sport w inwestycji mieszkaniowej.</h2></div><p>Metraż, koszty, design, sąsiedztwo i harmonogram.</p></div>
  <div class="gfa-faq">{faq_html(FAQ)}</div>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><div><p class="k">Dalej</p><h2 class="d">Od koncepcji do realizacji.</h2></div><p>Modele, projekt i budowa.</p></div>
  <ul class="gfb-next" role="list">
    <li><a href="/boiska-street-football/"><i>Modele</i><b>Boiska panna i street football</b><span>8 konstrukcji z cenami i modelem 3D.</span></a></li>
    <li><a href="/projektowanie-boisk/"><i>Koncepcja</i><b>Projektowanie boisk</b><span>Układ, wzór i cena przed budową.</span></a></li>
    <li><a href="/budowa-boisk-sportowych/"><i>Realizacja</i><b>Budowa boisk</b><span>Płyta, nawierzchnia, montaż i odbiór.</span></a></li>
  </ul>
  <ul class="gfb-who" role="list"><li><a href="/realizacje-gamefields/">Realizacje</a></li><li><a href="/nawierzchnie-sportowe/">Nawierzchnie</a></li><li><a href="/malowanie-boisk/">Malowanie i grafika</a></li><li><a href="/boiska-do-koszykowki/">Koszykówka</a></li><li><a href="/street-workout/">Street workout</a></li></ul>
</div></section>

<section class="gfa-cta"><div class="w">
  <h2 class="d">Sport w Twojej<br>inwestycji?</h2>
  <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Wyślij plan zagospodarowania →</a><a class="gfa-btn alt" href="/studio/">Zaprojektuj w Studio ↗</a></div>
</div></section>
"""

ld = {"@context": "https://schema.org", "@graph": [
    {"@type": "Service", "@id": URL + "#usluga", "name": "Boiska dla deweloperów i osiedli", "serviceType": "Strefy sportowe dla inwestycji mieszkaniowych", "url": URL, "inLanguage": "pl-PL",
     "areaServed": {"@type": "Country", "name": "Polska"}, "provider": {"@id": SITE + "#studio"},
     "audience": {"@type": "BusinessAudience", "audienceType": "deweloperzy, wspólnoty i zarządcy osiedli"},
     "description": "Kompaktowe areny i boiska 3 na 3 dla osiedli: koncepcja w masterplanie, design zgodny z architekturą, materiały sprzedażowe i realizacja."},
    {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Gamefields", "item": SITE},
                                                    {"@type": "ListItem", "position": 2, "name": "Deweloperzy i osiedla", "item": URL}]},
    {"@type": "FAQPage", "@id": URL + "#pytania", "inLanguage": "pl-PL",
     "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]}]}

write(HERE, "boiska-dla-deweloperow", CSS, ld, body)
