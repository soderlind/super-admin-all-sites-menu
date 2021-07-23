// https://codepen.io/aligoren/pen/wRYpQy

class LazyLoadSites {
	constructor() {
		this.loadmore = document.querySelector(".load-more > .ab-empty-item")
		this.sitesContainer = document.querySelector('.load-more')
		this.BASE_URL = 'https://picsum.photos/list'
	}

	load() {
		fetch(this.BASE_URL)
			.then(resp => resp.json())
			.then(obj => {
				var start = 1
				if ('index' in this.loadmore.dataset === true) {
					// let start = (this.loadmore.dataset.index == 0) ? parseInt(this.loadmore.dataset.index) : parseInt(this.loadmore.dataset.index) + 1
					start = parseInt(this.loadmore.dataset.index) + 1
				}
				console.log(start)
				let end = start + 5
				let arr = obj.slice(start, end)
				if (arr.length > 0) {
					let sites = '';
					arr.forEach(f => {
						sites += `
						<li id="wp-admin-bar-blog-${f.id}" class="menupop">
						<a class="ab-item" aria-haspopup="true" href="http://superadminmenu.local/site-115/wp-admin"><span class="wp-admin-bar-arrow" aria-hidden="true"></span>
							<div class="blavatar"></div>Test Site 115
						</a>
						<div class="ab-sub-wrapper">
							<ul id="wp-admin-bar-blog-${f.id}-default" class="ab-submenu">
								<li id="wp-admin-bar-blog-${f.id}-d"><a class="ab-item"
										href="http://superadminmenu.local/site-115/wp-admin">Dashboard</a></li>
								<li id="wp-admin-bar-blog-${f.id}-n"><a class="ab-item"
										href="http://superadminmenu.local/site-115/wp-admin/post-new.php">New Post</a></li>
								<li id="wp-admin-bar-blog-${f.id}-o"><a class="ab-item"
										href="http://superadminmenu.local/site-115/wp-admin/post-new.php?post_type=page">New Page</a></li>
								<li id="wp-admin-bar-blog-${f.id}-c"><a class="ab-item"
										href="http://superadminmenu.local/site-115/wp-admin/edit-comments.php">Manage Comments</a></li>
								<li id="wp-admin-bar-blog-${f.id}-u"><a class="ab-item"
										href="http://superadminmenu.local/site-115/wp-admin/users.php">Users</a></li>
								<li id="wp-admin-bar-blog-${f.id}-p"><a class="ab-item"
										href="http://superadminmenu.local/site-115/wp-admin/plugins.php">Plugins</a></li>
								<li id="wp-admin-bar-blog-${f.id}-s"><a class="ab-item"
										href="http://superadminmenu.local/site-115/wp-admin/options-general.php">Settings</a></li>
							</ul>
						</div>
					</li>
					`
					})
					console.log('sites')
					this.sitesContainer.insertAdjacentHTML('beforeBegin', sites)
					this.loadmore.dataset.index = end
				}
			})
	}

	init() {
		const container = document.querySelector("#wp-admin-bar-load-more")
		console.log(container)
		let observer = new IntersectionObserver(entries => {
			entries.forEach(entry => {
				const { isIntersecting } = entry

				if (isIntersecting) {
					this.load()
					//container.children[0].click()
					//observer = observer.disconnect()
				}
			}, {
				root: container
			})
		})

		observer.observe(container)
	}
}


document.addEventListener(
	"DOMContentLoaded",
	() => {
		const lazyLoadsites = new LazyLoadSites()
		lazyLoadsites.init()
	}
)