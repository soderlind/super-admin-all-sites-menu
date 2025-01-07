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

export function addSearch() {
	const search = document.querySelector( '#all-sites-search-text' );
	if ( ! search ) return;

	const ul = document.querySelector( '#wp-admin-bar-my-sites-list' );
	const menuItems = ul?.getElementsByClassName( 'menupop' ) || [];

	// Create index for faster searching
	const searchIndex = Array.from( menuItems ).map( ( li ) => ( {
		element: li,
		text: li.querySelector( '.ab-item' )?.textContent?.toUpperCase() || '',
	} ) );

	const performSearch = debounce( ( filter ) => {
		const upperFilter = filter.toUpperCase();
		searchIndex.forEach( ( { element, text } ) => {
			element.style.display = text.includes( upperFilter ) ? '' : 'none';
		} );
	}, 150 );

	search.addEventListener( 'keyup', ( e ) => {
		e.preventDefault();
		performSearch( e.target.value );
	} );
}
