#!/usr/bin/env python3
"""/malowanie-boisk/ (page 3687), rebuilt 23.11.2026 in the .gfb style shared with Budowa, Renowacja and Nawierzchnie.

Output: malowanie-boisk.html (one wp:html block, the whole content of the page).

Court design, not just paint: three scopes (refresh, court design, branding), the four painting variants with a
quick cost check, a gallery of Studio kits (Masters II patterns, open the same pattern in the Studio), Murale (eight
mural directions after the US painted-court trend, inline SVG previews from the engine, each opens in the Studio),
the eight Masters II directions, paintability rules, the paint plan for the contractor, lines, steps, FAQ.
Updated 27.11.2026: 1020 patterns, Murale, Kompozytor, paint plan (previews from surface-pro-2026-11/export-previews.mjs). Facts from surface-finish.json,
the homepage kits (gf-home.js KITS), integrations/studio/surface-pro-2026-11/README.md (Masters II, paintability)
and the live page (logos, lines only, refresh). Renovation of the ground lives on /renowacja-boisk/.
"""
import html
import json
import pathlib
import subprocess
import sys
from urllib.parse import urlencode

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from gfb_common import (BASE, FIN, GFB_CSS, PRICE, SITE, UP, img, jump_html, faq_html, write, zl)  # noqa: E402

URL = SITE + "malowanie-boisk/"
ENGINE = HERE.parents[2] / "studio" / "surface-pro-2026-11"
# previews rendered by the same engine as the Studio, so the cards show exactly what the Studio opens
PREV = json.loads(subprocess.run(["node", str(ENGINE / "export-previews.mjs")], capture_output=True, text=True, check=True).stdout)
N_PATTERNS, N_DIRECTIONS = 1020, 85
# sample paint plan: Pejzaż, variant 1, palette Simultané, 15 x 10 m (numbers from plan-malowania.html, 27.11.2026)
PLAN_SAMPLE = {"paints": 5, "litres": "143,5", "tape": 99, "rolls": 2, "layers": [("#D9822B", "tło, całe boisko", "150,0", "82,5", "–"), ("#F1E6D2", "", "37,7", "21,0", "33"), ("#2E8C6E", "", "29,4", "16,5", "13"), ("#C4314B", "", "24,8", "14,0", "30"), ("#2F5C8A", "", "16,5", "9,5", "23")]}
KITS_URL = "/wp-content/themes/gamefields/assets/js/home/kits/"
PV = FIN["variants"]
PMIN, PMAX = min(v["netPerM2"] for v in PV), max(v["netPerM2"] for v in PV)
PRICE_BY = {m["id"]: m for m in PRICE["models"]}

# as gf-home.js KITS (homepage "Pięć miejsc. Pięć zestawów.")
KITS = [
    ("Miasto", "circle-cage-1", "Panna Cage 90", "miasto", "pro-garden", 3, "burle-marx", "1F5E3A", "1B1B1B", "Garden Plan", "park, skwer, plac"),
    ("Szkoła", "o1", "Panna Play", "szkola", "pro-neoplastic", 6, "stijl", "1F4E9C", "111111", "Neo-Plastic", "boisko szkolne, dziedziniec"),
    ("Osiedle", "p1", "Panna Court", "osiedle", "pro-ndebele", 3, "ndebele", "F4C430", "141414", "Ndebele", "dziedziniec, zieleń osiedlowa"),
    ("Klub", "circle-cage-2", "Panna Cage 180", "klub", "pro-munich", 2, "aicher", "2E9C5E", "0F5B3A", "Munich Chevrons", "akademia, ośrodek treningowy"),
    ("Marka", "street15", "Street Arena 15", "marka", "pro-overprint", 1, "martens", "E5383B", "1E1E1E", "Overprint", "event, galeria, festiwal"),
]
MASTERS = [
    ("Vega Bulge", "Victor Vasarely", "szachownica puchnąca w kule"),
    ("Protractor", "Frank Stella", "półtarcze z koncentrycznych pasów oparte o bramki i linie"),
    ("Neo-Plastic", "De Stijl", "czarne belki i płaszczyzny kolorów podstawowych"),
    ("Overprint", "Karel Martens", "dwa systemy pasów nadrukowane na siebie"),
    ("Ndebele", "malarstwo ścienne Ndebele", "płaskie figury w czarnych konturach"),
    ("Munich Bands", "Otl Aicher, system 1972", "widmo pasów cięte pod 45°"),
    ("Promenade", "Roberto Burle Marx, Copacabana", "falujące pasy"),
    ("Garden Plan", "Roberto Burle Marx, plany ogrodów", "rabaty w pasy i ścieżka"),
]
SCOPES = [
    ("Odświeżenie", "Nowy kolor i czytelne linie na istniejącej nawierzchni.", ["grunt i 2 warstwy farby", "standardowe linie", "z granulatem: amortyzacja i antypoślizg"], f"{PV[0]['netPerM2']}–{PV[1]['netPerM2']} zł/m²"),
    ("Court design", "Autorski wzór: pola kolorów, geometria, grafika jak mural.", ["4–6 kolorów, wzory Signature i Kompozytor", "7+ kolorów: murale, gradienty", "wzór i kolory w Studio 3D, plan malowania"], f"{PV[2]['netPerM2']}–{PV[3]['netPerM2']} zł/m²"),
    ("Branding", "Barwy i znak miasta, szkoły, klubu albo marki w polu gry, na bandach albo obok boiska.", ["projekt bez utraty czytelności gry", "zestaw „Marka”: Overprint", "turnieje i aktywacje"], "wycena do projektu"),
]
EX = {"plain": "boisko szkolne do odświeżenia", "plain-granulate": "plac, na którym dzieci się przewracają",
      "pattern": "osiedle, które chce mieć swój znak", "pattern-advanced": "miejsce do zdjęć, grafika jak mural"}
PRESETS = [("Panna Play · 30,1 m²", 30.1), ("3 na 3 · 15 × 10 m", 150), ("Kosz · 28 × 15 m", 420), ("Wielofunkcyjne · 19 × 32 m", 608)]

CSS = GFB_CSS + """
.gfb-kitbig{position:relative;margin:0;background:#E6E0DA;overflow:hidden}
.gfb-kitbig img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover}
.gfa .gfb-kitbig figcaption{position:absolute;left:10px;bottom:10px;margin:0;padding:6px 10px;background:rgba(28,9,18,.84);color:#fff;font-size:13px}
.gfa .gfb-kitbig figcaption b{display:inline;color:var(--lime);font-size:13px}
/* scopes */
.gfb-scopes{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.gfb-scopes > li{display:flex;flex-direction:column;gap:10px;padding:24px;background:#fff;border:1px solid var(--line)}
.gfb-scopes .q{font-size:13px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--violet)}
.gfb-scopes b{font-size:clamp(24px,2.2vw,32px);letter-spacing:-.035em;line-height:1.05}
.gfb-scopes p{margin:0;color:var(--muted);font-size:15px}
.gfb-scopes ul{margin:0;padding-left:18px;font-size:14px;color:#5A4652;display:grid;gap:4px}
.gfb-scopes ul li{display:list-item;padding:0;border:0;background:none}
.gfb-scopes .pr{margin-top:auto;padding-top:12px;border-top:1px solid var(--line);font-weight:800}
/* paint variants + quick calc */
.gfb-pv{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.gfb-pv li{display:flex;flex-direction:column;gap:8px;padding:22px;background:#fff;border:1px solid var(--line)}
.gfb-pv .n{font-size:13px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--violet)}
.gfb-pv b{font-size:clamp(28px,2.6vw,40px);font-weight:800;letter-spacing:-.04em;line-height:1}
.gfb-pv b small{font-size:15px;font-weight:600;letter-spacing:0;color:var(--muted)}
.gfb-pv p{margin:0;color:#5A4652;font-size:15px}
.gfb-pv .ex{font-size:14px;color:var(--muted)}.gfb-pv .ex i{font-style:normal;font-weight:700;color:var(--ink)}
.gfb-pv .cost{margin-top:auto;padding-top:10px;border-top:1px solid var(--line);font-size:14px;color:var(--muted)}
.gfb-pv .cost output{display:block;font-size:22px;font-weight:800;letter-spacing:-.02em;color:var(--ink)}
.gfb-qc{display:flex;flex-wrap:wrap;align-items:end;gap:10px 16px;margin:0 0 14px;padding:16px 18px;background:#fff;border:1px solid var(--line)}
.gfb-qc label{display:block;margin:0 0 6px;font-size:13px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.gfb-qc input{width:140px;min-height:48px;padding:0 12px;border:1.5px solid #CDBFC6;border-radius:10px;font:inherit;font-size:16px;color:var(--ink)}
.gfb-qc .gfb-presets{margin:0}
.gfb-presets{display:flex;flex-wrap:wrap;gap:6px}
.gfb-presets button{min-height:40px;padding:0 12px;border-radius:999px;border:1.5px solid #CDBFC6;background:#fff;color:var(--ink);font:inherit;font-size:13px;font-weight:700;cursor:pointer}
.gfb-presets button:hover,.gfb-presets button[aria-pressed=true]{border-color:var(--violet);background:#EEE8FF}
/* kits gallery */
.gfb-kits{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px}
.gfb-kits li{grid-column:span 2}
.gfb-kits li:nth-child(1),.gfb-kits li:nth-child(2){grid-column:span 3}
.gfb-kits a{display:flex;flex-direction:column;height:100%;background:#fff;border:1px solid var(--line);text-decoration:none;overflow:hidden}
.gfb-kits a:hover{border-color:var(--violet)}
.gfb-kits .ph{position:relative;overflow:hidden;background:#E6E0DA}
.gfb-kits img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;transition:transform .8s cubic-bezier(.2,.7,.2,1)}
.gfb-kits a:hover img{transform:scale(1.04)}
.gfb-kits .seg{position:absolute;top:10px;left:10px;padding:5px 10px;border-radius:999px;background:var(--lime);color:#1F2A6B;font-weight:800;font-size:12px}
.gfb-kits .tx{display:grid;gap:4px;padding:16px 18px 18px}
.gfb-kits b{font-size:20px;letter-spacing:-.02em}
.gfb-kits span.d2{color:var(--muted);font-size:14px}
.gfb-kits .go{margin-top:4px;color:var(--violet);font-weight:800;font-size:14px}
.gfb-looks{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.gfb-looks figure{margin:0;background:#fff;border:1px solid var(--line)}
.gfb-looks img{display:block;width:100%;aspect-ratio:16/10;object-fit:cover;background:#E6E0DA}
.gfb-looks figcaption{padding:14px 16px;font-size:14px;color:var(--muted)}.gfb-looks figcaption b{display:block;color:var(--ink);font-size:17px}
.gfb-graf{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.gfb-graf a{display:flex;flex-direction:column;height:100%;background:#fff;border:1px solid var(--line);text-decoration:none;overflow:hidden}
.gfb-graf a:hover{border-color:var(--violet)}
.gfb-graf .ph{overflow:hidden;background:#E6E0DA}
.gfb-graf img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;transition:transform .8s cubic-bezier(.2,.7,.2,1)}
.gfb-graf a:hover img{transform:scale(1.04)}
.gfb-graf .tx{display:grid;gap:6px;padding:18px 20px 20px}
.gfb-graf b{font-size:21px;letter-spacing:-.02em}
.gfb-graf .d2{color:var(--muted);font-size:15px}
.gfb-graf .go{margin-top:4px;color:var(--violet);font-weight:800;font-size:14px}
/* masters */
.gfb-masters{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;counter-reset:m}
.gfb-masters li{padding:20px;border:1px solid rgba(244,241,238,.2);counter-increment:m}
.gfb-masters li::before{content:"0" counter(m);display:block;margin-bottom:10px;color:var(--lime);font-weight:800;font-size:13px;letter-spacing:.06em}
.gfb-masters b{display:block;font-size:22px;letter-spacing:-.02em;color:#fff}
.gfb-masters span{display:block;margin-top:6px;font-size:14px;color:rgba(244,241,238,.85)}
.gfb-masters i{display:block;margin-top:2px;font-style:normal;font-size:13px;color:rgba(244,241,238,.6)}
/* murals: inline SVG cards from the engine */
.gfb-murals{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.gfb-murals a{display:flex;flex-direction:column;height:100%;background:#fff;border:1px solid var(--line);text-decoration:none;overflow:hidden}
.gfb-murals a:hover{border-color:var(--violet)}
.gfb-murals .ph{display:block;background:#E6E0DA;overflow:hidden}.gfb-murals svg{display:block;width:100%;height:auto;transition:transform .8s cubic-bezier(.2,.7,.2,1)}
.gfb-murals a:hover svg{transform:scale(1.04)}
.gfb-murals .tx{display:grid;gap:4px;padding:14px 16px 16px}.gfb-murals b{font-size:19px;letter-spacing:-.02em}
.gfb-murals .d2{color:var(--muted);font-size:14px}.gfb-murals .ms{font-size:12.5px;font-weight:700;color:#5A4652}
.gfb-murals .go{margin-top:2px;color:var(--violet);font-weight:800;font-size:14px}
.gfb-trend{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:0 0 14px;padding:0;list-style:none}
.gfb-trend li{padding:16px 18px;background:#fff;border:1px solid var(--line);font-size:14.5px;color:#5A4652}.gfb-trend b{display:block;color:var(--ink);font-size:16px;margin-bottom:2px}
/* paint plan */
.gfb-plan{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:18px;align-items:start}
.gfb-plan figure{margin:0;background:#fff;border:1px solid var(--line);padding:10px}.gfb-plan figure svg{display:block;width:100%;height:auto}
.gfb-plan figcaption{margin-top:8px;font-size:13.5px;color:var(--muted)}
.gfb-plan table{width:100%;border-collapse:collapse;background:#fff;border:1px solid var(--line);font-size:14.5px;font-variant-numeric:tabular-nums}
.gfb-plan th,.gfb-plan td{padding:9px 10px;border-bottom:1px solid var(--line);text-align:left}.gfb-plan th{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.gfb-plan td.n,.gfb-plan th.n{text-align:right}.gfb-plan .sw{display:inline-block;width:14px;height:14px;border-radius:4px;border:1px solid rgba(0,0,0,.2);vertical-align:-2px;margin-right:6px}
.gfb-plan .tbl{overflow-x:auto}.gfb-plan ul{margin:14px 0 0;padding-left:18px;color:#5A4652;font-size:15px;display:grid;gap:6px}
/* rules */
.gfb-rules{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.gfb-rules li{display:flex;flex-direction:column;gap:8px;padding:22px;background:#fff;border:1px solid var(--line)}
.gfb-rules b{font-size:clamp(28px,2.6vw,40px);font-weight:800;letter-spacing:-.04em;line-height:1;color:var(--violet)}
.gfb-rules strong{font-size:18px}
.gfb-rules p{margin:0;color:var(--muted);font-size:15px}
.gfb-lines{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0 0;padding:0;list-style:none}
.gfb-lines li{display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:0 14px;border-radius:999px;background:#fff;border:1px solid var(--line);font-weight:700;font-size:14px}
.gfb-lines i{width:16px;height:16px;border-radius:50%;border:1px solid rgba(0,0,0,.2)}
@media (max-width:1100px){.gfb-pv,.gfb-masters,.gfb-rules,.gfb-murals{grid-template-columns:repeat(2,minmax(0,1fr))}.gfb-kits{grid-template-columns:repeat(2,minmax(0,1fr))}.gfb-kits li,.gfb-kits li:nth-child(1),.gfb-kits li:nth-child(2){grid-column:span 1}.gfb-kits li:nth-child(1){grid-column:1/-1}}
@media (max-width:900px){.gfb-scopes,.gfb-looks,.gfb-graf,.gfb-trend,.gfb-plan{grid-template-columns:minmax(0,1fr)}}
@media (max-width:560px){.gfb-pv,.gfb-masters,.gfb-rules,.gfb-kits{grid-template-columns:minmax(0,1fr)}.gfb-qc input{width:100%}}
"""


def studio(k):
    seg, arena, model, file, pattern, variant, palette, panel, frame, surf, space = k
    return "/studio/?" + urlencode({"arena": arena, "pattern": pattern, "variant": str(variant), "palette": palette, "panel": panel, "frame": frame}).replace("&", "&amp;")


# '&' in URLs would become '&amp;' anyway; never '&&'
first = KITS[0]
hero_fig = (f'<figure class="gfb-kitbig"><img src="{KITS_URL}{first[3]}.webp" alt="{first[2]} z nawierzchnią {first[9]}, widok ze Studio 3D" loading="eager" decoding="async">'
            f'<figcaption>Wzór <b>{first[9]}</b> na {first[2]}, widok ze Studio 3D</figcaption></figure>')

scopes_html = "".join(f'<li><span class="q">{i + 1:02d}</span><b>{t}</b><p>{d}</p><ul>' + "".join(f"<li>{x}</li>" for x in pts) + f'</ul><span class="pr">{pr}</span></li>'
                      for i, (t, d, pts, pr) in enumerate(SCOPES))
pv_html = "".join(f'<li><span class="n">{html.escape(v["name"])}</span><b>{v["netPerM2"]} <small>zł/m² netto</small></b><p>{html.escape(FIN["descriptions"].get(v["id"], ""))}</p>'
                  f'<span class="ex">Na przykład: <i>{EX[v["id"]]}</i></span><span class="cost">Dla Twojego placu<output data-r="{v["netPerM2"]}">—</output></span></li>' for v in PV)
presets = "".join(f'<button type="button" data-a="{a}">{html.escape(n)}</button>' for n, a in PRESETS)
kits_html = "".join(
    f'<li><a href="{studio(k)}"><span class="ph"><img src="{KITS_URL}{k[3]}{"" if i < 2 else "-480"}.webp" alt="{k[2]} z nawierzchnią {k[9]}, widok ze Studio 3D" loading="lazy" decoding="async"><span class="seg">{k[0]}</span></span>'
    f'<span class="tx"><b>{k[9]}</b><span class="d2">{k[2]} · {k[10]} · konstrukcja od {zl(PRICE_BY[k[1]]["constructionFromNet"])} netto</span><span class="go">Otwórz ten wzór w Studio ↗</span></span></a></li>'
    for i, k in enumerate(KITS))
def mural_link(m):
    return "/studio/?" + urlencode({"arena": "p1", "pattern": m["familyId"], "variant": str(m["variant"]), "palette": m["paletteId"]}).replace("&", "&amp;")


murals_html = "".join(
    f'<li><a href="{mural_link(m)}"><span class="ph" aria-hidden="true">{m["svg"]}</span><span class="tx"><b>{html.escape(m["name"])}</b>'
    f'<span class="d2">{html.escape(m["useCase"])}</span><span class="ms">{m["paints"]} farb · ok. {m["tape"]} m taśmy na 15 × 10 m</span><span class="go">Otwórz w Studio ↗</span></span></a></li>'
    for m in PREV["murals"])
plan_rows = "".join(f'<tr><td>{i + 1}</td><td><span class="sw" style="background:{c}"></span>{c}{(" · " + note) if note else ""}</td><td class="n">{m2}</td><td class="n">{l}</td><td class="n">{t}</td></tr>'
                    for i, (c, note, m2, l, t) in enumerate(PLAN_SAMPLE["layers"]))
masters_html = "".join(f'<li><b>{n}</b><span>{m}</span><i>{d}</i></li>' for n, a, d in MASTERS for m in [a])
looks = [("2026/10/Gamefields-Studio-%E2%80%94-Organic-Flow-768x432.webp", "Organic Flow", "płynne formy, 7+ kolorów"),
         ("2026/10/Studio-Urban-Contrast.webp", "Urban Contrast", "mocne kontrasty na miejski plac"),
         ("2026/10/Studio-Classic-Lines.webp", "Classic Lines", "czytelne linie do kilku gier")]
looks_html = "".join(f'<li><figure>{img(p, "Wzór nawierzchni " + n + " w Studio Gamefields")}<figcaption><b>{n}</b>{d}</figcaption></figure></li>' for p, n, d in looks)

GRAFIKA = [
    ("2026/11/IMG_4969-768x1024.jpg", "Czerwień i czerń, grafika z serii Sztuka z gry w ramie", "Sztuka z gry", "Seria grafik w czerni, bieli i czerwieni: koła, ślady i rytm z boiska przeniesione na papier. Ten sam język form trafia potem na nawierzchnie.", "/sztuka-z-gry/", "Zobacz serię →"),
    ("2026/11/gamefields-plakat-sciana.webp", "Plakat Gamefields z wzorem boiska na ścianie", "Plakat z Twoim boiskiem", "Sam wzór na pełnym spadzie, bez napisów. Druk na papierze archiwalnym, numerowana edycja. 30 × 40 cm 99 zł, 50 × 70 cm 149 zł, 70 × 100 cm 199 zł brutto.", "/#plakaty", "Projektuj plakat →"),
    ("2026/11/12-768x574.jpg", "Event Head & Shoulders na arenie Gamefields, Złote Tarasy", "Branding i aktywacje", "Barwy i znak marki na nawierzchni i bandach, turnieje i treści z wydarzenia. Arena mobilna od 27 000 zł netto.", "/aktywacje-sportowe-dla-marek/", "Dla marek →"),
]
graf_html = "".join(f'<li><a href="{h}"><span class="ph">{img(p, a)}</span><span class="tx"><b>{t}</b><span class="d2">{d}</span><span class="go">{g}</span></span></a></li>' for p, a, t, d, h, g in GRAFIKA)

STEPS = [
    ("Zdjęcia i wymiary", "Pokazujesz plac, ja sprawdzam stan nawierzchni, spadki i odwodnienie.", "mówię wprost, czy wystarczy malowanie."),
    ("Kierunek", "Wybierasz styl: odświeżenie, mural, wzór Kompozytora albo Masters, albo barwy marki.", f"{N_PATTERNS} wzorów w Studio 3D, każdy w 12 wariantach."),
    ("Projekt wzoru", "Wzór, kolory i linie na wymiarach Twojego boiska, z ceną.", "karta projektu i plan malowania PDF ze Studia."),
    ("Przygotowanie", "Mycie, szlifowanie, wypełnienie rys, grunt i warstwa wyrównująca.", "naprawy podłoża wyceniam po zdjęciach."),
    ("Malowanie i odbiór", "Farby z granulatem gumowym, wzór, linie, odbiór.", "12 miesięcy gwarancji i opieka po odbiorze."),
]
steps_html = "".join(f'<li><b>{t}</b><p>{d}</p><span class="gf">{g}</span></li>' for t, d, g in STEPS) + \
    "".join(f'<li class="ph">{img(p, a)}</li>' for p, a in [("2026/11/malowanie-macro-768x576.webp", "Farba sportowa z liniami z bliska"),
                                                          ("2026/10/Studio-Classic-Lines.webp", "Wzór Classic Lines w Studio Gamefields"),
                                                          ("2026/11/granulat-macro-768x576.webp", "Nawierzchnia z granulatem z bliska")])

FAQ = [
    ("Ile kosztuje malowanie boiska?",
     f"Od {PMIN} zł/m² (jeden kolor, grunt, 2 warstwy farby i linie) do {PMAX} zł/m² (wzór 7+ kolorów na bazie z granulatem) netto. Dla boiska 28 × 15 m (420 m²) to od {zl(420 * PMIN)} netto. Naprawy podłoża wyceniam po zdjęciach."),
    ("Czy można pomalować istniejące boisko betonowe albo asfaltowe?",
     "Tak, jeśli powierzchnia jest stabilna i dobrze przygotowana: mycie, szlifowanie, wypełnienie rys, grunt i warstwa wyrównująca. Stan podłoża oceniam ze zdjęć, zanim dobiorę technologię."),
    ("Czy projektujecie wzór, czy tylko go wykonujecie?",
     f"Jedno i drugie. Wzór możesz zaprojektować sam w Studio 3D ({N_PATTERNS} wzorów, w tym murale, każdy w 12 wariantach i z paletami), mogę przygotować projekt od zera albo wykonać zaakceptowaną identyfikację."),
    ("Czy skomplikowany wzór da się dobrze namalować?",
     "Wzory w Studiu są projektowane do malowania: tylko płaskie kształty, gradient to schodkowe pasy. Każdy wzór Kompozytora i Murali jest sprawdzany automatycznie: najwęższy fragment ma co najmniej ok. 20 cm na boisku 15 × 10 m, wzór używa 3–5 farb, nie ma drobnych plamek, a obie połowy są symetryczne albo, w muralach, równie bogate. Do Studia trafiają tylko wzory, które przeszły kontrolę."),
    ("Czy wykonawca dostanie plan malowania?",
     "Tak, przy malowanej nawierzchni na boisku prostokątnym. W podsumowaniu projektu w Studio pobierasz plan malowania PDF: rysunek z siatką co 1 m do wytyczenia, farby w kolejności z powierzchnią, litrami i taśmą oraz kolejność prac. Liczy się z Twojego wzoru i wymiarów, więc nadaje się do przetargu albo dla własnej ekipy. Dla boisk okrągłych i wielokątnych oraz projektów z dodatkowymi grafikami plan przygotowuję indywidualnie."),
    ("Czy na boisku można umieścić logotypy?",
     "Tak. Branding może być w polu gry, na bandach, w strefach poza boiskiem albo na wyposażeniu. Projektuję go tak, żeby nie zaburzał czytelności gry."),
    ("Czy wykonujecie same linie sportowe?",
     "Tak. Linie do piłki, koszykówki, 3 na 3 albo kilku gier naraz, także bez zmiany całego wyglądu. Kolor linii (biały, czarny albo limonkowy) dobieram do najlepszego kontrastu z nawierzchnią."),
    ("Czym różni się farba z granulatem od zwykłej?",
     "To elastyczna powłoka z gumą: lepiej amortyzuje krok, nie ślizga się i przykrywa drobne rysy. Wzory wielokolorowe kładę na takiej bazie."),
    ("Kiedy można malować?",
     "Na suchy beton przy dodatniej temperaturze, zwykle od wiosny do jesieni. Projekt i wycenę można przygotować wcześniej, także zimą."),
]

QC_JS = """<script>(function(){var box=document.querySelector('.gfb [data-qc]');if(!box)return;var a=box.querySelector('input'),outs=document.querySelectorAll('.gfb [data-r]');
function fmt(n){return String(Math.round(n)).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'\\u00a0')+'\\u00a0zł'}
function render(){var v=Math.max(0,parseFloat(String(a.value).replace(',','.'))||0);outs.forEach(function(o){var r=+o.getAttribute('data-r');o.textContent=v?fmt(Math.ceil(Math.round(v*r*100)/10000)*100):'—'})}
box.querySelectorAll('[data-a]').forEach(function(b){b.addEventListener('click',function(){a.value=b.getAttribute('data-a');box.querySelectorAll('[data-a]').forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});render()})});
a.addEventListener('input',function(){box.querySelectorAll('[data-a]').forEach(function(x){x.setAttribute('aria-pressed','false')});render()});render();})();</script>"""

jump = [("zakres", "Zakres"), ("ceny", "Ceny"), ("wzory", "Wzory ze Studia"), ("murale", "Murale"), ("masters", "Masters II"), ("malowalne", "Malowalne"), ("plan", "Plan malowania"), ("grafika", "Grafika"), ("proces", "Etapy"), ("pytania", "Pytania")]

body = f"""
<section class="gfb-hero"><div class="w top">
  <div>
    <p class="gfb-crumbs"><a href="/">Gamefields</a> / Malowanie i grafika</p>
    <p class="k">Kolor, wzór, linie, branding</p>
    <h1 class="d">Malowanie i grafika boisk.</h1>
    <p class="lead">Od odświeżenia kolorów i linii po autorski court design. Wzór projektujesz w Studio 3D, widzisz cenę, a ja przenoszę go na nawierzchnię farbami sportowymi z gumą.</p>
    <div class="gfa-btns"><a class="gfa-btn" href="#murale">Zobacz murale ↓</a><a class="gfa-btn alt" href="/kontakt/">Wyślij zdjęcia boiska →</a></div>
  </div>
  {hero_fig}
</div>
<div class="w">
  <dl class="gfb-nums">
    <div><dt>Malowanie</dt><dd>od {PMIN} zł/m²<small>netto, grunt, farba i linie</small></dd></div>
    <div><dt>Court design</dt><dd>{FIN['variants'][2]['netPerM2']}–{PMAX} zł/m²<small>wzór 4–6 i 7+ kolorów</small></dd></div>
    <div><dt>Wzory w Studio</dt><dd>{N_PATTERNS}<small>{N_DIRECTIONS} kierunków × 12 wariantów</small></dd></div>
    <div><dt>Gwarancja</dt><dd>12 miesięcy<small>i opieka po odbiorze</small></dd></div>
  </dl>
</div></section>

<nav class="gfb-jump" aria-label="Na tej stronie"><div class="w"><ul role="list">{jump_html(jump)}</ul></div></nav>

<section class="gfa-sec" id="zakres"><div class="w">
  <div class="gfa-head"><div><p class="k">Zakres</p><h2 class="d">Trzy poziomy zmiany.</h2></div><p>Od czytelnych linii po boisko, które staje się znakiem miejsca. Jeśli podłoże wymaga naprawy, zacznij od <a href="/renowacja-boisk/">renowacji</a>.</p></div>
  <ul class="gfb-scopes" role="list">{scopes_html}</ul>
</div></section>

<section class="gfa-sec" id="ceny"><div class="w">
  <div class="gfa-head"><div><p class="k">Ceny</p><h2 class="d">Ile kosztuje malowanie?</h2></div><p>Cztery warianty za m² netto, jak w Studio 3D i w sklepie. Wpisz metraż, a pod każdym wariantem zobaczysz koszt.</p></div>
  <div class="gfb-qc" data-qc><div><label for="gfb-qc-a">Twój plac w m²</label><input id="gfb-qc-a" type="number" min="1" step="0.1" value="420" inputmode="decimal"></div><div class="gfb-presets">{presets}</div></div>
  <ul class="gfb-pv" role="list">{pv_html}</ul>
  <p class="gfb-note">Koszt w górę do 100 zł. {html.escape(FIN['excludes'][0])} <a href="/product/malowanie-farba-sportowa/">Malowanie w sklepie →</a></p>
</div></section>

<section class="gfa-sec" id="wzory"><div class="w">
  <div class="gfa-head"><div><p class="k">Wzory ze Studia</p><h2 class="d">Pięć miejsc, pięć wzorów.</h2></div><p>Gotowe zestawy ze Studia 3D: konstrukcja i nawierzchnia Masters II. Kliknij, a Studio otworzy ten sam wzór, wariant i kolory. Możesz je zmienić i od razu widzisz cenę.</p></div>
  <ul class="gfb-kits" role="list">{kits_html}</ul>
  <ul class="gfb-looks" role="list" style="margin-top:12px">{looks_html}</ul>
</div></section>

<section class="gfa-sec" id="murale"><div class="w">
  <div class="gfa-head"><div><p class="k">Nowość · Murale</p><h2 class="d">Boisko jak mural.</h2></div><p>W USA boiska maluje się jak murale: artysta, cała nawierzchnia, linie gry na wierzchu. Osiem kierunków w tym duchu, każdy w 12 wariantach. Kliknij, a Studio otworzy ten wzór na boisku z ceną.</p></div>
  <ul class="gfb-trend" role="list"><li><b>Od krawędzi do krawędzi</b>Mural zajmuje całe boisko, a linie gry leżą na wierzchu.</li><li><b>Asymetria w równowadze</b>Kompozycja nie musi być lustrzana, ale obie połowy są tak samo bogate.</li><li><b>Znak miejsca</b>Symbole, krajobraz, słowa i wzory tkanin, które mówią, czyje to boisko.</li></ul>
  <ul class="gfb-murals" role="list">{murals_html}</ul>
  <p class="gfb-note">Inspiracje: boiska Project Backboard (Memphis, St Louis), My HomeCourt (Providence), murale w parkach Nowego Jorku i Bostonu. Kierunki przejmują sposób pracy, nie konkretne dzieła. Liczby farb i taśmy z pomiaru wzoru na boisku 15 × 10 m.</p>
</div></section>

<section class="gfa-band" id="masters"><div class="w">
  <div class="gfa-head"><div><p class="k">Masters II</p><h2 class="d">Metoda mistrzów, nie kopia.</h2></div><p>Osiem kierunków w Studio: każdy przejmuje metodę szkoły albo artysty, nie konkretne dzieło. Każdy w 12 wariantach i z własną paletą.</p></div>
  <ul class="gfb-masters" role="list">{masters_html}</ul>
  <ul class="gfa-links"><li><a href="/studio/">Otwórz Studio 3D ↗</a></li><li><a href="/koncepcje/">Koncepcje →</a></li></ul>
</div></section>

<section class="gfa-sec" id="malowalne"><div class="w">
  <div class="gfa-head"><div><p class="k">Malowalne, nie tylko ładne</p><h2 class="d">Wzór, który da się namalować.</h2></div><p>Projekt na ekranie musi przejść na beton bez utraty jakości i bez utraty gry. Dlatego wzory w Studio mają zasady.</p></div>
  <ul class="gfb-rules" role="list">
    <li><b>~20 cm</b><strong>Najwęższy pas</strong><p>Każdy pas, komórka i kontur ma co najmniej ok. 20 cm na boisku 15 × 10 m. W Kompozytorze i Muralach sprawdza to program na każdym wzorze.</p></li>
    <li><b>3–5</b><strong>Farb we wzorze</strong><p>Od trzech do pięciu farb z palety, bez drobnych plamek, których nie da się okleić.</p></li>
    <li><b>1 : 1</b><strong>Obie połowy</strong><p>Symetria względem środka boiska, a w muralach równowaga: obie połowy są tak samo bogate, więc obie drużyny grają na tym samym.</p></li>
    <li><b>0</b><strong>Gradientów z ekranu</strong><p>Tylko płaskie kształty. Gradient to schodkowe pasy, które da się pomalować.</p></li>
  </ul>
  <ul class="gfb-lines" role="list"><li><i style="background:#fff"></i>Linie białe</li><li><i style="background:#111"></i>czarne</li><li><i style="background:#D8F24A"></i>limonkowe</li><li>Kolor linii dobieram do najlepszego kontrastu</li><li>Piłka · kosz · 3 na 3 · kilka gier naraz</li></ul>
</div></section>

<section class="gfa-sec" id="plan"><div class="w">
  <div class="gfa-head"><div><p class="k">Dla wykonawcy</p><h2 class="d">Plan malowania z Twojego wzoru.</h2></div><p>Przy malowanym boisku prostokątnym pobierasz w podsumowaniu projektu w Studio plan malowania PDF: trzy strony A4, które wykonawca bierze na plac. Liczy się z Twojego wzoru, kolorów i wymiarów.</p></div>
  <div class="gfb-plan">
    <figure><span aria-hidden="true">{PREV["plan"]}</span><figcaption>Przykład: Pejzaż na boisku 15 × 10 m z siatką co 1 m (pełna linia co 5 m) do wytyczenia sznurkiem kredowym.</figcaption></figure>
    <div>
      <div class="tbl"><table><thead><tr><th>Krok</th><th>Farba</th><th class="n">m²</th><th class="n">Litry</th><th class="n">Taśma, m</th></tr></thead><tbody>{plan_rows}</tbody></table></div>
      <ul><li><b>{PLAN_SAMPLE["paints"]} farb, {PLAN_SAMPLE["litres"]} l, {PLAN_SAMPLE["tape"]} m taśmy</b> ({PLAN_SAMPLE["rolls"]} rolki) dla tego przykładu, przy 0,25 l/m² na warstwę, 2 warstwach i 10 % zapasu.</li>
        <li>Najpierw tło na całe boisko, potem farby od najjaśniejszej do najciemniejszej.</li>
        <li>Taśma tylko na granicach z farbą już położoną, więc każda krawędź jest oklejana raz.</li>
        <li>Rysunek boiska po każdym kroku i kolejność prac: podłoże, grunt, warstwy, linie gry.</li></ul>
      <div class="gfa-btns" style="margin-top:16px"><a class="gfa-btn" href="/studio/?arena=p1&amp;pattern=pro-m-landscape&amp;variant=1&amp;palette=simultane">Zrób plan dla swojego wzoru ↗</a></div>
    </div>
  </div>
</div></section>

<section class="gfa-sec" id="grafika"><div class="w">
  <div class="gfa-head"><div><p class="k">Grafika</p><h2 class="d">Grafika także poza boiskiem.</h2></div><p>Wzory z boiska żyją też na papierze, na ścianie i w kampaniach. Ten sam język form, od nawierzchni po plakat.</p></div>
  <ul class="gfb-graf" role="list">{graf_html}</ul>
</div></section>

<section class="gfa-sec" id="proces"><div class="w">
  <div class="gfa-head"><div><p class="k">Etapy</p><h2 class="d">Z ekranu na nawierzchnię.</h2></div><p>Pięć kroków od zdjęcia placu do pierwszego meczu na nowym wzorze.</p></div>
  <ol class="gfb-steps">{steps_html}</ol>
</div></section>

<section class="gfa-sec" id="pytania"><div class="w">
  <div class="gfa-head"><div><p class="k">Pytania</p><h2 class="d">Court design, który nadal jest boiskiem.</h2></div><p>Koszty, podłoże, wzory, logotypy i linie.</p></div>
  <div class="gfa-faq">{faq_html(FAQ)}</div>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><div><p class="k">Dalej</p><h2 class="d">Kolor to część całego boiska.</h2></div><p>Zanim pomalujesz, sprawdź podłoże i nawierzchnię.</p></div>
  <ul class="gfb-next" role="list">
    <li><a href="/renowacja-boisk/"><i>Przed malowaniem</i><b>Renowacja boisk</b><span>Naprawa i grunt, kiedy plac ma rysy i ubytki.</span></a></li>
    <li><a href="/nawierzchnie-sportowe/"><i>Podłoże</i><b>Nawierzchnie sportowe</b><span>EPDM, akryl, trawa i guma z cenami.</span></a></li>
    <li><a href="/projektowanie-boisk/"><i>Kierunek wizualny</i><b>Projektowanie boisk</b><span>Koncepcja całego miejsca gry.</span></a></li>
  </ul>
  <ul class="gfb-who" role="list"><li><a href="/aktywacje-sportowe-dla-marek/"><span>Dla</span>marek</a></li><li><a href="/boiska-dla-szkol/"><span>Dla</span>szkół</a></li><li><a href="/dla-miast/"><span>Dla</span>miast</a></li><li><a href="/boiska-do-koszykowki/">Boiska do koszykówki</a></li><li><a href="/koncepcje/">Koncepcje</a></li></ul>
</div></section>

<section class="gfa-cta"><div class="w">
  <h2 class="d">Chcesz zmienić<br>wygląd boiska?</h2>
  <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Wyślij zdjęcia boiska →</a><a class="gfa-btn alt" href="/studio/">Zaprojektuj wzór ↗</a></div>
</div></section>
"""

ld = {"@context": "https://schema.org", "@graph": [
    {"@type": "Service", "@id": URL + "#usluga", "name": "Malowanie i grafika boisk", "serviceType": "Malowanie boisk, court design i grafika", "url": URL, "inLanguage": "pl-PL",
     "areaServed": {"@type": "Country", "name": "Polska"}, "provider": {"@id": SITE + "#studio"},
     "description": "Malowanie boisk farbami sportowymi z granulatem gumowym: odświeżenie, linie, murale na boisku, wzory Kompozytora i Masters ze Studia 3D z planem malowania dla wykonawcy, branding.",
     "offers": {"@type": "AggregateOffer", "priceCurrency": "PLN", "lowPrice": PMIN, "highPrice": PMAX, "offerCount": len(PV),
                "priceSpecification": {"@type": "UnitPriceSpecification", "unitText": "m²", "valueAddedTaxIncluded": False}}},
    {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Gamefields", "item": SITE},
                                                    {"@type": "ListItem", "position": 2, "name": "Malowanie boisk", "item": URL}]},
    {"@type": "FAQPage", "@id": URL + "#pytania", "inLanguage": "pl-PL",
     "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]}]}

write(HERE, "malowanie-boisk", CSS, ld, body, QC_JS)
