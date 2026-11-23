#!/usr/bin/env python3
"""/nawierzchnie-sportowe/ (page 3686), rebuilt 23.11.2026 in the .gfb style shared with Budowa and Renowacja.

Output: nawierzchnie-sportowe.html (one wp:html block, the whole content of the page).

Eight surfaces from surface-finish.json and concrete-base.json: pick by use, a comparison table, every surface with
its Standard / Standard+ / Premium variants, what is included and what is extra, a cost comparison for your own
area, what lies underneath, norms, samples by post (homepage: "Próbki wyślę pocztą"), FAQ.
Uses come from the knowledge base guide "Jak wybrać nawierzchnię sportową?". The internal tile take-off in
surface-finish.json is NOT shown (owner's note: only m² for clients).
"""
import html
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from gfb_common import (BASE, FIN, GFB_CSS, MODELS, SITE, SLAB, UP, cost, img, jump_html, faq_html, variants, write, zl)  # noqa: E402

URL = SITE + "nawierzchnie-sportowe/"
PLAY_A = SLAB["o1"]["areaM2"]

# id, key (None = painting), name, macro, shop slug, best for, lies on, extra facts
S = [
    ("trawa", "turf", "Sztuczna trawa", "trawa", "sztuczna-trawa", "piłka nożna, panna, gra na co dzień", "płyta albo stabilny beton",
     ["Naturalny wybór do piłki", "Montaż na betonie: klejenie pasów, zasyp, szczotkowanie"]),
    ("epdm", "epdm", "Nawierzchnia EPDM wylewana", "granulat", "nawierzchnia-epdm", "boiska wielofunkcyjne, szkoły, kosz i siatkówka", "płyta albo stabilny beton",
     ["PN-EN 14877", "Natrysk wodoprzepuszczalny", "Trwałość od 8–12 do 12–20 lat, zależnie od wariantu"]),
    ("akryl", "acrylic", "Akryl Hard Court", "akryl", "akryl-hard-court", "szybka, twarda gra: kort, kosz", "płyta albo stabilny beton",
     ["System warstwowy jak na kortach", "Premium: warstwy gumowe 4–8 mm"]),
    ("plytki", "tiles", "Płytki sportowe PP", "plytki", "plytki-sportowe", "szybki montaż, intensywne użytkowanie", "płyta albo stabilny beton",
     ["Montaż bez klejenia, z drenażem", "Punktowa wymiana modułów", "Premium: gwarancja 5–10 lat"]),
    ("plyty", "rubber", "Płyty gumowe", "plyty-gumowe", "plyty-gumowe", "bezpieczny upadek, najmłodsi", "płyta albo stabilny beton",
     ["PN-EN 1177, atest PZH", "Antypoślizg R11, wodoprzepuszczalne", "Płyty 50 × 50 cm, 40–50 mm"]),
    ("maty", "mats", "Maty gumowe", "maty-gumowe", "maty-gumowe-nawierzchnia", "ciągła guma, strefy treningowe", "płyta albo stabilny beton",
     ["Grubość 10–20 mm", "Antypoślizg R11", "Premium z warstwą EPDM"]),
    ("malowanie", None, "Malowanie farbą sportową", "malowanie", "malowanie-farba-sportowa", "stary beton albo asfalt, kolor i wzór", "płyta, stary beton albo asfalt",
     ["Farba z granulatem gumowym: amortyzacja i antypoślizg", "Wzory Signature, 4–6 i 7+ kolorów", "Linie do piłki, kosza i 3 na 3"]),
]
KEYS = {"turf": FIN["turf"], "epdm": FIN["epdm"], "acrylic": FIN["acrylic"], "tiles": FIN["tiles"], "rubber": FIN["rubber"], "mats": FIN["mats"]}
PAINT_INCL = ["Grunt, farba sportowa i linie w każdym wariancie"]
PAINT_EXCL = FIN["excludes"]

USES = [
    ("Piłka nożna i panna", "Gra stopą, ślizgi, gra na co dzień.", ["trawa", "epdm"]),
    ("Kosz, siatkówka, wielofunkcyjne", "Równe odbicie piłki, przyczepność, linie kilku gier.", ["epdm", "akryl"]),
    ("Szybka, twarda gra", "Kort, kosz, gra 3 na 3 na twardym.", ["akryl", "plytki"]),
    ("Bezpieczny upadek", "Najmłodsi, strefy aktywności, place.", ["plyty", "maty"]),
    ("Szybki montaż", "Krótki termin, wymiana pojedynczych modułów.", ["plytki"]),
    ("Stary beton albo asfalt", "Kolor, wzór i linie bez rozbiórki.", ["malowanie", "akryl"]),
]
BY_ID = {s[0]: s for s in S}


def tiers(key):
    if key is None:
        return [(v["name"], v["netPerM2"], FIN["descriptions"].get(v["id"], "")) for v in FIN["variants"]]
    names = ["Standard", "Standard+", "Premium"]
    return [(names[i], v["netPerM2"], v.get("description", "")) for i, v in enumerate(KEYS[key]["variants"])]


def rate_range(key):
    r = [t[1] for t in tiers(key)]
    return min(r), max(r)


CSS = GFB_CSS + """
.gfb-table a.nm{display:inline;min-height:0;padding:0;border:0;border-radius:0;font-size:inherit;color:inherit;text-decoration:underline;text-decoration-color:#CDBFC6;text-underline-offset:3px}
.gfb-tex{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
.gfb-tex a{position:relative;display:block;aspect-ratio:1;overflow:hidden;background:#E6E0DA;text-decoration:none}
.gfb-tex img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .8s cubic-bezier(.2,.7,.2,1)}
.gfb-tex a:hover img{transform:scale(1.08)}
.gfb-tex span{position:absolute;left:6px;right:6px;bottom:6px;padding:5px 8px;background:rgba(28,9,18,.82);color:#fff;font-size:12px;font-weight:700;line-height:1.25}
.gfb-tex span small{display:block;font-weight:500;color:rgba(255,255,255,.8)}
/* uses */
.gfb-uses{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.gfb-uses li{display:flex;flex-direction:column;gap:8px;padding:22px;background:#fff;border:1px solid var(--line)}
.gfb-uses b{font-size:21px;letter-spacing:-.02em;line-height:1.1}
.gfb-uses p{margin:0;color:var(--muted);font-size:15px}
.gfb-uses .rec{display:flex;flex-wrap:wrap;gap:6px;margin-top:auto;padding-top:10px}
.gfb-uses .rec a{display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 14px 0 4px;border-radius:999px;background:var(--paper);border:1.5px solid transparent;text-decoration:none;font-weight:700;font-size:14px}
.gfb-uses .rec a:hover{border-color:var(--violet)}
.gfb-uses .rec img{width:32px;height:32px;border-radius:50%;object-fit:cover}
/* detail cards */
.gfb-det{display:grid;gap:12px}
.gfb-det article{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,8fr);gap:clamp(16px,2.6vw,36px);padding:clamp(18px,2.2vw,28px);background:#fff;border:1px solid var(--line);scroll-margin-top:120px}
.gfb-det .ph img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;background:#E6E0DA}
.gfb-det .ph ul{margin:12px 0 0;padding:0;list-style:none;display:flex;flex-wrap:wrap;gap:6px}
.gfb-det .ph li{display:inline-flex;align-items:center;min-height:30px;padding:0 10px;border-radius:999px;background:var(--paper);font-size:13px;font-weight:700}
.gfb-det h3{font-size:clamp(28px,2.8vw,44px);font-weight:800;letter-spacing:-.04em;line-height:1}
.gfb-det .for{margin:8px 0 0;color:var(--muted);font-size:16px}.gfb-det .for b{color:var(--ink)}
.gfb-tiers{list-style:none;margin:16px 0 0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.gfb-tiers.c4{grid-template-columns:repeat(4,minmax(0,1fr))}
.gfb-tiers li{display:flex;flex-direction:column;gap:4px;padding:14px;border:1px solid var(--line)}
.gfb-tiers .n{font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--violet)}
.gfb-tiers b{font-size:24px;font-weight:800;letter-spacing:-.03em}
.gfb-tiers b small{font-size:13px;font-weight:600;letter-spacing:0;color:var(--muted)}
.gfb-tiers p{margin:0;font-size:14px;color:#5A4652}
.gfb-tiers .ex{margin-top:auto;padding-top:6px;font-size:13px;color:var(--muted)}
.gfb-io{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:12px 0 0}
.gfb-io div{padding:12px 14px;background:var(--paper);font-size:14px;color:#5A4652}
.gfb-io p{margin:0 0 4px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--ink)}
.gfb-io ul{margin:0;padding-left:18px;display:grid;gap:2px}
.gfb-det .gfa-links{margin-top:14px}
/* compare calc */
.gfb-cmp{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,8fr);gap:12px}
.gfb-cmp form{display:grid;gap:16px;align-content:start;padding:clamp(20px,2.4vw,28px);background:#fff;border:1px solid var(--line)}
.gfb-cmp label,.gfb-cmp legend{display:block;margin:0 0 8px;font-size:13px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.gfb-cmp select,.gfb-cmp input[type=number]{width:100%;min-height:52px;padding:0 14px;border:1.5px solid #CDBFC6;border-radius:10px;background:#fff;color:var(--ink);font:inherit;font-size:16px}
.gfb-cmp fieldset{margin:0;padding:0;border:0}
.gfb-cmp .gfb-tog label{display:flex;margin:0;font-size:15px;font-weight:600;letter-spacing:0;text-transform:none;color:var(--ink)}
.gfb-bars{list-style:none;margin:0;padding:clamp(16px,2vw,24px);display:grid;gap:10px;background:var(--ink);color:var(--paper)}
.gfb-bars li{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,5fr) minmax(0,3fr);gap:12px;align-items:center;font-size:15px}
.gfb-bars .t{font-weight:700;color:inherit;text-decoration:none}
.gfb-bars .tr{position:relative;height:14px;background:rgba(244,241,238,.12);border-radius:999px}
.gfb-bars .rg{position:absolute;top:0;bottom:0;border-radius:999px;background:var(--lime)}
.gfb-bars .v{text-align:right;font-weight:800;white-space:nowrap}
.gfb-bars .v small{display:block;font-weight:500;color:rgba(244,241,238,.7);font-size:12px}
.gfb-bars .h{grid-template-columns:1fr;font-size:13px;color:rgba(244,241,238,.75)}
@media (max-width:1100px){.gfb-uses{grid-template-columns:repeat(2,minmax(0,1fr))}.gfb-tiers.c4{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:900px){.gfb-det article,.gfb-cmp{grid-template-columns:minmax(0,1fr)}.gfb-io{grid-template-columns:minmax(0,1fr)}
 .gfb-tiers,.gfb-tiers.c4{grid-template-columns:none;grid-auto-flow:column;grid-auto-columns:minmax(220px,78%);overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:6px}.gfb-tiers li{scroll-snap-align:start}
 .gfb-det .ph img{aspect-ratio:16/9}}
@media (max-width:560px){.gfb-uses{grid-template-columns:minmax(0,1fr)}.gfb-bars li{grid-template-columns:minmax(0,1fr) auto}.gfb-bars .tr{grid-column:1/-1;grid-row:2}}
"""

# ---------------------------------------------------------------- html parts
tex = "".join(f'<li><a href="#{sid}">{img("2026/11/" + mac + "-macro-300x225.webp", name + " z bliska", eager=True)}<span>{name}<small>od {rate_range(key)[0]} zł/m²</small></span></a></li>'
              for sid, key, name, mac, *_ in S) + \
    f'<li><a href="#beton">{img("2026/11/beton-macro-300x225.webp", "Płyta betonowa z bliska", eager=True)}<span>Płyta betonowa<small>{BASE["rateNetPerM2"]} zł/m²</small></span></a></li>'

uses_html = "".join(
    f'<li><b>{t}</b><p>{d}</p><span class="rec">' + "".join(
        f'<a href="#{r}">{img("2026/11/" + BY_ID[r][3] + "-macro-300x225.webp", "")}{BY_ID[r][2]}</a>' for r in recs) + "</span></li>" for t, d, recs in USES)

rows = "".join(
    f'<tr><td><b><a class="nm" href="#{sid}">{name}</a></b><br>{best}</td><td data-l="Leży na">{on}</td>'
    f'<td class="r" data-l="Za m² netto">{rate_range(key)[0]}–{rate_range(key)[1]} zł</td>'
    f'<td class="r" data-l="Panna Play, {str(PLAY_A).replace(".", ",")} m²">od {zl(cost(PLAY_A, rate_range(key)[0]))}<small>bez płyty</small></td></tr>'
    for sid, key, name, mac, slug, best, on, facts in S) + \
    (f'<tr><td><b>Płyta betonowa 12 cm z podbudową</b><br>podstawa pod każde wykończenie</td><td data-l="Leży na">grunt i podbudowa</td>'
     f'<td class="r" data-l="Za m² netto">{BASE["rateNetPerM2"]} zł</td><td class="r" data-l="Panna Play, {str(PLAY_A).replace(".", ",")} m²">{zl(SLAB["o1"]["net"])}<small>płyta</small></td></tr>')
table = ('<div class="gfb-scroll"><table class="gfb-table"><thead><tr><th>Nawierzchnia i zastosowanie</th><th>Leży na</th><th class="r">Za m² netto</th>'
         f'<th class="r">Dla Panna Play ({str(PLAY_A).replace(".", ",")} m²)</th></tr></thead><tbody>{rows}</tbody></table></div>')


def detail(sid, key, name, mac, slug, best, on, facts):
    tl = tiers(key)
    tiers_html = "".join(f'<li><span class="n">{html.escape(n)}</span><b>{r} <small>zł/m²</small></b>' + (f"<p>{html.escape(d)}</p>" if d else "") +
                         f'<span class="ex">Panna Play: {zl(cost(PLAY_A, r))}</span></li>' for n, r, d in tl)
    if key is None:
        incl, excl = PAINT_INCL, PAINT_EXCL
    else:
        incl, excl = KEYS[key].get("includes", []), KEYS[key].get("excludes", [])
    io = ""
    if incl or excl:
        io = '<div class="gfb-io">' + (f'<div><p>W cenie</p><ul>{"".join(f"<li>{html.escape(x)}</li>" for x in incl)}</ul></div>' if incl else "") + \
             (f'<div><p>Osobno</p><ul>{"".join(f"<li>{html.escape(x)}</li>" for x in excl)}</ul></div>' if excl else "") + "</div>"
    facts_html = "".join(f"<li>{html.escape(x)}</li>" for x in facts)
    return (f'<article id="{sid}"><div class="ph">{img("2026/11/" + mac + "-macro-768x576.webp", name + " z bliska")}<ul>{facts_html}</ul></div>'
            f'<div><h3>{name}</h3><p class="for">Najlepsza do: <b>{best}</b>. Leży na: <b>{on}</b>.</p>'
            f'<ul class="gfb-tiers{" c4" if len(tl) == 4 else ""}" role="list">{tiers_html}</ul>{io}'
            f'<ul class="gfa-links"><li><a href="/product/{slug}/">Warianty w sklepie →</a></li><li><a href="/studio/">Zobacz na boisku w Studio ↗</a></li></ul></div></article>')


det_html = "".join(detail(*s) for s in S) + (
    f'<article id="beton"><div class="ph">{img("2026/11/beton-macro-768x576.webp", "Płyta betonowa z bliska")}<ul><li>C20/25, 12 cm</li><li>spadki i dylatacje</li></ul></div>'
    f'<div><h3>Płyta betonowa 12 cm</h3><p class="for">Podstawa pod każde wykończenie, gdy nie ma stabilnego placu. <b>{BASE["rateNetPerM2"]} zł/m² netto</b>, dla Panna Play {zl(SLAB["o1"]["net"])}.</p>'
    '<div class="gfb-io"><div><p>W cenie</p><ul>' + "".join(f"<li>{html.escape(x)}</li>" for x in BASE["includes"]) + '</ul></div>'
    '<div><p>Osobno</p><ul>' + "".join(f"<li>{html.escape(x)}</li>" for x in BASE["excludes"]) + '</ul></div></div>'
    '<ul class="gfa-links"><li><a href="/product/plyta-betonowa/">Płyta w sklepie →</a></li><li><a href="/budowa-boisk-sportowych/">Budowa boisk →</a></li></ul></div></article>')

CMP = {"s": [{"id": sid, "n": name, "r": [t[1] for t in tiers(key)]} for sid, key, name, *_ in S], "slab": BASE["rateNetPerM2"], "max": max(max(t[1] for t in tiers(s[1])) for s in S),
       "models": [{"id": m["id"], "n": m["name"], "a": SLAB[m["id"]]["areaM2"]} for m in MODELS]}
model_opts = '<option value="">Własny metraż</option>' + "".join(f'<option value="{m["a"]}"' + (" selected" if m["id"] == "o1" else "") + f'>{html.escape(m["n"])} · {str(m["a"]).replace(".", ",")} m²</option>' for m in CMP["models"])

CMP_JS = """<script type="application/json" id="gfb-cmp-data">""" + json.dumps(CMP, ensure_ascii=False, separators=(",", ":")) + """</script>
<script>(function(){var f=document.getElementById('gfb-cmp');if(!f)return;var D=JSON.parse(document.getElementById('gfb-cmp-data').textContent);
var sel=f.querySelector('[name=model]'),area=f.querySelector('[name=area]'),slab=f.querySelector('[name=slab]'),out=document.querySelector('[data-bars]');
function fmt(n){return String(Math.round(n)).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'\\u00a0')+'\\u00a0zł'}
function up(a,r){return Math.ceil(Math.round(a*r*100)/10000)*100}
function render(){var a=Math.max(0,parseFloat(String(area.value).replace(',','.'))||0);var s=slab.checked?up(a,D.slab):0;var top=up(a,D.max)+s||1;
var rows=D.s.map(function(x){var lo=up(a,x.r[0])+s,hi=up(a,x.r[x.r.length-1])+s;return {n:x.n,id:x.id,lo:lo,hi:hi}}).sort(function(p,q){return p.lo-q.lo});
out.innerHTML='<li class="h">'+String(a).replace('.',',')+' m²'+(slab.checked?' · z płytą betonową ('+fmt(s)+')':' · na istniejącym placu')+' · netto, od Standard do Premium</li>'+rows.map(function(r){
return '<li><a class="t" href="#'+r.id+'">'+r.n+'</a><span class="tr"><span class="rg" style="left:'+(r.lo/top*100)+'%;width:'+Math.max(1.5,(r.hi-r.lo)/top*100)+'%"></span></span><span class="v">'+fmt(r.lo)+'<small>do '+fmt(r.hi)+'</small></span></li>'}).join('');}
sel.addEventListener('change',function(){if(sel.value)area.value=sel.value;render()});area.addEventListener('input',function(){sel.value='';render()});slab.addEventListener('change',render);
f.addEventListener('submit',function(e){e.preventDefault()});render();})();</script>"""

FAQ = [
    ("Jaka nawierzchnia jest najlepsza na boisko?",
     "Nie ma jednej najlepszej. Do piłki zwykle sztuczna trawa albo EPDM, do kosza, siatkówki i boisk wielofunkcyjnych EPDM albo akryl, tam gdzie liczy się bezpieczny upadek płyty lub maty gumowe, a na stary beton malowanie farbą sportową. Zaczynam od sportu, podłoża i sposobu użytkowania."),
    ("Ile kosztuje metr nawierzchni sportowej?",
     f"Od {min(rate_range(s[1])[0] for s in S)} zł/m² (malowanie) do {max(rate_range(s[1])[1] for s in S)} zł/m² (płyty gumowe Premium) netto. Płyta betonowa z podbudową, jeśli jest potrzebna, to {BASE['rateNetPerM2']} zł/m²."),
    ("Czym jest nawierzchnia syntetyczna?",
     "To grupa systemów z materiałów syntetycznych. Na boiskach najczęściej oznacza nawierzchnię poliuretanową (EPDM) albo system akrylowy; sztuczną trawę porównuje się osobno. Systemy różnią się elastycznością, wykonaniem, wymaganiami wobec podłoża i utrzymaniem."),
    ("Czy można położyć nawierzchnię na istniejącym betonie?",
     "Często tak, jeśli podłoże jest stabilne i w dobrym stanie. Wymaga to oceny i przygotowania powierzchni. Przygotowanie podłoża (frezowanie, naprawa pęknięć) wyceniam osobno, po zdjęciach."),
    ("Czy wykonujecie podbudowę?",
     f"Tak. Płyta betonowa 12 cm (C20/25) ze spadkami i dylatacjami, na geowłókninie i podbudowie z kruszywa, z siatką zbrojeniową: {BASE['rateNetPerM2']} zł/m² netto."),
    ("Czy mogę zobaczyć próbki?",
     "Tak. Próbki nawierzchni wyślę pocztą. Napisz, które nawierzchnie chcesz porównać i dokąd je wysłać."),
    ("Jak długo wytrzyma nawierzchnia?",
     "Zależy od systemu i wariantu. Dla EPDM: Standard 8–12 lat, Standard+ 10–15 lat, Premium 12–20 lat. Płytki PP Premium mają gwarancję 5–10 lat. Na całe boisko daję 12 miesięcy gwarancji i opiekę po odbiorze."),
    ("Czy nawierzchnię można zaprojektować graficznie?",
     "Tak. Kolory, strefy, wzory i linie są częścią projektu. W Studio 3D zmieniasz nawierzchnię i wzór na wybranym boisku i od razu widzisz cenę."),
]

jump = [("do-czego", "Do czego"), ("porownanie", "Porównanie"), ("koszt", "Koszt dla Ciebie"), ("szczegoly", "Warianty i ceny"), ("normy", "Normy"), ("probki", "Próbki"), ("pytania", "Pytania")]

body = f"""
<section class="gfb-hero"><div class="w top">
  <div>
    <p class="gfb-crumbs"><a href="/">Gamefields</a> / Nawierzchnie sportowe</p>
    <p class="k">Osiem nawierzchni ze Studia</p>
    <h1 class="d">Nawierzchnie sportowe.</h1>
    <p class="lead">Sztuczna trawa, EPDM, akryl, płytki, guma i farba sportowa. Dobieram nawierzchnię do gry, miejsca i budżetu, a nie odwrotnie. Każda z ceną za m², wariantami i kosztem dla Twojego boiska.</p>
    <div class="gfa-btns"><a class="gfa-btn" href="#do-czego">Dobierz nawierzchnię ↓</a><a class="gfa-btn alt" href="/kontakt/">Poproś o próbki →</a></div>
  </div>
  <ul class="gfb-tex" role="list">{tex}</ul>
</div>
<div class="w">
  <dl class="gfb-nums">
    <div><dt>Nawierzchnie</dt><dd>8<small>z wariantami Standard–Premium</small></dd></div>
    <div><dt>Najtaniej</dt><dd>od {min(rate_range(s[1])[0] for s in S)} zł/m²<small>netto, malowanie</small></dd></div>
    <div><dt>Podbudowa</dt><dd>{BASE['rateNetPerM2']} zł/m²<small>płyta betonowa 12 cm</small></dd></div>
    <div><dt>Próbki</dt><dd>pocztą<small>porównaj w dłoni</small></dd></div>
  </dl>
</div></section>

<nav class="gfb-jump" aria-label="Na tej stronie"><div class="w"><ul role="list">{jump_html(jump)}</ul></div></nav>

<section class="gfa-sec" id="do-czego"><div class="w">
  <div class="gfa-head"><div><p class="k">Do czego</p><h2 class="d">Najpierw gra, potem technologia.</h2></div><p>Wybierz, jak będzie używane boisko. Kliknij nawierzchnię, żeby zobaczyć jej warianty i ceny. <a href="/jak-wybrac-nawierzchnie-sportowa/">Poradnik →</a></p></div>
  <ul class="gfb-uses" role="list">{uses_html}</ul>
</div></section>

<section class="gfa-sec" id="porownanie"><div class="w">
  <div class="gfa-head"><div><p class="k">Porównanie</p><h2 class="d">Wszystkie w jednej tabeli.</h2></div><p>Ceny za m² netto od wariantu Standard do Premium i koszt najtańszego wariantu dla Panna Play ({str(PLAY_A).replace(".", ",")} m² z 10% zapasem).</p></div>
  {table}
</div></section>

<section class="gfa-sec" id="koszt"><div class="w">
  <div class="gfa-head"><div><p class="k">Koszt dla Ciebie</p><h2 class="d">Porównaj na swoim metrażu.</h2></div><p>Wybierz boisko albo wpisz metraż. Paski pokazują koszt każdej nawierzchni od Standard do Premium, od najtańszej.</p></div>
  <div class="gfb-cmp">
    <form id="gfb-cmp" aria-label="Porównanie kosztu nawierzchni">
      <div><label for="gfb-cmp-model">Boisko</label><select id="gfb-cmp-model" name="model">{model_opts}</select></div>
      <div><label for="gfb-cmp-area">Powierzchnia w m²</label><input id="gfb-cmp-area" name="area" type="number" min="1" step="0.1" value="{PLAY_A}" inputmode="decimal"></div>
      <fieldset><legend>Podłoże</legend><div class="gfb-tog"><label><input type="checkbox" name="slab"><span>Dolicz płytę betonową<small>gdy nie ma stabilnego placu, {BASE['rateNetPerM2']} zł/m²</small></span></label></div></fieldset>
      <p class="gfb-note">Koszt w górę do 100 zł, netto. Bez transportu i przygotowania podłoża. <a href="/studio/">Dokładnie w Studio ↗</a></p>
    </form>
    <ul class="gfb-bars" data-bars aria-live="polite" role="list"></ul>
  </div>
</div></section>

<section class="gfa-sec" id="szczegoly"><div class="w">
  <div class="gfa-head"><div><p class="k">Warianty i ceny</p><h2 class="d">Każda nawierzchnia z bliska.</h2></div><p>Trzy warianty (malowanie: cztery), co jest w cenie, a co osobno. Te same ceny co w Studio 3D i w sklepie.</p></div>
  <div class="gfb-det">{det_html}</div>
</div></section>

<section class="gfa-band" id="normy"><div class="w">
  <div class="gfa-head"><div><p class="k">Normy i dokumenty</p><h2 class="d">Na papierze też się zgadza.</h2></div><p>Karty techniczne i certyfikaty farb i nawierzchni dołączam do oferty, wniosku o dofinansowanie i dokumentacji przetargowej.</p></div>
  <dl class="gfb-docs">
    <div><dt>PN-EN 14877</dt><dd>Nawierzchnie poliuretanowe EPDM.</dd></div>
    <div><dt>PN-EN 1177</dt><dd>Płyty gumowe, z atestem PZH: bezpieczny upadek.</dd></div>
    <div><dt>R11</dt><dd>Antypoślizg: płyty i maty gumowe.</dd></div>
    <div><dt>Wodoprzepuszczalne</dt><dd>EPDM natryskowe i płyty gumowe.</dd></div>
  </dl>
  <ul class="gfa-links"><li><a href="/dofinansowanie-boisk/">Dofinansowanie boisk →</a></li><li><a href="/realizacje-dla-miast/">Realizacje dla miast →</a></li></ul>
</div></section>

<section class="gfa-sec" id="probki"><div class="w">
  <div class="gfa-head"><div><p class="k">Próbki i wycena</p><h2 class="d">Dotknij, zanim wybierzesz.</h2></div><p>Próbki nawierzchni wyślę pocztą. Do wyceny wystarczą zdjęcia miejsca i przybliżone wymiary.</p></div>
  <div class="gfb-prep">
    <div><h3>Zamów próbki</h3><ul class="gfb-check">
      <li><span>Napisz, które nawierzchnie chcesz porównać.</span></li><li><span>Podaj adres do wysyłki.</span></li><li><span>Dodaj, do czego ma służyć boisko: dobiorę warianty.</span></li></ul>
      <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Poproś o próbki →</a></div></div>
    <div><h3>Wycena nawierzchni</h3><ul class="gfb-check">
      <li><span><b>Zdjęcia podłoża</b>: całość i zbliżenia uszkodzeń.</span></li><li><span><b>Wymiary</b>: przybliżone, z miarki albo z mapy.</span></li>
      <li><span><b>Sporty</b>: główna gra i dodatkowe.</span></li><li><span><b>Lokalizacja</b> i dojazd dla sprzętu.</span></li></ul>
      <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Wyślij zdjęcia →</a><a class="gfa-btn alt" href="/studio/">Studio 3D ↗</a></div></div>
  </div>
</div></section>

<section class="gfa-sec" id="pytania"><div class="w">
  <div class="gfa-head"><div><p class="k">Pytania</p><h2 class="d">Trawa, EPDM czy farba?</h2></div><p>Najczęstsze pytania o wybór, ceny, podłoże i trwałość.</p></div>
  <div class="gfa-faq">{faq_html(FAQ)}</div>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><div><p class="k">Dalej</p><h2 class="d">Nawierzchnia to część boiska.</h2></div><p>Poradniki z cenami Gamefields i usługi, w których nawierzchnia gra główną rolę.</p></div>
  <ul class="gfb-next" role="list">
    <li><a href="/jak-wybrac-nawierzchnie-sportowa/"><i>Poradnik</i><b>Jak wybrać nawierzchnię sportową?</b><span>Systemy, kryteria i ceny.</span></a></li>
    <li><a href="/renowacja-boisk/"><i>Istniejące boisko</i><b>Renowacja boisk</b><span>Nowa warstwa albo kolor na starym placu.</span></a></li>
    <li><a href="/budowa-boisk-sportowych/"><i>Pełny zakres</i><b>Budowa boisk</b><span>Płyta, nawierzchnia, konstrukcja i odbiór.</span></a></li>
  </ul>
  <ul class="gfb-who" role="list"><li><a href="/boiska-do-pilki-noznej/">Boiska do piłki nożnej</a></li><li><a href="/boiska-do-koszykowki/">Boiska do koszykówki</a></li><li><a href="/boiska-wielofunkcyjne/">Boiska wielofunkcyjne</a></li><li><a href="/korty-tenisowe/">Korty tenisowe</a></li><li><a href="/malowanie-boisk/">Malowanie boisk</a></li><li><a href="/shop/#nawierzchnie">Nawierzchnie w sklepie</a></li></ul>
</div></section>

<section class="gfa-cta"><div class="w">
  <h2 class="d">Nie wiesz,<br>co wybrać?</h2>
  <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Pokaż mi miejsce →</a><a class="gfa-btn alt" href="/studio/">Porównaj w Studio ↗</a></div>
</div></section>
"""

ld = {"@context": "https://schema.org", "@graph": [
    {"@type": "Service", "@id": URL + "#usluga", "name": "Nawierzchnie sportowe", "serviceType": "Wykonanie nawierzchni sportowych", "url": URL, "inLanguage": "pl-PL",
     "areaServed": {"@type": "Country", "name": "Polska"}, "provider": {"@id": SITE + "#studio"},
     "description": "Sztuczna trawa, EPDM, akryl, płytki PP, płyty i maty gumowe, farba sportowa i płyta betonowa: dobór, warianty i wykonanie.",
     "hasOfferCatalog": {"@type": "OfferCatalog", "name": "Nawierzchnie Gamefields", "itemListElement": [
         {"@type": "Offer", "itemOffered": {"@type": "Product", "name": name, "url": SITE + f"product/{slug}/"},
          "priceSpecification": {"@type": "UnitPriceSpecification", "price": rate_range(key)[0], "priceCurrency": "PLN", "unitText": "m²", "valueAddedTaxIncluded": False}}
         for sid, key, name, mac, slug, *_ in S]}},
    {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Gamefields", "item": SITE},
                                                    {"@type": "ListItem", "position": 2, "name": "Nawierzchnie sportowe", "item": URL}]},
    {"@type": "FAQPage", "@id": URL + "#pytania", "inLanguage": "pl-PL",
     "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]}]}

write(HERE, "nawierzchnie-sportowe", CSS, ld, body, CMP_JS)
