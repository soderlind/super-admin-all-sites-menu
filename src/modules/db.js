import { Dexie } from 'dexie';

class IndexedDB {
	#db;
	#name;
	#table;
	#keys;

	constructor( name, table, keys ) {
		this.#name = name;
		this.#table = table;
		this.#keys = keys;
		this.#db = this.#initDatabase();
	}

	#initDatabase() {
		const db = new Dexie( this.#name );
		this.#keys.forEach( ( keys, index ) => {
			db.version( index + 1 ).stores( {
				[ this.#table ]: keys,
			} );
		} );
		return db;
	}

	async save( data ) {
		try {
			await this.#db[ this.#table ].bulkPut( data );
		} catch ( err ) {
			console.error( 'IndexedDB save error:', err );
			throw err;
		}
	}

	async read( orderby = 'name' ) {
		try {
			const data = await this.#db[ this.#table ]
				.orderBy( orderby )
				.toArray();
			return data;
		} catch ( err ) {
			console.error( 'IndexedDB read error:', err );
			throw err;
		}
	}

	async getFirstRow() {
		try {
			const data = await this.#db[ this.#table ].orderBy( ':id' ).first();
			return data;
		} catch ( err ) {
			console.error( 'IndexedDB getFirstRow error:', err );
			throw err;
		}
	}

	async delete() {
		try {
			await this.#db.delete();
			this.#db = this.#initDatabase();
		} catch ( err ) {
			console.error( 'IndexedDB delete error:', err );
			throw err;
		}
	}

	async count() {
		try {
			const count = await this.#db[ this.#table ].count();
			return count;
		} catch ( err ) {
			console.error( 'IndexedDB count error:', err );
			throw err;
		}
	}

	async getVersion() {
		try {
			const version = await this.#db.open().then( ( db ) => db.verno );
			return version;
		} catch ( err ) {
			console.error( 'IndexedDB getVersion error:', err );
			throw err;
		}
	}
}

export { IndexedDB };
