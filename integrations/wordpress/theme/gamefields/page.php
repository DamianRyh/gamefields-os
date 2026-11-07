<?php
/** Default page. Pages that carry their own hero (an H1 in the content) are printed full width. */
get_header();
while ( have_posts() ) :
	the_post();
	if ( gft_content_has_h1() || gft_is_custom_html() ) :
		?>
		<div <?php post_class( 'gft-raw' ); ?>>
			<?php if ( ! gft_content_has_h1() ) : ?><h1 class="screen-reader-text"><?php the_title(); ?></h1><?php endif; ?>
			<?php the_content(); ?>
		</div>
		<?php
	else :
		?>
		<article <?php post_class( 'gft-page' ); ?>>
			<header class="gft-wrap gft-head">
				<h1 class="gft-h1"><?php the_title(); ?></h1>
			</header>
			<div class="gft-wrap gft-prose"><?php the_content(); ?></div>
		</article>
		<?php
	endif;
endwhile;
get_footer();
