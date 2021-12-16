/**
 * Create the site menu item.
 *
 * @author Per Søderlind
 * @export
 * @param {object} site
 * @returns {string}
 */

import { __ } from "@wordpress/i18n";

// prettier-ignore
export function siteMenu(site) {
  return `
				<li id="wp-admin-bar-${site.id}" class="menupop">
				<a class="ab-item" aria-haspopup="true" href="${site.admin}/"><span class="wp-admin-bar-arrow" aria-hidden="true"></span>
					${site.title}
				</a>
				<div class="ab-sub-wrapper">
					<ul id="wp-admin-bar-${site.id}-default" class="ab-submenu">
						<li id="wp-admin-bar-${site.id}-d"><a class="ab-item"	href="${site.admin}">${__("Dashboard", "super-admin-all-sites-menu")}</a></li>
						<li id="wp-admin-bar-${site.id}-n"><a class="ab-item" href="${site.admin}/post-new.php">${__("New Post","super-admin-all-sites-menu")}</a></li>
						<li id="wp-admin-bar-${site.id}-o"><a class="ab-item" href="${site.admin}/post-new.php?post_type=page">${__("New Page","super-admin-all-sites-menu")}</a></li>
						<li id="wp-admin-bar-${site.id}-c"><a class="ab-item" href="${site.admin}/edit-comments.php">${__("Manage Comments","super-admin-all-sites-menu")}</a></li>
						<li id="wp-admin-bar-${site.id}-u"><a class="ab-item" href="${site.admin}/users.php">${__("Users","super-admin-all-sites-menu")}</a></li>
						<li id="wp-admin-bar-${site.id}-p"><a class="ab-item" href="${site.admin}/plugins.php">${__("Plugins","super-admin-all-sites-menu")}</a></li>
						<li id="wp-admin-bar-${site.id}-s"><a class="ab-item" href="${site.admin}/options-general.php">${__("Settings","super-admin-all-sites-menu")}</a></li>
						<li id="wp-admin-bar-${site.id}-v"><a class="ab-item" href="${site.url}/">${__("Visit", "super-admin-all-sites-menu")}</a></li>
					</ul>
				</div>
			</li>
		`;
}
