class DB {
	name = "db";
	version = "1.0";
	key = "id";

	constructor(name, version, keys) {
		this.name = name;
		this.version = version;
		this.keys = keys;
	}

	/**
	 * Save sites to local storage.
	 *
	 * @author Per Søderlind
	 * @param {array} sites
	 */
	async save(sites) {
		const db = new Dexie(this.name);
		db.version(this.version).stores({
			sites: this.keys,
		});
		await db.sites
			.bulkPut(sites)
			.then(() => {
				db.close();
			})
			.catch((err) => {
				console.error(err);
			});
	}

	/**
	 * Read sites from local storage and refresh the admin bar.
	 *
	 * @author Per Søderlind
	 */
	async read( orderby = "name" ) {
		const db = new Dexie(this.name);
		db.version(this.version).stores({
			sites: this.keys,
		});

		const sites = await db.sites
			.orderBy(orderby)
			.toArray()
			.then((data) => {
				db.close();
				return data;
			})
			.catch((err) => {
				console.error(err);
			});
		return sites;
	}

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

	async count() {
		const db = new Dexie(this.name);
		db.version(this.version).stores({
			sites: this.keys,
		});

		const count = await db.sites
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

export { DB };
