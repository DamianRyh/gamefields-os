# Street Arena 15 · GF-CT-004 · R2

Model koncepcyjny Studio. Nowa rama z zaokrąglonymi profilami, żebrami, ukośnymi wzmocnieniami, stopami i obłymi koszami bramek nawiązuje do rodziny Panna. Wypełnienie, rama i bramki mają osobne grupy. Podział 24 paneli, ich identyfikatory, pole 15 × 10 m, ścięcia narożników, nominalna wysokość band 1 m i współrzędne nawierzchni pochodzą z poprzedniego modelu.

Płyta jest osobną kolekcją, a krawędź 65 mm służy wizualizacji. Obwiednia konstrukcji z bramkami i stopami to około 16,65 × 10,20 m. GLB zawiera samą konstrukcję. Przekroje i detale połączeń modelują wygląd koncepcji.

Wygeneruj pliki poleceniem `blender --background --factory-startup --python-exit-code 1 --python build.py` i uruchom `python3 verify.py`. Generator korzysta z `../studio-mesh.json`. Zweryfikowany plik `street15-r2.json` trafia do `public/arenas`. Generatory obwiedni, rewizji powierzchni i karuzeli Studio aktualizują odpowiednio pomiary, metadane projektów i model wyboru.
