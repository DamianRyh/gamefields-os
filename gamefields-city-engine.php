<?php
/**
 * Plugin Name: Gamefields City Engine
 * Description: Community-powered sports infrastructure engine: reports, projects, support votes, local alerts and Gamefields operations pipeline.
 * Version: 1.0.0
 * Author: Gamefields
 * Requires at least: 6.5
 * Requires PHP: 8.0
 */

if (!defined('ABSPATH')) exit;

final class GFC_Engine {
    const VERSION = '1.0.0';
    const DB_VERSION = '1';
    const CRON = 'gfc_hourly_alerts';

    public static function init() {
        add_action('init', [__CLASS__, 'register_content']);
        add_action('rest_api_init', [__CLASS__, 'register_routes']);
        add_action('add_meta_boxes', [__CLASS__, 'meta_boxes']);
        add_action('save_post_gfc_place', [__CLASS__, 'save_place'], 20, 3);
        add_action('save_post_gfc_report', [__CLASS__, 'save_report'], 20, 3);
        add_filter('manage_gfc_place_posts_columns', [__CLASS__, 'place_columns']);
        add_action('manage_gfc_place_posts_custom_column', [__CLASS__, 'place_column'], 10, 2);
        add_filter('manage_gfc_report_posts_columns', [__CLASS__, 'report_columns']);
        add_action('manage_gfc_report_posts_custom_column', [__CLASS__, 'report_column'], 10, 2);
        add_action('admin_post_gfc_promote_report', [__CLASS__, 'promote_report']);
        add_action('gfc_send_place_alerts', [__CLASS__, 'send_place_alerts'], 10, 1);
        add_action(self::CRON, [__CLASS__, 'cron_alerts']);
        add_shortcode('gfc_report_form', [__CLASS__, 'shortcode_report']);
        add_shortcode('gfc_alert_form', [__CLASS__, 'shortcode_alert']);
        add_shortcode('gfc_ops_summary', [__CLASS__, 'shortcode_ops']);
    }

    public static function activate() {
        self::register_content();
        self::create_tables();
        self::seed_terms();
        self::migrate_legacy_posts();
        if (!wp_next_scheduled(self::CRON)) wp_schedule_event(time() + 300, 'hourly', self::CRON);
        flush_rewrite_rules();
    }

    public static function deactivate() {
        wp_clear_scheduled_hook(self::CRON);
        flush_rewrite_rules();
    }

    private static function tables() {
        global $wpdb;
        return [
            'votes' => $wpdb->prefix . 'gfc_votes',
            'alerts' => $wpdb->prefix . 'gfc_alerts',
        ];
    }

    private static function create_tables() {
        global $wpdb;
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        $t = self::tables();
        $charset = $wpdb->get_charset_collate();
        dbDelta("CREATE TABLE {$t['votes']} (
            id bigint unsigned NOT NULL AUTO_INCREMENT,
            place_id bigint unsigned NOT NULL,
            voter_key varchar(64) NOT NULL,
            email_hash varchar(64) DEFAULT '',
            ip_hash varchar(64) DEFAULT '',
            created_at datetime NOT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY place_voter (place_id,voter_key),
            KEY place_id (place_id)
        ) $charset;");
        dbDelta("CREATE TABLE {$t['alerts']} (
            id bigint unsigned NOT NULL AUTO_INCREMENT,
            email varchar(190) NOT NULL,
            email_hash varchar(64) NOT NULL,
            lat decimal(10,7) DEFAULT NULL,
            lng decimal(10,7) DEFAULT NULL,
            radius_km decimal(6,2) NOT NULL DEFAULT 3.00,
            district varchar(120) DEFAULT '',
            sport varchar(120) DEFAULT '',
            token varchar(64) NOT NULL,
            status varchar(20) NOT NULL DEFAULT 'pending',
            last_sent_at datetime DEFAULT NULL,
            created_at datetime NOT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY token (token),
            KEY email_hash (email_hash),
            KEY status (status)
        ) $charset;");
        update_option('gfc_db_version', self::DB_VERSION, false);
    }

    public static function register_content() {
        register_post_type('gfc_place', [
            'labels' => ['name'=>'City Projects','singular_name'=>'City Project','add_new_item'=>'Add City Project','edit_item'=>'Edit City Project'],
            'public'=>true,'show_in_rest'=>true,'menu_icon'=>'dashicons-location-alt','supports'=>['title','editor','thumbnail','author'],'has_archive'=>true,
            'rewrite'=>['slug'=>'city-project']
        ]);
        register_post_type('gfc_report', [
            'labels' => ['name'=>'City Reports','singular_name'=>'City Report','edit_item'=>'Review City Report'],
            'public'=>false,'show_ui'=>true,'show_in_rest'=>false,'menu_icon'=>'dashicons-megaphone','supports'=>['title','editor'],'capability_type'=>'post'
        ]);
        register_taxonomy('gfc_status','gfc_place',[
            'label'=>'Pipeline Status','public'=>false,'show_ui'=>true,'show_admin_column'=>true,'hierarchical'=>false,'show_in_rest'=>true
        ]);
        register_taxonomy('gfc_sport','gfc_place',[
            'label'=>'Sport','public'=>true,'show_ui'=>true,'show_admin_column'=>true,'hierarchical'=>false,'show_in_rest'=>true
        ]);
        register_taxonomy('gfc_district','gfc_place',[
            'label'=>'District','public'=>true,'show_ui'=>true,'show_admin_column'=>true,'hierarchical'=>false,'show_in_rest'=>true
        ]);
    }

    private static function seed_terms() {
        foreach (['DISCOVERED','VERIFIED','DESIGNED','BACKED','BUILT','ARCHIVED'] as $x) if (!term_exists($x,'gfc_status')) wp_insert_term($x,'gfc_status',['slug'=>strtolower($x)]);
        foreach (['Street Football','Basket 3x3','Padel','Skatepark','Street Workout','Multi-sport','Tennis','Volleyball'] as $x) if (!term_exists($x,'gfc_sport')) wp_insert_term($x,'gfc_sport');
    }

    private static function migrate_legacy_posts() {
        $done = get_option('gfc_legacy_migrated');
        if ($done) return;
        $legacy = get_posts(['post_type'=>'post','posts_per_page'=>100,'category'=>631,'post_status'=>'publish']);
        foreach ($legacy as $p) {
            $exists = get_posts(['post_type'=>'gfc_place','posts_per_page'=>1,'meta_key'=>'_gfc_legacy_id','meta_value'=>$p->ID,'fields'=>'ids']);
            if ($exists) continue;
            $raw = trim(html_entity_decode(wp_strip_all_tags($p->post_content), ENT_QUOTES | ENT_HTML5, 'UTF-8'));
            $raw = str_replace(['„','”','“','″'], '"', $raw);
            $d = json_decode($raw, true); if (!is_array($d)) $d = [];
            $id = wp_insert_post(['post_type'=>'gfc_place','post_status'=>'publish','post_title'=>$p->post_title,'post_content'=>'Migrated from Warsaw Pilot prototype.']);
            if (!$id || is_wp_error($id)) continue;
            update_post_meta($id,'_gfc_legacy_id',$p->ID);
            foreach (['lat','lng','support','players','score','variant'] as $k) if (isset($d[$k])) update_post_meta($id,'_gfc_'.$k, sanitize_text_field((string)$d[$k]));
            if (!empty($d['district'])) wp_set_object_terms($id, sanitize_text_field($d['district']), 'gfc_district', false);
            if (!empty($d['sport'])) wp_set_object_terms($id, sanitize_text_field($d['sport']), 'gfc_sport', false);
            wp_set_object_terms($id, !empty($d['status']) ? sanitize_key($d['status']) : 'discovered', 'gfc_status', false);
        }
        update_option('gfc_legacy_migrated', time(), false);
    }

    public static function meta_boxes() {
        add_meta_box('gfc_place_data','Gamefields City — Project Data',[__CLASS__,'place_box'],'gfc_place','normal','high');
        add_meta_box('gfc_report_data','Gamefields City — Report Data',[__CLASS__,'report_box'],'gfc_report','normal','high');
    }

    public static function place_box($post) {
        wp_nonce_field('gfc_place_save','gfc_place_nonce');
        $fields = [
            'lat'=>'Latitude','lng'=>'Longitude','support'=>'Support count','players'=>'Active players','score'=>'Demand Score','variant'=>'Design variant',
            'condition'=>'Condition (0-100)','feasibility'=>'Feasibility (0-100)','completeness'=>'Project readiness (0-100)','growth'=>'Demand growth (0-100)',
            'cost_min'=>'Estimated cost min PLN','cost_max'=>'Estimated cost max PLN','owner_type'=>'Land / owner type','owner_contact'=>'Owner / authority contact',
            'partner_fit'=>'Partner fit (0-100)','next_action'=>'Next action','lead_stage'=>'Commercial stage','last_contact'=>'Last contact note'
        ];
        echo '<table class="form-table">';
        foreach ($fields as $k=>$label) {
            $v = get_post_meta($post->ID,'_gfc_'.$k,true);
            echo '<tr><th><label for="gfc_'.$k.'">'.esc_html($label).'</label></th><td><input style="width:100%" id="gfc_'.$k.'" name="gfc_'.$k.'" value="'.esc_attr($v).'" /></td></tr>';
        }
        echo '</table><p><strong>Demand Score</strong> is recalculated from real support, growth, readiness, condition and feasibility unless manually locked below.</p>';
        $lock = get_post_meta($post->ID,'_gfc_score_lock',true);
        echo '<label><input type="checkbox" name="gfc_score_lock" value="1" '.checked($lock,'1',false).'> Lock current Demand Score</label>';
    }

    public static function report_box($post) {
        wp_nonce_field('gfc_report_save','gfc_report_nonce');
        $keys = ['reference','district','sport','lat','lng','width','length','problem','reporter_name','reporter_email','consent','review_note'];
        echo '<table class="form-table">';
        foreach ($keys as $k) {
            $v = get_post_meta($post->ID,'_gfc_'.$k,true);
            echo '<tr><th>'.esc_html(ucwords(str_replace('_',' ',$k))).'</th><td><input style="width:100%" name="gfc_'.$k.'" value="'.esc_attr($v).'" /></td></tr>';
        }
        echo '</table>';
        $url = wp_nonce_url(admin_url('admin-post.php?action=gfc_promote_report&report_id='.$post->ID),'gfc_promote_'.$post->ID);
        echo '<p><a class="button button-primary" href="'.esc_url($url).'">Verify & create City Project</a></p>';
    }

    public static function save_place($post_id,$post,$update) {
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
        if (!isset($_POST['gfc_place_nonce']) || !wp_verify_nonce($_POST['gfc_place_nonce'],'gfc_place_save')) return;
        if (!current_user_can('edit_post',$post_id)) return;
        $keys=['lat','lng','support','players','score','variant','condition','feasibility','completeness','growth','cost_min','cost_max','owner_type','owner_contact','partner_fit','next_action','lead_stage','last_contact'];
        foreach ($keys as $k) if (isset($_POST['gfc_'.$k])) update_post_meta($post_id,'_gfc_'.$k,sanitize_text_field(wp_unslash($_POST['gfc_'.$k])));
        update_post_meta($post_id,'_gfc_score_lock', isset($_POST['gfc_score_lock']) ? '1' : '0');
        self::recalc_score($post_id);
        self::queue_alert_if_changed($post_id);
    }

    public static function save_report($post_id,$post,$update) {
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
        if (!isset($_POST['gfc_report_nonce']) || !wp_verify_nonce($_POST['gfc_report_nonce'],'gfc_report_save')) return;
        if (!current_user_can('edit_post',$post_id)) return;
        foreach (['reference','district','sport','lat','lng','width','length','problem','reporter_name','reporter_email','consent','review_note'] as $k)
            if (isset($_POST['gfc_'.$k])) update_post_meta($post_id,'_gfc_'.$k,sanitize_text_field(wp_unslash($_POST['gfc_'.$k])));
    }

    private static function recalc_score($post_id) {
        if (get_post_meta($post_id,'_gfc_score_lock',true)==='1') return;
        $support=(int)get_post_meta($post_id,'_gfc_support',true);
        $growth=(int)get_post_meta($post_id,'_gfc_growth',true);
        $ready=(int)get_post_meta($post_id,'_gfc_completeness',true);
        $feas=(int)get_post_meta($post_id,'_gfc_feasibility',true);
        $condition=(int)get_post_meta($post_id,'_gfc_condition',true);
        $partner=(int)get_post_meta($post_id,'_gfc_partner_fit',true);
        $support_score = min(100, round(log(max(1,$support)+1, 1.06)));
        $need_score = max(0,min(100,100-$condition));
        $score = round(.30*$support_score + .15*$growth + .20*$ready + .15*$need_score + .15*$feas + .05*$partner);
        update_post_meta($post_id,'_gfc_score',max(0,min(100,$score)));
    }

    private static function queue_alert_if_changed($post_id) {
        if (get_post_status($post_id)!=='publish') return;
        $finger = md5(implode('|',[
            get_the_title($post_id),get_post_meta($post_id,'_gfc_score',true),get_post_meta($post_id,'_gfc_support',true),
            wp_get_post_terms($post_id,'gfc_status',['fields'=>'slugs']) ? implode(',',wp_get_post_terms($post_id,'gfc_status',['fields'=>'slugs'])) : ''
        ]));
        $old=get_post_meta($post_id,'_gfc_public_fingerprint',true);
        if ($old && $old===$finger) return;
        update_post_meta($post_id,'_gfc_public_fingerprint',$finger);
        if (!wp_next_scheduled('gfc_send_place_alerts',[$post_id])) wp_schedule_single_event(time()+60,'gfc_send_place_alerts',[$post_id]);
    }

    public static function promote_report() {
        $rid=absint($_GET['report_id']??0);
        if (!$rid || !current_user_can('edit_post',$rid) || !check_admin_referer('gfc_promote_'.$rid)) wp_die('Not allowed');
        $r=get_post($rid); if (!$r || $r->post_type!=='gfc_report') wp_die('Invalid report');
        $id=wp_insert_post(['post_type'=>'gfc_place','post_status'=>'draft','post_title'=>$r->post_title,'post_content'=>get_post_meta($rid,'_gfc_problem',true)]);
        if (is_wp_error($id) || !$id) wp_die('Could not create project');
        foreach (['lat','lng','width','length'] as $k) update_post_meta($id,'_gfc_'.$k,get_post_meta($rid,'_gfc_'.$k,true));
        update_post_meta($id,'_gfc_source_report',$rid);
        update_post_meta($id,'_gfc_completeness',35); update_post_meta($id,'_gfc_feasibility',50); update_post_meta($id,'_gfc_condition',50); update_post_meta($id,'_gfc_growth',0);
        $district=get_post_meta($rid,'_gfc_district',true); if ($district) wp_set_object_terms($id,$district,'gfc_district',false);
        $sport=get_post_meta($rid,'_gfc_sport',true); if ($sport) wp_set_object_terms($id,$sport,'gfc_sport',false);
        wp_set_object_terms($id,'verified','gfc_status',false);
        update_post_meta($rid,'_gfc_promoted_place',$id); update_post_meta($rid,'_gfc_reviewed_by',get_current_user_id()); update_post_meta($rid,'_gfc_reviewed_at',current_time('mysql'));
        wp_update_post(['ID'=>$rid,'post_status'=>'private']);
        wp_safe_redirect(admin_url('post.php?post='.$id.'&action=edit')); exit;
    }

    private static function client_ip() {
        return sanitize_text_field($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
    }
    private static function rate_limit($key,$seconds=60) {
        $k='gfc_rl_'.md5($key.'|'.self::client_ip());
        if (get_transient($k)) return false;
        set_transient($k,1,$seconds); return true;
    }

    public static function register_routes() {
        register_rest_route('gfc/v1','/places',['methods'=>'GET','callback'=>[__CLASS__,'api_places'],'permission_callback'=>'__return_true']);
        register_rest_route('gfc/v1','/report',['methods'=>'POST','callback'=>[__CLASS__,'api_report'],'permission_callback'=>'__return_true']);
        register_rest_route('gfc/v1','/vote',['methods'=>'POST','callback'=>[__CLASS__,'api_vote'],'permission_callback'=>'__return_true']);
        register_rest_route('gfc/v1','/alert',['methods'=>'POST','callback'=>[__CLASS__,'api_alert'],'permission_callback'=>'__return_true']);
        register_rest_route('gfc/v1','/alert/confirm',['methods'=>'GET','callback'=>[__CLASS__,'api_alert_confirm'],'permission_callback'=>'__return_true']);
        register_rest_route('gfc/v1','/alert/unsubscribe',['methods'=>'GET','callback'=>[__CLASS__,'api_alert_unsubscribe'],'permission_callback'=>'__return_true']);
        register_rest_route('gfc/v1','/ops',['methods'=>'GET','callback'=>[__CLASS__,'api_ops'],'permission_callback'=>function(){return current_user_can('edit_others_posts');}]);
    }

    public static function api_places($req) {
        $q=['post_type'=>'gfc_place','post_status'=>'publish','posts_per_page'=>200,'orderby'=>'modified','order'=>'DESC'];
        if ($req->get_param('district')) $q['tax_query'][]=['taxonomy'=>'gfc_district','field'=>'slug','terms'=>sanitize_title($req->get_param('district'))];
        if ($req->get_param('sport')) $q['tax_query'][]=['taxonomy'=>'gfc_sport','field'=>'slug','terms'=>sanitize_title($req->get_param('sport'))];
        $posts=get_posts($q); $out=[];
        foreach ($posts as $p) $out[]=self::place_payload($p->ID);
        return rest_ensure_response($out);
    }

    private static function place_payload($id) {
        $term=function($tax) use($id){$x=wp_get_post_terms($id,$tax,['fields'=>'names']);return $x?reset($x):'';};
        return [
            'id'=>$id,'name'=>get_the_title($id),'url'=>get_permalink($id),'lat'=>(float)get_post_meta($id,'_gfc_lat',true),'lng'=>(float)get_post_meta($id,'_gfc_lng',true),
            'support'=>(int)get_post_meta($id,'_gfc_support',true),'players'=>(int)get_post_meta($id,'_gfc_players',true),'score'=>(int)get_post_meta($id,'_gfc_score',true),
            'status'=>$term('gfc_status'),'sport'=>$term('gfc_sport'),'district'=>$term('gfc_district'),'variant'=>get_post_meta($id,'_gfc_variant',true),
            'cost_min'=>(float)get_post_meta($id,'_gfc_cost_min',true),'cost_max'=>(float)get_post_meta($id,'_gfc_cost_max',true),'modified'=>get_post_modified_time('c',true,$id)
        ];
    }

    public static function api_report($req) {
        if (!self::rate_limit('report',120)) return new WP_Error('rate_limited','Please wait before sending another report',['status'=>429]);
        $p=$req->get_json_params(); if (!is_array($p)) $p=$req->get_params();
        if (!empty($p['website'])) return new WP_Error('spam','Invalid submission',['status'=>400]);
        $email=sanitize_email($p['email']??''); $name=sanitize_text_field($p['name']??''); $place=sanitize_text_field($p['place']??'');
        if (!$email || !is_email($email) || !$name || !$place || empty($p['consent'])) return new WP_Error('invalid','Name, email, place and consent are required',['status'=>400]);
        $ref='GFC-'.gmdate('ymd').'-'.strtoupper(wp_generate_password(5,false,false));
        $id=wp_insert_post(['post_type'=>'gfc_report','post_status'=>'pending','post_title'=>$place,'post_content'=>sanitize_textarea_field($p['problem']??'')]);
        if (is_wp_error($id)||!$id) return new WP_Error('save_failed','Could not save report',['status'=>500]);
        $data=['reference'=>$ref,'district'=>$p['district']??'','sport'=>$p['sport']??'','lat'=>$p['lat']??'','lng'=>$p['lng']??'','width'=>$p['width']??'','length'=>$p['length']??'','problem'=>$p['problem']??'','reporter_name'=>$name,'reporter_email'=>$email,'consent'=>'1'];
        foreach($data as $k=>$v) update_post_meta($id,'_gfc_'.$k,sanitize_text_field((string)$v));
        wp_mail(get_option('admin_email'),'New Gamefields City report '.$ref,"New report: {$place}\nReference: {$ref}\nReview: ".admin_url('post.php?post='.$id.'&action=edit'));
        wp_mail($email,'Gamefields City — zgłoszenie '.$ref,"Dziękujemy. Zgłoszenie {$ref} trafiło do weryfikacji Gamefields. Po weryfikacji może zostać opublikowane jako projekt społecznościowy.");
        return rest_ensure_response(['ok'=>true,'reference'=>$ref,'report_id'=>$id]);
    }

    public static function api_vote($req) {
        global $wpdb; $t=self::tables();
        if (!self::rate_limit('vote',10)) return new WP_Error('rate_limited','Please wait',['status'=>429]);
        $p=$req->get_json_params(); $place_id=absint($p['place_id']??0); if (!$place_id || get_post_type($place_id)!=='gfc_place' || get_post_status($place_id)!=='publish') return new WP_Error('invalid_place','Invalid project',['status'=>400]);
        $email=sanitize_email($p['email']??''); $email_hash=$email?hash('sha256',strtolower($email)):''; $ip_hash=hash('sha256',self::client_ip().'|'.wp_salt('auth')); $voter_key=$email_hash?:$ip_hash;
        $ok=$wpdb->insert($t['votes'],['place_id'=>$place_id,'voter_key'=>$voter_key,'email_hash'=>$email_hash,'ip_hash'=>$ip_hash,'created_at'=>current_time('mysql')],['%d','%s','%s','%s','%s']);
        if (!$ok) return new WP_Error('already_supported','This project is already supported from this identity',['status'=>409]);
        $count=(int)$wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$t['votes']} WHERE place_id=%d",$place_id));
        update_post_meta($place_id,'_gfc_support',$count); self::recalc_score($place_id); self::queue_alert_if_changed($place_id);
        return rest_ensure_response(['ok'=>true,'support'=>$count,'score'=>(int)get_post_meta($place_id,'_gfc_score',true)]);
    }

    public static function api_alert($req) {
        global $wpdb; $t=self::tables();
        if (!self::rate_limit('alert',60)) return new WP_Error('rate_limited','Please wait',['status'=>429]);
        $p=$req->get_json_params(); $email=sanitize_email($p['email']??''); if (!$email || !is_email($email)) return new WP_Error('invalid_email','Valid email required',['status'=>400]);
        $token=wp_generate_password(48,false,false); $row=[
            'email'=>$email,'email_hash'=>hash('sha256',strtolower($email)),'lat'=>isset($p['lat'])?(float)$p['lat']:null,'lng'=>isset($p['lng'])?(float)$p['lng']:null,
            'radius_km'=>max(0.5,min(50,(float)($p['radius_km']??3))),'district'=>sanitize_text_field($p['district']??''),'sport'=>sanitize_text_field($p['sport']??''),
            'token'=>$token,'status'=>'pending','created_at'=>current_time('mysql')
        ];
        $wpdb->insert($t['alerts'],$row);
        $confirm=rest_url('gfc/v1/alert/confirm?token='.rawurlencode($token));
        wp_mail($email,'Potwierdź alert Gamefields City',"Potwierdź alert lokalny:\n{$confirm}\n\nBędziemy wysyłać informacje tylko o nowych lub istotnie zmienionych projektach pasujących do Twojego obszaru.");
        return rest_ensure_response(['ok'=>true,'message'=>'confirmation_sent']);
    }

    public static function api_alert_confirm($req) {
        global $wpdb; $t=self::tables(); $token=sanitize_text_field($req->get_param('token'));
        $id=$wpdb->get_var($wpdb->prepare("SELECT id FROM {$t['alerts']} WHERE token=%s",$token)); if (!$id) return new WP_Error('invalid_token','Invalid alert token',['status'=>404]);
        $wpdb->update($t['alerts'],['status'=>'active'],['id'=>$id]);
        return new WP_REST_Response('<!doctype html><meta charset="utf-8"><title>Gamefields City</title><div style="font:18px system-ui;max-width:620px;margin:80px auto"><h1>Alert aktywny</h1><p>Będziesz otrzymywać informacje o nowych projektach w wybranym obszarze.</p><p><a href="'.esc_url(home_url('/gamefields-city/')).'">Wróć do Gamefields City</a></p></div>',200,['Content-Type'=>'text/html; charset=utf-8']);
    }

    public static function api_alert_unsubscribe($req) {
        global $wpdb; $t=self::tables(); $token=sanitize_text_field($req->get_param('token'));
        $wpdb->update($t['alerts'],['status'=>'unsubscribed'],['token'=>$token]);
        return new WP_REST_Response('<!doctype html><meta charset="utf-8"><div style="font:18px system-ui;max-width:620px;margin:80px auto"><h1>Alert wyłączony</h1><p>Nie będziemy wysyłać kolejnych powiadomień dla tej subskrypcji.</p></div>',200,['Content-Type'=>'text/html; charset=utf-8']);
    }

    private static function distance_km($lat1,$lon1,$lat2,$lon2) {
        $r=6371; $dlat=deg2rad($lat2-$lat1); $dlon=deg2rad($lon2-$lon1); $a=sin($dlat/2)**2+cos(deg2rad($lat1))*cos(deg2rad($lat2))*sin($dlon/2)**2; return $r*2*atan2(sqrt($a),sqrt(1-$a));
    }

    public static function send_place_alerts($place_id) {
        global $wpdb; $t=self::tables(); if (get_post_status($place_id)!=='publish') return;
        $p=self::place_payload($place_id); $rows=$wpdb->get_results("SELECT * FROM {$t['alerts']} WHERE status='active'");
        foreach($rows as $a) {
            $match=true;
            if ($a->district && strcasecmp($a->district,$p['district'])!==0) $match=false;
            if ($a->sport && strcasecmp($a->sport,$p['sport'])!==0) $match=false;
            if ($a->lat!==null && $a->lng!==null && $p['lat'] && $p['lng'] && self::distance_km((float)$a->lat,(float)$a->lng,$p['lat'],$p['lng'])>(float)$a->radius_km) $match=false;
            if (!$match) continue;
            $unsub=rest_url('gfc/v1/alert/unsubscribe?token='.rawurlencode($a->token));
            $subject='Gamefields City: '.$p['name'].' · '.$p['status'];
            $body="Nowy lub zaktualizowany projekt w obserwowanym obszarze.\n\n{$p['name']}\nSport: {$p['sport']}\nStatus: {$p['status']}\nPoparcie: {$p['support']}\nDemand Score: {$p['score']}/100\n\n{$p['url']}\n\nWyłącz alert: {$unsub}";
            wp_mail($a->email,$subject,$body); $wpdb->update($t['alerts'],['last_sent_at'=>current_time('mysql')],['id'=>$a->id]);
        }
    }

    public static function cron_alerts() {
        // Safety net: recalculate all public project scores once an hour.
        $ids=get_posts(['post_type'=>'gfc_place','post_status'=>'publish','posts_per_page'=>200,'fields'=>'ids']); foreach($ids as $id) self::recalc_score($id);
    }

    public static function api_ops() {
        global $wpdb; $t=self::tables();
        $statuses=[]; foreach(['discovered','verified','designed','backed','built'] as $s) $statuses[$s]=(int)(new WP_Query(['post_type'=>'gfc_place','post_status'=>['publish','draft'],'tax_query'=>[['taxonomy'=>'gfc_status','field'=>'slug','terms'=>$s]],'fields'=>'ids','posts_per_page'=>1]))->found_posts;
        return rest_ensure_response(['pipeline'=>$statuses,'reports_pending'=>(int)(new WP_Query(['post_type'=>'gfc_report','post_status'=>'pending','fields'=>'ids','posts_per_page'=>1]))->found_posts,'alerts_active'=>(int)$wpdb->get_var("SELECT COUNT(*) FROM {$t['alerts']} WHERE status='active'"),'votes_total'=>(int)$wpdb->get_var("SELECT COUNT(*) FROM {$t['votes']}")]);
    }

    public static function place_columns($cols) { $cols['gfc_status']='Status';$cols['gfc_score']='Demand';$cols['gfc_support']='Support';$cols['gfc_next']='Next action';return $cols; }
    public static function place_column($col,$id) { if($col==='gfc_status') echo esc_html(implode(', ',wp_get_post_terms($id,'gfc_status',['fields'=>'names']))); if($col==='gfc_score') echo (int)get_post_meta($id,'_gfc_score',true).'/100'; if($col==='gfc_support') echo (int)get_post_meta($id,'_gfc_support',true); if($col==='gfc_next') echo esc_html(get_post_meta($id,'_gfc_next_action',true)); }
    public static function report_columns($cols) { $cols['gfc_ref']='Reference';$cols['gfc_district']='District';$cols['gfc_sport']='Sport';$cols['gfc_email']='Reporter';return $cols; }
    public static function report_column($col,$id) { $map=['gfc_ref'=>'reference','gfc_district'=>'district','gfc_sport'=>'sport','gfc_email'=>'reporter_email']; if(isset($map[$col])) echo esc_html(get_post_meta($id,'_gfc_'.$map[$col],true)); }

    public static function shortcode_report() { return '<div class="gfc-engine-form" data-gfc-report-form><p>Use the Gamefields City map to choose a place and submit it for verification.</p><a class="button" href="'.esc_url(home_url('/gamefields-city/')).'">Open Gamefields City</a></div>'; }
    public static function shortcode_alert() {
        ob_start(); ?>
        <form id="gfc-alert-form" style="display:grid;gap:10px;max-width:620px">
            <input required type="email" name="email" placeholder="E-mail">
            <input name="district" placeholder="Dzielnica (opcjonalnie)">
            <input name="sport" placeholder="Sport (opcjonalnie)">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><input type="number" step="0.000001" name="lat" placeholder="Szerokość geogr."><input type="number" step="0.000001" name="lng" placeholder="Długość geogr."></div>
            <input type="number" step="0.5" min="0.5" max="50" name="radius_km" value="3" placeholder="Promień km">
            <button type="submit">Włącz lokalne alerty</button><div id="gfc-alert-msg"></div>
        </form>
        <script>(function(){var f=document.getElementById('gfc-alert-form');if(!f)return;f.addEventListener('submit',async function(e){e.preventDefault();var o=Object.fromEntries(new FormData(f).entries());var r=await fetch('/wp-json/gfc/v1/alert',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(o)});var j=await r.json();document.getElementById('gfc-alert-msg').textContent=r.ok?'Sprawdź e-mail i potwierdź alert.':(j.message||'Nie udało się zapisać alertu.');});})();</script>
        <?php return ob_get_clean();
    }
    public static function shortcode_ops() { if(!current_user_can('edit_others_posts')) return ''; return '<div id="gfc-ops-engine">Gamefields City Engine active. <a href="'.esc_url(admin_url('edit.php?post_type=gfc_place')).'">Projects</a> · <a href="'.esc_url(admin_url('edit.php?post_type=gfc_report')).'">Reports</a></div>'; }
}

register_activation_hook(__FILE__, ['GFC_Engine','activate']);
register_deactivation_hook(__FILE__, ['GFC_Engine','deactivate']);
GFC_Engine::init();
