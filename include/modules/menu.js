/**
 * Create the site menu item.
 *
 * @author Per Søderlind
 * @export
 * @param {object} site
 * @returns {string}
 */
export function siteMenu(site) {
	return `
				<li id="wp-admin-bar-${site.id}" class="menupop">
				<a class="ab-item" aria-haspopup="true" href="${site.admin}/"><span class="wp-admin-bar-arrow" aria-hidden="true"></span>
					${site.title}
				</a>
				<div class="ab-sub-wrapper">
					<ul id="wp-admin-bar-${site.id}-default" class="ab-submenu">
						<li id="wp-admin-bar-${site.id}-d"><a class="ab-item"
								href="${site.admin}">${pluginAllSitesMenu.l10n.dashboard}</a></li>
						<li id="wp-admin-bar-${site.id}-n"><a class="ab-item"
								href="${site.admin}/post-new.php">${pluginAllSitesMenu.l10n.newpost}</a></li>
						<li id="wp-admin-bar-${site.id}-o"><a class="ab-item"
								href="${site.admin}/post-new.php?post_type=page">${pluginAllSitesMenu.l10n.newpage}</a></li>
						<li id="wp-admin-bar-${site.id}-c"><a class="ab-item"
								href="${site.admin}/edit-comments.php">${pluginAllSitesMenu.l10n.managecomments}</a></li>
						<li id="wp-admin-bar-${site.id}-u"><a class="ab-item"
								href="${site.admin}/users.php">${pluginAllSitesMenu.l10n.users}</a></li>
						<li id="wp-admin-bar-${site.id}-p"><a class="ab-item"
								href="${site.admin}/plugins.php">${pluginAllSitesMenu.l10n.plugins}</a></li>
						<li id="wp-admin-bar-${site.id}-s"><a class="ab-item"
								href="${site.admin}/options-general.php">${pluginAllSitesMenu.l10n.settings}</a></li>
						<li id="wp-admin-bar-${site.id}-v"><a class="ab-item"
								href="${site.url}/">${pluginAllSitesMenu.l10n.visit}</a></li>
					</ul>
				</div>
			</li>
		`;
}
