=== Super Admin All Sites Menu ===
Stable tag: 1.11.1
Requires at least: 5.6  
Tested up to: 7.0  
Requires PHP: 8.0  
License: GPL v2 or later  
Tags: superadmin, multisite, management  
Contributors: PerS  
Donate link: https://www.paypal.com/paypalme/PerSoderlind

For the super admin, replace WP Admin Bar My Sites menu with an All Sites menu.

== Description ==

* Doesn't use `switch_to_blog()`, i.e. Super Admin All Sites Menu is faster and uses less resources than the WP Admin Bar My Sites menu.
* Subsite menu data are stored locally in IndexedDB (did I say it's fast?). The local storage is updated when;
  * the plugin is activated.
  * a site is added or deleted.
  * you change a blog name.
  * IndexedDB is out of sync with site changes.
  * [Restricted Site Access](https://github.com/10up/restricted-site-access) is activated or deactivated.
* When subsite menu data is updated, AJAX is used and it's done in increments (100 sites per increment).
* List all subsites. WP Admin Bar My Sites only list sites you're a local admin on.
* Mark sites that has [restricted site access](https://github.com/10up/restricted-site-access) with a red icon.
* Sites menu is sorted alphabetically.
* Search filter.
* Add more menu choices:
     * Under "Network Admin"
         * Add New Site
     * Per subsite.
         * 'New Page'
         * 'Users'
         * 'Plugins'
         * 'Settings'

= Prerequisite =

* WordPress Multisite
* A modern browser, IE 11 isn't supported.

= Demo =

A demo is available in [WordPress Playground](https://playground.wordpress.net/?blueprint-url=https://raw.githubusercontent.com/soderlind/super-admin-all-sites-menu/refs/heads/main/blueprint.json). It's a bit slow loading, 50 subsites are added.

- If you disable Super Admin All Sites Menu in the Main Site plugins menu, you'll see the WP Admin Bar My Sites menu doesn't allow you to scroll and see all sites. This is a 14-year-old (!) [bug on WordPress](https://core.trac.wordpress.org/ticket/15317).

- If you activate the Restricted Site Access plugin (included), you'll see a red icon next to the site name. ATM, this only works on the main site due to [issues with WordPress Playground](https://github.com/WordPress/wordpress-playground/issues/2054).

= Filters =

You can use the following filters to override the defaults:

* `all_sites_menu_order_by`
  * Sort menu by. Default value is `name`, accepts `id`, `url` or `name`
    `
    add_filter( 'all_sites_menu_order_by', function( string $order_by ) : string {
    	return 'url';
    } );
    `
* `all_sites_menu_load_increments`
  * AJAX load increments. Default value is 100.
    `
    add_filter( 'all_sites_menu_load_increments', function( int $increments ) : int {
  		return 300;
  	} );
  	`
* `all_sites_menu_plugin_trigger`
  * Trigger an update of local storage (IndexedDB) when a plugin is (de)activated. Default is `[ 'restricted-site-access/restricted_site_access.php' ]`.
    > Note: Must be an array and each element in the array must point to the main plugin file. Syntax `'plugin-dir/plugin-file.php'`
  	`
   	add_filter( 'all_sites_menu_plugin_trigger', function( array $plugins ) : array {
  		return [
  			'restricted-site-access/restricted_site_access.php',
  			'myplugin/myplugin.php',
  		];
  	} );
  	`
* `all_sites_menu_search_threshold`
  * Don't display search field if there's less than N subsites. Default value is 20.
  	`
  	add_filter( 'all_sites_menu_search_threshold', function( int $increments ) : int {
  		return 40;
  	} );
  	`
* `all_sites_menu_search_threshold`
  * Don't display search field if there's less than N subsites. Default value is 20.
  	`
  	add_filter( 'all_sites_menu_search_threshold', function( int $increments ) : int {
  		return 40;
  	} );
  	`
* `all_sites_menu_force_refresh_expiration`
  * How often a forced refresh should be taken. Default value is `3600`. Set the value to `0` to disable forced refresh.
  	`
  	add_filter( 'all_sites_menu_force_refresh_expiration', function( int $seconds ) : int {
  		return 3600;
  	} );
  	`
* `all_sites_menu_submenu_items`
  * Customise the per-site submenu items (add, remove, or reorder). Each item: `['id' => string, 'title' => string, 'href' => string]`. Receives `$items`, `$blog_id`, `$admin_url`, `$site_url`.
  	`
  	// Add an "Edit Site" link pointing to the network admin site-info page.
  	add_filter( 'all_sites_menu_submenu_items', function( array $items, int $blog_id, string $admin_url ) : array {
  		$items[] = [
  			'id'    => 'edit-site',
  			'title' => 'Edit Site',
  			'href'  => network_admin_url( 'site-info.php?id=' . $blog_id ),
  		];
  		return $items;
  	}, 10, 3 );
  	`

= Development = 

* Active development of this plugin is handled [on GitHub](https://github.com/soderlind/super-admin-all-sites-menu).

== Screenshots ==

1. Demo
2. Menu data are stored locally in IndexedDB.

== Changelog ==

= 1.11.0 =
* Performance: Replaced per-site WP_Site::get_details() calls with a single batch SQL query, eliminating hidden switch_to_blog() overhead in the REST endpoint

= 1.10.1 =
* Updated: @wordpress/scripts 30.7.0 → 31.6.0
* Updated: dexie 4.0.11 → 4.2.0
* Security: Resolved Dependabot alerts #102, #104, #108, #109 (minimatch ReDoS, serialize-javascript RCE, @tootallnate/once)
* Changed: Added npm overrides for transitive dependency vulnerabilities (0 audit findings)

= 1.10.0 =
* Added: Filterable per-site submenu items via `all_sites_menu_submenu_items` filter (#46)
* Added: Numeric `blog_id` field in REST response for use in filters and custom JS (#46)
* Added: Search by URL — the search filter now matches site URLs in addition to site names (#45)
* Added: Updated search placeholder to "Search by name or URL"
* Fixed: Sort by ID now uses numeric `blog_id` index for correct order instead of lexicographic string sort (#47)
* Fixed: Admin bar item IDs now use correct `blog-N` string instead of `0` (#46)
* Fixed: Search URL indexing decoupled from submenu order via `data-url` attribute (#46)

= 1.9.0 =
* Fixed: PHP copy-paste bug in set_properties() — cache expiration validation checked wrong variable
* Fixed: Removed dead REST guard in init() that could never match
* Fixed: Removed redundant header() in REST callback
* Fixed: toggleClass ReferenceError in refresh.js — Tab key navigation into submenus was broken
* Fixed: IntersectionObserver race condition that could duplicate menu HTML
* Fixed: Added partial-load recovery — failed REST fetches now clear IndexedDB so next load retries
* Security: Added URL sanitisation and attribute escaping in menu template to prevent XSS
* Changed: Rewrote refresh.js — removed dead code, modernised to classList API
* Changed: Moved build-only packages from dependencies to devDependencies
* Changed: Updated all npm packages to latest compatible versions
* Tested up to WordPress 7.0

= 1.8.4 =
* Update dependencies

= 1.8.3 =
* Housekeeping

= 1.11.1 =
* Fixed search box styling inconsistency between admin and front-end pages
* Fixed `action_enqueue_scripts` parameter type error on front-end
* Updated dependencies: @wordpress/api-fetch, @wordpress/i18n (5→6), @wordpress/scripts, dexie
* Security: Resolved all npm audit vulnerabilities

= 1.8.2 =
* Abort early if the user does not have the required permissions
* Security: Added endpoint verification for REST API requests
* Bug fix: Added rest endpoint permission check
* Code improvement: Added strict types declaration
* Code improvement: Added return type declarations

= 1.8.1 =

* Remove duplicate code

= 1.8.0 =

REQUIRE PHP 8.0 OR HIGHER

* Code modernization: Refactored to use PHP 8.0+ features
* Enhancement: Improved type safety and error handling
* Performance: Better code organization with Config class
* Enhancement: Increased default search threshold to 20 sites

= 1.7.3 =
* Fixed search functionality:
  * Improved search performance with better indexing
  * Added mutation observer to handle dynamically loaded sites
  * Fixed event handling for search input
  * Added improved error handling for search elements
  * Better handling of empty search inputs

= 1.7.2 =

- Bump version to trigger a deploy to WordPress.org

= 1.7.1 =

- Bump version to trigger a deploy to WordPress.org

= 1.7.0 =

- Major code refactoring and improvements:
  - Added comprehensive JSDoc documentation
  - Improved error handling throughout the codebase
  - Enhanced IndexedDB implementation with private class fields
  - Added debouncing to search functionality
  - Improved intersection observer implementations
  - Better type checking and null safety
  - Modernized class structure and module organization

= 1.6.9 =

- Update dependencies

= 1.6.8 =

- Update dependencies

= 1.6.7 =

- Update dependencies

= 1.6.6 =

- Tested with WordPress 6.4

= 1.6.5 =

- Tested with WordPress 6.3

= 1.6.4 =

- Fix bug in handling the REST API.

= 1.6.2 =

- Tested with WordPress 6.0

= 1.6.1 =

* Await for the promise `populateDB()` to resolve before continuing.

= 1.6.0 =

* Use `@wordpress/api-fetch` to fetch subsite data.

= 1.5.0 =

* Use REST instead of AJAX.

= 1.4.28 = 

* Housekeeping

= 1.4.27 =

* Add missing textdomain to translations.
* Update uninstall.php

= 1.4.26 =

* Bundle Dexie using wp-scripts

= 1.4.25 =

* Housekeeping

= 1.4.24 =

* Use @wordpress/i18n to translate JavaScript.

= 1.4.23 =

* Fix typo in textdomain.

= 1.4.22 =

* Housekeeping 

= 1.4.21 =

* Update translation file (.pot)

= 1.4.20 =

* Don't set dependencies for style.

= 1.4.19 =

* Import @wordpress/i18n

= 1.4.18 =

* Replace build script from webpack to wp-scripts (@wordpress/scripts)

= 1.4.17 = 

* Use correct AJAX URL

= 1.4.16 =

* Upgrade Dexie.js to v 3.2.0

= 1.4.15 =

* Only load the plugin code if the admin bar is available.

= 1.4.14 =

* Force refresh using a site transient.

= 1.4.13 =

* Don't list sites that are tagged as archived, deleted, mature or spam.

= 1.4.12 = 

* Update plugin banner

= 1.4.11 =

* Add plugin banner

= 1.4.10 =

- Housekeeping

= 1.4.9 = 

* Deploy to https://wordpress.org/plugins/super-admin-all-sites-menu/

= 1.4.8 =

* Remove external dependencies.

= 1.4.7 =

* Remove `type=module` from script tag. Not needed anymore since the script and modules are packed.

= 1.4.6 =

* Pack JavaScript using webpack.

= 1.4.5 =

* Only run if multisite.
* Improved Dexie versioning.

= 1.4.4 =

* Pass only one parameter to `plugin_update_local_storage()`
* Close db connection when getting version number.

= 1.4.3 =

* IndexedDB maintenance, i.e. remove old databases.

= 1.4.2 =

* Dexie schema change, bump Dexie version number.

= 1.4.1 =

* Make sure the local storage (IndexedDB) is in sync with server changes.

= 1.4.0 =

* Refactored JavaScript again, I'm using this plugin to experiment with and to learn JavaScript better.

= 1.3.8 =

* Refactor and rename db module.

= 1.3.7 =

* Don't display search field if there's less than 20 subsites. The threshold is adjustable using the `all_sites_menu_search_threshold` filter

= 1.3.6 =

* Fix load increments bug.

= 1.3.5 =

* Housekeeping.

= 1.3.4 =

* Add filters to defaults.

= 1.3.3 =

* Update IndexedDB when you change a blog name.

= 1.3.2 =

* Only change `text/javscript`to `module` when tag has `src` attribute

= 1.3.0 =

* Refactor
  * Split JavaScript into modules
  * If empty, populate IndexedDB with sites menu data.

= 1.2.4 =

* Adjust the sites menu wrapper height

= 1.2.3 =

* Remove `window.hoverintent`, it's slow when you have a lot of sites, use `addEventListener` in capturing mode instead.

= 1.2.2 =

* Housekeeping.

= 1.2.1 =

* Update IndexedDB when Restricted Site Access is (de)activated.

= 1.2.0 =

* Store subsite menu data in IndexedDB (local storage).
  * IndexedDB is updated when a site is added / deleted.
* Add search.

= 1.1.2 =

* Fix translations.

= 1.1.1 =

* Housekeeping.

= 1.1.0 =

* Lazy load the subsite menu, using IntersectionObserver and AJAX, loading only 80 subsites at a time.
* Make subsites menu scrollable.

= 1.0.x =

* Initial release.

