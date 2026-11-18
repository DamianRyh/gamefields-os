#!/usr/bin/env python3
"""gf-lead-blok.html: the theme's gf-lead.js/css as one wp:html block for page content (homepage, /kontakt/, /studio/),
plus <template id="gf-follow-tpl"> with the profile links shown after a sent form.
Profile addresses stay in HTML, never in the script: Complianz blocks scripts that mention them until marketing consent."""
import pathlib, re
HERE = pathlib.Path(__file__).resolve().parent
T = HERE.parent.parent / "theme" / "gamefields" / "assets"
js = (T / "js" / "gf-lead.js").read_text(encoding="utf-8")
css = (T / "css" / "gf-lead.css").read_text(encoding="utf-8")
assert "&&" not in js and "</script" not in js and "</style" not in css
assert not re.search(r"instagram|facebook|linkedin", js, re.I), "profile names must not appear in the script"
SOCIAL = [("instagram", "Instagram", "https://www.instagram.com/gamefields.eu/", "Wzory, montaże i boiska w akcji"),
          ("linkedin", "LinkedIn", "https://www.linkedin.com/company/gamefields", "Realizacje dla miast i nabory dotacji"),
          ("facebook", "Facebook", "https://www.facebook.com/Gamefields.eu", "Nowe boiska w Twojej okolicy")]
items = "".join(f'<li><a class="gf-follow-a gf-follow-{k}" href="{u}" target="_blank" rel="noopener me" data-gf-social="{k}" data-gf-place="po-wyslaniu">'
                f'<span class="gf-follow-ico" aria-hidden="true"></span><b>{n}</b><span>{d}</span></a></li>' for k, n, u, d in SOCIAL)
tpl = f'<template id="gf-follow-tpl"><div class="gf-follow row" data-gf-follow="po-wyslaniu"><ul class="gf-follow-list" role="list">{items}</ul></div></template>'
block = ("<!-- wp:html -->\n<!-- gf-blok: gf-lead -->\n<!-- Gamefields gf-lead (zdjęcie placu, Studio, profile po wysłaniu formularza), 18.11.2026. "
         "Tymczasowo w treści strony, do czasu motywu 1.0.37; skrypt uruchamia się tylko raz. -->\n"
         f"<style>{css}</style>\n{tpl}\n<script>{js}</script>\n<!-- /wp:html -->\n")
(HERE / "gf-lead-blok.html").write_text(block, encoding="utf-8")
print(len(block), "bytes")
