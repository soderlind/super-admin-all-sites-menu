import apiFetch from '@wordpress/api-fetch';

/**
 * Delay helper function
 * @param {number} ms Milliseconds to delay
 * @returns {Promise<void>}
 */
const delay = ( ms ) => new Promise( ( resolve ) => setTimeout( resolve, ms ) );

/**
 * Using REST, incremental load sites and add them to local storage.
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
	try {
		// Check if we've reached the maximum sites limit
		if ( maxSites > 0 && offset >= maxSites ) {
			return;
		}

		// Set the nonce for the request
		apiFetch.use(
			apiFetch.createNonceMiddleware( pluginAllSitesMenu.nonce )
		);

		// Add delay between requests to prevent overwhelming the server
		if ( offset > 0 ) {
			await delay( delayMs );
		}

		const res = await apiFetch( {
			url: pluginAllSitesMenu.restURL,
			method: 'POST',
			data: { offset },
		} );

		if ( ! res || typeof res.response !== 'string' ) {
			throw new Error( 'Invalid response format' );
		}

		if ( res.response === 'success' && Array.isArray( res.data ) ) {
			await db.save( res.data );

			// Calculate next offset
			const nextOffset = offset + pluginAllSitesMenu.loadincrements;

			// Recursive call with updated offset
			return loadSites( db, {
				offset: nextOffset,
				maxSites,
				delayMs,
			} );
		}

		// TODO, should I:  throw new Error( 'Unexpected response format' + res.response );
	} catch ( err ) {
		console.error( 'Error in loadSites:', err.message );
		throw err;
	}
}
