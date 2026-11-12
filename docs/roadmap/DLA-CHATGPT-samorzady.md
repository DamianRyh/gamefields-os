# Strony dla samorządów: dofinansowanie i realizacje (12.11.2026)

Dla wykonawcy z dostępem do WordPressa gamefields.eu. Cały kod jest w tym pliku. Nie trzeba otwierać żadnych linków do GitHuba.

## Zasady

1. Nowe strony twórz jako **szkice**. Publikacja dopiero po akceptacji właściciela.
2. Kod wklejaj w bloku „Własny HTML” bez zmian. Szablon strony: **„Pełna szerokość”**.
3. Po publikacji wyczyść cache LiteSpeed.

## Zadanie 1. Dwie nowe strony

| Tytuł strony | Adres | Tytuł SEO | Opis meta |
| --- | --- | --- | --- |
| Dofinansowanie boisk | `/dofinansowanie-boisk/` | Dofinansowanie boisk dla gmin i szkół 2027 | Gamefields | Jak sfinansować boisko do panny lub street footballu: programy Ministerstwa Sportu 2027, województwo, budżet obywatelski, fundusz sołecki. Przygotujemy część techniczną wniosku. |
| Realizacje dla miast | `/realizacje-dla-miast/` | Boiska dla miast i samorządów: realizacje | Gamefields | Arena przy Orliku w Grodzisku Mazowieckim (10 lat bez uszkodzeń), Panna Octa w Kutnie i Taras pod Pałacem Kultury w Warszawie. Opinie zamawiających. |

### Kod strony /dofinansowanie-boisk/

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

.gfa-hero h1{font-size:clamp(52px,7vw,116px)}
.gfa-alert{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,8fr);gap:clamp(16px,3vw,40px);padding:clamp(20px,2.4vw,32px);background:var(--lime);color:var(--ink);margin:0 0 12px}
.gfa-alert h3{font-size:clamp(26px,2.8vw,42px);font-weight:800;letter-spacing:-.035em;line-height:1}
.gfa-alert ul{margin:0;padding:0;list-style:none;display:grid;gap:10px}
.gfa-alert li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;border-bottom:1px solid rgba(71,19,45,.25);padding-bottom:10px;font-size:16px}
.gfa-alert li b{white-space:nowrap}
.gfa-alert small{display:block;margin-top:10px;font-size:13px;opacity:.8}
.gfa-paths{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.gfa-paths li{display:grid;gap:8px;align-content:start;padding:24px;background:#fff;border:1px solid var(--line)}
.gfa-paths .m{color:var(--violet);font-weight:800;font-size:14px}
.gfa-paths b{font-size:22px;letter-spacing:-.02em;line-height:1.15}
.gfa-paths span{color:var(--muted);font-size:15px;line-height:1.5}
.gfa-paths .fit{margin-top:6px;font-size:13px;font-weight:700;color:var(--ink)}
.gfa-check{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 32px}
.gfa-check li{position:relative;padding:0 0 12px 34px;border-bottom:1px solid var(--line);font-size:17px}
.gfa-check li::before{content:"✓";position:absolute;left:0;top:0;width:24px;height:24px;border-radius:50%;background:var(--violet);color:#fff;font-size:14px;display:grid;place-items:center}
.gfa-check li small{display:block;color:var(--muted);font-size:14px;margin-top:2px}
.gfa-band .gfa-check li{border-color:rgba(244,241,238,.2)}
.gfa-band .gfa-check li small{color:rgba(244,241,238,.75)}
.gfa-nums{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:18px 0 0}
.gfa-nums div{padding:16px;background:var(--paper);border:1px solid var(--line)}
.gfa-nums dt{font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.gfa-nums dd{margin:6px 0 0;font-size:24px;font-weight:800;letter-spacing:-.03em;line-height:1.1}
.gfa-case h4{margin:18px 0 6px;font-size:15px;letter-spacing:.06em;text-transform:uppercase;color:var(--violet)}
.gfa-case p{margin:0;color:var(--muted);font-size:16px}
.gfa-src{margin:0;padding:0 0 0 18px;font-size:14px;color:var(--muted)}
.gfa-src li{margin:6px 0}
.gfa-faq{border-top:1px solid var(--line)}
.gfa-faq details{border-bottom:1px solid var(--line)}
.gfa-faq summary{display:flex;justify-content:space-between;gap:14px;list-style:none;cursor:pointer;padding:20px 4px;font-size:18px;font-weight:700}
.gfa-faq summary::-webkit-details-marker{display:none}
.gfa-faq summary::after{content:'+';font-size:24px;font-weight:400;color:var(--violet)}
.gfa-faq details[open] summary::after{content:'−'}
.gfa-faq details p{max-width:780px;margin:0;padding:0 4px 22px;font-size:16px;color:var(--muted)}
@media (max-width:900px){.gfa-alert,.gfa-check{grid-template-columns:minmax(0,1fr)}.gfa-paths{grid-template-columns:repeat(2,minmax(0,1fr))}.gfa-nums{grid-template-columns:minmax(0,1fr)}}
@media (max-width:560px){.gfa-paths{grid-template-columns:minmax(0,1fr)}}
</style>
<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"WebPage","@id":"https://www.gamefields.eu/dofinansowanie-boisk/","url":"https://www.gamefields.eu/dofinansowanie-boisk/","name":"Dofinansowanie boisk dla gmin i szkół","inLanguage":"pl-PL","dateModified":"2026-11-12","author":{"@type":"Person","@id":"https://www.gamefields.eu/#damian-gawrych","name":"Damian Gawrych"}},{"@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Kto składa wniosek o dofinansowanie?","acceptedAnswer":{"@type":"Answer","text":"Wniosek składa uprawniony podmiot, najczęściej gmina, powiat albo szkoła przez organ prowadzący. Gamefields przygotowuje część techniczną: koncepcję, wizualizację, opis rozwiązania i cenę orientacyjną do kosztorysu."}},{"@type":"Question","name":"Czy małe boisko do panny może dostać dofinansowanie?","acceptedAnswer":{"@type":"Answer","text":"To zależy od programu. Programy ministerialne mają własne progi i wymagania, dlatego małą arenę warto włączyć do większego zadania, np. modernizacji Orlika albo strefy sportowej przy szkole. Mniejsze kwoty łatwiej sfinansować z budżetu obywatelskiego, funduszu sołeckiego albo programów województwa."}},{"@type":"Question","name":"Ile trzeba mieć wkładu własnego?","acceptedAnswer":{"@type":"Answer","text":"W edycji 2026 programu rozwoju infrastruktury sportowej w województwach wnioskodawca pokrywał co najmniej 40% kosztów kwalifikowanych, a dofinansowanie wynosiło do 60%. Zasady kolejnych edycji sprawdzamy w aktualnym regulaminie."}},{"@type":"Question","name":"Kiedy zacząć przygotowania?","acceptedAnswer":{"@type":"Answer","text":"Najlepiej kilka tygodni przed naborem. Ministerstwo Sportu zapowiedziało pierwsze nabory na 2027 rok od 4 stycznia 2027 r., dlatego koncepcję i kosztorys warto mieć gotowe jeszcze w grudniu."}},{"@type":"Question","name":"Czy pomagacie w budżecie obywatelskim?","acceptedAnswer":{"@type":"Answer","text":"Tak. Przygotujemy koncepcję, wizualizację i cenę orientacyjną do formularza."}}]}]}</script>
<div class="gfa">
<section class="gfa-hero"><div class="w">
  <div>
    <p class="k">Dla gmin, szkół i klubów</p>
    <h1 class="d">Boisko z dotacją.</h1>
    <p class="lead">Boisko do panny, street footballu albo kolorową nawierzchnię na starym placu można sfinansować z programów Ministerstwa Sportu, województwa, budżetu obywatelskiego albo funduszu sołeckiego. Przygotuję część techniczną wniosku: koncepcję, wizualizację, opis i cenę orientacyjną.</p>
    <ul class="gfa-links"><li><a href="#nabory">Najbliższe nabory</a></li><li><a href="#sciezki">Źródła finansowania</a></li><li><a href="#do-wniosku">Co przygotuję</a></li><li><a href="/realizacje-dla-miast/">Realizacje dla miast</a></li></ul>
  </div>
  <figure><img src="https://www.gamefields.eu/wp-content/uploads/2024/12/9-768x432.jpg" alt="Arena Panna Ring na Orliku w Grodzisku Mazowieckim" loading="lazy" decoding="async"><figcaption><b>Panna Ring na Orliku</b>OSiR Grodzisk Mazowiecki, w użyciu od 10 lat</figcaption></figure>
</div></section>

<section class="gfa-sec" id="nabory"><div class="w">
  <div class="gfa-alert">
    <div><p class="k" style="color:var(--ink)">Stan na 12.11.2026</p><h3>Nabory na 2027 rok ruszają w styczniu.</h3></div>
    <div>
      <ul>
        <li><span>„Moje Boisko – Orlik 2012” (modernizacja Orlików)</span><b>4.01–26.02.2027</b></li>
        <li><span>Rozwój infrastruktury sportowej w województwach</span><b>w 2027, termin w regulaminie</b></li>
        <li><span>Budżety obywatelskie miast</span><b>zgłoszenia zwykle zimą</b></li>
      </ul>
      <small>Terminy na 2027 rok pochodzą z zapowiedzi Ministerstwa Sportu i Turystyki przedstawionych w Sejmie. Przed złożeniem wniosku sprawdzamy regulamin na gov.pl. Źródła na dole strony.</small>
    </div>
  </div>
</div></section>

<section class="gfa-sec" id="sciezki"><div class="w">
  <div class="gfa-head"><h2 class="d">Sześć źródeł finansowania.</h2><p>Każde ma inne progi i wymagania. Na start wystarczy lokalizacja i pomysł, a ja podpowiem, które pasuje do Twojego placu.</p></div>
  <ul class="gfa-paths">
    <li><span class="m">01</span><b>Ministerstwo Sportu i Turystyki</b><span>Programy na nowe i modernizowane obiekty: m.in. „Moje Boisko – Orlik 2012” i rozwój infrastruktury w województwach. W 2026 r. dofinansowanie do 60% kosztów kwalifikowanych.</span><span class="fit">Dla: gmin, powiatów, szkół przez organ prowadzący</span></li>
    <li><span class="m">02</span><b>Województwo</b><span>Urzędy marszałkowskie prowadzą własne programy i współfinansują programy ministerialne, np. „Sportowa Małopolska”.</span><span class="fit">Dla: gmin i powiatów danego województwa</span></li>
    <li><span class="m">03</span><b>Budżet obywatelski</b><span>Mieszkańcy zgłaszają projekt, urząd ocenia, mieszkańcy głosują. Dobra droga dla jednej areny w parku albo przy szkole.</span><span class="fit">Dla: mieszkańców, rad osiedli, szkół</span></li>
    <li><span class="m">04</span><b>Fundusz sołecki</b><span>Sołectwo może przeznaczyć swoje środki m.in. na urządzenie boiska. Mała arena mieści się w skali tego funduszu.</span><span class="fit">Dla: sołectw w gminach wiejskich</span></li>
    <li><span class="m">05</span><b>Fundusze Europejskie</b><span>Programy regionalne 2021–2027 finansują projekty rewitalizacji. Boisko i kolorowa nawierzchnia mogą być częścią odnowy placu lub osiedla.</span><span class="fit">Dla: gmin z programem rewitalizacji</span></li>
    <li><span class="m">06</span><b>Marka lub fundacja</b><span>Boisko z identyfikacją partnera: firma finansuje arenę, a jej logo jest na bandach i nawierzchni.</span><span class="fit">Dla: szkół, klubów, osiedli i firm</span></li>
  </ul>
</div></section>

<section class="gfa-band" id="do-wniosku"><div class="w">
  <div class="gfa-head"><div><p class="k">Gamefields przygotuje</p><h2 class="d">Część techniczna wniosku.</h2></div><p>Wniosek składa gmina albo szkoła. Ja dostarczam materiały, które pokazują, co powstanie, ile kosztuje i dlaczego się sprawdzi.</p></div>
  <ul class="gfa-check">
    <li>Koncepcja i wizualizacja boiska na zdjęciu placu<small>Z modelu 3D w Studio, w kolorach i wzorze nawierzchni.</small></li>
    <li>Karta projektu PDF z ceną orientacyjną<small>Parametry, widok z góry i widełki ceny do kosztorysu.</small></li>
    <li>Opis techniczny konstrukcji i nawierzchni<small>Wymiary, materiały, warstwy, wyposażenie.</small></li>
    <li>Harmonogram realizacji<small>Od zamówienia do odbioru, z zależnością od pogody.</small></li>
    <li>Argumenty dla komisji<small>Ogólnodostępność, trwałość, mała powierzchnia, koszty utrzymania, realizacje referencyjne.</small></li>
    <li>Wsparcie po decyzji<small>Dostosowanie projektu do zakresu, który otrzymał dofinansowanie.</small></li>
  </ul>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><h2 class="d">Co oceniają komisje.</h2><p>Z regulaminu edycji 2026 programu rozwoju infrastruktury sportowej w województwach. Kolejne edycje mogą to zmienić.</p></div>
  <ul class="gfa-check">
    <li>Wkład własny co najmniej 40%<small>Dofinansowanie do 60% kosztów kwalifikowanych.</small></li>
    <li>Obiekt ogólnodostępny i bezpłatny<small>Priorytet dla obiektów przy szkołach, otwartych dla dzieci i młodzieży.</small></li>
    <li>Bez nawierzchni asfaltowych<small>Asfalt i beton asfaltowy nie są finansowane (z wyjątkami, np. skateparki).</small></li>
    <li>Nowy obiekt albo modernizacja<small>Same remonty nie są finansowane.</small></li>
  </ul>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><h2 class="d">Krótkie odpowiedzi.</h2><p>Nie wiesz, od czego zacząć? <a href="/kontakt/">Napisz</a>, odpiszę osobiście.</p></div>
  <div class="gfa-faq"><details><summary>Kto składa wniosek o dofinansowanie?</summary><p>Wniosek składa uprawniony podmiot, najczęściej gmina, powiat albo szkoła przez organ prowadzący. Gamefields przygotowuje część techniczną: koncepcję, wizualizację, opis rozwiązania i cenę orientacyjną do kosztorysu.</p></details><details><summary>Czy małe boisko do panny może dostać dofinansowanie?</summary><p>To zależy od programu. Programy ministerialne mają własne progi i wymagania, dlatego małą arenę warto włączyć do większego zadania, np. modernizacji Orlika albo strefy sportowej przy szkole. Mniejsze kwoty łatwiej sfinansować z budżetu obywatelskiego, funduszu sołeckiego albo programów województwa.</p></details><details><summary>Ile trzeba mieć wkładu własnego?</summary><p>W edycji 2026 programu rozwoju infrastruktury sportowej w województwach wnioskodawca pokrywał co najmniej 40% kosztów kwalifikowanych, a dofinansowanie wynosiło do 60%. Zasady kolejnych edycji sprawdzamy w aktualnym regulaminie.</p></details><details><summary>Kiedy zacząć przygotowania?</summary><p>Najlepiej kilka tygodni przed naborem. Ministerstwo Sportu zapowiedziało pierwsze nabory na 2027 rok od 4 stycznia 2027 r., dlatego koncepcję i kosztorys warto mieć gotowe jeszcze w grudniu.</p></details><details><summary>Czy pomagacie w budżecie obywatelskim?</summary><p>Tak. Przygotujemy koncepcję, wizualizację i cenę orientacyjną do formularza.</p></details></div>
  <ul class="gfa-links"><li><a href="/baza-wiedzy/">Baza wiedzy</a></li><li><a href="/realizacje-dla-miast/">Realizacje dla miast</a></li><li><a href="/renowacja-boisk/">Renowacja boisk</a></li></ul>
</div></section>

<section class="gfa-sec"><div class="w">
  <h3 style="font-size:18px;margin:0 0 10px">Źródła (stan na 12.11.2026)</h3>
  <ol class="gfa-src">
    <li><a href="https://www.gov.pl/web/sport/program-rozwoju-infrastruktury-sportowej-w-wojewodztwach--edycja-2027" rel="noopener" target="_blank">Ministerstwo Sportu i Turystyki: Program rozwoju infrastruktury sportowej w województwach</a></li>
    <li><a href="https://www.lodzkie.pl/sport/infrastruktura-sportowa/nabor-wnioskow-2026-infrastruktura-sportowa/program-rozwoju-infrastruktury-sportowej-w-wojewodztwach-edycja-2026" rel="noopener" target="_blank">Województwo łódzkie: zasady naboru, edycja 2026</a></li>
    <li><a href="https://granty.pl/555764/" rel="noopener" target="_blank">granty.pl: Infrastruktura sportowa 2027, zapowiedzi MSiT</a></li>
    <li><a href="https://samorzad.pap.pl/kategoria/aktualnosci/msit-oglosilo-programy-i-warunki-naborow-na-infrastrukture-sportowa-w-2027-r" rel="noopener" target="_blank">PAP Samorząd: programy i nabory na 2027 rok</a></li>
    <li><a href="https://www.prawo.pl/samorzad/fundusz-solecki-jako-forma-zaspokajania-zbiorowych-potrzeb-mieszkancow-i-integracji-spolecznej,78429.html" rel="noopener" target="_blank">prawo.pl: fundusz sołecki</a></li>
  </ol>
</div></section>

<section class="gfa-cta"><div class="w">
  <h2 class="d">Masz plac<br>i nabór w planach?</h2>
  <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Wyślij lokalizację →</a><a class="gfa-btn alt" href="/studio/">Zaprojektuj w Studio ↗</a></div>
</div></section>
</div>
<!-- /wp:html -->
```

### Kod strony /realizacje-dla-miast/

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

.gfa-hero h1{font-size:clamp(52px,7vw,116px)}
.gfa-alert{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,8fr);gap:clamp(16px,3vw,40px);padding:clamp(20px,2.4vw,32px);background:var(--lime);color:var(--ink);margin:0 0 12px}
.gfa-alert h3{font-size:clamp(26px,2.8vw,42px);font-weight:800;letter-spacing:-.035em;line-height:1}
.gfa-alert ul{margin:0;padding:0;list-style:none;display:grid;gap:10px}
.gfa-alert li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;border-bottom:1px solid rgba(71,19,45,.25);padding-bottom:10px;font-size:16px}
.gfa-alert li b{white-space:nowrap}
.gfa-alert small{display:block;margin-top:10px;font-size:13px;opacity:.8}
.gfa-paths{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.gfa-paths li{display:grid;gap:8px;align-content:start;padding:24px;background:#fff;border:1px solid var(--line)}
.gfa-paths .m{color:var(--violet);font-weight:800;font-size:14px}
.gfa-paths b{font-size:22px;letter-spacing:-.02em;line-height:1.15}
.gfa-paths span{color:var(--muted);font-size:15px;line-height:1.5}
.gfa-paths .fit{margin-top:6px;font-size:13px;font-weight:700;color:var(--ink)}
.gfa-check{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 32px}
.gfa-check li{position:relative;padding:0 0 12px 34px;border-bottom:1px solid var(--line);font-size:17px}
.gfa-check li::before{content:"✓";position:absolute;left:0;top:0;width:24px;height:24px;border-radius:50%;background:var(--violet);color:#fff;font-size:14px;display:grid;place-items:center}
.gfa-check li small{display:block;color:var(--muted);font-size:14px;margin-top:2px}
.gfa-band .gfa-check li{border-color:rgba(244,241,238,.2)}
.gfa-band .gfa-check li small{color:rgba(244,241,238,.75)}
.gfa-nums{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:18px 0 0}
.gfa-nums div{padding:16px;background:var(--paper);border:1px solid var(--line)}
.gfa-nums dt{font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.gfa-nums dd{margin:6px 0 0;font-size:24px;font-weight:800;letter-spacing:-.03em;line-height:1.1}
.gfa-case h4{margin:18px 0 6px;font-size:15px;letter-spacing:.06em;text-transform:uppercase;color:var(--violet)}
.gfa-case p{margin:0;color:var(--muted);font-size:16px}
.gfa-src{margin:0;padding:0 0 0 18px;font-size:14px;color:var(--muted)}
.gfa-src li{margin:6px 0}
.gfa-faq{border-top:1px solid var(--line)}
.gfa-faq details{border-bottom:1px solid var(--line)}
.gfa-faq summary{display:flex;justify-content:space-between;gap:14px;list-style:none;cursor:pointer;padding:20px 4px;font-size:18px;font-weight:700}
.gfa-faq summary::-webkit-details-marker{display:none}
.gfa-faq summary::after{content:'+';font-size:24px;font-weight:400;color:var(--violet)}
.gfa-faq details[open] summary::after{content:'−'}
.gfa-faq details p{max-width:780px;margin:0;padding:0 4px 22px;font-size:16px;color:var(--muted)}
@media (max-width:900px){.gfa-alert,.gfa-check{grid-template-columns:minmax(0,1fr)}.gfa-paths{grid-template-columns:repeat(2,minmax(0,1fr))}.gfa-nums{grid-template-columns:minmax(0,1fr)}}
@media (max-width:560px){.gfa-paths{grid-template-columns:minmax(0,1fr)}}
</style>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"CollectionPage","@id":"https://www.gamefields.eu/realizacje-dla-miast/","url":"https://www.gamefields.eu/realizacje-dla-miast/","name":"Realizacje Gamefields dla samorządów","inLanguage":"pl-PL","hasPart":[{"@type":"CreativeWork","name":"Arena przy Orliku","locationCreated":"Grodzisk Mazowiecki, Orlik"},{"@type":"CreativeWork","name":"Panna Octa w Kutnie","locationCreated":"Kutno, pasaż sportowy"},{"@type":"CreativeWork","name":"Taras pod Pałacem Kultury","locationCreated":"Warszawa, Park Świętokrzyski"}]}</script>
<div class="gfa">
<section class="gfa-hero"><div class="w">
  <div>
    <p class="k">Realizacje dla samorządów</p>
    <h1 class="d">Boiska, które pracują dla miast.</h1>
    <p class="lead">Trzy miejsca, trzy różne zadania: arena przy Orliku, która od 10 lat stoi bez uszkodzeń, boisko na miejskim pasażu w Kutnie i Taras pod Pałacem Kultury, który stał się miejscem spotkań młodzieży.</p>
    <ul class="gfa-links"><li><a href="#orlik">Orlik, Grodzisk Mazowiecki</a></li><li><a href="#kutno">Kutno</a></li><li><a href="#taras">Warszawa</a></li><li><a href="/dofinansowanie-boisk/">Dofinansowanie</a></li></ul>
  </div>
  <figure><img src="https://www.gamefields.eu/wp-content/uploads/2024/12/Areny-Panna-Football-Alternative-Soccer-Warszawa-3-768x576.jpg" alt="Taras w Parku Świętokrzyskim w Warszawie, areny panna" loading="lazy" decoding="async"><figcaption><b>Taras w Parku Świętokrzyskim</b>Warszawa</figcaption></figure>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-head"><h2 class="d">Dlaczego arena panna.</h2><p>Argumenty, które słyszymy od zamawiających.</p></div>
  <ul class="gfa-check">
    <li>Mała powierzchnia<small>Arena mieści się na placu o boku od około 5 do 7 m, obok istniejących boisk.</small></li>
    <li>Trwałość<small>Panna Ring na Orliku w Grodzisku Mazowieckim stoi od 10 lat bez uszkodzeń.</small></li>
    <li>Gra bez organizacji<small>Wystarczą dwie osoby i piłka. Bez zapisów, trenera i rezerwacji.</small></li>
    <li>Czytelny znak w przestrzeni<small>Kolorowa konstrukcja i nawierzchnia przyciągają wzrok i porządkują plac.</small></li>
  </ul>
</div></section>

<section class="gfa-sec"><div class="w">
  <div class="gfa-mom">
    <article id="orlik" class="gfa-case">
      <div class="ph"><figure class="one"><img src="https://www.gamefields.eu/wp-content/uploads/2024/12/9-768x432.jpg" alt="Boisko Panna Ring, Grodzisk Mazowiecki" loading="lazy" decoding="async"></figure><figure><img src="https://www.gamefields.eu/wp-content/uploads/2024/12/15-768x432.jpg" alt="Arena Panna Ring na Orliku" loading="lazy" decoding="async"></figure></div>
      <div><p class="y">Grodzisk Mazowiecki, Orlik</p><h3>Arena przy Orliku</h3>
        <h4>Zadanie</h4><p>Dodatkowa strefa gry na istniejącym obiekcie sportowym, dla gry jeden na jednego i w małych grupach.</p>
        <h4>Rozwiązanie</h4><p>Arena Panna Ring na terenie Orlika: mała, zamknięta przestrzeń do gry 1 na 1.</p>
        <h4>Efekt</h4><p>Arena stoi na Orliku od 10 lat i przez cały ten czas spełnia swoją rolę bez żadnych uszkodzeń.</p>
        <dl class="gfa-nums"><div><dt>W użyciu</dt><dd>10 lat</dd></div><div><dt>Uszkodzenia</dt><dd>brak</dd></div><div><dt>Zamawiający</dt><dd>OSiR Grodzisk Mazowiecki</dd></div></dl>
        <figure class="gfa-quote" style="margin-top:18px"><blockquote>Boisko Panna Ring stoi na naszym Orliku od 10 lat i przez cały ten czas spełnia swoją rolę bez żadnych uszkodzeń.</blockquote><figcaption><b>Mariusz Smysło</b>Dyrektor OSiR Grodzisk Mazowiecki</figcaption></figure>
      </div>
    </article><article id="kutno" class="gfa-case">
      <div class="ph"><figure class="one"><img src="https://www.gamefields.eu/wp-content/uploads/2025/06/IMG_6608-scaled-e1749983082809-768x696.jpg" alt="Boisko Panna Octa w Kutnie, dzieci na boisku" loading="lazy" decoding="async"></figure><figure><img src="https://www.gamefields.eu/wp-content/uploads/2024/12/1-5-768x768.jpg" alt="Boisko Panna Octa w Kutnie" loading="lazy" decoding="async"></figure><figure><img src="https://www.gamefields.eu/wp-content/uploads/2024/12/3-5-768x768.jpg" alt="Panna Octa na pasażu sportowym w Kutnie" loading="lazy" decoding="async"></figure></div>
      <div><p class="y">Kutno, pasaż sportowy</p><h3>Panna Octa w Kutnie</h3>
        <h4>Zadanie</h4><p>Stałe miejsce do gry dla młodzieży na miejskim pasażu sportowym.</p>
        <h4>Rozwiązanie</h4><p>Ośmiokątna arena Panna Octa na pasażu, zamówiona przez Urząd Miasta Kutno.</p>
        <h4>Efekt</h4><p>Realizacja przebiegła bez zastrzeżeń, a boisko cieszy się dużą popularnością wśród młodzieży.</p>
        <dl class="gfa-nums"><div><dt>Zamawiający</dt><dd>Urząd Miasta Kutno</dd></div><div><dt>Model</dt><dd>Panna Octa</dd></div><div><dt>Miejsce</dt><dd>pasaż sportowy</dd></div></dl>
        <figure class="gfa-quote" style="margin-top:18px"><blockquote>Realizacja przebiegła bez zastrzeżeń. Boisko Panna Octa na pasażu sportowym w Kutnie cieszy się dużą popularnością wśród młodzieży.</blockquote><figcaption><b>Beata Rafalska</b>Urząd Miasta Kutno, ds. inwestycji</figcaption></figure>
      </div>
    </article><article id="taras" class="gfa-case">
      <div class="ph"><figure class="one"><img src="https://www.gamefields.eu/wp-content/uploads/2024/12/Areny-Panna-Football-Alternative-Soccer-Warszawa-3-768x576.jpg" alt="Taras w Parku Świętokrzyskim w Warszawie, areny panna" loading="lazy" decoding="async"></figure><figure><img src="https://www.gamefields.eu/wp-content/uploads/2024/12/11-1-768x432.jpg" alt="Areny panna na Tarasie, widok na centrum Warszawy" loading="lazy" decoding="async"></figure><figure><img src="https://www.gamefields.eu/wp-content/uploads/2024/12/6-2-768x768.jpg" alt="Gra na arenie panna, Taras w Parku Świętokrzyskim" loading="lazy" decoding="async"></figure></div>
      <div><p class="y">Warszawa, Park Świętokrzyski</p><h3>Taras pod Pałacem Kultury</h3>
        <h4>Zadanie</h4><p>Wielofunkcyjna przestrzeń rekreacji w centrum miasta, przy skrzyżowaniu linii metra i Pałacu Kultury. Inwestycja tymczasowa.</p>
        <h4>Rozwiązanie</h4><p>Trzy areny Panna Ring połączone z tarasem i rampą do skateboardingu. Projekt: Michał Sikorski, Marcin Kwietowicz. Inwestor: Zarząd Zieleni m.st. Warszawy.</p>
        <h4>Efekt</h4><p>Taras stał się jednym z najpopularniejszych miejsc spotkań warszawskiej młodzieży. Po wybuchu wojny w Ukrainie był też ważnym miejscem spotkań ukraińskiej młodzieży, o czym pisał m.in. New York Times.</p>
        <dl class="gfa-nums"><div><dt>Areny</dt><dd>3 × Panna Ring</dd></div><div><dt>Inwestor</dt><dd>Zarząd Zieleni m.st. Warszawy</dd></div><div><dt>W mediach</dt><dd>New York Times</dd></div></dl>
        <figure class="gfa-quote" style="margin-top:18px"><blockquote>Trzy boiska połączone z tarasem i rampą do skateboardingu dały mocny efekt wizualny i przyciągają bardzo dużo młodzieży.</blockquote><figcaption><b>Grzegorz Gądek</b>Prezes Fundacji Skwery Sportów Miejskich</figcaption></figure>
      </div>
    </article>
  </div>
</div></section>

<section class="gfa-band"><div class="w">
  <div class="gfa-head"><div><p class="k">Planujesz podobne miejsce?</p><h2 class="d">Pomogę z dofinansowaniem.</h2></div><p>Koncepcja, wizualizacja, opis i cena orientacyjna do wniosku. Nabory Ministerstwa Sportu na 2027 rok ruszają w styczniu.</p></div>
  <div class="gfa-btns"><a class="gfa-btn" href="/dofinansowanie-boisk/">Jak sfinansować boisko →</a><a class="gfa-btn alt" style="background:var(--lime);color:var(--ink)!important" href="/realizacje-gamefields/">Wszystkie realizacje</a></div>
</div></section>

<section class="gfa-cta"><div class="w">
  <h2 class="d">Masz plac<br>i nabór w planach?</h2>
  <div class="gfa-btns"><a class="gfa-btn" href="/kontakt/">Wyślij lokalizację →</a><a class="gfa-btn alt" href="/studio/">Zaprojektuj w Studio ↗</a></div>
</div></section>
</div>
<!-- /wp:html -->
```

## Zadanie 2. Linki z istniejących stron

- `/dla-miast/` i `/boiska-dla-szkol/`: na końcu treści dodaj blok „Własny HTML”:

```html
<p style="font-size:18px"><a href="/dofinansowanie-boisk/">Jak sfinansować boisko: programy na 2027 rok i pomoc we wniosku →</a></p>
```

- `/realizacje-gamefields/`: pod nagłówkiem strony dodaj:

```html
<p style="font-size:18px"><a href="/realizacje-dla-miast/">Realizacje dla samorządów: trwałość, opinie, finansowanie →</a></p>
```

## Lista kontrolna

- [ ] Obie strony otwierają się na komputerze i na telefonie (390 px), bez przewijania w bok.
- [ ] Wszystkie zdjęcia się wczytują (narzędzia przeglądarki → Sieć, brak 404).
- [ ] FAQ na stronie dofinansowania rozwija się, a dane strukturalne przechodzą walidację (https://validator.schema.org/).
- [ ] Linki ze stron Dla miast, Boiska dla szkół i Realizacje działają.
- [ ] Cache LiteSpeed wyczyszczony.

## Uwaga dla właściciela

Terminy naborów na 2027 rok pochodzą z zapowiedzi Ministerstwa Sportu. Gdy ministerstwo ogłosi regulaminy (zapowiedź: od 4 stycznia 2027), sprawdzimy daty i zasady na stronie i je zaktualizujemy.
