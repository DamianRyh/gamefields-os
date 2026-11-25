# Lista zadań gamefields.eu

Bieżąca lista. Zasada: najpierw repozytorium (PR, testy), potem strona (wdrożenie, kontrola na żywo).
Zasada właściciela (23.11.2026): każdą zmianę najpierw pokazać w podglądzie w prawdziwym motywie (`python3 tools/preview/live_shell.py <adres strony> <blok.html> <podglad.html>`), dopiero potem paczka do wdrożenia albo wdrożenie samodzielne.
Polecenia do wdrożenia na stronie czekają w kolejce: `docs/roadmap/POLECENIA-DLA-CHATGPT.md`.
Statusy: ✅ zrobione · 🔄 w toku · ⏳ czeka na wdrożenie na stronie · ❓ czeka na decyzję właściciela · ⬜ do zrobienia

Ostatnia aktualizacja: 25.11.2026

## Teraz

| # | Zadanie | Repozytorium | Strona | Status |
| --- | --- | --- | --- | --- |
| 1 | Przejrzystość cenowa w Studio: cena samej konstrukcji (bez podłoża), karta konstrukcji PDF z modelem 3D, ceny zgodne ze stroną | ✅ PR #80, #86, #88 | ✅ Studio, sprawdzone 13.11: ceny 8 modeli = strona, Panna Play 40 000 zł netto w przycisku, podsumowaniu i karcie | ✅ |
| 10 | Studio: nawierzchnia betonowa bez wykończenia jako osobna cena obok konstrukcji (cennik 13.11, 283 zł/m²), domyślnie wliczona, do odznaczenia | ✅ PR #90, `lib/concrete-base.ts`, `offer/concrete-base.json` | Studio w Sites (polecenie 7) | ✅ sprawdzone 16.11 |
| 11 | Studio: malowanie nawierzchni, 4 warianty (78 / 100 / 150 / 183 zł/m²), wariant dobrany do projektu | ✅ PR #91, `lib/surface-finish.ts`, `offer/surface-finish.json` | Studio w Sites (polecenie 7 obejmuje oba) | ⏳ |
| 12 | Studio: nawierzchnia PU/EPDM, 3 warianty (250 / 317 / 400 zł/m²) | ✅ PR #92, `offer/surface-finish.json` | Studio w Sites (polecenie 7) | ⏳ ceny orientacyjne, do potwierdzenia ofertami wykonawców przed publikacją na stronie |
| 13 | Studio: płytki sportowe, 3 warianty (275 / 325 / 400 zł/m²); liczba płytek tylko wewnętrznie | ✅ PR #93, `offer/surface-finish.json` | Studio w Sites (polecenie 7) | ✅ sprawdzone 16.11 |
| 14 | Studio: sztuczna trawa, 3 warianty (167 / 225 / 292 zł/m²) | ✅ PR #94, `offer/surface-finish.json` | Studio w Sites (polecenie 7) | ✅ sprawdzone 16.11 |
| 14a | Studio: nawierzchnia akrylowa Hard Court jako osobny materiał, 3 warianty (200 / 267 / 342 zł/m²) | ✅ PR #95, `offer/surface-finish.json` | Studio w Sites (polecenie 7) | ✅ sprawdzone 16.11 |
| 14b | Studio: płyty gumowe SBR / EPDM jako osobny materiał, 3 warianty (342 / 400 / 492 zł/m²) | ✅ PR #96, `offer/surface-finish.json` | Studio w Sites (polecenie 7) | ✅ sprawdzone 16.11 |
| 14c | Studio: maty / role gumowe jako osobny materiał, 3 warianty (242 / 317 / 425 zł/m²) | ✅ PR #97, `offer/surface-finish.json` | Studio w Sites (polecenie 7) | ✅ sprawdzone 16.11 |
| 14d | Studio: jeden metraż wykończeń (konstrukcja +10%), nowe nazwy materiałów, poprawki czytelności (etap 1) | ✅ PR #98 | Studio w Sites (polecenie 7) | ✅ sprawdzone 16.11 |
| 14e | Studio etap 2: lista materiałów, ceny na kartach modeli, beton też +10% | ✅ PR #99 | Studio w Sites (polecenie 7) | ✅ sprawdzone 16.11 |
| 14f | Studio etap 3: porównanie wykończeń w podsumowaniu, ilustracje akrylu, płyt i mat | ✅ PR #100 | Studio w Sites (polecenie 7) | ✅ sprawdzone 16.11 |
| 14h | Karta projektu PDF = całe zamówienie; wybór „Sama konstrukcja” | ✅ PR #101 | Studio w Sites (polecenie 7) | ✅ sprawdzone 16.11 |
| 14i | Wycena samej nawierzchni (bez konstrukcji) z tych samych cenników | ✅ PR #102 | Studio w Sites (polecenie 7) | ✅ sprawdzone 16.11 |
| 14j | Nowy produkt: maty treningowe (bez montażu, wysyłka; guma 167/233/333 + nadruk 78 zł/m²; koszyk dla formatów; przycinanie ćwiczeń) | ✅ PR #103 | Studio w Sites (polecenie 7) | ✅ sprawdzone 16.11 |
| 14k | Maty: produkt WooCommerce, strona /mata-treningowa/, endpoint sklepu w motywie | ✅ repo: `pages/maty-2026-11/`, `offer/mat-product.json`, `theme/.../inc/shop.php` | polecenie 8 | ✖ wycofane (16.11): mata tylko jako wykończenie w Studio; kod produktu uśpiony |
| 17 | Strona główna: sekcja „Dla gmin, szkół i Orlików” (gwarancja 12 mies. + opieka, Orlik 2012, dokumenty producentów, normy, Kraków od planu do parku, miasta), ceny kompletu z nawierzchnią, tabela nawierzchni za m², 4 zdjęcia z boisk | ✅ PR (ten) | polecenie 9 | ✅ sprawdzone 16.11 |
| 17a | Strona główna: blok „Autor studia” (zdjęcie, bio, cytat „Zaczynam od miejsca, kończę na pierwszym meczu”, 6 faktów) | ✅ PR (ten) | polecenie 10 | ✅ sprawdzone 16.11 |
| 18 | Logo miast (Warszawa, ZZM, Kraków, Grodzisk, Kutno, Łódź): strona główna i Realizacje dla miast | ✅ PR #108 | polecenie 11 | ✅ sprawdzone 16.11 |
| 18a | Certyfikaty producentów do pobrania | ⬜ | | ❓ pliki od właściciela |
| 19 | Strona główna: 22 bloki zamiast jednego + odświeżony wygląd nowych sekcji (karty cen, przewijane rzędy na telefonie, lżejsze fakty) | ✅ PR #109 | polecenie 12 | ✅ sprawdzone 16.11 |
| 20 | Strona główna wg Baymard: „Ceny” w menu (motyw 1.0.28), ceny „od” na kafelkach boisk, realizacje zaraz po cenach, dodatki niżej, ceny na telefonie w pionowej liście, „co zawiera cena” | ✅ PR (ten) | polecenie 13 | ✅ sprawdzone 23.11 („Ceny” w menu, „Co zawiera cena”) |
| 21 | Sklep = Studio: 8 modeli i 8 nawierzchni w cenach ze Studia, stare produkty ukryte z przekierowaniem 301, plakat poza listą (motyw 1.0.29) | ✅ PR (ten) | polecenie 14 | ✅ zsynchronizowane 16.11 (16 produktów) |
| 22 | Sklep jako showroom: scena z 8 boiskami (3D dla Play/Court/Ring/Octa), nawierzchnie z teksturami i kalkulatorem dla wybranego boiska, „Jak zamówić” (motyw 1.0.30) | ✅ PR (ten) | polecenie 15 | ✅ zastąpione przez 1.0.31–1.0.35 na żywo |
| 23 | Sklep: tekstury betonu i malowania ze zdjęcia CC0 (Poly Haven), zakładka „Wiedza o produkcie”, opinie przy produktach wyłączone (motyw 1.0.31) | ✅ PR (ten) | DLA-CHATGPT-sklep-1.0.31.txt | ✅ motyw 1.0.31 wgrany 16.11 |
| 24 | Baza wiedzy od nowa: /baza-wiedzy/ i 5 poradników w stylu strony, z cenami Gamefields, Studio, gwarancją; cała dotychczasowa treść zachowana | ✅ PR (ten) | DLA-CHATGPT-baza-wiedzy.txt | ✅ sprawdzone 23.11: na żywo = repozytorium (karta poradnika: „od 36 000 zł” przeniesione ze strony do repo) |
| 25 | Realizacje od nowa: liczby, logo miast, 5 historii (z Krakowem) z cytatami i linkiem do modelu z ceną, pas opinii, galeria eventów z markami | ✅ PR (ten) | DLA-CHATGPT-realizacje.txt | ✅ sprawdzone 23.11: na żywo = repozytorium |
| 26 | Strona główna „Poczuj różnicę.”: wybór 8 nawierzchni z przybliżaną teksturą, ceną za m², cechami i kosztem dla wybranego boiska | ✅ PR (ten) | DLA-CHATGPT-nawierzchnie-wybor.txt (2 bloki) | ✅ sprawdzone 23.11 |
| 27 | Kontakt od nowa: 4 ścieżki („Zgłaszam miejsce” dla młodzieży i mieszkańców bez budżetu, z linkiem do projektu i opieką dla osób poniżej 16 lat), pytania pod ścieżkę w mailu, „co dalej”, FAQ; formularz CF7 3758 bez zmian | ✅ PR (ten) | DLA-CHATGPT-kontakt.txt | ✅ sprawdzone 23.11: na żywo = repozytorium (formularz CF7 3758) |
| 28 | Strona główna: „Z boiska.” jako 4 karty realizacji dla klienta (typ klienta, model z ceną, link do historii) bez zdjęć z turnieju i urodzin; „Stary beton” z osią kroków i paskiem cen malowania | ✅ PR (ten) | DLA-CHATGPT-z-boiska.txt (4 bloki) | ✅ sprawdzone 23.11 |
| 29 | Studio: wzory nawierzchni Masters II — 8 nowych kierunków × 12 wariantów (Vasarely, Stella, De Stijl, Martens, Ndebele, Aicher, Burle Marx ×2), 8 palet, 8 projektów; zasady malowalności (min. 20 cm, maks. 5 farb, symetria) | ✅ PR (ten) | DLA-CHATGPT-studio-masters-2.txt | ⏳ |
| 30 | Plakaty bez tekstu: tylko „Pełny spad”, bez zakładek Tekst/Układ i wyboru papieru (motyw 1.0.32, bloki plakaty i skrypty, opis produktu 4393) | ✅ PR (ten) | DLA-CHATGPT-plakaty-bez-tekstu.txt | ✅ motyw 1.0.35 na żywo |
| 31 | Zestawy na stronie głównej jak w Studio 3D: rendery konstrukcja + nawierzchnia Masters II ze Studia, poprawne linki do Studia (wzór, paleta, kolory), cena konstrukcji (motyw 1.0.33) | ✅ PR (ten) | DLA-CHATGPT-zestawy-studio.txt | ✅ motyw 1.0.35 na żywo, rendery zestawów (kits/) działają |
| 32 | Motyw 1.0.35 = 1.0.33 + zmiany plakatu z 1.0.34 (ChatGPT, live): bez koła w środku dla Fade/Rings, „podgląd poglądowy”; podgląd plakatu ma stały rozmiar przy zmianie formatu i opcji. Zastępuje 1.0.33 (niewdrożony) | ✅ PR (ten) | DLA-CHATGPT-plakaty-zestawy-1.0.35.txt | ✅ motyw 1.0.35 na żywo (sprawdzone 23.11) |
| 33 | Podstrony od nowa (UX/UI, spójne z Realizacjami i Bazą wiedzy): /budowa-boisk-sportowych/ — 4 ścieżki startu, ceny 8 modeli, kalkulator budżetu (model lub własny metraż, płyta, 8 nawierzchni z wariantami), 7 etapów, nawierzchnie, gminy i szkoły, realizacje, „Co mi wysłać?”, 9 pytań z FAQPage, poradniki; poprawione martwe linki „#” | ✅ PR #125, `pages/budowa-2026-11/` | DLA-CHATGPT-budowa-boisk.txt | ✅ sprawdzone 23.11: na żywo = repozytorium |
| 34 | /renowacja-boisk/ od nowa: suwak przed/po (Pole Mokotowskie), 6 objawów z rozwiązaniem i ceną, renowacja czy nowe, 5 etapów, 4 warianty malowania, 7 nawierzchni na stary plac, kalkulator renowacji (metraż, malowanie lub nawierzchnia, arena), wzory ze Studia, gminy, co sfotografować, 9 pytań. Wspólny styl i dane: `pages/gfb_common.py` | ✅ PR #125, `pages/renowacja-2026-11/` | DLA-CHATGPT-renowacja-boisk.txt | ✅ sprawdzone 23.11: na żywo = repozytorium |
| 35 | /nawierzchnie-sportowe/ od nowa: siatka 8 tekstur, dobór według zastosowania, tabela porównawcza, porównanie kosztu na własnym metrażu (paski Standard–Premium, opcjonalnie z płytą), 8 kart z wariantami, „W cenie” i „Osobno”, normy, próbki pocztą, 8 pytań | ✅ PR #125, `pages/nawierzchnie-2026-11/` | DLA-CHATGPT-nawierzchnie-sportowe.txt | ✅ sprawdzone 23.11: na żywo = repozytorium |
| 36 | /malowanie-boisk/ („Malowanie i grafika”) od nowa: court design zamiast powtórki renowacji — 3 zakresy (odświeżenie, court design, branding), 4 warianty z kosztem dla wpisanego metrażu, 5 zestawów ze Studia z linkiem do tego samego wzoru, Masters II (8 kierunków), zasady malowalności i kolory linii, grafika poza boiskiem (Sztuka z gry, plakaty, branding), 5 etapów, 8 pytań | ✅ PR #125 + uzupełnienie grafiki, `pages/malowanie-2026-11/` | DLA-CHATGPT-malowanie-boisk.txt | ✅ sprawdzone 23.11: na żywo = repozytorium |
| 37 | /projektowanie-boisk/ od nowa: 3 drogi (Studio 3D, koncepcja miejsca, koncepcja z dokumentami dla gmin), 4 narzędzia online, co zawiera projekt, 4 koncepcje (Pałac Kultury, Most Łazienkowski, Pole Mokotowskie, Freestival) z etykietą „wizualizacja”, Kraków od planu do parku, 5 etapów, autor, 8 pytań | ✅ PR (ten), `pages/projektowanie-2026-11/` | DLA-CHATGPT-projektowanie-boisk.txt | ✅ sprawdzone 23.11: na żywo = repozytorium |
| 38 | /boiska-street-football/ („Boiska panna i street football”) od nowa: ceny zamiast „wycena indywidualna”, filtr (kształt, bandy, metraż), 8 kart z renderem, wymiarami, cenami, Studio, sklepem i modelem 3D, tabela, dobór do metrażu, panna vs 3 na 3, co w cenie, 8 pytań | ✅ PR #126, `pages/boiska-2026-11/` | DLA-CHATGPT-boiska-street-football.txt | ✅ sprawdzone 23.11: na żywo = repozytorium |
| 38a | Stopka motywu: link „Boiska panna i street football” z /#boiska na /boiska-street-football/ | ✅ motyw 1.0.36 | DLA-CHATGPT-naglowek-1.0.36.txt | ⏳ |
| 45 | Jeden nagłówek na całej witrynie (motyw 1.0.36): ten sam na stronie głównej i podstronach, „Wyślij zdjęcie placu” obok „Studio 3D”, bez łamania napisów (opis znika < 1360 px, krótszy przycisk < 1180 px, menu mobilne od 900 px), podświetlanie sekcji na stronie głównej; stary nagłówek bloku strony głównej ukryty | ✅ PR (ten), `theme/gamefields/header.php`, `gft.css`, `gft.js`, `gf-home.js` | DLA-CHATGPT-naglowek-1.0.36.txt (ZIP od właściciela) | ⏳ |
| 46 | Strona główna: „Udostępnij” w banerze (motyw 1.0.37): grafika Stories/Post (Clean, Street) albo film 6 s z modelu 3D banera w wybranych kolorach, te same szablony co Studio; link /?boisko=&panele=&rama= odtwarza konfigurację; link do Studia dla Play, Court, Octa | ✅ PR (ten), `assets/js/home/gf-share.js`, `gf-share-core.js` (z `lib/share-media`), `gf-home.js` | DLA-CHATGPT-udostepnij-baner-1.0.37.txt (ZIP + znacznik `gf-home.js?v=`) | ⏳ |
| 47 | Projekt miesiąca: konkurs w Warsztacie (temat i termin, pseudonim, zgoda na social media, ♥ Podoba mi się, „wersje innych”, finaliści i zwycięzca wybierani przez właściciela), panel /workshop-admin w Studio, sekcja Warsztat na stronie głównej, regulamin | ✅ PR (ten): Studio `lib/workshop-contest.ts`, `app/api/workshop/*`, migracja 0014; strona `bloki/18-warsztat.html`, `pages/regulamin-2026-11/` | DLA-CODEX-projekt-miesiaca.md (Studio najpierw), potem DLA-CHATGPT-projekt-miesiaca.txt | ⏳ |
| 48 | Strony kampanii do budżetu obywatelskiego: w Studio zakładka „Kampania BO” tworzy stronę „Boisko dla osiedla…” (model 3D, „Popieram” z licznikiem, oficjalne głosowanie z terminem, pakiet grafik i filmu, karta techniczna z PDF, kontakt dla urzędu), link gamefields.eu/studio/?kampania=…; e-mail tylko przy prośbie o pomoc we wniosku; lista leadów w /workshop-admin | ✅ PR (ten): `app/kampania/`, `app/api/campaign/*`, `components/campaign-create.tsx`, migracja 0015 | DLA-CODEX-kampania-bo.md (Studio), potem DLA-CHATGPT-kampania-bo.txt (/studio/ przekazuje `kampania`, link z /dla-miast/, polityka prywatności) | ⏳ |
| 49 | „Twoja ścieżka” w Studio: zwijana lista 8 kroków (model, nawierzchnia, kolory, zapis, Warsztat, udostępnienie, karta PDF, finansowanie) i podpowiedzi przewodników (Ola, Kuba, Alex, Marek) w kluczowych momentach; najwyżej jedna na 90 s, wyciszenie po 2 odrzuceniach, zdarzenia gf_journey w dataLayer | ✅ PR (ten): `lib/journey.ts`, `components/journey-guide.tsx`, `app/journey-guide.css` + drobne zmiany w 6 komponentach | DLA-CODEX-sciezka.md (tylko Studio) | ⏳ |
| 50 | Kampania BO: kreator w 4 krokach z podglądem strony na żywo zamiast długiego formularza (podpowiedzi tytułu i opisu, wybór etapu wniosku, podsumowanie, szkic, ekran „co dalej”) | ✅ PR (ten): `components/campaign-create.tsx`, `app/campaign-create.css` | DLA-CODEX-sciezka.md (dodatek) | ⏳ |
| 51 | Kampania BO jako osobna usługa: strona /budzet-obywatelski/ (WordPress, SEO, opiekun Damian Gawrych z Grodziska Mazowieckiego, kroki, dokumenty, FAQ) i kreator /kampania/nowa w aplikacji Studio (wybór projektu ze Studio albo z Warsztatu, podgląd 3D); w Studio zamiast zakładki blok w Podsumowaniu | ✅ PR (ten): `app/kampania/nowa/*`, `lib/campaign-handoff.ts`; `pages/budzet-obywatelski-2026-11/` | DLA-CODEX-kampania-nowa.md, potem DLA-CHATGPT-budzet-obywatelski.txt | ⏳ |
| 39 | /boiska-dla-szkol/ („Szkoły i gminy”) od nowa: licznik do naborów 2027 i terminy, 4 sposoby (przy szkole, modernizacja Orlika, wielofunkcyjne, panna w sali), 3 polecane modele z cenami, 6 źródeł finansowania i wymagania komisji (edycja 2026), część techniczna wniosku, opinie OSiR i Urzędu Miasta Kutno, logo miast, plan 2027, 9 pytań | ✅ PR #127, `pages/szkoly-2026-11/` | DLA-CHATGPT-boiska-dla-szkol.txt | ✅ sprawdzone 23.11: na żywo = repozytorium |
| 40 | /dla-miast/ („Miasta”) od nowa: 4 problemy miejsca z rozwiązaniem i ceną, dobór do metrażu (interaktywny), argumenty zamawiających, 4 realizacje jako zadanie/rozwiązanie/efekt z cytatami, logo miast, zestaw „Miasto” do budżetu obywatelskiego, koncepcje dla Warszawy, otwarcie i aktywacja, 6 etapów, 8 pytań | ✅ PR #127, `pages/miasta-2026-11/` | DLA-CHATGPT-dla-miast.txt | ✅ sprawdzone 23.11: na żywo = repozytorium |
| 41 | /boiska-dla-deweloperow/ („Deweloperzy i osiedla”) od nowa: 4 wartości, tabela 8 modeli do masterplanu z cenami, zestaw „Osiedle”, design zgodny z architekturą (galeria zestawów do Studia), co sprawdzam w koncepcji (sąsiedztwo, panele, format), materiały do sprzedaży, 5 etapów, 8 pytań | ✅ PR #127, `pages/deweloperzy-2026-11/` | DLA-CHATGPT-boiska-dla-deweloperow.txt | ✅ sprawdzone 23.11: na żywo = repozytorium |
| 42 | /boiska-dla-klubow/ („Kluby i akademie”) od nowa: 3 strefy (technika 1 na 1, 3 na 3, modernizacja), 3 modele z cenami, zestaw „Klub”, 4 nawierzchnie z kosztem dla Cage 180, karta do rozmowy ze sponsorem (bez obietnic dotacji), Wake For Friends z cytatem, autor jako założyciel Warsaw FC, 3 kroki, 8 pytań | ✅ PR #128, `pages/kluby-2026-11/` | DLA-CHATGPT-boiska-dla-klubow.txt | ✅ sprawdzone 23.11: na żywo = repozytorium |
| 43 | /aktywacje-sportowe-dla-marek/ („Marki i agencje”) od nowa: marki i eventy (Head & Shoulders, UEFA Champions League, Legia, MŚ 2017, Superball) z galerią, 4 formaty z cenami, zestaw „Marka”, gdzie marka gra, zakres w 6 krokach, autor jako organizator, brief, 8 pytań | ✅ PR #128, `pages/marki-2026-11/` | DLA-CHATGPT-aktywacje-dla-marek.txt | ✅ sprawdzone 23.11: na żywo = repozytorium |
| 44 | /wynajem-boisk-mobilnych/ („Eventy i wynajem”) od nowa: 3 formaty, gdzie stała arena (hala, plener, Złote Tarasy, Gdańsk), wynajem czy zakup (od 27 000 zł), zakres w 6 krokach, pełna produkcja eventu ze zdjęciami (PGE Narodowy, podium, One vs One, Taras), 5 etapów, co wysłać do wyceny, 8 pytań | ✅ PR #128, `pages/wynajem-2026-11/` | DLA-CHATGPT-wynajem-boisk-mobilnych.txt | ⏳ |
| 14g | Prawdziwe zdjęcia materiałów w miejsce ilustracji | ⬜ | | ❓ zdjęcia od właściciela |
| 15 | Linie sportowe na EPDM (osobna pozycja) | ⬜ | | ❓ czekam na cenę |
| 16 | Strona: ceny nawierzchni obok cen konstrukcji w „Ile kosztuje arena?”: na każdej karcie „Z nawierzchnią od” (beton + malowanie), rozwijana tabela „Nawierzchnie: ceny za m²” (beton i 7 wykończeń, Standard–Premium) | ✅ PR #104, #109 (`prices_html`, `surfaces_html` w `homepage/studio-2026-11/build.py`) | ✅ sprawdzone 23.11: blok „ceny” na żywo = repozytorium | ✅ |
| 2 | Ceny konstrukcji „od” na stronie głównej i w FAQ (tabela właściciela 13.11) | ✅ PR #84, `offer/price-from.json` | ✅ strona główna, sprawdzone 13.11 | ✅ |
| 3 | Polityka prywatności: przycisk zgody i pierwszy akapit | kolejka, polecenie 1 | strona 4087 | ✅ sprawdzone 13.11 |
| 4 | Strony autentyczności: Damian Gawrych, Jak powstaje arena, Koncepcje, Sztuka z gry | ✅ PR #79 | ✅ wszystkie 4 strony, sprawdzone 13.11 | ✅ |
| 5 | Zdjęcia na O nas, Eventy, Szkoły, Realizacje, link „Kim jestem” na stronie głównej | ✅ PR #79 | ✅ sprawdzone 13.11 | ✅ |
| 6 | Dofinansowanie boisk (programy 2027, pomoc we wniosku) i Realizacje dla miast | ✅ PR #81 | ✅ obie strony i linki, sprawdzone 13.11 | ✅ |
| 7 | Liczby do case studies: frekwencja, trwałość, koszty utrzymania, zdjęcia „przed” | `integrations/wordpress/pages/samorzady-2026-11/ANKIETA-CASE-STUDY.md` | po odpowiedziach zamawiających | ❓ wysłać ankietę |
| 9 | Obrazy przed/po (Pole Mokotowskie) i zdjęcie placu z mediów WordPress zamiast jsDelivr: strona główna, /koncepcje/, /baza-wiedzy/ i 3 poradniki | ✅ PR (ten): `MEDIA` w `homepage/studio-2026-11/build.py` (build blokuje adresy CDN), `UP` w `autentycznosc-2026-11` i `wiedza-2026-11` | DLA-CHATGPT-media-pole-mokotowskie.txt (wgranie 5 plików + Znajdź i zamień na 6 stronach) | ✅ sprawdzone 23.11: przed/po z /wp-content/uploads/2026/11/, brak jsDelivr |
| 8 | Aktualizacja terminów naborów po ogłoszeniu regulaminów MSiT 2027 | `samorzady-2026-11/build.py` | strona dofinansowania | ⬜ od 4.01.2027 |

## Zrobione

| Zadanie | Gdzie |
| --- | --- |
| Sekcja „Stary beton. Nowe boisko.” na stronie głównej | PR #76, strona ✅ (sprawdzone 11.11) |
| Martwe obrazy nagłówków na 6 podstronach | PR #78, strona ✅ (sprawdzone 11.11) |
| Sekcja „Pomiar odwiedzin” w polityce prywatności | strona ✅ z błędem przycisku (pkt 3) |
| Audyt 50 podstron: linki, H1, opisy, telefon | 11.11, wynik w PR #78 |

## Czeka na właściciela

- ❓ Projekt miesiąca: dane firmy do regulaminu (te same co do polityki prywatności), tematy kolejnych miesięcy (`THEMES` w `lib/workshop-contest.ts`, przygotowane: grudzień „Boisko pod blokiem”, styczeń „Barwy Twojego klubu”), klucz panelu WORKSHOP_ADMIN_KEY od Codexa.

- ❓ Arena mobilna eventowa: na żywo poradnik /ile-kosztuje-budowa-boiska-sportowego/ pisze „wycena indywidualna” (zmiana na stronie 23.11 rano, poza repozytorium), a cennik `offer/price-from.json` i strony Boiska, Kluby, Marki oraz nowa Eventy i wynajem (zad. 44) podają „od 27 000 zł netto”. Która wersja obowiązuje? Repozytorium zostaje przy 27 000 zł do decyzji.

- ❓ Pytania o fakty do stron autentyczności: `integrations/wordpress/pages/autentycznosc-2026-11/PYTANIA.md` (Jaktorów, technika grafik, Alternative Soccer, akcja charytatywna).
- ❓ Dane firmy do polityki prywatności (nazwa, adres, NIP): `docs/roadmap/prywatnosc-uzupelnienia.md`.
- ❓ Usunięcie niedziałającego hasła WordPress z ustawień sesji (Network secrets).
- ❓ Scalenie otwartych PR: #78 (instrukcje wdrożenia), #77 (zastąpiony przez #78, do zamknięcia), #56 (kontrola tagu Google).

## Później (roadmapa)

- ⬜ `offer/price-ranges.json` jest nieaktualny (widełki z PR #80); ceny nawierzchni na stronie są już z `surface-finish.json` (zad. 16).
- ⚠ Blok „naglowek” strony głównej na żywo jest nowszy niż repozytorium. Od motywu 1.0.36 jego nagłówek (#gfs-nav) jest ukryty; po sprawdzeniu 1.0.36 można usunąć z bloku sam element <header> (reszta bloku zostaje).
- ❓ Studio na telefonie: przycisk Podsumowanie nie pokazuje ceny (ukryta w `studio-skin-2026-11.css`, oszczędność miejsca). Cena jest w podsumowaniu. Pokazać ją też w przycisku?
- ❓ Panna Ring nie ma jej w wyborze modelu w Studio (7 modeli), a jest w cenniku strony (40 000 zł). Dodać czy tak ma zostać?
- ❓ Kafelek „Boiska” w Studio pisze „Wycena indywidualna”, choć ceny konstrukcji są już podane: zmienić na „od 27 tys. zł netto”?

- ⬜ /play zwraca 404 (bramka PLAY niezainstalowana).
- ⬜ Studio: moduł koszulek (ukryty na start).
- ⬜ Poradniki SEO (budżet obywatelski: szkic gotowy).
