/**
 * Using REST, incremental load sites and add them to local storage.
 *
 * @author Per Søderlind
 * @export
 * @param {IndexedDB} db
 */
export async function loadSites(db, offset) {
  const url = pluginAllSitesMenu.restURL;
  const data = JSON.stringify({
    offset: offset,
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: new Headers({
        "X-WP-Nonce": pluginAllSitesMenu.nonce,
        "content-type": "application/json",
      }),
      credentials: "same-origin",
      body: data,
    });

    const res = await response.json();
    if (res.response === "success") {
      offset = offset + pluginAllSitesMenu.loadincrements;
      db.save(res.data);
      await loadSites(db, offset); // load more.
    }
  } catch (err) {
    console.error(err);
  }
}
