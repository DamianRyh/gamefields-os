# Najpierw kolekcje, potem warianty — 26.10.2026

Nawierzchnia→Wzór otwiera się na kolekcjach. Nie pokazuje dwóch konkurujących karuzel naraz. Pierwszy krok zawiera25rodzin z realnymi podglądami i przycisk widoku wszystkich kolekcji. Dopasuj lub krok Warianty prowadzi do12kompozycji tylko wybranej rodziny. W siatce jawny wybór kolekcji od razu otwiera jej warianty. Zmień kolekcję przywraca pierwszy krok.

Nowa rodzina uruchamia swój pierwszy wariant, zgodny z miniaturą. Wskazanie tej samej rodziny zachowuje już wybraną kompozycję. Samo otwieranie kroków, widoku wszystkich oraz powrót nie zmieniają Project ani ceny. Kroki są stanem interfejsu, nie nowymi polamiJSON. Pełne300wzorów,19palet, modele i wcześniejsze szkice zachowane. Inspiracje Signature i pełna biblioteka pozostają dostępne.

Warianty mają kontekst wybranej kolekcji, duże miniatury zamiast numerów oraz działania Zaskocz mnie i Dobierz kolory. Losowanie wybiera jeden z11pozostałych wariantów tej samej rodziny i jest pojedynczą zmianą do cofnięcia. Kontynuacja do kolorów zachowuje kompozycję. Zachowano swipe, kliknięcie, klawiaturę, focus i reduced-motion; brak autoplay. Grafika bieżącego projektu nadal reaguje w3D.

Estetyka: jedna karuzela na krok, spokojny segmentowy wybór, krótki kontekst kolekcji, pojedyncza ikona przeglądu wszystkich i większe obrazy. Zwarta wersja mobilna zachowuje miejsce na model. Dotychczasowy nagłówek Skala i logo zmieniono na Skala i wykończenie, zgodnie z faktycznymi narzędziami w tej sekcji; logo pozostaje w Grafice.

## Kontrola

TypeScript, build i test:studio; wymagane mobile375/390/430/1440 z materiałami/JSON/Radarem; karuzele390/1440 z rzeczywistym emulowanym swipe i Cofnij. Nowy studio-collections-browser390/1440:25kolekcji,12różnych kompozycji, otwarcie/powrót bez zmiany projektu, wybór nowej rodziny, zachowanie wariantu tej samej rodziny, losowanie/Cofnij, przejście do kolorów i brak przepełnienia. Dowody: outputs/studio-ux/collections-browser.json i zrzuty collections-first/all-collections/collection-variants. PASS: TypeScript, build, test:studio, mobile4, karuzele2 i nowy test kolekcji2. Pierwsze próby testera kończyły się limitem oczekiwania; odczyt diagnostyczny wskazał data-ready=true oraz zakończoną generację renderera, bez błędówJS/HTTP. Powtórzenie w aktywnie oczekującej sesji przeszło bez zmiany kodu aplikacji. Nie traktujemy tego jako dowodu poprawy wydajności. Receipt publikacji poza checkoutem; centralny raport potwierdza wynik wydania. EmulacjaChromium nie jest badaniem na fizycznymSafari ani dowodem konwersji.
