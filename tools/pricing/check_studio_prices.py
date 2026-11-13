#!/usr/bin/env python3
"""Compare construction prices in the live Studio (/api/quote) with the website prices (offer/price-from.json).

The Studio returns `constructionPrices` (sale price of each construction, after margin) with every quote.
Exit code 0 when every model matches within 1 zł, 1 otherwise.

Usage: python3 tools/pricing/check_studio_prices.py
"""
import json, pathlib, sys, urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[2]
API = "https://gamefields-studio.ryhfs90.chatgpt.site/api/quote"
BODY = {"id": "q", "name": "Kalkulacja", "sport": "Piłka nożna 1×1", "length": 5.902, "width": 5.902, "courtShape": "circle",
        "diameter": 5.902, "surface": "Akryl sportowy", "base": "#1d5147", "zone": "#d8ff77", "outside": "#dfe2db",
        "lineColor": "#ffffff", "lines": False, "pattern": "Organic Flow", "patternFamily": "organic-flow", "patternVariant": 1,
        "graphicOpacity": 0, "graphicScale": 100, "graphicRotation": 0, "scene": "day", "objects": [], "arenaModel": "o1"}

req = urllib.request.Request(API, data=json.dumps(BODY).encode(), headers={"Content-Type": "application/json", "User-Agent": "gamefields-price-check/1.0"})
with urllib.request.urlopen(req, timeout=30) as r:
    quote = json.load(r)
studio = quote.get("constructionPrices") or {}
site = {m["id"]: m for m in json.loads((ROOT / "integrations/wordpress/offer/price-from.json").read_text(encoding="utf-8"))["models"]}
print(f"Karta stawek Studio: {quote.get('rateVersion')}\n")
print(f"{'Model':<34}{'Strona':>12}{'Studio':>14}  Wynik")
ok = True
for mid, m in site.items():
    if mid == "mobile":
        continue
    s = studio.get(mid)
    good = s is not None and abs(s - m["constructionFromNet"]) <= 1
    ok &= good
    print(f"{m['name']:<34}{m['constructionFromNet']:>12,.0f}{(s or 0):>14,.2f}  {'OK' if good else 'RÓŻNICA'}".replace(",", " "))
sys.exit(0 if ok else 1)
