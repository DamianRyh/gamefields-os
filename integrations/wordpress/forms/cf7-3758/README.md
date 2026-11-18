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
