<?php
/** Site header, the same on every page including the homepage (1.0.36). The homepage block's old header (#gfs-nav) is hidden in gft.css. */
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
<a class="gft-skip" href="#gft-main">Przejdź do treści</a>
<header class="gft-nav" id="gft-nav">
	<div class="gft-wrap gft-nav-in">
		<a class="gft-logo" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="Gamefields, strona główna">gamefields.</a>
		<span class="gft-tag">Studio Damiana Gawrycha · Warszawa</span>
		<nav class="gft-links" id="gft-links" aria-label="Główna nawigacja"><?php gft_primary_nav(); ?></nav>
		<?php gft_cart_link(); ?>
		<a class="gft-photo" href="<?php echo esc_url( is_front_page() ? '#zdjecie' : home_url( '/#zdjecie' ) ); ?>"><span class="gft-photo-l">Wyślij zdjęcie placu</span><span class="gft-photo-s">Wyślij zdjęcie</span></a>
		<button type="button" class="gft-menu" aria-expanded="false" aria-controls="gft-links">Menu</button>
		<a class="gft-cta" href="<?php echo esc_url( home_url( '/studio/' ) ); ?>">Studio 3D <span aria-hidden="true">↗</span></a>
	</div>
</header>
<?php /* the homepage content has its own <main> */ echo is_front_page() ? '<div id="gft-main" class="gft-main">' : '<main id="gft-main" class="gft-main">'; ?>
