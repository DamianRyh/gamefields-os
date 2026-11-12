#!/usr/bin/env python3
"""Write docs/roadmap/DLA-CHATGPT-autentycznosc.md: one self-contained deployment file (all page code inline, no GitHub links).

Run after build.py.
"""
import pathlib

D = pathlib.Path(__file__).resolve().parent
ROOT = D.parents[3]
UP = "https://www.gamefields.eu/wp-content/uploads/2026/11/"
MEDIA = {}
for line in (D / "media-2026-11-12.txt").read_text(encoding="utf-8").splitlines():
    p = line.split()
    MEDIA[int(p[0])] = p[1:]


def img(i):
    o, *s = MEDIA[i]
    for x in s:
        if "-768x" in x:
            return UP + x
    return UP + o


STY = ('<style>.gfx{max-width:1360px;margin:0 auto;padding:clamp(40px,5vw,80px) clamp(16px,3.4vw,48px);font-family:GHInter,Inter,Arial,sans-serif;color:#47132D}'
       '.gfx h2{font-family:inherit;font-weight:800;letter-spacing:-.05em;line-height:.92;font-size:clamp(36px,5vw,72px);margin:0 0 16px;text-transform:none;color:inherit}'
       '.gfx p{max-width:40rem;font-size:18px;color:#6F5A66;margin:0 0 24px}'
       '.gfx ul{list-style:none;margin:0 0 20px;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}'
       '.gfx figure{margin:0}.gfx img{display:block;width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;background:#E6E0DA}'
       '.gfx figcaption{margin-top:8px;font-size:14px;color:#6F5A66}.gfx figcaption b{display:block;color:#47132D;font-size:15px}'
       '.gfx a.b{display:inline-flex;align-items:center;min-height:48px;padding:0 22px;border-radius:999px;background:#6336F5;color:#fff;text-decoration:none;font-weight:700}</style>')


def f(i, t, s, alt):
    return f'<li><figure><img src="{img(i)}" alt="{alt}" loading="lazy" decoding="async"><figcaption><b>{t}</b>{s}</figcaption></figure></li>'


def block(inner):
    return f"<!-- wp:html -->{STY}<section class=\"gfx\">{inner}</section><!-- /wp:html -->"


SNIP = {
    "o-nas": ("na końcu treści, przed stopką", block(
        '<h2>Kto stoi za Gamefields.</h2><p>Gamefields to autorskie studio Damiana Gawrycha. W pannę gra od 2005 roku, turnieje organizuje od 2008. W 2017 roku zorganizował Mistrzostwa Świata Freestival Street Games. Z tego doświadczenia projektuje boiska.</p><ul>'
        + f(4596, "Damian Gawrych", "założyciel Alternative Soccer", "Damian Gawrych na scenie")
        + f(4590, "Gra bez barier", "zajęcia z zawodnikami Olimpiad Specjalnych", "Zajęcia w arenie panna z zawodnikami Olimpiad Specjalnych")
        + f(4580, "Freestival Street Games 2017", "promocja mistrzostw na PGE Narodowym", "Stoisko Freestival Street Games na PGE Narodowym")
        + '</ul><a class="b" href="/damian-gawrych/">Poznaj Damiana →</a>')),
    "eventy-sportowe": ("przed sekcją FAQ", block(
        '<h2>Z naszych wydarzeń.</h2><p>Turnieje, mistrzostwa i pokazy z mobilną areną panna. Organizujemy je od 2008 roku.</p><ul>'
        + f(4580, "Mistrzostwa Świata Freestival Street Games 2017", "promocja na PGE Narodowym", "Stoisko Freestival Street Games na PGE Narodowym")
        + f(4585, "Podium turnieju", "Street Games", "Zwycięzcy turnieju na podium")
        + f(4586, "One vs One Panna", "plakat turnieju Street Games", "Plakat turnieju One vs One Panna")
        + f(4609, "Pokaz na Tarasie", "Warszawa, zdjęcie: Zarząd Zieleni m.st. Warszawy", "Pokaz gry na Tarasie przy Pałacu Kultury i Nauki")
        + '</ul><a class="b" href="/koncepcje/">Zobacz koncepcje aren →</a>')),
    "boiska-dla-szkol": ("przed sekcją z formularzem lub na końcu treści", block(
        '<h2>Panna w szkole.</h2><p>Mobilna arena mieści się w sali gimnastycznej, a mała, zamknięta przestrzeń sprawdza się na lekcjach, turniejach szkolnych i zajęciach integracyjnych.</p><ul>'
        + f(4578, "Arena w sali gimnastycznej", "pokaz i turniej szkolny", "Uczniowie wokół areny panna w szkolnej sali gimnastycznej")
        + f(4590, "Zajęcia integracyjne", "z zawodnikami Olimpiad Specjalnych", "Zajęcia w arenie panna z zawodnikami Olimpiad Specjalnych")
        + "</ul>")),
}

PAGES = [
    ("damian-gawrych", "Damian Gawrych", "Damian Gawrych — autor studia Gamefields | panna i street football od 2005",
     "Damian Gawrych gra w pannę od 2005 roku, organizuje turnieje od 2008, w 2017 zorganizował Mistrzostwa Świata Freestival Street Games. Autor studia Gamefields."),
    ("jak-powstaje-arena", "Jak powstaje arena", "Jak powstaje arena panna: budowa krok po kroku | Gamefields",
     "Budowa areny Panna Octa Cage 180 w parku Wake For Friends: od piasku, przez podest, do gry. Zdjęcia z każdego etapu."),
    ("koncepcje", "Koncepcje", "Koncepcje boisk miejskich | Gamefields",
     "Koncepcje Gamefields: plac pod Pałacem Kultury z boiskami, boisko pod Mostem Łazienkowskim, modernizacja betonowego placu i areny Freestival Street Games."),
    ("sztuka-z-gry", "Sztuka z gry", "Sztuka z gry — grafiki Damiana Gawrycha | Gamefields",
     "Seria grafik Damiana Gawrycha w czerni, bieli i czerwieni. Koła, ślady i rytm gry przeniesione na papier."),
]

doc = ["# Autentyczność gamefields.eu: nowe strony i zdjęcia (12.11.2026)", "",
       "Dla wykonawcy z dostępem do WordPressa gamefields.eu. Ten plik zawiera cały kod. Nie trzeba otwierać żadnych linków do GitHuba. Zdjęcia są już w bibliotece mediów (załączniki 4578–4625).", "",
       "## Zasady", "", "1. Nowe strony twórz jako **szkice**. Publikacja dopiero po akceptacji właściciela.",
       "2. Przed zmianą istniejącej strony zapisz numer jej wersji.",
       "3. Kod wklejaj w bloku „Własny HTML” bez zmian. Nie przerabiaj go na bloki wizualne.",
       "4. Po publikacji wyczyść cache LiteSpeed.", "",
       "## Zadanie 1. Cztery nowe strony", "",
       "Dla każdej strony: Strony → Dodaj nową → tytuł i adres (slug) z tabeli → szablon **„Pełna szerokość”** → blok „Własny HTML” → wklej kod. W Yoast SEO wpisz tytuł SEO i opis meta z tabeli.", "",
       "| Tytuł strony | Adres | Tytuł SEO | Opis meta |", "| --- | --- | --- | --- |"]
for slug, t, st, md in PAGES:
    doc.append(f"| {t} | `/{slug}/` | {st} | {md} |")
for slug, *_ in PAGES:
    doc += ["", f"### Kod strony /{slug}/", "", "```html", (D / f"{slug}.html").read_text(encoding="utf-8").strip(), "```"]
doc += ["", "## Zadanie 2. Zdjęcia na istniejących stronach", "", "Każdy fragment to osobny blok „Własny HTML”. Wstaw go w podanym miejscu.", ""]
for slug, (where, code) in SNIP.items():
    doc += [f"### /{slug}/ ({where})", "", "```html", code, "```", ""]
doc += ["### /realizacje-gamefields/ (opis Wake For Friends)", "", "Pod tekstem realizacji „Wake For Friends” dodaj link:", "",
        "```html", '<p><a href="/jak-powstaje-arena/">Zobacz budowę tej areny krok po kroku →</a></p>', "```", "",
        "### Strona główna (ID 3462)", "",
        "1. W sekcji „Projektuję miejsca, do których się wraca.” znajdź przycisk „Napisz do mnie” (`<a class=\"pill\" href=\"#kontakt\" ...>Napisz do mnie ...</a>`). Zaraz po nim wstaw:", "",
        "```html", '<a href="/damian-gawrych/" style="color:var(--paper);font-weight:700;text-underline-offset:4px">Kim jestem: Damian Gawrych →</a>', "```", "",
        "2. W `<script type=\"application/ld+json\">` strony głównej zamień:", "",
        "```json", '"founder":{"@type":"Person","name":"Damian Gawrych"}', "```", "", "na:", "",
        "```json", '"founder":{"@type":"Person","@id":"https://www.gamefields.eu/#damian-gawrych","name":"Damian Gawrych","url":"https://www.gamefields.eu/damian-gawrych/","sameAs":["https://www.instagram.com/damiangawrych/","https://www.damiangawrych.pl/"]}', "```", "",
        "## Zadanie 3. Autor wpisów", "",
        "Użytkownicy → profil konta, z którego publikowane są wpisy na blogu:",
        "- „Wyświetlaj publicznie jako”: **Damian Gawrych**,",
        "- „Informacje biograficzne”: „Autor studia Gamefields. W pannę gra od 2005 roku, turnieje organizuje od 2008. Organizator Mistrzostw Świata Freestival Street Games 2017. Projektuje boiska do panny i street footballu.”,",
        "- „Witryna internetowa”: `https://www.gamefields.eu/damian-gawrych/`,",
        "- jeśli Yoast SEO pokazuje pola profili społecznościowych: Instagram `https://www.instagram.com/damiangawrych/`, inne: `https://www.damiangawrych.pl/`.", "",
        "## Lista kontrolna", "",
        "- [ ] Cztery nowe strony otwierają się pod swoimi adresami, na komputerze i na telefonie (390 px), bez przewijania w bok.",
        "- [ ] Na każdej stronie wszystkie zdjęcia się wczytują (narzędzia przeglądarki → Sieć, brak 404).",
        "- [ ] Linki między stronami działają: Damian Gawrych ↔ Jak powstaje arena ↔ Koncepcje ↔ Sztuka z gry ↔ Realizacje ↔ Kontakt ↔ Studio, a linki do Instagrama i damiangawrych.pl otwierają się w nowej karcie.",
        "- [ ] Dane strukturalne przechodzą walidację: https://validator.schema.org/ (Person, ProfilePage, HowTo, CollectionPage).",
        "- [ ] Fragmenty na O nas, Eventy sportowe i Boiska dla szkół wyglądają spójnie z resztą strony.",
        "- [ ] Strona główna: link „Kim jestem” jest widoczny w sekcji studia.",
        "- [ ] Cache LiteSpeed wyczyszczony.", "",
        "## Cofnięcie", "", "Nowe strony przenieś do kosza. Na istniejących stronach przywróć zapisane wersje.", ""]
out = "\n".join(doc)
assert "raw.githubusercontent" not in out
(ROOT / "docs" / "roadmap" / "DLA-CHATGPT-autentycznosc.md").write_text(out, encoding="utf-8")
print("ok", len(out))
