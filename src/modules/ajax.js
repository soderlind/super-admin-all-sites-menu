/**
 * Using AJAX, incremental load sites and add them to local storage.
 *
 * @author Per Søderlind
 * @export
 * @param {IndexedDB} db
 */
export async function loadSites(db) {
  const incrementStore = document.querySelector("#load-more-increment");

  const data = new FormData();
  data.append("action", "all_sites_menu_action");
  data.append("nonce", pluginAllSitesMenu.nonce);
  data.append("increment", incrementStore.dataset.increment);

  const url = pluginAllSitesMenu.ajaxurl;
  try {
    const response = await fetch(url, {
      method: "POST",
      credentials: "same-origin",
      body: data,
    });

    const res = await response.json();
    if (res.response === "success") {
      incrementStore.dataset.increment =
        parseInt(incrementStore.dataset.increment) +
        pluginAllSitesMenu.loadincrements;
      db.save(res.data);
      await loadSites(db); // load more.
    }
  } catch (err) {
    console.error(err);
  }
}
