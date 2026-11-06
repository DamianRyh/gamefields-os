<?php
/** Site footer, the same on every page including the homepage. */
?>
<?php echo is_front_page() ? '</div>' : '</main>'; ?>
<footer class="gft-foot">
	<div class="gft-wrap">
		<div class="gft-foot-top">
			<div class="gft-foot-brand">
				<a class="gft-logo" href="<?php echo esc_url( home_url( '/' ) ); ?>">gamefields.</a>
				<p>Autorskie studio boisk miejskich Damiana Gawrycha. Projektuję konstrukcję, nawierzchnię i grafikę jako jeden przedmiot.</p>
				<a class="gft-pill" href="<?php echo esc_url( home_url( '/kontakt/' ) ); ?>">Wyślij zapytanie <span aria-hidden="true">→</span></a>
			</div>
			<nav class="gft-foot-col" aria-label="Oferta">
				<p class="gft-kicker">Oferta</p>
				<a href="<?php echo esc_url( home_url( '/#boiska' ) ); ?>">Boiska panna i street football</a>
				<a href="<?php echo esc_url( home_url( '/budowa-boisk-sportowych/' ) ); ?>">Budowa boisk</a>
				<a href="<?php echo esc_url( home_url( '/renowacja-boisk/' ) ); ?>">Renowacja</a>
				<a href="<?php echo esc_url( home_url( '/nawierzchnie-sportowe/' ) ); ?>">Nawierzchnie</a>
				<a href="<?php echo esc_url( home_url( '/malowanie-boisk/' ) ); ?>">Malowanie i grafika</a>
				<a href="<?php echo esc_url( home_url( '/projektowanie-boisk/' ) ); ?>">Projektowanie</a>
			</nav>
			<nav class="gft-foot-col" aria-label="Dla kogo">
				<p class="gft-kicker">Dla kogo</p>
				<a href="<?php echo esc_url( home_url( '/boiska-dla-szkol/' ) ); ?>">Szkoły i gminy</a>
				<a href="<?php echo esc_url( home_url( '/dla-miast/' ) ); ?>">Miasta</a>
				<a href="<?php echo esc_url( home_url( '/boiska-dla-deweloperow/' ) ); ?>">Deweloperzy i osiedla</a>
				<a href="<?php echo esc_url( home_url( '/boiska-dla-klubow/' ) ); ?>">Kluby i akademie</a>
				<a href="<?php echo esc_url( home_url( '/aktywacje-sportowe-dla-marek/' ) ); ?>">Marki i agencje</a>
				<a href="<?php echo esc_url( home_url( '/wynajem-boisk-mobilnych/' ) ); ?>">Eventy i wynajem</a>
			</nav>
			<nav class="gft-foot-col" aria-label="Więcej">
				<p class="gft-kicker">Więcej</p>
				<a href="<?php echo esc_url( home_url( '/realizacje-gamefields/' ) ); ?>">Realizacje</a>
				<a href="<?php echo esc_url( home_url( '/baza-wiedzy/' ) ); ?>">Baza wiedzy</a>
				<a href="<?php echo esc_url( home_url( '/ile-kosztuje-budowa-boiska-sportowego/' ) ); ?>">Ile kosztuje boisko?</a>
				<a href="<?php echo esc_url( home_url( '/gamefields-city/' ) ); ?>">Gamefields City</a>
				<a href="<?php echo esc_url( home_url( '/o-nas/' ) ); ?>">O nas</a>
				<a href="<?php echo esc_url( function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/shop/' ) ); ?>">Sklep</a>
			</nav>
		</div>
		<div class="gft-foot-bottom">
			<span>© <?php echo esc_html( gmdate( 'Y' ) ); ?> Gamefields · studio Damiana Gawrycha · Warszawa</span>
			<a href="mailto:info@gamefields.eu">info@gamefields.eu</a>
			<a href="<?php echo esc_url( get_privacy_policy_url() ? get_privacy_policy_url() : home_url( '/polityka-prywatnosci/' ) ); ?>">Polityka prywatności</a>
		</div>
	</div>
</footer>
<?php wp_footer(); ?>
</body>
</html>
