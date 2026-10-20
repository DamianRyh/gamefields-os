# Panna Play — GF-CT-002

Źródło: Boisko Panna Kids Perfo-cicrcle 2.pdf, osiem zeskanowanych rysunków S-001–S-008. Wszystkie strony obejrzane. Osobny wariant; wcześniejsze modele Panny 6 m i boiska P-1 pozostają bez zmian.

Parametry odczytane: promień planu R2976 mm (S-002), wysokość niskich band około 550 mm i szczytów około 1516 mm (S-003). PO1 ma trzy usztywnienia i kąt około 38°. PO2 to wygięte, podwyższone przejście, PO3 nadproże nad bramką. BR1 szerokości gabarytowej 1500 mm, głębokości 450 mm, rury RO42,4×2,9. Słupki S1 o wysokości 580 mm, przekrój RK50×3 i stopa 130×80×8 mm.

Średnica wynikająca z podanego promienia to 5952 mm; R2976 opisuje linię na rzucie dokumentacji, nie potwierdzony wymiar światła wewnętrznego. Obrys podwyższeń PO2 i łuk nadproża PO3 aproksymowane, rozstawy połączeń dopasowane do zamkniętego okręgu. Przekroje przedstawione zewnętrznie; pominięto śruby, spoiny i wnętrza profili. To model wizualny, nie dokumentacja produkcyjna.

Dwanaście osobnych paneli posiada UV do grafiki i oddzielne UV perforacji. RV5-8 odwzorowano teksturą przezroczystości zamiast geometrią otworów. Segmenty górnych i dolnych profili scalone per moduł: liczba obiektów konstrukcji zmniejszona z 1012 do 172, panele nadal osobno edytowalne. Materiały ramy, paneli i bramek rozdzielone.

Pliki: `panna-kids-o1.blend`, `panna-kids-o1.glb`, render `podglad.png` i `rzut-z-gory.png`. Odtworzenie: Blender background z `build_blender.py`, następnie `optimize_blender.py`. Studio renderujące wyłączone z GLB.


## Wyrównanie profili i zamknięcie obwodu
Profile górne i dolne przebudowano jako ciągłe łukowe siatki, zamiast obracanych prostopadłościanów. Ich granice wysokości są identyczne z granicami paneli. Szczeliny kątowe na łączeniach usunięto, wysokości na styku PO2/PO3 wyrównano do 1416 mm, słupki niskie skrócono do 550 mm. Zachowano otwory bramek. Sprawdzenie `check_profiles.py` potwierdza wszystkie wierzchołki profili obwodowych w obrysie paneli i pełne pokrycie 360°. Poprzednie pliki w `before-flush-profiles/`. Odtwarzanie aktualnej wersji wymaga tylko build_blender.py; optymalizacja nie jest już potrzebna.

## Obowiązująca nazwa

Panna Play (GF-CT-002), zatwierdzona 20.10.2026. Dawna nazwa: Panna Kids O-1. Kody części, nazwy źródłowych plików i adresy pozostają stałe. Aktualne nazwy i aliasy: ../../docs/PRODUCT_NAMES.md. Historyczne opisy poniżej zachowują odniesienia do źródeł.
