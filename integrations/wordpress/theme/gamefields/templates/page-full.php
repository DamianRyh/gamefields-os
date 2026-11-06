<?php
/**
 * Template Name: Pełna szerokość
 * Template Post Type: page
 *
 * Kept under the same file name Savoy used (templates/page-full.php), so the 29 pages that use it keep
 * their template when the theme is switched. Prints the content edge to edge, without a theme title.
 */
get_header();
while ( have_posts() ) :
	the_post();
	?>
	<div <?php post_class( 'gft-raw' ); ?>><?php the_content(); ?></div>
	<?php
endwhile;
get_footer();
