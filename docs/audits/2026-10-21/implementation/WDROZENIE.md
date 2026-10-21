# Gamefields — realizacja zaleceń po audycie

## Aktualizacja kontynuacji — 21 października 2026

**Stan aktualny:** Studio wersja **74**, publicznie wdrożone. Source commit `23b395853d0d826ee3de07f5f3b1b6a38666c0fe`; deployment `appgdep_6ad8ecb49a988191b11960f74ff09bd7` — **succeeded**, revision środowiska 3. [Studio](https://gamefields-studio.ryhfs90.chatgpt.site). Wersja 73 z orientacyjnym cennikiem konstrukcji pozostaje zachowana w tej wersji; brak zmian cen ani zakresu wyceny.

### Zrealizowane w kontynuacji

- Usunięto ciche obcinanie danych zapytania po 18 000 znaków. Kompletne parametry, pozycje elementów, napisy, kolory i dostępna aktualna kalkulacja przechodzą jako poprawny JSON. Limit 500 000 znaków jest zgodny w Studio, odbiorniku WordPress strony 3462 i polu CF7 formularza 3758.
- Usunięto bajty grafik z nawierzchni **oraz z paneli** z wiadomości zapytania. Metadane wskazują obecność plików; pliki logo pozostają do przesłania osobno. Projekt źródłowy i jego eksport JSON zachowują grafiki.
- Przy przekroczeniu limitu wyświetla się instrukcja pobrania kopii JSON; przy zablokowaniu okna formularza — komunikat umożliwiający ponowną próbę. Nie przekazujemy urwanego JSON.
- WordPress zmieniono dwiema operacjami match-once: limit odbiornika oraz wyłącznie pole project-details. Odbiorca i konfiguracja poczty nie zostały zmienione. Odczyt konfiguracji CF7 i publicznego DOM potwierdził nowy limit.

### Aktualny pomiar strony głównej

Jeden pomiar Lighthouse mobile: **Performance 94 / Accessibility 100 / Best Practices 96 / SEO 100**. LCP **2,8 s**, CLS **0**, TBT **0 ms**, FCP **2,0 s**, Speed Index **3,1 s**. To wynik laboratoryjny, bez danych CrUX i bez deklaracji pełnej dostępności. Zastępuje wcześniejszy, pośredni wynik 70/100 opisany w części historycznej poniżej.

Pozostałe wskazania: minifikacja CSS około 17 KiB, nieużywany CSS około 147 KiB. Lighthouse zgłosił błąd konsoli bez szczegółów; w dwóch odczytach konsoli przeglądarki nie został odtworzony. Nie oznaczamy go jako naprawionego.

### Weryfikacja

PASS: TypeScript (bezpośrednio przez lokalny kompilator; brak shimu pnpm exec tsc), build, test:studio (300 wzorów / 19 palet), quote-engine, construction-pricing, test:mobile (375/390/430/1440; sceny, materiały, JSON, zachowanie szkicu, Radar). Build ma wcześniejsze ostrzeżenia rozmiaru chunków i ścieżek ikon Leaflet.

Nowy test inquiry-summary: **200 elementów, Unicode, pełna kalkulacja, 1,4 mln znaków źródła logo panelu; wynik 168 599 znaków**. JSON daje się odczytać do ostatniego elementu; brak bajtów grafik; oryginał niezmieniony; za duży projekt odrzucany komunikatem. Test jest dołączony do test:studio.

Po publikacji potwierdzono w przeglądarce: strona główna → uruchom Studio → podsumowanie Panna Octa z 15 300 zł za wycenione pozycje → zapytanie → publiczne pole formularza zawiera poprawny JSON (4 881 znaków), 2 obiekty, kalkulację partial i metadane grafik; limit 500 000. Fokus trafia do e-mail. **Nie wysłano kolejnej wiadomości.** Duży projekt sprawdzony automatycznie, nie wysłany produkcyjną pocztą.

### Nadal wymaga działania lub danych

1. **WPCode Lite nadal nie jest zainstalowany.** Narzędzie WPVibe wymaga instalacji przez właściciela i osobistego włączenia fragmentu; nie obchodzimy tej reguły innym kanałem. Gotowy fragment scoped-assets pozostaje do przeglądu. Nie odłączono globalnie CSS sklepu.
2. Dane umowne prywatności: adres podmiotu, hosting/poczta, retencja logów i kopii oraz ewentualne transfery. Nie dopisano niepotwierdzonych faktów.
3. Odbiór wcześniejszej jednej wiadomości testowej w skrzynce info@gamefields.eu nadal niepotwierdzony; status CF7 sent nie dowodzi dostarczenia do skrzynki.
4. Testy fizycznych urządzeń, czytnika ekranu i badania z klientami pozostają niewykonane.

---

## Historia wcześniejszego wdrożenia

21 października 2026. Wdrożenie w istniejących adresach Gamefields, z udziałem trzech agentów: wydajność WordPress, dostępność Studio oraz prywatność i treści historyczne.

## Zrealizowane

1. **Ładowanie strony głównej.** Studio przestało automatycznie pobierać aplikację i zasoby3D. Na początku iframe ma `hidden`, `data-src` i brak `src`; przycisk „Uruchom Studio3D” ładuje ten sam konfigurator w tym samym miejscu. Bez JavaScript przycisk pozostaje prawdziwym odnośnikiem do konfiguratora. Podczas wczytywania jest komunikat i stały odnośnik do pełnego ekranu.
2. **Obraz i czcionki.** Podgląd używa rzeczywistych wariantów WordPress768/1024 zamiast oryginału1672px. Ich metadane wskazują124318/206684B zamiast580320B. Dwa pliki WOFF2 Space Grotesk (22288+18940B) są na istniejącym hostingu Studio, z licencją SIL OFL. Na stronie głównej nie ma już linków do Google Fonts. Nie zmieniono kroju ani polskich znaków. Nie oznacza to usunięcia wszystkich zewnętrznych zasobów całego serwisu.
3. **Integracja Studio → zapytanie.** W przeglądarce potwierdzono: UruchomStudio → działający modelPannaOcta → Podsumowanie → Zapytajorealizację → parametry dołączone do formularza i fokus e-mail. Nie wysłano wiadomości w tym sprawdzeniu.
4. **Wąskie ekrany i klawiatura.** Naprawiono przycinanie nagłówka przy szerokości do360px. Przy320px szerokość dokumentu wynosi320px, nagłówek167px mieści logo, akcje, nazwę i status. Nowy test sprawdza720×500 i320×500 jako przybliżenie reflow przy200%, dialogi,25przejśćTab w podsumowaniu,20Tab/ShiftTab w bibliotece, Escape, przywracanie fokusu, filtry i przejściaRadaru. To nie fizyczny telefon ani rzeczywisty test czytnika ekranu.
5. **Prywatność.** Strona4087 jest oficjalną stroną prywatności WordPress — zapis opcji i odczyt4087 potwierdzony. Dodano potwierdzony kierunek wysyłki CF7 na info@gamefields.eu. Pełna konfiguracja prywatności pozostaje zależna od faktów z umów i paneli dostawców.
6. **Treści historyczne.** Sprawdzono26starszych stron: wszystkie mają jużYoastnoindex=1. Oddzielono prawdziwe stare treści Gamefields od demonstracyjnych. Niczego nie usuwano ani nie przekierowywano bez danych o ruchu i planu adresów.

## Wynik pomiaru wydajności

Po odroczeniu iframe, przed końcową optymalizacją obrazów i fontów, Lighthouse mobile dał70/100 zamiast wcześniejszych57/100. TBT spadło z1310 do0ms; FCP3,0s, SpeedIndex3,4s, CLS0,086. LCP wzrosło do6,3s — ten problem był powodem zmniejszenia obrazu i usunięcia zewnętrznego arkusza fontów. Nie deklarujemy jeszcze końcowego LCP po tych ostatnich zmianach. Dostępność/dobrepraktyki/SEO:100/100 w tym pojedynczym automatycznym pomiarze, bez deklaracji pełnej zgodności.

## Testy i publikacja

Studio wersja71, commit142391e275bb481b50279949a0ea26599ed251d0, deployment appgdep_6ad860d2040c8191b093e520f33f6fe3 — succeeded.

PASS: TypeScript, produkcyjny build, test:studio (300wzorów/19palet), studio-usability375/390/430/1440, nowy reflow-keyboard720/320. Po dodaniu fontów wykonano ponownybuild i porównanoSHA256 plików źródłowych zdist. Nie uruchamiano ponownie testów geometrii, ponieważ nie zmieniono modeli ani renderera.

## Pozostałe zależności — bez deklarowania ich jako wykonanych

- **WPCode:** przygotowano dokładny kod odłączający cztery arkusze na sześciu zweryfikowanych stronach oferty. Chroni stronę główną,Studio,OS,formularze i konteksty sklepu. WordPress blokuje edycję motywu; WPCode nie jest jeszcze zainstalowany według ostatniej próby zapisu. Właściciel zadeklarował instalację. Narzędzie zapisze snippet wyłączony; tylko właściciel może go włączyć. Kod:wpcode-scoped-assets-payload.json. Nie został wykonany. Lokalnie brak interpreteraPHP, więc nie deklarujemyphp-l.
- **Prywatność i zgody:** brak kontraktowych danych operatora WordPress/poczty, retencji logów/backupów oraz transferów. Complianz jest aktywny, ale tabela konfiguracji banerów była pusta. Szczegółowa checklista znajduje się wprivacy-and-legacy.md. Nie ustawiono zgód na podstawie domysłów.
- **Formularz:** poproszono o zgodę na jedną jednoznacznie oznaczoną wiadomość testową na info@gamefields.eu. Po zgodzie właściciela wysłano dokładnie jeden test z zatwierdzoną treścią i adresem kontaktowym. Formularz zwrócił stan sent i komunikat „Dziękujemy. Twoje zapytanie zostało wysłane.” Nie ponawiano wysyłki. Odbiór w skrzynce pozostaje niepotwierdzony.
- **Badania z ludźmi i urządzeniami:** fizyczny telefon, czytnik ekranu i badanie z klientami wymagają rzeczywistych urządzeń/uczestników. Testy viewportów i klawiatury wykonano, ale nie zastępują tych badań.

## Dowody

![Szybki podgląd i jawne uruchomienieStudio](02-home-final-desktop.png)
![Mobilny przycisk uruchomienia](04-home-mobile.png)
![Parametry przekazane do formularza](03-inquiry-parameters.png)
![Wąski nagłówekStudio](05-studio-narrow.png)
![Wysłany jeden test formularza](06-form-test-sent.png)

Podejście do odraczania ciężkiego osadzenia: [Google Chrome — third-party facades](https://developer.chrome.com/docs/lighthouse/performance/third-party-facades). Czcionka i licencja: [oficjalne repozytorium Google Fonts](https://github.com/google/fonts/tree/main/ofl/spacegrotesk).
