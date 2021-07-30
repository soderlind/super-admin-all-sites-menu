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
 * Version:     1.1.1
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
				'class' => 'ab-sub-secondary my-sites-container',
			],
		]
	);

	// Add an observable container, used by the IntersectionObserver.
	$wp_admin_bar->add_menu(
		[
			'id'     => 'load-more',
			'parent' => 'my-sites-list',
			'title'  => __( 'Loading..', 'some-textdomain' ),
			'meta'   => [
				'html'     => '<span id="load-more-offset" data-offset="0"></span>',
				'class'    => 'load-more hide-if-no-js',
				'tabindex' => -1,
			],
		]
	);

}


/**
 * Ajax action, triggerd by fetch() in es6-wp-ajax-demo.js
 *
 * @return void
 */
function all_sites_menu_action() {
	header( 'Content-type: application/json' );
	if ( check_ajax_referer( 'all_sites_menu_nonce', 'nonce', false ) ) {
		$offset = ( isset( $_POST['offset'] ) ) ? filter_var( wp_unslash( $_POST['offset'] ), FILTER_VALIDATE_INT, [ 'default' => 0 ] ) : 0;

		$sites = \get_sites(
			[
				'orderby' => 'path',
				'number'  => 80,
				'offset'  => $offset,
			]
		);
		$menu  = [];
		foreach ( $sites as $site ) {

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
			$menu[] = [
				'parent' => 'my-sites-list',
				'id'     => $menu_id,
				'title'  => $blavatar . $blogname,
				'href'   => $admin_url,
			];
		}

		if ( [] !== $menu ) {
			$response['response'] = 'success';
			$response['data']     = $menu;
		} else {
			$response['response'] = 'unobserve';
			$response['data']     = 'something went wrong ...' . count( $menu ) . ' items returned';
		}
	} else {
		$response['response'] = 'failed';
		$response['message']  = 'invalid nonse';
	}
	echo wp_json_encode( $response );
	wp_die();
}




/**
 * Enqueue scripts for all admin pages.
 *
 * @param string $hook_suffix The current admin page.
 */
function action_admin_enqueue_scripts( string $hook_suffix ) : void {

	wp_register_style( 'super-admin-sites-menu', plugin_dir_url( __FILE__ ) . 'include/my-sites.css', [], '1.1.0' );
	wp_enqueue_style( 'super-admin-sites-menu' );

	wp_register_script( 'super-admin-sites-menu', plugin_dir_url( __FILE__ ) . 'include/load-sites.js', [ 'admin-bar' ], '1.1.0', true );
	wp_enqueue_script( 'super-admin-sites-menu' );
	$data = wp_json_encode(
		[
			'nonce'   => wp_create_nonce( 'all_sites_menu_nonce' ),
			'ajaxurl' => get_ajax_url(),
			'l10n'    => [
				'dashboard'      => __( 'Dashboard' ),
				'newpost'        => __( 'New Post' ),
				'newpage'        => __( 'New Page' ),
				'managecomments' => __( 'Manage Comments' ),
				'users'          => __( 'Users' ),
				'plugins'        => __( 'Plugins' ),
				'settings'       => __( 'Settings' ),
			],
		]
	);
	wp_add_inline_script( 'super-admin-sites-menu', "const pluginAllSitesMenu = ${data};" );
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
