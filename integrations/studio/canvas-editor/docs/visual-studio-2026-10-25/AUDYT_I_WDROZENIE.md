# Studio: wybór przez obraz — 25.10.2026

## Materiał audytu

Sześć zrzutów telefonu dostarczonych przez właściciela (WhatsApp 25.10,14:40) oraz działający podgląd Studio osadzony na gamefields.eu (Panna Octa, biała scena). To audyt wskazanych ścieżek konfiguracji, nie badanie z użytkownikami ani certyfikacja WCAG. Brak pomiarów konwersji i badania na fizycznym iPhonie.

| Obserwacja | Dowód | Wdrożenie |
|---|---|---|
| 1. Duża miniatura i tekst prowadzą dopiero do kolejnego katalogu | zrzut5/Konstrukcja | Bezpośrednia karuzela siedmiu stalowych konstrukcji, zmiana wspólnego modelu3D |
| 2. Numery1–12 nie pokazują skutku wyboru | zrzut3/Kompozycja | Dwanaście rzeczywistych miniatur z renderera wzoru; nazwy kompozycji zamiast widocznych numerów |
| 3. Suwaki zajmują znaczną część panelu | zrzut4/Nawierzchnia | Skala/intensywność/cień w sekcji zaawansowanej; wybór wzoru dostępny bez otwierania jej |
| 4. Kolory i materiał są tekstowym formularzem | zrzut1/Nawierzchnia | Wspólny selektor części, nazwane próbki i własny kolor; karuzela faktur materiałów |
| 5. Techniczne opisy i pobieranie konkurują z projektowaniem | zrzut0/StreetFootball3×3 | Osobna zakładka Sport; wymiary, źródła i pobieranie pod szczegółami |
| 6. Linie mają tylko przełącznik | zrzut2/Linie | Osobna warstwa dekoracyjna: Fale, Płatki, Pętle, Orbity, Kontury; sportowe oznaczenia niezależne |

## Wzorce rynkowe i decyzje

- [Tylko — konfigurator](https://tylko.com/en-uk/faq/articles/customisation/what-is-the-configurator): bezpośrednia reakcja produktu na parametry. Zachowujemy jeden główny model i wspólny Project; miniatury nie uruchamiają nowych scenWebGL.
- [Nike By You](https://www.nike.com/nike-by-you): najpierw wizualny wybór produktu, potem personalizacja. Konstrukcja i Sport mają osobne katalogi bez mieszania stali i nawierzchni.
- [Baymard — miniatury](https://baymard.com/research-articles/always-use-thumbnails-additional-images), [odkrywalność galerii](https://baymard.com/research-articles/truncating-product-gallery-thumbnails): grafiki zamiast samych numerów, widoczny fragment następnej karty, strzałki. Zastosowanie do konfiguratora jest interpretacją tych ustaleń, nie wynikiem dedykowanego badaniaGamefields.
- [WAI carousel](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/), [WCAG dragging](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html): swipe ma alternatywę dotknięcia/kliknięcia/strzałek/klawiatury. Brak autoplay. Kontrolki44px, widoczny stan i focus, obsługa reduced-motion.

Nie kopiujemy identyfikacji wizualnej konkurencji. Biała scena i karty, dyskretna lawendowa selekcja, obrazy z rzeczywistych modeli oraz źródłowego renderera300wzorów. Cztery zakładki Nawierzchni: Wzór, Kolory, Materiał, Sport. Detale, loga i pliki pozostają dostępne, lecz nie dominują pierwszego ekranu.

## Kontrakt funkcjonalny

- Wybór karuzeli aktualizuje ten sam projekt i Cofnij/Ponów. Zmiana po świadomym kliknięciu lub zakończonym poziomym przesunięciu; samo otwarcie panelu lub przewijanie pionowe nie wybiera produktu. Przewijanie do stanu przywróconego z JSON nie uruchamia kolejnego wyboru.
- 25rodzin×12kompozycji i19palet zachowane. Miniatury kompozycji używają bieżącej palety i tego samego PatternArt co powierzchnia. Materiały korzystają z istniejących fakturPBR, bez nowych generowanych modeli.
- Konstrukcje wyłącznie stalowe; osiem sportów w Nawierzchni. Dołączenie StreetArena15 do zgodnego StreetFootball3×3 zachowuje nawierzchnię. Inna rodzina wybiera jej kompletny model; nie obiecujemy niezgodnych połączeń.
- Opcjonalne decorativeLineStyle w walidowanym JSON. Brak pola/none zachowuje stare zachowanie. Dekoracja trafia do podglądu, tekstury3D i planu. Nie zastępuje przepisowych oznaczeń. Koszt wykonania nieznany: osobna pozycja do indywidualnej wyceny, kalkulacja częściowa; brak wymyślonej stawki.
- Koszty produkcji i marża nadal wyłącznie po stronie serwera. Bez zmianSQL/BOM/rewizji geometrii i bez wysyłania wiadomości.

## Walidacja i publikacja

PASS: TypeScript, test:studio (300wzorów/19palet, geometria, import/odzyskiwanie, prywatność), build, test:mobile375/390/430/1440 (materiały, kolory, JSON i Radar), moduły4rodziny×390/1440, mobilny układ320×568/375×812/390×844/430×932/844×390 (biel, wysokość, przewijanie panelu, obrót, zmiana orientacji).

Nowy test studio-visual-browser390/1440:12różnych podglądów, dotknięcie/strzałki/klawiatura, rzeczywisty emulowany swipeCDP, pojedyncze Cofnij, ruch pionowy bez zmiany kompozycji; model konstrukcji, kolory, materiał i Płatki w JSON oraz pikselach głównego modelu. Test wykrył utratę intencji gestu przy natywnym pointercancel; poprawiono zachowanie touchmove i powtórzono kontrolę. Domena wyceny obejmuje5dekoracji z/bez linii sportowych oraz niezmienione wyniki dla none/braku pola.

Ręcznie obejrzano działające lokalne Studio przez ComputerUse oraz zrzuty390/1440. Dowody: outputs/studio-ux/visual-carousel-browser.json, white-mobile-layout.json i zrzuty visual-design/visual-petals; publiczne kopie w tools/visual-studio-2026-10-25. Receipt publikacji zapisany poza źródłem po zakończeniu wdrożenia. Istniejące ostrzeżenia wielkości chunków i ścieżek ikonLeaflet pozostają. Badanie na fizycznym Safari i testy z użytkownikami pozostają kolejnym krokiem. Nowy wygląd nie jest dowodem wzrostu konwersji.
