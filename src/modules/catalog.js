import { Dexie } from 'dexie';

/**
 * Create the runtime catalog boundary for site cache freshness and reads.
 *
 * @param {Object} deps Catalog dependencies
 * @param {Object} deps.remote Remote adapter
 * @param {Object} deps.store Snapshot store adapter
 * @returns {{boot: (manifest: {revision: string, pageSize?: number}) => Promise<{revision: string, source: string, count: number}>, list: (orderBy?: string) => Promise<Array>}}
 */
export function createAllSitesCatalog( { remote, store } ) {
	let bootPromise;

	return {
		async boot( manifest ) {
			if ( ! manifest?.revision ) {
				throw new Error( 'Catalog boot requires a revision' );
			}

			if ( ! bootPromise ) {
				bootPromise = ensureFreshSnapshot(
					manifest,
					remote,
					store
				).finally( () => {
					bootPromise = undefined;
				} );
			}

			return bootPromise;
		},

		list( orderBy = 'name' ) {
			return store.readAll( orderBy );
		},
	};
}

async function ensureFreshSnapshot( manifest, remote, store ) {
	const snapshot = await store.getSnapshotMeta();
	if ( snapshot?.revision === manifest.revision ) {
		return {
			revision: snapshot.revision,
			source: 'cache',
			count: snapshot.count,
		};
	}

	await store.clear();

	const items = await fetchSnapshot( manifest, remote );
	await store.replaceSnapshot( {
		revision: manifest.revision,
		items,
	} );

	return {
		revision: manifest.revision,
		source: 'network',
		count: items.length,
	};
}

async function fetchSnapshot( manifest, remote ) {
	const items = [];
	let offset = 0;
	const pageSize = Number( manifest.pageSize ) || 100;

	while ( true ) {
		const page = await remote.fetchPage( {
			offset,
			limit: pageSize,
			expectedRevision: manifest.revision,
		} );

		if ( page.revision !== manifest.revision ) {
			throw new Error( 'Catalog revision changed during hydration' );
		}

		if ( page.items.length > 0 ) {
			items.push( ...page.items );
		}

		if ( page.done ) {
			return items;
		}

		offset += pageSize;
	}
}

/**
 * Create the production Dexie-backed store for site snapshots.
 *
 * @param {Object} options Store configuration
 * @param {string} options.dbName Database name
 * @param {string} options.sitesTable Sites table name
 * @returns {{getSnapshotMeta: () => Promise<{revision: string, count: number}|null>, clear: () => Promise<void>, replaceSnapshot: (input: {revision: string, items: Array}) => Promise<void>, readAll: (orderBy?: string) => Promise<Array>}}
 */
export function createDexieSnapshotStore( { dbName, sitesTable } ) {
	const db = new Dexie( dbName );
	db.version( 1 ).stores( {
		[ sitesTable ]: 'id,name,url',
	} );
	db.version( 2 ).stores( {
		[ sitesTable ]: 'id,name,url,timestamp',
	} );
	db.version( 3 ).stores( {
		[ sitesTable ]: 'id,name,url,timestamp,blog_id',
	} );
	db.version( 4 ).stores( {
		[ sitesTable ]: 'id,name,url,blog_id',
		catalog_meta: 'key',
	} );

	const metaTable = db.table( 'catalog_meta' );
	const siteTable = db.table( sitesTable );

	return {
		async getSnapshotMeta() {
			const meta = await metaTable.get( 'snapshot' );
			if ( ! meta?.revision ) {
				return null;
			}

			return {
				revision: meta.revision,
				count: Number( meta.count ) || 0,
			};
		},

		async clear() {
			await db.transaction( 'rw', siteTable, metaTable, async () => {
				await siteTable.clear();
				await metaTable.delete( 'snapshot' );
			} );
		},

		async replaceSnapshot( { revision, items } ) {
			await db.transaction( 'rw', siteTable, metaTable, async () => {
				await siteTable.clear();
				if ( items.length > 0 ) {
					await siteTable.bulkPut( items );
				}
				await metaTable.put( {
					key: 'snapshot',
					revision,
					count: items.length,
				} );
			} );
		},

		async readAll( orderBy = 'name' ) {
			return siteTable.orderBy( orderBy ).toArray();
		},
	};
}
