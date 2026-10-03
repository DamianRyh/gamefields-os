<?php
/**
 * Plugin Name: Gamefields PLAY
 * Description: Serves Gamefields PLAY directly on gamefields.eu/play using its existing application backend.
 * Version: 0.9.0
 */
if (!defined('ABSPATH')) { exit; }

add_action('init', function () {
    $uri = isset($_SERVER['REQUEST_URI']) ? (string) $_SERVER['REQUEST_URI'] : '';
    $path = (string) parse_url($uri, PHP_URL_PATH);
    $app = $path === '/play' || strpos($path, '/play/') === 0;
    $api = $path === '/api/play' || strpos($path, '/api/play/') === 0 || in_array($path, array('/api/quote', '/api/templates'), true);
    $asset = preg_match('#^/(?:assets|_next)/[a-zA-Z0-9_./-]+$#', $path) === 1 || in_array($path, array('/manifest.webmanifest', '/favicon.svg'), true);
    if (!$app && !$api && !$asset) { return; }
    if (strpos($path, '..') !== false || strpos($path, "\0") !== false) { status_header(400); exit; }
    $method = strtoupper(isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET');
    if (!in_array($method, array('GET', 'HEAD', 'POST'), true)) { status_header(405); header('Allow: GET, HEAD, POST'); exit; }
    $host = strtolower(isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : '');
    if (!in_array($host, array('gamefields.eu', 'www.gamefields.eu'), true)) { status_header(400); exit; }
    if ($method === 'POST') {
        $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
        if (($origin && $origin !== 'https://' . $host) || (isset($_SERVER['HTTP_SEC_FETCH_SITE']) && $_SERVER['HTTP_SEC_FETCH_SITE'] === 'cross-site')) {
            status_header(403); header('Content-Type: application/json'); echo '{"ok":false,"error":"INVALID_ORIGIN"}'; exit;
        }
    }
    $upstream = 'https://gamefields-studio.ryhfs90.chatgpt.site';
    $headers = array('Accept-Encoding' => 'identity');
    foreach (array('ACCEPT', 'CONTENT_TYPE', 'RSC', 'NEXT_ROUTER_STATE_TREE', 'NEXT_ROUTER_PREFETCH', 'NEXT_URL', 'IF_NONE_MATCH', 'IF_MODIFIED_SINCE') as $key) {
        $serverKey = $key === 'CONTENT_TYPE' ? 'CONTENT_TYPE' : 'HTTP_' . $key;
        if (isset($_SERVER[$serverKey])) { $headers[str_replace('_', '-', $key)] = (string) $_SERVER[$serverKey]; }
    }
    // WordPress authentication and hosting identity never cross into PLAY.
    if (isset($_COOKIE['gf_play_session']) && preg_match('/^[A-Za-z0-9_-]{20,100}$/', $_COOKIE['gf_play_session'])) {
        $headers['Cookie'] = 'gf_play_session=' . $_COOKIE['gf_play_session'];
    }
    if ($method === 'POST') { $headers['Origin'] = $upstream; }
    $body = $method === 'POST' ? file_get_contents('php://input', false, null, 0, 1048577) : '';
    if (strlen($body) > 1048576) { status_header(413); exit; }
    $response = wp_remote_request($upstream . $uri, array(
        'method' => $method, 'headers' => $headers, 'body' => $body,
        'timeout' => 30, 'redirection' => 0, 'sslverify' => true,
        'limit_response_size' => 12582912,
    ));
    if (is_wp_error($response)) {
        status_header(503); header('Cache-Control: no-store'); header('Content-Type: text/html; charset=utf-8');
        echo '<!doctype html><html lang="pl"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Gamefields PLAY</title><body style="background:#071016;color:#fff;font:16px Arial;padding:30px"><h1>Gamefields PLAY</h1><p>Nie udało się połączyć. Spróbuj ponownie za chwilę.</p><a style="color:#77ff55" href="/play">Odśwież PLAY</a></body></html>'; exit;
    }
    status_header(wp_remote_retrieve_response_code($response));
    foreach (array('content-type', 'etag', 'last-modified', 'vary') as $name) {
        $value = wp_remote_retrieve_header($response, $name);
        if ($value && is_string($value)) { header($name . ': ' . $value); }
    }
    $location = wp_remote_retrieve_header($response, 'location');
    if ($location) {
        if (strpos($location, $upstream . '/') === 0) { $location = substr($location, strlen($upstream)); }
        if (strpos($location, '/') === 0 && strpos($location, '//') !== 0) { header('Location: https://' . $host . $location); }
        else { status_header(502); exit; }
    }
    foreach (wp_remote_retrieve_cookies($response) as $cookie) {
        if ($cookie->name !== 'gf_play_session') { continue; }
        $value = $cookie->value;
        if ($value !== '' && !preg_match('/^[A-Za-z0-9_-]{20,100}$/', $value)) { continue; }
        setcookie('gf_play_session', $value, array(
            'expires' => $cookie->expires ? (int) $cookie->expires : ($value === '' ? time() - 3600 : time() + 2592000),
            'path' => '/', 'secure' => true, 'httponly' => true, 'samesite' => 'Lax',
        ));
    }
    // Private PLAY responses never enter the WordPress page cache.
    if ($app || $api) {
        if (!defined('DONOTCACHEPAGE')) { define('DONOTCACHEPAGE', true); }
        header('Cache-Control: private, no-store');
        do_action('litespeed_control_set_nocache', 'Gamefields PLAY sessions');
    } else { header('Cache-Control: public, max-age=3600'); }
    if ($method !== 'HEAD') { echo wp_remote_retrieve_body($response); }
    exit;
}, -100);
