# GAMEFIELDS Court Objects — WordPress

Samodzielny frontend zbudowany z tych samych komponentów React co `/objects` w Studio. Nie wymaga publikacji Cloudflare/Sites, nowych sekretów ani zmian istniejącej integracji PLAY.

## Zbudowanie paczki

```sh
pnpm build:objects
```

Rezultat: `dist/court-objects/gamefields-court-objects.zip`. Node.js, pnpm i `zip` są potrzebne tylko podczas budowania, nie na hostingu WordPressa.

## Instalacja na gamefields.eu

1. Wykonaj standardową kopię zapasową hostingu.
2. WordPress → Wtyczki → Dodaj nową → Wyślij wtyczkę na serwer. Wybierz ZIP, zainstaluj i aktywuj.
3. Wtyczka tworzy opublikowaną stronę COURT OBJECTS z adresem `/court-objects/`. Nie nadpisuje istniejącej strony z tym slugiem; konflikt zatrzymuje aktywację.
4. Ustawienia → Court Objects → wybierz menu strony → Dodaj COURT OBJECTS. W motywach blokowych dodaj istniejącą stronę do bloku Nawigacja w edytorze witryny.
5. Otwórz `https://gamefields.eu/court-objects/` i sprawdź palety, sport, kompozycję, Room View, ceny oraz zapis/udostępnianie. W razie istniejącego przekierowania do `www` zachowaj kanoniczny adres strony.
6. Po aktualizacji paczki wyczyść cache tej strony, jeśli hosting/CDN serwuje starszą wersję.

Wtyczka serwuje pełny konfigurator na swojej własnej stronie, zachowując resztę witryny i menu bez zmian do momentu wyboru menu przez administratora. Shortcode `[gamefields_court_objects]` pozwala osadzić konfigurator w innej stronie poprzez iframe.

Zamówienia i zapytania są **lokalnymi szkicami**. Nie trafiają do WooCommerce, CRM, maila ani backendu. Nie ma płatności. Dane formularzy pozostają w localStorage i nie są zawarte w linkach do projektu. Udostępniane parametry projektu są walidowane.

## Aktualizacje i cofnięcie

Przebuduj ZIP po zmianie komponentów i użyj zastąpienia istniejącej wtyczki w panelu. Ponowna aktywacja nie duplikuje strony; dodanie do menu nie duplikuje pozycji.

Aby cofnąć wdrożenie: usuń pozycję menu, ustaw stronę Court Objects jako szkic i dezaktywuj wtyczkę. Dezaktywacja sama nie usuwa strony ani żadnych treści.
