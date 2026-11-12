# Autentyczność gamefields.eu: nowe strony i zdjęcia (12.11.2026)

Dla wykonawcy z dostępem do WordPressa gamefields.eu. Ten plik zawiera cały kod. Nie trzeba otwierać żadnych linków do GitHuba. Zdjęcia są już w bibliotece mediów (załączniki 4578–4625).

## Zasady

1. Nowe strony twórz jako **szkice**. Publikacja dopiero po akceptacji właściciela.
2. Przed zmianą istniejącej strony zapisz numer jej wersji.
3. Kod wklejaj w bloku „Własny HTML” bez zmian. Nie przerabiaj go na bloki wizualne.
4. Po publikacji wyczyść cache LiteSpeed.

## Zadanie 1. Cztery nowe strony

Dla każdej strony: Strony → Dodaj nową → tytuł i adres (slug) z tabeli → szablon **„Pełna szerokość”** → blok „Własny HTML” → wklej kod. W Yoast SEO wpisz tytuł SEO i opis meta z tabeli.

| Tytuł strony | Adres | Tytuł SEO | Opis meta |
| --- | --- | --- | --- |
| Damian Gawrych | `/damian-gawrych/` | Damian Gawrych — autor studia Gamefields | panna i street football od 2005 | Damian Gawrych gra w pannę od 2005 roku, organizuje turnieje od 2008, w 2017 zorganizował Mistrzostwa Świata Freestival Street Games. Autor studia Gamefields. |
| Jak powstaje arena | `/jak-powstaje-arena/` | Jak powstaje arena panna: budowa krok po kroku | Gamefields | Budowa areny Panna Octa Cage 180 w parku Wake For Friends: od piasku, przez podest, do gry. Zdjęcia z każdego etapu. |
| Koncepcje | `/koncepcje/` | Koncepcje boisk miejskich | Gamefields | Koncepcje Gamefields: plac pod Pałacem Kultury z boiskami, boisko pod Mostem Łazienkowskim, modernizacja betonowego placu i areny Freestival Street Games. |
| Sztuka z gry | `/sztuka-z-gry/` | Sztuka z gry — grafiki Damiana Gawrycha | Gamefields | Seria grafik Damiana Gawrycha w czerni, bieli i czerwieni. Koła, ślady i rytm gry przeniesione na papier. |

### Kod strony /damian-gawrych/

```html
<!-- wp:html -->
<style>
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
</style>
<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Person","@id":"https://www.gamefields.eu/#damian-gawrych","name":"Damian Gawrych","url":"https://www.gamefields.eu/damian-gawrych/","image":"https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1068-1024x576.jpg","jobTitle":"Założyciel i projektant, Gamefields","worksFor":{"@id":"https://www.gamefields.eu/#studio"},"knowsAbout":["panna","street football","freestyle football","boiska miejskie","turnieje street soccer","projektowanie boisk"],"sameAs":["https://www.instagram.com/damiangawrych/","https://www.damiangawrych.pl/"]},{"@type":"ProfilePage","@id":"https://www.gamefields.eu/damian-gawrych/","url":"https://www.gamefields.eu/damian-gawrych/","name":"Damian Gawrych — autor studia Gamefields","inLanguage":"pl-PL","mainEntity":{"@id":"https://www.gamefields.eu/#damian-gawrych"}}]}</script>
<div class="gfa">
<section class="gfa-hero"><div class="w">
  <div>
    <p class="k">Autor studia Gamefields</p>
    <h1 class="d">Damian<br>Gawrych.</h1>
    <p class="lead">W pannę gram od 2005 roku, turnieje organizuję od 2008. Dziś projektuję boiska do panny i street footballu, a Gamefields to moje autorskie studio: konstrukcja, nawierzchnia i grafika projektowane jako jeden przedmiot.</p>
    <dl class="gfa-facts" style="margin-top:28px"><div><dt>Zawodnik</dt><dd>od 2005</dd></div><div><dt>Organizator</dt><dd>od 2008</dd></div><div><dt>Mistrzostwa świata</dt><dd>2017</dd></div></dl>
    <ul class="gfa-links"><li><a href="/realizacje-gamefields/">Realizacje</a></li><li><a href="/jak-powstaje-arena/">Jak powstaje arena</a></li><li><a href="/koncepcje/">Koncepcje</a></li><li><a href="/sztuka-z-gry/">Sztuka z gry</a></li><li><a href="https://www.instagram.com/damiangawrych/" rel="me noopener" target="_blank">Instagram ↗</a></li><li><a href="https://www.damiangawrych.pl/" rel="me noopener" target="_blank">damiangawrych.pl ↗</a></li></ul>
  </div>
  <figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1068-1024x576.jpg" alt="Damian Gawrych przemawia na scenie, za nim ekran z napisem Damian Gawrych, CEO and Founder Alternative Soccer" loading="lazy" decoding="async"><figcaption><b>Na scenie</b><span>Damian Gawrych, założyciel Alternative Soccer</span></figcaption></figure>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><h2 class="d">Gra przed produktem.</h2><p>Zaczynałem jako zawodnik. Od 2008 roku buduję wokół panny i street footballu turnieje, areny i społeczność. Z tego doświadczenia wyrosło studio.</p></div>
  <div class="gfa-mom">
    <article>
      <div class="ph"><figure class="one"><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1080-768x431.jpg" alt="One vs One Panna, plakat turnieju Street Games" loading="lazy" decoding="async"><figcaption><b>One vs One Panna</b><span>plakat turnieju Street Games</span></figcaption></figure></div>
      <div><p class="y">2005 i 2008</p><h3>Od zawodnika do organizatora</h3><p>W pannę gram od 2005 roku. W 2008 roku zorganizowałem pierwszy turniej: Freestyle Football i Panna Football w Jaktorowie. Od tamtej pory turnieje, pokazy i areny są moją codzienną pracą.</p></div>
    </article>
    <article>
      <div class="ph"><figure class="one"><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1085-768x431.jpg" alt="Freestival Street Games 2017, promocja festiwalu na PGE Narodowym" loading="lazy" decoding="async"><figcaption><b>Freestival Street Games 2017</b><span>promocja festiwalu na PGE Narodowym</span></figcaption></figure><figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1084-768x421.jpg" alt="Arena festiwalu, wizualizacja" loading="lazy" decoding="async"><figcaption><b>Arena festiwalu</b><span>wizualizacja</span></figcaption></figure><figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1083-768x393.jpg" alt="Widok na scenę, wizualizacja" loading="lazy" decoding="async"><figcaption><b>Widok na scenę</b><span>wizualizacja</span></figcaption></figure></div>
      <div><p class="y">2017 i 2018</p><h3>Mistrzostwa Świata Freestival Street Games</h3><p>W 2017 roku zorganizowałem Mistrzostwa Świata Freestival Street Games, a w 2018 roku międzynarodowy turniej w Grodzisku Mazowieckim. Arena działała jak scena: gra w środku, publiczność dookoła, wszystko widać z każdego miejsca.</p></div>
    </article>
    <article>
      <div class="ph"><figure class="one"><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1053-768x522.jpg" alt="Taras w Parku Świętokrzyskim, Warszawa" loading="lazy" decoding="async"><figcaption><b>Taras w Parku Świętokrzyskim</b><span>Warszawa</span></figcaption></figure><figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1051-768x521.jpg" alt="Pokaz gry na Tarasie przy Pałacu Kultury i Nauki" loading="lazy" decoding="async"><figcaption><b>Gra na Tarasie</b><span>zdjęcie: Zarząd Zieleni m.st. Warszawy</span></figcaption></figure></div>
      <div><p class="y">Warszawa</p><h3>Taras pod Pałacem Kultury</h3><p>Trzy boiska Panna Ring połączone z tarasem i rampą do skateboardingu, tuż przy metrze. Taras stał się jednym z najpopularniejszych miejsc spotkań warszawskiej młodzieży, pisał o nim m.in. New York Times. <a href="/realizacje-gamefields/">Więcej w realizacjach →</a></p></div>
    </article>
    <article>
      <div class="ph"><figure class="one"><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1074-768x576.jpg" alt="Damian Gawrych z młodymi zawodnikami Olimpiad Specjalnych w arenie panna" loading="lazy" decoding="async"><figcaption><b>Zajęcia w arenie panna</b><span>z zawodnikami Olimpiad Specjalnych</span></figcaption></figure></div>
      <div><p class="y">Dla wszystkich</p><h3>Gra bez barier</h3><p>Arena panna jest mała, bezpieczna i czytelna. Dlatego sprawdza się na zajęciach z zawodnikami Olimpiad Specjalnych tak samo jak na mistrzostwach.</p></div>
    </article>
    <article>
      <div class="ph"><figure class="one"><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1078-768x576.jpg" alt="Dzieci grają w piłkę na piaszczystym placu w Afryce" loading="lazy" decoding="async"><figcaption><b>Piłki dla dzieci</b><span>akcja charytatywna w Afryce</span></figcaption></figure></div>
      <div><p class="y">Poza boiskiem</p><h3>Piłki, które dalej grają</h3><p>Zorganizowałem akcję charytatywną, w której dzieci w Afryce dostały piłki. Do gry wystarczy piłka i kawałek placu, a ta gra łączy ludzi wszędzie tak samo.</p></div>
    </article>
    <article>
      <div class="ph"><figure class="one"><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1088-768x430.jpg" alt="Uczniowie wokół areny panna w szkolnej sali gimnastycznej" loading="lazy" decoding="async"><figcaption><b>Panna w szkole</b><span>arena w sali gimnastycznej</span></figcaption></figure><figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1073-768x576.jpg" alt="Ekipa turnieju" loading="lazy" decoding="async"><figcaption><b>Ekipa turnieju</b></figcaption></figure><figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1079.jpg" alt="Podium turnieju, Street Games" loading="lazy" decoding="async"><figcaption><b>Podium turnieju</b><span>Street Games</span></figcaption></figure></div>
      <div><p class="y">Szkoły i turnieje</p><h3>Pokazy, turnieje, szkoły</h3><p>Mobilną arenę da się postawić w sali gimnastycznej, na stadionie i w centrum handlowym. Tak panna trafia do ludzi, którzy wcześniej nie widzieli tej gry.</p></div>
    </article>
  </div>
</div></section>

<section class="gfa-band"><div class="w">
  <div class="gfa-head"><div><p class="k">W mediach i na scenie</p><h2 class="d">Opowiadam o grze.</h2></div><p>O pannie, street footballu i miejscach do gry mówiłem w Polsacie, w radiu TOK FM i na scenie.</p></div>
  <ul class="gfa-grid">
    <li><figure class="tall"><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1076.jpg" alt="Damian Gawrych z ekipą telewizji Polsat podczas wywiadu" loading="lazy" decoding="async"><figcaption><b>Polsat</b><span>wywiad, styczeń 2018</span></figcaption></figure></li>
    <li><figure class="tall"><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1077-768x854.jpg" alt="Damian Gawrych w studiu radia TOK FM" loading="lazy" decoding="async"><figcaption><b>Radio TOK FM</b><span>w studiu, styczeń 2018</span></figcaption></figure></li>
    <li><figure class="tall"><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1068-768x432.jpg" alt="Damian Gawrych na scenie z mikrofonem" loading="lazy" decoding="async"><figcaption><b>Wystąpienie</b><span>na scenie</span></figcaption></figure></li>
  </ul>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><h2 class="d">Studio i ludzie.</h2><p>Projekt zaczynam od rozmowy z ludźmi, którzy będą grać. Potem siadamy do stołu z zespołem i budujemy rozwiązanie.</p></div>
  <ul class="gfa-grid">
    <li><figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1066-768x513.jpg" alt="Warsztat z zespołem" loading="lazy" decoding="async"><figcaption><b>Warsztat z zespołem</b></figcaption></figure></li>
    <li><figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1082-768x462.jpg" alt="Koncepcja areny przy centrum kultury, wizualizacja" loading="lazy" decoding="async"><figcaption><b>Koncepcja areny przy centrum kultury</b><span>wizualizacja</span></figcaption></figure></li>
    <li><figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1046-768x576.jpg" alt="Arena Panna Octa Cage 180, Wake For Friends, Grodzisk Mazowiecki" loading="lazy" decoding="async"><figcaption><b>Arena Panna Octa Cage 180</b><span>Wake For Friends, Grodzisk Mazowiecki</span></figcaption></figure></li>
  </ul>
</div></section>

<section class="gfa-cta"><div class="w">
  <h2 class="d">Masz plac?<br>Napisz do mnie.</h2>
  <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Wyślij zapytanie →</a><a class="gfa-btn alt" href="/studio/">Zaprojektuj w Studio ↗</a></div>
</div></section>
</div>
<!-- /wp:html -->
```

### Kod strony /jak-powstaje-arena/

```html
<!-- wp:html -->
<style>
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
</style>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"HowTo","name":"Jak powstaje arena panna na piaszczystym terenie","inLanguage":"pl-PL","url":"https://www.gamefields.eu/jak-powstaje-arena/","image":"https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1046-1024x768.jpg","author":{"@id":"https://www.gamefields.eu/#damian-gawrych","@type":"Person","name":"Damian Gawrych"},"step":[{"@type":"HowToStep","position":1,"name":"Plac"},{"@type":"HowToStep","position":2,"name":"Podest"},{"@type":"HowToStep","position":3,"name":"Równa płyta"},{"@type":"HowToStep","position":4,"name":"Warstwa pod nawierzchnię"},{"@type":"HowToStep","position":5,"name":"Nawierzchnia"},{"@type":"HowToStep","position":6,"name":"Konstrukcja i gra"}]}</script>
<div class="gfa">
<section class="gfa-hero"><div class="w">
  <div>
    <p class="k">Budowa krok po kroku</p>
    <h1 class="d">Jak powstaje arena.</h1>
    <p class="lead">Park wakeboardowy Wake For Friends w Grodzisku Mazowieckim. Na starcie piasek, woda obok i żadnego gotowego podłoża. Na końcu arena Panna Octa Cage 180, na której gra się na co dzień i podczas wydarzeń w parku. Oto, co działo się pomiędzy.</p>
  </div>
  <figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1046-1024x768.jpg" alt="Gotowa arena, Panna Octa Cage 180, Wake For Friends" loading="lazy" decoding="async"><figcaption><b>Gotowa arena</b><span>Panna Octa Cage 180, Wake For Friends</span></figcaption></figure>
</div></section>

<section class="gfa-sec"><div class="w">
  <ol class="gfa-steps">
    <li><div class="ph"><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1059-768x768.jpg" alt="Piaszczysty teren pod arenę w parku wakeboardowym" loading="lazy" decoding="async"></div>
      <div><span class="n">01</span><h3>Plac</h3><p>Sprawdzamy teren: jakie jest podłoże, jak spływa woda i skąd przyjdą gracze. Tu był sam piasek, więc arena potrzebowała własnej, stabilnej bazy.</p></div></li>
    <li><div class="ph"><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1061-768x768.jpg" alt="Palety i płyty układane na piasku" loading="lazy" decoding="async"><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1060-768x768.jpg" alt="Układanie podestu z płyt" loading="lazy" decoding="async"></div>
      <div><span class="n">02</span><h3>Podest</h3><p>Na piasku układamy podest z palet i płyt. Rozkłada ciężar konstrukcji i daje równą, suchą powierzchnię pod nawierzchnię.</p></div></li>
    <li><div class="ph"><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1062-768x768.jpg" alt="Gotowa równa płyta podestu" loading="lazy" decoding="async"><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1058-768x768.jpg" alt="Podest z płyt z bliska" loading="lazy" decoding="async"></div>
      <div><span class="n">03</span><h3>Równa płyta</h3><p>Płyty łączymy w jedną płaszczyznę. Od jej równości zależy, jak będzie się toczyć piłka.</p></div></li>
    <li><div class="ph"><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1063-768x768.jpg" alt="Warstwa pod nawierzchnię na podeście" loading="lazy" decoding="async"></div>
      <div><span class="n">04</span><h3>Warstwa pod nawierzchnię</h3><p>Na podest kładziemy warstwę pod nawierzchnię, żeby trawa leżała na całej płycie równo.</p></div></li>
    <li><div class="ph"><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1064-768x768.jpg" alt="Sztuczna trawa rozłożona na podeście" loading="lazy" decoding="async"></div>
      <div><span class="n">05</span><h3>Nawierzchnia</h3><p>Sztuczna trawa na całym podeście, z zapasem wokół areny.</p></div></li>
    <li><div class="ph"><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1065-768x768.jpg" alt="Zmontowana konstrukcja areny ośmiokątnej" loading="lazy" decoding="async"><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1046-768x576.jpg" alt="Gotowa arena z bramkami" loading="lazy" decoding="async"></div>
      <div><span class="n">06</span><h3>Konstrukcja i gra</h3><p>Montujemy moduły ramy i bramki. Arena działa na co dzień i podczas wydarzeń w parku: urodzin dzieci, wieczorów kawalerskich i półkolonii.</p></div></li>
  </ol>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><h2 class="d">Na twardym podłożu.</h2><p>Na betonie albo kostce podest nie jest potrzebny. Arena stoi wtedy na przygotowanej płycie, a nawierzchnię dobieramy do miejsca.</p></div>
  <ul class="gfa-grid">
    <li><figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1047-768x530.jpg" alt="Arena na betonowej płycie" loading="lazy" decoding="async"><figcaption><b>Arena na betonowej płycie</b></figcaption></figure></li>
    <li><figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1069-768x530.jpg" alt="Ta sama arena z bliska" loading="lazy" decoding="async"><figcaption><b>Ta sama arena z bliska</b></figcaption></figure></li>
    <li><figure class="gfa-quote"><blockquote>Boisko Panna Cage 180 świetnie wpisało się w naszą potrzebę poszerzenia oferty parku o dyscypliny inne niż wakeboard. Sprawdza się na co dzień i podczas wydarzeń, które organizujemy.</blockquote><figcaption><b>Piotr Wiśniewski</b>Właściciel, Wake For Friends</figcaption></figure></li>
  </ul>
</div></section>

<section class="gfa-cta"><div class="w">
  <h2 class="d">Masz plac?<br>Napisz do mnie.</h2>
  <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Wyślij zapytanie →</a><a class="gfa-btn alt" href="/studio/">Zaprojektuj w Studio ↗</a></div>
</div></section>
</div>
<!-- /wp:html -->
```

### Kod strony /koncepcje/

```html
<!-- wp:html -->
<style>
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
</style>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"CollectionPage","name":"Koncepcje Gamefields","url":"https://www.gamefields.eu/koncepcje/","inLanguage":"pl-PL","author":{"@id":"https://www.gamefields.eu/#damian-gawrych","@type":"Person","name":"Damian Gawrych"}}</script>
<div class="gfa">
<section class="gfa-hero"><div class="w">
  <div>
    <p class="k">Studio Gamefields</p>
    <h1 class="d">Koncepcje.</h1>
    <p class="lead">Miejsca, które dopiero mogą powstać: plac pod Pałacem Kultury, boisko pod Mostem Łazienkowskim, stare place do odnowienia. Zaczynam od zdjęcia placu i rozmowy o tym, kto będzie na nim grał. Potem rysuję boisko, które pasuje do miasta, a nie z katalogu.</p>
  </div>
  <figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_5206-scaled.jpg" alt="Plac pod Mostem Łazienkowskim z mobilną bramką do gry" loading="lazy" decoding="async"><figcaption><b>Pod Mostem Łazienkowskim</b><span>Warszawa, styczeń 2026</span></figcaption></figure>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><h2 class="d">Plac pod Pałacem Kultury.</h2><p>Projekt placu pod Pałacem Kultury i Nauki z boiskami Gamefields: miejsca do gry wpisane w posadzkę placu, obok strefy do jazdy i odpoczynku.</p></div>
  <ul class="gfa-grid">
    <li><figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1050-768x492.jpg" alt="Widok z placu, wizualizacja" loading="lazy" decoding="async"><figcaption><b>Widok z placu</b><span>wizualizacja</span></figcaption></figure></li>
    <li><figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1049-768x327.jpg" alt="Panorama placu, wizualizacja" loading="lazy" decoding="async"><figcaption><b>Panorama placu</b><span>wizualizacja</span></figcaption></figure></li>
    <li><figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1048-768x448.jpg" alt="Układ placu, aksonometria" loading="lazy" decoding="async"><figcaption><b>Układ placu</b><span>aksonometria</span></figcaption></figure></li>
  </ul>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><h2 class="d">Most Łazienkowski.</h2><p>Plac pod konstrukcją mostu, przy bulwarach. Koncepcja zakłada boisko z czytelnym wzorem nawierzchni w miejscu, które dziś jest pustym betonem.</p></div>
  <ul class="gfa-grid c4">
    <li><figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/10/51.jpg" alt="Koncepcja boiska pod Mostem Łazienkowskim, widok z góry" loading="lazy" decoding="async"><figcaption><b>Widok z góry</b><span>wizualizacja</span></figcaption></figure></li>
    <li><figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/10/52.jpg" alt="Plansze koncepcji boiska pod Mostem Łazienkowskim" loading="lazy" decoding="async"><figcaption><b>Plansze projektu</b><span>układ i grafika</span></figcaption></figure></li>
    <li><figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/10/53.jpg" alt="Wizualizacja boiska pod Mostem Łazienkowskim" loading="lazy" decoding="async"><figcaption><b>Pod konstrukcją mostu</b><span>wizualizacja</span></figcaption></figure></li>
    <li><figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/10/54.jpg" alt="Wizualizacja boiska pod Mostem Łazienkowskim od strony bulwarów" loading="lazy" decoding="async"><figcaption><b>Od strony bulwarów</b><span>wizualizacja</span></figcaption></figure></li>
  </ul>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><h2 class="d">Stary plac.<br>Nowe boisko.</h2><p>Betonowe boisko na Polu Mokotowskim i koncepcja Organic Flow na tym samym zdjęciu. Zdjęcie: Google Street View, 2017. To wizualizacja, nie realizacja.</p></div>
  <ul class="gfa-grid">
    <li><figure><img src="https://cdn.jsdelivr.net/gh/DamianRyh/gamefields-os@dc298dede4689c700ad901e78628a1938fd941b0/integrations/wordpress/homepage/studio-2026-11/assets/modernizacja/pole-mokotowskie-przed-720.webp" alt="Przed: szary betonowy plac do koszykówki" loading="lazy" decoding="async"><figcaption><b>Przed</b><span>Google Street View, 2017</span></figcaption></figure></li>
    <li><figure><img src="https://cdn.jsdelivr.net/gh/DamianRyh/gamefields-os@dc298dede4689c700ad901e78628a1938fd941b0/integrations/wordpress/homepage/studio-2026-11/assets/modernizacja/pole-mokotowskie-po-720.webp" alt="Koncepcja: kolorowe boisko Organic Flow na tym samym placu" loading="lazy" decoding="async"><figcaption><b>Koncepcja po</b><span>Organic Flow</span></figcaption></figure></li>
    <li><figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/10/Gamefields-Studio-%E2%80%94-Organic-Flow.webp" alt="Wzór nawierzchni Organic Flow w Studio Gamefields" loading="lazy" decoding="async"><figcaption><b>Wzór Organic Flow</b><span>Studio Gamefields</span></figcaption></figure></li>
  </ul>
  <ul class="gfa-links"><li><a href="/radar-boisko-koszykowki-warszawa/">Cała koncepcja →</a></li><li><a href="/renowacja-boisk/">Renowacja boisk</a></li></ul>
</div></section>

<section class="gfa-band"><div class="w">
  <div class="gfa-head"><div><p class="k">Wydarzenia</p><h2 class="d">Arena jako scena.</h2></div><p>Koncepcje areny turniejowej dla Mistrzostw Świata Freestival Street Games 2017: boisko w środku, trybuny dookoła, oświetlenie i miejsce dla DJ-a.</p></div>
  <ul class="gfa-grid">
    <li><figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1084-768x421.jpg" alt="Arena z trybunami, Freestival Street Games 2017" loading="lazy" decoding="async"><figcaption><b>Arena z trybunami</b><span>Freestival Street Games 2017</span></figcaption></figure></li>
    <li><figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1083-768x393.jpg" alt="Widok na scenę, Freestival Street Games 2017" loading="lazy" decoding="async"><figcaption><b>Widok na scenę</b><span>Freestival Street Games 2017</span></figcaption></figure></li>
    <li><figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1082-768x462.jpg" alt="Arena przy centrum kultury, wizualizacja" loading="lazy" decoding="async"><figcaption><b>Arena przy centrum kultury</b><span>wizualizacja</span></figcaption></figure></li>
  </ul>
</div></section>

<section class="gfa-cta"><div class="w">
  <h2 class="d">Masz plac?<br>Napisz do mnie.</h2>
  <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Wyślij zapytanie →</a><a class="gfa-btn alt" href="/studio/">Zaprojektuj w Studio ↗</a></div>
</div></section>
</div>
<!-- /wp:html -->
```

### Kod strony /sztuka-z-gry/

```html
<!-- wp:html -->
<style>
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
</style>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"CollectionPage","name":"Sztuka z gry — grafiki Damiana Gawrycha","url":"https://www.gamefields.eu/sztuka-z-gry/","inLanguage":"pl-PL","author":{"@id":"https://www.gamefields.eu/#damian-gawrych","@type":"Person","name":"Damian Gawrych"}}</script>
<div class="gfa">
<section class="gfa-hero"><div class="w">
  <div>
    <p class="k">Damian Gawrych</p>
    <h1 class="d">Sztuka<br>z gry.</h1>
    <p class="lead">Seria grafik w czerni, bieli i czerwieni. Koła, ślady i rytm, które powtarzają się na boisku, przeniesione na papier. Ten sam język form trafia potem na nawierzchnie i plakaty Gamefields.</p>
    <ul class="gfa-links"><li><a href="/damian-gawrych/">O autorze</a></li><li><a href="/product/plakat-z-twoim-boiskiem/">Plakat z Twoim boiskiem</a></li></ul>
  </div>
  <figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_4969-2-scaled.jpg" alt="Grafika z czerwonych, czarnych i białych kół w czarnej ramie na ceglanej ścianie" loading="lazy" decoding="async"><figcaption><b>Czerwień i czerń</b><span>grafika w ramie</span></figcaption></figure>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><h2 class="d">Seria.</h2><p>Każda praca jest inna: gęstość kół, układ i kolor zmieniają się jak przebieg meczu.</p></div>
  <ul class="gfa-grid">
    <li><figure class="tall"><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/8DCC3A53-3119-4F46-9A31-F2C17ECB4E26-2-768x1006.jpg" alt="Czerwień i czerń, detal" loading="lazy" decoding="async"><figcaption><b>Czerwień i czerń</b><span>detal</span></figcaption></figure></li>
    <li><figure class="tall"><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_4954-768x1024.jpg" alt="Biel na czerni, rytm kół" loading="lazy" decoding="async"><figcaption><b>Biel na czerni</b><span>rytm kół</span></figcaption></figure></li>
    <li><figure class="tall"><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_4965-768x1024.jpg" alt="Biel na czerni, w ramie" loading="lazy" decoding="async"><figcaption><b>Biel na czerni</b><span>w ramie</span></figcaption></figure></li>
    <li><figure class="tall"><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_4969-768x1024.jpg" alt="Czerwień i czerń, w ramie" loading="lazy" decoding="async"><figcaption><b>Czerwień i czerń</b><span>w ramie</span></figcaption></figure></li>
    <li><figure class="tall"><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_4976-2-768x1024.jpg" alt="Biel na czerni, w passe-partout" loading="lazy" decoding="async"><figcaption><b>Biel na czerni</b><span>w passe-partout</span></figcaption></figure></li>
  </ul>
</div></section>

<section class="gfa-cta"><div class="w">
  <h2 class="d">Chcesz grafikę<br>albo wzór na boisko?</h2>
  <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Napisz do mnie →</a><a class="gfa-btn alt" href="/studio/">Wzory w Studio ↗</a></div>
</div></section>
</div>
<!-- /wp:html -->
```

## Zadanie 2. Zdjęcia na istniejących stronach

Każdy fragment to osobny blok „Własny HTML”. Wstaw go w podanym miejscu.

### /o-nas/ (na końcu treści, przed stopką)

```html
<!-- wp:html --><style>.gfx{max-width:1360px;margin:0 auto;padding:clamp(40px,5vw,80px) clamp(16px,3.4vw,48px);font-family:GHInter,Inter,Arial,sans-serif;color:#47132D}.gfx h2{font-family:inherit;font-weight:800;letter-spacing:-.05em;line-height:.92;font-size:clamp(36px,5vw,72px);margin:0 0 16px;text-transform:none;color:inherit}.gfx p{max-width:40rem;font-size:18px;color:#6F5A66;margin:0 0 24px}.gfx ul{list-style:none;margin:0 0 20px;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}.gfx figure{margin:0}.gfx img{display:block;width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;background:#E6E0DA}.gfx figcaption{margin-top:8px;font-size:14px;color:#6F5A66}.gfx figcaption b{display:block;color:#47132D;font-size:15px}.gfx a.b{display:inline-flex;align-items:center;min-height:48px;padding:0 22px;border-radius:999px;background:#6336F5;color:#fff;text-decoration:none;font-weight:700}</style><section class="gfx"><h2>Kto stoi za Gamefields.</h2><p>Gamefields to autorskie studio Damiana Gawrycha. W pannę gra od 2005 roku, turnieje organizuje od 2008. W 2017 roku zorganizował Mistrzostwa Świata Freestival Street Games. Z tego doświadczenia projektuje boiska.</p><ul><li><figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1068-768x432.jpg" alt="Damian Gawrych na scenie" loading="lazy" decoding="async"><figcaption><b>Damian Gawrych</b>założyciel Alternative Soccer</figcaption></figure></li><li><figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1074-768x576.jpg" alt="Zajęcia w arenie panna z zawodnikami Olimpiad Specjalnych" loading="lazy" decoding="async"><figcaption><b>Gra bez barier</b>zajęcia z zawodnikami Olimpiad Specjalnych</figcaption></figure></li><li><figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1085-768x431.jpg" alt="Stoisko Freestival Street Games na PGE Narodowym" loading="lazy" decoding="async"><figcaption><b>Freestival Street Games 2017</b>promocja mistrzostw na PGE Narodowym</figcaption></figure></li></ul><a class="b" href="/damian-gawrych/">Poznaj Damiana →</a></section><!-- /wp:html -->
```

### /eventy-sportowe/ (przed sekcją FAQ)

```html
<!-- wp:html --><style>.gfx{max-width:1360px;margin:0 auto;padding:clamp(40px,5vw,80px) clamp(16px,3.4vw,48px);font-family:GHInter,Inter,Arial,sans-serif;color:#47132D}.gfx h2{font-family:inherit;font-weight:800;letter-spacing:-.05em;line-height:.92;font-size:clamp(36px,5vw,72px);margin:0 0 16px;text-transform:none;color:inherit}.gfx p{max-width:40rem;font-size:18px;color:#6F5A66;margin:0 0 24px}.gfx ul{list-style:none;margin:0 0 20px;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}.gfx figure{margin:0}.gfx img{display:block;width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;background:#E6E0DA}.gfx figcaption{margin-top:8px;font-size:14px;color:#6F5A66}.gfx figcaption b{display:block;color:#47132D;font-size:15px}.gfx a.b{display:inline-flex;align-items:center;min-height:48px;padding:0 22px;border-radius:999px;background:#6336F5;color:#fff;text-decoration:none;font-weight:700}</style><section class="gfx"><h2>Z naszych wydarzeń.</h2><p>Turnieje, mistrzostwa i pokazy z mobilną areną panna. Organizujemy je od 2008 roku.</p><ul><li><figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1085-768x431.jpg" alt="Stoisko Freestival Street Games na PGE Narodowym" loading="lazy" decoding="async"><figcaption><b>Mistrzostwa Świata Freestival Street Games 2017</b>promocja na PGE Narodowym</figcaption></figure></li><li><figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1079.jpg" alt="Zwycięzcy turnieju na podium" loading="lazy" decoding="async"><figcaption><b>Podium turnieju</b>Street Games</figcaption></figure></li><li><figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1080-768x431.jpg" alt="Plakat turnieju One vs One Panna" loading="lazy" decoding="async"><figcaption><b>One vs One Panna</b>plakat turnieju Street Games</figcaption></figure></li><li><figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1051-768x521.jpg" alt="Pokaz gry na Tarasie przy Pałacu Kultury i Nauki" loading="lazy" decoding="async"><figcaption><b>Pokaz na Tarasie</b>Warszawa, zdjęcie: Zarząd Zieleni m.st. Warszawy</figcaption></figure></li></ul><a class="b" href="/koncepcje/">Zobacz koncepcje aren →</a></section><!-- /wp:html -->
```

### /boiska-dla-szkol/ (przed sekcją z formularzem lub na końcu treści)

```html
<!-- wp:html --><style>.gfx{max-width:1360px;margin:0 auto;padding:clamp(40px,5vw,80px) clamp(16px,3.4vw,48px);font-family:GHInter,Inter,Arial,sans-serif;color:#47132D}.gfx h2{font-family:inherit;font-weight:800;letter-spacing:-.05em;line-height:.92;font-size:clamp(36px,5vw,72px);margin:0 0 16px;text-transform:none;color:inherit}.gfx p{max-width:40rem;font-size:18px;color:#6F5A66;margin:0 0 24px}.gfx ul{list-style:none;margin:0 0 20px;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}.gfx figure{margin:0}.gfx img{display:block;width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;background:#E6E0DA}.gfx figcaption{margin-top:8px;font-size:14px;color:#6F5A66}.gfx figcaption b{display:block;color:#47132D;font-size:15px}.gfx a.b{display:inline-flex;align-items:center;min-height:48px;padding:0 22px;border-radius:999px;background:#6336F5;color:#fff;text-decoration:none;font-weight:700}</style><section class="gfx"><h2>Panna w szkole.</h2><p>Mobilna arena mieści się w sali gimnastycznej, a mała, zamknięta przestrzeń sprawdza się na lekcjach, turniejach szkolnych i zajęciach integracyjnych.</p><ul><li><figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1088-768x430.jpg" alt="Uczniowie wokół areny panna w szkolnej sali gimnastycznej" loading="lazy" decoding="async"><figcaption><b>Arena w sali gimnastycznej</b>pokaz i turniej szkolny</figcaption></figure></li><li><figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/IMG_1074-768x576.jpg" alt="Zajęcia w arenie panna z zawodnikami Olimpiad Specjalnych" loading="lazy" decoding="async"><figcaption><b>Zajęcia integracyjne</b>z zawodnikami Olimpiad Specjalnych</figcaption></figure></li></ul></section><!-- /wp:html -->
```

### /realizacje-gamefields/ (opis Wake For Friends)

Pod tekstem realizacji „Wake For Friends” dodaj link:

```html
<p><a href="/jak-powstaje-arena/">Zobacz budowę tej areny krok po kroku →</a></p>
```

### Strona główna (ID 3462)

1. W sekcji „Projektuję miejsca, do których się wraca.” znajdź przycisk „Napisz do mnie” (`<a class="pill" href="#kontakt" ...>Napisz do mnie ...</a>`). Zaraz po nim wstaw:

```html
<a href="/damian-gawrych/" style="color:var(--paper);font-weight:700;text-underline-offset:4px">Kim jestem: Damian Gawrych →</a>
```

2. W `<script type="application/ld+json">` strony głównej zamień:

```json
"founder":{"@type":"Person","name":"Damian Gawrych"}
```

na:

```json
"founder":{"@type":"Person","@id":"https://www.gamefields.eu/#damian-gawrych","name":"Damian Gawrych","url":"https://www.gamefields.eu/damian-gawrych/","sameAs":["https://www.instagram.com/damiangawrych/","https://www.damiangawrych.pl/"]}
```

## Zadanie 3. Autor wpisów

Użytkownicy → profil konta, z którego publikowane są wpisy na blogu:
- „Wyświetlaj publicznie jako”: **Damian Gawrych**,
- „Informacje biograficzne”: „Autor studia Gamefields. W pannę gra od 2005 roku, turnieje organizuje od 2008. Organizator Mistrzostw Świata Freestival Street Games 2017. Projektuje boiska do panny i street footballu.”,
- „Witryna internetowa”: `https://www.gamefields.eu/damian-gawrych/`,
- jeśli Yoast SEO pokazuje pola profili społecznościowych: Instagram `https://www.instagram.com/damiangawrych/`, inne: `https://www.damiangawrych.pl/`.

## Lista kontrolna

- [ ] Cztery nowe strony otwierają się pod swoimi adresami, na komputerze i na telefonie (390 px), bez przewijania w bok.
- [ ] Na każdej stronie wszystkie zdjęcia się wczytują (narzędzia przeglądarki → Sieć, brak 404).
- [ ] Linki między stronami działają: Damian Gawrych ↔ Jak powstaje arena ↔ Koncepcje ↔ Sztuka z gry ↔ Realizacje ↔ Kontakt ↔ Studio, a linki do Instagrama i damiangawrych.pl otwierają się w nowej karcie.
- [ ] Dane strukturalne przechodzą walidację: https://validator.schema.org/ (Person, ProfilePage, HowTo, CollectionPage).
- [ ] Fragmenty na O nas, Eventy sportowe i Boiska dla szkół wyglądają spójnie z resztą strony.
- [ ] Strona główna: link „Kim jestem” jest widoczny w sekcji studia.
- [ ] Cache LiteSpeed wyczyszczony.

## Cofnięcie

Nowe strony przenieś do kosza. Na istniejących stronach przywróć zapisane wersje.
