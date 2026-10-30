# Panna Cage 90 — C90-CAD-2

Jedna baza CAD → Blender → Studio i podgląd produktu. Model wizualny oparty na rysunkach właściciela, nie dokumentacja wykonawcza.

## Zawartość

- `panna-cage-90-v2.FCStd`: trzy natywne szablony BRep i osiem modułów montażowych (5 standardowych, 2 bramkowe, 1 wejściowy).
- `panna-cage-90-v2.step`: rzeczywista geometria bryłowa do wymiany CAD, jednostki mm.
- `panna-cage-90-v2.blend`: edytowalna szczegółowa konstrukcja, osobna kolekcja nawierzchni i światła/kamera produktu.
- `panna-cage-90-v2.glb`: konstrukcja do sieci, metry, 346 762 trójkąty, grupy rama/siatka/bramki.
- `panna-cage-90-surface-20cm.glb`: osobna, zachowana nawierzchnia 20 cm.
- `source-surface.json`: utrwalony pierwotny kształt nawierzchni do odtwarzalnego eksportu.
- `cad-validation.json`, `web-validation.json`: źródła, założenia, wymiary, skróty i pomiary eksportu.

Wewnętrzna średnica 6 m, wysokość 0,9 m, zewnętrzna średnica ramy 6,12 m; całkowity obrys z bramkami 6,72251 m. Panele z rzeczywistych prętów Ø3 mm, profile nominalnie 40×60×3 mm. Jest to rodzina siatkowa, a nie blacha perforowana Play/Court. Rozstaw siatki 50 mm i promienie naroży profili 1,2 mm są założeniami wizualnymi; brak podstaw do określenia kotew lub fundamentów. Różnice rysunków i interpretacje zapisano w walidacji CAD.

## Odtworzenie

1. W Pythonie FreeCAD 1.1.4 uruchom `build_cad.py` (w razie potrzeby dostosuj ścieżkę biblioteki FreeCAD i lokalizację źródłowych PDF na końcu skryptu). Powstają również ignorowane `cad-parts.json` i `web-parts.json`.
2. Blender 3.6: `blender --background --factory-startup --python build_blender.py`; `CAGE_SKIP_RENDER=1` pomija render.
3. `python3 verify_model.py` sprawdza finitość atrybutów, obrys, indeksy, liczbę trójkątów i niezmienioną nawierzchnię. `--stage` kopiuje wyłącznie Cage 90 do `public/arenas` w checkout Studio.
4. `blender --background --python render_product.py` odtwarza trzy widoki z zapisanego mastera.
5. W Studio: `node scripts/build-arena-geometry.mjs`, `node scripts/build-carousel-models.mjs`, build oraz `node scripts/build-cage90-goal-thumbnails.mjs`.

Nowy model jest używany w zwykłym Studio i `/product-viewer`. Rozbudowa modułowa rodziny F05 korzysta nadal z dotychczasowego wspólnego katalogu; Cage 180 nie został w tej rewizji przebudowany. Modele innych produktów i ceny pozostają poza zakresem.
