/**
 * Creates and configures an IntersectionObserver for container elements
 *
 * @param {HTMLElement} observedContainer - Element to observe
 * @param {Function} callback - Function to execute when intersection occurs
 * @returns {IntersectionObserver|null} Configured observer or null if setup fails
 * @throws {Error} When invalid parameters are provided
 */
export function observeContainer( observedContainer, callback ) {
	if (
		! observedContainer ||
		! callback ||
		! ( 'IntersectionObserver' in window )
	) {
		console.error(
			'Invalid parameters or IntersectionObserver not supported'
		);
		return null;
	}

	const observer = new IntersectionObserver(
		( entries ) => {
			entries.forEach( ( entry ) => entry.isIntersecting && callback() );
		},
		{ threshold: 0.1 }
	);

	observer.observe( observedContainer );
	return observer;
}

/**
 * Observes menu wrapper height and adjusts based on viewport
 * Uses IntersectionObserver to dynamically adjust menu height
 *
 * @param {HTMLElement} observedWrapper - Menu wrapper element to observe
 * @returns {IntersectionObserver|undefined} Configured observer or undefined if setup fails
 */
export function observeMenuHeight( observedWrapper ) {
	if ( ! observedWrapper ) return;

	const MEDIA_QUERY = '(min-width: 783px)';
	const THRESHOLD_STEPS = Array.from( { length: 11 }, ( _, i ) => i / 10 );

	const updateMenuHeight = ( entry ) => {
		const mediaQuery = window.matchMedia( MEDIA_QUERY );
		if ( ! mediaQuery.matches ) return;

		const wrapper = document.querySelector(
			'#wp-admin-bar-my-sites>.ab-sub-wrapper'
		);
		const list = wrapper?.querySelector( 'ul#wp-admin-bar-my-sites-list' );
		if ( ! wrapper || ! list ) return;

		const isBottomVisible =
			entry.boundingClientRect.bottom < window.innerHeight;

		wrapper.style.height = isBottomVisible ? '' : 'calc(100vh - 32px)';
		list.style.paddingBottom = isBottomVisible ? '0' : '32px';
	};

	const observer = new IntersectionObserver(
		( entries ) => entries.forEach( updateMenuHeight ),
		{ threshold: THRESHOLD_STEPS }
	);

	observer.observe( observedWrapper );
	return observer;
}
