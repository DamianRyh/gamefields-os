#!/usr/bin/env python3
"""Price ranges (od–do, PLN netto) for the 8 standard Gamefields models, from the live Studio sales rate card.

Asks the production Studio /api/quote for every model × surface, once without a surface graphic and once with
a Signature pattern and sport lines. "od" = cheapest surface without graphic; "do" = most expensive surface with
graphic and lines. Both include construction, installation, design and transport as the rate card defines them.
Excluded (as in the rate card): site preparation, base, foundations, connections, permits.

Usage: python3 tools/pricing/price_ranges.py  →  writes integrations/wordpress/offer/price-ranges.json
"""
import json, math, pathlib, urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[2]
API = "https://gamefields-studio.ryhfs90.chatgpt.site/api/quote"
NAMES = {p["id"]: p for p in json.loads((ROOT / "integrations/studio/canvas-editor/public/catalog/product-names.json").read_text())["products"]}
# Default dimensions from integrations/studio/canvas-editor/lib/sport-profiles.ts
MODELS = [
    ("w1", "Piłka nożna 1×1", 4.99, 4.99, "circle", 4.99),
    ("o1", "Piłka nożna 1×1", 5.902, 5.902, "circle", 5.902),
    ("p1", "Piłka nożna 1×1", 7.139, 5.573, "rectangle", None),
    ("circle-cage-1", "Piłka nożna 1×1", 6, 6, "circle", 6),
    ("circle-cage-2", "Piłka nożna 1×1", 6, 6, "circle", 6),
    ("octagon", "Piłka nożna 1×1", 4.962, 4.962, "rectangle", None),
    ("street-field", "Piłka nożna 1×1", 6.214, 4.648, "rectangle", None),
    ("street15", "Piłka nożna 3×3", 15, 10, "rectangle", None),
]
SURFACES = ["Akryl sportowy", "EPDM", "Sztuczna trawa 60 mm", "Moduły sportowe", "Beton sportowy"]


def quote(model, sport, length, width, shape, diameter, surface, graphic):
    body = {"id": "q", "name": "Kalkulacja", "sport": sport, "length": length, "width": width, "surface": surface,
            "base": "#1d5147", "zone": "#d8ff77", "outside": "#dfe2db", "lineColor": "#ffffff", "lines": graphic,
            "pattern": "Organic Flow", "patternFamily": "organic-flow", "patternVariant": 1,
            "graphicOpacity": 100 if graphic else 0, "graphicScale": 100, "graphicRotation": 0, "scene": "day",
            "objects": [], "arenaModel": model, "courtShape": shape}
    if diameter:
        body["diameter"] = diameter
    req = urllib.request.Request(API, data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "User-Agent": "gamefields-price-ranges/1.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def main():
    out = {"source": API, "note": "Ceny orientacyjne netto (PLN) z karty stawek Studio. Bez przygotowania terenu, podbudowy, fundamentów, przyłączy i formalności.", "models": []}
    for model, sport, l, w, shape, d in MODELS:
        low = [quote(model, sport, l, w, shape, d, s, False) for s in SURFACES]
        high = [quote(model, sport, l, w, shape, d, s, True) for s in SURFACES]
        if any(q.get("status") != "estimated" for q in low + high):
            raise SystemExit(f"{model}: rate card incomplete")
        lo = min(q["priceNet"] for q in low)
        hi = max(q["priceNet"] for q in high)
        out["rateVersion"] = low[0]["rateVersion"]
        out["models"].append({
            "id": model, "name": NAMES[model]["name"], "code": NAMES[model]["code"],
            "areaM2": round(low[0]["area"], 1),
            "constructionNet": low[0]["constructionPrices"][model],
            "fromNet": lo, "toNet": hi,
            "fromNetRounded": int(math.floor(lo / 1000) * 1000), "toNetRounded": int(math.ceil(hi / 1000) * 1000),
            "bySurface": {s: {"bez grafiki": a["priceNet"], "z grafiką i liniami": b["priceNet"]} for s, a, b in zip(SURFACES, low, high)},
        })
        print(f'{NAMES[model]["name"]:<16} od {out["models"][-1]["fromNetRounded"]:>7} do {out["models"][-1]["toNetRounded"]:>7} zł netto')
    path = ROOT / "integrations/wordpress/offer/price-ranges.json"
    path.write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("zapisano", path.relative_to(ROOT))


if __name__ == "__main__":
    main()
