<?php
/** Gamefields Global: read-only language and navigation helpers. PHP 7.4+. */
if ( ! defined( 'ABSPATH' ) ) { exit; }

function gft_global_language() {
    $lang = function_exists( 'pll_current_language' ) ? pll_current_language( 'slug' ) : '';
    return in_array( $lang, array( 'pl', 'en' ), true ) ? $lang : 'pl';
}

function gft_global_dictionary( $lang ) {
    static $cache = array();
    $lang = in_array( $lang, array( 'pl', 'en' ), true ) ? $lang : 'pl';
    if ( ! isset( $cache[$lang] ) ) {
        $path = __DIR__ . '/global-locales/' . $lang . '.json';
        $data = is_readable( $path ) ? json_decode( file_get_contents( $path ), true ) : array();
        $cache[$lang] = is_array( $data ) ? $data : array();
    }
    return $cache[$lang];
}

function gft_global_t( $key, $fallback = '' ) {
    $current = gft_global_dictionary( gft_global_language() );
    $base = gft_global_dictionary( 'pl' );
    return $current[$key] ?? $base[$key] ?? $fallback;
}

/** Never expose drafts, private or password-protected translations. */
function gft_global_public_page( $id ) {
    $post = $id ? get_post( (int) $id ) : null;
    return $post && 'publish' === $post->post_status && '' === $post->post_password
        && is_post_type_viewable( $post->post_type );
}

function gft_global_translation_url( $id, $lang ) {
    if ( ! in_array( $lang, array( 'pl', 'en' ), true ) || ! function_exists( 'pll_get_post' ) ) { return ''; }
    $target = pll_get_post( (int) $id, $lang );
    return gft_global_public_page( $target ) ? (string) get_permalink( $target ) : '';
}

/** English links only when the corresponding published page exists. PL remains unchanged. */
function gft_global_page_url( $slug ) {
    if ( 'pl' === gft_global_language() ) { return home_url( '/' . trim( $slug, '/' ) . '/' ); }
    $page = get_page_by_path( trim( $slug, '/' ) );
    return $page ? gft_global_translation_url( $page->ID, 'en' ) : '';
}

function gft_global_home_url() {
    $id = (int) get_option( 'page_on_front' );
    $lang = gft_global_language();
    if ( 'pl' === $lang ) {
        return function_exists( 'pll_home_url' ) ? pll_home_url( 'pl' ) : home_url( '/' );
    }
    if ( ! gft_global_translation_url( $id, $lang ) ) { return ''; }
    return function_exists( 'pll_home_url' ) ? pll_home_url( $lang ) : '';
}

/** Call inside the shared header, not via JS. No switcher for missing translations. */
function gft_global_switcher() {
    if ( ! is_singular() && ! is_front_page() ) { return; }
    $id = (int) get_queried_object_id();
    $lang = gft_global_language();
    $other = 'pl' === $lang ? 'en' : 'pl';
    $url = gft_global_translation_url( $id, $other );
    if ( ! $url ) { return; }
    if ( is_front_page() && function_exists( 'pll_home_url' ) ) { $url = pll_home_url( $other ); }
    printf( '<nav class="gft-language" aria-label="%s"><span aria-current="true" lang="%s">%s</span> <a href="%s" hreflang="%s" lang="%s">%s</a></nav>',
        esc_attr( gft_global_t( 'language', 'Język' ) ), esc_attr( $lang ), esc_html( strtoupper( $lang ) ),
        esc_url( $url ), esc_attr( $other ), esc_attr( $other ), esc_html( strtoupper( $other ) ) );
}

/** Preserve existing PL destinations; do not invent untranslated English routes. */
function gft_global_anchor_url( $anchor ) {
    if ( 'pl' === gft_global_language() ) { return home_url( '/#' . $anchor ); }
    $home = gft_global_home_url();
    return $home ? trailingslashit( $home ) . '#' . $anchor : '';
}

function gft_global_link( $key, $url, $class = '', $arrow = false ) {
    if ( ! $url ) { return; }
    printf( '<a%s href="%s">%s%s</a>', $class ? ' class="' . esc_attr( $class ) . '"' : '',
        esc_url( $url ), esc_html( gft_global_t( $key ) ), $arrow ? ' <span aria-hidden="true">→</span>' : '' );
}

function gft_global_shop_url() {
    // EN checkout is not enabled until the WooCommerce localisation audit is complete.
    return 'pl' === gft_global_language() ? ( function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/shop/' ) ) : '';
}

function gft_global_privacy_url() {
    $url = get_privacy_policy_url() ? get_privacy_policy_url() : home_url( '/polityka-prywatnosci/' );
    if ( 'pl' === gft_global_language() ) { return $url; }
    $id = (int) get_option( 'wp_page_for_privacy_policy' );
    return $id ? gft_global_translation_url( $id, 'en' ) : gft_global_page_url( 'polityka-prywatnosci' );
}
