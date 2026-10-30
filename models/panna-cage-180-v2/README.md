# Panna Cage 180 — C180-CAD-2

Złożenie CAD → Blender → GLB oparte na szablonach Cage 90 CAD r2 oraz rysunku Boisko 03-H (PNG0005-00-00-000). Wysokość 1,8 m powstaje z dwóch poziomów po 0,9 m: 12 paneli standardowych, 2 bramkowe na dole i 2 wejściowe w sektorze 2. Górny panel wejściowy jest odwrócony pionowo. Bramki wychodzą na zewnątrz. Średnica wewnętrzna 6 m; gabaryt z bramkami 6,72251 m.

## Pliki

- `panna-cage-180-v2.FCStd` i `.step`: prawdziwe bryły CAD, jednostki mm.
- `panna-cage-180-v2.blend`: szczegółowa edytowalna konstrukcja jako instancje modułów, osobna nawierzchnia i studyjny zestaw świateł/kamery.
- `panna-cage-180-v2.glb`: samodzielna konstrukcja do internetu, metry, oddzielne grupy rama/siatka/bramki, zachowane gładkie normalne.
- `panna-cage-180-surface-20cm.glb`: niezmieniona osobna nawierzchnia 20 cm.
- `studio-mesh.json`: pomocniczy indeks geometrii; współrzędne zaokrąglone do 0,1 mm, bez powielania normalnych GLB.
- `cad-validation.json`, `web-validation.json`: źródła, założenia i niezależne sprawdzenie eksportów.

Są to modele wizualne na podstawie dokumentacji właściciela. Siatka Ø3 mm ma rozstaw 50 mm przyjęty wizualnie; promień naroży profili 1,2 mm pozostaje założeniem prezentacyjnym. Tył bramki ma 315 mm według nowszego detalu Panel 02 zamiast 472 mm na starszym rysunku złożeniowym, tak samo jak Cage 90. Nie wprowadzono domyślnych napisów ani fikcyjnych kotew/fundamentów.

## Odtworzenie

1. Zachowaj obok katalog `../panna-cage-90-v2` z jego FCStd i walidacją. `build_cad.py` uruchom w Pythonie FreeCAD 1.1.4; ścieżkę oryginalnego Boisko 03-H.pdf dopasuj do lokalnego archiwum. Źródłowe pliki pozostają niezmienione.
2. Blender 3.6: `CAGE_SKIP_RENDER=1 blender --background --factory-startup --python build_blender.py`.
3. `python3 verify_model.py`; `--stage` kopiuje wyłącznie Cage 180 do istniejącego checkout Studio.
4. `blender --background --python render_product.py` — neutralny render, kolor i detal bramki.
5. W Studio odtwórz katalog geometrii i karuzelę, wykonaj build oraz `scripts/build-cage180-goal-thumbnails.mjs`.

Ta rewizja ujednolica model bazowy i podgląd produktu. Wspólna rodzina rozbudowy modułowej F05 pozostaje oddzielnym zadaniem; nie jest automatycznie certyfikowana ani przebudowana przez ten eksport.
