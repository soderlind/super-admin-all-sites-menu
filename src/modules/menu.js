import { __ } from '@wordpress/i18n';

export function escapeAttr( str ) {
	return String( str )
		.replace( /&/g, '&amp;' )
		.replace( /"/g, '&quot;' )
		.replace( /</g, '&lt;' )
		.replace( />/g, '&gt;' );
}

export function sanitizeUrl( url ) {
	try {
		const parsed = new URL( url );
		if ( parsed.protocol === 'https:' || parsed.protocol === 'http:' ) {
			return escapeAttr( parsed.href );
		}
	} catch {
		// invalid URL
	}
	return '#';
}

/**
 * Creates a menu item HTML string for a site in the admin bar
 *
 * @author Per Søderlind
 * @param {Object} site - The site object containing site details
 * @param {string} site.id - Unique identifier for the site (e.g. "blog-42")
 * @param {string} site.admin - Admin URL for the site
 * @param {string} site.title - Display title for the site
 * @param {string} site.url - Frontend URL for the site
 * @param {Array}  [site.submenu] - Optional array of submenu items from the REST API
 * @returns {string} HTML string for the menu item
 */
export function siteMenu( site ) {
	const id = escapeAttr( String( site.id ) );
	const admin = sanitizeUrl( site.admin );
	const url = sanitizeUrl( site.url );

	let submenuHtml;
	if ( Array.isArray( site.submenu ) && site.submenu.length > 0 ) {
		submenuHtml = site.submenu
			.map(
				( item ) =>
					`<li id="wp-admin-bar-${ id }-${ escapeAttr(
						String( item.id )
					) }"><a class="ab-item" href="${ sanitizeUrl(
						item.href
					) }">${ escapeAttr( item.title ) }</a></li>`
			)
			.join( '\n\t\t\t\t\t\t' );
	} else {
		// Fallback for stale cache entries without submenu data
		submenuHtml = `<li id="wp-admin-bar-${ id }-d"><a class="ab-item"	href="${ admin }">${ __(
			'Dashboard',
			'super-admin-all-sites-menu'
		) }</a></li>
						<li id="wp-admin-bar-${ id }-n"><a class="ab-item" href="${ admin }/post-new.php">${ __(
							'New Post',
							'super-admin-all-sites-menu'
						) }</a></li>
						<li id="wp-admin-bar-${ id }-o"><a class="ab-item" href="${ admin }/post-new.php?post_type=page">${ __(
							'New Page',
							'super-admin-all-sites-menu'
						) }</a></li>
						<li id="wp-admin-bar-${ id }-c"><a class="ab-item" href="${ admin }/edit-comments.php">${ __(
							'Manage Comments',
							'super-admin-all-sites-menu'
						) }</a></li>
						<li id="wp-admin-bar-${ id }-u"><a class="ab-item" href="${ admin }/users.php">${ __(
							'Users',
							'super-admin-all-sites-menu'
						) }</a></li>
						<li id="wp-admin-bar-${ id }-p"><a class="ab-item" href="${ admin }/plugins.php">${ __(
							'Plugins',
							'super-admin-all-sites-menu'
						) }</a></li>
						<li id="wp-admin-bar-${ id }-s"><a class="ab-item" href="${ admin }/options-general.php">${ __(
							'Settings',
							'super-admin-all-sites-menu'
						) }</a></li>
						<li id="wp-admin-bar-${ id }-v"><a class="ab-item" href="${ url }/">${ __(
							'Visit',
							'super-admin-all-sites-menu'
						) }</a></li>`;
	}

	return `
				<li id="wp-admin-bar-${ id }" class="menupop" data-url="${ escapeAttr(
					site.url || ''
				) }">
				<a class="ab-item" aria-haspopup="true" href="${ admin }/"><span class="wp-admin-bar-arrow" aria-hidden="true"></span>
					${ site.title }
				</a>
				<div class="ab-sub-wrapper">
					<ul id="wp-admin-bar-${ id }-default" class="ab-submenu">
						${ submenuHtml }
					</ul>
				</div>
			</li>
		`;
}
