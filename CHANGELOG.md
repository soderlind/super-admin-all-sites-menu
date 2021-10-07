# Changelog

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
