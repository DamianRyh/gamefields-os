#!/usr/bin/env python3
"""/wzory-na-boisko/ (new, 28.11.2026): the pattern collections in one place, in the .gfb style.

Output: wzory-na-boisko.html (one wp:html block). Cards are inline SVG rendered by the same engine as the Studio
(integrations/studio/surface-pro-2026-11/export-previews.mjs), with measured paints and masking tape on 15 x 10 m.
Wzory polskie are not in the live Studio yet (Sites deploy pending): their cards link to the contact form instead
of the Studio until STUDIO_HAS_POLISH is set to True.
"""
import html
import json
import pathlib
import subprocess
import sys
from urllib.parse import urlencode

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from gfb_common import (FIN, GFB_CSS, SITE, faq_html, jump_html, write)  # noqa: E402

STUDIO_HAS_POLISH = False
URL = SITE + "wzory-na-boisko/"
ENGINE = HERE.parents[2] / "studio" / "surface-pro-2026-11"
PREV = json.loads(subprocess.run(["node", str(ENGINE / "export-previews.mjs")], capture_output=True, text=True, check=True).stdout)
N_PATTERNS, N_DIRECTIONS = 1116, 93
PV = FIN["variants"]
PMIN, PMAX = min(v["netPerM2"] for v in PV), max(v["netPerM2"] for v in PV)

CSS = GFB_CSS + """
.gfb-wz{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.gfb-wz a{display:flex;flex-direction:column;height:100%;background:#fff;border:1px solid var(--line);text-decoration:none;overflow:hidden}
.gfb-wz a:hover{border-color:var(--violet)}
.gfb-wz .ph{display:block;background:#E6E0DA;overflow:hidden}.gfb-wz svg{display:block;width:100%;height:auto;transition:transform .8s cubic-bezier(.2,.7,.2,1)}
.gfb-wz a:hover svg{transform:scale(1.04)}
.gfb-wz .tx{display:grid;gap:4px;padding:14px 16px 16px}.gfb-wz b{font-size:19px;letter-spacing:-.02em}
.gfb-wz .d2{color:var(--muted);font-size:14px}.gfb-wz .ms{font-size:12.5px;font-weight:700;color:#5A4652}
.gfb-wz .go{margin-top:2px;color:var(--violet);font-weight:800;font-size:14px}
.gfb-wz .tag{justify-self:start;padding:3px 9px;border-radius:999px;background:var(--lime);color:#1F2A6B;font-weight:800;font-size:12px}
.gfb-wzrules{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.gfb-wzrules li{display:flex;flex-direction:column;gap:8px;padding:22px;background:#fff;border:1px solid var(--line)}
.gfb-wzrules b{font-size:clamp(28px,2.6vw,40px);font-weight:800;letter-spacing:-.04em;line-height:1;color:var(--violet)}
.gfb-wzrules strong{font-size:18px}.gfb-wzrules p{margin:0;color:var(--muted);font-size:15px}
@media (max-width:1100px){.gfb-wz,.gfb-wzrules{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:560px){.gfb-wz,.gfb-wzrules{grid-template-columns:minmax(0,1fr)}}
"""


def studio_link(m):
    return "/studio/?" + urlencode({"arena": "p1", "pattern": m["familyId"], "variant": str(m["variant"]), "palette": m["paletteId"]}).replace("&", "&amp;")


def cards(items, live=True, tag=""):
    out = []
    for m in items:
        href = studio_link(m) if live else "/kontakt/?temat=" + urlencode({"w": m["name"]})[2:]
        go = "Otwórz w Studio ↗" if live else "Zapytaj o ten wzór →"
        t = f'<span class="tag">{tag}</span>' if tag else ""
        out.append(f'<li><a href="{href}"><span class="ph" aria-hidden="true">{m["svg"]}</span><span class="tx">{t}<b>{html.escape(m["name"])}</b>'
                   f'<span class="d2">{html.escape(m["useCase"])}</span><span class="ms">{m["paints"]} farb · ok. {m["tape"]} m taśmy na 15 × 10 m</span>'
                   f'<span class="go">{go}</span></span></a></li>')
    return "".join(out)


polish_html = cards(PREV["polish"], STUDIO_HAS_POLISH, "" if STUDIO_HAS_POLISH else "Nowość")
murals_html = cards(PREV["murals"])
composer_html = cards(PREV["composer"])

FAQ = [
    ("Czy wzór z tej strony da się namalować na moim boisku?",
     "Tak. Każdy wzór jest sprawdzany automatycznie: najwęższy fragment ma co najmniej ok. 20 cm na boisku 15 × 10 m, wzór używa 3–5 farb, nie ma drobnych plamek, a obie połowy boiska są tak samo bogate. Do Studia trafiają tylko wzory, które przeszły kontrolę."),
    ("Ile kosztuje boisko z takim wzorem?",
     f"Malowanie wzoru to {FIN['variants'][2]['netPerM2']}–{PMAX} zł/m² netto, zależnie od liczby kolorów. Dokładną cenę dla Twojego boiska pokazuje Studio 3D po wybraniu wzoru."),
    ("Czy mogę zmienić kolory wzoru?",
     "Tak. W Studio wybierasz paletę albo własne kolory. Przy wzorach polskich Studio samo dobiera kolejność farb tak, żeby stykające się pola miały wyraźny kontrast."),
    ("Co dostanie wykonawca?",
     "Przy malowanym boisku prostokątnym pobierasz w Studio plan malowania PDF: rysunek z siatką co 1 m, farby w kolejności z m², litrami i taśmą oraz kolejność prac."),
    ("Czy wzory polskie to kopie konkretnych dzieł?",
     "Nie. Przejmują sposób zdobienia z rzemiosła: płatki wycinanki, pasy pasiaka, kropki ceramiki z Bolesławca, schodki kilimu. Każdy wzór jest generowany od nowa w skali boiska."),
]

jump = [("polskie", "Wzory polskie"), ("murale", "Murale"), ("kompozytor", "Kompozytor"), ("zasady", "Jak sprawdzamy"), ("pytania", "Pytania")]

polish_note = ("Kliknij, a Studio otworzy ten wzór na boisku z ceną." if STUDIO_HAS_POLISH else
               "Nowa kolekcja: w Studio 3D pojawi się w najbliższej aktualizacji. Już teraz możesz zapytać o wybrany wzór.")

body = f"""
<section class="gfb-hero"><div class="w top">
  <div>
    <p class="gfb-crumbs"><a href="/">Gamefields</a> / <a href="/malowanie-boisk/">Malowanie i grafika</a> / Wzory na boisko</p>
    <p class="k">Wzory na nawierzchnię</p>
    <h1 class="d">Wzory na boisko.</h1>
    <p class="lead">Od polskiej wycinanki po mural z amerykańskich boisk. Każdy wzór jest zaprojektowany do malowania i sprawdzony, zanim trafi do Studia 3D, gdzie zobaczysz go na swoim boisku z ceną.</p>
    <div class="gfa-btns"><a class="gfa-btn" href="#polskie">Zobacz wzory polskie ↓</a><a class="gfa-btn alt" href="/studio/">Otwórz Studio 3D ↗</a></div>
  </div>
  <figure class="gfb-kitbig" style="margin:0;background:#fff;border:1px solid var(--line)"><span aria-hidden="true" style="display:block">{PREV["polish"][0]["svg"]}</span></figure>
</div>
<div class="w">
  <dl class="gfb-nums">
    <div><dt>Wzory w Studio</dt><dd>{N_PATTERNS}<small>{N_DIRECTIONS} kierunków × 12 wariantów</small></dd></div>
    <div><dt>Najwęższy pas</dt><dd>~20 cm<small>na boisku 15 × 10 m</small></dd></div>
    <div><dt>Farby we wzorze</dt><dd>3–5<small>bez drobnych plamek</small></dd></div>
    <div><dt>Malowanie wzoru</dt><dd>{FIN['variants'][2]['netPerM2']}–{PMAX} zł/m²<small>netto</small></dd></div>
  </dl>
</div></section>

<nav class="gfb-jump" aria-label="Na tej stronie"><div class="w"><ul role="list">{jump_html(jump)}</ul></div></nav>

<section class="gfa-sec" id="polskie"><div class="w">
  <div class="gfa-head"><div><p class="k">Nowość · Wzory polskie</p><h2 class="d">Z polskiej tradycji.</h2></div><p>Wycinanka łowicka, pasiak, ceramika z Bolesławca, mozaiki modernizmu, kilimy z Podhala, warszawskie neony, parzenica i witraże krakowskiej secesji, przełożone na skalę boiska. {polish_note}</p></div>
  <ul class="gfb-wz" role="list">{polish_html}</ul>
</div></section>

<section class="gfa-sec" id="murale"><div class="w">
  <div class="gfa-head"><div><p class="k">Murale</p><h2 class="d">Boisko jak mural.</h2></div><p>Osiem kierunków po trendzie z amerykańskich boisk: mural od krawędzi do krawędzi, linie gry na wierzchu, obie połowy tak samo bogate.</p></div>
  <ul class="gfb-wz" role="list">{murals_html}</ul>
</div></section>

<section class="gfa-sec" id="kompozytor"><div class="w">
  <div class="gfa-head"><div><p class="k">Kompozytor</p><h2 class="d">Geometria gry.</h2></div><p>Wzory zbudowane z samego boiska: koła środkowego, pól bramkowych, bramek i połów. Spokojne, czytelne, łatwe w malowaniu.</p></div>
  <ul class="gfb-wz" role="list">{composer_html}</ul>
</div></section>

<section class="gfa-sec" id="zasady"><div class="w">
  <div class="gfa-head"><div><p class="k">Malowalne, nie tylko ładne</p><h2 class="d">Jak sprawdzamy wzory.</h2></div><p>Program rysuje setki wersji każdego wzoru, mierzy je i zostawia tylko te, które przechodzą wszystkie kontrole.</p></div>
  <ul class="gfb-wzrules" role="list">
    <li><b>~20 cm</b><strong>Najwęższy pas</strong><p>Żaden fragment nie jest węższy niż ok. 20 cm na boisku 15 × 10 m, więc da się go okleić i pomalować.</p></li>
    <li><b>3–5</b><strong>Farb</strong><p>Od trzech do pięciu farb, bez drobnych plamek. Stykające się pola dostają kontrastowe kolory.</p></li>
    <li><b>1 : 1</b><strong>Obie połowy</strong><p>Symetria albo, w muralach, równowaga: obie drużyny grają na tak samo bogatym boisku.</p></li>
    <li><b>Linie</b><strong>Czytelna gra</strong><p>Krawędzie kolorów nie biegną tuż obok linii boiska, a pola bramkowe zostają spokojne.</p></li>
  </ul>
  <ul class="gfa-links" style="margin-top:16px"><li><a href="/malowanie-boisk/#plan">Plan malowania dla wykonawcy →</a></li><li><a href="/malowanie-boisk/#ceny">Ceny malowania →</a></li></ul>
</div></section>

<section class="gfa-sec" id="pytania"><div class="w">
  <div class="gfa-head"><div><p class="k">Pytania</p><h2 class="d">Wzór, który nadal jest boiskiem.</h2></div><p>Malowanie, kolory, koszt i plan dla wykonawcy.</p></div>
  <div class="gfa-faq">{faq_html(FAQ)}</div>
</div></section>

<section class="gfa-cta"><div class="w">
  <h2 class="d">Wybierz wzór<br>dla swojego boiska.</h2>
  <div class="gfa-btns"><a class="gfa-btn" href="/studio/">Otwórz Studio 3D ↗</a><a class="gfa-btn alt" href="/kontakt/">Wyślij zdjęcia boiska →</a></div>
</div></section>
"""

ld = {"@context": "https://schema.org", "@graph": [
    {"@type": "CollectionPage", "@id": URL + "#wzory", "name": "Wzory na boisko", "url": URL, "inLanguage": "pl-PL",
     "description": "Wzory na nawierzchnię boiska: wzory polskie, murale i Kompozytor, sprawdzone do malowania, w Studio 3D z ceną.",
     "isPartOf": {"@id": SITE + "#website"}},
    {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Gamefields", "item": SITE},
                                                    {"@type": "ListItem", "position": 2, "name": "Malowanie i grafika", "item": SITE + "malowanie-boisk/"},
                                                    {"@type": "ListItem", "position": 3, "name": "Wzory na boisko", "item": URL}]},
    {"@type": "FAQPage", "@id": URL + "#pytania", "inLanguage": "pl-PL",
     "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]}]}

write(HERE, "wzory-na-boisko", CSS, ld, body)
