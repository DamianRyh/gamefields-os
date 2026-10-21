# Orientacyjny cennik konstrukcji — inspiracja ofertą 2026

Właściciel polecił wykorzystać `Pitch offer 2026.pdf` jako inspirację cenową i przeskalować do istniejących produktów. PDF przeczytano i obejrzano wszystkie5stron. Nie publikujemy kopii PDF,zdjęć ani identyfikacji innej firmy. Nowe ceny są propozycją budżetową Gamefields, a nie oryginalnym cennikiem, potwierdzonym kosztem produkcji ani ofertą wykonawczą.

## Fakty źródłowe

| Strona | Referencja | Wymiar | Wysokość | Cena EUR |
|---|---|---|---|---:|
|1|The Cage|15×10m|2,5m|25000|
|2|The Pitch|15×10m|1m|6000|
|3|Kids Pitch|15×10m|0,5m|4000|
|4|Panna Cage|6×6m|1,8m|5200|
|5|Panna Pitch|6×6m|0,6m|2500|

Opis: konstrukcja modułowa,stal i sklejka,możliwość personalizacji; wymiary bramek podane. **Nie określono VAT, montażu, transportu ani zakresu nawierzchni.** Zdjęcie boiska na murawie nie dowodzi, że nawierzchnia jest wliczona.

## Jawne założenia Gamefields

- **Podstawa netto jest nowym założeniem cennika Gamefields**, nie informacją odczytaną z PDF. Nie doliczamy domyślnego VAT; brutto pozostaje nieustalone. W Studio widoczna informacja wyjaśnia różnicę.
- Wyceniona jest wyłącznie bazowa konstrukcja z wbudowanymi bramkami,bez dodatkowego brandingu. Montaż,nawierzchnia,transport,projekt i wyposażenie dodatkowe pozostają „Do ustalenia”; nie wpisujemy0ani nie obiecujemy kompletnego kosztu inwestycji.
- Kurs do kalkulacji zamrożony: **1EUR=4,3641PLN**, [NBP205/A/NBP/2026,21.10.2026](https://nbp.pl/statystyka-i-sprawozdawczosc/kursy/tabela-a/). To kurs odniesienia do budżetu,bez spreadu/hedgingu i automatycznej codziennej zmiany cen.
- Stal/sklejka w referencji nie oznacza identycznego materiału każdego modelu Gamefields. Łączenia,perforacje,kratownice,bramki i rzeczywiste roboczogodziny nie zostały kosztorysowane. Stąd jawne określenie „orientacyjnie” i potwierdzenie specyfikacji przed ofertą.

## Metoda skalowania

Skalujemy **obwód i wysokość konstrukcji**, nie powierzchnię posadzki.

1. Rodzina prostokątna: interpolacja liniowa ceny referencyjnej R(H) przez punkty H0,5→4000EUR,H1→6000EUR,H2,5→25000EUR. Cena `1200+(R(H)-1200)×P/50`. Część stała1200EUR =20%ThePitch; to założenie kosztu stałego bramek/przygotowania,nie pozycja z oferty.
2. Rodzina Panna: interpolacja H0,6→2500EUR,H1,8→5200EUR. Cena `625+(R(H)-625)×P/(6π)`. Część stała625EUR =25%PannaPitch. Referencyjny obwód6π jest przybliżeniem dla nominalnego6×6m; źródło nie podaje dokładnej geometrii obwodu. Dla Panna Play0,55m używamy niewielkiej ekstrapolacji.
3. Zaokrąglenie propozycji do100EUR,przeliczenie przez4,3641,następnie do100PLN. Zasada stabilna i odtwarzalna w `pricing/scaling-2026.mjs`. Wysokości i obwody wraz z ograniczeniami zapisano w `pricing/scaled-products-2026-10-21.json`. W Panna Court konserwatywnie użyto maksymalnej wysokości1,22m; nie twierdzimy,że cały panel ma tę wysokość.
4. Dwa bezpośrednie odpowiedniki zachowują ceny referencyjne: Street Arena 15=6000EUR i Panna Cage 180=5200EUR. Wszystkie5punktów referencyjnych jest odtwarzanych przez test metody.

## Cennik konstrukcji

| Kod | Model | EUR po skalowaniu | PLN netto — założenie |
|---|---|---:|---:|
|GF-CT-001|Panna Ring|3000|13100|
|GF-CT-002|Panna Play|2400|10500|
|GF-CT-003|Panna Court|5100|22300|
|GF-CT-004|Street Arena 15|6000|26200|
|GF-CT-005|Panna Cage 90|3200|14000|
|GF-CT-006|Panna Cage 180|5200|22700|
|GF-CT-007|Panna Grid|3800|16600|
|GF-CT-008|Panna Octa|3500|15300|

## Wdrożenie i regresje

`QUOTE_RATE_CARD` otrzymuje wersję `GF-CONSTRUCTION-2026-10-21-PITCH-REFERENCE-v1`. Inne klucze środowiska są zachowane. `pricing/rate-card-2026-10-21.json` jest odtwarzalnym źródłem publicznych cen sprzedaży, nie zawiera wewnętrznych kosztów ani sekretów. Nowa opcjonalna informacja o podstawie wyceny jest widoczna nad sumą. Częściowa cena pokazuje kwotę również w nagłówku; karty wyboru modelu pokazują cenę bazowej konstrukcji. Bez osobnej karty W1 w wyborze — zachowano dotychczasowy zakres selektora,ale cennik obejmuje stabilny IDW1 dla importów.

Nie zmieniono schematu projektu,JSON,geometrii,domyślnych pustych paneli ani zakresu wzorów. Import starego projektu nadal przelicza aktualną orientacyjną cenę,nie zachowuje starej jako wiążącej.
