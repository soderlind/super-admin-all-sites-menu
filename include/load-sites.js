class LazyLoadSites {

	constructor() {
		this.sitesContainer = document.querySelector('.load-more')
		this.offsetStore = document.querySelector('#load-more-offset')
		this.observedContainer = document.querySelector("#wp-admin-bar-load-more")
		this.adminBar = document.getElementById('wpadminbar')
		this.observer = {}

	}

	observeSitesMenu() {
		this.observer = new IntersectionObserver(entries => {
			entries.forEach(entry => {
				const { isIntersecting } = entry

				if (isIntersecting) {
					this.loadSites()
				}
			}, {
				root: this.observedContainer
			})
		})

		this.observer.observe(this.observedContainer)
	}

	async loadSites() {

		const data = new FormData();
		data.append("action", "all_sites_menu_action");
		data.append("nonce", pluginAllSitesMenu.nonce);
		data.append("offset", this.offsetStore.dataset.offset);

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
				this.offsetStore.dataset.offset = parseInt(this.offsetStore.dataset.offset) + 80;
				this.updateSitesMenu(res.data);
			} else if (res.response === "unobserve") {
				this.observer.unobserve(this.observedContainer);
				this.observedContainer.style.display = 'none';
			}
		} catch (err) {
			console.error(err);
		}
	}

	updateSitesMenu(data) {
		let sites = ''
		data.forEach(site => {
			sites += this.siteMenuTemplate(site)
		})
		this.sitesContainer.insertAdjacentHTML('beforeBegin', sites)
		this.refreshAdminBar();
	}

	siteMenuTemplate(site) {
		return `
				<li id="wp-admin-bar-${site.id}" class="menupop">
				<a class="ab-item" aria-haspopup="true" href="${site.href}"><span class="wp-admin-bar-arrow" aria-hidden="true"></span>
					${site.title}
				</a>
				<div class="ab-sub-wrapper">
					<ul id="wp-admin-bar-${site.id}-default" class="ab-submenu">
						<li id="wp-admin-bar-${site.id}-d"><a class="ab-item"
								href="${site.href}">${pluginAllSitesMenu.l10n.dashboard}</a></li>
						<li id="wp-admin-bar-${site.id}-n"><a class="ab-item"
								href="${site.href}/post-new.php">${pluginAllSitesMenu.l10n.newpost}</a></li>
						<li id="wp-admin-bar-${site.id}-o"><a class="ab-item"
								href="${site.href}/post-new.php?post_type=page">${pluginAllSitesMenu.l10n.newpage}</a></li>
						<li id="wp-admin-bar-${site.id}-c"><a class="ab-item"
								href="${site.href}/edit-comments.php">${pluginAllSitesMenu.l10n.managecomments}</a></li>
						<li id="wp-admin-bar-${site.id}-u"><a class="ab-item"
								href="${site.href}/users.php">${pluginAllSitesMenu.l10n.users}</a></li>
						<li id="wp-admin-bar-${site.id}-p"><a class="ab-item"
								href="${site.href}/plugins.php">${pluginAllSitesMenu.l10n.plugins}</a></li>
						<li id="wp-admin-bar-${site.id}-s"><a class="ab-item"
								href="${site.href}/options-general.php">${pluginAllSitesMenu.l10n.settings}</a></li>
					</ul>
				</div>
			</li>
		`
	}


	/**
	 * Methods below are from the wp-includes/js/admin-bar.js file.
	 */

	refreshAdminBar() {

		let topMenuItems = this.adminBar.querySelectorAll('li.menupop')
		for (let i = 0; i < topMenuItems.length; i++) {
			// Adds or removes the hover class based on the hover intent.
			window.hoverintent(
				topMenuItems[i],
				this.addClass.bind(null, topMenuItems[i], 'hover'),
				this.removeClass.bind(null, topMenuItems[i], 'hover')
			).options({
				timeout: 180
			});

			// Toggle hover class if the enter key is pressed.
			topMenuItems[i].addEventListener('keydown', this.toggleHoverIfEnter);
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
				element.className += ' ';
			}

			element.className += className;
		}

		/**
		 * Adjust submmenu offset..
		 */

		let rect = element.getBoundingClientRect()
		let top = rect.top;
		let subMenu = element.querySelector('.ab-submenu');
		subMenu.style.top = top - 6 + 'px'

		// console.log({ wh: window.innerHeight, b: subMenu.getBoundingClientRect().bottom })

		if (subMenu.getBoundingClientRect().bottom > window.innerHeight) {
			subMenu.style.top = 'auto'
			subMenu.style.bottom = '0'
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
		var testName,
			classes;

		if (!element && !this.hasClass(element, className)) {
			return;
		}

		if (element.classList && element.classList.remove) {
			element.classList.remove(className);
		} else {
			testName = ' ' + className + ' ';
			classes = ' ' + element.className + ' ';

			while (classes.indexOf(testName) > -1) {
				classes = classes.replace(testName, '');
			}

			element.className = classes.replace(/^[\s]+|[\s]+$/g, '');
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
		var wrapper;

		if (event.which !== 13) {
			return;
		}

		if (!!this.getClosest(event.target, '.ab-sub-wrapper')) {
			return;
		}

		wrapper = this.getClosest(event.target, '.menupop');

		if (!wrapper) {
			return;
		}

		event.preventDefault();

		if (this.hasClass(wrapper, 'hover')) {
			this.removeClass(wrapper, 'hover');
		} else {
			this.addClass(wrapper, 'hover');
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
		var classNames;

		if (!element) {
			return false;
		}

		if (element.classList && element.classList.contains) {
			return element.classList.contains(className);
		} else if (element.className) {
			classNames = element.className.split(' ');
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
				function (s) {
					var matches = (this.document || this.ownerDocument).querySelectorAll(s),
						i = matches.length;

					while (--i >= 0 && matches.item(i) !== this) { }

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

document.addEventListener("DOMContentLoaded", () => {
	const lazyLoadsites = new LazyLoadSites()
	lazyLoadsites.observeSitesMenu()
})