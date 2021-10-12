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
 * Version:     1.4.8
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
const LOADINCREMENTS  = 100; // Number of sites to load at a time.
const SEARCHTHRESHOLD = 20; // Number of sites before showing the search box.

/**
 * Super Admin All Sites Menu
 */
class SuperAdminAllSitesMenu {

	/**
	 * Plugin version.
	 *
	 * @var string
	 */
	private $version = '1.4.8';

	/**
	 * AJAX load increments.
	 *
	 * @var [type]
	 */
	private $load_increments = LOADINCREMENTS;

	/**
	 * Plugins triggering update local storages.
	 *
	 * @var array
	 */
	private $plugins = [
		'restricted-site-access/restricted_site_access.php',
	];

	/**
	 * Sort menu by site name.
	 *
	 * @var string
	 */
	private $order_by = 'name';


	/**
	 * Store number of sites.
	 *
	 * @var integer
	 */
	private $number_of_sites = 0;

	/**
	 * Set the search threshold.
	 *
	 * @var [type]
	 */
	private $search_threshold = SEARCHTHRESHOLD;

	/**
	 * Store the timestamp.
	 *
	 * @var integer
	 */
	private $timestamp = 0;
	/**
	 * Constructor.
	 */
	public function __construct() {

		add_action( 'add_admin_bar_menus', [ $this, 'action_add_admin_bar_menus' ] );
		add_action( 'admin_bar_menu', [ $this, 'super_admin_all_sites_menu' ], 25 );
		add_action( 'wp_ajax_all_sites_menu_action', [ $this, 'all_sites_menu_action' ] );

		add_action( 'admin_enqueue_scripts', [ $this, 'action_enqueue_scripts' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'action_enqueue_scripts' ] );

		add_action( 'wp_insert_site', [ $this, 'update_local_storage' ] );
		add_action( 'wp_delete_site', [ $this, 'update_local_storage' ] );

		add_action( 'update_option_blogname', [ $this, 'action_update_option_option' ], 10, 3 );

		add_action( 'activated_plugin', [ $this, 'plugin_update_local_storage' ], 10, 1 );
		add_action( 'deactivated_plugin', [ $this, 'plugin_update_local_storage' ], 10, 1 );

		register_deactivation_hook( __FILE__, [ $this, 'deactivate' ] );
	}

	/**
	 * Init values.
	 *
	 * @return void
	 */
	public function init() : void {
		$this->number_of_sites = $this->get_number_of_sites();
		$this->timestamp       = $this->get_timestamp();
		$this->do_filters();
		if ( 0 === get_site_option( 'allsitemenutimestamp', 0 ) ) {
			update_site_option( 'allsitemenutimestamp', $this->timestamp );
		}
	}

	/**
	 * Update private properties from hooks.
	 *
	 * @return void
	 */
	public function do_filters() : void {
		$this->plugins = \apply_filters( 'all_sites_menu_plugin_trigger', $this->plugins );
		if ( ! is_array( $this->plugins ) ) {
			$this->plugins = [ 'restricted-site-access/restricted_site_access.php' ];
		}

		$this->order_by = \apply_filters( 'all_sites_menu_order_by', $this->order_by );
		if ( ! in_array( $this->order_by, [ 'name', 'url', 'id' ], true ) ) {
			$this->order_by = 'name';
		}

		$this->load_increments = \apply_filters( 'all_sites_menu_load_increments', $this->load_increments );
		if ( ! is_numeric( $this->load_increments ) || $this->load_increments < 1 ) {
			$this->load_increments = LOADINCREMENTS;
		}

		$this->search_threshold = \apply_filters( 'all_sites_menu_search_threshold', $this->search_threshold );
		if ( ! is_numeric( $this->search_threshold ) || $this->search_threshold < 1 ) {
			$this->search_threshold = SEARCHTHRESHOLD;
		}
	}

	/**
	 * Remove the default WP Admin Bar My Sites menu.
	 *
	 * @return void
	 */
	public function action_add_admin_bar_menus() : void {

		if ( ! \is_super_admin() ) {
			return;
		}
		remove_action( 'admin_bar_menu', 'wp_admin_bar_my_sites_menu', 20 );

	}

	/**
	 * Add the "All Sites/[Site Name]" menu and all submenus, listing all subsites.
	 *
	 * Essentially the same as the WP native one but doesn't use switch_to_blog();
	 *
	 * @param \WP_Admin_Bar $wp_admin_bar The admin bar object.
	 * @return void
	 */
	public function super_admin_all_sites_menu( \WP_Admin_Bar $wp_admin_bar ) : void {

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

		if ( $this->number_of_sites > $this->search_threshold ) {
			// Add search field.
			$wp_admin_bar->add_menu(
				[
					'parent' => 'my-sites-list',
					'id'     => 'all-sites-search',
					'title'  => sprintf(
						'<label for="all-sites-search-text">%s</label><input type="text" id="all-sites-search-text" placeholder="%s" />',
						esc_html__( 'Filter My Sites', 'super-admin-sites-menu' ),
						esc_attr__( 'Search Sites', 'super-admin-sites-menu' )
					),
					'meta'   => [
						'class' => 'hide-if-no-js',
					],
				]
			);
		}

		// Add an observable container, used by the IntersectionObserver in include/modules/observe.js.
		$timestamp = get_site_option( 'allsitemenutimestamp' );
		$wp_admin_bar->add_menu(
			[
				'id'     => 'load-more',
				'parent' => 'my-sites-list',
				'title'  => __( 'Loading..', 'super-admin-sites-menu' ),
				'meta'   => [
					'html'     => sprintf( '<span id="load-more-increment" data-increment="0" data-timestamp="%s"></span>', $timestamp ),
					'class'    => 'load-more hide-if-no-js',
					'tabindex' => -1,
				],
			]
		);

	}

	/**
	 * Ajax action, triggered by loadSites() in include/modules/ajax.js.
	 *
	 * @return void
	 */
	public function all_sites_menu_action() {
		header( 'Content-type: application/json' );
		if ( check_ajax_referer( 'all_sites_menu_nonce', 'nonce', false ) ) {
			$increment = ( isset( $_POST['increment'] ) ) ? filter_var( wp_unslash( $_POST['increment'] ), FILTER_VALIDATE_INT, [ 'default' => 0 ] ) : 0;

			$sites     = \get_sites(
				[
					'orderby' => 'path',
					'number'  => $this->load_increments,
					'offset'  => $increment,
				]
			);
			$menu      = [];
			$timestamp = time();
			foreach ( $sites as $site ) {

				$blogid   = $site->blog_id;
				$blogname = $site->__get( 'blogname' );
				$menu_id  = 'blog-' . $blogid;
				$blavatar = '<div class="blavatar"></div>';
				$siteurl  = $site->__get( 'siteurl' );
				$adminurl = $siteurl . '/wp-admin';

				if ( ! $blogname ) {
					$blogname = preg_replace( '#^(https?://)?(www.)?#', '', $siteurl );
				}

				// The $site->public value is set to 2, by the Restricted Site Access plugin, when a site has restricted access.
				if ( 2 === (int) $site->public ) {
					$blavatar = '<div class="blavatar" style="color:#f00;"></div>';
				}
				$menu[] = [
					'parent'    => 'my-sites-list',
					'id'        => $menu_id,
					'name'      => strtoupper( $blogname ), // Index in local storage.
					'title'     => $blavatar . $blogname,
					'admin'     => $adminurl,
					'url'       => $siteurl,
					'timestamp' => $timestamp,
				];
			}

			if ( [] !== $menu ) {
				$response['response'] = 'success';
				$response['data']     = $menu;
				update_site_option( 'allsitemenutimestamp', $this->timestamp );
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
	 * @return void
	 */
	public function action_enqueue_scripts( string $hook_suffix ) : void {

		wp_register_style( 'super-admin-sites-menu', plugin_dir_url( __FILE__ ) . 'include/all-sites-menu.css', [], $this->version );
		wp_enqueue_style( 'super-admin-sites-menu' );

		wp_register_script( 'dexie', plugin_dir_url( __FILE__ ) . 'lib/dexie.js', [], $this->version, true );
		wp_enqueue_script( 'dexie' );

		wp_register_script( 'super-admin-sites-menu', plugin_dir_url( __FILE__ ) . 'include/all-sites-menu.js', [ 'admin-bar', 'dexie', 'jquery' ], $this->version, true );
		wp_enqueue_script( 'super-admin-sites-menu' );
		$data = wp_json_encode(
			[
				'nonce'          => wp_create_nonce( 'all_sites_menu_nonce' ),
				'ajaxurl'        => $this->get_ajax_url(),
				'loadincrements' => $this->load_increments,
				'orderBy'        => $this->order_by,
				'displaySearch'  => ( $this->number_of_sites > $this->search_threshold ) ? true : false,
				'l10n'           => [
					'dashboard'      => __( 'Dashboard' ),
					'newpost'        => __( 'New Post' ),
					'newpage'        => __( 'New Page' ),
					'managecomments' => __( 'Manage Comments' ),
					'users'          => __( 'Users' ),
					'plugins'        => __( 'Plugins' ),
					'settings'       => __( 'Settings' ),
					'visit'          => __( 'Visit' ),
				],
			]
		);

		wp_add_inline_script( 'super-admin-sites-menu', "const pluginAllSitesMenu = ${data};", 'before' );
	}

	/**
	 * Fires after a site has been added to or deleted from the database.
	 *
	 * @param \WP_Site $site Site object.
	 * @return void
	 */
	public function update_local_storage( \WP_Site $site ) : void {
		$this->refresh_local_storage();
	}

	/**
	 * Fires after a plugin is activated/deactivated.
	 *
	 * @param string $plugin       Path to the plugin file relative to the plugins directory.
	 * @return void                           or just the current site. Multisite only. Default false.
	 */
	public function plugin_update_local_storage( string $plugin ) : void {
		if ( in_array( $plugin, $this->plugins, true ) ) {
			$this->refresh_local_storage();
		}
	}

	/**
	 * Fires after the a blog is renamed.
	 *
	 * @param mixed  $old_value The old option value.
	 * @param mixed  $value     The new option value.
	 * @param string $option    Option name.
	 * @return void
	 */
	public function action_update_option_option( $old_value, $value, string $option ) : void {
		if ( $old_value !== $value ) {
			$this->refresh_local_storage();
		}
	}

	/**
	 * When options allsitemenurefresh is true, refresh the local storage.
	 *
	 * @return void
	 */
	public function refresh_local_storage() : void {
		update_site_option( 'allsitemenutimestamp', $this->timestamp );
	}

	/**
	 * Remove site option when plugin is deactivated.
	 *
	 * @return void
	 */
	public function deactivate() : void {
		delete_site_option( 'allsitemenutimestamp' );
	}

	/**
	 * Get the Ajax URL.
	 *
	 * @return string
	 */
	private function get_ajax_url() : string {
		// multisite fix, use home_url() if domain mapped to avoid cross-domain issues.
		$http_scheme = ( is_ssl() ) ? 'https' : 'http';
		if ( home_url() !== site_url() ) {
			$ajaxurl = home_url( '/wp-admin/admin-ajax.php', $http_scheme );
		} else {
			$ajaxurl = site_url( '/wp-admin/admin-ajax.php', $http_scheme );
		}
		return $ajaxurl;
	}

	/**
	 * Get number of sites.
	 *
	 * @return integer
	 */
	private function get_number_of_sites() : int {
		$network_id = get_current_network_id();

		$args = [
			'network_id'    => $network_id,
			'number'        => 1,
			'fields'        => 'ids',
			'no_found_rows' => false,
		];

		$q = new \WP_Site_Query( $args );
		return $q->found_sites;
	}

	/**
	 * Get the timestamp.
	 *
	 * @return string
	 */
	private function get_timestamp() : string {
		return (string) time();
	}

}


if ( \is_multisite() ) {
	$super_admin_sites_menu = new SuperAdminAllSitesMenu();
	$super_admin_sites_menu->init();
}
