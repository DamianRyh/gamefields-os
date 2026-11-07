# Panna Octa · GF-CT-008 · R2

Punktem wyjścia jest `../octagon.blend`. Zachowano układ ośmiu modułów i nominalne wymiary konstrukcji. Wygładzono krawędzie profili, poprawiono normalne i ustawiono materiały lakieru proszkowego. Rama, wypełnienie i bramki mają niezależne materiały. W Blenderze nawierzchnia jest w osobnej kolekcji i można ją włączyć w Outlinerze.

- `panna-octa-r2.blend` to edytowalna scena z ustawioną kamerą i światłem.
- `gamefields-panna-octa-hero.glb` zawiera samą konstrukcję. Używa kompresji Draco, obsługiwanej przez model-viewer banera.
- `gamefields-panna-octa-r2.glb` to odpowiednik bez kompresji geometrii do loadera Studio. Odtwarza go generator.
- `gamefields-panna-octa-surface.glb` to osobna płyta z UV.
- `gamefields-panna-octa-r2.webp` to przezroczysty obraz zastępczy konstrukcji.

Generowanie przez Blender 3.6: `blender --background --factory-startup --python-exit-code 1 --python build.py`. Opcja `-- --export-only` pomija render PNG. Następnie `python3 verify.py` sprawdza nazwy, materiały, UV, normalne, obrysy i rozdzielenie plików. Baner ładuje wyłącznie plik hero i obraz zastępczy. Edytor zachowuje osobną płytę jako warstwę projektową.
