<?php
/** Site header. The homepage brings its own header, so on the front page only the document head is printed. */
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#F4F1EE">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<?php if ( ! is_front_page() ) : ?>
<a class="gft-skip" href="#gft-main"><?php echo esc_html( gft_global_t( 'skip' ) ); ?></a>
<header class="gft-nav" id="gft-nav">
	<div class="gft-wrap gft-nav-in">
		<a class="gft-logo"<?php if ( gft_global_home_url() ) : ?> href="<?php echo esc_url( gft_global_home_url() ); ?>"<?php endif; ?> aria-label="<?php echo esc_attr( gft_global_t( 'home' ) ); ?>">gamefields.</a>
		<span class="gft-tag"><?php echo esc_html( gft_global_t( 'tag' ) ); ?></span>
		<nav class="gft-links" id="gft-links" aria-label="<?php echo esc_attr( gft_global_t( 'navigation' ) ); ?>"><?php gft_primary_nav(); ?></nav>
		<?php gft_cart_link(); ?>
		<?php gft_global_switcher(); ?>
		<?php gft_global_link( 'enquiry', gft_global_page_url( 'kontakt' ), 'gft-ask' ); ?>
		<button type="button" class="gft-menu" aria-expanded="false" aria-controls="gft-links"><?php echo esc_html( gft_global_t( 'menu' ) ); ?></button>
		<?php if ( 'pl' === gft_global_language() ) : ?>
		<a class="gft-cta" href="<?php echo esc_url( home_url( '/studio/' ) ); ?>">Studio 3D <span aria-hidden="true">↗</span></a>
		<?php endif; ?>
	</div>
</header>
<?php endif; ?>
<?php /* the homepage content has its own <main> */ echo is_front_page() ? '<div id="gft-main" class="gft-main">' : '<main id="gft-main" class="gft-main">'; ?>
