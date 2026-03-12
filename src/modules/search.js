/**
 * Debounce helper
 * @param {Function} fn Function to debounce
 * @param {number} delay Delay in milliseconds
 */
const debounce = ( fn, delay ) => {
	let timeoutId;
	return ( ...args ) => {
		clearTimeout( timeoutId );
		timeoutId = setTimeout( () => fn( ...args ), delay );
	};
};

/**
 * Add search functionality to the sites menu
 * @returns {void}
 */
export function addSearch() {
	// Use more specific selector and verify element exists
	const search = document.querySelector( '#all-sites-search-text' );
	if ( ! search ) {
		console.warn( 'Search input not found' );
		return;
	}

	// Get the sites list container
	const sitesContainer = document.querySelector(
		'#wp-admin-bar-my-sites-list'
	);
	if ( ! sitesContainer ) {
		console.warn( 'Sites container not found' );
		return;
	}

	// Create search index on first load
	const createSearchIndex = () => {
		const menuItems =
			sitesContainer.getElementsByClassName( 'menupop' ) || [];
		return Array.from( menuItems ).map( ( li ) => {
			const text =
				li
					.querySelector( '.ab-item' )
					?.textContent?.toLowerCase()
					.trim() || '';
			// Extract URL from the last submenu link ("Visit" link)
			const visitLink = li.querySelector(
				'.ab-submenu .ab-item:last-child'
			);
			const url = ( visitLink?.href || '' )
				.replace( /^https?:\/\//, '' )
				.replace( /\/+$/, '' )
				.toLowerCase();
			return { element: li, text, url };
		} );
	};

	let searchIndex = createSearchIndex();

	// Perform search with improved filtering
	const performSearch = debounce( ( searchTerm ) => {
		const filter = searchTerm.toLowerCase().trim();

		// Show all items if search is empty
		if ( ! filter ) {
			searchIndex.forEach( ( { element } ) => {
				element.style.display = '';
			} );
			return;
		}

		// Filter items by name or URL
		searchIndex.forEach( ( { element, text, url } ) => {
			const match = text.includes( filter ) || url.includes( filter );
			element.style.display = match ? '' : 'none';
		} );
	}, 150 );

	// Add input event listener (catches all input changes)
	search.addEventListener( 'input', ( e ) => {
		e.preventDefault();
		performSearch( e.target.value );
	} );

	// Re-index when new sites are loaded
	const observer = new MutationObserver( () => {
		searchIndex = createSearchIndex();
	} );

	observer.observe( sitesContainer, {
		childList: true,
		subtree: true,
	} );
}
