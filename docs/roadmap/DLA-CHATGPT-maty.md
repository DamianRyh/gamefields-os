# Dla ChatGPT: mata treningowa (sklep, strona, motyw) — 15.11.2026

Wszystko potrzebne jest w tym pliku i w trzech obrazach (załączniki: `gamefields-mata-2x1.webp`, `gamefields-mata-4x3.webp`, `gamefields-mata-5x4.webp`). Nie otwieraj linków do GitHuba.
Przed zmianami zrób kopię zapasową (szkic albo eksport) każdej zmienianej rzeczy. Nie zmieniaj INTERNAL_COST_CARD ani SALES_MARGIN Studio.

## 1. Obrazy

Wgraj trzy obrazy do biblioteki mediów (listopad 2026), z tymi nazwami plików. Adresy mają wyglądać tak:
`https://www.gamefields.eu/wp-content/uploads/2026/11/gamefields-mata-5x4.webp` (i analogicznie 2x1, 4x3).
Teksty alternatywne: „Mata treningowa 5 × 4 m z ósemką, drabinką, kropkami i sześciokątem”, „Mata 4 × 3 m z drabinką koordynacyjną, sześciokątem i kropkami”, „Mata 2 × 1 m z kropkami do pracy nóg i sześciokątem zwinności”.
Jeśli WordPress zmieni nazwę pliku (np. doda „-1”), popraw adresy w kodzie strony z punktu 3.

## 2. Produkt w sklepie WooCommerce

- Produkt zmienny „Mata treningowa”, slug **`mata-treningowa`**, kategoria jak plakat.
- Atrybut do wariantów: **`wariant`** (dokładnie ta nazwa, małymi literami), 15 wartości. Wartości muszą być **identyczne** jak w tabeli (ze spacjami, „×” i „·”), bo Studio dopasowuje je po tekście.
- Cena wariantu = kolumna „brutto”. Ceny zawierają nadruk ćwiczeń.
- Krótki opis: „Gumowa mata z ćwiczeniami ze Studio Gamefields. Wysyłana w całości, gotowa do rozłożenia, bez montażu. Wysyłkę wyceniamy po podaniu adresu.”
- Wysyłka: maty nie mogą dostać darmowej wysyłki ani stawki 19 zł z plakatów. Utwórz klasę wysyłkową „Mata treningowa” i ustaw ją tak, żeby przy zamówieniu było jasne, że wysyłkę potwierdzamy po zamówieniu (np. 0 zł z opisem „wycena wysyłki po zamówieniu”). Pokaż mi ustawienia przed zapisem.
- Status: szkic, dopóki nie sprawdzimy całości.

| wariant | brutto (zł) | netto (zł) |
| --- | --- | --- |
| 2 × 1 m · Standard | 738 | 600 |
| 2 × 1 m · Standard+ | 861 | 700 |
| 2 × 1 m · Premium | 1107 | 900 |
| 2 × 2 m · Standard | 1353 | 1100 |
| 2 × 2 m · Standard+ | 1722 | 1400 |
| 2 × 2 m · Premium | 2214 | 1800 |
| 3 × 2 m · Standard | 1968 | 1600 |
| 3 × 2 m · Standard+ | 2337 | 1900 |
| 3 × 2 m · Premium | 3075 | 2500 |
| 4 × 3 m · Standard | 3813 | 3100 |
| 4 × 3 m · Standard+ | 4674 | 3800 |
| 4 × 3 m · Premium | 6150 | 5000 |
| 5 × 4 m · Standard | 6150 | 5000 |
| 5 × 4 m · Standard+ | 7749 | 6300 |
| 5 × 4 m · Premium | 10209 | 8300 |

## 3. Strona /mata-treningowa/

Utwórz stronę „Mata treningowa” (adres `/mata-treningowa/`, szablon „Pełna szerokość”), jeden blok „Własny HTML” z kodem poniżej (bez zmian).
Tytuł SEO: „Mata treningowa z ćwiczeniami — slalom, drabinka, kropki | Gamefields”.
Opis: „Gumowa mata z ćwiczeniami ze Studio Gamefields: od 2 × 1 m do 50 m², trzy rodzaje gumy, nadruk ćwiczeń. Wysyłka gotowej maty, bez betonu i montażu.”
Przyciski prowadzą do `/studio/?tool=mat`. Sprawdź, czy strona Studio przekazuje parametr `tool=mat` do Studio (po kliknięciu ma otworzyć się od razu panel „Mata treningowa”). Jeśli nie przekazuje, napisz mi, jak strona /studio/ osadza Studio.

```html
<!-- wp:html -->
<style>
.gfa{--ink:#47132D;--muted:#6F5A66;--paper:#F4F1EE;--violet:#6336F5;--lime:#D8F24A;--line:#D9CFD4;background:var(--paper);color:var(--ink);font-family:GHInter,Inter,Arial,sans-serif;line-height:1.5;overflow-x:clip}
.gfa *{box-sizing:border-box}
.gfa figure{margin:0}
.gfa .w{max-width:1360px;margin:0 auto;padding:0 clamp(16px,3.4vw,48px)}
.gfa h1,.gfa h2,.gfa h3{font-family:inherit;text-transform:none;margin:0;color:inherit}
.gfa .d{font-weight:800;letter-spacing:-.055em;line-height:.9;text-wrap:balance}
.gfa .k{margin:0 0 14px;color:var(--violet);font-weight:700;font-size:13px;letter-spacing:.08em;text-transform:uppercase}
.gfa a{color:inherit}
.gfa-hero{padding:clamp(40px,6vw,96px) 0 clamp(28px,4vw,56px)}
.gfa-hero .w{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,6fr);gap:clamp(20px,3vw,48px);align-items:end}
.gfa-hero h1{font-size:clamp(56px,9vw,148px)}
.gfa-hero .lead{max-width:38rem;margin:22px 0 0;font-size:clamp(17px,1.5vw,21px);color:var(--muted)}
.gfa-hero figure{margin:0}
.gfa-hero img{display:block;width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;background:#E6E0DA}
.gfa-hero figcaption,.gfa figure figcaption{margin-top:8px;font-size:14px;line-height:1.35;color:var(--muted)}
.gfa figure figcaption b{display:block;color:var(--ink);font-size:15px}
.gfa-sec{padding:clamp(40px,5vw,80px) 0;border-top:1px solid var(--line)}
.gfa-head{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:16px 32px;align-items:end;margin-bottom:clamp(24px,3vw,44px)}
.gfa-head h2{font-size:clamp(40px,5.6vw,88px)}
.gfa-head p{margin:0;font-size:18px;color:var(--muted)}
.gfa-grid{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.gfa-grid.c4{grid-template-columns:repeat(4,minmax(0,1fr))}
.gfa-grid figure{margin:0}
.gfa-grid img{display:block;width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;background:#E6E0DA}
.gfa-grid .tall img{aspect-ratio:3/4}
.gfa-mom{display:grid;gap:12px}
.gfa-mom article{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(16px,3vw,40px);padding:clamp(20px,2.4vw,32px);background:#fff;border:1px solid var(--line);align-items:start}
.gfa-mom .y{color:var(--violet);font-weight:800;font-size:15px;margin:0 0 6px}
.gfa-mom h3{font-size:clamp(26px,2.6vw,40px);font-weight:800;letter-spacing:-.035em;line-height:1}
.gfa-mom p{margin:12px 0 0;color:var(--muted);font-size:16px}
.gfa-mom .ph{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.gfa-mom .ph img{display:block;width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;background:#E6E0DA}
.gfa-mom .ph .one{grid-column:1/-1}
.gfa-steps{list-style:none;margin:0;padding:0;counter-reset:s;display:grid;gap:12px}
.gfa-steps li{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:clamp(16px,3vw,40px);align-items:center;padding:clamp(16px,2vw,24px);background:#fff;border:1px solid var(--line)}
.gfa-steps li:nth-child(even) .ph{order:2}
.gfa-steps .ph{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.gfa-steps .ph img{display:block;width:100%;height:auto;aspect-ratio:1/1;object-fit:cover;background:#E6E0DA}
.gfa-steps .ph img:only-child{grid-column:1/-1;aspect-ratio:4/3}
.gfa-steps .n{color:var(--violet);font-weight:800;font-size:15px}
.gfa-steps h3{font-size:clamp(28px,3vw,48px);font-weight:800;letter-spacing:-.04em;line-height:.95;margin-top:6px}
.gfa-steps p{margin:12px 0 0;color:var(--muted);font-size:17px}
.gfa-quote{margin:0;padding:24px;background:#fff;border-top:4px solid var(--violet);max-width:760px}
.gfa-quote blockquote{margin:0;padding:0;border:0;font-style:normal;font-size:19px;line-height:1.45}
.gfa-quote figcaption{margin-top:12px;font-size:14px;color:var(--muted)}
.gfa-quote figcaption b{display:block;color:var(--ink);font-size:15px}
.gfa-facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;margin:0}
.gfa-facts div{border-top:1px solid var(--line);padding-top:12px}
.gfa-facts dt{font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.gfa-facts dd{margin:6px 0 0;font-size:18px;font-weight:700}
.gfa-band{padding:clamp(40px,5vw,80px) 0;background:var(--ink);color:var(--paper);box-shadow:0 0 0 100vmax var(--ink);clip-path:inset(0 -100vmax)}
.gfa-band .gfa-head p,.gfa-band figure figcaption{color:rgba(244,241,238,.78)}
.gfa-band figure figcaption b{color:var(--paper)}
.gfa-band .k{color:var(--lime)}
.gfa-cta{padding:clamp(40px,5vw,80px) 0;border-top:1px solid var(--line)}
.gfa-cta .w{display:flex;flex-wrap:wrap;align-items:end;justify-content:space-between;gap:24px}
.gfa-cta h2{font-size:clamp(40px,5.6vw,88px)}
.gfa-btns{display:flex;flex-wrap:wrap;gap:12px}
.gfa-btn{display:inline-flex;align-items:center;min-height:52px;padding:0 24px;border-radius:999px;background:var(--violet);color:#fff!important;text-decoration:none;font-weight:700}
.gfa-btn.alt{background:var(--ink)}
.gfa-links{display:flex;flex-wrap:wrap;gap:8px;margin:24px 0 0;padding:0;list-style:none}
.gfa-links a{display:inline-flex;align-items:center;min-height:44px;padding:0 18px;border:1.5px solid #CDBFC6;border-radius:999px;text-decoration:none;font-weight:700;font-size:15px}
.gfa-links a:hover{border-color:var(--ink)}
@media (max-width:900px){
 .gfa-hero .w,.gfa-head,.gfa-mom article,.gfa-steps li{grid-template-columns:minmax(0,1fr)}
 .gfa-steps li:nth-child(even) .ph{order:0}
 .gfa-grid,.gfa-grid.c4{grid-template-columns:repeat(2,minmax(0,1fr))}
 .gfa-facts{grid-template-columns:minmax(0,1fr)}
}
@media (max-width:520px){.gfa-grid,.gfa-grid.c4{grid-template-columns:minmax(0,1fr)}}

.gfa-hero h1{font-size:clamp(52px,7vw,112px)}
.gfa-sec h2.d,.gfa-band h2.d{margin:0 0 clamp(18px,2vw,28px)}
.gfa-steps{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;counter-reset:s}
.gfa-steps li{counter-increment:s;padding:24px;background:#fff;border:1px solid var(--line);display:flex;flex-direction:column;gap:8px}
.gfa-steps li::before{content:counter(s);width:34px;height:34px;border-radius:50%;background:var(--violet);color:#fff;display:grid;place-items:center;font-weight:800}
.gfa-steps b{font-size:21px;letter-spacing:-.02em}.gfa-steps span{color:var(--muted);font-size:15px;line-height:1.5}
.gfa-mats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:0}
.gfa-mats figure{margin:0;background:#fff;border:1px solid var(--line);padding:12px}
.gfa-mats img{width:100%;height:auto;display:block}
.gfa-mats figcaption{padding:10px 2px 0;font-size:15px;color:var(--muted)}.gfa-mats figcaption b{display:block;color:var(--ink);font-size:17px}
.gfa-price{width:100%;border-collapse:collapse;font-size:16px;background:#fff}
.gfa-price th,.gfa-price td{padding:14px 12px;border-bottom:1px solid var(--line);text-align:right;white-space:nowrap}
.gfa-price th:first-child,.gfa-price td:first-child{text-align:left}
.gfa-price thead th{font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.gfa-price td small{display:block;color:var(--muted);font-size:13px}
.gfa-table-wrap{overflow-x:auto;border:1px solid var(--line)}
.gfa-note{margin:12px 0 0;color:var(--muted);font-size:15px}
.gfa-rubber{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.gfa-rubber li{padding:22px;background:#fff;border:1px solid var(--line);display:grid;gap:6px}
.gfa-rubber b{font-size:20px}.gfa-rubber .m{color:var(--violet);font-weight:800}.gfa-rubber span{color:var(--muted);font-size:15px}
.gfa-drills{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.gfa-drills div{padding:18px;background:var(--paper);border:1px solid var(--line);color:var(--ink)}
.gfa-drills h3{margin:0 0 8px;font-size:15px;letter-spacing:.06em;text-transform:uppercase;color:var(--violet)}
.gfa-drills ul{margin:0;padding:0 0 0 18px;font-size:15px;line-height:1.6}
.gfa-faq{border-top:1px solid var(--line)}
.gfa-faq details{border-bottom:1px solid var(--line)}
.gfa-faq summary{display:flex;justify-content:space-between;gap:14px;list-style:none;cursor:pointer;padding:20px 4px;font-size:18px;font-weight:700}
.gfa-faq summary::-webkit-details-marker{display:none}
.gfa-faq summary::after{content:'+';font-size:24px;font-weight:400;color:var(--violet)}
.gfa-faq details[open] summary::after{content:'−'}
.gfa-faq details p{max-width:780px;margin:0;padding:0 4px 22px;font-size:16px;color:var(--muted)}
@media (max-width:900px){.gfa-steps,.gfa-mats,.gfa-rubber{grid-template-columns:minmax(0,1fr)}.gfa-drills{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:560px){.gfa-drills{grid-template-columns:minmax(0,1fr)}}
</style>
<script type="application/ld+json">[{"@context":"https://schema.org","@type":"Product","name":"Mata treningowa Gamefields","description":"Gumowa mata z ćwiczeniami ze Studio Gamefields, w wybranym wymiarze, wysyłana gotowa do rozłożenia.","brand":{"@type":"Brand","name":"Gamefields"},"image":["https://www.gamefields.eu/wp-content/uploads/2026/11/gamefields-mata-5x4.webp","https://www.gamefields.eu/wp-content/uploads/2026/11/gamefields-mata-4x3.webp","https://www.gamefields.eu/wp-content/uploads/2026/11/gamefields-mata-2x1.webp"],"offers":{"@type":"AggregateOffer","priceCurrency":"PLN","lowPrice":738,"highPrice":10209,"offerCount":15,"url":"https://www.gamefields.eu/mata-treningowa/"}},{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Czy pod matę trzeba robić beton?","acceptedAnswer":{"@type":"Answer","text":"Nie. Mata to gotowy produkt: wysyłamy ją w całości, rozkładasz ją na równym, twardym podłożu, np. na placu, kostce albo podłodze hali. Jeśli potrzebujesz trwałego boiska na betonie, zaprojektuj je w Studio jako nawierzchnię."}},{"@type":"Question","name":"Jak duża może być mata?","acceptedAnswer":{"@type":"Answer","text":"Od 1 do 10 m długości i szerokości, co 0,5 m, do 50 m². Gotowe formaty kupisz od razu w sklepie, inny wymiar zamówisz przez formularz z Twoim projektem."}},{"@type":"Question","name":"Jakie ćwiczenia mogę umieścić na macie?","acceptedAnswer":{"@type":"Answer","text":"Wszystkie elementy z biblioteki Studio: slalom, bramki z pachołków, ósemkę, drabinkę koordynacyjną, kropki do pracy nóg, sześciokąt zwinności, strefy podań i oznaczenia toru. Ustawiasz liczbę pachołków i odstępy, a Studio pokazuje je w prawdziwej skali i ostrzega, gdy ćwiczenie nie mieści się na macie."}},{"@type":"Question","name":"Ile kosztuje nadruk ćwiczeń?","acceptedAnswer":{"@type":"Answer","text":"78 zł netto za m² maty, doliczane, gdy na macie są ćwiczenia. Ceny w tabeli zawierają nadruk."}},{"@type":"Question","name":"Ile kosztuje wysyłka?","acceptedAnswer":{"@type":"Answer","text":"Wysyłkę wyceniamy po podaniu adresu, bo zależy od wielkości i wagi maty."}},{"@type":"Question","name":"Czym różnią się rodzaje gumy?","acceptedAnswer":{"@type":"Answer","text":"Standard to maty SBR w podstawowych kolorach, Standard+ jest grubszy i lepiej amortyzuje, Premium ma warstwę EPDM z szerszą paletą kolorów i lepszą odpornością na słońce."}}]}]</script>
<div class="gfa">
<section class="gfa-hero"><div class="w">
  <div>
    <p class="k">Nowość w Studio Gamefields</p>
    <h1 class="d">Mata z Twoim treningiem.</h1>
    <p class="lead">Gumowa mata ze slalomem, drabinką, kropkami i strefami podań, zaprojektowana w Studio w wymiarze, jakiego potrzebujesz: od małej maty do pracy nóg po 20 m² na trening drużyny. Wysyłamy ją gotową do rozłożenia, bez betonu i montażu.</p>
    <div class="gfa-btns"><a class="gfa-btn" href="/studio/?tool=mat">Zaprojektuj matę →</a><a class="gfa-btn alt" href="#ceny">Ceny od 600 zł netto</a></div>
  </div>
  <figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/gamefields-mata-5x4.webp" alt="Mata treningowa 5 × 4 m z ósemką, drabinką, kropkami i sześciokątem" loading="lazy" decoding="async"><figcaption><b>Mata 5 × 4 m</b>Ósemka, drabinka koordynacyjna, kropki i sześciokąt</figcaption></figure>
</div></section>

<section class="gfa-sec"><div class="w">
  <h2 class="d">Jak to działa</h2>
  <ol class="gfa-steps">
    <li><b>Wybierz wielkość</b><span>Gotowy format od 2 × 1 m do 5 × 4 m albo własny wymiar co 0,5 m.</span></li>
    <li><b>Dodaj ćwiczenia</b><span>Przeciągasz je z biblioteki Studio. Wszystko w prawdziwej skali, z liczbą pachołków i odstępami.</span></li>
    <li><b>Zamów</b><span>Gotowy format dodasz do koszyka. Własny wymiar wyślesz formularzem z kartą projektu PDF.</span></li>
  </ol>
</div></section>

<section class="gfa-sec"><div class="w">
  <h2 class="d">Przykłady</h2>
  <div class="gfa-mats">
    <figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/gamefields-mata-2x1.webp" alt="Mata 2 × 1 m z kropkami do pracy nóg i sześciokątem zwinności" loading="lazy" decoding="async"><figcaption><b>2 × 1 m · praca nóg</b>Kropki i sześciokąt zwinności. Do domu, klubu i na rozgrzewkę.</figcaption></figure>
    <figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/gamefields-mata-4x3.webp" alt="Mata 4 × 3 m z drabinką koordynacyjną, sześciokątem i kropkami" loading="lazy" decoding="async"><figcaption><b>4 × 3 m · koordynacja</b>Drabinka, sześciokąt i kropki na jednym stanowisku.</figcaption></figure>
    <figure><img src="https://www.gamefields.eu/wp-content/uploads/2026/11/gamefields-mata-5x4.webp" alt="Mata 5 × 4 m z ósemką, drabinką, kropkami i sześciokątem" loading="lazy" decoding="async"><figcaption><b>5 × 4 m · trening drużyny</b>Ósemka do prowadzenia piłki i stacje koordynacji.</figcaption></figure>
  </div>
</div></section>

<section class="gfa-sec" id="ceny"><div class="w">
  <h2 class="d">Ceny</h2>
  <div class="gfa-table-wrap"><table class="gfa-price"><thead><tr><th>Format</th><th>Standard</th><th>Standard+</th><th>Premium</th></tr></thead><tbody><tr><td><b>2 × 1 m</b><small>2 m²</small></td><td>600 zł<small>738 zł brutto</small></td><td>700 zł<small>861 zł brutto</small></td><td>900 zł<small>1 107 zł brutto</small></td></tr><tr><td><b>2 × 2 m</b><small>4 m²</small></td><td>1 100 zł<small>1 353 zł brutto</small></td><td>1 400 zł<small>1 722 zł brutto</small></td><td>1 800 zł<small>2 214 zł brutto</small></td></tr><tr><td><b>3 × 2 m</b><small>6 m²</small></td><td>1 600 zł<small>1 968 zł brutto</small></td><td>1 900 zł<small>2 337 zł brutto</small></td><td>2 500 zł<small>3 075 zł brutto</small></td></tr><tr><td><b>4 × 3 m</b><small>12 m²</small></td><td>3 100 zł<small>3 813 zł brutto</small></td><td>3 800 zł<small>4 674 zł brutto</small></td><td>5 000 zł<small>6 150 zł brutto</small></td></tr><tr><td><b>5 × 4 m</b><small>20 m²</small></td><td>5 000 zł<small>6 150 zł brutto</small></td><td>6 300 zł<small>7 749 zł brutto</small></td><td>8 300 zł<small>10 209 zł brutto</small></td></tr></tbody></table></div>
  <p class="gfa-note">Ceny netto z nadrukiem ćwiczeń, pod nimi brutto (VAT 23%). Guma: Standard 167 zł/m², Standard+ 233 zł/m², Premium 333 zł/m²; nadruk 78 zł/m². Wysyłkę wyceniamy po podaniu adresu. Inne wymiary policzy Studio.</p>
</div></section>

<section class="gfa-sec"><div class="w">
  <h2 class="d">Rodzaj gumy</h2>
  <ul class="gfa-rubber"><li><span class='m'>167 zł/m² netto</span><b>Standard</b><span>Maty i role SBR, podstawowe kolory. Boiska rekreacyjne i streetball.</span></li><li><span class='m'>233 zł/m² netto</span><b>Standard+</b><span>Grubsze maty o lepszej amortyzacji, do intensywnego użytkowania.</span></li><li><span class='m'>333 zł/m² netto</span><b>Premium</b><span>Maty z warstwą EPDM: szersza paleta kolorów i lepsza odporność UV.</span></li></ul>
</div></section>

<section class="gfa-band"><div class="w">
  <h2 class="d">Ćwiczenia do wyboru</h2>
  <div class="gfa-drills"><div><h3>Prowadzenie i slalom</h3><ul><li>Slalom</li><li>Bramki z pachołków</li><li>Ósemka</li><li>Pole pojedynku 1 na 1</li></ul></div><div><h3>Podania i strzały</h3><ul><li>Kwadrat treningowy</li><li>Trójkąt podań</li><li>Korytarz podań</li><li>Łuk strzałów</li></ul></div><div><h3>Koordynacja</h3><ul><li>Drabinka koordynacyjna</li><li>T-test</li><li>Gwiazda 5 pachołków</li><li>Sześciokąt zwinności</li><li>Kropki do pracy nóg</li><li>Pole techniki</li></ul></div><div><h3>Tor przeszkód</h3><ul><li>Numer stacji</li><li>Strzałka kierunku</li><li>Linia startu</li><li>Linia mety</li></ul></div></div>
</div></section>

<section class="gfa-sec"><div class="w">
  <h2 class="d">Pytania</h2>
  <div class="gfa-faq"><details><summary>Czy pod matę trzeba robić beton?</summary><p>Nie. Mata to gotowy produkt: wysyłamy ją w całości, rozkładasz ją na równym, twardym podłożu, np. na placu, kostce albo podłodze hali. Jeśli potrzebujesz trwałego boiska na betonie, zaprojektuj je w Studio jako nawierzchnię.</p></details><details><summary>Jak duża może być mata?</summary><p>Od 1 do 10 m długości i szerokości, co 0,5 m, do 50 m². Gotowe formaty kupisz od razu w sklepie, inny wymiar zamówisz przez formularz z Twoim projektem.</p></details><details><summary>Jakie ćwiczenia mogę umieścić na macie?</summary><p>Wszystkie elementy z biblioteki Studio: slalom, bramki z pachołków, ósemkę, drabinkę koordynacyjną, kropki do pracy nóg, sześciokąt zwinności, strefy podań i oznaczenia toru. Ustawiasz liczbę pachołków i odstępy, a Studio pokazuje je w prawdziwej skali i ostrzega, gdy ćwiczenie nie mieści się na macie.</p></details><details><summary>Ile kosztuje nadruk ćwiczeń?</summary><p>78 zł netto za m² maty, doliczane, gdy na macie są ćwiczenia. Ceny w tabeli zawierają nadruk.</p></details><details><summary>Ile kosztuje wysyłka?</summary><p>Wysyłkę wyceniamy po podaniu adresu, bo zależy od wielkości i wagi maty.</p></details><details><summary>Czym różnią się rodzaje gumy?</summary><p>Standard to maty SBR w podstawowych kolorach, Standard+ jest grubszy i lepiej amortyzuje, Premium ma warstwę EPDM z szerszą paletą kolorów i lepszą odpornością na słońce.</p></details></div>
</div></section>

<section class="gfa-cta"><div class="w">
  <h2 class="d">Zaprojektuj swoją matę.</h2>
  <div class="gfa-btns"><a class="gfa-btn" href="/studio/?tool=mat">Otwórz Studio →</a><a class="gfa-btn alt" href="/kontakt/">Zapytaj o matę</a></div>
</div></section>
</div>
<!-- /wp:html -->
```

## 4. Motyw: endpoint sklepu dla Studio

W pliku motywu `inc/shop.php` (motyw gamefields) cztery zmiany:

1. W tablicy `GFT_SHOP_SLUGS` po linii `'shirt'  => 'koszulka-gamefields',` dodaj:
```php
	'mat'    => 'mata-treningowa',
```
2. W funkcji `gft_shop_ids()` dodaj `gft_shop_product_id( 'mat' )` do listy (po `'shirt'`).
3. W `register_rest_route( 'gfs/v1', '/shop', ...)` po linii z `'shirt'    => gft_shop_product_data( 'shirt', 'rozmiar' ),` dodaj:
```php
				'mat'      => gft_shop_product_data( 'mat', 'wariant' ),
```
4. W tablicy `'notes'` dodaj: `'mat' => 'Mata wysyłana w całości, bez montażu. Wysyłkę wyceniamy po podaniu adresu.'`

Sprawdź: `https://www.gamefields.eu/wp-json/gfs/v1/shop` zwraca `"mat"` z 15 wariantami (`value` jak w tabeli, `price` brutto).

## 5. Sprawdzenie

- Studio → „Maty treningowe” → 3 × 2 m, Standard, dodaj „Slalom” (ostrzeżenie, że się nie mieści) i „Kropki do pracy nóg”: przycisk Podsumowanie „Mata 1600 zł netto” (mata 1100 + nadruk 500), w panelu „Do koszyka · 1 968 zł” (gdy produkt opublikowany i płatności włączone), inaczej „Zamów” z formularzem.
- Własny wymiar (np. 2,5 × 2 m): tylko „Zamów” przez formularz.
- Opublikuj produkt i stronę dopiero po moim potwierdzeniu, wyczyść cache LiteSpeed.
