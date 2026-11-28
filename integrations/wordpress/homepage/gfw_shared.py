"""Shared by the homepage blocks that draw patterns (wzory-2026-11, sporty-2026-11), 28.11.2026.

The Studio's pattern engine (court-art-pro.mjs) is bundled once, into the "wzory" block, as
<script type="text/plain" id="gfw-engine">. Every block that needs it includes LOADER, which defines
window.GFWReady() (loads the engine once, resolves with window.GFW or null when the engine is not on the page) and
window.GFWRun(text) (runs a stored script). WordPress turns "&&" in post content into entities, so stored scripts
keep a token instead and LOADER restores it; the loader itself has no "&&".
"""
import pathlib
import subprocess

HOME = pathlib.Path(__file__).resolve().parent
ENGINE = HOME.parent.parent / "studio" / "surface-pro-2026-11" / "court-art-pro.mjs"
TOKEN = "__GFAND__"

LOADER = (
    "window.GFWRun=window.GFWRun||function(text,cb){var c=text.split('" + TOKEN + "').join(String.fromCharCode(38,38));"
    "var t=document.createElement('script');t.src=URL.createObjectURL(new Blob([c],{type:'text/javascript'}));if(cb)t.onload=cb;document.head.appendChild(t);};"
    "window.GFWReady=window.GFWReady||(function(){var p=null;return function(){if(p)return p;p=new Promise(function(ok){"
    "function go(){var s=document.getElementById('gfw-engine');if(!s){ok(null);return;}window.GFWRun(s.textContent,function(){ok(window.GFW||null);});}"
    "if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();});return p;};})();"
)
assert "&&" not in LOADER


def stored(code):
    """Script text safe inside a WordPress wp:html block."""
    assert TOKEN not in code and "</script" not in code.lower() and "<!--" not in code
    return code.replace("&&", TOKEN)


def engine_bundle(esbuild, here):
    entry = here / ".entry.mjs"
    entry.write_text("export { PRO_PALETTES, PRO_FAMILIES, renderPro, courtLines, recommendLineColor, lightness } from '" + ENGINE.as_posix() + "';\n", encoding="utf-8")
    try:
        return subprocess.run([esbuild, str(entry), "--bundle", "--minify", "--format=iife", "--global-name=GFW"], capture_output=True, text=True, check=True).stdout
    finally:
        entry.unlink()


def minify(esbuild, path):
    return subprocess.run([esbuild, str(path), "--minify"], capture_output=True, text=True, check=True).stdout


def boot(src_id, root_id, margin="600px"):
    """Runs the stored script #src_id after the engine, when #root_id comes within `margin` of the viewport."""
    js = ("(function(){var s=document.getElementById('" + src_id + "'),r=document.getElementById('" + root_id + "');if(!s)return;var done=0;"
          "function go(){if(done)return;done=1;window.GFWReady().then(function(){window.GFWRun(s.textContent);});}"
          "if(!('IntersectionObserver' in window)){go();return;}"
          "var io=new IntersectionObserver(function(e){if(e[0].isIntersecting){io.disconnect();go();}},{rootMargin:'" + margin + " 0px'});io.observe(r);})();")
    assert "&&" not in js
    return LOADER + js
