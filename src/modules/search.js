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
		return Array.from( menuItems ).map( ( li ) => ( {
			element: li,
			text:
				li
					.querySelector( '.ab-item' )
					?.textContent?.toLowerCase()
					.trim() || '',
		} ) );
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

		// Filter items
		searchIndex.forEach( ( { element, text } ) => {
			element.style.display = text.includes( filter ) ? '' : 'none';
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
