# Super Admin All Sites Menu


For the super admin, replace WP Admin Bar My Sites menu with an All Sites menu.


- Doesn't use `switch_to_blog()` i.e. it's faster and uses less resources than the WP Admin Bar My Sites menu.
- Subsite menu data are stored locally in IndexedDB (did I say it's fast?). The local storage is updated when;
   - a site is added or deleted.
	- you change a blog name.
	- [Restricted Site Access](https://github.com/10up/restricted-site-access) is activated or deactivated.
- When subsite menu data is updated, AJAX is used and it's done in increments (100 sites per increment).
- List all subsites. WP Admin Bar My Sites only list sites you're a local admin on.
- Mark sites that has [restricted site access](https://github.com/10up/restricted-site-access) with a red icon.
- Sites menu is sorted alphabetically.
- Search filter.
- Add more menu choices:
   - Under "Network Admin"
	   - Add New Site
   - Per subsite.
     - 'New Page'
     - 'Users'
     - 'Plugins'
     - 'Settings'

## Demo
<img src="assets/all-sites.gif">

## Prerequisite

- WordPress Multisite
- A modern browser, IE 11 isn't supported.

## Install

- [Download the plugin](https://github.com/soderlind/super-admin-all-sites-menu/archive/refs/heads/main.zip)
- [Upload and network activate the plugin](https://wordpress.org/support/article/managing-plugins/#manual-upload-via-wordpress-admin)

## Changelog

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

## Credits
- [Dexie.js](https://github.com/dfahlander/Dexie.js), which has an Apache License Version 2.0
- Submmenu offset adjustment: https://qiita.com/zephyr7501/items/dd0967fddabd888b28c4
- CSS for search field from https://github.com/trepmal/my-sites-search

## Copyright and License

Super Admin All Sites Menu is copyright 2021 Per Soderlind

Super Admin All Sites Menu is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 2 of the License, or (at your option) any later version.

Super Admin All Sites Menu is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU Lesser General Public License along with the Extension. If not, see http://www.gnu.org/licenses/.
