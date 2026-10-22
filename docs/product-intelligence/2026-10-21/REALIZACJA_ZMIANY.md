# Realizacja dokumentu zmiany.txt — aktualizacja 22.10.2026

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
| S3: personalizacja, zapis i warianty | PARTIAL | 300 wzorów,19 palet, obiekty, undo/redo, lokalny szkic i JSON działają. S3-01 i S3-03 ukończone w zakresie lokalnym opisanym niżej; synchronizacja konta i porównywanie cen/3D nie są wdrożone. |
| S4: komponenty i BOM | PARTIAL | Istnieją reguły jednej zgodnej rodziny w OS. Pełny rejestr zatwierdzonych artykułów i granica elementów dekoracyjnych/technicznych w Studio wymagają dalszej pracy. |
| S5-01/02: kalkulacja | PARTIAL | Wersjonowany cennik ośmiu konstrukcji, retry, anulowanie i ochrona przed spóźnioną wyceną. Ceny nawierzchni, montażu, transportu i pełny łańcuch technicznego BOM nadal niekompletne. |
| S5-03: przekazanie zapytania | DONE — dołączenie do formularza | Kompletne ograniczone JSON, pominięcie plików graficznych, potwierdzenie domeny/okna/próby/długości, timeout i ponowienie. Oba tryby przeglądarki sprawdzone w wersji75; nie potwierdza to odbioru e-maila. |
| S5-04: podsumowanie i eksport | PARTIAL | Edytowalne grupy i JSON istnieją. Techniczna specyfikacja z rewizją konfiguracji i BOM pozostaje do wykonania. |
| S6: stabilizacja | PARTIAL | TypeScript, build i regresje są bramkami wdrożeń. Fizyczne urządzenia, czytniki ekranu i badania z klientami pozostają osobnymi zadaniami. |

## Wykonane kolejne etapy — 22.10.2026

| Etap | Status i granice |
|---|---|
| Rejestr zgodności rewizji | DONE — inwentaryzacja i integralność 42 plików: 10 live, 16 finalnych ASM/WEB, 16 warstw. Sześć z ośmiu R02 ma inny obrys; zgodne gabaryty pozostałych dwóch nie dowodzą równoważności. Stary zbiorczy QA ma nieaktualne hashe ośmiu Blenderów; poprawny agregat zapisano osobno w bibliotece roboczej. |
| Podmiana modeli R02 | PENDING — wszystkie releaseEligible=false. Obecne modele i ich ilości pozostają niezmienione. Pełne raporty wewnętrzne nie są publikowane w publicznym repozytorium. |
| S3-01: adapter i odzyskiwanie | DONE — lokalny zakres: stare JSON i nazwy własne, walidacja ID, kopia przed zastąpieniem, ochrona uszkodzonego szkicu, pobranie surowych danych, jawne wznowienie, błędy quota i konfliktów. |
| S3-03: nazwane warianty | DONE — do sześciu pełnych zapisów, porównanie dwóch planów 2D i parametrów, przywrócenie z Cofnij, kontrola sourceRevision, cofnięcie ostatniego usunięcia także po odświeżeniu. |

Dane przechowywane są w przeglądarce/profilu/kontekście strony, nie w chmurze. JSON zachowuje pełne grafiki i jest niezależną kopią. Nie prezentujemy nieaktualnej ceny wariantu: po przywróceniu działa bieżąca kalkulacja. Web Locks chronią współbieżny zapis szkicu tam, gdzie są obsługiwane; starsze karty i przeglądarki bez tej funkcji nie mają pełnej gwarancji atomowości.

## Kolejność dalszej pracy

1. Rozstrzygnąć techniczne różnice rewizji i docelowy obrys dla każdego produktu. Adopcja R02 wymaga jawnego wydania, pomiaru powierzchni i regresji materiałów, kamer, grafiki, kalkulacji oraz starych projektów. Sam rejestr nie zatwierdza produkcji.
2. S4: zbudować zatwierdzony rejestr artykułów z articleId/family/revision/unit i powiązać z kompatybilnością jednej rodziny. Oddzielić dekoracje od technicznych instancji; nie wymyślać rozstawów, kotwienia ani mas. Dopiero potem rozszerzyć BOM Studio.
3. S5: uzupełnić brakujące stawki nawierzchni, montażu i transportu oraz specyfikację z rewizją konfiguracji/BOM. Zachować aktywne orientacyjne ceny konstrukcji i stany częściowe/nieznane.
4. S3-02/S6: sprawdzić bezpieczne i wrogie pliki grafiki, ustalić mierzalny budżet renderera, wykonać fizyczne urządzenia/czytnik ekranu i badania z klientami. Nie oznaczać całego briefu jako zakończonego.

Pozostałe zależności WordPress: instalacja i osobista aktywacja WPCode przez właściciela, potwierdzone fakty prywatności, odbiór wcześniejszego pojedynczego testu poczty. Nie wysyłać kolejnych testów bez nowej instrukcji.

Historia badań i aktualny stan są rozdzielone. Nowa kontrola ilości korzysta z żywych źródeł Blender/GLB i ich SHA256; dokumenty kart produktów nie są automatyczną autoryzacją podmiany modeli.


## Historia — etap wymiarów v76

Studio wersja76; źródło `0e5000edf7d3c955518e8140af9d2dd10276885c`; deployment `appgdep_6ad920a463148191967a841c4190ba77` — succeeded. Testy TypeScript/build/test:studio/quote/construction-pricing/test:mobile PASS. Ręcznie sprawdzono Konstrukcję, źródło klawiaturą,375px oraz zgodność29,82m² w publicznym podsumowaniu i kalkulacji. [Raport wdrożenia](../../audits/2026-10-21/implementation/WDROZENIE.md).


## Wydanie odzyskiwania i wariantów

Źródło `d770de1a5fcb4e10c77ac80a6ff697d0d3e1b185`, zapisana wersja 77. Publikacja `appgdep_6ad99e344664819188ef8ec2e456a076` — **succeeded**, środowisko revision3. Na publicznym Studio sprawdzono nowe sekcje i działającą cenę konstrukcji; dane użytkownika nie były zastępowane wariantami QA. Potwierdzenie: raport WDROZENIE.md. Kontrakt: [PROJECT_RECOVERY_VARIANTS](../../../integrations/studio/canvas-editor/docs/PROJECT_RECOVERY_VARIANTS.md).

PASS: TypeScript, build, test:studio (w tym project-vault/draft-write), quote-engine, construction-pricing, pełne test:mobile na 375/390/430/1440. Ręcznie lokalnie sprawdzono uszkodzony szkic, odzyskanie, zapis A/B, porównanie, pobranie pełnego JSON, przywrócenie/Cofnij i cofnięcie usunięcia po ponownym wczytaniu. Widok 375px bez poziomego przepełnienia. Testy lokalnego zbudowanego Workera nie oznaczają testu fizycznego telefonu.
