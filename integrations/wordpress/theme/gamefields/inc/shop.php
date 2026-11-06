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

function gft_shop_ids() {
	return array_values( array_filter( array( gft_shop_product_id( 'poster' ), gft_shop_product_id( 'ball' ), gft_shop_product_id( 'shirt' ) ) ) );
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
			// poster formats: "30 × 40 cm" => [variation id, price]
			if ( $product->is_type( 'variable' ) ) {
				$formats = array();
				foreach ( $product->get_available_variations( 'objects' ) as $v ) {
					$attr = $v->get_attribute( 'format' );
					if ( $attr && $v->is_purchasable() ) {
						$formats[ $attr ] = array( $v->get_id(), (float) $v->get_price() );
					}
				}
				$data[ $k ]['formats'] = $formats;
			}
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
	if ( ! in_array( (int) $product_id, gft_shop_ids(), true ) ) {
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

/* Free shipping (from 299 zł) replaces the paid option instead of appearing next to it. */
add_filter( 'woocommerce_package_rates', function ( $rates ) {
	$free = array_filter( $rates, function ( $r ) {
		return 'free_shipping' === $r->get_method_id();
	} );
	return $free ? $free : $rates;
}, 20 );

/* Product data changes (prices, variations) must reach the cached homepage. */
add_action( 'woocommerce_update_product', function ( $id ) {
	if ( in_array( (int) $id, array( gft_shop_product_id( 'poster' ), gft_shop_product_id( 'ball' ) ), true ) ) {
		do_action( 'litespeed_purge_all' );
	}
} );

/* ---------- Data for Gamefields Studio (separate app, reads it cross-origin) ---------- */
function gft_shop_shipping() {
	$out = array( 'cost' => null, 'free_from' => null );
	if ( ! class_exists( 'WC_Shipping_Zones' ) ) {
		return $out;
	}
	foreach ( WC_Shipping_Zones::get_zones() as $zone ) {
		foreach ( $zone['shipping_methods'] as $m ) {
			if ( 'yes' !== $m->enabled ) {
				continue;
			}
			if ( 'flat_rate' === $m->id && null === $out['cost'] ) {
				$out['cost'] = (float) $m->get_option( 'cost' );
			}
			if ( 'free_shipping' === $m->id && null === $out['free_from'] ) {
				$out['free_from'] = (float) $m->get_option( 'min_amount' );
			}
		}
	}
	return $out;
}

function gft_shop_product_data( $key, $attr ) {
	$id      = gft_shop_product_id( $key );
	$product = $id && function_exists( 'wc_get_product' ) ? wc_get_product( $id ) : null;
	if ( ! $product ) {
		return null;
	}
	$row = array(
		'id'        => $id,
		'name'      => $product->get_name(),
		'price'     => (float) $product->get_price(),
		'url'       => get_permalink( $id ),
		'published' => 'publish' === $product->get_status(),
	);
	if ( $attr && $product->is_type( 'variable' ) ) {
		$row['variants'] = array();
		foreach ( $product->get_children() as $vid ) {
			$v = wc_get_product( $vid );
			if ( $v && $v->is_purchasable() ) {
				$row['variants'][] = array( 'id' => $vid, 'value' => $v->get_attribute( $attr ), 'price' => (float) $v->get_price() );
			}
		}
		$row['attribute'] = $attr;
	}
	return $row;
}

add_action( 'rest_api_init', function () {
	register_rest_route( 'gfs/v1', '/shop', array(
		'methods'             => 'GET',
		'permission_callback' => '__return_true',
		'callback'            => function () {
			$data = array(
				'currency' => 'PLN',
				'gross'    => true,
				'pay'      => gft_shop_has_payments(),
				'cart'     => function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : home_url( '/cart/' ),
				'contact'  => home_url( '/kontakt/' ),
				'shipping' => gft_shop_shipping(),
				'poster'   => gft_shop_product_data( 'poster', 'format' ),
				'ball'     => gft_shop_product_data( 'ball', '' ),
				'shirt'    => gft_shop_product_data( 'shirt', 'rozmiar' ),
				'notes'    => array( 'poster' => 'Sam print, bez ramy.', 'shirt' => 'Poliester, nadruk sublimacyjny.' ),
			);
			$res = rest_ensure_response( $data );
			$res->header( 'Cache-Control', 'public, max-age=300' );
			return $res;
		},
	) );
} );

/* Several lines in one link (Studio: e.g. a team of shirts in different sizes):
   /cart/?gf_items=<base64url JSON [{"id":4395,"v":4406,"q":3}, ...]>&gf_note=...  */
add_action( 'wp_loaded', function () {
	// phpcs:ignore WordPress.Security.NonceVerification -- public add-to-cart link, every value is validated
	if ( empty( $_GET['gf_items'] ) || ! function_exists( 'WC' ) || ! WC()->cart ) {
		return;
	}
	$raw   = base64_decode( strtr( sanitize_text_field( wp_unslash( $_GET['gf_items'] ) ), '-_', '+/' ) );
	$items = json_decode( (string) $raw, true );
	$note  = isset( $_GET['gf_note'] ) ? mb_substr( sanitize_text_field( wp_unslash( $_GET['gf_note'] ) ), 0, 700 ) : '';
	$added = 0;
	if ( is_array( $items ) ) {
		foreach ( array_slice( $items, 0, 30 ) as $it ) {
			$pid = isset( $it['id'] ) ? (int) $it['id'] : 0;
			$vid = isset( $it['v'] ) ? (int) $it['v'] : 0;
			$qty = isset( $it['q'] ) ? max( 1, min( 999, (int) $it['q'] ) ) : 1;
			if ( ! in_array( $pid, gft_shop_ids(), true ) ) {
				continue;
			}
			$attrs = array();
			if ( $vid ) {
				$v = wc_get_product( $vid );
				if ( ! $v || $v->get_parent_id() !== $pid ) {
					continue;
				}
				foreach ( $v->get_variation_attributes() as $k => $val ) {
					$attrs[ $k ] = $val;
				}
			}
			$extra = $note ? array( 'gf_note' => $note ) : array();
			if ( WC()->cart->add_to_cart( $pid, $qty, $vid, $attrs, $extra ) ) {
				$added++;
			}
		}
	}
	if ( $added ) {
		wc_add_notice( 'Projekt ze Studia jest w koszyku.', 'success' );
	}
	wp_safe_redirect( wc_get_cart_url() );
	exit;
}, 25 );
