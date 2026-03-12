/**
 * @jest-environment jsdom
 */

import { addSearch } from '../../src/modules/search.js';

// Minimal DOM fixture matching the admin bar structure
function buildDOM( sites ) {
	document.body.innerHTML = `
		<input type="text" id="all-sites-search-text" placeholder="Search by name or URL" />
		<ul id="wp-admin-bar-my-sites-list">
			${ sites
				.map(
					( s ) => `
				<li class="menupop">
					<a class="ab-item" href="${ s.admin }">${ s.name }</a>
					<div class="ab-sub-wrapper">
						<ul class="ab-submenu">
							<li><a class="ab-item" href="${ s.admin }">Dashboard</a></li>
							<li><a class="ab-item" href="${ s.url }">Visit</a></li>
						</ul>
					</div>
				</li>`
				)
				.join( '' ) }
		</ul>
	`;
}

function getMenuItems() {
	return Array.from(
		document.querySelectorAll(
			'#wp-admin-bar-my-sites-list > .menupop'
		)
	);
}

function fireInput( value ) {
	const input = document.querySelector( '#all-sites-search-text' );
	input.value = value;
	input.dispatchEvent( new Event( 'input', { bubbles: true } ) );
}

const SITES = [
	{
		name: 'Alpha Blog',
		admin: 'https://alpha.example.com/wp-admin',
		url: 'https://alpha.example.com/',
	},
	{
		name: 'Beta Site',
		admin: 'https://beta.test.org/wp-admin',
		url: 'https://beta.test.org/',
	},
	{
		name: 'Gamma Portal',
		admin: 'https://gamma.example.com/wp-admin',
		url: 'https://gamma.example.com/',
	},
];

beforeEach( () => {
	jest.useFakeTimers();
	buildDOM( SITES );
	addSearch();
} );

afterEach( () => {
	jest.useRealTimers();
} );

describe( 'addSearch – search by name', () => {
	test( 'shows matching item, hides others', () => {
		fireInput( 'alpha' );
		jest.advanceTimersByTime( 200 );
		const items = getMenuItems();
		expect( items[ 0 ].style.display ).toBe( '' );
		expect( items[ 1 ].style.display ).toBe( 'none' );
		expect( items[ 2 ].style.display ).toBe( 'none' );
	} );

	test( 'is case-insensitive', () => {
		fireInput( 'BETA' );
		jest.advanceTimersByTime( 200 );
		const items = getMenuItems();
		expect( items[ 0 ].style.display ).toBe( 'none' );
		expect( items[ 1 ].style.display ).toBe( '' );
	} );
} );

describe( 'addSearch – search by URL', () => {
	test( 'matches by domain', () => {
		fireInput( 'beta.test.org' );
		jest.advanceTimersByTime( 200 );
		const items = getMenuItems();
		expect( items[ 0 ].style.display ).toBe( 'none' );
		expect( items[ 1 ].style.display ).toBe( '' );
		expect( items[ 2 ].style.display ).toBe( 'none' );
	} );

	test( 'matches partial domain', () => {
		fireInput( 'gamma.example' );
		jest.advanceTimersByTime( 200 );
		const items = getMenuItems();
		expect( items[ 0 ].style.display ).toBe( 'none' );
		expect( items[ 1 ].style.display ).toBe( 'none' );
		expect( items[ 2 ].style.display ).toBe( '' );
	} );

	test( 'matches example.com across multiple sites', () => {
		fireInput( 'example.com' );
		jest.advanceTimersByTime( 200 );
		const items = getMenuItems();
		expect( items[ 0 ].style.display ).toBe( '' ); // alpha.example.com
		expect( items[ 1 ].style.display ).toBe( 'none' ); // beta.test.org
		expect( items[ 2 ].style.display ).toBe( '' ); // gamma.example.com
	} );
} );

describe( 'addSearch – empty search resets', () => {
	test( 'clearing search shows all items', () => {
		fireInput( 'alpha' );
		jest.advanceTimersByTime( 200 );
		// Verify filter is active
		expect( getMenuItems()[ 1 ].style.display ).toBe( 'none' );

		// Clear search
		fireInput( '' );
		jest.advanceTimersByTime( 200 );
		getMenuItems().forEach( ( item ) => {
			expect( item.style.display ).toBe( '' );
		} );
	} );
} );
