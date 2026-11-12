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


CSS = """<style>
.gfa{--ink:#47132D;--muted:#6F5A66;--paper:#F4F1EE;--violet:#6336F5;--lime:#D8F24A;--line:#D9CFD4;background:var(--paper);color:var(--ink);font-family:GHInter,Inter,Arial,sans-serif;line-height:1.5;overflow-x:clip}
.gfa *{box-sizing:border-box}
.gfa figure{margin:0}
.gfa .w{max-width:1360px;margin:0 auto;padding:0 clamp(16px,3.4vw,48px)}
.gfa h1,.gfa h2,.gfa h3{font-family:inherit;text-transform:none;margin:0;color:inherit}
.gfa .d{font-weight:800;letter-spacing:-.055em;line-height:.9;text-wrap:balance}
.gfa .k{margin:0 0 14px;color:var(--violet);font-weight:700;font-size:13px;letter-spacing:.08em;text-transform:uppercase}
.gfa a{color:inherit}
.gfa-hero{padding:clamp(40px,6vw,96px) 0 clamp(28px,4vw,56px)}
.gfa-hero .w{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,6fr);gap:clamp(20px,3vw,48px);align-items:end}
.gfa-hero h1{font-size:clamp(56px,9vw,148px)}
.gfa-hero .lead{max-width:38rem;margin:22px 0 0;font-size:clamp(17px,1.5vw,21px);color:var(--muted)}
.gfa-hero figure{margin:0}
.gfa-hero img{display:block;width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;background:#E6E0DA}
.gfa-hero figcaption,.gfa figure figcaption{margin-top:8px;font-size:14px;line-height:1.35;color:var(--muted)}
.gfa figure figcaption b{display:block;color:var(--ink);font-size:15px}
.gfa-sec{padding:clamp(40px,5vw,80px) 0;border-top:1px solid var(--line)}
.gfa-head{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:16px 32px;align-items:end;margin-bottom:clamp(24px,3vw,44px)}
.gfa-head h2{font-size:clamp(40px,5.6vw,88px)}
.gfa-head p{margin:0;font-size:18px;color:var(--muted)}
.gfa-grid{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.gfa-grid.c4{grid-template-columns:repeat(4,minmax(0,1fr))}
.gfa-grid figure{margin:0}
.gfa-grid img{display:block;width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;background:#E6E0DA}
.gfa-grid .tall img{aspect-ratio:3/4}
.gfa-mom{display:grid;gap:12px}
.gfa-mom article{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(16px,3vw,40px);padding:clamp(20px,2.4vw,32px);background:#fff;border:1px solid var(--line);align-items:start}
.gfa-mom .y{color:var(--violet);font-weight:800;font-size:15px;margin:0 0 6px}
.gfa-mom h3{font-size:clamp(26px,2.6vw,40px);font-weight:800;letter-spacing:-.035em;line-height:1}
.gfa-mom p{margin:12px 0 0;color:var(--muted);font-size:16px}
.gfa-mom .ph{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.gfa-mom .ph img{display:block;width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;background:#E6E0DA}
.gfa-mom .ph .one{grid-column:1/-1}
.gfa-steps{list-style:none;margin:0;padding:0;counter-reset:s;display:grid;gap:12px}
.gfa-steps li{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:clamp(16px,3vw,40px);align-items:center;padding:clamp(16px,2vw,24px);background:#fff;border:1px solid var(--line)}
.gfa-steps li:nth-child(even) .ph{order:2}
.gfa-steps .ph{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.gfa-steps .ph img{display:block;width:100%;height:auto;aspect-ratio:1/1;object-fit:cover;background:#E6E0DA}
.gfa-steps .ph img:only-child{grid-column:1/-1;aspect-ratio:4/3}
.gfa-steps .n{color:var(--violet);font-weight:800;font-size:15px}
.gfa-steps h3{font-size:clamp(28px,3vw,48px);font-weight:800;letter-spacing:-.04em;line-height:.95;margin-top:6px}
.gfa-steps p{margin:12px 0 0;color:var(--muted);font-size:17px}
.gfa-quote{margin:0;padding:24px;background:#fff;border-top:4px solid var(--violet);max-width:760px}
.gfa-quote blockquote{margin:0;padding:0;border:0;font-style:normal;font-size:19px;line-height:1.45}
.gfa-quote figcaption{margin-top:12px;font-size:14px;color:var(--muted)}
.gfa-quote figcaption b{display:block;color:var(--ink);font-size:15px}
.gfa-facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;margin:0}
.gfa-facts div{border-top:1px solid var(--line);padding-top:12px}
.gfa-facts dt{font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.gfa-facts dd{margin:6px 0 0;font-size:18px;font-weight:700}
.gfa-band{padding:clamp(40px,5vw,80px) 0;background:var(--ink);color:var(--paper);box-shadow:0 0 0 100vmax var(--ink);clip-path:inset(0 -100vmax)}
.gfa-band .gfa-head p,.gfa-band figure figcaption{color:rgba(244,241,238,.78)}
.gfa-band figure figcaption b{color:var(--paper)}
.gfa-band .k{color:var(--lime)}
.gfa-cta{padding:clamp(40px,5vw,80px) 0;border-top:1px solid var(--line)}
.gfa-cta .w{display:flex;flex-wrap:wrap;align-items:end;justify-content:space-between;gap:24px}
.gfa-cta h2{font-size:clamp(40px,5.6vw,88px)}
.gfa-btns{display:flex;flex-wrap:wrap;gap:12px}
.gfa-btn{display:inline-flex;align-items:center;min-height:52px;padding:0 24px;border-radius:999px;background:var(--violet);color:#fff!important;text-decoration:none;font-weight:700}
.gfa-btn.alt{background:var(--ink)}
.gfa-links{display:flex;flex-wrap:wrap;gap:8px;margin:24px 0 0;padding:0;list-style:none}
.gfa-links a{display:inline-flex;align-items:center;min-height:44px;padding:0 18px;border:1.5px solid #CDBFC6;border-radius:999px;text-decoration:none;font-weight:700;font-size:15px}
.gfa-links a:hover{border-color:var(--ink)}
@media (max-width:900px){
 .gfa-hero .w,.gfa-head,.gfa-mom article,.gfa-steps li{grid-template-columns:minmax(0,1fr)}
 .gfa-steps li:nth-child(even) .ph{order:0}
 .gfa-grid,.gfa-grid.c4{grid-template-columns:repeat(2,minmax(0,1fr))}
 .gfa-facts{grid-template-columns:minmax(0,1fr)}
}
@media (max-width:520px){.gfa-grid,.gfa-grid.c4{grid-template-columns:minmax(0,1fr)}}
</style>"""


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
          "knowsAbout": ["panna", "street football", "boiska miejskie", "turnieje street soccer", "projektowanie boisk"]}

# ---------------------------------------------------------------- /damian-gawrych/
damian = f"""
<section class="gfa-hero"><div class="w">
  <div>
    <p class="k">Autor studia Gamefields</p>
    <h1 class="d">Damian<br>Gawrych.</h1>
    <p class="lead">Projektuję boiska do panny i street footballu, organizuję turnieje i pokazuję tę grę ludziom, którzy jeszcze jej nie znają. Gamefields to moje autorskie studio: konstrukcja, nawierzchnia i grafika projektowane jako jeden przedmiot.</p>
    <ul class="gfa-links"><li><a href="/realizacje-gamefields/">Realizacje</a></li><li><a href="/jak-powstaje-arena/">Jak powstaje arena</a></li><li><a href="/koncepcje/">Koncepcje</a></li></ul>
  </div>
  {fig(4596, "Na scenie", "Damian Gawrych, założyciel Alternative Soccer", alt="Damian Gawrych przemawia na scenie, za nim ekran z napisem Damian Gawrych, CEO and Founder Alternative Soccer", size=1024)}
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><h2 class="d">Gra przed produktem.</h2><p>Street football i panna to dla mnie najpierw ludzie i miejsca, a dopiero potem konstrukcja. Od lat buduję wokół tej gry wydarzenia, areny i społeczność. Z tego doświadczenia wyrosło studio.</p></div>
  <div class="gfa-mom">
    <article>
      <div class="ph">{fig(4580, "Freestival Street Games 2017", "promocja festiwalu na PGE Narodowym", cls="one")}{fig(4581, "Arena festiwalu", "wizualizacja")}{fig(4585, "Podium turnieju", "Street Games")}</div>
      <div><p class="y">2017</p><h3>Freestival Street Games</h3><p>Festiwal ulicznej piłki z areną, trybunami i turniejami 1 na 1. Arena działa jak scena: gra w środku, publiczność dookoła, wszystko widać z każdego miejsca.</p></div>
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
      <div class="ph">{fig(4578, "Panna w szkole", "arena w sali gimnastycznej", cls="one", alt="Uczniowie wokół areny panna w szkolnej sali gimnastycznej")}{fig(4586, "One vs One Panna", "plakat turnieju Street Games")}{fig(4591, "Ekipa turnieju", "")}</div>
      <div><p class="y">Szkoły i turnieje</p><h3>Pokazy, turnieje, szkoły</h3><p>Mobilną arenę da się postawić w sali gimnastycznej, na stadionie i w centrum handlowym. Tak panna trafia do ludzi, którzy wcześniej nie widzieli tej gry.</p></div>
    </article>
  </div>
</div></section>

<section class="gfa-band"><div class="w">
  <div class="gfa-head"><div><p class="k">W mediach i na scenie</p><h2 class="d">Opowiadam o grze.</h2></div><p>O pannie, street footballu i miejscach do gry mówiłem w telewizji, w radiu i na scenie.</p></div>
  <ul class="gfa-grid">
    <li>{fig(4588, "TVP Sport", "wywiad", cls="tall", alt="Damian Gawrych z ekipą TVP Sport podczas wywiadu")}</li>
    <li>{fig(4583, "Radio TOK FM", "w studiu", cls="tall", alt="Damian Gawrych w studiu radia TOK FM")}</li>
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
    <p class="lead">Miejsca, które dopiero mogą powstać. Zaczynam od zdjęcia placu i rozmowy o tym, kto będzie na nim grał. Potem rysuję boisko, które pasuje do miasta, a nie z katalogu.</p>
  </div>
  {fig(4618, "Pod Mostem Łazienkowskim", "Warszawa, styczeń 2026", size=1024, alt="Plac pod Mostem Łazienkowskim z mobilną bramką do gry")}
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
  <div class="gfa-head"><div><p class="k">Wydarzenia</p><h2 class="d">Arena jako scena.</h2></div><p>Koncepcje areny turniejowej dla Freestival Street Games 2017: boisko w środku, trybuny dookoła, oświetlenie i miejsce dla DJ-a.</p></div>
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

out = {"damian-gawrych.html": page(damian, ld_damian),
       "jak-powstaje-arena.html": page(arena, ld_arena),
       "koncepcje.html": page(konc, ld_konc)}
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
