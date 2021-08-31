/**
 * All Sites Menu.
 *
 * @author Per Søderlind
 * @date  10.06.2021
 * @class AllSitesMenu
 */

import { Observe } from "./modules/observe.js";
import { Search } from "./modules/search.js";
import { DB } from "./modules/db.js";
import { Refresh } from "./modules/refresh.js";
import { Ajax } from "./modules/ajax.js";
import { Menu } from "./modules/menu.js";

class AllSitesMenu {
	observedContainer = document.querySelector("#wp-admin-bar-load-more");
	observedWrapper = document.querySelector("ul#wp-admin-bar-my-sites-list");
	observe = null;
	db = null;

	/**
	 * Add observer and search, and initialize db.
	 *
	 * @author Per Søderlind
	 */
	init() {
		this.observe = new Observe(this.observedContainer, this.observedWrapper);
		this.observe.SitesMenu(this.getSites.bind(this));
		this.observe.MenuHeight();

		Search.add();

		this.db = new DB("allsites", 1, "id,name,href");
		const incrementStore = document.querySelector("#load-more-increment");
		if (incrementStore.dataset.refresh === "refresh") {
			this.db.delete();
		}
		this.populateIndexedDB();
	}

	/**
	 * If empty, populate IndexedDB with sites menu data.
	 *
	 * @author Per Søderlind
	 */
	async populateIndexedDB() {
		if ((await this.db.count()) === 0) {
			Ajax.reset(this.observedContainer);
			await Ajax.loadSites(this.db);
		}
	}

	/**
	 * Gather sites from local storage and add them to the admin bar.
	 *
	 * @author Per Søderlind
	 */
	async getSites(observer) {
		const sites = await this.db.read();
		await this.updateSitesMenu(sites);
		observer.unobserveMenu();
	}

	/**
	 * Update the sites menu.
	 *
	 * @author Per Søderlind
	 * @param {object} data
	 */
	async updateSitesMenu(sites) {
		const sitesContainer = document.querySelector(".load-more");
		let sitesMenu = "";
		sites.forEach((site) => {
			sitesMenu += Menu.item(site);
		});
		sitesContainer.insertAdjacentHTML("beforeBegin", sitesMenu);
		new Refresh().adminbar();
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const allsitesmenu = new AllSitesMenu();
	allsitesmenu.init();
});
