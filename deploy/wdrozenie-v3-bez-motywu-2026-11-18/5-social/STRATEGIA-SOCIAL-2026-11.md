# Gamefields — strona ↔ social media (18.11.2026)

Profile: Instagram https://www.instagram.com/gamefields.eu/ · LinkedIn https://www.linkedin.com/company/gamefields · Facebook https://www.facebook.com/Gamefields.eu

## Zasada: każdy kanał ma swoją publiczność i jedną rolę
| Kanał | Kto tam jest | Rola | Obietnica na stronie |
|---|---|---|---|
| **LinkedIn** | gminy, OSiR-y, szkoły, deweloperzy, marki, architekci | wiarygodność i terminy | „Realizacje dla miast i nabory dotacji” |
| **Facebook** | mieszkańcy, rodzice, rady osiedli, sołectwa, kluby lokalne | społeczność i budżety obywatelskie | „Nowe boiska w Twojej okolicy” |
| **Instagram** | młodzież, trenerzy, kluby, projektanci | wygląd i emocje | „Wzory, montaże i boiska w akcji” |

Nie wrzucamy ikon „dla zasady”. Każde wezwanie do obserwowania stoi tam, gdzie treść kanału jest kontynuacją tego, co ktoś właśnie czyta.

## Co jest wdrożone na stronie (motyw 1.0.37 + strona główna)
| Miejsce | Kanał | Dlaczego tu |
|---|---|---|
| Stopka na każdej stronie: „Obserwuj Gamefields” — 3 karty z opisem | wszystkie | stałe, przewidywalne miejsce |
| Po wysłaniu formularza: „Zanim odpiszę: zobacz, co teraz budujemy…” | wszystkie | moment największego zainteresowania, czekanie na odpowiedź 1–2 dni |
| Autoodpowiedź mailowa (Mail 2) | wszystkie | drugi moment uwagi, link zostaje w skrzynce |
| Sekcja „Z boiska” (realizacje) | Instagram, Facebook | „na bieżąco z budowy” |
| Sekcja dla gmin, szkół i Orlików | LinkedIn | „starty naborów — obserwuj, żeby zdążyć z wnioskiem” |
| Warsztat projektów | Instagram | „najciekawsze projekty pokazujemy na Instagramie” — powód, by zapisać projekt |
| Mapa możliwości | LinkedIn, Facebook, Instagram | „Nie przegap naboru — starty ogłaszamy tutaj” |
| Dane strukturalne (JSON-LD `sameAs`) | wszystkie | Google łączy stronę z profilami (panel wiedzy, wyniki marki) |

Pomiar: GA4 zdarzenie `gf_social` z `platform` i `placement` (stopka, po-wyslaniu, realizacje, samorzady, warsztat, mapa-mozliwosci). Po miesiącu widać, które miejsce daje obserwujących — słabe miejsca usuwamy.

## Treści: 4 stałe serie (łączą social media z narzędziami na stronie)
1. **„Nabór tygodnia”** — LinkedIn + Facebook, co tydzień od grudnia do kwietnia. Jeden program z Mapy możliwości: kto składa, ile, do kiedy, link `/#mozliwosci`. Start: grudzień 2026 (zapowiedź naborów 2027 — „Moje Boisko” rusza 4 stycznia).
2. **„Przed i po”** — Instagram (karuzela / reels) + Facebook. Stary beton → nowe boisko. CTA: „Masz taki plac? Wyślij zdjęcie” → `/#zdjecie`.
3. **„Wzór tygodnia”** — Instagram. Projekt z Warsztatu albo Studio (za zgodą autora). CTA: „Zaprojektuj swój” → `/studio/`.
4. **„Z placu budowy”** — Instagram stories + LinkedIn. Montaż, ekipa, liczby (m², dni, kolor). Na LinkedIn wersja z opinią zamawiającego.

Rytm na start (realny dla jednej osoby): LinkedIn 2×/tydz., Instagram 3×/tydz. + stories przy montażach, Facebook 2×/tydz. (w tym udostępnienia z Instagrama). Jeden materiał = trzy wersje, nie trzy osobne prace.

## Ruch z social mediów na stronę (zawsze z UTM)
Każdy link w opisie profilu i w postach z UTM, żeby GA4 pokazało, który kanał daje leady (`gf_lead` ma `lead_source`):
- Instagram bio: `https://www.gamefields.eu/?utm_source=instagram&utm_medium=social&utm_campaign=bio#zdjecie`
- LinkedIn (strona firmy, przycisk „Odwiedź stronę”): `https://www.gamefields.eu/?utm_source=linkedin&utm_medium=social&utm_campaign=profil`
- Facebook (przycisk „Wyślij wiadomość”/„Więcej informacji”): `https://www.gamefields.eu/?utm_source=facebook&utm_medium=social&utm_campaign=profil#zdjecie`
- Posty: `utm_campaign` = nazwa serii (`nabor-tygodnia`, `przed-i-po`, `wzor-tygodnia`, `plac-budowy`).

## Opisy profili (do wklejenia)
- **Instagram:** „Boiska miejskie, które się wyróżniają ⚽ Projekt · nawierzchnia · grafika jako jedno. Masz plac? Wyślij zdjęcie ↓”
- **LinkedIn (slogan):** „Projektujemy i budujemy boiska miejskie dla gmin, szkół, Orlików i marek. Koncepcja, parametry do SWZ i dokumenty do wniosków o dofinansowanie.”
- **Facebook:** „Zamieniamy stare place w boiska, na których się gra. Pomagamy mieszkańcom, szkołom i gminom — także bez budżetu (budżet obywatelski, granty). Wyślij zdjęcie placu ↓”

## Pierwsze 30 dni
1. Tydzień 1: wdrożenie na stronie, opisy profili i linki z UTM; w GA4 oznaczyć zdarzenie wysłania formularza jako kluczowe.
2. Tydzień 2: na każdym kanale przypięty post „Masz plac? Wyślij zdjęcie — odpiszę w 1–2 dni robocze” (z najlepszym „przed i po”).
3. Tydzień 3: start serii „Nabór tygodnia” (LinkedIn + Facebook) — 1. odcinek: kalendarz naborów 2027.
4. Tydzień 4: przegląd GA4 — `gf_social` (które miejsca), ruch z social (UTM), `gf_lead` z social; decyzja, które serie zostają.

## Na później (wymaga decyzji)
- „Plac tygodnia” z nadesłanych zdjęć — potrzebna osobna zgoda na publikację zdjęcia w formularzu (dziś jej nie ma).
- Osadzony podgląd Instagrama na stronie — dopiero gdy profil ma regularne treści; wymaga zgody cookies (Complianz) i spowalnia stronę.
- Meta Pixel — przy pierwszej płatnej kampanii na Facebooku/Instagramie, przez Complianz.
