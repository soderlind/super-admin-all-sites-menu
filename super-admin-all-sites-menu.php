<?php
/**
 * Super Admin All Sites Menu
 *
 * @package     Soderlind\Multisite
 * @author      Per Soderlind
 * @copyright   2021 Per Soderlind
 * @license     GPL-2.0+
 *
 * @wordpress-plugin
 * Plugin Name: Super Admin All Sites Menu
 * Plugin URI: https://github.com/soderlind/super-admin-all-sites-menu
 * GitHub Plugin URI: https://github.com/soderlind/super-admin-all-sites-menu
 * Description: For the super admin, replace WP Admin Bar My Sites menu with an All Sites menu.
 * Version:     1.0.8
 * Author:      Per Soderlind
 * Network:     true
 * Author URI:  https://soderlind.no
 * Text Domain: super-admin-sites-menu
 * License:     GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 */

declare( strict_types = 1 );
namespace Soderlind\Multisite;

if ( ! defined( 'ABSPATH' ) ) {
	wp_die();
}


/**
 * De-register the native WP Admin Bar My Sites function.
 */
add_action(
	'add_admin_bar_menus',
	function() : void {

		if ( ! \is_multisite() ) {
			return;
		}

		if ( ! \is_super_admin() ) {
			return;
		}
		remove_action( 'admin_bar_menu', 'wp_admin_bar_my_sites_menu', 20 );
	}
);

add_action( 'admin_bar_menu', __NAMESPACE__ . '\\super_admin_all_sites_menu', 25 );
add_action( 'admin_enqueue_scripts', __NAMESPACE__ . '\\action_admin_enqueue_scripts' );
add_action( 'wp_ajax_all_sites_menu_action', __NAMESPACE__ . '\all_sites_menu_action' );
// add_action( 'wp_ajax_nopriv_all_sites_menu_action', __NAMESPACE__ . '\all_sites_menu_action' );

/**
 * Add the "All Sites/[Site Name]" menu and all submenus, listing all subsites.
 *
 * Essentially the same as the WP native one but doesn't use switch_to_blog();
 *
 * @param \WP_Admin_Bar $wp_admin_bar WP_Admin_Bar instance, passed by reference.
 */
function super_admin_all_sites_menu( \WP_Admin_Bar $wp_admin_bar ) : void {

	if ( ! \is_multisite() ) {
		return;
	}

	if ( ! \is_super_admin() ) {
		return;
	}

	$my_sites_url = \admin_url( '/my-sites.php' );
	$wp_admin_bar->add_menu(
		[
			'id'    => 'my-sites',
			'title' => __( 'All Sites', 'super-admin-sites-menu' ),
			'href'  => $my_sites_url,
		]
	);

	if ( \is_super_admin() ) {
		$wp_admin_bar->add_group(
			[
				'parent' => 'my-sites',
				'id'     => 'my-sites-super-admin',
			]
		);

		$wp_admin_bar->add_menu(
			[
				'parent' => 'my-sites-super-admin',
				'id'     => 'network-admin',
				'title'  => __( 'Network Admin' ),
				'href'   => \network_admin_url(),
			]
		);

		$wp_admin_bar->add_menu(
			[
				'parent' => 'network-admin',
				'id'     => 'network-admin-d',
				'title'  => __( 'Dashboard' ),
				'href'   => \network_admin_url(),
			]
		);
		$wp_admin_bar->add_menu(
			[
				'parent' => 'network-admin',
				'id'     => 'network-admin-s',
				'title'  => __( 'Sites' ),
				'href'   => \network_admin_url( '/sites.php' ),
			]
		);
		$wp_admin_bar->add_menu(
			[
				'parent' => 'network-admin',
				'id'     => 'network-admin-n',
				'title'  => __( 'Add New Site' ),
				'href'   => \network_admin_url( '/site-new.php' ),
			]
		);
		$wp_admin_bar->add_menu(
			[
				'parent' => 'network-admin',
				'id'     => 'network-admin-u',
				'title'  => __( 'Users' ),
				'href'   => \network_admin_url( '/users.php' ),
			]
		);
		$wp_admin_bar->add_menu(
			[
				'parent' => 'network-admin',
				'id'     => 'network-admin-t',
				'title'  => __( 'Themes' ),
				'href'   => \network_admin_url( '/themes.php' ),
			]
		);
		$wp_admin_bar->add_menu(
			[
				'parent' => 'network-admin',
				'id'     => 'network-admin-p',
				'title'  => __( 'Plugins' ),
				'href'   => \network_admin_url( '/plugins.php' ),
			]
		);
		$wp_admin_bar->add_menu(
			[
				'parent' => 'network-admin',
				'id'     => 'network-admin-o',
				'title'  => __( 'Settings' ),
				'href'   => \network_admin_url( '/settings.php' ),
			]
		);
	}

	// Add site links.
	$wp_admin_bar->add_group(
		[
			'parent' => 'my-sites',
			'id'     => 'my-sites-list',
			'meta'   => [
				'class' => 'ab-sub-secondary',
			],
		]
	);

		// $wp_admin_bar->add_menu(
		// 	[
		// 		'parent' => 'my-sites-list',
		// 		// 'id'     => $menu_id,
		// 		// 'title'  => $blavatar . $blogname,
		// 		// 'href'   => $admin_url,
		// 	]
		// );


	$sites = \get_sites(
		// [
		// 	'orderby' => 'path',
		// ]
	);
		// Sort blogs alphabetically.
	uasort(
			$sites,
			function( $a, $b ) {
					// Compare site blog names alphabetically for sorting purposes.
					return strcmp( $a->__get( 'blogname' ), $b->__get( 'blogname' ) );
			}
	);

	foreach ( (array) $sites as $site ) {

		$blogid    = $site->blog_id;
		$blogname  = $site->__get( 'blogname' );
		$menu_id   = 'blog-' . $blogid;
		$blavatar  = '<div class="blavatar"></div>';
		$siteurl   = $site->__get( 'siteurl' );
		$admin_url = $siteurl . '/wp-admin';

		if ( ! $blogname ) {
			$blogname = preg_replace( '#^(https?://)?(www.)?#', '', $siteurl );
		}

		// The $site->public value is set to 2, by the Restricted Site Access plugin, when a site has restricted access.
		if ( 2 === (int) $site->public ) {
			$blavatar = '<div class="blavatar" style="color:#f00;"></div>';
		}

		$wp_admin_bar->add_menu(
			[
				'parent' => 'my-sites-list',
				'id'     => $menu_id,
				'title'  => $blavatar . $blogname,
				'href'   => $admin_url,
			]
		);
		$wp_admin_bar->add_menu(
			[
				'parent' => $menu_id,
				'id'     => $menu_id . '-d',
				'title'  => __( 'Dashboard' ),
				'href'   => $admin_url,
			]
		);
		$wp_admin_bar->add_menu(
			[
				'parent' => $menu_id,
				'id'     => $menu_id . '-n',
				'title'  => \get_post_type_object( 'post' )->labels->new_item,
				'href'   => $admin_url . '/post-new.php',
			]
		);
		$wp_admin_bar->add_menu(
			[
				'parent' => $menu_id,
				'id'     => $menu_id . '-o',
				'title'  => \get_post_type_object( 'page' )->labels->new_item,
				'href'   => $admin_url . '/post-new.php?post_type=page',
			]
		);
		$wp_admin_bar->add_menu(
			[
				'parent' => $menu_id,
				'id'     => $menu_id . '-c',
				'title'  => __( 'Manage Comments' ),
				'href'   => $admin_url . '/edit-comments.php',
			]
		);
		$wp_admin_bar->add_menu(
			[
				'parent' => $menu_id,
				'id'     => $menu_id . '-u',
				'title'  => __( 'Users' ),
				'href'   => $admin_url . '/users.php',
			]
		);
		$wp_admin_bar->add_menu(
			[
				'parent' => $menu_id,
				'id'     => $menu_id . '-p',
				'title'  => __( 'Plugins' ),
				'href'   => $admin_url . '/plugins.php',
			]
		);
		$wp_admin_bar->add_menu(
			[
				'parent' => $menu_id,
				'id'     => $menu_id . '-s',
				'title'  => __( 'Settings' ),
				'href'   => $admin_url . '/options-general.php',
			]
		);
		$wp_admin_bar->add_menu(
			[
				'parent' => $menu_id,
				'id'     => $menu_id . '-v',
				'title'  => __( 'Visit Site' ),
				'href'   => $siteurl,
			]
		);
	}
}



/**
 * Enqueue scripts for all admin pages.
 *
 * @param string $hook_suffix The current admin page.
 */
function action_admin_enqueue_scripts( string $hook_suffix ) : void {

	// $path_style = plugin_dir_url( __FILE__ ) . 'include/multisite_menu_patch.css';
	// $deps_style = [];
	// wp_register_style( 'multisite_menu_patch_style', $path_style, $depth_style, '1.0.0' );
	// wp_enqueue_style( 'multisite_menu_patch_style' );

	// $path_script = plugin_dir_url( __FILE__ ) . 'include/multisite_menu_patch.js';
	// $deps_script = [ 'admin-bar' ];
	// wp_register_script( 'multisite_menu_patch_script', $path_script, $deps_script, '1.0.0' );
	// wp_enqueue_script( 'multisite_menu_patch_script' );
	$ajaxurl = get_ajax_url();
	$path_script = plugin_dir_url( __FILE__ ) . 'include/load-sites-menu.js';
	$deps_script = [ 'admin-bar' ];
	// wp_register_script( 'super-admin-sites-menu', $path_script, $deps_script, '1.0.0' );
	// wp_enqueue_script( 'super-admin-sites-menu' );
	// 	$data = wp_json_encode(
	// 	[
	// 		'nonce'   => wp_create_nonce( 'all_sites_menu_nonce' ),
	// 		'ajaxurl' => $ajaxurl,
	// 	]
	// );
	// wp_add_inline_script( 'super-admin-sites-menu', "const pluginAllSitesMenu = ${data};" );
	wp_enqueue_script( 'all-sites-scroll', plugin_dir_url( __FILE__ ) . 'include/scroll-menu.js', [ 'jquery' ], rand(), true );

}


/**
 * Ajax action, triggerd by fetch() in es6-wp-ajax-demo.js
 *
 * @return void
 */
function all_sites_menu_action() {
	header( 'Content-type: application/json' );
	if ( check_ajax_referer( 'all_sites_menu_nonce', 'nonce', false ) ) {

		$sites = get_sites();
		$menu = [];
		foreach ( $sites as $site ) {
			$menu[] = [
				'id'     => $site->blog_id,
				'parent' => $site->domain,
				'title'  => $site->blog_name,
				'href'   => get_home_url( $site->blog_id ),
			];
		}

		if ( [] !== $menu ) {
			$response['response'] = 'success';
			$response['data']     = $menu;
		} else {
			$response['response'] = 'failed';
			$response['data']     = 'something went wrong ...';
		}
	} else {
		$response['response'] = 'failed';
		$response['message']  = 'invalid nonse';
	}
	echo wp_json_encode( $response );
	wp_die();
}



/**
 * Add Scripts.
 *
 * @return void
 */
function wp_scripts() {
	$ajaxurl = get_ajax_url();
	$url     = plugins_url( '', __FILE__ );

	// Load fetch polyfill, url via https://polyfill.io/v3/url-builder/.
	wp_enqueue_script( 'polyfill-fetch', 'https://polyfill.io/v3/polyfill.min.js?features=fetch', [], ES6_WP_AJAX_DEMO_VERSION, true );
	wp_enqueue_script( 'es6-wp-ajax', $url . '/es6-wp-ajax-demo.js', [ 'polyfill-fetch' ], ES6_WP_AJAX_DEMO_VERSION, true );
	$data = wp_json_encode(
		[
			'nonce'   => wp_create_nonce( 'es6_wp_ajax_nonce' ),
			'ajaxurl' => $ajaxurl,
		]
	);
	wp_add_inline_script( 'es6-wp-ajax', "const pluginES6WPAjax = ${data};" );
}

/**
 * Get the Ajax URL.
 *
 * @return string
 */
function get_ajax_url() : string {
	// multisite fix, use home_url() if domain mapped to avoid cross-domain issues.
	$http_scheme = ( is_ssl() ) ? 'https' : 'http';
	if ( home_url() !== site_url() ) {
		$ajaxurl = home_url( '/wp-admin/admin-ajax.php', $http_scheme );
	} else {
		$ajaxurl = site_url( '/wp-admin/admin-ajax.php', $http_scheme );
	}
	return $ajaxurl;
}