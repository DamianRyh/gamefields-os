<?php
/** WooCommerce wrapper: shop, categories and product pages. */
get_header();
?>
<div class="gft-page gft-shop">
	<div class="gft-wrap">
		<?php
		// The main shop page is a showroom of the Studio catalogue (2026-11-16); categories, search and sorting keep the list.
		if ( function_exists( 'is_shop' ) && is_shop() && ! is_search() && ! is_paged() && empty( $_GET['orderby'] ) && function_exists( 'gft_studio_shop_data' ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			get_template_part( 'templates/shop-studio' );
		} else {
			if ( function_exists( 'woocommerce_breadcrumb' ) ) {
				woocommerce_breadcrumb();
			}
			woocommerce_content();
		}
		?>
	</div>
</div>
<?php
get_footer();
