#!/usr/bin/env python3
"""Generate EN source fragments for review only. Never writes original sources or deploys."""
import argparse
import html
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from collections import Counter

HERE = Path(__file__).resolve().parent
SOURCE = HERE.parent
FILES = ("body.html", "kept-faq-contact.html", "kept-workshop.html")
ATTRS = ("alt", "aria-label", "title", "placeholder")
DICT = json.loads((HERE / "en-static.json").read_text(encoding="utf-8"))

class Translator(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.parts = []
        self.block = None
        self.hits = Counter()
        self.unmapped = Counter()

    def translate(self, text):
        key = html.unescape(text.strip())
        if key in DICT:
            self.hits[key] += 1
            left = len(text) - len(text.lstrip())
            right = len(text) - len(text.rstrip())
            return text[:left] + html.escape(DICT[key], quote=False) + (text[-right:] if right else "")
        if re.search(r"[A-Za-ząćęłńóśźżĄĆĘŁŃÓŚŹŻ]", key) and not key.startswith("{{"):
            self.unmapped[key] += 1
        return text

    def start(self, tag, attrs):
        raw = self.get_starttag_text()
        if self.block is None:
            def attr(m):
                key = html.unescape(m.group(3))
                if key in DICT:
                    self.hits[key] += 1
                    return m.group(1) + m.group(2) + html.escape(DICT[key], quote=True) + m.group(2)
                if key: self.unmapped["attribute: " + key] += 1
                return m.group(0)
            raw = re.sub(r'''(\s(?:alt|aria-label|title|placeholder)\s*=\s*)(["'])(.*?)\2''', attr, raw, flags=re.S|re.I)
        self.parts.append(raw)
        if tag in ("script", "style"): self.block = tag

    handle_starttag = start
    handle_startendtag = start
    def handle_endtag(self, tag):
        self.parts.append("</" + tag + ">")
        if tag == self.block: self.block = None
    def handle_data(self, text):
        if self.block or text.lstrip().startswith("[contact-form-7"):
            self.parts.append(text)
        else: self.parts.append(self.translate(text))
    def handle_entityref(self, name): self.parts.append("&" + name + ";")
    def handle_charref(self, name): self.parts.append("&#" + name + ";")
    def handle_comment(self, data): self.parts.append("<!--" + data + "-->")
    def handle_decl(self, decl): self.parts.append("<!" + decl + ">")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    out = args.out.resolve()
    if out == SOURCE or SOURCE in out.parents and out.name != "review-en":
        raise SystemExit("Use a separate review output directory, e.g. localisation/review-en")
    out.mkdir(parents=True, exist_ok=True)
    report = {}
    for name in FILES:
        source = (SOURCE / name).read_text(encoding="utf-8")
        t = Translator()
        t.feed(source)
        t.close()
        result = "".join(t.parts)
        for pattern in (r"<script\b[^>]*>[\s\S]*?</script>", r"<style\b[^>]*>[\s\S]*?</style>", r"\{\{[A-Z_]+\}\}", r"\b(?:href|src|id|data-[\w-]+)\s*=\s*[\"'][^\"']*[\"']"):
            if re.findall(pattern, source, re.I) != re.findall(pattern, result, re.I):
                raise SystemExit("Protected content changed: " + name + " / " + pattern)
        (out / name).write_text(result, encoding="utf-8")
        report[name] = {"translated_occurrences": sum(t.hits.values()), "unmapped_review": dict(t.unmapped)}
    (out / "review-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Review fragments generated; NOT publishable. Dynamic JS, generated prices, routes, CF7 and SEO still require localisation.")

if __name__ == "__main__":
    main()
