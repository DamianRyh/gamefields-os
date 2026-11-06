<?php
/**
 * Gamefields shop: designs from the homepage creators go into the cart and the order.
 *
 * The poster and ball creators on the homepage send the customer to
 *   /koszyk?add-to-cart=<id>&quantity=<n>&gf_config=<link to the design>&gf_note=<summary>
 * The link and the summary stay with the cart line, appear in the cart and in the order (admin and e-mails).
 * window.GF_SHOP tells the homepage whether a payment method is active; without one the creators fall back
 * to the inquiry form (with the price).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const GFT_SHOP_SLUGS = array(
	'poster' => 'plakat-z-twoim-boiskiem',
	'ball'   => 'pilka-z-twoim-wzorem',
	'shirt'  => 'koszulka-gamefields',
);

function gft_shop_product_id( $key ) {
	static $ids = array();
	if ( ! isset( $ids[ $key ] ) ) {
		$post        = get_page_by_path( GFT_SHOP_SLUGS[ $key ], OBJECT, 'product' );
		$ids[ $key ] = $post ? (int) $post->ID : 0;
	}
	return $ids[ $key ];
}

function gft_shop_has_payments() {
	if ( ! function_exists( 'WC' ) || ! WC()->payment_gateways() ) {
		return false;
	}
	foreach ( WC()->payment_gateways()->payment_gateways() as $gw ) {
		if ( 'yes' === $gw->enabled ) {
			return true;
		}
	}
	return false;
}

/* Data for the homepage creators. */
add_action( 'wp_head', function () {
	if ( ! is_front_page() || ! function_exists( 'wc_get_product' ) ) {
		return;
	}
	$data = array( 'pay' => gft_shop_has_payments(), 'cart' => wc_get_cart_url() );
	foreach ( array( 'poster', 'ball' ) as $k ) {
		$id      = gft_shop_product_id( $k );
		$product = $id ? wc_get_product( $id ) : null;
		if ( $product && 'publish' === $product->get_status() && $product->is_purchasable() ) {
			$data[ $k ] = array( 'id' => $id, 'price' => (float) $product->get_price(), 'url' => get_permalink( $id ) );
		}
	}
	echo '<script id="gft-shop">window.GF_SHOP=' . wp_json_encode( $data ) . ";</script>\n";
}, 5 );

/* Enabling a payment method changes what the cached homepage should offer. */
foreach ( array( 'woocommerce_stripe_settings', 'woocommerce_bacs_settings', 'woocommerce_cod_settings', 'woocommerce_gateway_order' ) as $opt ) {
	add_action( 'update_option_' . $opt, function () {
		do_action( 'litespeed_purge_all' );
	} );
}

/* Design link and summary travel with the cart line. */
function gft_shop_clean_link( $raw ) {
	$url = esc_url_raw( wp_unslash( (string) $raw ) );
	if ( '' === $url || 0 !== strpos( $url, home_url( '/' ) ) ) {
		return '';
	}
	return ( false !== strpos( $url, 'plakat=' ) || false !== strpos( $url, 'pilka=' ) ) ? substr( $url, 0, 3000 ) : '';
}

add_filter( 'woocommerce_add_cart_item_data', function ( $data, $product_id ) {
	if ( ! in_array( (int) $product_id, array( gft_shop_product_id( 'poster' ), gft_shop_product_id( 'ball' ) ), true ) ) {
		return $data;
	}
	// phpcs:ignore WordPress.Security.NonceVerification -- public add-to-cart link, values are sanitised
	$link = isset( $_REQUEST['gf_config'] ) ? gft_shop_clean_link( $_REQUEST['gf_config'] ) : '';
	$note = isset( $_REQUEST['gf_note'] ) ? mb_substr( sanitize_text_field( wp_unslash( $_REQUEST['gf_note'] ) ), 0, 700 ) : '';
	if ( $link ) {
		$data['gf_config'] = $link;
	}
	if ( $note ) {
		$data['gf_note'] = $note;
	}
	return $data;
}, 10, 2 );

add_filter( 'woocommerce_get_item_data', function ( $items, $cart_item ) {
	if ( ! empty( $cart_item['gf_note'] ) ) {
		$items[] = array( 'key' => 'Projekt', 'value' => $cart_item['gf_note'] );
	}
	if ( ! empty( $cart_item['gf_config'] ) ) {
		$items[] = array( 'key' => 'Link do projektu', 'value' => $cart_item['gf_config'], 'display' => '<a href="' . esc_url( $cart_item['gf_config'] ) . '">Otwórz projekt</a>' );
	}
	return $items;
}, 10, 2 );

add_action( 'woocommerce_checkout_create_order_line_item', function ( $item, $key, $values ) {
	if ( ! empty( $values['gf_note'] ) ) {
		$item->add_meta_data( 'Projekt', $values['gf_note'], true );
	}
	if ( ! empty( $values['gf_config'] ) ) {
		$item->add_meta_data( 'Link do projektu', $values['gf_config'], true );
	}
}, 10, 3 );

/* After a creator link adds the design, land on a clean cart URL (a refresh must not add it again). */
add_filter( 'woocommerce_add_to_cart_redirect', function ( $url ) {
	// phpcs:ignore WordPress.Security.NonceVerification
	return isset( $_REQUEST['gf_config'] ) ? wc_get_cart_url() : $url;
} );
