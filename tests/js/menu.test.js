import { escapeAttr, sanitizeUrl, siteMenu } from '../../src/modules/menu';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str ) => str,
} ) );

describe( 'escapeAttr', () => {
	it( 'escapes ampersands, quotes, angle brackets', () => {
		expect( escapeAttr( 'a&b"c<d>e' ) ).toBe( 'a&amp;b&quot;c&lt;d&gt;e' );
	} );

	it( 'converts non-string input to string', () => {
		expect( escapeAttr( 123 ) ).toBe( '123' );
		expect( escapeAttr( null ) ).toBe( 'null' );
	} );

	it( 'returns empty string unchanged', () => {
		expect( escapeAttr( '' ) ).toBe( '' );
	} );
} );

describe( 'sanitizeUrl', () => {
	it( 'allows http URLs', () => {
		expect( sanitizeUrl( 'http://example.com/wp-admin' ) ).toBe(
			'http://example.com/wp-admin'
		);
	} );

	it( 'allows https URLs', () => {
		expect( sanitizeUrl( 'https://example.com/' ) ).toBe(
			'https://example.com/'
		);
	} );

	it( 'escapes special characters in valid URLs', () => {
		expect( sanitizeUrl( 'https://example.com/?a=1&b=2' ) ).toBe(
			'https://example.com/?a=1&amp;b=2'
		);
	} );

	it( 'rejects javascript: protocol', () => {
		expect( sanitizeUrl( 'javascript:alert(1)' ) ).toBe( '#' );
	} );

	it( 'rejects data: protocol', () => {
		expect( sanitizeUrl( 'data:text/html,<h1>hi</h1>' ) ).toBe( '#' );
	} );

	it( 'returns # for invalid URLs', () => {
		expect( sanitizeUrl( 'not a url' ) ).toBe( '#' );
	} );

	it( 'returns # for empty string', () => {
		expect( sanitizeUrl( '' ) ).toBe( '#' );
	} );
} );

describe( 'siteMenu', () => {
	it( 'renders menu HTML with sanitised URLs', () => {
		const site = {
			id: 42,
			admin: 'https://example.com/wp-admin',
			url: 'https://example.com',
			title: 'Test Site',
		};
		const html = siteMenu( site );

		expect( html ).toContain( 'id="wp-admin-bar-42"' );
		expect( html ).toContain( 'href="https://example.com/wp-admin/"' );
		expect( html ).toContain( 'href="https://example.com//"' );
		expect( html ).toContain( 'Test Site' );
		expect( html ).toContain( 'Dashboard' );
		expect( html ).toContain( 'New Post' );
		expect( html ).toContain( 'Visit' );
	} );

	it( 'falls back to id 0 for non-numeric id', () => {
		const site = {
			id: 'evil<script>',
			admin: 'https://example.com/wp-admin',
			url: 'https://example.com',
			title: 'Site',
		};
		const html = siteMenu( site );

		expect( html ).toContain( 'id="wp-admin-bar-0"' );
		expect( html ).not.toContain( 'evil' );
	} );

	it( 'sanitises malicious admin URL', () => {
		const site = {
			id: 1,
			admin: 'javascript:alert(1)',
			url: 'https://example.com',
			title: 'Site',
		};
		const html = siteMenu( site );

		expect( html ).not.toContain( 'javascript:' );
		expect( html ).toContain( 'href="#/"' );
	} );
} );
