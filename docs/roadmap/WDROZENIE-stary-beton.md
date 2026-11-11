# Wdrożenie: sekcja „Stary beton. Nowe boisko.” na stronie głównej gamefields.eu

Dla wykonawcy z dostępem do WordPressa gamefields.eu (Claude Code, Codex lub inny asystent albo osoba). Źródło: repozytorium `DamianRyh/gamefields-os`, PR #76 (scalony), katalog `integrations/wordpress/homepage/studio-2026-11/`.

## Zasady

1. **Nie podmieniaj całej treści strony głównej** treścią z repozytorium. Na żywo działa motyw 1.0.28, nowszy niż w repo. Wstaw tylko cztery fragmenty opisane niżej do **aktualnej** treści strony.
2. Przed zmianą zrób kopię: zapisz numer wersji strony (ID 3462, „Wersje”) albo skopiuj całą treść bloku HTML do pliku.
3. Najpierw zmiana na szkicu lub w podglądzie, publikacja dopiero po akceptacji właściciela.
4. Strona główna to jeden blok „Własny HTML” (`wp:html`). Edytuj go w edytorze kodu. Nie przełączaj go na bloki wizualne.
5. Nie dodawaj `&&` w skryptach (WordPress zamienia to na encje). Poniższy skrypt go nie zawiera.
6. Po publikacji wyczyść cache LiteSpeed dla strony głównej.

Obrazy ładują się z jsDelivr (publiczne repozytorium, przypięty commit `dc298de`). Nie trzeba ich wgrywać do mediów. Jeśli wolisz media WordPress, pobierz 4 pliki z adresów poniżej, wgraj je i podmień adresy w sekcji.

## Krok 1. Style (CSS)

W treści strony znajdź pierwszy znacznik `<style>` z regułami `.gfs ...`. Wklej poniższy kod **na końcu tego bloku**, tuż przed zamykającym `</style>`.

```css
/* ---------- 2026-11-11 · Stary beton. Nowe boisko. (modernizacja placów) ---------- */
.gfs .mod-ba{margin:0}
.gfs .mod-frame{position:relative;overflow:hidden;background:#d9d4cf;aspect-ratio:2/1;max-height:680px;width:100%;user-select:none;-webkit-user-select:none}
.gfs .mod-frame img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:45% 38%;display:block}
.gfs .mod-after{position:absolute;inset:0;clip-path:inset(0 0 0 var(--p))}
.gfs .mod-handle{position:absolute;top:0;bottom:0;left:var(--p);width:2px;margin-left:-1px;background:var(--paper);pointer-events:none}
.gfs .mod-handle::after{content:"↔";position:absolute;top:50%;left:50%;width:52px;height:52px;margin:-26px 0 0 -26px;border-radius:50%;background:var(--paper);color:var(--ink);display:grid;place-items:center;font-size:22px;font-weight:700;box-shadow:0 6px 24px rgba(28,9,18,.25)}
.gfs .mod-range{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:ew-resize;touch-action:pan-y}
.gfs .mod-range:focus-visible ~ .mod-handle::after{outline:3px solid var(--violet);outline-offset:3px}
.gfs .mod-tag{position:absolute;top:clamp(10px,1.6vw,22px);padding:8px 14px;background:rgba(244,241,238,.94);color:var(--ink);pointer-events:none}
.gfs .mod-tag.l{left:clamp(10px,1.6vw,22px)}
.gfs .mod-tag.r{right:clamp(10px,1.6vw,22px);background:var(--lime)}
.gfs .mod-ba figcaption{padding:14px 0 0;max-width:820px;font-size:15px;line-height:1.5;color:var(--muted)}
.gfs .mod-ba figcaption b{color:var(--ink)}
.gfs .mod-steps{list-style:none;margin:clamp(24px,3vw,40px) 0 0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.gfs .mod-steps li{display:grid;gap:8px;align-content:start;padding:24px;background:#fff;border:1px solid var(--line)}
.gfs .mod-steps b{font-size:22px;letter-spacing:-.02em;line-height:1.15}
.gfs .mod-steps li > span:not(.m){color:var(--muted);font-size:15px;line-height:1.45}
.gfs .mod-steps .m{color:var(--violet)}
.gfs .mod-facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;margin-top:clamp(28px,3vw,44px);padding-top:24px;border-top:1px solid var(--line)}
.gfs .mod-facts .m{color:var(--muted)}
.gfs .mod-facts p{margin:6px 0 0;font-size:17px;line-height:1.45}
.gfs .mod-cta{display:flex;flex-wrap:wrap;gap:12px;margin-top:clamp(24px,3vw,40px)}
@media (max-width:900px){.gfs .mod-steps{grid-template-columns:repeat(2,minmax(0,1fr))}.gfs .mod-facts{grid-template-columns:minmax(0,1fr);gap:16px}.gfs .mod-frame{aspect-ratio:4/3}.gfs .mod-frame img{object-position:38% 40%}}
@media (max-width:560px){.gfs .mod-steps{grid-template-columns:minmax(0,1fr)}.gfs .mod-handle::after{width:44px;height:44px;margin:-22px 0 0 -22px}}
```

## Krok 2. Nowa sekcja

Znajdź w treści strony sekcję planera: `<section id="planer" ...>` (nagłówek „Zmieści się?”). Wklej poniższy kod **zaraz po jej zamykającym `</section>`**, przed sekcją `<section id="dla-kogo" ...>` („Wybierz swoją drogę.”).

```html
<!-- MODERNIZACJA: stary beton -> kolorowe boisko (2026-11-11). Zdjęcia: strona /radar-boisko-koszykowki-warszawa/, Street View 2017 + koncepcja Organic Flow. -->
<section id="nawierzchnie" class="wrap sec" style="padding-top:0" aria-labelledby="gfs-mod">
  <div class="head">
    <div class="hd"><p class="kicker m">Nawierzchnie i modernizacje</p><h2 class="d" id="gfs-mod">Stary beton. Nowe boisko.</h2></div>
    <div class="side">
      <p>Nie każdy plac trzeba rozbierać. Szary beton albo asfalt zamieniam w kolorowe boisko do piłki, kosza i gry 3 na 3: naprawa podłoża, farby z gumą, wzór i linie w jednym zleceniu.</p>
      <div class="chips"><a class="chip" href="/malowanie-boisk/">Malowanie boisk</a><a class="chip" href="/renowacja-boisk/">Renowacja boisk</a></div>
    </div>
  </div>
  <figure class="mod-ba">
  <div class="mod-frame" data-ba style="--p:50%">
    <img src="https://cdn.jsdelivr.net/gh/DamianRyh/gamefields-os@dc298dede4689c700ad901e78628a1938fd941b0/integrations/wordpress/homepage/studio-2026-11/assets/modernizacja/pole-mokotowskie-przed-1100.webp" srcset="https://cdn.jsdelivr.net/gh/DamianRyh/gamefields-os@dc298dede4689c700ad901e78628a1938fd941b0/integrations/wordpress/homepage/studio-2026-11/assets/modernizacja/pole-mokotowskie-przed-720.webp 720w, https://cdn.jsdelivr.net/gh/DamianRyh/gamefields-os@dc298dede4689c700ad901e78628a1938fd941b0/integrations/wordpress/homepage/studio-2026-11/assets/modernizacja/pole-mokotowskie-przed-1100.webp 1100w" sizes="(max-width:900px) 100vw, 66vw" width="1100" height="733" loading="lazy" decoding="async" alt="Przed: szary betonowy plac do koszykówki między drzewami, Pole Mokotowskie w Warszawie, Street View 2017">
    <div class="mod-after" aria-hidden="true"><img src="https://cdn.jsdelivr.net/gh/DamianRyh/gamefields-os@dc298dede4689c700ad901e78628a1938fd941b0/integrations/wordpress/homepage/studio-2026-11/assets/modernizacja/pole-mokotowskie-po-1100.webp" srcset="https://cdn.jsdelivr.net/gh/DamianRyh/gamefields-os@dc298dede4689c700ad901e78628a1938fd941b0/integrations/wordpress/homepage/studio-2026-11/assets/modernizacja/pole-mokotowskie-po-720.webp 720w, https://cdn.jsdelivr.net/gh/DamianRyh/gamefields-os@dc298dede4689c700ad901e78628a1938fd941b0/integrations/wordpress/homepage/studio-2026-11/assets/modernizacja/pole-mokotowskie-po-1100.webp 1100w" sizes="(max-width:900px) 100vw, 66vw" width="1100" height="733" loading="lazy" decoding="async" alt=""></div>
    <span class="mod-tag l m">Przed</span><span class="mod-tag r m">Koncepcja po</span>
    <span class="mod-handle" aria-hidden="true"></span>
    <input class="mod-range" type="range" min="0" max="100" value="50" aria-label="Porównaj plac przed i koncepcję po modernizacji">
  </div>
    <figcaption><b>Pole Mokotowskie, Warszawa.</b> Betonowy plac do koszykówki i koncepcja Organic Flow na tym samym zdjęciu. Przesuń suwak. Zdjęcie: Google Street View, sierpień 2017. To wizualizacja, nie realizacja. <a href="/radar-boisko-koszykowki-warszawa/">Zobacz koncepcję →</a></figcaption>
  </figure>
  <ol class="mod-steps" role="list">
    <li><span class="m">01</span><b>Ocena placu</b><span>Ze zdjęć i wymiarów sprawdzam pęknięcia, spadki, odwodnienie i stan betonu. Mówię wprost, czy wystarczy malowanie, czy trzeba naprawić podłoże.</span></li>
    <li><span class="m">02</span><b>Naprawa i grunt</b><span>Mycie, szlifowanie, wypełnienie rys i ubytków, grunt do betonu i warstwa wyrównująca. Od tego zależy trwałość koloru.</span></li>
    <li><span class="m">03</span><b>Farby z gumą</b><span>Elastyczna powłoka sportowa z granulatem gumowym: amortyzuje krok, nie ślizga się i przykrywa drobne rysy. Na wyższe wymagania natrysk poliuretanowy z EPDM.</span></li>
    <li><span class="m">04</span><b>Wzór i linie</b><span>Wzór Signature albo Twój projekt ze Studio 3D. Linie do piłki, koszykówki, 3 na 3 albo kilku gier naraz.</span></li>
  </ol>
  <div class="mod-facts">
    <div><span class="m">Czas realizacji</span><p>Zależy od wielkości boiska i stanu placu na starcie. Termin podaję po ocenie zdjęć, zanim podpiszemy cokolwiek.</p></div>
    <div><span class="m">Pogoda</span><p>Farby sportowe kładziemy na suchy beton, przy dodatniej temperaturze, zwykle od wiosny do jesieni.</p></div>
    <div><span class="m">Na start</span><p>Zdjęcia placu, przybliżone wymiary i lokalizacja. Nie musisz znać budżetu.</p></div>
  </div>
  <div class="mod-cta">
    <a class="pill" href="#kontakt" data-mod-ask style="background:var(--violet);color:#fff">Wyślij zdjęcia placu <span aria-hidden="true">→</span></a>
    <a class="pill" href="/studio/" style="background:var(--ink);color:var(--paper)">Zaprojektuj wzór w Studio 3D <span aria-hidden="true">↗</span></a>
  </div>
</section>
<script>(function(){var f=document.querySelector('.gfs [data-ba]');if(!f)return;var r=f.querySelector('.mod-range');function s(){f.style.setProperty('--p',r.value+'%')}r.addEventListener('input',s);s();var a=document.querySelector('.gfs [data-mod-ask]');if(a)a.addEventListener('click',function(){var t=document.querySelector('.gfs textarea[name="project-details"]');if(t){if(!t.value)t.value='Mam stary betonowy plac do modernizacji. Wymiary: ... Lokalizacja: ... Zdjęcia wyślę w odpowiedzi.';}});})();</script>
```

## Krok 3. Drobne zmiany w istniejącej treści

**3a. Skrót na telefonie.** W `<nav class="wrap scope" aria-label="Na skróty">` przed linkiem `<a href="#dla-kogo">` dodaj:

```html
<a href="#nawierzchnie"><b>Stary plac?</b><span>Malowanie i modernizacja</span></a>
```

**3b. Kafel „Malowana” w sekcji Materiały.** Zamień:

```html
<span class="m">na istniejącym placu</span>
```

na:

```html
<a class="m" href="#nawierzchnie">na istniejącym placu</a>
```

## Krok 4. FAQ i dane strukturalne

**4a. FAQ („Krótkie odpowiedzi.”).** Znajdź dokładnie ten fragment:

```html
<details><summary>Czy wykonujecie również samą nawierzchnię?</summary><p>Tak, GAMEFIELDS zajmuje się zarówno nawierzchniami i ich projektowaniem, jak i konstrukcjami boisk. <a href="#plakaty">Zobacz wzory Signature</a>.</p></details>
```

i zamień go na:

```html
<details><summary>Czy wykonujecie również samą nawierzchnię?</summary><p>Tak. Nawierzchnie to druga połowa mojej pracy, obok konstrukcji boisk: projekt wzoru, malowanie, EPDM, płytki i trawa. <a href="#nawierzchnie">Zobacz, jak zmieniam stare place</a>.</p></details><details><summary>Czy da się zrobić boisko na starym betonie?</summary><p>Zwykle tak. Jeśli beton jest stabilny, naprawiam rysy i ubytki, gruntuję podłoże i kładę elastyczną farbę sportową z granulatem gumowym, a na niej wzór i linie. Gdy podłoże jest poważnie uszkodzone, najpierw trzeba je przebudować. Ocenię to ze zdjęć. <a href="#nawierzchnie">Stary beton, nowe boisko</a>.</p></details><details><summary>Ile trwa modernizacja placu?</summary><p>Zależy od wielkości boiska i stanu placu na starcie: ile jest napraw podłoża, ile warstw i ile kolorów ma wzór. Farby sportowe kładziemy na suchy beton przy dodatniej temperaturze, więc pracujemy zwykle od wiosny do jesieni. Termin podaję po ocenie zdjęć. <a href="#kontakt">Wyślij zdjęcia placu</a>.</p></details>
```

**4b. JSON-LD.** W `<script type="application/ld+json">` na stronie głównej:

- w `hasOfferCatalog.itemListElement`, po usłudze „Kolorowe nawierzchnie i grafika boisk”, dodaj:

```json
{"@type":"Offer","itemOffered":{"@type":"Service","name":"Modernizacja betonowych placów w kolorowe boiska","description":"Naprawa i gruntowanie starego betonu lub asfaltu, elastyczne farby sportowe z granulatem gumowym, wzór i linie do piłki, koszykówki i gry 3 na 3.","provider":{"@id":"https://www.gamefields.eu/#studio"}}}
```

- w `knowsAbout` dodaj `"malowanie boisk"` i `"renowacja boisk betonowych"`,
- w `FAQPage.mainEntity` zaktualizuj odpowiedź na „Czy wykonujecie również samą nawierzchnię?” i dodaj dwa pytania:

```json
{"@type":"Question","name":"Czy da się zrobić boisko na starym betonie?","acceptedAnswer":{"@type":"Answer","text":"Zwykle tak. Jeśli beton jest stabilny, naprawiam rysy i ubytki, gruntuję podłoże i kładę elastyczną farbę sportową z granulatem gumowym, a na niej wzór i linie. Gdy podłoże jest poważnie uszkodzone, najpierw trzeba je przebudować. Ocenię to ze zdjęć. Stary beton, nowe boisko."}},
{"@type":"Question","name":"Ile trwa modernizacja placu?","acceptedAnswer":{"@type":"Answer","text":"Zależy od wielkości boiska i stanu placu na starcie: ile jest napraw podłoża, ile warstw i ile kolorów ma wzór. Farby sportowe kładziemy na suchy beton przy dodatniej temperaturze, więc pracujemy zwykle od wiosny do jesieni. Termin podaję po ocenie zdjęć. Wyślij zdjęcia placu."}}
```

Po zmianie sprawdź, czy JSON jest poprawny (np. https://validator.schema.org/).

## Lista kontrolna przed publikacją

- [ ] Kopia strony 3462 zapisana (numer wersji: ____).
- [ ] Na komputerze (1440 px) sekcja stoi po „Zmieści się?”, a przed „Wybierz swoją drogę.”.
- [ ] Suwak przed/po działa myszą, palcem i klawiaturą (strzałki po kliknięciu Tab).
- [ ] Oba zdjęcia się ładują, a etykiety „Przed” i „Koncepcja po” są widoczne.
- [ ] Na telefonie (390 px) kroki układają się w jedną kolumnę, nic nie wychodzi poza ekran.
- [ ] „Wyślij zdjęcia placu” przewija do formularza i wpisuje szkic wiadomości (tylko gdy pole jest puste).
- [ ] Linki „Malowanie boisk”, „Renowacja boisk” i „Zobacz koncepcję” działają.
- [ ] FAQ ma 7 pytań, JSON-LD przechodzi walidację.
- [ ] Konsola przeglądarki bez nowych błędów.
- [ ] Po publikacji: cache LiteSpeed wyczyszczony, strona sprawdzona w oknie prywatnym.

## Cofnięcie

Przywróć zapisaną wersję strony 3462 w „Wersjach” albo wklej zapisaną kopię treści.

## Uwaga o zdjęciu

Zdjęcie „przed” pochodzi z Google Street View, a „po” to koncepcja na tym zdjęciu. Podpis podaje źródło i mówi, że to wizualizacja. Użycie zdjęć Google w materiałach promocyjnych może naruszać zasady Google. Właściciel zna to ryzyko i podmieni zdjęcia na własne, gdy będą dostępne.

Pliki obrazów:
- https://cdn.jsdelivr.net/gh/DamianRyh/gamefields-os@dc298dede4689c700ad901e78628a1938fd941b0/integrations/wordpress/homepage/studio-2026-11/assets/modernizacja/pole-mokotowskie-przed-1100.webp
- https://cdn.jsdelivr.net/gh/DamianRyh/gamefields-os@dc298dede4689c700ad901e78628a1938fd941b0/integrations/wordpress/homepage/studio-2026-11/assets/modernizacja/pole-mokotowskie-przed-720.webp
- https://cdn.jsdelivr.net/gh/DamianRyh/gamefields-os@dc298dede4689c700ad901e78628a1938fd941b0/integrations/wordpress/homepage/studio-2026-11/assets/modernizacja/pole-mokotowskie-po-1100.webp
- https://cdn.jsdelivr.net/gh/DamianRyh/gamefields-os@dc298dede4689c700ad901e78628a1938fd941b0/integrations/wordpress/homepage/studio-2026-11/assets/modernizacja/pole-mokotowskie-po-720.webp
