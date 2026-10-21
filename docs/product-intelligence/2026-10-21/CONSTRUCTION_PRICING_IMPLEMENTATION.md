# Skalowany cennik konstrukcji2026 — wdrożenie

Studio wersja73, źródło0583fd5e26b033d53637b9ab98d47936eeaf9b33. Deployment appgdep_6ad8e4d9f3188191abdd328b916e7a3b — succeeded. Środowisko revision3. URL https://gamefields-studio.ryhfs90.chatgpt.site. Cennik GF-CONSTRUCTION-2026-10-21-PITCH-REFERENCE-v1.

Na polecenie właściciela odczytano i wizualnie sprawdzono pięć stron Pitch offer2026.pdf. Zapisano pięć referencjiEUR i wyprowadzono osiem propozycji cen według obwodu/wysokości, stałej części ceny i interpolacji. Street Arena 15 i Panna Cage 180 zachowują odpowiedniki6000EUR i5200EUR. Różnice materiałowe/technologiczne nie zostały kosztorysowane. Kwoty są orientacyjnymi cenami nowego cennika Gamefields, nie oryginalną ofertą ani potwierdzonym kosztem produkcji.

Kurs odniesienia NBP205/A/NBP/2026 z21.10.2026: EUR/PLN4,3641, zweryfikowany na https://nbp.pl/statystyka-i-sprawozdawczosc/kursy/tabela-a/. Netto przyjęto jako jawne założenie nowego cennika; PDF nie określa VAT. Nie doliczono domyślnego podatku. Wyceniona konstrukcja bazowa z bramkami; montaż,nawierzchnia,transport,branding i dodatki pozostają do ustalenia. Suma częściowa nie jest kosztem całej inwestycji.

| Model | PLN netto — założenie |
|---|---:|
|Panna Ring|13100|
|Panna Play|10500|
|Panna Court|22300|
|Street Arena 15|26200|
|Panna Cage 90|14000|
|Panna Cage 180|22700|
|Panna Grid|16600|
|Panna Octa|15300|

Źródło kodu,metody i danych: integrations/studio/canvas-editor/pricing/. Opis: docs/CONSTRUCTION_PRICING_2026.md w tym katalogu. W Studio ceny są w kartach wyboru i podsumowaniu oraz nagłówku. Po wdrożeniu potwierdzono produkcyjne15300PLN dla Panna Octa z właściwym opisem zakresu. Lokalnie sprawdzono zmianę15300→26200 po wyborzeStreet Arena 15 oraz modelcards/header390pxbezoverflow.

Walidacja: TypeScript,studio-scope300/19/12,product-names8,studio-ux,quote-engine,construction-pricing i API na końcowym zbudowanym Workerze — PASS. Regresja144scen,16zmian materiału,JSON/szkic/Radar na375/390/430/1440 — PASS. BuildPASSz istniejącymi ostrzeżeniami. Zachowano projektJSON,modele,migracje,domyślne puste panele i nieaktywny wybórW1; importW1 ma cenę.

Zmiana środowiska dotyczyła wyłącznie QUOTE_RATE_CARD; istniejący sekret zachowano. Odczyt zwrotny potwierdził identyczny JSON. Brak kopii źródłowego PDF/zdjęć w publicznym repozytorium. Nie wysłano kolejnego zapytania/emaila.

Rollback: ponowne wdrożenie zapisanej wersji72 oraz usunięcie QUOTE_RATE_CARD (lub przywrócenie poprzedniego uzgodnionego cennika) i ponowne wdrożenie, aby wrócić do stanu bez stawek. Samo cofnięcie kodu nie cofa środowiska.
