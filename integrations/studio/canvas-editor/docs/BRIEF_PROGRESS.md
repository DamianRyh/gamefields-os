# Realizacja dokumentu zmiany.txt — 21.10.2026

Dokument właściciela jest planem rozwoju istniejącego Studio. Nie zastępuje bieżących decyzji właściciela ani nie oznacza startu nowej aplikacji. Kończy się w połowie pozycji „Testy regres” w Sprincie6; brakującej części nie odtworzono z domysłów.

W tej kontynuacji pracowały równolegle cztery role wykonawcze: agent prowadzący wdrożenie, agent geometrii i źródeł, agent UX wymiarowania oraz agent stanu planu. Wyniki weryfikowano w bieżącym kodzie; nie traktowano rekomendacji jako gotowej funkcji.

| Obszar planu | Status | Co potwierdzono / czego brakuje |
|---|---|---|
| Audyt, mapa funkcji, 9 benchmarków, architektura | PARTIAL | Dokumenty i ograniczony zakres badań istnieją w repozytorium. Nie wszystkie ścieżki konkurencji były dostępne; pierwotne obserwacje pozostają historyczne. |
| S1-01: tekst o wyłączonej cenie | SUPERSEDED | Późniejsza decyzja właściciela przywróciła kalkulację. Aktywne orientacyjne ceny konstrukcji i częściowe sumy pozostają włączone. |
| S1: narzędzia, czytelność i nawigacja | PARTIAL | Cztery narzędzia, Nawierzchnia, klawiatura, fokus i testy reflow istnieją. Nie oznacza to pełnego badania wszystkich 12 odpowiedzialności ani certyfikacji. |
| S2-01: semantyka wymiarów | PARTIAL | Wspólny adapter ośmiu modeli: zapisane wymiary, nawierzchnia i obrys konstrukcji rozdzielone. Pole gry, rozstaw modułów i strefy bezpieczeństwa wymagają potwierdzonych danych technicznych. |
| S2-02: powierzchnie aktualnych modeli | DONE — zakres cyfrowych modeli | Wspólne pole górnych trójkątów dla kalkulacji i podsumowania; Octagon ma29,823379m², a nie pole prostokąta. Nie jest to zatwierdzenie projektu budowlanego ani przyszłych rewizji. |
| S2-03/04: wizualizacja i wydajność renderera | PARTIAL | Istnieją testy scen, kamer i materiałów; w tym etapie renderer niezmieniony. Brak zatwierdzonego budżetu pomiarowego startu/aktualizacji renderera. |
| S3: personalizacja, zapis i warianty | PARTIAL | 300 wzorów,19 palet, obiekty, undo/redo, lokalny szkic i JSON działają. Porównywanie nazwanych wariantów i szersza strategia odzyskiwania pozostają do wdrożenia. |
| S4: komponenty i BOM | PARTIAL | Istnieją reguły jednej zgodnej rodziny w OS. Pełny rejestr zatwierdzonych artykułów i granica elementów dekoracyjnych/technicznych w Studio wymagają dalszej pracy. |
| S5-01/02: kalkulacja | PARTIAL | Wersjonowany cennik ośmiu konstrukcji, retry, anulowanie i ochrona przed spóźnioną wyceną. Ceny nawierzchni, montażu, transportu i pełny łańcuch technicznego BOM nadal niekompletne. |
| S5-03: przekazanie zapytania | DONE — dołączenie do formularza | Kompletne ograniczone JSON, pominięcie plików graficznych, potwierdzenie domeny/okna/próby/długości, timeout i ponowienie. Oba tryby przeglądarki sprawdzone w wersji75; nie potwierdza to odbioru e-maila. |
| S5-04: podsumowanie i eksport | PARTIAL | Edytowalne grupy i JSON istnieją. Techniczna specyfikacja z rewizją konfiguracji i BOM pozostaje do wykonania. |
| S6: stabilizacja | PARTIAL | TypeScript, build i regresje są bramkami wdrożeń. Fizyczne urządzenia, czytniki ekranu i badania z klientami pozostają osobnymi zadaniami. |

## Kolejność dalszej pracy

1. Uzgodnić rewizje modeli z kartami produktów: wewnętrzne R02 zawierają inne płyty W1/O1/P1 niż aktualne źródła Studio. Nie zmieniać geometrii ani ilości bez jawnego wdrożenia źródeł i kontroli scen. Grubości warstw pozostają osobnym zagadnieniem.
2. Rozwinąć zgodny adapter projektu i odzyskiwanie szkicu (S3-01), zachowując stare JSON i nazwy własne; następnie nazwane warianty i porównanie (S3-03).
3. Zweryfikować rejestr komponentów, rozstawy i artykuły przed rozszerzeniem technicznego BOM (S4). Brak danych oznaczać jako nieznane, nie jako zero.
4. Dokończyć komercyjne stawki pozostałych zakresów i eksport specyfikacji. Nie wyłączać już autoryzowanego cennika konstrukcji na podstawie starego zalecenia Sprintu0.

Pozostałe zależności WordPress: instalacja i osobista aktywacja WPCode przez właściciela, potwierdzone fakty prywatności, odbiór wcześniejszego pojedynczego testu poczty. Nie wysyłać kolejnych testów bez nowej instrukcji.

Historia badań i aktualny stan są rozdzielone. Nowa kontrola ilości korzysta z żywych źródeł Blender/GLB i ich SHA256; dokumenty kart produktów nie są automatyczną autoryzacją podmiany modeli.
