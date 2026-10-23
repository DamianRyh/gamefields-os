# Dane techniczne i handlowe — stan integracji

23.10.2026. Publiczny opis integracji; szczegółowy arkusz wewnętrznych dokumentów produkcyjnych pozostaje w bibliotece wewnętrznej. Ten plik nie publikuje wewnętrznych rysunków ani ich pełnych raportów.

- Sprawdzono8bieżących rewizji Studio i25kanonicznych zasobów OS; zgodność SHA nie zatwierdza konstrukcji.
- Rejestr ma56artykułów, w tym26F04. Wszystkie approval i connectionApproval pozostająUNCONFIRMED.
- Cztery rodziny źródłowe wymagają potwierdzonego rozbicia na instancje. Dla pozostałych złożenia cyfrowe nie mają jeszcze zatwierdzonej zgodności z konkretną rewizją Studio.
- Raport [STUDIO_OWNED_GEOMETRY_GAPS.md](STUDIO_OWNED_GEOMETRY_GAPS.md) opisuje publiczne różnice deskryptorów i nieznane mapowania. manufacturingApproved=false, technicalBill.rows=null.

## Pakiet do uzupełnienia

| Zakres | Wymagane dane | Stan |
|---|---|---|
| Model i instancje | sourceRevision; instanceId; articleId/revision; pozycja/orientacja; mapa do Studio | Niepotwierdzone |
| Połączenia | pary instancji; interfejs; kąt/rozstaw; tolerancje; łączniki i ilości | Niepotwierdzone |
| Kotwy | podłoże; obciążenia; typ; rozstaw/głębokość; odległości | Dobór wymagany |
| Fundamenty | założenia gruntu; geometria; materiał; zbrojenie; odwodnienie | Projekt wymagany |
| Bezpieczeństwo i montaż | strefy; dopuszczalne konfiguracje; instrukcja i odbiór | Weryfikacja wymagana |
| Stawki | technologia/SKU; jednostka; kwota; zakres; lokalizacja; termin; zatwierdzający | Wartości robocze na polecenie właściciela |

Właściciel potwierdził brak zatwierdzonych danych i polecił podstawić wartości. Do kalkulacji przygotowano [robocze założenia](WORKING_RATES.md), odrębne od potwierdzonego cennika. Nie dobrano fikcyjnych kotew, śrub, zbrojenia lub obciążeń. Szablon `pricing/engineering-input-template.json` przypina8aktualnych rewizji; instances/joins/anchors/foundations pozostająnull, przykład formatu jestdisabled i approved=false. Cyfrowe zestawienia istnieją w inspektorze OS; nie są wykonawczym BOMzakupu.

## Warunek domknięcia

Projektant zatwierdza złożenia, połączenia, kotwienie i fundamenty dla konkretnej rewizji i miejsca. Właściciel potwierdza SKU/technologię, pełny zakres cen i podatki. Do tego czasu roboczy szacunek może działać w UI, a nieznane elementy techniczne zachowują status niepotwierdzony.
