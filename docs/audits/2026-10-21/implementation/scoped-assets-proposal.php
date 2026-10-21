<?php
/**
 * REVIEW PROPOSAL ONLY — NOT INSTALLED OR EXECUTED.
 * Stage A: a small allowlist of verified standalone offer pages.
 * Apply in an owner-reviewed child theme or a deliberately enabled snippet,
 * then run the visual and functional checks described in performance-findings.md.
 */
add_action('wp_enqueue_scripts', function () {
    if (is_admin() || wp_doing_ajax() || is_feed() || is_preview()
        || (defined('REST_REQUEST') && REST_REQUEST)
        || (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] !== 'GET')) {
        return;
    }
    // Keep every purchase, account, legacy product and API context untouched.
    foreach (array('is_woocommerce', 'is_cart', 'is_checkout', 'is_account_page') as $test) {
        if (function_exists($test) && $test()) {
            return;
        }
    }
    $scopes = array(
        3465 => 'gfcatalog',
        3689 => 'gfseo',
        3704 => 'gfsilo',
        3715 => 'gfbrand',
        3717 => 'gfbrand',
        3724 => 'gfcommercial',
    );
    $id = get_queried_object_id();
    if (!is_page() || !isset($scopes[$id])) {
        return;
    }
    $content = (string) get_post_field('post_content', $id);
    if (strpos($content, $scopes[$id]) === false) {
        return;
    }
    // A later content change adding a form or commerce widget opts the page out.
    foreach (array('[contact-form-7', 'wpcf7', '[woocommerce', '[product', 'wp:woocommerce', 'elementor-widget') as $marker) {
        if (strpos($content, $marker) !== false) {
            return;
        }
    }
    // Root homepage (3462), Studio (3644) and OS (3964) are intentionally absent.
    // Do not remove shared Savoy JS: nm-core actually invokes slick/magnificPopup.
    foreach (array('wcboost-variation-swatches', 'nm-portfolio', 'nm-shop', 'selectod') as $handle) {
        $needed = false;
        $styles = wp_styles();
        foreach ($styles->queue as $other) {
            if ($other !== $handle && isset($styles->registered[$other])
                && in_array($handle, $styles->registered[$other]->deps, true)) {
                $needed = true;
                break;
            }
        }
        if (!$needed) {
            wp_dequeue_style($handle);
        }
    }
    // Keep JS, including CF7, consent management, WooCommerce and Savoy, intact.
}, PHP_INT_MAX);
