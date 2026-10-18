# Utrzymanie Gamefields

## Źródła prawdy

- Kod bazowy: `main` w `DamianRyh/gamefields-os`.
- Stan potwierdzony: `PROJECT_STATUS.md`, zawsze z datą i granicami weryfikacji.
- Kolejka prac: `BACKLOG.md`; szczegóły implementacji w PR-ach i specyfikacjach modułów.
- Dane klientów i treści: właściwe bazy i magazyny wskazane w `DATA-MAP.md`, nie historia rozmów z Codexem.
- Dokumenty `v01`, `v06` itd. opisują iteracje. Nie są potwierdzeniem aktualnej wersji produkcyjnej.

## Zmiana kodu

1. Sprawdź stan repo, niezacommitowane zmiany oraz otwarte PR-y; zabezpiecz istniejącą pracę.
2. Utwórz gałąź dla konkretnego zakresu. Zachowaj obszary opisane w `GAMEFIELDS-PRODUCT-CONTINUITY.md`.
3. Wprowadź zmianę i uruchom adekwatne kontrole z CI. Przy zmianie tylko dokumentacji sprawdź odnośniki i diff; pełny build aplikacji nie jest wymagany.
4. Otwórz PR z problemem, nowym zachowaniem, wynikami kontroli i ograniczeniami. Zielone CI nie potwierdza publikacji ani poprawności danych biznesowych.
5. Przed publikacją ustal docelowy commit i środowisko, backup oraz sposób cofnięcia. Po publikacji sprawdź prawdziwe adresy i pełną ścieżkę użytkownika.

## Gałęzie i PR-y

Nie usuwać gałęzi na podstawie samej nazwy lub daty. Przegląd z 18.10.2026 wskazał 43 gałęzie zdalne; 23 końcówki są przodkami `main` i nie mają otwartego PR. To kandydaci do uporządkowania, nie automatyczne polecenie usunięcia. Pozostałe 19 gałęzi wymaga porównania treści: historia może być scalona przez squash lub zawierać niezależną pracę.

Przed usunięciem: pełna kopia wszystkich refs, potwierdzenie braku unikalnych zmian i zależności podglądów/deploymentów. Zachować tag/archiwum, gdy gałąź jest punktem odniesienia. W tym etapie nie usunięto żadnej gałęzi i nie zamknięto ani nie scalono PR-ów.

Ochronę `main` należy skonfigurować przez GitHub Settings: PR przed scaleniem, wymagane kontrole odpowiadające aktualnemu CI i blokada force-push. Uprawnienie konta ADMIN nie gwarantuje, że integracja Codexa ma API `administration:write`; wcześniejsza próba zarządzania współpracownikami zwróciła 403. Nie wymagać recenzenta, którego nie ma w jednoosobowym projekcie.

## Publikacja i WordPress

Publiczny WP i aplikacja to osobne deploymenty. Przed instalacją gateway potrzebny jest działający upstream, zgodna baza D1 i sprawdzona konfiguracja cen. Nie nadpisywać strony głównej WordPressa samym buildem aplikacji.

Istotny konflikt do naprawy: `/studio` przekierowuje do pliku `studio.webp` w bibliotece WP. Najpierw ustalić źródło przekierowania (np. adres załącznika lub reguła), a potem zarezerwować ścieżkę dla aplikacji. Nie usuwać obrazka jako sposobu naprawy trasy.

Checklisty modułów: `PLAY_RELEASE.md`, `integrations/wordpress/README.md` i `integrations/wordpress/court-objects/README.md` względem katalogu głównego. Wymagane wykluczenia cache i obsługę sesji sprawdzić na docelowej domenie, nie wyłącznie na preview.

## Dostęp i konfiguracja Codexa

GitHub jest już połączony; nie prosić ponownie o token tylko dlatego, że nie widać go w środowisku. Sprawdzać konkretną operację. WordPress nie jest obecnie uwierzytelniony. Sam adres `/wp-login.php` i utworzenie hasła aplikacji nie konfigurują środowiska.

Przekazanie dostępu wymaga bezpiecznych ustawień środowiska; nigdy przez czat, kod lub commit. Zanim prosi się o wartości, sprawdzić aktualny stan konfiguracji oraz same nazwy i obecność zmiennych. Zapis draftu nie oznacza zastosowania konfiguracji; gotowość potwierdza dopiero uwierzytelniony odczyt API.

Nie instalować wtyczek, nie uruchamiać migracji produkcyjnych i nie kasować mediów bez ustalenia środowiska i odtwarzalnej kopii. Dane użytkowników lokalnych Court Objects zabezpieczyć przed czyszczeniem przeglądarki.

## Rejestr wdrożenia

Po każdym wdrożeniu dopisz do statusu: datę, commit, publiczny adres, wykonane migracje, wynik health/smoke testu oraz miejsce backupu i rollback. Gdy brak danych, oznacz „niezweryfikowane”, zamiast powtarzać dawny status.
