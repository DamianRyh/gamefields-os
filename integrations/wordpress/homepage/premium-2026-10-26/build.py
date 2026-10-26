from pathlib import Path
import base64, json, html, re
root=Path(__file__).parent
repo=root.parents[3]
models=json.loads((root/'media.json').read_text())
S='https://gamefields-studio.ryhfs90.chatgpt.site'
def esc(s):return html.escape(str(s),quote=True)
def studio(arena='o1',**params):
 from urllib.parse import urlencode
 return '/konfigurator-boisk/?'+urlencode({'arena':arena,**params})
def image(url,alt,cls='',eager=False):return f'<img class="{cls}" src="{esc(url)}" alt="{esc(alt)}" width="979" height="538" '+('fetchpriority="high"'if eager else'loading="lazy"')+' decoding="async">'
def a(label,href,primary=False,attrs=''):return f'<a class="gh-btn'+(' gh-primary'if primary else'')+f'" href="{esc(href)}" {attrs}>{label}</a>'
def b(label,attrs='',primary=False):return f'<button type="button" class="gh-btn'+(' gh-primary'if primary else'')+f'" {attrs}>{label}</button>'
rows=[('o1','Panna Play','Kompaktowa forma · wspólna gra'),('p1','Panna Court','Prostokątna forma · własny charakter'),('circle-cage-1','Panna Cage 90','Okrągła konstrukcja · 90'),('circle-cage-2','Panna Cage 180','Okrągła konstrukcja · 180'),('octagon','Panna Octa','Gra w ośmioboku · rodzina modułowa'),('street-field','Panna Grid','Prostokątna konstrukcja · rodzina modułowa'),('w1','Panna Ring','Okrągła forma gry'),('street15','Street Arena 15','Street football · 15 × 10 m')]
names={key:name for key,name,meta in rows}
hero_choices=''.join(b(name,f'data-select-model="{key}" aria-pressed="'+('true' if key=='o1' else 'false')+'"',key=='o1') for key,name,meta in rows[:6])
concepts=json.loads((root/'surface-projects.json').read_text())
materials=[('Granulat','granulat-macro.webp'),('Płytki modułowe','plytki-macro.webp'),('Sztuczna trawa','trawa-macro.webp')]
painted='https://www.gamefields.eu/wp-content/uploads/2026/10/Gamefields-probka-nawierzchni-malowanej.svg'
css=(root/'style.css').read_text()
font=base64.b64encode((root/'assets/InterVariable.woff2').read_bytes()).decode()
css="@font-face{font-family:GHInter;font-style:normal;font-weight:100 900;font-display:swap;src:url(data:font/woff2;base64,"+font+") format('woff2')}"+css
out=f'''<!-- wp:html -->
<!-- Gamefields homepage 2026-10-26 · Inter SIL OFL: https://rsms.me/inter/ -->
<style>{css}</style><div class="gf-premium" id="gf-culture" data-homepage-version="2026-10-26">
<a class="gh-skip" href="#gh-main">Przejdź do treści</a>
<header class="gh-nav gh-wrap"><a href="/" class="gh-logo" aria-label="Gamefields — strona główna">gamefields.</a><button type="button" class="gh-btn gh-menu" aria-expanded="false" aria-controls="gh-nav-links">Menu</button><nav id="gh-nav-links" aria-label="Główna nawigacja">{a('Boiska','#boiska')}{a('Nawierzchnie','#nawierzchnie')}{a('Inspiracje','#kierunki')}{a('Projektuj w Studio',studio(),True,'data-current-studio')}</nav></header>
<main id="gh-main"><section class="gh-hero gh-wrap" aria-labelledby="gh-title"><div class="gh-hero-grid"><div class="gh-copy"><p class="gh-eyebrow">MODUŁOWE BOISKA · AUTORSKI DESIGN</p><h1 id="gh-title">Gra zmienia<br>miejsce.</h1><p>Ty nadajesz charakter.<br>My pomagamy stworzyć miejsce do gry.</p><div class="gh-actions gh-desktop-actions">{a('Zaprojektuj swoje',studio(),True,'data-current-studio')}{a('Poznaj modele','#boiska')}</div></div><div class="gh-model-stage">{image(models['o1'],'Panna Play — podgląd konstrukcji stalowej','gh-hero-image',True)}</div></div>
{a('Zaprojektuj swoje',studio(),True,'data-current-studio class-replace="mobile"').replace('class="gh-btn gh-primary"','class="gh-btn gh-primary gh-mobile-primary"')}
<div class="gh-model-controls"><div class="gh-model-heading"><strong id="gh-model-name">Panna Play</strong>{b('Zobacz model 3D ↗','data-open-3d')}</div><div class="gh-model-options" role="group" aria-label="Model w podglądzie">{hero_choices}</div></div><p class="gh-caption" role="status" aria-live="polite" id="gh-hero-status">Wybierz model. Podgląd 3D uruchomisz na żądanie.</p></section>
<section class="gh-section gh-tinted" id="nawierzchnie"><div class="gh-wrap"><h2>Od czego zaczynamy?</h2><div class="gh-category-grid"><article>{image(models['p1'],'Konstrukcja stalowa Panna Court')}<h3>Konstrukcje stalowe</h3><p>Wybierz kształt. Rozbuduj zgodny system.</p>{a('Odkryj możliwości','#boiska')}</article><article>{image(S+'/sport-surfaces/basketball-3x3.webp','Samodzielna nawierzchnia sportowa do koszykówki 3×3')}<h3>Nawierzchnie sportowe</h3><p>Wybierz sport, materiał i własny charakter.</p>{a('Odkryj możliwości','/konfigurator-boisk/')}</article></div></div></section>
<section class="gh-section gh-wrap" id="boiska"><h2>Znajdź swój<br>kształt gry.</h2><p>Najpierw forma. Potem kolory, nawierzchnia i Twoje pomysły.</p><div class="gh-carousel-buttons">{b('←','data-scroll="models:-1" aria-label="Poprzednie konstrukcje"')}{b('→','data-scroll="models:1" aria-label="Następne konstrukcje"')}</div><div class="gh-product-rail" id="gh-models" tabindex="0" aria-label="Konstrukcje — przewijana kolekcja">'''
for key,name,meta in rows:
 out+=f'<article class="gh-product">{image(models[key],name+" — render konstrukcji")}<h3>{name}</h3><p>{meta}</p>{b("Poznaj konstrukcję",f"data-detail=\"{key}\"")}{a("Konfiguruj",studio(key),False,"class-replace=\"product\"")}</article>'
out+='</div>'+b('Zobacz wszystkie konstrukcje','data-catalog')+'</section>'
out+=f'''<section class="gh-section gh-soft" id="system"><div class="gh-wrap"><h2>Jeden system.<br>Twój układ.</h2><p>Konstrukcja, nawierzchnia i grafika tworzą wspólny projekt. Zacznij od jednego elementu.</p><div class="gh-system-image">{image(models['street-field'],'Panna Grid — konstrukcja jako pierwsza warstwa projektu','',False)}</div><div class="gh-system-tabs" role="group" aria-label="Warstwy projektu">{b('01 · Konstrukcja','data-layer="structure" aria-pressed="true"',True)}{b('02 · Nawierzchnia','data-layer="surface" aria-pressed="false"')}{b('03 · Twój charakter','data-layer="design" aria-pressed="false"')}</div><p class="gh-caption" id="gh-layer-status" role="status">Konstrukcja stalowa. Rozbudowa wykorzystuje komponenty zgodnej rodziny.</p></div></section>
<section class="gh-section gh-wrap" id="kierunki"><h2>Jedno miejsce.<br>Wiele charakterów.</h2><p>Autorskie projekty nawierzchni. Najedź lub wybierz „W otoczeniu”, a potem dopasuj projekt w Studio.</p><div class="gh-concept-grid" tabindex="0" aria-label="Projekty nawierzchni — przewijana kolekcja">'''
for concept in concepts:
 from urllib.parse import urlencode
 key,name=concept['id'],concept['name']
 href='/konfigurator-boisk/?'+urlencode({'surface':'street-football-3x3','pattern':concept['familyId'],'palette':concept['paletteId'],'variant':concept['variant']})
 out+=f'<article class="gh-surface-offer" data-surface-offer="{key}"><div class="gh-surface-pair">{image(S+"/surface-projects/"+key+".svg",name+" — samodzielny projekt nawierzchni","gh-surface-bare")}{image(S+"/surface-projects/"+key+"-park.webp",name+" — wizualizacja koncepcyjna w parku","gh-surface-context")}<button type="button" class="gh-btn gh-context-toggle" data-toggle-context aria-pressed="false" aria-label="{name}: pokaż w otoczeniu">W otoczeniu ↗</button></div><p class="gh-eyebrow">PROJEKT NAWIERZCHNI · WIZUALIZACJA KONCEPCYJNA</p><h3>{name}</h3>{a("Dostosuj w Studio",href)}</article>'
out+='</div></section><section class="gh-section gh-tinted" id="materialy"><div class="gh-wrap"><h2>Poczuj różnicę.</h2><p>Granulat, płytki, trawa lub malowana nawierzchnia. Zobacz fakturę z bliska.</p><div class="gh-materials">'
for name,file in materials:
 url=S+'/surfaces/catalogue/'+file
 out+=f'<button type="button" class="gh-material" data-material-src="{url}" data-material-name="{name}">{image(url,name+" — faktura z bliska")}<strong>{name}</strong></button>'
out+=f'''<button type="button" class="gh-material" data-material-src="{painted}" data-material-name="Malowana">{image(painted,'Fragment wzoru na nawierzchni malowanej')}<strong>Malowana</strong></button></div></div></section>
<section class="gh-section gh-wrap" id="projekty">{image('https://www.gamefields.eu/wp-content/uploads/2026/10/court.webp','Koncepcja kolorowego boiska w przestrzeni miejskiej','gh-context')}<h2>Zaprojektowane dla miejsca.<br>Stworzone dla ludzi.</h2><p class="gh-caption">Koncepcja przestrzeni miejskiej · ilustracja, nie dokumentacja realizacji.</p><div class="gh-audiences">{a('Miasto i park','/dla-miast/')}{a('Szkoła i osiedle','#kontakt')}{a('Marka i wydarzenie','/aktywacje-sportowe-dla-marek/')}</div><div class="gh-services">{a('Budowa boisk','/budowa-boisk-sportowych/')}{a('Renowacja','/renowacja-boisk/')}{a('Projekt i malowanie','/malowanie-boisk/')}</div></section>'''
contact=(root/'contact-template.html').read_text()
contact=contact.replace('<h2>Masz miejsce?<br>Porozmawiajmy.</h2>','<h2>Masz miejsce?<br>Zróbmy miejsce do gry.</h2>')
out+=contact+'<p id="gc-direction-status" hidden></p></main><footer class="gh-wrap gh-footer"><a class="gh-logo" href="/">gamefields.</a><a href="mailto:info@gamefields.eu">info@gamefields.eu</a><a href="/konfigurator-boisk/">Studio</a><a href="/kontakt/">Kontakt</a><a href="/polityka-prywatnosci/">Polityka prywatności</a></footer>'
out+='''<dialog class="gh-dialog" id="gh-dialog" aria-labelledby="gh-dialog-title"><div class="gh-dialog-head"><h2 id="gh-dialog-title">Poznaj boisko</h2><button type="button" class="gh-btn" data-close-dialog aria-label="Zamknij podgląd">Zamknij ×</button></div><div id="gh-dialog-body"></div></dialog></div>'''
data={'models':models,'names':names,'modelOrder':list(names),'defaultModel':'o1','studio':S,'painted':painted}
out+='<script type="application/json" id="gh-data">'+json.dumps(data,ensure_ascii=False).replace('</','<\\/')+'</script><script>'+(root/'script.js').read_text()+'</script>'
# Keep the existing selected-product query and review/remove behavior, with the same contact field IDs.
for script in (root/'contact-existing.js').read_text().splitlines():out+='<script>'+script+'</script>'
out+='\n<!-- /wp:html -->'
(root/'homepage.html').write_text(out)
(root/'index.html').write_text('<!doctype html><html lang="pl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Gamefields — nowa strona główna</title>'+out+'</html>')
print(json.dumps({'bytes':len(out.encode()),'models':len(models),'contactPreserved':'a71dc3a'in out}))
