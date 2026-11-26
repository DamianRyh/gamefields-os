<?php
/** Site footer, the same on every page including the homepage. */
?>
<?php echo is_front_page() ? '</div>' : '</main>'; ?>
<footer class="gft-foot">
	<div class="gft-wrap">
		<div class="gft-foot-top">
			<div class="gft-foot-brand">
				<a class="gft-logo"<?php if ( gft_global_home_url() ) : ?> href="<?php echo esc_url( gft_global_home_url() ); ?>"<?php endif; ?>>gamefields.</a>
				<p><?php echo esc_html( gft_global_t( 'footer_brand' ) ); ?></p>
				<?php gft_global_link( 'inquiry', gft_global_page_url( 'kontakt' ), 'gft-pill', true ); ?>
			</div>
			<nav class="gft-foot-col" aria-label="<?php echo esc_attr( gft_global_t( 'offer' ) ); ?>">
				<p class="gft-kicker"><?php echo esc_html( gft_global_t( 'offer' ) ); ?></p>
				<?php gft_global_link( 'panna_courts', gft_global_anchor_url( 'boiska' ) ); ?>
				<?php gft_global_link( 'footer_construction', gft_global_page_url( 'budowa-boisk-sportowych' ) ); ?>
				<?php gft_global_link( 'footer_renovation', gft_global_page_url( 'renowacja-boisk' ) ); ?>
				<?php gft_global_link( 'footer_surfaces', gft_global_page_url( 'nawierzchnie-sportowe' ) ); ?>
				<?php gft_global_link( 'footer_paint', gft_global_page_url( 'malowanie-boisk' ) ); ?>
				<?php gft_global_link( 'footer_design', gft_global_page_url( 'projektowanie-boisk' ) ); ?>
			</nav>
			<nav class="gft-foot-col" aria-label="<?php echo esc_attr( gft_global_t( 'nav_audience' ) ); ?>">
				<p class="gft-kicker"><?php echo esc_html( gft_global_t( 'nav_audience' ) ); ?></p>
				<?php gft_global_link( 'schools', gft_global_page_url( 'boiska-dla-szkol' ) ); ?>
				<?php gft_global_link( 'cities', gft_global_page_url( 'dla-miast' ) ); ?>
				<?php gft_global_link( 'developers', gft_global_page_url( 'boiska-dla-deweloperow' ) ); ?>
				<?php gft_global_link( 'clubs', gft_global_page_url( 'boiska-dla-klubow' ) ); ?>
				<?php gft_global_link( 'brands', gft_global_page_url( 'aktywacje-sportowe-dla-marek' ) ); ?>
				<?php gft_global_link( 'events', gft_global_page_url( 'wynajem-boisk-mobilnych' ) ); ?>
			</nav>
			<nav class="gft-foot-col" aria-label="<?php echo esc_attr( gft_global_t( 'more' ) ); ?>">
				<p class="gft-kicker"><?php echo esc_html( gft_global_t( 'more' ) ); ?></p>
				<?php gft_global_link( 'nav_projects', gft_global_page_url( 'realizacje-gamefields' ) ); ?>
				<?php gft_global_link( 'knowledge_hub', gft_global_page_url( 'baza-wiedzy' ) ); ?>
				<?php gft_global_link( 'court_cost', gft_global_page_url( 'ile-kosztuje-budowa-boiska-sportowego' ) ); ?>
				<?php gft_global_link( 'about', gft_global_page_url( 'o-nas' ) ); ?>
				<?php gft_global_link( 'nav_shop', gft_global_shop_url() ); ?>
			</nav>
		</div>
		<div class="gft-foot-bottom">
			<span>© <?php echo esc_html( gmdate( 'Y' ) ); ?> <?php echo esc_html( gft_global_t( 'copyright' ) ); ?></span>
			<a href="mailto:info@gamefields.eu">info@gamefields.eu</a>
			<?php gft_global_link( 'privacy', gft_global_privacy_url() ); ?>
			<?php if ( is_front_page() ) { gft_global_switcher(); } ?>
		</div>
	</div>
</footer>
<?php wp_footer(); ?>
</body>
</html>
