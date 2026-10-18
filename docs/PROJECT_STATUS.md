# Aktualny stan Gamefields

Zweryfikowano: 18.10.2026. Zakres: lokalny kod, metadane GitHub, publiczne HTTP/API oraz status środowiska Codexa. Brak administracyjnego dostępu do WP, hostingu i danych produkcyjnej bazy.

## Repozytorium

- Repo: `https://github.com/DamianRyh/gamefields-os`, publiczne, domyślna gałąź `main`.
- `main` i początek bieżącej pracy: `e102f142376570b159dca280684d8279b3d3dc12` (po scaleniu PR #40).
- Przed gałęzią porządkową: 43 gałęzie zdalne. 23 końcówki są przodkami `main`, bez otwartego PR; 19 nie jest przodkami i wymaga oceny. Nie usunięto żadnej gałęzi.
- `main` ma `protected: false` według API GitHub. Brak pełnego audytu wszystkich rulesetów.
- Odczyt współpracowników zwrócił wyłącznie właściciela `DamianRyh`; konto `rafalurtate-marsi` nie figuruje już na tej liście. Nie zweryfikowano oczekujących zaproszeń ani dostępu do innych repozytoriów.
- Wcześniejsze lokalne poprawki Studio pozostają niezacommitowane; nie są częścią porządków dokumentacji ani dowodem wdrożenia.

## Otwarte prace w GitHub — stan przed PR porządkowym

| PR | Zakres | Postępowanie |
| --- | --- | --- |
| [#41](https://github.com/DamianRyh/gamefields-os/pull/41) | Panna Kids i podstawa produktu modułowego | Ocenić zgodność z Modular/Engineering i pozostałymi PR |
| [#27](https://github.com/DamianRyh/gamefields-os/pull/27) | Panna Football 1×1 | Porównać z #41, zachować odmienny zakres |
| [#26](https://github.com/DamianRyh/gamefields-os/pull/26) | Strona główna WordPress | Porównać z obecną stroną przed publikacją |
| [#13](https://github.com/DamianRyh/gamefields-os/pull/13) | PLAY community redesigns | Przegląd różnic, danych i migracji przed scaleniem |

Ostatnie pięć odczytanych workflow runs dla #41 zakończyło się sukcesem. To nie jest potwierdzenie testów lokalnych zmian ani wdrożenia gamefields.eu.

## Publiczne adresy

| Adres | Obserwacja |
| --- | --- |
| `https://www.gamefields.eu/` | HTTP 200, strona WordPress |
| `https://www.gamefields.eu/studio` | Końcowe HTTP 200, ale przekierowanie do `/wp-content/uploads/2026/10/studio.webp`; to obrazek, nie aplikacja |
| `https://www.gamefields.eu/play` | HTTP 404 |
| `https://www.gamefields.eu/api/play/health` | HTTP 404 |
| `https://www.gamefields.eu/court-objects/` | HTTP 404 |
| `https://gamefields-studio.ryhfs90.chatgpt.site/` i `/api/play/health` | HTTP 403 w tym środowisku; przyczyna i dostęp w zwykłej przeglądarce niezweryfikowane |

Publiczne API WP raportuje 86 stron, 8 wpisów i 237 mediów. To nie pełna inwentaryzacja administracyjna; nie usuwać na tej podstawie treści.

## Codex i dane

- GitHub: odczyt repo, gałęzi, PR-ów i współpracowników działa; zakres operacji administracyjnych jest ograniczony.
- Status środowiska: brak skonfigurowanych sekretów, zmiennych runtime i tożsamości wychodzących. Brak potwierdzonego dostępu do WP.
- Zabezpieczono bieżące źródła i historię; szczegóły oraz ograniczenia w [mapie danych](DATA-MAP.md).
- Stan migracji D1, backupów hostingu, dostawcy DNS i aktywnej konfiguracji WP pozostaje niezweryfikowany.

## Aktualna kolejność prac

Najpierw dostęp i backup danych produkcyjnych oraz konflikt `/studio`, następnie ocena czterech PR-ów i podział etapów publikacji. Katalog priorytetów: [BACKLOG.md](BACKLOG.md). Poprzedni status zachowano w [archiwum](archive/2026-10-04/PROJECT_STATUS.md).
