# Robocze założenia stawek — 23.10.2026

**ROBOCZE / NIEZWERYFIKOWANE. Nie zatwierdzono handlowo.** Właściciel polecił podstawić wartości, ponieważ właściwe dane nie są jeszcze dostępne. Są to zadane założenia symulacji, a nie odczytany cennik producenta, kosztorys wykonawczy lub oferta. `workingAssumptions:true`, `commerciallyApproved:false`; VAT nie jest przyjęty. Umowne kwoty netto służą porównaniu zakresów, nie potwierdzają podatku.

Plik: `pricing/rate-card-working-2026-10-23.json`, wersja `GF-WORKING-2026-10-23-v1`. Dotychczasowy plik cen nie został zmieniony. API i UI zawierają jawne oznaczenie stawek roboczych. Aktywację karty w środowisku potwierdza receipt wdrożenia i odczyt produkcyjnego API; samo dodanie JSON nie stanowi publikacji.

## Nawierzchnie na przygotowanym podłożu

| Wartość Studio | Materiał PLN/m² | Ułożenie PLN/m² | Łączne założenie PLN/m² |
|---|---:|---:|---:|
| Akryl sportowy | 65 | 35 | 100 |
| EPDM | 230 | 110 | 340 |
| Moduły sportowe | 145 | 30 | 175 |
| Sztuczna trawa 60 mm | 100 | 45 | 145 |
| Piasek sportowy | 70 | 40 | 110 |
| Beton sportowy | 180 | 100 | 280 |

Bez określonej grubości wykonawczej, odpadów, minimalnego zlecenia i technologii podbudowy. Nazwa murawy 60 mm nie dobiera zasypu ani technologii. Piasek rozliczony powierzchniowo jest budżetem symulacji przy nieustalonej warstwie, nie ilością materiału do zamówienia. Beton jest roboczym zakresem wykończenia nawierzchni; nie dodaje fundamentów, zbrojenia ani robót ziemnych.

Przekazane przez koordynatora punkty odniesienia do późniejszej weryfikacji: [CHEC Sport](https://checsport.pl/nawierzchnie-sportowe-katowice/) oraz [JACK — EPDM](https://jack-jacekglowacki.pl/nawierzchnie-epdm/). Podany zakres EPDM 280–500 netto/m² na gotowym podłożu służy wyłącznie kontroli rzędu wielkości roboczego 340. Podział 230/110 oraz inne liczby w tej karcie są naszymi założeniami, nie cenami zaczerpniętymi z tych stron. Prowadzący odczytał publiczne punkty odniesienia23.10.2026. Nie potwierdza to oferty dla konkretnej lokalizacji ani dokładnych wartości naszej karty. Technologie i zakresy nie są wzajemnie zamienne.

## Konstrukcje i montaż

| Model | Dotychczasowa konstrukcja PLN | Roboczy montaż PLN/kpl. |
|---|---:|---:|
| w1 | 13100 | 1800 |
| o1 | 10500 | 1800 |
| p1 | 22300 | 2600 |
| street15 | 26200 | 4000 |
| circle-cage-1 | 14000 | 2200 |
| circle-cage-2 | 22700 | 3200 |
| street-field | 16600 | 2600 |
| octagon | 15300 | 2400 |

Osiem kwot konstrukcji pozostawiono dokładnie z wcześniejszej referencyjnej karty; one również nie są zatwierdzonym kosztem produkcji. Montaż bez doboru kotew, fundamentów i ciężkiego sprzętu. Dwie wbudowane bramki pozostają w konstrukcji zgodnie z dotychczasowym silnikiem.

## Pozostałe założenia

| Zakres | PLN | Jednostka |
|---|---:|---|
| Grafika poziom 1 / 2 / 3 / 4 | 15 / 25 / 40 / 60 | m² |
| Linie | 800 | komplet |
| Branding | 250 | element |
| Mat / połysk / metal | 0 / 1200 / 1800 | dopłata do zestawu |
| Projekt | 1200 | komplet |
| Transport | 1500 | umowny pojedynczy kurs |

Metal/połysk oznaczają wyłącznie roboczą dopłatę do wykończenia, nie zmianę gatunku konstrukcji. Linie nie obejmują dowolnej liczby dyscyplin; branding nie określa materiału/formatu. Transport bez lokalizacji, odległości i rozładunku.

## Wyposażenie: wyłącznie nazwy obecne w sport-profiles

Wszystkie ceny za jeden obiekt edytora, bez potwierdzonego SKU, wymiaru, montażu i klasy produktu. Długość bandy, odcinek piłkochwytu i szkła wymagają specyfikacji; nie utożsamiać pozycji z całym obwodem. Nie dobrano nowych typów spoza UI.

| Obiekt | Roboczo PLN/szt. |
|---|---:|
| Bramka | 2500 |
| Banda | 900 |
| Piłkochwyt | 1800 |
| Lampa | 3500 |
| Ławka | 1200 |
| DJ booth | 5000 |
| Kosz | 6500 |
| Trybuna | 12000 |
| Siatka | 600 |
| Słupki tenisowe | 1800 |
| Krzesło sędziowskie | 2200 |
| Szkło padel | 3500 |
| Bramka futsal | 4000 |
| Siatka badminton | 300 |
| Słupki badmintonowe | 900 |
| Siatka beach | 600 |
| Słupki beach | 1800 |
| Stół Teqball | 14000 |
| Quarter pipe | 14000 |
| Funbox | 18000 |
| Rail skate | 3500 |
| Ledge | 4500 |
| Bank | 9000 |
| Totem | 2500 |
| Drążki | 3000 |
| Poręcze | 2500 |
| Monkey bars | 6500 |
| Box treningowy | 1800 |
| Kółka treningowe | 800 |

## Co wymaga weryfikacji przed cennikiem handlowym

Każda stawka wymaga artykułu/technologii, zakresu i wyłączeń, lokalizacji, minimalnego zlecenia, odpadów i zaokrągleń, terminu, potwierdzenia podatku i osoby zatwierdzającej. Trzeba potwierdzić czy grafika/linie nie są już w technologii materiału; obecny silnik dodaje je osobno. Koszty podłoża, fundamentów, przyłączy i formalności pozostają wyłączone. Żadna pełna suma robocza nie oznacza kompletnej ceny wykonania.

`pricing/engineering-input-template.json` przypina aktualne osiem sourceRevision; wszystkie `instances`, `joins`, `anchors`, `foundations` pozostają null. Osobny `formatExample` jest disabled i nie dobiera śrub, kotew ani fundamentów. Wypełnienie szablonu wymaga uprawnionego projektanta i weryfikacji źródłowych rewizji.
