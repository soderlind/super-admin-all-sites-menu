/**
 * Observe the load more text and load the sites.
 *
 * @author Per Søderlind
 * @export
 * @param {el} observedContainer
 * @param {function} callback
 * @returns {IntersectionObserver}
 */
export function observeContainer(observedContainer, callback) {
	const observer = new IntersectionObserver((entries) => {
		entries.forEach(
			(entry) => {
				const { isIntersecting } = entry;
				if (isIntersecting) {
					callback();
				}
			},
			{
				root: observedContainer,
			}
		);
	});

	observer.observe(observedContainer);

	return observer;
}

/**
 * Change the wrapper height.
 *
 * @see https://stackoverflow.com/a/66428317
 *
 * @author Per Søderlind
 * @export
 * @param {el} observedWrapper
 */
export function observeMenuHeight(observedWrapper) {
	const wrapperObserver = new IntersectionObserver(
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

	wrapperObserver.observe(observedWrapper);
}
