/* Gamefields theme: mobile menu and compact sticky header. */
(function () {
  'use strict';
  var nav = document.getElementById('gft-nav');
  if (!nav) return;
  var btn = nav.querySelector('.gft-menu');
  if (btn) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('.gft-links a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
    });
  }
  var ticking = false;
  function onScroll() {
    ticking = false;
    nav.classList.toggle('stuck', window.scrollY > 80);
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
})();
