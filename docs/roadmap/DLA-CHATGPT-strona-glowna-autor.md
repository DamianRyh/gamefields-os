# Dla ChatGPT: strona główna — blok „Autor studia” (16.11.2026)

Wszystko jest w tym pliku. Nie otwieraj linków do GitHuba. Strona główna to ID 3462, jeden blok „Własny HTML”.
**Nie podmieniaj całej strony** — wstaw tylko poniższe fragmenty. Przed zmianą zrób kopię strony.
Zdjęcie jest już w bibliotece mediów: `DAMIAN-GAWRYCH-1.jpeg` (ID 4677), w kodzie rozmiar 768 × 998.

Fakty z istniejącej strony /damian-gawrych/ i z mediów właściciela: zawodnik od 2005, pierwszy turniej 2008 (Jaktorów), podium mistrzostw świata 2015 (Praga), organizator Mistrzostw Świata Freestival Street Games 2017, Taras pod Pałacem Kultury (trzy areny Panna Ring), założyciel Warsaw FC.

## 1. CSS

Na końcu znacznika `<style>` w bloku strony głównej (przed `</style>`) dopisz:

```css
/* AUTOR (2026-11-16) */
.gfs .author{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(24px,4vw,64px);align-items:center}
.gfs .author-photo{margin:0;background:#8E9094}
.gfs .author-photo img{display:block;width:100%;height:auto;aspect-ratio:768/998;object-fit:cover}
.gfs .author-copy{display:grid;gap:16px;align-content:start}
.gfs .author-copy .d{margin:0;font-size:clamp(48px,6vw,96px)}
.gfs .author-lead{margin:0;font-size:clamp(17px,1.4vw,20px);line-height:1.55;color:var(--muted);max-width:46ch}
.gfs .author-quote{margin:4px 0;padding:0 0 0 18px;border-left:4px solid var(--violet);font-size:clamp(22px,2.2vw,32px);font-weight:800;letter-spacing:-.02em;line-height:1.2;color:var(--ink)}
.gfs .author-facts{margin:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 24px}
.gfs .author-facts div{display:grid;grid-template-columns:110px minmax(0,1fr);gap:12px;padding:12px 0;border-top:1px solid var(--line);align-items:baseline}
.gfs .author-facts dt{color:var(--violet);font-weight:800}.gfs .author-facts dd{margin:0;font-size:15px;line-height:1.4}
.gfs .author-links{display:flex;flex-wrap:wrap;gap:10px;margin-top:6px}
@media (max-width:900px){.gfs .author{grid-template-columns:minmax(0,1fr)}.gfs .author-photo{max-width:420px}.gfs .author-facts{grid-template-columns:minmax(0,1fr)}}
```

## 2. Sekcja „Autor studia”

Wstaw **przed** sekcją „Poczuj różnicę.” (`<section class="wrap sec" aria-labelledby="gfs-mats">`), czyli zaraz po sekcji Studio („Projektuję miejsca, do których się wraca.”):

```html
<section id="autor" class="wrap sec" aria-labelledby="gfs-author">
  <div class="author">
    <figure class="author-photo"><img src="/wp-content/uploads/2026/11/DAMIAN-GAWRYCH-1-768x998.jpeg" alt="Damian Gawrych, autor studia Gamefields" width="768" height="998" loading="lazy" decoding="async"></figure>
    <div class="author-copy">
      <p class="kicker m">Autor studia</p>
      <h2 class="d" id="gfs-author">Damian Gawrych.</h2>
      <p class="author-lead">W pannę gram od 2005 roku, turnieje organizuję od 2008. Gamefields to moje autorskie studio: każdy projekt zaczynam od rozmowy z ludźmi, którzy będą na nim grać.</p>
      <blockquote class="author-quote">„Zaczynam od miejsca, kończę na pierwszym meczu.”</blockquote>
      <dl class="author-facts">
        <div><dt class="m">2005</dt><dd>Zawodnik panny i street footballu</dd></div>
        <div><dt class="m">2008</dt><dd>Pierwszy turniej, Jaktorów</dd></div>
        <div><dt class="m">2015</dt><dd>Podium mistrzostw świata, Praga</dd></div>
        <div><dt class="m">2017</dt><dd>Organizator Mistrzostw Świata Freestival Street Games</dd></div>
        <div><dt class="m">Warszawa</dt><dd>Taras pod Pałacem Kultury: trzy areny Panna Ring</dd></div>
        <div><dt class="m">Warsaw FC</dt><dd>Założyciel klubu</dd></div>
      </dl>
      <div class="author-links"><a class="pill" href="#kontakt" style="background:var(--violet);color:#fff">Napisz do mnie <span aria-hidden="true">→</span></a><a class="pill" href="/damian-gawrych/" style="background:var(--ink);color:var(--paper)">Kim jestem <span aria-hidden="true">→</span></a></div>
    </div>
  </div>
</section>
```

## 3. Sprawdzenie i publikacja

- Komputer: zdjęcie po lewej, po prawej „Damian Gawrych.”, cytat „Zaczynam od miejsca, kończę na pierwszym meczu.”, sześć faktów w dwóch kolumnach, przyciski „Napisz do mnie” i „Kim jestem”.
- Telefon: zdjęcie nad tekstem, fakty w jednej kolumnie, brak przewijania w bok.
- Pokaż mi podgląd, potem opublikuj i wyczyść cache LiteSpeed.
