# Studio — narzędzie „Piłka” (2026-11-02)

Cel: czwarte narzędzie w Studiu obok Konstrukcji, Nawierzchni i Grafiki. Klient projektuje piłkę w tym samym wzorze co boisko, jednym kliknięciem, i dołącza ją do zapytania.

Projekt Sites: `appgprj_6abbd0ba26f0819197701343bf156f1b`. Pracuj na aktualnych źródłach z Sites, nie na lokalnych kopiach.

Nie zmieniaj:
- cen w rate card;
- migracji;
- istniejących wzorów;
- zachowania narzędzi Konstrukcja, Nawierzchnia i Grafika.

Każdy krok to osobny commit.

## Pliki źródłowe

Wszystkie pliki są w github.com/DamianRyh/gamefields-os, gałąź `studio-skin-2026-11`.

- `integrations/studio/ball-2026-11/ball-core.js`:
  - geometria 32 paneli (12 pięciokątów, 20 sześciokątów) ze szwami;
  - funkcje `GFBall.create(THREE, {detail})`, `setState(...)`, `pick(raycaster)` i `GFBall.paintTexture(canvas, engine, family, variant, colors, label, done)`;
  - sprawdzone z three.js r128 (strona główna) i r180 (Studio): 32 grupy paneli.
  - Moduł rejestruje `window.GFBall`. W Studiu zaimportuj go jako moduł efektów ubocznych albo przepisz na eksport ESM bez zmiany logiki.
- `lib/court-art-pro.mjs`: silnik wzorów `renderPro`, `recommendLineColor`. Jest już w Studiu po wdrożeniu Nawierzchnie Pro.
- Wzorzec działania: sekcja `#pilka` na gamefields.eu oraz `integrations/studio/ball-2026-11/pilka-gamefields.html`.

## 1. Model danych

Dodaj w `lib/project.ts` opcjonalne pole, zgodne wstecz (stare projekty bez pola działają bez zmian):

```ts
ball?: {
  enabled: boolean;              // czy piłka jest częścią zapytania
  mode: "full" | "mix" | "panels";
  followCourt: boolean;          // true = wzór i kolory z nawierzchni boiska
  patternFamily?: string; patternVariant?: number; patternPalette?: string;
  pent: string; hex: string;     // HEX kolorów pięciokątów i sześciokątów
  paint: Record<string, string>; // indeks panelu 0–31 -> HEX
  label: string;                 // maks. 16 znaków, wielkie litery
  size: 3 | 4 | 5;
  quantity?: number;             // ilość do zapytania, bez ceny
}
```

Dodaj walidację w `projectSchema`:
- HEX ma postać `^#[0-9A-Fa-f]{6}$`;
- indeksy w `paint` są liczbami 0–31;
- `label` ma maksymalnie 16 znaków;
- `quantity` to liczba 1–10000.

Import i eksport JSON oraz cofanie i ponawianie obejmują `ball` tak samo jak resztę projektu.

## 2. Narzędzie „Piłka”

- Czwarta zakładka narzędzi: Konstrukcja / Nawierzchnia / Grafika / **Piłka**, z ikoną piłki z lucide-react.
- Po wejściu w zakładkę obszar 3D pokazuje piłkę zamiast boiska. Użyj tego samego renderera i obsługi obrotu co podgląd boiska, nie twórz drugiego kontekstu WebGL.
- Po wyjściu z zakładki wraca boisko.
- Panel narzędzia zawiera:
  1. Przełącznik **„Ten sam wzór co boisko”**, domyślnie włączony. Bierze `patternFamily`, `patternVariant` i `patternPalette` z projektu nawierzchni. Wyłączenie odsłania wybór rodziny, kompozycji (1–12) i palety.
  2. **Styl:** „Wzór na całej piłce”, „Wzór + pięciokąty” albo „Klasyczne panele”.
  3. **Kolory:** pięciokąty, sześciokąty i pędzel. Kliknięcie panelu na modelu bez przeciągania (ruch poniżej 6 px) maluje go pędzlem. Dodaj przycisk „Wyczyść malowanie”.
  4. **Napis:** do 16 znaków, nadrukowany dwa razy na równiku.
  5. **Rozmiar:** 3, 4 lub 5, ze skalą modelu 0,86 / 0,93 / 1.
  6. **Ilość do zapytania:** pole liczbowe z dopiskiem „cenę i minimalną ilość potwierdzimy mailowo”.
- Teksturę wzoru rysuj przez `GFBall.paintTexture` do płótna 2048 × 1024. Odświeżaj ją przy zmianie wzoru, palety lub napisu, z opóźnieniem około 180 ms dla napisu.
- Kolory paneli przekazuj przez `setState`. Moduł sam konwertuje je przez `THREE.Color` i ustawia `colorSpace` tekstury na sRGB.

## 3. Podsumowanie i zapytanie

- W „Sprawdź swój projekt” dodaj sekcję „Piłki”, gdy `ball.enabled` jest prawdą:
  - miniatura (zrzut z renderera);
  - wzór, styl, kolory, pomalowane panele (indeks = HEX);
  - napis, rozmiar i ilość.
- W treści zapytania (`inquiry-summary`) dodaj linię: `Piłki: <wzór> <wariant> · <paleta> · <styl> · napis „…” · rozmiar N · ilość N · panele: …`.
- **Nie dodawaj ceny piłek do wyceny.** W kalkulacji pokaż pozycję „Piłki — do ustalenia”.

## 4. Link 1:1

Jeśli wdrożono już link do projektu (CODEX.md z `next-2026-11`, punkt 1), dodaj parametry adresu:
- `ball=1`;
- `bmode`;
- `bpent`, `bhex` (HEX bez `#`);
- `blabel`;
- `bsize`;
- `bpaint` w postaci `3-D8F24A.12-111111`.

Waliduj je jak w punkcie 1.

## 5. Kontrole i raport

- Uruchom tsc, build, test:studio i test:mobile.
- Dodaj test: projekt bez `ball` wczytuje się bez zmian, a projekt z `ball` przechodzi eksport i import JSON 1:1.
- Zrób zrzuty przy 390 i 1440 px:
  - zakładka „Piłka” w trzech stylach;
  - malowanie panelu;
  - podsumowanie z sekcją „Piłki”.
- Do DEPLOYMENT.md wpisz wersję, commit i identyfikator wdrożenia.

Jeśli struktura plików w aktualnej wersji różni się od tej instrukcji, zatrzymaj się i zgłoś różnice.
