/* Gamefields City map page: what must work before (or without) consent for OpenStreetMap.
   The original page script does the same once consent is given; both set the same handlers. */
(function () {
  'use strict';
  var root = document.getElementById('g20');
  if (!root) return;
  var modal = document.getElementById('g20Modal');

  if (modal) {
    root.querySelectorAll('[data-open]').forEach(function (b) { b.onclick = function () { modal.classList.add('on'); }; });
    root.querySelectorAll('[data-close]').forEach(function (b) { b.onclick = function () { modal.classList.remove('on'); }; });
    modal.onclick = function (e) { if (e.target === modal) modal.classList.remove('on'); };
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') modal.classList.remove('on'); });
  }

  var form = document.getElementById('g20Report');
  if (form) {
    form.onsubmit = function (e) {
      e.preventDefault();
      var msg = document.getElementById('g20Msg'), btn = form.querySelector('button[type=submit]');
      var val = function (id) { var el = document.getElementById(id); return el ? el.value : ''; };
      btn.disabled = true; btn.textContent = 'Wysyłanie…';
      fetch('/wp-json/wp/v2/comments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post: 3731, author_name: val('g20Name'), author_email: val('g20Email'),
          content: JSON.stringify({ type: 'GAMEFIELDS_CITY_SUBMISSION', place: val('g20Place'), district: val('g20District'), sport: val('g20Sport'), problem: val('g20Problem'), status: 'PENDING_VERIFICATION' })
        })
      }).then(function (r) {
        if (!r.ok) throw new Error();
        msg.textContent = 'Gotowe. Zgłoszenie trafiło do kolejki weryfikacji Warsaw 20.';
        msg.classList.add('on'); form.reset();
      }).catch(function () {
        msg.textContent = 'Nie udało się wysłać zgłoszenia. Sprawdź imię i e-mail i spróbuj ponownie.';
        msg.classList.add('on');
      }).finally(function () { btn.disabled = false; btn.textContent = 'Wyślij do weryfikacji'; });
    };
  }

  /* projects list in place of the map until the map is allowed */
  var mapEl = document.getElementById('g20Map');
  if (!mapEl || window.L) return;
  var box = document.createElement('div');
  box.className = 'gft-city-fallback';
  box.innerHTML = '<p class="gft-kicker">Projekty w Warszawie</p><ul></ul>' +
    '<p class="gft-city-note">Mapa korzysta z OpenStreetMap i pojawi się po zgodzie na zewnętrzne usługi. ' +
    '<button type="button" class="gft-city-consent">Ustawienia cookies</button></p>';
  mapEl.appendChild(box);
  box.querySelector('.gft-city-consent').addEventListener('click', function () {
    var t = document.querySelector('.cmplz-manage-consent, #cmplz-manage-consent .cmplz-manage-consent');
    if (t) { t.click(); } else if (typeof window.cmplz_show_banner === 'function') { window.cmplz_show_banner(); }
  });
  fetch('/wp-json/wp/v2/posts?categories=631&per_page=100&_fields=title,link,content').then(function (r) { return r.json(); }).then(function (rows) {
    var ul = box.querySelector('ul');
    rows.forEach(function (row) {
      var tmp = document.createElement('div'); tmp.innerHTML = row.content.rendered;
      var n = tmp.querySelector('.gfc-data');
      var li = document.createElement('li');
      var a = document.createElement('a'); a.href = row.link;
      var b = document.createElement('b'); b.innerHTML = row.title.rendered;
      var s = document.createElement('span');
      s.textContent = n ? ((n.dataset.sport || 'Projekt') + ' · ' + (n.dataset.status || 'DISCOVERED')) : 'Projekt';
      a.appendChild(b); a.appendChild(s); li.appendChild(a); ul.appendChild(li);
    });
  }).catch(function () {});
  /* when the map library arrives (consent given), the list steps aside */
  var tries = 0, t = setInterval(function () {
    tries++;
    if (mapEl.classList.contains('leaflet-container')) { box.remove(); clearInterval(t); }
    if (tries > 600) clearInterval(t);
  }, 1000);
})();
