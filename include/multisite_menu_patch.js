jQuery(function ($) {
	const breakpoint_pc = 783;

	// サイトネットワークが1サイトしか存在しない場合
	const sites = $('#wp-admin-bar-my-sites-list li.menupop').length;
	const lineHeight = parseInt($('#wp-admin-bar-my-sites-list').css('line-height'));
	if (sites === 1) {
		$('#wp-admin-bar-my-sites').children('.ab-sub-wrapper').addClass('site_single');
	}

	// 画面幅取得
	let is_pc;
	$(window).on('load resize', function () {
		let width = $(window).width();
		if (width >= breakpoint_pc) {
			is_pc = true;
		} else {
			is_pc = false;
		}
	});

	// サブメニュー展開時のpositionをセット
	// $('#wp-admin-bar-my-sites-list > li.menupop').on('hover', function () {
	$('#wp-admin-bar-my-sites-list > li.menupop').mouseover(function () {

		console.log('lineHeight: ' + lineHeight);

		const top = $(this).offset().top;
		const bottom = window.innerHeight;
		let offsetTop = 6;


		let subMenu = $(this).find('.ab-submenu');
		let subMenuHeight = parseInt((lineHeight * subMenu[0].children.length) / 2) + lineHeight;
		// console.log(top);
		// console.log(offsetTop);
		let diff = (top - offsetTop) + subMenuHeight
		console.log( 'diff:'  + diff );

		if (is_pc === true) {
			if ( diff > window.innerHeight) {
				console.log('bottom: ' + bottom);
				subMenu.offset({ 'top': top - subMenuHeight });
			} else {
				subMenu.offset({ 'top': top - offsetTop });
			}
		}
	})
});