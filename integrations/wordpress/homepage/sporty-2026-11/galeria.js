/* "Jeden plac. Każda gra." gallery (28.11.2026, v4). Cards scroll sideways with snap; each card has three looks
   (product shots from render.mjs) and swaps image, colour, prices and the Studio link. Arrows and dots move the track.
   Built into the homepage block by build.py; no other script is needed. */
(function () {
  'use strict';
  var root = document.getElementById('sporty');
  if (!root) return;
  var track = root.querySelector('[data-gsp-track]');
  var cards = [].slice.call(track.children);
  var dots = root.querySelector('[data-gsp-dots]');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  cards.forEach(function (card, ci) {
    var looks = JSON.parse(card.getAttribute('data-looks'));
    var img = card.querySelector('img');
    [].forEach.call(card.querySelectorAll('[data-look]'), function (b) {
      b.addEventListener('click', function () {
        var l = looks[Number(b.getAttribute('data-look'))];
        card.style.setProperty('--bg', l.bg);
        card.style.setProperty('--ink', l.ink);
        img.classList.add('out');
        var next = new Image();
        next.onload = function () { img.src = l.src; img.alt = l.alt; img.classList.remove('out'); };
        next.src = l.src;
        card.querySelector('[data-look-name]').textContent = l.name;
        card.querySelector('[data-studio]').href = l.studio;
        [].forEach.call(card.querySelectorAll('[data-look]'), function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      });
    });
    var d = document.createElement('button');
    d.type = 'button'; d.setAttribute('aria-label', 'Karta ' + (ci + 1) + ': ' + card.getAttribute('data-name'));
    d.addEventListener('click', function () { go(ci); });
    dots.appendChild(d);
  });

  function current() {
    var x = track.scrollLeft, best = 0, bd = 1e9;
    cards.forEach(function (c, i) { var dd = Math.abs(c.offsetLeft - track.offsetLeft - x - parseFloat(getComputedStyle(track).paddingLeft || 0)); if (dd < bd) { bd = dd; best = i; } });
    return best;
  }
  function go(i) {
    i = Math.max(0, Math.min(cards.length - 1, i));
    track.scrollTo({ left: cards[i].offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft || 0), behavior: reduced ? 'auto' : 'smooth' });
  }
  function mark() {
    var i = current();
    [].forEach.call(dots.children, function (d, k) { d.setAttribute('aria-current', String(k === i)); });
    root.querySelector('[data-gsp-prev]').disabled = i === 0;
    root.querySelector('[data-gsp-next]').disabled = i === cards.length - 1;
  }
  root.querySelector('[data-gsp-prev]').addEventListener('click', function () { go(current() - 1); });
  root.querySelector('[data-gsp-next]').addEventListener('click', function () { go(current() + 1); });
  var t = 0;
  track.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(mark, 60); }, { passive: true });
  window.addEventListener('resize', mark);
  root.classList.add('gsp-ready');
  mark();
})();
