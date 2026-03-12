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
	it( 'renders menu HTML with sanitised URLs (fallback submenu)', () => {
		const site = {
			id: 'blog-42',
			admin: 'https://example.com/wp-admin',
			url: 'https://example.com',
			title: 'Test Site',
		};
		const html = siteMenu( site );

		expect( html ).toContain( 'id="wp-admin-bar-blog-42"' );
		expect( html ).toContain( 'href="https://example.com/wp-admin/"' );
		expect( html ).toContain( 'data-url="https://example.com"' );
		expect( html ).toContain( 'Test Site' );
		expect( html ).toContain( 'Dashboard' );
		expect( html ).toContain( 'New Post' );
		expect( html ).toContain( 'Visit' );
	} );

	it( 'escapes string id with special characters', () => {
		const site = {
			id: 'evil<script>',
			admin: 'https://example.com/wp-admin',
			url: 'https://example.com',
			title: 'Site',
		};
		const html = siteMenu( site );

		expect( html ).toContain( 'id="wp-admin-bar-evil&lt;script&gt;"' );
		expect( html ).not.toContain( '<script>' );
	} );

	it( 'sanitises malicious admin URL', () => {
		const site = {
			id: 'blog-1',
			admin: 'javascript:alert(1)',
			url: 'https://example.com',
			title: 'Site',
		};
		const html = siteMenu( site );

		expect( html ).not.toContain( 'javascript:' );
		expect( html ).toContain( 'href="#/"' );
	} );

	it( 'renders dynamic submenu from site.submenu array', () => {
		const site = {
			id: 'blog-7',
			admin: 'https://seven.example.com/wp-admin',
			url: 'https://seven.example.com',
			title: 'Site Seven',
			submenu: [
				{ id: 'd', title: 'Dashboard', href: 'https://seven.example.com/wp-admin' },
				{ id: 'e', title: 'Edit Site', href: 'https://seven.example.com/wp-admin/network/site-info.php?id=7' },
				{ id: 'v', title: 'Visit', href: 'https://seven.example.com/' },
			],
		};
		const html = siteMenu( site );

		expect( html ).toContain( 'id="wp-admin-bar-blog-7"' );
		expect( html ).toContain( 'id="wp-admin-bar-blog-7-d"' );
		expect( html ).toContain( 'id="wp-admin-bar-blog-7-e"' );
		expect( html ).toContain( 'id="wp-admin-bar-blog-7-v"' );
		expect( html ).toContain( 'Edit Site' );
		expect( html ).toContain( 'site-info.php?id=7' );
		// Should NOT contain hardcoded-only items
		expect( html ).not.toContain( 'Manage Comments' );
	} );

	it( 'escapes submenu item title and href', () => {
		const site = {
			id: 'blog-8',
			admin: 'https://example.com/wp-admin',
			url: 'https://example.com',
			title: 'Site Eight',
			submenu: [
				{ id: 'x', title: '<img onerror=alert(1)>', href: 'javascript:void(0)' },
			],
		};
		const html = siteMenu( site );

		expect( html ).not.toContain( '<img' );
		expect( html ).toContain( '&lt;img onerror=alert(1)&gt;' );
		expect( html ).not.toContain( 'javascript:' );
		expect( html ).toContain( 'href="#"' );
	} );

	it( 'falls back to hardcoded submenu when submenu is empty array', () => {
		const site = {
			id: 'blog-9',
			admin: 'https://example.com/wp-admin',
			url: 'https://example.com',
			title: 'Site Nine',
			submenu: [],
		};
		const html = siteMenu( site );

		expect( html ).toContain( 'Dashboard' );
		expect( html ).toContain( 'Visit' );
	} );
} );
