/**
 * All Sites Menu.
 *
 * @author Per Søderlind
 * @date  10.06.2021
 * @class AllSitesMenu
 */

import { addSearch } from './modules/search.js';
import {
	createAllSitesCatalog,
	createDexieSnapshotStore,
} from './modules/catalog.js';
import { createRemoteCatalogPort } from './modules/rest.js';
import { observeContainer, observeMenuHeight } from './modules/observe.js';
import { refreshAdminbar } from './modules/refresh.js';
import { siteMenu } from './modules/menu.js';

/**
 * Configuration settings for the database
 * @constant {Object}
 */
const SETTINGS = {
	DB_NAME: 'allsites',
	TABLE_NAME: 'sites',
};

/**
 * Initializes the all sites menu functionality
 * Handles setup of search, database, and observers
 *
 * @async
 * @throws {Error} When initialization fails
 */
async function init() {
	const $wpadminbar = document.getElementById( 'wpadminbar' );
	if ( ! $wpadminbar ) return;

	const elements = {
		load: document.querySelector( '#wp-admin-bar-load-more' ),
		menu: document.querySelector( '#wp-admin-bar-my-sites-list' ),
	};

	if ( ! elements.load || ! elements.menu ) return;

	try {
		const catalog = createAllSitesCatalog( {
			remote: createRemoteCatalogPort(),
			store: createDexieSnapshotStore( {
				dbName: SETTINGS.DB_NAME,
				sitesTable: SETTINGS.TABLE_NAME,
			} ),
		} );

		if ( pluginAllSitesMenu.displaySearch ) {
			addSearch();
		}

		observeMenuHeight( elements.menu );
		await catalog.boot( {
			revision: pluginAllSitesMenu.revision,
			pageSize: pluginAllSitesMenu.loadincrements,
		} );
		setupLoadMoreObserver( elements.load, catalog );
	} catch ( error ) {
		console.error( 'Initialization failed:', error );
	}
}

document.addEventListener( 'DOMContentLoaded', init );

/**
 * Configures the intersection observer for loading more sites
 *
 * @param {HTMLElement} loadElement - The load more trigger element
 * @param {{list: (orderBy?: string) => Promise<Array>}} catalog - Catalog boundary containing sites
 * @returns {IntersectionObserver} The configured observer
 */
function setupLoadMoreObserver( loadElement, catalog ) {
	let loaded = false;
	const observedLoadMore = observeContainer( loadElement, async () => {
		if ( loaded ) {
			return;
		}
		loaded = true;

		const orderBy =
			pluginAllSitesMenu.orderBy === 'id'
				? 'blog_id'
				: pluginAllSitesMenu.orderBy;
		const sites = await catalog.list( orderBy );
		const sitesMenu = sites.reduce( ( acc, site ) => {
			return acc + siteMenu( site );
		}, '' );
		loadElement.insertAdjacentHTML( 'beforeBegin', sitesMenu );
		refreshAdminbar();

		loadElement.style.display = 'none';
		observedLoadMore.unobserve( loadElement );
	} );
}
