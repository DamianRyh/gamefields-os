# Sprint 0 — USM, Pickawood, Cubit

Data weryfikacji: **21.10.2026**. Zakres: oficjalne publiczne strony, dokumentacja produktu i linki konfiguratorów. **Nie wykonywano interaktywnych testów UI**, pomiarów mobilnych, eksportu, zakupu ani zapisu projektu. „Potwierdzone” poniżej oznacza treść odczytaną w oficjalnym dokumencie/HTML, a nie udowodnioną niezawodność funkcji. Nie używano współdzielonej przeglądarki CUA. Propozycje dla Gamefields, trudność i priorytety są oceną projektową.

Skala: trudność **S** — głównie istniejący interfejs/dane; **M** — nowa logika lub usługa; **L** — pipeline modeli, backend albo AR. Priorytet **P1** — następny kandydat do walidacji; **P2** — po podstawowej ścieżce; **P3** — później. Pewność **wysoka-D** — jednoznaczna dokumentacja; **średnia-D** — opis marketingowy lub ograniczona ekstrakcja; brak poziomu „przetestowane UI”.

## 1. USM — start od gotowego układu i wznowienie projektu

Wejście: [USM Configurator UK](https://www.usm.com/en-uk/how-to-buy/configurator).

Rzeczywisty link „Start a new design”: [USM partnershop / Haller](https://partnershop.spine.usm.com/configurator/d49492c5-e9dc-49f1-b725-7d902f7d3068/haller/). Oficjalny wrapper zawiera [aplikację webconfigurator](https://webconfigurator.usm.com/usmconfig/pages.mainUIWeb.risc?SalesPartnerId=3&key=d49492c5-e9dc-49f1-b725-7d902f7d3068&locale=en-gb&product=haller&url=https%3A%2F%2Fpartnershop.spine.usm.com%2Fconfigurator%2Fd49492c5-e9dc-49f1-b725-7d902f7d3068%2Fhaller%2F&usm=true). Warto wejść przez wrapper: zachowuje kontekst rynku/partnera.

| Feature | Potwierdzone zachowanie / dowód | Wartość dla użytkownika | Adaptacja Gamefields | Trudność | Priorytet | Pewność |
|---|---|---|---|---|---|---|
| Pusty projekt lub klasyk | Strona rozdziela nowy projekt i personalizację klasycznych mebli. [USM](https://www.usm.com/en-uk/how-to-buy/configurator), 21.10.2026 | Mniejszy wysiłek startowy | „Wybierz gotowe boisko” jako domyślne; „System modułowy” dopiero po wyborze rodziny | S/M | P1 | wysoka-D |
| Wznowienie kodem | Publiczne pole Configurator ID i akcja wysłania. [USM](https://www.usm.com/en-uk/how-to-buy/configurator), 21.10.2026 | Łatwy powrót i rozmowa z doradcą | Krótki kod projektu + link; równolegle zachować istniejący JSON. Osobno zaprojektować prywatność i uprawnienia | M | P1 | wysoka-D |
| AR | Oficjalny opis deklaruje podgląd we własnym pomieszczeniu. [USM](https://www.usm.com/en-uk/how-to-buy/configurator), 21.10.2026 | Ocena skali w miejscu | Najpierw wiarygodna skala modelu i plan działki; AR dopiero po weryfikacji geometrii i urządzeń | L | P3 | średnia-D |
| Pomoc specjalisty | W tej samej ścieżce dostępny kontakt z USM. [USM](https://www.usm.com/en-uk/how-to-buy/configurator), 21.10.2026 | Wyjście z impasu | „Sprawdź projekt z nami” przekazuje aktualną konfigurację, nie pusty formularz | M | P1 | wysoka-D |

**Publiczne demo:** oficjalne wejście i wrapper dostępne w odczycie bez wymogu logowania. Ekstrakcja iframe zwróciła praktycznie pustą aplikację; nie potwierdzono działania canvas, kodu wznowienia ani AR. To ograniczenie ekstraktora, nie stwierdzona awaria produktu. Nie ustalono wymagań konta dla zapisu.

**Do testu UI rodzica:** wejście → nowy projekt → jedna zmiana → znaleźć akcję zapisu/kodu → sprawdzić, czy wymaga konta. Osobno uruchomić klasyk. Bez składania zamówienia i bez zakładania, że kod oznacza publiczne udostępnienie.

## 2. Pickawood — parametry, pomoc techniczna i konsekwencje wyborów

Wejście: [Pickawood EU / configurator](https://www.pickawood.com/eu/configurator).

Rzeczywista ścieżka „Cabinets & Sideboards / To the configurator”: [EU sideboard2](https://www.pickawood.com/eu/configurator/sideboard2). Publiczny alternatywny [link EN](https://www.pickawood.com/en/configurator/a727439de97c2965362396aec6839685) był także indeksowany, ale EU `sideboard2` jest preferowanym aktualnym wejściem z menu.

| Feature | Potwierdzone zachowanie / dowód | Wartość dla użytkownika | Adaptacja Gamefields | Trudność | Priorytet | Pewność |
|---|---|---|---|---|---|---|
| Kolejność decyzji | Dokument opisuje wymiary → materiały → podstawa → podziały → fronty → dodatki. [Sideboard](https://www.pickawood.com/eu/configurator/sideboard2), 21.10.2026 | Porządkuje złożoność | Konstrukcja → nawierzchnia → grafika → wyposażenie → podsumowanie; nie blokować powrotu | S/M | P1 | wysoka-D |
| Jawne ograniczenia | Opis podaje zakresy wymiarów oraz wpływ elementów na użyteczne wymiary. [Sideboard](https://www.pickawood.com/eu/configurator/sideboard2), 21.10.2026 | Mniej błędnych oczekiwań | Rozdzielić pole gry, obrys konstrukcji i wymaganą powierzchnię; zasady zgodności konkretnej rodziny | M | P1 | wysoka-D |
| Edycja elementu w 3D | Instrukcja opisuje zmianę podziałów i wybór przedziałów bezpośrednio w modelu. [Sideboard](https://www.pickawood.com/eu/configurator/sideboard2), 21.10.2026 | Bezpośredni związek panelu z obiektem | Wybór panelu → podświetlenie → kolor/typ; tylko istniejące komponenty Blender | M/L | P2 | wysoka-D |
| Cena i wznowienie | Oficjalne omówienie deklaruje stale widoczną cenę i zapis do dalszej edycji. [Omówienie](https://www.pickawood.com/eu/configurator), 21.10.2026 | Kontrola budżetu i ciągłość | Najpierw pełny zakres wyceny + „wymaga potwierdzenia”; cena dopiero z zatwierdzonego cennika/BOM | L | P2 | wysoka-D |
| Plik 3D dla projektanta | Strona wymienia pobranie projektu jako glTF. [Sideboard](https://www.pickawood.com/eu/configurator/sideboard2), 21.10.2026 | Dalsza praca architekta | Pakiet GLB + karta + wymiary, z numerem rewizji i zakresem licencji | M/L | P2 | wysoka-D |
| Alternatywa dla konfiguratora | Dostępne przesłanie szkicu i konsultacja. [Omówienie](https://www.pickawood.com/eu/configurator), 21.10.2026 | Nie trzeba samodzielnie opanować edytora | Zdjęcie lokalizacji/szkic jako równorzędna ścieżka zapytania | M | P1 | wysoka-D |

**Publiczne demo:** landing i adres konfiguratora dostępne. Odczyt EU eksponował głównie instrukcję, nie stan interaktywnego edytora; w innym indeksowanym odczycie wystąpiły kontrolki z `undefined cm`. Nie traktować tego jako udowodnionego błędu żywego UI. Dokumentacja cookies wskazuje konieczne cookies techniczne. Logowanie pojawia się w nawigacji zapisanych konfiguracji, ale nie ustalono, czy jest wymagane do samej edycji lub każdego rodzaju zapisu.

**Do testu UI rodzica:** EU landing → sideboard2 → techniczne ustawienia cookies → poczekać na model → zmienić wymiar i materiał → obserwować cenę oraz podpowiedź → sprawdzić zapis i eksport bez wysyłania danych. Zapisać faktyczne wymagania konta, ewentualne błędy ładowania i zachowanie na telefonie.

## 3. Cubit — katalog modułów i dwie reprezentacje projektu

Wejście: [Shelf configurator](https://www.cubit-shop.com/en/pages/shelf-configurator).

Rzeczywisty link „Configure shelving”: [Configurator / shelving](https://www.cubit-shop.com/en/pages/configurator/?shelving=). To oficjalny link z pustą wartością parametru, nie wymyślony URL. [Opis systemu](https://www.cubit-shop.com/en/pages/cubit-shelving) jest osobnym źródłem funkcji.

| Feature | Potwierdzone zachowanie / dowód | Wartość dla użytkownika | Adaptacja Gamefields | Trudność | Priorytet | Pewność |
|---|---|---|---|---|---|---|
| Ograniczony zestaw modułów | Opis przedstawia 34 moduły, kolory i wymiary. [System](https://www.cubit-shop.com/en/pages/cubit-shelving), 21.10.2026 | Swoboda w ramach prawdziwego produktu | Biblioteka wyłącznie własnych komponentów; stała zgodna rodzina na projekt | M/L | P1 | wysoka-D |
| Widok 2D i 3D | Oficjalny opis wymienia oba widoki planowania. [System](https://www.cubit-shop.com/en/pages/cubit-shelving), 21.10.2026 | Planowanie i prezentacja służą różnym zadaniom | Rzut z wymiarami i obrysem bezpiecznej powierzchni + niezależny widok 3D, wspólny stan danych | M | P1 | wysoka-D |
| Budżet w toku | Opis deklaruje cenę aktualizowaną na bieżąco. [System](https://www.cubit-shop.com/en/pages/cubit-shelving), 21.10.2026 | Widać koszt decyzji | Ilości modułów i zakres kosztorysu; nie generować pozornej ceny bez cennika | L | P2 | wysoka-D |
| Gotowe przykłady | Landing dopuszcza start od własnego pomysłu lub przykładu. [Configurator](https://www.cubit-shop.com/en/pages/shelf-configurator), 21.10.2026 | Szybszy pierwszy projekt | Osiem aktualnych konstrukcji jako punkty startowe, nie osobne rozproszone aplikacje | S/M | P1 | wysoka-D |
| Przekazanie do konsultanta | Opis usługi przyjmuje wymiary, zdjęcia i preferencje. [Configurator](https://www.cubit-shop.com/en/pages/shelf-configurator), 21.10.2026 | Płynny kontakt z człowiekiem | Zapytanie zachowuje kod projektu, obraz, zestaw modułów i pytania do weryfikacji | M | P1 | wysoka-D |
| Dane profesjonalne | Producent deklaruje dostępne moduły OBJ; inne formaty na kontakt. [System](https://www.cubit-shop.com/en/pages/cubit-shelving), 21.10.2026 | Współpraca z projektantem | Zatwierdzony GLB i karta produktu z jednego rejestru; źródłowy Blender prywatny domyślnie | M | P2 | wysoka-D |

**Publiczne demo:** oficjalna ścieżka dostępna, odczyt HTML aplikacji obejmuje głównie powłokę sklepu. Nie potwierdzono funkcji zapisu, eksportu PDF, drag-and-drop, undo/redo ani reguł kolizji; nie dopisywać ich do macierzy jako dostępnych. Komunikat logowania dotyczy przyspieszenia checkoutu, nie dowodzi wymogu logowania do konfiguratora.

**Do testu UI rodzica:** landing → Configure shelving → zaczekać na aplikację → dodać moduł i zmienić kolor → przełączyć 2D/3D → sprawdzić cenę, wymiary i możliwość powrotu. Funkcje zapisu/pobrania dopiero odnotować, jeżeli faktycznie pojawią się w UI.

## Wnioski do backlogu Gamefields

1. **P1:** start od gotowego modelu; jawne obrysy i zgodność komponentów; wspólny stan 2D/3D; projekt przekazywany do konsultacji bez utraty parametrów.
2. **P1 do discovery:** krótki kod/link wznowienia, z osobną decyzją o prywatności, trwałości danych i autoryzacji. Obecny JSON pozostaje ścieżką przenośną.
3. **P2:** panel zaznaczony na modelu, eksport dla architekta, cena tylko z zatwierdzonych danych.
4. **P3:** AR po sprawdzeniu poprawności skali, modeli i wydajności. Nie kopiować swobodnego skalowania mebli do inżynierskich konstrukcji boisk.

Nie oceniano dostępności, konwersji ani wydajności tych trzech marek. Nie ma podstaw do deklaracji, że ich konfiguratory są „lepsze” lub że zastosowanie wzorca automatycznie zwiększy sprzedaż. Następny krok to udokumentowane testy tych konkretnych ścieżek w UI i dopiero potem decyzja implementacyjna.
