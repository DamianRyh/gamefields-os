# Niezależne nawierzchnie sportowe — 24.10.2026

Osiem zatwierdzonych przez właściciela formatów oddzielono od katalogu konstrukcji. `Project.surfaceModel` jest opcjonalny: stare projekty bez tego pola zachowują oryginalną geometrię. Nowy projekt rozpoczyna się od Street Football 3×3. W panelu Nawierzchnia dostępny jest osobny wybór ośmiu nawierzchni z miniaturami. Konstrukcja skupia wybór stalowych modeli, ich kolory i rozbudowę. Nawierzchnia zachowuje wzór, grafikę i własną nazwę; wybór nowego formatu odłącza konstrukcję i można go cofnąć.

| Format | Pole gry (m) | Cała płyta (m) |
|---|---|---|
| Street Football 3×3 | 15 × 10 | 15 × 10 |
| Koszykówka 3×3 | 15 × 11 | 18 × 14 |
| Koszykówka | 28 × 15 | 32 × 19 |
| Tenis | 23,77 × 10,97 | 36,57 × 18,29 |
| Padel | 20 × 10 | 20 × 10 |
| Siatkówka | 18 × 9 | 24 × 15 |
| Pickleball | 13,4112 × 6,096 | 18,288 × 9,144 |
| Futsal | 40 × 20 | 44 × 24 |

Wszystkie płyty mają 20 cm grubości, osobną górę z UV oraz neutralne krawędzie. Blender: osiem scen, po jednym obiekcie na scenę. Każdy GLB zawiera wyłącznie jedną nawierzchnię; JSON runtime ma dwa meshe (góra / korpus). Linie i grafiki są nakładane w Studio, pozostają osobno od neutralnego modelu GLB. Wspólna geometria oznaczeń obsługuje plan i model 3D. Modele koncepcyjne nie określają technologii warstw, podbudowy, kotew, homologacji ani wykonawczego schematu znakowania.

## Zgodność konstrukcji

Tylko Street Football 3×3 ma obecnie dedykowaną istniejącą konstrukcję Street Arena 15. Jedno kliknięcie dołącza same elementy konstrukcji bez jej starej murawy i fundamentu wizualnego. Odłączenie zachowuje format, kolory i grafiki nawierzchni. Pozostałe siedem formatów jawnie wskazuje brak dedykowanej konstrukcji; nie skalujemy prawdziwych części do obcego obrysu. Wybór innego kompletnego boiska przełącza do jego dotychczasowego modelu. Dotychczasowe rodziny modułowe działają jak wcześniej; moduły nie skalują stałego formatu sportowego.

## Dane i cena

Schemat odrzuca niezgodne wymiary, sport, kształt, obcą konstrukcję i parametry modułowe przy surfaceModel. Ilość materiału wynika z całej płyty, także po dołączeniu konstrukcji (SF 150 m²). Sama płyta nie otrzymuje ceny konstrukcji/montażu lub wykończenia band. Koszty produkcji i marża pozostają po stronie serwera. Model 20 cm nie jest pozycją wykonawczą podbudowy w kalkulacji.

Rewizja wariantu obejmuje format, mesh i ewentualne źródło konstrukcji; specyfikacja zawiera identyfikator nawierzchni, grubość, pole gry i podłoże. Pełne JSON i kopie odzyskiwania zachowują pole surfaceModel.

## Źródła i ograniczenia

Źródła poszczególnych wymiarów są zapisane w public/sport-surfaces/catalog.json: archiwum Gamefields; FIBA (3×3 i pełne), LTA (tenis), FIP (padel), FIVB (siatkówka), USA Pickleball, FA (wybiegi futsalu). Wybór jest koncepcyjny: 3 m strefy siatkówki to wariant podstawowy, a zawody FIVB wymagają większego obszaru; pickleball wykorzystuje minimalne 60 × 30 ft, nowe obiekty/turnieje mogą wymagać większego. Padel obejmuje pole wewnętrzne, bez szklanej obudowy i zewnętrznych stref. Archiwalny materiał trawy 60 mm nie jest zatwierdzoną specyfikacją materiałową padla; finalna technologia wymaga doboru. Street Football nie otrzymał fikcyjnego wybiegu ani deklaracji normowej.

Odtworzenie: Blender `-b --python scripts/build-sport-surfaces.py`, następnie `node scripts/build-sport-surface-thumbnails.mjs`. Hashe modeli w manifest.json; rewizje układów w lib/sport-surface-revisions.json. Testy: tests/sport-surfaces.mjs, tests/sport-surfaces-browser.mjs, obowiązujące test:studio / test:mobile i TypeScript.
