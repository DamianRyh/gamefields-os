# Panna Octa R3

W każdej bramce usunięto dwa boczne profile poziome na wysokości osi 391 mm. Wyjściowa scena R2 i model źródłowy pozostają w poprzednich katalogach. Edytowalna scena R3 ma osobno wydzieloną nawierzchnię. Eksporty GLB konstrukcji oraz banera jej nie zawierają.

`build.py` odtwarza scenę, eksporty i podglądy z R2 oraz wersję JSON dla Studio. `build_module.py` przyjmuje pierwotny moduł Studio `oct-goal.glb` po separatorze `--`. Raport `verification.json` zawiera zakres zmian i sumy kontrolne eksportów.
