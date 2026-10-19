# Gamefields OS — publiczny panel

`gamefields-os.html` jest treścią strony `/os/` w WordPressie. Panel udostępnia P-1, Panna Kids, W-1, bibliotekę 3D, katalog komponentów, koncepcyjny system modułowy i istniejące Studio. Moduły 3D są osadzone z publicznego wdrożenia GitHub Pages tego samego repozytorium. Powiązane źródła React i statyczny eksport są w tej wersji projektu.

Właściciel 19.10.2026 wyraźnie polecił: „udostepnij wszystkie modele oraz podgląd 3d , cały sestem operacyjny”. Wcześniej potwierdził, że publiczny P-1 oznacza możliwość pobrania GLB. W związku z tym publiczna dystrybucja obejmuje wszystkie 3 źródłowe modele i 12 komponentów. Nie zmieniono geometrii ani mechanizmów logowania do danych kont.

P-1 i Panna Kids mają wygenerowane scenerie 2D. W scenerii kamera jest stała, geometria zachowuje skalę 1:1, pod modelem jest płaszczyzna cienia kontaktowego. Neutralny widok zachowuje orbitę, zoom i pan. Nieudane wczytanie tła pozostawia działający model na neutralnym tle z komunikatem. Tła nie są panoramami HDRI ani zdjęciami rzeczywistych realizacji.

## Publikacja

- Aplikacja i modele: `.github/workflows/modular-preview.yml` buduje `dist/modular-review` i publikuje przez GitHub Pages po testach. Weryfikuje dostępność wszystkich GLB, obu teł i produktu Panna Kids.
- Strona: zapisać tylko `content` właściwego wpisu WordPressa po kopii i porównaniu bieżącej treści. Nową stronę najpierw odebrać jako szkic. Wejście do OS jest dodane do nawigacji strony głównej i katalogu.
- `public/configurator-backgrounds` zawiera zatwierdzone tła. `public/models/gamefields` zawiera zatwierdzone do publikacji modele i komponenty.
- Autoryzacja modeli nie zastępuje zatwierdzenia parametrów produkcyjnych, połączeń lub cen. Istniejące oznaczenia koncepcyjne i Engineering Gate pozostają.

## Odbiór

`npm run test:modular:review`, `node tests/configurator-backgrounds.mjs`, `npm run test:source-components`, `npm run test:panna-kids`, typowanie i CI aplikacji. Kontrole obejmują oryginalne sumy modeli i 1:1 instancji, wszystkie 15 plików, podglądy części/K1, zmianę tła/trybu i awarię tła na 1440/390 px. Odbiór WordPressa obejmuje przełączniki panelu, iframe i wejścia nawigacyjne, bez wysyłania formularzy.

## Granica pełnego OS

Publiczny panel i modele działają bez dostępu do prywatnych danych. Pełne funkcje kont, projektów online, PLAY i serwerowych zapytań Panna Kids wymagają publikacji backendu aplikacji, konfiguracji D1 oraz właściwych sesji. Statyczny Pages nie udaje ich działania; Panna Kids oferuje w nim pobranie briefu i kontakt. Panel pokazuje aktualną niedostępność kont/PLAY.

W tej sesji nie ma narzędzia publikacji hosta `gamefields-studio.ryhfs90.chatgpt.site`, a odczyt nazw sekretów wdrożeniowych GitHub zwraca 403. Nie uzyskano w ten sposób dostępu do konfiguracji backendu. Do zakończenia tego zakresu potrzebne jest połączenie środowiska hostującego aplikację lub konfiguracja publikacji przez właściciela. Przed migracją istniejącej D1 potrzebny jest backup i odczyt stanu migracji. Nie opublikowano danych kont, bazy ani poświadczeń.

WordPress podczas odbioru emitował fragment `nm-wishlist` przed JSON REST. Narzędzia publikacji odczytują właściwą odpowiedź po tym znanym prefiksie; nie zmieniano wtyczki Wishlist. To osobna usterka odpowiedzi REST wymagająca korekty w motywie/wtyczce.
