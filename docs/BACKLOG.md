# Kolejka prac Gamefields

Aktualizacja: 18.10.2026. Cel: uporządkować i rozwijać obecny projekt. Wykonanie dokumentacji nie oznacza wykonania opisanych zadań.

| Priorytet | Zadanie | Warunek zakończenia | Zależność |
| --- | --- | --- | --- |
| P0 | Ustalić hosting, DNS, właściciela deploymentu aplikacji i D1 | Każda usługa ma potwierdzonego właściciela, identyfikator i sposób dostępu | Właściciel projektu / administrator |
| P0 | Skonfigurować uwierzytelniony dostęp WordPress | Odczyt bieżącego użytkownika i dozwolonych operacji API bez ujawnienia hasła | Bezpieczne ustawienia środowiska |
| P0 | Pełny backup WP i D1 | Kopie bazy i plików oraz sprawdzone odtworzenie w oddzielnym środowisku | Hosting i konto bazy |
| P0 | Rozwiązać przekierowanie `/studio` do obrazka | Trasa otwiera docelowy moduł, media pozostają dostępne | Dostęp WP/hosting, zdrowy upstream |
| P0 | Ustalić działający upstream i integrację `/play` | Health HTTP 200 i `schemaReady: true`, poprawne sesje na domenie | Deployment, D1, gateway i cache |
| P1 | Ocenić PR #41, #27, #26, #13 | Osobna decyzja dla każdego PR na podstawie diff, CI i zgodności produktu | Bieżący kod i podglądy |
| P1 | Doprowadzić lokalne poprawki Studio do oddzielnego PR | Przegląd kodu, desktop/mobile, aktualny test sportów, kierunków i ceny | Obecne niezacommitowane pliki Studio |
| P1 | Uporządkować gałęzie | 23 kandydatów po weryfikacji zależności i archiwizacji, 19 pozostałych po ocenie różnic | Pełna kopia refs; bez automatycznego kasowania |
| P1 | Ochrona `main` | Wymagany PR i adekwatne CI, blokada force-push, sprawdzona możliwość pracy właściciela | GitHub Settings / administration:write |
| P1 | Trwała obsługa zapytań Court Objects | Zapis serwerowy, identyfikator zgłoszenia i potwierdzony odbiór przez obsługę | Wybór backendu i odbiorcy |
| P1 | Zatwierdzony cennik | 18 zmiennych QUOTE_* i potwierdzone reguły netto/brutto, test rzeczywistego API | Decyzje biznesowe i konfiguracja |
| P1 | Konta publiczne | Odzyskanie hasła, potwierdzanie adresu i test dwóch niezależnych sesji | Backend / dostawca poczty |
| P2 | Kompozytor realistycznego podglądu | Kolory, wzór i geometria zgodne między planem a sceną dla wybranych sportów | Sceny, maski i wydajność mobile |
| P2 | Kolejne sceny i kontekst miejsca | Tenis/Padel oraz park/szkoła/osiedle; ustawienia zapisują się w projekcie | Stabilny kompozytor |
| P2 | Porządek w treściach i mediach WP | Mapa stron, menu i duplikatów z zachowaniem SEO i powiązań mediów | Pełny eksport WP, backup |
| P2 | Rozliczenie danych i retencji | Ustalony okres i sposób przechowywania zgłoszeń, kont, mediów i kopii | Mapa danych i decyzje właściciela |

Wszystkie obszary produktu pozostają zachowane zgodnie z `GAMEFIELDS-PRODUCT-CONTINUITY.md`. Poprzednią kolejkę z 04.10.2026 zachowano w `archive/2026-10-04/BACKLOG.md`.
