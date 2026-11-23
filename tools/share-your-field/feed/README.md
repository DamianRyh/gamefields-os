# Feed Gamefields z renderów Studia

Seria 12 postów na Instagram (30.11–28.12.2026), plan i podpisy w `plan.json`.

1. Uruchom Studio lokalnie: `cd integrations/studio/canvas-editor && pnpm install && pnpm dev` (port 5173).
2. `node gen.js` (z tego katalogu, Playwright): dla każdej konfiguracji z `configs.json` (model × wzór Masters II × kolory)
   otwiera Studio, robi ujęcia z prawdziwej sceny 3D przez `lib/share-media` i zapisuje do `raw/`
   ujęcia (`-hero`, `-low`, `-top`, `-surface`) oraz gotowe posty (`-post-*`).
3. `node films.js`: filmy kinowe 6 s (MP4 H.264) nagrane przez przeglądarkę, tak jak zrobi to użytkownik w Studio.
4. `slides.html` + `node slides.js`: plansze bez renderów 3D (zdjęcia realizacji z `src/`, cytaty, ceny z `prices.json`,
   które pochodzą z `integrations/wordpress/offer/*.json`). Zdjęcia pobierz z mediów WordPress (`/wp-content/uploads/`).

Nie zmieniaj kodu `lib/share-media` w trakcie generowania: Vite przeładuje stronę i przerwie film.
