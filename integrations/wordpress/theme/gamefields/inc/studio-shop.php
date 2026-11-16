<?php
/**
 * Shop catalogue = Studio catalogue (2026-11-16).
 *
 * data/studio-shop.json (built by integrations/wordpress/offer/build_studio_shop.py from the Studio price files)
 * lists the 8 Studio models and the Studio surfaces with their sale prices. When an administrator opens wp-admin
 * and the file version differs from the last synced one, this module:
 *   - creates or updates one external product per entry (matched by SKU), button to the Studio;
 *   - hides the old catalogue from the shop and search (catalog visibility "hidden", never deleted;
 *     the previous visibility is kept in _gft_prev_visibility for a rollback);
 *   - hides the creator products (poster) from the catalogue only; the homepage creators keep using them.
 * Old product URLs redirect (301) to the matching Studio product or to the shop.
 * Prices shown net first, as in the Studio and on the homepage. Nothing here can be bought in the cart.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function gft_studio_shop_data() {
	static $data = null;
	if ( null === $data ) {
		$file = get_template_directory() . '/data/studio-shop.json';
		$data = file_exists( $file ) ? json_decode( (string) file_get_contents( $file ), true ) : null;
		if ( ! is_array( $data ) || empty( $data['products'] ) ) {
			$data = array( 'version' => '', 'products' => array(), 'legacy' => array(), 'catalogHidden' => array() );
		}
	}
	return $data;
}

function gft_is_studio_product( $product ) {
	if ( ! $product ) {
		return false;
	}
	$id = $product->get_parent_id() ? $product->get_parent_id() : $product->get_id();
	return '1' === get_post_meta( $id, '_gft_studio', true );
}

function gft_studio_money( $n ) {
	$dec = ( floor( $n ) == $n ) ? 0 : 2;
	return number_format( (float) $n, $dec, ',', "\xC2\xA0" ) . "\xC2\xA0zł";
}

/* ---------- sync (wp-admin, administrators only, once per data version) ---------- */
function gft_studio_shop_image( $img, $name ) {
	if ( is_array( $img ) && ! empty( $img['fromProduct'] ) ) {
		return (int) get_post_thumbnail_id( (int) $img['fromProduct'] );
	}
	if ( ! is_string( $img ) || '' === $img ) {
		return 0;
	}
	$id = attachment_url_to_postid( $img );
	if ( $id ) {
		return $id;
	}
	$found = get_posts( array( 'post_type' => 'attachment', 'post_status' => 'inherit', 'numberposts' => 1, 'fields' => 'ids', 'meta_key' => '_gft_src', 'meta_value' => $img ) );
	if ( $found ) {
		return (int) $found[0];
	}
	require_once ABSPATH . 'wp-admin/includes/media.php';
	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/image.php';
	$id = media_sideload_image( $img, 0, $name, 'id' );
	if ( is_wp_error( $id ) ) {
		return 0;
	}
	update_post_meta( $id, '_gft_src', $img );
	return (int) $id;
}

function gft_studio_shop_sync() {
	$data = gft_studio_shop_data();
	$log  = array( 'version' => $data['version'], 'time' => current_time( 'mysql' ), 'created' => 0, 'updated' => 0, 'hidden' => 0, 'errors' => array() );
	foreach ( $data['products'] as $row ) {
		$id      = wc_get_product_id_by_sku( $row['sku'] );
		$product = $id ? wc_get_product( $id ) : new WC_Product_External();
		if ( ! $product ) {
			$log['errors'][] = $row['sku'];
			continue;
		}
		$new = ! $id;
		$product->set_name( $row['name'] );
		if ( $new ) {
			$product->set_slug( $row['slug'] );
			$product->set_sku( $row['sku'] );
		}
		$product->set_status( 'publish' );
		$product->set_catalog_visibility( 'visible' );
		$product->set_regular_price( (string) $row['gross'] );
		$product->set_sale_price( '' );
		$product->set_short_description( $row['short'] );
		$product->set_menu_order( (int) $row['order'] );
		if ( $product->is_type( 'external' ) ) {
			$product->set_product_url( home_url( $row['url'] ) );
			$product->set_button_text( $row['button'] );
		}
		$cats = array();
		foreach ( $row['categories'] as $slug ) {
			$term = get_term_by( 'slug', $slug, 'product_cat' );
			if ( $term ) {
				$cats[] = (int) $term->term_id;
			}
		}
		if ( $cats ) {
			$product->set_category_ids( $cats );
		}
		if ( ! $product->get_image_id() ) {
			$img = gft_studio_shop_image( $row['image'], $row['name'] );
			if ( $img ) {
				$product->set_image_id( $img );
			}
		}
		$saved = $product->save();
		if ( ! $saved ) {
			$log['errors'][] = $row['sku'];
			continue;
		}
		update_post_meta( $saved, '_gft_studio', '1' );
		update_post_meta( $saved, '_gft_net', (string) $row['net'] );
		update_post_meta( $saved, '_gft_unit', (string) $row['unit'] );
		update_post_meta( $saved, '_gft_studio_url', (string) $row['url'] );
		update_post_meta( $saved, '_gft_studio_button', (string) $row['button'] );
		$new ? $log['created']++ : $log['updated']++;
	}
	$hide = array_merge( array_map( 'intval', array_keys( (array) $data['legacy'] ) ), array_map( 'intval', (array) $data['catalogHidden'] ) );
	foreach ( $hide as $old_id ) {
		$old = wc_get_product( $old_id );
		if ( ! $old || 'hidden' === $old->get_catalog_visibility() ) {
			continue;
		}
		if ( '' === get_post_meta( $old_id, '_gft_prev_visibility', true ) ) {
			update_post_meta( $old_id, '_gft_prev_visibility', $old->get_catalog_visibility() );
		}
		$old->set_catalog_visibility( 'hidden' );
		$old->save();
		$log['hidden']++;
	}
	update_option( 'gft_studio_shop_log', $log, false );
	update_option( 'gft_studio_shop_ver', $data['version'], false );
	return $log;
}

add_action( 'admin_init', function () {
	if ( wp_doing_ajax() || ! current_user_can( 'manage_woocommerce' ) || ! class_exists( 'WC_Product_External' ) ) {
		return;
	}
	$data = gft_studio_shop_data();
	if ( '' === $data['version'] || get_option( 'gft_studio_shop_ver' ) === $data['version'] || get_transient( 'gft_studio_shop_lock' ) ) {
		return;
	}
	set_transient( 'gft_studio_shop_lock', 1, 5 * MINUTE_IN_SECONDS );
	gft_studio_shop_sync();
	delete_transient( 'gft_studio_shop_lock' );
	set_transient( 'gft_studio_shop_notice', 1, HOUR_IN_SECONDS );
} );

add_action( 'admin_notices', function () {
	if ( ! get_transient( 'gft_studio_shop_notice' ) || ! current_user_can( 'manage_woocommerce' ) ) {
		return;
	}
	$log = get_option( 'gft_studio_shop_log' );
	if ( ! is_array( $log ) ) {
		return;
	}
	printf(
		'<div class="notice notice-success"><p>Sklep = Studio (wersja %s): utworzone %d, zaktualizowane %d, ukryte stare %d%s.</p></div>',
		esc_html( $log['version'] ),
		(int) $log['created'],
		(int) $log['updated'],
		(int) $log['hidden'],
		$log['errors'] ? esc_html( ', błędy: ' . implode( ', ', $log['errors'] ) ) : ''
	);
} );

/* ---------- old product URLs ---------- */
add_action( 'template_redirect', function () {
	if ( ! function_exists( 'is_product' ) || ! is_product() ) {
		return;
	}
	$legacy = (array) gft_studio_shop_data()['legacy'];
	$id     = (string) get_queried_object_id();
	if ( ! array_key_exists( $id, $legacy ) ) {
		return;
	}
	$target = '';
	if ( $legacy[ $id ] ) {
		$post   = get_page_by_path( $legacy[ $id ], OBJECT, 'product' );
		$target = $post ? get_permalink( $post ) : '';
	}
	wp_safe_redirect( $target ? $target : wc_get_page_permalink( 'shop' ), 301 );
	exit;
} );

/* ---------- display ---------- */
add_filter( 'woocommerce_get_price_html', function ( $html, $product ) {
	if ( ! gft_is_studio_product( $product ) ) {
		return $html;
	}
	$id   = $product->get_id();
	$unit = get_post_meta( $id, '_gft_unit', true );
	$per  = $unit ? '/' . $unit : '';
	$net  = (float) get_post_meta( $id, '_gft_net', true );
	return '<span class="gft-from">od <b>' . esc_html( gft_studio_money( $net ) . $per ) . '</b> netto</span> <span class="gft-gross">od ' . esc_html( gft_studio_money( (float) $product->get_price() ) . $per ) . ' brutto</span>';
}, 40, 2 );

add_filter( 'woocommerce_loop_add_to_cart_link', function ( $link, $product ) {
	if ( ! gft_is_studio_product( $product ) ) {
		return $link;
	}
	$id = $product->get_id();
	return sprintf( '<a class="button gft-studio-btn" href="%s">%s</a>', esc_url( home_url( get_post_meta( $id, '_gft_studio_url', true ) ) ), esc_html( get_post_meta( $id, '_gft_studio_button', true ) ) );
}, 40, 2 );

add_action( 'woocommerce_before_single_product', function () {
	global $product;
	if ( gft_is_studio_product( $product ) ) {
		remove_action( 'woocommerce_single_product_summary', 'woocommerce_template_single_add_to_cart', 30 );
	}
}, 5 );

add_action( 'woocommerce_single_product_summary', function () {
	global $product;
	if ( ! gft_is_studio_product( $product ) ) {
		return;
	}
	$id  = $product->get_id();
	$ask = home_url( '/kontakt/?produkt=' . rawurlencode( 'Zapytanie: ' . $product->get_name() . ' · cena od ' . str_replace( "\xC2\xA0", ' ', gft_studio_money( (float) get_post_meta( $id, '_gft_net', true ) ) ) . ( get_post_meta( $id, '_gft_unit', true ) ? '/m²' : '' ) . ' netto' ) );
	echo '<div class="gft-inquiry gft-studio-cta">';
	printf( '<p><a class="button gft-studio-btn" href="%s">%s</a> <a class="button gft-ask-btn" href="%s">Zapytaj o wycenę</a></p>', esc_url( home_url( get_post_meta( $id, '_gft_studio_url', true ) ) ), esc_html( get_post_meta( $id, '_gft_studio_button', true ) ), esc_url( $ask ) );
	echo '<p class="gft-inquiry-note">Ceny orientacyjne „od”, jak w Studio 3D. Montaż, transport i przygotowanie terenu policzę po zdjęciach placu.</p>';
	echo '</div>';
}, 31 );

add_action( 'woocommerce_archive_description', function () {
	if ( function_exists( 'is_shop' ) && is_shop() ) {
		echo '<p class="gft-shop-intro">Boiska i nawierzchnie ze Studio 3D, w tych samych cenach co w Studiu. Ceny „od”, netto; montaż i transport policzę po zdjęciach placu. <a href="' . esc_url( home_url( '/studio/' ) ) . '">Otwórz Studio 3D →</a></p>';
	}
}, 5 );
