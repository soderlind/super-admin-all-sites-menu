/**
 * Refreshes the admin bar event handlers for dynamically inserted site menus.
 *
 * Submenu offset adjustment based on:
 * @see https://qiita.com/zephyr7501/items/dd0967fddabd888b28c4
 */
export function refreshAdminbar() {
	const sitemenu = document.getElementById( 'wp-admin-bar-my-sites-list' );
	if ( ! sitemenu ) {
		return;
	}

	sitemenu.addEventListener(
		'mouseenter',
		( e ) => {
			e.stopPropagation();
			if ( e.target.classList.contains( 'menupop' ) ) {
				showSubmenu( e.target );
			}
		},
		{ capture: true }
	);

	sitemenu.addEventListener(
		'mouseleave',
		( e ) => {
			e.stopPropagation();
			if ( e.target.classList.contains( 'menupop' ) ) {
				hideSubmenu( e.target );
			}
		},
		{ capture: true }
	);

	sitemenu.addEventListener(
		'keydown',
		( e ) => {
			if ( e.key === 'Tab' ) {
				e.preventDefault();
				if ( e.target.classList.contains( 'menupop' ) ) {
					toggleSubmenu( e.target );
				}
			}
		},
		{ capture: true }
	);
}

function showSubmenu( element ) {
	element.classList.add( 'hover' );
	adjustSubmenuOffset( element );
}

function hideSubmenu( element ) {
	element.classList.remove( 'hover' );
}

function toggleSubmenu( element ) {
	if ( element.classList.toggle( 'hover' ) ) {
		adjustSubmenuOffset( element );
	}
}

function adjustSubmenuOffset( element ) {
	const subMenu = element.querySelector( '.ab-submenu' );
	if ( ! subMenu ) {
		return;
	}

	const top = element.getBoundingClientRect().top;
	subMenu.style.top = `${ top - 6 }px`;
	subMenu.style.bottom = '';

	if ( subMenu.getBoundingClientRect().bottom > window.innerHeight ) {
		subMenu.style.top = 'auto';
		subMenu.style.bottom = '0';
	}
}
