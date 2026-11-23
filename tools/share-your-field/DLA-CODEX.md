# Share Your Field: poprawki do panelu „Udostępnij projekt” (dla Codexa)

Stan wyjściowy: zrzut panelu ze Studio z 23.11.2026 (Panna Play, szachownica, tło białe/granat).
Prototyp poprawionej wersji: `prototype.html` (otwórz w przeglądarce, działa bez serwera).
Przykłady wyniku: `examples/story-*.webp`, `examples/post-*.webp`.
Kompozycja grafik (Canvas 2D, bez zależności): `composer.js`, funkcje `clean()`, `street()`, `plan()`.

Zakres bez zmian: bez kont, bez nowego backendu, bez automatycznej publikacji w Instagramie.

## 1. Render (najważniejsze)

Obecnie: zrzut małego widoku, boisko zajmuje ok. 15% szerokości grafiki, reszta to puste tło.

Zmiana:
1. Render do osobnego bufora (offscreen `WebGLRenderer` albo `WebGLRenderTarget`) z przezroczystym tłem,
   szerokość ok. 2000 px, `preserveDrawingBuffer` jak w `components/product-renderer.ts:19`.
2. Stała kamera na każdy model (preset), niezależna od tego, jak użytkownik obrócił widok:
   - `hero`: azymut 38°, elewacja 32°, FOV 22° (Clean, miniatura w Karcie),
   - `low`: azymut 20°, elewacja 14°, FOV 26° (Street, bardziej dynamiczny),
   - `top`: kamera ortograficzna z góry (Karta boiska z wymiarami).
   Parametry jak w `render.html` (wzorcowy render z `public/models/gamefields/source/panna-kids-o1.glb`).
3. Przycięcie do konturu modelu (kanał alfa > 8) przed wklejeniem w szablon. Ten kod już jest:
   `app/workshop-preview/page.tsx` (miniatury Warsztatu) i `components/studio-model-thumbnail.tsx`.
4. Render z tymi samymi materiałami, kolorami i teksturą nawierzchni co widok Studia (ta sama scena, inna kamera).
5. Na telefonie: render raz po otwarciu panelu i po zmianie projektu, nie przy każdej zmianie stylu.
   Zmiana formatu i stylu to tylko ponowne złożenie Canvas 2D z gotowych obrazów (szybkie).

## 2. Szablony

Wspólne zasady:
- Stories 1080 × 1920: nic ważnego w górnych 250 px i dolnych 340 px (pasek, avatar, pole odpowiedzi Instagrama).
  Post 1080 × 1350: margines 72 px.
- Boisko zajmuje 85–100% szerokości.
- Kolory z projektu: tło „Z projektu” liczone z palety wzoru (`mix(pal[0], pal[1], .18)`); tekst ciemny albo jasny
  według luminancji tła (`lum() < .3`).
- Treść z projektu: nazwa modelu, wymiary, nazwa wzoru, kropki palety; cena tylko po zaznaczeniu (domyślnie wyłączona).
- Zaproszenie: „Zaprojektuj swoje boisko · gamefields.eu/studio” i „Designed in Gamefields Studio”.
- Podpis użytkownika (opcjonalny, maks. 28 znaków, domyślnie „Moje boisko.”).
- Puste pole na naklejkę „Link” nad dolną strefą Instagrama (w PNG tylko wolne miejsce, ramka wyłącznie w podglądzie).

Style:
- **Clean**: jasne tło z palety, logotyp i „DESIGNED IN GAMEFIELDS STUDIO” u góry, render w środku z miękką poświatą,
  pod nim podpis, nazwa modelu (Inter 800), wymiary · wzór, kropki palety, na dole zaproszenie.
- **Street**: tłem jest wzór nawierzchni użytkownika w dużej skali, obrócony o ok. −14°; logo w ciemnej pigułce,
  nazwa modelu wersalikami (Inter 900, z obrysem), render z niskiej kamery z mocnym cieniem, naklejka z podpisem
  w kolorze lime, ciemny pas na dole z „DESIGNED IN GAMEFIELDS STUDIO”, wymiarami i adresem.
  W Studio tło Street = ta sama tekstura, którą Studio nakłada na nawierzchnię (canvas wzoru), nie osobny rysunek.
- **Karta boiska**: tło śliwka/granat z siatką jak na rysunku technicznym, rzut z góry z liniami wymiarów
  (szerokość, długość z bramkami), mała miniatura 3D, tabela: model, wymiary, wzór, kolory.

Kolory i krój: tylko z identyfikacji strony (`--ink #47132D`, `--paper #F4F1EE`, `--violet #6336F5`,
`--lime #D8F24A`, granat `#1F2A6B`, Inter). Bez nowych zasad identyfikacji.

## 3. Panel

| Teraz | Po zmianie |
| --- | --- |
| „Odśwież podgląd” | Brak przycisku: grafika przelicza się po każdej zmianie |
| 5 przycisków o tej samej wadze, „Zamknij” na dole | Wypełniony „Udostępnij”, obok „Pobierz PNG” i „Kopiuj link”; zamykanie krzyżykiem w nagłówku |
| Brak wyboru formatu i stylu | Przełączniki: Stories / Post, Clean / Street / Karta |
| 6 kolorów tła + własny kolor | „Z projektu” + 2–4 kolory marki zależnie od stylu |
| Mały podgląd bez proporcji telefonu | Podgląd w ramce 9:16 z cieniem i nakładką stref Instagrama (przełącznik) |
| „Zapisz dla innych” i „Link do projektu” osobno | „Kopiuj link” = zapis przez Warsztat (D1), ten sam link, który klonuje projekt |
| Przycisk w nagłówku: ikona nad tekstem | Pigułka jak „Pobierz projekt” (ikona obok tekstu) |

## 4. Udostępnianie

1. „Udostępnij”: najpierw kopiuje link do projektu do schowka, potem
   `navigator.canShare({files:[png]})` → `navigator.share({files:[png], title, text})`.
2. Brak obsługi plików w Web Share (część przeglądarek na komputerze): pobranie PNG + komunikat
   „Link skopiowany. W Instagramie dodaj naklejkę Link i wklej.”
3. Przycisk nie publikuje niczego w Instagramie: analityka liczy „uruchomiono udostępnianie”,
   a nie „opublikowano” (`share` resolve ≠ publikacja; `AbortError` = anulowano).

## 5. Pytania do właściciela

- Czy pokazywać cenę na grafice (domyślnie wyłączona)?
- Czy „Kopiuj link” może automatycznie publikować projekt w Warsztacie (jak „Zapisz dla innych”), czy pytać przed publikacją?
- Czy w drugim etapie robimy 4-sekundowy film obrotu (MediaRecorder) dla Stories?

## Odtworzenie renderu wzorcowego

```bash
cd <katalog roboczy> && npm i three@0.160.0 playwright
cp public/models/gamefields/source/panna-kids-o1.glb tools/share-your-field/render.html tools/share-your-field/render-shot.js <katalog roboczy>/
node render-shot.js '[["hero.png","w=2400&h=1800&d=21"],["low.png","w=2400&h=1800&d=20&el=14&az=20&fov=26"],["top.png","w=1600&h=1600&view=top"]]'
```

Posadzka i szachownica w `render.html` są uproszczeniem do prototypu; w Studio użyj prawdziwej nawierzchni ze sceny.
