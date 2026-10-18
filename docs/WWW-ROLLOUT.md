# Gamefields WWW — analiza materiałów i etapy wdrożenia

Data: 18.10.2026. Cel: jakość prezentacji i konfiguracji porównywalna z Tylko, z ofertą i procesem Gamefields. To plan całego wdrożenia oraz zapis pierwszego etapu, a nie deklaracja gotowości produkcyjnej.

## Materiał i ograniczenia

Źródło użytkownika: https://drive.google.com/drive/folders/1x_XqDYxhAKsUj3UIi3YX-P4NJUBEyNbZ . Odczytano 20 publicznie dostępnych podglądów: 01–19 to ekrany Tylko; 20 pokazuje błąd przekroczenia rozmiaru wiadomości w Codex (29783115 bajtów przy limicie 4194304), nie ekran produktu ani dowód wyłączenia agentów. Przekazywać odnośniki do plików zamiast osadzania wszystkich obrazów w wiadomości.

Podglądy zapisano lokalnie w `outputs/tylko-reference/`, z manifestem nazw i ID plików oraz planszą `contact-sheet.jpg`. Są to materiały dostarczone przez użytkownika. Nie przeprowadzono interaktywnego audytu Tylko; nie potwierdzono działania koszyka, kont, dostępności klawiaturą ani wersji mobilnej na podstawie tych zrzutów. Nie ma podstaw do deklarowania pełnej zgodności WCAG.

Bieżący odczyt HTTP: strona główna gamefields.eu odpowiada 200; `/studio` przekierowuje do obrazka `/wp-content/uploads/2026/10/studio.webp`; `/play`, `/api/play/health` i `/court-objects/` odpowiadają 404. Konflikt `/studio` trzeba rozwiązać bez usuwania zdjęcia. Środowisko nie ma skonfigurowanych sekretów, zmiennych runtime ani tożsamości wychodzących. Nie zweryfikowano obecnego panelu WP ani SFTP. Zapisane statusy z 4 października wymagają ponownej weryfikacji.

## Przegląd ekranów — wspólne wzorce

| Ekrany | Obserwacja | Zastosowanie w Gamefields | Ocena / granica dowodu |
| --- | --- | --- | --- |
| 01–02 | Duża scena i prosty wybór kategorii | Scena z boiskiem, wejście według dyscypliny i celu | Czytelny kierunek, brak dowodu zachowania mobile |
| 03, 07, 13 | Karty produktu, warianty i powrót do oglądanych | Kolekcje boisk, wspólne parametry kart, później historia | Mocny wzorzec porównywania; nie kopiować ocen ani promocji |
| 04–06, 12 | Produkt w otoczeniu, kolor jako wybór wizualny | Boisko w parku/szkole/osiedlu i podpisane palety | Wysoka jakość prezentacji; zdjęcie nie zastąpi aktualnej geometrii |
| 08–09, 11, 14 | Proces, ludzie, materiały i trwałość | Własne realizacje, wykonawstwo, utrzymanie i materiały | Wymaga prawdziwych treści i zgód na publikację |
| 10, 15–16 | Oferta dodatkowa, newsletter i rozbudowana stopka | Dopiero po ustaleniu oferty, zgód i obsługi kontaktu | Nie przenosić zbędnych etapów do konfiguratora |
| 17 | Duży podgląd, panel wariantów, cena, zapis i konfiguracja | Podgląd + opcje + stale dostępna cena i dalszy krok | Przydatny układ; cena Gamefields wymaga weryfikacji miejsca |
| 18 | Wymiary i materiały bez opuszczania podglądu | Edycja parametrów na tym samym projekcie | Potrzebne etykiety suwaków i kontrola focusu |
| 19 | Opcje zależne od geometrii i stałe podsumowanie | Wyposażenie odpowiednie dla sportu, docelowo reguły modułów | Nie rozciągać konstrukcji dowolnie; przestrzegać ograniczeń silnika |
| 20 | Błąd rozmiaru wiadomości Codex | Linki do folderu i mniejsze partie materiałów | Problem wejścia do narzędzia, nie UX serwisu |

## Pierwszy etap w kodzie

- `/studio` jest stabilnym dodatkowym wejściem do istniejącego konfiguratora; `/` i Builder w PLAY pozostają dostępne.
- Gateway WP przygotowano do `/studio`, `/studio/` oraz plików WebP scen w `/studio/`.
- Cztery etapy mają wspólne podsumowanie ceny netto/brutto i przyciski Wstecz/Dalej/zapisu.
- Usunięto arbitralny zakres ceny 90–112% oraz pozorny procent gotowości. Nawigacja określa etap, a miejsce nadal wymaga weryfikacji.
- Porównanie trzech kierunków pokazuje rzeczywisty plan tego samego projektu i pozwala zastosować wybór bez zmiany sportu, wymiarów i wyposażenia.
- Sceny referencyjne opisano jako inspiracje. Zmiana obsługiwanych parametrów na niestandardowe przełącza na plan, zamiast sugerować zgodność gotowego obrazu z nową geometrią.
- Suwaki wymiarów otrzymały nazwy dostępności; etapy sygnalizują bieżący krok. Modal korzysta z istniejącego Dialog i obsługi focusu.
- Cena oczekująca na odpowiedź po zmianie nie jest przedstawiana jako aktualna.

Dodatkowe domknięcie implementacji:

- Miniatury, porównanie i zastosowany kierunek korzystają z tej samej funkcji ustawień palety; zachowane są wymiary, sport, nawierzchnia i obiekty.
- Dobór sceny uwzględnia także nawierzchnię, otoczenie, kolor linii, cień i opcje wzoru; zmodyfikowany projekt pozostaje widoczny w planie.
- Odpowiedzi wyceny są walidowane; po błędzie można użyć „Ponów wycenę”. Spóźniona odpowiedź nie zastępuje ceny aktualnego projektu.
- Wybór dyscypliny nie wyświetla dodatkowo pustego ekranu projektów konta.
- `pnpm test:studio` sam uruchamia i zatrzymuje lokalny podgląd. Testy są włączone do CI.
- `pnpm build:wordpress` buduje zwykłą wtyczkę ZIP do panelu WordPress, alternatywnie do instalacji MU przez hosting.

To zmiany przygotowane do przeglądu w osobnym PR. Nie opublikowano ich na gamefields.eu.

## Etapy i warunki zakończenia

1. **Dostęp i stan bazowy**: połączenie GitHub, WP/hosting, aktualny deployment i D1. Zakończenie: znany commit produkcji, działający preview i health, potwierdzony backup oraz stan migracji.
2. **Konfigurator — pierwszy etap powyżej**: przegląd desktop/mobile, porównanie kierunków i uczciwe ceny/podglądy. Zakończenie: testy przepływu i odbiór wizualny; oddzielnie sprawdzenie rzeczywistego API wyceny i zapisu konta.
3. **Spójny moduł WWW**: mapa wejść inspiracja → sport/renowacja → konfiguracja → podsumowanie → zapytanie; wspólna nawigacja, komponenty i katalog. Studio, PLAY, Objects oraz Engineering zachowują swoje funkcje zgodnie z `GAMEFIELDS-PRODUCT-CONTINUITY.md`. Zakończenie: działające bezpośrednie adresy, menu WP i odświeżanie tras bez 404.
4. **Podgląd dopasowany do konfiguracji**: sceny per sport, maski i kompozytor Canvas/WebGL lub model 3D, później lokalizacja i branding. Zakończenie: wybrana geometria, kolory i wyposażenie zgadzają się we wszystkich widokach; określone budżety wydajności mobile. Obecne gotowe sceny pozostają wyłącznie referencjami.
5. **Obsługa sprzedaży i kont**: trwały backend zgłoszeń, identyfikator sprawy, potwierdzenie odbioru, CRM/poczta; cennik, podatki i zakres oferty. Formularz Court Objects obecnie przechowuje zapytanie tylko lokalnie — to nie jest dostarczone zamówienie. Konta wymagają odzyskiwania hasła i potwierdzania email. Zakończenie: rzeczywisty odbiór zgłoszenia przez obsługę i pełny test dwóch niezależnych kont.
6. **Publikacja**: backup, deployment aplikacji, migracje po porównaniu ze stanem D1, integracje WP i cache, smoke test domeny, rollback. Zakończenie: działające health, sesje, zapis/odczyt projektu, wycena i odbiór zapytania na domenie docelowej.

## Dostępy i działania poza Codex

Nie przesyłać haseł ani tokenów w czacie. Połączyć konta w ustawieniach narzędzi/środowiska albo użyć zaproszenia o wymaganym zakresie.

| Co | Po co / kto | Gdy dostęp zostanie połączony |
| --- | --- | --- |
| GitHub `https://github.com/DamianRyh/gamefields-os` | Odczyt, zapis gałęzi i PR; repo jest już lokalnie | Codex może przygotować gałąź i PR; osobno ustalić docelową gałąź publikacji |
| WordPress; hosting/SFTP jeśli potrzebny | Backup i instalacja gateway. ZIP `dist/wordpress/gamefields-studio-play.zip` można wgrać przez Wtyczki → Dodaj nową, jeśli panel na to pozwala; MU-plugin pozostaje alternatywą | Najpierw zdrowa aplikacja i rozwiązany konflikt /studio. Nie instalować obu wariantów jednocześnie. Dostęp administracyjny i uprawnienia instalacji nie są potwierdzone |
| CDN/cache | Wykluczyć `/studio`, `/studio/`, `/play*`, `/api/play*`, `/api/quote`, `/api/templates`, `/api/projects` oraz sesję `gf_play_session`; sprawdzić redirect www z pełną ścieżką | Codex wykona tylko przy dostępnej integracji; inaczej administrator |
| Cloudflare / hosting aplikacji | Binding D1 `DB`, migracje i ustawienia wyceny `QUOTE_*`; brak tych cen daje 503 | Najpierw sprawdzić stan bazy, nie uruchamiać migracji na ślepo |
| Właściciel biznesowy | Zatwierdzić stawki, VAT, zakres prac, logistykę, terminy, treści, zdjęcia i odbiorcę zapytań | Dane potrzebne do prawdziwej oferty; braków nie zastępować fikcyjnymi obietnicami |
| Poczta / CRM, ewentualnie płatności | Trwałe potwierdzenia i przekazanie zgłoszeń; płatności dopiero po ustaleniu procesu | Potrzebny wybór dostawcy i połączenie konta, czasem DNS domeny nadawczej |
| Konstruktor | Engineering jest PRE-DESIGN | Weryfikacja zawodowa przed ofertowaniem dokumentacji wykonawczej |

PLAY gateway obejmuje Studio i PLAY, ale nie publikuje automatycznie `/objects` ani `/engineering`. Court Objects ma odrębną integrację: `integrations/wordpress/court-objects/README.md`. Rozszerzenie wszystkich tras wymaga świadomej mapy adresów, a nie przechwycenia całej strony WP.

Nie znaleziono potwierdzonej listy wyłączonych agentów lub ich uprawnień. Nie można zadeklarować ich przywrócenia. Równoległy agent sprawdził zakres wdrożenia i integracji; dostępu do zewnętrznych kont nie nadaje uruchomienie agentów.

## Weryfikacja lokalna

- `npx tsc --noEmit`: zaliczone.
- `npm run build`: zaliczone; bundler zgłasza FILE_NAME_CONFLICT dla współdzielonego CSS. Wymagane sprawdzenie zbudowanego podglądu przed publikacją.
- `npm run test:studio`: zaliczone na własnym automatycznie uruchamianym dev. Football/Basketball × trzy kierunki, fallback dla Tenisa, zachowanie parametrów i wyposażenia, zgodność planu z porównaniem, cztery etapy, 1440/390 px i brak poziomego overflow.
- Test wyceny: zaliczone ukrycie nieaktualnej ceny, spóźnione A po B, HTTP 503, ponowienie i odrzucenie błędnych odpowiedzi HTTP 200. API wyceny jest mockowane — produkcyjne stawki i D1 pozostają osobnymi warunkami odbioru.
- `npm run test:play`: zaliczone 88 kontroli HTTP na lokalnej bazie testowej, m.in. konta, sesje, gry, wyniki, rankingi i zapis/publikacja projektu Buildera.
- `npm run build:wordpress`: ZIP zbudowany, sprawdzono listę plików. Instalacja w prawdziwym WordPressie i test hostingu jeszcze niewykonane; kontrolę składni PHP dodano do CI.
- `git diff --check`: zaliczone. ESLint: zarówno bazowy `origin/main`, jak i zmieniony Builder mają osiem błędów w tych samych trzech grupach reguł hooków. Nie deklarujemy pełnego zaliczenia lint.
- Zrzuty implementacji: `outputs/studio-review/design-1440.png` i `design-390.png`.
- GitHub jest połączony; API uprawnień raportuje ADMIN konta, lecz nie każda operacja administracyjna jest dozwolona integracji. Brak połączenia WordPress w aktywnych narzędziach.

## Kolejność dalszego wdrożenia i wymagany odbiór

| Etap | Wynik / co pozostało | Kto |
| --- | --- | --- |
| 1. Konfigurator i integracja w kodzie | Przygotowane, testy lokalne zaliczone; PR i CI do przeglądu | Codex + właściciel |
| 2. Dostępy i kopie produkcji | Potwierdzić WP, hosting, deployment, D1 oraz odtwarzalny backup | Właściciel / administrator |
| 3. Uruchomienie domeny | Zdrowy upstream, konflikt `/studio`, migracje po sprawdzeniu stanu, wtyczka i cache | Administrator + Codex przy dostępnych narzędziach |
| 4. Spójna oferta WWW | Zatwierdzona mapa stron, treści, własne realizacje i warianty produktów; przegląd PR #26/#27/#41 | Właściciel + design + Codex |
| 5. Prawdziwe zgłoszenia i konta | Backend, potwierdzenie odbioru, odzyskiwanie konta, cennik; obecne localStorage Court Objects nie wystarcza | Codex + operator usług + obsługa |
| 6. Realistyczne sceny i publikacja | Kompozytor, kolejne sporty, mobile, dostępność, pomiar i pełny test domeny | Codex + QA + właściciel |

Cel jakościowy Tylko pozostaje docelowym wynikiem całego programu, nie etykietą gotowości tego pierwszego PR-a. Wyłączonych agentów ani ich zewnętrznych uprawnień nie można przywrócić z dostępnego zestawu narzędzi.
