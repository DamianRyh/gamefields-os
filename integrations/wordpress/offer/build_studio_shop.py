#!/usr/bin/env python3
"""Shop catalogue = Studio catalogue (2026-11-16).

Builds theme/gamefields/data/studio-shop.json from the same price files the Studio and the homepage use:
  price-from.json      construction "from" prices of the 8 Studio models (net and gross)
  concrete-base.json   concrete slab rate per m² and the slab price per model
  surface-finish.json  finishes per m² (painting variants, EPDM, tiles, turf, acrylic, rubber slabs, mats)
  media.json           model images in the WordPress media library

The theme (inc/studio-shop.php) creates or updates one WooCommerce product per entry, hides the old
catalogue (never deletes it) and redirects old product URLs. Sale prices only; never production costs.
Run after any price change:  python3 integrations/wordpress/offer/build_studio_shop.py
"""
import hashlib
import json
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE.parent / "theme" / "gamefields" / "data" / "studio-shop.json"
STUDIO_SITE = "https://gamefields-studio.ryhfs90.chatgpt.site"
RAW_CAT = "https://raw.githubusercontent.com/DamianRyh/gamefields-os/main/integrations/studio/canvas-editor/public/surfaces/catalogue/"
VAT = 1.23

SHAPE = {"w1": "okragle", "o1": "okragle", "circle-cage-1": "okragle", "circle-cage-2": "okragle",
         "octagon": "oktagony", "p1": "prostokatne", "street-field": "prostokatne", "street15": "prostokatne"}
SLUG = {"w1": "panna-ring", "o1": "panna-play", "p1": "panna-court", "octagon": "panna-octa",
        "street-field": "panna-grid", "circle-cage-1": "panna-octa-cage-90", "circle-cage-2": "panna-octa-cage-180",
        "street15": "street-arena-15"}

# Showroom on /shop/ (2026-11-16): brand colours and transparent renders as on the homepage collection tiles;
# rotating 3D only for the four light models the theme already serves (hero-r3, 0.4-3.3 MB).
UP11 = "https://www.gamefields.eu/wp-content/uploads/2026/11/"
LOOK = {
    "circle-cage-1": ("#D23A26", "#FFFFFF", "gf-cage90", "", "Ø ~6 m · banda 0,90 m"),
    "circle-cage-2": ("#D8F24A", "#1F2A6B", "gf-cage180", "", "Ø ~6 m · banda 1,80 m"),
    "o1": ("#2457D6", "#FFFFFF", "gf-play", "panna-play.glb", "Ø ~6 m · do 1,52 m · 1 na 1"),
    "p1": ("#FFB3C8", "#47132D", "gf-court", "panna-court.glb", "7,14 × 5,57 m · do 1,22 m"),
    "octagon": ("#47132D", "#F4F1EE", "gf-octa", "panna-octa.glb", "4,96 m · 1,22 m · oktagon"),
    "street-field": ("#E8E1D8", "#47132D", "gf-grid", "", "6,21 × 4,65 m"),
    "w1": ("#6336F5", "#FFFFFF", "gf-ring", "panna-ring.glb", "Ø ~5 m · 1 m"),
    "street15": ("#1F2A6B", "#FFFFFF", "gf-street15", "", "15 × 10 m · 3 na 3"),
}
SURF_LOOK = {"GF-NW-001": "Podstawa", "GF-NW-002": "Na beton i stary plac", "GF-NW-003": "PN-EN 14877",
             "GF-NW-004": "Montaż bez klejenia", "GF-NW-005": "Klasyczna murawa", "GF-NW-006": "Jak na kortach",
             "GF-NW-007": "PN-EN 1177, atest PZH", "GF-NW-008": "Ciągła guma"}

# Old WooCommerce products (catalogue from before the Studio, checked 2026-11-16). Hidden, never deleted.
# Their URLs redirect (301) to the matching Studio product, or to the shop.
LEGACY = {251: "", 250: "", 249: "", 248: "", 245: "", 239: "", 238: "", 232: "", 230: "",
          2769: "plyta-betonowa", 2770: "sztuczna-trawa", 2790: "", 2788: "", 2791: "", 236: ""}
# Creator products: stay available to the homepage creators, but not listed in the shop catalogue.
CATALOG_HIDDEN = [4393]


def zl(n):
    return f"{n:,.0f}".replace(",", " ") + " zł"


def cost(area, rate):
    return -(-int(round(area * rate * 100)) // 10000) * 100  # area × rate, rounded up to 100 zł (Studio rule)


def links(items):
    return '<ul class="gfk-links">' + "".join(f'<li><a href="{u}">{t}</a></li>' for t, u in items) + "</ul>"


def add_knowledge(products, load, fin, base):
    """'Wiedza' tab on every product page: parameters, what the price covers, surfaces for the model, guides.
    Facts only from the repository: public/catalog/products.json (approved model cards), the price files and the
    owner's statements on the homepage (12-month warranty, producers' documents, norms)."""
    cat = {p["code"]: p for p in json.loads((HERE.parent.parent.parent / "public" / "catalog" / "products.json").read_text(encoding="utf-8"))["products"]}
    arenas = [p for p in products if p["kind"] == "arena"]
    surfaces = [p for p in products if p["kind"] == "surface"]
    guides = [("Ile kosztuje budowa boiska sportowego?", "/ile-kosztuje-budowa-boiska-sportowego/"),
              ("Budowa boiska krok po kroku", "/budowa-boiska-krok-po-kroku/"),
              ("Jak wybrać nawierzchnię sportową", "/jak-wybrac-nawierzchnie-sportowa/"),
              ("Renowacja czy budowa nowego boiska?", "/renowacja-czy-budowa-nowego-boiska/"),
              ("Dofinansowanie boisk dla gmin i szkół", "/dofinansowanie-boisk/")]
    care = ("<h3>Gwarancja i dokumenty</h3><p>Rok gwarancji i stała opieka nad renowacją po odbiorze. "
            "Karty techniczne i certyfikaty producentów stali, farb i nawierzchni dołączam do oferty, wniosku o dofinansowanie "
            "i dokumentacji przetargowej.</p>")
    for p in arenas:
        c = cat[p["sku"]]
        area = p["show"]["areaM2"]
        rows = [("Kod", p["sku"]), ("Kształt", c["shape_label"]), ("Wymiary", c["dimension_label"]),
                ("Wysokość band", c["height_label"]), ("Wypełnienie", c["infill"]), ("Dla kogo", p["show"]["forWhom"] or "—"),
                ("Powierzchnia nawierzchni", f"{area:.1f} m² (konstrukcja + 10% zapasu)".replace(".", ","))]
        surf_rows = "".join(f'<tr><td><a href="/product/{s["slug"]}/">{s["name"]}</a></td><td>od {zl(cost(area, s["net"]))} netto</td></tr>' for s in surfaces)
        p["knowledge"] = (
            f'<div class="gfk"><p class="gfk-lead">{c["description"]}</p>'
            '<h3>Parametry</h3><dl class="gfk-spec">' + "".join(f"<div><dt>{a}</dt><dd>{b}</dd></div>" for a, b in rows) + "</dl>"
            "<h3>Co zawiera cena</h3><ul>"
            f"<li><b>Konstrukcja od {zl(p['net'])} netto</b> (od {zl(p['gross'])} brutto): bandy i bramki w podstawowej konfiguracji, standardowy kolor.</li>"
            f"<li><b>Z nawierzchnią od {zl(p['show']['fullNet'])} netto</b>: konstrukcja, płyta betonowa 12 cm z podbudową i malowanie jednokolorowe.</li>"
            "<li>Osobno, po zdjęciach placu: montaż, transport i przygotowanie terenu.</li></ul>"
            f"<h3>Nawierzchnia pod {p['name']}</h3><p>Ceny wykończeń dla {str(area).replace('.', ',')} m², wariant Standard. "
            "Wykończenie kładziemy na płycie betonowej (osobna pozycja) albo na istniejącym, stabilnym placu.</p>"
            f'<table class="gfk-table"><tbody>{surf_rows}</tbody></table>'
            + care +
            "<h3>Zanim zamówisz</h3><p>Sprawdź w planerze „Zmieści się?”, czy model mieści się na Twoim placu razem ze strefą bezpieczeństwa, "
            "a kolory, grafikę i nawierzchnię wybierz w Studio 3D.</p>"
            + links([("Planer „Zmieści się?”", "/#planer"), (f"{p['name']} w Studio 3D", p["url"])] + guides) + "</div>")
    notes = {
        "GF-NW-001": ("<h3>Co zawiera</h3><ul>" + "".join(f"<li>{x}</li>" for x in base["includes"]) + "</ul>"
                      "<h3>Czego nie zawiera</h3><ul>" + "".join(f"<li>{x}</li>" for x in base["excludes"]) + "</ul>"),
        "GF-NW-002": ("<h3>Jak maluję plac</h3><ol><li><b>Ocena placu.</b> Ze zdjęć i wymiarów sprawdzam pęknięcia, spadki, odwodnienie i stan betonu.</li>"
                      "<li><b>Naprawa i grunt.</b> Mycie, szlifowanie, wypełnienie rys i ubytków, grunt do betonu i warstwa wyrównująca.</li>"
                      "<li><b>Farby z gumą.</b> Elastyczna powłoka sportowa z granulatem gumowym: amortyzuje krok, nie ślizga się i przykrywa drobne rysy.</li>"
                      "<li><b>Wzór i linie.</b> Wzór Signature albo Twój projekt ze Studio 3D, linie do piłki, koszykówki i gry 3 na 3.</li></ol>"
                      "<p>Farby sportowe kładziemy na suchy beton przy dodatniej temperaturze, zwykle od wiosny do jesieni. "
                      "Naprawy podłoża wyceniam po oględzinach.</p>"),
        "GF-NW-003": "<p>Norma PN-EN 14877 (nawierzchnie poliuretanowe). Wersje natryskowe są wodoprzepuszczalne.</p>",
        "GF-NW-007": "<p>PN-EN 1177 i atest PZH, antypoślizg R11. Płyty są wodoprzepuszczalne.</p>",
        "GF-NW-008": "<p>Antypoślizg R11. Maty kładziemy jako wykończenie płyty betonowej w Studio; nie sprzedajemy ich osobno do samodzielnego montażu.</p>",
    }
    desc = {"GF-NW-002": fin.get("descriptions", {})}
    keys = {"GF-NW-003": "epdm", "GF-NW-004": "tiles", "GF-NW-005": "turf", "GF-NW-006": "acrylic", "GF-NW-007": "rubber", "GF-NW-008": "mats"}
    for p in surfaces:
        if p["sku"] == "GF-NW-002":
            var = [(v["name"], v["netPerM2"], fin["descriptions"].get(v["id"], "")) for v in fin["variants"]]
        elif p["sku"] in keys:
            var = [(v["name"], v["netPerM2"], v.get("description", "")) for v in fin[keys[p["sku"]]]["variants"]]
        else:
            var = [("Płyta 12 cm z podbudową", base["rateNetPerM2"], "Podstawa pod każde wykończenie.")]
        vt = "".join(f"<tr><td><b>{n}</b>{('<br><span>' + d + '</span>') if d else ''}</td><td>{r} zł/m² netto</td></tr>" for n, r, d in var)
        mt = "".join(f'<tr><td><a href="/product/{a["slug"]}/">{a["name"]}</a> · {str(a["show"]["areaM2"]).replace(".", ",")} m²</td><td>od {zl(cost(a["show"]["areaM2"], p["net"]))} netto</td></tr>' for a in arenas)
        p["knowledge"] = (
            '<div class="gfk"><h3>Warianty i ceny</h3>'
            f'<table class="gfk-table"><tbody>{vt}</tbody></table>'
            + notes.get(p["sku"], "") +
            "<h3>Cena dla boisk Gamefields</h3><p>Metraż: powierzchnia konstrukcji z 10% zapasem, cena zaokrąglona w górę do 100 zł, "
            "najtańszy wariant. Dokładną cenę dla Twojego projektu policzy Studio.</p>"
            f'<table class="gfk-table"><tbody>{mt}</tbody></table>'
            + care + links([("Wybierz w Studio 3D", "/studio/"), ("Malowanie boisk", "/malowanie-boisk/"), ("Renowacja boisk", "/renowacja-boisk/")] + guides) + "</div>")


def main():
    load = lambda n: json.loads((HERE / n).read_text(encoding="utf-8"))
    price, base, fin, media = load("price-from.json"), load("concrete-base.json"), load("surface-finish.json"), load("media.json")
    slab = {m["id"]: m["net"] for m in base["models"]}
    paint = {m["id"]: m["net"]["plain"] for m in fin["models"]}
    products = []
    order = 0
    for m in price["models"]:
        if m["id"] not in SLUG:  # the mobile event arena is a rental service, not a Studio model
            continue
        order += 1
        full = m["constructionFromNet"] + slab[m["id"]] + paint[m["id"]]
        short = (f"<p><strong>{m['code']}</strong> · {m['dimensions']}"
                 + (f" · {m['forWhom']}" if m["forWhom"] else "") + "</p>"
                 f"<p>Konstrukcja z bramkami w podstawowej konfiguracji i standardowym kolorze: od {zl(m['constructionFromNet'])} netto "
                 f"(od {zl(m['constructionFromGross'])} brutto).</p>"
                 f"<p>Z nawierzchnią od {zl(full)} netto: płyta betonowa 12 cm z podbudową i malowanie jednokolorowe, "
                 "liczone od powierzchni konstrukcji z 10% zapasem.</p>"
                 "<p>Montaż, transport i przygotowanie terenu policzę po zdjęciach placu. Kolory, grafikę i nawierzchnię wybierzesz w Studio 3D.</p>")
        products.append({
            "sku": m["code"], "slug": SLUG[m["id"]], "name": m["name"], "kind": "arena", "order": order,
            "net": m["constructionFromNet"], "gross": m["constructionFromGross"], "unit": "",
            "categories": ["boiska-sportowe-nowoczesne-rozwiazania-gamefields", SHAPE[m["id"]]],
            "button": "Zaprojektuj w Studio", "url": m["link"],
            "image": media[m["id"]], "short": short,
            "show": {"key": m["id"], "bg": LOOK[m["id"]][0], "ink": LOOK[m["id"]][1],
                     "render": UP11 + LOOK[m["id"]][2] + "-1200.webp", "renderSmall": UP11 + LOOK[m["id"]][2] + "-720.webp",
                     "glb": LOOK[m["id"]][3], "dims": LOOK[m["id"]][4], "fullNet": full,
                     "forWhom": m["forWhom"] or "", "areaM2": next(x["areaM2"] for x in base["models"] if x["id"] == m["id"])},
        })

    def surface(sku, slug, name, net_list, img, short, url="/studio/", variants=None):
        nonlocal order
        order += 1
        net = min(net_list)
        products.append({
            "sku": sku, "slug": slug, "name": name, "kind": "surface", "order": 100 + order,
            "net": net, "gross": round(net * VAT, 2), "unit": "m²",
            "categories": ["nawierzchnie-sportowe-profesjonalne-podloza-gamefields"],
            "button": "Wybierz w Studio", "url": url, "image": img, "short": short,
            "show": {"tag": SURF_LOOK[sku], "variants": variants or [{"name": "za m²", "net": net}],
                     "texture": img if isinstance(img, str) else ""},
        })

    rng = lambda vs: f"{min(vs)}–{max(vs)} zł/m² netto" if min(vs) != max(vs) else f"{vs[0]} zł/m² netto"
    note = "<p>Metraż: powierzchnia konstrukcji z 10% zapasem. Dokładną cenę dla wybranego modelu policzy Studio.</p>"
    surface("GF-NW-001", "plyta-betonowa", "Płyta betonowa 12 cm z podbudową", [base["rateNetPerM2"]], RAW_CAT + "beton-macro.webp",
            f"<p>Podstawa pod każde wykończenie: {base['rateNetPerM2']} zł/m² netto.</p>" + note)
    pv = [v["netPerM2"] for v in fin["variants"]]
    surface("GF-NW-002", "malowanie-farba-sportowa", "Malowanie farbą sportową", pv,
            RAW_CAT + "malowanie-macro.webp",
            "<p>Na płycie betonowej albo na istniejącym placu: " + ", ".join(f"{v['name'].lower()} {v['netPerM2']} zł/m²" for v in fin["variants"]) + " netto.</p>" + note,
            variants=[{"name": v["name"], "net": v["netPerM2"]} for v in fin["variants"]])
    for key, sku, slug, name, img in [
        ("epdm", "GF-NW-003", "nawierzchnia-epdm", "Nawierzchnia EPDM wylewana", "granulat-macro.webp"),
        ("tiles", "GF-NW-004", "plytki-sportowe", "Płytki sportowe PP", "plytki-macro.webp"),
        ("turf", "GF-NW-005", "sztuczna-trawa", "Sztuczna trawa", "trawa-macro.webp"),
        ("acrylic", "GF-NW-006", "akryl-hard-court", "Akryl Hard Court", "akryl-macro.webp"),
        ("rubber", "GF-NW-007", "plyty-gumowe", "Płyty gumowe", "plyty-gumowe-macro.webp"),
        ("mats", "GF-NW-008", "maty-gumowe-nawierzchnia", "Maty gumowe", "maty-gumowe-macro.webp"),
    ]:
        f = fin[key]
        vs = [v["netPerM2"] for v in f["variants"]]
        extra = f" Norma {f['norm']}." if f.get("norm") else ""
        surface(sku, slug, name, vs, f"{STUDIO_SITE}/surfaces/catalogue/{img}",
                f"<p>Wykończenie na płycie betonowej: {rng(vs)}, warianty Standard, Standard+ i Premium.{extra}</p>" + note,
                variants=[{"name": ["Standard", "Standard+", "Premium"][i] if i < 3 else v["name"], "net": v["netPerM2"]} for i, v in enumerate(f["variants"])])

    add_knowledge(products, load, fin, base)
    data = {"source": "integrations/wordpress/offer/build_studio_shop.py", "products": products,
            "legacy": {str(k): v for k, v in LEGACY.items()}, "catalogHidden": CATALOG_HIDDEN}
    data["version"] = hashlib.sha1(json.dumps(data, sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:12]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{OUT.relative_to(HERE.parent.parent.parent)}: {len(products)} products, version {data['version']}")


if __name__ == "__main__":
    main()
