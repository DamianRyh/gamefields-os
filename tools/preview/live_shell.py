#!/usr/bin/env python3
"""Preview a new page body inside the live gamefields.eu theme (header, menu, footer, theme CSS).

Usage: python3 tools/preview/live_shell.py <page-url> <block.html> <out.html>
Fetches the live page, replaces the content of <div class="gft-raw ..."> inside <main id="gft-main"> with the
wp:html block, and writes a standalone file. Theme assets keep their absolute URLs, so the preview looks like
the published page. A banner marks it as a preview.
"""
import re
import sys
import urllib.request

url, block, out = sys.argv[1:4]
live = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "gamefields-preview"})).read().decode("utf-8")
body = open(block, encoding="utf-8").read().replace("<!-- wp:html -->", "").replace("<!-- /wp:html -->", "")
m = re.search(r'(<div class="gft-raw[^"]*">)(.*?)(</div>\s*</main>)', live, re.S)
if not m:
    sys.exit("content wrapper not found")
banner = ('<div style="position:fixed;left:12px;bottom:12px;z-index:9999;padding:8px 12px;border-radius:999px;'
          'background:#D8F24A;color:#1F2A6B;font:700 13px/1 system-ui,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.2)">PODGLĄD — jeszcze nie na stronie</div>')
html = live[:m.start(2)] + body + live[m.end(2):]
html = html.replace("</body>", banner + "</body>", 1)
html = re.sub(r'<base [^>]*>', "", html)
html = html.replace("<head>", '<head><base href="https://www.gamefields.eu/">', 1)
open(out, "w", encoding="utf-8").write(html)
print(out, len(html))
