# Prostokątne kolory i materiały — 25.10.2026

## Zmiana

Wspólny edytor kolorów konstrukcji i nawierzchni ma duże prostokątne próbki części i nazwane karty odcieni w tej samej karuzeli co Wzór i Sport. Wybierz Bandy/Rama/Bramki lub Pole gry/Strefy/Otoczenie, potem odcień. Dotknięcie dużej próbki części otwiera również systemowy wybór własnego koloru. Nazwa odcienia jest czytelna poza polem barwy; zaznaczenie, obrys i znak wyboru nie polegają wyłącznie na kolorze. Zachowano kliknięcie, swipe, strzałki i klawiaturę oraz wspólny zapis i Cofnij/Ponów.

Karty materiałów: trzy nowe wygenerowane makrofaktury (granulat, ażurowe płytki modułowe, włókna sztucznej murawy), a Malowana pokazuje bieżący wzór PatternArt wraz z kolorami użytkownika. Nie podmieniono źródłowych materiałówPBR rendererów3D. Zbliżenia mają charakter ilustracyjny, nie są fotografiami wskazanego producenta; objaśnienie w szczegółach próbek. Brak nowych obietnic parametrów wykonawczych.

## Zasoby i pochodzenie

Narzędzie: wbudowane image_gen, trzy osobne generacje. Oryginały zachowano w katalogu generated_images; kopie produkcyjneWebP w public/surfaces/catalogue/. Manifest zawiera SHA256 i rozmiary. Prompty, bez tekstu/logo/znaku wodnego:

1. **Granulat:** photorealistic premium material catalogue macro photograph of a seamless installed sportsEPDM rubber granule surface; individually visible irregular angular rubber granules1–3mm tightly bound into flat porous matte terracotta/burgundy surface; edge-to-edge, slightly oblique topdown, soft daylight, landscape4:3.
2. **Płytki:** photorealistic premium sports flooring catalogue close-up of four installed teal polypropylene interlocking square tiles, straight visible seams, open repeated square lattice perforations and raised ribs, realistic injection-moulded plastic, slightly oblique topdown, soft daylight, landscape4:3; no ceramic/foam.
3. **Murawa:** photorealistic catalogue macro of dense varied green upright synthetic sports grass fibres, flat/slightly curled polymer blades, rubber infill visible between fibres, sharp detail and soft daylight, edge-to-edge landscape4:3; no natural lawn/soil/flowers/fieldlines.

Grafika Malowanej jest kodem źródłowym bieżącej kompozycji, nie bitmapąAI. Modele, formaty sportowe,300wzorów,19palet, schematProject i stawki pozostają zachowane.

## Kontrola

TypeScript, test:studio, build, wymagane test:mobile oraz rozszerzony teststudio-visual-browser: prostokątne karty≥126px szerokości i100px wysokości, nazwy, trzy dekodujące się makrografiki i SVGMalowanej, zmiana koloru/materiału wJSON i głównym modelu, gesty/Cofnij, brak błędów wykonania i przepełnienia. Zrzuty kolorów i materiałów przy390/1440px w outputs/studio-ux/. TypeScript, test:studio, build, mobile375/390/430/1440 i wizualny390/1440: PASS. Mobilny układ5formatów320×568–844×390 równieżPASS. Ręcznie obejrzano materiały w działającym lokalnym Studio. Usunięto przyklejony nagłówek panelu, który na krótkim ekranie zasłaniał nazwy kart; nagłówek przewija się razem z ustawieniami. Receipt publikacji poza checkoutem. EmulacjaChromium nie zastępuje fizycznegoSafari.
