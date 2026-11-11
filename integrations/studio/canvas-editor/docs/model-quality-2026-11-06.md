# Modele 3D — aktualizacja prezentacji i eksportu web

Zakres: istniejące Studio, siedem aktualnych konstrukcji, koszulka i piłka. Bez zmiany wymiarów, źródeł CAD, liczby paneli i modeli w ofercie.

## Wyniki statyczne
- Panna Court: JSON 22 371 799 B → GLB 9 324 620 B (58,3% mniej). 142 części, 113 961 trójkątów, te same ID, grupy, UV, normalne i kolejność ścian. Float32 z tolerancją pozycji < 1e-6 m; eksport powtarzalny przez scripts/export-p1-web.py.
- Bufory geometrii GPU P1: 10 940 256 → 9 206 262 B.
- Cage 90: 33 289 152 → 10 147 548 B; Cage 180: 56 955 072 → 17 526 828 B. Liczby trójkątów zachowane. To redukcja powielonych wierzchołków w buforze, nie redukcja dokładności CAD ani pomiar FPS.

## Wygląd i zgodność
Rozszerzono istniejący ProductRenderer na Grid, Octa i Street Arena 15. NeutralToneMapping ogranicza przesunięcia barw; lakier ma niemetaliczny model materiału, odsłonięty metal ma osobne parametry. Zachowano istniejące światło otoczenia, cienie, perforację i mapy nawierzchni. Koszulka i piłka otrzymały powtarzalną mikrofakturę, niezależną od nadruku, oraz wspólne neutralne światło. Piłka zachowuje 32 panele; wariant PBR w rdzeniu jest opcjonalny, zachowując pierwotne zachowanie innych odbiorców.

Desktop rezerwuje przestrzeń obok obecnego inspektora; mobilny układ nie został zastąpiony. Stare projekty i import JSON zachowują swoje parametry. Pliki Blender/CAD pozostają autorytatywne i nie zostały nadpisane.

## Dowody
- outputs/model-improvements/geometry-check.json i cage-gpu-check.json — statyczna zgodność i bajty GPU.
- outputs/model-improvements/p1-comparison.jpg — kontrolowane ujęcia przed/po, ten sam model, kolory, kadr 1100×720; po bokach neutralny materiał i zachowana geometria.
- tests/product-geometry.mjs — roundtrip i ostre krawędzie.
- tests/model-presentation.mjs — PBR, niepusty WebGL, kadr obok panelu i szerokości desktop/mobile.
- tests/studio-kit.mjs, studio-product-entry.mjs, studio-mobile-goals.mjs — personalizacja, zapis/odczyt i dotychczasowe narzędzia. Test zapisu koszulki czeka na potwierdzenie zapisu zamiast stałego opóźnienia 1 s.

Kolejne prace modelarskie: pełne LOD siatek, rzeczywisty krój dziecięcy i dodatkowe detale zgodne z szablonami producenta. Wymagają dalszego porównania źródeł; nie są skutkiem obecnej indeksacji i materiałów.

Kontrola przeglądarkowa modeli P1, Grid, Octa, Street15 i Cage180 (1440 px) oraz P1 (390 px): PASS, niepusty WebGL, PBR i bufor indeksowany, kadr obok inspektora bez poziomego przepełnienia. Testy użyły akceleracji Metal na Macu; tryb programowy SwiftShader pozostaje domyślny i można go wybrać przez GF_TEST_ANGLE. W tle inna kopia repozytorium prowadziła niezależny test programowy. Nie porównujemy FPS między tymi trybami.

Końcowe testy personalizacji koszulki (390/1440), plakat/piłka i importy (390/1487) oraz pełny test mobilny konstrukcji/nawierzchni/Radar (375/390/430/1440): PASS. Przy zapisie po Cofnij test czeka na obecność oczekiwanego składu w rzeczywistym szkicu localStorage, a nie na potencjalnie poprzedni komunikat statusu.
