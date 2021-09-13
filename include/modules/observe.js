class Observe {
	observedContainer = null;
	observedWrapper = null;
	menuObserver = null;
	wrapperObserver = null;

	constructor(observedContainer, observedWrapper) {
		this.observedContainer = observedContainer;
		this.observedWrapper = observedWrapper;
	}
	/**
	 * Observe the load more text and load the sites.
	 *
	 * @author Per Søderlind
	 */
	SitesMenu(getSites) {
		this.menuObserver = new IntersectionObserver((entries) => {
			entries.forEach(
				(entry) => {
					const { isIntersecting } = entry;
					if (isIntersecting) {
						getSites(this);
					}
				},
				{
					root: this.observedContainer,
				}
			);
		});

		this.menuObserver.observe(this.observedContainer);
	}
	/**
	 * Change the wrapper height.
	 *
	 * @see https://stackoverflow.com/a/66428317
	 * @author Per Søderlind
	 */
	MenuHeight() {
		this.wrapperObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const bcr = entry.boundingClientRect;
					const isBottomVisible = bcr.bottom < window.innerHeight && bcr.bottom;

					//Set the site menu wrapper height.
					const mx = window.matchMedia("(min-width: 783px)");
					if (mx.matches) {
						const wrapper = document.querySelector(
							"#wp-admin-bar-my-sites>.ab-sub-wrapper"
						);

						if (isBottomVisible) {
							wrapper.style.height = "";
							wrapper.querySelector(
								"ul#wp-admin-bar-my-sites-list"
							).style.paddingBottom = "0";
						} else {
							wrapper.style.height = "calc(100vh - 32px)";
							wrapper.querySelector(
								"ul#wp-admin-bar-my-sites-list"
							).style.paddingBottom = "32px";
						}
					}
				});
			},
			{
				threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
			}
		);

		this.wrapperObserver.observe(this.observedWrapper);
	}

	/**
	 * Unobserve the menu.
	 *
	 * @author Per Søderlind
	 */
	unobserveMenu() {
		this.menuObserver.unobserve(this.observedContainer);
		this.observedContainer.style.display = "none";
	}
}

export { Observe };
