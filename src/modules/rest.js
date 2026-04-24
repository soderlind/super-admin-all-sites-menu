import apiFetch from '@wordpress/api-fetch';

/**
 * Delay helper function
 * @param {number} ms Milliseconds to delay
 * @returns {Promise<void>}
 */
const delay = ( ms ) => new Promise( ( resolve ) => setTimeout( resolve, ms ) );

/** Track whether the nonce middleware has already been registered. */
let nonceMiddlewareSet = false;

/**
 * Register the REST nonce middleware once.
 */
function ensureNonceMiddleware() {
	if ( ! nonceMiddlewareSet ) {
		apiFetch.use(
			apiFetch.createNonceMiddleware( pluginAllSitesMenu.nonce )
		);
		nonceMiddlewareSet = true;
	}
}

/**
 * Fetch a single page of sites from the REST endpoint.
 *
 * @param {Object} options Request options
 * @param {number} options.offset Starting offset for the page
 * @param {string} [options.expectedRevision] Expected catalog revision
 * @returns {Promise<{revision: string, items: Array, done: boolean}>}
 */
export async function fetchSitesPage( { offset = 0, expectedRevision } = {} ) {
	ensureNonceMiddleware();

	let res;
	try {
		res = await apiFetch( {
			url: pluginAllSitesMenu.restURL,
			method: 'POST',
			data: { offset },
		} );
	} catch ( err ) {
		console.error( 'Error in fetchSitesPage:', err.message );
		throw err;
	}

	if ( ! res || typeof res.response !== 'string' ) {
		throw new Error( 'Invalid response format' );
	}

	const revision =
		typeof res.revision === 'string'
			? res.revision
			: String( expectedRevision || pluginAllSitesMenu.revision || '' );

	if ( expectedRevision && revision !== expectedRevision ) {
		throw new Error( 'Catalog revision changed during hydration' );
	}

	if ( res.response !== 'success' ) {
		return {
			revision,
			items: [],
			done: true,
		};
	}

	if ( ! Array.isArray( res.data ) ) {
		throw new Error( 'Invalid response format' );
	}

	return {
		revision,
		items: res.data,
		done: res.data.length === 0,
	};
}

/**
 * Create the production remote catalog adapter.
 *
 * @returns {{fetchPage: ({offset: number, expectedRevision?: string}) => Promise<{revision: string, items: Array, done: boolean}>}}
 */
export function createRemoteCatalogPort() {
	return {
		fetchPage( { offset = 0, expectedRevision } = {} ) {
			return fetchSitesPage( { offset, expectedRevision } );
		},
	};
}

/**
 * Using REST, incrementally load sites and add them to local storage.
 *
 * @author Per Søderlind
 * @param {IndexedDB} db - IndexedDB instance
 * @param {Object} options - Configuration options
 * @param {number} options.offset - Starting offset for fetching sites
 * @param {number} options.maxSites - Maximum number of sites to fetch (0 for unlimited)
 * @param {number} options.delayMs - Delay between requests in milliseconds
 * @returns {Promise<void>}
 */
export async function loadSites(
	db,
	{ offset = 0, maxSites = 1000, delayMs = 1000 } = {}
) {
	const increments = Number( pluginAllSitesMenu.loadincrements ) || 100;
	let currentOffset = offset;

	while ( ! ( maxSites > 0 && currentOffset >= maxSites ) ) {
		// Add delay between requests to prevent overwhelming the server
		if ( currentOffset > 0 ) {
			await delay( delayMs );
		}

		const page = await fetchSitesPage( { offset: currentOffset } );

		if ( page.done ) {
			return;
		}

		await db.save( page.items );
		currentOffset += increments;
	}
}
