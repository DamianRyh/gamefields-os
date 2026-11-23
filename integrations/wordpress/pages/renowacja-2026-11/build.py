#!/usr/bin/env python3
"""/renowacja-boisk/ (page 3685), rebuilt 23.11.2026 in the .gfb style shared with /budowa-boisk-sportowych/.

Output: renowacja-boisk.html (one wp:html block, the whole content of the page).

For owners of an old court or a concrete/asphalt square: a before/after slider, what is wrong with the court and what
fixes it, renovation or a new build, the four steps, painting prices and new surfaces on an existing square,
a renovation calculator (own area, painting or a new surface, optional arena), new looks from the Studio,
municipalities, what to photograph, FAQ. Facts only from the price files, the homepage "Stary beton" section and
the knowledge base guide "Renowacja czy budowa nowego boiska?". Ground repairs are priced after photos.
"""
import html
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from gfb_common import (BASE, FIN, GFB_CSS, MODELS, SITE, SLAB, SLUG, SURF, UP, img, jump_html, faq_html, rng, variants, write, zl)  # noqa: E402

URL = SITE + "renowacja-boisk/"
MOD = UP + "2026/11/"
PAINT_V = FIN["variants"]
PAINT_MIN = min(v["netPerM2"] for v in PAINT_V)
NEW_SURF = [s for s in SURF if s[0] is not None]
NEW_MIN = min(min(v["r"] for v in variants(s[0])) for s in NEW_SURF)

CSS = GFB_CSS + """
.gfb-ba{position:relative;margin:0;overflow:hidden;background:#E6E0DA;aspect-ratio:3/2;user-select:none;touch-action:pan-y}
.gfb-ba img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.gfb-ba .after{clip-path:inset(0 0 0 var(--p,50%))}
.gfb-ba .bar{position:absolute;top:0;bottom:0;left:var(--p,50%);width:3px;margin-left:-1.5px;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.15);pointer-events:none}
.gfb-ba .bar::after{content:"↔";position:absolute;top:50%;left:50%;display:grid;place-items:center;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;background:#fff;color:var(--ink);font-weight:800;box-shadow:0 4px 14px rgba(0,0,0,.25)}
.gfb-ba input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:ew-resize}
.gfb-ba .tag{position:absolute;top:10px;padding:5px 10px;background:rgba(28,9,18,.82);color:#fff;font-size:12px;font-weight:800;pointer-events:none}
.gfb-ba .tag.l{left:10px}.gfb-ba .tag.r{right:10px;background:var(--lime);color:#1F2A6B}
.gfb-hero figcaption{margin-top:8px;font-size:13px;color:var(--muted)}
/* symptoms */
.gfb-sym{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.gfb-sym li{display:flex;flex-direction:column;gap:10px;padding:22px;background:#fff;border:1px solid var(--line)}
.gfb-sym .s{font-size:13px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.gfb-sym b{font-size:21px;letter-spacing:-.02em;line-height:1.15}
.gfb-sym p{margin:0;color:#5A4652;font-size:15px}
.gfb-sym strong{color:var(--ink)}.gfb-sym li.warn strong{color:#fff}
.gfb-sym .fix{margin-top:auto;padding-top:12px;border-top:1px solid var(--line);display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px 12px;font-size:14px;font-weight:800}
.gfb-sym .fix a{color:var(--violet);text-decoration:none}
.gfb-sym li.warn{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.gfb-sym li.warn .s{color:var(--lime)}.gfb-sym li.warn p{color:rgba(244,241,238,.85)}.gfb-sym li.warn .fix{border-color:rgba(244,241,238,.2)}.gfb-sym li.warn .fix a{color:var(--lime)}
/* or-new */
.gfb-vs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.gfb-vs > div{padding:clamp(20px,2.4vw,32px);background:#fff;border:1px solid var(--line)}
.gfb-vs h3{font-size:clamp(24px,2.2vw,34px);font-weight:800;letter-spacing:-.035em;line-height:1.05;margin:0 0 14px}
.gfb-vs ul{margin:0;padding-left:20px;display:grid;gap:6px;color:#5A4652;font-size:16px}
.gfb-vs .res{margin:16px 0 0;padding:12px 14px;background:var(--paper);font-size:15px;font-weight:700}
.gfb-vs .res a{color:var(--violet)}
.gfb-mid{margin:12px 0 0;padding:18px 22px;background:#EEE8FF;font-size:16px;color:var(--ink)}
/* paint variants */
.gfb-pv{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;counter-reset:p}
.gfb-pv li{display:flex;flex-direction:column;gap:8px;padding:22px;background:#fff;border:1px solid var(--line)}
.gfb-pv .n{font-size:13px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--violet)}
.gfb-pv b{font-size:clamp(28px,2.6vw,40px);font-weight:800;letter-spacing:-.04em;line-height:1}
.gfb-pv b small{font-size:15px;font-weight:600;letter-spacing:0;color:var(--muted)}
.gfb-pv p{margin:0;color:#5A4652;font-size:15px}
.gfb-pv .ex{margin-top:auto;padding-top:10px;border-top:1px solid var(--line);font-size:14px;color:var(--muted)}
.gfb-pv .ex b{font-size:14px;letter-spacing:0;color:var(--ink)}
.gfb-facts3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:12px 0 0}
.gfb-facts3 div{padding:18px 20px;border:1px solid var(--line)}
.gfb-facts3 dt{font-size:13px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--violet)}
.gfb-facts3 dd{margin:6px 0 0;font-size:15px;color:#5A4652}
/* looks */
.gfb-looks{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.gfb-looks figure{margin:0;background:#fff;border:1px solid var(--line)}
.gfb-looks img{display:block;width:100%;aspect-ratio:16/10;object-fit:cover;background:#E6E0DA}
.gfb-looks figcaption{padding:14px 16px;font-size:14px;color:var(--muted)}.gfb-looks figcaption b{display:block;color:var(--ink);font-size:17px}
.gfb-presets{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.gfb-presets button{min-height:36px;padding:0 12px;border-radius:999px;border:1.5px solid #CDBFC6;background:#fff;color:var(--ink);font:inherit;font-size:13px;font-weight:700;cursor:pointer}
.gfb-presets button:hover,.gfb-presets button[aria-pressed=true]{border-color:var(--violet);background:#EEE8FF}
@media (max-width:1100px){.gfb-sym,.gfb-pv{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:900px){.gfb-vs,.gfb-facts3{grid-template-columns:minmax(0,1fr)}.gfb-looks{grid-template-columns:minmax(0,1fr)}}
@media (max-width:560px){.gfb-sym,.gfb-pv{grid-template-columns:minmax(0,1fr)}}
"""

# ---------------------------------------------------------------- data
SYMPTOMS = [
    ("Wyblakłe kolory, starte linie", "Plac jest równy, ale szary, a linie ledwo widać.", "Mycie, grunt i nowa farba sportowa z liniami.", f"od {PAINT_MIN} zł/m²", "#ceny", "Malowanie ↓", False),
    ("Rysy i drobne ubytki", "Pajęczyna drobnych pęknięć, małe wyrwy przy krawędziach.", "Wypełnienie rys, szlifowanie, warstwa wyrównująca, elastyczna farba z gumą, która przykrywa drobne rysy.", "naprawy po zdjęciach", "#proces", "Etapy ↓", False),
    ("Twardo i ślisko", "Beton boli przy upadku, po deszczu się ślizga.", "Powłoka z granulatem gumowym albo natrysk poliuretanowy z EPDM.", f"od {variants(None)[1]['r']} zł/m²", "#nawierzchnie", "Nawierzchnie ↓", False),
    ("Zużyta trawa albo guma", "Nawierzchnia jest wytarta, ale podłoże pod nią trzyma.", "Nowa warstwa na istniejącej bazie: trawa, EPDM, płytki, akryl albo guma.", f"od {NEW_MIN} zł/m²", "#nawierzchnie", "Nawierzchnie ↓", False),
    ("Boisko stoi puste", "Jest miejsce, ale nikt tu nie gra: brak bramek, band, charakteru.", "Nowy wzór i linie do kilku gier, a na placu arena panna z bandami.", f"arena od {zl(min(m['constructionFromNet'] for m in MODELS))}", "#kalkulator", "Policz ↓", False),
    ("Woda stoi, beton się zapada", "Zapadnięcia, pracujące pęknięcia, kałuże po każdym deszczu.", "To nie jest robota na farbę: trzeba przebudować podłoże.", f"płyta {BASE['rateNetPerM2']} zł/m²", "/budowa-boisk-sportowych/", "Budowa boisk →", True),
]

STEPS = [
    ("Ocena placu", "Ze zdjęć i wymiarów sprawdzam pęknięcia, spadki, odwodnienie i stan betonu. Mówię wprost, czy wystarczy malowanie, czy trzeba naprawić podłoże.", "termin i zakres podaję po zdjęciach, zanim cokolwiek podpiszemy."),
    ("Naprawa i grunt", "Mycie, szlifowanie, wypełnienie rys i ubytków, grunt do betonu i warstwa wyrównująca. Od tego zależy trwałość koloru.", "naprawy podłoża wyceniam po oględzinach."),
    ("Farby z gumą", "Elastyczna powłoka sportowa z granulatem gumowym: amortyzuje krok, nie ślizga się i przykrywa drobne rysy.", "na wyższe wymagania natrysk poliuretanowy z EPDM."),
    ("Wzór i linie", "Wzór Signature albo Twój projekt ze Studio 3D. Linie do piłki, koszykówki, 3 na 3 albo kilku gier naraz.", "wzór i kolory widzisz w Studio przed malowaniem."),
    ("Odbiór i opieka", "Sprawdzenie wykonania, linii i wyposażenia, odbiór boiska.", "12 miesięcy gwarancji i stała opieka nad renowacją."),
]
EXAMPLES = {"plain": "boisko szkolne do odświeżenia", "plain-granulate": "plac, na którym dzieci się przewracają",
            "pattern": "osiedle, które chce mieć swój znak", "pattern-advanced": "miejsce do zdjęć, grafika jak mural"}

PRESETS = [("Boisko 3 na 3 · 15 × 10 m", 150), ("Kosz · 28 × 15 m", 420), ("Wielofunkcyjne · 19 × 32 m", 608)]
CALC = {"paint": [{"n": v["name"], "r": v["netPerM2"]} for v in PAINT_V],
        "surf": [{"n": name, "v": variants(key)} for key, name, *_ in NEW_SURF],
        "models": [{"id": m["id"], "n": m["name"], "c": m["constructionFromNet"]} for m in MODELS],
        "vat": BASE["vatRate"]}

FAQ = [
    ("Ile kosztuje renowacja boiska?",
     f"Malowanie farbą sportową kosztuje od {PAINT_MIN} do {max(v['netPerM2'] for v in PAINT_V)} zł/m² netto, zależnie od wariantu: od jednego koloru z liniami po wzór 7+ kolorów. "
     f"Nowa nawierzchnia na istniejącym placu od {NEW_MIN} zł/m² netto. Naprawy podłoża (rysy, szlifowanie, wyrównanie) wyceniam po zdjęciach."),
    ("Czy każde stare boisko można odnowić?",
     "Nie zawsze. Jeśli podłoże ma rozległe zapadnięcia, pracujące pęknięcia albo poważne problemy z wodą, trzeba je przebudować. Dlatego pierwszym etapem jest ocena placu ze zdjęć i wymiarów."),
    ("Czy odnawiacie boiska betonowe i asfaltowe?",
     "Tak. Stabilny beton albo asfalt czyszczę, naprawiam i wykorzystuję jako bazę pod malowanie albo nową nawierzchnię."),
    ("Czym różni się farba z granulatem od zwykłej?",
     "Wariant z granulatem to elastyczna powłoka z gumą: lepiej amortyzuje krok, nie ślizga się i przykrywa drobne rysy. Na nim robię też wzory wielokolorowe."),
    ("Czy przy renowacji można zmienić układ boiska?",
     "Tak. Nowe linie do piłki, koszykówki, 3 na 3 albo kilku gier naraz, inne strefy gry, nowy wzór, a na placu nawet arena panna z bandami."),
    ("Jak długo trwa renowacja?",
     "Zależy od wielkości boiska i stanu placu na starcie. Termin podaję po ocenie zdjęć, zanim podpiszemy cokolwiek."),
    ("Kiedy można malować boisko?",
     "Farby sportowe kładziemy na suchy beton przy dodatniej temperaturze, zwykle od wiosny do jesieni. Ocenę, projekt i wycenę można zrobić wcześniej, także zimą."),
    ("Czy mogę zobaczyć nowy wygląd przed renowacją?",
     "Tak. Wzór, kolory i linie projektujesz w Studio 3D, a cena liczy się na bieżąco. Tak powstała koncepcja Organic Flow dla placu na Polu Mokotowskim."),
    ("Czy pomagacie przy modernizacji Orlika?",
     "Tak. Przygotowuję koncepcję, parametry techniczne i dokumenty do wniosku o dofinansowanie i do przetargu, z kartami technicznymi i certyfikatami producentów. Nabory na 2027 rok ruszają 4 stycznia."),
]

# ---------------------------------------------------------------- html parts
ba = (f'<figure><div class="gfb-ba" data-ba style="--p:50%">'
      f'<img src="{MOD}pole-mokotowskie-przed-1100.webp" srcset="{MOD}pole-mokotowskie-przed-720.webp 720w, {MOD}pole-mokotowskie-przed-1100.webp 1100w" sizes="(max-width:900px) 100vw, 50vw" alt="Przed: szary betonowy plac do koszykówki, Pole Mokotowskie" width="1100" height="733" loading="eager" decoding="async">'
      f'<img class="after" src="{MOD}pole-mokotowskie-po-1100.webp" srcset="{MOD}pole-mokotowskie-po-720.webp 720w, {MOD}pole-mokotowskie-po-1100.webp 1100w" sizes="(max-width:900px) 100vw, 50vw" alt="Koncepcja po: kolorowe boisko Organic Flow na tym samym placu" width="1100" height="733" loading="eager" decoding="async">'
      '<span class="bar"></span><span class="tag l">Przed</span><span class="tag r">Koncepcja po</span>'
      '<input type="range" min="0" max="100" value="50" aria-label="Przesuń, aby porównać przed i po"></div>'
      '<figcaption>Pole Mokotowskie, Warszawa: plac do koszykówki (Google Street View, 2017) i koncepcja Organic Flow. Wizualizacja, nie realizacja. '
      '<a href="/radar-boisko-koszykowki-warszawa/">Cała koncepcja →</a></figcaption></figure>')

sym_html = "".join(
    f'<li{" class=warn" if w else ""}><span class="s">Objaw</span><b>{s}</b><p>{d}</p><p><strong>Co robię:</strong> {fx}</p>'
    f'<span class="fix"><span>{pr}</span><a href="{href}">{go}</a></span></li>' for s, d, fx, pr, href, go, w in SYMPTOMS)

steps_html = "".join(f'<li><b>{t}</b><p>{d}</p><span class="gf">{g}</span></li>' for t, d, g in STEPS) + \
    f'<li class="ph">{img("2026/11/malowanie-macro-768x576.webp", "Farba sportowa na boisku z bliska")}</li>' + \
    f'<li class="ph">{img("2026/10/Gamefields-Studio-%E2%80%94-Organic-Flow-768x432.webp", "Wzór Organic Flow w Studio Gamefields")}</li>' + \
    f'<li class="ph">{img("2026/11/granulat-macro-768x576.webp", "Nawierzchnia EPDM z bliska")}</li>'

pv_html = "".join(f'<li><span class="n">{html.escape(v["name"])}</span><b>{v["netPerM2"]} <small>zł/m² netto</small></b><p>{html.escape(FIN["descriptions"].get(v["id"], ""))}</p>'
                  f'<span class="ex">Na przykład: <b>{EXAMPLES[v["id"]]}</b></span></li>' for v in PAINT_V)

surf_html = "".join(
    f'<li><a href="/product/{slug}/">{img("2026/11/" + k + "-macro-768x576.webp", name + " z bliska")}'
    f'<span class="tx"><b>{name}</b><span class="nt">{note}</span><span class="r">{rng(key)} zł/m² netto</span></span></a></li>' for key, name, k, slug, note in NEW_SURF) + \
    (f'<li><a href="/product/plyta-betonowa/">{img("2026/11/beton-macro-768x576.webp", "Płyta betonowa z bliska")}'
     f'<span class="tx"><b>Nowa płyta betonowa</b><span class="nt">gdy stare podłoże trzeba wymienić</span><span class="r">{BASE["rateNetPerM2"]} zł/m² netto</span></span></a></li>')

presets = "".join(f'<button type="button" data-a="{a}">{html.escape(n)}</button>' for n, a in PRESETS)
paint_opts = "".join(f'<label><input type="radio" name="pv" value="{i}"' + (" checked" if i == 1 else "") + f'> {html.escape(v["n"])} · {v["r"]} zł/m²</label>' for i, v in enumerate(CALC["paint"]))
surf_opts = "".join(f'<option value="{i}">{html.escape(s["n"])}</option>' for i, s in enumerate(CALC["surf"]))
model_opts = '<option value="">Bez areny</option>' + "".join(f'<option value="{m["id"]}">{html.escape(m["n"])} · od {zl(m["c"])}</option>' for m in CALC["models"])

looks = [("2026/10/Gamefields-Studio-%E2%80%94-Organic-Flow-768x432.webp", "Organic Flow", "płynne formy, 7+ kolorów: wzór zaawansowany"),
         ("2026/10/Studio-Urban-Contrast.webp", "Urban Contrast", "mocne kontrasty na miejski plac"),
         ("2026/10/Studio-Classic-Lines.webp", "Classic Lines", "czytelne linie do kilku gier")]
looks_html = "".join(f'<li><figure>{img(p, "Wzór nawierzchni " + n + " w Studio Gamefields")}<figcaption><b>{n}</b>{d}</figcaption></figure></li>' for p, n, d in looks)

jump = [("objawy", "Co z boiskiem?"), ("czy-nowe", "Renowacja czy nowe"), ("proces", "Etapy"), ("ceny", "Ceny malowania"), ("nawierzchnie", "Nowa nawierzchnia"),
        ("kalkulator", "Kalkulator"), ("wyglad", "Nowy wygląd"), ("wycena", "Do wyceny"), ("pytania", "Pytania")]

CALC_JS = """<script type="application/json" id="gfb-ren-data">""" + json.dumps(CALC, ensure_ascii=False, separators=(",", ":")) + """</script>
<script>(function(){var ba=document.querySelector('.gfb [data-ba]');if(ba){var r=ba.querySelector('input');r.addEventListener('input',function(){ba.style.setProperty('--p',r.value+'%')})}
var f=document.getElementById('gfb-ren');if(!f)return;var D=JSON.parse(document.getElementById('gfb-ren-data').textContent);var q=function(s){return document.querySelector(s)};
var area=f.querySelector('[name=area]'),mode=f.querySelectorAll('[name=mode]'),pBox=q('[data-paint]'),sBox=q('[data-surf]'),sSel=f.querySelector('[name=surf]'),tBox=q('[data-tier]'),arena=f.querySelector('[name=arena]'),
out=q('[data-sum]'),gross=q('[data-gross]'),list=q('[data-list]');
function fmt(n){return String(Math.round(n)).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'\\u00a0')+'\\u00a0zł'}
function up(a,r){return Math.ceil(Math.round(a*r*100)/10000)*100}
function curMode(){for(var i=0;i<mode.length;i++){if(mode[i].checked)return mode[i].value}return 'paint'}
function tiers(){var s=D.surf[+sSel.value];var cur=tBox.querySelector('input:checked');var keep=cur?+cur.value:0;
tBox.innerHTML='<div class="gfb-chips" role="radiogroup">'+s.v.map(function(v,i){return '<label><input type="radio" name="tier" value="'+i+'"'+(i===keep?' checked':'')+'> '+v.n+' · '+v.r+' zł/m²</label>'}).join('')+'</div>'}
function render(){var a=Math.max(0,parseFloat(String(area.value).replace(',','.'))||0);var m=curMode();pBox.hidden=m!=='paint';sBox.hidden=m==='paint';
var rows=[],sum=0,v,name;if(m==='paint'){var pi=f.querySelector('[name=pv]:checked');v=D.paint[pi?+pi.value:0];name='Malowanie · '+v.n}else{var s=D.surf[+sSel.value],ti=tBox.querySelector('input:checked');v=s.v[ti?+ti.value:0];name=s.n+' · '+v.n}
if(a){var c=up(a,v.r);rows.push([name+' · '+String(a).replace('.',',')+' m²',c]);sum+=c}
var id=arena.value;if(id){for(var i=0;i<D.models.length;i++){if(D.models[i].id===id){rows.push(['Arena '+D.models[i].n+' (konstrukcja)',D.models[i].c]);sum+=D.models[i].c}}}
out.textContent=sum?fmt(sum):'—';gross.textContent=sum?fmt(sum*(1+D.vat))+' brutto (VAT 23%)':'Wpisz powierzchnię';
list.innerHTML=rows.map(function(r){return '<div><dt>'+r[0]+'</dt><dd>'+fmt(r[1])+'</dd></div>'}).join('');}
f.querySelectorAll('[data-a]').forEach(function(b){b.addEventListener('click',function(){area.value=b.getAttribute('data-a');f.querySelectorAll('[data-a]').forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});render()})});
area.addEventListener('input',function(){f.querySelectorAll('[data-a]').forEach(function(x){x.setAttribute('aria-pressed','false')});render()});
for(var i=0;i<mode.length;i++)mode[i].addEventListener('change',render);
f.addEventListener('change',function(e){if(e.target===sSel)tiers();render()});f.addEventListener('submit',function(e){e.preventDefault()});tiers();render();})();</script>"""

body = f"""
<section class="gfb-hero"><div class="w top">
  <div>
    <p class="gfb-crumbs"><a href="/">Gamefields</a> / Renowacja boisk</p>
    <p class="k">Stary beton, nowe boisko</p>
    <h1 class="d">Renowacja boisk sportowych.</h1>
    <p class="lead">Nie każdy plac trzeba rozbierać. Szary beton, asfalt albo zużytą nawierzchnię zamieniam w kolorowe boisko do piłki, kosza i gry 3 na 3: naprawa podłoża, farby z gumą, wzór i linie w jednym zleceniu.</p>
    <div class="gfa-btns"><a class="gfa-btn" href="#kalkulator">Policz renowację ↓</a><a class="gfa-btn alt" href="/kontakt/">Wyślij zdjęcia boiska →</a></div>
  </div>
  {ba}
</div>
<div class="w">
  <dl class="gfb-nums">
    <div><dt>Malowanie</dt><dd>od {PAINT_MIN} zł/m²<small>netto, z gruntem i liniami</small></dd></div>
    <div><dt>Nowa nawierzchnia</dt><dd>od {NEW_MIN} zł/m²<small>netto, na istniejącym placu</small></dd></div>
    <div><dt>Ocena placu</dt><dd>ze zdjęć<small>naprawy wyceniam po oględzinach</small></dd></div>
    <div><dt>Gwarancja</dt><dd>12 miesięcy<small>i opieka po odbiorze</small></dd></div>
  </dl>
</div></section>

<nav class="gfb-jump" aria-label="Na tej stronie"><div class="w"><ul role="list">{jump_html(jump)}</ul></div></nav>

<section class="gfa-sec" id="objawy"><div class="w">
  <div class="gfa-head"><div><p class="k">Diagnoza</p><h2 class="d">Co jest z Twoim boiskiem?</h2></div><p>Znajdź objaw, który widzisz na swoim placu. Przy każdym: co robię i ile to mniej więcej kosztuje.</p></div>
  <ul class="gfb-sym" role="list">{sym_html}</ul>
</div></section>

<section class="gfa-sec" id="czy-nowe"><div class="w">
  <div class="gfa-head"><div><p class="k">Decyzja</p><h2 class="d">Renowacja czy nowe boisko?</h2></div><p>Jeśli podłoże jest stabilne, a problemy dotyczą głównie nawierzchni, linii i wyposażenia, renowacja zwykle wystarczy. <a href="/renowacja-czy-budowa-nowego-boiska/">Cały poradnik →</a></p></div>
  <div class="gfb-vs">
    <div><h3>Renowacja ma sens, gdy</h3><ul>
      <li>podłoże nie ma rozległych zapadnięć i pracujących pęknięć,</li><li>odwodnienie działa lub można je poprawić bez pełnej rozbiórki,</li>
      <li>wymiary i lokalizacja nadal odpowiadają użytkownikom,</li><li>większość problemów dotyczy nawierzchni, linii i wyposażenia,</li><li>nowa funkcja może wykorzystać istniejącą geometrię.</li></ul>
      <p class="res">Malowanie od {PAINT_MIN} zł/m² albo nowa nawierzchnia od {NEW_MIN} zł/m² netto. <a href="#kalkulator">Policz ↓</a></p></div>
    <div><h3>Budowa od nowa, gdy</h3><ul>
      <li>podbudowa jest niestabilna i powoduje trwałe deformacje,</li><li>obiekt ma poważne problemy z wodą,</li><li>istniejące wymiary nie pozwalają zrealizować potrzebnych funkcji,</li>
      <li>trzeba zmienić nawierzchnię razem z konstrukcją pod nią,</li><li>nowa infrastruktura wymaga fundamentów i przebudowy terenu.</li></ul>
      <p class="res">Nowa płyta betonowa 12 cm z podbudową: {BASE['rateNetPerM2']} zł/m² netto. <a href="/budowa-boisk-sportowych/">Budowa boisk →</a></p></div>
  </div>
  <p class="gfb-mid"><b>Najczęściej wychodzi coś pośrodku:</b> zachowuję część placu, lokalnie naprawiam podłoże, kładę nową warstwę, dodaję wyposażenie i zmieniam charakter miejsca. Zakres wynika z oględzin, a nie z założenia z góry.</p>
</div></section>

<section class="gfa-sec" id="proces"><div class="w">
  <div class="gfa-head"><div><p class="k">Etapy</p><h2 class="d">Od szarego placu do meczu.</h2></div><p>Pięć kroków. Najwięcej zależy od dwóch pierwszych: naprawy i gruntu.</p></div>
  <ol class="gfb-steps">{steps_html}</ol>
</div></section>

<section class="gfa-sec" id="ceny"><div class="w">
  <div class="gfa-head"><div><p class="k">Ceny malowania</p><h2 class="d">Ile kosztuje malowanie boiska?</h2></div><p>Ceny za m² netto, jak w Studio 3D i w sklepie. Naprawy podłoża wyceniam po zdjęciach. <a href="/malowanie-boisk/">Malowanie boisk →</a></p></div>
  <ul class="gfb-pv" role="list">{pv_html}</ul>
  <dl class="gfb-facts3">
    <div><dt>Czas realizacji</dt><dd>Zależy od wielkości boiska i stanu placu na starcie. Termin podaję po ocenie zdjęć.</dd></div>
    <div><dt>Pogoda</dt><dd>Farby sportowe kładziemy na suchy beton, przy dodatniej temperaturze, zwykle od wiosny do jesieni.</dd></div>
    <div><dt>Na start</dt><dd>Zdjęcia placu, przybliżone wymiary i lokalizacja. Nie musisz znać budżetu.</dd></div>
  </dl>
</div></section>

<section class="gfa-sec" id="nawierzchnie"><div class="w">
  <div class="gfa-head"><div><p class="k">Nowa nawierzchnia</p><h2 class="d">Nowa warstwa na starym placu.</h2></div><p>Każde z tych wykończeń kładę na stabilnym, istniejącym placu. Ceny za m² netto, od wariantu Standard do Premium. <a href="/jak-wybrac-nawierzchnie-sportowa/">Jak wybrać →</a></p></div>
  <ul class="gfb-surf" role="list">{surf_html}</ul>
</div></section>

<section class="gfa-sec" id="kalkulator"><div class="w">
  <div class="gfa-head"><div><p class="k">Kalkulator</p><h2 class="d">Policz renowację.</h2></div><p>Wpisz powierzchnię placu, wybierz malowanie albo nową nawierzchnię. Możesz od razu dodać arenę panna z bandami.</p></div>
  <div class="gfb-calc">
    <form id="gfb-ren" aria-label="Kalkulator renowacji boiska">
      <div><label for="gfb-ren-area">Powierzchnia placu w m²</label><input id="gfb-ren-area" name="area" type="number" min="1" step="1" value="420" inputmode="numeric">
        <div class="gfb-presets">{presets}</div></div>
      <fieldset><legend>Co robimy</legend><div class="gfb-chips" role="radiogroup">
        <label><input type="radio" name="mode" value="paint" checked> Malowanie</label><label><input type="radio" name="mode" value="surf"> Nowa nawierzchnia</label></div></fieldset>
      <fieldset data-paint><legend>Wariant malowania</legend><div class="gfb-chips">{paint_opts}</div></fieldset>
      <div data-surf hidden><label for="gfb-ren-surf">Nawierzchnia</label><select id="gfb-ren-surf" name="surf">{surf_opts}</select><div data-tier style="margin-top:10px"></div></div>
      <div><label for="gfb-ren-arena">Arena na placu (opcjonalnie)</label><select id="gfb-ren-arena" name="arena">{model_opts}</select></div>
    </form>
    <div class="gfb-out" aria-live="polite">
      <p class="k">Szacunkowy koszt netto</p>
      <p class="sum"><span data-sum>—</span><small data-gross></small></p>
      <dl data-list></dl>
      <p>Bez napraw podłoża (rysy, szlifowanie, wyrównanie), transportu i montażu: wycenię je po zdjęciach placu. Koszt zaokrąglony w górę do 100 zł.</p>
      <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Wyślij zdjęcia placu →</a><a class="gfa-btn alt" href="/studio/">Wzór w Studio ↗</a></div>
    </div>
  </div>
</div></section>

<section class="gfa-sec" id="wyglad"><div class="w">
  <div class="gfa-head"><div><p class="k">Nowy wygląd</p><h2 class="d">Zobacz nowe boisko, zanim pomalujemy.</h2></div><p>Renowacja to najlepszy moment, żeby zmienić charakter miejsca. Wzór, kolory i linie projektujesz w Studio 3D, a cena liczy się na bieżąco.</p></div>
  <ul class="gfb-looks" role="list">{looks_html}</ul>
  <ul class="gfa-links"><li><a href="/studio/">Zaprojektuj wzór w Studio ↗</a></li><li><a href="/koncepcje/">Koncepcje →</a></li><li><a href="/malowanie-boisk/">Malowanie boisk →</a></li></ul>
</div></section>

<section class="gfa-band" id="gminy"><div class="w">
  <div class="gfa-head"><div><p class="k">Dla gmin, szkół i Orlików</p><h2 class="d">Modernizacja z dokumentami.</h2></div><p>Modernizacja Orlika albo boiska szkolnego: koncepcja, parametry techniczne i dokumenty do wniosku o dofinansowanie i do przetargu.</p></div>
  <dl class="gfb-docs">
    <div><dt>Dokumenty</dt><dd>Karty techniczne i certyfikaty farb i nawierzchni do oferty, wniosku i dokumentacji przetargowej.</dd></div>
    <div><dt>Orlik 2012</dt><dd>Rozwiązania spełniają wymagania programu „Moje Boisko – Orlik 2012”. Nabory na 2027 rok ruszają 4 stycznia.</dd></div>
    <div><dt>12 miesięcy</dt><dd>Rok gwarancji i stała opieka nad renowacją boiska po odbiorze.</dd></div>
    <div><dt>PN-EN 14877</dt><dd>Nawierzchnie poliuretanowe EPDM; płyty gumowe z PN-EN 1177 i atestem PZH.</dd></div>
  </dl>
  <ul class="gfa-links"><li><a href="/dofinansowanie-boisk/">Dofinansowanie boisk →</a></li><li><a href="/realizacje-dla-miast/">Realizacje dla miast →</a></li><li><a href="/boiska-dla-szkol/">Dla szkół</a></li></ul>
</div></section>

<section class="gfa-sec" id="wycena"><div class="w">
  <div class="gfa-head"><div><p class="k">Do wyceny</p><h2 class="d">Co sfotografować?</h2></div><p>Wyślij stare boisko, zamiast od razu planować rozbiórkę. Na podstawie zdjęć ocenię, czy wystarczy renowacja, modernizacja czy nowa konstrukcja.</p></div>
  <div class="gfb-prep">
    <div><h3>Zdjęcia placu</h3><ul class="gfb-check">
      <li><span>Cała powierzchnia z kilku stron.</span></li><li><span>Pęknięcia i ubytki z bliska.</span></li><li><span>Krawędzie i obrzeża.</span></li>
      <li><span>Odpływy i miejsca, gdzie stoi woda.</span></li><li><span>Fundamenty urządzeń i obecne wyposażenie.</span></li></ul></div>
    <div><h3>I trzy informacje</h3><ul class="gfb-check">
      <li><span><b>Wymiary</b>: przybliżone, z miarki albo z mapy.</span></li><li><span><b>Lokalizacja</b>: adres albo pinezka.</span></li>
      <li><span><b>Do czego ma służyć</b>: piłka, kosz, 3 na 3, kilka gier.</span></li></ul>
      <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Wyślij zdjęcia boiska →</a><a class="gfa-btn alt" href="/studio/">Wzór w Studio ↗</a></div></div>
  </div>
</div></section>

<section class="gfa-sec" id="pytania"><div class="w">
  <div class="gfa-head"><div><p class="k">Pytania</p><h2 class="d">Renowacja zamiast rozbiórki.</h2></div><p>Koszty, zakres, terminy i dofinansowanie.</p></div>
  <div class="gfa-faq">{faq_html(FAQ)}</div>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><div><p class="k">Dalej</p><h2 class="d">Przeczytaj, zanim zdecydujesz.</h2></div><p>Poradniki z cenami Gamefields i powiązane usługi.</p></div>
  <ul class="gfb-next" role="list">
    <li><a href="/renowacja-czy-budowa-nowego-boiska/"><i>Decyzja</i><b>Renowacja czy budowa nowego boiska?</b><span>Kiedy wystarczy odnowić stary plac.</span></a></li>
    <li><a href="/jak-wybrac-nawierzchnie-sportowa/"><i>Technologia</i><b>Jak wybrać nawierzchnię sportową?</b><span>Trawa, EPDM, płytki, guma, akryl, farba.</span></a></li>
    <li><a href="/ile-kosztuje-budowa-boiska-sportowego/"><i>Budżet</i><b>Ile kosztuje budowa boiska?</b><span>Co tworzy koszt i ceny Gamefields.</span></a></li>
  </ul>
  <ul class="gfb-who" role="list"><li><a href="/malowanie-boisk/">Malowanie boisk</a></li><li><a href="/nawierzchnie-sportowe/">Nawierzchnie sportowe</a></li><li><a href="/budowa-boisk-sportowych/">Budowa boisk</a></li><li><a href="/projektowanie-boisk/">Projektowanie boisk</a></li><li><a href="/realizacje-gamefields/">Realizacje</a></li><li><a href="/dla-miast/"><span>Dla</span>miast i gmin</a></li><li><a href="/boiska-dla-szkol/"><span>Dla</span>szkół</a></li></ul>
</div></section>

<section class="gfa-cta"><div class="w">
  <h2 class="d">Masz stare boisko<br>do odnowienia?</h2>
  <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Wyślij zdjęcia boiska →</a><a class="gfa-btn alt" href="/studio/">Zaprojektuj wzór ↗</a></div>
</div></section>
"""

ld = {"@context": "https://schema.org", "@graph": [
    {"@type": "Service", "@id": URL + "#usluga", "name": "Renowacja boisk sportowych", "serviceType": "Renowacja i malowanie boisk", "url": URL, "inLanguage": "pl-PL",
     "areaServed": {"@type": "Country", "name": "Polska"}, "provider": {"@id": SITE + "#studio"},
     "description": "Renowacja boisk betonowych i asfaltowych: ocena placu, naprawa i grunt, elastyczne farby sportowe z granulatem gumowym, nowe nawierzchnie, wzór i linie.",
     "offers": {"@type": "Offer", "priceCurrency": "PLN", "priceSpecification": {"@type": "UnitPriceSpecification", "price": PAINT_MIN, "priceCurrency": "PLN", "unitText": "m²", "valueAddedTaxIncluded": False}}},
    {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Gamefields", "item": SITE},
                                                    {"@type": "ListItem", "position": 2, "name": "Renowacja boisk", "item": URL}]},
    {"@type": "FAQPage", "@id": URL + "#pytania", "inLanguage": "pl-PL",
     "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]}]}

write(HERE, "renowacja-boisk", CSS, ld, body, CALC_JS)
