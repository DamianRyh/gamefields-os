# Gamefields homepage — kierunki designu

Źródło bloku HTML opublikowanego 18.10.2026 na stronie głównej WordPressa, post ID `3462`. Motyw Savoy. `gamefields-homepage.html` zawiera pełną treść bloku `wp:html`, nie motyw ani bazę danych.

## Zakres tej iteracji

- Pozycja „Kierunki” w nawigacji oraz skrót z głównego nagłówka.
- Trzy porównywalne karty Organic Flow, Urban Contrast i Classic Lines z istniejącymi wizualizacjami koncepcyjnymi z biblioteki WordPressa. Nie są przedstawiane jako zdjęcia gotowych realizacji.
- Wybór kierunku trafia do istniejącego pola `project-details` w Contact Form 7, formularz ID `3758`. Wiadomość klienta pozostaje zachowana, focus przechodzi na e-mail, a wybrany kierunek ma widoczny stan i potwierdzenie.
- Trzy kroki od inspiracji do określenia zakresu i cztery odpowiedzi FAQ.
- Menu na telefonach i tabletach, wymiary obrazów i lazy loading, obsługa preferencji ograniczonego ruchu.

Zachowano osadzenie istniejącego Studio, usługi budowy/renowacji/wzornictwa/eventów, projekty, autora, kontakt i stopkę. Nie zmieniano adresu strony, szablonu, tytułu, ustawień SEO, wtyczek ani konfiguracji mailowej.

## Dane i obrazy

| Kierunek | Media ID |
| --- | --- |
| Organic Flow | 3772 |
| Urban Contrast | 3779 |
| Classic Lines | 3780 |

Adresy obrazów są zawarte w źródle HTML. Nie dodano ich ponownie do biblioteki. Adres Organic Flow zawiera znak „—” zakodowany w URL. Kopia treści sprzed wdrożenia, konfiguracja formularza i indeks stron są zapisane prywatnie w `/workspace/gamefields-backups/wordpress-20261018T074606Z`, poza repozytorium. To kopia zakresu zmiany, nie pełny backup hostingu lub bazy WordPressa.

## Odbiór

```sh
node tests/wordpress-homepage.mjs
```

Test jest przeznaczony do ręcznego odbioru działającego WordPressa, nie do CI aplikacji. Sprawdza 1440/768/390 px, trzy wybory, uzupełnienie pola formularza bez naruszenia wiadomości, focus, FAQ, menu, obecność obrazów, brak poziomego overflow oraz zachowanie oryginalnego iframe. Blokuje żądania inne niż GET/HEAD — **nie wysyła wiadomości i nie potwierdza dostarczenia poczty**.

Dla szkicu można ustawić `GF_WP_TEST_URL`. W środowisku, w którym Chromium nie ufa certyfikatowi pośrednika, test obsługuje `GF_RENDER_BRIDGE_URL` wskazujący lokalny transport pobierający HTTPS z pełną weryfikacją TLS. Sam transport oraz sesje administratora nie są częścią repozytorium. Nie wyłączać weryfikacji certyfikatów.

Zrzuty odbiorowe są lokalnie w `outputs/www-wordpress/directions-*.png`. Testy szkicu i publicznej strony zakończyły się sukcesem; formularza nie wysyłano.

## Wdrożenie i cofnięcie

Przed następną zmianą odczytać aktualne `content.raw` i upewnić się, że nikt nie zmienił strony równolegle. Zachować kopię i zmienić wyłącznie pole `content` strony `3462`; pełny eksport JSON strony nie jest payloadem aktualizacji. Po zapisie porównać treść i sprawdzić publiczną stronę oraz formularz.

Cofnięcie: przywrócić poprzednią treść przez wersje WordPressa albo prywatną kopię `homepage-before.json`, zachowując pozostałe ustawienia strony. Szkic odbiorowy `3880` służył wyłącznie weryfikacji; po odbiorze przeniesiono go do kosza.

## Granica zakresu

Jest to wdrożenie prezentacji oferty i przejścia do kontaktu inspirowane sposobem pracy Tylko. Nie publikuje nowej wersji aplikacji z PR #43. Sam render iframe nie potwierdza działania wszystkich funkcji Studio. API health aplikacji zwraca 404; wcześniejsze 403 z technicznych odczytów nie dowodziły całkowitej niedostępności osadzenia w przeglądarce. Pełne Studio, integracja domeny, cennik i backend projektów wymagają osobnego odbioru.
