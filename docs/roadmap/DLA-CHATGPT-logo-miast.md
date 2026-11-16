# Dla ChatGPT: logo miast na stronie głównej i na „Realizacje dla miast” (16.11.2026)

Wszystko jest w tym pliku. Logo są już w bibliotece mediów (ID 4755–4760); kod używa ich wersji 300 px.
Wstawiaj tylko fragmenty, nie podmieniaj całych stron. Przed zmianą zrób kopię każdej strony.

## A. Strona główna (ID 3462)

1. Na końcu `<style>` (przed `</style>`) dopisz:

```css
/* LOGO MIAST (2026-11-16) */
.gfs .gov-cities p{margin:10px 0 0;font-size:15px;font-weight:400;color:var(--muted)}
.gfs .gov-logos{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px}
.gfs .gov-logos li{display:grid;place-items:center;height:96px;padding:10px;background:#fff;border:1px solid var(--line);overflow:hidden}
.gfs .gov-logos img{display:block;max-width:100%;max-height:76px;width:auto;height:auto;object-fit:contain;transform:scale(var(--z,1))}
@media (max-width:900px){.gfs .gov-logos{grid-template-columns:repeat(3,minmax(0,1fr))}.gfs .gov-logos li{height:80px}.gfs .gov-logos img{max-height:60px}}
```

2. W sekcji „Boisko, które się broni.” znajdź akapit:

```html
<p class="gov-cities"><span class="m">Realizacje</span>Warszawa · Kraków · Grodzisk Mazowiecki · Kutno · Żyrardów · Gdańsk · Łódź</p>
```

i zastąp go tym kodem:

```html
<div class="gov-cities"><span class="m">Realizacje w miastach</span>
    <ul class="gov-logos" role="list"><li style="--z:1.3"><img src="/wp-content/uploads/2026/11/LOGO-Warszawa--300x194.png" alt="Miasto stołeczne Warszawa" width="300" height="194" loading="lazy" decoding="async"></li><li style="--z:1.7"><img src="/wp-content/uploads/2026/11/Zarzad-Zieleni-Miejskiej-Warszawa-300x141.jpg" alt="Zarząd Zieleni m.st. Warszawy" width="300" height="141" loading="lazy" decoding="async"></li><li><img src="/wp-content/uploads/2026/11/LOHO-Krakow--300x200.jpg" alt="Kraków" width="300" height="200" loading="lazy" decoding="async"></li><li style="--z:1.6"><img src="/wp-content/uploads/2026/11/Grodzisk-Mazowiecki-LOGO-300x200.jpg" alt="Grodzisk Mazowiecki" width="300" height="200" loading="lazy" decoding="async"></li><li><img src="/wp-content/uploads/2026/11/LOGO-Kutno--300x231.jpg" alt="Kutno" width="300" height="231" loading="lazy" decoding="async"></li><li style="--z:1.15"><img src="/wp-content/uploads/2026/11/LOGO-Lodz-300x139.webp" alt="Łódź" width="300" height="139" loading="lazy" decoding="async"></li></ul>
    <p>Także Żyrardów i Gdańsk.</p>
  </div>
```

## B. Strona „Realizacje dla miast” (/realizacje-dla-miast/)

1. W `<style>` tej strony, przed linią zaczynającą się od `@media (max-width:900px){.gfa-alert,.gfa-check`, dopisz:

```css
.gfa-logos{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px}
.gfa-logos li{display:grid;place-items:center;height:110px;padding:12px;background:#fff;border:1px solid var(--line);overflow:hidden}
.gfa-logos img{display:block;max-width:100%;max-height:84px;width:auto;height:auto;object-fit:contain;transform:scale(var(--z,1))}
.gfa-logos-more{margin:12px 0 0;color:var(--muted);font-size:15px}
@media (max-width:900px){.gfa-logos{grid-template-columns:repeat(3,minmax(0,1fr))}.gfa-logos li{height:84px}.gfa-logos img{max-height:62px}}
```

2. Zaraz po pierwszej sekcji (nagłówek „Boiska, które pracują dla miast.”, kończy się zdjęciem Tarasu i `</div></section>`) wstaw nową sekcję:

```html
<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><h2 class="d">Miasta i instytucje.</h2><p>Areny i boiska Gamefields działają w przestrzeni miejskiej tych miast i instytucji.</p></div>
  <ul class="gfa-logos" role="list"><li style="--z:1.3"><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/LOGO-Warszawa--300x194.png" alt="Miasto stołeczne Warszawa" width="300" height="194" loading="lazy" decoding="async"></li><li style="--z:1.7"><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/Zarzad-Zieleni-Miejskiej-Warszawa-300x141.jpg" alt="Zarząd Zieleni m.st. Warszawy" width="300" height="141" loading="lazy" decoding="async"></li><li style="--z:1"><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/LOHO-Krakow--300x200.jpg" alt="Kraków" width="300" height="200" loading="lazy" decoding="async"></li><li style="--z:1.6"><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/Grodzisk-Mazowiecki-LOGO-300x200.jpg" alt="Grodzisk Mazowiecki" width="300" height="200" loading="lazy" decoding="async"></li><li style="--z:1"><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/LOGO-Kutno--300x231.jpg" alt="Kutno" width="300" height="231" loading="lazy" decoding="async"></li><li style="--z:1.15"><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/LOGO-Lodz-300x139.webp" alt="Łódź" width="300" height="139" loading="lazy" decoding="async"></li></ul>
  <p class="gfa-logos-more">Także Żyrardów i Gdańsk.</p>
</div></section>
```

## C. Sprawdzenie i publikacja

- Strona główna: w sekcji dla gmin rząd sześciu logo (Warszawa, Zarząd Zieleni m.st. Warszawy, Kraków, Grodzisk Mazowiecki, Kutno, Łódź) i pod nim „Także Żyrardów i Gdańsk.”; na telefonie dwa rzędy po trzy.
- Realizacje dla miast: sekcja „Miasta i instytucje.” z tymi samymi logo pod pierwszą sekcją.
- Brak przewijania w bok. Pokaż mi podgląd, potem opublikuj obie strony i wyczyść cache LiteSpeed.
