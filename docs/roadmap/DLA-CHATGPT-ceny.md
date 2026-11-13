# Ceny konstrukcji na stronie głównej (13.11.2026)

Dla wykonawcy z dostępem do WordPressa gamefields.eu. Cały kod jest w tym pliku. Nie trzeba otwierać linków do GitHuba.
Źródło cen: tabela cen sprzedaży właściciela z 13.11.2026. „Od” to cena samej konstrukcji z bramkami.

## Zasady

1. Przed zmianą zapisz numer wersji strony głównej (ID 3462).
2. Wstawiaj tylko poniższe fragmenty do aktualnej treści. Nie podmieniaj całej strony.
3. Pokaż właścicielowi podgląd, opublikuj po akceptacji, wyczyść cache LiteSpeed.

## Krok 1. Style

Na końcu pierwszego bloku `<style>` z regułami `.gfs …`, przed `</style>`, wklej:

```css
/* ---------- 2026-11-13 · Ile kosztuje arena? (ceny konstrukcji od) ---------- */
.gfs .prices{list-style:none;margin:0;padding:0;border-top:1px solid var(--line)}
.gfs .prices li{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,3fr) minmax(0,3fr) minmax(0,3fr) auto;gap:12px 24px;align-items:center;padding:18px 0;border-bottom:1px solid var(--line)}
.gfs .prices .name b{display:block;font-size:22px;letter-spacing:-.02em;line-height:1.15}
.gfs .prices .name span,.gfs .prices .who{color:var(--muted);font-size:15px}
.gfs .prices .net{font-size:24px;font-weight:800;letter-spacing:-.03em;white-space:nowrap}
.gfs .prices .net small,.gfs .prices .gross{display:block;font-size:13px;font-weight:500;letter-spacing:0;color:var(--muted)}
.gfs .prices a.go{display:inline-flex;align-items:center;min-height:44px;padding:0 18px;border-radius:999px;border:1.5px solid #CDBFC6;color:var(--ink);text-decoration:none;font-weight:700;font-size:14px;white-space:nowrap}
.gfs .prices a.go:hover{border-color:var(--violet);color:var(--violet)}
.gfs .price-note{margin:16px 0 0;font-size:14px;color:var(--muted);max-width:820px}
@media (max-width:900px){.gfs .prices li{grid-template-columns:minmax(0,1fr) auto;gap:6px 16px}.gfs .prices .who{grid-column:1/-1}.gfs .prices .dim{display:none}.gfs .prices a.go{grid-column:1/-1;justify-self:start}}
```

## Krok 2. Sekcja „Ile kosztuje arena?”

Wklej zaraz **przed** komentarzem `<!-- MODERNIZACJA: stary beton` (czyli po sekcji „Zmieści się?”, przed „Stary beton. Nowe boisko.”):

```html
<!-- CENY: cena konstrukcji od (tabela właściciela 13.11.2026), generowane z integrations/wordpress/offer/price-from.json -->
<section id="ceny" class="wrap sec" style="padding-top:0" aria-labelledby="gfs-price">
  <div class="head">
    <div class="hd"><p class="kicker m">Ceny</p><h2 class="d" id="gfs-price">Ile kosztuje arena?</h2></div>
    <div class="side"><p>Ceny konstrukcji z bramkami. Nawierzchnia, montaż i transport zależą od miejsca, dlatego koszt całego boiska policzę po zdjęciach placu.</p><div class="chips"><a class="chip" href="#kontakt">Wyślij zdjęcia placu</a><a class="chip" href="/studio/">Zaprojektuj w Studio</a><a class="chip" href="/dofinansowanie-boisk/">Dofinansowanie</a></div></div>
  </div>
  <ul class="prices" role="list"><li><div class="name"><b>Arena mobilna eventowa</b><span>wynajem i sprzedaż</span></div><span class="dim">Różne</span><div class="net">od 27 000 zł <small>netto</small><span class="gross">od 33 210 zł brutto</span></div><span class="who">Marki, turnieje</span><a class="go" href="/wynajem-boisk-mobilnych/">Zobacz ofertę →</a></li><li><div class="name"><b>Panna Octa Cage 90</b><span>GF-CT-005</span></div><span class="dim">Ø, banda 0,9 m</span><div class="net">od 36 000 zł <small>netto</small><span class="gross">od 44 280 zł brutto</span></div><span class="who">Osiedla, szkoły</span><a class="go" href="/studio/?arena=circle-cage-1">Zaprojektuj →</a></li><li><div class="name"><b>Panna Play</b><span>GF-CT-002</span></div><span class="dim">Ø ~6 m</span><div class="net">od 40 000 zł <small>netto</small><span class="gross">od 49 200 zł brutto</span></div><span class="who">Kluby, eventy, szkoły</span><a class="go" href="/studio/?arena=o1">Zaprojektuj →</a></li><li><div class="name"><b>Panna Ring</b><span>GF-CT-001</span></div><span class="dim">Ø ~5 m</span><div class="net">od 40 000 zł <small>netto</small><span class="gross">od 49 200 zł brutto</span></div><span class="who"></span><a class="go" href="/studio/?arena=w1">Zaprojektuj →</a></li><li><div class="name"><b>Panna Octa</b><span>GF-CT-008</span></div><span class="dim">Ośmiokąt</span><div class="net">od 49 000 zł <small>netto</small><span class="gross">od 60 270 zł brutto</span></div><span class="who">Gminy, parki, szkoły</span><a class="go" href="/studio/?arena=octagon">Zaprojektuj →</a></li><li><div class="name"><b>Panna Grid</b><span>GF-CT-007</span></div><span class="dim">6,21 × 4,65 m</span><div class="net">od 51 000 zł <small>netto</small><span class="gross">od 62 730 zł brutto</span></div><span class="who"></span><a class="go" href="/studio/?arena=street-field">Zaprojektuj →</a></li><li><div class="name"><b>Panna Octa Cage 180</b><span>GF-CT-006</span></div><span class="dim">Ø, banda 1,8 m</span><div class="net">od 58 000 zł <small>netto</small><span class="gross">od 71 340 zł brutto</span></div><span class="who">Kluby, akademie</span><a class="go" href="/studio/?arena=circle-cage-2">Zaprojektuj →</a></li><li><div class="name"><b>Panna Court</b><span>GF-CT-003</span></div><span class="dim">7,14 × 5,57 m</span><div class="net">od 69 000 zł <small>netto</small><span class="gross">od 84 870 zł brutto</span></div><span class="who"></span><a class="go" href="/studio/?arena=p1">Zaprojektuj →</a></li><li><div class="name"><b>Boisko 3 na 3 (Street Arena 15)</b><span>GF-CT-004</span></div><span class="dim">Pełny format, 15 × 10 m</span><div class="net">od 100 000 zł <small>netto</small><span class="gross">od 123 000 zł brutto</span></div><span class="who">Gminy, deweloperzy</span><a class="go" href="/studio/?arena=street15">Zaprojektuj →</a></li></ul>
  <p class="price-note">Ceny orientacyjne „od”, konstrukcja w podstawowej konfiguracji i standardowym kolorze. Netto oraz brutto z VAT 23%. Nie obejmują nawierzchni, montażu, transportu i grafiki.</p>
</section>
```

## Krok 3. Skrót na telefonie

W `<nav class="wrap scope" aria-label="Na skróty">` przed linkiem `<a href="#nawierzchnie">` dodaj:

```html
<a href="#ceny"><b>Ceny</b><span>Konstrukcje od 27 000 zł netto</span></a>
```

## Krok 4. FAQ

W sekcji „Krótkie odpowiedzi.” zastąp cały element `<details>` z pytaniem „Czy cena jest widoczna od razu?” tym kodem:

```html
<details><summary>Czy cena jest widoczna od razu?</summary><p>Tak. Konstrukcje zaczynają się od 27 000 zł netto (arena mobilna) i od 36 000 zł netto (Panna Octa Cage 90). Pełna lista jest w sekcji <a href="#ceny">„Ile kosztuje arena?”</a>. Koszt całego boiska z nawierzchnią, montażem i transportem zależy od miejsca, dlatego dokładną ofertę przygotujemy po zdjęciach placu. Co wpływa na budżet, opisujemy w poradniku <a href="/ile-kosztuje-budowa-boiska-sportowego/">„Ile kosztuje budowa boiska sportowego?”</a>.</p></details>
```

## Krok 5. Dane strukturalne

W `<script type="application/ld+json">` strony głównej, w `hasOfferCatalog.itemListElement`, na końcu listy (po ostatniej usłudze) dodaj przecinek i te elementy:

```json
{"@type":"Offer","itemOffered":{"@type":"Product","name":"Arena mobilna eventowa"},"priceSpecification":{"@type":"PriceSpecification","minPrice":27000,"priceCurrency":"PLN","valueAddedTaxIncluded":false},"seller":{"@id":"https://www.gamefields.eu/#studio"}},
{"@type":"Offer","itemOffered":{"@type":"Product","name":"Panna Octa Cage 90","sku":"GF-CT-005"},"priceSpecification":{"@type":"PriceSpecification","minPrice":36000,"priceCurrency":"PLN","valueAddedTaxIncluded":false},"seller":{"@id":"https://www.gamefields.eu/#studio"}},
{"@type":"Offer","itemOffered":{"@type":"Product","name":"Panna Play","sku":"GF-CT-002"},"priceSpecification":{"@type":"PriceSpecification","minPrice":40000,"priceCurrency":"PLN","valueAddedTaxIncluded":false},"seller":{"@id":"https://www.gamefields.eu/#studio"}},
{"@type":"Offer","itemOffered":{"@type":"Product","name":"Panna Ring","sku":"GF-CT-001"},"priceSpecification":{"@type":"PriceSpecification","minPrice":40000,"priceCurrency":"PLN","valueAddedTaxIncluded":false},"seller":{"@id":"https://www.gamefields.eu/#studio"}},
{"@type":"Offer","itemOffered":{"@type":"Product","name":"Panna Octa","sku":"GF-CT-008"},"priceSpecification":{"@type":"PriceSpecification","minPrice":49000,"priceCurrency":"PLN","valueAddedTaxIncluded":false},"seller":{"@id":"https://www.gamefields.eu/#studio"}},
{"@type":"Offer","itemOffered":{"@type":"Product","name":"Panna Grid","sku":"GF-CT-007"},"priceSpecification":{"@type":"PriceSpecification","minPrice":51000,"priceCurrency":"PLN","valueAddedTaxIncluded":false},"seller":{"@id":"https://www.gamefields.eu/#studio"}},
{"@type":"Offer","itemOffered":{"@type":"Product","name":"Panna Octa Cage 180","sku":"GF-CT-006"},"priceSpecification":{"@type":"PriceSpecification","minPrice":58000,"priceCurrency":"PLN","valueAddedTaxIncluded":false},"seller":{"@id":"https://www.gamefields.eu/#studio"}},
{"@type":"Offer","itemOffered":{"@type":"Product","name":"Panna Court","sku":"GF-CT-003"},"priceSpecification":{"@type":"PriceSpecification","minPrice":69000,"priceCurrency":"PLN","valueAddedTaxIncluded":false},"seller":{"@id":"https://www.gamefields.eu/#studio"}},
{"@type":"Offer","itemOffered":{"@type":"Product","name":"Boisko 3 na 3 (Street Arena 15)","sku":"GF-CT-004"},"priceSpecification":{"@type":"PriceSpecification","minPrice":100000,"priceCurrency":"PLN","valueAddedTaxIncluded":false},"seller":{"@id":"https://www.gamefields.eu/#studio"}}
```

Sprawdź JSON w https://validator.schema.org/.

## Lista kontrolna

- [ ] Sekcja „Ile kosztuje arena?” stoi po „Zmieści się?”, ma 9 pozycji, od 27 000 zł (arena mobilna) do 100 000 zł (boisko 3 na 3).
- [ ] Na telefonie (390 px) nic nie wychodzi poza ekran. Przyciski „Zaprojektuj” prowadzą do Studio, „Zobacz ofertę” do /wynajem-boisk-mobilnych/.
- [ ] FAQ: nowa odpowiedź z linkiem do sekcji cen.
- [ ] Dane strukturalne bez błędów.
- [ ] Cache LiteSpeed wyczyszczony.
