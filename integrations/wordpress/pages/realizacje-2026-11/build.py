#!/usr/bin/env python3
"""/realizacje-gamefields/ (page 3466), rebuilt 16.11.2026 in the site's content style (gfa-style.css).

Output: realizacje-gamefields.html (one wp:html block, the whole content of the page).

Every fact, quote and photo comes from the page as it was on 16.11.2026 (cases, quotes with names, event gallery,
"more courts"), from the municipalities pages (Kraków from plan to park, city logos in the media library, IDs
4755-4760) and from the homepage (newer photos). Each case links to its model in the shop and the Studio, with the
"from" price from integrations/wordpress/offer/price-from.json. Nothing is invented.
"""
import html
import json
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
OFFER = HERE.parent.parent / "offer"
UP = "https://www.gamefields.eu/wp-content/uploads/"
SITE = "https://www.gamefields.eu/"
BASE_CSS = (HERE.parent / "gfa-style.css").read_text(encoding="utf-8").split("\n", 1)[1]
PRICE = {m["id"]: m for m in json.loads((OFFER / "price-from.json").read_text(encoding="utf-8"))["models"]}
SLUG = {"w1": "panna-ring", "octagon": "panna-octa", "circle-cage-2": "panna-octa-cage-180", "circle-cage-1": "panna-octa-cage-90"}


def zl(n):
    return f"{n:,.0f}".replace(",", " ") + " zł"


def img(path, alt, cls="", eager=False):
    c = f' class="{cls}"' if cls else ""
    return f'<img{c} src="{UP}{path}" alt="{html.escape(alt)}" loading="{"eager" if eager else "lazy"}" decoding="async">'


CSS = """
.gfr-hero{padding:clamp(36px,5vw,80px) 0 clamp(24px,3vw,40px)}
.gfr-hero .w.top{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(20px,3vw,48px);align-items:end}
.gfr-hero h1{font-size:clamp(52px,7.2vw,124px)}
.gfr-hero .lead{max-width:34rem;margin:20px 0 0;font-size:clamp(17px,1.5vw,21px);color:var(--muted)}
.gfr-mosaic{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));grid-auto-rows:clamp(90px,9vw,150px);gap:8px}
.gfr-mosaic img{width:100%;height:100%;object-fit:cover;display:block;background:#E6E0DA}
.gfr-mosaic img:nth-child(1){grid-column:span 4;grid-row:span 3}
.gfr-mosaic img:nth-child(2){grid-column:span 2;grid-row:span 2}
.gfr-mosaic img:nth-child(3){grid-column:span 2;grid-row:span 1}
.gfr-nums{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;margin:clamp(28px,3vw,44px) 0 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.gfr-nums div{padding:18px 18px 18px 0}
.gfr-nums div+div{padding-left:18px;border-left:1px solid var(--line)}
.gfr-nums dt{font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.gfr-nums dd{margin:6px 0 0;font-size:clamp(28px,3.2vw,48px);font-weight:800;letter-spacing:-.045em;line-height:1}
.gfr-nums dd small{display:block;margin-top:6px;font-size:14px;font-weight:500;letter-spacing:0;color:var(--muted)}
.gfr-logos{padding:clamp(24px,3vw,40px) 0}
.gfr-logos p.k{margin-bottom:12px}
.gfa-logos{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px}
.gfa-logos li{display:grid;place-items:center;height:110px;padding:12px;background:#fff;border:1px solid var(--line);overflow:hidden}
.gfa-logos img{display:block;max-width:100%;max-height:84px;width:auto;height:auto;object-fit:contain;transform:scale(var(--z,1))}
.gfr-also{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 0;padding:0;list-style:none}
.gfr-also li{display:inline-flex;align-items:center;min-height:36px;padding:0 14px;border-radius:999px;background:#fff;border:1px solid var(--line);font-size:14px;font-weight:600}
.gfr-jump{position:sticky;top:calc(var(--wp-admin--admin-bar--height,0px) + 58px);z-index:5;background:rgba(244,241,238,.94);backdrop-filter:blur(8px);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.gfr-jump ul{display:flex;gap:8px;overflow-x:auto;margin:0;padding:10px 0;list-style:none;scrollbar-width:none}
.gfr-jump ul::-webkit-scrollbar{display:none}
.gfr-jump a{display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:0 16px;border-radius:999px;border:1.5px solid #CDBFC6;text-decoration:none;font-weight:700;font-size:14px;white-space:nowrap}
.gfr-jump a:hover{border-color:var(--violet)}
.gfr-jump small{color:var(--violet);font-weight:800}
/* case */
.gfr-case{padding:clamp(48px,6vw,96px) 0;border-top:1px solid var(--line);scroll-margin-top:72px}
.gfr-case .w{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:clamp(24px,3.6vw,56px);align-items:start}
.gfr-case.flip .gfr-ph{order:2}
.gfr-ph{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.gfr-ph img{display:block;width:100%;aspect-ratio:1;object-fit:cover;background:#E6E0DA;transition:transform .6s cubic-bezier(.2,.7,.2,1)}
.gfr-ph img:first-child{grid-column:1/-1;aspect-ratio:16/10}
.gfr-ph img:hover{transform:scale(1.02)}
.gfr-ph.two img{grid-column:1/-1;aspect-ratio:16/9}
.gfr-place{margin:0 0 10px;color:var(--violet);font-weight:800;font-size:14px;letter-spacing:.02em}
.gfr-case h2{font-size:clamp(40px,4.6vw,76px)}
.gfr-case .lead{margin:16px 0 0;font-size:18px;color:var(--ink)}
.gfr-case .more{margin:10px 0 0;font-size:16px;color:var(--muted)}
.gfr-facts{margin:20px 0 0;border-top:1px solid var(--line)}
.gfr-facts div{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,8fr);gap:12px;padding:10px 0;border-bottom:1px solid var(--line);font-size:15px}
.gfr-facts dt{color:var(--muted)}.gfr-facts dd{margin:0;font-weight:700}
.gfr-quote{margin:22px 0 0;padding:22px 24px;background:#fff;border-left:5px solid var(--violet)}
.gfr-quote blockquote{margin:0;font-size:clamp(18px,1.6vw,22px);line-height:1.4;font-weight:600;color:var(--ink)}
.gfr-quote blockquote::before{content:"„";color:var(--violet)}
.gfr-quote blockquote::after{content:"”";color:var(--violet)}
.gfr-quote figcaption{margin-top:12px;font-size:14px;color:var(--muted)}.gfr-quote figcaption b{display:block;color:var(--ink);font-size:15px}
.gfr-model{display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px;margin:20px 0 0;padding:14px 16px;background:var(--ink);color:var(--paper)}
.gfr-model span{flex:1 1 180px;font-size:15px}.gfr-model b{color:#fff}
.gfr-model a{display:inline-flex;align-items:center;min-height:44px;padding:0 18px;border-radius:999px;background:var(--lime);color:#1F2A6B!important;text-decoration:none;font-weight:800;font-size:14px}
.gfr-model a.alt{background:transparent;border:1.5px solid rgba(244,241,238,.5);color:var(--paper)!important}
/* quotes band */
.gfr-voices{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.gfr-voices li{padding:24px;border:1px solid rgba(244,241,238,.2)}
.gfr-voices blockquote{margin:0;font-size:clamp(18px,1.6vw,22px);line-height:1.4;font-weight:600}
.gfr-voices p{margin:12px 0 0;font-size:14px;color:rgba(244,241,238,.75)}.gfr-voices p b{display:block;color:#fff;font-size:15px}
/* events */
.gfr-brands{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 20px;padding:0;list-style:none}
.gfr-brands li{display:inline-flex;align-items:center;min-height:40px;padding:0 16px;border-radius:999px;background:var(--lime);color:#1F2A6B;font-weight:800;font-size:14px}
.gfr-ev{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.gfr-ev li{position:relative;overflow:hidden;background:#2a1520}
.gfr-ev li:nth-child(1),.gfr-ev li:nth-child(6){grid-column:span 2;grid-row:span 2}
.gfr-ev img{display:block;width:100%;height:100%;aspect-ratio:1;object-fit:cover;transition:transform .6s cubic-bezier(.2,.7,.2,1)}
.gfr-ev li:hover img{transform:scale(1.05)}
.gfr-ev span{position:absolute;left:8px;right:8px;bottom:8px;padding:8px 10px;background:rgba(28,9,18,.82);color:#fff;font-size:13px;line-height:1.3}
.gfr-ev span b{display:block;font-size:14px}
.gfr-more{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.gfr-more figure{margin:0}
.gfr-more img{display:block;width:100%;aspect-ratio:1;object-fit:cover;background:#E6E0DA}
.gfr-more figcaption{margin-top:8px;font-size:14px;color:var(--muted)}.gfr-more figcaption b{display:block;color:var(--ink);font-size:15px}
.gfr-next{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.gfr-next a{display:grid;gap:6px;height:100%;padding:22px;background:#fff;border:1px solid var(--line);text-decoration:none}
.gfr-next a:hover{border-color:var(--violet)}
.gfr-next b{font-size:20px;letter-spacing:-.02em}.gfr-next span{color:var(--muted);font-size:15px}.gfr-next i{font-style:normal;color:var(--violet);font-weight:800}
@media (max-width:1100px){.gfr-ev{grid-template-columns:repeat(3,minmax(0,1fr))}.gfr-more,.gfr-next{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:900px){
 .gfr-hero .w.top,.gfr-case .w{grid-template-columns:minmax(0,1fr)}.gfr-case.flip .gfr-ph{order:0}
 .gfr-nums{grid-template-columns:repeat(2,minmax(0,1fr))}.gfr-nums div:nth-child(3){padding-left:0;border-left:0}.gfr-nums div:nth-child(n+3){border-top:1px solid var(--line)}
 .gfa-logos{grid-template-columns:repeat(3,minmax(0,1fr))}.gfa-logos li{height:84px}.gfa-logos img{max-height:62px}
 .gfr-voices{grid-template-columns:minmax(0,1fr)}.gfr-ev{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media (max-width:560px){.gfr-mosaic{grid-auto-rows:70px}.gfr-more,.gfr-next{grid-template-columns:minmax(0,1fr)}.gfr-facts div{grid-template-columns:minmax(0,1fr) minmax(0,1.3fr)}}
"""

CASES = [
    {"id": "taras", "place": "Warszawa, Park Świętokrzyski", "title": "Taras w Parku Świętokrzyskim",
     "lead": "Wielofunkcyjna przestrzeń rekreacji dla osób w każdym wieku: trzy boiska połączone z tarasem i rampą do skateboardingu, tuż obok skrzyżowania linii metra, przy Pałacu Kultury i Nauki.",
     "more": "Taras stał się jednym z najpopularniejszych miejsc spotkań warszawskiej młodzieży. Po wybuchu wojny w Ukrainie był też ważnym miejscem spotkań ukraińskiej młodzieży, o czym pisał m.in. New York Times. To inwestycja tymczasowa, która zapowiada dalsze zmiany wokół Pałacu Kultury i Nauki.",
     "facts": [("Boiska", "Panna Ring, trzy areny"), ("Inwestor", "Zarząd Zieleni m.st. Warszawy"), ("Projekt", "Michał Sikorski, Marcin Kwietowicz")],
     "quote": ("Boiska pod Pałacem Kultury były czymś nowym dla Warszawy. Trzy boiska połączone z tarasem i rampą do skateboardingu dały mocny efekt wizualny i przyciągają bardzo dużo młodzieży.", "Grzegorz Gądek", "Prezes Fundacji Skwery Sportów Miejskich"),
     "photos": [("2024/12/Areny-Panna-Football-Alternative-Soccer-Warszawa-3-768x576.jpg", "Taras w Parku Świętokrzyskim w Warszawie, areny panna"), ("2024/12/11-1-768x432.jpg", "Areny panna na Tarasie, widok na centrum Warszawy"),
                ("2024/12/2-4-768x768.jpg", "Arena panna na Tarasie w Parku Świętokrzyskim"), ("2024/12/6-2-768x768.jpg", "Gra na arenie panna, Taras w Parku Świętokrzyskim")],
     "model": "w1", "extra": '<p class="more"><a href="/taras-park-swietokrzyski-warszawa/">Przeczytaj case study →</a></p>'},
    {"id": "kutno", "place": "Kutno, pasaż sportowy", "title": "Panna Octa w Kutnie",
     "lead": "Ośmiokątna arena na miejskim pasażu sportowym, zamówiona przez Urząd Miasta Kutno.",
     "more": "Realizacja przebiegła bez zastrzeżeń, a boisko cieszy się dużą popularnością wśród młodzieży.",
     "facts": [("Boisko", "Panna Octa"), ("Zamawiający", "Urząd Miasta Kutno"), ("Miejsce", "pasaż sportowy")],
     "quote": ("Realizacja przebiegła bez zastrzeżeń. Boisko Panna Octa na pasażu sportowym w Kutnie cieszy się dużą popularnością wśród młodzieży.", "Beata Rafalska", "Urząd Miasta Kutno, ds. inwestycji"),
     "photos": [("2025/06/IMG_6608-scaled-e1749983082809-768x696.jpg", "Boisko Panna Octa w Kutnie, dzieci na boisku"), ("2024/12/1-5-768x768.jpg", "Boisko Panna Octa w Kutnie"),
                ("2024/12/2-5-768x768.jpg", "Gra na boisku Panna Octa w Kutnie"), ("2024/12/3-5-768x768.jpg", "Panna Octa na pasażu sportowym w Kutnie")],
     "model": "octagon"},
    {"id": "krakow", "place": "Kraków, teren miejski", "title": "Kraków: od planu do parku",
     "lead": "Panna Octa Cage 90 na terenie miejskim: od projektu na planie zagospodarowania, przez montaż, po gotową arenę w parku.",
     "more": "Ten sam proces prowadzę dla gmin i szkół: koncepcja na planie, wizualizacja, parametry techniczne i dokumenty do wniosku lub przetargu.",
     "facts": [("Boisko", "Panna Octa Cage 90"), ("Miejsce", "park miejski"), ("Etapy", "projekt, montaż, odbiór")],
     "quote": None,
     "photos": [("2026/11/Krakow-Panna-Arena-Octa-Cage-90-Gamefields-768x768.jpg", "Panna Octa Cage 90 w parku, Kraków"), ("2026/11/Gamefields-x-boiska-x-Projekt-Krakow--768x768.jpg", "Plan zagospodarowania z arenami Gamefields, Kraków"),
                ("2026/11/Gamefields-x-Panna-Cage-x-Krakow-montaz-768x576.jpg", "Montaż areny w parku, Kraków"), ("2026/11/Gamefields-x-Panna-Cage-x-Krakow-768x576.jpg", "Arena przed odbiorem, Kraków")],
     "model": "circle-cage-1", "extra": '<p class="more"><a href="/realizacje-dla-miast/">Realizacje dla miast: trwałość, opinie, finansowanie →</a></p>'},
    {"id": "wake", "place": "Grodzisk Mazowiecki, park wakeboardowy", "title": "Wake For Friends",
     "lead": "Boisko w parku wakeboardowym, które poszerzyło ofertę o dyscypliny inne niż wakeboard.",
     "more": "Arena działa na co dzień i podczas wydarzeń organizowanych w parku: urodzin dzieci, wieczorów kawalerskich i półkolonii. Nawierzchnia to sztuczna trawa.",
     "facts": [("Boisko", "Panna Octa Cage 180"), ("Nawierzchnia", "sztuczna trawa"), ("Zamawiający", "Wake For Friends")],
     "quote": ("Boisko Panna Cage 180 świetnie wpisało się w naszą potrzebę poszerzenia oferty parku o dyscypliny inne niż wakeboard. Sprawdza się na co dzień i podczas wydarzeń, które organizujemy.", "Piotr Wiśniewski", "Właściciel, Wake For Friends"),
     "photos": [("2026/11/Damian-Gawrych-x-Wake-for-friends--768x960.jpg", "Dzieci grają na arenie Gamefields, Wake For Friends"), ("2024/12/12-3-768x768.jpg", "Boisko Panna Octa Cage 180 w parku Wake For Friends"),
                ("2024/12/11-3-768x768.jpg", "Panna Octa Cage 180, Wake For Friends"), ("2024/12/7-4-768x768.jpg", "Arena Cage 180 w parku Wake For Friends")],
     "model": "circle-cage-2", "extra": '<p class="more"><a href="/jak-powstaje-arena/">Zobacz budowę tej areny krok po kroku →</a></p>'},
    {"id": "orlik", "place": "Grodzisk Mazowiecki, Orlik", "title": "Panna Ring na Orliku",
     "lead": "Arena panna na obiekcie Orlik prowadzonym przez OSiR Grodzisk Mazowiecki.",
     "more": "Boisko stoi na obiekcie od 10 lat i przez cały ten czas spełnia swoją rolę bez żadnych uszkodzeń.",
     "facts": [("Boisko", "Panna Ring"), ("Zamawiający", "OSiR Grodzisk Mazowiecki"), ("W użyciu", "10 lat")],
     "quote": ("Boisko Panna Ring stoi na naszym Orliku od 10 lat i przez cały ten czas spełnia swoją rolę bez żadnych uszkodzeń.", "Mariusz Smysło", "Dyrektor OSiR Grodzisk Mazowiecki"),
     "photos": [("2024/12/9-768x432.jpg", "Boisko Panna Ring, Grodzisk Mazowiecki"), ("2024/12/15-768x432.jpg", "Arena Panna Ring na Orliku")],
     "model": "w1", "extra": '<p class="more"><a href="/panna-ring-orlik-grodzisk-mazowiecki/">Przeczytaj case study →</a></p>'},
]

EVENTS = [
    ("2026/11/12-768x574.jpg", "Event Head & Shoulders", "Złote Tarasy, Warszawa"), ("2026/11/1-768x576.jpg", "Event Head & Shoulders", "Stadion, Gdańsk"),
    ("2024/12/10-768x432.jpg", "Turniej Head & Shoulders", "Legia Warszawa"), ("2024/12/1-4-768x768.jpg", "Mistrzostwa Świata Street Soccer 2017", "Grodzisk Mazowiecki"),
    ("2024/12/22-768x432.jpg", "Mistrzostwa Świata Superball", "Liberec"), ("2024/12/13-768x432.jpg", "UEFA Champions League", "event z areną panna"),
    ("2024/12/3-1-768x432.jpg", "Mistrzostwa Polski", "Żerków"), ("2024/12/10-3-768x768.jpg", "Puchar Polski", "Żerków"),
    ("2024/12/5-3-768x768.jpg", "Mistrzostwa Polski, Street Mekka", "Łódź"), ("2024/12/7-768x432.jpg", "Turniej szkolny", "Warszawa"),
    ("2024/12/8-3-768x768.jpg", "Turniej Szoła", "Panna Ring"), ("2024/12/6-3-768x768.jpg", "Trenuj z Krzychem", "Panna Octa Cage 180"),
    ("2026/11/GAMEFIELDS-Street-Football-Tournament-1-768x576.png", "Turniej street football", "Arena Gamefields"),
    ("2026/11/Urodziny-pilkarskie-Gamefields-Damian-Gawrych--768x431.jpg", "Urodziny piłkarskie", "przy arenie Gamefields"),
]
MORE = [("2024/12/13-3-768x768.jpg", "Panna Ring", "Nowy Świat, Warszawa"), ("2024/12/15-3-768x768.jpg", "Panna Octa Cage 180", "Kraków"),
        ("2024/12/4-4-768x768.jpg", "Panna Octa Cage 90", "Kraków"), ("2024/12/14-768x432.jpg", "Panna Octa Cage 90", "Grodzisk Mazowiecki"),
        ("2024/12/14-3-768x768.jpg", "Panna Ring", "plaża"), ("2026/11/Zyrardow-Panna-Arena-1v1--768x575.jpg", "Arena panna 1 na 1", "Żyrardów"), ("2024/12/16-768x432.jpg", "Nawierzchnia ze sztucznej trawy", "arena Cage 180, Wake For Friends")]

LOGOS = ('<ul class="gfa-logos" role="list">'
         f'<li style="--z:1.3"><img src="{UP}2026/11/LOGO-Warszawa--300x194.png" alt="Miasto stołeczne Warszawa" width="300" height="194" loading="lazy" decoding="async"></li>'
         f'<li style="--z:1.7"><img src="{UP}2026/11/Zarzad-Zieleni-Miejskiej-Warszawa-300x141.jpg" alt="Zarząd Zieleni m.st. Warszawy" width="300" height="141" loading="lazy" decoding="async"></li>'
         f'<li style="--z:1"><img src="{UP}2026/11/LOHO-Krakow--300x200.jpg" alt="Kraków" width="300" height="200" loading="lazy" decoding="async"></li>'
         f'<li style="--z:1.6"><img src="{UP}2026/11/Grodzisk-Mazowiecki-LOGO-300x200.jpg" alt="Grodzisk Mazowiecki" width="300" height="200" loading="lazy" decoding="async"></li>'
         f'<li style="--z:1"><img src="{UP}2026/11/LOGO-Kutno--300x231.jpg" alt="Kutno" width="300" height="231" loading="lazy" decoding="async"></li>'
         f'<li style="--z:1.15"><img src="{UP}2026/11/LOGO-Lodz-300x139.webp" alt="Łódź" width="300" height="139" loading="lazy" decoding="async"></li></ul>')


def case_html(c, i):
    m = PRICE[c["model"]]
    photos = "".join(img(p, a) for p, a in c["photos"])
    facts = "".join(f"<div><dt>{a}</dt><dd>{b}</dd></div>" for a, b in c["facts"])
    q = c["quote"]
    quote = (f'<figure class="gfr-quote"><blockquote>{html.escape(q[0])}</blockquote><figcaption><b>{q[1]}</b>{q[2]}</figcaption></figure>' if q else "")
    model = (f'<div class="gfr-model"><span>Model: <b>{m["name"]}</b>, konstrukcja od {zl(m["constructionFromNet"])} netto</span>'
             f'<a href="/product/{SLUG[c["model"]]}/">Zobacz model</a><a class="alt" href="{m["link"]}">Zaprojektuj podobne ↗</a></div>')
    return (f'<section class="gfr-case{" flip" if i % 2 else ""}" id="{c["id"]}"><div class="w">'
            f'<div class="gfr-ph{" two" if len(c["photos"]) == 2 else ""}">{photos}</div>'
            f'<div><p class="gfr-place">{c["place"]}</p><h2 class="d">{c["title"]}</h2><p class="lead">{c["lead"]}</p><p class="more">{c["more"]}</p>'
            + c.get("extra", "") + f'<dl class="gfr-facts">{facts}</dl>{quote}{model}</div></div></section>')


hero_photos = "".join(img(p, a, eager=True) for p, a in [
    ("2024/12/Areny-Panna-Football-Alternative-Soccer-Warszawa-3-768x576.jpg", "Taras w Parku Świętokrzyskim, Warszawa"),
    ("2025/06/IMG_6608-scaled-e1749983082809-768x696.jpg", "Panna Octa w Kutnie"),
    ("2026/11/Krakow-Panna-Arena-Octa-Cage-90-Gamefields-768x768.jpg", "Panna Octa Cage 90, Kraków")])
voices = "".join(f'<li><blockquote>„{html.escape(c["quote"][0])}”</blockquote><p><b>{c["quote"][1]}</b>{c["quote"][2]}</p></li>' for c in CASES if c["quote"])
events = "".join(f'<li>{img(p, t + ", " + w)}<span><b>{html.escape(t)}</b>{html.escape(w)}</span></li>' for p, t, w in EVENTS)
more = "".join(f'<li><figure>{img(p, t + ", " + w)}<figcaption><b>{t}</b>{w}</figcaption></figure></li>' for p, t, w in MORE)
jump = "".join(f'<li><a href="#{c["id"]}">{c["title"].split(":")[0]}</a></li>' for c in CASES) + '<li><a href="#opinie">Opinie <small>4</small></a></li><li><a href="#eventy">Turnieje i eventy <small>14</small></a></li>'

body = f"""
<section class="gfr-hero"><div class="w top">
  <div>
    <p class="k">Realizacje Gamefields</p>
    <h1 class="d">Realizacje.</h1>
    <p class="lead">Boiska Gamefields w miastach, parkach i na obiektach sportowych. Zdjęcia z miejsc i słowa osób, które je zamówiły.</p>
    <ul class="gfa-links"><li><a href="/realizacje-dla-miast/">Dla samorządów: trwałość, opinie, finansowanie →</a></li></ul>
  </div>
  <div class="gfr-mosaic">{hero_photos}</div>
</div>
<div class="w">
  <dl class="gfr-nums">
    <div><dt>Na Orliku</dt><dd>10 lat<small>Panna Ring bez żadnych uszkodzeń</small></dd></div>
    <div><dt>Pod Pałacem Kultury</dt><dd>3 areny<small>Taras w Parku Świętokrzyskim</small></dd></div>
    <div><dt>Miasta</dt><dd>7<small>od Warszawy po Gdańsk</small></dd></div>
    <div><dt>Turnieje i eventy</dt><dd>od 2008<small>w tym mistrzostwa świata</small></dd></div>
  </dl>
</div></section>

<section class="gfr-logos"><div class="w">
  <p class="k">Zaufali nam</p>
  {LOGOS}
  <ul class="gfr-also" role="list"><li>Żyrardów</li><li>Gdańsk</li><li>OSiR Grodzisk Mazowiecki</li><li>Wake For Friends</li><li>Fundacja Skwery Sportów Miejskich</li><li>Head &amp; Shoulders</li></ul>
</div></section>

<nav class="gfr-jump" aria-label="Realizacje na tej stronie"><div class="w"><ul role="list">{jump}</ul></div></nav>

{"".join(case_html(c, i) for i, c in enumerate(CASES))}

<section class="gfa-band" id="opinie"><div class="w">
  <div class="gfa-head"><div><p class="k">Opinie</p><h2 class="d">Słowa osób, które zamówiły.</h2></div><p>Cztery miejsca, cztery opinie: miasto, park, Orlik i fundacja sportów miejskich.</p></div>
  <ul class="gfr-voices" role="list">{voices}</ul>
</div></section>

<section class="gfa-sec" id="eventy"><div class="w">
  <div class="gfa-head"><h2 class="d">Turnieje i eventy.</h2><p>Mobilne areny panna na mistrzostwach, turniejach i eventach marek. Arenę mobilną można wynająć albo kupić: od {zl(PRICE["mobile"]["constructionFromNet"])} netto.</p></div>
  <ul class="gfr-brands" role="list"><li>Head &amp; Shoulders</li><li>UEFA Champions League</li><li>Legia Warszawa</li><li>Mistrzostwa Świata 2017</li><li>Superball, Liberec</li></ul>
  <ul class="gfr-ev" role="list">{events}</ul>
  <ul class="gfa-links"><li><a href="/wynajem-boisk-mobilnych/">Arena mobilna na event →</a></li></ul>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><h2 class="d">Więcej boisk.</h2><p>Kolejne miejsca, w których stoją nasze areny.</p></div>
  <ul class="gfr-more" role="list">{more}</ul>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><h2 class="d">Twoje miejsce może być następne.</h2><p>Od pomysłu do pierwszego meczu: zaprojektuj, sprawdź cenę i wyślij zdjęcia placu.</p></div>
  <ul class="gfr-next" role="list">
    <li><a href="/studio/"><i>↗</i><b>Studio 3D</b><span>Wybierz boisko, kolory i nawierzchnię. Cena liczy się na bieżąco.</span></a></li>
    <li><a href="/shop/"><i>→</i><b>Boiska i ceny</b><span>Osiem modeli od {zl(PRICE["circle-cage-1"]["constructionFromNet"])} netto i osiem nawierzchni.</span></a></li>
    <li><a href="/dofinansowanie-boisk/"><i>→</i><b>Dofinansowanie</b><span>Dla gmin i szkół: nabory 2027 i dokumenty do wniosku.</span></a></li>
    <li><a href="/baza-wiedzy/"><i>→</i><b>Baza wiedzy</b><span>Koszty, nawierzchnie, Orlik i dofinansowanie w dwunastu poradnikach.</span></a></li>
  </ul>
</div></section>

<section class="gfa-cta"><div class="w">
  <h2 class="d">Chcesz podobne<br>miejsce?</h2>
  <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Wyślij zdjęcia placu →</a><a class="gfa-btn alt" href="/studio/">Zaprojektuj w Studio ↗</a></div>
</div></section>
"""

ld = {"@context": "https://schema.org", "@graph": [
    {"@type": "CollectionPage", "name": "Realizacje Gamefields", "url": SITE + "realizacje-gamefields/", "inLanguage": "pl-PL",
     "description": "Realizacje Gamefields: boiska panna i street football w miastach, parkach i na obiektach sportowych, z opiniami zamawiających."},
    {"@type": "ItemList", "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": c["title"], "url": SITE + "realizacje-gamefields/#" + c["id"]} for i, c in enumerate(CASES)]}]}
out = ("<!-- wp:html -->\n<style>\n" + BASE_CSS + CSS + "</style>\n<script type=\"application/ld+json\">" +
       json.dumps(ld, ensure_ascii=False, separators=(",", ":")) + "</script>\n" + '<div class="gfa">\n' + body.strip() + "\n</div>\n<!-- /wp:html -->\n")
if "&&" in out:
    raise SystemExit("double ampersand would break in WordPress")
(HERE / "realizacje-gamefields.html").write_text(out, encoding="utf-8")
print(f"realizacje-gamefields.html {len(out)} bytes")

# ================================================================ case study pages (published 28.11.2026, pages 4973 and 4974)
# Text from the published pages (written with ChatGPT) and from CASES above; the placeholder sentence
# "Szczegóły nawierzchni i pełne parametry realizacji wymagają uzupełnienia." is dropped. Same look as this page.
CASE_CSS = """
.gfc-hero{padding:clamp(36px,5vw,80px) 0 clamp(28px,3vw,48px);border-bottom:1px solid var(--line)}
.gfc-hero .w{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,6fr);gap:clamp(24px,4vw,64px);align-items:center}
.gfc-hero h1{font-size:clamp(44px,5.6vw,92px)}
.gfc-hero .lead{max-width:36rem;margin:20px 0 0;font-size:clamp(17px,1.5vw,21px);color:var(--muted)}
.gfc-hero figure{margin:0}.gfc-hero figure img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;background:#E6E0DA}
.gfc-crumbs{margin:0 0 18px;font-size:13px;color:var(--muted)}.gfc-crumbs a{text-decoration:none}
.gfc-meta{display:flex;flex-wrap:wrap;gap:8px;margin:20px 0 0;padding:0;list-style:none}
.gfc-meta li{display:inline-flex;align-items:center;min-height:32px;padding:0 12px;border-radius:999px;background:#fff;border:1px solid var(--line);font-size:13px;font-weight:600}
.gfc-body{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:clamp(24px,4vw,64px);align-items:start}
.gfc-body h2{font-size:clamp(32px,3.6vw,56px);font-weight:800;letter-spacing:-.045em;line-height:.95;margin:0 0 16px}
.gfc-body section{padding:0 0 clamp(28px,3vw,44px)}
.gfc-body p{font-size:17px;line-height:1.6;color:#5A4652;margin:0 0 12px}
.gfc-side{position:sticky;top:96px;display:grid;gap:12px}
.gfc-model{display:grid;background:#fff;border:1px solid var(--line);text-decoration:none;color:var(--ink)}
.gfc-model .ph{background:var(--bg,#E6E0DA)}.gfc-model .ph img{display:block;width:100%;aspect-ratio:4/3;object-fit:contain;padding:8%}
.gfc-model .tx{display:grid;gap:6px;padding:18px 20px 20px}
.gfc-model .tx span{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--violet)}
.gfc-model .tx b{font-size:26px;letter-spacing:-.03em}
.gfc-model .tx p{margin:0;color:var(--muted);font-size:15px}
.gfc-model .acts{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
.gfc-model .acts a{display:inline-flex;align-items:center;min-height:44px;padding:0 16px;border-radius:999px;background:var(--ink);color:var(--paper);font-weight:700;font-size:15px;text-decoration:none}
.gfc-model .acts a.alt{background:transparent;color:var(--ink);border:1.5px solid var(--ink)}
.gfc-gal{display:grid;grid-template-columns:repeat(var(--n,3),minmax(0,1fr));gap:8px}
.gfc-gal img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;background:#E6E0DA}
.gfc-gal[style="--n:1"]{max-width:900px}.gfc-gal[style="--n:1"] img{aspect-ratio:16/9}
.gfc-other{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.gfc-other a{display:grid;background:#fff;border:1px solid var(--line);text-decoration:none;color:var(--ink);transition:border-color .2s ease}
.gfc-other a:hover{border-color:var(--violet)}
.gfc-other img{display:block;width:100%;aspect-ratio:16/10;object-fit:cover;background:#E6E0DA}
.gfc-other span{display:grid;gap:4px;padding:14px 16px 16px;font-size:14px;color:var(--muted)}.gfc-other b{font-size:20px;letter-spacing:-.02em;color:var(--ink)}
@media (max-width:900px){.gfc-hero .w,.gfc-body{grid-template-columns:minmax(0,1fr)}.gfc-side{position:static}.gfc-gal{grid-template-columns:minmax(0,1fr)}.gfc-other{grid-template-columns:minmax(0,1fr)}}
"""
RENDER = {"w1": ("gf-ring-1200.webp", "#6336F5"), "octagon": ("gf-octa-1200.webp", "#47132D"), "circle-cage-1": ("gf-cage90-1200.webp", "#D23A26"),
          "circle-cage-2": ("gf-cage180-1200.webp", "#D8F24A")}
CASE = {c["id"]: c for c in CASES}
CASE_PAGES = [
    {"slug": "taras-park-swietokrzyski-warszawa", "case": "taras", "city": "Warszawa",
     "h1": "Areny do panny przy Pałacu Kultury w Warszawie",
     "lead": "W Parku Świętokrzyskim, w sąsiedztwie Pałacu Kultury i Nauki, trzy areny do panny tworzą część przestrzeni tarasu. Projekt pokazuje, jak niewielkie boiska mogą stać się elementem publicznej przestrzeni miejskiej.",
     "sections": [
         ("Trzy areny i przestrzeń spotkań",
          "<p>W Parku Świętokrzyskim powstała przestrzeń z trzema arenami Panna Ring, tarasem i rampą do skateboardingu. Inwestorem był Zarząd Zieleni m.st. Warszawy. "
          "To wielofunkcyjna przestrzeń rekreacji dla osób w każdym wieku, tuż obok skrzyżowania linii metra.</p>"),
         ("Boiska w przestrzeni miasta",
          "<p>Układ aren i tarasu łączy możliwość gry z miejscem spotkań. " + CASE["taras"]["more"] + "</p>")]},
    {"slug": "panna-ring-orlik-grodzisk-mazowiecki", "case": "orlik", "city": "Grodzisk Mazowiecki",
     "h1": "Panna Ring na Orliku w Grodzisku Mazowieckim",
     "lead": "Panna Ring to kompaktowa arena do gry 1 na 1, zastosowana przy Orliku w Grodzisku Mazowieckim. To przykład wykorzystania niewielkiej przestrzeni sportowej do gry i treningu technicznego.",
     "sections": [
         ("Model i zastosowanie",
          "<p>Panna Ring ma około 5 m średnicy. Rozwiązanie nadaje się do przestrzeni osiedlowych i szkolnych oraz obiektów otwartych dla lokalnej społeczności. "
          "Arena uzupełnia większą przestrzeń sportową Orlika.</p>"),
         ("10 lat na Orliku",
          "<p>Boisko stoi na obiekcie prowadzonym przez OSiR Grodzisk Mazowiecki od 10 lat i przez cały ten czas spełnia swoją rolę bez żadnych uszkodzeń.</p>"
          "<p>Przy planowaniu modernizacji pomagamy dobrać rozwiązanie i przygotować dokumentację techniczną odpowiednią do inwestycji. "
          'Zobacz <a href="/dofinansowanie-boisk-2027-jak-przygotowac-wniosek/">poradnik o dofinansowaniu</a> i <a href="/modernizacja-orlika-epdm-trawa-czy-plyty/">modernizację Orlika</a>.</p>')]},
]


def case_page(cp):
    c = CASE[cp["case"]]
    m = PRICE[c["model"]]
    render, bg = RENDER[c["model"]]
    q = c["quote"]
    facts = "".join(f"<li>{a}: {b}</li>" for a, b in c["facts"])
    secs = "".join(f"<section><h2>{h}</h2>{t}</section>" for h, t in cp["sections"])
    quote = f'<figure class="gfr-quote"><blockquote>{html.escape(q[0])}</blockquote><figcaption><b>{q[1]}</b>{q[2]}</figcaption></figure>' if q else ""
    gal_photos = c["photos"][1:]  # the first one is in the hero
    gal = f'<div class="gfc-gal" style="--n:{len(gal_photos)}">' + "".join(img(p, a) for p, a in gal_photos) + "</div>"
    others = [x for x in CASES if x["id"] != cp["case"]][:3]
    other = "".join(f'<li><a href="/realizacje-gamefields/#{o["id"]}">{img(o["photos"][0][0], o["photos"][0][1])}<span><b>{o["title"]}</b>{o["place"]}</span></a></li>' for o in others)
    body = f"""
<section class="gfc-hero"><div class="w">
  <div>
    <p class="gfc-crumbs"><a href="/realizacje-gamefields/">Realizacje</a> / {cp["city"]}</p>
    <p class="k">Case study · {c["place"]}</p>
    <h1 class="d">{cp["h1"]}</h1>
    <p class="lead">{cp["lead"]}</p>
    <ul class="gfc-meta">{facts}</ul>
  </div>
  <figure>{img(c["photos"][0][0], c["photos"][0][1], eager=True)}</figure>
</div></section>

<section class="gfa-sec"><div class="w gfc-body">
  <div>{secs}{quote}</div>
  <aside class="gfc-side">
    <div class="gfc-model"><span class="ph" style="--bg:{bg}"><img src="{UP}2026/11/{render}" alt="{m["name"]}, render" loading="lazy" decoding="async"></span>
      <span class="tx"><span>Model w tej realizacji</span><b>{m["name"]}</b><p>Konstrukcja od {zl(m["constructionFromNet"])} netto. Ceny orientacyjne; montaż i transport wyceniamy osobno.</p>
      <span class="acts"><a href="{m["link"]}">Zaprojektuj podobne ↗</a><a class="alt" href="/product/{SLUG[c["model"]]}/">Zobacz model</a></span></span></div>
  </aside>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><h2 class="d">Zdjęcia.</h2><p>{c["title"]}, {c["place"]}.</p></div>
  {gal}
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><h2 class="d">Inne realizacje.</h2><p>Kolejne miejsca z boiskami Gamefields.</p></div>
  <ul class="gfc-other" role="list">{other}</ul>
  <ul class="gfa-links"><li><a href="/realizacje-gamefields/">← Wszystkie realizacje</a></li></ul>
</div></section>

<section class="gfa-cta"><div class="w">
  <h2 class="d">Chcesz podobne<br>miejsce?</h2>
  <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Wyślij zdjęcia placu →</a><a class="gfa-btn alt" href="{m["link"]}">Zaprojektuj podobne w Studio ↗</a></div>
</div></section>
"""
    url = SITE + cp["slug"] + "/"
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "Article", "headline": cp["h1"], "description": cp["lead"], "inLanguage": "pl-PL", "dateModified": "2026-11-28",
         "image": UP + c["photos"][0][0], "author": {"@type": "Person", "name": "Damian Gawrych", "url": SITE + "damian-gawrych/"},
         "publisher": {"@type": "Organization", "name": "Gamefields", "url": SITE}, "mainEntityOfPage": url,
         "about": {"@type": "Product", "name": m["name"], "url": SITE + "product/" + SLUG[c["model"]] + "/"}},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Gamefields", "item": SITE},
            {"@type": "ListItem", "position": 2, "name": "Realizacje", "item": SITE + "realizacje-gamefields/"},
            {"@type": "ListItem", "position": 3, "name": cp["h1"], "item": url}]}]}
    return ("<!-- wp:html -->\n<style>\n" + BASE_CSS + CSS + CASE_CSS + "</style>\n<script type=\"application/ld+json\">" +
            json.dumps(ld, ensure_ascii=False, separators=(",", ":")) + "</script>\n" + '<div class="gfa">\n' + body.strip() + "\n</div>\n<!-- /wp:html -->\n")


for cp in CASE_PAGES:
    page_html = case_page(cp)
    if "&&" in page_html:
        raise SystemExit("double ampersand would break in WordPress")
    (HERE / f'{cp["slug"]}.html').write_text(page_html, encoding="utf-8")
    print(f'{cp["slug"]}.html {len(page_html)} bytes')
