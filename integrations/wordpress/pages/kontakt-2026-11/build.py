#!/usr/bin/env python3
"""/kontakt/ (page 3716), rebuilt 16.11.2026 in the site's content style (gfa-style.css).

Output: kontakt.html (one wp:html block, the whole content of the page).

The form itself stays Contact Form 7 form 3758 ([contact-form-7 id="3758"]): same fields, same e-mails. The page
around it adds:
- "Kim jesteś?": four paths (build or renovate, municipality or school, report a place without a budget, event or
  brand). A path sets the form's project-type and shows its own extra questions and "what happens next";
- extra answers are added to the message on submit, so they arrive in the same e-mail without changing the form;
- the "report a place" path is made for young people and residents: no budget needed, a link to their own design
  (Studio, photos, drawing), who plays there, who owns the land; people under 16 are asked to send it with a parent,
  guardian or teacher (their e-mail);
- ?produkt=... from the shop still lands in the message (theme gft.js) and selects the build path.
Contact data from the live page (e-mail, phone). No promise about response time beyond "odpisuję osobiście".
Test locally: preview.html uses the live form markup instead of the shortcode.
"""
import html
import json
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
UP = "https://www.gamefields.eu/wp-content/uploads/"
SITE = "https://www.gamefields.eu/"
BASE_CSS = (HERE.parent / "gfa-style.css").read_text(encoding="utf-8").split("\n", 1)[1]
SHORTCODE = '[contact-form-7 id="3758"]'
EMAIL, PHONE, PHONE_TXT = "info@gamefields.eu", "+48794911746", "+48 794 911 746"

PATHS = [
    {"id": "buduje", "icon": "01", "title": "Chcę zbudować lub odnowić boisko", "who": "Firma, klub, osiedle, szkoła prywatna, osoba prywatna",
     "type": "Budowa nowego boiska",
     "next": ["Odpisuję osobiście i dopytuję o miejsce.", "Oceniam plac ze zdjęć: czy wystarczy płyta i nawierzchnia, czy potrzebne są roboty ziemne.",
              "Dostajesz koncepcję w Studio 3D i cenę z montażem i transportem."],
     "extra": [("select", "Rodzaj prac", ["Nowe boisko z konstrukcją", "Sama nawierzchnia lub malowanie", "Renowacja starego placu", "Jeszcze nie wiem"]),
               ("select", "Orientacyjny budżet", ["Jeszcze nie wiem", "do 50 000 zł", "50–100 tys. zł", "ponad 100 tys. zł"])]},
    {"id": "gmina", "icon": "02", "title": "Gmina, szkoła, instytucja", "who": "Urząd, OSiR, szkoła, Orlik, rada osiedla",
     "type": "Budowa nowego boiska",
     "next": ["Odpisuję osobiście, zwykle z pytaniem o plac i harmonogram.", "Przygotowuję koncepcję, wizualizację i parametry techniczne.",
              "Dostajesz kartę projektu z ceną do kosztorysu, wniosku o dofinansowanie albo przetargu."],
     "extra": [("text", "Instytucja", "Np. Urząd Gminy, Szkoła Podstawowa nr 3"),
               ("select", "Źródło finansowania", ["Jeszcze nie wiem", "Moje Boisko – Orlik 2012", "Program w województwie", "Budżet obywatelski", "Środki własne", "Fundusz sołecki"])]},
    {"id": "miejsce", "icon": "03", "title": "Zgłaszam miejsce", "who": "Młodzież, mieszkańcy, trenerzy. Bez budżetu.",
     "type": "Jeszcze nie wiem", "hot": True,
     "next": ["Czytam każde zgłoszenie i odpisuję osobiście.", "Gdy miejsce ma potencjał, szukamy razem drogi: budżet obywatelski, szkoła, gmina albo marka, która sfinansuje boisko.",
              "Twój projekt ze Studia może trafić do wniosku albo na plakat do głosowania."],
     "extra": [("text", "Kto tu gra?", "Np. my z osiedla, ok. 15 osób, codziennie po szkole"),
               ("select", "Czyj jest teren?", ["Nie wiem", "Gmina lub miasto", "Szkoła", "Spółdzielnia lub wspólnota", "Prywatny"]),
               ("text", "Link do Twojego projektu", "Studio 3D, zdjęcia, rysunek (opcjonalnie)"),
               ("check", "Mam mniej niż 16 lat", "")]},
    {"id": "event", "icon": "04", "title": "Event lub marka", "who": "Turniej, festyn, aktywacja marki, wynajem areny",
     "type": "Wynajem boiska i event",
     "next": ["Odpisuję osobiście z dostępnymi terminami.", "Dobieram arenę mobilną i grafikę marki do miejsca wydarzenia.",
              "Dostajesz wycenę wynajmu albo zakupu areny z transportem i montażem."],
     "extra": [("text", "Termin wydarzenia", "Np. czerwiec 2027 albo 14.06"), ("text", "Miejsce i liczba uczestników", "Np. rynek, ok. 200 osób")]},
]


def field(path, i, f):
    kind, label = f[0], f[1]
    fid = f"gfc-{path}-{i}"
    if kind == "select":
        opts = "".join(f"<option>{html.escape(o)}</option>" for o in f[2])
        return f'<label class="gfc-x" for="{fid}">{label}<select id="{fid}" data-x="{html.escape(label)}">{opts}</select></label>'
    if kind == "check":
        return (f'<label class="gfc-x gfc-check" for="{fid}"><input type="checkbox" id="{fid}" data-x="{html.escape(label)}" data-u16> {label}</label>'
                '<p class="gfc-u16" data-u16-note hidden>Poproś rodzica, opiekuna albo nauczyciela, żeby wysłał zgłoszenie razem z Tobą, '
                'i w polu e-mail wpisz jego adres. Dzięki temu odpiszę Wam obojgu.</p>')
    return f'<label class="gfc-x" for="{fid}">{label}<input type="text" id="{fid}" data-x="{html.escape(label)}" placeholder="{html.escape(f[2])}" maxlength="300"></label>'


CSS = """
.gfc-hero{padding:clamp(36px,5vw,80px) 0 clamp(20px,3vw,36px)}
.gfc-hero .w{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:clamp(20px,3vw,48px);align-items:end}
.gfc-hero h1{font-size:clamp(52px,8vw,132px)}
.gfc-hero .lead{max-width:36rem;margin:20px 0 0;font-size:clamp(17px,1.5vw,21px);color:var(--muted)}
.gfc-me{display:grid;grid-template-columns:120px minmax(0,1fr);gap:16px;align-items:center;padding:16px;background:#fff;border:1px solid var(--line)}
.gfc-me img{display:block;width:120px;height:150px;object-fit:cover;object-position:50% 15%;background:#8E9094}
.gfc-me b{display:block;font-size:20px;letter-spacing:-.02em}
.gfc-me p{margin:4px 0 10px;color:var(--muted);font-size:15px}
.gfc-quick{display:flex;flex-wrap:wrap;gap:8px}
.gfc-quick a{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 16px;border-radius:999px;border:1.5px solid #CDBFC6;text-decoration:none;font-weight:700;font-size:14px}
.gfc-quick a:hover{border-color:var(--violet)}
.gfc-quick a.mail{background:var(--violet);border-color:var(--violet);color:#fff!important}
/* paths */
.gfc-paths{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.gfc-path{display:grid;gap:8px;align-content:start;width:100%;height:100%;padding:22px;text-align:left;background:#fff;border:1.5px solid var(--line);color:var(--ink);font:inherit;cursor:pointer;transition:border-color .2s ease,transform .2s ease,box-shadow .2s ease}
.gfc-path:hover{transform:translateY(-3px);border-color:var(--violet)}
.gfc-path[aria-pressed="true"]{border-color:var(--violet);box-shadow:0 0 0 3px rgba(99,54,245,.18)}
.gfc-path .n{display:inline-grid;place-items:center;width:36px;height:36px;border-radius:50%;background:#EEE8FF;color:var(--violet);font-weight:800;font-size:13px}
.gfc-path b{font-size:clamp(19px,1.6vw,24px);letter-spacing:-.025em;line-height:1.1}
.gfc-path span.who{color:var(--muted);font-size:14px;line-height:1.4}
.gfc-path.hot{background:var(--lime);border-color:var(--lime)}
.gfc-path.hot .n{background:#1F2A6B;color:var(--lime)}
.gfc-path.hot span.who{color:#3d2a33;font-weight:600}
.gfc-path .go{margin-top:6px;font-size:13px;font-weight:800;color:var(--violet)}
.gfc-path.hot .go{color:#1F2A6B}
/* form area */
.gfc-form{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:clamp(20px,3vw,48px);align-items:start;scroll-margin-top:90px}
.gfc-card{padding:clamp(20px,2.6vw,36px);background:#fff;border:1px solid var(--line)}
.gfc-card h2{font-size:clamp(30px,3.2vw,48px);font-weight:800;letter-spacing:-.045em;line-height:.95;margin:0 0 8px}
.gfc-card .sub{margin:0 0 18px;color:var(--muted);font-size:16px}
.gfc-chosen{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 16px;padding:10px 12px;background:var(--paper);font-size:14px}
.gfc-chosen[hidden]{display:none}
.gfc-chosen b{color:var(--violet)}
.gfc-chosen button{margin-left:auto;border:0;background:none;color:var(--ink);text-decoration:underline;font:inherit;cursor:pointer}
.gfc-extra{display:grid;gap:12px;margin:0 0 18px;padding:16px;border:1.5px dashed #CDBFC6}
.gfc-extra[hidden]{display:none}
.gfc-extra .h{margin:0;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.gfc-x{display:grid;gap:6px;font-size:14px;font-weight:700}
.gfc-x input[type=text],.gfc-x select{min-height:48px;padding:0 14px;border:1.5px solid #CDBFC6;border-radius:12px;background:#fff;color:var(--ink);font:500 16px inherit;font-family:inherit}
.gfc-check{display:flex;align-items:center;gap:10px;font-weight:600}
.gfc-check input{width:22px;height:22px;accent-color:var(--violet)}
.gfc-u16{margin:0;padding:12px 14px;background:#EEE8FF;color:var(--ink);font-size:14px;line-height:1.45}
/* Contact Form 7 inside */
.gfc .wpcf7 form{margin:0}
.gfc .wpcf7 .hidden-fields-container{border:0;margin:0;padding:0;min-width:0}
.gfc [data-gf-lead] fieldset{border:0;min-width:0;margin:0;padding:0}
.gfc [data-gf-lead] legend{font-weight:800;font-size:22px;letter-spacing:-.02em;margin:6px 0 14px}
.gfc .gf-lead-progress p{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:0 0 18px}
.gfc .gf-lead-progress button{min-height:44px;border:0;border-radius:999px;background:var(--paper);color:var(--muted);font:700 14px inherit;font-family:inherit;cursor:pointer}
.gfc .gf-lead-progress button[aria-current]{background:var(--ink);color:#fff}
.gfc .gf-lead-field p{margin:0 0 14px}
.gfc .gf-lead-field label{display:grid;gap:6px;font-size:14px;font-weight:700}
.gfc .gf-lead-field br{display:none}
.gfc .wpcf7 input[type=text],.gfc .wpcf7 input[type=email],.gfc .wpcf7 input[type=tel],.gfc .wpcf7 select,.gfc .wpcf7 textarea{width:100%;min-height:48px;padding:12px 14px;border:1.5px solid #CDBFC6;border-radius:12px;background:#fff;color:var(--ink);font:500 16px inherit;font-family:inherit}
.gfc .wpcf7 textarea{min-height:130px;resize:vertical}
.gfc .wpcf7 input:focus,.gfc .wpcf7 select:focus,.gfc .wpcf7 textarea:focus,.gfc-x input:focus,.gfc-x select:focus{outline:3px solid rgba(99,54,245,.35);border-color:var(--violet)}
.gfc .wpcf7 input[type=file]{width:100%;padding:18px;border:1.5px dashed #CDBFC6;border-radius:12px;background:var(--paper);font-size:14px}
.gfc .wpcf7 small{display:block;margin-top:6px;color:var(--muted);font-size:13px;font-weight:500}
.gfc [data-gf-lead] fieldset > p:last-child{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0 0}
.gfc [data-gf-lead] [data-gf-next],.gfc .wpcf7-submit{min-height:52px;padding:0 26px;border:0;border-radius:999px;background:var(--violet);color:#fff;font:700 16px inherit;font-family:inherit;cursor:pointer}
.gfc [data-gf-lead] [data-gf-prev]{min-height:52px;padding:0 22px;border:1.5px solid #CDBFC6;border-radius:999px;background:transparent;color:var(--ink);font:700 15px inherit;font-family:inherit;cursor:pointer}
.gfc .gf-lead-note{margin:0 0 10px;font-size:13px;color:var(--muted)}
.gfc .wpcf7-not-valid-tip{font-size:13px;color:#C0262D;margin-top:4px}
.gfc .wpcf7-response-output{margin:14px 0 0!important;padding:12px 14px!important;border-radius:12px;font-size:14px}
.gfc-thanks{display:none;padding:22px;background:var(--lime);color:#1F2A6B}
.gfc-thanks b{display:block;font-size:24px;letter-spacing:-.02em;margin-bottom:6px}
.gfc.sent .gfc-thanks{display:block}
/* side */
.gfc-side{position:sticky;top:96px;display:grid;gap:12px}
.gfc-next{padding:22px;background:var(--ink);color:var(--paper)}
.gfc-next .k{color:var(--lime)}
.gfc-next ol{list-style:none;margin:0;padding:0;display:grid;gap:12px;counter-reset:n}
.gfc-next li{display:grid;grid-template-columns:30px minmax(0,1fr);gap:10px;counter-increment:n;font-size:15px;line-height:1.45;color:rgba(244,241,238,.9)}
.gfc-next li::before{content:counter(n);display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:var(--lime);color:#1F2A6B;font-weight:800;font-size:13px}
.gfc-prep{padding:22px;background:#fff;border:1px solid var(--line)}
.gfc-prep ul{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.gfc-prep li{display:grid;grid-template-columns:24px minmax(0,1fr);gap:8px;font-size:15px}
.gfc-prep li::before{content:"✓";color:var(--violet);font-weight:800}
.gfc-prep li b{display:block}
.gfc-prep li span{color:var(--muted);font-size:14px}
.gfc-faq{border-top:1px solid var(--line)}
.gfc-faq details{border-bottom:1px solid var(--line)}
.gfc-faq summary{display:flex;justify-content:space-between;gap:14px;list-style:none;cursor:pointer;padding:20px 4px;font-size:18px;font-weight:700}
.gfc-faq summary::-webkit-details-marker{display:none}
.gfc-faq summary::after{content:"+";font-size:24px;font-weight:400;color:var(--violet)}
.gfc-faq details[open] summary::after{content:"\\2212"}
.gfc-faq details p{max-width:780px;margin:0;padding:0 4px 22px;font-size:16px;color:var(--muted)}
.gfc-data{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.gfc-data a,.gfc-data div{display:grid;gap:4px;padding:22px;background:#fff;border:1px solid var(--line);text-decoration:none}
.gfc-data small{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.gfc-data strong{font-size:clamp(18px,1.6vw,24px);letter-spacing:-.02em}
@media (max-width:1100px){.gfc-paths{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:900px){.gfc-hero .w,.gfc-form{grid-template-columns:minmax(0,1fr)}.gfc-side{position:static}.gfc-data{grid-template-columns:minmax(0,1fr)}}
@media (max-width:560px){.gfc-paths{grid-template-columns:minmax(0,1fr)}.gfc-path{grid-template-columns:36px minmax(0,1fr);column-gap:12px;padding:16px}.gfc-path .n{grid-row:span 3}
 .gfc-me{grid-template-columns:84px minmax(0,1fr)}.gfc-me img{width:84px;height:105px}.gfc .gf-lead-progress button{font-size:12px}}
"""

paths_html = "".join(
    f'<li><button type="button" class="gfc-path{" hot" if p.get("hot") else ""}" data-path="{p["id"]}" aria-pressed="false" aria-controls="formularz">'
    f'<span class="n">{p["icon"]}</span><b>{p["title"]}</b><span class="who">{p["who"]}</span><span class="go">Wybieram →</span></button></li>' for p in PATHS)
extras_html = "".join(
    f'<div class="gfc-extra" data-extra="{p["id"]}" hidden><p class="h">Kilka pytań do tej ścieżki (opcjonalnie)</p>'
    + "".join(field(p["id"], i, f) for i, f in enumerate(p["extra"])) + "</div>" for p in PATHS)
data = {p["id"]: {"title": p["title"], "type": p["type"], "next": p["next"]} for p in PATHS}
data["_default"] = {"title": "", "type": "Jeszcze nie wiem", "next": [
    "Odpisuję osobiście.", "Oceniam miejsce ze zdjęć i wymiarów.", "Proponuję kolejny krok: koncepcję w Studio 3D, wycenę albo wizję lokalną."]}

FAQ = [
    ("Czy muszę mieć gotowy projekt?", "Nie. Wystarczy miejsce: adres albo pinezka, przybliżone wymiary i zdjęcie. Projekt możesz zacząć w Studio 3D albo zostawić to mnie."),
    ("Nie mamy pieniędzy. Czy warto zgłosić miejsce?", "Tak. Wybierz ścieżkę „Zgłaszam miejsce”. Wiele boisk powstaje z budżetu obywatelskiego, funduszu szkoły albo gminy lub dzięki marce, która je sfinansuje. Twoje zgłoszenie i projekt to dobry początek takiej drogi."),
    ("Mam mniej niż 16 lat. Co zrobić?", "Wyślij zgłoszenie razem z rodzicem, opiekunem albo nauczycielem i podaj jego e-mail. Odpiszę Wam obojgu."),
    ("Ile kosztuje boisko?", "Konstrukcje od 36 000 zł netto, całe boisko z płytą i malowaniem np. Panna Play od 51 000 zł netto. Wszystkie ceny są w sklepie i w Studio 3D."),
    ("Kto odpowiada na wiadomości?", "Ja, Damian Gawrych. Odpisuję osobiście, bez automatów i call center."),
]
faq_html = "".join(f"<details><summary>{html.escape(q)}</summary><p>{html.escape(a)}</p></details>" for q, a in FAQ)

body = f"""
<section class="gfc-hero"><div class="w">
  <div>
    <p class="k">Kontakt</p>
    <h1 class="d">Zacznijmy od miejsca.</h1>
    <p class="lead">Nie potrzebujesz projektu ani budżetu, żeby napisać. Pokaż miejsce, zdjęcie albo swój pomysł, a ja zaproponuję kolejny krok.</p>
  </div>
  <div class="gfc-me">
    <img src="{UP}2026/11/DAMIAN-GAWRYCH-1-768x998.jpeg" alt="Damian Gawrych" width="120" height="150" loading="eager" decoding="async">
    <div><b>Damian Gawrych</b><p>Odpisuję osobiście na każdą wiadomość.</p>
      <div class="gfc-quick"><a class="mail" href="mailto:{EMAIL}">{EMAIL}</a><a href="tel:{PHONE}">{PHONE_TXT}</a></div></div>
  </div>
</div></section>

<section class="gfa-sec" id="kim-jestes"><div class="w">
  <div class="gfa-head"><h2 class="d">Kim jesteś?</h2><p>Wybierz, co najlepiej Cię opisuje. Dopasuję pytania i powiem, co wydarzy się dalej. Możesz też od razu przejść do formularza.</p></div>
  <ul class="gfc-paths" role="list">{paths_html}</ul>
</div></section>

<section class="gfa-sec" id="formularz"><div class="w gfc-form">
  <div class="gfc-card">
    <h2>Opisz swoje miejsce.</h2>
    <p class="sub">Trzy krótkie kroki. Wymagany jest tylko e-mail, reszta pomaga mi szybciej odpowiedzieć.</p>
    <p class="gfc-chosen" data-chosen hidden>Ścieżka: <b data-chosen-t></b><button type="button" data-chosen-x>zmień</button></p>
    {extras_html}
    <div class="gfc-thanks" role="status"><b>Dziękuję, mam Twoją wiadomość.</b><span data-thanks>Odpiszę osobiście na podany e-mail.</span></div>
    {{{{FORM}}}}
  </div>
  <aside class="gfc-side" aria-label="Co dalej">
    <div class="gfc-next"><p class="k">Co wydarzy się dalej</p><ol data-next>{"".join(f"<li>{x}</li>" for x in data["_default"]["next"])}</ol></div>
    <div class="gfc-prep"><p class="k">Co warto dołączyć</p><ul role="list">
      <li><div><b>Lokalizacja</b><span>Adres, pinezka albo opis miejsca.</span></div></li>
      <li><div><b>Wymiary</b><span>Przybliżona długość i szerokość terenu.</span></div></li>
      <li><div><b>Zdjęcie</b><span>Widok całego miejsca i obecnej nawierzchni.</span></div></li>
      <li><div><b>Kto będzie grał</b><span>Wiek, liczba osób, ulubione gry.</span></div></li>
      <li><div><b>Twój projekt</b><span>Link ze <a href="/studio/">Studia 3D</a>, rysunek albo inspiracja.</span></div></li>
    </ul></div>
  </aside>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><h2 class="d">Zanim napiszesz.</h2><p>Krótkie odpowiedzi na najczęstsze pytania.</p></div>
  <div class="gfc-faq">{faq_html}</div>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfc-data">
    <a href="mailto:{EMAIL}"><small>E-mail</small><strong>{EMAIL} →</strong></a>
    <a href="tel:{PHONE}"><small>Telefon</small><strong>{PHONE_TXT} →</strong></a>
    <a href="/studio/"><small>Projekt online</small><strong>Studio 3D ↗</strong></a>
  </div>
  <ul class="gfa-links"><li><a href="/shop/">Boiska i ceny</a></li><li><a href="/realizacje-gamefields/">Realizacje</a></li><li><a href="/dofinansowanie-boisk/">Dofinansowanie</a></li><li><a href="/baza-wiedzy/">Baza wiedzy</a></li></ul>
</div></section>
"""

JS = """<script type="application/json" id="gfc-data">""" + json.dumps(data, ensure_ascii=False) + """</script>
<script>(function(){
var root=document.querySelector('.gfc');if(!root)return;
var D=JSON.parse(document.getElementById('gfc-data').textContent);var cur='';
var q=function(s){return root.querySelector(s)};var qa=function(s){return Array.prototype.slice.call(root.querySelectorAll(s))};
var form=root.querySelector('.wpcf7 form');var sel=form?form.querySelector('select[name="project-type"]'):null;var msg=form?form.querySelector('textarea[name="your-message"]'):null;
/* steps of the CF7 form (markup comes from form 3758) */
var lead=q('[data-gf-lead]');var steps=lead?Array.prototype.slice.call(lead.querySelectorAll('[data-gf-step]')):[];var tabs=lead?Array.prototype.slice.call(lead.querySelectorAll('[data-gf-go]')):[];var active=0;
function go(n,focus){active=Math.max(0,Math.min(steps.length-1,n));steps.forEach(function(s,i){s.hidden=i!==active});tabs.forEach(function(t,i){if(i===active)t.setAttribute('aria-current','step');else t.removeAttribute('aria-current')});if(focus){var l=steps[active].querySelector('legend');if(l){l.tabIndex=-1;l.focus()}}}
if(lead){lead.dataset.enhanced='true';lead.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-gf-next'))go(active+1,true);else if(b.hasAttribute('data-gf-prev'))go(active-1,true);else if(b.hasAttribute('data-gf-go'))go(+b.getAttribute('data-gf-go'),true)});go(0,false);}
/* extra path field goes into the "Miejsce" step so it is filled in order */
function place(id){var box=q('[data-extra="'+id+'"]');if(!box)return;var target=steps[1]||steps[0];if(target){var last=target.lastElementChild;target.insertBefore(box,last)}}
function pick(id,scroll){cur=id;var d=D[id]||D._default;
 qa('[data-path]').forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-path')===id?'true':'false')});
 qa('[data-extra]').forEach(function(x){x.hidden=x.getAttribute('data-extra')!==id});place(id);
 var c=q('[data-chosen]');c.hidden=!id;q('[data-chosen-t]').textContent=d.title;
 q('[data-next]').innerHTML=d.next.map(function(x){return '<li>'+x+'</li>'}).join('');
 if(sel){sel.value=d.type}
 if(scroll){q('#formularz').scrollIntoView({behavior:'smooth',block:'start'})}}
qa('[data-path]').forEach(function(b){b.addEventListener('click',function(){pick(b.getAttribute('data-path'),true)})});
q('[data-chosen-x]').addEventListener('click',function(){pick('',false);q('#kim-jestes').scrollIntoView({behavior:'smooth'})});
qa('[data-u16]').forEach(function(c){c.addEventListener('change',function(){var n=c.closest('.gfc-extra').querySelector('[data-u16-note]');if(n)n.hidden=!c.checked})});
/* answers of the path go to the message, which reaches the same e-mail */
if(form){form.addEventListener('submit',function(){if(!msg)return;var d=D[cur];var lines=[];if(d){lines.push('Ścieżka: '+d.title)}
 qa('[data-extra="'+cur+'"] [data-x]').forEach(function(x){var v=x.type==='checkbox'?(x.checked?'tak':''):x.value.trim();if(v){lines.push(x.getAttribute('data-x')+': '+v)}});
 var mark='\\n\\n— Z formularza (ścieżka i odpowiedzi) —\\n';var base=msg.value.split(mark)[0];if(lines.length){msg.value=base+mark+lines.join('\\n')}},true);
 form.addEventListener('wpcf7mailsent',function(){root.classList.add('sent');var t=q('[data-thanks]');if(cur==='miejsce'){t.textContent='Dziękuję za zgłoszenie miejsca. Przeczytam je i odpiszę osobiście, także jeśli to dopiero pomysł.'}var th=q('.gfc-thanks');if(th){th.scrollIntoView({behavior:'smooth',block:'center'})}});
 form.addEventListener('wpcf7invalid',function(){var bad=form.querySelector('.wpcf7-not-valid');if(bad){var i=steps.findIndex(function(s){return s.contains(bad)});if(i>-1)go(i,false);bad.focus()}});}
var p=new URLSearchParams(location.search);if(p.get('produkt')){pick('buduje',false)}else if(p.get('sciezka')){pick(p.get('sciezka'),false)}
})();</script>"""

ld = {"@context": "https://schema.org", "@type": "ContactPage", "name": "Kontakt Gamefields", "url": SITE + "kontakt/", "inLanguage": "pl-PL",
      "mainEntity": {"@type": "Organization", "name": "Gamefields", "email": EMAIL, "telephone": PHONE, "url": SITE,
                     "contactPoint": {"@type": "ContactPoint", "email": EMAIL, "telephone": PHONE, "contactType": "customer service", "availableLanguage": "pl"}}}


def page(form):
    out = ("<!-- wp:html -->\n<style>\n" + BASE_CSS + CSS + "</style>\n<script type=\"application/ld+json\">" +
           json.dumps(ld, ensure_ascii=False, separators=(",", ":")) + "</script>\n" + '<div class="gfa gfc">\n' +
           body.replace("{{FORM}}", form).strip() + "\n</div>\n" + JS + "\n<!-- /wp:html -->\n")
    if "&&" in out:
        raise SystemExit("double ampersand would break in WordPress")
    return out


(HERE / "kontakt.html").write_text(page(SHORTCODE), encoding="utf-8")
print("kontakt.html", len(page(SHORTCODE)), "bytes")
live = HERE / "cf7-3758-live.html"
if live.exists():
    (HERE / "preview.html").write_text('<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kontakt, podgląd</title></head><body style="margin:0;background:#F4F1EE">'
                                       + page(live.read_text(encoding="utf-8")).replace("<!-- wp:html -->", "").replace("<!-- /wp:html -->", "") + "</body></html>", encoding="utf-8")
