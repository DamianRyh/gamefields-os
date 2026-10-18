# Mapa danych Gamefields

Inwentaryzacja z 18.10.2026 na podstawie kodu, publicznego API WordPressa i metadanych narzędzi. Nie jest eksportem danych produkcyjnych ani potwierdzeniem kompletności kont, baz i plików.

| Obszar | Miejsce / źródło | Potwierdzone | Następne działanie |
| --- | --- | --- | --- |
| Kod, historia, zadania | GitHub `DamianRyh/gamefields-os` | Repozytorium publiczne, `main`, cztery otwarte PR-y w chwili przeglądu | Bieżący kod na `main`, rozwój przez PR; nie przechowywać danych klientów w publicznym repo |
| Treści WordPress | Baza WP, strony i wpisy | Publiczne API raportuje 86 stron i 8 wpisów | Eksport WXR oraz backup całej bazy; dopiero potem ocena duplikatów i szkiców |
| Media WordPress | Biblioteka mediów i `wp-content/uploads` | Publiczne API raportuje 237 elementów | Backup plików i wykaz powiązań ze stronami; nie kasować pozornie nieużywanych obrazów |
| Motyw, wtyczki, przekierowania | Hosting WordPressa | Brak dostępu administracyjnego w tej sesji | Ustalić aktywny motyw, wtyczki, cache, regułę `/studio` i sposób backupu |
| Studio / Builder | `lib/project.ts`, `db/builder-projects.ts`, `/api/projects` | Kod zapisu projektów na konto; eksport/import JSON | Sprawdzić D1 i odtworzenie projektu na środowisku docelowym |
| Konta i sesje PLAY | D1: `play_accounts`, `play_sessions`, `users` | Schemat przechowuje hashe haseł i tokenów, email oraz dane profilu | Backup bazy po ustaleniu instancji; nie eksportować danych kont do repo |
| Gra i społeczność | D1: boiska, gry, wyniki, rankingi, relacje, powiadomienia | Schematy w `db/*.ts`, migracje `drizzle/0001`–`0010` | Sprawdzić rzeczywisty schemat produkcji i przeznaczenie każdej instancji |
| Court Objects | Pamięć przeglądarki `localStorage` | Klucze `gamefields-current`, `gamefields-designs`, `gamefields-{order/quote}-…`; formularz zapisuje projekt i dane lokalnie | Zabezpieczyć dane z urządzeń przed czyszczeniem przeglądarki; wdrożyć backend odbioru zgłoszeń |
| Cennik | Konfiguracja procesu `QUOTE_*` i reguły `/api/quote` | 18 wymaganych nazw zmiennych w kodzie; brak potwierdzonych wartości produkcyjnych | Właściciel zatwierdza stawki i zakres; test rzeczywistej odpowiedzi API |
| Materiały referencyjne Tylko | Folder Drive przekazany w rozmowie, lokalne podglądy w `outputs/tylko-reference` | 19 ekranów referencyjnych i 1 zrzut błędu Codex | Zachować link do źródła; nie publikować materiałów jako własnych realizacji |
| Lokalne wyniki i podglądy | `outputs`, `dist`, `.next`, `.wrangler`, `.sites-runtime` | Są wykluczone z Git; mogą zawierać wyniki testów i lokalny stan bazy | Rozdzielić odtwarzalne buildy od stanu baz przed ewentualnym czyszczeniem |
| Codex: konfiguracja | Środowisko przypisane do rozmowy | Brak skonfigurowanych sekretów, runtime variables i outbound identities według bieżącego statusu | Dodać dostęp WP przez obsługiwane ustawienia; nie przekazywać haseł w czacie |
| Codex: rozmowy, załączniki, inne projekty | Konto użytkownika w Codex | Brak narzędzia pełnego eksportu/zarządzania nimi w tej sesji | Użytkownik porządkuje je w interfejsie; ważne decyzje zapisujemy w dokumentacji repo |
| Kopia bieżącej pracy | `/workspace/gamefields-backups/20261018T064153Z` w tej sesji | Sprawdzono bundle historii, archiwum 291 plików źródłowych, patch i manifest SHA256 | Przenieść kopię do prywatnego, trwałego miejsca; nie jest to backup WordPressa ani D1 |

Liczby z publicznego API nie obejmują prywatnych treści, szkiców, kosza ani wszystkich fizycznych plików hostingu. Brak sekretów w środowisku nie oznacza braku danych lub kont u dostawców.

## Właściciele i odtwarzanie

Właściciel projektu: DamianRyh. Dostawca domeny/DNS, hosting WP, konto zarządzające wdrożeniem aplikacji i konkretny identyfikator bazy D1 wymagają potwierdzenia. Pole `d1: DB` w `.openai/hosting.json` jest nazwą bindingu, nie pełnym identyfikatorem produkcyjnej bazy.

Do pełnej kopii potrzebne są osobno: historia i aktualne źródła Git, baza WordPress, pliki WP/media, eksport D1 oraz informacje o konfiguracji usług przechowywane bezpiecznie poza publicznym repo. Odtworzenie należy przetestować w oddzielnym środowisku przed deklaracją, że backup działa.
