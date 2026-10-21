# Wydajność WordPress — konkretne ustalenia

21.10.2026. To analiza zasobów i przygotowany plan odciążenia, a nie nowy wynik Lighthouse. Wcześniejszy audyt podał 57/100, LCP 3,3 s, TBT 1310 ms i transfer 4972 KiB. Nie przypisujemy tym samym liczbom statusu „po zmianach”.

## Potwierdzone dane

- WordPress 7.1.3, PHP 8.5.10, Savoy 2.8.8, WPVibe 1.20.5. `site_info.plugins` jest listą zainstalowanych wtyczek, nie dowodem ich aktywności. Późniejszy natywny odczyt `plugin list --fields=name,status` wykonany przez rodzica potwierdził, że **LiteSpeed Cache jest nieaktywny**. Nie włączano go ani nie zmieniano jego nieznanej konfiguracji. Obecność pozostałych frontendowych zasobów potwierdza osobna inwentaryzacja HTML.
- Jedno wywołanie diagnostyczne WPVibe: 716 ms łącznie, w tym 672 ms sieci, 44 ms PHP i 0 ms Worker. To pomiar połączenia API, **nie** TTFB publicznej strony ani dowód stałego czasu odpowiedzi serwera.
- `cache type`: domyślny object cache, brak drop-in. Sam ten wynik nie opisuje cache HTML.
- Publiczny HTML strony głównej pobrany po wdrożeniu fasady: `iframe#gc-studio-frame` ma `data-src`, `hidden` i `tabindex=-1`, **nie ma `src`**. Sam parser HTML nie uruchomi zatem z niego Studio przed aktywacją. Dowód dotyczy HTML; zachowanie kliknięcia sprawdza rodzic w przeglądarce.
- Inwentaryzacja HTML: 17 zewnętrznych arkuszy CSS i 22 skrypty JS. 39/39 plików pobrano poprawnie. Suma transferów curl z kompresją: 202828 B; rozmiar po dekompresji: 958981 B. To **tylko te zasoby dokumentu nadrzędnego**, bez obrazów, fontów pobranych z CSS, iframe, czasu JS i innych zasobów dynamicznych; nie należy porównywać jej wprost z pełnym transferem Lighthouse.
- Pliki i identyfikatory: `performance-assets/resources-measured.json`. Rozmiary są z faktycznego pobrania, nie z deklaracji nagłówków.

## Największe arkusze

| Handle | Po dekompresji | Transfer tego pomiaru |
|---|---:|---:|
| `nm-shop` | 200405 B | 30986 B |
| `wp-block-library` | 140829 B | 19094 B |
| `nm-core` | 130646 B | 22397 B |
| `nm-elements` | 102943 B | 14337 B |
| `nm-grid` | 33872 B | 4603 B |

`functions.php` Savoy, wiersze 381–419 i 470–477 potwierdzają enqueue arkuszy i Slick/Magnific. W pobranym `nm-core` występują faktyczne wywołania `slick()` i `magnificPopup()` oraz odwołanie do `wc_add_to_cart_params`. Usunięcie samych bibliotek mogłoby popsuć wykonanie wspólnego skryptu. Nie należy ich odłączać na podstawie samego niewidocznego slidera.

## Małe, konkretne odciążenie do wdrożenia w kodzie serwera

Gotowy, **niewdrożony** plik `scoped-assets-proposal.php` proponuje odpięcie wyłącznie arkuszy `wcboost-variation-swatches`, `nm-portfolio`, `nm-shop`, `selectod` na sześciu sprawdzonych, samodzielnych stronach oferty: 3465,3689,3704,3715,3717,3724. Warunki sprawdzają ID, klasę treści i brak formularza/widgetu commerce, nie tylko adres URL. Arkusz zależny od tych handle blokuje jego odpięcie.

| ID | Bieżąca strona | Oczekiwany zakres CSS |
|---|---|---|
| 3465 | [Katalog boisk](https://www.gamefields.eu/boiska-street-football/) | `.gfcatalog` |
| 3689 | [Projektowanie boisk](https://www.gamefields.eu/projektowanie-boisk/) | `.gfseo` |
| 3704 | [Aktywacje dla marek](https://www.gamefields.eu/aktywacje-sportowe-dla-marek/) | `.gfsilo` |
| 3715 | [O nas](https://www.gamefields.eu/o-nas/) | `.gfbrand` |
| 3717 | [Baza wiedzy](https://www.gamefields.eu/baza-wiedzy/) | `.gfbrand` |
| 3724 | [Eventy sportowe](https://www.gamefields.eu/eventy-sportowe/) | `.gfcommercial` |

Identyfikatory i klasy pochodzą z odczytów WordPress zapisanych w `outputs/full-site-audit/wordpress-after/{id}.html`. Formularz głównej strony to CF7 w 3462; ta strona nie jest objęta snippetem. Nie zmienia on także osadzonego Studio, OS ani zasobów aplikacji Sites.

Te cztery arkusze to łącznie **218715 B po dekompresji i 34802 B transferu** w pomiarze strony głównej. To potencjalny sufit tej konkretnej fazy na stronie ładującej wszystkie cztery; nie obietnica wzrostu wyniku ani zmierzone oszczędności na każdej podstronie.

Plan zachowuje wszystkie JS, CF7/SWV/wp-i18n/wp-hooks, Complianz, jQuery, Slick, Magnific, WooCommerce i Savoy. Wyklucza sklep, produkt, koszyk, checkout, konto, żądania inne niż GET, REST, AJAX, admin, preview i feed. Strona główna z CF7, Studio i OS nie są na allowliście. Historyczne produkty nie zostaną zmienione. To zachowawcza pierwsza faza, nie maksymalna redukcja 164 KiB niewykorzystywanego CSS.

Przed aktywacją potrzebna jest próba na kopii/preview: 390/810/1440 px, porównanie wyglądu, menu, filtrów 8 modeli i porównania, linków i fokusu; sprawdzenie CF7 na stronie głównej i produktu/koszyka/checkout/konta poza allowlistą. Po aktywacji weryfikacja HTML musi potwierdzić brak tylko czterech dozwolonych handle na allowliście i ich zachowanie na produkcie, a ponowny Lighthouse poda rzeczywisty wynik.

## Dlaczego nie aktywowano odłączania po stronie serwera

- Udostępnione 14 abilities nie zawiera działania LiteSpeed/performance/cache ani ustawienia minifikacji.
- Lista zarejestrowanych namespace REST nie zawiera LiteSpeed. Nie zgadywano nieudokumentowanych endpointów ani nazw opcji.
- Read-only odczyty `litespeed.conf` i filtrowanej listy opcji nie zwróciły konfiguracji; nie stanowią inwentaryzacji wszystkich historycznych opcji. O statusie LiteSpeed rozstrzyga natywny odczyt wtyczek: nieaktywny.
- Odczyt aktywnego `functions.php` zwraca jawnie, że witryna ustawia `DISALLOW_FILE_EDIT` lub `DISALLOW_FILE_MODS`; edycja motywu przez WPVibe jest zablokowana. Dokładnej z tych dwóch stałych odpowiedź nie rozstrzyga.
- W ostatnim odczycie WPCode nie był jeszcze zainstalowany; właściciel zadeklarował, że sam zainstaluje WPCode Lite. Przygotowano `wpcode-scoped-assets-payload.json`: dokładny tytuł, kod PHP bez znacznika otwierającego i ustawienie `frontend_only`. Po potwierdzeniu instalacji rodzic może utworzyć tym payloadem wyłączony snippet przez natywne `code_snippet`. **Użytkownik musi go przejrzeć i sam włączyć w WPCode**; narzędzie nie pozwala agentowi go aktywować. Nie obchodzono ograniczenia przez treść strony, gateway, bazę danych czy zmianę motywu.
- Lokalna komenda `command -v php` nie znalazła interpretera. Nie wykonano `php -l` i nie deklarujemy potwierdzonej lokalnie poprawności składni PHP. Kod wymaga kontroli WPCode przy włączaniu i opisanych testów po aktywacji.

W tym zakresie nie ma dostępnego wywołania do samodzielnego aktywowania scoped dequeue; po instalacji WPCode można przygotować wyłączony kod do przeglądu właściciela. Wdrożona w tym przebiegu realna poprawa ładowania strony głównej to fasada iframe przygotowana przez rodzica. Nie wykonywano globalnej dezaktywacji wtyczek, aktywacji LiteSpeed, ustawień minifikacji/delay JS ani zbędnego pełnego czyszczenia cache. Natywne `cache purge --url=...` jest dostępne na przypadek potwierdzonego starego HTML, ale nie stanowi dowodu działania nieaktywnego LiteSpeed. Zwykłe zapisy treści korzystają z natywnych hooków WordPress; to, czy i która aktywna warstwa cache reaguje, należy sprawdzić niezależnie.
