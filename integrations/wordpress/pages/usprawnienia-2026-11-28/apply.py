#!/usr/bin/env python3
"""Targeted live edits after Wzory polskie went live in the Studio (28.11.2026).

python3 apply.py           -> dry run: fetches the live pages, applies the edits in memory, writes out/*.html, prints a report
python3 apply.py --deploy  -> the same, then POSTs each changed page (re-fetching it first: it must not have changed since the dry run)

Every edit is an exact string replacement with an expected count; a page whose text differs is skipped and reported.
"""
import hashlib, html, json, pathlib, subprocess, sys, urllib.request

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE / "out"; OUT.mkdir(exist_ok=True)
ENGINE = HERE.parents[2] / "studio" / "surface-pro-2026-11"
API = "https://www.gamefields.eu/wp-json/wp/v2/pages/"
DEPLOY = "--deploy" in sys.argv

def get(pid):
    with urllib.request.urlopen(API + f"{pid}?context=edit&_fields=id,slug,modified,content") as r:
        d = json.load(r); return d["content"]["raw"], d["modified"], d["slug"]

def post(pid, content):
    req = urllib.request.Request(API + str(pid), data=json.dumps({"content": content}).encode(), method="POST", headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as r: return r.status

# pattern previews for the audience sections
js = r"""
import { PRO_PALETTES, renderPro, courtLines, recommendLineColor, composerMetrics } from './court-art-pro.mjs';
const pal = Object.fromEntries(PRO_PALETTES.map((p) => [p.id, p.colors]));
const slim = (s) => s.replace(/(\d+\.\d)\d+/g, '$1');
const L = JSON.parse(process.argv[1]); const out = {};
for (const [f, v, p, name] of L) { const m = composerMetrics(f, v, pal[p], { area: 150 }); out[f + ':' + v] = { name, f, v, p, paints: m && m.colors, tape: m && m.tape,
  svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" role="img" aria-label="' + name + '">' + slim(renderPro(f, v, 400, pal[p], { uid: 'x' + f.replace(/\W/g, '') + v }) + courtLines(400, recommendLineColor(pal[p]))) + '</svg>' }; }
process.stdout.write(JSON.stringify(out));
"""
AUD = {  # page id: (heading line, [(family, variant, palette, name), ...])
    3701: ("Szkoła i dzieci", [("pro-p-ceramika", 6, "nihon", "Ceramika"), ("pro-m-words", 8, "swiss", "Nasze boisko")]),
    3464: ("Miasto i park", [("pro-m-landscape", 1, "simultane", "Pejzaż"), ("pro-p-wycinanka", 3, "simultane", "Wycinanka")]),
    3702: ("Osiedle", [("pro-k-echo", 4, "swiss", "Echo"), ("pro-p-pasiak", 1, "albers", "Pasiak")]),
    3703: ("Klub i turniej", [("pro-p-kilim", 8, "stijl", "Kilim"), ("pro-k-chevron", 6, "aicher", "Szewrony")]),
    3704: ("Marka i kampania", [("pro-m-cutouts", 3, "ndebele", "Wycinanki"), ("pro-m-textile", 1, "gees-bend", "Tkanina")]),
    3725: ("Event i nocne granie", [("pro-p-neon", 1, "nightshift", "Neon"), ("pro-m-strokes", 3, "stella", "Pociągnięcia")]),
}
spec = [x for _, (_, l) in AUD.items() for x in l]
PV = json.loads(subprocess.run(["node", "--input-type=module", "-e", js, json.dumps(spec)], cwd=ENGINE, capture_output=True, text=True, check=True).stdout)
studio = lambda f, v, p: f"/studio/?arena=p1&amp;pattern={f}&amp;variant={v}&amp;palette={p}"

def audience(pid):
    head, items = AUD[pid]
    cards = "".join(f'<li><a href="{studio(f, v, p)}"><span class="ph" aria-hidden="true">{PV[f + ":" + str(v)]["svg"]}</span><span class="tx"><b>{html.escape(n)}</b>'
                    f'<span class="ms">{PV[f + ":" + str(v)]["paints"]} farb · ok. {PV[f + ":" + str(v)]["tape"]} m taśmy na 15 × 10 m</span><span class="go">Otwórz w Studio ↗</span></span></a></li>'
                    for f, v, p, n in items)
    return f"""<style>.gfx-wz{{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1.1fr);gap:12px;align-items:stretch}}
.gfx-wz ul{{display:contents;list-style:none;margin:0;padding:0}}.gfx-wz li{{list-style:none;margin:0;padding:0}}
.gfx-wz a{{display:flex;flex-direction:column;height:100%;background:#fff;border:1px solid var(--line,#DCD2D6);text-decoration:none;overflow:hidden}}
.gfx-wz a:hover{{border-color:var(--violet,#6336F5)}}.gfx-wz .ph svg{{display:block;width:100%;height:auto}}
.gfx-wz .tx{{display:grid;gap:4px;padding:14px 16px}}.gfx-wz b{{font-size:19px;letter-spacing:-.02em}}.gfx-wz .ms{{font-size:12.5px;font-weight:700;color:#5A4652}}
.gfx-wz .go{{color:var(--violet,#6336F5);font-weight:800;font-size:14px}}
.gfx-wz .more{{display:flex;flex-direction:column;justify-content:center;gap:10px;padding:22px;background:#fff;border:1px solid var(--line,#DCD2D6)}}
.gfx-wz .more p{{margin:0;color:var(--muted,#6F5A66);font-size:15px}}
.gfx-wz .gfx-btn{{height:auto;flex-direction:row;border:0;overflow:visible;align-self:flex-start;display:inline-flex;align-items:center;min-height:48px;padding:0 22px;border-radius:999px;background:var(--violet,#6336F5);color:#fff;font-weight:800;font-size:16px;text-decoration:none}}.gfx-wz .gfx-btn:hover{{filter:brightness(1.08)}}
@media (max-width:900px){{.gfx-wz{{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}}.gfx-wz .more{{grid-column:1/-1}}}}
@media (max-width:560px){{.gfx-wz{{grid-template-columns:minmax(0,1fr)}}}}</style>
<section class="gfa-sec" id="wzor"><div class="w">
  <div class="gfa-head"><div><p class="k">Wzór nawierzchni</p><h2 class="d">Boisko z charakterem.</h2></div><p>Dwa wzory, które dobrze pracują w tym miejscu ({html.escape(head.lower())}). Każdy sprawdzony do malowania: min. 20 cm pasa, 3–5 farb, czytelne linie gry.</p></div>
  <div class="gfx-wz"><ul role="list">{cards}</ul><div class="more"><p>Ponad 1000 wzorów w Studio 3D: wzory polskie, murale, Kompozytor i Masters. Do każdego plan malowania dla wykonawcy.</p><a class="gfx-btn" href="/wzory-na-boisko/">Wszystkie wzory →</a></div></div>
</div></section>

"""

OF_OLD, OF_NEW = "kolorów, złożone grafiki (Organic Flow, gradienty)", "kolorów albo złożone grafiki (murale, gradienty)"
EDITS = {  # page id: [(old, new, expected count)]
    3686: [(OF_OLD, OF_NEW, 1)], 3685: [(OF_OLD, OF_NEW, 1)], 3713: [(OF_OLD, OF_NEW, 1)],
    3462: [(OF_OLD, OF_NEW, 1), ('<a class="gfw-tile s6 tall" href="/wzory-na-boisko/#polskie"', '<a class="gfw-tile s6 tall" href="' + studio("pro-p-wycinanka", 3, "simultane") + '"', 1)],
    3689: [("<dd>732<small>61 kierunków × 12 wariantów</small>", "<dd>1116<small>93 kierunki × 12 wariantów</small>", 1), ("<li>732 wzory w 12 wariantach</li>", "<li>1116 wzorów w 12 wariantach</li>", 1)],
    3702: [("wzór nawierzchni: 732 wzory w 12 wariantach, z paletami.", "wzór nawierzchni: 1116 wzorów w 12 wariantach, z paletami.", 2),
           ("<dd>732<small>wzory nawierzchni w Studio</small>", "<dd>1116<small>wzorów nawierzchni w Studio</small>", 1),
           ("<span>732 wzory w 12 wariantach, w tym 8 kierunków Masters II.</span>", "<span>1116 wzorów w 12 wariantach, w tym wzory polskie i murale.</span>", 1)],
}
for pid in AUD: EDITS.setdefault(pid, []).append(('<section class="gfa-cta">', "AUDIENCE", 1))

report, plan = [], {}
ONLY = [int(a.split('=')[1]) for a in sys.argv if a.startswith('--only=')]
for pid, edits in EDITS.items():
    if ONLY and pid not in ONLY: continue
    raw, mod, slug = get(pid); new = raw; ok = True
    for old, rep, n in edits:
        c = new.count(old)
        if c != n: report.append(f"SKIP {pid} {slug}: expected {n}× «{old[:60]}», found {c}"); ok = False; break
        new = new.replace(old, audience(pid) + old if rep == "AUDIENCE" else rep)
    if not ok: continue
    if pid in AUD and new.count('id="wzor"') != 1: report.append(f"SKIP {pid}: audience section count"); continue
    (OUT / f"{pid}-{slug}.before.html").write_text(raw, encoding="utf-8"); (OUT / f"{pid}-{slug}.after.html").write_text(new, encoding="utf-8")
    plan[pid] = (slug, hashlib.sha256(raw.encode()).hexdigest(), new)
    report.append(f"OK   {pid} {slug}: {len(edits)} edit(s), {len(raw)} -> {len(new)} chars")
print("\n".join(report))
if DEPLOY:
    for pid, (slug, sha, new) in plan.items():
        raw, _, _ = get(pid)
        if hashlib.sha256(raw.encode()).hexdigest() != sha: print("CHANGED since dry run, not saved:", pid, slug); continue
        st = post(pid, new); after, _, _ = get(pid)
        print("SAVED" if st == 200 and after == new else "CHECK", pid, slug, st)
