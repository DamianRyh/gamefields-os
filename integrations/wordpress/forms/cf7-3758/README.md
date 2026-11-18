# Formularz CF7 3758 („a71dc3a”) — zdjęcie placu, 18.11.2026

Jeden wspólny formularz zapytań: strona główna (blok `kontakt`), `/kontakt/` (strona 3716), okno Studio (strona 3644).
Zmiana jest addytywna — te same trzy kroki (`data-gf-step` 0–2), te same nazwy pól, ta sama skrzynka odbiorcy.

| Co | Zmiana |
|---|---|
| Zdjęcia | `project-photo` + nowe `project-photo-2`, `project-photo-3` (JPG/PNG/WebP ≤5 MB), na górze kroku „Miejsce”, `id="zdjecie"` |
| Typ miejsca | nowe `place-type`: Gmina / Orlik / Szkoła / Park / Event / Inne (w temacie maila) |
| Opis | `your-message`: „Opisz miejsce i co chcesz osiągnąć” |
| Zgoda | nowe `[acceptance marketing-consent optional]` — nieobowiązkowa zgoda na informacje handlowe e-mailem |
| Źródło | nowe ukryte `lead-source` (zdjecie / studio / mapa / plakat / formularz), ustawiane przez `gf-lead.js` |
| Mail 1 | załączniki +2 zdjęcia; temat i treść + typ miejsca, źródło, zgoda; reszta bez zmian |
| Mail 2 | autoodpowiedź do klienta: podsumowanie, „1–2 dni robocze”, Reply-To info@gamefields.eu, bez załączników |
| Komunikat | „Dziękujemy. Damian odezwie się w ciągu 1–2 dni roboczych.” |

`python3 apply.py` — odczyt formularza na żywo, kopia `backup-<czas>.json`, różnice (nic nie zapisuje).
`python3 apply.py --apply` — zapis przez REST CF7 i sprawdzenie. Cofnięcie: `python3 apply.py --restore backup-<czas>.json`.

Kolejność wdrożenia: 1) motyw 1.0.36 (gf-lead.js/css), 2) ten formularz, 3) strona główna (bloki `naglowek`, `mozliwosci`, `kontakt`).
Formularz bez motywu też działa (zwykłe trzy pola plików), motyw bez formularza nic nie psuje (brak strefy zdjęć).
`/kontakt/` ma własny skrypt kroków i wstawia dodatkowe pytania ścieżki do kroku 1 — struktura kroków została zachowana.

Analityka: Site Kit (tag GT-M63DMWRD) już wysyła zdarzenie wysłania formularza CF7 — oznacz je w GA4 jako kluczowe.
`gf-lead.js` dodaje osobne zdarzenie `gf_lead` (lead_source, place_type, photos, page_path), żeby nie liczyć leadów podwójnie.
Meta Pixel: na razie nie (brak kampanii; Complianz i WP Consent API pozwolą dodać go później z właściwą zgodą).

## Etap 2 — Studio: „Odbierz propozycję na maila” (18.11.2026)

Studio (`integrations/studio/canvas-editor`): w podsumowaniu przycisk „Odbierz propozycję na maila” (wcześniej „Wyślij projekt do wyceny”).
Po kliknięciu Studio, tak jak dotąd, wysyła podsumowanie projektu (`gf-inquiry`) do formularza 3758, a dodatkowo:
- `link`: link 1:1 do tej konfiguracji (ten sam zapis na serwerze co „Link do projektu”, 30 dni; tekst przy przycisku o tym mówi),
- `image`: widok z góry PNG 1600 px (ten sam renderer co „Pobierz wizualizację PNG”).
Oba są opcjonalne: przy błędzie albo po 8 s zapytanie idzie bez nich. Okno strony głównej (Studio otwarte bezpośrednio) otwiera się w kliknięciu, przed czekaniem.
Link „Poproś o ofertę dla tego projektu” w podsumowaniu prowadzi teraz do tego przycisku (wcześniej wychodził na /kontakt/ bez projektu).

WordPress: `gf-lead.js` wpisuje `link` do ukrytego `project-link`, a `image` do pola pliku `project-render` tego samego formularza
(okno na /studio/ albo formularz na stronie głównej). Obecne skrypty strony dalej dołączają podsumowanie i odpowiadają Studio.
Mail 1 dostaje załącznik PNG i link, autoodpowiedź — link. Strona główna wysyła teraz `gf-contact-ready` do okna Studio:
bez tego Studio otwarte bezpośrednio czekało 15 s i zgłaszało błąd (na żywo od zmiany strony głównej 2.11).

Testy (lokalnie, zbudowane Studio + kopia /studio/ i strony głównej, serwer linków zastąpiony): przez ramkę — podsumowanie, link,
PNG 594 KB, źródło `studio`; bez ramki — potwierdzenie w Studio i dane w formularzu strony głównej; awaria serwera linków —
zapytanie bez linku z PNG. `tsc` i `tests/inquiry-transport.mjs` PASS. `tests/studio-scope.mjs` nie przechodzi także bez tych zmian
(oczekuje 28 kierunków wzorów, jest 36 od #120).

Wdrożenie Studio: publikacja Sites jak dotąd (DEPLOYMENT.md). Kolejność: motyw 1.0.36 → formularz → Studio. Stare Studio z nowym
WordPressem i nowe Studio ze starym WordPressem działają (dodatki są ignorowane).
