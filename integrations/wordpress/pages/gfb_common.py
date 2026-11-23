"""Shared parts of the service pages in the .gfb style (Budowa boisk, Renowacja boisk, ...): CSS, data, helpers.

Prices only from integrations/wordpress/offer/*.json, same rounding as Studio and the shop.
"""
import html
import json
import math
import pathlib

PAGES = pathlib.Path(__file__).resolve().parent
OFFER = PAGES.parent / "offer"
UP = "https://www.gamefields.eu/wp-content/uploads/"
SITE = "https://www.gamefields.eu/"
BASE_CSS = (PAGES / "gfa-style.css").read_text(encoding="utf-8").split("\n", 1)[1]
load = lambda n: json.loads((OFFER / n).read_text(encoding="utf-8"))
PRICE, BASE, FIN = load("price-from.json"), load("concrete-base.json"), load("surface-finish.json")
SLAB = {m["id"]: m for m in BASE["models"]}
MODELS = [m for m in PRICE["models"] if m["id"] in SLAB]
MOBILE = next(m for m in PRICE["models"] if m["id"] == "mobile")
CHEAP = min(MODELS, key=lambda m: m["constructionFromNet"])
PLAY = next(m for m in MODELS if m["id"] == "o1")
PAINT = {m["id"]: m["net"]["plain"] for m in FIN["models"]}
SLUG = {"w1": "panna-ring", "o1": "panna-play", "p1": "panna-court", "street15": "street-arena-15", "circle-cage-1": "panna-octa-cage-90",
        "circle-cage-2": "panna-octa-cage-180", "street-field": "panna-grid", "octagon": "panna-octa"}
VAT = 1 + BASE["vatRate"]
TIERS = ["Standard", "Standard+", "Premium"]
# key in surface-finish.json (None = painting variants), name, macro image, shop slug, short note
SURF = [
    (None, "Malowanie farbą sportową", "malowanie", "malowanie-farba-sportowa", "na płycie albo na starym placu"),
    ("turf", "Sztuczna trawa", "trawa", "sztuczna-trawa", "klasyczna murawa do piłki"),
    ("acrylic", "Akryl Hard Court", "akryl", "akryl-hard-court", "twardy i szybki, jak na kortach"),
    ("epdm", "Nawierzchnia EPDM wylewana", "granulat", "nawierzchnia-epdm", "PN-EN 14877, wodoprzepuszczalna"),
    ("tiles", "Płytki sportowe PP", "plytki", "plytki-sportowe", "montaż bez klejenia, z drenażem"),
    ("mats", "Maty gumowe", "maty-gumowe", "maty-gumowe-nawierzchnia", "ciągła guma, antypoślizg R11"),
    ("rubber", "Płyty gumowe", "plyty-gumowe", "plyty-gumowe", "PN-EN 1177, atest PZH"),
]


def zl(n):
    return f"{n:,.0f}".replace(",", "\u00a0") + "\u00a0zł"


def cost(area, rate):
    """Same rounding as Studio, the shop and the knowledge base: area × rate, up to the next 100 zł."""
    return math.ceil(round(area * rate, 2) / 100) * 100


def variants(key):
    if key is None:
        return [{"n": v["name"], "r": v["netPerM2"]} for v in FIN["variants"]]
    return [{"n": TIERS[i], "r": v["netPerM2"]} for i, v in enumerate(FIN[key]["variants"])]


def rng(key):
    r = [v["r"] for v in variants(key)]
    return f"{min(r)}–{max(r)}"


def img(path, alt, cls="", eager=False, w=None, h=None):
    c = f' class="{cls}"' if cls else ""
    size = f' width="{w}" height="{h}"' if w else ""
    return f'<img{c} src="{UP}{path}" alt="{html.escape(alt)}"{size} loading="{"eager" if eager else "lazy"}" decoding="async">'


def faq_html(faq):
    return "".join(f"<details><summary>{html.escape(q)}</summary><p>{html.escape(a)}</p></details>" for q, a in faq)


def jump_html(items):
    return "".join(f'<li><a href="#{a}">{b}</a></li>' for a, b in items)


def write(here, name, css, ld, body, js=""):
    """One wp:html block (the whole page content) plus preview.html for a quick local look (not committed)."""
    out = ("<!-- wp:html -->\n<style>\n" + BASE_CSS + css + ".gfa .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}\n</style>\n"
           "<script type=\"application/ld+json\">" + json.dumps(ld, ensure_ascii=False, separators=(",", ":")) + "</script>\n"
           '<div class="gfa gfb">\n' + body.strip() + "\n" + js + "\n</div>\n<!-- /wp:html -->\n")
    if "&&" in out:
        raise SystemExit("double ampersand would break in WordPress")
    (here / f"{name}.html").write_text(out, encoding="utf-8")
    prev = out.replace("<!-- wp:html -->", "").replace("<!-- /wp:html -->", "")
    (here / "preview.html").write_text('<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
                                       f'<title>{name}, podgląd</title></head><body style="margin:0">' + prev + "</body></html>\n", encoding="utf-8")
    print(f"{name}.html {len(out)} bytes")
    return out


GFB_CSS = """
.gfb-hero{padding:clamp(28px,4vw,64px) 0 clamp(24px,3vw,40px)}
.gfb-hero .w.top{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,6fr);gap:clamp(20px,3vw,48px);align-items:end}
.gfb-hero h1{font-size:clamp(46px,6.4vw,112px)}
.gfb-hero .lead{max-width:36rem;margin:20px 0 0;font-size:clamp(17px,1.5vw,21px);color:var(--muted)}
.gfb-hero .gfa-btns{margin-top:24px}
.gfb-crumbs{margin:0 0 16px;font-size:13px;color:var(--muted)}.gfb-crumbs a{text-decoration:none}
.gfb-mosaic{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));grid-auto-rows:clamp(80px,8.4vw,140px);gap:8px;margin:0;padding:0;list-style:none}
.gfb-mosaic li{position:relative;overflow:hidden;background:#E6E0DA}
.gfb-mosaic img{width:100%;height:100%;object-fit:cover;display:block}
.gfb-mosaic li:nth-child(1){grid-column:span 4;grid-row:span 3}
.gfb-mosaic li:nth-child(2),.gfb-mosaic li:nth-child(3){grid-column:span 2;grid-row:span 1}
.gfb-mosaic li:nth-child(4){grid-column:span 2;grid-row:span 1}
.gfb-mosaic span{position:absolute;left:6px;bottom:6px;padding:4px 8px;background:rgba(28,9,18,.8);color:#fff;font-size:12px;font-weight:700}
.gfb-nums{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));margin:clamp(24px,3vw,40px) 0 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.gfb-nums div{padding:16px 16px 16px 0}
.gfb-nums div+div{padding-left:16px;border-left:1px solid var(--line)}
.gfb-nums dt{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.gfb-nums dd{margin:6px 0 0;font-size:clamp(24px,2.6vw,40px);font-weight:800;letter-spacing:-.04em;line-height:1}
.gfb-nums dd small{display:block;margin-top:6px;font-size:14px;font-weight:500;letter-spacing:0;color:var(--muted)}
.gfb-jump{position:sticky;top:calc(var(--wp-admin--admin-bar--height,0px) + 58px);z-index:5;background:rgba(244,241,238,.94);backdrop-filter:blur(8px);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.gfb-jump ul{display:flex;gap:8px;overflow-x:auto;margin:0;padding:10px 0;list-style:none;scrollbar-width:none}
.gfb-jump ul::-webkit-scrollbar{display:none}
.gfb-jump a{display:inline-flex;align-items:center;min-height:40px;padding:0 16px;border-radius:999px;border:1.5px solid #CDBFC6;text-decoration:none;font-weight:700;font-size:14px;white-space:nowrap}
.gfb-jump a:hover{border-color:var(--violet)}
.gfa-sec,.gfa-band{scroll-margin-top:120px}
/* paths */
.gfb-paths{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.gfb-paths a{display:flex;flex-direction:column;gap:10px;height:100%;padding:24px;background:#fff;border:1px solid var(--line);text-decoration:none;transition:border-color .2s ease,transform .25s ease}
.gfb-paths a:hover{border-color:var(--violet);transform:translateY(-3px)}
.gfb-paths .q{font-size:13px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--violet)}
.gfb-paths b{font-size:clamp(22px,2vw,30px);letter-spacing:-.035em;line-height:1.05}
.gfb-paths p{margin:0;color:var(--muted);font-size:15px}
.gfb-paths ul{margin:0;padding-left:18px;font-size:14px;color:#5A4652;display:grid;gap:4px}
.gfb-paths .pr{margin-top:auto;padding-top:12px;border-top:1px solid var(--line);font-weight:800;font-size:15px}
.gfb-paths .go{color:var(--violet);font-weight:800;font-size:14px}
/* price table */
.gfb-table{width:100%;border-collapse:collapse;background:#fff;font-size:15px}
.gfb-table th{text-align:left;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);padding:12px 14px;border-bottom:1px solid var(--line);font-weight:700}
.gfb-table td{padding:14px;border-top:1px solid var(--line);vertical-align:middle;color:#5A4652}
.gfb-table td b{color:var(--ink);font-size:16px}
.gfb-table td.r,.gfb-table th.r{text-align:right;white-space:nowrap}
.gfb-table td.r{font-weight:800;color:var(--ink)}
.gfb-table td.r small{display:block;font-weight:500;color:var(--muted);font-size:13px}
.gfb-table a{display:inline-flex;align-items:center;min-height:40px;padding:0 14px;border-radius:999px;border:1.5px solid #CDBFC6;text-decoration:none;font-weight:700;font-size:14px;white-space:nowrap}
.gfb-table a:hover{border-color:var(--violet)}
.gfb-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
.gfb-incl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:12px}
.gfb-incl > div{padding:20px 22px;background:#fff;border:1px solid var(--line)}
.gfb-incl ul{margin:8px 0 0;padding-left:20px;display:grid;gap:4px;color:#5A4652;font-size:15px}
.gfb-incl .k{margin:0}
.gfb-note{margin:12px 0 0;font-size:14px;color:var(--muted)}
/* calculator */
.gfb-calc{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:12px}
.gfb-calc form{display:grid;gap:18px;padding:clamp(20px,2.4vw,32px);background:#fff;border:1px solid var(--line)}
.gfb-calc label,.gfb-calc legend{display:block;margin:0 0 8px;font-size:13px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.gfb-calc fieldset{margin:0;padding:0;border:0;min-width:0}
.gfb-calc select,.gfb-calc input[type=number]{width:100%;min-height:52px;padding:0 14px;border:1.5px solid #CDBFC6;border-radius:10px;background:#fff;color:var(--ink);font:inherit;font-size:16px}
.gfb-calc select:focus,.gfb-calc input:focus{outline:3px solid #CFC2FF;border-color:var(--violet)}
.gfb-chips{display:flex;flex-wrap:wrap;gap:8px}
.gfb-chips label{display:inline-flex;align-items:center;gap:8px;min-height:44px;margin:0;padding:0 14px;border-radius:999px;border:1.5px solid #CDBFC6;font-size:14px;font-weight:700;letter-spacing:0;text-transform:none;color:var(--ink);cursor:pointer}
.gfb-chips input{accent-color:var(--violet);margin:0}
.gfb-chips label:has(input:checked){border-color:var(--violet);background:#EEE8FF}
.gfb-tog{display:grid;gap:8px}
.gfb-tog label{display:flex;align-items:flex-start;gap:10px;margin:0;padding:12px 14px;border:1.5px solid #CDBFC6;border-radius:10px;font-size:15px;font-weight:600;letter-spacing:0;text-transform:none;color:var(--ink);cursor:pointer}
.gfb-tog label small{display:block;font-weight:500;color:var(--muted);font-size:13px}
.gfb-tog input{accent-color:var(--violet);width:18px;height:18px;margin:2px 0 0;flex:none}
.gfb-tog label:has(input:checked){border-color:var(--violet)}
.gfb-tog label:has(input:disabled){opacity:.5;cursor:not-allowed}
.gfb-area[hidden]{display:none}
.gfb-out{display:flex;flex-direction:column;gap:14px;padding:clamp(20px,2.4vw,32px);background:var(--ink);color:var(--paper)}
.gfb-out .k{color:var(--lime);margin:0}
.gfb-out .sum{margin:0;font-size:clamp(40px,4.4vw,68px);font-weight:800;letter-spacing:-.05em;line-height:.95}
.gfb-out .sum small{display:block;margin-top:8px;font-size:15px;font-weight:500;letter-spacing:0;color:rgba(244,241,238,.78)}
.gfb-out dl{margin:0;border-top:1px solid rgba(244,241,238,.2)}
.gfb-out dl div{display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid rgba(244,241,238,.2);font-size:15px}
.gfb-out dt{color:rgba(244,241,238,.82)}.gfb-out dd{margin:0;font-weight:800;white-space:nowrap}
.gfb-out p{margin:0;font-size:14px;color:rgba(244,241,238,.78)}
.gfb-out .gfa-btns{margin-top:auto}
.gfb-out .gfa-btn{background:var(--lime);color:#1F2A6B!important}
.gfb-out .gfa-btn.alt{background:transparent;border:1.5px solid rgba(244,241,238,.5);color:var(--paper)!important}
/* steps */
.gfb-steps{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;counter-reset:s}
.gfb-steps li{display:flex;flex-direction:column;gap:8px;padding:22px;background:#fff;border:1px solid var(--line);counter-increment:s}
.gfb-steps li::before{content:counter(s,decimal-leading-zero);display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:#EEE8FF;color:var(--violet);font-weight:800}
.gfb-steps b{font-size:21px;letter-spacing:-.02em;line-height:1.1}
.gfb-steps p{margin:0;color:var(--muted);font-size:15px}
.gfb-steps .gf{margin-top:auto;padding:10px 12px;background:var(--paper);font-size:14px;color:var(--ink)}
.gfb-steps .gf::before{content:"U mnie: ";font-weight:800;color:var(--violet)}
.gfb-steps li.ph{padding:0;overflow:hidden}.gfb-steps li.ph::before{display:none}
.gfb-steps li.ph img{width:100%;height:100%;min-height:220px;object-fit:cover;display:block}
/* surfaces */
.gfb-surf{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.gfb-surf a{display:flex;flex-direction:column;height:100%;background:#fff;border:1px solid var(--line);text-decoration:none;overflow:hidden;transition:border-color .2s ease}
.gfb-surf a:hover{border-color:var(--violet)}
.gfb-surf img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;background:#E6E0DA;transition:transform .8s cubic-bezier(.2,.7,.2,1)}
.gfb-surf a:hover img{transform:scale(1.06)}
.gfb-surf .tx{display:grid;gap:4px;padding:14px 16px 16px;color:var(--ink)}
.gfb-surf b{font-size:18px;letter-spacing:-.02em}
.gfb-surf .nt{color:var(--muted);font-size:14px}
.gfb-surf .r{color:var(--ink);font-weight:800;font-size:15px}
/* municipalities band */
.gfb-docs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:0}
.gfb-docs div{padding:20px;border:1px solid rgba(244,241,238,.2)}
.gfb-docs dt{font-size:clamp(24px,2.4vw,36px);font-weight:800;letter-spacing:-.04em;line-height:1;color:#fff}
.gfb-docs dd{margin:10px 0 0;font-size:15px;color:rgba(244,241,238,.82)}
.gfb-norms{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0 0;padding:0;list-style:none}
.gfb-norms li{display:inline-flex;align-items:center;min-height:36px;padding:0 14px;border-radius:999px;border:1px solid rgba(244,241,238,.3);font-size:14px}
.gfb-norms b{color:var(--lime);margin-right:6px}
.gfa-band .gfa-links a{border-color:rgba(244,241,238,.4);color:var(--paper)}
.gfa-band .gfa-links a:hover{border-color:var(--lime)}
/* realizations */
.gfb-reals{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.gfb-reals a{display:flex;flex-direction:column;height:100%;background:#fff;border:1px solid var(--line);text-decoration:none;overflow:hidden}
.gfb-reals a:hover{border-color:var(--violet)}
.gfb-reals .ph{position:relative;aspect-ratio:4/3;overflow:hidden;background:#E6E0DA}
.gfb-reals .ph img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .8s cubic-bezier(.2,.7,.2,1)}
.gfb-reals a:hover .ph img{transform:scale(1.05)}
.gfb-reals .who{position:absolute;top:10px;left:10px;padding:5px 10px;border-radius:999px;background:var(--lime);color:#1F2A6B;font-weight:800;font-size:12px}
.gfb-reals .tx{display:grid;gap:4px;padding:16px 18px 18px}
.gfb-reals .pl{font-size:13px;color:var(--violet);font-weight:800}
.gfb-reals b{font-size:19px;letter-spacing:-.02em;line-height:1.15}
.gfb-reals .ld{color:var(--muted);font-size:14px}
.gfb-reals .md{margin-top:6px;font-size:14px;font-weight:700}
/* quote prep */
.gfb-prep{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.gfb-prep > div{padding:clamp(20px,2.4vw,32px);background:#fff;border:1px solid var(--line)}
.gfb-prep h3{font-size:clamp(24px,2.2vw,32px);font-weight:800;letter-spacing:-.035em;line-height:1.05;margin:0 0 12px}
.gfb-check{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.gfb-check li{display:grid;grid-template-columns:28px minmax(0,1fr);gap:10px;font-size:16px;color:#5A4652}
.gfb-check li::before{content:"✓";display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:var(--lime);color:#1F2A6B;font-weight:800;font-size:14px}
.gfb-check b{color:var(--ink)}
.gfb-prep .gfa-btns{margin-top:18px}
/* faq */
.gfa-faq{border-top:1px solid var(--line);max-width:960px}
.gfa-faq details{border-bottom:1px solid var(--line)}
.gfa-faq summary{display:flex;justify-content:space-between;gap:14px;list-style:none;cursor:pointer;padding:20px 4px;font-size:18px;font-weight:700}
.gfa-faq summary::-webkit-details-marker{display:none}
.gfa-faq summary::after{content:"+";font-size:24px;font-weight:400;color:var(--violet)}
.gfa-faq details[open] summary::after{content:"\\2212"}
.gfa-faq details p{max-width:780px;margin:0;padding:0 4px 22px;font-size:16px;color:var(--muted)}
/* guides and related */
.gfb-next{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.gfb-next a{display:grid;gap:6px;height:100%;padding:22px;background:#fff;border:1px solid var(--line);text-decoration:none;transition:border-color .2s ease}
.gfb-next a:hover{border-color:var(--violet)}
.gfb-next i{font-style:normal;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--violet)}
.gfb-next b{font-size:20px;letter-spacing:-.02em;line-height:1.15}.gfb-next span{color:var(--muted);font-size:15px}
.gfb-who{display:flex;flex-wrap:wrap;gap:8px;margin:20px 0 0;padding:0;list-style:none}
.gfb-who a{display:inline-flex;align-items:center;min-height:44px;padding:0 18px;border-radius:999px;background:#fff;border:1px solid var(--line);text-decoration:none;font-weight:700;font-size:15px}
.gfb-who a:hover{border-color:var(--violet)}
.gfb-who span{color:var(--muted);font-weight:600;margin-right:4px}
@media (max-width:1100px){.gfb-paths,.gfb-surf,.gfb-reals,.gfb-docs{grid-template-columns:repeat(2,minmax(0,1fr))}.gfb-steps{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:900px){
 .gfb-hero .w.top,.gfb-calc,.gfb-incl,.gfb-prep{grid-template-columns:minmax(0,1fr)}
 .gfb-nums{grid-template-columns:repeat(2,minmax(0,1fr))}.gfb-nums div:nth-child(3){padding-left:0;border-left:0}.gfb-nums div:nth-child(n+3){border-top:1px solid var(--line)}
 .gfb-next{grid-template-columns:minmax(0,1fr)}
 .gfb-table thead{display:none}.gfb-table,.gfb-table tbody,.gfb-table tr,.gfb-table td{display:block;width:100%}
 .gfb-table tr{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:6px 12px;padding:14px;border-top:1px solid var(--line)}
 .gfb-table td{padding:0;border:0}.gfb-table td:first-child{grid-column:1/-1}.gfb-table td.r{text-align:left}
 .gfb-table td.r::before{content:attr(data-l);display:block;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
 .gfb-table td:last-child{grid-column:1/-1}
}
@media (max-width:560px){.gfb-paths,.gfb-reals,.gfb-docs,.gfb-steps{grid-template-columns:minmax(0,1fr)}.gfb-surf{gap:8px}.gfb-surf .tx{padding:10px 12px 12px}.gfb-surf b{font-size:15px}.gfb-surf .nt{font-size:12px}.gfb-surf .r{font-size:13px}.gfb-mosaic{grid-auto-rows:64px}.gfb-steps li.ph{display:none}}
"""
