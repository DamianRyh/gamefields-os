# Skórka Studia 2026-11

Nadaje Studiu (gamefields-studio.ryhfs90.chatgpt.site) ten sam język wizualny co nowa strona główna (strona 3462, `integrations/wordpress/homepage/studio-2026-11`): tylko Inter, tło w kolorze papieru, śliwkowy tekst, fiolet dla głównej akcji, chipy-pigułki, bez plam i lawendowych gradientów.

To **wyłącznie warstwa CSS**. Nie zmienia komponentów, danych, JSON projektu, cen ani modeli 3D. Sprawdzona przez wstrzyknięcie do żywego Studia w jednej karcie przeglądarki przy 375, 768 i 1440 px (zakładki Nawierzchnia, Konstrukcja, Grafika oraz podsumowanie); nic nie zostało opublikowane.

## Co się zmienia

- **Górny pasek:** tło w kolorze papieru, logo w Inter 800. Folder i pobieranie to obrysowane pigułki. „Podsumowanie” to śliwkowa pigułka, po najechaniu fioletowa. Pasek z postaciami ma śliwkową pigułkę zamiast ciemnozielonej.
- **Scena:** płaskie tło w kolorze papieru, ukryte pastelowe plamy.
- **Panel:** biały, zaokrąglenie 6 px, cienka linia, bez efektu szkła.
  - Zakładki Konstrukcja / Nawierzchnia / Grafika mają podkreślenie w kolorze tekstu.
  - Opcje wyglądają jak chipy ze strony głównej: obrysowane, a po wybraniu wypełnione.
  - Główna akcja jest fioletowa.
- **Podsumowanie („Sprawdź swój projekt”):** duży nagłówek i cena w Inter 800, blok ceny na tle papieru, przyciski-pigułki, „Zapytaj o realizację” w fiolecie.
- **Telefon (≤ 800 px), naprawione błędy:**
  - Nagłówek miał 399 px i zasłaniał „Zapisz dla innych”. Teraz logo i akcje są w jednym rzędzie 56 px. Pasek postaci jest ukryty, a z przycisku „Podsumowanie” znika kwota (sam przycisk zostaje).
  - Panel nachodził na model i wychodził poza ekran. Teraz model zajmuje górne 42 %, a panel jest pod nim jako przewijany arkusz z przypiętymi zakładkami.
  - Cofnij/Ponów i strzałki konstrukcji są przy dolnej krawędzi modelu, a przełącznik „Nawierzchnie / Konstrukcje” zostaje.
  - Przy 375 px nie ma przewijania w bok.

## Wdrożenie (projekt ChatGPT Sites `appgprj_6abbd0ba26f0819197701343bf156f1b`)

1. Skopiuj `studio-skin-2026-11.css` do `app/studio-skin-2026-11.css`.
2. Skopiuj `InterVariable.woff2` do `public/fonts/InterVariable.woff2` (licencja SIL OFL, https://rsms.me/inter/).
3. W `app/layout.tsx` dodaj `import "./studio-skin-2026-11.css";` jako **ostatni** import CSS.
4. Uruchom `tsc`, `build`, `test:studio` i `test:mobile`, opublikuj nową wersję i zapisz ją w `DEPLOYMENT.md`.

Cofnięcie: usuń linię importu i opublikuj ponownie.

### Polecenie dla Codex / ChatGPT

> W projekcie Sites Gamefields Studio dodaj arkusz integrations/studio/skin-2026-11/studio-skin-2026-11.css z github.com/DamianRyh/gamefields-os (gałąź studio-skin-2026-11) jako app/studio-skin-2026-11.css, dodaj InterVariable.woff2 z tego samego folderu jako public/fonts/InterVariable.woff2 i zaimportuj arkusz jako ostatni w app/layout.tsx. Niczego więcej nie zmieniaj. Uruchom tsc, build, test:studio i test:mobile, opublikuj i dopisz wersję, commit i identyfikator wdrożenia do DEPLOYMENT.md.

## Uwagi

- Nazwy klas odczytano z żywego DOM 2026-11-02 (Studio v105+). Jeśli przyszła wersja zmieni nazwy `studio-panel`, `studio-panel-tool-tabs`, `studio-showroom-nav`, `studio-quote-badge`, `studio-workshop-save` lub `studio-template-launch`, odpowiednie reguły po prostu przestaną działać.
- Na telefonie `height:auto` przy panelu z pozycją absolutną nie rozciąga się z powodu starszych nakładanych reguł, dlatego arkusz ma jawne `height:58%`.
