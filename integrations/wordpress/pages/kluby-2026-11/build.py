#!/usr/bin/env python3
"""/boiska-dla-klubow/ (page 3703), rebuilt 23.11.2026 in the .gfb style. Footer link: "Kluby i akademie".

Output: boiska-dla-klubow.html (one wp:html block, the whole content of the page).

For clubs and academies: training zones instead of a full pitch (technique 1v1, small-sided 3v3, modernisation),
recommended models with prices, the "Klub" kit with club and partner colours, surfaces for training (cost for a
Cage 180), club + partner (sponsor) with an honest note, the Wake For Friends case, the author as a club founder,
three steps to a project, FAQ. Facts from the live page, the homepage kits and author block, the Realizacje page and
offer/*.json. No grant or sponsor is promised.
"""
import html
import pathlib
import sys
from urllib.parse import urlencode

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from gfb_common import (BASE, FIN, GFB_CSS, PAINT, PRICE, SITE, SLAB, UP, cost, img, jump_html, faq_html, write, zl)  # noqa: E402

URL = SITE + "boiska-dla-klubow/"
PB = {m["id"]: m for m in PRICE["models"]}
KITS_URL = "/wp-content/themes/gamefields/assets/js/home/kits/"
CLUB_KIT = "/studio/?" + urlencode({"arena": "circle-cage-2", "pattern": "pro-munich", "variant": "2", "palette": "aicher", "panel": "2E9C5E", "frame": "0F5B3A"}).replace("&", "&amp;")
A180 = SLAB["circle-cage-2"]["areaM2"]


def full(mid):
    return PB[mid]["constructionFromNet"] + SLAB[mid]["net"] + PAINT[mid]


def rates(key):
    return [v["netPerM2"] for v in FIN[key]["variants"]]


CSS = GFB_CSS + """
.gfb-hero figure.kit{margin:0;background:#2457D6;overflow:hidden;position:relative}
.gfb-hero figure.kit img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover}
.gfa .gfb-hero figure.kit figcaption{position:absolute;left:10px;bottom:10px;margin:0;padding:6px 10px;background:rgba(28,9,18,.84);color:#fff;font-size:13px}
.gfb-zones{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.gfb-zones > li{display:flex;flex-direction:column;gap:10px;padding:24px;background:#fff;border:1px solid var(--line)}
.gfb-zones .n{font-size:13px;font-weight:800;letter-spacing:.06em;color:var(--violet)}
.gfb-zones b{font-size:clamp(22px,2vw,28px);letter-spacing:-.03em;line-height:1.08}
.gfb-zones p{margin:0;color:#5A4652;font-size:15px}
.gfb-zones ul{margin:0;padding-left:18px;font-size:14px;color:#5A4652;display:grid;gap:4px}
.gfb-zones .pr{margin-top:auto;padding-top:10px;border-top:1px solid var(--line);font-weight:800;font-size:15px}
.gfb-zones a{color:var(--violet);font-weight:800;font-size:14px;text-decoration:none}
.gfb-mods{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.gfb-mods a{display:flex;flex-direction:column;height:100%;background:#fff;border:1px solid var(--line);text-decoration:none;overflow:hidden}
.gfb-mods a:hover{border-color:var(--violet)}
.gfb-mods .ph{background:var(--bg);overflow:hidden}
.gfb-mods img{display:block;width:100%;aspect-ratio:16/10;object-fit:cover;transition:transform .8s cubic-bezier(.2,.7,.2,1)}
.gfb-mods a:hover img{transform:scale(1.04)}
.gfb-mods .tx{display:grid;gap:6px;padding:18px 20px 20px}
.gfb-mods b{font-size:24px;letter-spacing:-.03em}
.gfb-mods .wh{font-size:14px;color:var(--muted)}
.gfb-mods .pr{font-size:15px;font-weight:800}.gfb-mods .pr small{display:block;font-weight:500;color:var(--muted);font-size:13px}
.gfb-mods .go{margin-top:4px;color:var(--violet);font-weight:800;font-size:14px}
.gfb-kitb{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,6fr);gap:clamp(20px,3vw,48px);align-items:center}
.gfb-kitb img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;background:#2457D6}
.gfb-kitb ul{margin:14px 0 0;padding-left:20px;display:grid;gap:6px;font-size:16px;color:rgba(244,241,238,.88)}
.gfb-kitb .pr{margin:14px 0 0;font-size:18px;font-weight:800;color:#fff}
.gfb-kitb p.l{margin:16px 0 0;font-size:18px;color:rgba(244,241,238,.85)}
.gfb-kitb .gfa-btn{background:var(--lime);color:#1F2A6B!important}
.gfb-kitb .gfa-btn.alt{background:transparent;border:1.5px solid rgba(244,241,238,.5);color:var(--paper)!important}
.gfb-surf3{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.gfb-surf3 a{display:flex;flex-direction:column;height:100%;background:#fff;border:1px solid var(--line);text-decoration:none;overflow:hidden}
.gfb-surf3 a:hover{border-color:var(--violet)}
.gfb-surf3 img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;background:#E6E0DA}
.gfb-surf3 .tx{display:grid;gap:4px;padding:14px 16px 16px;color:var(--ink)}
.gfb-surf3 b{font-size:18px;letter-spacing:-.02em}
.gfb-surf3 .nt{font-size:14px;color:var(--muted)}
.gfb-surf3 .r{font-size:14px;font-weight:800}
.gfb-case{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(16px,2.6vw,36px);align-items:center;padding:clamp(16px,2vw,24px);background:#fff;border:1px solid var(--line)}
.gfb-case .ph{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.gfb-case .ph img{display:block;width:100%;aspect-ratio:1;object-fit:cover;background:#E6E0DA}
.gfb-case .ph img:first-child{grid-column:1/-1;aspect-ratio:4/3}
.gfb-case .pl{margin:0 0 6px;color:var(--violet);font-weight:800;font-size:14px}
.gfb-case h3{font-size:clamp(30px,3vw,46px);font-weight:800;letter-spacing:-.04em;line-height:1}
.gfb-case p.t{margin:12px 0 0;color:#5A4652;font-size:16px}
.gfb-case blockquote{margin:16px 0 0;padding:0 0 0 14px;border-left:4px solid var(--violet);font-size:17px;font-weight:600;line-height:1.45}
.gfb-case cite{display:block;margin-top:6px;font-style:normal;font-size:14px;color:var(--muted)}
.gfb-case .ln{display:inline-block;margin-top:12px;color:var(--violet);font-weight:800;font-size:14px}
.gfb-auth{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,8fr);gap:clamp(20px,3vw,48px);align-items:center}
.gfb-auth img{display:block;width:100%;aspect-ratio:4/5;object-fit:cover;object-position:50% 20%;background:#2a1520}
.gfb-auth h2{color:#fff}
.gfb-auth p.l{margin:16px 0 0;font-size:17px;color:rgba(244,241,238,.85)}
.gfb-tl{list-style:none;margin:20px 0 0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.gfb-tl li{padding:12px 14px;border:1px solid rgba(244,241,238,.2);font-size:14px;color:rgba(244,241,238,.85)}
.gfb-tl b{display:block;font-size:20px;color:var(--lime)}
.gfb-spons{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:0}
.gfb-spons div{padding:20px 22px;background:#fff;border:1px solid var(--line)}
.gfb-spons dt{font-size:19px;font-weight:800;letter-spacing:-.02em}
.gfb-spons dd{margin:6px 0 0;font-size:15px;color:#5A4652}
.gfb-honest{margin:12px 0 0;padding:14px 18px;background:#EEE8FF;font-size:15px}
.gfb-three{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.gfb-three li{padding:22px;background:#fff;border:1px solid var(--line);border-top:4px solid var(--violet)}
.gfb-three .t{font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--violet)}
.gfb-three b{display:block;margin-top:6px;font-size:21px;letter-spacing:-.02em}
.gfb-three p{margin:6px 0 0;font-size:15px;color:#5A4652}
@media (max-width:1100px){.gfb-surf3,.gfb-spons,.gfb-tl{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:900px){.gfb-zones,.gfb-mods,.gfb-kitb,.gfb-case,.gfb-auth,.gfb-three{grid-template-columns:minmax(0,1fr)}.gfb-auth img{max-width:360px}}
@media (max-width:560px){.gfb-surf3,.gfb-spons,.gfb-tl{grid-template-columns:minmax(0,1fr)}}
"""

ZONES = [("01", "Strefa techniki 1 na 1", "Powtarzalny trening indywidualny: drybling, odbicia od band, gra 1 na 1.", ["arena od ok. 5–6 m średnicy", "bandy 0,9–1,8 m", "obok głównej płyty"],
          f"Panna Cage 180 od {zl(PB['circle-cage-2']['constructionFromNet'])} netto", "#modele", "Modele ↓"),
         ("02", "Małe gry 3 na 3", "Intensywne jednostki small-sided na boisku z bandami.", ["Street Arena 15: 15 × 10 m", "dwie bramki, bandy 1 m", "turnieje i ligi klubowe"],
          f"od {zl(PB['street15']['constructionFromNet'])} netto", "/product/street-arena-15/", "Street Arena 15 →"),
         ("03", "Modernizacja", "Boczny plac, stary beton albo niewykorzystany fragment kompleksu zamieniony w strefę treningową.", ["naprawa i nowa nawierzchnia", "linie pod ćwiczenia", "arena na istniejącym placu"],
          f"malowanie od {min(v['netPerM2'] for v in FIN['variants'])} zł/m² netto", "/renowacja-boisk/", "Renowacja →")]
zones_html = "".join(f'<li><span class="n">{n}</span><b>{t}</b><p>{d}</p><ul>' + "".join(f"<li>{x}</li>" for x in pts) + f'</ul><span class="pr">{pr}</span><a href="{h}">{g}</a></li>'
                     for n, t, d, pts, pr, h, g in ZONES)

MODS = [("circle-cage-2", "gf-cage180", "#D8F24A", "Dwa poziomy paneli, 1,80 m: wyższa zabudowa wokół pola gry."),
        ("o1", "gf-play", "#2457D6", "Perforowane panele o zmiennej wysokości, dwie bramki. Kluby, eventy, szkoły."),
        ("street15", "gf-street15", "#1F2A6B", "Pełny format 3 na 3: 15 × 10 m, gładkie bandy i miejsce na barwy klubu.")]
mods_html = "".join(
    f'<li><a href="{PB[mid]["link"]}"><span class="ph" style="--bg:{bg}"><img src="{UP}2026/11/{r}-720.webp" alt="{PB[mid]["name"]}, render konstrukcji" loading="lazy" decoding="async"></span>'
    f'<span class="tx"><b>{PB[mid]["name"]}</b><span class="wh">{html.escape(PB[mid]["dimensions"])}</span><span class="wh">{d}</span>'
    f'<span class="pr">konstrukcja od {zl(PB[mid]["constructionFromNet"])} netto<small>z płytą i malowaniem od {zl(full(mid))} netto</small></span><span class="go">Zaprojektuj w Studio ↗</span></span></a></li>'
    for mid, r, bg, d in MODS)

SURF = [("trawa", "turf", "Sztuczna trawa", "sztuczna-trawa", "gra stopą, naturalny wybór do piłki"),
        ("granulat", "epdm", "EPDM wylewana", "nawierzchnia-epdm", "intensywne użytkowanie, Orlik, PN-EN 14877"),
        ("plytki", "tiles", "Płytki sportowe PP", "plytki-sportowe", "szybki montaż, punktowa wymiana"),
        ("maty-gumowe", "mats", "Maty gumowe", "maty-gumowe-nawierzchnia", "ciągła guma, antypoślizg R11")]
surf_html = "".join(
    f'<li><a href="/product/{slug}/">{img("2026/11/" + mac + "-macro-768x576.webp", n + " z bliska")}<span class="tx"><b>{n}</b><span class="nt">{d}</span>'
    f'<span class="r">Cage 180: {zl(cost(A180, min(rates(k))))}–{zl(cost(A180, max(rates(k))))}</span></span></a></li>' for mac, k, n, slug, d in SURF)

SPONS = [("Cel i społeczność", "Potrzeba klubu, grupy wiekowe i sposób korzystania z przestrzeni."),
         ("Miejsce i termin", "Lokalizacja, prawo do terenu i orientacyjny harmonogram."),
         ("Karta projektu PDF", "Render w barwach klubu i partnera, wymiary i cena ze Studia."),
         ("Ekspozycja partnera", "Logo na bandach i nawierzchni, turnieje i campy na nowej strefie.")]
spons_html = "".join(f"<div><dt>{t}</dt><dd>{d}</dd></div>" for t, d in SPONS)

THREE = [("01 / Potrzeba", "Co chcecie zmienić?", "Użytkownicy, dyscypliny, obecny obiekt i cel projektu."),
         ("02 / Miejsce", "Gdzie ma powstać?", "Lokalizacja, status terenu i zakres. Nieznane kwestie oznacz jako do ustalenia."),
         ("03 / Partnerzy", "Jak sfinansować?", "Znane środki, potencjalni partnerzy i decyzje potrzebne przed realizacją.")]
three_html = "".join(f'<li><span class="t">{t}</span><b>{b}</b><p>{d}</p></li>' for t, b, d in THREE)

FAQ = [
    ("Ile kosztuje strefa treningowa dla klubu?",
     f"Panna Cage 180 kosztuje od {zl(PB['circle-cage-2']['constructionFromNet'])} netto (z płytą i malowaniem od {zl(full('circle-cage-2'))}), boisko 3 na 3 Street Arena 15 od {zl(PB['street15']['constructionFromNet'])} netto. Sztuczna trawa na Cage 180 to dodatkowo {zl(cost(A180, min(rates('turf'))))}–{zl(cost(A180, max(rates('turf'))))} netto. Montaż i transport liczę po zdjęciach."),
    ("Czy można wykorzystać fragment istniejącego obiektu?",
     "Tak. Boczny plac, betonowa powierzchnia albo niewykorzystany fragment kompleksu można przeprojektować pod dodatkową funkcję treningową, często bez budowy nowej płyty."),
    ("Która arena jest najlepsza dla akademii?",
     "Do treningu 1 na 1 polecam Panna Cage 180: dwa poziomy paneli (1,80 m), wyższa zabudowa wokół pola gry; w zestawie „Klub” opisana jako arena do treningu 1 na 1 przez cały rok. Do małych gier drużynowych Street Arena 15 (3 na 3)."),
    ("Jaka nawierzchnia do treningu piłkarskiego?",
     "Najczęściej sztuczna trawa (gra stopą, naturalny wybór do piłki). Przy bardzo intensywnym użytkowaniu EPDM albo płytki PP z punktową wymianą modułów."),
    ("Czy strefa może mieć barwy klubu i sponsora?",
     "Tak. Kolor ramy, paneli i wzór nawierzchni ustawisz w Studio 3D, a logo partnera może być na bandach i nawierzchni bez utraty czytelności gry."),
    ("Czy pomożecie w rozmowie ze sponsorem albo w dotacji?",
     "Przygotuję kartę projektu z renderem i ceną do rozmowy z firmą, właścicielem terenu albo samorządem. Nie gwarantuję dotacji ani pozyskania sponsora; zasady konkretnego naboru trzeba sprawdzić u jego organizatora."),
    ("Czy arena wytrzyma intensywny trening?",
     "Panna Cage 180 pracuje na co dzień i podczas wydarzeń w parku Wake For Friends. Panna Ring stoi na Orliku od 10 lat bez uszkodzeń. Na realizacje daję 12 miesięcy gwarancji."),
    ("Czy możecie zorganizować turniej albo camp na otwarcie?",
     "Tak. Turnieje organizuję od 2008 roku, w 2017 zorganizowałem Mistrzostwa Świata Freestival Street Games. Nowa strefa może od razu zagrać na campie albo turnieju partnera."),
]

jump = [("strefy", "Strefy"), ("modele", "Modele"), ("klub", "Zestaw Klub"), ("nawierzchnie", "Nawierzchnie"), ("partner", "Klub + partner"),
        ("realizacja", "Realizacja"), ("autor", "Autor"), ("start", "Start"), ("pytania", "Pytania")]

body = f"""
<section class="gfb-hero"><div class="w top">
  <div>
    <p class="gfb-crumbs"><a href="/">Gamefields</a> / Kluby i akademie</p>
    <p class="k">Więcej treningu z dostępnej przestrzeni</p>
    <h1 class="d">Boiska i strefy treningowe dla klubów.</h1>
    <p class="lead">Strefa techniki 1 na 1, boisko do małych gier 3 na 3 albo modernizacja bocznego placu. W barwach klubu i partnera, z kartą projektu do rozmowy ze sponsorem.</p>
    <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Opisz potrzeby klubu →</a><a class="gfa-btn alt" href="{CLUB_KIT}">Zestaw „Klub” w Studio ↗</a></div>
  </div>
  <figure class="kit"><img src="{KITS_URL}klub.webp" alt="Panna Cage 180 z nawierzchnią Munich Chevrons, zestaw dla klubu, widok ze Studio 3D" loading="eager" decoding="async"><figcaption>Zestaw „Klub”: Panna Cage 180 + Munich Chevrons</figcaption></figure>
</div>
<div class="w">
  <dl class="gfb-nums">
    <div><dt>Cage 180</dt><dd>od {zl(PB['circle-cage-2']['constructionFromNet'])}<small>netto, kluby i akademie</small></dd></div>
    <div><dt>Bandy</dt><dd>1,80 m<small>wyższa zabudowa, Cage 180</small></dd></div>
    <div><dt>3 na 3</dt><dd>15 × 10 m<small>Street Arena 15</small></dd></div>
    <div><dt>Autor</dt><dd>Warsaw FC<small>założyciel klubu</small></dd></div>
  </dl>
</div></section>

<nav class="gfb-jump" aria-label="Na tej stronie"><div class="w"><ul role="list">{jump_html(jump)}</ul></div></nav>

<section class="gfa-sec" id="strefy"><div class="w">
  <div class="gfa-head"><div><p class="k">Strefy</p><h2 class="d">Nowa funkcja bez nowego stadionu.</h2></div><p>Nie każda funkcja treningowa potrzebuje pełnego boiska. Niewykorzystany fragment obiektu może dać dodatkowe miejsce do techniki i małych gier.</p></div>
  <ul class="gfb-zones" role="list">{zones_html}</ul>
</div></section>

<section class="gfa-sec" id="modele"><div class="w">
  <div class="gfa-head"><div><p class="k">Modele</p><h2 class="d">Trzy konstrukcje dla klubów.</h2></div><p>Ceny „od” netto: konstrukcja i komplet z płytą betonową i malowaniem. <a href="/boiska-street-football/">Wszystkie 8 modeli →</a></p></div>
  <ul class="gfb-mods" role="list">{mods_html}</ul>
</div></section>

<section class="gfa-band" id="klub"><div class="w">
  <div class="gfb-kitb">
    <img src="{KITS_URL}klub.webp" alt="Zestaw Klub: Panna Cage 180 z nawierzchnią Munich Chevrons" loading="lazy" decoding="async">
    <div><p class="k">Zestaw „Klub”</p><h2 class="d" style="font-size:clamp(40px,5vw,80px)">Barwy klubu na boisku.</h2>
      <p class="l">Trening 1 na 1 przez cały rok. Barwy klubu i partnera na nawierzchni. Akademia, ośrodek treningowy.</p>
      <ul><li>Panna Cage 180: dwa poziomy paneli, 1,80 m</li><li>nawierzchnia Munich Chevrons: pasy cięte pod 45° (Otl Aicher)</li><li>kolor ramy i paneli w barwach klubu</li></ul>
      <p class="pr">konstrukcja od {zl(PB['circle-cage-2']['constructionFromNet'])} netto · komplet od {zl(full('circle-cage-2'))}</p>
      <div class="gfa-btns" style="margin-top:18px"><a class="gfa-btn" href="{CLUB_KIT}">Otwórz zestaw w Studio ↗</a><a class="gfa-btn alt" href="/product/panna-octa-cage-180/">Cage 180 w sklepie</a></div></div>
  </div>
</div></section>

<section class="gfa-sec" id="nawierzchnie"><div class="w">
  <div class="gfa-head"><div><p class="k">Nawierzchnie</p><h2 class="d">Pod obciążenie i obuwie.</h2></div><p>Koszt wykończenia dla Panna Cage 180 ({str(A180).replace(".", ",")} m² z zapasem), od Standard do Premium, netto. <a href="/nawierzchnie-sportowe/">Wszystkie nawierzchnie →</a></p></div>
  <ul class="gfb-surf3" role="list">{surf_html}</ul>
</div></section>

<section class="gfa-sec" id="partner"><div class="w">
  <div class="gfa-head"><div><p class="k">Klub + partner</p><h2 class="d">Projekt do rozmowy ze sponsorem.</h2></div><p>Jedna karta projektu porządkuje rozmowę z firmą, właścicielem terenu albo samorządem.</p></div>
  <dl class="gfb-spons">{spons_html}</dl>
  <p class="gfb-honest"><b>Uczciwie:</b> nie gwarantuję dotacji ani pozyskania sponsora. Uprawniony wnioskodawca, prawo do terenu, koszty kwalifikowane, wkład własny i terminy zależą od konkretnego naboru; decyzję podejmuje jego organizator. <a href="/dofinansowanie-boisk/" style="color:var(--violet);font-weight:700">Źródła finansowania →</a></p>
</div></section>

<section class="gfa-sec" id="realizacja"><div class="w">
  <div class="gfb-case">
    <div class="ph">{img("2026/11/Damian-Gawrych-x-Wake-for-friends--768x960.jpg", "Dzieci grają na arenie Gamefields, Wake For Friends")}{img("2024/12/12-3-768x768.jpg", "Panna Octa Cage 180, Wake For Friends")}{img("2024/12/16-768x432.jpg", "Nawierzchnia ze sztucznej trawy, Cage 180")}</div>
    <div><p class="pl">Grodzisk Mazowiecki, park wakeboardowy</p><h3>Cage 180 w Wake For Friends</h3>
      <p class="t">Arena na sztucznej trawie poszerzyła ofertę parku o dyscypliny inne niż wakeboard. Działa na co dzień i podczas wydarzeń: urodzin, półkolonii i spotkań.</p>
      <blockquote>„Boisko Panna Cage 180 świetnie wpisało się w naszą potrzebę poszerzenia oferty parku o dyscypliny inne niż wakeboard. Sprawdza się na co dzień i podczas wydarzeń, które organizujemy.”<cite>Piotr Wiśniewski, Właściciel, Wake For Friends</cite></blockquote>
      <a class="ln" href="/realizacje-gamefields/#wake">Historia realizacji →</a></div>
  </div>
</div></section>

<section class="gfa-band" id="autor"><div class="w">
  <div class="gfb-auth">
    <img src="{UP}2026/11/DAMIAN-GAWRYCH-1-768x998.jpeg" alt="Damian Gawrych w koszulce Warsaw FC" width="768" height="998" loading="lazy" decoding="async">
    <div><p class="k">Od klubowicza dla klubów</p><h2 class="d" style="font-size:clamp(40px,5vw,80px)">Wiem, jak pracuje klub.</h2>
      <p class="l">Damian Gawrych, założyciel Warsaw FC. W pannę gram od 2005 roku, turnieje organizuję od 2008. Strefy treningowe projektuję pod realną pracę trenerów, nie pod katalog.</p>
      <ul class="gfb-tl" role="list"><li><b>2005</b>zawodnik panny i street footballu</li><li><b>2008</b>pierwszy turniej, Jaktorów</li><li><b>2015</b>podium mistrzostw świata, Praga</li><li><b>2017</b>organizator Mistrzostw Świata Freestival Street Games</li></ul>
      <ul class="gfa-links"><li><a href="/damian-gawrych/">Kim jestem →</a></li></ul></div>
  </div>
</div></section>

<section class="gfa-sec" id="start"><div class="w">
  <div class="gfa-head"><div><p class="k">Start</p><h2 class="d">Przygotuj przestrzeń dla klubu.</h2></div><p>Nie musisz mieć wszystkich odpowiedzi na początku. W wiadomości podaj nazwę klubu, miejscowość, potrzeby, status terenu i termin.</p></div>
  <ol class="gfb-three" role="list">{three_html}</ol>
  <div class="gfa-btns" style="margin-top:18px"><a class="gfa-btn" href="/kontakt/">Opisz potrzeby klubu →</a><a class="gfa-btn alt" href="/studio/">Zaprojektuj w Studio ↗</a></div>
</div></section>

<section class="gfa-sec" id="pytania"><div class="w">
  <div class="gfa-head"><div><p class="k">Pytania</p><h2 class="d">Klub, trening, sponsor.</h2></div><p>Koszty, modele, nawierzchnie, branding i finansowanie.</p></div>
  <div class="gfa-faq">{faq_html(FAQ)}</div>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><div><p class="k">Dalej</p><h2 class="d">Od strefy do turnieju.</h2></div><p>Modele, nawierzchnie i wydarzenia.</p></div>
  <ul class="gfb-next" role="list">
    <li><a href="/boiska-street-football/"><i>Modele</i><b>Boiska panna i street football</b><span>8 konstrukcji z cenami i modelem 3D.</span></a></li>
    <li><a href="/nawierzchnie-sportowe/"><i>Nawierzchnie</i><b>Nawierzchnie sportowe</b><span>Trawa, EPDM, płytki i guma z cenami.</span></a></li>
    <li><a href="/eventy-sportowe/"><i>Wydarzenia</i><b>Eventy sportowe</b><span>Turnieje, campy i aktywacje.</span></a></li>
  </ul>
  <ul class="gfb-who" role="list"><li><a href="/aktywacje-sportowe-dla-marek/"><span>Dla</span>marek i sponsorów</a></li><li><a href="/dofinansowanie-boisk/">Dofinansowanie</a></li><li><a href="/renowacja-boisk/">Renowacja</a></li><li><a href="/boiska-do-pilki-noznej/">Boiska do piłki nożnej</a></li><li><a href="/realizacje-gamefields/">Realizacje</a></li></ul>
</div></section>

<section class="gfa-cta"><div class="w">
  <h2 class="d">Strefa treningowa<br>dla Twojego klubu?</h2>
  <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Opisz potrzeby klubu →</a><a class="gfa-btn alt" href="{CLUB_KIT}">Zestaw „Klub” ↗</a></div>
</div></section>
"""

ld = {"@context": "https://schema.org", "@graph": [
    {"@type": "Service", "@id": URL + "#usluga", "name": "Boiska i strefy treningowe dla klubów", "serviceType": "Strefy treningowe 1 na 1 i 3 na 3 dla klubów i akademii", "url": URL, "inLanguage": "pl-PL",
     "areaServed": {"@type": "Country", "name": "Polska"}, "provider": {"@id": SITE + "#studio"},
     "audience": {"@type": "Audience", "audienceType": "kluby sportowe, akademie piłkarskie, organizacje sportowe"},
     "description": "Strefy techniki 1 na 1, boiska 3 na 3 i modernizacje placów dla klubów, w barwach klubu i partnera, z kartą projektu do rozmowy ze sponsorem."},
    {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Gamefields", "item": SITE},
                                                    {"@type": "ListItem", "position": 2, "name": "Kluby i akademie", "item": URL}]},
    {"@type": "FAQPage", "@id": URL + "#pytania", "inLanguage": "pl-PL",
     "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]}]}

write(HERE, "boiska-dla-klubow", CSS, ld, body)
