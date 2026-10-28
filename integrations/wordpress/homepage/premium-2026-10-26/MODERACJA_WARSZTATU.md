# Warsztat — zapis jednym kliknięciem

Aktualizacja 28.10.2026 zastępuje wcześniejszy formularz i ręczną publikację. Publiczna galeria nie czyta już kategorii WordPress 643. Formularz CF7 4159 pozostaje nieużywany, aby nie niszczyć historii poprzedniego rozwiązania.

## Dla użytkownika

1. Zaprojektuj boisko w Studio.
2. Kliknij **Zapisz dla innych**. Kliknięcie świadomie publikuje układ, materiał, wzór i kolory. Nie wymaga konta, danych kontaktowych, pliku ani wcześniejszej akceptacji.
3. Projekt od razu trafia do publicznego Warsztatu na stronie głównej. Inni klikają **Zrób swoją wersję**, aby otworzyć pełną kopię z indywidualnymi kolorami w Studio.
4. Po publikacji autor widzi **Wycofaj**. Losowy klucz do wycofania jest zwracany tylko publikującemu i zachowany na tym urządzeniu. Nie jest częścią publicznego feedu. Najprościej wycofać projekt bezpośrednio po zapisie; utrata pamięci przeglądarki oznacza utratę tego klucza.

## Publiczne dane

Serwer waliduje przez `projectSchema`, usuwa własną nazwę, identyfikator, wycenę, datę, teksty, obrazy i obiekty autora. Generuje tytuł z katalogowych nazw modelu i wzoru. Nie przyjmuje przesyłanych obrazków do automatycznej publikacji. Miniaturę wzoru i kolorów generuje ze zweryfikowanych parametrów; pełny model jest dostępny w kopii otwieranej w Studio.

Nowa addytywna migracja `0011_studio_workshop` tworzy tabelę D1 `studio_workshop_designs`; wcześniejsze migracje pozostają niezmienione. Rekord zawiera konfigurację, tytuł i datę serwera oraz niepubliczne skróty do deduplikacji, limitu i wycofania. Nie przechowuje surowego IP: dzienny skrót służy ograniczeniu nowych zapisów. Feed zwraca wyłącznie identyfikator, tytuł i datę 10 najnowszych prac. Starsze rekordy nie są automatycznie usuwane.

## API Studia

- `GET /api/workshop`: ostatnie 10 rekordów.
- `GET /api/workshop?id=UUID`: pełna publiczna konfiguracja.
- `GET /api/workshop?id=UUID&format=svg`: miniatura wzoru i kolorów, wygenerowana po stronie serwera.
- `POST /api/workshop`: publikacja zweryfikowanego projektu. Zapis wymaga źródła odpowiadającego Studio; żądanie do 32 KB; atomowy limit 3 nowych konfiguracji na 10 minut dla dziennego skrótu źródła. Ponowienie tej samej konfiguracji nie tworzy kolejnej pracy.
- `DELETE /api/workshop`: wycofanie jednego rekordu po UUID i losowym kluczu. Klucz jest sprawdzany przez skrót; nigdy nie jest zwracany w publicznym odczycie.

Widok główny odczytuje feed bez poświadczeń; CORS pozwala na odczyt publicznych projektów. W zapisie nie ma kluczy ani kont WordPressa. Kopia zachowuje całą publiczną konfigurację i przed zastąpieniem bieżącego szkicu korzysta z istniejącego mechanizmu zachowania poprzedniego projektu.

## Weryfikacja i wydanie

Studio Sites **108**, source `c47985ec0a1d29a4bef7c8fe8ba91f4b948af1e0`, deployment `appgdep_6ae1c87698d48191a4d82eb8dcd640b9`: succeeded. WordPress **4173**. Równoległa aktualizacja modelu Panna Court v6 została scalona i zachowana; jej podmiana mediów na homepage została przeniesiona do odtwarzalnych źródeł `panna-court-v6-runtime.js`.

TypeScript, test:studio, build, test:mobile, test modelu v6 oraz D1/API/UI 390/1440: PASS. Publiczny test zapisał własną nietypową konfigurację, potwierdził feed, SVG i otwarcie dokładnej kopii, po czym wycofał wyłącznie własny rekord z wynikiem 200. Żadna testowa praca nie pozostała w galerii. Publiczny odczyt feedu z domeny WordPressa również przeszedł.

To rozwiązanie nie wysyła zgłoszeń e-mailem. Nie publikuje szkiców z przeglądarki bez naciśnięcia przycisku.
