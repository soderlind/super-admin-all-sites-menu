/**
 * @jest-environment jsdom
 */

let loadSites;
let apiFetchMock;

// Shared mock for the IndexedDB wrapper.
function createDbMock() {
	return {
		save: jest.fn().mockResolvedValue( undefined ),
	};
}

beforeEach( () => {
	jest.resetModules();

	// Global expected by the module.
	global.pluginAllSitesMenu = {
		nonce: 'test-nonce',
		restURL: '/wp-json/super-admin-all-sites-menu/v1/sites',
		loadincrements: 100,
	};

	// Mock @wordpress/api-fetch before importing the module under test.
	apiFetchMock = jest.fn();
	apiFetchMock.use = jest.fn();
	apiFetchMock.createNonceMiddleware = jest
		.fn()
		.mockReturnValue( 'nonce-mw' );

	jest.doMock( '@wordpress/api-fetch', () => ( {
		__esModule: true,
		default: apiFetchMock,
	} ) );

	( { loadSites } = require( '../../src/modules/rest' ) );
} );

afterEach( () => {
	delete global.pluginAllSitesMenu;
} );

describe( 'loadSites', () => {
	it( 'registers nonce middleware only once across multiple batches', async () => {
		// Two batches then done.
		apiFetchMock
			.mockResolvedValueOnce( {
				response: 'success',
				data: [ { id: 1 } ],
			} )
			.mockResolvedValueOnce( {
				response: 'success',
				data: [],
			} );

		const db = createDbMock();
		await loadSites( db, { offset: 0, delayMs: 0 } );

		expect( apiFetchMock.use ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'stops when API returns empty data array', async () => {
		apiFetchMock.mockResolvedValueOnce( {
			response: 'success',
			data: [],
		} );

		const db = createDbMock();
		await loadSites( db, { offset: 0, delayMs: 0 } );

		expect( db.save ).not.toHaveBeenCalled();
		expect( apiFetchMock ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'stops when API returns non-success response', async () => {
		apiFetchMock.mockResolvedValueOnce( {
			response: 'unobserve',
			data: '',
		} );

		const db = createDbMock();
		await loadSites( db, { offset: 0, delayMs: 0 } );

		expect( db.save ).not.toHaveBeenCalled();
	} );

	it( 'defaults loadincrements to 100 when value is falsy', async () => {
		global.pluginAllSitesMenu.loadincrements = 0;

		apiFetchMock
			.mockResolvedValueOnce( {
				response: 'success',
				data: [ { id: 1 } ],
			} )
			.mockResolvedValueOnce( {
				response: 'success',
				data: [],
			} );

		const db = createDbMock();
		await loadSites( db, { offset: 0, delayMs: 0 } );

		// Second call should use offset 100 (the default).
		expect( apiFetchMock ).toHaveBeenCalledTimes( 2 );
		expect( apiFetchMock.mock.calls[ 1 ][ 0 ].data.offset ).toBe( 100 );
	} );

	it( 'saves each batch of data', async () => {
		const batch1 = [ { id: 1 }, { id: 2 } ];
		const batch2 = [ { id: 3 } ];

		apiFetchMock
			.mockResolvedValueOnce( { response: 'success', data: batch1 } )
			.mockResolvedValueOnce( { response: 'success', data: batch2 } )
			.mockResolvedValueOnce( { response: 'success', data: [] } );

		const db = createDbMock();
		await loadSites( db, { offset: 0, delayMs: 0 } );

		expect( db.save ).toHaveBeenCalledTimes( 2 );
		expect( db.save ).toHaveBeenCalledWith( batch1 );
		expect( db.save ).toHaveBeenCalledWith( batch2 );
	} );

	it( 'throws on invalid response format', async () => {
		apiFetchMock.mockResolvedValueOnce( null );

		const db = createDbMock();
		await expect(
			loadSites( db, { offset: 0, delayMs: 0 } )
		).rejects.toThrow( 'Invalid response format' );
	} );

	it( 'throws on fetch error', async () => {
		apiFetchMock.mockRejectedValueOnce( new Error( 'Network failure' ) );

		const db = createDbMock();
		await expect(
			loadSites( db, { offset: 0, delayMs: 0 } )
		).rejects.toThrow( 'Network failure' );

		// The module logs the error before re-throwing.
		expect( console ).toHaveErrored();
	} );

	it( 'respects maxSites limit', async () => {
		apiFetchMock.mockResolvedValue( {
			response: 'success',
			data: [ { id: 1 } ],
		} );

		const db = createDbMock();
		await loadSites( db, { offset: 0, maxSites: 150, delayMs: 0 } );

		// With loadincrements=100, it should fetch offset 0 and 100, then stop at 200 >= 150.
		expect( apiFetchMock ).toHaveBeenCalledTimes( 2 );
	} );
} );
