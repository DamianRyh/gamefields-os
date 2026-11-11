# Faza 1: Fundamenty (listopad–grudzień 2026)

Roadmapa: https://claude.ai/artifact/WbfxdMagFRc2yGGVwgELHs

Faza kończy się **bramką A**: zapytanie testowe dochodzi na info@gamefields.eu, a Lighthouse mobile strony głównej ma co najmniej 85.

Ta gałąź (`roadmap/faza-1-fundamenty`) zawiera wszystko, co da się przygotować w repozytorium. Kroki na żywej stronie wymagają dostępu do WordPressa (hasło aplikacji lub SFTP) albo do Sites i są opisane przy każdym zadaniu.

## Stan zadań

| Zadanie | Co jest gotowe w repo | Co zostało na stronie | Kto |
| --- | --- | --- | --- |
| Pomiar | `scripts/check-live-site.mjs`, `lighthouserc.json`, workflow `site-monitor.yml` (co poniedziałek + ręcznie) | Założyć usługę GA4 i skonfigurować zgody w zainstalowanej już wtyczce Complianz (kroki niżej) | Właściciel + wykonawca |
| Formularz dochodzi | Kontrola obecności formularza w raporcie tygodniowym | SPF i DKIM dla gamefields.eu (panel hostingu poczty), wtyczka SMTP, wysyłka testowa po każdym wydaniu | Wykonawca |
| Szybkość | `build.py` ładuje czcionkę jako plik (strona z repo: 539 KB → 81 KB HTML). `tools/wordpress/font-diet.mjs` robi to samo na aktualnej treści strony. `tools/wordpress/convert-videos.sh` zamienia MOV na MP4 i WebM | Wgrać czcionkę i zamienić treść strony głównej (kroki niżej), przekonwertować filmy | Wykonawca |
| Jedno źródło Studio | `tools/studio/source-diff.mjs` porównuje produkcję z kopią | Wyeksportować źródło Studio z Sites, uruchomić porównanie, zsynchronizować kopię | Wykonawca z dostępem do Sites |
| Studio pod domeną | Bramka WordPress (`gamefields-play.php`) obsługuje już /studio i /play | Wgrać bramkę do mu-plugins według `integrations/wordpress/README.md` | Wykonawca |
| Nowe hero | Paczka `gamefields-hero-wdrozenie.zip` | Wdrożenie według instrukcji z paczki | Wykonawca |
| Dane firmy i prywatność | Gotowe akapity do polityki: `docs/roadmap/prywatnosc-uzupelnienia.md` | Właściciel podaje dane firmy; wklejenie akapitów po przeglądzie prawnym | Właściciel |
| Stare strony demo | Lista 10 opublikowanych stron z motywu (sekcja niżej) | Przenieść do szkiców albo przekierować 301 | Właściciel decyduje, wykonawca wdraża |

## Szybkość strony głównej krok po kroku

Na stronie działa wersja nowsza niż `premium-2026-10-26` w repo (fioletowe hero). Dlatego **nie budujemy strony z repo**, tylko odchudzamy jej aktualną treść:

1. W edytorze strony głównej (ID 3462) otwórz edytor kodu i zapisz całą treść do pliku `strona-glowna.html`. Zanotuj numer wersji.
2. Uruchom: `node tools/wordpress/font-diet.mjs strona-glowna.html wynik/`
3. Wgraj plik `.woff2` z folderu `wynik/` do `wp-content/uploads/gamefields-fonts/`. Sprawdź, czy adres otwiera się w przeglądarce.
4. Wklej `wynik/strona-glowna.html` jako treść strony na szkicu. Sprawdź wygląd czcionki i porównaj Lighthouse przed i po.
5. Opublikuj po akceptacji i wyczyść cache.

Narzędzie zmienia wyłącznie źródła `@font-face` zapisane jako base64. Reszta treści zostaje bajt w bajt taka sama.

## Pomiar

Stan na 11.11.2026 (sprawdzone na żywej stronie): pomiar działa. Complianz ma baner zgody (`consenttype: optin`) i wstawia tag Google **`GT-M63DMWRD`** z Consent Mode (`analytics_storage` tylko po zgodzie). Kontenera Google Tag Manager `GTM-W3BD5D9P` nie ma na stronie i **nie dodajemy go**, bo podwoiłby pomiar. Gdyby kiedyś był potrzebny GTM, zastępuje on tag `GT-…` w ustawieniach Complianz, a nie działa obok niego.

Kontrola `check-live-site` sprawdza co tydzień, czy `GT-M63DMWRD` jest na każdej stronie i czy skrypty Google ładują się raz (`--tag` zmienia oczekiwany identyfikator).

Do zrobienia: polityka prywatności nie opisuje jeszcze pomiaru ani sklepu (patrz `prywatnosc-uzupelnienia.md`). Search Console: potwierdzić, że domena jest zweryfikowana (mapa witryny `sitemap_index.xml` działa).

## Jedno źródło Studio krok po kroku

1. Wyeksportuj aktualne źródło Studio z Sites do folderu, np. `studio-produkcja/`.
2. Uruchom: `node tools/studio/source-diff.mjs studio-produkcja/`
3. Przejrzyj `outputs/studio-source-diff.md`. Pliki „tylko w repo” to zmiany niewdrożone. Zdecyduj, czy zostają.
4. Skopiuj produkcję do `integrations/studio/canvas-editor/`, przejrzyj `git diff`, uruchom CI i zatwierdź jako „Studio: synchronizacja z produkcją <wersja>”.
5. Od tej chwili każde wydanie Studio zaczyna się od repo, a numer wersji trafia do `DEPLOYMENT.md`.

## Bramka A: lista zamknięcia fazy

- [ ] Zapytanie testowe z formularza strony głównej dochodzi na info@gamefields.eu, nie do spamu
- [ ] Rekordy SPF i DKIM poprawne (test np. mail-tester.com, wynik co najmniej 9/10)
- [ ] Lighthouse mobile strony głównej co najmniej 85 (raport z workflow `site-monitor`)
- [ ] GA4 pokazuje wizyty po zgodzie, Search Console zweryfikowana
- [ ] Raport `check-live-site` bez krytycznych błędów i bez przewijania w bok na 390 px
- [ ] Kopia Studio w repo równa produkcji (raport `source-diff` bez różnic)
- [ ] Studio dostępne pod adresem w domenie gamefields.eu
- [ ] Dane firmy i pełna polityka prywatności opublikowane
- [ ] Stare strony demo nie są opublikowane albo przekierowują na właściwe strony

## Stare strony demo

Audyt z 21.10 znalazł opublikowane strony z motywu i starsze wersje oferty. Mają noindex w Yoast, ale dalej są dostępne pod adresem i psują wrażenie przy przypadkowym wejściu.

| ID | Adres | Treść | Proponowane działanie |
| --- | --- | --- | --- |
| 2 | /sample-page/ | Przykładowa strona WordPress | Do kosza |
| 981 | /placeholder/ | Instrukcja demo motywu | Do kosza |
| 980 | /placeholder-portfolio/ | Demo portfolio (yoursite.com) | Do kosza |
| 393 | /elements/ | Pusty rodzic stron demo | Do kosza |
| 441 | /elements/google-maps/ | Mapa demo (Zurych) | Do kosza |
| 460 | /elements/video-player/ | Wideo demo | Do kosza |
| 339 | /home-transparent-header/ | Demo oferty zegarów | Do kosza |
| 1065 | /home-fullscreen-banner/ | Demo oferty mebli | Do kosza |
| 327 | /home-categories-grid/ | Starsze kategorie usług Gamefields | Przekierowanie 301 na stronę główną |
| 757 | /gamefields-boiska-panna-i-street-football/ | Starsza oferta boisk | Przekierowanie 301 na /#boiska |

Przed usunięciem: sprawdź w Search Console i logach, czy któraś ma wejścia. Przekierowania ustaw w Yoast (Przekierowania) albo wtyczce Redirection.
