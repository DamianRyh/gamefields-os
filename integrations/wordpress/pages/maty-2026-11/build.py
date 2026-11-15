#!/usr/bin/env python3
"""Build the training mat product page for gamefields.eu (15.11.2026).

Output (next to this file):
  mata-treningowa.html   new page /mata-treningowa/   the training mat as a product: sizes, rubber, drills, prices
  preview.html           local preview

Prices and drill names come from integrations/wordpress/offer/mat-product.json, generated from the Studio code
(lib/mat-product.ts), so the page, the Studio and the shop variants show the same numbers.
Images: media/*.webp, rendered in the Studio; upload them to the WordPress media library under the same names.
"""
import html
import json
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
UP = "https://www.gamefields.eu/wp-content/uploads/2026/11/"
STUDIO = "/studio/?tool=mat"
BASE_CSS = (HERE.parent / "gfa-style.css").read_text(encoding="utf-8").split("\n", 1)[1]
DATA = json.loads((HERE.parents[1] / "offer/mat-product.json").read_text(encoding="utf-8"))
EXTRA_CSS = """
.gfa-hero h1{font-size:clamp(52px,7vw,112px)}
.gfa-sec h2.d,.gfa-band h2.d{margin:0 0 clamp(18px,2vw,28px)}
.gfa-steps{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;counter-reset:s}
.gfa-steps li{counter-increment:s;padding:24px;background:#fff;border:1px solid var(--line);display:flex;flex-direction:column;gap:8px}
.gfa-steps li::before{content:counter(s);width:34px;height:34px;border-radius:50%;background:var(--violet);color:#fff;display:grid;place-items:center;font-weight:800}
.gfa-steps b{font-size:21px;letter-spacing:-.02em}.gfa-steps span{color:var(--muted);font-size:15px;line-height:1.5}
.gfa-mats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:0}
.gfa-mats figure{margin:0;background:#fff;border:1px solid var(--line);padding:12px}
.gfa-mats img{width:100%;height:auto;display:block}
.gfa-mats figcaption{padding:10px 2px 0;font-size:15px;color:var(--muted)}.gfa-mats figcaption b{display:block;color:var(--ink);font-size:17px}
.gfa-price{width:100%;border-collapse:collapse;font-size:16px;background:#fff}
.gfa-price th,.gfa-price td{padding:14px 12px;border-bottom:1px solid var(--line);text-align:right;white-space:nowrap}
.gfa-price th:first-child,.gfa-price td:first-child{text-align:left}
.gfa-price thead th{font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.gfa-price td small{display:block;color:var(--muted);font-size:13px}
.gfa-table-wrap{overflow-x:auto;border:1px solid var(--line)}
.gfa-note{margin:12px 0 0;color:var(--muted);font-size:15px}
.gfa-rubber{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.gfa-rubber li{padding:22px;background:#fff;border:1px solid var(--line);display:grid;gap:6px}
.gfa-rubber b{font-size:20px}.gfa-rubber .m{color:var(--violet);font-weight:800}.gfa-rubber span{color:var(--muted);font-size:15px}
.gfa-drills{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.gfa-drills div{padding:18px;background:var(--paper);border:1px solid var(--line);color:var(--ink)}
.gfa-drills h3{margin:0 0 8px;font-size:15px;letter-spacing:.06em;text-transform:uppercase;color:var(--violet)}
.gfa-drills ul{margin:0;padding:0 0 0 18px;font-size:15px;line-height:1.6}
.gfa-faq{border-top:1px solid var(--line)}
.gfa-faq details{border-bottom:1px solid var(--line)}
.gfa-faq summary{display:flex;justify-content:space-between;gap:14px;list-style:none;cursor:pointer;padding:20px 4px;font-size:18px;font-weight:700}
.gfa-faq summary::-webkit-details-marker{display:none}
.gfa-faq summary::after{content:'+';font-size:24px;font-weight:400;color:var(--violet)}
.gfa-faq details[open] summary::after{content:'−'}
.gfa-faq details p{max-width:780px;margin:0;padding:0 4px 22px;font-size:16px;color:var(--muted)}
@media (max-width:900px){.gfa-steps,.gfa-mats,.gfa-rubber{grid-template-columns:minmax(0,1fr)}.gfa-drills{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:560px){.gfa-drills{grid-template-columns:minmax(0,1fr)}}
"""


def zl(v):
    return f"{v:,.0f}".replace(",", " ") + " zł"


def num(v):
    return str(v).replace(".", ",")


def img(name, alt):
    return f'<img src="{UP}{name}.webp" alt="{html.escape(alt)}" loading="lazy" decoding="async">'


R = DATA["rubber"]
ORDER = ["standard", "standard-plus", "premium"]
LIM = DATA["limits"]
low = min(v["gross"] for f in DATA["formats"] for v in f["variants"])
high = max(v["gross"] for f in DATA["formats"] for v in f["variants"])
low_net = min(v["net"] for f in DATA["formats"] for v in f["variants"])

rows = "".join(
    f"<tr><td><b>{num(f['length'])} × {num(f['width'])} m</b><small>{num(f['areaM2'])} m²</small></td>" +
    "".join(f"<td>{zl(v['net'])}<small>{zl(v['gross'])} brutto</small></td>" for v in f["variants"]) + "</tr>"
    for f in DATA["formats"])

by_cat = {}
for d in DATA["drills"]:
    by_cat.setdefault(d["category"], []).append(d)
drills_html = "".join(
    f"<div><h3>{html.escape(c)}</h3><ul>" + "".join(f"<li>{html.escape(d['name'])}</li>" for d in ds) + "</ul></div>"
    for c, ds in by_cat.items())

FAQ = [
    ("Czy pod matę trzeba robić beton?",
     "Nie. Mata to gotowy produkt: wysyłamy ją w całości, rozkładasz ją na równym, twardym podłożu, np. na placu, kostce albo podłodze hali. Jeśli potrzebujesz trwałego boiska na betonie, zaprojektuj je w Studio jako nawierzchnię."),
    ("Jak duża może być mata?",
     f"Od {num(LIM['min'])} do {num(LIM['max'])} m długości i szerokości, co {num(LIM['step'])} m, do {LIM['maxArea']} m². Gotowe formaty kupisz od razu w sklepie, inny wymiar zamówisz przez formularz z Twoim projektem."),
    ("Jakie ćwiczenia mogę umieścić na macie?",
     "Wszystkie elementy z biblioteki Studio: slalom, bramki z pachołków, ósemkę, drabinkę koordynacyjną, kropki do pracy nóg, sześciokąt zwinności, strefy podań i oznaczenia toru. Ustawiasz liczbę pachołków i odstępy, a Studio pokazuje je w prawdziwej skali i ostrzega, gdy ćwiczenie nie mieści się na macie."),
    ("Ile kosztuje nadruk ćwiczeń?",
     f"{DATA['printNetPerM2']} zł netto za m² maty, doliczane, gdy na macie są ćwiczenia. Ceny w tabeli zawierają nadruk."),
    ("Ile kosztuje wysyłka?",
     "Wysyłkę wyceniamy po podaniu adresu, bo zależy od wielkości i wagi maty."),
    ("Czym różnią się rodzaje gumy?",
     "Standard to maty SBR w podstawowych kolorach, Standard+ jest grubszy i lepiej amortyzuje, Premium ma warstwę EPDM z szerszą paletą kolorów i lepszą odpornością na słońce."),
]
faq_html = "".join(f"<details><summary>{html.escape(q)}</summary><p>{html.escape(a)}</p></details>" for q, a in FAQ)

body = f"""
<section class="gfa-hero"><div class="w">
  <div>
    <p class="k">Nowość w Studio Gamefields</p>
    <h1 class="d">Mata z Twoim treningiem.</h1>
    <p class="lead">Gumowa mata ze slalomem, drabinką, kropkami i strefami podań, zaprojektowana w Studio w wymiarze, jakiego potrzebujesz: od małej maty do pracy nóg po 20 m² na trening drużyny. Wysyłamy ją gotową do rozłożenia, bez betonu i montażu.</p>
    <div class="gfa-btns"><a class="gfa-btn" href="{STUDIO}">Zaprojektuj matę →</a><a class="gfa-btn alt" href="#ceny">Ceny od {zl(low_net)} netto</a></div>
  </div>
  <figure>{img("gamefields-mata-5x4", "Mata treningowa 5 × 4 m z ósemką, drabinką, kropkami i sześciokątem")}<figcaption><b>Mata 5 × 4 m</b>Ósemka, drabinka koordynacyjna, kropki i sześciokąt</figcaption></figure>
</div></section>

<section class="gfa-sec"><div class="w">
  <h2 class="d">Jak to działa</h2>
  <ol class="gfa-steps">
    <li><b>Wybierz wielkość</b><span>Gotowy format od 2 × 1 m do 5 × 4 m albo własny wymiar co {num(LIM['step'])} m.</span></li>
    <li><b>Dodaj ćwiczenia</b><span>Przeciągasz je z biblioteki Studio. Wszystko w prawdziwej skali, z liczbą pachołków i odstępami.</span></li>
    <li><b>Zamów</b><span>Gotowy format dodasz do koszyka. Własny wymiar wyślesz formularzem z kartą projektu PDF.</span></li>
  </ol>
</div></section>

<section class="gfa-sec"><div class="w">
  <h2 class="d">Przykłady</h2>
  <div class="gfa-mats">
    <figure>{img("gamefields-mata-2x1", "Mata 2 × 1 m z kropkami do pracy nóg i sześciokątem zwinności")}<figcaption><b>2 × 1 m · praca nóg</b>Kropki i sześciokąt zwinności. Do domu, klubu i na rozgrzewkę.</figcaption></figure>
    <figure>{img("gamefields-mata-4x3", "Mata 4 × 3 m z drabinką koordynacyjną, sześciokątem i kropkami")}<figcaption><b>4 × 3 m · koordynacja</b>Drabinka, sześciokąt i kropki na jednym stanowisku.</figcaption></figure>
    <figure>{img("gamefields-mata-5x4", "Mata 5 × 4 m z ósemką, drabinką, kropkami i sześciokątem")}<figcaption><b>5 × 4 m · trening drużyny</b>Ósemka do prowadzenia piłki i stacje koordynacji.</figcaption></figure>
  </div>
</div></section>

<section class="gfa-sec" id="ceny"><div class="w">
  <h2 class="d">Ceny</h2>
  <div class="gfa-table-wrap"><table class="gfa-price"><thead><tr><th>Format</th>{"".join(f"<th>{html.escape(R[k]['label'])}</th>" for k in ORDER)}</tr></thead><tbody>{rows}</tbody></table></div>
  <p class="gfa-note">Ceny netto z nadrukiem ćwiczeń, pod nimi brutto (VAT 23%). Guma: {", ".join(f"{R[k]['label']} {DATA['rubberNetPerM2'][k]} zł/m²" for k in ORDER)}; nadruk {DATA['printNetPerM2']} zł/m². Wysyłkę wyceniamy po podaniu adresu. Inne wymiary policzy Studio.</p>
</div></section>

<section class="gfa-sec"><div class="w">
  <h2 class="d">Rodzaj gumy</h2>
  <ul class="gfa-rubber">{"".join(f"<li><span class='m'>{DATA['rubberNetPerM2'][k]} zł/m² netto</span><b>{html.escape(R[k]['label'])}</b><span>{html.escape(R[k]['description'])}</span></li>" for k in ORDER)}</ul>
</div></section>

<section class="gfa-band"><div class="w">
  <h2 class="d">Ćwiczenia do wyboru</h2>
  <div class="gfa-drills">{drills_html}</div>
</div></section>

<section class="gfa-sec"><div class="w">
  <h2 class="d">Pytania</h2>
  <div class="gfa-faq">{faq_html}</div>
</div></section>

<section class="gfa-cta"><div class="w">
  <h2 class="d">Zaprojektuj swoją matę.</h2>
  <div class="gfa-btns"><a class="gfa-btn" href="{STUDIO}">Otwórz Studio →</a><a class="gfa-btn alt" href="/kontakt/">Zapytaj o matę</a></div>
</div></section>
"""

ld = [
    {"@context": "https://schema.org", "@type": "Product", "name": "Mata treningowa Gamefields",
     "description": "Gumowa mata z ćwiczeniami ze Studio Gamefields, w wybranym wymiarze, wysyłana gotowa do rozłożenia.",
     "brand": {"@type": "Brand", "name": "Gamefields"},
     "image": [UP + n + ".webp" for n in ("gamefields-mata-5x4", "gamefields-mata-4x3", "gamefields-mata-2x1")],
     "offers": {"@type": "AggregateOffer", "priceCurrency": "PLN", "lowPrice": low, "highPrice": high,
                "offerCount": sum(len(f["variants"]) for f in DATA["formats"]), "url": "https://www.gamefields.eu/mata-treningowa/"}},
    {"@context": "https://schema.org", "@type": "FAQPage",
     "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]},
]

content = ("<!-- wp:html -->\n<style>\n" + BASE_CSS + EXTRA_CSS + "</style>\n<script type=\"application/ld+json\">" +
           json.dumps(ld, ensure_ascii=False, separators=(",", ":")) + "</script>\n" +
           '<div class="gfa">\n' + body.strip() + "\n</div>\n<!-- /wp:html -->\n")
if "&&" in content:
    raise SystemExit("mata-treningowa.html contains a double ampersand")
(HERE / "mata-treningowa.html").write_text(content, encoding="utf-8")
preview = content.replace("<!-- wp:html -->", "").replace("<!-- /wp:html -->", "").replace(UP, "media/").replace(' loading="lazy"', "")
(HERE / "preview.html").write_text('<!doctype html><html lang="pl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Podgląd: mata treningowa</title><body style="margin:0">' + preview + "</body></html>", encoding="utf-8")
print("ok", len(content), "zł", low, high)
