#!/usr/bin/env python3
"""/wynajem-boisk-mobilnych/ (page 3725), rebuilt 23.11.2026 in the .gfb style. Footer link: "Eventy i wynajem".

Output: wynajem-boisk-mobilnych.html (one wp:html block, the whole content of the page).

Mobile arena for events: formats, where it has stood (hall, outdoor, shopping centre, stadium, festival), rental or
purchase compared, the scope from the live page, full event production (tournaments, referees, host, DJ, content)
with photos from the events page, the author as organiser, process, what to send for a quote, FAQ.
The 27 000 zł in price-from.json is the construction (purchase) price; rental is quoted per date and place.
"""
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from gfb_common import (GFB_CSS, MOBILE, PRICE, SITE, UP, VAT, img, jump_html, faq_html, write, zl)  # noqa: E402

URL = SITE + "wynajem-boisk-mobilnych/"
PB = {m["id"]: m for m in PRICE["models"]}
BUY = MOBILE["constructionFromNet"]

CSS = GFB_CSS + """
.gfb-hero figure.ph1{margin:0;background:#2a1520;overflow:hidden;position:relative}
.gfb-hero figure.ph1 img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover}
.gfa .gfb-hero figure.ph1 figcaption{position:absolute;left:10px;bottom:10px;margin:0;padding:6px 10px;background:rgba(28,9,18,.84);color:#fff;font-size:13px}
.gfb-fm{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.gfb-fm > li{display:flex;flex-direction:column;gap:10px;padding:24px;background:#fff;border:1px solid var(--line)}
.gfb-fm .n{font-size:13px;font-weight:800;letter-spacing:.06em;color:var(--violet)}
.gfb-fm b{font-size:24px;letter-spacing:-.03em;line-height:1.08}
.gfb-fm p{margin:0;color:#5A4652;font-size:15px}
.gfb-where{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.gfb-where li{position:relative;overflow:hidden;background:#2a1520}
.gfb-where img{display:block;width:100%;aspect-ratio:1;object-fit:cover;transition:transform .6s cubic-bezier(.2,.7,.2,1)}
.gfb-where li:hover img{transform:scale(1.05)}
.gfb-where span{position:absolute;left:8px;right:8px;bottom:8px;padding:8px 10px;background:rgba(28,9,18,.84);color:#fff;font-size:13px;line-height:1.3}
.gfb-where span b{display:block;font-size:14px}
.gfb-places{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 0;padding:0;list-style:none}
.gfb-places li{display:inline-flex;align-items:center;min-height:40px;padding:0 16px;border-radius:999px;background:#fff;border:1px solid var(--line);font-weight:700;font-size:14px}
.gfb-vs2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.gfb-vs2 > div{display:flex;flex-direction:column;gap:10px;padding:clamp(20px,2.4vw,32px);background:#fff;border:1px solid var(--line)}
.gfb-vs2 > div.hl{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.gfb-vs2 .k{margin:0}
.gfb-vs2 .hl .k{color:var(--lime)}
.gfb-vs2 h3{font-size:clamp(28px,2.8vw,44px);font-weight:800;letter-spacing:-.04em;line-height:1}
.gfb-vs2 .pr{font-size:20px;font-weight:800}
.gfb-vs2 ul{margin:0;padding-left:20px;display:grid;gap:6px;font-size:16px;color:#5A4652}
.gfb-vs2 .hl ul{color:rgba(244,241,238,.88)}
.gfb-vs2 .for{margin-top:auto;padding-top:12px;border-top:1px solid var(--line);font-size:15px}
.gfb-vs2 .hl .for{border-color:rgba(244,241,238,.2)}
.gfb-vs2 .hl .gfa-btn{background:var(--lime);color:#1F2A6B!important}
.gfb-scope{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;counter-reset:s}
.gfb-scope li{padding:20px 22px;background:#fff;border:1px solid var(--line);counter-increment:s}
.gfb-scope li::before{content:counter(s,decimal-leading-zero);display:block;margin-bottom:8px;color:var(--violet);font-weight:800;font-size:13px}
.gfb-scope b{display:block;font-size:19px;letter-spacing:-.02em}
.gfb-scope span{display:block;margin-top:6px;font-size:15px;color:#5A4652}
.gfb-prod{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(20px,3vw,48px);align-items:start}
.gfb-prod .ph{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.gfb-prod .ph figure{margin:0;position:relative}
.gfb-prod .ph img{display:block;width:100%;aspect-ratio:1;object-fit:cover;background:#2a1520}
.gfb-prod .ph figcaption{position:absolute;left:6px;right:6px;bottom:6px;margin:0;padding:5px 8px;background:rgba(28,9,18,.84);color:#fff!important;font-size:12px;line-height:1.3}
.gfb-prod ul.items{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.gfb-prod ul.items li{padding:14px 16px;border:1px solid rgba(244,241,238,.2);font-size:15px;color:rgba(244,241,238,.85)}
.gfb-prod ul.items b{display:block;font-size:18px;color:#fff;letter-spacing:-.02em}
.gfb-tl{list-style:none;margin:16px 0 0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.gfb-tl li{padding:12px 14px;border:1px solid rgba(244,241,238,.2);font-size:14px;color:rgba(244,241,238,.85)}
.gfb-tl b{display:block;font-size:20px;color:var(--lime)}
@media (max-width:1100px){.gfb-where{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:900px){.gfb-fm,.gfb-vs2,.gfb-prod{grid-template-columns:minmax(0,1fr)}.gfb-scope{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:560px){.gfb-scope,.gfb-tl{grid-template-columns:minmax(0,1fr)}}
"""

FM = [("01", "Panna, 1 na 1", "Mała, zamknięta arena do pojedynków, challenge'ów i otwartej gry. Widzowie stoją dookoła."),
      ("02", "Street football", "Modułowe bandy i małe bramki do rywalizacji drużynowej, także 3 na 3."),
      ("03", "Brandowana arena", "Komunikacja partnera na bandach, wyposażeniu i w otoczeniu gry.")]
fm_html = "".join(f'<li><span class="n">{n}</span><b>{t}</b><p>{d}</p></li>' for n, t, d in FM)

WHERE = [("2024/12/7-3-768x768.jpg", "Mobilna arena panna z bandami Head & Shoulders Freestyle Football Cup Poland 2013 w hali, wokół widzowie", "Arena w hali", "Freestyle Football Cup 2013"),
         ("2024/12/9-3-768x768.jpg", "Dzieci grają na okrągłym boisku panna z bandami Head & Shoulders w parku", "Arena w plenerze", "gra dla dzieci i rodzin"),
         ("2026/11/12-768x574.jpg", "Event Head & Shoulders na arenie panna, Złote Tarasy, Warszawa", "Złote Tarasy, Warszawa", "centrum handlowe"),
         ("2026/11/1-768x576.jpg", "Event Head & Shoulders na arenie panna, stadion w Gdańsku", "Stadion, Gdańsk", "strefa kibica")]
where_html = "".join(f'<li>{img(p, a)}<span><b>{t}</b>{d}</span></li>' for p, a, t, d in WHERE)

SCOPE = [("Dobór systemu", "Wielkość, konstrukcja i typ boiska do lokalizacji i programu wydarzenia."),
         ("Transport", "Logistyka dostawy i odbioru infrastruktury."),
         ("Montaż i demontaż", "Złożenie systemu i przygotowanie go do bezpiecznego użytkowania."),
         ("Branding czasowy", "Identyfikacja kampanii albo partnera wydarzenia na bandach i w oprawie."),
         ("Wyposażenie", "Bramki, piłki, timer, oznaczenia i elementy do prowadzenia gry."),
         ("Obsługa sportowa", "Opcjonalnie: turniej, sędziowanie, prowadzenie i program aktywacji.")]
scope_html = "".join(f'<li><b>{t}</b><span>{d}</span></li>' for t, d in SCOPE)

PROD_PH = [("2026/11/IMG_1085-768x431.jpg", "Stoisko Freestival Street Games na PGE Narodowym", "Freestival Street Games 2017, PGE Narodowy"),
           ("2026/11/IMG_1079.jpg", "Zwycięzcy turnieju na podium", "Podium turnieju, Street Games"),
           ("2026/11/IMG_1080-768x431.jpg", "Plakat turnieju One vs One Panna", "One vs One Panna, plakat turnieju"),
           ("2026/11/IMG_1051-768x521.jpg", "Pokaz gry na Tarasie przy Pałacu Kultury i Nauki", "Pokaz na Tarasie, Warszawa (fot. ZZM)")]
prod_ph = "".join(f'<figure>{img(p, a)}<figcaption>{c}</figcaption></figure>' for p, a, c in PROD_PH)

STEPS = [("Lokalizacja", "Miejsce, podłoże, dojazd i warunki montażu.", "hala albo plener, sprawdzam przed wyceną."),
         ("Dobór boiska", "Format i wielkość do programu i ruchu uczestników.", "1 na 1, street football albo brandowana arena."),
         ("Logistyka", "Transport, godziny montażu, zaplecze.", "jedna osoba kontaktowa."),
         ("Montaż", "Złożenie systemu i kontrola przed startem.", "branding i wyposażenie na miejscu."),
         ("Gra i odbiór", "Event, potem demontaż i odbiór infrastruktury.", "opcjonalnie turniej i prowadzenie.")]
steps_html = "".join(f'<li><b>{t}</b><p>{d}</p><span class="gf">{g}</span></li>' for t, d, g in STEPS) + \
    "".join(f'<li class="ph">{img(p, a)}</li>' for p, a in [("2024/12/9-3-768x768.jpg", "Arena panna w plenerze"), ("2026/11/GAMEFIELDS-Street-Football-Tournament-1-768x576.png", "Turniej street football na arenie Gamefields"),
                                                          ("2024/12/7-3-768x768.jpg", "Arena panna w hali")])

FAQ = [
    ("Ile kosztuje wynajem mobilnego boiska?",
     f"Wynajem wyceniam do konkretnego terminu i miejsca, bo zależy od czasu trwania, transportu, montażu, brandingu i obsługi. Mobilną arenę można też kupić: od {zl(BUY)} netto ({zl(round(BUY * VAT))} brutto) za konstrukcję."),
    ("Na jak długo można wynająć boisko?",
     "Zakres ustalam projektowo: od pojedynczego wydarzenia po dłuższą aktywację czasową. Przy wielu terminach w sezonie warto porównać wynajem z zakupem."),
    ("Czy boisko może stanąć w hali?",
     "Tak, arena stała już w hali podczas Head & Shoulders Freestyle Football Cup 2013. Zależy to od systemu, podłoża, wymiarów i warunków obiektu, dlatego przed wyceną sprawdzam lokalizację i dostęp montażowy."),
    ("Czy można dodać branding sponsora?",
     "Tak. Branding może obejmować bandy, elementy wyposażenia i oprawę przestrzeni. Możliwości zależą od modelu boiska i charakteru elementów."),
    ("Czy organizujecie cały turniej, czy tylko dostarczacie boisko?",
     "Jedno albo drugie. Mogę dostarczyć samo boisko z transportem i montażem albo przygotować całą sportową część wydarzenia: format, sędziów, prowadzenie, DJ-a i branding."),
    ("Jak zorganizować turniej piłkarski dla dzieci?",
     "W briefie określ wiek uczestników, liczbę drużyn, poziom gry i czas wydarzenia. Do tego dobieram format meczów, przerwy, zasady i prowadzenie. Formaty 1 na 1 i 3 na 3 pozwalają wykorzystać małą przestrzeń, ale trzeba też zaplanować strefę oczekiwania i publiczność."),
    ("Czy robicie turnieje dla firm i pracowników?",
     "Tak. Ustalam liczbę drużyn, poziom uczestników, harmonogram, obsługę i zasady rywalizacji. Zakres może obejmować mobilne boisko, koordynację, sędziów, prowadzenie, DJ-a i branding."),
    ("Co jest potrzebne do wyceny?",
     "Data, lokalizacja, zdjęcia miejsca, wymiary dostępnej przestrzeni, liczba i wiek uczestników oraz czas trwania. Dodaj, czy potrzebujesz samego boiska, czy też organizacji rozgrywek, nagłośnienia, brandingu i zdjęć."),
]

jump = [("formaty", "Formaty"), ("gdzie", "Gdzie stanie"), ("wynajem-zakup", "Wynajem czy zakup"), ("zakres", "Zakres"), ("produkcja", "Cały event"),
        ("proces", "Proces"), ("wycena", "Do wyceny"), ("pytania", "Pytania")]

body = f"""
<section class="gfb-hero"><div class="w top">
  <div>
    <p class="gfb-crumbs"><a href="/">Gamefields</a> / Eventy i wynajem</p>
    <p class="k">Boisko tam, gdzie wydarzenie</p>
    <h1 class="d">Wynajem boisk mobilnych na eventy.</h1>
    <p class="lead">Mobilna arena panna albo boisko do street footballu na event firmowy, festiwal, targi, plac miejski czy aktywację marki. Z transportem, montażem, brandingiem, a jeśli chcesz, z całym turniejem.</p>
    <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Zapytaj o termin →</a><a class="gfa-btn alt" href="#gdzie">Zobacz eventy ↓</a></div>
  </div>
  <figure class="ph1"><img src="{UP}2024/12/7-3.jpg" srcset="{UP}2024/12/7-3-768x768.jpg 768w, {UP}2024/12/7-3.jpg 1000w" sizes="(max-width:900px) 100vw, 50vw" alt="Mobilna arena panna z bandami Head &amp; Shoulders w hali, wokół widzowie" loading="eager" decoding="async"><figcaption>Head &amp; Shoulders Freestyle Football Cup 2013, arena w hali</figcaption></figure>
</div>
<div class="w">
  <dl class="gfb-nums">
    <div><dt>Wynajem</dt><dd>na termin<small>wycena do daty i miejsca</small></dd></div>
    <div><dt>Zakup</dt><dd>od {zl(BUY)}<small>netto, arena mobilna</small></dd></div>
    <div><dt>Eventy</dt><dd>od 2008<small>turnieje, festiwale, marki</small></dd></div>
    <div><dt>Miejsce</dt><dd>hala i plener<small>galeria, stadion, park</small></dd></div>
  </dl>
</div></section>

<nav class="gfb-jump" aria-label="Na tej stronie"><div class="w"><ul role="list">{jump_html(jump)}</ul></div></nav>

<section class="gfa-sec" id="formaty"><div class="w">
  <div class="gfa-head"><div><p class="k">Formaty</p><h2 class="d">Sport z własną sceną.</h2></div><p>Kluczowe jest dobranie systemu do miejsca, czasu montażu i ruchu uczestników.</p></div>
  <ul class="gfb-fm" role="list">{fm_html}</ul>
</div></section>

<section class="gfa-sec" id="gdzie"><div class="w">
  <div class="gfa-head"><div><p class="k">Gdzie stanie</p><h2 class="d">W hali, w parku, w galerii.</h2></div><p>Mobilna arena panna z brandingiem Head &amp; Shoulders: Freestyle Football Cup 2013 w hali i w plenerze, Złote Tarasy i stadion w Gdańsku. <a href="/realizacje-gamefields/#eventy">Wszystkie eventy →</a></p></div>
  <ul class="gfb-where" role="list">{where_html}</ul>
  <ul class="gfb-places" role="list"><li>event firmowy</li><li>festiwal</li><li>targi</li><li>centrum handlowe</li><li>strefa kibica</li><li>plac miejski</li><li>dzień miasta</li></ul>
</div></section>

<section class="gfa-sec" id="wynajem-zakup"><div class="w">
  <div class="gfa-head"><div><p class="k">Wynajem czy zakup</p><h2 class="d">Na jeden dzień czy na sezon?</h2></div><p>Przy pojedynczym wydarzeniu zwykle wystarczy wynajem. Jeśli eventów jest dużo, warto policzyć zakup.</p></div>
  <div class="gfb-vs2">
    <div><p class="k">Wynajem</p><h3>Na konkretną datę.</h3><p class="pr">wycena do terminu i miejsca</p>
      <ul><li>dobór systemu do miejsca i programu</li><li>transport, montaż i demontaż</li><li>branding czasowy</li><li>opcjonalnie turniej, sędziowie, prowadzenie</li></ul>
      <p class="for"><b>Dla:</b> pojedynczy event, festiwal, aktywacja marki, dzień miasta.</p>
      <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Zapytaj o termin →</a></div></div>
    <div class="hl"><p class="k">Zakup</p><h3>Własna arena.</h3><p class="pr">od {zl(BUY)} netto · {zl(round(BUY * VAT))} brutto</p>
      <ul><li>konstrukcja z bramkami, różne wymiary</li><li>branding stały w barwach marki albo klubu</li><li>na wiele wydarzeń w sezonie</li><li>bez transportu, montażu i grafiki w cenie</li></ul>
      <p class="for"><b>Dla:</b> agencje eventowe, marki z cyklem wydarzeń, kluby, organizatorzy turniejów.</p>
      <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Zapytaj o zakup →</a></div></div>
  </div>
</div></section>

<section class="gfa-sec" id="zakres"><div class="w">
  <div class="gfa-head"><div><p class="k">Zakres</p><h2 class="d">Prosto albo kompleksowo.</h2></div><p>Dobieram zakres do tego, co jest już po stronie organizatora.</p></div>
  <ol class="gfb-scope" role="list">{scope_html}</ol>
</div></section>

<section class="gfa-band" id="produkcja"><div class="w">
  <div class="gfb-prod">
    <div class="ph">{prod_ph}</div>
    <div><p class="k">Cały event</p><h2 class="d" style="font-size:clamp(40px,5vw,80px)">Od konceptu do pierwszego gwizdka.</h2>
      <p style="margin:16px 0;font-size:17px;color:rgba(244,241,238,.85)">Nie dokładam sportu do eventu, tylko buduję event wokół gry: prosta mechanika, dobra widoczność dla publiczności i rytm, który zachęca do udziału.</p>
      <ul class="items" role="list"><li><b>Turnieje 1 na 1 i 3 na 3</b>format, liczba uczestników, zasady, harmonogram</li><li><b>Sport i obsługa</b>sędziowie, prowadzący, zawodnicy pokazowi, koordynatorzy</li><li><b>Muzyka i oprawa</b>DJ i dźwięk dopasowane do tempa wydarzenia</li><li><b>Content</b>układ przestrzeni pod zdjęcia, reelsy i materiały kampanii</li></ul>
      <ul class="gfb-tl" role="list"><li><b>2017</b>organizator Mistrzostw Świata Freestival Street Games</li><li><b>od 2008</b>turnieje panny i street footballu</li></ul>
      <ul class="gfa-links"><li><a href="/eventy-sportowe/">Eventy sportowe →</a></li><li><a href="/aktywacje-sportowe-dla-marek/">Aktywacje dla marek →</a></li></ul></div>
  </div>
</div></section>

<section class="gfa-sec" id="proces"><div class="w">
  <div class="gfa-head"><div><p class="k">Proces</p><h2 class="d">Gotowe na konkretną datę.</h2></div><p>Pięć kroków od lokalizacji do odbioru infrastruktury po wydarzeniu.</p></div>
  <ol class="gfb-steps">{steps_html}</ol>
</div></section>

<section class="gfa-sec" id="wycena"><div class="w">
  <div class="gfa-head"><div><p class="k">Do wyceny</p><h2 class="d">Co mi wysłać?</h2></div><p>Z tych informacji porównam wariant z samym boiskiem z pełną produkcją eventu.</p></div>
  <div class="gfb-prep">
    <div><h3>Wydarzenie</h3><ul class="gfb-check">
      <li><span><b>Data i czas trwania</b>: jeden dzień czy kilka.</span></li><li><span><b>Lokalizacja</b>: hala czy plener, adres.</span></li>
      <li><span><b>Zdjęcia miejsca i wymiary</b>: podłoże i dojazd.</span></li><li><span><b>Uczestnicy</b>: liczba i wiek, dzieci, dorośli, firma.</span></li></ul></div>
    <div><h3>Zakres</h3><ul class="gfb-check">
      <li><span>Samo boisko z transportem i montażem.</span></li><li><span>Turniej: sędziowie i prowadzenie.</span></li>
      <li><span>Nagłośnienie i DJ, branding, zdjęcia.</span></li></ul>
      <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Zapytaj o termin →</a><a class="gfa-btn alt" href="/aktywacje-sportowe-dla-marek/">Dla marek</a></div></div>
  </div>
</div></section>

<section class="gfa-sec" id="pytania"><div class="w">
  <div class="gfa-head"><div><p class="k">Pytania</p><h2 class="d">Wynajem i turnieje.</h2></div><p>Koszty, czas, hala, branding, turnieje dla dzieci i firm.</p></div>
  <div class="gfa-faq">{faq_html(FAQ)}</div>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><div><p class="k">Dalej</p><h2 class="d">Event, marka, boisko.</h2></div><p>Połącz wynajem z resztą Gamefields.</p></div>
  <ul class="gfb-next" role="list">
    <li><a href="/eventy-sportowe/"><i>Produkcja</i><b>Eventy sportowe</b><span>Turnieje i pokazy od briefu do gwizdka.</span></a></li>
    <li><a href="/aktywacje-sportowe-dla-marek/"><i>Kampania</i><b>Aktywacje dla marek</b><span>Brandowany court, pop-up, stała obecność.</span></a></li>
    <li><a href="/boiska-street-football/"><i>Stałe boisko</i><b>Boiska panna i street football</b><span>8 konstrukcji z cenami.</span></a></li>
  </ul>
  <ul class="gfb-who" role="list"><li><a href="/realizacje-gamefields/#eventy">Turnieje i eventy</a></li><li><a href="/dla-miast/"><span>Dla</span>miast</a></li><li><a href="/boiska-dla-klubow/"><span>Dla</span>klubów</a></li><li><a href="/boiska-dla-szkol/"><span>Dla</span>szkół</a></li></ul>
</div></section>

<section class="gfa-cta"><div class="w">
  <h2 class="d">Boisko na<br>konkretną datę?</h2>
  <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Zapytaj o termin →</a><a class="gfa-btn alt" href="/eventy-sportowe/">Eventy sportowe</a></div>
</div></section>
"""

ld = {"@context": "https://schema.org", "@graph": [
    {"@type": "Service", "@id": URL + "#usluga", "name": "Wynajem boisk mobilnych na eventy", "serviceType": "Wynajem i sprzedaż mobilnych aren panna i boisk street football", "url": URL, "inLanguage": "pl-PL",
     "areaServed": {"@type": "Country", "name": "Polska"}, "provider": {"@id": SITE + "#studio"},
     "description": "Mobilna arena panna i boisko street football na eventy, festiwale, targi i aktywacje marek: transport, montaż, branding, turniej i prowadzenie.",
     "offers": {"@type": "Offer", "name": "Arena mobilna eventowa (zakup)", "priceCurrency": "PLN",
                "priceSpecification": {"@type": "PriceSpecification", "minPrice": BUY, "priceCurrency": "PLN", "valueAddedTaxIncluded": False}}},
    {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Gamefields", "item": SITE},
                                                    {"@type": "ListItem", "position": 2, "name": "Eventy i wynajem", "item": URL}]},
    {"@type": "FAQPage", "@id": URL + "#pytania", "inLanguage": "pl-PL",
     "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]}]}

write(HERE, "wynajem-boisk-mobilnych", CSS, ld, body)
