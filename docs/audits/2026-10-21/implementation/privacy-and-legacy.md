# Prywatność, infrastruktura i strony historyczne — odczyt i wdrożenie

Data: 21 października 2026 r. Zakres: WordPress REST API, bezpieczne odczyty WP-CLI/opcji i SELECT konfiguracji bez sekretów. Nie odczytywano haseł, kluczy, zawartości skrzynek ani danych zgłoszeń. Nie wykonywano audytu sieci w przeglądarce, dlatego konfiguracja nie jest dowodem faktycznego blokowania zasobów przed zgodą.

## Wdrożone

- Strona prywatności 4087 jest opublikowana pod https://www.gamefields.eu/polityka-prywatnosci/.
- Na podstawie aktualnej konfiguracji formularza Contact Form 7 ID3758 dodano jeden akapit: zapytanie trafia na `info@gamefields.eu`, a adres nadawcy służy do odpowiedzi. Zastosowano `content/search`, następnie `content/edit` match-once; odpowiedź `edited`, `replaced:1`. Odczyt po zmianie potwierdził obecność akapitu.
- Nie zmieniano praw, cookies, wtyczek, statusów stron ani ustawień zgód.

## Ustalone fakty i ograniczenia

| Obszar | Odczyt | Wniosek |
|---|---|---|
| Oficjalna opcja WP | `wp_page_for_privacy_policy=4087` | Prowadzący agent przypisał opublikowaną informację jako oficjalny dokument WordPress. Ponowny niezależny odczyt potwierdził4087. Stary szkic3 nie jest już wskazywany. |
| Formularz CF7 3758 | `_mail.active=true`, odbiorca `info@gamefields.eu`, nadawca `wordpress@gamefields.eu`, Reply-To `[your-email]`, brak załączników | Potwierdzony kierunek wiadomości. Adres nadawcy nie identyfikuje operatora usługi pocztowej. |
| Dodatkowe ustawienia CF7 | `_additional_settings` puste | Brak dodatkowych dyrektyw w tym polu; nie stanowi dowodu braku integracji przez hooki. |
| SMTP | Brak aktywnej wtyczki SMTP w inwentarzu; wyszukiwanie nazw opcji smtp nie wykazało konfiguracji SMTP | Operator i fizyczna lokalizacja poczty nieustalone. Nie odczytywano sekretów ani nie wysyłano testowej wiadomości. |
| Complianz | Wtyczka zgód aktywna; `cmplz_options={use_cdb_api:yes}`; onboarding terms/newsletter/plugins=false | Aktywna wtyczka nie oznacza ukończonej konfiguracji. |
| Banery Complianz | Tabela `cmplz_cookiebanners` istnieje; SELECT jawnych pól zwrócił0 wierszy | Brak zapisanej konfiguracji banera w tej tabeli. Nie potwierdzono alternatywnego mechanizmu zgód ani zachowania użytkownika. |
| Wykryte usługi | `cmplz_detected_stats=[]`, thirdparty services `[youtube]`, social media `[instagram]` | Zapis wykrycia, a nie kompletny pomiar sieci. Nie twierdzić, że serwis nie używa analityki. |
| Hosting | Używana platforma WordPress i zewnętrzne zasoby są potwierdzone treścią strony | Umowny operator hostingu WordPress, lokalizacja danych, logi i umowy powierzenia nieustalone z dostępnej konfiguracji. |
| DNS | Próba odczytu MX/NS/CNAME z lokalnego runtime zakończyła się ECONNREFUSED | Środowisko nie pozwoliło na odczyt; nie jest to diagnoza DNS domeny ani podstawy do wskazania dostawcy. |

Studio zapisuje lokalny szkic w `localStorage` pod `gamefields-studio-draft-v1`; ten fakt jest już opisany na stronie. Znaleziony kod `components/ui/sidebar.tsx` ustawia cookie stanu panelu, ale samo istnienie komponentu w kodzie nie dowodzi użycia go na aktywnej stronie — nie dodano go do publicznej tabeli cookies.

## Inwentarz starszych stron

Wszystkie poniższe strony pozostają opublikowane. Nie zostały usunięte ani przekierowane.

| ID | Adres lub slug | Potwierdzona treść / kategoria | Stan noindex sprawdzony bezpośrednio |
|---|---|---|---|
|2|/sample-page/|Standardowa angielska przykładowa treść WordPress, fikcyjny opis kuriera/aktora|Yoast meta=1|
|981|/placeholder/|Instrukcja demo Theme Settings|Yoast meta=1|
|980|/placeholder-portfolio/|Instrukcja archiwum portfolio z domeną yoursite.com|Yoast meta=1|
|393|/elements/|Pusty post_content, rodzic demonstracyjnych elementów|Yoast meta=1|
|441|/elements/google-maps/|Demonstracyjna mapa Zürich z iframe Google|Yoast meta=1|
|460|/elements/video-player/|Demonstracyjne URL Vimeo i YouTube|Yoast meta=1|
|339|/home-transparent-header/|Oferta zegara, obrazki `http://localhost/...`|Yoast meta=1|
|1065|/home-fullscreen-banner/|Oferta mebli Living Essentials|Yoast meta=1|
|327|/home-categories-grid/|Starsze prawdziwe kategorie usług/wynajmu Gamefields, również placeholder obrazka|Yoast meta=1|
|757|/gamefields-boiska-panna-i-street-football/|Starsza prawdziwa treść oferty boisk i link contact-form|Yoast meta=1|

Dodatkowy odczyt16 stron wykazał, że wszystkie mają już `_yoast_wpseo_meta-robots-noindex=1` i status publish. Nie było żadnej kwalifikującej się indeksowalnej strony do zmiany; nie wykonano niepotrzebnych zapisów.

| ID | Slug | Klasyfikacja po odczycie treści | Noindex |
|---|---|---|---|
|458|testimonials|Demo, angielska instrukcja i localhost/team-member.jpg|1|
|454|tabs-toggles|Demo, angielski opis i fikcyjne akapity|1|
|452|social-profiles|Demo, lista pustych profili href=#|1|
|450|posts|Demo, blog Leather Sleeves i localhost|1|
|446|headings-separators|Demo, instrukcja Google Font i fikcyjna treść|1|
|443|lightboxes|Demo, instrukcja i grafiki localhost|1|
|437|feature-boxes|Demo, fikcyjna treść Aesthetic/Banksy|1|
|435|progress-bars|Demo, fikcyjne wskaźniki Aesthetic/Banksy/Chillwave|1|
|433|buttons|Demo, przyciski Button with Text|1|
|429|banners|Demo, Modern Pendant Lighting/Chairs & Tables|1|
|427|accordions|Demo, angielska instrukcja i fikcyjne akapity|1|
|417|products|Demo listy produktów, Classic Chair na localhost|1|
|395|add-to-cart-button|Demo, instrukcja i obraz produktu localhost|1|
|403|product-categories|Prawdziwa starsza oferta nawierzchni Gamefields; NIE klasyfikować jako fikcyjne demo|1, zastane|
|431|banner-slider|Prawdziwe wpisy o infrastrukturze sportowej Gamefields; NIE klasyfikować jako fikcyjne demo|1, zastane|
|456|team|Prawdziwe dane zespołu Gamefields; NIE klasyfikować jako fikcyjne demo|1, zastane|

Łącznie sprawdzono26 wartości metadanych noindex (10+16), wszystkie1. To odczyt ustawienia Yoast, nie osobny pomiar meta robots w publicznym HTML. Zastanych oznaczeń prawdziwych treści nie zmieniano.

SELECT opublikowanych `page.post_content` zawierających `sample-page`, `/elements/` lub `placeholder-portfolio` zwrócił0 wyników. Odczyt elementów menu wskazujących ID dziesięciu sprawdzonych stron również zwrócił0. To nie wyklucza linków w Elementor `_elementor_data`, ustawieniach motywu, widgetach, innych typach postów ani linków zewnętrznych.

## Bezpieczne dalsze działania

1. Wykonane:4087 jest oficjalną stroną prywatności WordPress; odczyt potwierdzony. Nie publikować szablonu3.
2. Wykonane: odczytano pozostałe16 stron; wszystkie już noindex1. Zachować to ustawienie dla potwierdzonych demonstracji. Rzeczywisty HTML robots i sitemap wymagają oddzielnego sprawdzenia, jeżeli planowane są dalsze zmiany indeksowania.
3. Strony prawdziwej starszej oferty327/757 zachować do ustalenia docelowych przekierowań; nie traktować ich jak fikcyjnych szablonów mebli.
4. Ustalić administratora infrastruktury/hosting/pocztę na podstawie umów lub panelu dostawcy i wykonać pomiar żądań/cookies przed i po zgodzie. Dopiero wtedy skonfigurować Complianz i uzupełnić informacje o transferach. Nie ma podstaw do automatycznego wybrania modelu zgody, kategorii ani deklarowania braku transferów.

## Faktycznie nierozwiązane

Nazwy kontraktowych dostawców WordPress i poczty, okresy logów i backupów, lokalizacje przetwarzania, podstawa transferów, pełna tabela aktywnych cookies i weryfikacja blokowania przed zgodą. Brak tych faktów nie został zastąpiony domysłem. Publiczna informacja o prywatności uczciwie wskazuje zakres wymagający uzupełnienia.


## Checklista konfiguracji Complianz dla administratora

To lista konkretnych czynności i dowodów do zebrania, a nie deklaracja gotowości prawnej lub technicznej.

- [ ] Zidentyfikować w umowach/panelach rzeczywistych operatorów: WordPress, poczta info@gamefields.eu, Studio, CDN i osadzenia; zapisać regiony danych, podwykonawców i dokumenty powierzenia.
- [ ] Ustalić okresy retencji wiadomości, logów i backupów oraz możliwość usuwania; wskazać osobę odpowiedzialną za obsługę żądań.
- [ ] W czystym profilu przeglądarki zarejestrować przed zgodą żądania sieciowe, cookies i localStorage dla: homepage, katalogu, formularza, Studio, OS oraz stron z YouTube/Instagram/mapami. Nie używać wyłącznie automatycznego skanera jako dowodu.
- [ ] Ustalić dla każdej operacji dostawcę, nazwę klucza/cookie, cel, okres, stronę uruchamiającą i kategorię. Rozróżnić żądanie zasobu i zapis danych w urządzeniu.
- [ ] Dokończyć kreator Complianz na podstawie pomiaru. Obecnie tabela banerów jest pusta; samo aktywowanie wtyczki nie zapewnia obsługi zgód.
- [ ] Jeżeli występują opcjonalne operacje wymagające zgody, skonfigurować uprzednie blokowanie oraz równie łatwe przyciski akceptacji i odrzucenia. Nie traktować przewijania ani zamknięcia okna jako zgody.
- [ ] Zapewnić stale dostępne ponowne otwarcie preferencji i wycofanie zgody; po wycofaniu sprawdzić, że dalsze opcjonalne połączenia/zapisy ustają.
- [ ] Osobno sprawdzić osadzone Studio w jego własnej domenie — zgoda hosta WordPress nie jest automatycznie wspólna z obcą domeną.
- [ ] Przetestować odmowę, zgodę wybranych kategorii, pełną zgodę, wycofanie i powrót na stronę; mobile oraz klawiaturę; upewnić się, że formularz i żądane przez użytkownika funkcje pozostają dostępne.
- [ ] Uzupełnić informację o prywatności o zweryfikowanych operatorów i transfery oraz rzeczywiste zabezpieczenia; nie deklarować braku transferów tylko dlatego, że strona ma polską domenę.
- [ ] Zachować datowane wyniki pomiarów i konfiguracji, a po dodaniu osadzeń/analityki powtórzyć kontrolę.

Rodzic zadania poinformował o wdrożeniu lokalnych fontów i fasady Studio na homepage po pierwszym odczycie. Nie odczytywano ponownie strony3462 i nie modyfikowano jej; wcześniejszy opis zewnętrznych zasobów nie jest twierdzeniem, że każda strona nadal uruchamia Google Fonts lub iframe od razu.
