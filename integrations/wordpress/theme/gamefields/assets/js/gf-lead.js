/* Gamefields — "Wyślij zdjęcie placu" (theme 1.0.36, 2026-11-18).
 * Enhances Contact Form 7 form 3758 wherever it is ([data-gf-lead]) without changing its fields:
 * - steps (only if the page did not enhance them already, e.g. /kontakt/ has its own),
 * - photo drop zone over the three CF7 file inputs (project-photo, -2, -3): drag and drop, several at once,
 *   thumbnails, remove; large phone photos and HEIC are re-encoded to JPEG (max 2560 px) so they fit 5 MB,
 * - entry points: [data-gf-photo-pick] buttons open the picker and bring the form, links to #zdjecie open the step,
 * - hidden lead-source (zdjecie / studio / mapa / formularz),
 * - mobile sticky bar "Wyślij zdjęcie placu" (hidden near the form, on /kontakt/, cart, checkout and Studio),
 * - analytics: GA4 event "gf_lead" with details after a sent form (Site Kit already counts the submission itself).
 * No double ampersand anywhere: WordPress would turn it into an entity in page content.
 */
(function () {
	'use strict';
	var MAX = 5 * 1024 * 1024, EDGE = 2560, OK_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
	var canTransfer = (function () { try { return !!new DataTransfer(); } catch (e) { return false; } })();

	function $(s, r) { return (r || document).querySelector(s); }
	function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
	function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; }

	/* ---------- steps ---------- */
	function stepper(lead) {
		var steps = $$('[data-gf-step]', lead), tabs = $$('[data-gf-go]', lead), active = 0;
		function go(n, focus) {
			active = Math.max(0, Math.min(steps.length - 1, n));
			steps.forEach(function (s, i) { s.hidden = i !== active; });
			tabs.forEach(function (t, i) { if (i === active) t.setAttribute('aria-current', 'step'); else t.removeAttribute('aria-current'); });
			if (focus) { var l = steps[active].querySelector('legend'); if (l) { l.tabIndex = -1; l.focus(); } }
		}
		if (lead.dataset.enhanced !== 'true') {
			lead.dataset.enhanced = 'true';
			lead.addEventListener('click', function (e) {
				var b = e.target.closest('button'); if (!b) return;
				if (b.hasAttribute('data-gf-next')) go(active + 1, true);
				else if (b.hasAttribute('data-gf-prev')) go(active - 1, true);
				else if (b.hasAttribute('data-gf-go')) go(+b.getAttribute('data-gf-go'), true);
			});
			var wrap = lead.closest('.wpcf7');
			if (wrap) wrap.addEventListener('wpcf7invalid', function () {
				var bad = lead.querySelector('.wpcf7-not-valid'); if (!bad) return;
				var i = steps.findIndex(function (s) { return s.contains(bad); }); if (i > -1) go(i, false); bad.focus();
			});
			go(0, false);
		}
	}
	/* Opens a step through its tab, so it works with this stepper and with a page's own one. */
	function openStep(lead, n) { var tab = lead.querySelector('[data-gf-go="' + n + '"]'); if (tab) tab.click(); }

	/* ---------- photos ---------- */
	function shrink(file) {
		var small = OK_TYPES.indexOf(file.type) > -1 ? file.size <= 2.5 * 1024 * 1024 : false;
		if (small) return Promise.resolve(file);
		if (!window.createImageBitmap) return Promise.resolve(file);
		return createImageBitmap(file).then(function (bmp) {
			var k = Math.min(1, EDGE / Math.max(bmp.width, bmp.height)), c = document.createElement('canvas');
			c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
			c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
			return new Promise(function (res) { c.toBlob(function (b) { res(b ? new File([b], (file.name || 'zdjecie').replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' }) : file); }, 'image/jpeg', 0.85); });
		}, function () { return file; });
	}

	function photos(lead) {
		var box = $('[data-gf-photos]', lead); if (!box) return null;
		var inputs = $$('input[type=file][name^="project-photo"]', box); if (!inputs.length) return null;
		if (!canTransfer) return null; /* old browsers keep the plain CF7 inputs */
		box.classList.add('gf-photos-on');
		var status = el('p', 'gf-photos-status'); status.setAttribute('role', 'status');
		var picker = el('input'); picker.type = 'file'; picker.accept = 'image/*'; picker.multiple = true; picker.hidden = true; picker.setAttribute('aria-hidden', 'true'); picker.tabIndex = -1;
		var zone = el('button', 'gf-drop'); zone.type = 'button';
		zone.innerHTML = '<span class="gf-drop-ico" aria-hidden="true"></span><b>Dodaj zdjęcia placu</b><span>Przeciągnij tutaj albo zrób telefonem · do 3 zdjęć</span>';
		var thumbs = el('ul', 'gf-thumbs'); thumbs.setAttribute('role', 'list');
		var small = box.querySelector('small');
		box.insertBefore(zone, small || null); box.insertBefore(thumbs, small || null); box.insertBefore(status, small || null); box.appendChild(picker);

		function free() { return inputs.filter(function (i) { return !i.files.length; }); }
		function render() {
			thumbs.textContent = '';
			inputs.forEach(function (inp) {
				if (!inp.files.length) return;
				var f = inp.files[0], li = el('li'), img = el('img'), x = el('button', 'gf-thumb-x', '×');
				img.alt = ''; img.src = URL.createObjectURL(f); img.onload = function () { URL.revokeObjectURL(img.src); };
				x.type = 'button'; x.setAttribute('aria-label', 'Usuń zdjęcie ' + f.name);
				x.addEventListener('click', function () { inp.value = ''; inp.dispatchEvent(new Event('change', { bubbles: true })); render(); zone.focus(); });
				li.appendChild(img); li.appendChild(x); thumbs.appendChild(li);
			});
			var n = 3 - free().length;
			zone.querySelector('b').textContent = n ? (n < 3 ? 'Dodaj kolejne zdjęcie (' + n + '/3)' : 'Masz 3 zdjęcia') : 'Dodaj zdjęcia placu';
			zone.disabled = n >= 3;
			lead.dataset.gfPhotoCount = String(n);
		}
		function add(list) {
			var files = Array.prototype.slice.call(list || []).filter(function (f) { return /^image\//.test(f.type) || /\.(heic|heif)$/i.test(f.name); });
			if (!files.length) { status.textContent = 'To nie wygląda na zdjęcie. Wybierz plik JPG, PNG lub WebP.'; return Promise.resolve(); }
			var slots = free(), skipped = Math.max(0, files.length - slots.length);
			status.textContent = 'Przygotowuję zdjęcia…';
			return Promise.all(files.slice(0, slots.length).map(shrink)).then(function (ready) {
				var bad = 0;
				ready.forEach(function (f, i) {
					if (f.size > MAX || OK_TYPES.indexOf(f.type) < 0) { bad++; return; }
					var dt = new DataTransfer(); dt.items.add(f); slots[i].files = dt.files; slots[i].dispatchEvent(new Event('change', { bubbles: true }));
				});
				render();
				var msg = [];
				if (bad) msg.push(bad === 1 ? 'Jednego zdjęcia nie udało się przygotować — spróbuj JPG lub PNG.' : bad + ' zdjęć nie udało się przygotować — spróbuj JPG lub PNG.');
				if (skipped) msg.push('Dodałem pierwsze zdjęcia, limit to 3.');
				status.textContent = msg.join(' ') || (3 - free().length) + ' z 3 zdjęć dołączonych.';
			});
		}
		zone.addEventListener('click', function () { picker.click(); });
		picker.addEventListener('change', function () { add(picker.files).then(function () { picker.value = ''; }); });
		['dragenter', 'dragover'].forEach(function (t) { zone.addEventListener(t, function (e) { e.preventDefault(); zone.classList.add('over'); }); });
		['dragleave', 'drop'].forEach(function (t) { zone.addEventListener(t, function (e) { e.preventDefault(); zone.classList.remove('over'); }); });
		zone.addEventListener('drop', function (e) { if (e.dataTransfer) add(e.dataTransfer.files); });
		var wrap = lead.closest('.wpcf7');
		if (wrap) wrap.addEventListener('wpcf7mailsent', function () { setTimeout(render, 50); });
		render();
		return { add: add, open: function () { picker.click(); }, zone: zone };
	}

	/* ---------- lead source ---------- */
	function source(lead) {
		var f = lead.querySelector('[name="lead-source"]'); if (!f) return;
		var form = lead.closest('form'); if (!form) return;
		form.addEventListener('submit', function () {
			var det = (lead.querySelector('[name="project-details"]') || {}).value || '';
			var v = 'formularz';
			if (/^\s*\{/.test(det)) v = 'studio'; /* Studio hands over its project as JSON */
			else if (/MAPA MOŻLIWOŚCI/.test(det)) v = 'mapa';
			else if (/Zamówienie (plakatu|piłki)/.test(det)) v = 'plakat';
			else if (lead.dataset.gfEntry === 'zdjecie') v = 'zdjecie';
			else if (+(lead.dataset.gfPhotoCount || 0) > 0) v = 'zdjecie';
			f.value = v; lead.dataset.gfSource = v;
		}, true);
	}

	/* ---------- analytics ---------- */
	function track(lead) {
		var wrap = lead.closest('.wpcf7'); if (!wrap) return;
		wrap.addEventListener('wpcf7mailsent', function () {
			if (typeof window.gtag !== 'function') return;
			var pt = lead.querySelector('[name="place-type"]');
			window.gtag('event', 'gf_lead', {
				lead_source: lead.dataset.gfSource || 'formularz',
				place_type: pt ? (pt.value || 'brak') : 'brak',
				photos: +(lead.dataset.gfPhotoCount || 0),
				page_path: location.pathname
			});
		});
	}

	/* ---------- boot ---------- */
	var leads = $$('[data-gf-lead]'), first = null;
	leads.forEach(function (lead) {
		stepper(lead);
		var p = photos(lead); lead.gfPhotos = p;
		source(lead); track(lead);
		if (!first) first = lead;
	});

	function bring(lead, pick) {
		openStep(lead, 1);
		lead.dataset.gfEntry = 'zdjecie';
		var target = $('[data-gf-photos]', lead) || lead;
		target.scrollIntoView({ behavior: 'smooth', block: 'center' });
		if (lead.gfPhotos) {
			if (pick) lead.gfPhotos.open();
			else setTimeout(function () { lead.gfPhotos.zone.focus({ preventScroll: true }); }, 450);
		}
	}
	/* Buttons anywhere: open the picker right away (same click), the form follows. */
	document.addEventListener('click', function (e) {
		var b = e.target.closest('[data-gf-photo-pick]'); if (!b) return;
		e.preventDefault();
		if (first) { bring(first, true); return; }
		location.href = '/kontakt/#zdjecie';
	});
	/* Links to #zdjecie on the same page */
	document.addEventListener('click', function (e) {
		var a = e.target.closest('a[href$="#zdjecie"]'); if (!a) return;
		var url = new URL(a.href, location.href);
		if (url.pathname !== location.pathname) return;
		if (!first) return;
		e.preventDefault(); history.replaceState(null, '', '#zdjecie'); bring(first, false);
	});
	if (location.hash === '#zdjecie') { if (first) setTimeout(function () { bring(first, false); }, 300); }

	/* ---------- mobile sticky bar ---------- */
	var path = location.pathname, skip = /^\/(kontakt|studio|koszyk|cart|zamowienie|checkout|moje-konto|my-account)(\/|$)/.test(path);
	if (!skip) {
		var bar = el('div', 'gf-sticky'); bar.innerHTML = '<a href="' + (first ? '#zdjecie' : '/kontakt/#zdjecie') + '" data-gf-sticky>Wyślij zdjęcie placu <span aria-hidden="true">→</span></a>';
		document.body.appendChild(bar);
		var hideFor = $$('[data-gf-lead], .gft-foot, footer');
		var seen = new Set();
		if ('IntersectionObserver' in window) {
			var io = new IntersectionObserver(function (es) {
				es.forEach(function (x) { if (x.isIntersecting) seen.add(x.target); else seen.delete(x.target); });
				bar.classList.toggle('off', seen.size > 0);
			}, { rootMargin: '0px 0px -10% 0px' });
			hideFor.forEach(function (n) { io.observe(n); });
		}
		var shown = false;
		window.addEventListener('scroll', function () { if (!shown) if (window.scrollY > 500) { shown = true; bar.classList.add('on'); } }, { passive: true });
	}
})();
