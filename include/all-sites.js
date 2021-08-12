/**
 * Save/load all sites.
 *
 * @author Per Søderlind
 * @date  10.09.2021
 * @class AllSitesMenu
 */
class AllSitesMenu {
	constructor() {
		this.idbName = "allsites";
		this.idbVersion = 1;
		this.sitesContainer = document.querySelector(".load-more");
		this.incrementStore = document.querySelector("#load-more-increment");
		this.observedContainer = document.querySelector("#wp-admin-bar-load-more");
		this.adminBar = document.getElementById("wpadminbar");
		this.observer = {};
	}

	init() {
		this.observeSitesMenu();
		this.addSearch();
		if (this.incrementStore.dataset.refresh === "refresh") {
			this.deleteDB();
		}
	}

	/**
	 * Observe the load more text and load the sites.
	 *
	 * @author Per Søderlind
	 */
	observeSitesMenu() {
		this.observer = new IntersectionObserver((entries) => {
			entries.forEach(
				(entry) => {
					const {isIntersecting} = entry;
					if (isIntersecting) {
						this.getSites();
					}
				},
				{
					root: this.observedContainer,
				},
			);
		});

		this.observer.observe(this.observedContainer);
	}

	/**
	 * Gather sites from local storage and add them to the admin bar. If no sites are found,
	 * run loadSites().
	 *
	 * @author Per Søderlind
	 */
	async getSites() {
		const db = new Dexie(this.idbName);
		db.version(this.idbVersion).stores({
			sites: "id,name,href",
		});

		if ((await db.sites.count()) === 0) {
			this.observedContainer.style.display = "";
			this.incrementStore.dataset.increment = 0;
			await this.loadSites();
		}
		await this.read();
	}

	/**
	 * Using AJAX, incremental load sites and add them to local storage.
	 *
	 * @author Per Søderlind
	 */
	async loadSites() {
		const data = new FormData();
		data.append("action", "all_sites_menu_action");
		data.append("nonce", pluginAllSitesMenu.nonce);
		data.append("increment", this.incrementStore.dataset.increment);

		const url = pluginAllSitesMenu.ajaxurl;
		try {
			const response = await fetch(
				url,
				{
					method: "POST",
					credentials: "same-origin",
					body: data,
				},
			);

			const res = await response.json();
			if (res.response === "success") {
				this.incrementStore.dataset.increment =
					parseInt(this.incrementStore.dataset.increment) +
					pluginAllSitesMenu.loadincrements;
				this.save(res.data);
				await this.loadSites(); // load more.
			} else if (res.response === "unobserve") {
				this.observer.unobserve(this.observedContainer);
				this.observedContainer.style.display = "none";
			}
		} catch (err) {
			console.error(err);
		}
	}

	/**
	 * Save sites to local storage.
	 *
	 * @author Per Søderlind
	 * @param {array} sites
	 */
	async save(sites) {
		const db = new Dexie(this.idbName);
		db.version(this.idbVersion).stores({
			sites: "id,name,href",
		});
		await db.sites.bulkPut(sites).then(() => {
			db.close();
		}).catch((err) => {
			console.error(err);
		});
	}

	/**
	 * Read sites from local storage and refresh the admin bar.
	 *
	 * @author Per Søderlind
	 */
	async read() {
		const db = new Dexie(this.idbName);
		db.version(this.idbVersion).stores({
			sites: "id,name,href",
		});

		const sites = await db.sites.orderBy("name").toArray().then((data) => {
			db.close();
			return data;
		}).catch((err) => {
			console.error(err);
		});
		await this.updateSitesMenu(sites);
		this.observer.unobserve(this.observedContainer);
		this.observedContainer.style.display = "none";
	}

	async deleteDB() {
		const db = new Dexie(this.idbName);

		await db.delete().then(() => {
			db.close();
		}).catch((err) => {
			console.warn(err);
		});
	}

	/**
	 * Update the sites menu.
	 *
	 * @author Per Søderlind
	 * @param {object} data
	 */
	async updateSitesMenu(data) {
		let sites = "";
		data.forEach((site) => {
			sites += this.siteMenuTemplate(site);
		});
		this.sitesContainer.insertAdjacentHTML("beforeBegin", sites);
		this.refreshAdminBar();
	}

	/**
	 * Create the site menu item.
	 *
	 * @author Per Søderlind
	 * @param {object} site
	 * @returns {string}
	 */
	siteMenuTemplate(site) {
		return `
				<li id="wp-admin-bar-${site.id}" class="menupop">
				<a class="ab-item" aria-haspopup="true" href="${site.admin}/"><span class="wp-admin-bar-arrow" aria-hidden="true"></span>
					${site.title}
				</a>
				<div class="ab-sub-wrapper">
					<ul id="wp-admin-bar-${site.id}-default" class="ab-submenu">
						<li id="wp-admin-bar-${site.id}-d"><a class="ab-item"
								href="${site.admin}">${pluginAllSitesMenu.l10n.dashboard}</a></li>
						<li id="wp-admin-bar-${site.id}-n"><a class="ab-item"
								href="${site.admin}/post-new.php">${pluginAllSitesMenu.l10n.newpost}</a></li>
						<li id="wp-admin-bar-${site.id}-o"><a class="ab-item"
								href="${site.admin}/post-new.php?post_type=page">${pluginAllSitesMenu.l10n.newpage}</a></li>
						<li id="wp-admin-bar-${site.id}-c"><a class="ab-item"
								href="${site.admin}/edit-comments.php">${pluginAllSitesMenu.l10n.managecomments}</a></li>
						<li id="wp-admin-bar-${site.id}-u"><a class="ab-item"
								href="${site.admin}/users.php">${pluginAllSitesMenu.l10n.users}</a></li>
						<li id="wp-admin-bar-${site.id}-p"><a class="ab-item"
								href="${site.admin}/plugins.php">${pluginAllSitesMenu.l10n.plugins}</a></li>
						<li id="wp-admin-bar-${site.id}-s"><a class="ab-item"
								href="${site.admin}/options-general.php">${pluginAllSitesMenu.l10n.settings}</a></li>
						<li id="wp-admin-bar-${site.id}-v"><a class="ab-item"
								href="${site.url}/">${pluginAllSitesMenu.l10n.visit}</a></li>
					</ul>
				</div>
			</li>
		`;
	}

	/**
	 * Add search filter for the sites menu.
	 *
	 * @author Per Søderlind
	 */
	addSearch() {
		const search = document.querySelector("#all-sites-search-text");
		search.addEventListener(
			"keyup",
			(e) => {
				e.preventDefault();
				const filter = e.target.value.toUpperCase();
				const ul = document.querySelector("#wp-admin-bar-my-sites-list");
				const li = ul.getElementsByClassName("menupop");
				for (let i = 0; i < li.length; i++) {
					let a = li[i].querySelector(".ab-item");
					let txtValue = a.textContent || a.innerText;
					if (txtValue.toUpperCase().indexOf(filter) > -1) {
						li[i].style.display = "";
					} else {
						li[i].style.display = "none";
					}
				}
			},
		);
	}

	/**
	 * The methods below are from the wp-includes/js/admin-bar.js file.
	 *
	 * In addClass(),  added implementation of submmenu offset adjustment.
	 */

	/**
	 * Refreshes the admin bar.
	 *
	 * @memberof AllSitesMenu
	 */
	refreshAdminBar() {
		let topMenuItems = this.adminBar.querySelectorAll("li.menupop");
		for (let i = 0; i < topMenuItems.length; i++) {
			// Adds or removes the hover class based on the hover intent.
			window.hoverintent(
				topMenuItems[i],
				this.addClass.bind(null, topMenuItems[i], "hover"),
				this.removeClass.bind(null, topMenuItems[i], "hover"),
			).options({
				timeout: 180,
			});

			// Toggle hover class if the enter key is pressed.
			topMenuItems[i].addEventListener("keydown", this.toggleHoverIfEnter);
		}
	}

	/**
	 * Add class to an element.
	 *
	 * @since 5.3.1
	 *
	 * @param {HTMLElement} element The HTML element.
	 * @param {string}      className The class name.
	 */
	addClass(element, className) {
		if (!element) {
			return;
		}

		if (element.classList && element.classList.add) {
			element.classList.add(className);
		} else if (!this.hasClass(element, className)) {
			if (element.className) {
				element.className += " ";
			}

			element.className += className;
		}

		/**
		 * Adjust submenu offset..
		 * @see https://qiita.com/zephyr7501/items/dd0967fddabd888b28c4
		 */

		let rect = element.getBoundingClientRect();
		let top = rect.top;
		let subMenu = element.querySelector(".ab-submenu");
		subMenu.style.top = `${top - 6}px`;

		if (subMenu.getBoundingClientRect().bottom > window.innerHeight) {
			subMenu.style.top = "auto";
			subMenu.style.bottom = "0";
		}
	}

	/**
	 * Remove class from an element.
	 *
	 * @since 5.3.1
	 *
	 * @param {HTMLElement} element The HTML element.
	 * @param {string}      className The class name.
	 */
	removeClass(element, className) {
		let testName;
		let classes;
		if (!element && !this.hasClass(element, className)) {
			return;
		}

		if (element.classList && element.classList.remove) {
			element.classList.remove(className);
		} else {
			testName = ` ${className} `;
			classes = ` ${element.className} `;

			while (classes.indexOf(testName) > -1) {
				classes = classes.replace(testName, "");
			}

			element.className = classes.replace(/^[\s]+|[\s]+$/g, "");
		}
	}

	/**
		 * Toggle hover class for top level menu item when enter is pressed.
		 *
		 * @since 5.3.1
		 *
		 * @param {Event} event The keydown event.
		 */
	toggleHoverIfEnter(event) {
		let wrapper;

		if (event.which !== 13) {
			return;
		}

		if (!this.getClosest(event.target, ".ab-sub-wrapper")) {
			return;
		}

		wrapper = this.getClosest(event.target, ".menupop");

		if (!wrapper) {
			return;
		}

		event.preventDefault();

		if (this.hasClass(wrapper, "hover")) {
			this.removeClass(wrapper, "hover");
		} else {
			this.addClass(wrapper, "hover");
		}
	}

	/**
	 * Check if element has class.
	 *
	 * @since 5.3.1
	 *
	 * @param {HTMLElement} element The HTML element.
	 * @param {string}      className The class name.
	 * @return {boolean} Whether the element has the className.
	 */
	hasClass(element, className) {
		let classNames;

		if (!element) {
			return false;
		}

		if (element.classList && element.classList.contains) {
			return element.classList.contains(className);
		} else if (element.className) {
			classNames = element.className.split(" ");
			return classNames.indexOf(className) > -1;
		}

		return false;
	}

	/**
		 * Get closest Element.
		 *
		 * @since 5.3.1
		 *
		 * @param {HTMLElement} el Element to get parent.
		 * @param {string} selector CSS selector to match.
		 */
	getClosest(el, selector) {
		if (!window.Element.prototype.matches) {
			// Polyfill from https://developer.mozilla.org/en-US/docs/Web/API/Element/matches.
			window.Element.prototype.matches =
				window.Element.prototype.matchesSelector ||
				window.Element.prototype.mozMatchesSelector ||
				window.Element.prototype.msMatchesSelector ||
				window.Element.prototype.oMatchesSelector ||
				window.Element.prototype.webkitMatchesSelector ||
				function(s) {
					let matches = (this.document || this.ownerDocument).querySelectorAll(
						s,
					);
					let i = matches.length;
					while (--i >= 0 && matches.item(i) !== this) {}

					return i > -1;
				};
		}

		// Get the closest matching elent.
		for (; el && el !== document; el = el.parentNode) {
			if (el.matches(selector)) {
				return el;
			}
		}

		return null;
	}
}

document.addEventListener(
	"DOMContentLoaded",
	() => {
		const allsitesmenu = new AllSitesMenu();
		allsitesmenu.init();
	},
);
