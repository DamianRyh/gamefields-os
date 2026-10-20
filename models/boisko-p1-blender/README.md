# Panna Court — GF-CT-003

Zbudowano lokalnie w Blenderze 3.6.5 na podstawie rysunków K-001–K-010 z dokumentacji PANEL K 1.pdf. PANEL K 1 2.pdf jest identycznym plikiem (zgodne SHA-1). Model oddzielny od wcześniejszego prototypu, bez wdrożenia do Studio.

## Wymiary odczytane
- Rysunek K-002: nominalny gabaryt 7139 × 5573 mm.
- K-005: moduł K1 2010 × 555 mm, trzy moduły na każdym boku; rozstawy stiffenerów około 500 mm.
- K-006: narożnik K2 500 × 555 mm.
- K-007–K-009: końce K3L/K3P i nadproże K4, łuk R4216; K4 szerokości 1400 mm.
- K-010: słupki boczne wysokości 580 mm, przekrój RK50×3, stopa 130 × 80 × 8 mm.
- K-003: maksymalny wymiar pionowy 1224 mm przy końcach.
- K-004: bramka BR1 szerokości 1500 mm, głębokości gabarytowej 450 mm, trzy rury RO42,4×2,9 z krótkimi łącznikami; wysokości i wysunięcia rur według rzutu bocznego.

## Zastosowanie i uproszczenia
To edytowalny model wizualny do konfiguratora, nie CAD produkcyjny. Panele mają blachę 2 mm i oddzielne UV do brandingu oraz perforacji RV5-8. Otwory perforacji reprezentuje niewielka tekstura alpha, dzięki czemu model nie zawiera setek tysięcy otworów geometrycznych. Profile i bramki pozostają osobnymi obiektami; ich materiały można niezależnie zmieniać.

Przekroje profili reprezentowane zewnętrznie; pominięto wnętrza profili, spoiny i śruby. Złącza narożne i ich przesunięcia dopasowano wizualnie do nominalnego obrysu, zamiast odtwarzać dokładną geometrię uchwytów z rysunku. Gabaryt nominalny opisany w metadanych nie jest tolerancją wykonawczą. Geometryczny rozstaw osi rur BR1 to 1450 mm; zewnętrzny wymiar rury i płytek wymaga sprawdzenia w CAD przed produkcją.

`boisko-p1.blend`: źródło, kolekcje K1/K2/K3/K4/BR1/słupki i oddzielne studio.
`boisko-p1.glb`: eksport samej konstrukcji, materiały i tekstura osadzone.
`podglad.png`, `rzut-z-gory.png`: renderowane podglądy.
`build_blender.py`: odtwarzalny generator; `finish_blender.py`: ustawienie widoku edycji i poprawny rzut z góry.

## Obowiązująca nazwa

Panna Court (GF-CT-003), zatwierdzona 20.10.2026. Dawna nazwa: P-1. Kody części, nazwy źródłowych plików i adresy pozostają stałe. Aktualne nazwy i aliasy: ../../docs/PRODUCT_NAMES.md. Historyczne opisy poniżej zachowują odniesienia do źródeł.
