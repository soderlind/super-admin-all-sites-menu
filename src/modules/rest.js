/**
 * Using REST, incremental load sites and add them to local storage.
 *
 * @author Per Søderlind
 * @export
 * @param {IndexedDB} db
 */
export async function loadSites(db, increment) {
  const url = pluginAllSitesMenu.restURL;
  const data = JSON.stringify({
    increment: increment,
    // _wpnonce: pluginAllSitesMenu.nonce,
  });
  console.log(url);
  console.log(data);
  try {
    const response = await fetch(url, {
      headers: {
        "X-WP-Nonce": pluginAllSitesMenu.nonce,
        "content-type": "application/json",
      },
      method: "POST",
      credentials: "same-origin",
      body: data,
    });

    const res = await response.json();
    console.log(res);
    if (res.response === "success") {
      increment = increment + pluginAllSitesMenu.loadincrements;
      db.save(res.data);
      await loadSites(db, increment); // load more.
    }
  } catch (err) {
    console.error(err);
  }
}
