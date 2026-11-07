<?php
/** Archives, blog index and search results. */
get_header();
?>
<section class="gft-page">
	<header class="gft-wrap gft-head">
		<p class="gft-kicker">
			<?php
			if ( is_search() ) {
				echo 'Wyniki wyszukiwania';
			} elseif ( is_category() || is_tag() || is_tax() ) {
				echo 'Kategoria';
			} else {
				echo 'Gamefields';
			}
			?>
		</p>
		<h1 class="gft-h1">
			<?php
			if ( is_search() ) {
				printf( '„%s”', esc_html( get_search_query() ) );
			} elseif ( is_archive() ) {
				echo esc_html( wp_strip_all_tags( get_the_archive_title() ) );
			} else {
				echo 'Wpisy';
			}
			?>
		</h1>
	</header>
	<div class="gft-wrap">
		<?php if ( have_posts() ) : ?>
			<ul class="gft-cards" role="list">
				<?php
				while ( have_posts() ) :
					the_post();
					?>
					<li>
						<a class="gft-card" href="<?php the_permalink(); ?>">
							<?php if ( has_post_thumbnail() ) : ?><span class="gft-card-img"><?php the_post_thumbnail( 'medium_large' ); ?></span><?php endif; ?>
							<span class="gft-kicker"><?php echo esc_html( get_the_date( 'j F Y' ) ); ?></span>
							<b><?php the_title(); ?></b>
							<span class="gft-card-txt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 22 ) ); ?></span>
						</a>
					</li>
				<?php endwhile; ?>
			</ul>
			<div class="gft-pager"><?php the_posts_pagination( array( 'prev_text' => '←', 'next_text' => '→' ) ); ?></div>
		<?php else : ?>
			<p class="gft-lead">Nic tu jeszcze nie ma. Zajrzyj do <a href="<?php echo esc_url( home_url( '/baza-wiedzy/' ) ); ?>">bazy wiedzy</a> albo <a href="<?php echo esc_url( home_url( '/kontakt/' ) ); ?>">napisz do mnie</a>.</p>
		<?php endif; ?>
	</div>
</section>
<?php
get_footer();
