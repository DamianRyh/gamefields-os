<?php
/**
 * Plugin Name: Gamefields – zgody i pomiar
 * Description: Google Analytics 4 z Consent Mode v2. Analityka i reklamy są domyślnie wyłączone; baner pyta o zgodę. Roadmapa, faza 1: „Pomiar”.
 * Version: 1.0.0
 * License: GPL-2.0-or-later
 *
 * Instalacja: wgraj do wp-content/mu-plugins/ i dodaj do wp-config.php:
 *   define('GF_GA4_ID', 'G-XXXXXXXXXX');
 * Bez GF_GA4_ID wtyczka nic nie wyświetla. Cofnięcie: zmień nazwę pliku na .disabled.
 */
if (!defined('ABSPATH')) {
	exit;
}

function gf_consent_ga4_id() {
	if (!defined('GF_GA4_ID')) {
		return '';
	}
	$id = (string) GF_GA4_ID;
	return preg_match('/^G-[A-Z0-9]{4,16}$/', $id) ? $id : '';
}

/* Consent defaults must run before gtag.js loads, so this goes first in <head>. */
add_action('wp_head', function () {
	$id = gf_consent_ga4_id();
	if (!$id || is_admin()) {
		return;
	}
	?>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied', analytics_storage:'denied', wait_for_update:500});
(function(){
	var saved = null;
	try { saved = localStorage.getItem('gf-consent'); } catch (e) {}
	if (saved === 'granted') { gtag('consent', 'update', {analytics_storage:'granted'}); }
})();
gtag('js', new Date());
gtag('config', <?php echo wp_json_encode($id); ?>, {anonymize_ip:true});
</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=<?php echo esc_attr($id); ?>"></script>
	<?php
}, 1);

/* A small banner: analytics only, no advertising. The choice is remembered in localStorage. */
add_action('wp_footer', function () {
	if (!gf_consent_ga4_id() || is_admin()) {
		return;
	}
	$privacy = function_exists('get_privacy_policy_url') ? get_privacy_policy_url() : '';
	?>
<div id="gf-consent" role="dialog" aria-live="polite" aria-label="Zgoda na pomiar" hidden style="position:fixed;left:16px;right:16px;bottom:16px;z-index:99999;max-width:560px;margin:0 auto;background:#fff;color:#47132d;border:1px solid #e8e3e6;border-radius:16px;box-shadow:0 16px 40px rgba(71,19,45,.18);padding:18px 20px;font:15px/1.45 GHInter,Inter,Arial,sans-serif">
	<p style="margin:0 0 12px">Używamy Google Analytics, żeby wiedzieć, które części strony pomagają w projektowaniu boiska. Bez Twojej zgody nic nie mierzymy.<?php if ($privacy) : ?> <a href="<?php echo esc_url($privacy); ?>" style="color:#6336f5">Polityka prywatności</a><?php endif; ?></p>
	<div style="display:flex;gap:8px;flex-wrap:wrap">
		<button type="button" data-gf-consent="granted" style="min-height:44px;padding:0 18px;border-radius:12px;border:1px solid #6336f5;background:#6336f5;color:#fff;font:inherit;cursor:pointer">Zgadzam się</button>
		<button type="button" data-gf-consent="denied" style="min-height:44px;padding:0 18px;border-radius:12px;border:1px solid #e8e3e6;background:#fff;color:#47132d;font:inherit;cursor:pointer">Nie zgadzam się</button>
	</div>
</div>
<script>
(function(){
	var box = document.getElementById('gf-consent');
	if (!box) { return; }
	var saved = null;
	try { saved = localStorage.getItem('gf-consent'); } catch (e) {}
	if (!saved) { box.hidden = false; }
	box.addEventListener('click', function(e){
		var b = e.target.closest('[data-gf-consent]');
		if (!b) { return; }
		var v = b.getAttribute('data-gf-consent');
		try { localStorage.setItem('gf-consent', v); } catch (err) {}
		if (v === 'granted') { gtag('consent', 'update', {analytics_storage:'granted'}); }
		box.hidden = true;
	});
	window.gfConsentReset = function(){ try { localStorage.removeItem('gf-consent'); } catch (e) {} box.hidden = false; };
})();
</script>
	<?php
}, 99);

/* Shortcode [gf_zmien_zgode] for the privacy page: lets a visitor change their choice. */
add_shortcode('gf_zmien_zgode', function () {
	return '<button type="button" onclick="window.gfConsentReset ? gfConsentReset() : null">Zmień zgodę na pomiar</button>';
});
