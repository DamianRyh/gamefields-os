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
VAT = 1.23

SHAPE = {"w1": "okragle", "o1": "okragle", "circle-cage-1": "okragle", "circle-cage-2": "okragle",
         "octagon": "oktagony", "p1": "prostokatne", "street-field": "prostokatne", "street15": "prostokatne"}
SLUG = {"w1": "panna-ring", "o1": "panna-play", "p1": "panna-court", "octagon": "panna-octa",
        "street-field": "panna-grid", "circle-cage-1": "panna-octa-cage-90", "circle-cage-2": "panna-octa-cage-180",
        "street15": "street-arena-15"}

# Old WooCommerce products (catalogue from before the Studio, checked 2026-11-16). Hidden, never deleted.
# Their URLs redirect (301) to the matching Studio product, or to the shop.
LEGACY = {251: "", 250: "", 249: "", 248: "", 245: "", 239: "", 238: "", 232: "", 230: "",
          2769: "plyta-betonowa", 2770: "sztuczna-trawa", 2790: "", 2788: "", 2791: "", 236: ""}
# Creator products: stay available to the homepage creators, but not listed in the shop catalogue.
CATALOG_HIDDEN = [4393]


def zl(n):
    return f"{n:,.0f}".replace(",", " ") + " zł"


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
        })

    def surface(sku, slug, name, net_list, img, short, url="/studio/"):
        nonlocal order
        order += 1
        net = min(net_list)
        products.append({
            "sku": sku, "slug": slug, "name": name, "kind": "surface", "order": 100 + order,
            "net": net, "gross": round(net * VAT, 2), "unit": "m²",
            "categories": ["nawierzchnie-sportowe-profesjonalne-podloza-gamefields"],
            "button": "Wybierz w Studio", "url": url, "image": img, "short": short,
        })

    rng = lambda vs: f"{min(vs)}–{max(vs)} zł/m² netto" if min(vs) != max(vs) else f"{vs[0]} zł/m² netto"
    note = "<p>Metraż: powierzchnia konstrukcji z 10% zapasem. Dokładną cenę dla wybranego modelu policzy Studio.</p>"
    surface("GF-NW-001", "plyta-betonowa", "Płyta betonowa 12 cm z podbudową", [base["rateNetPerM2"]], {"fromProduct": 2769},
            f"<p>Podstawa pod każde wykończenie: {base['rateNetPerM2']} zł/m² netto.</p>" + note)
    pv = [v["netPerM2"] for v in fin["variants"]]
    surface("GF-NW-002", "malowanie-farba-sportowa", "Malowanie farbą sportową", pv,
            f"{STUDIO_SITE}/surfaces/p1/malowana-kolor.jpg",
            "<p>Na płycie betonowej albo na istniejącym placu: " + ", ".join(f"{v['name'].lower()} {v['netPerM2']} zł/m²" for v in fin["variants"]) + " netto.</p>" + note)
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
                f"<p>Wykończenie na płycie betonowej: {rng(vs)}, warianty Standard, Standard+ i Premium.{extra}</p>" + note)

    data = {"source": "integrations/wordpress/offer/build_studio_shop.py", "products": products,
            "legacy": {str(k): v for k, v in LEGACY.items()}, "catalogHidden": CATALOG_HIDDEN}
    data["version"] = hashlib.sha1(json.dumps(data, sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:12]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{OUT.relative_to(HERE.parent.parent.parent)}: {len(products)} products, version {data['version']}")


if __name__ == "__main__":
    main()
