#!/usr/bin/env python3
"""/budowa-boisk-sportowych/ (page 3684), rebuilt 23.11.2026 in the site's content style (gfa-style.css).

Output: budowa-boisk-sportowych.html (one wp:html block, the whole content of the page).

A hub for anyone who wants a court built: where to start (empty plot, old concrete, little space, event),
prices from the price files (construction, concrete slab, eight finishes), a budget calculator, the seven
steps, documents for municipalities, realizations, what to send for a quote, FAQ and the guides.
Facts only from integrations/wordpress/offer/*.json, the homepage (municipalities, author), the knowledge base
and the Realizacje page. Nothing is invented: custom and full-size courts are priced after photos.
"""
import html
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from gfb_common import (BASE, CHEAP, FIN, GFB_CSS, MOBILE, MODELS, PAINT, PLAY, PRICE, SITE, SLAB, SLUG, SURF, VAT, img, rng, variants, write, zl)  # noqa: E402

URL = SITE + "budowa-boisk-sportowych/"
FULL_PLAY = PLAY["constructionFromNet"] + SLAB["o1"]["net"] + PAINT["o1"]
CSS = GFB_CSS

# ---------------------------------------------------------------- data
paths = [
    ("Mam pusty teren", "Nowe boisko od podbudowy",
     "Przygotowanie gruntu, płyta betonowa, nawierzchnia i konstrukcja z bramkami.",
     ["płyta 12 cm z podbudową", "jedna z ośmiu nawierzchni", "arena albo boisko wielofunkcyjne"],
     f"Całe boisko od {zl(min(m['constructionFromNet'] + SLAB[m['id']]['net'] + PAINT[m['id']] for m in MODELS))} netto", "#kalkulator", "Policz budżet ↓"),
    ("Mam stary beton albo boisko", "Renowacja i nowy wzór",
     "Naprawa rys i ubytków, grunt, elastyczna farba sportowa z gumą, wzór i linie.",
     ["ocena podłoża ze zdjęć", "malowanie albo nowa nawierzchnia", "linie do kilku gier"],
     f"Malowanie od {min(v['r'] for v in variants(None))} zł/m² netto", "/renowacja-boisk/", "Renowacja boisk →"),
    ("Mam mało miejsca", "Arena 1 na 1 albo 3 na 3",
     "Kompaktowe areny od ok. 5 m średnicy do boiska 3 na 3 (15 × 10 m). Mały metraż to osobny format.",
     ["8 modeli z cenami", "projekt i cena w Studio 3D", "planer „Zmieści się?”"],
     f"Konstrukcja od {zl(CHEAP['constructionFromNet'])} netto", "#ceny", "Modele i ceny ↓"),
    ("Potrzebuję boiska na event", "Arena mobilna",
     "Wynajem albo zakup areny panna na turniej, aktywację marki lub festyn.",
     ["montaż na miejscu wydarzenia", "turnieje i eventy od 2008", "wynajem i sprzedaż"],
     f"Od {zl(MOBILE['constructionFromNet'])} netto", "/wynajem-boisk-mobilnych/", "Arena mobilna →"),
]

calc_models = [{"id": m["id"], "n": m["name"], "a": SLAB[m["id"]]["areaM2"], "c": m["constructionFromNet"], "s": SLAB[m["id"]]["net"]} for m in MODELS]
calc_surf = [{"k": "none", "n": "Bez wykończenia (sam beton)", "v": []}] + [{"k": key or "paint", "n": name, "v": variants(key)} for key, name, *_ in SURF]
CALC = {"models": calc_models, "surf": calc_surf, "slab": BASE["rateNetPerM2"], "vat": BASE["vatRate"]}

STEPS = [
    ("Analiza miejsca", "Wymiary, dojazd, spadki, istniejąca nawierzchnia i otoczenie. Już tu odpadają formaty, które nie pasują.", "zdjęcia i wymiary wystarczą na start."),
    ("Użytkownicy i sporty", "Szkoła, osiedle, klub czy park: wiek, intensywność gry i to, czy miejsce ma żyć poza treningami.", "dobór modelu i nawierzchni do grupy."),
    ("Koncepcja i cena", "Układ boiska, strefy bezpieczeństwa, kolory i wzór. Porównanie wariantów przed decyzją.", "Studio 3D i karta projektu PDF z ceną."),
    ("Podbudowa i odwodnienie", "Niewidoczna część, która decyduje o trwałości. Woda musi schodzić w przewidywalny sposób.", f"płyta C20/25 12 cm ze spadkami, {BASE['rateNetPerM2']} zł/m²."),
    ("Nawierzchnia", "Wynika z dyscypliny, intensywności i utrzymania, a nie tylko z ceny za metr.", "osiem nawierzchni z cenami za m²."),
    ("Konstrukcja i wyposażenie", "Bandy, bramki, kosze i ogrodzenia ustawione przed końcowymi warstwami.", "modułowa arena montowana na płycie."),
    ("Linie, odbiór, opieka", "Oznaczenia sportowe, kolorystyka, kontrola wykonania i odbiór.", "12 miesięcy gwarancji i opieka po odbiorze."),
]

REALS = [
    ("taras", "Miasto", "Warszawa, Park Świętokrzyski", "Taras pod Pałacem Kultury", "Trzy areny połączone z tarasem i rampą.", "2024/12/Areny-Panna-Football-Alternative-Soccer-Warszawa-3-768x576.jpg", "w1"),
    ("kutno", "Miasto", "Kutno, pasaż sportowy", "Panna Octa w Kutnie", "Zamówienie Urzędu Miasta, „bez zastrzeżeń”.", "2025/06/IMG_6608-scaled-e1749983082809-768x696.jpg", "octagon"),
    ("krakow", "Park", "Kraków", "Od planu do parku", "Projekt na planie, montaż, gotowa arena.", "2026/11/Krakow-Panna-Arena-Octa-Cage-90-Gamefields-768x768.jpg", "circle-cage-1"),
    ("orlik", "Orlik", "Grodzisk Mazowiecki", "Panna Ring na Orliku", "10 lat w użyciu bez żadnych uszkodzeń.", "2024/12/9-768x432.jpg", "w1"),
]
PRICE_BY_ID = {m["id"]: m for m in PRICE["models"]}

GUIDES = [
    ("Budżet", "Ile kosztuje budowa boiska sportowego?", "Co tworzy koszt i ceny Gamefields.", "/ile-kosztuje-budowa-boiska-sportowego/"),
    ("Proces", "Budowa boiska krok po kroku", "Siedem etapów od terenu do odbioru.", "/budowa-boiska-krok-po-kroku/"),
    ("Technologia", "Jak wybrać nawierzchnię sportową?", "Trawa, EPDM, płytki, guma, akryl, farba.", "/jak-wybrac-nawierzchnie-sportowa/"),
    ("Istniejący obiekt", "Renowacja czy budowa nowego boiska?", "Kiedy wystarczy odnowić stary plac.", "/renowacja-czy-budowa-nowego-boiska/"),
    ("Wymiary", "Wymiary boiska wielofunkcyjnego", "Geometria, strefy, Orlik i mały metraż.", "/wymiary-boiska-wielofunkcyjnego/"),
    ("Finansowanie", "Dofinansowanie boisk", "Nabory 2027 i dokumenty do wniosku.", "/dofinansowanie-boisk/"),
]

paint_min = min(v["r"] for v in variants(None))
rubber_max = max(v["r"] for v in variants("rubber"))
FAQ = [
    ("Ile kosztuje budowa boiska sportowego?",
     f"W Gamefields konstrukcje kosztują od {zl(CHEAP['constructionFromNet'])} netto, a całe boisko z płytą betonową i malowaniem, np. {PLAY['name']}, od {zl(FULL_PLAY)} netto. "
     f"Płyta betonowa z podbudową to {BASE['rateNetPerM2']} zł/m², wykończenia od {paint_min} do {rubber_max} zł/m² netto. Montaż, transport i przygotowanie terenu liczę po zdjęciach placu."),
    ("Co zawiera cena „z nawierzchnią”?",
     "Konstrukcję w podstawowej konfiguracji i standardowym kolorze, płytę betonową 12 cm z podbudową i malowanie jednokolorowe, liczone od powierzchni konstrukcji z 10% zapasem. Bez montażu, transportu i przygotowania terenu."),
    ("Czy budujecie też większe boiska wielofunkcyjne?",
     "Tak, jako projekt indywidualny: analiza terenu, koncepcja, podbudowa, nawierzchnia, linie i wyposażenie. Cenę takiego boiska przygotowuję po zdjęciach, wymiarach i ustaleniu sportów, bo zależy od zakresu robót."),
    ("Czy da się zrobić boisko na starym betonie?",
     "Zwykle tak. Jeśli beton jest stabilny, naprawiam rysy i ubytki, gruntuję podłoże i kładę elastyczną farbę sportową z granulatem gumowym, a na niej wzór i linie. Gdy podłoże jest poważnie uszkodzone, najpierw trzeba je przebudować."),
    ("Ile miejsca potrzebuję?",
     "Najmniejsze areny mają około 5 m średnicy, boisko 3 na 3 ma 15 × 10 m. Do metrażu trzeba doliczyć strefę bezpieczeństwa. Wymiary placu sprawdzisz w planerze „Zmieści się?” na stronie głównej."),
    ("Czy mogę zobaczyć projekt i cenę przed zamówieniem?",
     "Tak. W Studio 3D wybierasz model, kolory, wzór i nawierzchnię, a cena liczy się na bieżąco. Projekt pobierasz jako kartę PDF i wysyłasz do wyceny."),
    ("Czy pomagacie w dofinansowaniu i przetargu?",
     "Tak. Dla gmin i szkół przygotowuję koncepcję, parametry techniczne i dokumenty do wniosku o dofinansowanie i do przetargu, z kartami technicznymi i certyfikatami producentów. Nabory na 2027 rok ruszają 4 stycznia."),
    ("Jaka jest gwarancja?",
     "12 miesięcy gwarancji i stała opieka nad renowacją boiska po odbiorze. Panna Ring na Orliku OSiR w Grodzisku Mazowieckim jest w użyciu od 10 lat bez żadnych uszkodzeń."),
    ("Kiedy można prowadzić prace?",
     "Farby sportowe kładziemy na suchy beton przy dodatniej temperaturze, zwykle od wiosny do jesieni. Projekt, wycenę i dokumenty można przygotować wcześniej, także zimą."),
]

# ---------------------------------------------------------------- html parts
mosaic = "".join(f'<li>{img(p, a, eager=i == 0)}<span>{c}</span></li>' for i, (p, a, c) in enumerate([
    ("2026/11/Krakow-Panna-Arena-Octa-Cage-90-Gamefields-1024x1024.jpg", "Gotowa arena Panna Octa Cage 90 w parku, Kraków", "Gotowe boisko"),
    ("2026/11/Gamefields-x-boiska-x-Projekt-Krakow--768x768.jpg", "Plan zagospodarowania z arenami Gamefields, Kraków", "Projekt"),
    ("2026/11/Gamefields-x-Panna-Cage-x-Krakow-montaz-768x576.jpg", "Montaż areny w parku, Kraków", "Montaż"),
    ("2025/06/IMG_6608-scaled-e1749983082809-768x696.jpg", "Dzieci na boisku Panna Octa w Kutnie", "W użyciu"),
]))

path_html = "".join(
    f'<li><a href="{href}"><span class="q">{q}</span><b>{t}</b><p>{d}</p><ul>' + "".join(f"<li>{x}</li>" for x in pts) +
    f'</ul><span class="pr">{pr}</span><span class="go">{go}</span></a></li>' for q, t, d, pts, pr, href, go in paths)

rows = "".join(
    f'<tr><td><b>{html.escape(m["name"])}</b><br>{html.escape(m["dimensions"])} · {str(SLAB[m["id"]]["areaM2"]).replace(".", ",")} m² nawierzchni'
    + (f' · {html.escape(m["forWhom"])}' if m["forWhom"] else "") + "</td>"
    f'<td class="r" data-l="Konstrukcja od">{zl(m["constructionFromNet"])}<small>{zl(round(m["constructionFromNet"] * VAT))} brutto</small></td>'
    f'<td class="r" data-l="Z nawierzchnią od">{zl(m["constructionFromNet"] + SLAB[m["id"]]["net"] + PAINT[m["id"]])}<small>płyta + malowanie</small></td>'
    f'<td class="r"><a href="/product/{SLUG[m["id"]]}/">Zobacz</a> <a href="{m["link"]}">Studio ↗</a></td></tr>' for m in MODELS)
price_table = ('<div class="gfb-scroll"><table class="gfb-table"><thead><tr><th>Model</th><th class="r">Konstrukcja od (netto)</th><th class="r">Z nawierzchnią od (netto)</th><th class="r"><span class="sr">Linki</span></th></tr></thead>'
               f"<tbody>{rows}</tbody></table></div>")
incl = "".join(f"<li>{html.escape(x)}</li>" for x in BASE["includes"])
excl = "".join(f"<li>{html.escape(x)}</li>" for x in BASE["excludes"] if "Wykończenie" not in x and "Konstrukcja" not in x) + "<li>Montaż i transport konstrukcji</li>"

model_opts = "".join(f'<option value="{m["id"]}"' + (" selected" if m["id"] == "o1" else "") + f'>{html.escape(m["n"])} · {str(m["a"]).replace(".", ",")} m²</option>' for m in calc_models)
surf_opts = "".join(f'<option value="{i}"' + (" selected" if s["k"] == "paint" else "") + f'>{html.escape(s["n"])}</option>' for i, s in enumerate(calc_surf))

steps_html = "".join(f'<li><b>{t}</b><p>{d}</p><span class="gf">{g}</span></li>' for t, d, g in STEPS) + \
    f'<li class="ph">{img("2026/11/Gamefields-x-Panna-Cage-x-Krakow-montaz-768x576.jpg", "Montaż areny Gamefields w parku, Kraków")}</li>'

surf_html = "".join(
    f'<li><a href="/product/{slug}/">{img("2026/11/" + k + "-macro-768x576.webp", name + " z bliska")}'
    f'<span class="tx"><b>{name}</b><span class="nt">{note}</span><span class="r">{rng(key)} zł/m² netto</span></span></a></li>' for key, name, k, slug, note in SURF) + \
    (f'<li><a href="/product/plyta-betonowa/">{img("2026/11/beton-macro-768x576.webp", "Płyta betonowa z bliska")}'
     f'<span class="tx"><b>Płyta betonowa 12 cm</b><span class="nt">podstawa pod każde wykończenie</span><span class="r">{BASE["rateNetPerM2"]} zł/m² netto</span></span></a></li>')

reals_html = "".join(
    f'<li><a href="/realizacje-gamefields/#{cid}"><span class="ph">{img(p, t + ", " + pl)}<span class="who">{who}</span></span>'
    f'<span class="tx"><span class="pl">{pl}</span><b>{t}</b><span class="ld">{ld}</span><span class="md">{PRICE_BY_ID[mid]["name"]} · od {zl(PRICE_BY_ID[mid]["constructionFromNet"])} netto</span></span></a></li>'
    for cid, who, pl, t, ld, p, mid in REALS)

faq_html = "".join(f"<details><summary>{html.escape(q)}</summary><p>{html.escape(a)}</p></details>" for q, a in FAQ)
guides_html = "".join(f'<li><a href="{u}"><i>{c}</i><b>{t}</b><span>{d}</span></a></li>' for c, t, d, u in GUIDES)

jump = [("start", "Od czego zacząć"), ("ceny", "Ceny"), ("kalkulator", "Kalkulator"), ("proces", "Etapy"), ("nawierzchnie", "Nawierzchnie"),
        ("gminy", "Gminy i szkoły"), ("realizacje", "Realizacje"), ("wycena", "Do wyceny"), ("pytania", "Pytania")]
jump_html = "".join(f'<li><a href="#{a}">{b}</a></li>' for a, b in jump)

CALC_JS = """<script type="application/json" id="gfb-calc-data">""" + json.dumps(CALC, ensure_ascii=False, separators=(",", ":")) + """</script>
<script>(function(){var f=document.getElementById('gfb-calc');if(!f)return;var D=JSON.parse(document.getElementById('gfb-calc-data').textContent);
var q=function(s){return document.querySelector(s)};var mSel=f.querySelector('[name=model]'),area=f.querySelector('[name=area]'),areaBox=q('[data-area]'),sSel=f.querySelector('[name=surf]'),vBox=q('[data-var]'),
cons=f.querySelector('[name=cons]'),slab=f.querySelector('[name=slab]'),out=q('[data-sum]'),gross=q('[data-gross]'),list=q('[data-list]'),studio=q('[data-studio]');
function fmt(n){return String(Math.round(n)).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'\\u00a0')+'\\u00a0zł'}
function up(a,r){return Math.ceil(Math.round(a*r*100)/10000)*100}
function model(){var id=mSel.value;for(var i=0;i<D.models.length;i++){if(D.models[i].id===id)return D.models[i]}return null}
function variants(){var s=D.surf[+sSel.value];if(!s.v.length){vBox.innerHTML='<p class="gfb-note">Sama płyta betonowa, gotowa pod wykończenie.</p>';return}
var cur=vBox.querySelector('input:checked');var keep=cur?+cur.value:0;if(keep>=s.v.length)keep=0;
vBox.innerHTML='<div class="gfb-chips" role="radiogroup">'+s.v.map(function(v,i){return '<label><input type="radio" name="var" value="'+i+'"'+(i===keep?' checked':'')+'> '+v.n+' · '+v.r+' zł/m²</label>'}).join('')+'</div>';}
var wasCustom=false;function render(){var m=model(),custom=!m;areaBox.hidden=!custom;cons.disabled=custom;if(custom)cons.checked=false;if(wasCustom){if(!custom)cons.checked=true}wasCustom=custom;
var a=custom?Math.max(0,parseFloat(String(area.value).replace(',','.'))||0):m.a;var s=D.surf[+sSel.value];var vi=vBox.querySelector('input:checked');var v=s.v.length?s.v[vi?+vi.value:0]:null;
var rows=[],sum=0;if(!custom){if(cons.checked){rows.push(['Konstrukcja '+m.n,m.c]);sum+=m.c}}
if(slab.checked){var sl=custom?up(a,D.slab):m.s;rows.push(['Płyta betonowa z podbudową · '+String(a).replace('.',',')+' m²',sl]);sum+=sl}
if(v){var fi=up(a,v.r);rows.push([s.n+' · '+v.n,fi]);sum+=fi}
out.textContent=sum?fmt(sum):'—';gross.textContent=sum?fmt(sum*(1+D.vat))+' brutto (VAT 23%)':'Wybierz elementy';
list.innerHTML=rows.map(function(r){return '<div><dt>'+r[0]+'</dt><dd>'+fmt(r[1])+'</dd></div>'}).join('');
studio.href=custom?'/studio/':'/studio/?arena='+m.id;}
mSel.addEventListener('change',render);area.addEventListener('input',render);cons.addEventListener('change',render);slab.addEventListener('change',render);
sSel.addEventListener('change',function(){variants();render()});vBox.addEventListener('change',render);f.addEventListener('submit',function(e){e.preventDefault()});variants();render();})();</script>"""

body = f"""
<section class="gfb-hero"><div class="w top">
  <div>
    <p class="gfb-crumbs"><a href="/">Gamefields</a> / Budowa boisk</p>
    <p class="k">Projekt, podbudowa, nawierzchnia, montaż</p>
    <h1 class="d">Budowa boisk sportowych.</h1>
    <p class="lead">Od pustego terenu albo starego betonu do pierwszego meczu. Dobieram format, nawierzchnię i zakres prac do miejsca i budżetu, a cenę widzisz, zanim cokolwiek podpiszesz.</p>
    <div class="gfa-btns"><a class="gfa-btn" href="#kalkulator">Policz budżet ↓</a><a class="gfa-btn alt" href="/kontakt/">Wyślij zdjęcia placu →</a></div>
  </div>
  <ul class="gfb-mosaic" role="list">{mosaic}</ul>
</div>
<div class="w">
  <dl class="gfb-nums">
    <div><dt>Konstrukcja</dt><dd>od {zl(CHEAP['constructionFromNet'])}<small>netto, {CHEAP['name']}</small></dd></div>
    <div><dt>Płyta z podbudową</dt><dd>{BASE['rateNetPerM2']} zł/m²<small>netto, beton 12 cm</small></dd></div>
    <div><dt>Gwarancja</dt><dd>12 miesięcy<small>i opieka po odbiorze</small></dd></div>
    <div><dt>Na Orliku</dt><dd>10 lat<small>Panna Ring bez uszkodzeń</small></dd></div>
  </dl>
</div></section>

<nav class="gfb-jump" aria-label="Na tej stronie"><div class="w"><ul role="list">{jump_html}</ul></div></nav>

<section class="gfa-sec" id="start"><div class="w">
  <div class="gfa-head"><div><p class="k">Od czego zacząć</p><h2 class="d">Jaki masz punkt wyjścia?</h2></div><p>Wybierz sytuację, która pasuje do Ciebie. Każda ścieżka prowadzi do ceny i konkretnego zakresu prac.</p></div>
  <ul class="gfb-paths" role="list">{path_html}</ul>
</div></section>

<section class="gfa-sec" id="ceny"><div class="w">
  <div class="gfa-head"><div><p class="k">Ceny</p><h2 class="d">Ile kosztuje boisko?</h2></div><p>Osiem modeli: cena samej konstrukcji z bramkami i całego boiska z płytą betonową i malowaniem. Ceny „od”, netto.</p></div>
  {price_table}
  <div class="gfb-incl">
    <div><p class="k">Płyta betonowa zawiera</p><ul>{incl}</ul></div>
    <div><p class="k">Liczę osobno, po zdjęciach placu</p><ul>{excl}</ul></div>
  </div>
  <p class="gfb-note">„Z nawierzchnią”: konstrukcja w podstawowej konfiguracji i standardowym kolorze, płyta 12 cm z podbudową i malowanie jednokolorowe, liczone od powierzchni konstrukcji z 10% zapasem. Arena mobilna: od {zl(MOBILE['constructionFromNet'])} netto. Brutto z VAT 23%.</p>
</div></section>

<section class="gfa-sec" id="kalkulator"><div class="w">
  <div class="gfa-head"><div><p class="k">Kalkulator</p><h2 class="d">Policz swój budżet.</h2></div><p>Wybierz boisko albo wpisz własny metraż, dodaj płytę i nawierzchnię. Te same ceny co w Studio 3D i w sklepie.</p></div>
  <div class="gfb-calc">
    <form id="gfb-calc" aria-label="Kalkulator budżetu boiska">
      <div><label for="gfb-model">Boisko</label>
        <select id="gfb-model" name="model">{model_opts}<option value="custom">Własny metraż (boisko indywidualne, sama nawierzchnia)</option></select></div>
      <div class="gfb-area" data-area hidden><label for="gfb-area">Powierzchnia w m²</label><input id="gfb-area" name="area" type="number" min="1" step="1" value="200" inputmode="numeric"></div>
      <fieldset><legend>Zakres</legend><div class="gfb-tog">
        <label><input type="checkbox" name="cons" checked><span>Konstrukcja z bandami i bramkami<small>podstawowa konfiguracja, standardowy kolor</small></span></label>
        <label><input type="checkbox" name="slab" checked><span>Płyta betonowa 12 cm z podbudową<small>odznacz, jeśli masz stabilny plac (beton, asfalt)</small></span></label>
      </div></fieldset>
      <div><label for="gfb-surf">Nawierzchnia</label><select id="gfb-surf" name="surf">{surf_opts}</select></div>
      <fieldset><legend>Wariant</legend><div data-var></div></fieldset>
    </form>
    <div class="gfb-out" aria-live="polite">
      <p class="k">Szacunkowy budżet netto</p>
      <p class="sum"><span data-sum>—</span><small data-gross></small></p>
      <dl data-list></dl>
      <p>Bez montażu, transportu i przygotowania terenu: te koszty zależą od miejsca, policzę je po zdjęciach. Nawierzchnia: metraż z 10% zapasem, w górę do 100 zł.</p>
      <div class="gfa-btns"><a class="gfa-btn" data-studio href="/studio/?arena=o1">Zaprojektuj w Studio ↗</a><a class="gfa-btn alt" href="/kontakt/">Zapytaj o wycenę</a></div>
    </div>
  </div>
</div></section>

<section class="gfa-sec" id="proces"><div class="w">
  <div class="gfa-head"><div><p class="k">Etapy</p><h2 class="d">Od miejsca do meczu.</h2></div><p>Najpierw miejsce i ludzie, potem koncepcja, a dopiero na końcu kolory. Przy każdym etapie rozmawiasz ze mną. <a href="/budowa-boiska-krok-po-kroku/">Szczegóły w poradniku →</a></p></div>
  <ol class="gfb-steps">{steps_html}</ol>
</div></section>

<section class="gfa-sec" id="nawierzchnie"><div class="w">
  <div class="gfa-head"><div><p class="k">Nawierzchnie</p><h2 class="d">Osiem nawierzchni.</h2></div><p>Każda leży na płycie betonowej albo na stabilnym, istniejącym placu. Ceny za m² netto, od wariantu Standard do Premium. <a href="/jak-wybrac-nawierzchnie-sportowa/">Jak wybrać →</a></p></div>
  <ul class="gfb-surf" role="list">{surf_html}</ul>
</div></section>

<section class="gfa-band" id="gminy"><div class="w">
  <div class="gfa-head"><div><p class="k">Dla gmin, szkół i Orlików</p><h2 class="d">Boisko, które się broni.</h2></div><p>Modernizacja Orlika, nowe boisko w gminie albo strefa przy szkole. Przygotuję koncepcję, parametry techniczne i dokumenty do wniosku o dofinansowanie i do przetargu.</p></div>
  <dl class="gfb-docs">
    <div><dt>Dokumenty</dt><dd>Karty techniczne i certyfikaty stali, farb i nawierzchni dołączam do oferty, wniosku i dokumentacji przetargowej.</dd></div>
    <div><dt>Orlik 2012</dt><dd>Rozwiązania spełniają wymagania programu „Moje Boisko – Orlik 2012”. Nabory na 2027 rok ruszają 4 stycznia.</dd></div>
    <div><dt>12 miesięcy</dt><dd>Rok gwarancji i stała opieka nad renowacją boiska po odbiorze.</dd></div>
    <div><dt>10 lat</dt><dd>Panna Ring w użyciu na Orliku OSiR w Grodzisku Mazowieckim, bez żadnych uszkodzeń.</dd></div>
  </dl>
  <ul class="gfb-norms" role="list"><li><b>PN-EN 14877</b>nawierzchnie poliuretanowe EPDM</li><li><b>PN-EN 1177</b>i atest PZH: płyty gumowe</li><li><b>R11</b>antypoślizg: płyty i maty gumowe</li><li><b>Wodoprzepuszczalne</b>EPDM natryskowe i płyty</li></ul>
  <ul class="gfa-links"><li><a href="/dofinansowanie-boisk/">Dofinansowanie boisk →</a></li><li><a href="/realizacje-dla-miast/">Realizacje dla miast →</a></li><li><a href="/dla-miast/">Dla miast</a></li><li><a href="/boiska-dla-szkol/">Dla szkół</a></li></ul>
</div></section>

<section class="gfa-sec" id="realizacje"><div class="w">
  <div class="gfa-head"><div><p class="k">Realizacje</p><h2 class="d">Zbudowane i w użyciu.</h2></div><p>Miasta, parki i Orliki. Każda historia z modelem, ceną i słowami zamawiających. <a href="/realizacje-gamefields/">Wszystkie realizacje →</a></p></div>
  <ul class="gfb-reals" role="list">{reals_html}</ul>
</div></section>

<section class="gfa-sec" id="wycena"><div class="w">
  <div class="gfa-head"><div><p class="k">Do wyceny</p><h2 class="d">Co mi wysłać?</h2></div><p>Nie potrzebujesz dokumentacji ani znajomości technologii. Na start wystarczy pięć informacji i kilka zdjęć z telefonu.</p></div>
  <div class="gfb-prep">
    <div><h3>Pięć informacji</h3><ul class="gfb-check">
      <li><span><b>Lokalizacja</b>: adres albo pinezka na mapie.</span></li>
      <li><span><b>Wymiary</b>: przybliżone, z miarki albo z mapy.</span></li>
      <li><span><b>Sporty i użytkownicy</b>: kto i w co ma grać.</span></li>
      <li><span><b>Zakres</b>: całe boisko, sama nawierzchnia albo renowacja.</span></li>
      <li><span><b>Termin i budżet</b>: także, jeśli zależy od dofinansowania.</span></li>
    </ul></div>
    <div><h3>Zdjęcia placu</h3><ul class="gfb-check">
      <li><span>Cała powierzchnia z kilku stron.</span></li>
      <li><span>Pęknięcia, ubytki i krawędzie z bliska.</span></li>
      <li><span>Odpływy i miejsca, gdzie stoi woda.</span></li>
      <li><span>Obecne wyposażenie i jego fundamenty.</span></li>
      <li><span>Dojazd dla transportu i sprzętu.</span></li>
    </ul>
    <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Wyślij zdjęcia placu →</a><a class="gfa-btn alt" href="/studio/">Projekt w Studio ↗</a></div></div>
  </div>
</div></section>

<section class="gfa-sec" id="pytania"><div class="w">
  <div class="gfa-head"><div><p class="k">Pytania</p><h2 class="d">Zanim zapytasz.</h2></div><p>Najczęstsze pytania o koszty, zakres, dofinansowanie i terminy.</p></div>
  <div class="gfa-faq">{faq_html}</div>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><div><p class="k">Baza wiedzy</p><h2 class="d">Przeczytaj, zanim zdecydujesz.</h2></div><p>Poradniki z cenami Gamefields: koszty, etapy, nawierzchnie, renowacja, wymiary i finansowanie.</p></div>
  <ul class="gfb-next" role="list">{guides_html}</ul>
  <ul class="gfb-who" role="list"><li><a href="/dla-miast/"><span>Dla</span>miast i gmin</a></li><li><a href="/boiska-dla-szkol/"><span>Dla</span>szkół</a></li><li><a href="/boiska-dla-deweloperow/"><span>Dla</span>deweloperów</a></li><li><a href="/boiska-dla-klubow/"><span>Dla</span>klubów</a></li><li><a href="/aktywacje-sportowe-dla-marek/"><span>Dla</span>marek</a></li><li><a href="/renowacja-boisk/">Renowacja boisk</a></li><li><a href="/malowanie-boisk/">Malowanie boisk</a></li><li><a href="/nawierzchnie-sportowe/">Nawierzchnie sportowe</a></li><li><a href="/projektowanie-boisk/">Projektowanie boisk</a></li></ul>
</div></section>

<section class="gfa-cta"><div class="w">
  <h2 class="d">Masz teren<br>pod boisko?</h2>
  <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Wyślij zdjęcia placu →</a><a class="gfa-btn alt" href="/studio/">Zaprojektuj w Studio ↗</a></div>
</div></section>
"""

ld = {"@context": "https://schema.org", "@graph": [
    {"@type": "Service", "@id": URL + "#usluga", "name": "Budowa boisk sportowych", "serviceType": "Budowa boisk sportowych", "url": URL, "inLanguage": "pl-PL",
     "areaServed": {"@type": "Country", "name": "Polska"}, "provider": {"@id": SITE + "#studio"},
     "description": "Budowa boisk sportowych od analizy terenu, przez płytę betonową z podbudową i nawierzchnię, po konstrukcję, linie i odbiór. Dla gmin, szkół, osiedli, klubów i marek.",
     "offers": {"@type": "AggregateOffer", "priceCurrency": "PLN", "lowPrice": CHEAP["constructionFromNet"], "offerCount": len(MODELS),
                "priceSpecification": {"@type": "PriceSpecification", "valueAddedTaxIncluded": False}}},
    {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Gamefields", "item": SITE},
                                                    {"@type": "ListItem", "position": 2, "name": "Budowa boisk sportowych", "item": URL}]},
    {"@type": "FAQPage", "@id": URL + "#pytania", "inLanguage": "pl-PL",
     "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]}]}

write(HERE, "budowa-boisk-sportowych", CSS, ld, body, CALC_JS)
