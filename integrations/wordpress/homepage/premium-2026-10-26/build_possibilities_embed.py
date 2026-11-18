"""Builds a single paste-ready WordPress Custom HTML block for the Mapa możliwości section."""
import json,pathlib,re
root=pathlib.Path(__file__).parent
# Fallbacks so the block also works outside the premium homepage (all scoped to #mozliwosci).
base='''#mozliwosci{--gh-ink:#47132d;--gh-muted:#74656d;--gh-violet:#6336f5;--gh-line:#e8e3e6;--gh-soft:#f1ecff;color:var(--gh-ink);font-family:GHInter,Inter,Arial,sans-serif;font-size:16px;line-height:1.4;padding:48px 0}
#mozliwosci *{box-sizing:border-box}
#mozliwosci :is(h2,h3,h4,p){margin:0;padding:0;font-family:inherit}
#mozliwosci h2{font-weight:700;font-size:clamp(36px,5vw,58px);line-height:1.04;letter-spacing:-1.5px;color:var(--gh-ink)}
#mozliwosci h3{font-size:24px;font-weight:700;line-height:1.3;color:var(--gh-ink)}
#mozliwosci p{color:var(--gh-muted)}
#mozliwosci .gh-wrap{max-width:1440px;margin:auto;padding-left:48px;padding-right:48px}
#mozliwosci .gh-eyebrow{font-size:11px;font-weight:600;letter-spacing:.02em;margin-bottom:18px;color:var(--gh-ink)}
#mozliwosci .gh-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:12px 24px;border:1px solid var(--gh-line);border-radius:12px;color:var(--gh-ink);background:#fff;font:400 16px/1.4 GHInter,Inter,Arial,sans-serif;text-decoration:none;cursor:pointer}
#mozliwosci .gh-btn:hover{background:var(--gh-soft);border-color:var(--gh-violet)}
#mozliwosci .gh-btn.gh-primary{background:var(--gh-violet);border-color:var(--gh-violet);color:#fff}
#mozliwosci .gh-btn.gh-primary:hover{background:#5129d8}
#mozliwosci button{font-family:inherit}
#mozliwosci [hidden]{display:none!important}
@media(max-width:1000px){#mozliwosci .gh-wrap{padding-left:28px;padding-right:28px}}
@media(max-width:600px){#mozliwosci .gh-wrap{padding-left:20px;padding-right:20px}#mozliwosci{padding:32px 0}}
'''
def scope(css):
    # Prefix every selector with #mozliwosci so section rules outrank the base fallbacks and WP theme styles.
    def fix(sel):
        sel=sel.strip()
        return sel.replace('.gm-section','#mozliwosci.gm-section',1) if sel.startswith('.gm-section') else '#mozliwosci '+sel
    def rules(block):
        return re.sub(r'([^{}]+)\{',lambda m:','.join(fix(x) for x in m.group(1).split(','))+'{',block)
    out,i=[],0
    for m in re.finditer(r'@media[^{]*\{((?:[^{}]*\{[^{}]*\})*)\}',css):
        out.append(rules(css[i:m.start()]));out.append(m.group(0)[:m.group(0).index('{')+1]+rules(m.group(1))+'}');i=m.end()
    out.append(rules(css[i:]));return ''.join(out)
data=json.loads((root/'possibilities.json').read_text())
out=('<!-- Gamefields — Mapa możliwości. Wklej w blok „Własny HTML”. Dane: possibilities.json, sprawdzone '+data['verifiedAt']+'. -->\n'
 '<style>'+base+scope((root/'possibilities.css').read_text())+'</style>\n'
 +(root/'possibilities.html').read_text()
 +'<script type="application/json" id="gm-data">'+json.dumps(data,ensure_ascii=False).replace('</','<\\/')+'</script>\n'
 '<script>'+(root/'possibilities.js').read_text()+'</script>\n')
(root/'possibilities-embed.html').write_text(out)
print(len(out.encode()),'bytes')
