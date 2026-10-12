# Gamefields Modular Geometry Engine v1.0

## Cel

Zbudować warstwę konfiguratora podobną do logiki produktów modułowych: użytkownik zmienia wymiar, a system nie rozciąga konstrukcji, tylko dodaje albo usuwa rzeczywiste moduły produkcyjne.

## Zasada nadrzędna

`wymiar docelowy -> snap do systemu modułowego -> liczba segmentów -> geometria -> StructuralModel -> BOM/Engineering -> koszt -> instancje 3D`

Istniejące moduły Gamefields pozostają bez zmian. Ten silnik jest warstwą addytywną pomiędzy Builderem/Studio a Engineering.

## v1.0

- stały moduł bazowy 1.5 m dla pierwszego prototypu,
- prostokątne boiska 3v3/custom,
- okrągłe klatki Panna jako regularny wielokąt z identycznych cięciw,
- snap wymiarów zamiast skalowania paneli,
- jawna liczba paneli i słupów,
- pozycja i orientacja każdego modułu,
- adapter `ModularLayout -> StructuralModel`,
- manifest instancji 3D `GF-MODULAR-3D-1.0`,
- każdy panel i słup jako osobna instancja 3D zamiast skalowania całego boiska,
- stabilne `assetKey` pod późniejsze modele GLB/mesh,
- API `/api/engineering/modular` zwracające `layout`, `structuralModel` i `scene3d`,
- podgląd `/engineering/modular`.

## Ważne ograniczenie Panna

Generator kołowy jest obecnie ogólnym systemem modularnym. Nie należy przedstawiać go jako finalnej geometrii produktu Panna Gamefields 1:1. Finalna geometria wymaga przeniesienia rzeczywistego układu bramek, wejść, podpór i wymiarów produktu użytkownika.

## Następne kroki

1. Moduły specjalne: bramka, wejście, narożnik, panel brandingowy.
2. Reguły symetrii i pozycjonowania bramek/wejść.
3. BOM liczony bezpośrednio z modułów i reconciliacja z StructuralModel.
4. Podpięcie `scene3d` do realnego viewer'a WebGL/Three.js i modeli GLB.
5. Aktualizacja kosztu na żywo przy każdej zmianie modułu.
6. Iteracyjne przeliczenie Engineering po każdej zmianie liczby modułów.
7. Biblioteka systemów: 3v3, 1v1, Panna Circle, Panna Kids, 5m i kolejne konstrukcje.
