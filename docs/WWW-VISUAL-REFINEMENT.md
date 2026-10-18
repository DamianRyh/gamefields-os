# Spójność oferty i kontrola zapytania — 18.10.2026

Zakres obejmuje dziewięć istniejących stron WordPressa: stronę główną, katalog Panna i siedem kart produktów. Praca odbywa się w repozytorium i przez istniejący dostęp administracyjny WordPressa. Ta sesja nie ma narzędzia do sterowania pulpitem lub Visual Studio użytkownika.

## Wygląd oferty

Katalog i karty stosują tę samą paletę co strona główna: fiolet `#6336f5`, kremowy żółty `#f3e68a`, burgund `#4a122b` oraz Space Grotesk. Zmniejszono i uproszczono nagłówki, zastępując wersaliki czytelniejszą typografią. Karty katalogu eksponują obraz nad opisem i parametrami. Zachowano istniejące nazwy, treści, ceny, parametry i adresy.

Dotychczasowe obrazy tła w katalogu i głównym widoku modelu zastępują elementy `img` z opisem alternatywnym. Obrazy pokazują całą oryginalną grafikę przez `object-fit: contain`; nie wygenerowano nowych przedstawień konstrukcji i nie zmieniono plików źródłowych. Lista używa lazy loading, główny obraz produktu ma wysoki priorytet. Neutralne tło dopasowano do dotychczasowych renderów. Jakość jest ograniczona dostępnymi plikami: przykładowy `4-2.jpg` ma 550 × 680 px. Większe, dokładniejsze packshoty wymagają materiałów źródłowych.

Dodano ścieżkę powrotu do katalogu i wspólną stopkę z kontaktem, prywatnością oraz porównaniem modeli. Link „Dla marek” prowadzi do istniejącej strony aktywacji sportowych zamiast nieobecnej kotwicy `/#marki`.

Wspólne źródło stylów: `integrations/wordpress/products/gamefields-product-design.css`. Synchronizacja osadza je w ośmiu blokach HTML WordPressa:

```sh
node scripts/sync-wordpress-product-design.mjs
node scripts/sync-wordpress-product-design.mjs --check
```

Kontrola zgodności jest częścią CI. Nie trzeba publikować osobnego pliku CSS ani instalować dodatkowej wtyczki.

## Kontrola danych zapytania

Przy dołączonych parametrach strona główna pokazuje rozwijany podgląd rzeczywistego pola `project-details`, które trafia do istniejącego formularza CF7. Treść jest wyświetlana przez `textContent`, bez interpretacji HTML. Obszar obsługuje dłuższe opisy i klawiaturę.

„Usuń dołączone parametry” czyści wyłącznie kontekst projektu, zaznaczenie kierunku, oznaczenie modelu i parametr produktu w URL. Wiadomość, e-mail i imię pozostają w formularzu. Fokus wraca do pola e-mail, a komunikat potwierdza zmianę. Kolejny wybór lub projekt ze Studio znów uzupełnia podgląd. Nie dodano zapisywania danych osobowych w przeglądarce ani nowej integracji wysyłkowej.

## Odbiór i publikacja

Test produktów: `node tests/wordpress-products.mjs` — siedem kart, filtry, porównanie, obrazy, okruszki nawigacji i przekazanie wyboru do formularza; 1440/1024/768/390 px. Test strony głównej: `node tests/wordpress-homepage.mjs` — dotychczasowy przepływ oraz podgląd parametrów, bezpieczne wyświetlanie tekstu i czyszczenie kontekstu bez utraty wiadomości/kontaktu; 1440/768/390 px. Żądań zapisu i wysyłki formularzy w testach nie dopuszczano. Te testy nie potwierdzają dostarczania poczty ani pełnej zgodności z WCAG.

Zrzuty robocze znajdują się lokalnie w `outputs/www-wordpress/`, poza repozytorium. Kopie pełnych treści sprzed zmiany, mapa szkiców i odpowiedzi po zapisie są prywatnie w `/workspace/gamefields-backups/wordpress-design-20261018T131646Z`. Jest to kopia zakresu zmiany, a nie całej bazy/hostingu. Numery opublikowanych stron, daty i sumy źródeł znajdują się w plikach `deployment.json` przy źródłach WordPressa.

Przed zapisem porównać aktualną treść z kopią, aby wykryć równoległą edycję. Aktualizować wyłącznie `content`. Cofnięcie polega na przywróceniu poprzedniego `content.raw` tych dziewięciu stron, po sprawdzeniu późniejszych zmian. Szkice odbiorowe po zakończeniu testów przenieść do kosza.

Nie zmieniano builda zewnętrznego Studio, bramy domeny, D1, ustawień cache, szablonów WordPressa, wtyczek, SEO ani konfiguracji poczty. Dostęp do publikacji aplikacji pozostaje osobną zależnością opisaną w `STUDIO-PUBLIC-ACCEPTANCE.md`.

Odbiór szkiców i publicznego wdrożenia zakończony sukcesem: test produktów na czterech szerokościach oraz test strony głównej z podglądem i usuwaniem parametrów na trzech szerokościach. Otworzono i oceniono zrzuty nowej karty katalogowej, głównego widoku modelu na komputerze i telefonie oraz podglądu parametrów. Szkice odbiorowe `3929`–`3937` po sprawdzeniu zgodności treści przeniesiono do kosza. Formularzy nie wysyłano.
