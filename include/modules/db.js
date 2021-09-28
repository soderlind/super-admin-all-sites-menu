/**
 * Dexie.js wrapper.
 *
 * @see https://dexie.org/
 *
 * @author Per Søderlind
 * @class IndexedDB
 */
class IndexedDB {
	name = "db";
	version = "1.0";
	table = "table";
	key = "id";

	/**
	 * Creates an instance of IndexedDB.
	 *
	 * @author Per Søderlind
	 * @param {string} name Database name
	 * @param {string} version Database version
	 * @param {string} table Table name
	 * @param {string} keys Indexed keys
	 */
	constructor(name, version, table, keys) {
		this.name = name;
		this.version = version;
		this.table = table;
		this.keys = keys;
	}

	/**
	 * Save to local storage.
	 *
	 * @author Per Søderlind
	 * @param {array} data
	 */
	async save(data) {
		const db = new Dexie(this.name);
		db.version(this.version).stores({
			[this.table]: this.keys,
		});
		await db[this.table]
			.bulkPut(data)
			.then(() => {
				db.close();
			})
			.catch((err) => {
				console.error(err);
			});
	}

	/**
	 * Read from local storage.
	 *
	 * @author Per Søderlind
	 */
	async read(orderby = "name") {
		const db = new Dexie(this.name);
		db.version(this.version).stores({
			[this.table]: this.keys,
		});

		const data = await db[this.table]
			.orderBy(orderby)
			.toArray()
			.then((data) => {
				db.close();
				return data;
			})
			.catch((err) => {
				console.error(err);
			});
		return data;
	}

	async getFirstRow() {
		const db = new Dexie(this.name);
		db.version(this.version).stores({
			[this.table]: this.keys,
		});

		const data = await db[this.table]
			.orderBy(":id")
			.first()
			.then((data) => {
				db.close();
				return data;
			})
			.catch((err) => {
				console.error(err);
			});
		return data;
	}

	/**
	 * Delete local storage.
	 *
	 * @author Per Søderlind
	 */
	async delete() {
		const db = new Dexie(this.name);

		await db
			.delete()
			.then(() => {
				db.close();
			})
			.catch((err) => {
				console.warn(err);
			});
	}

	/**
	 * Get number of records in local storage.
	 *
	 * @author Per Søderlind
	 * @returns {*}
	 */
	async count() {
		const db = new Dexie(this.name);
		db.version(this.version).stores({
			[this.table]: this.keys,
		});

		const count = await db[this.table]
			.count()
			.then((data) => {
				db.close();
				return data;
			})
			.catch((err) => {
				console.error(err);
			});
		return count;
	}
}

export { IndexedDB };
