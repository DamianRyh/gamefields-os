#!/usr/bin/env python3
"""Compose the WordPress payload for the Gamefields "Studio" homepage (page 3462).

Output:
  homepage.html  Gutenberg wp:html block (the exact content.raw to send to WordPress)
  index.html     local preview shell; the CF7 shortcode is replaced by a minimal stand-in form

The 3D models and the sample photo are served by jsDelivr from this repository, pinned to ASSET_COMMIT,
so the published page never changes when the branch moves.
"""
import base64
import hashlib
import html as htmllib
import re
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
ASSET_COMMIT = "dc298dede4689c700ad901e78628a1938fd941b0"
REPO_BASE = f"https://cdn.jsdelivr.net/gh/DamianRyh/gamefields-os@{ASSET_COMMIT}/"
ASSET_BASE = REPO_BASE + "integrations/wordpress/homepage/studio-2026-11/assets/"
FONT = HERE / "assets" / "fonts" / "GHInter-sub.woff2"  # InterVariable subset: Latin + Polish + arrows (pyftsubset), 63 KB instead of 352 KB


def read(name):
    return (HERE / name).read_text(encoding="utf-8")


def prices_html():
    """Construction 'from' prices on the homepage, rendered from integrations/wordpress/offer/price-from.json."""
    data = json.loads((HERE.parent.parent / "offer" / "price-from.json").read_text(encoding="utf-8"))
    concrete = {m["id"]: m["net"] for m in json.loads((HERE.parent.parent / "offer" / "concrete-base.json").read_text(encoding="utf-8"))["models"]}
    paint = {m["id"]: m["net"]["plain"] for m in json.loads((HERE.parent.parent / "offer" / "surface-finish.json").read_text(encoding="utf-8"))["models"]}
    zl = lambda n: f"{n:,}".replace(",", " ") + " zł"
    rows = []
    for m in data["models"]:
        # Card layout (UX 2026-11-16): name and size, price, the "with surface" chip, then audience and the link.
        meta = " · ".join(x for x in [m["code"] or "wynajem i sprzedaż", m["dimensions"] if m["dimensions"] != "Różne" else "różne wymiary"] if x)
        who = m["forWhom"] or ""
        label = "Zobacz ofertę" if m["id"] == "mobile" else "Zaprojektuj"
        full = (f'<p class="full">Z nawierzchnią od {zl(m["constructionFromNet"] + concrete[m["id"]] + paint[m["id"]])} netto</p>'
                if m["id"] in concrete and m["id"] in paint else "")
        rows.append(f'<li><div class="name"><b>{htmllib.escape(m["name"])}</b><span>{htmllib.escape(meta)}</span></div>'
                    f'<div class="net"><b>od {zl(m["constructionFromNet"])}</b> <small>netto</small><span class="gross">od {zl(m["constructionFromGross"])} brutto</span></div>'
                    + full +
                    f'<div class="pfoot"><span class="who">{htmllib.escape(who)}</span><a class="go" href="{m["link"]}">{label} <span aria-hidden="true">→</span></a></div></li>')
    return '<ul class="prices" role="list">' + "".join(rows) + "</ul>", data


def surfaces_html():
    """Surface prices per m² (net) from the owner's price lists: concrete base and every finish, Standard to Premium."""
    fin = json.loads((HERE.parent.parent / "offer" / "surface-finish.json").read_text(encoding="utf-8"))
    base = json.loads((HERE.parent.parent / "offer" / "concrete-base.json").read_text(encoding="utf-8"))
    rng = lambda vs: f"{min(vs)}–{max(vs)}" if min(vs) != max(vs) else f"{vs[0]}"
    items = [("Płyta betonowa 12 cm z podbudową", str(base["rateNetPerM2"]), "podstawa pod każde wykończenie"),
             ("Malowanie farbą sportową", rng([v["netPerM2"] for v in fin["variants"]]), "jednokolorowe do wzoru zaawansowanego")]
    for key, name, note in [("acrylic", "Akryl Hard Court", "system warstwowy jak na kortach"), ("turf", "Sztuczna trawa", "z montażem na betonie"),
                            ("mats", "Maty gumowe", "ciągła nawierzchnia gumowa"), ("epdm", "Nawierzchnia EPDM wylewana", "PN-EN 14877"),
                            ("tiles", "Płytki sportowe PP", "szybki montaż bez klejenia"), ("rubber", "Płyty gumowe", "PN-EN 1177, atest PZH")]:
        items.append((name, rng([v["netPerM2"] for v in fin[key]["variants"]]), note))
    li = "".join(f'<li><b>{htmllib.escape(n)}</b><span class="rate">{r} zł/m² <small>netto</small></span><span>{htmllib.escape(t)}</span></li>' for n, r, t in items)
    return ('<details class="surf-rates"><summary>Nawierzchnie: ceny za m²</summary><ul role="list">' + li +
            '</ul><p>Warianty Standard, Standard+ i Premium. Metraż: powierzchnia konstrukcji z 10% zapasem. Dokładną cenę policzy Studio dla wybranego modelu.</p></details>')


def reals_html():
    """'Z boiska' (2026-11-16): four realizations as client cards (who ordered, model with its "from" price, link to the
    story on /realizacje-gamefields/), then a strip of more photos. Facts as on the Realizacje page."""
    price = {m["id"]: m for m in json.loads((HERE.parent.parent / "offer" / "price-from.json").read_text(encoding="utf-8"))["models"]}
    zl = lambda n: f"{n:,}".replace(",", "\u00a0") + "\u00a0zł"
    up = "/wp-content/uploads/"
    cards = [
        ("taras", "Miasto", "Warszawa, Park Świętokrzyski", "Taras pod Pałacem Kultury", "Trzy areny Panna Ring połączone z tarasem i rampą. Jedno z najpopularniejszych miejsc spotkań młodzieży.", "2024/12/Areny-Panna-Football-Alternative-Soccer-Warszawa-3-768x576.jpg", "w1"),
        ("kutno", "Miasto", "Kutno, pasaż sportowy", "Panna Octa w Kutnie", "Zamówienie Urzędu Miasta. „Realizacja przebiegła bez zastrzeżeń.”", "2025/06/IMG_6608-scaled-e1749983082809-768x696.jpg", "octagon"),
        ("krakow", "Park miejski", "Kraków", "Od planu do parku", "Panna Octa Cage 90 na terenie miejskim: projekt na planie, montaż, gotowa arena.", "2026/11/Krakow-Panna-Arena-Octa-Cage-90-Gamefields-768x768.jpg", "circle-cage-1"),
        ("wake", "Biznes", "Grodzisk Mazowiecki, park wakeboardowy", "Wake For Friends", "Arena na sztucznej trawie poszerzyła ofertę parku: na co dzień i na wydarzenia.", "2024/12/12-3-768x768.jpg", "circle-cage-2"),
    ]
    more = [
        ("2024/12/9-768x432.jpg", "Panna Ring na Orliku", "Grodzisk Mazowiecki, 10 lat w użyciu"),
        ("2026/11/Zyrardow-Panna-Arena-1v1--768x575.jpg", "Panna 1 na 1", "Żyrardów"),
        ("2026/11/Damian-Gawrych-x-Wake-for-friends--768x960.jpg", "Wake For Friends", "Gra na arenie nad wodą"),
        ("2026/11/12-768x574.jpg", "Event Head & Shoulders", "Złote Tarasy, Warszawa"),
        ("2026/11/1-768x576.jpg", "Event Head & Shoulders", "Stadion, Gdańsk"),
        ("2024/12/13-3-768x768.jpg", "Panna Ring", "Nowy Świat, Warszawa"),
        ("2024/12/15-3-768x768.jpg", "Panna Octa Cage 180", "Kraków"),
        ("2024/12/1-4-768x768.jpg", "Mistrzostwa Świata Street Soccer 2017", "Grodzisk Mazowiecki"),
        ("2024/12/22-768x432.jpg", "Mistrzostwa Świata Superball", "Liberec"),
        ("2024/12/10-3-768x768.jpg", "Puchar Polski", "Żerków"),
        ("2024/12/5-3-768x768.jpg", "Mistrzostwa Polski, Street Mekka", "Łódź"),
    ]
    c = "".join(
        f'<li><a class="rc" href="/realizacje-gamefields/#{cid}"><span class="rc-ph"><img src="{up}{img}" alt="{htmllib.escape(title)}, {htmllib.escape(place)}" width="768" height="576" loading="lazy" decoding="async"><span class="rc-who">{who}</span></span>'
        f'<span class="rc-tx"><span class="rc-place">{htmllib.escape(place)}</span><b>{htmllib.escape(title)}</b><span class="rc-lead">{htmllib.escape(lead)}</span>'
        f'<span class="rc-model">{htmllib.escape(price[mid]["name"])} · od {zl(price[mid]["constructionFromNet"])} netto</span><span class="rc-go">Historia realizacji →</span></span></a></li>'
        for cid, who, place, title, lead, img, mid in cards)
    m = "".join(f'<li><figure><img src="{up}{img}" alt="{htmllib.escape(t)}, {htmllib.escape(w)}" width="768" height="576" loading="lazy" decoding="async"><figcaption><b>{htmllib.escape(t)}</b><span>{htmllib.escape(w)}</span></figcaption></figure></li>' for img, t, w in more)
    return (f'<ul class="rcards" role="list">{c}</ul>'
            '<div class="rmore-h"><p class="m">Więcej z boisk</p><a href="/realizacje-gamefields/#eventy">Turnieje i eventy →</a></div>'
            f'<ul class="reals" role="list">{m}</ul>')


def paint_html():
    """'Stary beton. Nowe boisko.' price strip: the four painting variants from surface-finish.json (same as Studio and shop)."""
    fin = json.loads((HERE.parent.parent / "offer" / "surface-finish.json").read_text(encoding="utf-8"))
    li = "".join(f'<li><span class="pv-n">{htmllib.escape(v["name"])}</span><b>{v["netPerM2"]} zł/m²</b><span class="pv-d">{htmllib.escape(fin["descriptions"].get(v["id"], ""))}</span></li>' for v in fin["variants"])
    return ('<div class="pv"><div class="pv-h"><p class="m">Ile kosztuje malowanie</p><p>Ceny za m² netto, jak w Studio 3D i w sklepie. '
            'Naprawy podłoża wyceniam po zdjęciach. <a href="#materialy-wybor">Policz dla swojego boiska ↓</a></p></div>'
            f'<ol class="pv-list" role="list">{li}</ol></div>')


def materials_html():
    """'Poczuj różnicę' (2026-11-16): a surface picker with a zoomable texture, price per m², variants, facts
    and the cost for a chosen model (area incl. 10%, rounded up to 100 zł). Facts only from the price files'
    variant descriptions and the norms stated on the homepage. Swatches are links to the shop products."""
    fin = json.loads((HERE.parent.parent / "offer" / "surface-finish.json").read_text(encoding="utf-8"))
    base = json.loads((HERE.parent.parent / "offer" / "concrete-base.json").read_text(encoding="utf-8"))
    price = json.loads((HERE.parent.parent / "offer" / "price-from.json").read_text(encoding="utf-8"))
    up = "https://www.gamefields.eu/wp-content/uploads/2026/11/"
    tiers = ["Standard", "Standard+", "Premium"]
    var = lambda key: [{"n": tiers[i], "r": v["netPerM2"]} for i, v in enumerate(fin[key]["variants"])]
    items = [
        ("granulat", "Nawierzchnia EPDM", "wylewana", "nawierzchnia-epdm", var("epdm"),
         ["PN-EN 14877", "Natrysk wodoprzepuszczalny", "Trwałość od 8–12 do 12–20 lat, zależnie od wariantu"]),
        ("plytki", "Płytki sportowe PP", "modułowe", "plytki-sportowe", var("tiles"),
         ["Montaż bez klejenia, z drenażem", "Grubość od 15–18 mm do 19 mm+", "Premium: gwarancja 5–10 lat"]),
        ("trawa", "Sztuczna trawa", "klasyczna murawa", "sztuczna-trawa", var("turf"),
         ["Montaż na płycie betonowej", "Trzy warianty jakości", "Naturalny wybór do piłki"]),
        ("malowanie", "Malowanie farbą sportową", "na płycie lub starym placu", "malowanie-farba-sportowa",
         [{"n": v["name"], "r": v["netPerM2"]} for v in fin["variants"]],
         ["Farba z granulatem gumowym: amortyzacja i antypoślizg", "Wzory Signature, 4–6 i 7+ kolorów", "Linie do piłki, kosza i 3 na 3"]),
        ("akryl", "Akryl Hard Court", "jak na kortach", "akryl-hard-court", var("acrylic"),
         ["Standard: 4–6 warstw, ok. 1–2 mm", "Twardy i szybki", "Premium: warstwy gumowe 4–8 mm"]),
        ("plyty-gumowe", "Płyty gumowe", "bezpieczny upadek", "plyty-gumowe", var("rubber"),
         ["PN-EN 1177, atest PZH", "Antypoślizg R11, wodoprzepuszczalne", "Płyty 50 × 50 cm, 40–50 mm"]),
        ("maty-gumowe", "Maty gumowe", "ciągła guma", "maty-gumowe-nawierzchnia", var("mats"),
         ["SBR, w Premium z warstwą EPDM", "Antypoślizg R11", "Wykończenie płyty w Studio"]),
        ("beton", "Płyta betonowa 12 cm", "podstawa", "plyta-betonowa", [{"n": "za m²", "r": base["rateNetPerM2"]}],
         ["C20/25 ze spadkami i dylatacjami", "Siatka zbrojeniowa, podbudowa z kruszywa", "Gotowa pod każde wykończenie"]),
    ]
    models = [(m["name"], next(x["areaM2"] for x in base["models"] if x["id"] == m["id"])) for m in price["models"] if any(x["id"] == m["id"] for x in base["models"])]
    data = [{"k": k, "n": n, "t": t, "u": f"/product/{slug}/", "v": v, "f": f} for k, n, t, slug, v, f in items]
    first = data[0]
    sw = "".join(
        f'<a class="sw" href="{d["u"]}" data-mat="{i}"' + (' aria-current="true"' if i == 0 else "") + f'>'
        f'<img src="{up}{d["k"]}-macro-300x225.webp" alt="" width="300" height="225" loading="lazy" decoding="async">'
        f'<b>{htmllib.escape(d["n"])}</b><span>od {min(x["r"] for x in d["v"])} zł/m²</span></a>' for i, d in enumerate(data))
    opts = "".join(f'<option value="{a}"' + (" selected" if n == "Panna Play" else "") + f'>{htmllib.escape(n)} · {str(a).replace(".", ",")} m²</option>' for n, a in models)
    return (
        '<div class="matx" id="materialy-wybor" data-matx>'
        f'<div class="matx-stage" data-mat-stage><img data-mat-img src="{up}{first["k"]}-macro-1024x768.webp" '
        f'srcset="{up}{first["k"]}-macro-768x576.webp 768w, {up}{first["k"]}-macro-1024x768.webp 1024w, {up}{first["k"]}-macro.webp 1448w" '
        f'sizes="(max-width:900px) 100vw, 58vw" alt="{htmllib.escape(first["n"])} z bliska" width="1024" height="768" loading="lazy" decoding="async">'
        '<span class="matx-zoom m">Najedź, aby przybliżyć</span></div>'
        '<div class="matx-panel" aria-live="polite">'
        f'<p class="matx-tag m" data-mat-t>{htmllib.escape(first["t"])}</p><h3 data-mat-n>{htmllib.escape(first["n"])}</h3>'
        f'<p class="matx-price">od <b data-mat-p>{min(x["r"] for x in first["v"])} zł/m²</b> netto</p>'
        '<ul class="matx-f" data-mat-f role="list">' + "".join(f"<li>{htmllib.escape(x)}</li>" for x in first["f"]) + "</ul>"
        '<div class="matx-calc"><label for="gfs-mat-area">Policz dla boiska</label>'
        f'<select id="gfs-mat-area" data-mat-area>{opts}</select></div>'
        '<ul class="matx-v" data-mat-v role="list"></ul>'
        '<div class="matx-cta"><a class="pill" href="/studio/" style="background:var(--ink);color:var(--paper)">Wybierz w Studio <span aria-hidden="true">↗</span></a>'
        f'<a class="pill matx-more" data-mat-u href="{first["u"]}">Szczegóły i warianty</a></div>'
        '<p class="matx-note">Ceny orientacyjne netto. Koszt dla boiska: metraż konstrukcji z 10% zapasem, w górę do 100 zł. Wykończenie leży na płycie betonowej (osobna pozycja) albo na stabilnym placu.</p>'
        '</div>'
        f'<nav class="matx-sw" aria-label="Wybierz nawierzchnię">{sw}</nav>'
        '</div>'
        '<script type="application/json" id="gfs-mat-data">' + json.dumps(data, ensure_ascii=False) + '</script>'
        "<script>(function(){var box=document.querySelector('.gfs [data-matx]');if(!box)return;"
        "var D=JSON.parse(document.getElementById('gfs-mat-data').textContent);var UP='" + up + "';var cur=0;"
        "var q=function(s){return box.querySelector(s)};var img=q('[data-mat-img]'),stage=q('[data-mat-stage]'),area=q('[data-mat-area]');"
        "function fmt(n){return String(n).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'\\u00a0')}"
        "function render(){var d=D[cur],a=parseFloat(area.value)||0;q('[data-mat-n]').textContent=d.n;q('[data-mat-t]').textContent=d.t;"
        "var mn=Math.min.apply(null,d.v.map(function(x){return x.r}));q('[data-mat-p]').textContent=mn+' zł/m²';q('[data-mat-u]').href=d.u;"
        "q('[data-mat-f]').innerHTML=d.f.map(function(x){return '<li>'+x+'</li>'}).join('');"
        "q('[data-mat-v]').innerHTML=d.v.map(function(x){return '<li><span>'+x.n+'</span><b>'+x.r+' zł/m²</b><i>'+fmt(Math.ceil(a*x.r/100)*100)+' zł</i></li>'}).join('');}"
        "function pick(i){if(i===cur)return;cur=i;var d=D[i];stage.classList.add('swap');"
        "setTimeout(function(){img.srcset=UP+d.k+'-macro-768x576.webp 768w, '+UP+d.k+'-macro-1024x768.webp 1024w, '+UP+d.k+'-macro.webp 1448w';img.src=UP+d.k+'-macro-1024x768.webp';img.alt=d.n+' z bliska';stage.classList.remove('swap');},180);"
        "box.querySelectorAll('[data-mat]').forEach(function(s){if(+s.getAttribute('data-mat')===i)s.setAttribute('aria-current','true');else s.removeAttribute('aria-current')});render();}"
        "box.querySelectorAll('[data-mat]').forEach(function(s){s.addEventListener('click',function(e){if(e.metaKey||e.ctrlKey)return;e.preventDefault();pick(+s.getAttribute('data-mat'))})});"
        "area.addEventListener('change',render);"
        "stage.addEventListener('pointermove',function(e){var r=stage.getBoundingClientRect();stage.style.setProperty('--x',((e.clientX-r.left)/r.width*100)+'%');stage.style.setProperty('--y',((e.clientY-r.top)/r.height*100)+'%');stage.classList.add('zoom')});"
        "stage.addEventListener('pointerleave',function(){stage.classList.remove('zoom')});render();})();</script>"
    )


def jsonld(faq_html):
    """Structured data for the studio, its services and the FAQ. Facts only from the page itself, no prices."""
    qa = []
    for q, a in re.findall(r"<details><summary>(.*?)</summary><p>(.*?)</p></details>", faq_html, re.S):
        text = htmllib.unescape(re.sub(r"<[^>]+>", "", a)).strip()
        qa.append({"@type": "Question", "name": htmllib.unescape(q).strip(),
                   "acceptedAnswer": {"@type": "Answer", "text": text}})
    if len(qa) < 4:
        sys.exit("FAQ parse failed")
    site = "https://www.gamefields.eu/"
    services = [
        ("Projektowanie boisk miejskich", "Koncepcja miejsca gry: konstrukcja, nawierzchnia i grafika projektowane jako jeden przedmiot."),
        ("Modułowe boiska do panny i street footballu", "Panna Ring, Panna Play, Panna Court, Panna Octa, Panna Grid, Cage 90, Cage 180 i Street Arena 15."),
        ("Kolorowe nawierzchnie i grafika boisk", "Wzory nawierzchni malowanej, EPDM, płytek i trawy projektowane w Studiu 3D."),
        ("Modernizacja betonowych placów w kolorowe boiska", "Naprawa i gruntowanie starego betonu lub asfaltu, elastyczne farby sportowe z granulatem gumowym, wzór i linie do piłki, koszykówki i gry 3 na 3."),
        ("Plakaty boisk", "Plakat z wzorem nawierzchni i liniami boiska, projektowany w przeglądarce."),
        # ("Piłki we wzorze boiska", ...) — ukryte na start 2026-11-08, wraca razem z sekcją #pilka
    ]
    _, price_data = prices_html()
    offers = [{"@type": "Offer", "itemOffered": {"@type": "Product", "name": m["name"], **({"sku": m["code"]} if m["code"] else {})},
               "priceSpecification": {"@type": "PriceSpecification", "minPrice": m["constructionFromNet"], "priceCurrency": "PLN", "valueAddedTaxIncluded": False},
               "seller": {"@id": site + "#studio"}} for m in price_data["models"]]
    graph = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "ProfessionalService",
                "@id": site + "#studio",
                "name": "Gamefields",
                "alternateName": "Gamefields — autorskie studio boisk miejskich",
                "url": site,
                "email": "info@gamefields.eu",
                "image": "https://www.gamefields.eu/wp-content/uploads/2026/10/Gamefields-Panna-Play-wide-v3-default.webp",
                "description": "Projektowanie, renowacje i realizacje boisk miejskich: street football, boiska panna, kolorowe nawierzchnie, murale i modułowe areny dla miast, szkół, deweloperów i marek.",
                "founder": {"@type": "Person", "@id": site + "#damian-gawrych", "name": "Damian Gawrych", "url": site + "damian-gawrych/", "sameAs": ["https://www.instagram.com/damiangawrych/", "https://www.damiangawrych.pl/"]},
                "address": {"@type": "PostalAddress", "addressLocality": "Warszawa", "addressCountry": "PL"},
                "parentOrganization": {"@id": site + "#organization"},
                "knowsAbout": ["boiska do panny", "street football", "boiska miejskie", "nawierzchnie sportowe", "malowanie boisk", "renowacja boisk betonowych", "projektowanie przestrzeni sportowych"],
                "hasOfferCatalog": {
                    "@type": "OfferCatalog",
                    "name": "Usługi Gamefields",
                    "itemListElement": [
                        {"@type": "Offer", "itemOffered": {"@type": "Service", "name": n, "description": d, "provider": {"@id": site + "#studio"}}}
                        for n, d in services
                    ] + offers,
                },
            },
            {"@type": "FAQPage", "@id": site + "#pytania", "inLanguage": "pl-PL", "mainEntity": qa},
        ],
    }
    return '<script type="application/ld+json">' + json.dumps(graph, ensure_ascii=False, separators=(",", ":")) + "</script>"


def main():
    style = read("style.css")
    body = read("body.html")
    script = read("script.js")
    workshop = read("kept-workshop.html")
    faq, contact_scripts = read("kept-faq-contact.html").split("<!--CONTACT_SCRIPTS-->")

    if "&&" in script:
        sys.exit("script.js contains a double ampersand; WordPress would break it")
    for token in ("{{ASSET}}", "{{KEPT_WORKSHOP}}", "{{KEPT_FAQ}}"):
        if body.count(token) != 1 and token != "{{ASSET}}":
            sys.exit(f"missing {token}")

    prices_list, price_data = prices_html()
    wall_prices = json.dumps({m["id"]: m["constructionFromNet"] for m in price_data["models"]}, separators=(",", ":"))
    body = body.replace('<div class="wall" data-wall></div>', f"<div class=\"wall\" data-wall data-prices='{wall_prices}'></div>", 1)
    body = body.replace("{{PRICES}}", prices_list).replace("{{MATERIALS}}", materials_html()).replace("{{REALS}}", reals_html()).replace("{{PAINT}}", paint_html()).replace("{{SURFACES}}", surfaces_html())
    body = body.replace("{{ASSET}}", ASSET_BASE)
    body = body.replace("{{KEPT_WORKSHOP}}", workshop.strip())
    body = body.replace("{{KEPT_FAQ}}", faq.strip())
    # "Mapa możliwości" (2026-11-18): self-contained block (own scoped styles, data and script) built in
    # ../premium-2026-10-26 by build_possibilities_embed.py; it sits right before #kontakt, as on the live page.
    body = body.replace("{{MOZLIWOSCI}}", (HERE.parent / "premium-2026-10-26" / "possibilities-embed.html").read_text(encoding="utf-8").strip())
    body = body.replace(
        'data-homepage-version="studio-2026-11"',
        f'data-homepage-version="studio-2026-11" data-asset-base="{ASSET_BASE}" data-repo-base="{REPO_BASE}"',
        1,
    )

    # Court Art Pro engine for the poster lab. It contains double ampersands, which WordPress would break,
    # so it ships base64-encoded and is decoded in the browser into window.GFPRO.
    eng = (HERE.parent.parent.parent / "studio" / "surface-pro-2026-11" / "court-art-pro.mjs").read_text(encoding="utf-8").replace("\nexport ", "\n")
    sig = (HERE.parent.parent.parent / "studio" / "surface-pro-2026-11" / "signature-pro.json").read_text(encoding="utf-8")
    eng = eng.replace("export ", "", 1) if eng.startswith("export ") else eng
    eng = "(function(){" + eng + "\nwindow.GFPRO={renderPro:renderPro,courtLines:courtLines,recommendLineColor:recommendLineColor,lightness:lightness,mix:mix,PRO_FAMILIES:PRO_FAMILIES.map(function(f){return {id:f.id,name:f.name,short:f.short,group:f.group,description:f.description,inspiration:f.inspiration,masking:f.masking}}),PRO_PALETTES:PRO_PALETTES,SIG:" + sig.strip() + "};})();"
    eng_b64 = base64.b64encode(eng.encode("utf-8")).decode("ascii")
    loader = ('<script>(function(){try{var b=atob("' + eng_b64 + '"),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);'
              '(0,eval)(new TextDecoder().decode(u));}catch(e){console.warn("GFPRO",e)}})();</script>')

    font = base64.b64encode(FONT.read_bytes()).decode("ascii")
    font_face = ("@font-face{font-family:GHInter;font-style:normal;font-weight:100 900;font-display:swap;"
                 f"src:url(data:font/woff2;base64,{font}) format('woff2')}}")

    # On WordPress the Gamefields theme already serves (and preloads) the same subset as a cached file,
    # so the page links that file instead of carrying 84 KB of base64. The local preview keeps the inline font.
    THEME_FONT_FACE = ("@font-face{font-family:GHInter;font-style:normal;font-weight:100 900;font-display:swap;"
                       "src:url(/wp-content/themes/gamefields/assets/fonts/GHInter-sub.woff2) format('woff2')}")
    ball_core = (HERE.parent.parent.parent / "studio" / "ball-2026-11" / "ball-core.js").read_text(encoding="utf-8").strip()
    # On WordPress the three big scripts are cached files in the Gamefields theme, loaded with `defer` in this order
    # (pattern engine -> ball core -> page script); a file is not touched by WordPress, so no base64 wrapper is needed.
    # The theme must be uploaded before the page content that points at a new hash.
    jsdir = HERE.parent.parent / "theme" / "gamefields" / "assets" / "js" / "home"
    jsdir.mkdir(parents=True, exist_ok=True)
    files = [("gf-pro.js", eng), ("gf-ball-core.js", ball_core), ("gf-home.js", script.strip())]
    tags = []
    served = {}
    # gf-home.js is owned by the theme since hero R3 (PR #63, 2026-11-08): the hero code lives only there, so the build
    # no longer overwrites it and versions the theme file as it is. script.js stays as the historical source.
    # gf-pro.js likewise (2026-11-11): the deployed theme file is newer than surface-pro-2026-11, so the build keeps it as is.
    THEME_OWNED = {"gf-home.js", "gf-pro.js"}
    for name, code in files:
        if name in THEME_OWNED and (jsdir / name).exists():
            code = (jsdir / name).read_text(encoding="utf-8").rstrip("\n")
        else:
            (jsdir / name).write_text(code + "\n", encoding="utf-8")
        served[name] = code
        ver = hashlib.sha1(code.encode("utf-8")).hexdigest()[:10]
        tags.append(f'<script defer src="/wp-content/themes/gamefields/assets/js/home/{name}?v={ver}"></script>')
    # Since 2026-11-16 the page is a list of small wp:html blocks, one per section, so that a later change
    # replaces one small block instead of the whole page. Each block starts with "<!-- gf-blok: NAME -->";
    # the wrapper <div class="gfs"> opens in "naglowek" and closes in "kontakt", which WordPress keeps as is.
    # Every block is also written to bloki/NN-NAME.html, so a deployment can point at a single raw file.
    parts = re.split(r"<!--GF-BLOK:([a-z0-9-]+)-->", body.strip())
    sections = [("naglowek", parts[0])] + list(zip(parts[1::2], parts[2::2]))
    styl = "\n".join([
        "<!-- Gamefields homepage studio-2026-11 · source: integrations/wordpress/homepage/studio-2026-11 · Inter SIL OFL: https://rsms.me/inter/ -->",
        f"<style>{THEME_FONT_FACE}\n{style}</style>",
        jsonld(faq),
    ])

    def assemble(script_part):
        blocks = [("styl", styl)] + sections + [("skrypty", "\n".join(script_part + [contact_scripts.strip()]))]
        return blocks, "\n\n".join(f"<!-- wp:html -->\n<!-- gf-blok: {n} -->\n{c.strip()}\n<!-- /wp:html -->" for n, c in blocks) + "\n"

    blocks, block = assemble(tags)
    # The local preview loads the same page script as WordPress (the theme file, by relative path; serve the
    # integrations/wordpress folder over http and open homepage/studio-2026-11/index.html).
    _, inline_block = assemble([loader, "<script>" + ball_core + "</script>", '<script defer src="../../theme/gamefields/assets/js/home/gf-home.js"></script>'])
    out = HERE / "bloki"
    out.mkdir(exist_ok=True)
    for f in out.glob("*.html"):
        f.unlink()
    for i, (n, c) in enumerate(blocks, 1):
        (out / f"{i:02d}-{n}.html").write_text(f"<!-- wp:html -->\n<!-- gf-blok: {n} -->\n{c.strip()}\n<!-- /wp:html -->\n", encoding="utf-8")
    (HERE / "homepage.html").write_text(block, encoding="utf-8")

    stand_in = ('<form class="wpcf7-form" onsubmit="event.preventDefault()">'
                '<p><label>E-mail<input type="email" name="your-email"></label></p>'
                '<p><label>Szczegóły projektu<textarea name="project-details" rows="3"></textarea></label></p>'
                '<p><input type="submit" value="Wyślij zapytanie"></p></form>')
    preview = inline_block.replace(THEME_FONT_FACE, font_face).replace('[contact-form-7 id="a71dc3a" title="Gamefields — zapytanie o projekt"]', stand_in)
    preview = preview.replace("<!-- wp:html -->", "").replace("<!-- /wp:html -->", "")
    (HERE / "index.html").write_text(
        '<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        "<title>Gamefields — podgląd lokalny</title></head><body>" + preview + "</body></html>\n",
        encoding="utf-8",
    )
    print(f"homepage.html {len(block)} bytes, {len(blocks)} blocks")


if __name__ == "__main__":
    main()
