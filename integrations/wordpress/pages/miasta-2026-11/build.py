#!/usr/bin/env python3
"""/dla-miast/ (page 3464), rebuilt 23.11.2026 in the .gfb style. Footer link: "Miasta".

Output: dla-miast.html (one wp:html block, the whole content of the page).

For cities: start from the problem of the place (empty square, worn court, too little space, no activity), pick by
area (interactive), why a panna arena works in a city, realizations as task / solution / effect, the "Miasto" kit
for a participatory budget, concepts for Warsaw, opening and activation, process, FAQ. Facts from the live page
(problems, area ranges, opening), pages/samorzady-2026-11 (realizacje dla miast, dofinansowanie), the homepage kits
and author block, /koncepcje/ and offer/*.json.
"""
import html
import pathlib
import sys
from urllib.parse import urlencode

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from gfb_common import (BASE, FIN, GFB_CSS, PAINT, PRICE, SITE, SLAB, UP, img, jump_html, faq_html, write, zl)  # noqa: E402

URL = SITE + "dla-miast/"
PB = {m["id"]: m for m in PRICE["models"]}
PMIN = min(v["netPerM2"] for v in FIN["variants"])
KITS_URL = "/wp-content/themes/gamefields/assets/js/home/kits/"
CITY_KIT = "/studio/?" + urlencode({"arena": "circle-cage-1", "pattern": "pro-garden", "variant": "3", "palette": "burle-marx", "panel": "1F5E3A", "frame": "1B1B1B"}).replace("&", "&amp;")


def full(mid):
    return PB[mid]["constructionFromNet"] + SLAB[mid]["net"] + PAINT[mid]


CSS = GFB_CSS + """
.gfb-hero figure.kit{margin:0;background:#D23A26;overflow:hidden;position:relative}
.gfb-hero figure.kit img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover}
.gfa .gfb-hero figure.kit figcaption{position:absolute;left:10px;bottom:10px;margin:0;padding:6px 10px;background:rgba(28,9,18,.84);color:#fff;font-size:13px}
/* problems */
.gfb-pr{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.gfb-pr > li{display:flex;flex-direction:column;gap:10px;padding:22px;background:#fff;border:1px solid var(--line)}
.gfb-pr .n{font-size:13px;font-weight:800;letter-spacing:.06em;color:var(--violet)}
.gfb-pr b{font-size:22px;letter-spacing:-.025em;line-height:1.1}
.gfb-pr p{margin:0;color:#5A4652;font-size:15px}
.gfb-pr .fx{padding:10px 12px;background:var(--paper);font-size:14px;color:var(--ink)}
.gfb-pr .fx::before{content:"Rozwiązanie: ";font-weight:800;color:var(--violet)}
.gfb-pr .pr{margin-top:auto;font-weight:800;font-size:15px}
.gfb-pr a{color:var(--violet);font-weight:800;font-size:14px;text-decoration:none}
/* area picker */
.gfb-ar{display:flex;flex-wrap:wrap;align-items:end;gap:10px 16px;margin:0 0 14px;padding:16px 18px;background:#fff;border:1px solid var(--line)}
.gfb-ar label{display:block;margin:0 0 6px;font-size:13px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.gfb-ar input{width:160px;min-height:48px;padding:0 12px;border:1.5px solid #CDBFC6;border-radius:10px;font:inherit;font-size:16px;color:var(--ink)}
.gfb-ar output{font-size:15px;font-weight:700}
.gfb-ranges{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}
.gfb-ranges li{display:flex;flex-direction:column;gap:6px;padding:18px 16px;background:#fff;border:1.5px solid var(--line);transition:border-color .2s ease,background .2s ease}
.gfb-ranges li.on{border-color:var(--violet);background:#EEE8FF}
.gfb-ranges b{font-size:clamp(22px,2vw,30px);font-weight:800;letter-spacing:-.04em;color:var(--violet)}
.gfb-ranges strong{font-size:17px;line-height:1.15}
.gfb-ranges span{font-size:14px;color:#5A4652}
.gfb-ranges a{margin-top:auto;padding-top:6px;color:var(--violet);font-weight:800;font-size:14px;text-decoration:none}
/* why */
.gfb-why{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:0}
.gfb-why div{padding:20px;border:1px solid rgba(244,241,238,.2)}
.gfb-why dt{font-size:21px;font-weight:800;color:#fff;letter-spacing:-.02em}
.gfb-why dd{margin:8px 0 0;font-size:15px;color:rgba(244,241,238,.85)}
/* cases */
.gfb-cases{display:grid;gap:12px}
.gfb-cases article{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,8fr);gap:clamp(16px,2.4vw,32px);padding:clamp(16px,2vw,22px);background:#fff;border:1px solid var(--line);align-items:start}
.gfb-cases img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;background:#E6E0DA}
.gfb-cases .pl{margin:0 0 4px;color:var(--violet);font-weight:800;font-size:14px}
.gfb-cases h3{font-size:clamp(26px,2.6vw,38px);font-weight:800;letter-spacing:-.04em;line-height:1}
.gfb-cases dl{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:14px 0 0}
.gfb-cases dl div{padding:12px 14px;background:var(--paper)}
.gfb-cases dt{font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--violet)}
.gfb-cases dd{margin:6px 0 0;font-size:15px;color:#5A4652}
.gfb-cases blockquote{margin:14px 0 0;padding:0 0 0 14px;border-left:4px solid var(--violet);font-size:16px;font-weight:600;line-height:1.45}
.gfb-cases cite{display:block;margin-top:6px;font-style:normal;font-size:14px;color:var(--muted)}
.gfb-cases .ln{display:inline-block;margin-top:10px;color:var(--violet);font-weight:800;font-size:14px}
/* kit band */
.gfb-kitb{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,6fr);gap:clamp(20px,3vw,48px);align-items:center}
.gfb-kitb img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;background:#D23A26}
.gfb-kitb ul{margin:14px 0 0;padding-left:20px;display:grid;gap:6px;font-size:16px;color:#5A4652}
.gfb-kitb .pr{margin:14px 0 0;font-size:18px;font-weight:800}
/* concepts row */
.gfb-cr{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.gfb-cr a{display:flex;flex-direction:column;height:100%;background:#fff;border:1px solid var(--line);text-decoration:none;overflow:hidden}
.gfb-cr a:hover{border-color:var(--violet)}
.gfb-cr img{display:block;width:100%;aspect-ratio:16/10;object-fit:cover;background:#E6E0DA}
.gfb-cr .tx{display:grid;gap:4px;padding:14px 16px 16px;color:var(--ink)}
.gfb-cr b{font-size:19px;letter-spacing:-.02em}.gfb-cr .nt{font-size:14px;color:var(--muted)}
.gfb-cr .tag{justify-self:start;padding:3px 8px;border-radius:999px;background:var(--paper);font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase}
/* activation */
.gfb-act{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:12px}
.gfb-act .ph{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.gfb-act .ph img{display:block;width:100%;aspect-ratio:1;object-fit:cover;background:#E6E0DA}
.gfb-act ul{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.gfb-act li{padding:16px 18px;background:#fff;border:1px solid var(--line)}
.gfb-act li b{display:block;font-size:18px;letter-spacing:-.02em}
.gfb-act li span{font-size:15px;color:#5A4652}
.gfa-logos{list-style:none;margin:16px 0 0;padding:0;display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px}
.gfa-logos li{display:grid;place-items:center;height:96px;padding:12px;background:#fff;border:1px solid var(--line);overflow:hidden}
.gfa-logos img{display:block;max-width:100%;max-height:72px;width:auto;height:auto;object-fit:contain;transform:scale(var(--z,1))}
@media (max-width:1100px){.gfb-pr,.gfb-why{grid-template-columns:repeat(2,minmax(0,1fr))}.gfb-ranges{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:900px){.gfb-cases article,.gfb-kitb,.gfb-act,.gfb-cr{grid-template-columns:minmax(0,1fr)}.gfb-cases dl{grid-template-columns:minmax(0,1fr)}.gfa-logos{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:560px){.gfb-pr,.gfb-why,.gfb-ranges{grid-template-columns:minmax(0,1fr)}.gfb-ar input{width:100%}}
"""

PROBLEMS = [
    ("01", "Pusta przestrzeń", "Mały plac, fragment parku, dziedziniec albo niewykorzystany teren.", "arena panna na płycie betonowej, wpisana w zieleń i dojścia.",
     f"komplet od {zl(full('circle-cage-1'))} netto", "#metraz", "Dobierz do metrażu ↓"),
    ("02", "Zużyte boisko", "Istniejący plac, który może dostać nowe życie zamiast rozbiórki.", "naprawa podłoża, farby z gumą, wzór i linie do kilku gier.",
     f"malowanie od {PMIN} zł/m² netto", "/renowacja-boisk/", "Renowacja boisk →"),
    ("03", "Za mało miejsca", "Klasyczne boisko się nie mieści, a młodzież nie ma gdzie grać.", "format 1 na 1 albo 3 na 3: arena mieści się na placu o boku 5–7 m.",
     f"konstrukcja od {zl(PB['circle-cage-1']['constructionFromNet'])} netto", "/boiska-street-football/", "Modele i ceny →"),
    ("04", "Brak aktywności", "Boisko stoi, ale nikt nie gra albo miejsce nie ma charakteru.", "nowy wzór, turniej na otwarcie i formaty cykliczne.",
     f"arena mobilna od {zl(PB['mobile']['constructionFromNet'])} netto", "#aktywacja", "Otwarcie i aktywacja ↓"),
]
pr_html = "".join(f'<li><span class="n">{n}</span><b>{t}</b><p>{d}</p><span class="fx">{fx}</span><span class="pr">{pr}</span><a href="{h}">{g}</a></li>' for n, t, d, fx, pr, h, g in PROBLEMS)

RANGES = [(30, 60, "30–60 m²", "Boisko 1 na 1, panna", "Panna Ring, Play, Cage 90 i 180, Octa", "/boiska-street-football/"),
          (60, 120, "60–120 m²", "Strefa techniki i małej gry", "Panna Court, Panna Grid albo dwie areny", "/boiska-street-football/"),
          (120, 250, "120–250 m²", "Piłka uliczna 3 na 3", "Street Arena 15: 15 × 10 m", "/product/street-arena-15/"),
          (250, 500, "250–500 m²", "Rozbudowana strefa piłki ulicznej", "3 na 3 i areny 1 na 1 obok siebie", "/projektowanie-boisk/"),
          (500, 100000, "500 m²+", "Projekt indywidualny", "boisko wielofunkcyjne, plac z kilkoma funkcjami", "/projektowanie-boisk/")]
ranges_html = "".join(f'<li data-lo="{lo}" data-hi="{hi}"><b>{lab}</b><strong>{t}</strong><span>{d}</span><a href="{h}">Zobacz →</a></li>' for lo, hi, lab, t, d, h in RANGES)

WHY = [("Mała powierzchnia", "Arena mieści się na placu o boku od około 5 do 7 m, obok istniejących boisk."),
       ("Trwałość", "Panna Ring na Orliku w Grodzisku Mazowieckim stoi od 10 lat bez uszkodzeń."),
       ("Gra bez organizacji", "Wystarczą dwie osoby i piłka. Bez zapisów, trenera i rezerwacji."),
       ("Czytelny znak", "Kolorowa konstrukcja i nawierzchnia przyciągają wzrok i porządkują plac.")]
why_html = "".join(f"<div><dt>{t}</dt><dd>{d}</dd></div>" for t, d in WHY)

CASES = [
    ("2024/12/Areny-Panna-Football-Alternative-Soccer-Warszawa-3-768x576.jpg", "Taras w Parku Świętokrzyskim, Warszawa", "Warszawa, Park Świętokrzyski", "Taras pod Pałacem Kultury",
     "Wielofunkcyjna przestrzeń rekreacji w centrum, przy metrze i Pałacu Kultury. Inwestycja tymczasowa.",
     "Trzy areny Panna Ring połączone z tarasem i rampą do skateboardingu. Inwestor: Zarząd Zieleni m.st. Warszawy.",
     "Jedno z najpopularniejszych miejsc spotkań warszawskiej młodzieży; pisał o nim m.in. New York Times.",
     ("Trzy boiska połączone z tarasem i rampą do skateboardingu dały mocny efekt wizualny i przyciągają bardzo dużo młodzieży.", "Grzegorz Gądek, Prezes Fundacji Skwery Sportów Miejskich"), "taras"),
    ("2025/06/IMG_6608-scaled-e1749983082809-768x696.jpg", "Panna Octa w Kutnie", "Kutno, pasaż sportowy", "Panna Octa w Kutnie",
     "Stałe miejsce do gry dla młodzieży na miejskim pasażu sportowym.", "Ośmiokątna arena Panna Octa, zamówiona przez Urząd Miasta Kutno.",
     "Realizacja bez zastrzeżeń, boisko cieszy się dużą popularnością wśród młodzieży.",
     ("Realizacja przebiegła bez zastrzeżeń. Boisko Panna Octa na pasażu sportowym w Kutnie cieszy się dużą popularnością wśród młodzieży.", "Beata Rafalska, Urząd Miasta Kutno, ds. inwestycji"), "kutno"),
    ("2026/11/Krakow-Panna-Arena-Octa-Cage-90-Gamefields-768x768.jpg", "Panna Octa Cage 90 w parku, Kraków", "Kraków, teren miejski", "Od planu do parku",
     "Arena na terenie miejskim, wpisana w plan zagospodarowania.", "Panna Octa Cage 90: projekt na planie, montaż, odbiór.",
     "Gotowa arena w parku. Ten sam proces prowadzę dla gmin: koncepcja, wizualizacja, parametry i dokumenty.", None, "krakow"),
    ("2024/12/9-768x432.jpg", "Panna Ring na Orliku, Grodzisk Mazowiecki", "Grodzisk Mazowiecki, Orlik", "Arena przy Orliku",
     "Dodatkowa strefa gry na istniejącym obiekcie sportowym, dla gry 1 na 1 i w małych grupach.", "Arena Panna Ring na terenie Orlika OSiR.",
     "Stoi od 10 lat i przez cały ten czas spełnia swoją rolę bez żadnych uszkodzeń.",
     ("Boisko Panna Ring stoi na naszym Orliku od 10 lat i przez cały ten czas spełnia swoją rolę bez żadnych uszkodzeń.", "Mariusz Smysło, Dyrektor OSiR Grodzisk Mazowiecki"), "orlik"),
]
cases_html = "".join(
    f'<article>{img(p, a)}<div><p class="pl">{pl}</p><h3>{t}</h3><dl><div><dt>Zadanie</dt><dd>{z}</dd></div><div><dt>Rozwiązanie</dt><dd>{r}</dd></div><div><dt>Efekt</dt><dd>{e}</dd></div></dl>'
    + (f'<blockquote>„{html.escape(q[0])}”<cite>{q[1]}</cite></blockquote>' if q else "") + f'<a class="ln" href="/realizacje-gamefields/#{cid}">Historia realizacji →</a></div></article>'
    for p, a, pl, t, z, r, e, q, cid in CASES)

LOGOS = ('<ul class="gfa-logos" role="list">'
         f'<li style="--z:1.3"><img src="{UP}2026/11/LOGO-Warszawa--300x194.png" alt="Miasto stołeczne Warszawa" width="300" height="194" loading="lazy" decoding="async"></li>'
         f'<li style="--z:1.7"><img src="{UP}2026/11/Zarzad-Zieleni-Miejskiej-Warszawa-300x141.jpg" alt="Zarząd Zieleni m.st. Warszawy" width="300" height="141" loading="lazy" decoding="async"></li>'
         f'<li style="--z:1"><img src="{UP}2026/11/LOHO-Krakow--300x200.jpg" alt="Kraków" width="300" height="200" loading="lazy" decoding="async"></li>'
         f'<li style="--z:1.6"><img src="{UP}2026/11/Grodzisk-Mazowiecki-LOGO-300x200.jpg" alt="Grodzisk Mazowiecki" width="300" height="200" loading="lazy" decoding="async"></li>'
         f'<li style="--z:1"><img src="{UP}2026/11/LOGO-Kutno--300x231.jpg" alt="Kutno" width="300" height="231" loading="lazy" decoding="async"></li>'
         f'<li style="--z:1.15"><img src="{UP}2026/11/LOGO-Lodz-300x139.webp" alt="Łódź" width="300" height="139" loading="lazy" decoding="async"></li></ul>')

CONC = [("2026/11/IMG_1050-768x492.jpg", "Plac pod Pałacem Kultury", "miejsca do gry w posadzce placu"),
        ("2026/10/51.jpg", "Pod Mostem Łazienkowskim", "boisko w miejscu pustego betonu"),
        ("2026/11/pole-mokotowskie-po-720.webp", "Pole Mokotowskie", "stary plac, nowy wzór Organic Flow")]
conc_html = "".join(f'<li><a href="/koncepcje/">{img(p, t + ", wizualizacja")}<span class="tx"><span class="tag">wizualizacja</span><b>{t}</b><span class="nt">{d}</span></span></a></li>' for p, t, d in CONC)

STEPS = [("Pokaż miejsce", "Lokalizacja, zdjęcia, przybliżone wymiary.", "nie potrzebujesz specyfikacji."),
         ("Określamy potrzeby", "Kto ma grać, jak często, co dzieje się wokół.", "rozmowa, nie formularz."),
         ("Dobieramy format", "1 na 1, 3 na 3, renowacja albo projekt indywidualny.", "dobór do metrażu i budżetu."),
         ("Projektujemy", "Układ, konstrukcja, nawierzchnia, kolory.", "Studio 3D i karta projektu PDF."),
         ("Realizujemy", "Produkcja, przygotowanie, montaż albo renowacja.", "12 miesięcy gwarancji."),
         ("Uruchamiamy", "Turniej na otwarcie i formaty cykliczne, jeśli chcesz.", "eventy od 2008 roku.")]
steps_html = "".join(f'<li><b>{t}</b><p>{d}</p><span class="gf">{g}</span></li>' for t, d, g in STEPS) + \
    "".join(f'<li class="ph">{img(p, a)}</li>' for p, a in [("2026/11/Gamefields-x-boiska-x-Projekt-Krakow--768x768.jpg", "Plan z arenami, Kraków"),
                                                          ("2026/11/Gamefields-x-Panna-Cage-x-Krakow-montaz-768x576.jpg", "Montaż areny, Kraków")])

FAQ = [
    ("Ile kosztuje arena w parku albo na placu?",
     f"Panna Cage 90 kosztuje od {zl(PB['circle-cage-1']['constructionFromNet'])} netto, a z płytą betonową i malowaniem od {zl(full('circle-cage-1'))} netto. Boisko 3 na 3 (Street Arena 15) od {zl(PB['street15']['constructionFromNet'])} netto. Montaż, transport i przygotowanie terenu liczę po zdjęciach."),
    ("Ile miejsca potrzeba?",
     "Arena 1 na 1 mieści się na placu o boku od około 5 do 7 m. Na 30–60 m² zmieści się panna, na 120–250 m² boisko 3 na 3, powyżej 500 m² proponuję projekt indywidualny. Do tego strefa bezpieczeństwa wokół."),
    ("Czy pomagacie w budżecie obywatelskim?",
     "Tak. Zestaw „Miasto” (Panna Cage 90 + wzór Garden Plan) to komplet materiałów do budżetu obywatelskiego: koncepcja, wizualizacja i cena orientacyjna do formularza."),
    ("Skąd miasto może wziąć pieniądze?",
     "Programy Ministerstwa Sportu (m.in. modernizacja Orlików), programy województw, budżet obywatelski, fundusz sołecki, Fundusze Europejskie na rewitalizację albo partner, który finansuje arenę z logo na bandach. Przygotuję część techniczną wniosku."),
    ("Czy arena jest bezpieczna w przestrzeni ogólnodostępnej?",
     "Konstrukcje są stalowe i zamknięte bandami, a Panna Ring stoi na ogólnodostępnym Orliku od 10 lat bez uszkodzeń. Nawierzchnie mają normy: EPDM PN-EN 14877, płyty gumowe PN-EN 1177 z atestem PZH."),
    ("Czy możecie pomóc uruchomić miejsce po otwarciu?",
     "Tak. Mogę zorganizować turniej na otwarcie z prowadzeniem i muzyką oraz zaproponować formaty cykliczne. Turnieje organizuję od 2008 roku, w 2017 zorganizowałem Mistrzostwa Świata Freestival Street Games."),
    ("Czy odnowicie stare miejskie boisko?",
     f"Tak. Oceniam plac ze zdjęć, naprawiam podłoże i kładę farby sportowe z gumą (od {PMIN} zł/m² netto) albo nową nawierzchnię. Gdy podłoże jest zniszczone, proponuję nową płytę ({BASE['rateNetPerM2']} zł/m²)."),
    ("Jak wygląda współpraca z urzędem?",
     "Możesz zlecić pojedynczy etap albo cały proces: analizę, koncepcję, projekt, realizację i otwarcie. Dostajesz karty techniczne i certyfikaty do dokumentacji przetargowej oraz 12 miesięcy gwarancji."),
]

AR_JS = """<script>(function(){var b=document.querySelector('.gfb [data-ar]');if(!b)return;var i=b.querySelector('input'),o=b.querySelector('output'),li=document.querySelectorAll('.gfb [data-lo]');
function r(){var a=parseFloat(String(i.value).replace(',','.'))||0,hit=null;li.forEach(function(x){var on=a>=+x.getAttribute('data-lo');if(on){if(a>=+x.getAttribute('data-hi'))on=false}if(a<30){on=false}x.classList.toggle('on',on);if(on)hit=x});
o.textContent=a<30?(a?'Poniżej 30 m²: napisz, sprawdzę, co się zmieści.':''):(hit?'Pasuje: '+hit.querySelector('strong').textContent:'')}
i.addEventListener('input',r);r();})();</script>"""

jump = [("problem", "Problem miejsca"), ("metraz", "Ile miejsca"), ("dlaczego", "Dlaczego arena"), ("realizacje", "Realizacje"), ("budzet", "Budżet obywatelski"),
        ("aktywacja", "Otwarcie"), ("proces", "Proces"), ("pytania", "Pytania")]

body = f"""
<section class="gfb-hero"><div class="w top">
  <div>
    <p class="gfb-crumbs"><a href="/">Gamefields</a> / Miasta</p>
    <p class="k">Dla miast i samorządów</p>
    <h1 class="d">Więcej gry z mniejszej przestrzeni.</h1>
    <p class="lead">Puste place, stare boiska i fragmenty parków zamieniam w miejsca codziennej gry. Od koncepcji i wniosku, przez realizację, po turniej na otwarcie.</p>
    <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Pokaż mi miejsce →</a><a class="gfa-btn alt" href="{CITY_KIT}">Zestaw „Miasto” w Studio ↗</a></div>
  </div>
  <figure class="kit"><img src="{KITS_URL}miasto.webp" alt="Panna Cage 90 z nawierzchnią Garden Plan, zestaw dla miasta, widok ze Studio 3D" loading="eager" decoding="async"><figcaption>Zestaw „Miasto”: Panna Cage 90 + Garden Plan</figcaption></figure>
</div>
<div class="w">
  <dl class="gfb-nums">
    <div><dt>Arena</dt><dd>od {zl(PB['circle-cage-1']['constructionFromNet'])}<small>netto, Panna Cage 90</small></dd></div>
    <div><dt>Plac</dt><dd>5–7 m<small>tyle wystarczy na arenę 1 na 1</small></dd></div>
    <div><dt>Trwałość</dt><dd>10 lat<small>na Orliku, bez uszkodzeń</small></dd></div>
    <div><dt>Miasta</dt><dd>7<small>od Warszawy po Gdańsk</small></dd></div>
  </dl>
</div></section>

<nav class="gfb-jump" aria-label="Na tej stronie"><div class="w"><ul role="list">{jump_html(jump)}</ul></div></nav>

<section class="gfa-sec" id="problem"><div class="w">
  <div class="gfa-head"><div><p class="k">Problem miejsca</p><h2 class="d">Nie zaczynam od produktu.</h2></div><p>Nie musisz wiedzieć, czy potrzebujesz areny, boiska 3 na 3 czy renowacji. Pokaż teren, jego skalę i użytkowników. Najpierw rozwiązanie, potem technologia.</p></div>
  <ul class="gfb-pr" role="list">{pr_html}</ul>
</div></section>

<section class="gfa-sec" id="metraz"><div class="w">
  <div class="gfa-head"><div><p class="k">Ile miejsca</p><h2 class="d">Wpisz metraż placu.</h2></div><p>Podświetlę format, który pasuje. Dokładnie w skali sprawdzisz to w planerze <a href="/#planer">„Zmieści się?”</a>.</p></div>
  <div class="gfb-ar" data-ar><div><label for="gfb-ar-a">Powierzchnia placu w m²</label><input id="gfb-ar-a" type="number" min="1" step="1" value="45" inputmode="numeric"></div><output aria-live="polite"></output></div>
  <ul class="gfb-ranges" role="list">{ranges_html}</ul>
</div></section>

<section class="gfa-band" id="dlaczego"><div class="w">
  <div class="gfa-head"><div><p class="k">Dlaczego arena</p><h2 class="d">Argumenty zamawiających.</h2></div><p>To słyszę od urzędów, ośrodków sportu i zarządców zieleni, którzy już mają nasze areny.</p></div>
  <dl class="gfb-why">{why_html}</dl>
</div></section>

<section class="gfa-sec" id="realizacje"><div class="w">
  <div class="gfa-head"><div><p class="k">Realizacje</p><h2 class="d">Zadanie, rozwiązanie, efekt.</h2></div><p>Cztery miejsca w czterech miastach. Także Żyrardów i Gdańsk. <a href="/realizacje-dla-miast/">Realizacje dla miast →</a></p></div>
  <div class="gfb-cases">{cases_html}</div>
  {LOGOS}
</div></section>

<section class="gfa-sec" id="budzet"><div class="w">
  <div class="gfb-kitb">
    <img src="{KITS_URL}miasto.webp" alt="Zestaw Miasto: Panna Cage 90 z nawierzchnią Garden Plan" loading="lazy" decoding="async">
    <div><p class="k">Budżet obywatelski</p><h2 class="d" style="font-size:clamp(40px,5vw,80px)">Zestaw „Miasto”.</h2>
      <p class="lead" style="margin:16px 0 0;font-size:18px;color:var(--muted)">Mała arena jako punkt spotkań w parku. Komplet materiałów do budżetu obywatelskiego.</p>
      <ul><li>Panna Cage 90 i nawierzchnia Garden Plan (park, skwer, plac)</li><li>koncepcja i wizualizacja na zdjęciu miejsca</li><li>cena orientacyjna do formularza zgłoszenia</li></ul>
      <p class="pr">konstrukcja od {zl(PB['circle-cage-1']['constructionFromNet'])} netto · z płytą i malowaniem od {zl(full('circle-cage-1'))}</p>
      <div class="gfa-btns" style="margin-top:18px"><a class="gfa-btn" href="{CITY_KIT}">Otwórz zestaw w Studio ↗</a><a class="gfa-btn alt" href="/dofinansowanie-boisk/">Źródła finansowania →</a></div></div>
  </div>
</div></section>

<section class="gfa-sec" id="koncepcje"><div class="w">
  <div class="gfa-head"><div><p class="k">Koncepcje</p><h2 class="d">Pomysły dla Warszawy.</h2></div><p>Miejsca, które dopiero mogą powstać: plac, przestrzeń pod mostem, stary plac do odnowienia. <a href="/koncepcje/">Wszystkie koncepcje →</a></p></div>
  <ul class="gfb-cr" role="list">{conc_html}</ul>
</div></section>

<section class="gfa-sec" id="aktywacja"><div class="w">
  <div class="gfa-head"><div><p class="k">Otwarcie</p><h2 class="d">Boisko ma działać po otwarciu.</h2></div><p>Największą wartością nie jest konstrukcja, tylko miejsce, do którego ludzie wracają. Dlatego łączę infrastrukturę z praktyką piłki ulicznej i wydarzeń.</p></div>
  <div class="gfb-act">
    <div class="ph">{img("2024/12/1-4-768x768.jpg", "Mistrzostwa Świata Street Soccer 2017, Grodzisk Mazowiecki")}{img("2024/12/5-3-768x768.jpg", "Mistrzostwa Polski, Street Mekka, Łódź")}</div>
    <ul role="list">
      <li><b>Turniej na otwarcie</b><span>Prowadzenie, muzyka i lokalna aktywacja w dniu startu.</span></li>
      <li><b>Formaty cykliczne</b><span>Ligi i spotkania, które utrzymują zainteresowanie miejscem.</span></li>
      <li><b>Doświadczenie</b><span>Turnieje od 2008 roku, Mistrzostwa Świata Freestival Street Games 2017, Puchar Polski, Mistrzostwa Polski.</span></li>
      <li><b>Arena mobilna</b><span>Na festyn albo dzień miasta, wynajem i sprzedaż od {zl(PB['mobile']['constructionFromNet'])} netto. <a href="/wynajem-boisk-mobilnych/" style="color:var(--violet);font-weight:700">Szczegóły →</a></span></li>
    </ul>
  </div>
</div></section>

<section class="gfa-sec" id="proces"><div class="w">
  <div class="gfa-head"><div><p class="k">Proces</p><h2 class="d">Jeden partner, kilka etapów.</h2></div><p>Możesz zlecić pojedynczy etap albo cały proces, od analizy miejsca po otwarcie.</p></div>
  <ol class="gfb-steps">{steps_html}</ol>
</div></section>

<section class="gfa-sec" id="pytania"><div class="w">
  <div class="gfa-head"><div><p class="k">Pytania</p><h2 class="d">Zanim złożysz zamówienie.</h2></div><p>Koszty, miejsce, finansowanie, bezpieczeństwo i współpraca z urzędem.</p></div>
  <div class="gfa-faq">{faq_html(FAQ)}</div>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><div><p class="k">Dalej</p><h2 class="d">Więcej dla samorządów.</h2></div><p>Finansowanie, szkoły i referencje.</p></div>
  <ul class="gfb-next" role="list">
    <li><a href="/dofinansowanie-boisk/"><i>Finansowanie</i><b>Dofinansowanie boisk</b><span>Nabory 2027, źródła i wymagania.</span></a></li>
    <li><a href="/boiska-dla-szkol/"><i>Szkoły i gminy</i><b>Boiska dla szkół i gmin</b><span>Licznik naborów i część techniczna wniosku.</span></a></li>
    <li><a href="/realizacje-dla-miast/"><i>Referencje</i><b>Realizacje dla miast</b><span>Orlik, Kutno, Taras pod PKiN.</span></a></li>
  </ul>
  <ul class="gfb-who" role="list"><li><a href="/boiska-street-football/">Modele i ceny</a></li><li><a href="/renowacja-boisk/">Renowacja boisk</a></li><li><a href="/projektowanie-boisk/">Projektowanie boisk</a></li><li><a href="/eventy-sportowe/">Eventy sportowe</a></li><li><a href="/koncepcje/">Koncepcje</a></li></ul>
</div></section>

<section class="gfa-cta"><div class="w">
  <h2 class="d">Masz miejsce do<br>zagospodarowania?</h2>
  <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Pokaż mi miejsce →</a><a class="gfa-btn alt" href="/studio/">Zaprojektuj w Studio ↗</a></div>
</div></section>
"""

ld = {"@context": "https://schema.org", "@graph": [
    {"@type": "Service", "@id": URL + "#usluga", "name": "Boiska dla miast i samorządów", "serviceType": "Projekt, realizacja i aktywacja miejskich przestrzeni sportowych", "url": URL, "inLanguage": "pl-PL",
     "areaServed": {"@type": "Country", "name": "Polska"}, "provider": {"@id": SITE + "#studio"},
     "audience": {"@type": "Audience", "audienceType": "miasta, gminy, zarządy zieleni, ośrodki sportu"},
     "description": "Areny panna i boiska 3 na 3 na małych placach, renowacja miejskich boisk, materiały do budżetu obywatelskiego i wniosków, turniej na otwarcie."},
    {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Gamefields", "item": SITE},
                                                    {"@type": "ListItem", "position": 2, "name": "Miasta", "item": URL}]},
    {"@type": "FAQPage", "@id": URL + "#pytania", "inLanguage": "pl-PL",
     "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]}]}

write(HERE, "dla-miast", CSS, ld, body, AR_JS)
