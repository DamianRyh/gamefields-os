# Bieżące kalkulacje porównywanych wariantów

W Plikach projektu zaznaczenie dwóch zapisów pokazuje plany2D, parametry i dwie aktualne kalkulacje bez przywracania wariantu. Używamy istniejącego `useProjectQuote` i `/api/quote`; nie tworzymy drugiego silnika cenowego. Każdy wynik ma zakres, pozycje niewycenione, wersję cennika i własne retry. Częściowa suma nie jest pełną ceną realizacji. Nie wyświetlamy rankingu oszczędności między niepełnymi zakresami.

Kalkulacja nie jest zapisana w snapshotach ani utrwalona jako oferta. Dwa zapytania mogą użyć bieżących cenników dostępnych w chwili odpowiedzi; wersja jest podana osobno. Zmiana rewizji modelu blokuje zapytanie dla historycznego wariantu, tak jak istniejący kontrakt przywracania. Dla projektu indywidualnego bez modelu pozostaje dotychczasowa kalkulacja. Domyślna karta podsumowania zachowuje swoje nazwy i zachowanie.

Każdy wariant ma osobny kontroler żądania, stan ładowania/błędu i klucz konfiguracji. Odznaczenie lub zmiana zapisu odmontowuje kartę i anuluje jej odczyt; spóźniona odpowiedź nie przywraca karty. Pełne logo pozostaje w zapisie, ale istniejący hook pomija bajty obrazów w zapytaniu cenowym. Nie ma setterów aktywnego Project lub biblioteki w kartach kalkulacji.

## Walidacja

`node tests/variant-pricing-browser.mjs` uruchamia lokalny Worker i Chromium w375/1440px. Jawny sztuczny cennik `TEST-VARIANTS-NOT-FOR-SALE` (1234/2345) istnieje wyłącznie w izolowanym teście; nie jest nową stawką komercyjną i nie trafia do środowiska produkcyjnego. Oczekiwane kwoty test pobiera niezależnie zAPI dla pełnych zapisów. Pierwszy start testu miał brak rate card w izolowanym Workerze i poprawnie otrzymał unpriced; dodano fixture, bez zmiany silnika/stawek produkcyjnych.

Sprawdzone: dwie różne aktualne kwoty, jawne pozycje Do ustalenia,503jednego wariantu i retry, blokada historycznej rewizji bez własnego żądania, opóźniona odpowiedź po odznaczeniu, dokładna niezmienność pełnego Project i IndexedDB oraz brak poziomego przepełnienia. [Raport](variant-pricing-2026-10-23/browser.json).

To domknięcie lokalnego porównania cen, nie porównania3D ani pełnej komercyjnej wyceny. Otwarte pozostają: Street Field1440tekst i timeout O1, zatwierdzenie geometrii/R02, techniczny BOM, stawki nawierzchni/montażu/transportu, fizyczne urządzenia i dostępność.
