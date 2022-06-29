/**
 * Using REST, incremental load sites and add them to local storage.
 *
 * @author Per Søderlind
 * @export
 * @param {IndexedDB} db
 */

import apiFetch from '@wordpress/api-fetch';
export async function loadSites( db, offset ) {
	try {
		// Set the nonce for the request.
		await apiFetch.use(
			apiFetch.createNonceMiddleware( pluginAllSitesMenu.nonce )
		);
		const res = await apiFetch( {
			url: pluginAllSitesMenu.restURL,
			method: 'POST',
			data: { offset: offset },
		} ).catch( ( err ) => {
			console.error( 'Error in apiFetch', err );
			throw err; // Re-throw the error!
		} );
		if ( res.response === 'success' ) {
			offset = offset + pluginAllSitesMenu.loadincrements;
			db.save( res.data );
			await loadSites( db, offset ); // load more.
		}
	} catch ( err ) {
		console.error( 'Error in loadSites', err );
		throw err; // Re-throw the error!
	}
}
