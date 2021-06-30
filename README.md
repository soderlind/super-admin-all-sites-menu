# Super Admin All Sites Menu


For the super admin, replace WP Admin Bar My Sites menu with an All Sites menu.


- Doesn't use `switch_to_blog()` i.e. it's faster and uses less resources than the WP Admin Bar My Sites menu
- List all subsites, retrieved using `get_sites()`. WP Admin Bar My Sites only list sites you're a local admin on.
- Mark sites that has [restricted site access](https://github.com/10up/restricted-site-access) with a red icon.
- It's compatible with [My Sites Search](https://github.com/trepmal/my-sites-search).
- Add more menu choices per subsite.
   - 'New Page'
   - 'Users'
   - 'Plugins'
   - 'Settings'

## Screenshot
<img src="assets/screenshot.jpg">

## Prerequisite

WordPress Multisite

## Install

- [Download the plugin](https://github.com/soderlind/super-admin-all-sites-menu/archive/refs/heads/main.zip)
- [Upload and network activate the plugin](https://wordpress.org/support/article/managing-plugins/#manual-upload-via-wordpress-admin)

## Copyright and License

Super Admin All Sites Menu is copyright 2021 Per Soderlind

Super Admin All Sites Menu is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 2 of the License, or (at your option) any later version.

Super Admin All Sites Menu is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU Lesser General Public License along with the Extension. If not, see http://www.gnu.org/licenses/.
