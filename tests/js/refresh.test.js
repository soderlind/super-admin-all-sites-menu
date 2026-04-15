let refreshAdminbar;

describe( 'refreshAdminbar', () => {
	beforeEach( () => {
		// Re-import the module for each test to reset the listenersAttached flag.
		jest.resetModules();
		( { refreshAdminbar } = require( '../../src/modules/refresh' ) );

		document.body.innerHTML = `
			<ul id="wp-admin-bar-my-sites-list">
				<li class="menupop">
					<a class="ab-item" href="#">Site 1</a>
					<div class="ab-sub-wrapper">
						<ul class="ab-submenu">
							<li><a class="ab-item" href="#">Dashboard</a></li>
						</ul>
					</div>
				</li>
			</ul>
		`;
	} );

	afterEach( () => {
		document.body.innerHTML = '';
	} );

	it( 'does not throw when menu element is missing', () => {
		document.body.innerHTML = '';
		expect( () => refreshAdminbar() ).not.toThrow();
	} );

	it( 'adds hover class on mouseenter', () => {
		refreshAdminbar();

		const menupop = document.querySelector( '.menupop' );
		menupop.dispatchEvent(
			new MouseEvent( 'mouseenter', { bubbles: true } )
		);

		expect( menupop.classList.contains( 'hover' ) ).toBe( true );
	} );

	it( 'removes hover class on mouseleave', () => {
		refreshAdminbar();

		const menupop = document.querySelector( '.menupop' );
		menupop.classList.add( 'hover' );
		menupop.dispatchEvent(
			new MouseEvent( 'mouseleave', { bubbles: true } )
		);

		expect( menupop.classList.contains( 'hover' ) ).toBe( false );
	} );

	it( 'toggles hover class on Tab keydown', () => {
		refreshAdminbar();

		const menupop = document.querySelector( '.menupop' );

		menupop.dispatchEvent(
			new KeyboardEvent( 'keydown', {
				key: 'Tab',
				bubbles: true,
			} )
		);
		expect( menupop.classList.contains( 'hover' ) ).toBe( true );

		menupop.dispatchEvent(
			new KeyboardEvent( 'keydown', {
				key: 'Tab',
				bubbles: true,
			} )
		);
		expect( menupop.classList.contains( 'hover' ) ).toBe( false );
	} );

	it( 'ignores non-Tab keydown events', () => {
		refreshAdminbar();

		const menupop = document.querySelector( '.menupop' );
		menupop.dispatchEvent(
			new KeyboardEvent( 'keydown', {
				key: 'Enter',
				bubbles: true,
			} )
		);

		expect( menupop.classList.contains( 'hover' ) ).toBe( false );
	} );

	it( 'does not duplicate listeners when called multiple times', () => {
		refreshAdminbar();
		refreshAdminbar();
		refreshAdminbar();

		const menupop = document.querySelector( '.menupop' );

		// Tab should toggle hover on then off — not triple-toggle.
		menupop.dispatchEvent(
			new KeyboardEvent( 'keydown', { key: 'Tab', bubbles: true } )
		);
		expect( menupop.classList.contains( 'hover' ) ).toBe( true );

		menupop.dispatchEvent(
			new KeyboardEvent( 'keydown', { key: 'Tab', bubbles: true } )
		);
		expect( menupop.classList.contains( 'hover' ) ).toBe( false );
	} );
} );
