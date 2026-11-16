# Dla ChatGPT: strona główna — gminy i Orliki, ceny kompletu, zdjęcia z boisk (16.11.2026)

Wszystko jest w tym pliku. Nie otwieraj linków do GitHuba. Strona główna to ID 3462, jeden blok „Własny HTML”.
**Nie podmieniaj całej strony** — wstaw tylko poniższe fragmenty. Przed zmianą zrób kopię (wersja/szkic) strony.
Zdjęcia są już w bibliotece mediów (listopad 2026), adresy w kodzie wskazują na nie.

Fakty od właściciela (16.11): gwarancja 12 miesięcy i stała opieka nad renowacją; rozwiązania spełniają wymagania programu „Moje Boisko – Orlik 2012”; certyfikaty i karty techniczne producentów stali, farb i nawierzchni dołączamy do oferty. Ceny z cenników właściciela (konstrukcje, beton 283 zł/m², wykończenia).

## 1. CSS

Na końcu znacznika `<style>` w bloku strony głównej (przed `</style>`) dopisz:

```css
/* SAMORZĄDY + ceny kompletu (2026-11-16) */
.gfs .prices .full{display:block;margin-top:4px;font-size:14px;font-weight:700;letter-spacing:0;color:var(--violet);white-space:normal}
.gfs .surf-rates{margin:18px 0 0;border:1px solid var(--line);background:#fff}
.gfs .surf-rates summary{cursor:pointer;list-style:none;padding:16px 18px;font-weight:800;font-size:18px;display:flex;justify-content:space-between;gap:12px}
.gfs .surf-rates summary::-webkit-details-marker{display:none}
.gfs .surf-rates summary::after{content:'+';color:var(--violet);font-weight:400;font-size:22px}
.gfs .surf-rates[open] summary::after{content:'−'}
.gfs .surf-rates ul{list-style:none;margin:0;padding:0 18px}
.gfs .surf-rates li{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,3fr) minmax(0,4fr);gap:8px 18px;padding:12px 0;border-top:1px solid var(--line);align-items:baseline}
.gfs .surf-rates li b{font-size:16px}.gfs .surf-rates .rate{font-weight:800;white-space:nowrap}.gfs .surf-rates li span:last-child{color:var(--muted);font-size:14px}
.gfs .surf-rates p{margin:0;padding:12px 18px 16px;color:var(--muted);font-size:14px}
.gfs .gov-facts{list-style:none;margin:0 0 14px;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.gfs .gov-facts li{display:grid;gap:6px;align-content:start;padding:22px;background:#fff;border:1px solid var(--line)}
.gfs .gov-facts .m{color:var(--violet);font-weight:800;font-size:clamp(26px,2.4vw,36px);letter-spacing:-.03em;line-height:1}
.gfs .gov-facts b{font-size:18px;line-height:1.2}.gfs .gov-facts li>span:last-child{color:var(--muted);font-size:15px;line-height:1.5}
.gfs .gov-norms{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 22px}
.gfs .gov-norms span{padding:8px 12px;border:1px solid var(--line);border-radius:999px;background:var(--paper);font-size:14px}
.gfs .gov-build{margin:0 0 18px}
.gfs .gov-build ol{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;counter-reset:b}
.gfs .gov-build li{position:relative;counter-increment:b}
.gfs .gov-build img{display:block;width:100%;height:clamp(180px,20vw,300px)!important;object-fit:cover;background:#E6E0DA}
.gfs .gov-build li span{display:block;margin-top:8px;font-weight:700;font-size:15px}
.gfs .gov-build li span::before{content:counter(b,decimal-leading-zero) "  ";color:var(--violet)}
.gfs .gov-build figcaption{margin-top:10px;color:var(--muted);font-size:15px}.gfs .gov-build figcaption b{color:var(--ink)}
.gfs .gov-cities{margin:0 0 22px;font-size:clamp(18px,1.6vw,22px);font-weight:700;letter-spacing:-.01em}
.gfs .gov-cities .m{display:block;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:600;margin-bottom:6px}
@media (max-width:900px){.gfs .gov-facts,.gfs .gov-build ol{grid-template-columns:repeat(2,minmax(0,1fr))}.gfs .surf-rates li{grid-template-columns:minmax(0,1fr) auto}.gfs .surf-rates li span:last-child{grid-column:1/-1}}
@media (max-width:520px){.gfs .gov-facts{grid-template-columns:minmax(0,1fr)}.gfs .gov-build img{height:150px!important}}
```

## 2. Ceny: zamień całą sekcję „Ile kosztuje arena?”

Znajdź `<section id="ceny"` … `</section>` (pierwsze `</section>` po nim) i zastąp całość tym kodem. Zmiany: tekst obok nagłówka, wiersz „z nawierzchnią od … zł netto” przy każdym modelu, nowa notka i rozwijana tabela „Nawierzchnie: ceny za m²”.

```html
<section id="ceny" class="wrap sec" style="padding-top:0" aria-labelledby="gfs-price">
  <div class="head">
    <div class="hd"><p class="kicker m">Ceny</p><h2 class="d" id="gfs-price">Ile kosztuje arena?</h2></div>
    <div class="side"><p>Ceny konstrukcji z bramkami i całego boiska z nawierzchnią. Montaż i transport zależą od miejsca, dlatego policzę je po zdjęciach placu.</p><div class="chips"><a class="chip" href="#kontakt">Wyślij zdjęcia placu</a><a class="chip" href="/studio/">Zaprojektuj w Studio</a><a class="chip" href="/dofinansowanie-boisk/">Dofinansowanie</a></div></div>
  </div>
  <ul class="prices" role="list"><li><div class="name"><b>Arena mobilna eventowa</b><span>wynajem i sprzedaż</span></div><span class="dim">Różne</span><div class="net">od 27 000 zł <small>netto</small><span class="gross">od 33 210 zł brutto</span></div><span class="who">Marki, turnieje</span><a class="go" href="/wynajem-boisk-mobilnych/">Zobacz ofertę →</a></li><li><div class="name"><b>Panna Octa Cage 90</b><span>GF-CT-005</span></div><span class="dim">Ø, banda 0,9 m</span><div class="net">od 36 000 zł <small>netto</small><span class="gross">od 44 280 zł brutto</span><span class="full">z nawierzchnią od 47 400 zł netto</span></div><span class="who">Osiedla, szkoły</span><a class="go" href="/studio/?arena=circle-cage-1">Zaprojektuj →</a></li><li><div class="name"><b>Panna Play</b><span>GF-CT-002</span></div><span class="dim">Ø ~6 m</span><div class="net">od 40 000 zł <small>netto</small><span class="gross">od 49 200 zł brutto</span><span class="full">z nawierzchnią od 51 000 zł netto</span></div><span class="who">Kluby, eventy, szkoły</span><a class="go" href="/studio/?arena=o1">Zaprojektuj →</a></li><li><div class="name"><b>Panna Ring</b><span>GF-CT-001</span></div><span class="dim">Ø ~5 m</span><div class="net">od 40 000 zł <small>netto</small><span class="gross">od 49 200 zł brutto</span><span class="full">z nawierzchnią od 47 800 zł netto</span></div><span class="who"></span><a class="go" href="/studio/?arena=w1">Zaprojektuj →</a></li><li><div class="name"><b>Panna Octa</b><span>GF-CT-008</span></div><span class="dim">Ośmiokąt</span><div class="net">od 49 000 zł <small>netto</small><span class="gross">od 60 270 zł brutto</span><span class="full">z nawierzchnią od 60 900 zł netto</span></div><span class="who">Gminy, parki, szkoły</span><a class="go" href="/studio/?arena=octagon">Zaprojektuj →</a></li><li><div class="name"><b>Panna Grid</b><span>GF-CT-007</span></div><span class="dim">6,21 × 4,65 m</span><div class="net">od 51 000 zł <small>netto</small><span class="gross">od 62 730 zł brutto</span><span class="full">z nawierzchnią od 66 500 zł netto</span></div><span class="who"></span><a class="go" href="/studio/?arena=street-field">Zaprojektuj →</a></li><li><div class="name"><b>Panna Octa Cage 180</b><span>GF-CT-006</span></div><span class="dim">Ø, banda 1,8 m</span><div class="net">od 58 000 zł <small>netto</small><span class="gross">od 71 340 zł brutto</span><span class="full">z nawierzchnią od 69 400 zł netto</span></div><span class="who">Kluby, akademie</span><a class="go" href="/studio/?arena=circle-cage-2">Zaprojektuj →</a></li><li><div class="name"><b>Panna Court</b><span>GF-CT-003</span></div><span class="dim">7,14 × 5,57 m</span><div class="net">od 69 000 zł <small>netto</small><span class="gross">od 84 870 zł brutto</span><span class="full">z nawierzchnią od 84 700 zł netto</span></div><span class="who"></span><a class="go" href="/studio/?arena=p1">Zaprojektuj →</a></li><li><div class="name"><b>Boisko 3 na 3 (Street Arena 15)</b><span>GF-CT-004</span></div><span class="dim">Pełny format, 15 × 10 m</span><div class="net">od 100 000 zł <small>netto</small><span class="gross">od 123 000 zł brutto</span><span class="full">z nawierzchnią od 159 300 zł netto</span></div><span class="who">Gminy, deweloperzy</span><a class="go" href="/studio/?arena=street15">Zaprojektuj →</a></li></ul>
  <p class="price-note">Ceny orientacyjne „od”, konstrukcja w podstawowej konfiguracji i standardowym kolorze. Netto oraz brutto z VAT 23%. „Z nawierzchnią” to konstrukcja, płyta betonowa 12 cm z podbudową i malowanie jednokolorowe, liczone od powierzchni konstrukcji z 10% zapasem. Bez montażu, transportu i przygotowania terenu.</p>
  <details class="surf-rates"><summary>Nawierzchnie: ceny za m²</summary><ul role="list"><li><b>Płyta betonowa 12 cm z podbudową</b><span class="rate">283 zł/m² <small>netto</small></span><span>podstawa pod każde wykończenie</span></li><li><b>Malowanie farbą sportową</b><span class="rate">78–183 zł/m² <small>netto</small></span><span>jednokolorowe do wzoru zaawansowanego</span></li><li><b>Akryl Hard Court</b><span class="rate">200–342 zł/m² <small>netto</small></span><span>system warstwowy jak na kortach</span></li><li><b>Sztuczna trawa</b><span class="rate">167–292 zł/m² <small>netto</small></span><span>z montażem na betonie</span></li><li><b>Maty gumowe</b><span class="rate">242–425 zł/m² <small>netto</small></span><span>ciągła nawierzchnia gumowa</span></li><li><b>Nawierzchnia EPDM wylewana</b><span class="rate">250–400 zł/m² <small>netto</small></span><span>PN-EN 14877</span></li><li><b>Płytki sportowe PP</b><span class="rate">275–400 zł/m² <small>netto</small></span><span>szybki montaż bez klejenia</span></li><li><b>Płyty gumowe</b><span class="rate">342–492 zł/m² <small>netto</small></span><span>PN-EN 1177, atest PZH</span></li></ul><p>Warianty Standard, Standard+ i Premium. Metraż: powierzchnia konstrukcji z 10% zapasem. Dokładną cenę policzy Studio dla wybranego modelu.</p></details>
</section>
```

## 3. Nowa sekcja „Dla gmin, szkół i Orlików”

Wstaw **przed** `<section id="dla-kogo"` (sekcja „Wybierz swoją drogę.”):

```html
<section id="samorzady" class="wrap sec" style="padding-top:0" aria-labelledby="gfs-gov">
  <div class="head">
    <div class="hd"><p class="kicker m">Dla gmin, szkół i Orlików</p><h2 class="d" id="gfs-gov">Boisko, które się broni.</h2></div>
    <div class="side"><p>Modernizacja Orlika, nowe boisko w gminie albo strefa przy szkole. Przygotuję koncepcję, parametry techniczne i dokumenty do wniosku o dofinansowanie i do przetargu.</p>
      <div class="chips"><a class="chip" href="/dofinansowanie-boisk/">Dofinansowanie boisk</a><a class="chip" href="/realizacje-dla-miast/">Realizacje dla miast</a></div></div>
  </div>
  <ul class="gov-facts" role="list">
    <li><span class="m">10 lat</span><b>Panna Ring na Orliku</b><span>W użyciu od 10 lat na Orliku OSiR w Grodzisku Mazowieckim.</span></li>
    <li><span class="m">Orlik 2012</span><b>Zgodne z programem</b><span>Rozwiązania spełniają wymagania programu „Moje Boisko – Orlik 2012”. Nabory na 2027 rok ruszają 4 stycznia.</span></li>
    <li><span class="m">12 miesięcy</span><b>Gwarancja i opieka</b><span>Rok gwarancji i stała opieka nad renowacją boiska po odbiorze.</span></li>
    <li><span class="m">Dokumenty</span><b>Certyfikaty producentów</b><span>Karty techniczne i certyfikaty stali, farb i nawierzchni dołączam do oferty, wniosku i dokumentacji przetargowej.</span></li>
  </ul>
  <div class="gov-norms" aria-label="Parametry nawierzchni">
    <span><b>PN-EN 14877</b> nawierzchnie poliuretanowe EPDM</span>
    <span><b>PN-EN 1177</b> i atest PZH: płyty gumowe</span>
    <span><b>R11</b> antypoślizg: płyty i maty gumowe</span>
    <span><b>Wodoprzepuszczalne</b> EPDM natryskowe i płyty</span>
  </div>
  <figure class="gov-build">
    <ol role="list">
      <li><img src="/wp-content/uploads/2026/11/Gamefields-x-boiska-x-Projekt-Krakow--768x768.jpg" alt="Plan zagospodarowania z arenami Gamefields, Kraków" width="768" height="768" loading="lazy" decoding="async"><span>Projekt na planie</span></li>
      <li><img src="/wp-content/uploads/2026/11/Gamefields-x-Panna-Cage-x-Krakow-montaz-768x576.jpg" alt="Montaż areny Panna Cage w parku, Kraków" width="768" height="576" loading="lazy" decoding="async"><span>Montaż</span></li>
      <li><img src="/wp-content/uploads/2026/11/Gamefields-x-Panna-Cage-x-Krakow-768x576.jpg" alt="Gotowa arena Panna Cage przed zakończeniem prac, Kraków" width="768" height="576" loading="lazy" decoding="async"><span>Przed odbiorem</span></li>
      <li><img src="/wp-content/uploads/2026/11/Krakow-Panna-Arena-Octa-Cage-90-Gamefields-768x768.jpg" alt="Panna Octa Cage 90 w parku, Kraków" width="768" height="768" loading="lazy" decoding="async"><span>W parku</span></li>
    </ol>
    <figcaption><b>Kraków: od planu do boiska w parku.</b> Panna Octa Cage 90 na terenie miejskim.</figcaption>
  </figure>
  <p class="gov-cities"><span class="m">Realizacje</span>Warszawa · Kraków · Grodzisk Mazowiecki · Kutno · Żyrardów · Gdańsk · Łódź</p>
  <div class="mod-cta">
    <a class="pill" href="#kontakt" style="background:var(--violet);color:#fff">Wyślij zdjęcie placu <span aria-hidden="true">→</span></a>
    <a class="pill" href="/studio/" style="background:var(--ink);color:var(--paper)">Zaprojektuj w 3D i wyślij do wyceny <span aria-hidden="true">↗</span></a>
  </div>
</section>
```

## 4. Zdjęcia z boisk w sekcji „Z boiska.”

W sekcji `<section id="realizacje"` zaraz po `<ul class="reals" role="list">` wstaw cztery nowe kafelki (istniejące zostają):

```html
<li><figure><img src="/wp-content/uploads/2026/11/GAMEFIELDS-Street-Football-Tournament-1-768x576.png" alt="Arena Gamefields na turnieju street football" width="768" height="576" loading="lazy" decoding="async"><figcaption><b>Turniej Street Football</b><span>Arena Gamefields i kibice</span></figcaption></figure></li>
    <li><figure><img src="/wp-content/uploads/2026/11/Damian-Gawrych-x-Wake-for-friends--768x960.jpg" alt="Dzieci grają na arenie Gamefields, Wake For Friends" width="768" height="960" loading="lazy" decoding="async"><figcaption><b>Wake For Friends</b><span>Gra na arenie nad wodą</span></figcaption></figure></li>
    <li><figure><img src="/wp-content/uploads/2026/11/Urodziny-pilkarskie-Gamefields-Damian-Gawrych--768x431.jpg" alt="Urodziny piłkarskie Gamefields przy arenie" width="768" height="431" loading="lazy" decoding="async"><figcaption><b>Urodziny piłkarskie</b><span>Gamefields</span></figcaption></figure></li>
    <li><figure><img src="/wp-content/uploads/2026/11/Zyrardow-Panna-Arena-1v1--768x575.jpg" alt="Pojedynek na arenie Panna 1 na 1, Żyrardów" width="768" height="575" loading="lazy" decoding="async"><figcaption><b>Panna 1 na 1</b><span>Żyrardów</span></figcaption></figure></li>
```

## 5. Sprawdzenie i publikacja

- Komputer i telefon: brak przewijania w bok; w „Ile kosztuje arena?” przy Panna Play „z nawierzchnią od 51 000 zł netto”, przy Boisku 3 na 3 „od 159 300 zł netto”; tabela „Nawierzchnie: ceny za m²” rozwija się.
- Nowa sekcja „Boisko, które się broni.” z czterema kafelkami (10 lat, Orlik 2012, 12 miesięcy, Dokumenty), normami, czterema zdjęciami z Krakowa i listą miast.
- „Z boiska.” zaczyna się od turnieju Street Football, Wake For Friends, urodzin piłkarskich i Żyrardowa.
- Pokaż mi podgląd, potem opublikuj i wyczyść cache LiteSpeed.
