<?php
/**
 * Plugin Name: GAMEFIELDS Court Objects
 * Description: Adds the standalone Court Objects configurator and an optional navigation item to Gamefields.
 * Version: 1.0.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Author: GAMEFIELDS
 */
if (!defined('ABSPATH')) { exit; }

function gfco_page_id() {
    $id = (int) get_option('gfco_page_id', 0);
    return $id && get_post_meta($id, '_gfco_owned', true) === '1' ? $id : 0;
}

function gfco_activate() {
    if (!is_readable(__DIR__ . '/dist/index.html')) {
        wp_die('Brakuje pliku konfiguratora. Zainstaluj kompletną paczkę ZIP GAMEFIELDS Court Objects.');
    }
    $id = gfco_page_id();
    if ($id && get_post_status($id) === 'publish') { return; }
    if ($id && get_post_status($id) === 'trash') {
        wp_untrash_post($id);
        wp_update_post(array('ID' => $id, 'post_status' => 'publish'));
        return;
    }
    if ($id && get_post($id)) {
        wp_update_post(array('ID' => $id, 'post_status' => 'publish'));
        return;
    }
    // Never overwrite an existing page belonging to the site or another plugin.
    if (get_page_by_path('court-objects')) {
        wp_die('Adres court-objects jest już zajęty. Zmień slug istniejącej strony przed aktywacją tej wtyczki. Żadna treść nie została nadpisana.');
    }
    $id = wp_insert_post(array(
        'post_type' => 'page', 'post_status' => 'publish',
        'post_title' => 'COURT OBJECTS', 'post_name' => 'court-objects',
        'post_content' => '[gamefields_court_objects]',
        'meta_input' => array('_gfco_owned' => '1'),
    ), true);
    if (is_wp_error($id)) { wp_die(esc_html($id->get_error_message())); }
    update_option('gfco_page_id', (int) $id, false);
}
register_activation_hook(__FILE__, 'gfco_activate');

// The owned WordPress page serves the same React app as /objects in Studio.
add_action('template_redirect', function () {
    $id = gfco_page_id();
    if (!$id || !is_page($id) || is_preview() || is_feed()) { return; }
    $file = __DIR__ . '/dist/index.html';
    if (!is_readable($file)) { return; }
    status_header(200);
    header('Content-Type: text/html; charset=UTF-8');
    header('X-Content-Type-Options: nosniff');
    // The HTML is public and identical for all users. Drafts stay in browser storage.
    if ($_SERVER['REQUEST_METHOD'] !== 'HEAD') { readfile($file); }
    exit;
}, 0);

add_shortcode('gamefields_court_objects', function () {
    $url = plugins_url('dist/index.html', __FILE__);
    return '<iframe src="' . esc_url($url) . '" title="GAMEFIELDS Court Objects" style="width:100%;height:100vh;min-height:720px;border:0" loading="lazy"></iframe>';
});

add_action('admin_menu', function () {
    add_options_page('GAMEFIELDS Court Objects', 'Court Objects', 'edit_theme_options', 'gamefields-court-objects', 'gfco_settings');
});

function gfco_settings() {
    if (!current_user_can('edit_theme_options')) { return; }
    $id = gfco_page_id();
    $message = '';
    if (isset($_POST['gfco_add_menu'])) {
        check_admin_referer('gfco_add_menu');
        $menu = isset($_POST['gfco_menu']) ? absint($_POST['gfco_menu']) : 0;
        if ($id && get_post_status($id) === 'publish' && wp_get_nav_menu_object($menu)) {
            $items = wp_get_nav_menu_items($menu);
            $exists = false;
            foreach ($items ? $items : array() as $item) {
                if ($item->type === 'post_type' && $item->object === 'page' && (int) $item->object_id === $id) { $exists = true; }
            }
            if (!$exists) {
                $result = wp_update_nav_menu_item($menu, 0, array(
                    'menu-item-title' => 'COURT OBJECTS', 'menu-item-object-id' => $id,
                    'menu-item-object' => 'page', 'menu-item-type' => 'post_type',
                    'menu-item-status' => 'publish',
                ));
                $message = is_wp_error($result) ? $result->get_error_message() : 'Dodano COURT OBJECTS do wybranego menu.';
            } else { $message = 'COURT OBJECTS jest już w tym menu.'; }
        } else { $message = 'Wybierz istniejące menu i sprawdź, czy strona Court Objects jest opublikowana.'; }
    }
    echo '<div class="wrap"><h1>GAMEFIELDS Court Objects</h1>';
    if ($message) { echo '<div class="notice notice-info"><p>' . esc_html($message) . '</p></div>'; }
    if ($id) {
        echo '<p><a class="button button-primary" href="' . esc_url(get_permalink($id)) . '" target="_blank" rel="noopener">Otwórz konfigurator</a></p>';
    }
    echo '<p>Konfigurator działa lokalnie w przeglądarce. Zamówienia i zapytania są szkicami — nie są wysyłane, płatności nie są pobierane.</p>';
    $menus = wp_get_nav_menus();
    if ($menus) {
        echo '<h2>Dodaj opcję do menu strony</h2><form method="post">';
        wp_nonce_field('gfco_add_menu');
        echo '<label for="gfco_menu">Menu: </label><select id="gfco_menu" name="gfco_menu">';
        foreach ($menus as $menu) { echo '<option value="' . esc_attr($menu->term_id) . '">' . esc_html($menu->name) . '</option>'; }
        echo '</select> <button class="button" name="gfco_add_menu" value="1">Dodaj COURT OBJECTS</button></form>';
    } else {
        echo '<p>Jeżeli motyw korzysta z edytora witryny, dodaj stronę COURT OBJECTS do bloku Nawigacja w Wygląd → Edytor.</p>';
    }
    echo '<p>Opcjonalny shortcode do osadzenia w innej stronie: <code>[gamefields_court_objects]</code>.</p>';
    echo '<p>Dezaktywacja nie usuwa strony ani menu. Aby cofnąć wdrożenie, usuń pozycję menu, ustaw stronę Court Objects jako szkic i dezaktywuj wtyczkę.</p></div>';
}
