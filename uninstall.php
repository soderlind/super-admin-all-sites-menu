<?php
/**
 * Fired when the plugin is uninstalled.
 *
 * @link       https://github.com/soderlind/super-admin-all-sites-menu
 * @since      1.4.5
 * @package    Soderlind\Multisite
 */

// If uninstall not called from WordPress, then exit.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

delete_site_transient( 'allsitemenutimestamp' );
