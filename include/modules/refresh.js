class Refresh {
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
	adminbar() {
		const sitemenu = document.getElementById("wp-admin-bar-my-sites-list");
		if (sitemenu) {
			sitemenu.addEventListener(
				"mouseenter",
				(e) => {
					e.stopPropagation();
					if (e.target.classList.contains("menupop")) {
						this.addClass(e.target, "hover");
					}
				},
				{ capture: true }
			);

			sitemenu.addEventListener(
				"mouseleave",
				(e) => {
					e.stopPropagation();
					if (e.target.classList.contains("menupop")) {
						this.removeClass(e.target, "hover");
					}
				},
				{ capture: true }
			);

			sitemenu.addEventListener(
				"keydown",
				(e) => {
					if (e.key === "Tab") {
						e.preventDefault();
						if (e.target.classList.contains("menupop")) {
							this.toggleClass(e.target, "hover");
						}
					}
				},
				{ capture: true }
			);
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
				function (s) {
					let matches = (this.document || this.ownerDocument).querySelectorAll(
						s
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

export { Refresh };
