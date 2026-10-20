# Studio Gamefields — audyt użyteczności, 20.10.2026

Zakres: wybór modelu, edycja nawierzchni i konstrukcji, obsługa telefonu, przegląd konfiguracji przed zapytaniem. Trzy równoległe przeglądy: badania Baymard, źródła Tylko, kod/dostępność. Audyt bazuje na ekranach zapisanych w tej sesji, nie na wcześniejszych zrzutach.

## Przebieg i ustalenia

1. **Edytor na komputerze — dobry podgląd, niejasny zapis.** Duży model i grupy narzędzi były czytelne. Przycisk „Zapisz projekt” pobierał JSON, a lokalny szkic był inną operacją. Zmieniono etykietę na „Pobierz projekt”, zachowano widoczny prawdziwy stan zapisu. Dowód przed: `01-before-desktop.png`; po: `05-after-desktop-preview.png`.
2. **Podsumowanie — wymagało uzupełnienia.** Brakowało kolorów konstrukcji, wykończenia, napisów i logo oraz stanu linii. Dodano te parametry, kod modelu, kolory nawierzchni i bezpośrednią edycję grup. Wycena pozostaje indywidualna. Dowód przed: `02-before-summary.png`.
3. **Telefon — utrudnione odzyskiwanie zmian.** Ponów było ukryte, próbki kolorów miały 30 px, a status zapisu znikał. Dodano widoczne Undo/Redo, cele 44 px dla głównych kontrolek, stały status i układ trzech nieprzesłaniających się obszarów: podgląd, narzędzia, przewijany panel. Dowód przed: `03-before-mobile.png`.
4. **Wybór modelu — brak parametrów i informacji o zmianie.** Dodano kształt i wymiary, wyraźny stan wyboru oraz informację o przywróceniu ustawień nowego modelu. Własna nazwa projektu jest zachowana, całą zmianę można cofnąć. Dowód przed: `04-before-model-choice.png`.

Dodatkowo poprawiono zaznaczenie gotowych kompozycji: zgadzać muszą się rodzina, wariant, paleta i rzeczywiste kolory. Dialogi blokują tło, zachowują Tab wewnątrz, zamykają się Escape i zwracają fokus do przycisku otwierającego. Pliki opisują różnicę między lokalnym szkicem a kopią JSON.

## Podstawa i interpretacja

- [Baymard: Accordion and Tab Design](https://baymard.com/research-articles/accordion-and-tab-design) — użytkownik powinien rozumieć, które ustawienia są zachowywane. W Studio adaptujemy tę zasadę do grup ustawień i pełnego podsumowania.
- [Baymard: Buttons for Size Selection](https://baymard.com/research-articles/use-buttons-for-size-selection) — wyraźny wybór wariantu. Karty modeli i poprawne zaznaczenie kompozycji są zastosowaniem przez analogię.
- [Baymard: Mobile Interactive Color Swatches](https://baymard.com/research-articles/mobile-interactive-color-swatches) — dostępne opcje kolorystyczne i ich odkrywalność. Studio zachowuje podpisane próbki i wszystkie palety.
- [Baymard: Button Design](https://baymard.com/blog/button-design) — rozmiar pól dotykowych. 44 CSS px to przyjęty cel projektowy Studio, nie liczba przypisywana Baymard.
- [Tylko: What is the configurator](https://tylko.com/en-uk/faq/articles/customisation/what-is-the-configurator) — bieżący efekt zmian i oglądanie produktu z różnych stron. Zachowano podgląd i kamery, bez kopiowania cen, marki lub obietnic Tylko.
- [Tylko: wybór rodzaju produktu](https://tylko.com/pl-pl/configurator-intro) — widok odwiedzono w przeglądarce w tej sesji. Odnotowano osobny krok wyboru kategorii; pełnego mobilnego konfiguratora Tylko nie audytowano.

## Granice dowodów

To własny audyt i adaptacja publicznych badań, nie certyfikacja Baymard ani deklaracja pełnej zgodności WCAG. Nie wykonano badania z klientami, pomiaru konwersji ani testu fizycznej klawiatury ekranowej lub czytnika ekranu. Widoki responsywne i obsługę klawiaturą sprawdzamy na aplikacji produkcyjnej w lokalnym środowisku. Nie wysyłamy testowych zapytań do firmy. Geometria modeli, rodziny komponentów, 300 wzorów, 19 palet i format projektu pozostają zachowane.

Weryfikacja końcowa: TypeScript i build PASS; studio-scope (300/19) PASS; studio-ux i product-names PASS; studio-usability PASS (375/390/430/1440); studio-mobile-goals PASS (96 konfiguracji O-1/P-1, 48 Street, 16 zmian materiału, draft JSON i Radar); new-blender-arenas PASS (5 modeli, 390/1440, kamery i WebGL). Nie wysyłano zapytań ofertowych.
