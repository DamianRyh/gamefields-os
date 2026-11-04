# Faza 1: Fundamenty (listopad–grudzień 2026)

Roadmapa: https://claude.ai/artifact/WbfxdMagFRc2yGGVwgELHs

Faza kończy się **bramką A**: zapytanie testowe dochodzi na info@gamefields.eu, a Lighthouse mobile strony głównej ma co najmniej 85.

Ta gałąź (`roadmap/faza-1-fundamenty`) zawiera wszystko, co da się przygotować w repozytorium. Kroki na żywej stronie wymagają dostępu do WordPressa (hasło aplikacji lub SFTP) albo do Sites i są opisane przy każdym zadaniu.

## Stan zadań

| Zadanie | Co jest gotowe w repo | Co zostało na stronie | Kto |
| --- | --- | --- | --- |
| Pomiar | `scripts/check-live-site.mjs`, `lighthouserc.json`, workflow `site-monitor.yml` (co poniedziałek + ręcznie). Wtyczka zgód i GA4 `integrations/wordpress/consent-analytics/` | Założyć usługę GA4, wpisać `GF_GA4_ID` w wp-config.php, wgrać wtyczkę do mu-plugins | Właściciel + wykonawca |
| Formularz dochodzi | Kontrola obecności formularza w raporcie tygodniowym | SPF i DKIM dla gamefields.eu (panel hostingu poczty), wtyczka SMTP, wysyłka testowa po każdym wydaniu | Wykonawca |
| Szybkość | `build.py` ładuje czcionkę jako plik (strona z repo: 539 KB → 81 KB HTML). `tools/wordpress/font-diet.mjs` robi to samo na aktualnej treści strony. `tools/wordpress/convert-videos.sh` zamienia MOV na MP4 i WebM | Wgrać czcionkę i zamienić treść strony głównej (kroki niżej), przekonwertować filmy | Wykonawca |
| Jedno źródło Studio | `tools/studio/source-diff.mjs` porównuje produkcję z kopią | Wyeksportować źródło Studio z Sites, uruchomić porównanie, zsynchronizować kopię | Wykonawca z dostępem do Sites |
| Studio pod domeną | Bramka WordPress (`gamefields-play.php`) obsługuje już /studio i /play | Wgrać bramkę do mu-plugins według `integrations/wordpress/README.md` | Wykonawca |
| Nowe hero | Paczka `gamefields-hero-wdrozenie.zip` | Wdrożenie według instrukcji z paczki | Wykonawca |
| Dane firmy i prywatność | Wtyczka zgód ma skrót `[gf_zmien_zgode]` do strony prywatności | Właściciel podaje dane firmy; uzupełnić politykę o GA4, Studio, PLAY i formularze | Właściciel |

## Szybkość strony głównej krok po kroku

Na stronie działa wersja nowsza niż `premium-2026-10-26` w repo (fioletowe hero). Dlatego **nie budujemy strony z repo**, tylko odchudzamy jej aktualną treść:

1. W edytorze strony głównej (ID 3462) otwórz edytor kodu i zapisz całą treść do pliku `strona-glowna.html`. Zanotuj numer wersji.
2. Uruchom: `node tools/wordpress/font-diet.mjs strona-glowna.html wynik/`
3. Wgraj plik `.woff2` z folderu `wynik/` do `wp-content/uploads/gamefields-fonts/`. Sprawdź, czy adres otwiera się w przeglądarce.
4. Wklej `wynik/strona-glowna.html` jako treść strony na szkicu. Sprawdź wygląd czcionki i porównaj Lighthouse przed i po.
5. Opublikuj po akceptacji i wyczyść cache.

Narzędzie zmienia wyłącznie źródła `@font-face` zapisane jako base64. Reszta treści zostaje bajt w bajt taka sama.

## Pomiar krok po kroku

1. W Google Analytics utwórz usługę GA4 dla gamefields.eu i skopiuj identyfikator `G-…`.
2. W `wp-config.php` dodaj `define('GF_GA4_ID', 'G-…');`
3. Wgraj `gamefields-consent-analytics.php` do `wp-content/mu-plugins/`.
4. Na stronie prywatności dodaj skrót `[gf_zmien_zgode]` i opis pomiaru.
5. Sprawdź: baner pokazuje się przy pierwszej wizycie, bez zgody GA4 nie zapisuje danych, po zgodzie w GA4 (Raporty → Czas rzeczywisty) widać wizytę.
6. Search Console: dodaj domenę gamefields.eu (weryfikacja przez DNS).

Cofnięcie wtyczki: zmień nazwę pliku na `.disabled`.

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
