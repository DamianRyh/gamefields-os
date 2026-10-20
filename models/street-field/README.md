# Panna Grid — GF-CT-007

Model koncepcyjny według Boisko 02 (1).pdf, 09.09.2023, i detali z folderu Street Field. Użytkownik wybrał pole 6,214 × 4,648 m z załącznika i dopasowanie szerokości paneli, ponieważ późniejsze detale z 16–18.09.2023 pokazują panele 2 m, które nie mieszczą się w tym obrysie w podanej liczbie.

## Wymiary i układ

Pole wewnętrzne 6214 × 4648 mm; obrys podstaw 6550 × 4984 mm; długość z bramkami 7024 mm; wysokość słupów 1091 mm. Układ: 11 zwykłych paneli, 1 panel wejściowy z progiem i 2 bramkowe, 14 słupów. Osobna warstwa nawierzchni 7,30 × 5,30 m, grubości 20 cm jest dodatkiem Studio, nie częścią dokumentacji stalowej. Podłoże obejmuje słupy i kosze bramek z zapasem, przy zachowaniu pola gry 6,214 × 4,648 m. Brak domyślnych napisów i linii.

Rozmieszczenie słupów odtworzono z obrysu podstaw 140 × 140 mm, a ramy od wewnętrznego obrysu boiska. Szerokości paneli są dostosowane do tych wymiarów (około 1492,5 / 1504,67 mm); rozmieszczenie łączników uproszczone. Zachowano nominalne przekroje ram 50 × 30 × 3 mm, wypełnienia 25 × 25 × 2 mm i słupów 80 × 80 × 3 mm. Kosze bramek mają światło 1000 × 600 mm; konstrukcja wejścia pozostawia próg według rysunku. Otwory, śruby i spoiny pominięto. Model nie zastępuje dokumentacji warsztatowej, szczególnie po adaptacji szerokości modułów.

## Odtworzenie i pliki

W osobnym procesie Blender uruchom build_arena.py: tworzy street-field.blend, street-field.glb, studio-mesh.json i validation.json z sumami SHA-256. Otwórz gotowy .blend i uruchom render_arena.py, aby zapisać podglad.png. Generator zastępuje scenę tylko własnego procesu. Oryginały PDF pozostają w lokalnym sources/, identyfikatory źródeł w source-manifest.json, decyzja o adaptacji w source-review.json.

Materiały ramy, wypełnienia i bramek są niezależne. Nawierzchnia ma osobny obiekt z UV. Studio używa osi Y do góry i wspólnych narzędzi kolorów, nawierzchni, wzorów, grafik, linii, kamer oraz projektu JSON. Produkt dodany do istniejącego wyboru, bez nowej strony.

https://www.gamefields.eu/konfigurator-boisk/?arena=street-field

## Obowiązująca nazwa

Panna Grid (GF-CT-007), zatwierdzona 20.10.2026. Dawna nazwa: Street Field. Kody części, nazwy źródłowych plików i adresy pozostają stałe. Aktualne nazwy i aliasy: ../../docs/PRODUCT_NAMES.md. Historyczne opisy poniżej zachowują odniesienia do źródeł.
