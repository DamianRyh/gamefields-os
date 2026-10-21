# Sprint 0 — benchmark IKEA, Nike By You, Roomle, Threekit i Reform

Data odczytu wszystkich źródeł i linków: **2026-10-21**. Autor: agent benchmarku, bez interakcji we wspólnej przeglądarce. Nie zmieniano aplikacji ani WordPress.

## Jak czytać dowody

- **D — documented:** zachowanie opisane w oficjalnym FAQ, instrukcji lub dokumentacji technicznej. Nie oznacza testu wykonania.
- **M — marketing/vendor claim:** publiczna deklaracja dostawcy. Nie przyjmujemy jej jako wyniku pomiaru ani dowodu jakości wdrożenia.
- **P — public entry:** odczytano rzeczywisty publiczny URL i tekst strony wejściowej/interfejsu. **Żadne demo w tym raporcie nie ma statusu „interakcja przetestowana”.** JS/WebGL, gesty, utrzymanie stanu i błędy wymagają osobnego testu UI.
- Priorytet P1 = następny sensowny zakres produktu; P2 = po uporządkowaniu danych; P3 = późniejsza eksploracja. Trudność S/M/L to ocena adaptacji w obecnym Gamefields, nie wycena wdrożenia cudzej platformy.

Nie przenosimy regulaminów, cen ani geograficznych warunków Nike/IKEA do Gamefields. Nie wnioskujemy o cenie na żywo na podstawie samego widocznego cennika. Deklarowana konfigurowalność nie dowodzi technicznej zgodności konstrukcji Gamefields.

## IKEA — plan jako trwały obiekt i przejście do konsultacji

### IKEA-01 — zapis, kod i ponowne otwarcie

| Pole | Ustalenie |
|---|---|
| Feature | Projekt możliwy do wznowienia i przekazania specjaliście. |
| Verified behavior | **D:** FAQ opisuje otrzymanie osobistego kodu po wyborze „next” i zapisaniu planu; kod można zabrać do sklepu do weryfikacji. Inne FAQ kuchenne opisuje zapis przy koncie i udostępnianie. To różne planery; nie twierdzimy, że identyczny model kont działa wszędzie. |
| User value | Klient nie musi odtwarzać wyborów podczas rozmowy z firmą. |
| Gamefields adaptation | Stały `projectId` i wersja schematu; jasne rozróżnienie szkicu lokalnego, pobranego JSON i przyszłego projektu online. Kod/link dopiero po wdrożeniu rzeczywistego magazynu projektów. |
| Difficulty / priority | M–L / P1; eksport JSON i zrozumiałe etykiety można dopracować wcześniej w S. |
| Evidence | [FAQ zapis i kod](https://www.ikea.com/nl/en/customer-service/knowledge/articles/be3b20b1-8175-413d-b19f-36f538e9c78d.html), [FAQ kuchnia i udostępnianie](https://www.ikea.com/us/en/customer-service/knowledge/articles/9697d151-0306-4b25-9420-442f8b61b3d7.html). Odczyt2026-10-21. |
| Demo / blockers | [PAX ES/EN](https://www.ikea.com/addon-app/storageone/pax/web/latest/es/en/?range=pax). **P:** web odczytał tylko wymaganie JavaScript; nie przetestowano zapisu. Konto, rynek i rodzaj planera mogą zmieniać dostępność. |

### IKEA-02 — wyjście z planera do dokumentu

| Pole | Ustalenie |
|---|---|
| Feature | PDF/druk z wyborem zawartości projektu. |
| Verified behavior | **D:** niemieckie FAQ kuchenne opisuje „My Saved Projects”, menu projektu, „Print”, wybór elementów i zapis PDF z podglądu. |
| User value | Projekt jest zrozumiały poza edytorem i podczas uzgodnień. |
| Gamefields adaptation | Karta koncepcji: nazwa, model/kod, wymiary, podgląd, powierzchnia, kolory, linie, wyposażenie, wersja i jawne „do potwierdzenia technicznego”. Nie nazywać jej projektem wykonawczym. |
| Difficulty / priority | M / P1. |
| Evidence | [FAQ druk/PDF](https://www.ikea.com/de/en/customer-service/knowledge/articles/4a5569a7-e677-4810-b7b4-4bb97f1391a5.html). Odczyt2026-10-21. |
| Demo / blockers | [Kitchen Planner US](https://kitchen.planner.ikea.com/us/en/?productId=89623849). **P:** publiczny start od propozycji lub pustego projektu; druk może wymagać konta i zapisanego projektu. Nie wykonywano logowania. |

## Nike By You — personalizacja fragmentów i ograniczanie zmęczenia wyborem

### NIKE-01 — wybierz bazę, potem personalizuj elementy

| Pole | Ustalenie |
|---|---|
| Feature | Model bazowy i przygotowane kolory/materiały, podgląd3D. |
| Verified behavior | **D:** Nike Help opisuje wybór modelu, palety i materiały, natychmiastowe odświeżanie obrazu3D oraz obrót. FAQ mówi o członkostwie do projektowania/zamawiania. To opis producenta, nie pomiar responsywności. |
| User value | Użytkownik wybiera w kontekście konkretnego produktu zamiast zaczynać od pustego narzędzia. |
| Gamefields adaptation | Rozpoczęcie od jednego z własnych boisk, potem jednoznaczne grupy konstrukcja → nawierzchnia → grafika/linie → wyposażenie. Nazwa aktualnie edytowanej części i widoczny podgląd zmiany. |
| Difficulty / priority | M / P1. |
| Evidence | [Nike Help — Nike By You](https://www.nike.com/help/a/what-is-nike-by-you/app), [publiczny landing](https://www.nike.com/nike-by-you). Odczyt2026-10-21. |
| Demo / blockers | [Sabrina4 — aktualny link z landingu](https://www.nike.com/u/custom-sabrina-4-by-you-10002388/6790715852). **P:** strona produktu odczytana; nie klikano Customize. Regionalizacja, dostępność modelu i konto mogą blokować pełny flow. Nie zakładamy zapisu dla gościa. |

### NIKE-02 — inspiracje zamiast nieograniczonej palety

| Pole | Ustalenie |
|---|---|
| Feature | Krótkie porady projektowe i personalny napis na wybranych modelach. |
| Verified behavior | **P/D:** publiczny poradnik obejmuje m.in. ograniczanie nadmiaru wyboru, akcent koloru i neutralne zestawienia. Landing wyjaśnia Personal I.D.; dostępność zależy od modelu. |
| User value | Pomoc w rozpoczęciu i poczucie autorstwa bez konieczności znajomości projektowania. |
| Gamefields adaptation | Kilka podpisanych, gotowych kompozycji wraz z „Dostosuj”; podpisy i logo jako świadoma opcja, domyślnie bez napisów na panelach. Nie ukrywać zasad nadruku. |
| Difficulty / priority | S–M / P1. |
| Evidence | [How To Nike By You](https://www.nike.com/how-to-nike-by-you), [Nike By You](https://www.nike.com/nike-by-you). Odczyt2026-10-21. |
| Demo / blockers | Ten sam publiczny produkt powyżej; nie testowano limitu znaków ani zapisu napisu. Nie przenosimy Personal I.D. rules na branding boisk. |

## Roomle — oddzielenie wizualizacji, konfiguracji i planowania przestrzeni

### ROOMLE-01 — głębokie osadzenie z kontraktem zdarzeń

| Pole | Ustalenie |
|---|---|
| Feature | Gotowy iframe plus biblioteka komunikacji host–konfigurator. |
| Verified behavior | **D:** dokumentacja rozróżnia prosty iframe od integracji metod/zdarzeń; prosty viewer nie komunikuje wyborów do sklepu. Podaje `configuratorId`, dozwolone domeny i przykład osadzenia. |
| User value | Konfiguracja nie ginie w przejściu z widoku3D do kolejnego kroku. |
| Gamefields adaptation | Utrzymywać sprawdzany kontrakt `gf-inquiry`/schemaVersion/projectId i odczyt zwrotny, ze sprawdzaniem origin/source. Jedno źródło ustawień zamiast niezależnych, rozjeżdżających się widoków. |
| Difficulty / priority | M / P1. |
| Evidence | [Configurator](https://docs.roomle.com/rubens/rubens-products/rubens-configurator), [Getting started](https://docs.roomle.com/rubens/rubens-products/rubens-configurator/getting-started), [prosty viewer i ograniczenia](https://docs.roomle.com/rubens/rubens-products/rubens-3d-viewer-and-ar/getting-started). Odczyt2026-10-21. |
| Demo / blockers | [Publiczny katalog demonstracji regałów](https://www.roomle.com/en/demos/shelves). Link „Try out” prowadzi do JS-aplikacji, URL podany w kolejce testów niżej. Web odczytał tylko wymaganie JavaScript; brak testu komunikacji. |

### ROOMLE-02 — rozdzielenie poziomów produktu

| Pole | Ustalenie |
|---|---|
| Feature | Viewer, konfigurator materiałów, konfigurator produktu i projektowanie pomieszczenia. |
| Verified behavior | **D:** SDK dokumentuje osobne moduły Configurator, GLB Viewer i Planner. **M:** landing deklaruje parametry/modułowość, AR i cenę po zmianie; nie testowano ceny ani poprawności kombinacji. |
| User value | Klient dostaje narzędzie adekwatne do zadania. |
| Gamefields adaptation | Katalog3D do oglądania; Studio do wyborów produktu; osobny tryb sytuowania boiska w przestrzeni tylko z jasnym zakresem. Późniejsze AR dopiero po walidacji skali i formatu. |
| Difficulty / priority | M dla rozdzielenia / P1; L dla AR/planowania / P3. |
| Evidence | [SDK modules](https://docs.roomle.com/rubens/rubens-sdk/rubens-modules), [marketing levels](https://www.roomle.com/home). Odczyt2026-10-21. |
| Demo / blockers | [Viewer z oficjalnej dokumentacji](https://www.roomle.com/t/cp/?configuratorId=demoConfigurator&id=roomle_content_demo:kitchenware003&api=false); link nie został odczytany przez web jako interaktywny. Materiały i AR wymagają testu właściwego demo/urządzenia. |

## Threekit — atrybuty jako dane i kontrolowane przejście do oferty

### THREEKIT-01 — widoczne i dostępne opcje z API

| Pole | Ustalenie |
|---|---|
| Feature | Stan opcji nie jest zaszyty wyłącznie w grafice3D. |
| Verified behavior | **D:** API udostępnia atrybuty i konfigurację; `getDisplayAttributes` zawiera widoczność, dostępność i wartości wyłączone; `setConfiguration` jest asynchroniczne. Nie dowodzi to reguł konstrukcyjnych w konkretnym katalogu klienta. |
| User value | Interfejs może pokazywać właściwe opcje i jednoznaczny wynik zapisu. |
| Gamefields adaptation | Jedna domenowa lista dozwolonych elementów i materiałów dla rodziny; wyłączona opcja z konkretnym powodem. Walidacja przed eksportem oraz powtórna walidacja w backendzie przyszłej wyceny. |
| Difficulty / priority | L / P1 dla reguł zgodności własnych komponentów; nie wymaga zakupu Threekit. |
| Evidence | [Configurator API](https://developer.threekit.com/reference/configurator-api). Odczyt2026-10-21. |
| Demo / blockers | [Threekit demo](https://www.threekit.com/demo) to prośba o demonstrację, nie potwierdzone publiczne narzędzie. Historyczny link „Visual product configurator demos” przekierował tutaj. Nie wysyłano formularza. |

### THREEKIT-02 — oferta z kontekstem konfiguracji

| Pole | Ustalenie |
|---|---|
| Feature | Przekazanie konfiguracji do CPQ i dokumentu oferty. |
| Verified behavior | **M/D:** oficjalny opis nagranego demo Salesforce CPQ mówi o powiązaniu produktów, opcji, atrybutów i wizualizacji z ofertą. Obecna strona demo opisuje pracę nad konfiguracją i dalszym przekazaniem do systemów. Brak niezależnego testu, ceny ani ROI. |
| User value | Rozmowa sprzedażowa zaczyna się od konkretnych wyborów klienta. |
| Gamefields adaptation | Przekazać zwalidowany snapshot i czytelne podsumowanie; oddzielić koncepcję klienta od sprawdzonej technicznie oferty. Nie wyświetlać ceny „na żywo” bez aktualnego cennika i reguł zakresu. |
| Difficulty / priority | M dla podsumowania / P1; L dla prawdziwego CPQ / P2. |
| Evidence | [Recorded Salesforce CPQ demo](https://www.threekit.com/live-demo/threekit-salesforce-cpq), [aktualne request demo](https://www.threekit.com/demo). Odczyt2026-10-21. |
| Demo / blockers | Nagranie/opis nie jest interaktywnym testem. Nie rejestrowano się ani nie proszono handlowca o kontakt. |

## Reform — estymata jako pierwszy etap, projekt techniczny jako kolejny

### REFORM-01 — krótki brief z widocznym postępem

| Pole | Ustalenie |
|---|---|
| Feature | Rozpoczęcie od przestrzeni i układu, a nie wszystkich szczegółów naraz. |
| Verified behavior | **P:** publiczny pierwszy ekran OUTLINE ma1/4, wybór rodzaju przestrzeni i układu oraz informację, że kolejne przestrzenie można dodać później. Odczyt nie potwierdza walidacji przy „next”. |
| User value | Łatwy start bez kompletnej wiedzy technicznej. |
| Gamefields adaptation | Krótki wstęp: miejsce, dostępny obszar, użytkownicy, sport/cel; możliwość „nie wiem”. Potem dobrany model i estetyka. Nie wymagać danych kontaktowych do samego oglądania. |
| Difficulty / priority | M / P1. |
| Evidence | [OUTLINE — pierwszy krok](https://outline.reformcph.com/en/get-started/project_a), [opis OUTLINE](https://outline.reformcph.com/en/get-started). Odczyt2026-10-21. |
| Demo / blockers | Pierwszy krok jest publiczny i czytelny dla web; nie wysłano danych i nie przetestowano kolejnych kroków. Nie twierdzimy, że użytkownik od razu otrzymuje samodzielny3D planner. |

### REFORM-02 — rozróżnienie budżetu, pomiarów i finalnej oferty

| Pole | Ustalenie |
|---|---|
| Feature | Wstępny zakres kosztów i następny etap z projektantem. |
| Verified behavior | **D:** pricing jawnie opisuje estymaty i wyłączenia; proces opisuje wstępny OUTLINE, konsultację, plan3D według pomiarów i finalną ofertę. Materiały wskazują, że precyzja wymiarów jest potrzebna do finalnego planowania. |
| User value | Oczekiwania co do rezultatu i budżetu są zrozumiałe. |
| Gamefields adaptation | W Studio prezentować koncepcję; po zapytaniu potwierdzić teren, podbudowę, montaż, transport i wymagane strefy. Wycenę rozbić na zakres wliczony/wyłączony. Nie przenosić kwot ani terminów kuchni na boiska. |
| Difficulty / priority | S–M / P1. |
| Evidence | [Reform pricing](https://www.reformcph.com/en/planning/reform-pricing), [Project Planning Process](https://help.reformcph.com/en/knowledge/project-planning-proces), [przygotowanie pomiarów](https://www.reformcph.com/en/planning/before-planning-your-kitchen). Odczyt2026-10-21. |
| Demo / blockers | OUTLINE powyżej. Możliwość porównania wariantów deklarowana w procesie; nie zbadano interaktywnego przeliczenia ceny. |

## Kolejka testów UI dla prowadzącego agenta

| Kolejność | Dokładny publiczny URL | Co sprawdzić | Blokady / status tej analizy |
|---|---|---|---|
|1|https://outline.reformcph.com/en/get-started/project_a|Wybór układu, czytelność kroku, powrót i zachowanie wyboru; zatrzymać się przed wysłaniem danych|Odczytany pierwszy ekran, brak interakcji|
|2|https://www.nike.com/u/custom-sabrina-4-by-you-10002388/6790715852|Wejście do Customize, wskazanie edytowanej części, zmiana koloru, obrót; bez logowania jeśli blokada|Prawdziwy link z aktualnego landingu; membership może być wymagane|
|3|https://www.ikea.com/addon-app/storageone/pax/web/latest/es/en/?range=pax|Start z bazą, kroki, powrót, podsumowanie; sprawdzić czy zapis wymaga konta|JSrequired; rynek ES, język EN|
|4|https://www.roomle.com/en/demos/shelves|Wejść przez „Try out” do modularnego przykładu; obserwować dodawanie komponentów, wymiary i niedozwolone akcje|Katalog publiczny, aplikacja JS; brak testu reguł|
|4a|https://www.roomle.com/t/cp/?configuratorId=demoConfigurator&envMapIntensity=0.9&envMapRotation=2.58&envMapUrl=https%3A%2F%2Fraw.githubusercontent.com%2Froomle%2FRoomle_Assets%2Frefs%2Fheads%2Fmain%2FLightbulbs_blurred.exr&id=racksystems_test%3Asub_root%3A96B87D7040DB11F14331A98D780F0728D48F2303F5D73A4E69668F171C491F6E&locale=en|Dokładny drugi „Try out” z oficjalnej strony Shelves; nie link wymyślony z identyfikatora|Web odczytał komunikat JavaScriptrequired|
|5|https://www.threekit.com/demo|Wyłącznie potwierdzić charakter bramki requestdemo; nie traktować formularza jako konfiguratora|Brak potwierdzonego publicznego interaktywnego demo w zbadanej ścieżce|

## Decyzje dla Gamefields po tym benchmarku

1. Jeden trwały model danych projektu i jawny status zapisu, używany przez wszystkie widoki i podsumowanie.
2. Złożone moduły tylko z katalogu własnej zgodnej rodziny, z walidacją techniczną i powodami blokad.
3. Widoczna edytowana część, gotowe kompozycje na start i postępujące ujawnianie opcji.
4. Karta koncepcji do przekazania człowiekowi: snapshot, wersja, zakres i brak fałszywej obietnicy wykonawczej.
5. Estymata i finalna oferta to odrębne wyniki. Cenę na żywo wdrażać dopiero po zatwierdzeniu danych i reguł; marketing dostawców nie jest taką walidacją.

Powyższe są rekomendacjami analityka wynikającymi z porównania, nie deklaracją, że konkretna zewnętrzna platforma rozwiąże je automatycznie.
