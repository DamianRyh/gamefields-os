#!/usr/bin/env python3
"""/projektowanie-boisk/ (page 3689), rebuilt 23.11.2026 in the .gfb style shared with the other service pages.

Output: projektowanie-boisk.html (one wp:html block, the whole content of the page).

Three ways to a design (yourself in the Studio, with me for your place, for municipalities with documents), the free
online tools, what a design contains, concepts (Pałac Kultury, Most Łazienkowski, Pole Mokotowskie, Freestival 2017),
Kraków from plan to park, the steps, the author, what to prepare, FAQ. Facts from the homepage (planner, "Na Twoim
placu", studio block, author, municipalities), /koncepcje/, the Realizacje page and the price files. No price is
invented for design work.
"""
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from gfb_common import (BASE, CHEAP, GFB_CSS, SITE, UP, img, jump_html, faq_html, write, zl)  # noqa: E402

URL = SITE + "projektowanie-boisk/"

CSS = GFB_CSS + """
.gfb-ways{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.gfb-ways > li{display:flex;flex-direction:column;gap:10px;padding:24px;background:#fff;border:1px solid var(--line)}
.gfb-ways > li.hl{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.gfb-ways .q{font-size:13px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--violet)}
.gfb-ways .hl .q{color:var(--lime)}
.gfb-ways b{font-size:clamp(24px,2.2vw,32px);letter-spacing:-.035em;line-height:1.05}
.gfb-ways p{margin:0;color:var(--muted);font-size:15px}.gfb-ways .hl p{color:rgba(244,241,238,.82)}
.gfb-ways ul{margin:0;padding-left:18px;font-size:14px;color:#5A4652;display:grid;gap:4px}.gfb-ways .hl ul{color:rgba(244,241,238,.88)}
.gfb-ways .gfa-btns{margin-top:auto;padding-top:8px}
.gfb-ways .hl .gfa-btn{background:var(--lime);color:#1F2A6B!important}
/* tools */
.gfb-tools{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.gfb-tools a{display:flex;flex-direction:column;gap:8px;height:100%;padding:22px;background:#fff;border:1px solid var(--line);text-decoration:none;transition:border-color .2s ease,transform .25s ease}
.gfb-tools a:hover{border-color:var(--violet);transform:translateY(-3px)}
.gfb-tools .ic{display:grid;place-items:center;width:44px;height:44px;border-radius:12px;background:#EEE8FF;color:var(--violet);font-weight:800;font-size:20px}
.gfb-tools b{font-size:20px;letter-spacing:-.02em;line-height:1.15}
.gfb-tools span.d2{color:var(--muted);font-size:15px}
.gfb-tools .go{margin-top:auto;color:var(--violet);font-weight:800;font-size:14px}
/* deliverables */
.gfb-dl{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:0}
.gfb-dl div{padding:20px 22px;background:#fff;border:1px solid var(--line)}
.gfb-dl dt{font-size:19px;font-weight:800;letter-spacing:-.02em}
.gfb-dl dd{margin:6px 0 0;font-size:15px;color:#5A4652}
.gfb-dl dd small{display:block;margin-top:6px;font-size:13px;font-weight:700;color:var(--violet)}
/* concepts */
.gfb-con{display:grid;gap:12px}
.gfb-con article{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:clamp(16px,2.6vw,36px);align-items:center;padding:clamp(16px,2vw,24px);background:#fff;border:1px solid var(--line)}
.gfb-con article:nth-child(even) .ph{order:2}
.gfb-con .ph{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.gfb-con .ph img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;background:#E6E0DA}
.gfb-con .ph img:first-child{grid-column:1/-1;aspect-ratio:16/9}
.gfb-con .pl{margin:0 0 6px;color:var(--violet);font-weight:800;font-size:14px}
.gfb-con h3{font-size:clamp(28px,3vw,46px);font-weight:800;letter-spacing:-.04em;line-height:.98}
.gfb-con p.t{margin:12px 0 0;color:#5A4652;font-size:16px}
.gfb-con .tag{display:inline-flex;margin-top:12px;padding:5px 10px;border-radius:999px;background:var(--paper);font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--muted)}
/* krakow strip */
.gfb-strip{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;counter-reset:k}
.gfb-strip li{position:relative;counter-increment:k}
.gfb-strip img{display:block;width:100%;aspect-ratio:1;object-fit:cover;background:#2a1520}
.gfb-strip span{position:absolute;left:8px;bottom:8px;padding:6px 10px;background:rgba(28,9,18,.84);color:#fff;font-size:13px;font-weight:700}
.gfb-strip span::before{content:"0" counter(k) " ";color:var(--lime)}
/* author */
.gfb-auth{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,8fr);gap:clamp(20px,3vw,48px);align-items:center}
.gfb-auth img{display:block;width:100%;aspect-ratio:4/5;object-fit:cover;object-position:50% 20%;background:#2a1520}
.gfb-auth blockquote{margin:0;font-size:clamp(26px,2.8vw,42px);font-weight:800;letter-spacing:-.035em;line-height:1.05;color:#fff}
.gfb-auth blockquote::before{content:"„";color:var(--lime)}.gfb-auth blockquote::after{content:"”";color:var(--lime)}
.gfb-auth p.l{margin:16px 0 0;font-size:17px;color:rgba(244,241,238,.85)}
.gfb-tl{list-style:none;margin:20px 0 0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.gfb-tl li{padding:12px 14px;border:1px solid rgba(244,241,238,.2);font-size:14px;color:rgba(244,241,238,.85)}
.gfb-tl b{display:block;font-size:20px;color:var(--lime)}
@media (max-width:1100px){.gfb-tools{grid-template-columns:repeat(2,minmax(0,1fr))}.gfb-dl{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:900px){.gfb-ways,.gfb-con article,.gfb-auth{grid-template-columns:minmax(0,1fr)}.gfb-con article:nth-child(even) .ph{order:0}.gfb-strip{grid-template-columns:repeat(2,minmax(0,1fr))}.gfb-auth img{max-width:360px}}
@media (max-width:560px){.gfb-tools,.gfb-dl,.gfb-tl{grid-template-columns:minmax(0,1fr)}}
"""

hero_mosaic = "".join(f'<li>{img(p, a, eager=i == 0)}<span>{c}</span></li>' for i, (p, a, c) in enumerate([
    ("2026/11/IMG_1050-768x492.jpg", "Plac pod Pałacem Kultury z boiskami Gamefields, wizualizacja", "Koncepcja"),
    ("2026/11/Gamefields-x-boiska-x-Projekt-Krakow--768x768.jpg", "Plan zagospodarowania z arenami Gamefields, Kraków", "Plan"),
    ("2026/10/52.jpg", "Plansze koncepcji boiska pod Mostem Łazienkowskim", "Plansze"),
    ("2026/11/Krakow-Panna-Arena-Octa-Cage-90-Gamefields-768x768.jpg", "Gotowa arena w parku, Kraków", "Zbudowane"),
]))

WAYS = [
    ("Sam, online", "Studio 3D", "Wybierasz model, kolor ramy, nawierzchnię i wzór. Cena liczy się na bieżąco.",
     ["8 modeli i 8 nawierzchni", "732 wzory w 12 wariantach", "karta projektu PDF z ceną"], "/studio/", "Otwórz Studio ↗", True),
    ("Ze mną, dla Twojego miejsca", "Koncepcja miejsca", "Prześlij wymiary i zdjęcia placu. Przygotuję koncepcję i umówimy wizję lokalną.",
     ["układ, strefy i dojścia", "warianty do porównania", "render 3D i cena"], "/kontakt/", "Wyślij zdjęcia placu →", False),
    ("Dla gmin, szkół i Orlików", "Koncepcja z dokumentami", "Koncepcja, parametry techniczne i dokumenty do wniosku o dofinansowanie i do przetargu.",
     ["karty techniczne i certyfikaty", "nabory 2027 od 4 stycznia", "rok gwarancji po realizacji"], "/dofinansowanie-boisk/", "Dofinansowanie →", False),
]
ways_html = "".join(f'<li{" class=hl" if hl else ""}><span class="q">{q}</span><b>{t}</b><p>{d}</p><ul>' + "".join(f"<li>{x}</li>" for x in pts) +
                    f'</ul><div class="gfa-btns"><a class="gfa-btn{"" if hl else " alt"}" href="{href}">{go}</a></div></li>' for q, t, d, pts, href, go, hl in WAYS)

TOOLS = [
    ("⌗", "Zmieści się?", "Wpisz wymiary placu. Planer narysuje go w skali i pokaże, które boiska się zmieszczą razem z zapasem wokół.", "/#planer", "Planer placu →"),
    ("◩", "Na Twoim placu", "Wgraj zdjęcie placu, przeciągnij model i ustaw skalę. Zdjęcie zostaje w Twojej przeglądarce.", "/#gfs-site", "Postaw boisko →"),
    ("◈", "Studio 3D", "Model, rama, nawierzchnia i wzór w 3D. Projekt pobierasz jako kartę PDF i wysyłasz do wyceny.", "/studio/", "Projektuj ↗"),
    ("Σ", "Kalkulator budżetu", f"Konstrukcja, płyta i nawierzchnia dla wybranego boiska. Konstrukcje od {zl(CHEAP['constructionFromNet'])} netto.", "/budowa-boisk-sportowych/#kalkulator", "Policz →"),
]
tools_html = "".join(f'<li><a href="{h}"><span class="ic" aria-hidden="true">{ic}</span><b>{t}</b><span class="d2">{d}</span><span class="go">{g}</span></a></li>' for ic, t, d, h, g in TOOLS)

DELIV = [
    ("Układ i wymiary", "Boisko wpisane w plac: strefy bezpieczeństwa, dojścia, ławki, miejsce na serwis.", "CAD"),
    ("Widok 3D", "Konstrukcja, kolory ramy i nawierzchnia tak, jak będą wyglądać na miejscu.", "render ze Studia"),
    ("Wzór i linie", "Wzór nawierzchni, kolory i linie do jednej albo kilku gier, gotowe do malowania.", "Signature albo Masters II"),
    ("Nawierzchnia i podłoże", f"Dobór wykończenia i podbudowy. Płyta betonowa z podbudową {BASE['rateNetPerM2']} zł/m².", "8 nawierzchni z wariantami"),
    ("Cena", "Konstrukcja, płyta i nawierzchnia policzone dla Twojego projektu. Montaż i transport po zdjęciach.", "karta projektu PDF"),
    ("Dokumenty", "Parametry techniczne, karty techniczne i certyfikaty stali, farb i nawierzchni.", "do wniosku i przetargu"),
]
dl_html = "".join(f"<div><dt>{t}</dt><dd>{d}<small>{s}</small></dd></div>" for t, d, s in DELIV)

CONCEPTS = [
    ("Warszawa", "Plac pod Pałacem Kultury", "Miejsca do gry wpisane w posadzkę placu, obok strefy do jazdy i odpoczynku.",
     [("2026/11/IMG_1050-768x492.jpg", "Widok z placu, wizualizacja"), ("2026/11/IMG_1049-768x327.jpg", "Panorama placu, wizualizacja"), ("2026/11/IMG_1048-768x448.jpg", "Układ placu, aksonometria")], "wizualizacja"),
    ("Warszawa, styczeń 2026", "Pod Mostem Łazienkowskim", "Plac pod konstrukcją mostu, przy bulwarach. Boisko z czytelnym wzorem nawierzchni w miejscu, które dziś jest pustym betonem.",
     [("2026/10/51.jpg", "Koncepcja boiska pod Mostem Łazienkowskim, widok z góry"), ("2026/10/53.jpg", "Wizualizacja boiska pod Mostem Łazienkowskim"), ("2026/10/54.jpg", "Wizualizacja od strony bulwarów")], "wizualizacja"),
    ("Warszawa, Pole Mokotowskie", "Stary plac, nowe boisko", "Betonowe boisko do koszykówki i koncepcja Organic Flow na tym samym zdjęciu (Google Street View, 2017).",
     [("2026/11/pole-mokotowskie-po-1100.webp", "Koncepcja: kolorowe boisko Organic Flow na tym samym placu"), ("2026/11/pole-mokotowskie-przed-720.webp", "Przed: szary betonowy plac do koszykówki"), ("2026/10/Gamefields-Studio-%E2%80%94-Organic-Flow-768x432.webp", "Wzór Organic Flow w Studio Gamefields")], "wizualizacja, nie realizacja"),
    ("Freestival Street Games 2017", "Arena jako scena", "Koncepcje areny turniejowej dla Mistrzostw Świata: boisko w środku, trybuny dookoła, oświetlenie i miejsce dla DJ-a.",
     [("2026/11/IMG_1084-768x421.jpg", "Arena z trybunami, Freestival Street Games 2017"), ("2026/11/IMG_1083-768x393.jpg", "Widok na scenę, Freestival Street Games 2017"), ("2026/11/IMG_1082-768x462.jpg", "Arena przy centrum kultury, wizualizacja")], "koncepcja wydarzenia"),
]
con_html = "".join(f'<article><div class="ph">' + "".join(img(p, a) for p, a in ph) + f'</div><div><p class="pl">{pl}</p><h3>{t}</h3><p class="t">{d}</p><span class="tag">{tag}</span></div></article>'
                   for pl, t, d, ph, tag in CONCEPTS)

strip = "".join(f'<li>{img(p, a)}<span>{c}</span></li>' for p, a, c in [
    ("2026/11/Gamefields-x-boiska-x-Projekt-Krakow--768x768.jpg", "Plan zagospodarowania z arenami, Kraków", "Projekt na planie"),
    ("2026/11/Gamefields-x-Panna-Cage-x-Krakow-montaz-768x576.jpg", "Montaż areny w parku, Kraków", "Montaż"),
    ("2026/11/Gamefields-x-Panna-Cage-x-Krakow-768x576.jpg", "Arena przed odbiorem, Kraków", "Przed odbiorem"),
    ("2026/11/Krakow-Panna-Arena-Octa-Cage-90-Gamefields-768x768.jpg", "Panna Octa Cage 90 w parku, Kraków", "W parku"),
])

STEPS = [
    ("Brief", "Lokalizacja, wymiary, zdjęcia, kto będzie grał i w co. Na start nie potrzebujesz dokumentacji.", "rozmawiasz ze mną, nie z formularzem."),
    ("Analiza miejsca", "Dojazd, spadki, istniejąca nawierzchnia, otoczenie i strefy bezpieczeństwa.", "planer w skali, potem wizja lokalna."),
    ("Warianty", "Kilka kierunków: model, układ, nawierzchnia i wzór. Porównanie, zanim cokolwiek się zamówi.", "każdy wariant od razu z ceną."),
    ("Dopracowanie", "Kolory, linie, branding i detale. Projekt, który da się zbudować i namalować.", "karta projektu PDF."),
    ("Realizacja", "Ten sam projekt przechodzi w budowę albo renowację, z tą samą osobą od początku do końca.", "12 miesięcy gwarancji i opieka po odbiorze."),
]
steps_html = "".join(f'<li><b>{t}</b><p>{d}</p><span class="gf">{g}</span></li>' for t, d, g in STEPS) + \
    "".join(f'<li class="ph">{img(p, a)}</li>' for p, a in [("2026/10/52.jpg", "Plansze projektu boiska"), ("2026/11/IMG_1048-768x448.jpg", "Układ placu, aksonometria"),
                                                          ("2026/11/Gamefields-x-Panna-Cage-x-Krakow-montaz-768x576.jpg", "Montaż areny, Kraków")])

FAQ = [
    ("Co trzeba przygotować do rozpoczęcia projektu?",
     "Lokalizację, orientacyjne wymiary, zdjęcia miejsca i informację, kto ma grać i w co. Na tej podstawie przygotuję wstępną koncepcję. Dokumentacja nie jest potrzebna na start."),
    ("Czy mogę zaprojektować boisko sam?",
     "Tak. W Studio 3D wybierasz model, kolor ramy, nawierzchnię i wzór, a cena liczy się na bieżąco. Projekt pobierasz jako kartę PDF i wysyłasz do wyceny. Wymiary placu sprawdzisz wcześniej w planerze „Zmieści się?”."),
    ("Co zawiera projekt koncepcyjny?",
     "Układ boiska na placu ze strefami i dojściami, widok 3D, wzór i linie, dobór nawierzchni i podłoża oraz cenę. Dla gmin i szkół także parametry techniczne i dokumenty do wniosku oraz przetargu."),
    ("Ile kosztuje boisko z projektu?",
     f"Konstrukcje Gamefields kosztują od {zl(CHEAP['constructionFromNet'])} netto, płyta betonowa z podbudową {BASE['rateNetPerM2']} zł/m², nawierzchnie od 78 zł/m². Dokładną cenę projektu pokazuje Studio 3D; montaż, transport i przygotowanie terenu liczę po zdjęciach."),
    ("Czy projekt może uwzględniać branding?",
     "Tak. Barwy i znak miasta, szkoły, klubu albo partnera mogą być częścią nawierzchni, band i całej oprawy, bez utraty czytelności gry."),
    ("Czy pomagacie przy projekcie do wniosku o dofinansowanie?",
     "Tak. Przygotowuję koncepcję, parametry techniczne i dokumenty do wniosku o dofinansowanie i do przetargu, z kartami technicznymi i certyfikatami producentów. Nabory na 2027 rok ruszają 4 stycznia."),
    ("Czy później możecie wykonać zaprojektowane boisko?",
     "Tak. Projekt może być samodzielnym etapem albo początkiem realizacji: budowy, renowacji albo malowania. Tak było w Krakowie: od projektu na planie zagospodarowania do gotowej areny w parku."),
    ("Czym projekt koncepcyjny różni się od wizualizacji?",
     "Wizualizacja pokazuje wygląd. Koncepcja Gamefields to także wymiary, strefy, nawierzchnia, podłoże i cena, czyli rozwiązanie, które da się zbudować. Na stronie zawsze oznaczam, co jest wizualizacją, a co realizacją."),
]

jump = [("sposoby", "Trzy drogi"), ("narzedzia", "Narzędzia"), ("projekt", "Co dostajesz"), ("koncepcje", "Koncepcje"), ("krakow", "Od planu do parku"),
        ("proces", "Etapy"), ("autor", "Autor"), ("pytania", "Pytania")]

body = f"""
<section class="gfb-hero"><div class="w top">
  <div>
    <p class="gfb-crumbs"><a href="/">Gamefields</a> / Projektowanie boisk</p>
    <p class="k">Od miejsca do pierwszego meczu</p>
    <h1 class="d">Projektowanie boisk sportowych.</h1>
    <p class="lead">Zaczynam od miejsca i ludzi, którzy będą na nim grać. Potem rysuję boisko, które pasuje do placu, a nie z katalogu: układ, konstrukcję, nawierzchnię i wzór, od razu z ceną.</p>
    <div class="gfa-btns"><a class="gfa-btn" href="/studio/">Zaprojektuj w Studio ↗</a><a class="gfa-btn alt" href="/kontakt/">Wyślij zdjęcia placu →</a></div>
  </div>
  <ul class="gfb-mosaic" role="list">{hero_mosaic}</ul>
</div>
<div class="w">
  <dl class="gfb-nums">
    <div><dt>Studio 3D</dt><dd>na żywo<small>projekt i cena od razu</small></dd></div>
    <div><dt>Wzory</dt><dd>732<small>61 kierunków × 12 wariantów</small></dd></div>
    <div><dt>Projekt</dt><dd>PDF<small>karta projektu z ceną</small></dd></div>
    <div><dt>Na boisku</dt><dd>od 2005<small>turnieje od 2008</small></dd></div>
  </dl>
</div></section>

<nav class="gfb-jump" aria-label="Na tej stronie"><div class="w"><ul role="list">{jump_html(jump)}</ul></div></nav>

<section class="gfa-sec" id="sposoby"><div class="w">
  <div class="gfa-head"><div><p class="k">Trzy drogi</p><h2 class="d">Jak chcesz zacząć?</h2></div><p>Sam w Studio, razem ze mną dla konkretnego miejsca albo z dokumentami dla gminy. Każda droga kończy się projektem z ceną.</p></div>
  <ul class="gfb-ways" role="list">{ways_html}</ul>
</div></section>

<section class="gfa-sec" id="narzedzia"><div class="w">
  <div class="gfa-head"><div><p class="k">Narzędzia</p><h2 class="d">Sprawdź, zanim zapytasz.</h2></div><p>Cztery narzędzia online, z których korzystam też przy koncepcjach. Wystarczą wymiary i zdjęcie z telefonu.</p></div>
  <ul class="gfb-tools" role="list">{tools_html}</ul>
</div></section>

<section class="gfa-sec" id="projekt"><div class="w">
  <div class="gfa-head"><div><p class="k">Co dostajesz</p><h2 class="d">Projekt, który da się zbudować.</h2></div><p>Pracuję w CAD i renderach 3D, potem na placu. Projekt to nie tylko obrazek, ale wymiary, materiały i cena.</p></div>
  <dl class="gfb-dl">{dl_html}</dl>
</div></section>

<section class="gfa-sec" id="koncepcje"><div class="w">
  <div class="gfa-head"><div><p class="k">Koncepcje</p><h2 class="d">Miejsca, które dopiero mogą powstać.</h2></div><p>Wybrane koncepcje dla Warszawy i wydarzeń. Zawsze piszę, co jest wizualizacją, a co realizacją. <a href="/koncepcje/">Wszystkie koncepcje →</a></p></div>
  <div class="gfb-con">{con_html}</div>
</div></section>

<section class="gfa-band" id="krakow"><div class="w">
  <div class="gfa-head"><div><p class="k">Od planu do parku</p><h2 class="d">Projekt, który stoi.</h2></div><p>Kraków: Panna Octa Cage 90 na terenie miejskim. Projekt na planie zagospodarowania, montaż, odbiór i gotowa arena w parku.</p></div>
  <ul class="gfb-strip" role="list">{strip}</ul>
  <ul class="gfa-links"><li><a href="/realizacje-gamefields/#krakow">Historia realizacji →</a></li><li><a href="/realizacje-dla-miast/">Realizacje dla miast →</a></li></ul>
</div></section>

<section class="gfa-sec" id="proces"><div class="w">
  <div class="gfa-head"><div><p class="k">Etapy</p><h2 class="d">Najpierw decyzje, potem budowa.</h2></div><p>Najtańsza zmiana to ta na etapie projektu. Dlatego zanim wejdzie ekipa, ustalamy wszystko, co ważne.</p></div>
  <ol class="gfb-steps">{steps_html}</ol>
</div></section>

<section class="gfa-band" id="autor"><div class="w">
  <div class="gfb-auth">
    <img src="{UP}2026/11/DAMIAN-GAWRYCH-1-768x998.jpeg" alt="Damian Gawrych, autor studia Gamefields" width="768" height="998" loading="lazy" decoding="async">
    <div>
      <p class="k">Autor studia</p>
      <blockquote>Zaczynam od miejsca, kończę na pierwszym meczu.</blockquote>
      <p class="l">Damian Gawrych. W pannę gram od 2005 roku, turnieje organizuję od 2008. Każdy projekt zaczynam od rozmowy z ludźmi, którzy będą na nim grać.</p>
      <ul class="gfb-tl" role="list"><li><b>2015</b>podium mistrzostw świata, Praga</li><li><b>2017</b>organizator Mistrzostw Świata Freestival Street Games</li><li><b>Warszawa</b>Taras pod Pałacem Kultury: trzy areny Panna Ring</li></ul>
      <ul class="gfa-links"><li><a href="/damian-gawrych/">Kim jestem →</a></li><li><a href="/jak-powstaje-arena/">Jak powstaje arena →</a></li></ul>
    </div>
  </div>
</div></section>

<section class="gfa-sec" id="start"><div class="w">
  <div class="gfa-head"><div><p class="k">Na start</p><h2 class="d">Masz miejsce? To wystarczy.</h2></div><p>Nie potrzebujesz projektu ani znajomości technologii. Pokaż miejsce, a przełożę je na konkretny układ boiska.</p></div>
  <div class="gfb-prep">
    <div><h3>Wyślij mi</h3><ul class="gfb-check">
      <li><span><b>Lokalizację</b>: adres albo pinezkę.</span></li><li><span><b>Wymiary</b>: przybliżone, z miarki albo z mapy.</span></li>
      <li><span><b>Zdjęcia</b>: cały plac i otoczenie z kilku stron.</span></li><li><span><b>Kto i w co gra</b>: wiek, sporty, intensywność.</span></li>
      <li><span><b>Termin</b>: także, jeśli zależy od naboru.</span></li></ul></div>
    <div><h3>Albo zacznij sam</h3><ul class="gfb-check">
      <li><span>Sprawdź plac w planerze „Zmieści się?”.</span></li><li><span>Postaw boisko na zdjęciu swojego placu.</span></li>
      <li><span>Zaprojektuj w Studio 3D i pobierz kartę PDF.</span></li><li><span>Dołącz ją do zapytania.</span></li></ul>
      <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Wyślij zdjęcia placu →</a><a class="gfa-btn alt" href="/studio/">Studio 3D ↗</a></div></div>
  </div>
</div></section>

<section class="gfa-sec" id="pytania"><div class="w">
  <div class="gfa-head"><div><p class="k">Pytania</p><h2 class="d">Zanim zaczniemy.</h2></div><p>Co przygotować, co dostajesz, ile to kosztuje i co dalej.</p></div>
  <div class="gfa-faq">{faq_html(FAQ)}</div>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><div><p class="k">Dalej</p><h2 class="d">Z projektu na plac.</h2></div><p>Projekt przechodzi w budowę, renowację albo malowanie.</p></div>
  <ul class="gfb-next" role="list">
    <li><a href="/budowa-boisk-sportowych/"><i>Kolejny etap</i><b>Budowa boisk</b><span>Płyta, nawierzchnia, konstrukcja i odbiór.</span></a></li>
    <li><a href="/malowanie-boisk/"><i>Warstwa wizualna</i><b>Malowanie boisk</b><span>Wzór, linie i branding na nawierzchni.</span></a></li>
    <li><a href="/nawierzchnie-sportowe/"><i>Materiały</i><b>Nawierzchnie sportowe</b><span>Osiem nawierzchni z cenami.</span></a></li>
  </ul>
  <ul class="gfb-who" role="list"><li><a href="/dla-miast/"><span>Dla</span>miast i gmin</a></li><li><a href="/boiska-dla-szkol/"><span>Dla</span>szkół</a></li><li><a href="/boiska-dla-deweloperow/"><span>Dla</span>deweloperów</a></li><li><a href="/boiska-dla-klubow/"><span>Dla</span>klubów</a></li><li><a href="/aktywacje-sportowe-dla-marek/"><span>Dla</span>marek</a></li><li><a href="/wymiary-boiska-wielofunkcyjnego/">Wymiary boiska</a></li><li><a href="/koncepcje/">Koncepcje</a></li></ul>
</div></section>

<section class="gfa-cta"><div class="w">
  <h2 class="d">Masz miejsce,<br>nie masz projektu?</h2>
  <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Pokaż mi miejsce →</a><a class="gfa-btn alt" href="/studio/">Zaprojektuj w Studio ↗</a></div>
</div></section>
"""

ld = {"@context": "https://schema.org", "@graph": [
    {"@type": "Service", "@id": URL + "#usluga", "name": "Projektowanie boisk sportowych", "serviceType": "Projektowanie boisk i koncepcje miejsc gry", "url": URL, "inLanguage": "pl-PL",
     "areaServed": {"@type": "Country", "name": "Polska"}, "provider": {"@id": SITE + "#studio"},
     "description": "Koncepcje boisk dopasowane do miejsca: układ, konstrukcja, nawierzchnia, wzór i cena. Studio 3D, planer placu, dokumenty do wniosku i przetargu."},
    {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Gamefields", "item": SITE},
                                                    {"@type": "ListItem", "position": 2, "name": "Projektowanie boisk", "item": URL}]},
    {"@type": "FAQPage", "@id": URL + "#pytania", "inLanguage": "pl-PL",
     "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]}]}

write(HERE, "projektowanie-boisk", CSS, ld, body)
