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
 * GitHub Plugin URI: https://github.com/soderlind/super-admin-sites-menu
 * Description: For the super admin, replace WP Admin Bar My Sites menu with an All Sites menu.
 * Version:     1.0.4
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

	$sites = \get_sites();

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
