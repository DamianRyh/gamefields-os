<?php
/**
 * Gamefields City: the forms on the four City pages.
 *
 * The page scripts (inside the Elementor HTML widgets) send:
 *   - "Zgłoś miejsce" (page 3731) and the local alerts (page 3748) to POST /wp/v2/comments,
 *   - the partner brief (page 3750) to POST /gfc/v1/lead, falling back to /wp/v2/comments.
 * WordPress refuses anonymous REST comments and /gfc/v1/lead did not exist, so no visitor submission
 * ever arrived. Here: anonymous REST comments are accepted only for these pages and only with the City
 * payload, they always wait for moderation (never public), the owner gets an e-mail, and /gfc/v1/lead exists.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const GFT_CITY_PAGES = array(
	3731 => 'Zgłoszenie miejsca (Warsaw 20)',
	3748 => 'Alert lokalny',
	3750 => 'Brief partnera (miasta i marki)',
);

/** Is this REST comment request a City submission? */
function gft_city_is_submission( $request ) {
	$post    = (int) $request->get_param( 'post' );
	$content = (string) $request->get_param( 'content' );
	return isset( GFT_CITY_PAGES[ $post ] ) && false !== strpos( $content, '"type":"GAMEFIELDS_CITY_' ) && strlen( $content ) < 6000;
}

add_filter( 'rest_allow_anonymous_comments', function ( $allow, $request ) {
	return gft_city_is_submission( $request ) ? true : $allow;
}, 10, 2 );

/* City submissions never go public: always held for moderation. */
add_filter( 'pre_comment_approved', function ( $approved, $data ) {
	if ( isset( GFT_CITY_PAGES[ (int) ( $data['comment_post_ID'] ?? 0 ) ] ) && false !== strpos( (string) ( $data['comment_content'] ?? '' ), '"type":"GAMEFIELDS_CITY_' ) ) {
		return is_wp_error( $approved ) ? $approved : 0;
	}
	return $approved;
}, 99, 2 );

/* Never print comments on these pages (the theme does not print comments at all, this is a second lock). */
add_filter( 'comments_array', function ( $comments, $post_id ) {
	return isset( GFT_CITY_PAGES[ (int) $post_id ] ) ? array() : $comments;
}, 10, 2 );

/* E-mail to the site owner for every City submission. */
add_action( 'comment_post', function ( $comment_id, $approved, $data ) {
	$post_id = (int) ( $data['comment_post_ID'] ?? 0 );
	if ( ! isset( GFT_CITY_PAGES[ $post_id ] ) ) {
		return;
	}
	$raw = (string) ( $data['comment_content'] ?? '' );
	if ( false === strpos( $raw, '"type":"GAMEFIELDS_CITY_' ) ) {
		return;
	}
	$fields = json_decode( $raw, true );
	$lines  = array();
	if ( is_array( $fields ) ) {
		foreach ( $fields as $k => $v ) {
			if ( is_scalar( $v ) && '' !== (string) $v ) {
				$lines[] = $k . ': ' . wp_strip_all_tags( (string) $v );
			}
		}
	}
	$lines[] = 'Nadawca: ' . wp_strip_all_tags( (string) ( $data['comment_author'] ?? '' ) ) . ' <' . sanitize_email( (string) ( $data['comment_author_email'] ?? '' ) ) . '>';
	$lines[] = '';
	$lines[] = 'Do weryfikacji w panelu: ' . admin_url( 'edit-comments.php?comment_status=moderated' );
	wp_mail(
		get_option( 'admin_email' ),
		'Gamefields City: ' . GFT_CITY_PAGES[ $post_id ],
		implode( "\n", $lines ),
		array( 'Reply-To: ' . sanitize_email( (string) ( $data['comment_author_email'] ?? '' ) ) )
	);
}, 10, 3 );

/* The partner brief endpoint the B2B page calls first. */
add_action( 'rest_api_init', function () {
	register_rest_route( 'gfc/v1', '/lead', array(
		'methods'             => 'POST',
		'permission_callback' => '__return_true',
		'callback'            => function ( WP_REST_Request $req ) {
			$name    = sanitize_text_field( (string) $req->get_param( 'name' ) );
			$email   = sanitize_email( (string) $req->get_param( 'email' ) );
			$consent = (bool) $req->get_param( 'consent' );
			if ( '' === $name || ! is_email( $email ) || ! $consent ) {
				return new WP_Error( 'gfc_invalid', 'Podaj imię, poprawny e-mail i zgodę na kontakt.', array( 'status' => 400 ) );
			}
			// simple flood guard: one brief per address per minute
			$key = 'gfc_lead_' . md5( strtolower( $email ) );
			if ( get_transient( $key ) ) {
				return new WP_Error( 'gfc_flood', 'Brief już dotarł. Spróbuj ponownie za minutę.', array( 'status' => 429 ) );
			}
			set_transient( $key, 1, MINUTE_IN_SECONDS );
			$payload = array(
				'type'    => 'GAMEFIELDS_CITY_B2B_LEAD',
				'name'    => $name,
				'email'   => $email,
				'company' => sanitize_text_field( (string) $req->get_param( 'company' ) ),
				'role'    => sanitize_text_field( (string) $req->get_param( 'role' ) ),
				'goal'    => sanitize_text_field( (string) $req->get_param( 'goal' ) ),
				'budget'  => sanitize_text_field( (string) $req->get_param( 'budget' ) ),
				'message' => sanitize_textarea_field( (string) $req->get_param( 'message' ) ),
				'source'  => 'gamefields-city-b2b',
			);
			$id = wp_new_comment( array(
				'comment_post_ID'      => 3750,
				'comment_author'       => $name,
				'comment_author_email' => $email,
				'comment_content'      => wp_json_encode( $payload, JSON_UNESCAPED_UNICODE ),
				'comment_type'         => 'comment',
			), true );
			if ( is_wp_error( $id ) ) {
				return new WP_Error( 'gfc_save', 'Nie udało się zapisać briefu.', array( 'status' => 500 ) );
			}
			return array( 'ok' => true );
		},
	) );
} );

/* On the map page the whole page script waits for marketing consent (Complianz blocks it because it loads
   OpenStreetMap). The window "Zgłoś miejsce", the report form and a list of projects work without it. */
add_action( 'wp_enqueue_scripts', function () {
	if ( is_page( 3731 ) ) {
		wp_enqueue_script( 'gft-city', get_template_directory_uri() . '/assets/js/gft-city.js', array(), GFT_VERSION, array( 'strategy' => 'defer', 'in_footer' => true ) );
	}
}, 30 );
