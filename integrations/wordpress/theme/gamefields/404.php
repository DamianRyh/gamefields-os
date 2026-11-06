<?php
/** Not found. */
get_header();
?>
<section class="gft-page gft-404">
	<div class="gft-wrap gft-head">
		<p class="gft-kicker">Błąd 404</p>
		<h1 class="gft-h1">Piłka wyszła na aut.</h1>
		<p class="gft-lead">Tej strony nie ma albo zmieniła adres. Wróć do gry jednym z tych skrótów:</p>
		<div class="gft-chips">
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>">Strona główna</a>
			<a href="<?php echo esc_url( home_url( '/#boiska' ) ); ?>">Boiska</a>
			<a href="<?php echo esc_url( home_url( '/konfigurator-boisk/' ) ); ?>">Studio 3D</a>
			<a href="<?php echo esc_url( home_url( '/baza-wiedzy/' ) ); ?>">Baza wiedzy</a>
			<a href="<?php echo esc_url( home_url( '/kontakt/' ) ); ?>">Kontakt</a>
		</div>
		<?php get_search_form(); ?>
	</div>
</section>
<?php
get_footer();
