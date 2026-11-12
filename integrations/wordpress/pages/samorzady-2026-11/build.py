#!/usr/bin/env python3
"""Build the public-sector pages for gamefields.eu (12.11.2026).

Output (next to this file):
  dofinansowanie-boisk.html   new page /dofinansowanie-boisk/   funding paths and what Gamefields prepares for an application
  realizacje-dla-miast.html   new page /realizacje-dla-miast/   three case studies told for municipalities and schools
  preview.html                local preview of both pages

Facts about funding come from public sources listed on the page (state 12.11.2026). Programme dates for 2027 are
announcements, and the page says so. Case-study facts come only from the live Realizacje page; numbers that are not
known yet (users per day, maintenance cost) are collected with ANKIETA-CASE-STUDY.md and are not invented here.
"""
import html
import json
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
UP = "https://www.gamefields.eu/wp-content/uploads/"
SITE = "https://www.gamefields.eu/"
BASE_CSS = (HERE.parent / "gfa-style.css").read_text(encoding="utf-8").split("\n", 1)[1]
EXTRA_CSS = """
.gfa-hero h1{font-size:clamp(52px,7vw,116px)}
.gfa-alert{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,8fr);gap:clamp(16px,3vw,40px);padding:clamp(20px,2.4vw,32px);background:var(--lime);color:var(--ink);margin:0 0 12px}
.gfa-alert h3{font-size:clamp(26px,2.8vw,42px);font-weight:800;letter-spacing:-.035em;line-height:1}
.gfa-alert ul{margin:0;padding:0;list-style:none;display:grid;gap:10px}
.gfa-alert li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;border-bottom:1px solid rgba(71,19,45,.25);padding-bottom:10px;font-size:16px}
.gfa-alert li b{white-space:nowrap}
.gfa-alert small{display:block;margin-top:10px;font-size:13px;opacity:.8}
.gfa-paths{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.gfa-paths li{display:grid;gap:8px;align-content:start;padding:24px;background:#fff;border:1px solid var(--line)}
.gfa-paths .m{color:var(--violet);font-weight:800;font-size:14px}
.gfa-paths b{font-size:22px;letter-spacing:-.02em;line-height:1.15}
.gfa-paths span{color:var(--muted);font-size:15px;line-height:1.5}
.gfa-paths .fit{margin-top:6px;font-size:13px;font-weight:700;color:var(--ink)}
.gfa-check{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 32px}
.gfa-check li{position:relative;padding:0 0 12px 34px;border-bottom:1px solid var(--line);font-size:17px}
.gfa-check li::before{content:"✓";position:absolute;left:0;top:0;width:24px;height:24px;border-radius:50%;background:var(--violet);color:#fff;font-size:14px;display:grid;place-items:center}
.gfa-check li small{display:block;color:var(--muted);font-size:14px;margin-top:2px}
.gfa-band .gfa-check li{border-color:rgba(244,241,238,.2)}
.gfa-band .gfa-check li small{color:rgba(244,241,238,.75)}
.gfa-nums{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:18px 0 0}
.gfa-nums div{padding:16px;background:var(--paper);border:1px solid var(--line)}
.gfa-nums dt{font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.gfa-nums dd{margin:6px 0 0;font-size:24px;font-weight:800;letter-spacing:-.03em;line-height:1.1}
.gfa-case h4{margin:18px 0 6px;font-size:15px;letter-spacing:.06em;text-transform:uppercase;color:var(--violet)}
.gfa-case p{margin:0;color:var(--muted);font-size:16px}
.gfa-src{margin:0;padding:0 0 0 18px;font-size:14px;color:var(--muted)}
.gfa-src li{margin:6px 0}
.gfa-faq{border-top:1px solid var(--line)}
.gfa-faq details{border-bottom:1px solid var(--line)}
.gfa-faq summary{display:flex;justify-content:space-between;gap:14px;list-style:none;cursor:pointer;padding:20px 4px;font-size:18px;font-weight:700}
.gfa-faq summary::-webkit-details-marker{display:none}
.gfa-faq summary::after{content:'+';font-size:24px;font-weight:400;color:var(--violet)}
.gfa-faq details[open] summary::after{content:'−'}
.gfa-faq details p{max-width:780px;margin:0;padding:0 4px 22px;font-size:16px;color:var(--muted)}
@media (max-width:900px){.gfa-alert,.gfa-check{grid-template-columns:minmax(0,1fr)}.gfa-paths{grid-template-columns:repeat(2,minmax(0,1fr))}.gfa-nums{grid-template-columns:minmax(0,1fr)}}
@media (max-width:560px){.gfa-paths{grid-template-columns:minmax(0,1fr)}}
"""


def page(body, ld):
    return ("<!-- wp:html -->\n<style>\n" + BASE_CSS + EXTRA_CSS + "</style>\n<script type=\"application/ld+json\">" +
            json.dumps(ld, ensure_ascii=False, separators=(",", ":")) + "</script>\n" +
            '<div class="gfa">\n' + body.strip() + "\n</div>\n<!-- /wp:html -->\n")


def img(path, alt):
    return f'<img src="{UP}{path}" alt="{html.escape(alt)}" loading="lazy" decoding="async">'


CTA = """
<section class="gfa-cta"><div class="w">
  <h2 class="d">Masz plac<br>i nabór w planach?</h2>
  <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Wyślij lokalizację →</a><a class="gfa-btn alt" href="/studio/">Zaprojektuj w Studio ↗</a></div>
</div></section>"""

# ------------------------------------------------------------------ FAQ (also in JSON-LD)
FAQ = [
    ("Kto składa wniosek o dofinansowanie?",
     "Wniosek składa uprawniony podmiot, najczęściej gmina, powiat albo szkoła przez organ prowadzący. Gamefields przygotowuje część techniczną: koncepcję, wizualizację, opis rozwiązania i cenę orientacyjną do kosztorysu."),
    ("Czy małe boisko do panny może dostać dofinansowanie?",
     "To zależy od programu. Programy ministerialne mają własne progi i wymagania, dlatego małą arenę warto włączyć do większego zadania, np. modernizacji Orlika albo strefy sportowej przy szkole. Mniejsze kwoty łatwiej sfinansować z budżetu obywatelskiego, funduszu sołeckiego albo programów województwa."),
    ("Ile trzeba mieć wkładu własnego?",
     "W edycji 2026 programu rozwoju infrastruktury sportowej w województwach wnioskodawca pokrywał co najmniej 40% kosztów kwalifikowanych, a dofinansowanie wynosiło do 60%. Zasady kolejnych edycji sprawdzamy w aktualnym regulaminie."),
    ("Kiedy zacząć przygotowania?",
     "Najlepiej kilka tygodni przed naborem. Ministerstwo Sportu zapowiedziało pierwsze nabory na 2027 rok od 4 stycznia 2027 r., dlatego koncepcję i kosztorys warto mieć gotowe jeszcze w grudniu."),
    ("Czy pomagacie w budżecie obywatelskim?",
     "Tak. Przygotujemy koncepcję, wizualizację i cenę orientacyjną do formularza."),
]

faq_html = "".join(f"<details><summary>{html.escape(q)}</summary><p>{html.escape(a)}</p></details>" for q, a in FAQ)

dof = f"""
<section class="gfa-hero"><div class="w">
  <div>
    <p class="k">Dla gmin, szkół i klubów</p>
    <h1 class="d">Boisko z dotacją.</h1>
    <p class="lead">Boisko do panny, street footballu albo kolorową nawierzchnię na starym placu można sfinansować z programów Ministerstwa Sportu, województwa, budżetu obywatelskiego albo funduszu sołeckiego. Przygotuję część techniczną wniosku: koncepcję, wizualizację, opis i cenę orientacyjną.</p>
    <ul class="gfa-links"><li><a href="#nabory">Najbliższe nabory</a></li><li><a href="#sciezki">Źródła finansowania</a></li><li><a href="#do-wniosku">Co przygotuję</a></li><li><a href="/realizacje-dla-miast/">Realizacje dla miast</a></li></ul>
  </div>
  <figure>{img("2024/12/9-768x432.jpg", "Arena Panna Ring na Orliku w Grodzisku Mazowieckim")}<figcaption><b>Panna Ring na Orliku</b>OSiR Grodzisk Mazowiecki, w użyciu od 10 lat</figcaption></figure>
</div></section>

<section class="gfa-sec" id="nabory"><div class="w">
  <div class="gfa-alert">
    <div><p class="k" style="color:var(--ink)">Stan na 12.11.2026</p><h3>Nabory na 2027 rok ruszają w styczniu.</h3></div>
    <div>
      <ul>
        <li><span>„Moje Boisko – Orlik 2012” (modernizacja Orlików)</span><b>4.01–26.02.2027</b></li>
        <li><span>Rozwój infrastruktury sportowej w województwach</span><b>w 2027, termin w regulaminie</b></li>
        <li><span>Budżety obywatelskie miast</span><b>zgłoszenia zwykle zimą</b></li>
      </ul>
      <small>Terminy na 2027 rok pochodzą z zapowiedzi Ministerstwa Sportu i Turystyki przedstawionych w Sejmie. Przed złożeniem wniosku sprawdzamy regulamin na gov.pl. Źródła na dole strony.</small>
    </div>
  </div>
</div></section>

<section class="gfa-sec" id="sciezki"><div class="w">
  <div class="gfa-head"><h2 class="d">Sześć źródeł finansowania.</h2><p>Każde ma inne progi i wymagania. Na start wystarczy lokalizacja i pomysł, a ja podpowiem, które pasuje do Twojego placu.</p></div>
  <ul class="gfa-paths">
    <li><span class="m">01</span><b>Ministerstwo Sportu i Turystyki</b><span>Programy na nowe i modernizowane obiekty: m.in. „Moje Boisko – Orlik 2012” i rozwój infrastruktury w województwach. W 2026 r. dofinansowanie do 60% kosztów kwalifikowanych.</span><span class="fit">Dla: gmin, powiatów, szkół przez organ prowadzący</span></li>
    <li><span class="m">02</span><b>Województwo</b><span>Urzędy marszałkowskie prowadzą własne programy i współfinansują programy ministerialne, np. „Sportowa Małopolska”.</span><span class="fit">Dla: gmin i powiatów danego województwa</span></li>
    <li><span class="m">03</span><b>Budżet obywatelski</b><span>Mieszkańcy zgłaszają projekt, urząd ocenia, mieszkańcy głosują. Dobra droga dla jednej areny w parku albo przy szkole.</span><span class="fit">Dla: mieszkańców, rad osiedli, szkół</span></li>
    <li><span class="m">04</span><b>Fundusz sołecki</b><span>Sołectwo może przeznaczyć swoje środki m.in. na urządzenie boiska. Mała arena mieści się w skali tego funduszu.</span><span class="fit">Dla: sołectw w gminach wiejskich</span></li>
    <li><span class="m">05</span><b>Fundusze Europejskie</b><span>Programy regionalne 2021–2027 finansują projekty rewitalizacji. Boisko i kolorowa nawierzchnia mogą być częścią odnowy placu lub osiedla.</span><span class="fit">Dla: gmin z programem rewitalizacji</span></li>
    <li><span class="m">06</span><b>Marka lub fundacja</b><span>Boisko z identyfikacją partnera: firma finansuje arenę, a jej logo jest na bandach i nawierzchni.</span><span class="fit">Dla: szkół, klubów, osiedli i firm</span></li>
  </ul>
</div></section>

<section class="gfa-band" id="do-wniosku"><div class="w">
  <div class="gfa-head"><div><p class="k">Gamefields przygotuje</p><h2 class="d">Część techniczna wniosku.</h2></div><p>Wniosek składa gmina albo szkoła. Ja dostarczam materiały, które pokazują, co powstanie, ile kosztuje i dlaczego się sprawdzi.</p></div>
  <ul class="gfa-check">
    <li>Koncepcja i wizualizacja boiska na zdjęciu placu<small>Z modelu 3D w Studio, w kolorach i wzorze nawierzchni.</small></li>
    <li>Karta projektu PDF z ceną orientacyjną<small>Parametry, widok z góry i widełki ceny do kosztorysu.</small></li>
    <li>Opis techniczny konstrukcji i nawierzchni<small>Wymiary, materiały, warstwy, wyposażenie.</small></li>
    <li>Harmonogram realizacji<small>Od zamówienia do odbioru, z zależnością od pogody.</small></li>
    <li>Argumenty dla komisji<small>Ogólnodostępność, trwałość, mała powierzchnia, koszty utrzymania, realizacje referencyjne.</small></li>
    <li>Wsparcie po decyzji<small>Dostosowanie projektu do zakresu, który otrzymał dofinansowanie.</small></li>
  </ul>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><h2 class="d">Co oceniają komisje.</h2><p>Z regulaminu edycji 2026 programu rozwoju infrastruktury sportowej w województwach. Kolejne edycje mogą to zmienić.</p></div>
  <ul class="gfa-check">
    <li>Wkład własny co najmniej 40%<small>Dofinansowanie do 60% kosztów kwalifikowanych.</small></li>
    <li>Obiekt ogólnodostępny i bezpłatny<small>Priorytet dla obiektów przy szkołach, otwartych dla dzieci i młodzieży.</small></li>
    <li>Bez nawierzchni asfaltowych<small>Asfalt i beton asfaltowy nie są finansowane (z wyjątkami, np. skateparki).</small></li>
    <li>Nowy obiekt albo modernizacja<small>Same remonty nie są finansowane.</small></li>
  </ul>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><h2 class="d">Krótkie odpowiedzi.</h2><p>Nie wiesz, od czego zacząć? <a href="/kontakt/">Napisz</a>, odpiszę osobiście.</p></div>
  <div class="gfa-faq">{faq_html}</div>
  <ul class="gfa-links"><li><a href="/baza-wiedzy/">Baza wiedzy</a></li><li><a href="/realizacje-dla-miast/">Realizacje dla miast</a></li><li><a href="/renowacja-boisk/">Renowacja boisk</a></li></ul>
</div></section>

<section class="gfa-sec"><div class="w">
  <h3 style="font-size:18px;margin:0 0 10px">Źródła (stan na 12.11.2026)</h3>
  <ol class="gfa-src">
    <li><a href="https://www.gov.pl/web/sport/program-rozwoju-infrastruktury-sportowej-w-wojewodztwach--edycja-2027" rel="noopener" target="_blank">Ministerstwo Sportu i Turystyki: Program rozwoju infrastruktury sportowej w województwach</a></li>
    <li><a href="https://www.lodzkie.pl/sport/infrastruktura-sportowa/nabor-wnioskow-2026-infrastruktura-sportowa/program-rozwoju-infrastruktury-sportowej-w-wojewodztwach-edycja-2026" rel="noopener" target="_blank">Województwo łódzkie: zasady naboru, edycja 2026</a></li>
    <li><a href="https://granty.pl/555764/" rel="noopener" target="_blank">granty.pl: Infrastruktura sportowa 2027, zapowiedzi MSiT</a></li>
    <li><a href="https://samorzad.pap.pl/kategoria/aktualnosci/msit-oglosilo-programy-i-warunki-naborow-na-infrastrukture-sportowa-w-2027-r" rel="noopener" target="_blank">PAP Samorząd: programy i nabory na 2027 rok</a></li>
    <li><a href="https://www.prawo.pl/samorzad/fundusz-solecki-jako-forma-zaspokajania-zbiorowych-potrzeb-mieszkancow-i-integracji-spolecznej,78429.html" rel="noopener" target="_blank">prawo.pl: fundusz sołecki</a></li>
  </ol>
</div></section>
{CTA}
"""
ld_dof = {"@context": "https://schema.org", "@graph": [
    {"@type": "WebPage", "@id": SITE + "dofinansowanie-boisk/", "url": SITE + "dofinansowanie-boisk/", "name": "Dofinansowanie boisk dla gmin i szkół",
     "inLanguage": "pl-PL", "dateModified": "2026-11-12", "author": {"@type": "Person", "@id": SITE + "#damian-gawrych", "name": "Damian Gawrych"}},
    {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]}]}

# ------------------------------------------------------------------ /realizacje-dla-miast/
CASES = [
    {"id": "orlik", "place": "Grodzisk Mazowiecki, Orlik", "title": "Arena przy Orliku", "photos": [("2024/12/9-768x432.jpg", "Boisko Panna Ring, Grodzisk Mazowiecki"), ("2024/12/15-768x432.jpg", "Arena Panna Ring na Orliku")],
     "challenge": "Dodatkowa strefa gry na istniejącym obiekcie sportowym, dla gry jeden na jednego i w małych grupach.",
     "solution": "Arena Panna Ring na terenie Orlika: mała, zamknięta przestrzeń do gry 1 na 1.",
     "effect": "Arena stoi na Orliku od 10 lat i przez cały ten czas spełnia swoją rolę bez żadnych uszkodzeń.",
     "nums": [("W użyciu", "10 lat"), ("Uszkodzenia", "brak"), ("Zamawiający", "OSiR Grodzisk Mazowiecki")],
     "quote": ("Boisko Panna Ring stoi na naszym Orliku od 10 lat i przez cały ten czas spełnia swoją rolę bez żadnych uszkodzeń.", "Mariusz Smysło", "Dyrektor OSiR Grodzisk Mazowiecki")},
    {"id": "kutno", "place": "Kutno, pasaż sportowy", "title": "Panna Octa w Kutnie", "photos": [("2025/06/IMG_6608-scaled-e1749983082809-768x696.jpg", "Boisko Panna Octa w Kutnie, dzieci na boisku"), ("2024/12/1-5-768x768.jpg", "Boisko Panna Octa w Kutnie"), ("2024/12/3-5-768x768.jpg", "Panna Octa na pasażu sportowym w Kutnie")],
     "challenge": "Stałe miejsce do gry dla młodzieży na miejskim pasażu sportowym.",
     "solution": "Ośmiokątna arena Panna Octa na pasażu, zamówiona przez Urząd Miasta Kutno.",
     "effect": "Realizacja przebiegła bez zastrzeżeń, a boisko cieszy się dużą popularnością wśród młodzieży.",
     "nums": [("Zamawiający", "Urząd Miasta Kutno"), ("Model", "Panna Octa"), ("Miejsce", "pasaż sportowy")],
     "quote": ("Realizacja przebiegła bez zastrzeżeń. Boisko Panna Octa na pasażu sportowym w Kutnie cieszy się dużą popularnością wśród młodzieży.", "Beata Rafalska", "Urząd Miasta Kutno, ds. inwestycji")},
    {"id": "taras", "place": "Warszawa, Park Świętokrzyski", "title": "Taras pod Pałacem Kultury", "photos": [("2024/12/Areny-Panna-Football-Alternative-Soccer-Warszawa-3-768x576.jpg", "Taras w Parku Świętokrzyskim w Warszawie, areny panna"), ("2024/12/11-1-768x432.jpg", "Areny panna na Tarasie, widok na centrum Warszawy"), ("2024/12/6-2-768x768.jpg", "Gra na arenie panna, Taras w Parku Świętokrzyskim")],
     "challenge": "Wielofunkcyjna przestrzeń rekreacji w centrum miasta, przy skrzyżowaniu linii metra i Pałacu Kultury. Inwestycja tymczasowa.",
     "solution": "Trzy areny Panna Ring połączone z tarasem i rampą do skateboardingu. Projekt: Michał Sikorski, Marcin Kwietowicz. Inwestor: Zarząd Zieleni m.st. Warszawy.",
     "effect": "Taras stał się jednym z najpopularniejszych miejsc spotkań warszawskiej młodzieży. Po wybuchu wojny w Ukrainie był też ważnym miejscem spotkań ukraińskiej młodzieży, o czym pisał m.in. New York Times.",
     "nums": [("Areny", "3 × Panna Ring"), ("Inwestor", "Zarząd Zieleni m.st. Warszawy"), ("W mediach", "New York Times")],
     "quote": ("Trzy boiska połączone z tarasem i rampą do skateboardingu dały mocny efekt wizualny i przyciągają bardzo dużo młodzieży.", "Grzegorz Gądek", "Prezes Fundacji Skwery Sportów Miejskich")},
]


def case(c):
    ph = c["photos"]
    photos = f'<div class="ph"><figure class="one">{img(*ph[0])}</figure>' + "".join(f"<figure>{img(*p)}</figure>" for p in ph[1:]) + "</div>"
    nums = "".join(f"<div><dt>{k}</dt><dd>{v}</dd></div>" for k, v in c["nums"])
    q, who, role = c["quote"]
    return f"""<article id="{c['id']}" class="gfa-case">
      {photos}
      <div><p class="y">{c['place']}</p><h3>{c['title']}</h3>
        <h4>Zadanie</h4><p>{c['challenge']}</p>
        <h4>Rozwiązanie</h4><p>{c['solution']}</p>
        <h4>Efekt</h4><p>{c['effect']}</p>
        <dl class="gfa-nums">{nums}</dl>
        <figure class="gfa-quote" style="margin-top:18px"><blockquote>{q}</blockquote><figcaption><b>{who}</b>{role}</figcaption></figure>
      </div>
    </article>"""


real = f"""
<section class="gfa-hero"><div class="w">
  <div>
    <p class="k">Realizacje dla samorządów</p>
    <h1 class="d">Boiska, które pracują dla miast.</h1>
    <p class="lead">Trzy miejsca, trzy różne zadania: arena przy Orliku, która od 10 lat stoi bez uszkodzeń, boisko na miejskim pasażu w Kutnie i Taras pod Pałacem Kultury, który stał się miejscem spotkań młodzieży.</p>
    <ul class="gfa-links"><li><a href="#orlik">Orlik, Grodzisk Mazowiecki</a></li><li><a href="#kutno">Kutno</a></li><li><a href="#taras">Warszawa</a></li><li><a href="/dofinansowanie-boisk/">Dofinansowanie</a></li></ul>
  </div>
  <figure>{img("2024/12/Areny-Panna-Football-Alternative-Soccer-Warszawa-3-768x576.jpg", "Taras w Parku Świętokrzyskim w Warszawie, areny panna")}<figcaption><b>Taras w Parku Świętokrzyskim</b>Warszawa</figcaption></figure>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><h2 class="d">Dlaczego arena panna.</h2><p>Argumenty, które słyszymy od zamawiających.</p></div>
  <ul class="gfa-check">
    <li>Mała powierzchnia<small>Arena mieści się na placu o boku od około 5 do 7 m, obok istniejących boisk.</small></li>
    <li>Trwałość<small>Panna Ring na Orliku w Grodzisku Mazowieckim stoi od 10 lat bez uszkodzeń.</small></li>
    <li>Gra bez organizacji<small>Wystarczą dwie osoby i piłka. Bez zapisów, trenera i rezerwacji.</small></li>
    <li>Czytelny znak w przestrzeni<small>Kolorowa konstrukcja i nawierzchnia przyciągają wzrok i porządkują plac.</small></li>
  </ul>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-mom">
    {"".join(case(c) for c in CASES)}
  </div>
</div></section>

<section class="gfa-band"><div class="w">
  <div class="gfa-head"><div><p class="k">Planujesz podobne miejsce?</p><h2 class="d">Pomogę z dofinansowaniem.</h2></div><p>Koncepcja, wizualizacja, opis i cena orientacyjna do wniosku. Nabory Ministerstwa Sportu na 2027 rok ruszają w styczniu.</p></div>
  <div class="gfa-btns"><a class="gfa-btn" href="/dofinansowanie-boisk/">Jak sfinansować boisko →</a><a class="gfa-btn alt" style="background:var(--lime);color:var(--ink)!important" href="/realizacje-gamefields/">Wszystkie realizacje</a></div>
</div></section>
{CTA}
"""
ld_real = {"@context": "https://schema.org", "@type": "CollectionPage", "@id": SITE + "realizacje-dla-miast/", "url": SITE + "realizacje-dla-miast/",
           "name": "Realizacje Gamefields dla samorządów", "inLanguage": "pl-PL",
           "hasPart": [{"@type": "CreativeWork", "name": c["title"], "locationCreated": c["place"]} for c in CASES]}

out = {"dofinansowanie-boisk.html": page(dof, ld_dof), "realizacje-dla-miast.html": page(real, ld_real)}
for name, content in out.items():
    if "&&" in content:
        raise SystemExit(name + " contains a double ampersand")
    (HERE / name).write_text(content, encoding="utf-8")
shell = ('<!doctype html><html lang="pl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
         '<title>Podgląd: samorządy</title><body style="margin:0">')
(HERE / "preview.html").write_text(shell + "".join(
    f'<div id="{n[:-5]}" style="border-top:8px solid #D8F24A">' + c.replace(' loading="lazy"', "").replace("<!-- wp:html -->", "").replace("<!-- /wp:html -->", "") + "</div>"
    for n, c in out.items()) + "</body></html>", encoding="utf-8")
print("ok", {k: len(v) for k, v in out.items()})
