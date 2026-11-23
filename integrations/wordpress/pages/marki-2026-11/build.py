#!/usr/bin/env python3
"""/aktywacje-sportowe-dla-marek/ (page 3704), rebuilt 23.11.2026 in the .gfb style. Footer link: "Marki i agencje".

Output: aktywacje-sportowe-dla-marek.html (one wp:html block, the whole content of the page).

For brands and agencies: brands and events already done (Head & Shoulders at Złote Tarasy, Gdańsk stadium and Legia,
UEFA Champions League, world championships), four formats (branded court, tournament or challenge, pop-up, a lasting
place in the city), the "Marka" kit, where the brand goes on the court, the scope from idea to content, the author as
organiser, what to put in a brief, FAQ. Facts from the live page (scope, formats), the Realizacje page (events and
brands), the homepage kits, the funding page (brand-funded arena) and offer/*.json. Production prices are quoted per brief.
"""
import html
import pathlib
import sys
from urllib.parse import urlencode

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from gfb_common import (GFB_CSS, MODELS, PAINT, PRICE, SITE, SLAB, UP, img, jump_html, faq_html, write, zl)  # noqa: E402

URL = SITE + "aktywacje-sportowe-dla-marek/"
PB = {m["id"]: m for m in PRICE["models"]}
KITS_URL = "/wp-content/themes/gamefields/assets/js/home/kits/"
BRAND_KIT = "/studio/?" + urlencode({"arena": "street15", "pattern": "pro-overprint", "variant": "1", "palette": "martens", "panel": "E5383B", "frame": "1E1E1E"}).replace("&", "&amp;")


def full(mid):
    return PB[mid]["constructionFromNet"] + SLAB[mid]["net"] + PAINT[mid]


CSS = GFB_CSS + """
.gfb-hero figure.kit{margin:0;background:#47132D;overflow:hidden;position:relative}
.gfb-hero figure.kit img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover}
.gfa .gfb-hero figure.kit figcaption{position:absolute;left:10px;bottom:10px;margin:0;padding:6px 10px;background:rgba(28,9,18,.84);color:#fff;font-size:13px}
.gfb-brands{display:flex;flex-wrap:wrap;gap:8px;margin:0;padding:0;list-style:none}
.gfb-brands li{display:inline-flex;align-items:center;min-height:44px;padding:0 18px;border-radius:999px;background:var(--lime);color:#1F2A6B;font-weight:800;font-size:15px}
.gfb-ev{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.gfb-ev li{position:relative;overflow:hidden;background:#2a1520}
.gfb-ev img{display:block;width:100%;height:100%;aspect-ratio:4/3;object-fit:cover;transition:transform .6s cubic-bezier(.2,.7,.2,1)}
.gfb-ev li:hover img{transform:scale(1.05)}
.gfb-ev span{position:absolute;left:8px;right:8px;bottom:8px;padding:8px 10px;background:rgba(28,9,18,.84);color:#fff;font-size:13px;line-height:1.3}
.gfb-ev span b{display:block;font-size:14px}
.gfb-fmt{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.gfb-fmt > li{display:flex;flex-direction:column;gap:10px;padding:22px;background:#fff;border:1px solid var(--line)}
.gfb-fmt .n{font-size:13px;font-weight:800;letter-spacing:.06em;color:var(--violet)}
.gfb-fmt b{font-size:22px;letter-spacing:-.025em;line-height:1.1}
.gfb-fmt p{margin:0;color:#5A4652;font-size:15px}
.gfb-fmt .pr{margin-top:auto;padding-top:10px;border-top:1px solid var(--line);font-weight:800;font-size:15px}
.gfb-fmt a{color:var(--violet);font-weight:800;font-size:14px;text-decoration:none}
.gfb-kitb{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,6fr);gap:clamp(20px,3vw,48px);align-items:center}
.gfb-kitb img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;background:#47132D}
.gfb-kitb ul{margin:14px 0 0;padding-left:20px;display:grid;gap:6px;font-size:16px;color:rgba(244,241,238,.88)}
.gfb-kitb .pr{margin:14px 0 0;font-size:18px;font-weight:800;color:#fff}
.gfb-kitb p.l{margin:16px 0 0;font-size:18px;color:rgba(244,241,238,.85)}
.gfb-kitb .gfa-btn{background:var(--lime);color:#1F2A6B!important}
.gfb-kitb .gfa-btn.alt{background:transparent;border:1.5px solid rgba(244,241,238,.5);color:var(--paper)!important}
.gfb-where{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:0}
.gfb-where div{padding:20px 22px;background:#fff;border:1px solid var(--line)}
.gfb-where dt{font-size:19px;font-weight:800;letter-spacing:-.02em}
.gfb-where dd{margin:6px 0 0;font-size:15px;color:#5A4652}
.gfb-scope{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;counter-reset:s}
.gfb-scope li{padding:20px 22px;background:#fff;border:1px solid var(--line);counter-increment:s}
.gfb-scope li::before{content:counter(s,decimal-leading-zero);display:block;margin-bottom:8px;color:var(--violet);font-weight:800;font-size:13px}
.gfb-scope b{display:block;font-size:19px;letter-spacing:-.02em}
.gfb-scope span{display:block;margin-top:6px;font-size:15px;color:#5A4652}
.gfb-org{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(20px,3vw,48px);align-items:center}
.gfb-org .ph{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.gfb-org .ph img{display:block;width:100%;aspect-ratio:1;object-fit:cover;background:#2a1520}
.gfb-org p.l{margin:16px 0 0;font-size:17px;color:rgba(244,241,238,.85)}
.gfb-tl{list-style:none;margin:20px 0 0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.gfb-tl li{padding:12px 14px;border:1px solid rgba(244,241,238,.2);font-size:14px;color:rgba(244,241,238,.85)}
.gfb-tl b{display:block;font-size:20px;color:var(--lime)}
@media (max-width:1100px){.gfb-fmt,.gfb-where{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:900px){.gfb-kitb,.gfb-org{grid-template-columns:minmax(0,1fr)}.gfb-scope{grid-template-columns:repeat(2,minmax(0,1fr))}.gfb-ev{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:560px){.gfb-fmt,.gfb-where,.gfb-scope,.gfb-tl{grid-template-columns:minmax(0,1fr)}}
"""

BRANDS = ["Head &amp; Shoulders", "UEFA Champions League", "Legia Warszawa", "Mistrzostwa Świata 2017", "Superball, Liberec"]
brands_html = "".join(f"<li>{b}</li>" for b in BRANDS)

EVENTS = [("2026/11/1-768x576.jpg", "Event Head &amp; Shoulders", "Stadion, Gdańsk"),
          ("2024/12/10-768x432.jpg", "Turniej Head &amp; Shoulders", "Legia Warszawa"), ("2024/12/13-768x432.jpg", "UEFA Champions League", "event z areną panna"),
          ("2024/12/1-4-768x768.jpg", "Mistrzostwa Świata Street Soccer 2017", "Grodzisk Mazowiecki"), ("2024/12/22-768x432.jpg", "Mistrzostwa Świata Superball", "Liberec"),
          ("2026/11/GAMEFIELDS-Street-Football-Tournament-1-768x576.png", "Turniej street football", "Arena Gamefields")]
ev_html = "".join(f'<li><img src="{UP}{p}" alt="{html.unescape(t)}, {w}" loading="lazy" decoding="async"><span><b>{t}</b>{w}</span></li>' for p, t, w in EVENTS)

FMT = [("01", "Pop-up sport", "Modułowa arena w galerii, na festiwalu albo w miejskiej lokalizacji. Montaż na czas kampanii.", f"arena mobilna od {zl(PB['mobile']['constructionFromNet'])} netto (wynajem i sprzedaż)", "/wynajem-boisk-mobilnych/", "Arena mobilna →"),
       ("02", "Turniej lub challenge", "1 na 1, 3 na 3 albo inna mechanika uczestnictwa, z prowadzeniem i muzyką.", "wycena do briefu", "#zakres", "Zakres ↓"),
       ("03", "Brandowany court", "Nawierzchnia, bandy i wyposażenie w identyfikacji marki: boisko jako nośnik kampanii.", f"Street Arena 15 od {zl(PB['street15']['constructionFromNet'])} netto", "#marka", "Zestaw „Marka” ↓"),
       ("04", "Stała obecność w mieście", "Marka finansuje arenę w parku, przy szkole albo na osiedlu, a jej logo jest na bandach i nawierzchni.", f"arena od {zl(min(m['constructionFromNet'] for m in MODELS))} netto", "/dofinansowanie-boisk/", "Finansowanie →")]
fmt_html = "".join(f'<li><span class="n">{n}</span><b>{t}</b><p>{d}</p><span class="pr">{pr}</span><a href="{h}">{g}</a></li>' for n, t, d, pr, h, g in FMT)

WHERE = [("Nawierzchnia", "Wzór i kolory marki na całym polu gry; Overprint z kolekcji Masters II jak dwa nałożone systemy pasów."),
         ("Bandy", "Logo i barwy na bandach: widoczne z każdej strony i na każdym zdjęciu z gry."),
         ("Wyposażenie i oprawa", "Bramki, elementy wokół areny, scena prowadzącego i DJ-a."),
         ("Content", "Przestrzeń projektowana pod zdjęcia, wideo i social: widok z góry, kadry z gry.")]
where_html = "".join(f"<div><dt>{t}</dt><dd>{d}</dd></div>" for t, d in WHERE)

SCOPE = [("Koncepcja", "Mechanika aktywacji, sport, grupa odbiorców i rola marki."),
         ("Projekt przestrzeni", "Court design, branding, wyposażenie i ruch uczestników."),
         ("Produkcja", "Budowa albo wynajem infrastruktury, transport i montaż."),
         ("Program sportowy", "Turniej, challenge, trening, pokaz albo otwarta gra."),
         ("Muzyka i oprawa", "DJ, prowadzenie i atmosfera dopasowana do formatu."),
         ("Content", "Przestrzeń i program pod zdjęcia, wideo i komunikację social.")]
scope_html = "".join(f'<li><b>{t}</b><span>{d}</span></li>' for t, d in SCOPE)

FAQ = [
    ("Ile kosztuje aktywacja sportowa dla marki?",
     f"Zależy od formatu. Arena mobilna (wynajem i sprzedaż) od {zl(PB['mobile']['constructionFromNet'])} netto, stały brandowany court 3 na 3 od {zl(PB['street15']['constructionFromNet'])} netto za konstrukcję. Program, prowadzenie, muzykę i content wyceniam do briefu."),
    ("Z jakimi markami pracowaliście?",
     "Między innymi Head & Shoulders (event w Złotych Tarasach w Warszawie, na stadionie w Gdańsku i turniej z Legią Warszawa) oraz event UEFA Champions League z areną panna. Organizowałem też Mistrzostwa Świata Freestival Street Games 2017."),
    ("Czy możecie przygotować tylko boisko bez eventu?",
     "Tak. Zakres może obejmować sam projekt i wykonanie brandowanej przestrzeni albo pełną produkcję wraz z programem sportowym."),
    ("Czy realizujecie mobilne rozwiązania?",
     "Tak. Mobilna arena panna to modułowe bandy i bramki do czasowych aktywacji: galeria, festiwal, stadion, plac miejski. Można ją wynająć albo kupić."),
    ("Czy projektujecie format od zera?",
     "Tak. Zaczynam od briefu marketingowego i proponuję sport, mechanikę uczestnictwa, przestrzeń oraz sposób wykorzystania wydarzenia w komunikacji."),
    ("Jak duże logo zmieści się na boisku?",
     "Na nawierzchni i bandach projektuję je tak, żeby nie zaburzało czytelności gry. Wzór i kolory marki zobaczysz najpierw w Studio 3D, na wybranym modelu."),
    ("Czy marka może sfinansować stałe boisko w mieście?",
     "Tak. To jedno ze źródeł finansowania boisk: firma finansuje arenę, a jej logo jest na bandach i nawierzchni. Dobrze działa przy szkołach, w parkach i na osiedlach."),
    ("Ile czasu potrzeba na przygotowanie aktywacji?",
     "Zależy od formatu i tego, czy arena jest z wynajmu, czy powstaje nowa konstrukcja. Termin podaję po briefie, zanim cokolwiek podpiszemy."),
]

jump = [("marki", "Marki"), ("formaty", "Formaty"), ("marka", "Zestaw Marka"), ("branding", "Branding"), ("zakres", "Zakres"), ("organizator", "Organizator"), ("brief", "Brief"), ("pytania", "Pytania")]

body = f"""
<section class="gfb-hero"><div class="w top">
  <div>
    <p class="gfb-crumbs"><a href="/">Gamefields</a> / Marki i agencje</p>
    <p class="k">Boisko jako medium</p>
    <h1 class="d">Aktywacje sportowe dla marek.</h1>
    <p class="lead">Brandowane boiska, turnieje i pop-upy, w których marka jest częścią gry, a nie banerem obok. Od briefu i court designu, przez produkcję areny, po prowadzenie, muzykę i content.</p>
    <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Wyślij brief →</a><a class="gfa-btn alt" href="{BRAND_KIT}">Zestaw „Marka” w Studio ↗</a></div>
  </div>
  <figure class="kit"><img src="{UP}2026/11/12-768x574.jpg" alt="Event Head &amp; Shoulders na arenie Gamefields, Złote Tarasy, Warszawa" loading="eager" decoding="async"><figcaption>Head &amp; Shoulders, Złote Tarasy, Warszawa</figcaption></figure>
</div>
<div class="w">
  <dl class="gfb-nums">
    <div><dt>Arena mobilna</dt><dd>od {zl(PB['mobile']['constructionFromNet'])}<small>netto, wynajem i sprzedaż</small></dd></div>
    <div><dt>Turnieje</dt><dd>od 2008<small>od lokalnych po mistrzostwa świata</small></dd></div>
    <div><dt>Mistrzostwa Świata</dt><dd>2017<small>organizator, Freestival Street Games</small></dd></div>
    <div><dt>Court 3 na 3</dt><dd>15 × 10 m<small>Street Arena 15</small></dd></div>
  </dl>
</div></section>

<nav class="gfb-jump" aria-label="Na tej stronie"><div class="w"><ul role="list">{jump_html(jump)}</ul></div></nav>

<section class="gfa-sec" id="marki"><div class="w">
  <div class="gfa-head"><div><p class="k">Marki i wydarzenia</p><h2 class="d">Zagrane z markami.</h2></div><p>Mobilne areny panna na eventach marek, turniejach i mistrzostwach. <a href="/realizacje-gamefields/#eventy">Wszystkie eventy →</a></p></div>
  <ul class="gfb-brands" role="list" style="margin-bottom:16px">{brands_html}</ul>
  <ul class="gfb-ev" role="list">{ev_html}</ul>
</div></section>

<section class="gfa-sec" id="formaty"><div class="w">
  <div class="gfa-head"><div><p class="k">Formaty</p><h2 class="d">Marka częścią gry.</h2></div><p>Zamiast stawiać branding obok wydarzenia, projektuję mechanikę i przestrzeń, w których marka jest naturalnym elementem doświadczenia. Na weekend albo na lata.</p></div>
  <ul class="gfb-fmt" role="list">{fmt_html}</ul>
</div></section>

<section class="gfa-band" id="marka"><div class="w">
  <div class="gfb-kitb">
    <img src="{KITS_URL}marka.webp" alt="Zestaw Marka: Street Arena 15 z nawierzchnią Overprint, widok ze Studio 3D" loading="lazy" decoding="async">
    <div><p class="k">Zestaw „Marka”</p><h2 class="d" style="font-size:clamp(40px,5vw,80px)">Boisko jako nośnik kampanii.</h2>
      <p class="l">Turniej, logo i treści z wydarzenia. Event, galeria, festiwal.</p>
      <ul><li>Street Arena 15: 15 × 10 m, gładkie bandy 1 m</li><li>nawierzchnia Overprint (Karel Martens): dwa systemy pasów nadrukowane na siebie</li><li>kolory ramy, paneli i wzoru w barwach marki</li></ul>
      <p class="pr">konstrukcja od {zl(PB['street15']['constructionFromNet'])} netto · komplet od {zl(full('street15'))}</p>
      <div class="gfa-btns" style="margin-top:18px"><a class="gfa-btn" href="{BRAND_KIT}">Otwórz zestaw w Studio ↗</a><a class="gfa-btn alt" href="/wynajem-boisk-mobilnych/">Arena mobilna</a></div></div>
  </div>
</div></section>

<section class="gfa-sec" id="branding"><div class="w">
  <div class="gfa-head"><div><p class="k">Branding</p><h2 class="d">Gdzie marka gra.</h2></div><p>Logo to za mało. Marka może być w całym polu gry, a przestrzeń projektuję tak, żeby dobrze wyglądała w kadrze. <a href="/malowanie-boisk/">Malowanie i grafika →</a></p></div>
  <dl class="gfb-where">{where_html}</dl>
</div></section>

<section class="gfa-sec" id="zakres"><div class="w">
  <div class="gfa-head"><div><p class="k">Zakres</p><h2 class="d">Od pomysłu po działającą przestrzeń.</h2></div><p>Łączę wykonanie infrastruktury z produkcją wydarzenia. Możesz zlecić jeden etap albo całość.</p></div>
  <ol class="gfb-scope" role="list">{scope_html}</ol>
</div></section>

<section class="gfa-band" id="organizator"><div class="w">
  <div class="gfb-org">
    <div class="ph">{img("2024/12/1-4-768x768.jpg", "Mistrzostwa Świata Street Soccer 2017, Grodzisk Mazowiecki")}{img("2024/12/22-768x432.jpg", "Mistrzostwa Świata Superball, Liberec")}{img("2024/12/10-3-768x768.jpg", "Puchar Polski, Żerków")}{img("2024/12/5-3-768x768.jpg", "Mistrzostwa Polski, Street Mekka, Łódź")}</div>
    <div><p class="k">Organizator, nie tylko producent</p><h2 class="d" style="font-size:clamp(40px,5vw,80px)">Wiem, jak zrobić turniej.</h2>
      <p class="l">Damian Gawrych. W pannę gram od 2005 roku, turnieje organizuję od 2008. Aktywację marki prowadzę jak turniej: z zasadami, które rozumieją gracze, i atmosferą, którą widać na zdjęciach.</p>
      <ul class="gfb-tl" role="list"><li><b>2015</b>podium mistrzostw świata, Praga</li><li><b>2017</b>organizator Mistrzostw Świata Freestival Street Games</li><li><b>Puchar Polski</b>Żerków</li><li><b>Mistrzostwa Polski</b>Street Mekka, Łódź</li></ul>
      <ul class="gfa-links"><li><a href="/damian-gawrych/">Kim jestem →</a></li><li><a href="/eventy-sportowe/">Eventy sportowe →</a></li></ul></div>
  </div>
</div></section>

<section class="gfa-sec" id="brief"><div class="w">
  <div class="gfa-head"><div><p class="k">Brief</p><h2 class="d">Co mi wysłać?</h2></div><p>Z tego zbuduję format od przestrzeni po aktywację. Odpowiadam osobiście.</p></div>
  <div class="gfb-prep">
    <div><h3>Brief kampanii</h3><ul class="gfb-check">
      <li><span><b>Cel</b>: zasięg, content, sprzedaż, community.</span></li><li><span><b>Grupa odbiorców</b>: wiek, miasto, zainteresowania.</span></li>
      <li><span><b>Lokalizacja i termin</b>: galeria, festiwal, stadion, plac.</span></li><li><span><b>Czas trwania</b>: jeden dzień, kampania albo stała obecność.</span></li>
      <li><span><b>Budżet</b>: także widełki, jeśli dopiero je ustalacie.</span></li></ul></div>
    <div><h3>Albo zacznij od obrazu</h3><ul class="gfb-check">
      <li><span>Otwórz zestaw „Marka” w Studio 3D.</span></li><li><span>Zmień kolory ramy, paneli i wzoru na barwy marki.</span></li>
      <li><span>Pobierz kartę projektu PDF i dołącz do briefu.</span></li></ul>
      <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Wyślij brief →</a><a class="gfa-btn alt" href="{BRAND_KIT}">Zestaw „Marka” ↗</a></div></div>
  </div>
</div></section>

<section class="gfa-sec" id="pytania"><div class="w">
  <div class="gfa-head"><div><p class="k">Pytania</p><h2 class="d">Sport jako platforma marki.</h2></div><p>Koszty, formaty, mobilność, branding i terminy.</p></div>
  <div class="gfa-faq">{faq_html(FAQ)}</div>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><div><p class="k">Dalej</p><h2 class="d">Od briefu do boiska.</h2></div><p>Arena mobilna, eventy i court design.</p></div>
  <ul class="gfb-next" role="list">
    <li><a href="/wynajem-boisk-mobilnych/"><i>Produkcja</i><b>Arena mobilna</b><span>Wynajem i sprzedaż areny panna na event.</span></a></li>
    <li><a href="/eventy-sportowe/"><i>Wydarzenia</i><b>Eventy sportowe</b><span>Turnieje, pokazy i aktywacje.</span></a></li>
    <li><a href="/malowanie-boisk/"><i>Brand design</i><b>Malowanie i grafika</b><span>Wzór, kolory i logo na nawierzchni.</span></a></li>
  </ul>
  <ul class="gfb-who" role="list"><li><a href="/realizacje-gamefields/#eventy">Turnieje i eventy</a></li><li><a href="/boiska-street-football/">Modele i ceny</a></li><li><a href="/boiska-dla-klubow/"><span>Dla</span>klubów</a></li><li><a href="/dla-miast/"><span>Dla</span>miast</a></li><li><a href="/studio/">Studio 3D</a></li></ul>
</div></section>

<section class="gfa-cta"><div class="w">
  <h2 class="d">Masz brief?<br>Zamieńmy go w grę.</h2>
  <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Wyślij brief →</a><a class="gfa-btn alt" href="{BRAND_KIT}">Zestaw „Marka” ↗</a></div>
</div></section>
"""

ld = {"@context": "https://schema.org", "@graph": [
    {"@type": "Service", "@id": URL + "#usluga", "name": "Aktywacje sportowe dla marek", "serviceType": "Brandowane boiska, turnieje i pop-upy sportowe", "url": URL, "inLanguage": "pl-PL",
     "areaServed": {"@type": "Country", "name": "Polska"}, "provider": {"@id": SITE + "#studio"},
     "audience": {"@type": "BusinessAudience", "audienceType": "marki, agencje eventowe i marketingowe"},
     "description": "Brandowane boiska, turnieje 1 na 1 i 3 na 3, pop-upy z areną mobilną i stała obecność marki w mieście. Koncepcja, produkcja, program, muzyka i content."},
    {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Gamefields", "item": SITE},
                                                    {"@type": "ListItem", "position": 2, "name": "Marki i agencje", "item": URL}]},
    {"@type": "FAQPage", "@id": URL + "#pytania", "inLanguage": "pl-PL",
     "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]}]}

write(HERE, "aktywacje-sportowe-dla-marek", CSS, ld, body)
