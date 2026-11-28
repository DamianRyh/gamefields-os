#!/usr/bin/env python3
"""Sales pages for the nine sport surfaces (28.11.2026), one per sport, same look as the service pages (.gfb).

Owner (28.11.2026): each sport gets its own page and a sales system; Gamefields builds the surface only (base,
finish or a painted Gamefields pattern, lines), no equipment.
Output: <slug>.html (one wp:html block = the whole page content) for nine new pages, see PAGES.

Every page: hero with the product shot and numbers, three looks (renders from homepage/sporty-2026-11, media library
2026/11), a quote calculator (base yes/no, painted pattern or the sport's finish in its variants, own size) with the
same rules as the Studio (area +10%, each item rounded up to 100 zł) that sends the quote to /kontakt/?produkt=
(the theme puts it into the message) or opens the Studio with the same surface, a plan with dimensions and a
"does it fit" check, scope (included / not included), four steps, who it is for, questions with FAQPage data and
the other sports. Sizes, colours and sources: studio/canvas-editor/public/sport-surfaces/catalog.json.
Prices: offer/concrete-base.json and offer/surface-finish.json. Nothing else is claimed.
"""
import html
import json
import math
import pathlib
import sys
from urllib.parse import quote

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from gfb_common import BASE, FIN, GFB_CSS, SITE, UP, write  # noqa: E402

STUDIO = HERE.parents[2] / "studio"
CAT = {s["id"]: s for s in json.loads((STUDIO / "canvas-editor" / "public" / "sport-surfaces" / "catalog.json").read_text(encoding="utf-8"))["items"]}
LOOKS = json.loads((HERE.parents[1] / "homepage" / "sporty-2026-11" / "renders" / "looks.json").read_text(encoding="utf-8"))
IMG = UP + "2026/11/"
RATE = BASE["rateNetPerM2"]
PAINT = {v["id"]: v for v in FIN["variants"]}
TIER = ["Standard", "Standard+", "Premium"]

# slug, H1, short name, genitive for "pod …", who, card background, intro
PAGES = {
    "basketball-3x3": ("boisko-do-koszykowki-3x3", "Boisko do koszykówki 3×3", "Koszykówka 3×3", "koszykówkę 3×3",
                       ["osiedla", "szkoły", "parki"], "Najpopularniejszy format miejskiej koszykówki: jeden kosz, pół boiska, gra 3 na 3."),
    "padel": ("kort-do-padla", "Kort do padla", "Padel", "padel",
              ["kluby", "hotele", "osiedla"], "Pole 20 × 10 m na sztucznej trawie z liniami padla. Szklaną obudowę projektuje się osobno."),
    "pickleball": ("boisko-do-pickleballa", "Boisko do pickleballa", "Pickleball", "pickleball",
                   ["osiedla", "seniorzy", "kluby"], "Mały kort, szybka nauka, gra dla każdego wieku. Mieści się tam, gdzie tenis się nie zmieści."),
    "teqball": ("boisko-do-teqballa", "Boisko do teqballa", "Teqball", "teqball",
                ["parki", "kluby", "eventy"], "Strefa gry 16 × 12 m wokół stołu: piłka nożna w nowym formacie."),
    "volleyball": ("boisko-do-siatkowki", "Boisko do siatkówki", "Siatkówka", "siatkówkę",
                   ["szkoły", "parki", "plaże miejskie"], "Pole 18 × 9 m z wolną strefą 3 m wokół: siatkówka na twardej nawierzchni."),
    "tennis": ("kort-tenisowy", "Kort tenisowy", "Tenis", "tenis",
               ["kluby", "szkoły", "gminy"], "Kort deblowy z wybiegami według zalecanego układu, na akrylu albo we wzorze Gamefields."),
    "basketball-full": ("boisko-do-koszykowki", "Boisko do koszykówki", "Koszykówka", "koszykówkę",
                        ["szkoły", "gminy", "kluby"], "Pełne boisko 28 × 15 m z liniami do koszykówki i miejscem na wybiegi."),
    "futsal": ("boisko-do-futsalu", "Boisko do futsalu", "Futsal", "futsal",
               ["szkoły", "gminy", "Orliki"], "Pole 40 × 20 m: halowa piłka nożna na zewnątrz albo modernizacja istniejącego boiska."),
    "street-football-3x3": ("boisko-do-pilki-3x3", "Boisko do piłki 3×3", "Piłka 3×3", "piłkę 3×3",
                            ["osiedla", "eventy", "marki"], "Format Gamefields 15 × 10 m do szybkiej gry 3 na 3. Areny z bandami znajdziesz w osobnej ofercie."),
}
DO = {"basketball-3x3": "do koszykówki 3×3", "padel": "do padla", "pickleball": "do pickleballa", "teqball": "do teqballa", "volleyball": "do siatkówki",
      "tennis": "do tenisa", "basketball-full": "do koszykówki", "futsal": "do futsalu", "street-football-3x3": "do piłki 3×3"}
ORDER = ["basketball-3x3", "padel", "pickleball", "teqball", "volleyball", "tennis", "basketball-full", "futsal", "street-football-3x3"]


def up100(x):
    return math.ceil(round(x * 100) / 10000) * 100


def zl(n):
    return f"{n:,}".replace(",", " ") + " zł"


def num(x):
    return f"{x:.2f}".rstrip("0").rstrip(".").replace(".", ",")


def finish_options(s):
    """(id, label, note, rate) for the calculator; turf for padel, painted patterns + acrylic for the others."""
    if s["material"].startswith("Sztuczna trawa"):
        return [(f"turf-{i}", f"Sztuczna trawa {TIER[i]}", "trawa syntetyczna, montaż na betonie, zasyp, linie", v["netPerM2"]) for i, v in enumerate(FIN["turf"]["variants"])]
    out = [("pattern", "Wzór Gamefields", "malowanie 4–6 kolorów, plan malowania dla wykonawcy", PAINT["pattern"]["netPerM2"]),
           ("pattern-advanced", "Wzór zaawansowany", "7 i więcej kolorów, murale, gradienty", PAINT["pattern-advanced"]["netPerM2"])]
    out += [(f"acrylic-{i}", f"Akryl {TIER[i]} (jednolity kolor)", v.get("description", "nawierzchnia akrylowa Hard Court"), v["netPerM2"]) for i, v in enumerate(FIN["acrylic"]["variants"])]
    return out


# ---------------------------------------------------------------- court lines (port of homepage/sporty-2026-11/sport-lines.js)
def lines(s):
    L, W, o = s["fieldLength"], s["fieldWidth"], []
    f = lambda v: f"{round(v, 3):g}"
    ln = lambda a, b, c, d: o.append(f"M{f(a)} {f(b)}L{f(c)} {f(d)}")
    def circ(cx, cy, r):
        o.append(f"M{f(cx - r)} {f(cy)}a{f(r)} {f(r)} 0 1 0 {f(2 * r)} 0a{f(r)} {f(r)} 0 1 0 {f(-2 * r)} 0")
    def rect(x, y, w, h):
        o.append(f"M{f(x)} {f(y)}h{f(w)}v{f(h)}h{f(-w)}Z")
    def mirror(fn):
        fn(lambda x: x, lambda y: y)
        fn(lambda x: L - x, lambda y: W - y)
    rect(0.04, 0.04, L - 0.08, W - 0.08)
    i = s["id"]
    if i == "teqball":
        ln(L / 2, 0, L / 2, W); ln(L / 2 - 3.5, 0, L / 2 - 3.5, W); ln(L / 2 + 3.5, 0, L / 2 + 3.5, W)
    if i == "tennis":
        ln(L / 2, 0, L / 2, W); ln(0, 1.37, L, 1.37); ln(0, W - 1.37, L, W - 1.37); ln(L / 2 - 6.4, 1.37, L / 2 - 6.4, W - 1.37); ln(L / 2 + 6.4, 1.37, L / 2 + 6.4, W - 1.37); ln(L / 2 - 6.4, W / 2, L / 2 + 6.4, W / 2)
    if i == "padel":
        ln(10, 0, 10, W); ln(3.05, 0, 3.05, W); ln(16.95, 0, 16.95, W); ln(3.05, 5, 16.95, 5)
    if i == "volleyball":
        ln(9, 0, 9, W); ln(6, 0, 6, W); ln(12, 0, 12, W)
    if i == "pickleball":
        k = 2.1336
        ln(L / 2, 0, L / 2, W); ln(L / 2 - k, 0, L / 2 - k, W); ln(L / 2 + k, 0, L / 2 + k, W); ln(0, W / 2, L / 2 - k, W / 2); ln(L / 2 + k, W / 2, L, W / 2)
    if i == "basketball-full":
        ln(L / 2, 0, L / 2, W); circ(L / 2, W / 2, 1.8)
        def half(X, Y):
            o.append(f"M{f(X(0))} {f(Y(W / 2 - 2.45))}L{f(X(5.8))} {f(Y(W / 2 - 2.45))}L{f(X(5.8))} {f(Y(W / 2 + 2.45))}L{f(X(0))} {f(Y(W / 2 + 2.45))}")
            o.append(f"M{f(X(5.8))} {f(Y(W / 2 - 1.8))}A1.8 1.8 0 0 1 {f(X(5.8))} {f(Y(W / 2 + 1.8))}")
            o.append(f"M{f(X(0))} {f(Y(0.9))}L{f(X(2.99))} {f(Y(0.9))}A6.75 6.75 0 0 1 {f(X(2.99))} {f(Y(W - 0.9))}L{f(X(0))} {f(Y(W - 0.9))}")
            circ(X(1.575), W / 2, 0.225)
        mirror(half)
    if i == "basketball-3x3":
        rect(L / 2 - 2.45, 0, 4.9, 5.8)
        o.append(f"M{f(L / 2 - 1.8)} 5.8A1.8 1.8 0 0 0 {f(L / 2 + 1.8)} 5.8")
        o.append(f"M0.9 0V2.99A6.75 6.75 0 0 0 {f(L - 0.9)} 2.99V0")
        circ(L / 2, 1.575, 0.225)
    if i in ("street-football-3x3", "futsal"):
        ln(L / 2, 0, L / 2, W); circ(L / 2, W / 2, 3 if i == "futsal" else 1.5)
        def goal(X, Y):
            if i == "futsal":
                o.append(f"M{f(X(0))} {f(Y(W / 2 - 7.5))}A6 6 0 0 1 {f(X(6))} {f(Y(W / 2 - 1.5))}L{f(X(6))} {f(Y(W / 2 + 1.5))}A6 6 0 0 1 {f(X(0))} {f(Y(W / 2 + 7.5))}")
            else:
                o.append(f"M{f(X(0))} {f(Y(W / 2 - 2))}L{f(X(2.5))} {f(Y(W / 2 - 2))}L{f(X(2.5))} {f(Y(W / 2 + 2))}L{f(X(0))} {f(Y(W / 2 + 2))}")
        mirror(goal)
    return "".join(o)


def plan_svg(s):
    """Plan with dimensions: surface with run-offs, field, lines, two dimension lines each."""
    L, W, fl, fw = s["length"], s["width"], s["fieldLength"], s["fieldWidth"]
    fx = (L - fl) / 2
    fy = s.get("fieldOffsetY", (W - fw) / 2)
    pad = max(L, W) * 0.12
    u = max(L, W) / 100
    vb = f"{-pad:g} {-pad:g} {L + 2 * pad:g} {W + 2 * pad:g}"
    t = lambda x, y, txt, anchor="middle", rot="": f'<text x="{x:g}" y="{y:g}" text-anchor="{anchor}" font-size="{u * 2.6:g}" font-weight="700" fill="#47132D"{rot}>{txt}</text>'
    dim = (f'<g stroke="#6336F5" stroke-width="{u * 0.25:g}"><path d="M0 {-pad * 0.45:g}H{L:g}M0 {-pad * 0.6:g}V{-pad * 0.3:g}M{L:g} {-pad * 0.6:g}V{-pad * 0.3:g}"/>'
           f'<path d="M{L + pad * 0.45:g} 0V{W:g}M{L + pad * 0.3:g} 0H{L + pad * 0.6:g}M{L + pad * 0.3:g} {W:g}H{L + pad * 0.6:g}"/></g>'
           + t(L / 2, -pad * 0.6, f"nawierzchnia {num(L)} m")
           + f'<text x="{L + pad * 0.62:g}" y="{W / 2:g}" text-anchor="middle" font-size="{u * 2.6:g}" font-weight="700" fill="#47132D" transform="rotate(90 {L + pad * 0.62:g} {W / 2:g})">{num(W)} m</text>'
           + t(fx + fl / 2, W + pad * 0.55, f"pole gry {num(fl)} × {num(fw)} m"))
    return (f'<svg viewBox="{vb}" role="img" aria-label="Plan: nawierzchnia {num(L)} × {num(W)} m, pole {num(fl)} × {num(fw)} m" xmlns="http://www.w3.org/2000/svg">'
            f'<rect width="{L:g}" height="{W:g}" fill="{s["zone"]}" rx="{u * 0.6:g}"/><rect x="{fx:g}" y="{fy:g}" width="{fl:g}" height="{fw:g}" fill="{s["base"]}"/>'
            f'<path d="{lines(s)}" transform="translate({fx:g} {fy:g})" fill="none" stroke="#fff" stroke-width="{max(0.06, L / 260):g}"/>{dim}</svg>')


EXTRA = """
.gsp2-hero figure{margin:0;border-radius:22px;background:var(--card);display:grid;place-items:center;padding:clamp(12px,2vw,28px);min-height:clamp(280px,32vw,460px)}
.gsp2-hero figure img{width:100%;height:auto;max-height:430px;object-fit:contain;filter:drop-shadow(0 26px 34px rgba(28,9,18,.18))}
.gsp2-looks{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.gsp2-looks a{display:grid;height:100%;border-radius:18px;overflow:hidden;text-decoration:none;background:var(--c);color:#1C0912;transition:transform .25s ease}
.gsp2-looks a:hover{transform:translateY(-3px)}
.gsp2-looks img{display:block;width:100%;aspect-ratio:16/10;object-fit:contain;padding:12px}
.gsp2-looks .tx{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:0 18px 16px;font-weight:700}
.gsp2-looks .tx span{font-size:13px;font-weight:800;color:#6336F5}
.gsp2-plan{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:12px;align-items:stretch}
.gsp2-plan figure{margin:0;padding:clamp(14px,2vw,24px);background:#fff;border:1px solid var(--line)}
.gsp2-plan svg{display:block;width:100%;height:auto}
.gsp2-fit{display:flex;flex-direction:column;gap:14px;padding:clamp(20px,2.4vw,32px);background:#fff;border:1px solid var(--line)}
.gsp2-fit .row{display:flex;gap:8px;align-items:center}
.gsp2-fit input{width:110px;min-height:52px;padding:0 14px;border:1.5px solid #CDBFC6;border-radius:10px;font:inherit;font-size:16px}
.gsp2-fit output{display:block;padding:14px 16px;border-radius:10px;background:var(--paper);font-weight:700;min-height:52px}
.gsp2-fit output.ok{background:#E9F7C9}.gsp2-fit output.no{background:#FFE1D6}
.gsp2-others{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.gsp2-others a{display:grid;border-radius:16px;overflow:hidden;text-decoration:none;background:var(--c);color:#1C0912;transition:transform .25s ease}
.gsp2-others a:hover{transform:translateY(-3px)}
.gsp2-others img{display:block;width:100%;aspect-ratio:16/10;object-fit:contain;padding:8px}
.gsp2-others b{padding:0 14px 4px;font-size:18px;letter-spacing:-.02em}.gsp2-others small{padding:0 14px 14px;font-size:13px;font-weight:600}
.gsp2-own{display:flex;gap:8px;margin-top:10px}.gsp2-own[hidden]{display:none}
.gsp2-bar{display:none}
@media (max-width:900px){.gsp2-looks,.gsp2-plan{grid-template-columns:minmax(0,1fr)}.gsp2-others{grid-template-columns:repeat(2,minmax(0,1fr))}
 .gsp2-bar{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:60;gap:8px;padding:10px 12px calc(10px + env(safe-area-inset-bottom));background:rgba(244,241,238,.96);box-shadow:0 -4px 18px rgba(71,19,45,.14)}
 .gsp2-bar a{flex:1;display:flex;align-items:center;justify-content:center;min-height:48px;border-radius:999px;font-weight:800;font-size:15px;text-decoration:none;background:var(--violet);color:#fff!important}
 .gsp2-bar a.alt{background:#fff;color:var(--ink)!important;border:1.5px solid var(--ink)}
 .gfa{padding-bottom:72px}}
"""

# The calculator script: no "&&" (WordPress turns it into entities); conditions are nested.
CALC_JS = """<script>
(function(){
var root=document.querySelector('[data-gsp2]');if(!root)return;
var D=JSON.parse(root.getAttribute('data-gsp2'));
var f=root.querySelector('[data-calc]'),out=root.querySelector('[data-out]');
function up(x){return Math.ceil(Math.round(x*100)/10000)*100}
function zl(n){return String(n).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'\\u00a0')+'\\u00a0zł'}
function m(n){return String(Math.round(n*100)/100).replace('.',',')}
function val(name){var c=f.querySelector('input[name='+name+']:checked');return c?c.value:''}
function calc(){
 var own=val('size')==='own',L=D.L,W=D.W;
 f.querySelector('[data-own]').hidden=!own;
 if(own){var a=parseFloat(String(f.querySelector('[name=ol]').value).replace(',','.')),b=parseFloat(String(f.querySelector('[name=ow]').value).replace(',','.'));if(a>0){if(b>0){L=Math.max(a,b);W=Math.min(a,b)}}}
 var area=Math.round(L*W*1.1*10)/10,base=val('base')==='yes'?up(area*D.rate):0,opt=D.opts[val('finish')],fin=up(area*opt.r),sum=base+fin;
 out.querySelector('[data-sum]').textContent=zl(sum);
 out.querySelector('[data-gross]').textContent='brutto '+zl(Math.round(sum*1.23))+' · '+m(area)+' m² z zapasem 10%';
 out.querySelector('[data-b]').textContent=base?zl(base):'—';
 out.querySelector('[data-f]').textContent=zl(fin);out.querySelector('[data-fl]').textContent=opt.n;
 var warn=out.querySelector('[data-warn]'),small=L+0.001<D.fl?true:(W+0.001<D.fw);warn.hidden=!small;
 var txt=D.name+': '+m(L)+' × '+m(W)+' m, '+opt.n+(base?', z płytą betonową':', na istniejącym podłożu')+', wycena od '+zl(sum)+' netto (strona '+D.slug+')';
 out.querySelector('[data-send]').href='/kontakt/?produkt='+encodeURIComponent(txt);
}
f.addEventListener('input',calc);f.addEventListener('change',calc);calc();
var fit=root.querySelector('[data-fit]');
if(fit){var o=fit.querySelector('output');fit.addEventListener('input',function(){
 var a=parseFloat(String(fit.querySelector('[name=pl]').value).replace(',','.')),b=parseFloat(String(fit.querySelector('[name=pw]').value).replace(',','.'));
 if(a>0){if(b>0){var L=Math.max(a,b),W=Math.min(a,b),ok=D.L<=L+0.001?D.W<=W+0.001:false,okf=D.fl<=L+0.001?D.fw<=W+0.001:false;
  o.className=ok?'ok':'no';o.textContent=ok?'Mieści się z wybiegami ('+m(D.L)+' × '+m(D.W)+' m).':(okf?'Pole gry się mieści, ale bez pełnych wybiegów ('+m(D.L)+' × '+m(D.W)+' m). Porozmawiajmy o układzie.':'Za mało miejsca: potrzeba '+m(D.L)+' × '+m(D.W)+' m z wybiegami.');return}}
 o.className='';o.textContent='Wpisz wymiary placu.';});}
})();
</script>"""


def page(sid):
    s = CAT[sid]
    slug, h1, short, pod, who, intro = PAGES[sid]
    looks = LOOKS[sid]
    turf = s["material"].startswith("Sztuczna trawa")
    area = round(s["length"] * s["width"] * 1.1, 1)
    opts = finish_options(s)
    base = up100(area * RATE)
    from_price = base + min(up100(area * o[3]) for o in opts)
    painted = None if turf else base + up100(area * PAINT["pattern"]["netPerM2"])
    plain = base + up100(area * (FIN["turf"] if turf else FIN["acrylic"])["variants"][0]["netPerM2"])
    hero_img = IMG + looks[0]["file"]
    card = "#E9EFE6" if turf else "#F2E7D6"

    look_cards = "".join(
        f'<li><a href="/studio/?surface={sid}' + ("" if "turf" in lk else f'&amp;pattern={lk["familyId"]}&amp;variant={lk["variant"]}&amp;palette={lk["paletteId"]}') + f'" style="--c:{"#EDE9E3"}">'
        f'<img src="{IMG}{lk["file"]}" alt="{html.escape(h1)}: {html.escape(lk["name"])}" width="1600" height="1000" loading="lazy" decoding="async">'
        f'<span class="tx">{html.escape(lk["name"])}<span>Otwórz w Studio ↗</span></span></a></li>' for lk in looks)

    radio = lambda name, val, label, note, checked: (f'<label><input type="radio" name="{name}" value="{val}"{" checked" if checked else ""}>'
                                                     f'<span>{label}<small>{note}</small></span></label>')
    fin_radios = "".join(radio("finish", o[0], f"{o[1]} · {o[3]} zł/m²", html.escape(o[2]), i == 0) for i, o in enumerate(opts))
    data = {"name": h1, "slug": "/" + slug + "/", "L": s["length"], "W": s["width"], "fl": s["fieldLength"], "fw": s["fieldWidth"], "rate": RATE,
            "opts": {o[0]: {"n": o[1], "r": o[3]} for o in opts}}
    calc = f"""<div class="gfb-calc">
  <form data-calc onsubmit="return false">
    <fieldset><legend>Wykończenie</legend><div class="gfb-tog">{fin_radios}</div></fieldset>
    <fieldset><legend>Podłoże</legend><div class="gfb-tog">{radio("base", "yes", f"Nowa płyta betonowa 12 cm z podbudową · {RATE} zł/m²", "korytowanie, podbudowa, płyta ze spadkami i dylatacjami", True)}{radio("base", "no", "Mam stabilny beton lub asfalt", "wykończenie na istniejącym placu; naprawy wyceniam po oględzinach", False)}</div></fieldset>
    <fieldset><legend>Wymiary</legend><div class="gfb-tog">{radio("size", "std", f"Wymiar dyscypliny z wybiegami: {num(s['length'])} × {num(s['width'])} m", "jak w Studio 3D", True)}{radio("size", "own", "Własne wymiary placu", "wpisz długość i szerokość w metrach", False)}</div>
      <div class="gfb-area gsp2-own" data-own hidden><input type="number" name="ol" min="1" step="0.1" placeholder="długość" aria-label="Długość w metrach"><input type="number" name="ow" min="1" step="0.1" placeholder="szerokość" aria-label="Szerokość w metrach"></div></fieldset>
  </form>
  <div class="gfb-out" data-out>
    <p class="k">Twoja wycena orientacyjna</p>
    <p class="sum"><span data-sum>{zl(from_price)}</span><small data-gross></small></p>
    <dl><div><dt>Płyta betonowa z podbudową</dt><dd data-b></dd></div><div><dt data-fl>Wykończenie</dt><dd data-f></dd></div><div><dt>Linie {DO[sid]}</dt><dd>w cenie</dd></div></dl>
    <p data-warn hidden>Wymiary są mniejsze niż pole gry tej dyscypliny. Pomogę dobrać układ albo inną grę.</p>
    <p>Ceny netto „od”, jak w Studio 3D. Montaż, transport i przygotowanie terenu potwierdzam po zdjęciach placu.</p>
    <div class="gfa-btns"><a class="gfa-btn" data-send href="/kontakt/">Wyślij zapytanie z tą wyceną →</a><a class="gfa-btn alt" href="/studio/?surface={sid}">Zaprojektuj w Studio ↗</a></div>
  </div>
</div>"""

    incl = ["Płyta betonowa 12 cm z podbudową (albo wykończenie na Twoim stabilnym placu)"] + ([
        "Sztuczna trawa z montażem na betonie, zasyp i szczotkowanie"] if turf else ["Malowanie pola we wzorze Gamefields albo akryl Hard Court", "Plan malowania dla wykonawcy: warstwy, kolory, m²"]) + [
        f"Linie {DO[sid]} w wymiarach dyscypliny", "Karty techniczne i dokumenty producentów do oferty i wniosku", "12 miesięcy gwarancji i opieka po odbiorze"]
    excl = ["Wyposażenie: kosze, słupki, siatki, stoły, bramki, obudowy" + (" (obudowa padla to osobny projekt)" if sid == "padel" else ""),
            "Ogrodzenie, piłkochwyty i oświetlenie", "Skomplikowany drenaż lub wymiana gruntu głębiej niż 30 cm", "Naprawy istniejącego podłoża: wycena po oględzinach"]
    steps = [("Zdjęcia i wymiary placu", "Wyślij zdjęcia i lokalizację. Sprawdzę podłoże, spadki i dojazd."),
             ("Projekt w Studio 3D", f"Wybierasz {'kolor trawy' if turf else 'wzór i kolory'} boiska {DO[sid]}, cena liczy się na bieżąco."),
             ("Wycena i dokumenty", "Oferta z kartami technicznymi; dla gmin i szkół materiały do wniosku."),
             ("Realizacja i odbiór", "Płyta, nawierzchnia, linie, odbiór i 12 miesięcy gwarancji.")]
    faq = [
        (f"Ile kosztuje nawierzchnia pod {pod}?", f"Od {zl(from_price)} netto za {num(area)} m² (nawierzchnia {num(s['length'])} × {num(s['width'])} m z zapasem 10%), razem z płytą betonową z podbudową. "
         + (f"Ze wzorem Gamefields od {zl(painted)} netto, w jednolitym akrylu od {zl(plain)} netto." if painted else f"Sztuczna trawa od {zl(plain)} netto.") + " Montaż, transport i przygotowanie terenu potwierdzam po zdjęciach placu."),
        ("Jakie wymiary przyjmujecie?", s["dimensionNote"].split(". Model")[0].rstrip(".") + "."),
        ("Czy da się zrobić to na starym betonie albo asfalcie?", "Tak, jeśli podłoże jest stabilne. Naprawiam rysy i ubytki, a wykończenie kładę na istniejącym placu, bez nowej płyty. Zakres napraw wyceniam po oględzinach."),
        ("Czy dostarczacie wyposażenie?", "Nie. Robię podłoże: płytę, nawierzchnię albo malowany wzór i linie. Kosze, siatki, stoły czy obudowy dobiera i montuje dostawca wyposażenia; zostawiam pod nie przygotowane miejsce w projekcie."),
        ("Czy na jednym placu można mieć kilka gier?", "Tak. Linie kilku dyscyplin w różnych kolorach na jednej płycie to częsty układ dla szkół i osiedli. Kolory dobieram tak, żeby każda gra była czytelna."),
        ("Ile kosztuje wzór zamiast jednolitego koloru?" if not turf else "Czy na trawie można zrobić wzór?",
         (f"Malowany wzór Gamefields (4–6 kolorów) to {PAINT['pattern']['netPerM2']} zł/m² netto, zaawansowany (7+ kolorów) {PAINT['pattern-advanced']['netPerM2']} zł/m²; akryl jednolity od {FIN['acrylic']['variants'][0]['netPerM2']} zł/m². Do wzoru dostajesz plan malowania dla wykonawcy." if not turf
          else "Kort do padla robię na sztucznej trawie: kolor trawy do wyboru, bez malowanego wzoru. Wzory Gamefields są dostępne na nawierzchniach malowanych i akrylowych.")),
    ]
    others = "".join(
        f'<li><a href="/{PAGES[o][0]}/" style="--c:#EDE9E3"><img src="{IMG}{LOOKS[o][0]["file"]}" alt="" width="1600" height="1000" loading="lazy" decoding="async"><b>{html.escape(PAGES[o][1])}</b>'
        f'<small>{num(CAT[o]["length"])} × {num(CAT[o]["width"])} m</small></a></li>' for o in ORDER if o != sid)

    body = f"""
<div data-gsp2="{html.escape(json.dumps(data, ensure_ascii=False))}">
<section class="gfb-hero gsp2-hero"><div class="w top">
  <div>
    <p class="gfb-crumbs"><a href="/nawierzchnie-sportowe/">Nawierzchnie sportowe</a> / {html.escape(short)}</p>
    <p class="k">Nawierzchnia sportowa · {html.escape(short)}</p>
    <h1 class="d">{html.escape(h1)}.</h1>
    <p class="lead">{html.escape(intro)} Płyta, {"sztuczna trawa" if turf else "nawierzchnia albo malowany wzór Gamefields"} i linie w wymiarach dyscypliny, z ceną od razu.</p>
    <div class="gfa-btns"><a class="gfa-btn" href="#wycena">Policz wycenę ↓</a><a class="gfa-btn alt" href="/studio/?surface={sid}">Zaprojektuj w Studio ↗</a></div>
  </div>
  <figure style="--card:{card}"><img src="{hero_img}" alt="{html.escape(h1)}: {html.escape(looks[0]['name'])}" width="1600" height="1000" loading="eager" decoding="async"></figure>
</div>
<div class="w"><dl class="gfb-nums">
  <div><dt>Pole gry</dt><dd>{num(s['fieldLength'])} × {num(s['fieldWidth'])} m<small>wymiar dyscypliny</small></dd></div>
  <div><dt>Nawierzchnia</dt><dd>{num(s['length'])} × {num(s['width'])} m<small>z wybiegami</small></dd></div>
  <div><dt>{"Ze wzorem od" if painted else "Z trawą od"}</dt><dd>{zl(painted or plain)}<small>netto, z płytą betonową</small></dd></div>
  <div><dt>Gwarancja</dt><dd>12 mies.<small>i opieka po odbiorze</small></dd></div>
</dl></div></section>

<nav class="gfb-jump" aria-label="Na tej stronie"><div class="w"><ul><li><a href="#wyglad">Wygląd</a></li><li><a href="#wycena">Wycena</a></li><li><a href="#wymiary">Wymiary</a></li><li><a href="#zakres">Zakres</a></li><li><a href="#proces">Jak to działa</a></li><li><a href="#pytania">Pytania</a></li></ul></div></nav>

<section class="gfa-sec" id="wyglad"><div class="w">
  <div class="gfa-head"><h2 class="d">{"Trzy kolory trawy." if turf else "Twój wzór na polu gry."}</h2><p>{"Kort do padla na sztucznej trawie w kolorze do wyboru. Linie białe, czytelne z każdej strony siatki." if turf else "Trzy przykłady z kolekcji Gamefields. W Studio 3D zmienisz wzór, kompozycję i kolory, a cena policzy się sama. Ponad 1000 wzorów w kolekcji."}</p></div>
  <ul class="gsp2-looks" role="list">{look_cards}</ul>
  <ul class="gfa-links"><li><a href="/wzory-na-boisko/">Wszystkie wzory na boisko →</a></li></ul>
</div></section>

<section class="gfa-sec" id="wycena"><div class="w">
  <div class="gfa-head"><h2 class="d">Wycena w 30 sekund.</h2><p>Wybierz wykończenie i podłoże. Wynik możesz od razu wysłać w zapytaniu: dostanę wymiary, wariant i kwotę.</p></div>
  {calc}
</div></section>

<section class="gfa-sec" id="wymiary"><div class="w">
  <div class="gfa-head"><h2 class="d">Wymiary i miejsce.</h2><p>{html.escape(s['dimensionNote'].split('. Model')[0].rstrip('.'))}.</p></div>
  <div class="gsp2-plan"><figure>{plan_svg(s)}</figure>
    <div class="gsp2-fit" data-fit><p class="k">Zmieści się?</p><p style="margin:0;color:var(--muted)">Wpisz wymiary swojego placu.</p>
      <div class="row"><input type="number" name="pl" min="1" step="0.1" placeholder="dł. m" aria-label="Długość placu w metrach"><span>×</span><input type="number" name="pw" min="1" step="0.1" placeholder="szer. m" aria-label="Szerokość placu w metrach"></div>
      <output aria-live="polite">Wpisz wymiary placu.</output>
      <p style="margin:0;font-size:14px;color:var(--muted)">Za mało miejsca? Sprawdź <a href="/boisko-do-pickleballa/">pickleball</a>, <a href="/boisko-do-koszykowki-3x3/">koszykówkę 3×3</a> albo <a href="/boiska-street-football/">areny do panny</a> od Ø 5 m.</p></div>
  </div>
</div></section>

<section class="gfa-sec" id="zakres"><div class="w">
  <div class="gfa-head"><h2 class="d">Co dostajesz.</h2><p>Robię podłoże pod grę. Wyposażenie dobiera i montuje jego dostawca.</p></div>
  <div class="gfb-incl"><div><p class="k">W cenie</p><ul>{"".join(f"<li>{html.escape(x)}</li>" for x in incl)}</ul></div>
  <div><p class="k">Nie dostarczam</p><ul>{"".join(f"<li>{html.escape(x)}</li>" for x in excl)}</ul></div></div>
</div></section>

<section class="gfa-sec" id="proces"><div class="w">
  <div class="gfa-head"><h2 class="d">Jak to działa.</h2><p>Od zdjęcia placu do pierwszego meczu w czterech krokach.</p></div>
  <ol class="gfb-steps">{"".join(f"<li><b>{t}</b><p>{d}</p></li>" for t, d in steps)}</ol>
</div></section>

<section class="gfa-band"><div class="w">
  <div class="gfa-head"><div><p class="k">Dla kogo</p><h2 class="d">{html.escape(", ".join(w.capitalize() if k == 0 else w for k, w in enumerate(who)))}.</h2></div>
  <p>Gminy i szkoły dostają koncepcję, wizualizację i dokumenty do wniosku. <a href="/dofinansowanie-boisk/" style="color:var(--lime)">Dofinansowanie boisk →</a></p></div>
</div></section>

<section class="gfa-sec" id="pytania"><div class="w">
  <div class="gfa-head"><h2 class="d">Pytania.</h2><p>Najczęstsze pytania przed zamówieniem.</p></div>
  <div class="gfa-faq">{"".join(f"<details><summary>{html.escape(q)}</summary><p>{html.escape(a)}</p></details>" for q, a in faq)}</div>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><h2 class="d">Inne gry.</h2><p>Ta sama płyta, inne linie. Zobacz pozostałe nawierzchnie.</p></div>
  <ul class="gsp2-others" role="list">{others}</ul>
</div></section>

<section class="gfa-cta"><div class="w">
  <h2 class="d">Masz plac?<br>Zróbmy na nim grę.</h2>
  <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/?produkt={quote(h1)}">Wyślij zdjęcia placu →</a><a class="gfa-btn alt" href="/studio/?surface={sid}">Zaprojektuj w Studio ↗</a></div>
</div></section>
<nav class="gsp2-bar" aria-label="Szybkie akcje"><a href="#wycena">Policz wycenę</a><a class="alt" href="/studio/?surface={sid}">Studio 3D</a></nav>
</div>"""
    url = SITE + slug + "/"
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "Service", "name": f"{h1}: nawierzchnia", "serviceType": f"Nawierzchnia sportowa: {short}", "url": url, "image": hero_img, "areaServed": "PL",
         "provider": {"@type": "Organization", "name": "Gamefields", "url": SITE},
         "offers": {"@type": "Offer", "priceCurrency": "PLN", "price": from_price, "priceSpecification": {"@type": "PriceSpecification", "price": from_price, "priceCurrency": "PLN", "valueAddedTaxIncluded": False}, "url": url}},
        {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Gamefields", "item": SITE},
                                                        {"@type": "ListItem", "position": 2, "name": "Nawierzchnie sportowe", "item": SITE + "nawierzchnie-sportowe/"},
                                                        {"@type": "ListItem", "position": 3, "name": h1, "item": url}]},
        {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]}]}
    write(HERE, slug, GFB_CSS + EXTRA, ld, body, CALC_JS)
    return slug, h1, from_price


if __name__ == "__main__":
    for sid in ORDER:
        print(page(sid))
