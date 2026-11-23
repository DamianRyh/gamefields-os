#!/usr/bin/env python3
"""/boiska-dla-szkol/ (page 3701), rebuilt 23.11.2026 in the .gfb style. Footer link: "Szkoły i gminy".

Output: boiska-dla-szkol.html (one wp:html block, the whole content of the page).

For schools and municipalities: the 2027 calls (with a countdown), four scopes (arena at school, Orlik and old court
modernisation, multi-sport court, panna in the gym), recommended models with prices, the six funding sources and what
committees check, what I prepare for the application, documents and norms, realizations with quotes from the city and
OSiR, a plan for 2027, FAQ. Facts from pages/samorzady-2026-11 (dofinansowanie, state 12.11.2026), the homepage
municipalities block and kits, the Realizacje page and offer/*.json. Funding rules are labelled with their edition.
"""
import html
import pathlib
import sys
from urllib.parse import urlencode

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from gfb_common import (BASE, FIN, GFB_CSS, PAINT, PRICE, SITE, SLAB, SLUG, UP, img, jump_html, faq_html, write, zl)  # noqa: E402

URL = SITE + "boiska-dla-szkol/"
PB = {m["id"]: m for m in PRICE["models"]}
PMIN = min(v["netPerM2"] for v in FIN["variants"])
KITS_URL = "/wp-content/themes/gamefields/assets/js/home/kits/"
SCHOOL_KIT = "/studio/?" + urlencode({"arena": "o1", "pattern": "pro-neoplastic", "variant": "6", "palette": "stijl", "panel": "1F4E9C", "frame": "111111"}).replace("&", "&amp;")


def full(mid):
    return PB[mid]["constructionFromNet"] + SLAB[mid]["net"] + PAINT[mid]


CSS = GFB_CSS + """
.gfb-hero figure.kit{margin:0;background:#D8F24A;overflow:hidden;position:relative}
.gfb-hero figure.kit img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover}
.gfa .gfb-hero figure.kit figcaption{position:absolute;left:10px;bottom:10px;margin:0;padding:6px 10px;background:rgba(28,9,18,.84);color:#fff;font-size:13px}
/* calls */
.gfb-calls{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:12px}
.gfb-cd{display:flex;flex-direction:column;justify-content:center;gap:8px;padding:clamp(22px,2.6vw,36px);background:var(--lime);color:#1F2A6B}
.gfb-cd .k{color:#1F2A6B;margin:0}
.gfb-cd b{font-size:clamp(56px,7vw,112px);font-weight:800;letter-spacing:-.06em;line-height:.85}
.gfb-cd span{font-size:17px;font-weight:700}
.gfb-cd small{font-size:14px;color:#1F2A6B}
.gfb-callist{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.gfb-callist li{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:12px;align-items:center;padding:18px 20px;background:#fff;border:1px solid var(--line)}
.gfb-callist b{font-size:18px;letter-spacing:-.01em}
.gfb-callist span{font-size:14px;color:var(--muted)}
.gfb-callist .dt{text-align:right;font-weight:800;font-size:16px;color:var(--violet)}
/* scopes */
.gfb-sc{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.gfb-sc > li{display:flex;flex-direction:column;gap:10px;padding:22px;background:#fff;border:1px solid var(--line)}
.gfb-sc .q{font-size:13px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--violet)}
.gfb-sc b{font-size:22px;letter-spacing:-.025em;line-height:1.1}
.gfb-sc p{margin:0;color:#5A4652;font-size:15px}
.gfb-sc .pr{margin-top:auto;padding-top:10px;border-top:1px solid var(--line);font-weight:800;font-size:15px}
.gfb-sc .go{color:var(--violet);font-weight:800;font-size:14px;text-decoration:none}
/* models */
.gfb-mods{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.gfb-mods a{display:flex;flex-direction:column;height:100%;background:#fff;border:1px solid var(--line);text-decoration:none;overflow:hidden}
.gfb-mods a:hover{border-color:var(--violet)}
.gfb-mods .ph{background:var(--bg);overflow:hidden}
.gfb-mods img{display:block;width:100%;aspect-ratio:16/10;object-fit:cover;transition:transform .8s cubic-bezier(.2,.7,.2,1)}
.gfb-mods a:hover img{transform:scale(1.04)}
.gfb-mods .tx{display:grid;gap:6px;padding:18px 20px 20px}
.gfb-mods b{font-size:24px;letter-spacing:-.03em}
.gfb-mods .wh{font-size:14px;color:var(--muted)}
.gfb-mods .pr{font-size:15px;font-weight:800}.gfb-mods .pr small{display:block;font-weight:500;color:var(--muted);font-size:13px}
.gfb-mods .go{margin-top:4px;color:var(--violet);font-weight:800;font-size:14px}
/* funding */
.gfb-src{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;counter-reset:f}
.gfb-src li{padding:20px;border:1px solid rgba(244,241,238,.2);counter-increment:f}
.gfb-src li::before{content:"0" counter(f);display:block;margin-bottom:8px;color:var(--lime);font-weight:800;font-size:13px}
.gfb-src b{display:block;font-size:20px;color:#fff;letter-spacing:-.02em}
.gfb-src p{margin:6px 0 0;font-size:14px;color:rgba(244,241,238,.85)}
.gfb-src i{display:block;margin-top:8px;font-style:normal;font-size:13px;color:rgba(244,241,238,.65)}
.gfb-rulez{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:16px 0 0}
.gfb-rulez div{padding:16px 18px;background:rgba(244,241,238,.08)}
.gfb-rulez dt{font-size:18px;font-weight:800;color:var(--lime)}
.gfb-rulez dd{margin:6px 0 0;font-size:14px;color:rgba(244,241,238,.85)}
.gfb-srcnote{margin:12px 0 0;font-size:13px;color:rgba(244,241,238,.65)}
/* quotes */
.gfb-q{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.gfb-q li{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,8fr);gap:16px;align-items:center;padding:16px;background:#fff;border:1px solid var(--line)}
.gfb-q img{display:block;width:100%;aspect-ratio:1;object-fit:cover;background:#E6E0DA}
.gfb-q blockquote{margin:0;font-size:17px;line-height:1.4;font-weight:600}
.gfb-q blockquote::before{content:"„";color:var(--violet)}.gfb-q blockquote::after{content:"”";color:var(--violet)}
.gfb-q p{margin:10px 0 0;font-size:14px;color:var(--muted)}.gfb-q p b{display:block;color:var(--ink);font-size:15px}
.gfb-q a{color:var(--violet);font-weight:700;font-size:14px}
/* deliverables */
.gfb-dl{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:0}
.gfb-dl div{padding:20px 22px;background:#fff;border:1px solid var(--line)}
.gfb-dl dt{font-size:19px;font-weight:800;letter-spacing:-.02em}
.gfb-dl dd{margin:6px 0 0;font-size:15px;color:#5A4652}
.gfb-norms.lt li{border-color:var(--line)}.gfb-norms.lt b{color:var(--violet)}
/* plan */
.gfb-plan{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}
.gfb-plan li{position:relative;padding:18px 16px 16px;background:#fff;border:1px solid var(--line);border-top:4px solid var(--violet)}
.gfb-plan .t{font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--violet)}
.gfb-plan b{display:block;margin-top:6px;font-size:18px;letter-spacing:-.02em;line-height:1.15}
.gfb-plan p{margin:6px 0 0;font-size:14px;color:#5A4652}
.gfb-plan li.now{border-top-color:var(--lime);background:#FBFDEB}
.gfa-logos{list-style:none;margin:16px 0 0;padding:0;display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px}
.gfa-logos li{display:grid;place-items:center;height:96px;padding:12px;background:#fff;border:1px solid var(--line);overflow:hidden}
.gfa-logos img{display:block;max-width:100%;max-height:72px;width:auto;height:auto;object-fit:contain;transform:scale(var(--z,1))}
@media (max-width:1100px){.gfb-dl{grid-template-columns:repeat(2,minmax(0,1fr))}.gfb-sc{grid-template-columns:repeat(2,minmax(0,1fr))}.gfb-plan{grid-template-columns:repeat(3,minmax(0,1fr))}.gfb-rulez{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:900px){.gfb-calls,.gfb-q,.gfb-mods,.gfb-src{grid-template-columns:minmax(0,1fr)}.gfa-logos{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:560px){.gfb-dl,.gfb-sc,.gfb-plan,.gfb-rulez{grid-template-columns:minmax(0,1fr)}.gfb-callist li{grid-template-columns:minmax(0,1fr)}.gfb-callist .dt{text-align:left}.gfb-q li{grid-template-columns:minmax(0,1fr)}.gfb-q img{aspect-ratio:16/9}}
"""

CALLS = [("„Moje Boisko – Orlik 2012”", "modernizacja Orlików, Ministerstwo Sportu i Turystyki", "4.01–26.02.2027"),
         ("Rozwój infrastruktury sportowej w województwach", "Ministerstwo Sportu i Turystyki, edycja 2027", "termin w regulaminie"),
         ("Budżety obywatelskie miast", "mieszkańcy zgłaszają, urząd ocenia, mieszkańcy głosują", "zwykle zimą")]
calls_html = "".join(f'<li><div><b>{a}</b><br><span>{b}</span></div><span class="dt">{c}</span></li>' for a, b, c in CALLS)

SCOPES = [
    ("Przy szkole", "Arena na przerwę i WF", "Czytelna, bezpieczna arena na dziedzińcu albo przy boisku. Mieści się tam, gdzie nie ma miejsca na pełne boisko.",
     f"z płytą i malowaniem od {zl(min(full(m) for m in ('circle-cage-1', 'o1')))} netto", "#modele", "Modele dla szkół ↓"),
    ("Istniejący obiekt", "Modernizacja Orlika i starego boiska", "Nowa nawierzchnia, kolor, linie i arena na istniejącym placu, zamiast rozbiórki, jeśli podłoże na to pozwala.",
     f"malowanie od {PMIN} zł/m² netto", "/renowacja-boisk/", "Renowacja boisk →"),
    ("Kilka dyscyplin", "Boisko wielofunkcyjne", "Piłka, kosz, siatkówka i 3 na 3 w jednym układzie, z liniami, które nie robią chaosu. Projekt indywidualny.",
     f"płyta z podbudową {BASE['rateNetPerM2']} zł/m²", "/budowa-boisk-sportowych/", "Budowa boisk →"),
    ("W sali gimnastycznej", "Panna w szkole", "Mobilna arena mieści się w sali gimnastycznej: pokaz, turniej szkolny i zajęcia integracyjne, także z zawodnikami Olimpiad Specjalnych.",
     f"arena mobilna od {zl(PB['mobile']['constructionFromNet'])} netto", "/wynajem-boisk-mobilnych/", "Arena mobilna →"),
]
sc_html = "".join(f'<li><span class="q">{q}</span><b>{t}</b><p>{d}</p><span class="pr">{pr}</span><a class="go" href="{h}">{g}</a></li>' for q, t, d, pr, h, g in SCOPES)

MODS = [("circle-cage-1", "gf-cage90", "#D23A26", "Niska i otwarta wizualnie (0,90 m): nauczyciel widzi całe pole gry."),
        ("o1", "gf-play", "#2457D6", "Perforowane panele i dwie bramki. Zestaw „Szkoła” z wzorem Neo-Plastic."),
        ("octagon", "gf-octa", "#47132D", "Ośmiokąt z prętowymi panelami. Kutno: zamówienie Urzędu Miasta.")]
mods_html = "".join(
    f'<li><a href="{PB[mid]["link"]}"><span class="ph" style="--bg:{bg}"><img src="{UP}2026/11/{r}-720.webp" alt="{PB[mid]["name"]}, render konstrukcji" loading="lazy" decoding="async"></span>'
    f'<span class="tx"><b>{PB[mid]["name"]}</b><span class="wh">{html.escape(PB[mid]["forWhom"] or "")} · {html.escape(PB[mid]["dimensions"])}</span><span class="wh">{d}</span>'
    f'<span class="pr">konstrukcja od {zl(PB[mid]["constructionFromNet"])} netto<small>z płytą i malowaniem od {zl(full(mid))} netto</small></span><span class="go">Zaprojektuj w Studio ↗</span></span></a></li>'
    for mid, r, bg, d in MODS)

SOURCES = [
    ("Ministerstwo Sportu i Turystyki", "Programy na nowe i modernizowane obiekty, m.in. „Moje Boisko – Orlik 2012” i rozwój infrastruktury w województwach.", "gminy, powiaty, szkoły przez organ prowadzący"),
    ("Województwo", "Urzędy marszałkowskie prowadzą własne programy i współfinansują ministerialne, np. „Sportowa Małopolska”.", "gminy i powiaty danego województwa"),
    ("Budżet obywatelski", "Dobra droga dla jednej areny w parku albo przy szkole.", "mieszkańcy, rady osiedli, szkoły"),
    ("Fundusz sołecki", "Sołectwo może przeznaczyć środki m.in. na urządzenie boiska. Mała arena mieści się w skali tego funduszu.", "sołectwa w gminach wiejskich"),
    ("Fundusze Europejskie", "Programy regionalne 2021–2027 finansują rewitalizację. Boisko może być częścią odnowy placu lub osiedla.", "gminy z programem rewitalizacji"),
    ("Marka lub fundacja", "Firma finansuje arenę, a jej logo jest na bandach i nawierzchni.", "szkoły, kluby, osiedla i firmy"),
]
src_html = "".join(f'<li><b>{t}</b><p>{d}</p><i>Dla: {w}</i></li>' for t, d, w in SOURCES)

DELIV = [("Koncepcja i wizualizacja", "Boisko na zdjęciu Twojego placu, z modelu 3D w Studio, w kolorach i wzorze nawierzchni."),
         ("Karta projektu PDF", "Parametry, widok z góry i cena orientacyjna do kosztorysu."),
         ("Opis techniczny", "Wymiary, materiały, warstwy i wyposażenie konstrukcji i nawierzchni."),
         ("Harmonogram", "Od zamówienia do odbioru, z zależnością od pogody."),
         ("Argumenty dla komisji", "Ogólnodostępność, trwałość, mała powierzchnia, koszty utrzymania, realizacje referencyjne."),
         ("Dokumenty i wsparcie", "Karty techniczne i certyfikaty producentów; po decyzji dopasowanie projektu do przyznanego zakresu.")]
dl_html = "".join(f"<div><dt>{t}</dt><dd>{d}</dd></div>" for t, d in DELIV)

QUOTES = [
    ("2024/12/9-768x432.jpg", "Panna Ring na Orliku, Grodzisk Mazowiecki", "Boisko Panna Ring stoi na naszym Orliku od 10 lat i przez cały ten czas spełnia swoją rolę bez żadnych uszkodzeń.", "Mariusz Smysło", "Dyrektor OSiR Grodzisk Mazowiecki", "orlik"),
    ("2025/06/IMG_6608-scaled-e1749983082809-768x696.jpg", "Panna Octa w Kutnie", "Realizacja przebiegła bez zastrzeżeń. Boisko Panna Octa na pasażu sportowym w Kutnie cieszy się dużą popularnością wśród młodzieży.", "Beata Rafalska", "Urząd Miasta Kutno, ds. inwestycji", "kutno"),
]
q_html = "".join(f'<li>{img(p, a)}<div><blockquote>{html.escape(q)}</blockquote><p><b>{n}</b>{r}</p><a href="/realizacje-gamefields/#{cid}">Historia realizacji →</a></div></li>' for p, a, q, n, r, cid in QUOTES)

LOGOS = ('<ul class="gfa-logos" role="list">'
         f'<li style="--z:1.3"><img src="{UP}2026/11/LOGO-Warszawa--300x194.png" alt="Miasto stołeczne Warszawa" width="300" height="194" loading="lazy" decoding="async"></li>'
         f'<li style="--z:1.7"><img src="{UP}2026/11/Zarzad-Zieleni-Miejskiej-Warszawa-300x141.jpg" alt="Zarząd Zieleni m.st. Warszawy" width="300" height="141" loading="lazy" decoding="async"></li>'
         f'<li style="--z:1"><img src="{UP}2026/11/LOHO-Krakow--300x200.jpg" alt="Kraków" width="300" height="200" loading="lazy" decoding="async"></li>'
         f'<li style="--z:1.6"><img src="{UP}2026/11/Grodzisk-Mazowiecki-LOGO-300x200.jpg" alt="Grodzisk Mazowiecki" width="300" height="200" loading="lazy" decoding="async"></li>'
         f'<li style="--z:1"><img src="{UP}2026/11/LOGO-Kutno--300x231.jpg" alt="Kutno" width="300" height="231" loading="lazy" decoding="async"></li>'
         f'<li style="--z:1.15"><img src="{UP}2026/11/LOGO-Lodz-300x139.webp" alt="Łódź" width="300" height="139" loading="lazy" decoding="async"></li></ul>')

PLAN = [("now", "Grudzień 2026", "Koncepcja i kosztorys", "Zdjęcia placu, wybór modelu i nawierzchni, karta projektu z ceną."),
        ("", "4 stycznia 2027", "Start naborów", "Wniosek składa gmina, powiat albo szkoła przez organ prowadzący."),
        ("", "Do 26 lutego 2027", "Koniec naboru Orlik", "„Moje Boisko – Orlik 2012”: modernizacja Orlików."),
        ("", "Po decyzji", "Dopasowanie projektu", "Zakres do przyznanych środków, dokumenty do przetargu."),
        ("", "Wiosna–jesień", "Realizacja", "Farby i nawierzchnie na suchym podłożu, przy dodatniej temperaturze.")]
plan_html = "".join(f'<li class="{c}"><span class="t">{t}</span><b>{b}</b><p>{d}</p></li>' for c, t, b, d in PLAN)

FAQ = [
    ("Kto składa wniosek o dofinansowanie?",
     "Uprawniony podmiot, najczęściej gmina, powiat albo szkoła przez organ prowadzący. Ja przygotowuję część techniczną: koncepcję, wizualizację, opis rozwiązania i cenę orientacyjną do kosztorysu."),
    ("Kiedy zacząć przygotowania do naborów 2027?",
     "Najlepiej kilka tygodni przed naborem. Ministerstwo Sportu zapowiedziało pierwsze nabory na 2027 rok od 4 stycznia 2027 r., a nabór „Moje Boisko – Orlik 2012” potrwa do 26 lutego 2027 r. Koncepcję i kosztorys warto mieć gotowe w grudniu."),
    ("Ile trzeba mieć wkładu własnego?",
     "W edycji 2026 programu rozwoju infrastruktury sportowej w województwach wnioskodawca pokrywał co najmniej 40% kosztów kwalifikowanych, a dofinansowanie wynosiło do 60%. Zasady kolejnych edycji sprawdzamy w aktualnym regulaminie."),
    ("Czy małe boisko do panny może dostać dofinansowanie?",
     "To zależy od programu. Małą arenę warto włączyć do większego zadania, np. modernizacji Orlika albo strefy sportowej przy szkole. Mniejsze kwoty łatwiej sfinansować z budżetu obywatelskiego, funduszu sołeckiego albo programów województwa."),
    ("Ile kosztuje arena przy szkole?",
     f"Panna Cage 90 od {zl(PB['circle-cage-1']['constructionFromNet'])} netto (z płytą i malowaniem od {zl(full('circle-cage-1'))}), Panna Play od {zl(PB['o1']['constructionFromNet'])} netto (z płytą i malowaniem od {zl(full('o1'))}). Montaż, transport i przygotowanie terenu liczę po zdjęciach."),
    ("Czy możecie zmodernizować stary Orlik albo boisko szkolne?",
     "Tak. Oceniam podłoże i wyposażenie ze zdjęć, a potem proponuję renowację albo przebudowę. Rozwiązania spełniają wymagania programu „Moje Boisko – Orlik 2012”; Panna Ring stoi na Orliku w Grodzisku Mazowieckim od 10 lat."),
    ("Czy dostanę dokumenty do przetargu?",
     "Tak. Karty techniczne i certyfikaty stali, farb i nawierzchni dołączam do oferty, wniosku i dokumentacji przetargowej. Nawierzchnie EPDM spełniają PN-EN 14877, płyty gumowe PN-EN 1177 z atestem PZH."),
    ("Czy pomagacie w budżecie obywatelskim?",
     "Tak. Przygotuję koncepcję, wizualizację i cenę orientacyjną do formularza zgłoszenia."),
    ("Czy można wykorzystać mały szkolny dziedziniec?",
     "Tak. Areny 1 na 1 zaczynają się od około 5 m średnicy, a boisko 3 na 3 ma 15 × 10 m. Wymiary dziedzińca sprawdzisz w planerze „Zmieści się?” na stronie głównej."),
]

CD_JS = """<script>(function(){var b=document.querySelector('.gfb [data-cd]');if(!b)return;var n=b.querySelector('b'),s=b.querySelector('span');
var start=new Date(2027,0,4),end=new Date(2027,1,26,23,59),now=new Date(),day=86400000;
if(now<start){var d=Math.ceil((start-now)/day);n.textContent=d;s.textContent=(d===1?'dzień':'dni')+' do startu naborów 2027'}
else if(now<=end){var e=Math.ceil((end-now)/day);n.textContent=e;s.textContent=(e===1?'dzień':'dni')+' do końca naboru Orlik 2012'}
else{n.textContent='2027';s.textContent='Nabory na 2027 rok zakończone. Zapytaj o kolejne.'}})();</script>"""

jump = [("nabory", "Nabory 2027"), ("zakres", "Co robię"), ("modele", "Modele"), ("finansowanie", "Finansowanie"), ("wniosek", "Do wniosku"),
        ("realizacje", "Realizacje"), ("plan", "Plan 2027"), ("pytania", "Pytania")]

body = f"""
<section class="gfb-hero"><div class="w top">
  <div>
    <p class="gfb-crumbs"><a href="/">Gamefields</a> / Szkoły i gminy</p>
    <p class="k">Dla szkół, gmin i Orlików</p>
    <h1 class="d">Boiska dla szkół i gmin.</h1>
    <p class="lead">Arena na przerwę i WF, modernizacja Orlika albo nowe boisko w gminie. Przygotuję koncepcję, cenę i część techniczną wniosku o dofinansowanie, a potem zbuduję to, co zaprojektujemy.</p>
    <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Przygotujmy wniosek →</a><a class="gfa-btn alt" href="{SCHOOL_KIT}">Zestaw „Szkoła” w Studio ↗</a></div>
  </div>
  <figure class="kit"><img src="{KITS_URL}szkola.webp" alt="Panna Play z nawierzchnią Neo-Plastic, zestaw dla szkoły, widok ze Studio 3D" loading="eager" decoding="async"><figcaption>Zestaw „Szkoła”: Panna Play + Neo-Plastic, widok ze Studio 3D</figcaption></figure>
</div>
<div class="w">
  <dl class="gfb-nums">
    <div><dt>Nabory 2027</dt><dd>od 4.01<small>Orlik 2012 do 26.02.2027</small></dd></div>
    <div><dt>Dofinansowanie</dt><dd>do 60%<small>edycja 2026, programy MSiT</small></dd></div>
    <div><dt>Gwarancja</dt><dd>12 miesięcy<small>i opieka po odbiorze</small></dd></div>
    <div><dt>Na Orliku</dt><dd>10 lat<small>Panna Ring bez uszkodzeń</small></dd></div>
  </dl>
</div></section>

<nav class="gfb-jump" aria-label="Na tej stronie"><div class="w"><ul role="list">{jump_html(jump)}</ul></div></nav>

<section class="gfa-sec" id="nabory"><div class="w">
  <div class="gfa-head"><div><p class="k">Nabory 2027</p><h2 class="d">Czas liczy się od grudnia.</h2></div><p>Wniosek ma szanse, gdy koncepcja i kosztorys są gotowe przed startem naboru. Stan na 12.11.2026, terminy sprawdzamy w regulaminach na gov.pl.</p></div>
  <div class="gfb-calls">
    <div class="gfb-cd" data-cd><p class="k">Do naborów</p><b>42</b><span>dni do startu naborów 2027</span><small>Start: 4 stycznia 2027 · Orlik 2012: do 26 lutego 2027</small></div>
    <ul class="gfb-callist" role="list">{calls_html}</ul>
  </div>
</div></section>

<section class="gfa-sec" id="zakres"><div class="w">
  <div class="gfa-head"><div><p class="k">Co robię</p><h2 class="d">Cztery sposoby na boisko przy szkole.</h2></div><p>Od małego dziedzińca po pełne boisko wielofunkcyjne. Inwestycję można etapować i dopasować do budżetu.</p></div>
  <ul class="gfb-sc" role="list">{sc_html}</ul>
</div></section>

<section class="gfa-sec" id="modele"><div class="w">
  <div class="gfa-head"><div><p class="k">Modele</p><h2 class="d">Trzy areny, które polecam szkołom.</h2></div><p>Bezpieczne, czytelne i trwałe. Ceny „od” netto: sama konstrukcja i komplet z płytą betonową i malowaniem. <a href="/boiska-street-football/">Wszystkie 8 modeli →</a></p></div>
  <ul class="gfb-mods" role="list">{mods_html}</ul>
  <p class="gfb-note">Dla najmłodszych: płyty gumowe z PN-EN 1177 i atestem PZH, antypoślizg R11. <a href="/nawierzchnie-sportowe/#plyty">Nawierzchnie →</a></p>
</div></section>

<section class="gfa-band" id="finansowanie"><div class="w">
  <div class="gfa-head"><div><p class="k">Finansowanie</p><h2 class="d">Sześć źródeł finansowania.</h2></div><p>Każde ma inne progi i wymagania. Na start wystarczy lokalizacja i pomysł, a ja podpowiem, które pasuje do Twojego placu.</p></div>
  <ul class="gfb-src" role="list">{src_html}</ul>
  <dl class="gfb-rulez">
    <div><dt>Wkład własny</dt><dd>co najmniej 40%; dofinansowanie do 60% kosztów kwalifikowanych.</dd></div>
    <div><dt>Ogólnodostępny</dt><dd>Obiekt bezpłatny; priorytet dla obiektów przy szkołach, otwartych dla dzieci i młodzieży.</dd></div>
    <div><dt>Bez asfaltu</dt><dd>Nawierzchnie asfaltowe nie są finansowane (z wyjątkami, np. skateparki).</dd></div>
    <div><dt>Nowy lub modernizacja</dt><dd>Same remonty nie są finansowane.</dd></div>
  </dl>
  <p class="gfb-srcnote">Co oceniają komisje: regulamin edycji 2026 programu rozwoju infrastruktury sportowej w województwach. Kolejne edycje mogą to zmienić.</p>
  <ul class="gfa-links"><li><a href="/dofinansowanie-boisk/">Dofinansowanie boisk: źródła i terminy →</a></li></ul>
</div></section>

<section class="gfa-sec" id="wniosek"><div class="w">
  <div class="gfa-head"><div><p class="k">Do wniosku</p><h2 class="d">Część techniczna wniosku.</h2></div><p>Wniosek składa gmina albo szkoła. Ja dostarczam materiały, które pokazują, co powstanie, ile kosztuje i dlaczego się sprawdzi.</p></div>
  <dl class="gfb-dl">{dl_html}</dl>
  <ul class="gfb-norms lt" role="list"><li><b>PN-EN 14877</b>EPDM</li><li><b>PN-EN 1177</b>płyty gumowe, atest PZH</li><li><b>R11</b>antypoślizg</li><li><b>Orlik 2012</b>zgodne z wymaganiami programu</li></ul>
</div></section>

<section class="gfa-sec" id="realizacje"><div class="w">
  <div class="gfa-head"><div><p class="k">Realizacje</p><h2 class="d">Słowa urzędu i OSiR.</h2></div><p>Boiska zamówione przez miasta i ośrodki sportu. <a href="/realizacje-dla-miast/">Realizacje dla miast →</a></p></div>
  <ul class="gfb-q" role="list">{q_html}</ul>
  {LOGOS}
</div></section>

<section class="gfa-sec" id="plan"><div class="w">
  <div class="gfa-head"><div><p class="k">Plan 2027</p><h2 class="d">Od koncepcji do odbioru.</h2></div><p>Tak wygląda rok z boiskiem finansowanym z naboru. Pierwszy krok jest dziś.</p></div>
  <ol class="gfb-plan" role="list">{plan_html}</ol>
</div></section>

<section class="gfa-sec" id="start"><div class="w">
  <div class="gfa-head"><div><p class="k">Na start</p><h2 class="d">Co mi wysłać?</h2></div><p>Nie potrzebujesz dokumentacji. Wystarczy kilka informacji, a odpowiem osobiście.</p></div>
  <div class="gfb-prep">
    <div><h3>Pięć informacji</h3><ul class="gfb-check">
      <li><span><b>Lokalizacja</b>: szkoła, Orlik albo działka gminy.</span></li><li><span><b>Wymiary</b>: przybliżone, z miarki albo z mapy.</span></li>
      <li><span><b>Zdjęcia</b>: plac i stan obecnej nawierzchni.</span></li><li><span><b>Użytkownicy</b>: wiek, WF, zajęcia po lekcjach.</span></li>
      <li><span><b>Nabór</b>: program i termin, jeśli już wiesz.</span></li></ul></div>
    <div><h3>Albo zacznij sam</h3><ul class="gfb-check">
      <li><span>Sprawdź dziedziniec w planerze „Zmieści się?”.</span></li><li><span>Otwórz zestaw „Szkoła” w Studio 3D.</span></li>
      <li><span>Pobierz kartę projektu PDF z ceną.</span></li><li><span>Dołącz ją do zapytania.</span></li></ul>
      <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Przygotujmy wniosek →</a><a class="gfa-btn alt" href="/#planer">Planer placu</a></div></div>
  </div>
</div></section>

<section class="gfa-sec" id="pytania"><div class="w">
  <div class="gfa-head"><div><p class="k">Pytania</p><h2 class="d">Wnioski, ceny, dokumenty.</h2></div><p>Najczęstsze pytania szkół, gmin i ośrodków sportu.</p></div>
  <div class="gfa-faq">{faq_html(FAQ)}</div>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><div><p class="k">Dalej</p><h2 class="d">Więcej dla samorządów.</h2></div><p>Finansowanie, realizacje i poradniki z cenami.</p></div>
  <ul class="gfb-next" role="list">
    <li><a href="/dofinansowanie-boisk/"><i>Finansowanie</i><b>Dofinansowanie boisk</b><span>Źródła, terminy, wymagania komisji.</span></a></li>
    <li><a href="/realizacje-dla-miast/"><i>Referencje</i><b>Realizacje dla miast</b><span>Trwałość, opinie, finansowanie.</span></a></li>
    <li><a href="/wymiary-boiska-wielofunkcyjnego/"><i>Poradnik</i><b>Wymiary boiska wielofunkcyjnego</b><span>Orlik, strefy i mały metraż.</span></a></li>
  </ul>
  <ul class="gfb-who" role="list"><li><a href="/dla-miast/"><span>Dla</span>miast</a></li><li><a href="/boiska-wielofunkcyjne/">Boiska wielofunkcyjne</a></li><li><a href="/renowacja-boisk/">Renowacja boisk</a></li><li><a href="/budowa-boisk-sportowych/">Budowa boisk</a></li><li><a href="/boiska-street-football/">Modele i ceny</a></li></ul>
</div></section>

<section class="gfa-cta"><div class="w">
  <h2 class="d">Planujesz boisko<br>przy szkole?</h2>
  <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Przygotujmy wniosek →</a><a class="gfa-btn alt" href="/studio/">Zaprojektuj w Studio ↗</a></div>
</div></section>
"""

ld = {"@context": "https://schema.org", "@graph": [
    {"@type": "Service", "@id": URL + "#usluga", "name": "Boiska dla szkół i gmin", "serviceType": "Projekt, budowa i modernizacja boisk szkolnych i gminnych", "url": URL, "inLanguage": "pl-PL",
     "areaServed": {"@type": "Country", "name": "Polska"}, "provider": {"@id": SITE + "#studio"},
     "audience": {"@type": "Audience", "audienceType": "szkoły, gminy, powiaty, ośrodki sportu"},
     "description": "Areny przy szkołach, modernizacja Orlików i boisk szkolnych, boiska wielofunkcyjne. Koncepcja, cena i część techniczna wniosku o dofinansowanie."},
    {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Gamefields", "item": SITE},
                                                    {"@type": "ListItem", "position": 2, "name": "Szkoły i gminy", "item": URL}]},
    {"@type": "FAQPage", "@id": URL + "#pytania", "inLanguage": "pl-PL",
     "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]}]}

write(HERE, "boiska-dla-szkol", CSS, ld, body, CD_JS)
