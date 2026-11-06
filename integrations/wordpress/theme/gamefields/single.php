<?php
/** Single post (blog and Gamefields City projects). */
get_header();
while ( have_posts() ) :
	the_post();
	$own_h1 = gft_content_has_h1();
	?>
	<article <?php post_class( 'gft-page gft-post' ); ?>>
		<header class="gft-wrap gft-head">
			<p class="gft-kicker"><a href="<?php echo esc_url( home_url( '/baza-wiedzy/' ) ); ?>">Gamefields</a> · <time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>"><?php echo esc_html( get_the_date( 'j F Y' ) ); ?></time></p>
			<?php if ( ! $own_h1 ) : ?><h1 class="gft-h1"><?php the_title(); ?></h1><?php endif; ?>
		</header>
		<?php if ( has_post_thumbnail() && ! $own_h1 ) : ?>
			<figure class="gft-wrap gft-cover"><?php the_post_thumbnail( 'large' ); ?></figure>
		<?php endif; ?>
		<div class="gft-wrap gft-prose"><?php the_content(); ?></div>
		<nav class="gft-wrap gft-postnav" aria-label="Inne wpisy">
			<?php previous_post_link( '<span>%link</span>', '← %title' ); ?>
			<?php next_post_link( '<span>%link</span>', '%title →' ); ?>
		</nav>
	</article>
	<?php
endwhile;
get_footer();
