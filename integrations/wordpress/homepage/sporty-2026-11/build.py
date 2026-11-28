#!/usr/bin/env python3
"""Homepage block "sporty": "Jeden plac. Każda gra." (28.11.2026, v4: premium gallery, owner's choice).

Surfaces for nine sports beyond the arenas; Gamefields builds the surface only (base, finish or a painted
Gamefields pattern, lines), no equipment (owner, 28.11.2026).
Output:
  bloki/sporty.html   one wp:html block marked <!-- gf-blok: sporty -->, right after the hero ("naglowek"), before "boiska"
  renders/*.webp      27 product shots (render.mjs), to upload to the media library as wp-content/uploads/2026/11/<name>

Each card: number, sport, field and surface size, a product shot in three looks (pattern + palette, or turf colour
for padel), card colour from the look's palette, prices "ze wzorem" / "jednolity kolor" and "Zaprojektuj w Studio"
with the same sport, pattern, composition and palette (/studio/?surface=&pattern=&variant=&palette=, read by the
Studio's app/page.tsx). Prices: Studio rule, area +10%, concrete base + finish (cheapest variant) or + pattern
painting (surface-finish.json "pattern"), each rounded up to 100 zł.
Sizes and colours: integrations/studio/canvas-editor/public/sport-surfaces/catalog.json.
"""
import html
import json
import math
import pathlib
import shutil
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
import gfw_shared as SH  # noqa: E402

WP = HERE.parent.parent
STUDIO = WP.parent / "studio"
CAT = json.loads((STUDIO / "canvas-editor" / "public" / "sport-surfaces" / "catalog.json").read_text(encoding="utf-8"))["items"]
BASE = json.loads((WP / "offer" / "concrete-base.json").read_text(encoding="utf-8"))
FIN = json.loads((WP / "offer" / "surface-finish.json").read_text(encoding="utf-8"))
LOOKS = json.loads((HERE / "renders" / "looks.json").read_text(encoding="utf-8"))
UP = "https://www.gamefields.eu/wp-content/uploads/2026/11/"
ESBUILD = shutil.which("esbuild") or (sys.argv[1] if len(sys.argv) > 1 else None)
if not ESBUILD:
    sys.exit("usage: build.py <path to esbuild>  (or esbuild on PATH)")

PAL = json.loads(subprocess.run(["node", "--input-type=module", "-e",
                                 "import {PRO_PALETTES} from './court-art-pro.mjs'; process.stdout.write(JSON.stringify(Object.fromEntries(PRO_PALETTES.map(p=>[p.id,{name:p.name,colors:p.colors}]))))"],
                                cwd=STUDIO / "surface-pro-2026-11", capture_output=True, text=True, check=True).stdout)


def rgb(h):
    return [int(h[i:i + 2], 16) for i in (1, 3, 5)]


def lum(h):
    c = [x / 255 for x in rgb(h)]
    c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def mix(a, b, t):
    A, B = rgb(a), rgb(b)
    return "#" + "".join(f"{round(A[i] + (B[i] - A[i]) * t):02X}" for i in range(3))


def card_colour(look):
    """Soft card colour from the look: the palette's second lightest colour (or the turf) mixed into paper."""
    base = look["turf"] if "turf" in look else sorted(PAL[look["paletteId"]]["colors"], key=lum)[-2]
    bg = mix(base, "#F4F1EE", 0.55)
    return bg, ("#1C0912" if lum(bg) > 0.3 else "#F4F1EE")


MAT = {"Akryl sportowy": ("acrylic", "akryl"), "Sztuczna trawa 60 mm": ("turf", "sztuczna trawa")}
ORDER = ["basketball-3x3", "padel", "pickleball", "teqball", "volleyball", "tennis", "basketball-full", "futsal", "street-football-3x3"]
NAME = {"basketball-full": "Koszykówka", "street-football-3x3": "Piłka 3×3"}
FOR = {"basketball-3x3": "osiedla, szkoły, parki", "padel": "kluby, hotele, osiedla", "pickleball": "osiedla, seniorzy, kluby",
       "teqball": "parki, kluby, eventy", "volleyball": "szkoły, plaże miejskie", "tennis": "kluby, szkoły, gminy",
       "basketball-full": "szkoły, gminy, hale", "futsal": "szkoły, gminy, Orliki", "street-football-3x3": "osiedla, eventy, marki"}
by = {s["id"]: s for s in CAT}
assert set(ORDER) == set(by) == set(LOOKS), sorted(by)
PATTERN = next(v["netPerM2"] for v in FIN["variants"] if v["id"] == "pattern")


def up100(x):
    return math.ceil(round(x * 100) / 10000) * 100


def num(x):
    return f"{x:.2f}".rstrip("0").rstrip(".").replace(".", ",")


def zl(n):
    return f"{n:,}".replace(",", " ") + " zł"


cards = []
for i, sid in enumerate(ORDER):
    s = by[sid]
    key, short = MAT[s["material"]]
    area = round(s["length"] * s["width"] * 1.1, 1)
    base = up100(area * BASE["rateNetPerM2"])
    plain = base + up100(area * min(v["netPerM2"] for v in FIN[key]["variants"]))
    painted = base + up100(area * PATTERN) if key != "turf" else None
    name = NAME.get(sid, s["name"])
    looks = []
    for lk in LOOKS[sid]:
        bg, ink = card_colour(lk)
        if "turf" in lk:
            studio, label, sw = f"/studio/?surface={sid}", lk["name"], lk["turf"]
        else:
            studio = f"/studio/?surface={sid}&pattern={lk['familyId']}&variant={lk['variant']}&palette={lk['paletteId']}"
            label, sw = f"{lk['name']} · {PAL[lk['paletteId']]['name']}", sorted(PAL[lk["paletteId"]]["colors"], key=lum)
        looks.append({"src": UP + lk["file"], "alt": f"{name}: nawierzchnia {label}", "bg": bg, "ink": ink, "name": label, "studio": studio, "sw": sw})
    cards.append({"i": i + 1, "id": sid, "name": name, "s": s, "area": area, "plain": plain, "painted": painted, "looks": looks})


def swatch(lk):
    if isinstance(lk["sw"], str):
        return f'<i style="background:{lk["sw"]}"></i>'
    return "<i>" + "".join(f'<b style="background:{c}"></b>' for c in lk["sw"]) + "</i>"


def card_html(c):
    l0, s = c["looks"][0], c["s"]
    data = html.escape(json.dumps([{k: v for k, v in lk.items() if k != "sw"} for lk in c["looks"]], ensure_ascii=False))
    picks = "".join(f'<button type="button" data-look="{k}" aria-pressed="{str(k == 0).lower()}" aria-label="Wygląd: {html.escape(lk["name"])}">{swatch(lk)}</button>'
                    for k, lk in enumerate(c["looks"]))
    price = (f'<p class="gsp-pr"><span>Ze wzorem od</span><b>{zl(c["painted"])}</b><small>jednolity kolor od {zl(c["plain"])} · netto</small></p>' if c["painted"]
             else f'<p class="gsp-pr"><span>Nawierzchnia od</span><b>{zl(c["plain"])}</b><small>sztuczna trawa · netto</small></p>')
    return (f'<article class="gsp-card" data-name="{html.escape(c["name"])}" data-looks="{data}" style="--bg:{l0["bg"]};--ink:{l0["ink"]}">'
            f'<div class="gsp-top"><p class="gsp-n">{c["i"]:02d} / {len(cards):02d}</p><h3>{html.escape(c["name"])}</h3>'
            f'<p class="gsp-m">pole {num(s["fieldLength"])} × {num(s["fieldWidth"])} m · nawierzchnia {num(s["length"])} × {num(s["width"])} m · {html.escape(FOR[c["id"]])}</p></div>'
            f'<figure><img src="{l0["src"]}" alt="{html.escape(l0["alt"])}" width="1600" height="1000" loading="{"eager" if c["i"] == 1 else "lazy"}" decoding="async"></figure>'
            f'<div class="gsp-bar"><div class="gsp-looks"><span data-look-name>{html.escape(l0["name"])}</span><div class="gsp-pick">{picks}</div></div>'
            f'{price}<a class="gsp-go" data-studio href="{html.escape(l0["studio"])}">Zaprojektuj <span aria-hidden="true">↗</span></a></div></article>')


CSS = """
.gsp{background:#F4F1EE;color:#47132D;padding:clamp(56px,7vw,112px) 0 clamp(48px,6vw,96px);font-family:GHInter,Inter,Arial,sans-serif;overflow:hidden}
.gsp *{box-sizing:border-box}
.gsp .gsp-in{max-width:1440px;margin:0 auto;padding:0 clamp(16px,3.4vw,48px)}
.gsp .gsp-head{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:clamp(20px,3vw,48px);align-items:end;margin-bottom:clamp(26px,3vw,44px)}
.gsp .gsp-k{margin:0 0 14px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#6336F5}
.gsp .gsp-head h2{margin:0;font-size:clamp(48px,6.4vw,104px);font-weight:800;letter-spacing:-.06em;line-height:.88;color:#47132D}
.gsp .gsp-lead{margin:0;font-size:clamp(16px,1.3vw,19px);line-height:1.5;color:#6F5A66}
.gsp .gsp-lead b{color:#47132D}
.gsp .gsp-track{display:flex;gap:clamp(12px,1.4vw,20px);overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;padding:0 clamp(16px,3.4vw,48px);scroll-padding:0 clamp(16px,3.4vw,48px);max-width:1440px;margin:0 auto;overscroll-behavior-x:contain}
.gsp .gsp-track::-webkit-scrollbar{display:none}
.gsp .gsp-card{flex:none;width:min(1040px,82vw);scroll-snap-align:start;display:grid;grid-template-rows:auto minmax(0,1fr) auto;min-height:clamp(520px,44vw,660px);padding:clamp(20px,2.4vw,34px);border-radius:22px;background:var(--bg);color:var(--ink);transition:background-color .5s ease,color .5s ease;position:relative;overflow:hidden}
.gsp .gsp-card .gsp-top{display:grid;gap:4px}
.gsp .gsp-card .gsp-n{margin:0;font-size:12px;font-weight:800;letter-spacing:.14em;opacity:.7}
.gsp .gsp-card h3{margin:0;font-size:clamp(40px,5.4vw,84px);font-weight:800;letter-spacing:-.055em;line-height:.9;color:inherit}
.gsp .gsp-card .gsp-m{margin:4px 0 0;font-size:14px;font-weight:600;opacity:.78}
.gsp .gsp-card figure{margin:0;display:grid;place-items:center;min-height:0;overflow:visible}
.gsp .gsp-card img{display:block;width:auto;max-width:100%;height:clamp(240px,31vw,440px);object-fit:contain;transition:opacity .35s ease,transform .6s cubic-bezier(.2,.7,.2,1);filter:drop-shadow(0 30px 40px rgba(28,9,18,.18))}
.gsp .gsp-card img.out{opacity:0;transform:scale(.97)}
.gsp .gsp-card:hover img{transform:scale(1.015)}
.gsp .gsp-card .gsp-bar{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:14px 24px;align-items:end}
.gsp .gsp-card .gsp-looks span{display:block;margin-bottom:8px;font-size:13px;font-weight:700}
.gsp .gsp-card .gsp-pick{display:flex;gap:6px}
.gsp .gsp-card .gsp-pick button{padding:3px;border:2px solid transparent;border-radius:999px;background:transparent;cursor:pointer;transition:transform .2s ease}
.gsp .gsp-card .gsp-pick button:hover{transform:translateY(-2px)}
.gsp .gsp-card .gsp-pick button[aria-pressed=true]{border-color:currentColor}
.gsp .gsp-card .gsp-pick i{display:flex;width:56px;height:24px;border-radius:999px;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(28,9,18,.12)}
.gsp .gsp-card .gsp-pick b{flex:1}
.gsp .gsp-card .gsp-pr{margin:0;text-align:right}
.gsp .gsp-card .gsp-pr span{display:block;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;opacity:.7}
.gsp .gsp-card .gsp-pr b{display:block;font-size:clamp(22px,2.2vw,32px);font-weight:800;letter-spacing:-.03em;white-space:nowrap}
.gsp .gsp-card .gsp-pr small{display:block;font-size:12px;opacity:.75}
.gsp .gsp-card .gsp-go{display:inline-flex;align-items:center;gap:8px;min-height:52px;padding:0 22px;border-radius:999px;background:var(--ink);color:var(--bg)!important;font-weight:800;font-size:15px;text-decoration:none;white-space:nowrap;transition:transform .2s ease}
.gsp .gsp-card .gsp-go:hover{transform:translateY(-2px)}
.gsp .gsp-nav{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:18px}
.gsp .gsp-dots{display:flex;gap:6px;flex-wrap:wrap}
.gsp .gsp-dots button{width:28px;height:6px;padding:0;border:0;border-radius:999px;background:#D9CFD4;cursor:pointer;transition:background .2s ease,width .2s ease}
.gsp .gsp-dots button[aria-current=true]{width:48px;background:#47132D}
.gsp .gsp-arrows{display:flex;gap:8px}
.gsp .gsp-arrows button{width:52px;height:52px;border-radius:50%;border:1.5px solid #47132D;background:transparent;color:#47132D;font:700 20px/1 Arial,sans-serif;cursor:pointer}
.gsp .gsp-arrows button:hover{background:#47132D;color:#F4F1EE}
.gsp .gsp-arrows button:disabled{opacity:.25;cursor:default;background:transparent;color:#47132D}
.gsp .gsp-scope{margin:18px 0 0;font-size:13px;line-height:1.45;color:#6F5A66}
.gsp:not(.gsp-ready) .gsp-nav,.gsp:not(.gsp-ready) .gsp-pick{visibility:hidden}
@media (max-width:900px){.gsp .gsp-head{grid-template-columns:minmax(0,1fr)}.gsp .gsp-card{width:86vw;min-height:0}
 .gsp .gsp-card .gsp-bar{grid-template-columns:minmax(0,1fr) auto}.gsp .gsp-card .gsp-looks{grid-column:1/-1}.gsp .gsp-card .gsp-pr{text-align:left}
 .gsp .gsp-card figure{margin:10px -8px}.gsp .gsp-arrows{display:none}}
@media (prefers-reduced-motion:reduce){.gsp .gsp-card,.gsp .gsp-card img{transition:none}}
"""

body = f"""<section id="sporty" class="gsp" aria-labelledby="gfs-sporty">
<div class="gsp-in">
  <div class="gsp-head">
    <div><p class="gsp-k">Nawierzchnie sportowe · malowane we wzorach Gamefields</p><h2 id="gfs-sporty">Jeden plac.<br>Każda gra.</h2></div>
    <p class="gsp-lead">Nie tylko panna. Robimy <b>podłoża pod koszykówkę, padel, pickleball, teqball, siatkówkę, tenis i futsal</b>: płytę, nawierzchnię i linie w wymiarach dyscypliny, a pole gry malujemy we wzorze. Przewiń i wybierz wygląd.</p>
  </div>
</div>
<div class="gsp-track" data-gsp-track>{"".join(card_html(c) for c in cards)}</div>
<div class="gsp-in">
  <div class="gsp-nav"><div class="gsp-dots" data-gsp-dots></div><div class="gsp-arrows"><button type="button" data-gsp-prev aria-label="Poprzednia dyscyplina">←</button><button type="button" data-gsp-next aria-label="Następna dyscyplina">→</button></div></div>
  <p class="gsp-scope">Zakres: płyta betonowa z podbudową, nawierzchnia albo malowany wzór i linie; wyposażenia nie dostarczamy. Ceny orientacyjne „od”, netto, liczone jak w Studio 3D (metraż +10%). Ponad 1000 wzorów w <a href="#wzory">kolekcji</a>, areny do panny i 3 na 3 <a href="#boiska">niżej</a>.</p>
</div>
</section>"""

code = SH.stored(SH.minify(ESBUILD, HERE / "galeria.js"))
boot = SH.LOADER + "window.GFWRun(document.getElementById('gsp-src').textContent);"
assert "&&" not in boot
block = ("<!-- wp:html -->\n<!-- gf-blok: sporty -->\n<!-- SPORTY v4: gallery of surfaces for nine sports (28.11.2026), built by homepage/sporty-2026-11/build.py; images: renders/*.webp in the media library -->\n<style>"
         + CSS.strip() + "</style>\n" + body + "\n<script type=\"text/plain\" id=\"gsp-src\">" + code + "</script>\n<script>" + boot + "</script>\n<!-- /wp:html -->\n")
if "&&" in block:
    raise SystemExit("double ampersand would break in WordPress")
(HERE / "bloki").mkdir(exist_ok=True)
(HERE / "bloki" / "sporty.html").write_text(block, encoding="utf-8")
print(f"sporty.html {len(block)} bytes, {len(cards)} cards")
for c in cards:
    print(f'  {c["name"]:<16} {c["area"]} m²  ze wzorem {c["painted"]}  jednolity {c["plain"]}  | ' + " / ".join(lk["name"] for lk in c["looks"]))
