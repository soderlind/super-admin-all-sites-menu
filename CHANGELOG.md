# Changelog

All notable changes to this project will be documented in this file.
### 1.10.1

#### Updated

- @wordpress/scripts 30.7.0 → 31.6.0
- dexie 4.0.11 → 4.2.0

#### Security

- Resolved Dependabot alerts #102, #104, #108, #109 (minimatch ReDoS, serialize-javascript RCE, @tootallnate/once)
- Added npm overrides for transitive dependency vulnerabilities (0 audit findings)

### 1.10.0

#### Added

- Filterable per-site submenu items via new `all_sites_menu_submenu_items` PHP filter — add, remove, or reorder entries like "Edit Site" (#46)
- Numeric `blog_id` field in REST response for use in filters and custom JS
- Search by URL: the search filter now matches site URLs in addition to site names (#45)
- Updated search placeholder to "Search by name or URL" for discoverability

#### Fixed

- Sort by ID now uses numeric `blog_id` index for correct order instead of lexicographic string sort (#47)
- Admin bar item IDs now use the correct `blog-N` string instead of falling back to `0` (#46)
- Search URL indexing decoupled from submenu order via `data-url` attribute (#46)

### 1.9.0

#### Fixed

- PHP: Fixed copy-paste bug in `set_properties()` — cache expiration validation was checking the wrong variable
- PHP: Removed dead REST guard in `init()` that could never match
- PHP: Removed redundant `header('Content-type: application/json')` in REST callback
- JS: Fixed `toggleClass` ReferenceError in refresh.js — Tab key navigation into submenus was broken
- JS: Fixed IntersectionObserver race condition that could duplicate menu HTML
- JS: Added partial-load recovery — failed REST fetches now clear IndexedDB so next page load retries

#### Security

- JS: Added URL sanitisation and attribute escaping in menu template to prevent XSS from tampered IndexedDB data

#### Changed

- JS: Rewrote refresh.js — removed dead functions (`getClosest`, `hasClass`, IE polyfill), modernised to `classList` API
- Moved `cross-spawn` and `@soderlind/wp-project-version-sync` from dependencies to devDependencies
- Updated all npm packages to latest compatible versions
- Tested up to WordPress 7.0

### 1.8.4

- Update dependencies

### 1.8.3

- Housekeeping

### 1.8.2

- Abort early if the user does not have the required permissions
- Security: Added endpoint verification for REST API requests
- Bug fix: Added rest endpoint permission check
- Code improvement: Added strict types declaration
- Code improvement: Added return type declarations

### 1.8.1

- Remove duplicate code.

### 1.8.0

> REQUIRE PHP 8.0 OR HIGHER

#### Added

- New Config class to manage plugin constants
- Constructor property promotion for better code organization
- Strict type declarations throughout the codebase

#### Changed

- Increased default search threshold from 2 to 20 sites
- Refactored main class to use modern PHP 8.0+ features
- Improved error handling and null checks
- Better type safety with more specific type declarations
- Simplified plugin initialization

#### Developer Notes

- The Config class now centralizes all plugin constants
- Removed redundant property declarations in favor of constructor property promotion
- Added strict typing for better code reliability
- REST endpoints now use Config class constants

### 1.7.3

- Fixed search functionality:
  - Improved search performance with better indexing
  - Added mutation observer to handle dynamically loaded sites
  - Fixed event handling for search input
  - Added improved error handling for search elements
  - Better handling of empty search inputs

### 1.7.2

- Bump version to trigger a deploy to WordPress.org

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
