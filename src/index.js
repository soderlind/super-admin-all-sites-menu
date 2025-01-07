/**
 * All Sites Menu.
 *
 * @author Per Søderlind
 * @date  10.06.2021
 * @class AllSitesMenu
 */

import { addSearch } from './modules/search.js';
import { IndexedDB } from './modules/db.js';
import { loadSites } from './modules/rest.js';
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
	DB_VERSIONS: [ 'id,name,url', 'id,name,url,timestamp' ],
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
		timestamp: document.querySelector( '#load-more-timestamp' ),
	};

	if ( ! elements.load || ! elements.menu ) return;

	try {
		const db = new IndexedDB(
			SETTINGS.DB_NAME,
			SETTINGS.TABLE_NAME,
			SETTINGS.DB_VERSIONS
		);

		if ( pluginAllSitesMenu.displaySearch ) {
			addSearch();
		}

		observeMenuHeight( elements.menu );
		await populateDB( db );
		setupLoadMoreObserver( elements.load, db );
	} catch ( error ) {
		console.error( 'Initialization failed:', error );
	}
}

document.addEventListener( 'DOMContentLoaded', init );

/**
 * Populate the database with sites.
 *
 * @author Per Søderlind
 * @param {IndexedDB} db
 * @param {object} el
 */

/**
 * Sets up database population and handles timestamp verification
 *
 * @async
 * @param {IndexedDB} db - Database instance to populate
 * @throws {Error} When database operations fail
 */
async function populateDB( db ) {
	const data = await db.getFirstRow();
	if (
		typeof data !== 'undefined' &&
		typeof data.timestamp !== 'undefined' &&
		pluginAllSitesMenu.timestamp > data.timestamp
	) {
		await db.delete();
	}

	if ( ( await db.count() ) === 0 ) {
		loadSites( db, {
			offset: 0,
			delayMs: 200,
		} );
	}
}

/**
 * Configures the intersection observer for loading more sites
 *
 * @param {HTMLElement} loadElement - The load more trigger element
 * @param {IndexedDB} db - Database instance containing sites
 * @returns {IntersectionObserver} The configured observer
 */
function setupLoadMoreObserver( loadElement, db ) {
	const observedLoadMore = observeContainer( loadElement, async () => {
		const sites = await db.read( pluginAllSitesMenu.orderBy );
		const sitesMenu = sites.reduce( ( acc, site ) => {
			return acc + siteMenu( site );
		}, '' );
		loadElement.insertAdjacentHTML( 'beforeBegin', sitesMenu );
		refreshAdminbar();

		loadElement.style.display = 'none';
		observedLoadMore.unobserve( loadElement );
	} );
}
