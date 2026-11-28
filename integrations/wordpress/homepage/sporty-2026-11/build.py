#!/usr/bin/env python3
"""Homepage block "sporty": "Jeden plac. Każda gra." (28.11.2026). Surfaces for nine sports beyond the arenas.

Owner (28.11.2026): for these sports Gamefields builds the surface only (base, finish, lines); no equipment.
Output: bloki/sporty.html, one wp:html block marked <!-- gf-blok: sporty -->, to be added right after the hero
(block "naglowek"), before "boiska". podglad.html is a local preview (not deployed).

Data: integrations/studio/canvas-editor/public/sport-surfaces/catalog.json (field and surface sizes with run-offs,
colours, the Studio's material per sport) and integrations/wordpress/offer/{concrete-base,surface-finish}.json.
Price = Studio rule: surface area +10%, concrete base 283 zł/m² + the cheapest variant of the sport's finish, each
rounded up to 100 zł. Lines: the Studio's SportSurfaceLines, in metres (sporty.js). "Zaprojektuj" opens
/studio/?surface=<id>, which the Studio already reads (app/page.tsx).
WordPress breaks "&&" in post content, so the script is stored with a token and restored before it runs.
"""
import json
import pathlib
import re
import shutil
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parent
WP = HERE.parent.parent
CAT = json.loads((WP.parent / "studio" / "canvas-editor" / "public" / "sport-surfaces" / "catalog.json").read_text(encoding="utf-8"))["items"]
BASE = json.loads((WP / "offer" / "concrete-base.json").read_text(encoding="utf-8"))
FIN = json.loads((WP / "offer" / "surface-finish.json").read_text(encoding="utf-8"))
TOKEN = "__GFAND__"
ESBUILD = shutil.which("esbuild") or (sys.argv[1] if len(sys.argv) > 1 else None)
if not ESBUILD:
    sys.exit("usage: build.py <path to esbuild>  (or esbuild on PATH)")

MAT = {"Akryl sportowy": ("acrylic", "akryl sportowy Hard Court", "akryl"), "Sztuczna trawa 60 mm": ("turf", "sztuczna trawa", "trawa")}
ORDER = ["basketball-3x3", "padel", "pickleball", "teqball", "volleyball", "tennis", "basketball-full", "futsal", "street-football-3x3"]
NAME = {"basketball-full": "Koszykówka", "street-football-3x3": "Piłka 3×3"}
EQUIP = re.compile(r"kosz|st[oó][łl]|model|obudow|siatk|mocowan|wysoko", re.I)
by = {s["id"]: s for s in CAT}
assert set(ORDER) == set(by), sorted(by)
sports = []
for sid in ORDER:
    s = by[sid]
    key, label, short = MAT[s["material"]]
    rate = min(v["netPerM2"] for v in FIN[key]["variants"])
    note = " ".join(x for x in re.split(r"(?<=\.)\s+", s["dimensionNote"]) if not EQUIP.search(x)).strip().replace(" z archiwum", "").replace("Format Gamefields.", "Format Gamefields 15 × 10 m.")
    note = note or f"Strefa gry {str(s['length']).replace('.', ',')} × {str(s['width']).replace('.', ',')} m."
    sports.append({"id": sid, "name": NAME.get(sid, s["name"]), "length": s["length"], "width": s["width"], "fieldLength": s["fieldLength"],
                   "fieldWidth": s["fieldWidth"], **({"fieldOffsetY": s["fieldOffsetY"]} if "fieldOffsetY" in s else {}),
                   "base": s["base"], "zone": s["zone"], "finishFrom": rate, "materialLabel": label, "materialShort": short, "note": note})
data = {"baseRate": BASE["rateNetPerM2"], "sports": sports}

code = subprocess.run([ESBUILD, str(HERE / "sporty.js"), "--minify"], capture_output=True, text=True, check=True).stdout
assert TOKEN not in code and "</script" not in code.lower() and "<!--" not in code
code = code.replace("&&", TOKEN)

CSS = """
.gsp{position:relative;background:#F4F1EE;color:#47132D;padding:clamp(56px,7vw,112px) 0;font-family:GHInter,Inter,Arial,sans-serif}
.gsp *{box-sizing:border-box}
.gsp .gsp-in{max-width:1440px;margin:0 auto;padding:0 clamp(16px,3.4vw,48px)}
.gsp .gsp-head{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:clamp(20px,3vw,48px);align-items:end;margin-bottom:clamp(24px,3vw,40px)}
.gsp .gsp-k{margin:0 0 14px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#6336F5}
.gsp .gsp-head h2{margin:0;font-size:clamp(48px,6.4vw,104px);font-weight:800;letter-spacing:-.06em;line-height:.88;color:#47132D}
.gsp .gsp-lead{margin:0;font-size:clamp(16px,1.3vw,19px);line-height:1.5;color:#6F5A66}
.gsp .gsp-lead b{color:#47132D}
.gsp .gsp-main{display:grid;grid-template-columns:minmax(0,8fr) minmax(0,4fr);gap:clamp(16px,2vw,28px);align-items:start}
.gsp .gsp-stage{position:relative;background:radial-gradient(120% 100% at 50% 0%,#1F3A33 0%,#0E1A17 70%);border-radius:6px;overflow:hidden;perspective:1600px}
.gsp .gsp-stage svg{display:block;width:100%;height:auto;transform:rotateX(24deg) scale(.96);transform-origin:50% 60%}
.gsp .gsp-slab{transition:fill .5s ease}
.gsp .gsp-draw{stroke-dasharray:1;stroke-dashoffset:1;animation:gspdraw 1.1s cubic-bezier(.3,.7,.2,1) forwards}
@keyframes gspdraw{to{stroke-dashoffset:0}}
.gsp .gsp-scale{position:absolute;left:14px;bottom:12px;font-size:12px;font-weight:600;letter-spacing:.04em;color:rgba(244,241,238,.7)}
.gsp .gsp-fit{position:absolute;left:14px;top:12px;padding:7px 12px;border-radius:999px;font-size:13px;font-weight:700}
.gsp .gsp-fit.ok{background:#D8F24A;color:#1C0912}.gsp .gsp-fit.no{background:#FF8A5B;color:#1C0912}
.gsp .gsp-card{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px 24px;align-items:end;margin-top:12px;padding:clamp(18px,2vw,26px);background:#fff;border:1px solid #E3DBDF;border-radius:4px}
.gsp .gsp-card h3{margin:0;font-size:clamp(26px,2.4vw,36px);font-weight:800;letter-spacing:-.04em;line-height:1}
.gsp .gsp-card .f{margin:4px 0 0;font-size:14px;color:#6F5A66}
.gsp .gsp-dl{display:grid;grid-template-columns:repeat(3,minmax(0,auto));gap:4px 22px;margin:14px 0 0;justify-content:start}
.gsp .gsp-dl dt{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#6336F5}
.gsp .gsp-dl dd{margin:0;font-size:16px;font-weight:700}
.gsp .gsp-note{margin:12px 0 0;font-size:14px;line-height:1.45;color:#6F5A66;max-width:44rem}
.gsp .gsp-pr{text-align:right}
.gsp .gsp-pr b{display:block;font-size:clamp(24px,2.2vw,32px);font-weight:800;letter-spacing:-.03em;white-space:nowrap}
.gsp .gsp-pr small{display:block;margin:2px 0 12px;font-size:13px;color:#6F5A66}
.gsp .gsp-acts{display:grid;gap:8px}
.gsp .gsp-btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 20px;border-radius:999px;background:#6336F5;color:#fff!important;font-weight:700;font-size:15px;text-decoration:none;white-space:nowrap}
.gsp .gsp-btn:hover{background:#5126DA}
.gsp .gsp-btn.alt{background:transparent;color:#47132D!important;border:1.5px solid #47132D}
.gsp .gsp-side{display:grid;gap:18px}
.gsp .gsp-l{margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#6F5A66}
.gsp .gsp-chips{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.gsp .gsp-chips button{position:relative;display:grid;gap:2px;padding:12px 28px 12px 14px;border:1.5px solid #E3DBDF;border-radius:4px;background:#fff;color:#47132D;text-align:left;font-family:inherit;cursor:pointer;transition:border-color .2s ease,background .2s ease,opacity .2s ease}
.gsp .gsp-chips button::before{content:"";position:absolute;left:0;top:10px;bottom:10px;width:4px;border-radius:0 3px 3px 0;background:var(--ink,transparent)}
.gsp .gsp-chips button b{font-size:15px}.gsp .gsp-chips button small{font-size:12px;color:#6F5A66}
.gsp .gsp-chips button:hover{border-color:#6336F5}
.gsp .gsp-chips button[aria-pressed=true]{background:#47132D;border-color:#47132D;color:#F4F1EE}
.gsp .gsp-chips button[aria-pressed=true] small{color:rgba(244,241,238,.75)}
.gsp .gsp-chips button.no{opacity:.45}
.gsp .gsp-chips button.ok::after{content:"✓";position:absolute;right:10px;top:9px;font-size:13px;font-weight:800;color:#2E9C5E}
.gsp .gsp-plot{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.gsp .gsp-plot input{width:84px;min-height:44px;padding:0 12px;border:1.5px solid #CDBFC6;border-radius:999px;background:#fff;font:600 15px/1 inherit;font-family:inherit;color:#47132D}
.gsp .gsp-plot span{font-weight:700}
.gsp .gsp-count{margin:6px 0 0;font-size:13px;font-weight:700;color:#2E9C5E;min-height:1.2em}
.gsp .gsp-multi{display:flex;gap:10px;align-items:flex-start;padding:14px;border-radius:4px;background:#EEE8FF;cursor:pointer}
.gsp .gsp-multi input{width:20px;height:20px;margin:2px 0 0;accent-color:#6336F5;flex:none}
.gsp .gsp-multi b{display:block;font-size:15px}.gsp .gsp-multi small{display:block;font-size:13px;line-height:1.4;color:#6F5A66}
.gsp .gsp-scope{margin:0;font-size:13px;line-height:1.45;color:#6F5A66}
.gsp:not(.gsp-ready) .gsp-side{visibility:hidden}
@media (max-width:1060px){.gsp .gsp-head{grid-template-columns:minmax(0,1fr)}.gsp .gsp-main{display:flex;flex-direction:column;align-items:stretch;gap:14px}
 .gsp .gsp-main > div,.gsp .gsp-side{display:contents}.gsp .gsp-stage{order:1}.gsp .gsp-pick{order:2}.gsp .gsp-card{order:3;margin-top:0}.gsp .gsp-pl{order:4}.gsp .gsp-multi{order:5}.gsp .gsp-scope{order:6}
 .gsp .gsp-chips{display:flex;overflow-x:auto;scrollbar-width:none;padding-bottom:4px}.gsp .gsp-chips button{flex:none;min-width:136px}}
@media (max-width:640px){.gsp .gsp-card{grid-template-columns:minmax(0,1fr)}.gsp .gsp-pr{text-align:left}
 .gsp .gsp-dl{grid-template-columns:repeat(2,minmax(0,auto))}.gsp .gsp-stage svg{transform:rotateX(14deg)}}
@media (prefers-reduced-motion:reduce){.gsp .gsp-draw{animation:none;stroke-dashoffset:0}}
"""

first = sports[0]
body = f"""<section id="sporty" class="gsp" aria-labelledby="gfs-sporty">
<div class="gsp-in">
  <div class="gsp-head">
    <div><p class="gsp-k">Nawierzchnie pod {len(sports)} dyscyplin</p><h2 id="gfs-sporty">Jeden plac.<br>Każda gra.</h2></div>
    <p class="gsp-lead">Nie tylko panna. Przygotujemy <b>podłoże pod koszykówkę, padel, pickleball, teqball, siatkówkę, tenis i futsal</b>: płytę, nawierzchnię i linie w wymiarach dyscypliny. Wybierz grę albo wpisz wymiary swojego placu i zobacz, co się zmieści.</p>
  </div>
  <div class="gsp-main">
    <div>
      <div class="gsp-stage"><svg data-gsp-svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Plan nawierzchni w skali"></svg>
        <p class="gsp-fit" data-gsp-fit hidden></p><p class="gsp-scale">Skala: sylwetka obok płyty ma 1,8 m</p></div>
      <div class="gsp-card">
        <div>
          <h3 data-gsp-name>{first['name']}</h3><p class="f" data-gsp-field></p>
          <dl class="gsp-dl"><div><dt>Nawierzchnia z wybiegami</dt><dd data-gsp-surface></dd></div><div><dt>Do wyceny (+10%)</dt><dd data-gsp-area></dd></div><div><dt>Wykończenie</dt><dd data-gsp-mat></dd></div></dl>
          <p class="gsp-note" data-gsp-note></p>
        </div>
        <div class="gsp-pr"><b data-gsp-price></b><small data-gsp-split></small>
          <div class="gsp-acts"><a class="gsp-btn" data-gsp-studio href="/studio/?surface={first['id']}">Zaprojektuj w Studio ↗</a><a class="gsp-btn alt" href="#zdjecie">Wyślij zdjęcie placu →</a></div></div>
      </div>
    </div>
    <div class="gsp-side">
      <div class="gsp-pick"><p class="gsp-l">Wybierz grę</p><div class="gsp-chips" data-gsp-chips></div></div>
      <div class="gsp-pl"><p class="gsp-l">Twój plac</p><div class="gsp-plot"><input data-gsp-l inputmode="decimal" placeholder="dł." aria-label="Długość placu w metrach"><span>×</span><input data-gsp-w inputmode="decimal" placeholder="szer." aria-label="Szerokość placu w metrach"><span>m</span></div><p class="gsp-count" data-gsp-count></p></div>
      <label class="gsp-multi"><input type="checkbox" data-gsp-multi><span><b>Kilka gier na jednym placu</b><small>Zaznacz do trzech gier: jedna płyta, linie w różnych kolorach. Tak powstają boiska szkolne i osiedlowe.</small></span></label>
      <p class="gsp-scope">Zakres: płyta betonowa z podbudową, nawierzchnia i linie. Ceny orientacyjne „od”, netto, jak w Studio 3D. Areny do panny i 3 na 3 znajdziesz <a href="#boiska">niżej</a>.</p>
    </div>
  </div>
</div>
</section>"""

data_json = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("&", "\\u0026").replace("<", "\\u003c")
boot = ("(function(){var s=document.getElementById('gsp-src');if(!s)return;var c=s.textContent.split('" + TOKEN + "').join(String.fromCharCode(38,38));"
        "var t=document.createElement('script');t.src=URL.createObjectURL(new Blob([c],{type:'text/javascript'}));document.body.appendChild(t);})();")
assert "&&" not in boot
block = ("<!-- wp:html -->\n<!-- gf-blok: sporty -->\n<!-- SPORTY: surfaces for nine sports (28.11.2026), built by homepage/sporty-2026-11/build.py -->\n<style>" + CSS.strip() + "</style>\n"
         + body + "\n<script type=\"application/json\" id=\"gsp-data\">" + data_json + "</script>\n<script type=\"text/plain\" id=\"gsp-src\">" + code
         + "</script>\n<script>" + boot + "</script>\n<!-- /wp:html -->\n")
if "&&" in block:
    raise SystemExit("double ampersand would break in WordPress")
(HERE / "bloki").mkdir(exist_ok=True)
(HERE / "bloki" / "sporty.html").write_text(block, encoding="utf-8")
print(f"sporty.html {len(block)} bytes, {len(sports)} sports")
for s in sports:
    a = round(s["length"] * s["width"] * 1.1, 1)
    up = lambda x: -(-round(x * 100) // 10000) * 100
    print(f'  {s["name"]:<22} {s["length"]}×{s["width"]} m  {a} m²  od {up(a * data["baseRate"]) + up(a * s["finishFrom"])} zł  | {s["note"][:70]}')
