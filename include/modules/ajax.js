class Ajax {
	/**
	 * Using AJAX, incremental load sites and add them to local storage.
	 *
	 * @author Per Søderlind
	 */
	static async loadSites(db) {
		const data = new FormData();
		const incrementStore = document.querySelector("#load-more-increment");

		data.append("action", "all_sites_menu_action");
		data.append("nonce", pluginAllSitesMenu.nonce);
		data.append("increment", incrementStore.dataset.increment);

		const url = pluginAllSitesMenu.ajaxurl;
		try {
			const response = await fetch(url, {
				method: "POST",
				credentials: "same-origin",
				body: data,
			});

			const res = await response.json();
			if (res.response === "success") {
				incrementStore.dataset.increment =
					parseInt(incrementStore.dataset.increment) +
					pluginAllSitesMenu.loadincrements;
				db.save(res.data);
				await Ajax.loadSites(db); // load more.
			}
		} catch (err) {
			console.error(err);
		}
	}

	static reset(container) {
		const incrementStore = document.querySelector("#load-more-increment");
		incrementStore.dataset.increment = 0;
		container.style.display = "";
	}
}

export { Ajax };