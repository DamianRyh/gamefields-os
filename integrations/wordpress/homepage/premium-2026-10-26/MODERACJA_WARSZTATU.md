# Warsztat Gamefields — struktura i publikacja

## Przepływ

1. Użytkownik projektuje w Studio i wybiera **Pobierz projekt**. Zachowuje własny plik JSON oraz wykonuje podgląd JPG/PNG/WebP.
2. Na homepage otwiera **Zgłoś do Warsztatu**. Formularz CF7 **4159** wymaga nazwy, prywatnego e-maila, pliku JSON/TXT do 2 MB, podglądu do 2 MB i osobnej zgody na publiczną publikację. Pseudonim oraz inspiracja są opcjonalne.
3. Zgłoszenie z plikami trafia na istniejący adres `info@gamefields.eu`. Nie publikuje się automatycznie. CF7 nie jest bazą archiwum zgłoszeń; wiadomość i pliki należy zachować w firmowej skrzynce / wewnętrznym archiwum. Na tym etapie nie dodano zapisu w chmurze ani nowego endpointu Studia.
4. Właściciel sprawdza zgodę, materiały, podgląd i poprawność konfiguracji. W WordPress → Wpisy tworzy szkic w kategorii **Warsztat Gamefields (643)**, dodaje nazwę projektu, sprawdzony podgląd jako obrazek wyróżniający i poniższe publiczne metadane. Nie dodaje danych kontaktowych do publicznego wpisu.
5. Po akceptacji publikuje wpis. Galeria czyta tylko `status=publish`, kategorię 643, 10 najnowszych wpisów malejąco po dacie. Data na karcie jest datą publikacji, nie prywatną datą otrzymania zgłoszenia. Starsze wpisy pozostają w WordPressie.
6. Cofnięcie publikacji do szkicu usuwa pracę z feedu przy kolejnym odświeżeniu. Prośby o usunięcie można kierować na info@gamefields.eu.

## Dane wpisu

- `post_title`: publiczna nazwa pracy, do 100 znaków.
- `post_status`: `draft` przed weryfikacją, `publish` po akceptacji.
- `categories`: `[643]`.
- `featured_media`: zweryfikowany podgląd JPG/PNG/WebP z lokalnych mediów WordPressa.
- `date_gmt`: data publikacji nadawana przez WordPress.
- W bloku Własny HTML w treści wpisu:

```html
<script type="application/json" data-gf-workshop>
{"version":1,"author":"Publiczny pseudonim","projectFile":"https://www.gamefields.eu/wp-content/uploads/RRRR/MM/zaakceptowany-projekt.txt","studio":{"arena":"p1","pattern":"organic-flow","palette":"warsaw","variant":6}}
</script>
```

To jest **przykład struktury**, nie opublikowany projekt klienta. `projectFile` musi wskazywać lokalny plik JSON albo TXT zawierający zatwierdzony projekt. Dla osobnej nawierzchni `studio.surface` zastępuje `studio.arena`, np. `street-football-3x3`. Pozostałe parametry są opcjonalne.

Karta zawiera obrazek, tytuł, publiczny pseudonim, datę, „Stwórz podobny” (rodzina/wariant/paleta/model) i „Pobierz projekt”. Aby zachować **wszystkie indywidualne kolory**, użytkownik pobiera plik i wczytuje go w istniejącym Studio. Nie udajemy, że skrócony link kopiuje każdy parametr. Puste/nieprawidłowe metadane, obcy host pliku/obrazu, nieprawidłowa data i nieopublikowane wpisy nie są renderowane.

## Przygotowanie publicznego pliku

Sprawdź plik przez walidowany import w Studio. Utwórz osobną kopię publiczną: pozostaw geometrię, rodzinę, sport, powierzchnię, wzór i kolory; usuń prywatne dane kontaktowe, wyceny (`estimate`), komentarze i metadane zgłoszenia. Początkowo nie publikuj własnych logo, napisów i innych obiektów autora: `objects: []`; w `arenaDesign` usuń `src` i ustaw `text: ""`. Ustaw publiczną nazwę, nowy identyfikator kopii i datę. Ponownie sprawdź import oraz zgodność miniatury z tą kopią. Oryginał zostaje wewnętrzny, nie jest nadpisywany.

## Dostęp i testy

Anonimowy odwiedzający ma tylko odczyt opublikowanego feedu. Nie otrzymuje WordPress credentials ani możliwości publikacji. Formularz korzysta z walidacji i limitów Contact Form 7, nie zapisuje przez publiczne REST posts. Nie instalowano wtyczek ani nowego PHP. Zgłoszeń testowych nie wysłano. Doręczanie wiadomości ze skrzynki nie było testowane w tym zadaniu.

Nie seedujemy galerii fikcyjnymi klientami. W pustej galerii pokazujemy zaproszenie do pierwszego zgłoszenia. Testy 10 wpisów używają wyłącznie przechwyconej odpowiedzi w przeglądarce — nie tworzą żadnych publicznych rekordów.
