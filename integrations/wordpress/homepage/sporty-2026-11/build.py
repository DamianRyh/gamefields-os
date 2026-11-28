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

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
import gfw_shared as SH  # noqa: E402

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
                   "base": s["base"], "zone": s["zone"], "finishFrom": rate, "materialLabel": label, "materialShort": short, "note": note, "paintable": key != "turf"})
# patterns that read well on any rectangle (curated presets from the Studio's pattern library)
LIB = (WP.parent / "studio" / "canvas-editor" / "lib" / "pattern-library-pro.ts").read_text(encoding="utf-8")


def grab(name):
    a = LIB.index("export const " + name)
    b = LIB.index("=[", a) + 1
    return json.loads(LIB[b:LIB.index("\n];", b) + 2])


PRESETS = {p["familyId"]: p for g in ("polishSignaturePresets", "muralSignaturePresets", "composerSignaturePresets", "mastersSignaturePresets") for p in grab(g)}
PICK = ["pro-p-pasiak", "pro-m-landscape", "pro-k-echo", "pro-m-flora", "pro-k-rays", "pro-munich", "pro-promenade", "pro-neoplastic"]
patterns = [{k: PRESETS[f][k] for k in ("name", "familyId", "variant", "paletteId")} for f in PICK]
PATTERN_RATE = next(v["netPerM2"] for v in FIN["variants"] if v["id"] == "pattern")
data = {"baseRate": BASE["rateNetPerM2"], "patternRate": PATTERN_RATE, "sports": sports, "patterns": patterns,
        "palettes": ["simultane", "gamefields", "stijl", "burle-marx", "aicher", "nihon", "vasarely", "copacabana", "swiss", "nightshift"]}

code = SH.stored(SH.minify(ESBUILD, HERE / "sporty.js"))

CSS = """
.gsp{--gsp-tone:#3157B7;position:relative;background:#F4F1EE;color:#47132D;padding:clamp(56px,7vw,112px) 0;font-family:GHInter,Inter,Arial,sans-serif}
.gsp *{box-sizing:border-box}
.gsp .gsp-in{max-width:1440px;margin:0 auto;padding:0 clamp(16px,3.4vw,48px)}
.gsp .gsp-head{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:clamp(20px,3vw,48px);align-items:end;margin-bottom:clamp(22px,2.6vw,36px)}
.gsp .gsp-k{margin:0 0 14px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#6336F5}
.gsp .gsp-head h2{margin:0;font-size:clamp(48px,6.4vw,104px);font-weight:800;letter-spacing:-.06em;line-height:.88;color:#47132D}
.gsp .gsp-lead{margin:0;font-size:clamp(16px,1.3vw,19px);line-height:1.5;color:#6F5A66}
.gsp .gsp-lead b{color:#47132D}
.gsp .gsp-tabs{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:2px 2px 10px}
.gsp .gsp-tabs button{flex:none;display:grid;justify-items:center;gap:6px;min-width:104px;padding:10px 12px 9px;border:1.5px solid transparent;border-radius:12px;background:#fff;color:#47132D;font:600 13px/1.1 inherit;font-family:inherit;cursor:pointer;transition:background .2s ease,border-color .2s ease,opacity .2s ease,transform .2s ease;position:relative}
.gsp .gsp-tabs button:hover{transform:translateY(-2px);border-color:#CDBFC6}
.gsp .gsp-tabs svg{width:64px;height:38px}
.gsp .gsp-tabs svg .z{fill:#EEE8E3}.gsp .gsp-tabs svg path{stroke:#47132D}
.gsp .gsp-tabs button[aria-selected=true]{background:#47132D;color:#F4F1EE}
.gsp .gsp-tabs button[aria-selected=true] svg .z{fill:var(--gsp-tone)}.gsp .gsp-tabs button[aria-selected=true] svg path{stroke:#fff}
.gsp .gsp-tabs button.no{opacity:.38}
.gsp .gsp-tabs button.ok::after{content:"✓";position:absolute;top:6px;right:8px;font-size:12px;font-weight:800;color:#2E9C5E}
.gsp .gsp-stage{position:relative;display:grid;grid-template-columns:minmax(0,1fr) min(400px,34%);gap:20px;align-items:center;height:clamp(440px,44vw,620px);padding:64px 24px 24px;border-radius:18px;overflow:hidden;
 background:radial-gradient(80% 90% at 38% 42%,#EFEAE4 0%,#D6CFC7 62%,#C4BCB3 100%)}
.gsp .gsp-stage::before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(71,19,45,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(71,19,45,.06) 1px,transparent 1px);background-size:48px 48px;-webkit-mask-image:radial-gradient(60% 70% at 38% 50%,#000,transparent);mask-image:radial-gradient(60% 70% at 38% 50%,#000,transparent);pointer-events:none}
.gsp .gsp-floor{position:relative;height:100%;display:grid;place-items:center;perspective:1700px}
.gsp .gsp-slab{position:relative;transform:rotateX(36deg) rotateZ(-2deg);transform-origin:50% 55%;transition:width .6s cubic-bezier(.2,.7,.2,1),height .6s cubic-bezier(.2,.7,.2,1);
 box-shadow:0 2px 0 rgba(255,255,255,.5),0 8px 0 #8E867E,0 11px 0 #7A736C,0 70px 70px -24px rgba(40,20,20,.55);border-radius:3px;overflow:hidden}
.gsp .gsp-slab svg{display:block;width:100%;height:100%}
.gsp .gsp-draw{stroke-dasharray:1;stroke-dashoffset:1;animation:gspdraw 1.2s cubic-bezier(.3,.7,.2,1) forwards}
@keyframes gspdraw{to{stroke-dashoffset:0}}
.gsp .gsp-tag{position:absolute;left:18px;top:16px;margin:0;padding:7px 12px;border-radius:999px;background:#47132D;color:#F4F1EE;font-size:12px;font-weight:700;letter-spacing:.06em;backdrop-filter:blur(6px)}
.gsp .gsp-plot{position:absolute;right:16px;top:14px;display:flex;align-items:center;gap:6px;padding:6px 6px 6px 14px;border-radius:999px;background:#fff;box-shadow:0 4px 14px rgba(71,19,45,.12);font-size:13px;font-weight:700;color:#47132D}
.gsp .gsp-plot input{width:58px;height:34px;padding:0 8px;border:1.5px solid #CDBFC6;border-radius:999px;background:#fff;text-align:center;font:600 14px/1 inherit;font-family:inherit;color:#47132D}
.gsp .gsp-fit{position:absolute;right:16px;top:64px;margin:0;padding:6px 12px;border-radius:999px;font-size:12px;font-weight:800}
.gsp .gsp-fit.ok{background:#D8F24A;color:#1C0912}.gsp .gsp-fit.no{background:#FF8A5B;color:#1C0912}
.gsp .gsp-count{position:absolute;right:20px;top:100px;margin:0;font-size:12px;font-weight:700;color:#47132D}
.gsp .gsp-card{position:relative;z-index:1;padding:20px 22px;border-radius:14px;background:#fff;box-shadow:0 18px 40px rgba(71,19,45,.16)}
.gsp .gsp-card h3{margin:0;font-size:clamp(24px,2.2vw,32px);font-weight:800;letter-spacing:-.04em;line-height:1}
.gsp .gsp-card .d2{margin:6px 0 12px;font-size:13px;line-height:1.4;color:#6F5A66}
.gsp .gsp-rows{display:grid;gap:6px;margin:0 0 14px}
.gsp .gsp-rows div{display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:8px 10px;border-radius:8px;background:#F4F1EE;font-size:13px;color:#6F5A66;transition:background .25s ease,color .25s ease}
.gsp .gsp-rows b{font-size:17px;color:#47132D;white-space:nowrap}
.gsp .gsp-rows div.on{background:#47132D;color:rgba(244,241,238,.8)}.gsp .gsp-rows div.on b{color:#D8F24A}
.gsp .gsp-acts{display:flex;flex-wrap:wrap;gap:8px}
.gsp .gsp-btn{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 18px;border-radius:999px;background:#6336F5;color:#fff!important;font-weight:700;font-size:14px;text-decoration:none;white-space:nowrap}
.gsp .gsp-btn:hover{background:#5126DA}
.gsp .gsp-btn.alt{background:transparent;color:#47132D!important;border:1.5px solid #47132D}
.gsp .gsp-tools{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px 24px;margin-top:14px}
.gsp .gsp-l{margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#6F5A66}
.gsp .gsp-pats{display:flex;gap:6px;flex-wrap:wrap}
.gsp .gsp-pats button{width:58px;height:40px;padding:0;border:2px solid transparent;border-radius:8px;overflow:hidden;background:#fff;cursor:pointer;transition:transform .2s ease}
.gsp .gsp-pats button:hover{transform:translateY(-2px)}
.gsp .gsp-pats button svg{display:block;width:100%;height:100%}
.gsp .gsp-pats button[aria-pressed=true]{border-color:#47132D;box-shadow:0 0 0 2px #F4F1EE inset}
.gsp .gsp-pats .plain{display:grid;place-items:center;background:#E6E0DA;font:700 11px/1 inherit;font-family:inherit;color:#47132D}
.gsp .gsp-pals{display:flex;gap:4px;flex-wrap:wrap}
.gsp .gsp-pals button{padding:3px;border:2px solid transparent;border-radius:999px;background:transparent;cursor:pointer}
.gsp .gsp-pals button[aria-pressed=true]{border-color:#47132D}
.gsp .gsp-pals i{display:flex;width:44px;height:18px;border-radius:999px;overflow:hidden}.gsp .gsp-pals b{flex:1}
.gsp .gsp-shuffle{min-height:44px;padding:0 18px;border-radius:999px;border:0;background:#D8F24A;color:#1C0912;font:800 14px/1 inherit;font-family:inherit;cursor:pointer}
.gsp .gsp-scope{margin:16px 0 0;font-size:13px;line-height:1.45;color:#6F5A66}
.gsp.gsp-noeng .gsp-tools > div:not(:last-child),.gsp.gsp-noeng .gsp-shuffle{display:none}
.gsp.gsp-turf .gsp-pats,.gsp.gsp-turf .gsp-pals{opacity:.4;pointer-events:none}
.gsp:not(.gsp-ready) .gsp-tools,.gsp:not(.gsp-ready) .gsp-plot{visibility:hidden}
@media (max-width:900px){.gsp .gsp-head{grid-template-columns:minmax(0,1fr)}
 .gsp .gsp-stage{display:block;height:auto;padding:64px 10px 10px}.gsp .gsp-floor{height:auto;padding:16px 0 40px}
 .gsp .gsp-slab{transform:rotateX(26deg)}
 .gsp .gsp-plot{left:10px;right:auto;top:12px}.gsp .gsp-tag{display:none}.gsp .gsp-fit{left:10px;right:auto;top:58px}.gsp .gsp-count{right:14px;top:66px}}
@media (prefers-reduced-motion:reduce){.gsp .gsp-draw{animation:none;stroke-dashoffset:0}.gsp .gsp-slab{transition:none}}
"""

body = f"""<section id="sporty" class="gsp" aria-labelledby="gfs-sporty">
<div class="gsp-in">
  <div class="gsp-head">
    <div><p class="gsp-k">Nawierzchnie sportowe · malowane w Twoim wzorze</p><h2 id="gfs-sporty">Jeden plac.<br>Każda gra.</h2></div>
    <p class="gsp-lead">Nie tylko panna. Robimy <b>podłoża pod koszykówkę, padel, pickleball, teqball, siatkówkę, tenis i futsal</b>: płytę, nawierzchnię i linie w wymiarach dyscypliny, a pole gry malujemy we wzorze Gamefields. Wybierz grę i wzór, wpisz wymiary placu.</p>
  </div>
  <div class="gsp-tabs" role="tablist" aria-label="Dyscypliny" data-gsp-tabs></div>
  <div class="gsp-stage" data-gsp-stage>
    <div class="gsp-floor" data-gsp-floor><div class="gsp-slab" data-gsp-slab></div></div>
    <p class="gsp-tag" data-gsp-tag></p>
    <label class="gsp-plot">Mój plac <input data-gsp-l inputmode="decimal" placeholder="dł." aria-label="Długość placu w metrach"> × <input data-gsp-w inputmode="decimal" placeholder="szer." aria-label="Szerokość placu w metrach"> m</label>
    <p class="gsp-fit" data-gsp-fit hidden></p><p class="gsp-count" data-gsp-count></p>
    <div class="gsp-card">
      <h3 data-gsp-name></h3><p class="d2" data-gsp-dims></p>
      <div class="gsp-rows">
        <div data-gsp-rowplain><span data-gsp-plainlabel>Jednolity kolor</span><b data-gsp-plain></b></div>
        <div data-gsp-rowpat><span>Ze wzorem Gamefields</span><b data-gsp-pattern></b></div>
      </div>
      <div class="gsp-acts"><a class="gsp-btn" data-gsp-studio href="/studio/">Zaprojektuj w Studio ↗</a><a class="gsp-btn alt" href="#zdjecie">Wyślij zdjęcie placu</a></div>
    </div>
  </div>
  <div class="gsp-tools">
    <div><p class="gsp-l">Wzór na polu gry</p><div class="gsp-pats" data-gsp-pats></div></div>
    <div><p class="gsp-l">Kolory</p><div class="gsp-pals" data-gsp-pals></div></div>
    <div><button type="button" class="gsp-shuffle" data-gsp-shuffle>Losuj wzór ⤨</button></div>
  </div>
  <p class="gsp-scope">Zakres: płyta betonowa z podbudową, nawierzchnia albo malowany wzór i linie. Ceny orientacyjne „od”, netto, liczone jak w Studio 3D (metraż +10%). Wyposażenia nie dostarczamy. Ponad 1000 wzorów znajdziesz <a href="#wzory">w kolekcji</a>, areny do panny i 3 na 3 <a href="#boiska">niżej</a>.</p>
</div>
</section>"""

data_json = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("&", "\\u0026").replace("<", "\\u003c")
block = ("<!-- wp:html -->\n<!-- gf-blok: sporty -->\n<!-- SPORTY v2: surfaces for nine sports painted in Gamefields patterns (28.11.2026), built by homepage/sporty-2026-11/build.py; needs the pattern engine #gfw-engine from the wzory block -->\n<style>" + CSS.strip() + "</style>\n"
         + body + "\n<script type=\"application/json\" id=\"gsp-data\">" + data_json + "</script>\n<script type=\"text/plain\" id=\"gsp-src\">" + code
         + "</script>\n<script>" + SH.boot("gsp-src", "sporty", "900px") + "</script>\n<!-- /wp:html -->\n")
if "&&" in block:
    raise SystemExit("double ampersand would break in WordPress")
(HERE / "bloki").mkdir(exist_ok=True)
(HERE / "bloki" / "sporty.html").write_text(block, encoding="utf-8")
print(f"sporty.html {len(block)} bytes, {len(sports)} sports, {len(patterns)} patterns")
