/**
 * Dexie.js wrapper.
 *
 * @see https://dexie.org/
 *
 * @author Per Søderlind
 * @class IndexedDB
 */
import { Dexie } from 'dexie';

class IndexedDB {
	/**
	 * Creates an instance of IndexedDB.
	 *
	 * @author Per Søderlind
	 * @param {string} name Database name
	 * @param {string} table Table name
	 * @param {string[]} keys Indexed keys. If changing, oldest first.
	 */
	constructor( name, table, keys ) {
		this.name = name;
		// this.version = version;
		this.table = table;
		this.keys = keys;
	}

	/**
	 * Get local storage database.
	 *
	 * @author Per Søderlind
	 * @returns {Dexie} Database
	 */
	database() {
		const db = new Dexie( this.name );
		let version = 1;
		for ( let keys of this.keys ) {
			db.version( version ).stores( {
				[ this.table ]: keys,
			} );
			version++;
		}
		return db;
	}
	/**
	 * Save to local storage.
	 *
	 * @author Per Søderlind
	 * @param {array} data
	 */
	async save( data ) {
		const db = this.database();
		await db[ this.table ]
			.bulkPut( data )
			.then( () => {
				db.close();
			} )
			.catch( ( err ) => {
				console.error( 'Error in db.save', err );
				throw err; // Re-throw the error!
			} );
	}

	/**
	 * Read from local storage.
	 *
	 * @author Per Søderlind
	 */
	async read( orderby = 'name' ) {
		const db = this.database();

		const data = await db[ this.table ]
			.orderBy( orderby )
			.toArray()
			.then( ( data ) => {
				db.close();
				return data;
			} )
			.catch( ( err ) => {
				console.error( 'Error in db.read', errerr );
				throw err; // Re-throw the error!
			} );
		return data;
	}

	async getFirstRow() {
		const db = this.database();

		const data = await db[ this.table ]
			.orderBy( ':id' )
			.first()
			.then( ( data ) => {
				db.close();
				return data;
			} )
			.catch( ( err ) => {
				console.error( 'Error in db.getFirstRow', err );
				throw err; // Re-throw the error!
			} );
		return data;
	}

	/**
	 * Delete local storage.
	 *
	 * @author Per Søderlind
	 */
	async delete() {
		const db = new Dexie( this.name );

		await db
			.delete()
			.then( () => {
				db.close();
			} )
			.catch( ( err ) => {
				console.warn( 'Error in db.delete', err );
				throw err; // Re-throw the error!
			} );
	}

	/**
	 * Get number of records in local storage.
	 *
	 * @author Per Søderlind
	 * @returns {*}
	 */
	async count() {
		const db = this.database();

		const count = await db[ this.table ]
			.count()
			.then( ( data ) => {
				db.close();
				return data;
			} )
			.catch( ( err ) => {
				console.error( 'Error in db.count', err );
				throw err; // Re-throw the error!
			} );
		return count;
	}

	/**
	 * Get local storage version number.
	 *
	 * @author Per Søderlind
	 * @returns {*}
	 */
	async getVersion() {
		const version = await new Dexie( this.name )
			.open()
			.then( ( db ) => {
				const v = db.verno;
				db.close();
				return v;
			} )
			.catch( ( err ) => {
				console.error( 'Error in db.getVersion', err );
				throw err; // Re-throw the error!
			} );
		return version;
	}
}

export { IndexedDB };
