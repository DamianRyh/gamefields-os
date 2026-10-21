# Benchmark interakcji — 21.10.2026

Badanie eksperckie publicznych ścieżek, bez kont, zamówień i kontaktu z handlowcami. To nie jest badanie z użytkownikami ani pełna certyfikacja dostępności/wydajności. Zrzuty zapisano i obejrzano lokalnie w `evidence/`; nie publikujemy w repozytorium obrazów konkurencyjnych produktów. Test mobile oznacza emulację viewportu 390 × 844, nie fizyczny telefon. Karty źródłowe w dwóch raportach to dokumentacja/marketing; poniższe obserwacje mają pierwszeństwo w kwestii rzeczywiście wykonanych interakcji.

## 1. Obecne Studio — zdrowie: PARTIAL

Otwarty aktualny Octagon/Panna Octa. Zapisany szkic odtworzył nazwę, wzór Organic Flow i własne kolory #236F70/#EF744E/#DDE0D7. Desktop: model i panel nawierzchni dostępne. Mobile: po potwierdzeniu `innerWidth=390` podgląd jest nad czterema narzędziami i ustawieniami; nazwa oraz status lokalnego zapisu pozostają widoczne. Nie zmieniano projektu. Dowody 01 i 23. Nie wykonano ponownie wszystkich importów/eksportów ani wysłania formularza; domenowe testy opisano w CODE_AUDIT.md.

## 2. Konfiguratory z wykonanymi interakcjami — zdrowie: ograniczony PASS

| Platforma i źródło | Wykonana ścieżka / obserwacja | Mobile / granice | Adaptacja Gamefields; trudność; priorytet |
|---|---|---|---|
| [Tylko](https://tylko.com/pl-pl/configurator-intro) | Kategoria regałów → Dostosuj → styl Grid i głębokość 40 cm. Cena po obu zmianach 3239→3899 PLN. Zapis otworzył logowanie/email. | Widok 390 px przestawia narzędzia; zrzut 05 przedstawia dolną sekcję produktu, nie pełny test mobilnego edytora. Próba strzałką nie zmieniła szerokości, obsługa klawiaturą niepotwierdzona. | Duży model + krótki panel; nazwane gotowe kierunki, potem detale. Zapis lokalny bez konta pozostaje. M/P1. Dowody 02–05. |
| [USM](https://partnershop.spine.usm.com/configurator/d49492c5-e9dc-49f1-b725-7d902f7d3068/haller/) | Otwarty publiczny iframe bezpośrednio po problemie kliknięcia consent w osadzeniu. Przejście Structure→Color, paleta RAL. Moduł 750 mm i wymiar zewnętrzny 773 mm rozróżnione. | 390 px: model nad dolnymi narzędziami. Nie zmieniono konstrukcji ani koloru. | Osobno pole gry, gabaryt i przestrzeń montażu; dozwolone rozmiary zamiast swobodnego skalowania paneli. M/P1. Dowody 06–08. |
| [Pickawood](https://www.pickawood.com/eu/configurator/sideboard2) | Z wejścia sideboard aktywny edytor regału: szerokość 205→206 cm; wpis 10 skorygowany do minimum 30. Pola mają granice szer.30–600, wys.30–300, gł.15–60 cm. Autozapis otwiera email/account gate, bez wysłania. | 390 px: 3D u góry, kroki i cena u dołu. Cena przeliczała się asynchronicznie; nie mierzymy czasu ani zgodności wszystkich stanów. | Walidacja granic z wyjaśnieniem; stan przeliczania ceny; zapis projektu odróżniony od pozyskania kontaktu. M/P1. Dowody 09–11. |
| [Cubit](https://www.cubit-shop.com/en/pages/configurator/?shelving=) | Przeciągnięty jeden LP20 do sceny; cena 0→69 EUR, kontrolki zaznaczenia. Katalog skończonych elementów. | 390 px: model/cena nad katalogiem. Nie sprawdzano łączenia wielu modułów, kolizji ani zapisu. | Własny katalog komponentów, jasny stan zaznaczenia i koszt elementu dopiero po zatwierdzeniu cennika. L/P1. Dowody 12–14. |
| [IKEA PAX](https://www.ikea.com/addon-app/storageone/pax/web/latest/es/en/?range=pax) | Start pusty→Frames→pierwsza rama PAX. Model 49,8×58×236,4 cm i cena70 EUR. Undo usuwa ramę; po przeliczeniu cena0. Wymagane 237 cm sufitu opisane przy wysokości236. | Desktop sprawdzony; mobile nieprzetestowany. Widoczny Save do profilu, nie wykonywano zapisu. | Łączne odświeżanie sceny/BOM/podsumowania, cofanie i jawne wymagania montażu. L/P1. Dowody 17–18. |
| [Roomle — Shelves](https://www.roomle.com/en/demos/shelves) | Publiczne drugie demo Try out: scena i palety, otwarta Part list z article IDs, ilościami, wymiarami322×205,5×70,6 cm i Print. Model czarny mimo zaznaczonej bieli: brak oceny wierności materiału. | Desktop; mobile i dodawanie elementów nieprzetestowane. Brak twierdzenia o sprawdzonych kolizjach. | Czytelny BOM z trwałym kodem komponentu i ilością; rozdzielenie wyglądu od danych technicznych. M/P1. Dowody 20–21. |
| [Reform OUTLINE](https://outline.reformcph.com/en/get-started/project_a) | Krok1/4: Kitchen + Linear → krok2/4 kolekcje z wyszukiwaniem. Przycisk Next wyłączony przed kolejnym wyborem. Bez danych kontaktowych. | Desktop; mobile/powrót/przeliczenie nieprzetestowane. To brief ofertowy, nie potwierdzony samodzielny edytor3D. | Krótki start od kontekstu i stopniowe ujawnianie opcji. S–M/P1. Dowód19. |

## 3. Ścieżki ograniczone — zdrowie: BLOCKED dla edycji

- [Nike Sabrina By You](https://www.nike.com/u/custom-sabrina-4-by-you-10002388/6790715852): produkt dostępny, Customize nieaktywny, Sign In To Buy i wybór kraju widoczne. Sprawdzono desktop i390 px; nie ustalono przyczyny blokady, nie logowano się. Nie testowano zmiany części/koloru. Mechanizm personalizacji części wynika z oficjalnego Help, nie tego testu. M/P1 dla adaptacji świadomego brandingu; dowody15–16.
- [Threekit demo](https://www.threekit.com/demo): formularz Request a demo, nie publiczny konfigurator w tej ścieżce. Bez wysłania danych. API opcji i CPQ oceniono w dokumentacji. L/P2; dowód22. Deklarowanych procentów marketingowych nie przenosimy na Gamefields.

## 4. Wnioski i ograniczenia

Najmocniejszy wspólny wzorzec to produkt stale w centrum, ograniczony zestaw poprawnych wyborów, jawne wymiary i podsumowanie tego samego projektu. Nie kopiujemy identyfikacji ani kodu konkurencji. Nie przyjmujemy, że reguły mebli są regułami boisk.

Priorytetowe hipotezy do weryfikacji z użytkownikami: czy cztery narzędzia wystarczają do znalezienia linii/logo; czy odróżniają pole gry od obszaru montażu; czy rozumieją lokalny zapis i koncepcję zamiast gotowej oferty. Proponowany test: pięć moderowanych zadań na desktop/mobile, bez traktowania małej próby jako statystycznego dowodu.

Pozostały otwarte: fizyczny dotyk, czytniki ekranu i pełna klawiatura, pomiary FPS/czasu zmiany, długie projekty, warianty, eksporty konkurencji i stany offline. Ograniczenia nie są automatycznie błędami badanych serwisów.
