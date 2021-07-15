document.addEventListener("DOMContentLoaded", () => {

	// Load the sites menu

	const mySitesListRoot = document.querySelector("#wp-admin-bar-my-sites-list");

	const mySitesListRootObserver = new IntersectionObserver((elements) => {

		elements.forEach(element => {
			if (elements[0].isIntersecting) {
				// Handle intersection
				console.table(element, ["Value", "x", "y", "width", "height", "top", "right", "bottom", "left"]);
				const menu = element.target;

				const data = new FormData();
				data.append("action", "all_sites_menu_action"); // wp ajax action, more info at https://developer.wordpress.org/plugins/javascript/enqueuing/#ajax-action
				data.append("nonce", pluginAllSitesMenu.nonce); // set the nonce, added at https://github.com/soderlind/es6-wp-ajax-demo/blob/master/es6-wp-ajax-demo.php#L75

				const url = pluginAllSitesMenu.ajaxurl; // set the ajax url, added at https://github.com/soderlind/es6-wp-ajax-demo/blob/master/es6-wp-ajax-demo.php#L76
				try {
					const response = await fetch(
						url,
						{
							// POST the data to WordPress
							method: "POST",
							credentials: "same-origin",
							body: data,
						},
					);

					const res =  await response.json(); // read the json response from https://github.com/soderlind/es6-wp-ajax-demo/blob/master/es6-wp-ajax-demo.php#L57
					if (res.response === "success") {
						// menu.innerHTML = res.data; // Display the updated value.
						console.log(res);
					} else {
						console.error(res);
					}
				} catch (err) {
					console.error(err);
				}

				mySitesListRootObserver.disconnect();
			}
		});
	}, { threshold: 1 });

		mySitesListRootObserver.observe(mySitesListRoot);


	// observer.observe(menuPop);
	// observer.observe(submenu);
});