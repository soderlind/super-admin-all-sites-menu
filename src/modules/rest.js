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
	ensureNonceMiddleware();

	const increments = Number( pluginAllSitesMenu.loadincrements ) || 100;
	let currentOffset = offset;

	while ( ! ( maxSites > 0 && currentOffset >= maxSites ) ) {
		// Add delay between requests to prevent overwhelming the server
		if ( currentOffset > 0 ) {
			await delay( delayMs );
		}

		let res;
		try {
			res = await apiFetch( {
				url: pluginAllSitesMenu.restURL,
				method: 'POST',
				data: { offset: currentOffset },
			} );
		} catch ( err ) {
			console.error( 'Error in loadSites:', err.message );
			throw err;
		}

		if ( ! res || typeof res.response !== 'string' ) {
			throw new Error( 'Invalid response format' );
		}

		// Server signals no more data.
		if ( res.response !== 'success' ) {
			return;
		}

		if ( ! Array.isArray( res.data ) || res.data.length === 0 ) {
			return;
		}

		await db.save( res.data );
		currentOffset += increments;
	}
}
