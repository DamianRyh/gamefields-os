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
  /* Links to sections of this page (Boiska, Ceny, Dla kogo on the homepage): mark the section in view. */
  var spy = [].filter.call(nav.querySelectorAll('.gft-links a'), function (a) {
    return a.hash && a.pathname.replace(/\/$/, '') === location.pathname.replace(/\/$/, '') && document.getElementById(a.hash.slice(1));
  });
  if (spy.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        spy.forEach(function (a) { if (a.hash === '#' + e.target.id) a.setAttribute('aria-current', 'location'); else if (a.getAttribute('aria-current') === 'location') a.removeAttribute('aria-current'); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    spy.forEach(function (a) { io.observe(document.getElementById(a.hash.slice(1))); });
  }
})();

/* Contact page: a product or order passed in the link (?produkt=...) lands in the message field. */
(function () {
  'use strict';
  var q = new URLSearchParams(location.search).get('produkt');
  if (!q) return;
  var box = document.querySelector('textarea[name="your-message"]');
  if (!box || box.value.trim()) return;
  box.value = (q.length > 3500 ? q.slice(0, 3500) : q) + '\n\n';
})();
