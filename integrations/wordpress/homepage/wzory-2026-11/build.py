#!/usr/bin/env python3
"""Homepage (page 3462): patterns on a par with the constructions (28.11.2026).

Works on the LIVE content (the homepage in WordPress differs from the repo copy), passed as argv[1]; writes argv[2].
1. A "Wzory" block right after "Osiem boisk. Jeden system." in the same tile language: four collections
   (Wzory polskie, Murale, Kompozytor, Masters) with a court drawing from the engine, code, price per m², link.
2. Under every "Z nawierzchnią od" price a "Ze wzorem od" line: construction + concrete base + pattern painting
   (surface-finish.json 'pattern', the same tier the Studio picks for a 4–6 colour pattern). Stops if the live
   "Z nawierzchnią od" figures do not match the offer files.
3. A "Wzory" shortcut in the mobile scope bar after "8 boisk".
"""
import html
import json
import pathlib
import re
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parent
WP = HERE.parent.parent
ENGINE = WP.parent / "studio" / "surface-pro-2026-11"
load = lambda p: json.loads((WP / "offer" / p).read_text(encoding="utf-8"))
PRICE, BASE, FIN = load("price-from.json"), load("concrete-base.json"), load("surface-finish.json")
concrete = {m["id"]: m["net"] for m in BASE["models"]}
paint = {m["id"]: m["net"] for m in FIN["models"]}
PAT = {v["id"]: v["netPerM2"] for v in FIN["variants"]}
zl = lambda n: f"{n:,}".replace(",", " ") + " zł"
STUDIO_HAS_POLISH = False

raw = pathlib.Path(sys.argv[1]).read_text(encoding="utf-8")
assert "gf-blok: wzory" not in raw, "the Wzory block is already on the page"

# 2. price lines, guarded: the live 'Z nawierzchnią od' must equal construction + base + plain painting
n = 0
for m in PRICE["models"]:
    k = m["id"]
    if k not in concrete or k not in paint:
        continue
    plain = m["constructionFromNet"] + concrete[k] + paint[k]["plain"]
    patt = m["constructionFromNet"] + concrete[k] + paint[k]["pattern"]
    old = f'<p class="full">Z nawierzchnią od {zl(plain)} netto</p>'
    assert raw.count(old) == 1, f"{k}: live price differs from the offer files ({old})"
    raw = raw.replace(old, old + f'<p class="full pat"><a href="/wzory-na-boisko/">Ze wzorem od {zl(patt)} netto <span aria-hidden="true">→</span></a></p>')
    n += 1
assert n == 8, n

# 1. the Wzory block
js = r"""
import { PRO_PALETTES, renderPro, courtLines, recommendLineColor, composerMetrics } from './court-art-pro.mjs';
const pal = Object.fromEntries(PRO_PALETTES.map((p) => [p.id, p.colors]));
const slim = (s) => s.replace(/(\d+\.\d)\d+/g, '$1');
const one = (f, v, p, uid) => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice">' + slim(renderPro(f, v, 400, pal[p], { uid }) + courtLines(400, recommendLineColor(pal[p]))) + '</svg>';
process.stdout.write(JSON.stringify({
  polskie: one('pro-p-wycinanka', 3, 'simultane', 'hw1'), murale: one('pro-m-landscape', 1, 'simultane', 'hw2'),
  kompozytor: one('pro-k-echo', 4, 'swiss', 'hw3'), masters: one('pro-vega', 3, 'vasarely', 'hw4') }));
"""
svg = json.loads(subprocess.run(["node", "--input-type=module", "-e", js], cwd=ENGINE, capture_output=True, text=True, check=True).stdout)

def studio(f, v, p):
    return f"/studio/?arena=p1&amp;pattern={f}&amp;variant={v}&amp;palette={p}"

TILES = [
    ("01", "Wzory polskie", "GF-WZ-PL · 8 kierunków · 96 wzorów", svg["polskie"], "/wzory-na-boisko/#polskie" if not STUDIO_HAS_POLISH else studio("pro-p-wycinanka", 3, "simultane"), "Nowość", "s6 tall"),
    ("02", "Murale", "GF-WZ-MU · 8 kierunków · 96 wzorów", svg["murale"], studio("pro-m-landscape", 1, "simultane"), "", "s6 tall"),
    ("03", "Kompozytor", "GF-WZ-KO · 16 kierunków · 192 wzory", svg["kompozytor"], studio("pro-k-echo", 4, "swiss"), "", "s6"),
    ("04", "Masters", "GF-WZ-MA · 20 kierunków · 240 wzorów", svg["masters"], studio("pro-vega", 3, "vasarely"), "", "s6"),
]
pmin, pmax = PAT["pattern"], PAT["pattern-advanced"]
tiles = "".join(
    f'<a class="gfw-tile {lay}" href="{href}" aria-label="{html.escape(name)}, {html.escape(meta)}, od {pmin} zł/m² netto.">'
    f'<span class="gfw-art" aria-hidden="true">{art}</span>'
    + (f'<span class="gfw-new">{tag}</span>' if tag else "") +
    f'<span class="go">Zobacz →</span><span class="num d">{num}</span>'
    f'<div class="bar"><b>{html.escape(name)}<span class="pr">od {pmin} zł/m² netto<span class="gfw-x"> · z planem malowania</span></span></b><span class="m">{html.escape(meta)}</span></div></a>'
    for num, name, meta, art, href, tag, lay in TILES)

block = f"""<!-- wp:html -->
<!-- gf-blok: wzory -->
<!-- PATTERNS: on a par with the constructions (28.11.2026), same head and tile language -->
<style>
.gfw-wall{{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:12px}}
.gfw-tile{{position:relative;overflow:hidden;min-height:300px;display:block;text-decoration:none;color:#fff;background:#1C0912;transition:transform .35s cubic-bezier(.2,.7,.2,1)}}
.gfw-tile:hover{{transform:translateY(-6px)}}
.gfw-tile.s6{{grid-column:span 6}}.gfw-tile.tall{{min-height:380px}}
.gfw-art{{position:absolute;inset:0}}.gfw-art svg{{display:block;width:100%;height:100%;transition:transform .8s cubic-bezier(.2,.7,.2,1)}}
.gfw-tile:hover .gfw-art svg{{transform:scale(1.04)}}
.gfw-tile .num{{position:absolute;right:clamp(18px,2vw,30px);top:clamp(10px,1.4vw,22px);font-size:clamp(56px,6vw,104px);color:#fff;text-shadow:0 2px 18px rgba(0,0,0,.35)}}
.gfw-tile .go{{position:absolute;left:clamp(18px,2vw,30px);top:clamp(18px,1.8vw,28px);font-weight:700;font-size:15px;padding:6px 12px;border-radius:999px;background:rgba(28,9,18,.82);color:#fff}}
.gfw-new{{position:absolute;left:clamp(18px,2vw,30px);top:calc(clamp(18px,1.8vw,28px) + 42px);padding:4px 10px;border-radius:999px;background:var(--lime,#D8F24A);color:#1F2A6B;font-weight:800;font-size:12px}}
.gfw-tile .bar{{position:absolute;left:12px;right:12px;bottom:12px;display:flex;justify-content:space-between;align-items:flex-end;gap:12px;padding:12px 16px;background:rgba(28,9,18,.86);color:#fff}}
.gfw-tile .bar b{{font-size:19px;letter-spacing:-.02em}}.gfw-tile .bar .pr{{display:block;margin-top:2px;font-size:13px;font-weight:600;color:var(--lime,#D8F24A)}}
.gfw-tile .bar .m{{font-size:12px;letter-spacing:.04em;opacity:.8;text-align:right}}
.gfw-more{{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;margin-top:14px}}
.prices .full.pat{{margin-top:-4px}}.prices .full.pat a{{color:inherit;text-decoration:none}}
@media (max-width:760px){{.gfw-wall{{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px}}.gfw-tile.s6{{grid-column:span 1}}.gfw-tile,.gfw-tile.tall{{min-height:216px}}
.gfw-tile .num{{font-size:40px;right:12px;top:8px}}.gfw-tile .go{{left:10px;top:10px;font-size:12px}}.gfw-new{{left:10px;top:44px}}
.gfw-tile .bar{{flex-direction:column;align-items:flex-start;gap:0;left:8px;right:8px;bottom:8px;padding:8px 10px}}.gfw-tile .bar b{{font-size:14px}}.gfw-tile .bar .m,.gfw-x{{display:none}}}}
</style>
<section id="wzory" class="wrap sec" aria-labelledby="gfs-wzory">
  <div class="head">
    <div class="hd"><p class="kicker m">Kolekcja</p><h2 class="d" id="gfs-wzory">Wzory. Jedno boisko, setki stylów.</h2></div>
    <div class="side">
      <p>Nawierzchnia to połowa boiska. Ponad 1000 wzorów w Studio 3D, każdy sprawdzony do malowania: min. 20 cm pasa, 3–5 farb, czytelne linie gry. Do każdego plan malowania dla wykonawcy.</p>
    </div>
  </div>
  <div class="gfw-wall">{tiles}</div>
  <div class="gfw-more"><a class="pill" href="/wzory-na-boisko/" style="background:var(--violet);color:#fff">Wszystkie wzory <span aria-hidden="true">→</span></a><a class="pill" href="/malowanie-boisk/#ceny">Malowanie {pmin}–{pmax} zł/m² netto <span aria-hidden="true">→</span></a></div>
</section>
<!-- /wp:html -->

"""
a = raw.find("<!-- gf-blok: boiska -->")
b = raw.find("<!-- /wp:html -->", a) + len("<!-- /wp:html -->")
assert a > 0 and b > a
raw = raw[:b] + "\n\n" + block + raw[b:].lstrip("\n")

# 3. scope bar shortcut
old = '<a href="#boiska"><b>8 boisk</b><span>Panna, Cage, Street Arena</span></a>'
assert raw.count(old) == 1
raw = raw.replace(old, old + '\n  <a href="#wzory"><b>Wzory</b><span>Polskie, murale, Kompozytor</span></a>')

pathlib.Path(sys.argv[2]).write_text(raw, encoding="utf-8")
print("ok", len(raw), "price lines", n)
