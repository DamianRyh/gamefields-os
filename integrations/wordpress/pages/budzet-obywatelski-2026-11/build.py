#!/usr/bin/env python3
"""/budzet-obywatelski/ (new page, 25.11.2026) in the .gfb style. Footer/menu: "Budżet obywatelski" (z /dla-miast/).

Output: budzet-obywatelski.html (one wp:html block, the whole content of the page).

The caring entry for residents who want a court from a participatory budget: what Gamefields does with them,
the campaign guardian (Damian Gawrych, Grodzisk Mazowiecki), how a participatory budget works (from
docs/content/poradniki/boisko-z-budzetu-obywatelskiego.md, without the figures still waiting for source checks),
documents checklist, FAQ. The campaign wizard itself lives in the Studio app: /studio/?kampania=nowa.
"""
import html
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from gfb_common import GFB_CSS, SITE, faq_html, jump_html, write  # noqa: E402

URL = SITE + "budzet-obywatelski/"
WIZARD = "/studio/?kampania=nowa"
GUARD = {"name": "Damian Gawrych", "place": "Grodzisk Mazowiecki"}

CSS = GFB_CSS + """
.gfbo-hero{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:clamp(20px,4vw,56px);align-items:center}
.gfa .gfbo-hero h1{font-size:clamp(44px,5.6vw,92px);overflow-wrap:anywhere;hyphens:auto}
.gfbo-guard{display:grid;grid-template-columns:64px minmax(0,1fr);gap:16px;padding:clamp(20px,2.4vw,28px);background:var(--ink);color:#fff}
.gfbo-guard .av{display:grid;place-items:center;width:64px;height:64px;border-radius:50%;background:var(--lime,#D8F24A);color:var(--ink);font-weight:900;font-size:21px}
.gfbo-guard small{display:block;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#d9c9d3}
.gfbo-guard b{display:block;font-size:24px;letter-spacing:-.03em;line-height:1.1;margin-top:4px}
.gfbo-guard span{display:block;font-size:15px;color:#e6dbe2;margin-top:2px}
.gfbo-guard p{margin:12px 0 0;font-size:16px;line-height:1.5;color:#f3ecf0}
.gfa .gfbo-guard a{display:inline-block;margin-top:12px;color:var(--lime,#D8F24A);font-weight:800;text-decoration:none}
.gfbo-get{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.gfbo-get li{display:flex;flex-direction:column;gap:8px;padding:22px;background:#fff;border:1px solid var(--line)}
.gfbo-get .n{font-size:28px}
.gfbo-get b{font-size:21px;letter-spacing:-.025em;line-height:1.1}
.gfbo-get p{margin:0;color:#5A4652;font-size:15px}
.gfbo-steps{list-style:none;counter-reset:s;margin:0;padding:0;display:grid;gap:10px}
.gfbo-steps li{counter-increment:s;display:grid;grid-template-columns:52px minmax(0,1fr);gap:16px;padding:20px 22px;background:#fff;border:1px solid var(--line)}
.gfbo-steps li::before{content:counter(s);display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:var(--violet);color:#fff;font-weight:900;font-size:18px}
.gfbo-steps b{display:block;font-size:20px;letter-spacing:-.02em}
.gfbo-steps p{margin:6px 0 0;color:#5A4652;font-size:15.5px}
.gfbo-steps em{display:inline-block;margin-top:8px;padding:4px 10px;background:#EEE8FF;color:var(--violet);font-style:normal;font-weight:700;font-size:13.5px}
.gfbo-docs{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.gfbo-docs li{display:flex;gap:12px;align-items:flex-start;padding:14px 16px;background:#fff;border:1px solid var(--line);font-size:15.5px}
.gfbo-docs li::before{content:"";flex:none;width:20px;height:20px;margin-top:2px;border:2px solid var(--violet)}
.gfbo-docs small{display:block;color:var(--violet);font-weight:700;font-size:13px;margin-top:2px}
@media (max-width:900px){.gfbo-hero,.gfbo-docs{grid-template-columns:minmax(0,1fr)}.gfbo-get{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:560px){.gfbo-get{grid-template-columns:minmax(0,1fr)}.gfbo-steps li{grid-template-columns:minmax(0,1fr)}}
"""

GET = [("🗳️", "Strona kampanii", "„Boisko dla osiedla…” z Twoim projektem w 3D, licznikiem „Popieram” i odliczaniem do głosowania."),
       ("📱", "Grafiki i film", "Gotowe formaty do Stories i postów oraz 6-sekundowy film z obrotem kamery wokół boiska."),
       ("📄", "Karta dla urzędu", "Wymiary, nawierzchnia i szacunek kosztu na jednej stronie PDF: załącznik do formularza zgłoszenia."),
       ("🤝", "Pomoc przy wniosku", "Bezpłatnie przygotujemy część techniczną: opis, wymiary i kosztorys. Ty zostajesz autorem projektu.")]

STEPS = [("Znajdź teren", "Boisko z budżetu obywatelskiego musi stanąć na gruncie miasta i być ogólnodostępne. Sprawdź właściciela działki w geoportalu albo w urzędzie dzielnicy. Teren szkoły albo ośrodka sportu wymaga zwykle zgody dyrektora.", "Kompaktowa arena mieści się na placu o boku od około 5 do 7 m."),
         ("Zaprojektuj boisko", "W Studio wybierasz konstrukcję, nawierzchnię i kolory. Projekt od razu ma wymiary i szacunek ceny, więc wiesz, czy zmieści się w puli dla Twojej dzielnicy.", "Studio Gamefields, bez logowania."),
         ("Złóż wniosek", "Formularz ma zwykle tytuł, lokalizację, opis, uzasadnienie i szacunkowy koszt. Kartę projektu PDF dołączasz jako wizualizację i opis techniczny.", "Pomożemy z częścią techniczną."),
         ("Zbierz poparcie", "Wiele miast wymaga listy poparcia. Strona kampanii z licznikiem „Popieram”, grafikami i filmem pomaga przekonać sąsiadów jeszcze przed głosowaniem.", "Strona kampanii w 3 minuty."),
         ("Ocena urzędu i głosowanie", "Urząd sprawdza teren, koszt i wykonalność. Jeśli coś trzeba poprawić, zwykle można to zrobić albo odwołać się od oceny. Potem głosują mieszkańcy, a zwycięskie projekty miasto realizuje w kolejnym roku.", "Przypomnij sąsiadom o terminie głosowania.")]

DOCS = [("Lokalizacja z numerem działki", "potwierdzenie, że zarządza nią miasto"),
        ("Opinia albo zgoda zarządcy terenu", "szkoła, ośrodek sportu, zarząd zieleni"),
        ("Opis i uzasadnienie", "kto będzie grać i czego dziś brakuje"),
        ("Szacunkowy koszt z podziałem na pozycje", "konstrukcja, nawierzchnia, podbudowa, rezerwa"),
        ("Wizualizacja i wymiary", "karta projektu PDF ze Studio"),
        ("Lista poparcia", "jeśli regulamin Twojego miasta jej wymaga")]

FAQ = [("Ile kosztuje pomoc Gamefields przy wniosku?",
        "Nic. Przygotowujemy część techniczną wniosku (opis, wymiary, kosztorys) bezpłatnie. Jeśli projekt wygra, miasto wybiera wykonawcę zgodnie ze swoimi zasadami."),
       ("Kto może zgłosić boisko do budżetu obywatelskiego?",
        "Każdy mieszkaniec miasta albo gminy, która prowadzi budżet obywatelski. Terminy, limity kwot i liczbę podpisów poparcia ustala rada gminy w uchwale, więc zacznij od regulaminu swojego miasta."),
       ("Czy strona kampanii zastępuje głosowanie w budżecie?",
        "Nie. Licznik „Popieram” pokazuje poparcie sąsiadów i pomaga zebrać podpisy, ale oficjalne głosowanie odbywa się na stronie albo w urzędzie Twojego miasta. Strona kampanii prowadzi do niego linkiem."),
       ("Jakie dane są widoczne na stronie kampanii?",
        "Tytuł, miejsce, opis, pseudonim organizatora i projekt boiska. Bez imienia, nazwiska i adresu e-mail. Strona nie trafia do wyszukiwarek, a organizator może ją wycofać w każdej chwili."),
       ("Nie mam jeszcze projektu. Od czego zacząć?",
        "Otwórz kreator kampanii i wybierz projekt z galerii Warsztatu albo zaprojektuj własny w Studio. Projekt możesz później zmienić."),
       ("Jak szybko powstanie boisko?",
        "Zwykle ponad rok od zgłoszenia, bo miasto realizuje zwycięskie projekty w kolejnym roku budżetowym. Sam montaż areny trwa kilka dni.")]

get_html = "".join(f'<li><span class="n" aria-hidden="true">{i}</span><b>{html.escape(t)}</b><p>{html.escape(d)}</p></li>' for i, t, d in GET)
steps_html = "".join(f"<li><div><b>{html.escape(t)}</b><p>{html.escape(d)}</p><em>{html.escape(e)}</em></div></li>" for t, d, e in STEPS)
docs_html = "".join(f"<li><span>{html.escape(t)}<small>{html.escape(s)}</small></span></li>" for t, s in DOCS)
guard_html = (f'<aside class="gfbo-guard" aria-label="Opiekun kampanii"><span class="av" aria-hidden="true">DG</span><div>'
              f'<small>Opiekun kampanii</small><b>{GUARD["name"]}</b><span>{GUARD["place"]}</span>'
              "<p>Pomagam mieszkańcom przejść przez budżet obywatelski: od opisu i kosztorysu boiska po dzień głosowania. "
              "Napisz, gdzie ma stanąć boisko, a odezwę się osobiście.</p>"
              '<a href="/kontakt/">Napisz do mnie →</a></div></aside>')

jump = [("co-dostajesz", "Co dostajesz"), ("jak-to-dziala", "Jak to działa"), ("dokumenty", "Dokumenty"), ("pytania", "Pytania")]

body = f"""
<section class="gfb-hero"><div class="w top gfbo-hero">
  <div>
    <p class="gfb-crumbs"><a href="/">Gamefields</a> / <a href="/dla-miast/">Miasta</a> / Budżet obywatelski</p>
    <p class="k">Budżet obywatelski</p>
    <h1 class="d">Boisko z budżetu obywatelskiego.</h1>
    <p class="lead">Dla Twojego osiedla, szkoły albo parku. Zaprojektuj boisko, zrób stronę kampanii dla sąsiadów i złóż wniosek z naszą pomocą. Bezpłatnie i bez logowania.</p>
    <div class="gfa-btns"><a class="gfa-btn" href="{WIZARD}">Załóż kampanię →</a><a class="gfa-btn alt" href="/studio/">Zaprojektuj w Studio ↗</a></div>
  </div>
  {guard_html}
</div></section>

<nav class="gfb-jump" aria-label="Na tej stronie"><div class="w"><ul role="list">{jump_html(jump)}</ul></div></nav>

<section class="gfa-sec" id="co-dostajesz"><div class="w">
  <div class="gfa-head"><div><p class="k">Co dostajesz</p><h2 class="d">Wszystko do kampanii w jednym miejscu.</h2></div><p>Kreator prowadzi przez 4 krótkie kroki: projekt, miejsce, głosowanie i opis. Po około 3 minutach masz link do wysłania sąsiadom.</p></div>
  <ul class="gfbo-get" role="list">{get_html}</ul>
  <div class="gfa-btns" style="margin-top:22px"><a class="gfa-btn" href="{WIZARD}">Załóż kampanię →</a></div>
</div></section>

<section class="gfa-sec" id="jak-to-dziala"><div class="w">
  <div class="gfa-head"><div><p class="k">Jak to działa</p><h2 class="d">Od pustego placu do boiska w 5 krokach.</h2></div><p>Szczegóły ustala każda gmina w swoim regulaminie: terminy, limity kwot i liczbę podpisów. Ogólny przebieg jest podobny w całej Polsce.</p></div>
  <ol class="gfbo-steps">{steps_html}</ol>
</div></section>

<section class="gfa-sec" id="dokumenty"><div class="w">
  <div class="gfa-head"><div><p class="k">Dokumenty</p><h2 class="d">Lista do wniosku.</h2></div><p>Najczęstszy powód odrzucenia projektu to teren. Zacznij od sprawdzenia działki i zgody zarządcy.</p></div>
  <ul class="gfbo-docs" role="list">{docs_html}</ul>
</div></section>

<section class="gfa-sec" id="pytania"><div class="w">
  <div class="gfa-head"><div><p class="k">Pytania</p><h2 class="d">Zanim zaczniesz kampanię.</h2></div><p>Pomoc, dane na stronie kampanii i czas realizacji.</p></div>
  <div class="gfa-faq">{faq_html(FAQ)}</div>
</div></section>

<section class="gfa-cta"><div class="w">
  <h2 class="d">Zbierzmy poparcie dla Twojego boiska.</h2>
  <div class="gfa-btns"><a class="gfa-btn" href="{WIZARD}">Załóż kampanię →</a><a class="gfa-btn alt" href="/kontakt/">Napisz do opiekuna</a></div>
</div></section>
"""

ld = {"@context": "https://schema.org", "@graph": [
    {"@type": "WebPage", "@id": URL, "url": URL, "name": "Boisko z budżetu obywatelskiego · Gamefields", "inLanguage": "pl-PL",
     "description": "Zaprojektuj boisko, zrób stronę kampanii z licznikiem poparcia i złóż wniosek do budżetu obywatelskiego z bezpłatną pomocą Gamefields."},
    {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]}]}

write(HERE, "budzet-obywatelski", CSS, ld, body)
