# Changelog

### 1.7.1

- Force deploy to WordPress.org

### 1.7.0

- Major code refactoring and improvements:
  - Added comprehensive JSDoc documentation
  - Improved error handling throughout the codebase
  - Enhanced IndexedDB implementation with private class fields
  - Added debouncing to search functionality
  - Improved intersection observer implementations
  - Better type checking and null safety
  - Modernized class structure and module organization

### 1.6.9

- Update dependencies

### 1.6.8

- Update dependencies

### 1.6.7

- Update dependencies

### 1.6.6

- Tested with WordPress 6.4

### 1.6.5

- Tested with WordPress 6.3

### 1.6.4

- Fix bug in handling the REST API.

### 1.6.2

- Tested with WordPress 6.0

### 1.6.1

- Await for the promise `populateDB()` to resolve before continuing.

### 1.6.0

- Use `@wordpress/api-fetch` to fetch subsite data.

### 1.5.0

- Use REST instead of AJAX.

### 1.4.28

- Housekeeping

### 1.4.27

- Add missing textdomain to translations.
- Update uninstall.php

### 1.4.26

- Bundle Dexie using wp-scripts

### 1.4.25

- Housekeeping

### 1.4.24

- Use @wordpress/i18n to translate JavaScript.

### 1.4.23

- Fix typo in textdomain.

### 1.4.22

- Housekeeping

### 1.4.21

- Update translation file (.pot)

### 1.4.20

- Don't set dependencies for style.

### 1.4.19

- Import @wordpress/i18n

### 1.4.18

- Replace webpack with wp-scripts

### 1.4.17

- Use correct AJAX URL

### 1.4.16

- Upgrade Dexie.js to v 3.2.0

### 1.4.15

- Only load the plugin code if the admin bar is available.

### 1.4.14

- Force refresh using a site transient.

### 1.4.13

- Don't list sites that are tagged as archived, deleted, mature or spam.

### 1.4.12

- Update plugin banner

### 1.4.11

- Add plugin banner

### 1.4.10

- Housekeeping

### 1.4.9

- Deploy to https://wordpress.org/plugins/super-admin-all-sites-menu/

### 1.4.8

- Remove external dependencies.

### 1.4.7

- Remove `type=module` from script tag. Not needed anymore since the script and modules are packed.

### 1.4.6

- Pack JavaScript using webpack.

### 1.4.5

- Only run if multisite.
- Improved Dexie versioning.

### 1.4.4

- Pass only one parameter to `plugin_update_local_storage()`
- Close db connection when getting version number.

### 1.4.3

- IndexedDB maintenance, i.e. remove old databases.

### 1.4.2

- Dexie schema change, bump Dexie version number.

### 1.4.1

- Make sure the local storage (IndexedDB) is in sync with server changes.

### 1.4.0

- Refactored JavaScript again, I'm using this plugin to experiment with and to learn JavaScript better.

### 1.3.8

- Refactor and rename db module.

### 1.3.7

- Don't display search field if there's less than 20 subsites. The threshold is adjustable using the `all_sites_menu_search_threshold` filter

### 1.3.6

- Fix load increments bug.

### 1.3.5

- Housekeeping.

### 1.3.4

- Add filters to defaults.

### 1.3.3

- Update IndexedDB when you change a blog name.

### 1.3.2

- Only change `text/javscript`to `module` when tag has `src` attribute

### 1.3.0

- Refactor
  - Split JavaScript into modules
  - If empty, populate IndexedDB with sites menu data.

### 1.2.4

- Adjust the sites menu wrapper height

### 1.2.3

- Remove `window.hoverintent`, it's slow when you have a lot of sites, use `addEventListener` in capturing mode instead.

### 1.2.2

- Housekeeping.

### 1.2.1

- Update IndexedDB when Restricted Site Access is (de)activated.

### 1.2.0

- Store subsite menu data in IndexedDB (local storage).
  - IndexedDB is updated when a site is added / deleted.
- Add search.

### 1.1.2

- Fix translations.

### 1.1.1

- Housekeeping.

### 1.1.0

- Lazy load the subsite menu, using IntersectionObserver and AJAX, loading only 80 subsites at a time.
- Make subsites menu scrollable.

### 1.0.x

- Initial release.
