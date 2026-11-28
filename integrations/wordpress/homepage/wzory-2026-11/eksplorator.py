#!/usr/bin/env python3
"""Homepage "Wzory" block as an explorer (28.11.2026), replacing the four cropped collection tiles.

Output: bloki-eksplorator/wzory.html, one wp:html block marked <!-- gf-blok: wzory --> (replaces the live block with
the same marker), and podglad.html (the block alone on a page with the homepage fonts, not deployed).

What the visitor gets, like the hero for the constructions:
- four collections (Wzory polskie, Murale, Kompozytor, Masters) and their 52 curated presets from the Studio's
  pattern library (canvas-editor/lib/pattern-library-pro.ts), shown as whole courts with all lines;
- a big court on a tilted stage with a before/after handle: grey concrete becomes the pattern (animated once);
- composition 1–12, palettes, shuffle, and "Otwórz ten wzór w Studio" with exactly that pattern/variant/palette;
- price per m² from offer/surface-finish.json.
The court is drawn in the browser by the Studio's own engine (court-art-pro.mjs bundled with esbuild), so what is
shown equals what the Studio renders. WordPress turns "&&" in post content into entities, so the bundle is stored in a
text/plain script with every "&&" replaced by a token and restored before it runs; the bootstrap has no "&&".
The engine loads when the section comes near the viewport; before that, the first preset is already in the HTML.
"""
import html
import json
import pathlib
import re
import shutil
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parent
WP = HERE.parent.parent
ENGINE = WP.parent / "studio" / "surface-pro-2026-11"
LIB = WP.parent / "studio" / "canvas-editor" / "lib" / "pattern-library-pro.ts"
OUT = HERE / "bloki-eksplorator"
FIN = json.loads((WP / "offer" / "surface-finish.json").read_text(encoding="utf-8"))
PAT = {v["id"]: v["netPerM2"] for v in FIN["variants"]}
TOKEN = "__GFAND__"
ESBUILD = shutil.which("esbuild") or (sys.argv[1] if len(sys.argv) > 1 else None)
if not ESBUILD:
    sys.exit("usage: eksplorator.py <path to esbuild>  (or esbuild on PATH)")

src = LIB.read_text(encoding="utf-8")


def grab(name):
    a = src.index("export const " + name)
    s = src.index("=[", a) + 1
    e = src.index("\n];", s)
    return json.loads(src[s:e + 2])


KEEP = ("name", "eyebrow", "familyId", "variant", "paletteId", "useCase", "note")
COLLECTIONS = [
    ("Wzory polskie", "polishSignaturePresets", "Wycinanka, kilim, ceramika, parzenica: motywy, które rozpozna każdy, przełożone na boisko."),
    ("Murale", "muralSignaturePresets", "Nawierzchnia jak obraz: pejzaże, kwiaty, wielkie słowa i pociągnięcia pędzla."),
    ("Kompozytor", "composerSignaturePresets", "Geometria, która prowadzi grę: strefy, promienie, szewrony i pasy."),
    ("Masters", "mastersSignaturePresets", "Op-art, awangarda i grafika miejska w duchu wielkich mistrzów."),
]
data = {"collections": [{"name": n, "note": note, "presets": [{k: p[k] for k in KEEP} for p in grab(var)]} for n, var, note in COLLECTIONS],
        "palettes": ["gamefields", "riley", "stijl", "burle-marx", "aicher", "nihon", "vasarely", "lagos", "malevich", "copacabana", "swiss", "duperre"]}
count = sum(len(c["presets"]) for c in data["collections"])

# engine bundle (same functions the Studio uses), shared with the "sporty" block, + explorer
sys.path.insert(0, str(HERE.parent))
import gfw_shared as SH  # noqa: E402
engine = SH.stored(SH.engine_bundle(ESBUILD, HERE))
ctrl = SH.stored(SH.minify(ESBUILD, HERE / "eksplorator.js"))
code = engine + ctrl

# first preset rendered at build time (visible before the engine loads, and for crawlers)
first = data["collections"][0]["presets"][0]
js = ("import { PRO_PALETTES, renderPro, courtLines, recommendLineColor } from './court-art-pro.mjs';"
      "const c = PRO_PALETTES.find((p) => p.id === process.argv[3]).colors;"
      "process.stdout.write('<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 600 400\" preserveAspectRatio=\"xMidYMid meet\" aria-hidden=\"true\">' + renderPro(process.argv[1], +process.argv[2], 400, c, { uid: 'gwz0' }) + courtLines(400, recommendLineColor(c)) + '</svg>');")
first_svg = subprocess.run(["node", "--input-type=module", "-e", js, first["familyId"], str(first["variant"]), first["paletteId"]],
                           cwd=ENGINE, capture_output=True, text=True, check=True).stdout
first_svg = re.sub(r"(\d+\.\d)\d+", r"\1", first_svg)
old_lines = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" aria-hidden="true"><g fill="none" stroke="#FFFFFF" stroke-opacity=".38" stroke-width="3">'
             '<rect x="15" y="15" width="570" height="370"/><path d="M300 15V385M15 125h70v150H15M585 125h-70v150h70"/><circle cx="300" cy="200" r="45"/></g></svg>')

CSS = """
.gwz{--gwz-bg:#2F5C8A;--gwz-c:0;--gwz-rx:0deg;--gwz-rz:0deg;position:relative;overflow:hidden;color:#F4F1EE;background:#1C0912;background:color-mix(in srgb,var(--gwz-bg) 62%,#0B0510);transition:background-color .6s ease;padding:clamp(56px,7vw,112px) 0;font-family:GHInter,Inter,Arial,sans-serif}
.gwz *{box-sizing:border-box}
.gwz .gwz-in{max-width:1440px;margin:0 auto;padding:0 clamp(16px,3.4vw,48px);display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(28px,4vw,64px);align-items:start}
.gwz .gwz-k{margin:0 0 14px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#D8F24A}
.gwz .gwz-copy h2{margin:0;font-size:clamp(48px,6.4vw,104px);font-weight:800;letter-spacing:-.06em;line-height:.88;color:#fff}
.gwz .gwz-lead{margin:20px 0 0;max-width:34rem;font-size:clamp(16px,1.3vw,19px);line-height:1.5;color:rgba(244,241,238,.78)}
.gwz .gwz-cols{display:flex;flex-wrap:wrap;gap:8px;margin:28px 0 0}
.gwz .gwz-cols button{min-height:42px;padding:0 16px;border-radius:999px;border:1.5px solid rgba(244,241,238,.35);background:transparent;color:#F4F1EE;font:600 15px/1 inherit;font-family:inherit;cursor:pointer;transition:background .2s ease,color .2s ease,border-color .2s ease}
.gwz .gwz-cols button small{margin-left:4px;font-weight:500;opacity:.6}
.gwz .gwz-cols button[aria-selected=true]{background:#F4F1EE;color:#1C0912;border-color:#F4F1EE}
.gwz .gwz-colnote{min-height:2.8em;margin:12px 0 14px;font-size:14px;line-height:1.4;color:rgba(244,241,238,.7)}
.gwz .gwz-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;max-height:452px;overflow:auto;padding:2px 4px 18px 2px;scrollbar-width:thin;-webkit-mask-image:linear-gradient(#000 calc(100% - 28px),transparent);mask-image:linear-gradient(#000 calc(100% - 28px),transparent)}
.gwz .gwz-grid button{display:grid;gap:5px;padding:5px 5px 7px;border:0;border-radius:4px;background:rgba(244,241,238,.06);color:#F4F1EE;cursor:pointer;text-align:left;font-family:inherit;transition:background .2s ease,transform .2s ease}
.gwz .gwz-grid button:hover{background:rgba(244,241,238,.14);transform:translateY(-2px)}
.gwz .gwz-grid button[aria-pressed=true]{background:#F4F1EE;color:#1C0912}
.gwz .gwz-grid .th{display:block;aspect-ratio:3/2;overflow:hidden;border-radius:2px}
.gwz .gwz-grid .th svg{display:block;width:100%;height:100%}
.gwz .gwz-grid .nm{font-size:12px;font-weight:700;line-height:1.15;padding:0 2px}
.gwz .gwz-stage{position:relative;perspective:1500px;padding:clamp(18px,3vw,44px) clamp(8px,2vw,28px) clamp(26px,4vw,56px)}
.gwz .gwz-court{position:relative;aspect-ratio:3/2;padding:3.2%;background:#B8B2AB;border-radius:6px;transform:rotateX(calc(26deg + var(--gwz-rx))) rotateZ(var(--gwz-rz));transform-origin:50% 60%;transition:transform .5s cubic-bezier(.2,.7,.2,1);box-shadow:0 2px 0 #9C958E,0 10px 0 #8A847D,0 50px 70px -10px rgba(0,0,0,.55)}
.gwz .gwz-court > div{position:absolute;inset:3.2%;overflow:hidden}
.gwz .gwz-court svg{display:block;width:100%;height:100%}
.gwz .gwz-before{background:#8F8A85 url(https://www.gamefields.eu/wp-content/uploads/2026/11/beton-macro.webp) center/34% repeat;filter:grayscale(1) contrast(.9) brightness(1.05)}
.gwz .gwz-after{clip-path:inset(0 0 0 calc(var(--gwz-c) * 1%))}
.gwz .gwz-handle{position:absolute;top:3.2%;bottom:3.2%;left:calc(3.2% + 93.6% * var(--gwz-c) / 100);width:3px;margin-left:-1.5px;background:#D8F24A;box-shadow:0 0 0 1px rgba(0,0,0,.25);pointer-events:none}
.gwz .gwz-handle::after{content:"‹ ›";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:#D8F24A;color:#1C0912;font:800 15px/1 Arial,sans-serif;letter-spacing:2px;box-shadow:0 6px 16px rgba(0,0,0,.35)}
.gwz .gwz-range{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:ew-resize;z-index:3}
.gwz .gwz-tag{position:absolute;top:0;z-index:2;padding:6px 12px;border-radius:999px;background:rgba(11,5,16,.55);font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}
.gwz .gwz-tag.b{left:clamp(8px,2vw,28px)}.gwz .gwz-tag.a{right:clamp(8px,2vw,28px);background:#D8F24A;color:#1C0912}
.gwz .gwz-ctrl{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:end;gap:16px 24px}
.gwz .gwz-l{margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(244,241,238,.7)}
.gwz .gwz-pals{display:flex;gap:4px;max-width:100%;overflow-x:auto;scrollbar-width:none;padding:2px}
.gwz .gwz-pals button{padding:3px;border:2px solid transparent;border-radius:999px;background:transparent;cursor:pointer}
.gwz .gwz-pals button[aria-pressed=true]{border-color:#F4F1EE}
.gwz .gwz-pals i{display:flex;width:52px;height:22px;border-radius:999px;overflow:hidden}
.gwz .gwz-pals b{flex:1}
.gwz .gwz-step{display:flex;align-items:center;gap:6px}
.gwz .gwz-step button,.gwz .gwz-shuffle{display:inline-grid;place-items:center;min-width:44px;height:44px;padding:0 14px;border-radius:999px;border:1.5px solid rgba(244,241,238,.4);background:transparent;color:#F4F1EE;font:700 18px/1 inherit;font-family:inherit;cursor:pointer}
.gwz .gwz-step b{min-width:64px;text-align:center;font-size:16px}
.gwz .gwz-shuffle{font-size:15px;background:#F4F1EE;color:#1C0912;border-color:#F4F1EE}
.gwz .gwz-card{margin-top:22px;padding:clamp(18px,2vw,26px);background:#F4F1EE;color:#47132D;border-radius:4px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px 24px;align-items:end}
.gwz .gwz-eb{margin:0;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#6336F5}
.gwz .gwz-card h3{margin:2px 0 6px;font-size:clamp(26px,2.4vw,36px);font-weight:800;letter-spacing:-.04em;line-height:1}
.gwz .gwz-card p.n{margin:0;font-size:15px;line-height:1.5;color:#6F5A66}
.gwz .gwz-facts{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0 0;padding:0;list-style:none}
.gwz .gwz-facts li{display:inline-flex;align-items:center;min-height:30px;padding:0 11px;border-radius:999px;background:#fff;border:1px solid #E3DBDF;font-size:13px;font-weight:600}
.gwz .gwz-acts{display:grid;gap:8px;justify-items:stretch}
.gwz .gwz-btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 20px;border-radius:999px;background:#6336F5;color:#fff!important;font-weight:700;font-size:15px;text-decoration:none;white-space:nowrap}
.gwz .gwz-btn:hover{background:#5126DA;color:#fff}
.gwz .gwz-btn.alt{background:transparent;color:#47132D!important;border:1.5px solid #47132D}
.gwz .gwz-btn.alt:hover{background:#47132D;color:#fff!important}
.gwz:not(.gwz-ready) [data-gwz-ctrl]{visibility:hidden}
@media (max-width:1060px){.gwz .gwz-in{display:flex;flex-direction:column;align-items:stretch;gap:0}.gwz .gwz-copy,.gwz .gwz-show{display:contents}
 .gwz .gwz-k{order:1}.gwz .gwz-copy h2{order:2}.gwz .gwz-lead{order:3}.gwz .gwz-stage{order:4;margin-top:18px}.gwz .gwz-cols{order:5;margin-top:8px}.gwz .gwz-colnote{order:6;min-height:0}
 .gwz .gwz-grid{order:7;grid-template-columns:none;grid-auto-flow:column;grid-auto-columns:138px;max-height:none;overflow-x:auto;padding-bottom:8px;-webkit-mask-image:none;mask-image:none}
 .gwz .gwz-ctrl{order:8;margin-top:18px}.gwz .gwz-card{order:9}}
@media (max-width:640px){.gwz .gwz-ctrl{grid-template-columns:minmax(0,1fr) auto}.gwz .gwz-ctrl > div:first-child{grid-column:1/-1}.gwz .gwz-card{grid-template-columns:minmax(0,1fr)}.gwz .gwz-acts{justify-items:stretch}.gwz .gwz-pals i{width:42px}
 .gwz .gwz-court{transform:rotateX(18deg)}.gwz .gwz-handle::after{width:38px;height:38px}}
@media (prefers-reduced-motion:reduce){.gwz,.gwz .gwz-court,.gwz .gwz-grid button{transition:none}}
"""

body = f"""<section id="wzory" class="gwz" aria-labelledby="gfs-wzory">
<div class="gwz-in">
  <div class="gwz-copy">
    <p class="gwz-k">Wzory nawierzchni · ponad 1000 w Studio 3D</p>
    <h2 id="gfs-wzory">Szary plac.<br>Twój wzór.</h2>
    <p class="gwz-lead">Nawierzchnia to połowa boiska. Wybierz kolekcję, wzór i kolory, a potem przesuń suwak: tak zmienia się miejsce. Każdy wzór jest sprawdzony do malowania (min. 20 cm pasa, 3–5 farb, czytelne linie gry) i ma plan malowania dla wykonawcy.</p>
    <div class="gwz-cols" role="tablist" aria-label="Kolekcje wzorów" data-gwz-cols></div>
    <p class="gwz-colnote" data-gwz-colnote></p>
    <div class="gwz-grid" data-gwz-grid aria-label="Wzory w kolekcji"></div>
  </div>
  <div class="gwz-show">
    <div class="gwz-stage" data-gwz-stage>
      <span class="gwz-tag b">Przed</span><span class="gwz-tag a">Po</span>
      <div class="gwz-court">
        <div class="gwz-before">{old_lines}</div>
        <div class="gwz-after" data-gwz-after>{first_svg}</div>
        <span class="gwz-handle"></span>
      </div>
      <input class="gwz-range" type="range" min="0" max="100" value="0" step="1" data-gwz-range aria-label="Przed i po: przesuń, żeby porównać szary plac ze wzorem">
    </div>
    <div class="gwz-ctrl" data-gwz-ctrl>
      <div><p class="gwz-l">Kolory</p><div class="gwz-pals" data-gwz-pals></div></div>
      <div><p class="gwz-l">Kompozycja</p><div class="gwz-step"><button type="button" data-gwz-prev aria-label="Poprzednia kompozycja">‹</button><b data-gwz-v>{first['variant']} / 12</b><button type="button" data-gwz-next aria-label="Następna kompozycja">›</button></div></div>
      <button type="button" class="gwz-shuffle" data-gwz-shuffle>Losuj wzór ⤨</button>
    </div>
    <div class="gwz-card">
      <div>
        <p class="gwz-eb" data-gwz-eyebrow>{html.escape(first['eyebrow'])}</p>
        <h3 data-gwz-name>{html.escape(first['name'])}</h3>
        <p class="n" data-gwz-note>{html.escape(first['note'])}</p>
        <ul class="gwz-facts"><li>Dla:&nbsp;<b data-gwz-use>{html.escape(first['useCase'])}</b></li><li>od {PAT['pattern']} zł/m² netto</li><li>plan malowania dla wykonawcy</li></ul>
      </div>
      <div class="gwz-acts"><a class="gwz-btn" data-gwz-studio href="/studio/?arena=o1&amp;pattern={first['familyId']}&amp;variant={first['variant']}&amp;palette={first['paletteId']}">Otwórz ten wzór w Studio ↗</a><a class="gwz-btn alt" href="/wzory-na-boisko/">Wszystkie wzory i kolekcje →</a></div>
    </div>
  </div>
</div>
</section>"""

data_json = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("&", "\\u0026").replace("<", "\\u003c")
boot = SH.boot("gwz-src", "wzory")
block = ("<!-- wp:html -->\n<!-- gf-blok: wzory -->\n<!-- WZORY: explorer (28.11.2026), built by homepage/wzory-2026-11/eksplorator.py -->\n<style>" + CSS.strip() + "</style>\n"
         + body + "\n<script type=\"application/json\" id=\"gwz-data\">" + data_json + "</script>\n"
         + "<script type=\"text/plain\" id=\"gfw-engine\">" + engine + "</script>\n<script type=\"text/plain\" id=\"gwz-src\">" + ctrl + "</script>\n<script>" + boot + "</script>\n<!-- /wp:html -->\n")
if "&&" in block:
    raise SystemExit("double ampersand would break in WordPress")
OUT.mkdir(exist_ok=True)
(OUT / "wzory.html").write_text(block, encoding="utf-8")
prev = block.replace("<!-- wp:html -->", "").replace("<!-- /wp:html -->", "")
(HERE / "podglad.html").write_text('<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Wzory, podgląd</title>'
                                   '<link rel="preload" href="https://www.gamefields.eu/wp-content/themes/gamefields/assets/fonts/GHInter-sub.woff2" as="font" crossorigin>'
                                   '<style>@font-face{font-family:GHInter;src:url(https://www.gamefields.eu/wp-content/themes/gamefields/assets/fonts/GHInter-sub.woff2) format("woff2");font-weight:100 900}body{margin:0;background:#F4F1EE}</style></head><body>'
                                   + prev + "</body></html>\n", encoding="utf-8")
print(f"wzory.html {len(block)} bytes, {count} presets, engine {len(code)} bytes")
