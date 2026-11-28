<?php
/**
 * Plugin Name: Gamefields — poprawki treści
 * Description: Podmienia w treści stron adresy obrazów usuniętych z biblioteki mediów na istniejące obrazy Gamefields. Nie zmienia bazy danych; wyłączenie = usunięcie pliku.
 * Version: 1.0.0
 * Author: Gamefields
 *
 * Źródło: repozytorium DamianRyh/gamefields-os, integrations/wordpress/mu-plugins/gamefields-content-fixes.php
 * Instalacja: wgraj do wp-content/mu-plugins/ (utwórz katalog, jeśli go nie ma). WordPress ładuje plik automatycznie.
 *
 * Powód (audyt 2026-11-11): trzy pliki z 2025/06 zostały usunięte z mediów, a sześć podstron nadal używa ich jako tła
 * nagłówka (404): /malowanie-boisk/, /renowacja-boisk/, /projektowanie-boisk/, /boiska-dla-deweloperow/,
 * /boiska-do-koszykowki/, /korty-padel/. Zamiast nich podstawiamy własne rendery Gamefields (bez zdjęć Google).
 */

if (!defined('ABSPATH')) {
	exit;
}

function gamefields_content_fixes_map() {
	$cdn = 'https://cdn.jsdelivr.net/gh/DamianRyh/gamefields-os@814b77d071dcc483696055c4914e57c8f6d0b937/integrations/studio/canvas-editor/public/surface-projects/';
	$uploads = 'https://www.gamefields.eu/wp-content/uploads/';
	return array(
		// Malowanie boisk: kolorowe boisko Signature „Riviera Court” w parku (render Studio).
		$uploads . '2025/06/MALOWANIE-BOISK-SPORTOWYCH-BETONOWYCH-WZORNICTWO-USLUGA-MALOWANIA-BETONU-.png' => $cdn . 'riviera-court-park.webp',
		// Renowacja: boisko „Play System” w parku (render Studio).
		$uploads . '2025/06/RENOWQCJA-BOISK-SPORTOWYCH-RENOWACJA-NAWIERZCHNI-BETONOWYCH-.png' => $cdn . 'play-system-park.webp',
		// Projektowanie i wzornictwo: plansza Studio „Organic Flow” z biblioteki mediów.
		$uploads . '2025/06/PROJEKTOWANIA-WZORNICTWA-DLA-BOISK-MALOWANIE-BOISK-WE-WZORY-MURALNE-BOISKOWE-.png' => $uploads . '2026/10/Gamefields-Studio-%E2%80%94-Organic-Flow.webp',
	);
}

function gamefields_content_fixes_apply($html) {
	if (!is_string($html) || strpos($html, '/uploads/2025/06/') === false) {
		return $html;
	}
	$map = gamefields_content_fixes_map();
	// Te same pliki mogą występować także jako adres względny albo bez „www”.
	foreach ($map as $old => $new) {
		$html = str_replace(
			array($old, str_replace('https://www.', 'https://', $old), str_replace('https://www.gamefields.eu', '', $old)),
			$new,
			$html
		);
	}
	return $html;
}

add_filter('the_content', 'gamefields_content_fixes_apply', 99);
add_filter('render_block', 'gamefields_content_fixes_apply', 99);
