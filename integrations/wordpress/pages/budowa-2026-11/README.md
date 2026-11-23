# /budowa-boisk-sportowych/ (strona 3684), 23.11.2026

`python3 build.py` tworzy `budowa-boisk-sportowych.html` (jeden blok `wp:html`, cała treść strony) i `preview.html` do podglądu lokalnego (nie commitować).

- Styl: `../gfa-style.css` + klasy `gfb-` (jak Realizacje i Baza wiedzy).
- Ceny wyłącznie z `integrations/wordpress/offer/`: `price-from.json` (konstrukcje), `concrete-base.json` (płyta), `surface-finish.json` (wykończenia). Po zmianie cennika wystarczy przebudować stronę.
- Kalkulator liczy jak Studio i sklep: metraż modelu z 10% zapasem, koszt w górę do 100 zł; brutto z VAT 23%.
- Fakty dla gmin (gwarancja 12 miesięcy, Orlik 2012, normy, dokumenty) jak w bloku „samorzady” strony głównej; realizacje jak na stronie Realizacje.
- Wdrożenie: `docs/roadmap/DLA-CHATGPT-budowa-boisk.txt`.
