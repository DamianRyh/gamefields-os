<?php
/**
 * /shop/ as a showroom (2026-11-16): the Studio catalogue from data/studio-shop.json.
 * 1. Konstrukcje: a stage (3D for the four light models, transparent renders on brand colours for the rest)
 *    and a picker of all 8 models. Each pick is a link to the product page; JavaScript only swaps the stage.
 * 2. Nawierzchnie: texture tiles with variant prices per m² and the cost for the area of a chosen model
 *    (areaM2 = construction area + 10%, price rounded up to 100 zł, the Studio rule).
 * 3. Jak zamówić.
 * Without JavaScript every model and surface is still a link with its price. Categories and search keep the
 * default WooCommerce list (woocommerce.php).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$gfx_data   = gft_studio_shop_data();
$gfx_arenas = array();
$gfx_surf   = array();
foreach ( $gfx_data['products'] as $row ) {
	$pid         = wc_get_product_id_by_sku( $row['sku'] );
	$row['page'] = $pid ? get_permalink( $pid ) : home_url( $row['url'] );
	$row['img']  = $pid ? wp_get_attachment_image_url( get_post_thumbnail_id( $pid ), 'large' ) : '';
	if ( 'arena' === $row['kind'] ) {
		$gfx_arenas[] = $row;
	} else {
		$gfx_surf[] = $row;
	}
}
if ( ! $gfx_arenas ) {
	woocommerce_content();
	return;
}
$gfx_glb = get_template_directory_uri() . '/assets/js/home/hero-r3/';
$gfx_zl  = function ( $n ) {
	return number_format( (float) $n, 0, ',', "\xC2\xA0" ) . "\xC2\xA0zł";
};
$gfx_first = $gfx_arenas[0];
$gfx_js    = array();
foreach ( $gfx_arenas as $a ) {
	$gfx_js[] = array(
		'name'   => $a['name'],
		'meta'   => $a['sku'] . ' · ' . $a['show']['dims'],
		'net'    => 'od ' . $gfx_zl( $a['net'] ),
		'gross'  => 'od ' . $gfx_zl( $a['gross'] ) . ' brutto',
		'full'   => 'Z nawierzchnią od ' . $gfx_zl( $a['show']['fullNet'] ) . ' netto',
		'who'    => $a['show']['forWhom'],
		'bg'     => $a['show']['bg'],
		'ink'    => $a['show']['ink'],
		'render' => $a['show']['render'],
		'glb'    => $a['show']['glb'] ? $gfx_glb . $a['show']['glb'] : '',
		'studio' => home_url( $a['url'] ),
		'page'   => $a['page'],
		'area'   => (float) $a['show']['areaM2'],
	);
}
?>
<div class="gfx">
	<header class="gfx-head">
		<p class="gfx-kicker">Sklep</p>
		<h1 class="gfx-h1">Boiska i nawierzchnie. Ceny ze Studia.</h1>
		<p class="gfx-lead">Osiem modułowych boisk i osiem nawierzchni, w tych samych cenach co w Studio 3D. Ceny „od”, netto. Montaż i transport policzę po zdjęciach placu.</p>
		<nav class="gfx-jump" aria-label="Sekcje sklepu">
			<a href="#konstrukcje">Konstrukcje <small><?php echo count( $gfx_arenas ); ?></small></a>
			<a href="#nawierzchnie">Nawierzchnie <small><?php echo count( $gfx_surf ); ?></small></a>
			<a href="#jak-zamowic">Jak zamówić</a>
		</nav>
	</header>

	<section id="konstrukcje" class="gfx-show" aria-labelledby="gfx-show-h" style="--bg:<?php echo esc_attr( $gfx_first['show']['bg'] ); ?>;--ink:<?php echo esc_attr( $gfx_first['show']['ink'] ); ?>">
		<h2 id="gfx-show-h" class="gfx-sr">Konstrukcje</h2>
		<div class="gfx-stage" data-gfx-stage>
			<img class="gfx-render" data-gfx="render" src="<?php echo esc_url( $gfx_first['show']['render'] ); ?>" alt="<?php echo esc_attr( $gfx_first['name'] ); ?>, wizualizacja" width="1200" height="675" fetchpriority="high" decoding="async">
			<span class="gfx-3d" data-gfx-3d hidden>↻ Przeciągnij, aby obrócić</span>
		</div>
		<div class="gfx-info" aria-live="polite">
			<p class="gfx-model" data-gfx="name"><?php echo esc_html( $gfx_first['name'] ); ?></p>
			<p class="gfx-meta" data-gfx="meta"><?php echo esc_html( $gfx_first['sku'] . ' · ' . $gfx_first['show']['dims'] ); ?></p>
			<p class="gfx-price"><b data-gfx="net">od <?php echo esc_html( $gfx_zl( $gfx_first['net'] ) ); ?></b> netto<span data-gfx="gross">od <?php echo esc_html( $gfx_zl( $gfx_first['gross'] ) ); ?> brutto</span></p>
			<p class="gfx-full" data-gfx="full">Z nawierzchnią od <?php echo esc_html( $gfx_zl( $gfx_first['show']['fullNet'] ) ); ?> netto</p>
			<p class="gfx-who" data-gfx="who"><?php echo esc_html( $gfx_first['show']['forWhom'] ); ?></p>
			<div class="gfx-cta">
				<a class="gfx-btn gfx-btn-lime" data-gfx="studio" href="<?php echo esc_url( home_url( $gfx_first['url'] ) ); ?>">Zaprojektuj w Studio <span aria-hidden="true">↗</span></a>
				<a class="gfx-btn gfx-btn-ghost" data-gfx="page" href="<?php echo esc_url( $gfx_first['page'] ); ?>">Szczegóły i zapytanie</a>
			</div>
		</div>
		<ul class="gfx-pick" role="list" aria-label="Wybierz boisko">
			<?php foreach ( $gfx_arenas as $i => $a ) : ?>
				<li><a href="<?php echo esc_url( $a['page'] ); ?>" data-gfx-i="<?php echo (int) $i; ?>" style="--bg:<?php echo esc_attr( $a['show']['bg'] ); ?>;--ink:<?php echo esc_attr( $a['show']['ink'] ); ?>"<?php echo 0 === $i ? ' aria-current="true"' : ''; ?>>
					<span class="gfx-pick-img"><img src="<?php echo esc_url( $a['show']['renderSmall'] ); ?>" alt="" width="720" height="405" loading="lazy" decoding="async"></span>
					<b><?php echo esc_html( $a['name'] ); ?></b>
					<span>od <?php echo esc_html( $gfx_zl( $a['net'] ) ); ?><?php echo $a['show']['glb'] ? ' · 3D' : ''; ?></span>
				</a></li>
			<?php endforeach; ?>
		</ul>
	</section>

	<section id="nawierzchnie" class="gfx-surf" aria-labelledby="gfx-surf-h">
		<div class="gfx-surf-head">
			<div>
				<p class="gfx-kicker">Nawierzchnie</p>
				<h2 id="gfx-surf-h" class="gfx-h2">Cena za m² i dla Twojego boiska.</h2>
				<p class="gfx-lead">Wykończenia kładziemy na płycie betonowej (osobna pozycja) albo na istniejącym placu. Metraż: powierzchnia konstrukcji z 10% zapasem.</p>
			</div>
			<div class="gfx-calc" role="group" aria-label="Policz dla boiska" data-gfx-calc>
				<span>Policz dla:</span>
				<?php foreach ( $gfx_arenas as $i => $a ) : ?>
					<button type="button" data-gfx-area="<?php echo esc_attr( $a['show']['areaM2'] ); ?>" data-gfx-name="<?php echo esc_attr( $a['name'] ); ?>" aria-pressed="<?php echo 1 === $i ? 'true' : 'false'; ?>"><?php echo esc_html( $a['name'] ); ?></button>
				<?php endforeach; ?>
			</div>
		</div>
		<ul class="gfx-tiles" role="list">
			<?php foreach ( $gfx_surf as $s ) : ?>
				<li class="gfx-tile" data-gfx-rate="<?php echo esc_attr( $s['net'] ); ?>">
					<a href="<?php echo esc_url( $s['page'] ); ?>">
						<span class="gfx-tex"><?php if ( $s['img'] ) : ?><img src="<?php echo esc_url( $s['img'] ); ?>" alt="" loading="lazy" decoding="async"><?php endif; ?></span>
						<span class="gfx-tag"><?php echo esc_html( $s['show']['tag'] ); ?></span>
						<span class="gfx-tile-body">
							<b><?php echo esc_html( $s['name'] ); ?></b>
							<span class="gfx-rate">od <?php echo esc_html( $gfx_zl( $s['net'] ) ); ?>/m² <small>netto</small></span>
							<span class="gfx-est" data-gfx-est></span>
							<?php if ( count( $s['show']['variants'] ) > 1 ) : ?>
							<span class="gfx-var">
								<?php foreach ( $s['show']['variants'] as $v ) : ?>
									<span><?php echo esc_html( $v['name'] ); ?> <b><?php echo esc_html( number_format( (float) $v['net'], 0, ',', "\xC2\xA0" ) ); ?></b></span>
								<?php endforeach; ?>
							</span>
							<?php endif; ?>
						</span>
					</a>
				</li>
			<?php endforeach; ?>
		</ul>
	</section>

	<section id="jak-zamowic" class="gfx-steps" aria-labelledby="gfx-steps-h">
		<h2 id="gfx-steps-h" class="gfx-h2">Jak zamówić.</h2>
		<ol role="list">
			<li><span>01</span><b>Zaprojektuj</b><p>Wybierz boisko, kolory, grafikę i nawierzchnię w Studio 3D. Cena liczy się na bieżąco.</p></li>
			<li><span>02</span><b>Wyślij do wyceny</b><p>Dołącz zdjęcia placu i lokalizację. Policzę montaż, transport i przygotowanie terenu.</p></li>
			<li><span>03</span><b>Gramy</b><p>Potwierdzamy projekt i termin. Rok gwarancji i opieka nad nawierzchnią po odbiorze.</p></li>
		</ol>
		<div class="gfx-cta">
			<a class="gfx-btn gfx-btn-ink" href="<?php echo esc_url( home_url( '/studio/' ) ); ?>">Otwórz Studio 3D <span aria-hidden="true">↗</span></a>
			<a class="gfx-btn gfx-btn-ghost" href="<?php echo esc_url( home_url( '/kontakt/' ) ); ?>">Wyślij zdjęcia placu</a>
		</div>
		<p class="gfx-note">Ceny orientacyjne „od”, netto (brutto z VAT 23% na kartach produktów). Konstrukcja w podstawowej konfiguracji i standardowym kolorze.</p>
	</section>
</div>
<script type="application/json" id="gfx-data"><?php echo wp_json_encode( $gfx_js ); ?></script>
<script>
(function () {
	var data = JSON.parse(document.getElementById('gfx-data').textContent || '[]');
	var show = document.querySelector('.gfx-show'); if (!show || !data.length) return;
	var stage = show.querySelector('[data-gfx-stage]'), hint = show.querySelector('[data-gfx-3d]');
	var f = function (k) { return show.querySelector('[data-gfx="' + k + '"]'); };
	var mv = null, mvLoading = false, cur = 0;
	function loadMV() {
		if (mvLoading) return; mvLoading = true;
		var s = document.createElement('script'); s.type = 'module';
		s.src = 'https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js';
		document.head.appendChild(s);
	}
	function stage3d(m) {
		if (!m.glb) { if (mv) mv.hidden = true; hint.hidden = true; stage.classList.remove('is-3d'); return; }
		loadMV();
		if (!mv) {
			mv = document.createElement('model-viewer');
			['camera-controls', 'disable-zoom', 'auto-rotate'].forEach(function (a) { mv.setAttribute(a, ''); });
			mv.setAttribute('touch-action', 'pan-y'); mv.setAttribute('interaction-prompt', 'none');
			mv.setAttribute('rotation-per-second', '16deg'); mv.setAttribute('shadow-intensity', '0.6');
			mv.setAttribute('camera-orbit', '35deg 61deg 106%'); mv.setAttribute('field-of-view', '28deg');
			mv.style.setProperty('--progress-bar-height', '0px');
			mv.addEventListener('load', function () { stage.classList.add('is-3d'); hint.hidden = false; });
			stage.appendChild(mv);
		}
		mv.hidden = false; stage.classList.remove('is-3d');
		mv.setAttribute('alt', m.name + ', model 3D'); mv.setAttribute('src', m.glb);
	}
	function pick(i, focus) {
		var m = data[i]; if (!m) return; cur = i;
		show.style.setProperty('--bg', m.bg); show.style.setProperty('--ink', m.ink);
		['name', 'meta', 'net', 'gross', 'full', 'who'].forEach(function (k) { f(k).textContent = m[k]; });
		f('studio').href = m.studio; f('page').href = m.page;
		var img = f('render'); img.src = m.render; img.alt = m.name + ', wizualizacja';
		show.querySelectorAll('[data-gfx-i]').forEach(function (a) { if (+a.getAttribute('data-gfx-i') === i) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
		stage3d(m);
		if (focus) { var top = show.getBoundingClientRect().top; if (top < -40) show.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
	}
	show.querySelectorAll('[data-gfx-i]').forEach(function (a) {
		a.addEventListener('click', function (e) {
			if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
			e.preventDefault(); pick(+a.getAttribute('data-gfx-i'), true);
		});
	});
	if ('IntersectionObserver' in window) {
		var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { io.disconnect(); stage3d(data[cur]); } }); }, { rootMargin: '200px' });
		io.observe(stage);
	}
	var calc = document.querySelector('[data-gfx-calc]');
	function estimate(btn) {
		var area = parseFloat(btn.getAttribute('data-gfx-area')) || 0, name = btn.getAttribute('data-gfx-name');
		calc.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
		document.querySelectorAll('.gfx-tile').forEach(function (t) {
			var rate = parseFloat(t.getAttribute('data-gfx-rate')) || 0;
			var net = Math.ceil(area * rate / 100) * 100; // areaM2 already includes the 10% margin (Studio rule)
			t.querySelector('[data-gfx-est]').textContent = name + ': od ' + net.toLocaleString('pl-PL') + ' zł netto';
		});
	}
	if (calc) {
		calc.querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () { estimate(b); }); });
		var on = calc.querySelector('[aria-pressed="true"]'); if (on) estimate(on);
	}
})();
</script>
