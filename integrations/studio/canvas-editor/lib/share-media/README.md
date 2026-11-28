# Share Your Field w Studio (`lib/share-media`)

Grafika do Stories / postu albo 6-sekundowy film z **prawdziwej sceny 3D Studia**:
ten sam model, kolory, panele i nawierzchnia co w edytorze. Bez backendu i bez nowych zależności.

## Pliki

| Plik | Co robi |
| --- | --- |
| `components/product-renderer.ts` | `beginCapture(w,h)`, `shot({azimuth,elevation,fov,dolly,margin})`, `endCapture()`: ujęcia z kamery perspektywicznej w tej samej scenie, przezroczyste tło; `surfaceArtwork()` = obraz nawierzchni. Widok interaktywny jest wstrzymany (canvas `opacity:0`) i przywracany po ujęciu. |
| `lib/share-media/registry.ts` | Aktywny renderer dla panelu. Rejestruje go `components/blender-arena-preview.tsx` (2 linie). |
| `lib/share-media/facts.ts` | Co mówi grafika: model (`sportProfiles`), pole gry i wymiary z bramkami (`projectDimensions`), wzór, paleta wzoru, kolor ramy i paneli. |
| `lib/share-media/compose.ts` | Szablony Clean / Street / Karta, formaty Stories 1080×1920 i Post 1080×1350, strefy Instagrama, animacja napisów dla filmu (`anim`). |
| `lib/share-media/media.ts` | `stills(renderer)` = 3 ujęcia (bohater = aktualny widok użytkownika, nisko, z góry); `film(renderer, opcje)` = MP4 6 s 30 kl./s przez WebCodecs (H.264 High → Main → Baseline). |
| `lib/share-media/mp4.ts` | Własny zapis MP4 (jedna ścieżka H.264, moov przed mdat). Zastępuje bibliotekę `mp4-muxer`, która jest wycofana. |
| `components/share-media-panel.tsx` + `app/share-media.css` | Panel: format, styl, rodzaj (grafika / film), tło, podpis, cena (gdy podana), strefy Instagrama, Udostępnij / Pobierz / Kopiuj link, pasek postępu filmu z „Anuluj”. |
| `components/project-share.tsx` | Panel pokazany na górze zakładki „Udostępnij” w bibliotece projektu; „Kopiuj link” używa ostatniego linku z tej zakładki. |

## Podpięcie w panelu Codexa (Sites)

```tsx
import {ShareMediaPanel} from '@/components/share-media-panel';
<ShareMediaPanel project={project} price={constructionPriceNet} link={sharedUrl} onClose={close}/>
```

Albo bez gotowego panelu (własny UI):

```ts
import {shareRenderer} from '@/lib/share-media/registry';
import {stills, film} from '@/lib/share-media/media';
import {compose} from '@/lib/share-media/compose';
import {shareFacts} from '@/lib/share-media/facts';
const r = shareRenderer();               // null, gdy widok 3D nie jest gotowy
const images = stills(r);                // raz po zmianie projektu
compose(canvas, {format:'story', style:'street', background:'auto', facts:shareFacts(project), images, showPrice:false});
const mp4 = await film(r, {format:'story', style:'street', background:'auto', facts, showPrice:false, surface:images.surface}, {onProgress, signal});
```

Do skopiowania do Sites: wszystkie pliki z tabeli. W `product-renderer.ts` i `blender-arena-preview.tsx`
zmiany są małe (szukaj „Share Your Field” i `registerShareRenderer`).

## Udostępnianie i analityka

- „Udostępnij”: kopiuje link do schowka, potem `navigator.share({files})`; bez Web Share pobiera plik.
  Komunikat prosi o naklejkę „Link” w Instagramie (strona nie publikuje sama).
- Zdarzenia `window` `gf-share` (`detail.name`): `share_panel_open`, `share_image_generated`, `share_png_download`,
  `share_film_start`, `share_film_generated`, `share_film_download`, `share_native_open`, `share_native_done`
  (rozwiązanie `navigator.share` ≠ publikacja w Instagramie), `share_link_copy`. Bez danych osobowych.

## Sprawdzone lokalnie (23.11.2026, Chromium, grafika programowa)

- Panna Play + Ndebele: 6 grafik (Stories/Post × Clean/Street/Karta) z prawdziwej sceny; Street ma w tle prawdziwą nawierzchnię.
- Film Stories Street nagrany w przeglądarce: H.264 High, 1080×1920, 180 klatek, 6 s, dekodowanie ffmpeg bez błędów.
  Czas 340 s na serwerze bez GPU; na urządzeniu z GPU dużo krócej (do zmierzenia na iPhonie i Androidzie).
- Telefon 390 px: panel bez przewijania w bok. TSC, ESLint (nowe pliki), build: PASS.
- `test:studio` nie przechodzi, ale tak samo bez tych zmian: `tests/surface-pro.mjs` oczekuje 28 rodzin, a od Masters II jest 36.
