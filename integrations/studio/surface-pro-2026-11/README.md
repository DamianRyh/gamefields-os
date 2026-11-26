# Nawierzchnie Pro — silnik wzorów 2026-11

Nowy silnik wzorów do konfiguratora nawierzchni w Gamefields Studio. Dokłada **16 nowych rodzin × 12 kompozycji = 192 wzory** i **12 nowych palet**. Zastępuje obecną kolekcję 12 Signature kolekcją **16 Signature Pro**; stare Signature zostają na liście za nowymi. Dotychczasowe 25 rodzin i 300 wzorów zostają bez zmian, razem 41 rodzin i 492 wzory.

Galeria z konfiguratorem i researchem: `nawierzchnie-pro.html` (opublikowana też jako artefakt „Nawierzchnie Pro”).

## Co jest w środku

| Plik | Rola |
|---|---|
| `court-art-pro.mjs` | Silnik: czysty ESM bez zależności. `renderPro(rodzina, wariant, h, kolory)` zwraca SVG pola 600 × h. |
| `signature-pro.json` | 16 kuratorowanych projektów: rodzina, wariant, paleta, zastosowanie, opis. |
| `studio/lib/court-art-pro.mjs` + `.d.mts` | Kopia silnika z typami do Studia. |
| `studio/lib/pattern-library-pro.ts` | Rodziny, palety i presety w typach Studia. Generuje go `build-studio-files.mjs`. |
| `studio/components/pro-pattern-art.tsx` | Adapter: rysuje rodzinę Pro wewnątrz istniejącego `PatternArt`. |
| `build-gallery.mjs` | Buduje `nawierzchnie-pro.html` z szablonu i silnika. |

## Zasady silnika

- **Tylko płaskie, malowalne kształty:** ścieżki, prostokąty, koła i wielokąty. Bez filtrów i gradientów SVG. Gradient to schodkowe pasy liczone w OKLab.
- **Kompozycje oparte na geometrii gry:** linia środkowa, koło środkowe, bramki, symetria lustrzana.
- **Ta sama umowa co obecne renderery:** wariant 1–12, paleta pięciu kolorów, pole 600 × h. Linie boiska rysuje Studio.
- **Deterministyczny wynik:** ten sam wariant zawsze daje ten sam obraz (ziarno z nazwy rodziny i wariantu).
- **`proExecution()`** podaje liczbę kolorów farby i poziom maskowania.
- **`recommendLineColor()`** dobiera kolor linii (biały, czarny albo limonkowy) z najlepszym kontrastem.

## Wdrożenie w Studiu (projekt Sites `appgprj_6abbd0ba26f0819197701343bf156f1b`)

Pracuj na aktualnych źródłach z Sites (wersja 154), nie na lokalnych kopiach.

1. Skopiuj `studio/lib/court-art-pro.mjs`, `studio/lib/court-art-pro.d.mts` i `studio/lib/pattern-library-pro.ts` do `lib/`.
2. Skopiuj `studio/components/pro-pattern-art.tsx` do `components/`.
3. W `lib/pattern-library.ts`:
   - dodaj na górze `import {proFamilies,proPalettes,proSignaturePresets} from "./pattern-library-pro";`,
   - zmień `export const patternFamilies` na `const baseFamilies`, a pod tablicą dodaj `export const patternFamilies:PatternFamily[]=[...baseFamilies,...proFamilies];`,
   - tak samo `patternPalettes`: `[...basePalettes,...proPalettes]`,
   - i `signaturePresets`: `[...proSignaturePresets,...baseSignaturePresets]`.

   `PATTERN_COUNT` przelicza się sam (492).
4. W `components/pattern-art.tsx`:
   - dodaj `import {ProPatternArt} from "@/components/pro-pattern-art";`,
   - w `switch(family.renderer)` dodaj pierwszy przypadek `case "pro":art=<ProPatternArt familyId={family.id} variant={v} h={h} colors={colors} uid={uid}/>;break;`.

   Obrót, skala, krycie i cień z `PatternArt` działają bez zmian.
5. Opcjonalnie w `executionProfiles` dodaj profil `pro` (dziś używany jest zapasowy profil `geometry`).
6. Wygeneruj na nowo podglądy ofert (`scripts/build-surface-offer.mjs`, pliki `public/surface-projects/*.svg`, `*-park.webp` i `catalogue.json`). Powstanie wtedy 16 kart Signature Pro.
7. Uruchom kontrole z AGENTS.md (tsc, build, test:studio, test:mobile). Sprawdź karuzelę „Projekty nawierzchni”, okno „Wybierz charakter boiska” i bibliotekę 492 wzorów przy 390 i 1440 px. Potem opublikuj.

Cofnięcie: przywróć `pattern-library.ts` i `pattern-art.tsx`. Pliki Pro mogą zostać, nic ich nie używa.

Zgodność wsteczna: zapisane projekty używają `patternFamily`, `patternVariant` i `patternPalette`. Stare identyfikatory się nie zmieniają, nowe mają prefiks `pro-`. Schemat projektu i JSON zostają bez zmian.

## Sprawdzone 2026-11-02

- `tsc` (strict) na kopii `pattern-library.ts` i `pattern-art.tsx` z repozytorium po zmianach: OK.
- Render 16 Signature Pro przez prawdziwy `PatternArt` (react-dom/server): OK, 41 rodzin, `PATTERN_COUNT` = 492.
- Galeria: brak błędów JS, brak przewijania w bok przy 390 i 1360 px.

### Polecenie dla Codex / ChatGPT

> W projekcie Sites Gamefields Studio wdroż silnik „Nawierzchnie Pro” według integrations/studio/surface-pro-2026-11/README.md z github.com/DamianRyh/gamefields-os (gałąź studio-skin-2026-11). Pracuj na aktualnych źródłach z Sites (v154), nie na lokalnych kopiach. Wykonaj kroki 1–7, nie zmieniaj schematu projektu, cen, migracji ani istniejących 300 wzorów. Uruchom tsc, build, test:studio i test:mobile, zrób zrzuty karuzeli wzorów przy 390 i 1440 px, opublikuj i dopisz wersję, commit i identyfikator wdrożenia do DEPLOYMENT.md. Jeśli `pattern-library.ts` lub `pattern-art.tsx` w v154 wygląda inaczej niż opisano, zatrzymaj się i zgłoś różnice.

## Kolekcja Masters (2026-11-10)

12 nowych rodzin w tym samym silniku (`pro-swiss` … `pro-quilt`), 8 palet i 12 projektów w `signature-masters.json`. Projekty Masters są pierwsze w edytorze nawierzchni, który ma też filtr „Inspiracje mistrzów”.

Każdy kierunek przejmuje metodę szkoły lub artysty (siatkę, proporcję, logikę koloru albo wzoru), a nie konkretne dzieło:

| Rodzina | Metoda |
|---|---|
| Swiss Grid | szkoła szwajcarska, siatka 12 kolumn |
| Homage Squares | Josef Albers, zagnieżdżone kwadraty |
| Hard Edge | Ellsworth Kelly, płaszczyzny i jedna krzywa |
| Dazzle | kamuflaż dazzle 1917–18 |
| Simultané | Sonia i Robert Delaunay, kontrast symultaniczny |
| Cut-Outs | wycinanki Matisse’a |
| Supergraphic | supergrafika architektoniczna lat 60. |
| Truchet Loop | kafle Truchet |
| Nihon Disc | japońska szkoła plakatu |
| Loop Bands | późne wall drawings Sola LeWitta |
| Kinetic Stripes | Carlos Cruz-Diez, Physichromie |
| Housetop Quilt | kołdry z Gee’s Bend |

Regeneracja: `node build-studio-files.mjs` zapisuje `studio/lib/*` oraz `../canvas-editor/lib/pattern-library-pro.ts` i `court-art-pro.mjs`. Razem jest 53 rodziny × 12 = 636 wzorów.

## Kolekcja Masters II (2026-11-17)

Osiem nowych rodzin w tym samym silniku, 8 palet i 8 projektów w `signature-masters-2.json`. Projekty Masters II są w edytorze **pierwsze**, przed Masters, w filtrze „Inspiracje mistrzów”. Razem 61 rodzin × 12 = 732 wzory.

Każdy kierunek przejmuje **metodę** szkoły lub artysty, nie konkretne dzieło. Zasady malowalności tej kolekcji (sprawdzone na wszystkich 96 wariantach):
- każdy pas, komórka i kontur ma co najmniej 8 px, czyli ok. 20 cm na boisku 15 × 10 m (40 px = 1 m);
- najwyżej 5 farb z palety, a w Overprint jedna dodatkowa farba zmieszana na przecięcia;
- kompozycja symetryczna względem środka boiska (lustro albo obrót o 180°), więc obie połowy grają tak samo.

| Rodzina | Grupa | Metoda | Maskowanie |
|---|---|---|---|
| Vega Bulge | geometric | Victor Vasarely: szachownica puchnąca w kule | bardzo wysoka |
| Protractor | premium | Frank Stella: półtarcze z koncentrycznych pasów oparte o bramki i linie | wysoka |
| Neo-Plastic | geometric | De Stijl: czarne belki i płaszczyzny kolorów podstawowych | średnia |
| Overprint | brand | Karel Martens: dwa systemy pasów nadrukowane na siebie | średnia |
| Ndebele | street | malarstwo ścienne Ndebele: płaskie figury w czarnych konturach | wysoka |
| Munich Bands | brand | Otl Aicher, system 1972: widmo pasów cięte pod 45° | średnia |
| Promenade | organic | Roberto Burle Marx, promenada Copacabana: falujące pasy | wysoka |
| Garden Plan | organic | Roberto Burle Marx, plany ogrodów: rabaty w pasy i ścieżka | średnia |

Regeneracja: `node build-studio-files.mjs` (kopiuje silnik i `pattern-library-pro.ts` do `canvas-editor/lib/`), `node build-gallery.mjs`.

## Kompozytor (2026-11-26): model, który sam sprawdza swoje wzory

Nowy sposób tworzenia wzorów w tym samym silniku. Do tej pory każda rodzina miała 12 ręcznie zakodowanych kompozycji, a malowalność sprawdzał człowiek na podglądach. Kompozytor odwraca kolejność:

1. **Gramatyka zamiast 12 obrazków.** Każda rodzina to zbiór reguł zakotwiczonych w samym boisku (koło środkowe, pola bramkowe, bramki, połowy). Parametry (szerokość pasa w krokach co 0,5–1 m, liczba pasów, tryb, symetria, kolejność farb) losuje ziarno, więc kandydatów jest nieograniczenie wiele.
2. **Sloty zamiast kolorów.** Geometria jest zapisana w slotach (0 = tło, 1–4 = farby). Jedno sprawdzenie obowiązuje dla każdej palety.
3. **Kontrola na rastrze.** `curate-composer.mjs` renderuje w Chromium setki kandydatów na rodzinę, przy h = 400 (15 × 10 m, raster 2×) i h = 600 (kwadrat / Panna), i odrzuca każdego, który:
   - ma fragment węższy niż 20 cm (otwarcie morfologiczne dyskiem 8 px; odpada każdy utracony kawałek > 40 px),
   - ma więcej niż dwie plamki mniejsze niż 30 × 30 cm,
   - używa mniej niż 3 albo więcej niż 5 farb,
   - nie jest symetryczny (obrót o 180° albo lustro, różnica ≤ 1,2 % pikseli),
   - ma jeden kolor na ponad 82 % boiska.
4. **Wybór najlepszych i różnych.** Ocena: zrównoważone pola koloru i umiarkowane maskowanie (ok. 1–3 m taśmy na m²). Wybór po kolei z każdego trybu rodziny, z odrzuceniem prawie identycznych (odległość Jaccarda krawędzi < 0,35). Zostaje 36 sprawdzonych ziaren na rodzinę.
5. **Liczby do wyceny.** Każde ziarno ma zmierzony udział każdej farby i długość krawędzi do oklejenia. `composerMetrics(rodzina, wariant, kolory, {seed, area})` zwraca m² każdej farby i metry taśmy dla rzeczywistego metrażu, a `proExecution()` dla rodzin Kompozytora podaje poziom maskowania wyliczony z taśmy, nie z tabeli.

W Studiu wariant 1–12 to 12 najlepszych ziaren, a przycisk „Losowy wariant” (`patternSeed`) przegląda pozostałe sprawdzone ziarna, więc losowanie nigdy nie da wzoru, który nie przeszedł kontroli. Schemat projektu bez zmian.

| Rodzina | Grupa | Reguła |
|---|---|---|
| Echo (`pro-k-echo`) | premium | linie boiska powtórzone pasami: pierścienie wokół koła, obwiednie pól bramkowych |
| Strefy gry (`pro-k-zones`) | geometric | kolorem tylko strefy gry: pola bramkowe, koło, pas środkowy, pasy boczne, narożniki |
| Promienie (`pro-k-rays`) | street | wachlarze z bramek, narożników albo ze środka, z piastą chroniącą ostrza |
| Szewrony (`pro-k-chevron`) | brand | pasy V na bramki albo do środka, szerokość liczona prostopadle do pasa |
| Tor (`pro-k-flow`) | organic | wstęga pasów od bramki do bramki przez punkt środkowy |
| Płyty (`pro-k-shards`) | geometric | duże płyty Voronoi, sąsiednie zawsze w innym kolorze, opcjonalna fuga |
| Teren (`pro-k-terrain`) | organic | warstwice: jedno wzgórze w środku albo dwa naprzeciw siebie |
| Pole pikseli (`pro-k-pixel`) | play | siatka od środka boiska, wielkość albo kolor kafla płynie wg pola |

Pliki: `court-composer.mjs` (gramatyki, plan kolorów, `POOL` z ziarnami i pomiarami), `curate-composer.mjs` (kurator), `composer-report.json` (ile kandydatów, ile przeszło, powody odrzuceń), `preview-composer.mjs` → `composer-preview.png` (8 × 12), `signature-composer.json` (8 projektów KOMPOZYTOR, pierwsze w edytorze i w zakładce „Kompozytor”).

Regeneracja:

```bash
NODE_PATH=$(npm root -g) node curate-composer.mjs 220 36
node build-studio-files.mjs && node build-gallery.mjs
NODE_PATH=$(npm root -g) node preview-composer.mjs
```

Wynik 26.11 (kept/passed/candidates): Echo 36/172/220, Strefy gry 36/173/220, Promienie 36/199/220, Szewrony 36/180/220, Tor 36/158/220, Płyty 36/90/355, Teren 36/193/220, Pole pikseli 34/108/220. Sprawdzone: `tsc --strict` na `pattern-library.ts` z nowymi plikami, 69 rodzin i `PATTERN_COUNT` = 828, wszystkie presety wskazują istniejące rodziny i palety, galeria bez błędów JS i bez przewijania w bok przy 390 i 1360 px. Pełne kontrole Studia (build, test:studio, test:mobile) nie były uruchamiane w tej sesji (brak `node_modules`).

Nową rodzinę dodaje się jako funkcję gramatyki w `COMPOSER_GRAMMARS` i wpis w `COMPOSER_FAMILIES`; kurator sam ją sprawdzi. Razem 69 rodzin × 12 = 828 wzorów.

### Kompozytor II (2026-11-26)

Osiem kolejnych gramatyk w tym samym modelu, sprawdzonych tym samym kuratorem (`node curate-composer.mjs 220 36 <rodziny>` przelicza tylko wskazane rodziny, pozostałe zachowują pulę). Projekty KOMPOZYTOR II (`signature-composer-2.json`) są pierwsze w edytorze i w zakładce „Kompozytor”. Podgląd: `composer-2-preview.png` (`node preview-composer.mjs composer-2-preview.png II`). Razem 77 rodzin × 12 = 924 wzory.

| Rodzina | Grupa | Reguła | kept / passed / candidates |
|---|---|---|---|
| Koszone pasy (`pro-k-mown`) | premium | pasy w poprzek, wzdłuż, szachownica albo 45°, jak koszona murawa | 28 / 165 / 220 |
| Orbita (`pro-k-orbit`) | geometric | zagnieżdżone koła przesunięte w stronę bramek; przesunięcie < szerokość pasa | 36 / 135 / 220 |
| Łuki (`pro-k-arcs`) | street | koncentryczne łuki z narożników, linii bramkowych albo środka linii bocznych | 36 / 153 / 220 |
| Romby (`pro-k-argyle`) | brand | siatka rombów od punktu środkowego, kolor wg pierścieni, opcjonalna fuga | 32 / 131 / 220 |
| Krata (`pro-k-plaid`) | brand | pasy poziome i pionowe lustrzane względem obu osi, skrzyżowania w trzeciej farbie | 36 / 155 / 220 |
| Equalizer (`pro-k-steps`) | play | słupki od bramek do środka, wysokość schodkami | 36 / 220 / 220 |
| Rozeta (`pro-k-rosette`) | organic | pierścienie z parzystą liczbą płatków wokół koła środkowego | 36 / 161 / 220 |
| Cięcia (`pro-k-cuts`) | geometric | proste cięcia parami symetrycznymi, pola na przemian w dwóch kolorach, piasta | 36 / 90 / 372 |

Poprawki po przeglądzie: Koszone pasy zawsze mają co najmniej dwie farby na tle (wcześniej 88 kandydatów odpadało za 2 kolory); w Orbicie usunięto odmianę pionową, bo jej lustrzane odbicie tworzyło twarde cięcie na linii środkowej.
