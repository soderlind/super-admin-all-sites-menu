import { createAllSitesCatalog } from '../../src/modules/catalog';

function createStoreMock( { revision = null, items = [] } = {} ) {
	let snapshotRevision = revision;
	let snapshotItems = [ ...items ];

	return {
		getSnapshotMeta: jest.fn( async () => {
			if ( ! snapshotRevision ) {
				return null;
			}

			return {
				revision: snapshotRevision,
				count: snapshotItems.length,
			};
		} ),
		clear: jest.fn( async () => {
			snapshotRevision = null;
			snapshotItems = [];
		} ),
		replaceSnapshot: jest.fn( async ( { revision: nextRevision, items: nextItems } ) => {
			snapshotRevision = nextRevision;
			snapshotItems = [ ...nextItems ];
		} ),
		readAll: jest.fn( async () => snapshotItems ),
	};
}

describe( 'createAllSitesCatalog', () => {
	it( 'reuses the local snapshot when revisions match', async () => {
		const store = createStoreMock( {
			revision: 'r-1',
			items: [ { id: 'blog-1' }, { id: 'blog-2' } ],
		} );
		const remote = {
			fetchPage: jest.fn(),
		};

		const catalog = createAllSitesCatalog( { remote, store } );
		const result = await catalog.boot( {
			revision: 'r-1',
			pageSize: 100,
		} );

		expect( result ).toEqual( {
			revision: 'r-1',
			source: 'cache',
			count: 2,
		} );
		expect( remote.fetchPage ).not.toHaveBeenCalled();
		expect( store.clear ).not.toHaveBeenCalled();
	} );

	it( 'clears and refills when the stored revision is stale', async () => {
		const store = createStoreMock( {
			revision: 'stale',
			items: [ { id: 'blog-old' } ],
		} );
		const remote = {
			fetchPage: jest
				.fn()
				.mockResolvedValueOnce( {
					revision: 'fresh',
					items: [ { id: 'blog-1' } ],
					done: false,
				} )
				.mockResolvedValueOnce( {
					revision: 'fresh',
					items: [ { id: 'blog-2' } ],
					done: true,
				} ),
		};

		const catalog = createAllSitesCatalog( { remote, store } );
		const result = await catalog.boot( {
			revision: 'fresh',
			pageSize: 1,
		} );

		expect( result ).toEqual( {
			revision: 'fresh',
			source: 'network',
			count: 2,
		} );
		expect( store.clear ).toHaveBeenCalledTimes( 1 );
		expect( store.replaceSnapshot ).toHaveBeenCalledWith( {
			revision: 'fresh',
			items: [ { id: 'blog-1' }, { id: 'blog-2' } ],
		} );
		expect( remote.fetchPage ).toHaveBeenNthCalledWith( 1, {
			offset: 0,
			limit: 1,
			expectedRevision: 'fresh',
		} );
		expect( remote.fetchPage ).toHaveBeenNthCalledWith( 2, {
			offset: 1,
			limit: 1,
			expectedRevision: 'fresh',
		} );
	} );

	it( 'leaves the snapshot empty when hydration fails after a stale revision', async () => {
		const store = createStoreMock( {
			revision: 'stale',
			items: [ { id: 'blog-old' } ],
		} );
		const remote = {
			fetchPage: jest.fn().mockRejectedValue( new Error( 'Network failure' ) ),
		};

		const catalog = createAllSitesCatalog( { remote, store } );

		await expect(
			catalog.boot( {
				revision: 'fresh',
				pageSize: 100,
			} )
		).rejects.toThrow( 'Network failure' );

		expect( store.clear ).toHaveBeenCalledTimes( 1 );
		expect( store.replaceSnapshot ).not.toHaveBeenCalled();
		expect( await catalog.list() ).toEqual( [] );
	} );

	it( 'rejects when a later page returns a different revision', async () => {
		const store = createStoreMock();
		const remote = {
			fetchPage: jest
				.fn()
				.mockResolvedValueOnce( {
					revision: 'fresh',
					items: [ { id: 'blog-1' } ],
					done: false,
				} )
				.mockResolvedValueOnce( {
					revision: 'different',
					items: [ { id: 'blog-2' } ],
					done: true,
				} ),
		};

		const catalog = createAllSitesCatalog( { remote, store } );

		await expect(
			catalog.boot( {
				revision: 'fresh',
				pageSize: 1,
			} )
		).rejects.toThrow( 'Catalog revision changed during hydration' );

		expect( store.replaceSnapshot ).not.toHaveBeenCalled();
	} );

	it( 'reads the active snapshot through list()', async () => {
		const store = createStoreMock();
		const remote = {
			fetchPage: jest.fn().mockResolvedValue( {
				revision: 'fresh',
				items: [ { id: 'blog-2' }, { id: 'blog-1' } ],
				done: true,
			} ),
		};

		const catalog = createAllSitesCatalog( { remote, store } );
		await catalog.boot( {
			revision: 'fresh',
			pageSize: 100,
		} );

		const sites = await catalog.list( 'blog_id' );

		expect( sites ).toEqual( [ { id: 'blog-2' }, { id: 'blog-1' } ] );
		expect( store.readAll ).toHaveBeenCalledWith( 'blog_id' );
	} );
} );