#!/usr/bin/env python3
"""Generate catalogue/SEO review fragments from shared live price sources. No deployment."""
import importlib.util
import json
import re
import html
from pathlib import Path
import argparse

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("review", HERE / "generate-review.py")
review = importlib.util.module_from_spec(spec)
spec.loader.exec_module(review)
spec = importlib.util.spec_from_file_location("homebuild", HERE.parent / "build.py")
build = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build)
D = review.DICT

def display(s):
    if s in D: return D[s]
    # Translate price presentation only, preserve every numeric digit and PLN currency.
    if re.fullmatch(r"od [\d\s\u00a0]+ zł(?:/m²)?(?: netto| brutto)?", s):
        return s.replace("od ", "from ", 1).replace(" zł", " PLN").replace(" netto", " excluding VAT").replace(" brutto", " including VAT")
    if re.fullmatch(r"Z nawierzchnią od [\d\s\u00a0]+ zł netto", s):
        return "With surfacing " + display(s[len("Z nawierzchnią "):])
    if re.fullmatch(r"[\d–\s]+ zł/m²", s):
        return s.replace(" zł", " PLN")
    return s

def translated_fragment(source):
    class Catalogue(review.Translator):
        def translate(self, text):
            key = html.unescape(text.strip())
            value = display(key)
            if value != key:
                self.hits[key] += 1
                return text[:len(text)-len(text.lstrip())] + html.escape(value, quote=False) + text[len(text.rstrip()):]
            return super().translate(text)
    t = Catalogue()
    t.feed(source)
    t.close()
    result = "".join(t.parts)
    # Localise only material JSON's presentation fields, never keys, rates or URLs.
    def material(m):
        data = json.loads(m.group(2))
        for item in data:
            item["n"] = display(item["n"])
            item["t"] = display(item["t"])
            item["f"] = [display(x) for x in item["f"]]
            for variant in item["v"]: variant["n"] = display(variant["n"])
        return m.group(1) + json.dumps(data, ensure_ascii=False).replace("<", "\\u003c") + m.group(3)
    result = re.sub(r'(<script type="application/json" id="gfs-mat-data">)(.*?)(</script>)', material, result, flags=re.S)
    return result, dict(t.unmapped)

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--out", type=Path, required=True)
    out = p.parse_args().out.resolve()
    if out == HERE.parent or HERE.parent in out.parents and out.name != "review-en":
        raise SystemExit("Use a dedicated review output directory")
    out.mkdir(parents=True, exist_ok=True)
    price_html, data = build.prices_html()
    report = {}
    for name, source in {"prices":price_html,"surfaces":build.surfaces_html(),"projects":build.reals_html(),"paint":build.paint_html(),"materials":build.materials_html()}.items():
        result, missing = translated_fragment(source)
        (out / (name + ".html")).write_text(result, encoding="utf-8")
        report[name] = missing
    faq = (HERE.parent / "kept-faq-contact.html").read_text(encoding="utf-8").split("<!--CONTACT_SCRIPTS-->")[0]
    faq_en, _ = translated_fragment(faq)
    graph = json.loads(re.search(r'<script[^>]*>(.*)</script>', build.jsonld(faq_en), re.S).group(1))
    def walk(value, key=""):
        if isinstance(value, dict): return {k: walk(v,k) for k,v in value.items()}
        if isinstance(value, list): return [walk(v,key) for v in value]
        if isinstance(value,str) and key in {"name","alternateName","description","knowsAbout","addressLocality"}: return display(value)
        return value
    graph = walk(graph)
    for item in graph["@graph"]:
        if item["@type"] == "FAQPage":
            item["inLanguage"] = "en-GB"
            item["@id"] = "https://www.gamefields.eu/en/#pytania"
    (out / "schema-review.json").write_text(json.dumps(graph, ensure_ascii=False, indent=2),encoding="utf-8")
    (out / "catalogue-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2),encoding="utf-8")
    print("Review fragments only; do not publish. Check mixed text, price presentation, translated links and schema before release.")
if __name__ == "__main__": main()
