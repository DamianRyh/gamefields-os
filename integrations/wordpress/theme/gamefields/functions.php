<?php
/**
 * Gamefields theme.
 *
 * - One header and footer for the whole site, identical in look to the homepage (which brings its own).
 * - Subpages built as custom HTML (gfsilo, gfbrand, gfguide, ...) keep their content; their in-content
 *   headers and footers are hidden and their tokens are mapped to the homepage identity in gft.css.
 * - The Additional CSS saved under Savoy is still printed (read-only) until it is consolidated, so nothing
 *   that relied on it disappears when the theme is switched.
 * - WooCommerce works with its default templates, styled by gft.css.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'GFT_VERSION', '1.0.5' );

add_action( 'after_setup_theme', function () {
	load_theme_textdomain( 'gamefields' );
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script', 'navigation-widgets' ) );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'woocommerce', array(
		'thumbnail_image_width' => 600,
		'single_image_width'    => 1000,
		'product_grid'          => array( 'default_columns' => 3, 'min_columns' => 1, 'max_columns' => 4 ),
	) );
	add_theme_support( 'wc-product-gallery-zoom' );
	add_theme_support( 'wc-product-gallery-lightbox' );
	add_theme_support( 'wc-product-gallery-slider' );
	// No menu locations on purpose: WordPress would map Savoy's old menu onto them on switch.
	// The navigation lives in gft_nav_items() so it always matches the homepage.
} );

/* ---------- assets ---------- */
add_action( 'wp_enqueue_scripts', function () {
	$uri = get_template_directory_uri();
	wp_enqueue_style( 'gft', $uri . '/assets/css/gft.css', array(), GFT_VERSION );
	wp_enqueue_script( 'gft', $uri . '/assets/js/gft.js', array(), GFT_VERSION, array( 'strategy' => 'defer', 'in_footer' => true ) );
	// the block library CSS is only needed where blocks are used (cart, checkout, posts)
	if ( is_front_page() ) {
		wp_dequeue_style( 'wp-block-library' );
		wp_dequeue_style( 'global-styles' );
		wp_dequeue_style( 'classic-theme-styles' );
	}
}, 20 );

add_action( 'wp_head', function () {
	printf(
		'<link rel="preload" href="%s" as="font" type="font/woff2" crossorigin>' . "\n",
		esc_url( get_template_directory_uri() . '/assets/fonts/GHInter-sub.woff2' )
	);
}, 1 );

/* The Additional CSS written under Savoy (cookie banner, subpage fixes, City templates) stays in effect. */
add_action( 'wp_head', function () {
	if ( trim( (string) wp_get_custom_css() ) !== '' ) {
		return; // the theme has its own Additional CSS now
	}
	$legacy = wp_get_custom_css( 'savoy' );
	// The monochrome "Minimal v2" identity (incl. City) and its GamefieldsSans font are replaced by
	// gft-standard.css; keep only the cookie banner and headline fixes written on 2026-11-06.
	$cut = strpos( (string) $legacy, '/* Gamefields 2026-11-06: cookie banner' );
	if ( false !== $cut ) {
		$legacy = substr( $legacy, $cut );
	}
	if ( $legacy ) {
		echo '<style id="gft-legacy-css">' . strip_tags( $legacy ) . "</style>\n";
	}
}, 100 );

/* The identity layer must come after the legacy CSS. */
add_action( 'wp_head', function () {
	printf(
		'<link rel="stylesheet" id="gft-standard-css" href="%s" media="all">' . "\n",
		esc_url( get_template_directory_uri() . '/assets/css/gft-standard.css?ver=' . GFT_VERSION )
	);
}, 120 );

add_filter( 'body_class', function ( $classes ) {
	$classes[] = 'gft';
	if ( is_front_page() ) {
		$classes[] = 'gft-front';
	}
	return $classes;
} );

/* WordPress emoji are not used anywhere */
remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );

/* ---------- navigation ---------- */
function gft_nav_items() {
	return array(
		array( 'Boiska', home_url( '/#boiska' ), '' ),
		array( 'Dla kogo', home_url( '/#dla-kogo' ), '' ),
		array( 'Realizacje', home_url( '/realizacje-gamefields/' ), 'realizacje-gamefields' ),
		array( 'Wiedza', home_url( '/baza-wiedzy/' ), 'baza-wiedzy' ),
		array( 'Sklep', function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/shop/' ), 'shop' ),
		array( 'Kontakt', home_url( '/kontakt/' ), 'kontakt' ),
	);
}

function gft_is_current( $slug ) {
	if ( ! $slug ) {
		return false;
	}
	if ( 'shop' === $slug ) {
		return function_exists( 'is_woocommerce' ) ? ( is_woocommerce() || is_cart() || is_checkout() ) : false;
	}
	return is_page( $slug );
}

function gft_primary_nav() {
	foreach ( gft_nav_items() as $item ) {
		printf(
			'<a href="%s"%s>%s</a>',
			esc_url( $item[1] ),
			gft_is_current( $item[2] ) ? ' aria-current="page"' : '',
			esc_html( $item[0] )
		);
	}
}

function gft_cart_link() {
	if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
		return;
	}
	$count = WC()->cart->get_cart_contents_count();
	if ( $count < 1 ) {
		return;
	}
	printf(
		'<a class="gft-cart" href="%s" aria-label="%s">Koszyk <b>%d</b></a>',
		esc_url( wc_get_cart_url() ),
		esc_attr( sprintf( 'Koszyk, produkty: %d', $count ) ),
		(int) $count
	);
}

/* Pages whose content already has its own hero and H1 get no theme title. */
function gft_content_has_h1( $post = null ) {
	$post = get_post( $post );
	if ( ! $post ) {
		return false;
	}
	if ( preg_match( '/<h1[\s>]/i', (string) $post->post_content ) ) {
		return true;
	}
	// Elementor keeps the real layout in post meta; a heading widget set to H1 or an H1 inside a text widget
	$el = (string) get_post_meta( $post->ID, '_elementor_data', true );
	if ( '' === $el ) {
		return false;
	}
	return false !== strpos( $el, '"header_size":"h1"' ) || false !== stripos( $el, '<h1' ) || false !== stripos( $el, '\\u003ch1' );
}

/* One H1 per page: product descriptions use H1 for their own headings (the product title is the H1),
   and some older posts carry a second H1 in their content (the first one stays, the rest become H2). */
function gft_h1_to_h2( $html ) {
	return preg_replace( '/<(\/?)h1([\s>])/i', '<$1h2$2', $html );
}
add_filter( 'woocommerce_short_description', 'gft_h1_to_h2', 20 );
add_filter( 'the_content', function ( $content ) {
	if ( function_exists( 'is_product' ) && is_product() ) {
		return gft_h1_to_h2( $content );
	}
	if ( is_singular( 'post' ) ) {
		$seen = 0;
		$content = preg_replace_callback( '/<(\/?)h1([\s>])/i', function ( $m ) use ( &$seen ) {
			if ( '' === $m[1] ) {
				$seen++;
			}
			return $seen > 1 ? '<' . $m[1] . 'h2' . $m[2] : $m[0];
		}, $content );
	}
	return $content;
}, 20 );

/* Custom HTML pages (gf* templates: Studio, OS, Radar, privacy, ...) are printed edge to edge. */
function gft_is_custom_html( $post = null ) {
	$post = get_post( $post );
	return $post ? (bool) preg_match( '/class=["\'](gf[a-z0-9-]*|gh-[a-z0-9-]+)[\s"\']/i', (string) $post->post_content ) : false;
}

/* ---------- WooCommerce ---------- */
remove_action( 'woocommerce_before_main_content', 'woocommerce_output_content_wrapper', 10 );
remove_action( 'woocommerce_after_main_content', 'woocommerce_output_content_wrapper_end', 10 );
remove_action( 'woocommerce_sidebar', 'woocommerce_get_sidebar', 10 );

add_filter( 'loop_shop_columns', function () {
	return 3;
} );

/* Products without a price ask for a quote instead of showing an empty price */
add_filter( 'woocommerce_get_price_html', function ( $html, $product ) {
	if ( '' === $product->get_price() ) {
		return '<span class="gft-quote">Cena na zapytanie</span>';
	}
	return $html;
}, 10, 2 );

add_filter( 'woocommerce_loop_add_to_cart_link', function ( $link, $product ) {
	if ( '' === $product->get_price() ) {
		return sprintf( '<a class="button gft-ask-btn" href="%s">Zapytaj o wycenę</a>', esc_url( home_url( '/kontakt/?produkt=' . rawurlencode( $product->get_name() ) ) ) );
	}
	return $link;
}, 10, 2 );

add_action( 'woocommerce_single_product_summary', function () {
	global $product;
	if ( $product && '' === $product->get_price() ) {
		printf( '<p><a class="button gft-ask-btn" href="%s">Zapytaj o wycenę</a></p>', esc_url( home_url( '/kontakt/?produkt=' . rawurlencode( $product->get_name() ) ) ) );
	}
}, 31 );

/* Breadcrumb in Polish style */
add_filter( 'woocommerce_breadcrumb_defaults', function ( $d ) {
	$d['delimiter']   = ' <span aria-hidden="true">/</span> ';
	$d['wrap_before'] = '<nav class="gft-crumbs" aria-label="Okruszki">';
	$d['wrap_after']  = '</nav>';
	$d['home']        = 'Gamefields';
	return $d;
} );
