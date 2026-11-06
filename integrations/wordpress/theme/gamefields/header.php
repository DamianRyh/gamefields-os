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
<a class="gft-skip" href="#gft-main">Przejdź do treści</a>
<header class="gft-nav" id="gft-nav">
	<div class="gft-wrap gft-nav-in">
		<a class="gft-logo" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="Gamefields, strona główna">gamefields.</a>
		<span class="gft-tag">Studio Damiana Gawrycha · Warszawa</span>
		<nav class="gft-links" id="gft-links" aria-label="Główna nawigacja"><?php gft_primary_nav(); ?></nav>
		<?php gft_cart_link(); ?>
		<a class="gft-ask" href="<?php echo esc_url( home_url( '/kontakt/' ) ); ?>">Zapytanie</a>
		<button type="button" class="gft-menu" aria-expanded="false" aria-controls="gft-links">Menu</button>
		<a class="gft-cta" href="<?php echo esc_url( home_url( '/konfigurator-boisk/' ) ); ?>">Studio 3D <span aria-hidden="true">↗</span></a>
	</div>
</header>
<?php endif; ?>
<?php /* the homepage content has its own <main> */ echo is_front_page() ? '<div id="gft-main" class="gft-main">' : '<main id="gft-main" class="gft-main">'; ?>
