<?php
/** WooCommerce wrapper: shop, categories and product pages. */
get_header();
?>
<div class="gft-page gft-shop">
	<div class="gft-wrap">
		<?php
		if ( function_exists( 'woocommerce_breadcrumb' ) ) {
			woocommerce_breadcrumb();
		}
		woocommerce_content();
		?>
	</div>
</div>
<?php
get_footer();
