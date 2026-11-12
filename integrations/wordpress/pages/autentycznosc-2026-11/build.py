#!/usr/bin/env python3
"""Build the "authenticity" pages and snippets for gamefields.eu from the owner's photos (WordPress media, 12.11.2026).

Output (next to this file):
  damian-gawrych.html      new page /damian-gawrych/        (one wp:html block)
  jak-powstaje-arena.html  new page /jak-powstaje-arena/    (one wp:html block)
  koncepcje.html           new page /koncepcje/             (one wp:html block)
  preview.html             all three pages on one local preview page

Images are referenced from the WordPress media library. The 768 px size is used where WordPress generated it
(list in media-2026-11-12.txt: attachment id, original file, generated sizes).
Copy states only what the photos or the live site already show; open questions are in PYTANIA.md.
"""
import html
import json
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
UP = "https://www.gamefields.eu/wp-content/uploads/"
SITE = "https://www.gamefields.eu/"

MEDIA = {}
for line in (HERE / "media-2026-11-12.txt").read_text(encoding="utf-8").splitlines():
    parts = line.split()
    MEDIA[int(parts[0])] = parts[1:]


def img(i, size=768):
    """URL of attachment i in the requested width (falls back to the original file)."""
    original, *sizes = MEDIA[i]
    for s in sizes:
        if f"-{size}x" in s:
            return UP + "2026/11/" + s
    return UP + "2026/11/" + original


def full(i):
    original, *sizes = MEDIA[i]
    for s in sizes:
        if "-1536x" in s or "-1024x" in s:
            best = s
    return UP + "2026/11/" + (best if any("-1536x" in s or "-1024x" in s for s in sizes) else original)


def fig(i, title, place="", cls="", alt=None, size=768):
    alt = alt or (title + (", " + place if place else ""))
    cap = f"<b>{title}</b>" + (f"<span>{place}</span>" if place else "")
    c = f' class="{cls}"' if cls else ""
    return (f'<figure{c}><img src="{img(i, size)}" alt="{html.escape(alt)}" loading="lazy" decoding="async">'
            f"<figcaption>{cap}</figcaption></figure>")


CSS = "<style>\n" + (HERE.parent / "gfa-style.css").read_text(encoding="utf-8").split("\n", 1)[1] + "</style>"


def page(body, ld):
    return ("<!-- wp:html -->\n" + CSS + "\n<script type=\"application/ld+json\">" +
            json.dumps(ld, ensure_ascii=False, separators=(",", ":")) + "</script>\n" +
            '<div class="gfa">\n' + body.strip() + "\n</div>\n<!-- /wp:html -->\n")


CTA = """
<section class="gfa-cta"><div class="w">
  <h2 class="d">Masz plac?<br>Napisz do mnie.</h2>
  <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Wyślij zapytanie →</a><a class="gfa-btn alt" href="/studio/">Zaprojektuj w Studio ↗</a></div>
</div></section>"""

PERSON = {"@type": "Person", "@id": SITE + "#damian-gawrych", "name": "Damian Gawrych",
          "url": SITE + "damian-gawrych/", "image": img(4596, 1024),
          "jobTitle": "Założyciel i projektant, Gamefields",
          "worksFor": {"@id": SITE + "#studio"},
          "knowsAbout": ["panna", "street football", "freestyle football", "boiska miejskie", "turnieje street soccer", "projektowanie boisk"],
          "sameAs": ["https://www.instagram.com/damiangawrych/", "https://www.damiangawrych.pl/"]}

# ---------------------------------------------------------------- /damian-gawrych/
damian = f"""
<section class="gfa-hero"><div class="w">
  <div>
    <p class="k">Autor studia Gamefields</p>
    <h1 class="d">Damian<br>Gawrych.</h1>
    <p class="lead">W pannę gram od 2005 roku, turnieje organizuję od 2008. Dziś projektuję boiska do panny i street footballu, a Gamefields to moje autorskie studio: konstrukcja, nawierzchnia i grafika projektowane jako jeden przedmiot.</p>
    <dl class="gfa-facts" style="margin-top:28px"><div><dt>Zawodnik</dt><dd>od 2005</dd></div><div><dt>Organizator</dt><dd>od 2008</dd></div><div><dt>Mistrzostwa świata</dt><dd>2017</dd></div></dl>
    <ul class="gfa-links"><li><a href="/realizacje-gamefields/">Realizacje</a></li><li><a href="/jak-powstaje-arena/">Jak powstaje arena</a></li><li><a href="/koncepcje/">Koncepcje</a></li><li><a href="/sztuka-z-gry/">Sztuka z gry</a></li><li><a href="https://www.instagram.com/damiangawrych/" rel="me noopener" target="_blank">Instagram ↗</a></li><li><a href="https://www.damiangawrych.pl/" rel="me noopener" target="_blank">damiangawrych.pl ↗</a></li></ul>
  </div>
  {fig(4596, "Na scenie", "Damian Gawrych, założyciel Alternative Soccer", alt="Damian Gawrych przemawia na scenie, za nim ekran z napisem Damian Gawrych, CEO and Founder Alternative Soccer", size=1024)}
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><h2 class="d">Gra przed produktem.</h2><p>Zaczynałem jako zawodnik. Od 2008 roku buduję wokół panny i street footballu turnieje, areny i społeczność. Z tego doświadczenia wyrosło studio.</p></div>
  <div class="gfa-mom">
    <article>
      <div class="ph">{fig(4586, "One vs One Panna", "plakat turnieju Street Games", cls="one")}</div>
      <div><p class="y">2005 i 2008</p><h3>Od zawodnika do organizatora</h3><p>W pannę gram od 2005 roku. W 2008 roku zorganizowałem pierwszy turniej: Freestyle Football i Panna Football w Jaktorowie. Od tamtej pory turnieje, pokazy i areny są moją codzienną pracą.</p></div>
    </article>
    <article>
      <div class="ph">{fig(4580, "Freestival Street Games 2017", "promocja festiwalu na PGE Narodowym", cls="one")}{fig(4581, "Arena festiwalu", "wizualizacja")}{fig(4582, "Widok na scenę", "wizualizacja")}</div>
      <div><p class="y">2017 i 2018</p><h3>Mistrzostwa Świata Freestival Street Games</h3><p>W 2017 roku zorganizowałem Mistrzostwa Świata Freestival Street Games, a w 2018 roku międzynarodowy turniej w Grodzisku Mazowieckim. Arena działała jak scena: gra w środku, publiczność dookoła, wszystko widać z każdego miejsca.</p></div>
    </article>
    <article>
      <div class="ph">{fig(4607, "Taras w Parku Świętokrzyskim", "Warszawa", cls="one")}{fig(4609, "Gra na Tarasie", "zdjęcie: Zarząd Zieleni m.st. Warszawy", alt="Pokaz gry na Tarasie przy Pałacu Kultury i Nauki")}</div>
      <div><p class="y">Warszawa</p><h3>Taras pod Pałacem Kultury</h3><p>Trzy boiska Panna Ring połączone z tarasem i rampą do skateboardingu, tuż przy metrze. Taras stał się jednym z najpopularniejszych miejsc spotkań warszawskiej młodzieży, pisał o nim m.in. New York Times. <a href="/realizacje-gamefields/">Więcej w realizacjach →</a></p></div>
    </article>
    <article>
      <div class="ph">{fig(4590, "Zajęcia w arenie panna", "z zawodnikami Olimpiad Specjalnych", cls="one", alt="Damian Gawrych z młodymi zawodnikami Olimpiad Specjalnych w arenie panna")}</div>
      <div><p class="y">Dla wszystkich</p><h3>Gra bez barier</h3><p>Arena panna jest mała, bezpieczna i czytelna. Dlatego sprawdza się na zajęciach z zawodnikami Olimpiad Specjalnych tak samo jak na mistrzostwach.</p></div>
    </article>
    <article>
      <div class="ph">{fig(4584, "Piłki dla dzieci", "akcja charytatywna w Afryce", cls="one", alt="Dzieci grają w piłkę na piaszczystym placu w Afryce")}</div>
      <div><p class="y">Poza boiskiem</p><h3>Piłki, które dalej grają</h3><p>Zorganizowałem akcję charytatywną, w której dzieci w Afryce dostały piłki. Do gry wystarczy piłka i kawałek placu, a ta gra łączy ludzi wszędzie tak samo.</p></div>
    </article>
    <article>
      <div class="ph">{fig(4578, "Panna w szkole", "arena w sali gimnastycznej", cls="one", alt="Uczniowie wokół areny panna w szkolnej sali gimnastycznej")}{fig(4591, "Ekipa turnieju", "")}{fig(4585, "Podium turnieju", "Street Games")}</div>
      <div><p class="y">Szkoły i turnieje</p><h3>Pokazy, turnieje, szkoły</h3><p>Mobilną arenę da się postawić w sali gimnastycznej, na stadionie i w centrum handlowym. Tak panna trafia do ludzi, którzy wcześniej nie widzieli tej gry.</p></div>
    </article>
  </div>
</div></section>

<section class="gfa-band"><div class="w">
  <div class="gfa-head"><div><p class="k">W mediach i na scenie</p><h2 class="d">Opowiadam o grze.</h2></div><p>O pannie, street footballu i miejscach do gry mówiłem w Polsacie, w radiu TOK FM i na scenie.</p></div>
  <ul class="gfa-grid">
    <li>{fig(4588, "Polsat", "wywiad, styczeń 2018", cls="tall", alt="Damian Gawrych z ekipą telewizji Polsat podczas wywiadu")}</li>
    <li>{fig(4583, "Radio TOK FM", "w studiu, styczeń 2018", cls="tall", alt="Damian Gawrych w studiu radia TOK FM")}</li>
    <li>{fig(4596, "Wystąpienie", "na scenie", cls="tall", alt="Damian Gawrych na scenie z mikrofonem")}</li>
  </ul>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><h2 class="d">Studio i ludzie.</h2><p>Projekt zaczynam od rozmowy z ludźmi, którzy będą grać. Potem siadamy do stołu z zespołem i budujemy rozwiązanie.</p></div>
  <ul class="gfa-grid">
    <li>{fig(4595, "Warsztat z zespołem", "")}</li>
    <li>{fig(4587, "Koncepcja areny przy centrum kultury", "wizualizacja")}</li>
    <li>{fig(4614, "Arena Panna Octa Cage 180", "Wake For Friends, Grodzisk Mazowiecki")}</li>
  </ul>
</div></section>
{CTA}
"""
ld_damian = {"@context": "https://schema.org", "@graph": [
    PERSON,
    {"@type": "ProfilePage", "@id": SITE + "damian-gawrych/", "url": SITE + "damian-gawrych/",
     "name": "Damian Gawrych — autor studia Gamefields", "inLanguage": "pl-PL", "mainEntity": {"@id": PERSON["@id"]}}]}

# ---------------------------------------------------------------- /jak-powstaje-arena/
arena = f"""
<section class="gfa-hero"><div class="w">
  <div>
    <p class="k">Budowa krok po kroku</p>
    <h1 class="d">Jak powstaje arena.</h1>
    <p class="lead">Park wakeboardowy Wake For Friends w Grodzisku Mazowieckim. Na starcie piasek, woda obok i żadnego gotowego podłoża. Na końcu arena Panna Octa Cage 180, na której gra się na co dzień i podczas wydarzeń w parku. Oto, co działo się pomiędzy.</p>
  </div>
  {fig(4614, "Gotowa arena", "Panna Octa Cage 180, Wake For Friends", size=1024)}
</div></section>

<section class="gfa-sec"><div class="w">
  <ol class="gfa-steps">
    <li><div class="ph"><img src="{img(4602)}" alt="Piaszczysty teren pod arenę w parku wakeboardowym" loading="lazy" decoding="async"></div>
      <div><span class="n">01</span><h3>Plac</h3><p>Sprawdzamy teren: jakie jest podłoże, jak spływa woda i skąd przyjdą gracze. Tu był sam piasek, więc arena potrzebowała własnej, stabilnej bazy.</p></div></li>
    <li><div class="ph"><img src="{img(4600)}" alt="Palety i płyty układane na piasku" loading="lazy" decoding="async"><img src="{img(4601)}" alt="Układanie podestu z płyt" loading="lazy" decoding="async"></div>
      <div><span class="n">02</span><h3>Podest</h3><p>Na piasku układamy podest z palet i płyt. Rozkłada ciężar konstrukcji i daje równą, suchą powierzchnię pod nawierzchnię.</p></div></li>
    <li><div class="ph"><img src="{img(4599)}" alt="Gotowa równa płyta podestu" loading="lazy" decoding="async"><img src="{img(4606)}" alt="Podest z płyt z bliska" loading="lazy" decoding="async"></div>
      <div><span class="n">03</span><h3>Równa płyta</h3><p>Płyty łączymy w jedną płaszczyznę. Od jej równości zależy, jak będzie się toczyć piłka.</p></div></li>
    <li><div class="ph"><img src="{img(4598)}" alt="Warstwa pod nawierzchnię na podeście" loading="lazy" decoding="async"></div>
      <div><span class="n">04</span><h3>Warstwa pod nawierzchnię</h3><p>Na podest kładziemy warstwę pod nawierzchnię, żeby trawa leżała na całej płycie równo.</p></div></li>
    <li><div class="ph"><img src="{img(4593)}" alt="Sztuczna trawa rozłożona na podeście" loading="lazy" decoding="async"></div>
      <div><span class="n">05</span><h3>Nawierzchnia</h3><p>Sztuczna trawa na całym podeście, z zapasem wokół areny.</p></div></li>
    <li><div class="ph"><img src="{img(4594)}" alt="Zmontowana konstrukcja areny ośmiokątnej" loading="lazy" decoding="async"><img src="{img(4614)}" alt="Gotowa arena z bramkami" loading="lazy" decoding="async"></div>
      <div><span class="n">06</span><h3>Konstrukcja i gra</h3><p>Montujemy moduły ramy i bramki. Arena działa na co dzień i podczas wydarzeń w parku: urodzin dzieci, wieczorów kawalerskich i półkolonii.</p></div></li>
  </ol>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><h2 class="d">Na twardym podłożu.</h2><p>Na betonie albo kostce podest nie jest potrzebny. Arena stoi wtedy na przygotowanej płycie, a nawierzchnię dobieramy do miejsca.</p></div>
  <ul class="gfa-grid">
    <li>{fig(4615, "Arena na betonowej płycie", "")}</li>
    <li>{fig(4597, "Ta sama arena z bliska", "")}</li>
    <li><figure class="gfa-quote"><blockquote>Boisko Panna Cage 180 świetnie wpisało się w naszą potrzebę poszerzenia oferty parku o dyscypliny inne niż wakeboard. Sprawdza się na co dzień i podczas wydarzeń, które organizujemy.</blockquote><figcaption><b>Piotr Wiśniewski</b>Właściciel, Wake For Friends</figcaption></figure></li>
  </ul>
</div></section>
{CTA}
"""
ld_arena = {"@context": "https://schema.org", "@type": "HowTo", "name": "Jak powstaje arena panna na piaszczystym terenie",
            "inLanguage": "pl-PL", "url": SITE + "jak-powstaje-arena/", "image": img(4614, 1024),
            "author": {"@id": PERSON["@id"], "@type": "Person", "name": "Damian Gawrych"},
            "step": [{"@type": "HowToStep", "position": n + 1, "name": s} for n, s in enumerate(
                ["Plac", "Podest", "Równa płyta", "Warstwa pod nawierzchnię", "Nawierzchnia", "Konstrukcja i gra"])]}

# ---------------------------------------------------------------- /koncepcje/
konc = f"""
<section class="gfa-hero"><div class="w">
  <div>
    <p class="k">Studio Gamefields</p>
    <h1 class="d">Koncepcje.</h1>
    <p class="lead">Miejsca, które dopiero mogą powstać: plac pod Pałacem Kultury, boisko pod Mostem Łazienkowskim, stare place do odnowienia. Zaczynam od zdjęcia placu i rozmowy o tym, kto będzie na nim grał. Potem rysuję boisko, które pasuje do miasta, a nie z katalogu.</p>
  </div>
  {fig(4618, "Pod Mostem Łazienkowskim", "Warszawa, styczeń 2026", size=1024, alt="Plac pod Mostem Łazienkowskim z mobilną bramką do gry")}
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><h2 class="d">Plac pod Pałacem Kultury.</h2><p>Projekt placu pod Pałacem Kultury i Nauki z boiskami Gamefields: miejsca do gry wpisane w posadzkę placu, obok strefy do jazdy i odpoczynku.</p></div>
  <ul class="gfa-grid">
    <li>{fig(4610, "Widok z placu", "wizualizacja")}</li>
    <li>{fig(4611, "Panorama placu", "wizualizacja")}</li>
    <li>{fig(4616, "Układ placu", "aksonometria")}</li>
  </ul>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><h2 class="d">Most Łazienkowski.</h2><p>Plac pod konstrukcją mostu, przy bulwarach. Koncepcja zakłada boisko z czytelnym wzorem nawierzchni w miejscu, które dziś jest pustym betonem.</p></div>
  <ul class="gfa-grid c4">
    <li><figure><img src="{UP}2026/10/51.jpg" alt="Koncepcja boiska pod Mostem Łazienkowskim, widok z góry" loading="lazy" decoding="async"><figcaption><b>Widok z góry</b><span>wizualizacja</span></figcaption></figure></li>
    <li><figure><img src="{UP}2026/10/52.jpg" alt="Plansze koncepcji boiska pod Mostem Łazienkowskim" loading="lazy" decoding="async"><figcaption><b>Plansze projektu</b><span>układ i grafika</span></figcaption></figure></li>
    <li><figure><img src="{UP}2026/10/53.jpg" alt="Wizualizacja boiska pod Mostem Łazienkowskim" loading="lazy" decoding="async"><figcaption><b>Pod konstrukcją mostu</b><span>wizualizacja</span></figcaption></figure></li>
    <li><figure><img src="{UP}2026/10/54.jpg" alt="Wizualizacja boiska pod Mostem Łazienkowskim od strony bulwarów" loading="lazy" decoding="async"><figcaption><b>Od strony bulwarów</b><span>wizualizacja</span></figcaption></figure></li>
  </ul>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><h2 class="d">Stary plac.<br>Nowe boisko.</h2><p>Betonowe boisko na Polu Mokotowskim i koncepcja Organic Flow na tym samym zdjęciu. Zdjęcie: Google Street View, 2017. To wizualizacja, nie realizacja.</p></div>
  <ul class="gfa-grid">
    <li><figure><img src="https://cdn.jsdelivr.net/gh/DamianRyh/gamefields-os@dc298dede4689c700ad901e78628a1938fd941b0/integrations/wordpress/homepage/studio-2026-11/assets/modernizacja/pole-mokotowskie-przed-720.webp" alt="Przed: szary betonowy plac do koszykówki" loading="lazy" decoding="async"><figcaption><b>Przed</b><span>Google Street View, 2017</span></figcaption></figure></li>
    <li><figure><img src="https://cdn.jsdelivr.net/gh/DamianRyh/gamefields-os@dc298dede4689c700ad901e78628a1938fd941b0/integrations/wordpress/homepage/studio-2026-11/assets/modernizacja/pole-mokotowskie-po-720.webp" alt="Koncepcja: kolorowe boisko Organic Flow na tym samym placu" loading="lazy" decoding="async"><figcaption><b>Koncepcja po</b><span>Organic Flow</span></figcaption></figure></li>
    <li><figure><img src="{UP}2026/10/Gamefields-Studio-%E2%80%94-Organic-Flow.webp" alt="Wzór nawierzchni Organic Flow w Studio Gamefields" loading="lazy" decoding="async"><figcaption><b>Wzór Organic Flow</b><span>Studio Gamefields</span></figcaption></figure></li>
  </ul>
  <ul class="gfa-links"><li><a href="/radar-boisko-koszykowki-warszawa/">Cała koncepcja →</a></li><li><a href="/renowacja-boisk/">Renowacja boisk</a></li></ul>
</div></section>

<section class="gfa-band"><div class="w">
  <div class="gfa-head"><div><p class="k">Wydarzenia</p><h2 class="d">Arena jako scena.</h2></div><p>Koncepcje areny turniejowej dla Mistrzostw Świata Freestival Street Games 2017: boisko w środku, trybuny dookoła, oświetlenie i miejsce dla DJ-a.</p></div>
  <ul class="gfa-grid">
    <li>{fig(4581, "Arena z trybunami", "Freestival Street Games 2017")}</li>
    <li>{fig(4582, "Widok na scenę", "Freestival Street Games 2017")}</li>
    <li>{fig(4587, "Arena przy centrum kultury", "wizualizacja")}</li>
  </ul>
</div></section>
{CTA}
"""
ld_konc = {"@context": "https://schema.org", "@type": "CollectionPage", "name": "Koncepcje Gamefields",
           "url": SITE + "koncepcje/", "inLanguage": "pl-PL", "author": {"@id": PERSON["@id"], "@type": "Person", "name": "Damian Gawrych"}}

# ---------------------------------------------------------------- /sztuka-z-gry/
sztuka = f"""
<section class="gfa-hero"><div class="w">
  <div>
    <p class="k">Damian Gawrych</p>
    <h1 class="d">Sztuka<br>z gry.</h1>
    <p class="lead">Seria grafik w czerni, bieli i czerwieni. Koła, ślady i rytm, które powtarzają się na boisku, przeniesione na papier. Ten sam język form trafia potem na nawierzchnie i plakaty Gamefields.</p>
    <ul class="gfa-links"><li><a href="/damian-gawrych/">O autorze</a></li><li><a href="/product/plakat-z-twoim-boiskiem/">Plakat z Twoim boiskiem</a></li></ul>
  </div>
  {fig(4620, "Czerwień i czerń", "grafika w ramie", size=1024, alt="Grafika z czerwonych, czarnych i białych kół w czarnej ramie na ceglanej ścianie")}
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><h2 class="d">Seria.</h2><p>Każda praca jest inna: gęstość kół, układ i kolor zmieniają się jak przebieg meczu.</p></div>
  <ul class="gfa-grid">
    <li>{fig(4624, "Czerwień i czerń", "detal", cls="tall")}</li>
    <li>{fig(4625, "Biel na czerni", "rytm kół", cls="tall")}</li>
    <li>{fig(4621, "Biel na czerni", "w ramie", cls="tall")}</li>
    <li>{fig(4622, "Czerwień i czerń", "w ramie", cls="tall")}</li>
    <li>{fig(4619, "Biel na czerni", "w passe-partout", cls="tall")}</li>
  </ul>
</div></section>

<section class="gfa-cta"><div class="w">
  <h2 class="d">Chcesz grafikę<br>albo wzór na boisko?</h2>
  <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Napisz do mnie →</a><a class="gfa-btn alt" href="/studio/">Wzory w Studio ↗</a></div>
</div></section>
"""
ld_sztuka = {"@context": "https://schema.org", "@type": "CollectionPage", "name": "Sztuka z gry — grafiki Damiana Gawrycha",
             "url": SITE + "sztuka-z-gry/", "inLanguage": "pl-PL", "author": {"@id": PERSON["@id"], "@type": "Person", "name": "Damian Gawrych"}}

out = {"damian-gawrych.html": page(damian, ld_damian),
       "jak-powstaje-arena.html": page(arena, ld_arena),
       "koncepcje.html": page(konc, ld_konc),
       "sztuka-z-gry.html": page(sztuka, ld_sztuka)}
for name, content in out.items():
    if "&&" in content:
        raise SystemExit(name + " contains a double ampersand")
    (HERE / name).write_text(content, encoding="utf-8")

shell = ('<!doctype html><html lang="pl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
         '<title>Podgląd: strony autentyczności</title><body style="margin:0">')
(HERE / "preview.html").write_text(shell + "".join(
    f'<div id="{n[:-5]}" style="border-top:8px solid #D8F24A">' + c.replace(' loading="lazy"', "").replace("<!-- wp:html -->", "").replace("<!-- /wp:html -->", "") + "</div>"
    for n, c in out.items()) + "</body></html>", encoding="utf-8")
print("ok", {k: len(v) for k, v in out.items()})
