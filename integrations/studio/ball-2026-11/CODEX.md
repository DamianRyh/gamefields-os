# Studio — narzędzie „Piłka” v2 (2026-11-02)

## Cel

Czwarte narzędzie w Studiu, obok Konstrukcji, Nawierzchni i Grafiki. Klient projektuje piłkę w tym samym wzorze co boisko (jedno kliknięcie), dopracowuje ją i dołącza do zapytania. Wzorzec działania: sekcja `#pilka` na gamefields.eu (szkic, strona 4276).

## Zasady

- Projekt Sites: `appgprj_6abbd0ba26f0819197701343bf156f1b`. Pracuj na aktualnych źródłach z Sites, nie na lokalnych kopiach.
- Nie zmieniaj cen w rate card, migracji, istniejących wzorów ani zachowania narzędzi Konstrukcja, Nawierzchnia i Grafika.
- Każdy krok to osobny commit.

## Pliki źródłowe

Repozytorium: github.com/DamianRyh/gamefields-os, gałąź `studio-skin-2026-11`.

- `integrations/studio/ball-2026-11/ball-core.js`: moduł piłki v2. Rejestruje `window.GFBall`. Zaimportuj go jako moduł efektów ubocznych albo przepisz na eksport ESM bez zmiany logiki.
  - `GFBall.create(THREE, {detail})` zwraca `{ group, mesh, setState(state), pick(raycaster), panels, frontPanel(dir, type) }`.
  - Sprawdzone z three.js r128 i r180: 12 pięciokątów, 20 sześciokątów, 32 grupy.
  - `setState`:
    - `mode`: `full`, `mix` albo `panels`;
    - `mapping`: `sphere` albo `panel`; druk panel po panelu nie rozciąga wzoru przy biegunach;
    - `pent`, `hex`;
    - `base` (układ kolorów) i `paint` (pędzel);
    - `seam`;
    - `finish`: `matte`, `satin` albo `gloss`;
    - `textureCanvas`.
  - `GFBall.paintTexture(canvas, engine, o, done)`: ciągły druk 2048 × 1024 z akcentem (`deco`: `band`, `poles`, `spiral`), napisem z przodu oraz numerem i logo z tyłu.
  - `GFBall.paintAtlas(canvas, engine, ball, o, done)`: atlas 8 × 4 kafli po 256 px, osobny wycinek wzoru na każdy panel. Napis trafia na sześciokąt z przodu, numer i logo na sześciokąt z tyłu (`labelPanel`, `numberPanel` z `frontPanel`).
  - `GFBall.schemes(ball, name, colors, pent, hex, mix)`: układy `classic`, `mosaic` (sąsiednie panele nigdy w tym samym kolorze), `gradient`, `half`, `band`, `star`.
- `lib/court-art-pro.mjs`: `renderPro`, `courtLines`, `recommendLineColor`, `mix`. Jest już w Studiu.
- Wzorzec kontrolera: blok `BALL v2` w `integrations/wordpress/homepage/studio-2026-11/script.js`. Zawiera:
  - stan;
  - zakładki;
  - link 1:1 (`?pilka=`);
  - scenę „Na boisku”;
  - podgląd PNG;
  - zapytanie.

## 1. Model danych

W `lib/project.ts` dodaj opcjonalne pole, zgodne wstecz:

```ts
ball?: {
  enabled: boolean;
  followCourt: boolean;                          // true = wzór, kompozycja i kolory z nawierzchni
  mode: "full" | "mix" | "panels";
  mapping: "sphere" | "panel";
  patternFamily?: string; patternVariant?: number; patternPalette?: string; patternSeed?: number;
  colors?: string[];                             // 5 × HEX, gdy kolory własne
  scheme: "classic" | "mosaic" | "gradient" | "half" | "band" | "star";
  deco: "none" | "band" | "poles" | "spiral";
  pent: string; hex: string;                     // HEX
  paint: Record<string, string>;                 // indeks panelu 0–31 -> HEX
  label: string;                                 // maks. 16 znaków, wielkie litery
  number: string;                                // maks. 10 znaków
  textSize: 0.8 | 1 | 1.3;
  logo?: { name: string; dataUrl: string };      // maks. 3 MB, PNG/JPG/SVG
  finish: "matte" | "satin" | "gloss";
  seam: string;                                  // HEX
  size: 3 | 4 | 5;
  quantity?: number;                             // 1–10000, bez ceny
}
```

Walidacja w `projectSchema`:
- HEX ma postać `^#[0-9A-Fa-f]{6}$`;
- indeksy w `paint` są z zakresu 0–31;
- obowiązują limity długości;
- `logo.dataUrl` zaczyna się od `data:image/png`, `data:image/jpeg` albo `data:image/svg+xml`.

Import i eksport JSON oraz cofanie i ponawianie obejmują `ball`. Logo zapisuj w szkicu lokalnym; do publicznego Warsztatu go nie wysyłaj.

## 2. Narzędzie „Piłka”

- Czwarta zakładka narzędzi z ikoną piłki. Obszar 3D pokazuje piłkę w tym samym rendererze co boisko, bez drugiego kontekstu WebGL. Po wyjściu z zakładki wraca boisko.
- Panel ma cztery podzakładki, jak na stronie:
  - **Wzór:**
    - przełącznik „Ten sam wzór co boisko” (domyślnie włączony);
    - styl: wzór na całej piłce, wzór + pięciokąty albo kolorowe panele;
    - druk: jeden ciągły albo osobno na każdym panelu;
    - rodzina, kompozycja 1–12 i „Nowa wersja”;
    - paleta;
    - akcent: bez, pas, czapy albo spirala.
  - **Panele:**
    - 6 układów kolorów (wybór układu przełącza styl na „kolorowe panele”);
    - kolor pięciokątów, sześciokątów i pędzla;
    - pędzel z kolorów palety;
    - „Pędzlem: wszystkie pięciokąty” i „Wyczyść malowanie”;
    - kliknięcie panelu bez przeciągania (ruch poniżej 6 px) maluje go.
  - **Nadruk:**
    - napis z przodu (16 znaków);
    - numer albo drugi napis z tyłu (10 znaków);
    - wielkość napisu: mały, średni albo duży;
    - logo z pliku (FileReader, limit 3 MB) i „Usuń logo”.
  - **Wykończenie:**
    - mat, satyna albo połysk;
    - szwy: ciemne, jasne, limonkowe albo z palety;
    - rozmiar 3, 4 lub 5 (skala 0,86 / 0,93 / 1);
    - ilość do zapytania.
- Przyciski pod modelem:
  - „Losuj piłkę”;
  - „Na boisku”: płaszczyzna z teksturą boiska w tym samym wzorze i z liniami, piłka leży na niej, kamera z góry pod kątem;
  - „Obrót”: automatyczny, z poszanowaniem `prefers-reduced-motion`.
- Tekstury rysuj do dwóch płócien 2048 × 1024: ciągłego i atlasu. Odświeżaj je przy zmianie wzoru, palety, akcentu albo nadruku, z opóźnieniem około 180 ms dla tekstu. Podawaj do `setState` płótno odpowiadające wybranemu `mapping`.
- „Pobierz podgląd PNG”: `preserveDrawingBuffer` albo jednorazowy render do `toBlob`.

## 3. Podsumowanie i zapytanie

- W „Sprawdź swój projekt” dodaj sekcję „Piłki”, gdy `ball.enabled` jest prawdą:
  - miniatura;
  - wzór, styl, sposób druku, akcent, układ kolorów, liczba pomalowanych paneli;
  - napis, numer, logo (nazwa pliku);
  - wykończenie, szwy, rozmiar, ilość.
- W `inquiry-summary` dodaj linię `Piłki: …` w tym samym formacie co na stronie. Jeśli jest logo, dopisz „logo dołączę mailem”.
- **Nie dodawaj ceny piłek do wyceny.** W kalkulacji pokaż pozycję „Piłki — do ustalenia”.

## 4. Link 1:1

Parametr `pilka=` w formacie identycznym jak na stronie: base64url z JSON-a `{m, mp, f, v, s, p, c, pe, he, sc, pa, d, l, n, ts, fi, se, z}`. Link nie zawiera logo. Dzięki temu link z gamefields.eu otwiera tę samą piłkę w Studiu.

## 5. Kontrole i raport

- Uruchom tsc, build, test:studio i test:mobile.
- Testy:
  - projekt bez `ball` wczytuje się bez zmian;
  - projekt z `ball` przechodzi eksport i import JSON 1:1;
  - `?pilka=` ze strony odtwarza ten sam stan.
- Zrzuty przy 390 i 1440 px:
  - trzy style;
  - druk na panelach;
  - mozaika;
  - logo i numer z tyłu;
  - „Na boisku”;
  - podsumowanie z sekcją „Piłki”.
- Do DEPLOYMENT.md wpisz wersję, commit i identyfikator wdrożenia.

Jeśli struktura plików w aktualnej wersji różni się od tej instrukcji, zatrzymaj się i zgłoś różnice.
