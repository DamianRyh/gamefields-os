# Plan: widoczność nowych wzorów i planu malowania na gamefields.eu (27.11.2026)

## Stan na żywo (sprawdzone 27.11, gamefields.eu i Studio w iframe `gamefields-studio.ryhfs90.chatgpt.site`)

| Co | Stan |
|---|---|
| Studio: zakładki „Murale” i „Kompozytor”, projekty MURALE na początku | ✅ wdrożone (z gałęzi `claude/upbeat-archimedes-uy9b03`; `main` nie jest scalony, gałąź ma 24 commity więcej) |
| Studio: karta „Plan malowania” w podsumowaniu | ❌ niewdrożona (powstała po tym wdrożeniu). W podsumowaniu jest tylko karta projektu PDF |
| Studio: wycena „Malowanie · Wzór zaawansowany” | ⚠️ opis zawsze mówi „złożone grafiki (Organic Flow, gradienty)”, niezależnie od wybranego wzoru |
| Strona główna | ❌ ani słowa o Muralach, Kompozytorze czy planie malowania. „Pięć miejsc. Pięć zestawów.” pokazuje Masters II |
| /malowanie-boisk/ („Malowanie i grafika”) | ⚠️ nieaktualne: „732 wzory” (4 miejsca), Masters II jako najnowsza kolekcja (8 miejsc), brak murali i planu |
| /nawierzchnie-sportowe/, /renowacja-boisk/, /projektowanie-boisk/ | ❌ brak (/projektowanie-boisk/ podaje jeszcze „732”) |
| Menu: Boiska · Ceny · Dla kogo · Realizacje · Wiedza · Sklep · Kontakt | ❌ brak wejścia do wzorów. Wzory są widoczne dopiero w Studiu, po wybraniu boiska |
| Linki do konkretnego wzoru | ✅ działają: `/studio/?arena=p1&pattern=pro-m-landscape&variant=1&palette=simultane` (tak linkuje już /malowanie-boisk/) |

Wniosek: nowa praca jest w Studiu, ale prowadzi do niej tylko jedna droga: Studio → boisko → nawierzchnia → zakładka. Klient, który szuka „mural na boisku” albo „wzory na boisko”, nie ma jak tam trafić, a plan malowania (najmocniejszy argument dla gmin i szkół) nie jest jeszcze wdrożony.

## Plan

### Etap 1: wdrożyć i poprawić Studio (najpierw, bez tego strona nie ma do czego linkować)

1. **Wdrożyć Studio z planem malowania.** Scalić [PR #129](https://github.com/DamianRyh/gamefields-os/pull/129) do `main` i wkleić ChatGPT `docs/roadmap/DLA-CHATGPT-studio-kompozytor.txt`. Wszystkie testy przechodzą lokalnie (tsc, build, test:studio, test:surface, test:mobile, test:plan).
2. **Wycena malowania mówi o wybranym wzorze.** Zamiast stałego „Organic Flow, gradienty”: nazwa rodziny i wariantu, a dla Kompozytora i Murali zmierzone liczby (farby, m², taśma). Poprawka w Studiu, z testem.
3. **Podpowiedź w podsumowaniu.** Doradca „Marek” proponuje dziś tylko kartę PDF. Dopisać drugą akcję: „Pobierz plan malowania dla wykonawcy”.

### Etap 2: strona (gdzie ludzie faktycznie szukają)

4. **/malowanie-boisk/ jako główne miejsce nowości** (to strona o court designie, tu pasuje najbardziej):
   - poprawić liczby: 732 → 1020 wzorów, 85 kierunków;
   - nowa sekcja **„Murale. Boisko jak w USA.”**: 8 kart (Wycinanki … Pociągnięcia), każda z miniaturą i linkiem do Studia na ten wzór, plus krótko o trendzie (Project Backboard, Nowy Jork, Memphis; źródła w `docs/research/2026-11-26-murale-boisk-usa.md`);
   - „Pięć miejsc, pięć wzorów”: 2–3 z 5 zestawów zamienić na murale (np. Pejzaż dla parku, Wielkie słowa dla szkoły, Wycinanki dla street);
   - nowa sekcja **„Plan malowania dla wykonawcy”**: miniatury 3 stron, co zawiera (siatka co 1 m, kolejność farb, litry, taśma), przykładowy PDF do pobrania i przycisk „Zrób swój w Studiu”;
   - „Wzór, który da się namalować” zaktualizować: każdy wzór Kompozytora i Murali jest sprawdzony automatycznie (min. 20 cm, 3–5 farb, symetria albo równowaga połówek), a nie tylko Masters II.
5. **Strona główna: bez nowej sekcji (jest ich już 21), zmiana w istniejących.**
   - „Pięć miejsc. Pięć zestawów.” → 2 zestawy z muralami (rendery ze Studia, jak przy Masters II);
   - w „Poczuj różnicę.” albo „Stary beton. Nowe boisko.” jedno zdanie i link: „Nowość: murale na boisku i plan malowania dla wykonawcy →” do /malowanie-boisk/#murale.
6. **Nowa podstrona „Wzory i murale”** (`/wzory-na-boisko/`): galeria wszystkich 24 kierunków Kompozytora i Murali (oraz Masters), filtr jak w Studiu, każdy z linkiem do Studia. Pod frazy „wzory na boisko”, „mural na boisku”, „malowanie boiska wzory”. W menu: **Boiska → Wzory i murale** (albo osobna pozycja „Wzory”, jeśli menu ma być krótkie).
7. **Podstrony dla kogo** (szkoły i gminy, miasta, deweloperzy, kluby, marki): po jednym zdaniu z linkiem w miejscu o nawierzchni. Szkoły: Wielkie słowa i Rama. Miasta: Pejzaż i Pola malarskie. Marki: Wycinanki i Tkanina. Gminy: plan malowania („przetarg albo własna ekipa”).
8. **Baza wiedzy: poradnik „Mural na boisku krok po kroku”** z przykładowym planem malowania do pobrania (jako lead magnet: e-mail za PDF albo bez bramki, do decyzji) i linkiem do Studia.

### Etap 3: sprzedaż (do decyzji właściciela)

9. **Produkt „Projekt muralu + plan malowania”** w sklepie, dla gmin i szkół, które malują własną ekipą: projekt w Studiu, poprawki, plan malowania PDF, kolory dobrane do konkretnej farby. Cena do ustalenia.
10. **Realizacje:** pierwsze boisko-mural z planu (zdjęcie z drona obok rysunku z planu) jako dowód, że to działa.

## Postęp (27.11, po południu)

- ✅ 1. Studio gotowe do wdrożenia z gałęzi `claude/upbeat-archimedes-uy9b03`. **Gałąź ma teraz scaloną `claude/ecstatic-hamilton-dgjvt8`**: Studio na żywo było zbudowane z obu, a wdrożenie jednej usunęłoby funkcje drugiej. Na scaleniu przechodzą tsc, build, test:studio, test:surface, test:plan i test:mobile.
- ✅ 2. Wycena: linia „Malowanie” podaje wzór klienta i, dla Kompozytora i Murali, zmierzone farby i taśmę. Próg „Wzór zaawansowany” nie mówi już „Organic Flow” (Studio, oferta, sklep i strony w repo).
- ✅ 3. Podpowiedź Marka przy karcie PDF wspomina plan malowania.
- ✅ 4. /malowanie-boisk/ przebudowana (sekcja „Boisko jak mural.” z 8 kartami, „Plan malowania z Twojego wzoru.”, 1020 wzorów, zasady dla wszystkich kolekcji, 9 pytań). Polecenie: `DLA-CHATGPT-malowanie-murale.txt`. Zestawy „Pięć miejsc” zostają na razie z Masters II, bo nowe rendery 3D muralowych zestawów trzeba zrobić w Studiu.
- ✅ 6. Podstrona **/wzory-na-boisko/** (ID 4954) opublikowana 28.11: wzory polskie, Murale, Kompozytor (32 karty z silnika), zasady, pytania. Bez pozycji w menu (decyzja właściciela). Karty wzorów polskich prowadzą do kontaktu, dopóki Studio ich nie ma (`STUDIO_HAS_POLISH` w build.py).
- ✅ 5. Strona główna (ID 3462) opublikowana 28.11: sekcja „Wzory. Jedno boisko, setki stylów.” pod „Osiem boisk” (4 kolekcje w stylu kafli boisk), „Ze wzorem od” przy 8 modelach, skrót „Wzory” w pasku na telefonie; menu „Wzory” w motywie 1.0.38. Kopia wersji na żywo: `homepage/wzory-2026-11/homepage-3462-live-2026-11-28.html`.
- ✅ 28.11 (usprawnienia, `pages/usprawnienia-2026-11-28/apply.py`, każda zmiana jako dokładna podmiana z kontrolą liczby wystąpień):
  wzory polskie już w Studio → karty na /wzory-na-boisko/ i kafel na stronie głównej otwierają Studio; „Organic Flow, gradienty” → „murale, gradienty” (strona główna, Nawierzchnie, Renowacja, poradnik); „732” → „1116” (Projektowanie, Deweloperzy); sekcja „Wzór nawierzchni · Boisko z charakterem.” z 2 dopasowanymi wzorami na 6 stronach „Dla kogo”. Równolegle drugi edytor dodawał linki do poradników (Kluby 9:36, Wynajem 9:37): zmiany wprowadzone na nowszej wersji, jego akapity zachowane. Motyw 1.0.39: „Wzory” zaraz po „Boiska” (do wgrania).
- ⏳ 7, 8. Strona główna, podstrona „Wzory i murale” (zrobiona jako /wzory-na-boisko/), strony „dla kogo”, poradnik. Zmiana opisu „Organic Flow” na stronie głównej, w /nawierzchnie-sportowe/, /renowacja-boisk/ i w poradniku jest w repo i wejdzie przy najbliższym wdrożeniu tych stron.

## Kolejność i zależności

1 → 2 → 3 (Studio) → 4 → 5 → 6 → 7 → 8. Kroki 9 i 10 niezależnie, po decyzji. Kroki 4–8 to strony WordPress budowane w repo jak dotychczas (`integrations/wordpress/pages/*`, `homepage/studio-2026-11/bloki`) i wdrażane poleceniem dla ChatGPT.

## Do decyzji

- Pozycja w menu: „Boiska → Wzory i murale” czy osobne „Wzory”.
- Przykładowy plan malowania: do pobrania wprost czy za e-mail.
- Produkt „Projekt + plan malowania”: czy sprzedajemy i za ile.
