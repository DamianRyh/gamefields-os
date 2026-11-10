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
