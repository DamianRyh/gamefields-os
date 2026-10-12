# Gamefields Modular Geometry Engine v1.0

## Cel

Zbudować warstwę konfiguratora podobną do logiki produktów modułowych: użytkownik zmienia wymiar, a system nie rozciąga konstrukcji, tylko dodaje albo usuwa rzeczywiste moduły produkcyjne.

## Zasada nadrzędna

`wymiar docelowy -> snap do systemu modułowego -> liczba segmentów -> geometria -> BOM -> Engineering -> koszt -> 3D`

Istniejące moduły Gamefields pozostają bez zmian. Ten silnik jest warstwą addytywną pomiędzy Builderem/Studio a Engineering.

## v1.0

- stały moduł bazowy 1.5 m dla pierwszego prototypu,
- prostokątne boiska 3v3/custom,
- okrągłe klatki Panna jako regularny wielokąt z identycznych cięciw,
- snap wymiarów zamiast skalowania paneli,
- jawna liczba paneli i słupów,
- pozycja i orientacja każdego modułu,
- API `/api/engineering/modular`,
- podgląd `/engineering/modular`.

## Ważne ograniczenie Panna

Generator kołowy jest obecnie ogólnym systemem modularnym. Nie należy przedstawiać go jako finalnej geometrii produktu Panna Gamefields 1:1. Finalna geometria wymaga przeniesienia rzeczywistego układu bramek, wejść, podpór i wymiarów produktu użytkownika.

## Następne kroki

1. Moduły specjalne: bramka, wejście, narożnik, panel brandingowy.
2. Reguły symetrii i pozycjonowania bramek/wejść.
3. Adapter `ModularLayout -> StructuralModel`.
4. BOM liczony bezpośrednio z modułów.
5. Model 3D z instancjonowanych komponentów GLB/mesh zamiast skalowania bryły.
6. Aktualizacja kosztu na żywo przy każdej zmianie modułu.
7. Biblioteka systemów: 3v3, 1v1, Panna Circle, Panna Kids, 5m i kolejne konstrukcje.
