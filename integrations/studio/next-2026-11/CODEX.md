# Studio — usprawnienia z researchu konkurencji (2026-11-02)

Źródło decyzji: research konfiguratorów (Sport Court, VersaCourt), producentów klatek i MUGA (KOMPAN, SKOR) oraz dobrych praktyk konfiguratorów (uni.xyz, KBMax). Zakres: wyłącznie Studio w ChatGPT Sites (projekt `appgprj_6abbd0ba26f0819197701343bf156f1b`). Pracuj na aktualnych źródłach z Sites, nie na lokalnych kopiach.

Nie zmieniaj schematu Project w sposób niezgodny wstecz, cen w rate card, migracji ani istniejących wzorów. Każdy punkt to osobny commit. Zakres kontroli: tsc, build, test:studio, test:mobile.

## 1. Link 1:1 do projektu
U konkurencji brak zapisu i udostępniania, a dobre praktyki wymagają zapisu linkiem.

- Dodaj parametry adresu:
  - `base`, `zone`, `outside`, `line` (kolory HEX bez `#`, walidacja `^[0-9A-Fa-f]{6}$`);
  - `seed` (liczba całkowita 0–999999);
  - `arena`, `surface`, `sport` (już obsługiwane).
- Parametr `seed` przekaż do `renderPro(..., {seed})` dla rodzin `pro-*`. Wymaga dodania pola `patternSeed` w Project, opcjonalnego, z domyślną wartością 0.
- Przycisk „Kopiuj link do projektu” w górnym pasku: buduje adres z bieżącego projektu, kopiuje go (`navigator.clipboard`), a gdy kopiowanie się nie uda, pokazuje adres do zaznaczenia.
- Strona `/konfigurator-boisk/` na gamefields.eu już przekazuje parametry adresu do Studia w iframe.

## 2. Widoczne kroki i postęp
Wzorzec: Sport Court i VersaCourt mają 3–4 kroki.

- Nad zakładkami panelu pokaż pasek 4 kroków: Konstrukcja → Nawierzchnia → Grafika → Podsumowanie.
- Krok odwiedzony i zmieniony ma znacznik ✓. Bieżący krok jest pogrubiony z podkreśleniem.
- Kliknięcie kroku przełącza narzędzie, tak jak obecne zakładki.
- Na telefonie pasek ma jeden rząd, przewijany w poziomie.

## 3. Różnica ceny przy opcji
Dobre praktyki: zmiana ceny przy wyborze, a nie dopiero w sumie.

- Przy kartach konstrukcji, nawierzchni i materiału pokaż różnicę względem bieżącego wyboru, np. „+4 200 zł netto” albo „−1 100 zł netto”.
- Liczby bierz wyłącznie z istniejącego silnika wyceny (rate card). Gdzie pozycja nie ma stawki, pisz „do ustalenia”. Nie wpisuj zera ani wartości zastępczych.
- Kwota w górnym pasku zmienia się z ogłoszeniem `aria-live="polite"`.

## 4. Zacznij od nowa
- W menu projektu dodaj opcję „Zacznij od nowa” z potwierdzeniem wewnątrz strony, bez `confirm()`.
- Przed resetem zapisz bieżący projekt do szkicu lokalnego (istniejący mechanizm), żeby dało się go cofnąć.

## 5. Wydajność na telefonie
- Miniatury w karuzelach i w oknie „Gotowe wzory” renderuj leniwie: dopiero gdy karta jest widoczna (IntersectionObserver).
- Zmierz czas do pierwszego obrazu modelu na telefonie (Lighthouse, Moto G Power) przed zmianą i po niej, i wpisz wynik do DEPLOYMENT.md.

## 6. Planer placu
- W panelu Konstrukcja, pod wyborem modelu, dodaj link „Sprawdź, czy zmieści się na Twoim placu” do `https://www.gamefields.eu/#planer`.

## Raport
Do DEPLOYMENT.md wpisz:
- wersję, commit i identyfikator wdrożenia;
- wyniki kontroli;
- zrzuty przy 390 i 1440 px dla kroków, różnic ceny i linku.

Jeśli struktura plików w aktualnej wersji różni się od tej instrukcji, zatrzymaj się i zgłoś różnice.
