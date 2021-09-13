/**
 *A dd search filter for the sites menu.
 *
 * @author Per Søderlind
 * @export
 */
export function addSearch() {
	const search = document.querySelector("#all-sites-search-text");
	search.addEventListener("keyup", (e) => {
		e.preventDefault();
		const filter = e.target.value.toUpperCase();
		const ul = document.querySelector("#wp-admin-bar-my-sites-list");
		const li = ul.getElementsByClassName("menupop");
		for (let i = 0; i < li.length; i++) {
			let a = li[i].querySelector(".ab-item");
			let txtValue = a.textContent || a.innerText;
			if (txtValue.toUpperCase().indexOf(filter) > -1) {
				li[i].style.display = "";
			} else {
				li[i].style.display = "none";
			}
		}
	});
}
