# Publikacja gamefields.eu dla klientów: zmiany do wdrożenia (11.11.2026)

Dokument dla wykonawcy z dostępem do WordPressa i hostingu. Zawiera cały potrzebny kod — nie trzeba otwierać żadnych linków do GitHuba. Na WordPressie zmieniamy tylko to, co opisane niżej.

## Stan po audycie z 11.11.2026

Sprawdzone automatycznie na żywej stronie (Playwright, 50 adresów z mapy strony, 390 px):

| Obszar | Wynik |
| --- | --- |
| Podstrony z mapy strony | 50 z 50 odpowiada 200, każda ma jeden H1 i opis meta |
| Linki wewnętrzne | 156 z 156 działa |
| Przewijanie w bok na telefonie | brak na wszystkich podstronach |
| Teksty zastępcze (lorem, [pole], „Sample Page”) | brak |
| LCP strony głównej, telefon (Pixel 5, bez dławienia) | ok. 1,4 s, obraz hero `panna-play-mv-720.webp` |
| **Martwe obrazy** | **6 podstron ma tło nagłówka 404** → zadanie A |
| **Sekcja „Stary beton. Nowe boisko.”** | **niewdrożona; zamiast niej stoi wersja „Stary plac. Nowa gra.” spoza repozytorium** → zadanie B |
| **Polityka prywatności** | **nie opisuje Google Analytics, choć pomiar działa** → zadanie C |

Zasady dla każdego zadania: kopia przed zmianą (numer wersji strony), podgląd, publikacja po akceptacji właściciela, na koniec wyczyszczenie cache LiteSpeed.

## A. Martwe obrazy nagłówków (6 podstron)

Trzy pliki z `uploads/2025/06/` usunięto z mediów, a podstrony `/malowanie-boisk/`, `/renowacja-boisk/`, `/projektowanie-boisk/`, `/boiska-dla-deweloperow/`, `/boiska-do-koszykowki/` i `/korty-padel/` nadal używają ich jako tła nagłówka.

1. Utwórz plik `wp-content/mu-plugins/gamefields-content-fixes.php` (menedżer plików hostingu albo SFTP; utwórz katalog `mu-plugins`, jeśli go nie ma) i wklej do niego dokładnie ten kod:

```php
<?php
/**
 * Plugin Name: Gamefields — poprawki treści
 * Description: Podmienia w treści stron adresy obrazów usuniętych z biblioteki mediów na istniejące obrazy Gamefields. Nie zmienia bazy danych; wyłączenie = usunięcie pliku.
 * Version: 1.0.0
 * Author: Gamefields
 *
 * Źródło: repozytorium DamianRyh/gamefields-os, integrations/wordpress/mu-plugins/gamefields-content-fixes.php
 * Instalacja: wgraj do wp-content/mu-plugins/ (utwórz katalog, jeśli go nie ma). WordPress ładuje plik automatycznie.
 *
 * Powód (audyt 2026-11-11): trzy pliki z 2025/06 zostały usunięte z mediów, a sześć podstron nadal używa ich jako tła
 * nagłówka (404): /malowanie-boisk/, /renowacja-boisk/, /projektowanie-boisk/, /boiska-dla-deweloperow/,
 * /boiska-do-koszykowki/, /korty-padel/. Zamiast nich podstawiamy własne rendery Gamefields (bez zdjęć Google).
 */

if (!defined('ABSPATH')) {
	exit;
}

function gamefields_content_fixes_map() {
	$cdn = 'https://cdn.jsdelivr.net/gh/DamianRyh/gamefields-os@814b77d071dcc483696055c4914e57c8f6d0b937/integrations/studio/canvas-editor/public/surface-projects/';
	$uploads = 'https://www.gamefields.eu/wp-content/uploads/';
	return array(
		// Malowanie boisk: kolorowe boisko Signature „Riviera Court” w parku (render Studio).
		$uploads . '2025/06/MALOWANIE-BOISK-SPORTOWYCH-BETONOWYCH-WZORNICTWO-USLUGA-MALOWANIA-BETONU-.png' => $cdn . 'riviera-court-park.webp',
		// Renowacja: boisko „Play System” w parku (render Studio).
		$uploads . '2025/06/RENOWQCJA-BOISK-SPORTOWYCH-RENOWACJA-NAWIERZCHNI-BETONOWYCH-.png' => $cdn . 'play-system-park.webp',
		// Projektowanie i wzornictwo: plansza Studio „Organic Flow” z biblioteki mediów.
		$uploads . '2025/06/PROJEKTOWANIA-WZORNICTWA-DLA-BOISK-MALOWANIE-BOISK-WE-WZORY-MURALNE-BOISKOWE-.png' => $uploads . '2026/10/Gamefields-Studio-%E2%80%94-Organic-Flow.webp',
	);
}

function gamefields_content_fixes_apply($html) {
	if (!is_string($html) || strpos($html, '/uploads/2025/06/') === false) {
		return $html;
	}
	$map = gamefields_content_fixes_map();
	// Te same pliki mogą występować także jako adres względny albo bez „www”.
	foreach ($map as $old => $new) {
		$html = str_replace(
			array($old, str_replace('https://www.', 'https://', $old), str_replace('https://www.gamefields.eu', '', $old)),
			$new,
			$html
		);
	}
	return $html;
}

add_filter('the_content', 'gamefields_content_fixes_apply', 99);
add_filter('render_block', 'gamefields_content_fixes_apply', 99);
```

2. Wtyczka nie zmienia bazy danych. Podmienia adresy w locie na własne rendery Gamefields: „Riviera Court” (malowanie), „Play System” (renowacja), „Organic Flow” (projektowanie).
3. Wyczyść cache LiteSpeed dla tych 6 podstron.

Sprawdzenie: na każdej z 6 podstron w narzędziach przeglądarki (Sieć) nie ma żadnego 404, a nagłówek ma tło z boiskiem.
Cofnięcie: usuń plik z `wp-content/mu-plugins/`.

Rozwiązanie docelowe, gdy będzie czas: w edytorze każdej z 6 podstron podmienić adres tła na obraz z mediów i wtedy usunąć wtyczkę.

## B. Sekcja „Stary beton. Nowe boisko.” na stronie głównej

Wstawiamy tylko fragmenty do aktualnej treści strony 3462, nie podmieniamy całości.
### Zasady

1. **Nie podmieniaj całej treści strony głównej** treścią z repozytorium. Na żywo działa motyw 1.0.28, nowszy niż w repo. Wstaw tylko cztery fragmenty opisane niżej do **aktualnej** treści strony.
2. Przed zmianą zrób kopię: zapisz numer wersji strony (ID 3462, „Wersje”) albo skopiuj całą treść bloku HTML do pliku.
3. Najpierw zmiana na szkicu lub w podglądzie, publikacja dopiero po akceptacji właściciela.
4. Strona główna to jeden blok „Własny HTML” (`wp:html`). Edytuj go w edytorze kodu. Nie przełączaj go na bloki wizualne.
5. Nie dodawaj `&&` w skryptach (WordPress zamienia to na encje). Poniższy skrypt go nie zawiera.
6. Po publikacji wyczyść cache LiteSpeed dla strony głównej.

Obrazy ładują się z jsDelivr (publiczne repozytorium, przypięty commit `dc298de`). Nie trzeba ich wgrywać do mediów. Jeśli wolisz media WordPress, pobierz 4 pliki z adresów poniżej, wgraj je i podmień adresy w sekcji.

### Krok 0. Usuń wcześniejszą wersję sekcji

Jeśli w treści strony jest `<section id="odnowa-placu">` („Stary plac. Nowa gra.”), usuń ją razem z komentarzem `<!-- Modernizacja placów · 2026-11-11 -->`, jej blokiem `<style>` (reguły `.gfs .renov-…`) i jej skryptem. Na stronie ma zostać jedna sekcja o modernizacji placów.

### Krok 1. Style (CSS)

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

### Krok 2. Nowa sekcja

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

### Krok 3. Drobne zmiany w istniejącej treści

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

### Krok 4. FAQ i dane strukturalne

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

### Lista kontrolna przed publikacją

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

### Cofnięcie

Przywróć zapisaną wersję strony 3462 w „Wersjach” albo wklej zapisaną kopię treści.

### Uwaga o zdjęciu

Zdjęcie „przed” pochodzi z Google Street View, a „po” to koncepcja na tym zdjęciu. Podpis podaje źródło i mówi, że to wizualizacja. Użycie zdjęć Google w materiałach promocyjnych może naruszać zasady Google. Właściciel zna to ryzyko i podmieni zdjęcia na własne, gdy będą dostępne.

Pliki obrazów:
- https://cdn.jsdelivr.net/gh/DamianRyh/gamefields-os@dc298dede4689c700ad901e78628a1938fd941b0/integrations/wordpress/homepage/studio-2026-11/assets/modernizacja/pole-mokotowskie-przed-1100.webp
- https://cdn.jsdelivr.net/gh/DamianRyh/gamefields-os@dc298dede4689c700ad901e78628a1938fd941b0/integrations/wordpress/homepage/studio-2026-11/assets/modernizacja/pole-mokotowskie-przed-720.webp
- https://cdn.jsdelivr.net/gh/DamianRyh/gamefields-os@dc298dede4689c700ad901e78628a1938fd941b0/integrations/wordpress/homepage/studio-2026-11/assets/modernizacja/pole-mokotowskie-po-1100.webp
- https://cdn.jsdelivr.net/gh/DamianRyh/gamefields-os@dc298dede4689c700ad901e78628a1938fd941b0/integrations/wordpress/homepage/studio-2026-11/assets/modernizacja/pole-mokotowskie-po-720.webp

## C. Polityka prywatności: pomiar odwiedzin (strona 4087)

Na stronie działa Complianz (zgoda opt-in) i tag Google `GT-M63DMWRD`. Polityka tego nie opisuje. Dodaj poniższą sekcję **po sekcji „Usługi techniczne, pamięć przeglądarki i cookies”**, jako nagłówek H2 i akapity (w edytorze blokowym: blok Nagłówek + bloki Akapit).

> ## Pomiar odwiedzin
>
> Za Twoją zgodą korzystamy z Google Analytics 4, żeby wiedzieć, które części strony i Studio pomagają w projektowaniu boiska. Bez zgody pomiar jest wyłączony, a do Google trafiają wyłącznie sygnały bez plików cookie i bez identyfikatorów (tryb zgody Google).
>
> Po wyrażeniu zgody Google Analytics zapisuje pliki cookie `_ga` i `_ga_*` i zbiera: odwiedzone strony, czas wizyty, typ urządzenia i przeglądarki, przybliżoną lokalizację (kraj, miasto) oraz źródło wejścia. Nie łączymy tych danych z treścią zapytań.
>
> Podstawą jest Twoja zgoda (art. 6 ust. 1 lit. a RODO). Możesz ją zmienić albo wycofać w każdej chwili przyciskiem „Zarządzaj zgodą” poniżej. Wycofanie nie wpływa na zgodność z prawem pomiaru sprzed wycofania.
>
> Dostawcą usługi jest Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irlandia. Dane mogą być przekazywane do Google LLC w USA. Google LLC uczestniczy w programie EU-U.S. Data Privacy Framework, na podstawie decyzji Komisji Europejskiej stwierdzającej odpowiedni stopień ochrony. Dane w Google Analytics przechowujemy 14 miesięcy.

Uwagi dla wykonawcy:
- Pod akapitem z podstawą prawną dodaj blok „Własny HTML” z przyciskiem, który otwiera okno zgód Complianz (klasa `cmplz-show-banner`):

  ```html
  <p><button type="button" class="cmplz-show-banner" style="min-height:44px;padding:0 20px;border-radius:999px;border:1.5px solid #47132D;background:#fff;color:#47132D;font:inherit;font-weight:700;cursor:pointer">Zarządzaj zgodą</button></p>
  ```

  Nie używaj krótkiego kodu `[cmplz-manage-consent]`: w zainstalowanej wersji Complianz wyświetla on napis „[object Object]” (sprawdzone 12.11.2026).
- Okres 14 miesięcy musi się zgadzać z ustawieniem GA4 (Administracja → Przechowywanie danych). Jeśli jest tam 2 miesiące, wpisz 2 miesiące albo zmień ustawienie na 14.
- Nie publikuj pozostałych akapitów z `docs/roadmap/prywatnosc-uzupelnienia.md` (dane firmy, Warsztat, koszulki, PLAY), dopóki właściciel nie poda brakujących danych.

Sprawdzenie: sekcja jest widoczna, przycisk zmiany zgody otwiera okno Complianz.

## Po wdrożeniu

Napisz właścicielowi raport. Kontrolę całej strony zrobi potem osobno.
