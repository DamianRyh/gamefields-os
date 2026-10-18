# Dokumentacja Gamefields

Punkt wejścia do dokumentacji. Stan bieżący weryfikujemy w `PROJECT_STATUS.md`; dokumenty wersji opisują zakres prac, a nie potwierdzenie publikacji.

## Dokumenty bieżące

| Pytanie | Dokument |
| --- | --- |
| Co działa, co wymaga dostępu? | [PROJECT_STATUS.md](PROJECT_STATUS.md) |
| Gdzie są dane i kto nimi zarządza? | [DATA-MAP.md](DATA-MAP.md) |
| Jak rozwijać, zabezpieczyć i publikować projekt? | [OPERATIONS.md](OPERATIONS.md) |
| Co robimy w następnej kolejności? | [BACKLOG.md](BACKLOG.md) |
| Jakich obszarów produktu mamy pilnować? | [GAMEFIELDS-PRODUCT-CONTINUITY.md](GAMEFIELDS-PRODUCT-CONTINUITY.md) |

[Spis 43 gałęzi i ich relacji do main](audits/2026-10-18-github.md) — datowany wynik inwentaryzacji, nie lista poleceń usunięcia.

## Instrukcje i specyfikacje modułów

- PLAY: [publikacja i testy](PLAY_RELEASE.md), [specyfikacja sezonów](PLAY_SEASONS_SPEC.md).
- Court Objects: [moduł](COURT_OBJECTS.md), [instalacja WordPress](../integrations/wordpress/court-objects/README.md).
- Integracja Studio/PLAY z WordPressem: [instrukcja](../integrations/wordpress/README.md). Rozszerzenie `/studio` jest lokalną, nieopublikowaną zmianą.
- Engineering: [wprowadzenie](gamefields-engineering.md), [v0.1](gamefields-engineering-v01.md), [Eurocode](gamefields-engineering-v06-eurocode.md), [stabilność](gamefields-engineering-v07-stability.md), [połączenia i fundamenty](gamefields-engineering-v08.md), [optymalizator](gamefields-engineering-v09-automatic-optimizer.md).
- Modular: [geometria modułowa](gamefields-modular-geometry-v10.md).
- Oferty: [podgląd propozycji](PROPOSAL-PREVIEW.md).

## Materiały historyczne

- [Status z 04.10.2026](archive/2026-10-04/PROJECT_STATUS.md) i [ówczesny backlog](archive/2026-10-04/BACKLOG.md) — zachowane przed aktualizacją.
- [Poprzedni README](archive/README-before-2026-10-18.md).
- [Prototyp Studio v0.1](prototype-v0.1.md) — opis pierwotnej iteracji.
- `README-preview-note.txt` — historyczna notatka podglądu, nie instrukcja produkcyjna.

Nie usuwamy specyfikacji wersji tylko dlatego, że pojawiła się nowsza. Nie traktujemy nazwy gałęzi, zielonego CI ani starej notatki jako dowodu aktualnego wdrożenia.
