# Panna Circle Cage 1.0

Model według rysunku złożeniowego Boisko 03 (28.11.2023) i tych samych 39 szczegółowych rysunków modułów z lutego 2024 co Panna Circle Cage 2.0. Oryginał złożenia pozostaje lokalnie w sources/; wspólne detale w ../panna-circle-cage-2/sources/. Manifest zachowuje źródła.

Średnica wewnętrzna 6 m, wysokość 0,9 m, długość z koszami bramek 6722,51 mm. Osiem sektorów 45°: pięć Panel 01, dwa Panel 02 naprzeciw siebie i jeden Panel 03 z wycięciem wejściowym. Nawierzchnia jest osobnym obiektem o grubości 20 cm, dodanym na potrzeby Studio. Brak domyślnych linii i napisów. Materiały ramy, siatki i bramek są niezależne.

Profile nominalne 40 × 60 × 3 mm, drut Ø3 mm. Rozstaw siatki 50 mm przyjęto wizualnie; drobne tuleje, otwory i spoiny pominięto. Szerokość wycięcia wejściowego przyjęto z nowszego detalu Panel 03: 575 mm; starsze złożenie wskazuje 601 mm. Tył bramki ma 315 mm według detalu Panel 02. Jest to model koncepcyjny do konfiguracji, a nie dokumentacja warsztatowa.

## Odtworzenie

W pustym procesie Blender uruchom build_components.py. Otwórz zapisane panna-circle-cage-1-moduly.blend i uruchom build_arena.py. Otwórz końcowy panna-circle-cage-1.blend i uruchom render_arena.py, aby uzyskać podglad.png. Generatory zastępują scenę własnego procesu, nie źródłowe dokumenty.

Pliki: edytowalny .blend, webowy .glb, studio-mesh.json (Y do góry), podglad.png oraz validation.json z liczbą modułów i sumami SHA-256.

## Studio

Produkt circle-cage-1 korzysta ze wspólnego wyboru modeli, kolorów, wzorów, grafik, nawierzchni, linii, kamer i importu/eksportu projektu. Nie tworzy nowej podstrony ani konfiguratora.
https://www.gamefields.eu/konfigurator-boisk/?arena=circle-cage-1
