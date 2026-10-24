# Realizacja dokumentu zmiany.txt — aktualizacja 23.10.2026

## 24.10.2026 — Studio95: Konstrukcja jak Nawierzchnia

Panel Konstrukcja ma wspólny z Nawierzchnią układ: miniatura bieżącego modelu 3D, nazwa boiska i „Zmień boisko”, obok kolory Bandy/Rama/Bramki. Miniatura korzysta z istniejącego canvasu, bez dodatkowego WebGL i bez zmiany danych projektu. Wybór modelu i anulowanie wracają do Konstrukcji. Rozbudowa pozostaje w tym panelu, w rozwijanej sekcji otwieranej także przyciskiem Budowanie modułowe.

Usunięto przycisk zmiany boiska spod sceny. Etykieta modelu na podglądzie jest nieklikalna. W Studio jedyne „Zmień boisko” znajduje się w Konstrukcji. Zachowano moduły, kolory, nawierzchnie, grafikę, szkice i prywatność kosztów.

Sprawdzenie: tsc, test:studio, build, test:mobile (4 szerokości, materiały/JSON/Radar), 8 przypadków panelu P1/O1 × 4 szerokości (miniatura, trzy kolory, jedyny wybór w panelu), 8 przypadków wspólnego edytora modułów. Publikacja Studio95: źródło `f3136d8cbb0924adcc51baff227527167b2f64be`, wdrożenie `appgdep_6adc5f1d348881919a0e4c6f85a39023` succeeded, env revision 6.

## 24.10.2026 — Studio94: naprawiona geometria i wspólny edytor

Zastępuje oddzielny edytor ze Studio93. Rozbudowa odbywa się w panelu Konstrukcja przy tym samym modelu 3D co kolory band/ramy/bramek, logo/tekst i grafiki nawierzchni. Parametry są zapisane w Project.modular (GF-STUDIO-MODULAR-2): wspólny szkic, Cofnij/Ponów, JSON, specyfikacja, warianty i A/B. Studio nie otwiera dodatkowego okna ani iframe.

Poprawiono znak obrotu paneli Panna Octa oraz krótkich paneli i bramek Panna Grid. Panele Octagonu dochodzą do słupków; bramki wystają na zewnątrz. Oryginalne GLB zachowują wymiary 1:1. Jedna rodzina na konfigurację. Panna Grid zwiększa długość/szerokość; Panna Cage 90/180 zmienia poziomy; Panna Octa ma stały obrys. P1/O1/W1/Street15 pozostają modelami bazowymi bez niepotwierdzonego układu modułów.

Nawierzchnia 20 cm i jej ilość wynikają z aktualnego obrysu modułów. Konstrukcja oraz jej montaż pozostają do wyceny; cena modelu bazowego nie jest stosowana do konfiguracji modułowej. Koszty produkcji pozostają sekretami serwera. BOM wykonawczy, połączenia i kotwienie nadal niezatwierdzone. Stary silnik inspektora OS i dane historyczne zachowano; adapter Studio ma własną przypiętą rewizję źródeł.

Walidacja: 243 układy (orientacja bramek, końce paneli Octagonu przy słupkach, rodzina/skala), hashe GLB i kodu, schemat/JSON/rewizje wariantów, powierzchnia i częściowa wycena; tsc, test:studio, build, test:mobile (4 szerokości i Radar), API sales-only. Przeglądarka: cztery modele × 390/1440 px (moduły + kolory + nawierzchnia, obrót, Cofnij/Ponów, szkic po ponownym otwarciu, JSON i brak ceny bazowej). Modułowe A/B 375/1440 px z logo/tekstem i ochroną starej rewizji.

Publikacja: Studio94; źródło `587c16ecd1d586a48d823c73d8db8f03de868e5b`; wdrożenie `appgdep_6adc5a61c3d48191a82616861eefa2b5` succeeded, env revision 6. Dalszy zakres: zatwierdzone połączenia/BOM/kotwienie i stawki konkretnych modułów, nie nowe miejsca edytora.

## 24.10.2026 — Studio93: spójne kolory i edytor modułów

Opublikowano jeden obracany podgląd 3D (również A/B), bez przycisków Boczny/Z góry. Bandy, Rama i Bramki używają kontrolek i typografii nawierzchni. Przycisk Budowanie modułowe otwiera w Studio lokalny silnik OS z oryginalnymi GLB: Panna Grid (Street Field) zwiększa długość/szerokość, Circle Cage zmienia poziomy, Octagon ma stały obrys. Konfiguracja pozostaje w jednej rodzinie i zachowuje skalę części 1:1.

Edytor modułowy ma osobny szkic w przeglądarce, import/eksport GF-OWNED-ASSEMBLY-1 i osobną wycenę. Nie modyfikuje projektu, nawierzchni ani wyceny Studio. Integracja jego geometrii z grafiką i kalkulacją Studio pozostaje dalszym etapem. Nie rozszerzono P1 bez potwierdzonego podziału modułów. Nie potwierdzono BOM wykonawczego, kotew ani fundamentów. Koszty produkcji nadal pozostają tajne po stronie serwera.

Walidacja: tsc, test:studio, build, test:mobile (4 szerokości, materiały/import/Radar), orbitowanie 8 modeli × 2 szerokości, porównanie A/B 375/1440, edytor modułowy 390/1440 (3 rodziny, wzrost instancji, skala 1:1, eksport/import/odzyskiwanie). Publikacja: Studio93, źródło `75937b2f5c08116049871111a3f4900e3d0b68ca`, wdrożenie `appgdep_6adc529484c081919ed37fc45f982b1a` succeeded, env revision 6. 

## 24.10.2026 — Studio92, uproszczony edytor

Wdrożono cztery korekty wskazane przez właściciela: wyposażenie wyłączone; czytelniejsze grupy kolorów Bandy/Rama/Bramki; Boczny/Z góry/obracany Model3D zamiast Z boiska; brak selektora scenerii i neutralne tło w Studio. Modele i zdjęcia do wykorzystania poza Studio zachowano; nie dodawano teraz nowej sekcji strony głównej.

Dostępne narzędzia: Konstrukcja, Nawierzchnia, Grafika. Starsze wyposażenie pozostaje w pełnym JSON/IndexedDB, lecz jest pomijane w podglądzie, aktywnym zapytaniu/specyfikacji i wycenie (również w API). Bramki stanowiące część własnej konstrukcji pozostają. Nowe projekty nie otrzymują swobodnego wyposażenia.

Model3D obraca się myszą, dotykiem lub strzałkami; Home/przycisk resetuje kąt. Zmiany nawierzchni, materiałów i oznaczeń zachowują obrót. Kamera nie zmienia Project ani nie regeneruje tekstur podczas drag. Kadr dopasowuje się do gabarytów i proporcji canvasu. W1 nadal tylko jako archiwalny import; projekt bez własnej geometrii zachowuje Boczny/Z góry, a obrót3D jest niedostępny z objaśnieniem. A/B używa tych samych trybów i neutralnego tła.

PASS: TypeScript/build, test:studio, test API (brak opłaty za wyłączone wyposażenie, koszty nadal ukryte),80kombinacji kadru;16przypadków obrotu8modeli przy375/1440px; rzeczywisty emulowany gest dotykowy390px; warianty A/B375/1440;24widokiO1/P1+8neutralnychStreet+16materiałówP1, JSON/szkic i Radar na4szerokościach. Nie utrzymujemy historycznej liczby96scen po celowym usunięciu scenerii. Zrzuty375/1440/390 obejrzano; poprawiono pozostałość tła i mobilną podpowiedź. Kontrola produkcyjna również PASS. [Szczegóły](https://github.com/DamianRyh/gamefields-os/blob/main/integrations/studio/canvas-editor/docs/STUDIO_UX_2026_10_24.md), dowody tools/studio-ux-2026-10-24/.

Źródło c299cbb7b7ddcf5212641f574b9b6bb0db45044a; wersja92 appgprj_6abbd0ba26f0819197701343bf156f1b~appgver_aeccdbffbdb0819187716289ffd49f0b; deployment appgdep_6adc4c0eeb4081919ff69c835a1ce973 succeeded, env6 bez zmian. Hash natywny sha256:3751e89430e249c4385dbf6f1c3e6671422a7f22dd545bb5efdd397ec28c65db. Publikacja w dotychczasowym osadzeniu konfiguratora; nie powstało nowe miejsce. Ceny sprzedaży, sekrety kosztowe, geometria, schemat Project i SQL zachowane. Dane wykonawcze i testy na fizycznych urządzeniach mają wcześniejsze ograniczenia.


## 24.10.2026 — Studio91, koszty wewnętrzne i ceny sprzedaży

Decyzja właściciela: dotychczasowe kwoty są kosztami produkcji i nie mogą być przedstawiane klientowi jako cena sprzedaży. Zastępuje wcześniejsze wyprowadzenie kosztu z ceny referencyjnej. Koszt i parametr marży są sekretami serwera, a odpowiedź API jest budowana z nowej, ograniczonej karty sprzedaży. Nie kopiuje kosztowych opisów, identyfikatora cennika, marży ani nieznanych metadanych. Brak poprawnej konfiguracji nie uruchamia fallbacku na koszt. Klient/porównanie/zapytanie otrzymują wyłącznie kwoty sprzedażowe.

Cztery dawne pliki z pricing/ przeniesiono do biblioteki wewnętrznej; publiczne testy używają sztucznych stawek. Nowa wersja i bieżące raporty nie publikują tych tabel. Starsze rewizje, wydania i wcześniej pobrane kopie mogą nadal zawierać dane opublikowane przed przeklasyfikowaniem; nie przepisano historii Git ani nie deklaruje się cofnięcia wcześniejszej publikacji.

PASS: TypeScript/build, test:studio, API zbudowanego Workera (sprzedaż zamiast kosztu, brak metadanych, błędna/brakująca marża, ignorowanie starego QUOTE_RATE_CARD), kalkulacja marży, fikcyjne192kombinacje, paleta i warianty375/1440, pełna regresja96O1/P1+48Street+16materiałów/JSON/Radar na4szerokościach. Produkcyjny POST HTTP200 odpowiada lokalnej kalkulacji sprzedaży; osiem cen konstrukcji różni się od kosztów, brak kosztowej wersji i wewnętrznych pól, brak domyślnego VAT. Dowód bez kwot: tools/sales-privacy-2026-10-24/production-proof.json.

Źródło c5ac0b93bd0d258d4792558fc5224a506c92d133; wersja91 appgprj_6abbd0ba26f0819197701343bf156f1b~appgver_9535d30b79b48191a222f08aa1499e58. Deployment appgdep_6adc3cfeaea4819190227b3805a8e791 succeeded, env6. Archiwum natywne sha256:6a1cdd9be0ff3fd4a70e1b1e9d500155a16fe175844daf6cfaf434a0f2a92ee8. Istniejący konfigurator WordPress osadza to samo Studio. Odczytano stronę główną, ofertę street-football i OS/P1; w zwróconym HTML nie znaleziono badanych dawnych kwot. Nie oznacza to audytu każdej historycznej podstrony lub kopii.

[Zasady i ograniczenia](https://github.com/DamianRyh/gamefields-os/blob/main/integrations/studio/canvas-editor/docs/SALES_PRICE_PRIVACY.md). Geometria, Project/IndexedDB i SQL bez zmian; zatwierdzenia techniczne, kotwienie/fundamenty i VAT nadal pozostają odrębnymi zależnościami.


## 23.10.2026 — odczyt projektu konstrukcji, bez zmiany wdrożenia90

Przejrzano dostarczony 30-stronicowy projekt konstrukcji:24rysunki i opis trzech rodzin P1/F01,O1/F02,W1/F03. Pozostałych pięciu modeli Studio nie obejmuje. W bibliotece wewnętrznej zapisano20wierszy odczytanych ze złożeń, kandydatów mapowania articleId oraz rozbieżności dokumentu. Nie zastępują instancji aktualnego modelu Studio.

Korekta stanu braków: dane materiałowe, przekroje, część detali połączeń i stop znajdują się w projekcie. Opis wymienia kotwy mechaniczne lub szpilki wbijane dla P1/O1, lecz brak kompletnego doboru kotwienia do lokalizacji. Obecność otworów w stopie nie zatwierdza typu lub ilości kotew. Fundamenty, parametry zakupowe i zatwierdzenie współczesnej rewizji nadal niepotwierdzone. Dokument opisuje W1 jako konstrukcję do wnętrz; nie rozszerzono tego na deklarację użytkowania na zewnątrz.

Znaleziono sprzeczności w tabelach mas, datowaniu i oznaczeniach rysunków oraz rozbieżność gabarytu P1 wobec aktualnego modelu. Nie wybrano arbitralnie mas do automatycznej wyceny/kg. source evidence nie zmienia manufacturingApproved=false, connectionApproval=UNCONFIRMED ani technicalBill.rows=null dla aktualnego Studio.

Na polecenie właściciela przygotowano wewnętrzny model roboczego kosztu i marży, z jasno opisanym wyprowadzeniem kosztu z cen referencyjnych; nie jest to oferta producenta lub dowód rentowności. Pełny PDF, szczegółowy BOM i koszty nie są publikowane. Publiczne modele, osiem cen konstrukcji, środowisko i Studio90 pozostają bez zmian. Kolejny krok: wyjaśnienie sprzeczności źródła, mapowanie konkretnych rewizji oraz zatwierdzenie rzeczywistych kosztów i kotwienia.


## Aktualizacja — Studio90, 23.10.2026

Porównano pełny dostarczony Gamefields.eu.txt (kończący się na „Testy regres” w Sprincie6) z kodem i stanem Studio89. [Zestawienie wszystkich etapów i braków](https://github.com/DamianRyh/gamefields-os/blob/main/integrations/studio/canvas-editor/docs/GAMEFIELDS_EU_RECONCILIATION_2026_10_23.md).

Zamknięty zakres programistyczny z4.4: opcjonalny budżet liczby kolorów palety. Nowa karta GF-WORKING-2026-10-23-v2 zachowuje stawki v1 i8cen konstrukcji; dodaje roboczo2kolory w pakiecie i[stawka archiwalna] za dodatkowy kolor. To unikalne wejścia wybranej palety, nie pomiar widocznych pikseli ani receptura farb. UI objaśnia zależność i pokazuje osobną pozycję. Stare karty nie zmieniają wyników; Project/IndexedDB/SQL i modele zachowano. Grafika wyłączona, trawa i piasek nie dostają tej dopłaty. Otoczenie nie zwiększa budżetu warstwy Blender; linie i branding są oddzielne.

PASS: TypeScript, build, test:studio, quote-engine, stara karta192kombinacje, nowa polityka kolorów, interfejs375/1440 oraz pełna regresja96O1/P1+48Street+16materiałów, JSON/szkic i Radar na4szerokościach. TestUI potwierdził[kwota archiwalna]PLN różnicy za dodatkowy kolor dla29,82m². Produkcyjny POST /api/quote: HTTP200, pełna zgodność z lokalnym silnikiem, netto[kwota archiwalna]PLN dla utrwalonej konfiguracji, brutto/VATnull i workingAssumptions=true. Bez formularza, e-maila lub zapisuDB. [Dowód API](https://github.com/DamianRyh/gamefields-os/blob/main/tools/palette-pricing-2026-10-23/production-palette-smoke.json).

Źródło Sites: 0d87047e000e312fe52e003c3dfb475ae29e247c. Wersja90: appgprj_6abbd0ba26f0819197701343bf156f1b~appgver_5af87237bde481919fe96f9d910c303f. Deployment appgdep_6adbb5cdd4f48191852f8968834bb444 succeeded, env5. Hash natywny sha256:d6994ef414de9776215bfc2ff907445e6ec88c87cd4ad11873690b79654ce45e. Istniejący iframe /konfigurator-boisk/ wskazuje to samo Studio, więc publikacja jest dostępna na gamefields.eu; nie utworzono nowej strony ani nie przebudowano odrębnego OS.

Dalsza kolejność: zatwierdzone rewizje/instancje/połączenia i fundamenty; własne modele brakujących akcesoriów; potwierdzony cennik/receptury/VAT/warunki lokalizacji; fizyczne urządzenia/czytniki/badania i budżetSLA. Konto/chmura nadal poza obecnym lokalnym zapisem. Zależności WordPress/WPCode, fakty prywatności i odbiór poprzedniego testu poczty nie zostały ponownie potwierdzone. Cały plan pozostaje PARTIAL; poniższe wydania są historią.


## Aktualny etap — Studio89, 23.10.2026

Źródło `b4da8bcdd172c8bfb4ea01d8f7c4433e78c54a42`, wersja `appgprj_6abbd0ba26f0819197701343bf156f1b~appgver_8fc4a915fc608191866f088151097a3b`, deployment `appgdep_6adbb1cf0b4081918c2af2091da68b77` — **succeeded**, środowisko revision4. Paczka natywna `sha256:8223cbeeac4d5741336e8c8d3d9444fa6c151f941f9868464aef4609e94d2d70`.

Wdrożony zakres i granice: [PRIORITIES_2026_10_23](https://github.com/DamianRyh/gamefields-os/blob/main/integrations/studio/canvas-editor/docs/PRIORITIES_2026_10_23.md). Raporty pomiarów i kontroli: `tools/priorities-2026-10-23/`. Poniższy stan zastępuje wcześniejsze opisy aktualności; wcześniejsze wydania i pomiary pozostają historią.

- **Street Field / renderer:** końcowy profil V2 zachował trzy identyczne obrazy. Wyszukania lokalizacji uniformów1374→0 i atrybutów405→0 po rozgrzaniu; pozostałe liczniki bez zmian. Mediana tekstu491,8→410,6ms, cached327,2→329,4ms. To pięć uporządkowanych instrumentowanych powtórzeń w konkretnym harnessie, nie nowe ABBA, uniwersalne przyspieszenie, GPU/FPS lub SLA. Historyczne mieszane ABBA85/87 zachowano.
- **O1 / odzyskiwanie:** timeouty modelu/obrazów/generacji, kontrolowane błędy, ponowienie i utrata WebGL obsługiwane bez resetowania Project. Testy recovery/fault-injection PASS;40normalnych nawigacji O1 PASS. Osobny timeout obserwatora rAF przy już gotowym DOM zachowano w diagnostyce; poprawiony interwałowy harness nie dowodzi przyczyny pierwotnego historycznego przerwania ABBA.
- **Warianty3D:** porównanie A/B w jednym dodatkowym canvasie na żądanie, wspólne trzy kamery, modal/Escape/powrót fokusu i kontrola rewizji; testy PASS. Pełny Project i IndexedDB pozostają niezmienione. Brakujące własne modele3D akcesoriów oraz obiekty poza nawierzchnią są jawnie oznaczone jako widoczne tylko na planie2D; nie ukończono odwzorowania wszystkich obiektów3D.
- **Geometria / BOM:** poprawiony F04:26zarejestrowanych artykułów istnieje, potwierdzonego złożenia OS brak. Wszystkie56artykułów mają UNCONFIRMED; technicalBill.rows=null i manufacturingApproved=false. Dwa odtworzenia audytu8rewizji/25zasobów dały identyczny JSON `e47ae0f8244d1375e9c7e124ae0ee8fc9019cc4659c415ac90649aa86565efef`. Checklista i szablon wejściowy nie dobierają śrub, kotew ani fundamentów.
- **Robocze stawki:** właściciel potwierdził brak danych i polecił „podłóż wartości”. Osobna karta `GF-WORKING-2026-10-23-v1`:6nawierzchni,29typów wyposażenia z UI, montaż8konstrukcji,4poziomy grafiki, linie, branding, wykończenie, projekt i transport.8cen konstrukcji zachowano. UI/API jawnie oznaczają ROBOCZE/NIEZWERYFIKOWANE; brak VAT/brutto i zatwierdzenia handlowego.192kombinacje i przykładOcta[kwota archiwalna]netto PASS sprawdzają arytmetykę, nie rynkową poprawność cen. Wynik estimated w roboczym zakresie nie jest pełną ofertą realizacji. Nieznane dodatki nadal dają partial. [Założenia](https://github.com/DamianRyh/gamefields-os/blob/main/integrations/studio/canvas-editor/docs/WORKING_RATES.md).

Bramki końcowego wydania PASS: TypeScript, build, domenowe, pełne mobile, nowe areny i Surface,58przypadków stron Circle,84porównania rastra,60stanów tekstur, warianty3D, robocza karta i kontrolowane awarie. Produkcyjny odczyt API: HTTP200, wynik dokładnie równy lokalnej kalkulacji z rzeczywistym patternComplexity; workingAssumptions=true, wersja GF-WORKING-2026-10-23-v1, netto[kwota archiwalna]PLN, gross=null i vat=null. Dowód: `tools/priorities-2026-10-23/production-quote-smoke.json`. Kwota różni się od niezależnego przykładuOcta[kwota archiwalna], bo ten odczyt używa własnej konfiguracji i rzeczywistej złożoności wzoru. Bez zapisów DB, formularza i e-maila. Nie wysyłano kolejnego testowego zapytania.

**Nadal PARTIAL:** zatwierdzenie geometrii/R02, techniczny BOM i połączenia/kotwienie/fundamenty; własne modele3D wszystkich akcesoriów; zatwierdzony cennik, warunki lokalizacyjne i podatkowe; fizyczne urządzenia, czytniki, badania z ludźmi i budżet/SLA. Pozostają historycznie udokumentowane zależności WordPress/WPCode, fakty prywatności i potwierdzenie skrzynkowego odbioru wcześniejszego jednego maila. Nie odczytywano ich ponownie w tym wydaniu.

Aktualny etap: **Studio89 opublikowane — odzyskiwanie 3D, porównanie A/B i aktywne stawki robocze**. Granice i dowody opisano powyżej.

Dokument właściciela jest planem rozwoju istniejącego Studio. Nie zastępuje bieżących decyzji właściciela ani nie oznacza startu nowej aplikacji. Kończy się w połowie pozycji „Testy regres” w Sprincie6; brakującej części nie odtworzono z domysłów.

We wcześniejszym etapie pracowały równolegle cztery role wykonawcze: agent prowadzący wdrożenie, agent geometrii i źródeł, agent UX wymiarowania oraz agent stanu planu. Wyniki weryfikowano w bieżącym kodzie; nie traktowano rekomendacji jako gotowej funkcji.

| Obszar planu | Status | Co potwierdzono / czego brakuje |
|---|---|---|
| Audyt, mapa funkcji, 9 benchmarków, architektura | PARTIAL | Dokumenty i ograniczony zakres badań istnieją w repozytorium. Nie wszystkie ścieżki konkurencji były dostępne; pierwotne obserwacje pozostają historyczne. |
| S1-01: tekst o wyłączonej cenie | SUPERSEDED | Późniejsza decyzja właściciela przywróciła kalkulację. Aktywne orientacyjne ceny konstrukcji i częściowe sumy pozostają włączone. |
| S1: narzędzia, czytelność i nawigacja | PARTIAL | Cztery narzędzia, Nawierzchnia, klawiatura, fokus i testy reflow istnieją. Nie oznacza to pełnego badania wszystkich 12 odpowiedzialności ani certyfikacji. |
| S2-01: semantyka wymiarów | PARTIAL | Wspólny adapter ośmiu modeli: zapisane wymiary, nawierzchnia i obrys konstrukcji rozdzielone. Pole gry, rozstaw modułów i strefy bezpieczeństwa wymagają potwierdzonych danych technicznych. |
| S2-02: powierzchnie aktualnych modeli | DONE — zakres cyfrowych modeli | Wspólne pole górnych trójkątów dla kalkulacji i podsumowania; Octagon ma29,823379m², a nie pole prostokąta. Nie jest to zatwierdzenie projektu budowlanego ani przyszłych rewizji. |
| S2-03/04: wizualizacja i wydajność renderera | PARTIAL | Studio87 i lokalne ABBA85/87:1920próbek/96komórek/48identycznych obrazów;35niższych/4wyższe/57nakładających się zakresów median. Studio89 dodaje ograniczony profil V2 i odzyskiwanie opisane powyżej; fizyczne urządzenia i budżet nadal PENDING. |
| S3: personalizacja, zapis i warianty | PARTIAL | 300 wzorów,19 palet, obiekty, undo/redo, lokalny szkic i JSON działają. S3-01 i S3-03 ukończone w zakresie lokalnym opisanym niżej; Studio88 dodaje bieżące kalkulacje dwóch wariantów, Studio89 porównanie A/B3D aktualnych modeli. Synchronizacja konta i własne modele wszystkich akcesoriów pozostają do wykonania. |
| S4: komponenty i BOM | PARTIAL | Istnieją reguły jednej rodziny i rejestr56 cyfrowych artykułów. Niezależny inspektor OS regeneruje cyfrowe instancje. Studio84 jawnie wiąże dwa snapshoty z SHA i rewizjami; nie potwierdza geometrii. Zatwierdzenie połączeń i powiązanie technicznego BOM z Project nadal wymagają danych. |
| S5-01/02: kalkulacja | PARTIAL | Wersjonowany cennik ośmiu konstrukcji, retry, anulowanie i ochrona przed spóźnioną wyceną. Studio89 aktywuje oznaczone stawki robocze nawierzchni, montażu i transportu. Zatwierdzenie handlowe, VAT i pełny łańcuch technicznego BOM pozostają niekompletne. |
| S5-03: przekazanie zapytania | DONE — dołączenie do formularza | Kompletne ograniczone JSON, pominięcie plików graficznych, potwierdzenie domeny/okna/próby/długości, timeout i ponowienie. Oba tryby przeglądarki sprawdzone w wersji75; nie potwierdza to odbioru e-maila. |
| S5-04: podsumowanie i eksport | PARTIAL | Edytowalne grupy i JSON istnieją. Eksport konfiguracji z pełnym Project, SHA256 i rewizją modelu/katalogu gotowy. Techniczna specyfikacja wykonawcza z BOM nadal pozostaje do wykonania. |
| S6: stabilizacja | PARTIAL | TypeScript, build i regresje są bramkami wdrożeń. Fizyczne urządzenia, czytniki ekranu i badania z klientami pozostają osobnymi zadaniami. |

## Wykonane kolejne etapy — 22.10.2026

| Etap | Status i granice |
|---|---|
| Rejestr zgodności rewizji | DONE — inwentaryzacja i integralność 42 plików: 10 live, 16 finalnych ASM/WEB, 16 warstw. Sześć z ośmiu R02 ma inny obrys; zgodne gabaryty pozostałych dwóch nie dowodzą równoważności. Stary zbiorczy QA ma nieaktualne hashe ośmiu Blenderów; poprawny agregat zapisano osobno w bibliotece roboczej. |
| Podmiana modeli R02 | PENDING — wszystkie releaseEligible=false. Obecne modele i ich ilości pozostają niezmienione. Pełne raporty wewnętrzne nie są publikowane w publicznym repozytorium. |
| S3-01: adapter i odzyskiwanie | DONE — lokalny zakres: stare JSON i nazwy własne, walidacja ID, kopia przed zastąpieniem, ochrona uszkodzonego szkicu, pobranie surowych danych, jawne wznowienie, błędy quota i konfliktów. |
| S3-03: nazwane warianty | DONE — do sześciu pełnych zapisów, porównanie dwóch planów 2D i parametrów, przywrócenie z Cofnij, kontrola sourceRevision, cofnięcie ostatniego usunięcia także po odświeżeniu. |

Dane przechowywane są w przeglądarce/profilu/kontekście strony, nie w chmurze. JSON zachowuje pełne grafiki i jest niezależną kopią. Nie prezentujemy nieaktualnej ceny wariantu: po przywróceniu działa bieżąca kalkulacja. Web Locks chronią współbieżny zapis szkicu tam, gdzie są obsługiwane; starsze karty i przeglądarki bez tej funkcji nie mają pełnej gwarancji atomowości.

## Kolejne wykonane prace — rejestr i specyfikacja

- **S4-01 PARTIAL:** rejestr56 cyfrowych artykułów; articleId/family/revision/unit i SHA256 źródła. Sprawdzono56 źródłowych hashy, unikalność ID i rewizję rejestru. Wszystkie approval/connectionApproval pozostają UNCONFIRMED. Nie opublikowano wewnętrznych modeli ani raportów.
- **S4-02 PARTIAL:** izolowany kontrakt GF-DIGITAL-ASSEMBLY-1 odrzuca mieszane rodziny, nieznane artykuły, obce URL, skalę, duplikaty i niezgodne rewizje. Wynik wylicza ilości z instancji, ale nie zatwierdza połączeń. Nie podłączono jeszcze technicznego edytora instancji do Studio ani nie zmieniono istniejącego silnika OS.
- **S4-04 PARTIAL:** eksport rozdziela swobodne obiekty od artykułów; nazwa dekoracji równa articleId nie daje jej statusu części konstrukcyjnej. Bez przebudowy starego Project JSON.
- **S5-04 PARTIAL:** w Podsumowaniu dostępny eksport GF-PROJECT-SPECIFICATION-1 z pełnym projektem/grafikami, deterministycznym SHA256 konfiguracji, rewizją modelu/katalogu i ilością nawierzchni. technicalBill.rows=null, ponieważ Studio nie ma zatwierdzonych instancji. Dostępny katalog rodziny nie jest BOM wybranego boiska. Aktualnych cen nie utrwalamy jako wiążącej wyceny.

## S3-02 — profil statycznych grafik

**DONE w zakresie profilu statycznego SVG:** wspólny validator w upload i projectSchema; zasięg obejmuje import, szkic, warianty, szablony, kalkulację i specyfikację. Poprawne grafiki zachowują dokładne bajty. Niedozwolone źródła są odrzucane przed zmianą projektu; recovery chroni surowy zapis. Mieszana paczka poprawnego/aktywnego SVG i odrzucony import sprawdzone w przeglądarce.

Profil odrzuca skrypty, zdarzenia, DTD/encje, animację, zewnętrzne odwołania i nieobsługiwane konstrukcje; do2MB UTF8/base64,10000tokenów,głębokość64. `use`, filtry, obrazy osadzone, arkusze style i metadane edytorów wymagają innego eksportu/PNG. Dotychczasowy kontrakt PNG zachowano; nie deklarujemy nowej walidacji sygnatur PNG ani gwarancji kosztu renderowania ścieżek/wzorów. Nie stwierdzono i nie deklarujemy wykazanego wcześniejszego XSS. Kontrakt opisuje ograniczenia.

Pracował prowadzący wdrożenie i trzech ekspertów: profil SVG, mapowanie komponentów OS i kolejność prac. Niezależny przegląd źródeł i testów nie znalazł blokującego obejścia ograniczonego profilu. Zweryfikowano także zgodność13 aktywnych GLB OS F05/F06/F07 z rejestrem poSHA; nie zmieniono konfiguracji OS ani modeli.

## Inspektor cyfrowej konfiguracji OS

**DONE — niezależny zakres cyfrowy:** w istniejących Plikach projektu dodano zwijaną sekcję kontroli natywnego eksportu GF-OWNED-ASSEMBLY-1. Ściśle sprawdzany pełny config generuje instancje przez przypiętą kopię istniejącego silnika; dołączone bom jest ignorowane. Mapowanie family+alias wiąże articleId/revision/sourceRevision.25 aktywnych zasobów sprawdzono poSHA; eksport zawiera rewizję silnika, katalogu i rejestru.

Testy obejmują594 konstrukcje i25 pojedynczych komponentów oraz4 odmowy całości SOURCE. Rodziny p1/o1/w1/street15 nie mają potwierdzonego rozbicia całości w tym silniku; ich skład nie jest zgadywany z katalogu. F01/F02/F03 umożliwiają dostępne pojedyncze części, street15 nie udostępnia trybu komponentu.

Wynik GF-OWNED-INSPECTION-1 pozostaje osobnym dokumentem: DIGITAL_INSTANCES_ONLY, manufacturingReady=false. UI nie otrzymuje setterów Project ani kalkulacji. Ręcznie potwierdzono28 instancji mimo fałszywego wejściowego bom999999, poprawny eksport i dokładną niezmienność projektu Studio po sukcesie/pobraniu/czyszczeniu/błędzie. Błąd usuwa poprzedni wynik. Wynik nie jest zapisywany w bibliotece ani do technicznego BOM Studio.

Prace prowadzono z ekspertami kontraktu/mapowania i UX/akceptacji; testy domenowe powstały niezależnie od adaptera. Natywny plik OS nie przypina historycznych zasobów: wynik używa źródeł sprawdzonych przy wydaniu inspektora i nie potwierdza zgodności dawnej wizualizacji.

## Kolejność dalszej pracy

1. **Dane wykonawcze:** zatwierdzić rewizje modeli, mapowanie instancji i transformacji, połączenia, kotwienie oraz fundamenty. Do tego czasu technicalBill.rows=null, manufacturingApproved=false i artykuły UNCONFIRMED.
2. **Cennik:** zastąpić robocze założenia potwierdzonymi ofertami, określić zakres montażu i transportu, podatki oraz warunki lokalizacji. Aktywna kalkulacja nie jest zatwierdzoną ofertą.
3. **Pełne wyposażenie3D:** przygotować własne modele brakujących akcesoriów i potwierdzić ich mapowanie; obecne A/B jawnie wskazuje zakres tylko2D.
4. **Badania i wydajność:** pomiary na fizycznych urządzeniach, czytniki ekranu i badania z klientami; ustalić budżet interakcji/SLA. Ograniczony profil V2 zachować oddzielnie od historycznego ABBA; ewentualne dalsze timeouty badać z diagnostyką generacji, obrazów i WebGL.

Pozostałe zależności WordPress: instalacja i osobista aktywacja WPCode przez właściciela, potwierdzone fakty prywatności, odbiór wcześniejszego pojedynczego testu poczty. Nie wysyłać kolejnych testów bez nowej instrukcji.

Historia badań i aktualny stan są rozdzielone. Nowa kontrola ilości korzysta z żywych źródeł Blender/GLB i ich SHA256; dokumenty kart produktów nie są automatyczną autoryzacją podmiany modeli.


## Historia — etap wymiarów v76

Studio wersja76; źródło `0e5000edf7d3c955518e8140af9d2dd10276885c`; deployment `appgdep_6ad920a463148191967a841c4190ba77` — succeeded. Testy TypeScript/build/test:studio/quote/construction-pricing/test:mobile PASS. Ręcznie sprawdzono Konstrukcję, źródło klawiaturą,375px oraz zgodność29,82m² w publicznym podsumowaniu i kalkulacji. [Raport wdrożenia](../../audits/2026-10-21/implementation/WDROZENIE.md).


## Wydanie odzyskiwania i wariantów

Źródło `d770de1a5fcb4e10c77ac80a6ff697d0d3e1b185`, zapisana wersja 77. Publikacja `appgdep_6ad99e344664819188ef8ec2e456a076` — **succeeded**, środowisko revision3. Na publicznym Studio sprawdzono nowe sekcje i działającą cenę konstrukcji; dane użytkownika nie były zastępowane wariantami QA. Potwierdzenie: raport WDROZENIE.md. Kontrakt: [PROJECT_RECOVERY_VARIANTS](../../../integrations/studio/canvas-editor/docs/PROJECT_RECOVERY_VARIANTS.md).

PASS: TypeScript, build, test:studio (w tym project-vault/draft-write), quote-engine, construction-pricing, pełne test:mobile na 375/390/430/1440. Ręcznie lokalnie sprawdzono uszkodzony szkic, odzyskanie, zapis A/B, porównanie, pobranie pełnego JSON, przywrócenie/Cofnij i cofnięcie usunięcia po ponownym wczytaniu. Widok 375px bez poziomego przepełnienia. Testy lokalnego zbudowanego Workera nie oznaczają testu fizycznego telefonu.


## Wydanie rejestru i specyfikacji — Studio78

22.10.2026, źródło `dd5856cc2a9b67d54b09ca67bd1580ea2125bf5b`, wersja `appgprj_6abbd0ba26f0819197701343bf156f1b~appgver_f5da9ba168f48191baee4e21cf9f4152`, deployment `appgdep_6ad9a4d7865c8191934cd1af12ee1e6f` — **succeeded**, środowisko revision3. [Studio](https://gamefields-studio.ryhfs90.chatgpt.site). Paczka zgodna ze źródłem, SHA256 `1381653a8a87b566c99a2b0bd0233f09495e020f7f8381eb3427f244ddd52bb8`.

PASS: TypeScript, build, test:studio, component-specification, weryfikacja56 źródeł, quote-engine, construction-pricing i pełne test:mobile (96aren,48Street,16materiałów,JSON,Radar;375/390/430/1440). Rzeczywisty pobrany eksport ma poprawny kod GF-CT-008, powierzchnię29,823379m², pełny projekt i SHA zgodny z niezależnym odtworzeniem. Na375px brak przepełnienia, przycisk50px i tekst16px. Brak testu fizycznego urządzenia i czytnika ekranu. Bez wysyłania formularzy, zmian SQL, podmiany R02 lub stawek.

Kontrakt i ograniczenia: [COMPONENT_SPECIFICATION](../../../integrations/studio/canvas-editor/docs/COMPONENT_SPECIFICATION.md). Rejestr cyfrowy i gotowy adapter nie oznaczają wdrożonego technicznego BOM. Jego status pozostaje PARTIAL; rows=null w specyfikacji jest celowe.


## Wydanie profilu grafik — Studio79

22.10.2026: źródło `6064726a56ee7f67de8dea67e8ebf535a6968ef1`, wersja `appgprj_6abbd0ba26f0819197701343bf156f1b~appgver_38006ef1d96081918b36e73454fd0ba8`, deployment `appgdep_6ad9aaf1e1288191bdc0aeb4d418280a` — **succeeded**, środowisko revision3. [Studio](https://gamefields-studio.ryhfs90.chatgpt.site). Paczka SHA256 `0993fcf376a91fc718280fb20440c068276fdde287bdd306b9b86b5f7edd1f32`.

PASS: TypeScript/build/test:studio, graphic-source-policy, graphic-boundaries, quote-engine/construction-pricing, pełne test:mobile oraz Surface7viewport. Ręcznie: mieszana paczka dodała poprawne SVG i odrzuciła aktywne; eksport zachował dokładne bajty poprawnego SVG i nie zawierał odrzuconego obiektu. Nieprawidłowy import pozostawił konfigurację dokładnie bez zmian; poprawny import potwierdzono nazwą. Na375px brak przepełnienia, tekst informacji14px. Bez testu fizycznego telefonu, gwarancji kosztu renderowania lub pełnej walidacji PNG.

Kontrakt: [GRAPHIC_SOURCE_POLICY](../../../integrations/studio/canvas-editor/docs/GRAPHIC_SOURCE_POLICY.md). Nie zmieniono modeli R02, stawek ani SQL; nie wysłano formularza. Dane produkcyjne nie otrzymały testowych grafik.


## Wydanie inspektora OS — Studio80

22.10.2026: źródło `3a75f940c647312fb9f562ef0175a6eb858bf652`, wersja `appgprj_6abbd0ba26f0819197701343bf156f1b~appgver_e459c0510a0c8191802e879a0fea8c00`, deployment `appgdep_6ad9b14bfc408191a821a28a737fad34` — **succeeded**, środowisko revision3. [Studio](https://gamefields-studio.ryhfs90.chatgpt.site). Paczka SHA256 `ed0dd62684b94b79af9be470e582e72c7972e2e72b544e8c4efc8486662585de`.

PASS: TypeScript/build/test:studio,594 konfiguracje konstrukcji+25 części, walidacje negatywne i4 odmowy SOURCE,25 hashy runtime, quote-engine/construction-pricing, pełne test:mobile i Surface7viewport. Pierwszy test mobilny zatrzymał niejednoznaczny selektor dwóch pól JSON; pola nazwano osobno, selektory doprecyzowano i pełną regresję powtórzono z wynikiemPASS.

Ręczny test zbudowanego Workera: fałszywe bom999999 pominięte, wynik28 instancji, eksport manufacturingReady=false. Aktywny Project dokładnie niezmieniony po inspekcji/pobraniu/czyszczeniu/błędzie; wynik po odświeżeniu nie jest zachowywany.375px bez przepełnienia, tabela325px/tekst16px, przycisk46px. Bez deklaracji fizycznego urządzenia lub zatwierdzenia wykonawczego.

Kontrakt: [OWNED_CONFIGURATION_INSPECTOR](../../../integrations/studio/canvas-editor/docs/OWNED_CONFIGURATION_INSPECTOR.md). Nie zmieniono R02, stawek, SQL ani silnika aktywnego OS; nie wysyłano formularzy. Na potrzeby paczki usunięto jedynie odtwarzalne archiwa już opublikowanych wydań78/79, zachowując źródła i raporty.


## Historia — przygotowanie pomiarów i usunięta blokada ENOSPC, 22.10.2026

Poniższy zapis opisuje wcześniejszą próbę. Aktualny stan: pełne pomiary i bramki ukończone; Studio81 opublikowane, szczegóły niżej.

**PARTIAL — kod lokalny, nieopublikowany.** Prowadzący pracował z dwoma ekspertami: scenariusza pomiarowego oraz niezależnego przeglądu renderera. Przygotowano `tests/renderer-baseline.mjs`: 8 modeli ×2 szerokości375/1440 ×5 powtórzeń ×6 operacji, łącznie480 planowanych próbek. Operacje: start w nowym kontekście, druga nawigacja w tym samym kontekście, kolor paneli, tekst paneli, import projektu z SVG500 ścieżek oraz ponowne rysowanie z cache. W1 wymaga jawnego historycznego szkicu, nie stanowi nowej pozycji oferty.

Punkt końcowy to wydanie ostatniego draw dla aktualnej generacji po oczekiwaniu na jej tekstury, nie prezentacja GPU ani FPS. Profil: lokalny zbudowany Worker, Chromium/SwiftShader, DPR1; cache przeglądarki i cache systemu rozróżnione. Przygotowany skrypt nie jest dowodem wykonania pomiarów.

Ekspert wykrył wyścig: kolejne wywołanie tej samej tekstury mogło pominąć jeszcze trwające dekodowanie. Kandydat współdzieli obietnicę dekodowania/uploadu i generowania grafiki panelu; anulowana generacja nie zgłasza zakończenia. Niezależny ponowny przegląd nie znalazł kolejnego blokera tej synchronizacji. Dedykowane testy współbieżności, błędu/retry, nadpisania, clear/reload i dispose przeszły. To nie zastępuje pełnej regresji przeglądarkowej.

**Blokada środowiska:** kompilacja zakończyła się ENOSPC przy kopiowaniu publicznego zasobu; odczyt wykazał28MB wolnego miejsca. Późniejsza próba TypeScript z zapisem tsbuildinfo także zatrzymała się ENOSPC. Nie uzyskano pełnych wyników baseline ani nowego kompletu bramek publikacji. Nie deklarujemy poprawy czasu ani gotowego budżetu wydajności. Publiczne Studio nadal v80; bieżący kandydat nie został wdrożony. Dalsza próba usunięcia niepełnego dist nie została wykonana, ponieważ automatyczna kontrola zatwierdzenia nie mogła otworzyć pliku blokady z powodu ENOSPC; nie była to ocena polecenia jako niebezpiecznego.

Następny krok po zwolnieniu min.1GB: hashe wejść pomiaru, build, smoke scenariusza, pełne480 próbek, analiza median/maksimów, regresje mobile/materials/cameras/JSON/Radar, budżet oparty na wynikach i publikacja. Powiązanie OS–Project pozostaje kolejnym etapem, a techniczny BOM nadal rows=null.


## S2-04/S6 — pierwsza baza pomiarowa renderera, 22.10.2026

**DONE — scenariusz i pierwsza lokalna baza. PARTIAL — cały etap wydajności/budżetu.** Po zwolnieniu miejsca build i pomiary zostały ukończone. Pełna macierz8 modeli ×2szerokości375/1440 ×5powtórzeń ×6operacji: **480próbek,96komórek,0błędów**. Niezależny ekspert odtworzył wszystkie mediany/maksima oraz sprawdził hashe wejść i geometrii.

| Operacja | Zakres median [ms] | Maksimum próbek [ms] |
|---|---:|---:|
| startup-fresh-context | 303.7–818.8 | 4225.4 |
| startup-same-context-navigation | 320.3–924.4 | 1035.5 |
| panel-colour | 3.2–51.0 | 106.9 |
| panel-text | 187.1–2208.6 | 2218.8 |
| complex-project-import | 37.6–78.7 | 110.1 |
| complex-scene-cached-redraw | 197.0–2027.0 | 2269.3 |

Mierzono finalne wydanie draw aktualnej generacji po oczekiwaniu na jej tekstury, nie prezentację GPU ani FPS. Lokalne środowisko AppleM1/Darwin23.4.0, Node24.19.0, Chromium149.0.7827.55, SwiftShader, DPR1. Nowy kontekst nie oznacza zimnego cache systemu; druga nawigacja nie gwarantuje pełnego trafienia cache i nie zawsze była szybsza. W1 używa jawnego historycznego szkicu; pozostałe modele publicznego parametru arena.

Złożony import obejmuje walidację JSON, backup recovery i renderowanie SVG500statycznych ścieżek. Późniejsze cached-redraw jest osobną operacją. Najwolniejsza mediana tekstu paneli2208,6ms: Circle Cage2/1440. Generowanie/dekodowanie/upload/draw grafik paneli to pierwszy obszar do profilowania; sam test nie rozdziela ich kosztów. Zachowano pojedynczy start4225,4ms. Brak porównywalnego pomiaru v80, więc nie deklarujemy przyspieszenia przed/po.

Poprawka współdzieli Promise dekodowania/uploadu i leniwego generowania paneli; aktualna generacja prawidłowo oczekuje pracy, anulowana nie publikuje zakończenia. Testy pokrywają współbieżność, nadpisanie, clear/reload, błąd/retry i dispose. To poprawka synchronizacji, nie zmiana modeli czy stawek.

Zasady dalszego porównania: pięć surowych próbek każdej komórki, mediana, różnica ms/% i maksimum obu serii. Bez p95 przy n=5. Zmieniony sprzęt/runtime/fixture/DPR/cache wymaga nowej bazy. Wzrost wymaga naprzemiennego ponowienia bazowej i nowej serii; pojedynczy max nie stanowi SLA. Budżet liczbowy pozostaje PENDING do pomiaru rozrzutu między seriami i uzgodnienia celów produktu/urządzeń.

[Metoda i wyniki](../../../integrations/studio/canvas-editor/docs/RENDERER_BASELINE.md), [surowe480próbek i hashe](../../../integrations/studio/canvas-editor/docs/renderer-baseline-2026-10-22.json). Nie przeprowadzono testu fizycznego telefonu ani prezentacji GPU.


## Wydanie pomiarów i synchronizacji tekstur — Studio81

22.10.2026: źródło `e1e6666b96e006c72ab4ebc0e0a953d36214fabf`, wersja `appgprj_6abbd0ba26f0819197701343bf156f1b~appgver_c7ff626b281481918336f9feeb61301d`, deployment `appgdep_6ad9f5cc257c81919909cfa4e060c6f2` — **succeeded**, środowisko revision3. [Studio](https://gamefields-studio.ryhfs90.chatgpt.site). Paczka `sha256:120efbb0bf9f646c765b4c12feb17f3e5537bf9a380267e500d091b2d5574613`.

PASS: TypeScript/build/test:studio, renderer-texture-jobs, quote-engine/construction-pricing, pełne test:mobile (96aren/48Street/16materiałów,JSON,Radar;375/390/430/1440) i Surface7viewport. Pełne480próbek lokalnego renderera/96komórek/0błędów; niezależna kontrola hashów, median i maksimów PASS. Poprawiono oczekiwanie na współdzielone dekodowanie/upload tekstur. Brak deklaracji porównawczego przyspieszenia v80→v81, FPS, prezentacji GPU lub testu fizycznego telefonu. Budżet liczbowy i profilowanie paneli nadal PENDING.

Kompilacja i testy ukończone po zwolnieniu miejsca; wcześniejsza blokada ENOSPC jest historyczna. Modele, cennik i SQL niezmienione; nie wysłano formularzy.


## S2-04/S6 — profilowanie i pierwsza optymalizacja paneli

**DONE — ograniczony zakres profilowania, współdzielenia PNG i porównania. PARTIAL — pozostałe koszty renderera oraz budżet czasowy.** Powtórzona baza v81 i kandydat: po **480 próbek / 96 komórek / 0 błędów**; **48/48 końcowych obrazów canvas trzech kamer identycznych**. Hashy kodu aplikacji bazy sprawdzono z opublikowanym źródłem v81; hashe kandydata są zapisane w surowych wynikach. Wcześniejsza pierwsza baza pozostaje historyczna.

| Circle Cage 2 — mediana | Przed [ms] | Po [ms] | Zmiana |
|---|---:|---:|---:|
| Tekst paneli / 375 px | 1071,6 | 911,4 | −14,9% |
| Tekst paneli / 1440 px | 2017,2 | 1812,4 | −10,2% |
| Złożona scena: zmiana koloru / 375 px | 1026,2 | 748,8 | −27,0% |
| Złożona scena: zmiana koloru / 1440 px | 1894,0 | 1575,1 | −16,8% |

To obserwacje jednej lokalnej pary serii na M1/Chromium/SwiftShader/DPR1, nie FPS, prezentacja GPU, telefon lub SLA. Wszystkie 16 median panel-text zmalało; przy złożonym przerysowaniu poprawa w 15/16 komórek. Łącznie 55 median zmalało, 37 wzrosło, 4 bez zmiany. P1/375: 533→544,5 ms przy nakładających się zakresach i niższym maksimum. Zachowano także wyższe maksima P1/1440 i Circle Cage 1/1440, wzrost mediany drugiej nawigacji do 59,6 ms oraz importu W1/375 o 16,9 ms. Nie deklarujemy przyspieszenia każdej operacji lub próbki.

Profil z licznikami jest oddzielny od pomiaru czasu. Potwierdził 16→1 kodowań PNG / rysowań tekstu, przy niezmienionych 16 uploadach. Czas wywołania texImage2D nie jest pomiarem GPU; suma nakładających się image.onload nie jest czasem całej operacji. Deterministyczny budżet tej iteracji: najwyżej jedno kodowanie PNG na unikalną recepturę w generacji. Budżet liczbowy czasu pozostaje do ustalenia na podstawie rozrzutu i celów urządzeń.

Cache używa dokładnego rozmiaru, koloru, tekstu i logo; pozostaje lokalny dla generacji, a błąd usuwa wpis do retry. Zachowano dotychczasowy klucz tekstur, anulowanie i mapowanie stron. Test pikseli obejmuje cztery warianty oraz różne szerokości w tej samej pamięci cache. Pierwszy harness wyczerpał pamięć przy przekazywaniu całych geometrii; ograniczono go do potrzebnych paneli {id,group,v}, bez zwiększania heap. Poprawiony test i ponowienie przeszły.

Znany wcześniejszy problem pozostaje jawny: ID paneli Circle Cage 2 nie mają końcówek inner/outer, więc obecny filtr nie mapuje poprawnie wyboru stron. Ta optymalizacja go nie naprawia; kontrola 48 obrazów dotyczy side=both. Osobny kontrakt stron/meshów ma kolejny priorytet.

[Metoda, wyniki i ograniczenia](../../../integrations/studio/canvas-editor/docs/PANEL_ARTWORK_OPTIMIZATION.md), [pełne porównanie](../../../integrations/studio/canvas-editor/docs/panel-artwork-2026-10-22/comparison.json).


## Wydanie optymalizacji grafik paneli — Studio 82

22.10.2026: źródło `6bfcc1f5d961e43a6986c4ac1d3d308a4a753c7d`, wersja `appgprj_6abbd0ba26f0819197701343bf156f1b~appgver_a2da575e41c881919ac92b1cf03609c7`, deployment `appgdep_6ad9fc6852fc8191b7c715a7acf0a8ed` — **succeeded**, środowisko revision 3. [Studio](https://gamefields-studio.ryhfs90.chatgpt.site). Paczka `sha256:5e09cdd1077cc0d66579977fbe2c80e406d7f1eef064c699ffc137a96d8022df`.

PASS: TypeScript, build, test:studio, quote-engine/construction-pricing, pełne test:mobile (96 scen aren, 48 Street, 16 zmian materiałów, JSON i Radar; 375/390/430/1440) oraz Surface w 7 rozmiarach widoku. Test 138 paneli / 21 szerokości / 84 dokładnych porównań RGBA, cache i retry PASS. Pracowali prowadzący oraz eksperci scenariusza/testów i niezależnego przeglądu; sprawdzono recepturę, integrację, hashe i wyniki.

Współdzielenie PNG ograniczono do jednej generacji aktualizacji. Circle Cage 2: **16→1 kodowań PNG**, ale nadal 16 uploadów oraz osobne tekstury GPU. Bez zmian geometrii, źródeł modeli, cennika, SQL i Project JSON; nie wysyłano formularzy.

Publiczny odczyt po publikacji: zachowany szkic Panna Octa, cena częściowa 15 300 zł, model octagon data-ready=true, żądanie i zakończenie generacji zgodne (1/1). Nie wstawiano grafik QA do projektu użytkownika.


## Wykonany kolejny etap — strony paneli Circle Cage

**DONE — kontrakt wizualizacji Circle Cage 1 i 2.** Wybranie inner/outer wcześniej usuwało grafikę, ponieważ selektor sprawdzał końcówki ID nieobecne w modelach. Wyznaczamy teraz kierunek fasety siatki z geometrycznej normalnej i promienia XZ względem środka boiska. Kosinus poniżej −0,05 oznacza inner, powyżej +0,05 outer, pozostałe fasety są styczne. Nie przenosimy reguły poziomych krawędzi z czytnika W1 na pręty Circle Cage.

| Model | Panele źródłowe | Inner | Outer | Styczne |
|---|---:|---:|---:|---:|
| Circle Cage 1 | 8 | 13 560 | 13 568 | 11 632 |
| Circle Cage 2 | 16 | 28 304 | 28 312 | 24 456 |

Both pozostawia oryginalną tablicę i meshe. Inner/outer używa dwóch podzbiorów każdego panelu: grafika na wybranych fasetach, bazowy panelColor na pozostałych. Zachowane wszystkie trójkąty, winding, UV i referencje wierzchołków/normals; dane źródłowe nie są przepisywane. Podział runtime nie dodaje artykułów do katalogu ani BOM. Liczba runtime meshes wzrasta tylko jednostronnie: 19→27 i 35→51. To jawny koszt dodatkowych wywołań draw, nie optymalizacja GPU. Przy aktywnej grafice nadal 8/16 dużych tekstur plus białe 1×1 niewybranych podzbiorów.

Efekt rysowania zależy także od meshes, dzięki czemu nowa geometria po fetch nie polega na zbatchowanym przejściu ready. Pustą geometrię podczas ładowania pomijamy. Test obejmuje Circle1 inner → Circle2 inner → odświeżenie.

58 przypadków przeglądarkowych w 375/1440 sprawdza trzy strony i kamery, powrót do both, kolory, usunięcie grafiki, pełny JSON i odtworzenie szkicu. Niezależny oracle z oryginalnych źródeł porównuje faktyczne bufory Float32 WebGL (pozycje, normalne, UV, winding), przypisanie tekstury, kolor, liczbę draw oraz niepusty canvas bez błędów GL. Nie importuje produkcyjnego klasyfikatora. Dodatkowe 48 obrazów both dla ośmiu modeli jest identycznych z wersją 82.

Harness odtwarzania początkowo używał adresu z arena, który zgodnie z istniejącym kontraktem otwiera nowy model. Test doprecyzowano do zapisu/odtworzenia przez / oraz sprawdzenia side w eksporcie. Nie zmieniono hooka odzyskiwania ani reguł wejścia URL.

To podział **wizualizacji siatki**, nie dokumentacja dwóch płaskich powierzchni drukowych lub zatwierdzenie technologii nadruku. Zatwierdzenia części/połączeń pozostają UNCONFIRMED, technicalBill.rows=null i manufacturingReady=false.

[Kontrakt i dowody](../../../integrations/studio/canvas-editor/docs/CIRCLE_PANEL_SIDES.md), [58 przypadków](../../../integrations/studio/canvas-editor/docs/circle-panel-sides-2026-10-22/browser.json), [porównanie both](../../../integrations/studio/canvas-editor/docs/circle-panel-sides-2026-10-22/comparison.json).


## Wydanie stron grafiki Circle Cage — Studio 83

22.10.2026: źródło `4696d69ed692096def01d6b7ee69b3e2cdcf00ea`, wersja `appgprj_6abbd0ba26f0819197701343bf156f1b~appgver_c188c3cc6944819186c0895a39c89731`, deployment `appgdep_6ada10548ccc81919c441b043ef9acde` — **succeeded**, środowisko revision 3. [Studio](https://gamefields-studio.ryhfs90.chatgpt.site). Paczka `sha256:23bd11537f7f07353a455814358bc30896143a562f294ef29adeef107b773686`.

PASS: TypeScript, build, test:studio (w tym circle-panel-sides), quote-engine/construction-pricing, pełne test:mobile (96 scen aren, 48 Street, 16 zmian materiałów, JSON i Radar; 375/390/430/1440) oraz Surface w 7 rozmiarach. Własne testy stron: 24 panele, 58 przypadków niezależnego oracle WebGL, pełna macierz 480 próbek / 96 komórek / 0 błędów; **48/48 obrazów both identycznych z wersją 82**. Pracowali prowadzący i eksperci geometrii/testów oraz niezależnego przeglądu. Sprawdzono aktualne hashe kodu i wszystkie źródła modeli.

Bez podmiany modeli, R02, cen, SQL lub Project JSON. Nie zmieniono rejestru artykułów ani nie utworzono technicznego BOM. Nie wysłano formularzy i nie zmieniono polityki otwierania projektu z parametru arena.

Publiczny odczyt po publikacji: zachowany szkic Panna Octa, częściowa cena 15 300 zł, model octagon gotowy, zgodne żądanie/zakończenie generacji 2/2. Nie dodawano grafiki QA do projektu użytkownika.


## Powiązanie wersji Studio i OS — Studio 84

23.10.2026: źródło `ac6bd265b1f8e04f93d2c191f199775153f82dd4`, wersja `appgprj_6abbd0ba26f0819197701343bf156f1b~appgver_b18ffed4eb488191998622b059a37538`, deployment `appgdep_6adaeab01168819191c9c8a745a6f643` — **succeeded**, środowisko revision 3. [Studio](https://gamefields-studio.ryhfs90.chatgpt.site). Paczka `sha256:7ebac865de864c129348a3d52c2547bb0d39056ee40bfbf6891ea8af96033fc5`.

**DONE — referencja dwóch wersji danych.** W Plikach projektu użytkownik jawnie tworzy i pobiera `GF-PROJECT-OWNED-REFERENCE-1`: pełny Project z grafikami i nazwami, znormalizowany config OS, SHA256 projektu/config/odtworzonego wyniku oraz rewizje modelu, silnika, katalogu i rejestru. Import ponownie waliduje dane i odtwarza instancje; nie ufa wejściowemu bom. Wymagana jedna zgodna rodzina i właściwa liczba poziomów Circle. Pojedynczy komponent nie jest referencją całego boiska.

Zmiana aktywnego Project oznacza zapis historyczny, powrót do identycznego projektu przywraca status zgodny. Nowy plik lub błąd usuwa wcześniejszy sukces; tokeny operacji chronią przed spóźnionym odczytem. Limit 13 000 000 bajtów, pełne grafiki bez cichego pomijania. Manifest nie zmienia projektu, szkicu, historii lub wyceny. SHA jest kontrolą integralności, nie podpisem autora.

**PARTIAL pozostaje integracja techniczna:** geometryCorrespondence=UNCONFIRMED, manufacturingReady=false, technicalBill.rows=null, pricing=NOT_INCLUDED. Circle OS ma podłoże7,1m wobec6m w Studio; Grid ma różnice obrysu. Zgodny wymiar referencyjny Octagon nie dowodzi zgodności trójkątów/transformacji. Nie dopisujemy ilości OS do kosztorysu Studio. Nadal wymagane zatwierdzone geometria, połączenia, rozstawy, R02 i artykuły wykonawcze.

PASS: TypeScript, build, test:studio (nowe testy kontraktu), quote-engine/construction-pricing, pełne test:mobile (96 scen aren,48Street,16zmian materiałów, JSON i Radar na375/390/430/1440) i Surface7rozmiarów. Dodatkowe10scenariuszy375/1440 sprawdza rzeczywisty download z SVG, import, status zgodny/historyczny/powrót, odrzucenie zmienionego pliku/rodziny, spóźniony odczyt oraz brak zmiany pełnego Project i ceny. Pierwsze rozszerzenie harnessu wymagało oczekiwania na opóźnioną wycenę celowo importowanej grafiki; poprawiono synchronizację testu, bez zmian aplikacji.

Pracowali prowadzący i eksperci kontraktu, geometrii oraz regresji przeglądarkowej. Zachowane modele, cennik, SQL, format Project oraz wcześniejsze poprawki renderera; nie wysyłano formularzy. Nie powtarzano macierzy czasowej renderera, którego kod nie był zmieniany.

[Kontrakt](../../../integrations/studio/canvas-editor/docs/PROJECT_OWNED_REFERENCE.md), [10 przypadków przeglądarkowych](../../../integrations/studio/canvas-editor/docs/project-owned-reference-2026-10-23/browser.json).


## Współdzielenie obrazów paneli — Studio 85

23.10.2026: źródło `caa36c932f55228d06174b9c4883953e0cb0c48f`, wersja `appgprj_6abbd0ba26f0819197701343bf156f1b~appgver_01d3cd93d208819190c828951ce77e69`, deployment `appgdep_6adaee70b7e88191883143bb8c43be4b` — **succeeded**, środowisko revision 3. [Studio](https://gamefields-studio.ryhfs90.chatgpt.site). Paczka `sha256:75489be91390827a600a083b56152e8bbbf78b34d7c35b9f9b563dc753090043`.

**DONE — ograniczony zakres wczytywania identycznych PNG.** Każda generacja ma własny cache Promise<HTMLImageElement> po dokładnym źródle obrazu. Panele współdzielą wczytany Image, a odrzucona Promise jest usuwana do ponowienia. Zachowane osobne tekstury GPU, uploady i draw, klucze zadań mesha, oczekiwanie drugiego konsumenta i odrzucanie starej/zniszczonej pracy. Podłoże, materiały, shader i geometria pozostają bez zmian.

Porównanie ze zbudowaną wersją84: **48/48 stanów identycznych pikselowo**, także bufory Float32, UV, winding, kolory i eksport design. Dwa Circle Cage ×375/1440px ×both/inner/outer ×tekst/kolor/logo/usunięcie. Przy grafice liczba panelowych Image load wynosi **8→1 oraz16→1**, uploady nadal8/16. Wszystkie liczniki uploadów, clear i drawArrays identyczne; jednostronne podzbiory pozostają droższe. Surowe raporty mają hashe uruchomionych paczek, nie przypisują zmienianych źródeł do wcześniejszego buildu. W bazie doprecyzowano metadane szerokości viewport/canvas bez zmiany wyników.

Image load liczy zdarzenia przeglądarki, nie pracę wewnętrznego dekodera CPU. **Nie deklarujemy FPS, czasu GPU ani uniwersalnego przyspieszenia.** Nie powtarzano historycznej macierzy480czasów; pomiar rozrzutu i budżet SLA pozostają PENDING. Następny etap wydajności: profil upload/draw i ewentualna osobna, zweryfikowana zmiana batchowania.

PASS: TypeScript, build, test:studio (dekoder i per-mesh jobs; sekwencyjne stuby Image), quote-engine/construction-pricing, pełne test:mobile (96scen aren/48Street/16materiałów, JSON i Radar,375/390/430/1440), Surface7rozmiarów oraz58przypadków stron paneli. Eksperci przygotowali kod, porównanie przeglądarkowe i niezależny przegląd; prowadzący osobno sprawdził wszystkie48par i SHA raportów. Bez podmiany modeli/R02, cen, SQL, formatu Project ani technicznego BOM; nie wysyłano formularzy.

[Kontrakt](../../../integrations/studio/canvas-editor/docs/DECODED_PANEL_IMAGES.md), [48porównań](../../../integrations/studio/canvas-editor/docs/decoded-panel-images-2026-10-23/comparison.json), [baza84](../../../integrations/studio/canvas-editor/docs/decoded-panel-images-2026-10-23/baseline.json), [kandydat](../../../integrations/studio/canvas-editor/docs/decoded-panel-images-2026-10-23/candidate.json).


## Wspólne końcowe rysowanie paneli — Studio 86

23.10.2026: źródło `b7e51aa100bdc628aa3a0127dc77171a3fbf9b9a`, wersja `appgprj_6abbd0ba26f0819197701343bf156f1b~appgver_144eedff2b94819198df81d016ea54f7`, deployment `appgdep_6adaf47b2e388191b78d1f96029ad5f5` — **succeeded**, środowisko revision 3. [Studio](https://gamefields-studio.ryhfs90.chatgpt.site). Paczka `sha256:82968f5179330bb21fc5770c9d600841171d931ee44709c72c667efa38e2cb05`.

**DONE — redukcja pośrednich rysowań paneli.** Opcja drawAfterUpload jest domyślnie włączona; tylko panelowe uploady ją wyłączają. Aktywna generacja czeka na wszystkie wyniki przez allSettled i rysuje wynik raz. Nieudane tekstury są czyszczone do białego obrazu przed rysowaniem, pozostawiając bazowy kolor panelu; błąd jest widoczny, bez znacznika ukończenia. Anulowana generacja nie czyści nowszej pracy ani nie ogłasza ukończenia. Nie ma globalnego licznika batchowania. Podłoże, materiały, picking i resize zachowują swoje ścieżki; resize może nadal pokazać stan częściowy, więc nie deklarujemy atomowej transakcji obrazu.

**48/48 stanów zgodnych pikselowo z wersją85**, również bufory geometrii/normalnych/UV, winding, kolory i eksport design. Dwa Circle Cage ×375/1440px ×both/inner/outer ×tekst/kolor/logo/usunięcie. W36stanach z grafiką mniej clear/drawArrays;12stanów usunięcia bez zwiększenia pracy. Image load i uploady niezmienione. Przykład Circle2 tekst: obie strony **19→3 clear oraz665→105 drawArrays**, jednostronnie **19→3 oraz969→153**. Circle1 odpowiednio209→57 i297→81. Trzy clear obejmują także początkowy widok i ResizeObserver; nie obiecujemy jednego draw łącznie.

Dwa izolowane scenariusze375/1440 w prawdziwym React/WebGL potwierdzają wymuszony błąd PNG→alert/ready=false/brak fałszywego complete, następnie poprawne retry. Opóźniony obraz poprzedniej edycji zwalniany dopiero po ukończeniu nowszej edycji nie zmienia pikseli ani numeru generacji. Testy helpera obejmują także częściowy sukces, błąd połączony z wolniejszym zadaniem i first-job policy współdzielonej Promise. Początkowy ENOENT w adaptacji harnessu wynikał z katalogu raportu; poprawiono test, bez zmian aplikacji.

PASS: TypeScript, build, test:studio, quote-engine/construction-pricing, pełne test:mobile (96aren/48Street/16materiałów/JSON/Radar,375/390/430/1440), Surface7rozmiarów,58przypadków stron paneli,48porównań i dwa scenariusze błędów/wyścigów. Pracowali eksperci implementacji, przeglądu i przeglądarki; prowadzący niezależnie porównał48par oraz zachował hashe raportów. Nie zmieniano geometrii/R02, stawek, SQL, formatu Project lub technicznego BOM; nie wysyłano formularzy.

Liczniki oznaczają zgłoszenia aplikacji, **nie FPS lub czas GPU**. Nie wykonano nowej macierzy480czasów; rozrzut, budżet i fizyczne urządzenia nadal wymagają pracy. Następne: profil pozostałych uploadów, porównywalne serie czasu; osobno zatwierdzone mapowanie geometrii OS–Studio i dane wykonawcze przed BOM.

[Kontrakt](../../../integrations/studio/canvas-editor/docs/PANEL_UPLOAD_BATCH.md), [porównanie48stanów](../../../integrations/studio/canvas-editor/docs/panel-upload-batch-2026-10-23/comparison.json), [błędy i wyścigi](../../../integrations/studio/canvas-editor/docs/panel-upload-batch-2026-10-23/failure-browser.json).


Dodatkowa kontrola zastąpienia wcześniejszej poprawnej grafiki: obraz po błędzie jest identyczny z pustym panelem. Początkowy punkt odniesienia testu był pobierany przed ResizeObserver po otwarciu Konstrukcji na telefonie; poprawiono stabilizację i kontrolę wymiarów, bez zmian aplikacji. Trzy SHA i rozmiary zapisane w raporcie błędów.


## Puste tekstury i audyt geometrii — Studio 87

23.10.2026: źródło `46dec70f4af0e0dc0ed3c2a95193a602ae5f3ff8`, wersja `appgprj_6abbd0ba26f0819197701343bf156f1b~appgver_9747874feea881918c54184f09b6c1b3`, deployment `appgdep_6adb36f5227c8191b0a596985cac5a5f` — **succeeded**, środowisko revision 3. [Studio](https://gamefields-studio.ryhfs90.chatgpt.site). Paczka `sha256:6f7db90490f7c289501abdabcdbbe5bf19cf7333555dbc94fb1ab7fb6e2e9fc4`.

**DONE — zbędne białe uploady.** Osobna flaga whiteTexture opisuje stan GPU niezależnie od klucza zadania. clearTexture zawsze najpierw unieważnia klucz, lecz pomija upload do już białej tekstury. Grafika i błąd pozostawiający wcześniejszy obraz nadal wymagają czyszczenia; flaga zmienia się dopiero po udanym uploadzie. Zachowane retry, stare/zniszczone zadania, cache PNG/Image i wspólne końcowe rysowanie.

**60/60 stanów zgodnych pikselowo z wersją86**: oba Circle Cage ×375/1440 ×both/inner/outer ×tekst/kolor/logo/usunięcie/ponowny kolor pustych paneli. Bufory geometrii/normalnych/UV, kolory, eksport design, Image load, uploady PNG i clear/drawArrays identyczne. W44 stanach mniej białych resetów. Circle2 jednostronnie tekst/kolor/logo: wszystkie uploady **32→16** (16 PNG i0zbędnych białych); usunięcie grafiki nadal wykonuje16 wymaganych białych resetów. Kolejna zmiana koloru pustych paneli daje0 zamiast16/32. Circle1 analogicznie8 paneli. To liczba zgłoszeń aplikacji, nie FPS, czas GPU lub oszczędność pamięci.

Początkowy odczyt liczników przechwycił dodatkową klatkę ResizeObserver tylko w jednej serii. Dodano stabilizację po dwóch klatkach i powtórzono obie serie: baza pochodzi z zachowanego archiwum86, a jej hashe paczek są identyczne z opublikowanym86. Nie osłabiono asercji. Pierwsza równoległa regresja mobilna zatrzymała się na kliknięciu kamery; pełne testy ponowiono sekwencyjnie. Ponowiony test błędu po wcześniejszej grafice, pustego wyglądu, retry i opóźnionego obrazu PASS375/1440.

**DONE — inwentaryzacja zgodności, bez zatwierdzenia geometrii.** Nowy deterministyczny skrypt mierzy osiem aktualnych rewizji Studio i weryfikuje ich źródła, przypięty silnik/katalog/rejestr oraz25/25 komponentów OS. Dwa uruchomienia dały identyczny JSON SHA256 `9bc4dfd3420a87d7d04bd5be1c5e4e12e848326d6ebee0b18ab7ceae986ed1ae`. Cztery rodziny źródłowe nie mają potwierdzonego złożenia OS. Deskryptor Circle ma średnicę podłoża7,1m wobec6m Studio; Grid7,31×5,304 wobec7,3×5,3. Octagon wymaga przypiętego mesha/orientacji podłoża; porównanie jego pola i obrysu pozostaje null. Różne metody pomiaru i deskryptory nie dowodzą wady wykonawczej.

Nadal geometryCorrespondence=UNCONFIRMED i manufacturingApproved=false dla wszystkich8 modeli. Do BOM wymagane zatwierdzone instancje i transformacje, mapowanie do dokładnej rewizji Studio, połączenia, rozstawy, obrysy/strefy, kotwy i fundamenty. Nie dopisano ilości OS do aktywnego Project ani ceny. Nie podmieniano modeli, R02, stawek, SQL lub formatu Project i nie wysyłano formularzy.

PASS: TypeScript, build, test:studio (w tym błędy/clear/retry/stale), quote-engine/construction-pricing,60 porównań, dwa scenariusze błędów/wyścigów, pełne test:mobile96aren/48Street/16materiałów/JSON/Radar, Surface7rozmiarów i58przypadków stron paneli. Eksperci przygotowali kod, scenariusz oraz audyt; prowadzący niezależnie porównał60par, hashe paczki86 i dwa odtworzenia audytu.

[Resety tekstur](../../../integrations/studio/canvas-editor/docs/WHITE_TEXTURE_RESETS.md), [60 porównań](../../../integrations/studio/canvas-editor/docs/white-texture-resets-2026-10-23/comparison.json), [audyt8 modeli](../../../integrations/studio/canvas-editor/docs/STUDIO_OWNED_GEOMETRY_GAPS.md), [źródłowy JSON](../../../integrations/studio/canvas-editor/docs/studio-owned-geometry-gaps-2026-10-23.json).


## Powtarzane pomiary Studio85–87 — 23.10.2026

**DONE — lokalny zakres ABBA:** opublikowane pakiety85/87, kolejność85→87→87→85,1920próbek w96komórkach. Wszystkie48zestawów obrazów z trzech kamer identyczne RGBA we wszystkich czterech seriach. Analyzer i niezależne przeliczenie potwierdziły surowe dane, mediany/maksima, hashe i kolejność. Wspólne źródła geometrii i84pakiety JS każdej wersji sprawdzone; bez przypisywania bieżącego renderera do starego buildu.

**Wyniki mieszane:**35komórek ma obie mediany87 niższe,4wyższe,57nakładające się zakresy. Złożone przerysowanie ma niższe obie mediany w16/16komórkach, ale nie wszystkie maksima są niższe. Street Field1440tekst:85mediany474,9–480,0ms,87mediany502,2–764,8ms; maksima721,1→1775,3ms. To priorytet osobnego profilowania, nie potwierdzenie przyczyny lub braku regresji. Circle2tekst1440 pozostaje mieszany. Raport wymienia wszystkie cztery wyższe zakresy i wolne próbki.

Pierwsze ABBA przerwano po timeout45s O1/375 przy drugiej nawigacji. Zachowano pełną bazę i częściowego kandydata; cały eksperyment wyłączono z porównania. Osobna diagnostyka60operacji PASS. Dodano wyłącznie diagnostykę błędu i ponowiono wszystkie cztery serie na jednym hashu harnessu, bez zmiany aplikacji lub timeoutu. Przyczyna przerwania nadal nieustalona; późniejsze PASS nie dowodzą naprawy.

Środowisko: Apple M1, Chromium149/SwiftShader, DPR1,375/1440×1000. Mierzono zgłoszenie końcowego draw, nie prezentację GPU, FPS, sieć produkcyjną lub telefon. Dwie serie po5próbek nie wyznaczają p95, istotności lub SLA. Porównanie obejmuje łączny wpływ86+87 ponad85, nie izoluje zmian; nie łączymy wyników z historycznym81/82. Domyślne obie strony paneli. **S2-04 i S6 nadal PARTIAL.**

Publiczna aplikacja pozostaje **Studio87**, źródło `46dec70f4af0e0dc0ed3c2a95193a602ae5f3ff8`; nie utworzono88 ani nowego wdrożenia runtime. Nie powtarzano TypeScript/build/mobile dla samej dokumentacji i narzędzi; wcześniejsze bramki87 pozostają historycznym dowodem. Modele/R02, ceny, Project, SQL i BOM pozostają bez zmian. GeometryCorrespondence=UNCONFIRMED, technicalBill.rows=null.

[Wyniki i ograniczenia](../../../tools/renderer-measurements-2026-10-23/RESULTS.md) · [protokół i odtworzenie](../../../tools/renderer-measurements-2026-10-23/README.md) · [surowa analiza](../../../tools/renderer-measurements-2026-10-23/results/analysis.json) · [kolejne kroki](../../../tools/renderer-measurements-2026-10-23/NEXT_STEPS.md).


## Zestawienie Gamefields.eu.txt i porównanie cen — Studio88

23.10.2026: źródło `6ca9dad641b981c3119db98833a3756376ac18b2`, wersja `appgprj_6abbd0ba26f0819197701343bf156f1b~appgver_d70a0f1f38488191bce2578c2e8e1643`, deployment `appgdep_6adb72c25e748191ba77524f9a03b716` — **succeeded**, środowisko revision3. [Studio](https://gamefields-studio.ryhfs90.chatgpt.site). Paczka `sha256:513768cca99c65b09845afa68cd6b7437d0b8e3dfc7f5a23d21ec3ff5d25c984`.

**Porównano cały zakres załącznika:** etap0–4 oraz sprinty0–6, z rozdzieleniem działających funkcji, częściowych prac i brakujących danych. Dokument źródłowy ma SHA256 `af77fb6ee8bbc79d305fac5ec0bd0e139c976041343d62cc3d6d58f9750f91d2` i urywa się na „Testy regres”; nie dopisano końcówki. [Tabela zgodności](ZESTAWIENIE_GAMEFIELDS_EU.md). Nie jest to nowy pełny benchmark konkurencji ani audyt WordPress.

**DONE — lokalne porównanie bieżących kalkulacji wariantów.** W Plikach projektu dwa zaznaczone zapisy pokazują plan2D, parametry i osobne aktualne kalkulacje, bez przywracania. Wspólny hook/API, osobny retry, zakres i pozycje Do ustalenia; stara rewizja modelu nie dostaje ceny dla nowej geometrii. Odznaczenie anuluje zapytanie, a spóźniona odpowiedź nie przywraca karty. Nie utrwalamy ceny jako oferty ani nie odejmujemy niepełnych sum jako oszczędności. Pełny Project i biblioteka niezmienione.

PASS: TypeScript, build, test:studio, quote-engine/construction-pricing, pełne test:mobile96aren/48Street/16materiałów/JSON/Radar na375/390/430/1440 i Surface7rozmiarów. Nowy test375/1440 sprawdza różne wyniki,503/retry, blokadę rewizji bez własnego zapytania, spóźnioną odpowiedź, dokładną niezmienność Project/IndexedDB i reflow. Oczekiwane kwoty z niezależnych zapytań API z jawnym testowym cennikiem TEST-NOT-FOR-SALE; fixture nie trafia do produkcji. Pierwszy test lokalny miał unpriced z braku cennika w izolowanym Workerze; dodano fixture. Poprawiono także lokalną ścieżkę uruchomienia harnessu i przechwycenie widocznego kadru. Bez zmian silnika/stawek.

**Pozostaje PARTIAL:** interaktywne porównanie3D i pełne odwzorowanie personalizacji3D, profil Street Field1440tekst i timeout O1, odzyskiwanie błędów3D, fizyczne urządzenia/dostępność, zgodność geometrii/R02, połączenia i techniczny BOM, brakujące stawki realizacji i potwierdzone leady. Nie zmieniono modeli, cennika komercyjnego, renderera, ProjectJSON, SQL lub BOM; nie wysyłano formularzy. ABBA niezmienionego renderera pozostaje dowodem historycznym85/87, nie nowym pomiarem88.

[Kontrakt](../../../integrations/studio/canvas-editor/docs/VARIANT_PRICING.md) · [test przeglądarkowy](../../../integrations/studio/canvas-editor/docs/variant-pricing-2026-10-23/browser.json).
