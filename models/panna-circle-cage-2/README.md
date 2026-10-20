# Panna Cage 180 — GF-CT-006

Model złożony według rysunku Boisko 03-H, PNG0005-00-00-000 (28.11.2023) oraz 39 rysunków komponentów z lutego 2024, przekazanych w folderze Google Drive. Manifest zachowuje identyfikatory źródeł; oryginały PDF pozostają lokalnie w sources/.

## Model

Arena o średnicy wewnętrznej 6 m i wysokości 1,8 m. Dwa poziomy po 90 cm: 12 zwykłych paneli siatkowych, 2 bramkowe naprzeciw siebie i 2 z wycięciem, zestawione pionowo w jedno wejście (górny odwrócony). Układ w 8 sektorach po 45°. Osobna neutralna warstwa nawierzchni 20 cm służy jako baza konfiguratora; nie jest częścią rysunków konstrukcji. Brak domyślnych napisów i linii.

Materiały ram, siatki i bramek można zmieniać niezależnie. Profile mają przekrój nominalny 40 × 60 × 3 mm, drut siatki Ø3 mm. Rozstaw siatki 50 mm przyjęto wizualnie. Pominięto drobne otwory, tuleje i spoiny. Starszy rysunek złożeniowy podaje tył bramki 472 mm, nowszy detal Panel 02 — 315 mm; przyjęto nowszy detal. Gabaryt długości 6722,51 mm z rysunku złożeniowego służy rozmieszczeniu koszy bramek.

## Pliki i odtworzenie

- panna-circle-cage-2.blend — edytowalna arena w metrach.
- panna-circle-cage-2.glb — eksport webowy.
- studio-mesh.json — geometria dla istniejącego renderera Studio (Y do góry).
- podglad.png — render całej areny.
- validation.json — zestawienie modułów, założenia oraz sumy SHA-256.

Uruchom build_components.py w pustej scenie Blendera; otwórz zapisane panna-circle-cage-2-moduly.blend i uruchom build_arena.py. Render: otwórz końcowy model i uruchom render_arena.py. Generatory czyszczą bieżącą scenę swojego procesu, nie oryginalne dokumenty.

## Studio

Model dodany do wspólnego wyboru istniejącego Gamefields Studio jako circle-cage-2. Używa tych samych wzorów, palet, ustawień nawierzchni, kolorów konstrukcji, kamer i eksportu/importu JSON. Nie tworzy osobnego konfiguratora ani strony produktu. Link do wejścia w edycję: https://gamefields-studio.ryhfs90.chatgpt.site/?arena=circle-cage-2

## Obowiązująca nazwa

Panna Cage 180 (GF-CT-006), zatwierdzona 20.10.2026. Dawna nazwa: Panna Circle Cage 2.0. Kody części, nazwy źródłowych plików i adresy pozostają stałe. Aktualne nazwy i aliasy: ../../docs/PRODUCT_NAMES.md. Historyczne opisy poniżej zachowują odniesienia do źródeł.
