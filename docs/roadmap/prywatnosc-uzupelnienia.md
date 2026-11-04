# Polityka prywatności: uzupełnienia (projekt do przeglądu prawnego)

Strona: https://www.gamefields.eu/polityka-prywatnosci/ (WordPress, ID 4087). Źródło obecnej treści: `integrations/wordpress/audit-2026-10-21/privacy-information.html`.

Poniższe akapity uzupełniają obecną informację o funkcje dodane po 21.10 i planowane w roadmapie. To projekt, nie porada prawna. Przed publikacją przejrzyj go z prawnikiem i uzupełnij pola w nawiasach kwadratowych. Każdy akapit publikujemy dopiero wtedy, gdy opisana funkcja działa na stronie.

## 1. Dane administratora (zastępuje pierwszy akapit sekcji „Kto odpowiada za dane”)

> Administratorem danych jest [pełna nazwa firmy], [adres], NIP [numer], REGON [numer]. W sprawach prywatności napisz na [adres e-mail w domenie gamefields.eu] lub zadzwoń pod 794 911 746.

Publikujemy po decyzji właściciela (roadmapa, Decyzje: „Dane firmy, administrator danych”).

## 2. Pomiar odwiedzin: Google Analytics 4 (nowa sekcja, po włączeniu pomiaru)

> **Pomiar odwiedzin**
>
> Za Twoją zgodą korzystamy z Google Analytics 4, żeby wiedzieć, które części strony i Studio pomagają w projektowaniu boiska. Bez zgody pomiar jest wyłączony, a do Google trafiają wyłącznie anonimowe sygnały bez plików cookie (Google Consent Mode).
>
> Po wyrażeniu zgody Google Analytics zapisuje pliki cookie `_ga` i `_ga_*` i zbiera: odwiedzone strony, czas wizyty, typ urządzenia i przeglądarki, przybliżoną lokalizację (kraj, miasto) oraz źródło wejścia. Nie łączymy tych danych z treścią zapytań.
>
> Podstawą jest Twoja zgoda (art. 6 ust. 1 lit. a RODO). Możesz ją wycofać w każdej chwili przyciskiem „Zarządzaj zgodą” [skrót Complianz, np. `[cmplz-manage-consent]`; sprawdzić w ustawieniach wtyczki]. Wycofanie nie wpływa na zgodność z prawem pomiaru sprzed wycofania.
>
> Dostawcą usługi jest Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irlandia. Dane mogą być przekazywane do Google LLC w USA. Google LLC uczestniczy w programie EU-U.S. Data Privacy Framework, na podstawie decyzji Komisji Europejskiej stwierdzającej odpowiedni stopień ochrony. Dane w Google Analytics przechowujemy 14 miesięcy.

## 3. Warsztat: publiczne projekty (nowa podsekcja w „Jak Studio zapisuje projekt”)

> Gdy wybierzesz „Zapisz dla innych”, układ, wzór i kolory Twojego projektu zostaną opublikowane w galerii Warsztatu na gamefields.eu. Przed publikacją usuwamy z projektu nazwy, napisy, logo, obiekty i wyceny. W galerii widać datę publikacji, bez Twoich danych.
>
> Projekt jest przechowywany na serwerach Cloudflare, Inc. [region przechowywania danych D1, do potwierdzenia]. Podstawą publikacji jest Twoja zgoda wyrażona tym przyciskiem (art. 6 ust. 1 lit. a RODO). Aby usunąć projekt z galerii, [opis: przycisk wycofania w Studio albo wiadomość na adres administratora].

Do potwierdzenia przed publikacją: czy obecna wersja Warsztatu zapisuje cokolwiek, co pozwala powiązać projekt z osobą (adres IP, identyfikator przeglądarki).

## 4. Zamówienia koszulek (nowa sekcja, po starcie modułu Koszulki)

> **Zapytanie o koszulki**
>
> Do wyceny koszulek przekazujesz nam projekt koszulki, nazwiska, numery i rozmiary zawodników oraz plik herbu lub logo. Używamy ich wyłącznie do przygotowania wyceny i, po zamówieniu, do produkcji (art. 6 ust. 1 lit. b i f RODO).
>
> Przesyłając nazwiska zawodników, potwierdzasz, że możesz je nam przekazać (np. jako klub, szkoła lub organizator drużyny). Dla zawodników niepełnoletnich nazwisko przekazuje rodzic, opiekun albo klub działający w ich imieniu.
>
> Projekt herbu lub logo służy tylko do druku Twojego zamówienia. Listę zawodników usuwamy [okres, np. 12 miesięcy] po realizacji zamówienia, chyba że zamówisz ponownie.

## 5. Konto PLAY (nowa sekcja, przy starcie PLAY na domenie)

> [Do napisania przy starcie PLAY: dane konta (e-mail, pseudonim), wyniki meczów i rankingi widoczne dla innych graczy, lokalizacja boiska, okres przechowywania, usunięcie konta. Źródło techniczne: `docs/PLAY_RELEASE.md`.]

## 6. Dostawcy usług (zastępuje zdanie o „szczegółowym zestawieniu dostawców”)

| Usługa | Dostawca | Dane | Lokalizacja |
| --- | --- | --- | --- |
| Hosting strony WordPress | [nazwa] | Treść formularzy, logi serwera | [kraj] |
| Poczta info@gamefields.eu | [nazwa] | Wiadomości z formularzy | [kraj] |
| Studio, Warsztat, PLAY | Cloudflare, Inc. | Projekty Warsztatu, konta PLAY | [region] |
| Pomiar odwiedzin | Google Ireland Limited | Dane z punktu 2 | UE, USA (Data Privacy Framework) |
| Zgody | Complianz (wtyczka na serwerze strony) | Zapis wyboru zgody w przeglądarce | Serwer strony |

Uzupełnienie tabeli wymaga danych z umów hostingu i poczty. Audyt z 21.10 nie mógł ich ustalić z konfiguracji.
