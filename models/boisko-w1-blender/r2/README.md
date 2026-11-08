# Panna Ring · GF-CT-001 · R2

Źródło: rysunki W-001–W-006, „Boisko W-1”, styczeń 2012. Model przedstawia sześć RW1 i dwa RW2 oraz dwie bramki BR2. Podwójne poszycie 2 mm z perforacją RV5-8 ma oddzielne mapowanie dla perforacji i grafik. Łączniki E1, stopy ST1 oraz ocynkowane śruby M8 są osobnymi częściami. Bramki zachowują profile Ø42,4 mm, obłe pałąki, dwie stopy i trzy poprzeczki.

Wymiary wieńca 5,09 m na zewnątrz i 4,99 m wewnątrz pochodzą z W-002. Zachowano wysokość wizualizacji 1 m i ciągły podział na 45°, zgodnie z poprzednim modelem. Rysunki detali podają promienie większe o 5 mm i wysokość montażową 1005 mm. Położenie otworów, spoiny i prześwity montażowe wymagają uzgodnienia dla wersji wykonawczej.

`blender --background --factory-startup --python-exit-code 1 --python build.py` tworzy scenę Blender, model GLB i obrazy. `python3 verify.py` sprawdza role materiałów, geometrię wieńca, wysokości i maskę perforacji. `panna-ring.glb` to skompresowana konstrukcja bez podłoża do banera. Model edytowalny ma nazwę `panna-ring-r2.blend`.
