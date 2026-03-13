# Switch-Free Alternatives to `switch_to_blog()` in WordPress Multisite

> Research for a WordPress core contribution.
> Based on WordPress 7 Beta 5 source code (`wp-includes/`).

---

## Why `switch_to_blog()` Is Expensive

`switch_to_blog( $id )` mutates five globals and, on the fallback object-cache implementation,
**wipes the entire object cache** (`wp_cache_init()` is called inside `wp_cache_switch_to_blog_fallback()`):

| Global mutated | What changes |
|---|---|
| `$wpdb->blogid` / `$wpdb->prefix` | Table prefix rewritten (e.g. `wp_` → `wp_3_`) |
| `$wpdb->options`, `$wpdb->posts`, … | All per-blog table properties rewritten |
| `$GLOBALS['table_prefix']` | Mirrors the new prefix |
| `$GLOBALS['blog_id']` | Set to new blog ID |
| `$GLOBALS['_wp_switched_stack']` | Previous ID pushed |
| `$GLOBALS['switched']` | Set to `true` |
| `$wp_object_cache` | Full cache wipe on fallback |

This is the "reload" cost. `restore_current_blog()` is equally expensive, so every
`switch_to_blog` / `restore_current_blog` pair is two full global-state mutations.

---

## Part 1: Existing Switch-Free Public APIs (use today)

### 1.1 Site structural data — `get_site()` / `get_sites()`

Available since **4.6.0**. Returns a `WP_Site` object populated from the `wp_blogs` row.
Cache-first, zero context switch.

```php
$site = get_site( $site_id );           // WP_Site object
echo $site->domain;                     // e.g. example.com
echo $site->path;                       // e.g. /subsite/
echo $site->public;                     // 1 or 0
echo $site->registered;                 // datetime string

// Status flags
$site->deleted;   // '1' = deleted
$site->archived;  // '1' = archived
$site->spam;      // '1' = spam
$site->mature;    // '1' = mature

// Batch query
$sites = get_sites([
    'network_id' => get_current_network_id(),
    'public'     => 1,
    'fields'     => 'ids',   // return IDs only — lightest possible
]);
```

### 1.2 Custom per-site plugin data — Site Meta API

Available since **5.1.0**. Stores arbitrary key/value pairs in `wp_blogmeta`.
No switch. No options table involved.

```php
// Read
$val = get_site_meta( $site_id, 'my_plugin_setting', true );

// Write
update_site_meta( $site_id, 'my_plugin_setting', $new_value );
add_site_meta( $site_id, 'my_plugin_setting', $value );
delete_site_meta( $site_id, 'my_plugin_setting' );

// Before (switch required):
switch_to_blog( $site_id );
$val = get_option( 'my_plugin_setting' );
restore_current_blog();

// After (zero globals touched):
$val = get_site_meta( $site_id, 'my_plugin_setting', true );
```

**Best migration target** for plugin-owned options that don't need to live in `wp_N_options`.

### 1.3 Network-level options — `get_network_option()`

Available since **4.4.0**. Queries `wp_sitemeta`. Accepts an explicit `$network_id`.

```php
$val = get_network_option( get_current_network_id(), 'admin_email' );
update_network_option( get_current_network_id(), 'admin_email', 'new@example.com' );
```

> **Note:** `get_site_option()` is just a wrapper for `get_network_option( null, ... )`.
> It queries `wp_sitemeta`, **not** a per-blog options table. A common source of confusion.

### 1.4 WP_Site_Query / WP_Network_Query

Both available since **4.6.0**. Pure DB queries, no switch.

```php
$query = new WP_Site_Query([
    'network_id' => 1,
    'number'     => 20,
    'meta_query' => [
        ['key' => 'my_flag', 'value' => '1'],
    ],
]);
$sites = $query->get_sites(); // WP_Site[]
```

---

## Part 2: The Structural Gap — Core Options Without a Switch

`get_blog_option( $id, $option )` (and its `add_`, `update_`, `delete_` siblings) all call
`switch_to_blog()` internally when `$id !== get_current_blog_id()`. This covers the
"interesting" per-site options: `blogname`, `siteurl`, `home`, `template`, `stylesheet`, etc.

### Why they switch today

`get_option()` has no `$blog_id` / table parameter — it always reads `$wpdb->options`, which
`switch_to_blog()` re-points at the right table. The dependency chain is:

```
get_blog_option($id, $opt)
  └─ switch_to_blog($id)          ← mutates $wpdb->options
       └─ get_option($opt)        ← reads $wpdb->options (now pointing at wp_3_options)
  └─ restore_current_blog()       ← mutates $wpdb->options back
```

---

## Part 3: The Key Insight — `$wpdb->get_blog_prefix()` Is Pure

`wpdb::get_blog_prefix( $blog_id = null )` **accepts an explicit blog ID** and returns the
correct table prefix **without touching any global state**:

```php
// From class-wpdb.php:
public function get_blog_prefix( $blog_id = null ) {
    if ( is_multisite() ) {
        if ( null === $blog_id ) {
            $blog_id = $this->blogid;
        }
        $blog_id = (int) $blog_id;
        if ( defined( 'MULTISITE' ) && ( 0 === $blog_id || 1 === $blog_id ) ) {
            return $this->base_prefix;          // "wp_"
        } else {
            return $this->base_prefix . $blog_id . '_'; // "wp_3_"
        }
    }
    return $this->base_prefix;
}
```

This is a **pure computation** — no side-effects, no globals written.

Core itself already uses this pattern for non-options tables (e.g. `ms-functions.php:2003`):
```php
$prefix      = $wpdb->get_blog_prefix( $blog->userblog_id );
$recent_post = $wpdb->get_row( $wpdb->prepare(
    "SELECT ID, post_date_gmt FROM {$prefix}posts WHERE post_author = %d ...",
    $user_id
), ARRAY_A );
```

The only reason `{prefix}options` is never queried this way is that `get_option()` has no
table parameter — not because direct queries are prohibited.

---

## Part 4: Proposed Core Changes for the Patch

### 4.1 New internal helper: `_get_option_from_blog( $blog_id, $option, $default )`

A non-switching alternative to read a single option from any site's options table.
Should handle object-cache correctly (same cache key/group logic as `get_option()`).

```php
/**
 * Retrieves an option value for a specific site without switching blog context.
 *
 * Uses the object cache (same 'options'/'notoptions' groups as get_option()),
 * falling back to a direct DB query with the site's table prefix.
 *
 * @since 7.x.0
 * @access private
 *
 * @param int    $blog_id  Site ID.
 * @param string $option   Option name.
 * @param mixed  $default  Default value if option not found.
 * @return mixed Option value or $default.
 */
function _get_option_from_blog( int $blog_id, string $option, mixed $default = false ): mixed {
    global $wpdb;

    $blog_id = (int) $blog_id;

    // Fast path: current blog — use standard get_option().
    if ( get_current_blog_id() === $blog_id ) {
        return get_option( $option, $default );
    }

    // Check object cache (same cache group strategy as get_option()).
    $alloptions_cache = wp_cache_get( $blog_id, 'blog-alloptions' );
    if ( is_array( $alloptions_cache ) && array_key_exists( $option, $alloptions_cache ) ) {
        return $alloptions_cache[ $option ] ?? $default;
    }

    $notoptions = wp_cache_get( $blog_id, 'blog-notoptions' );
    if ( is_array( $notoptions ) && isset( $notoptions[ $option ] ) ) {
        return $default;
    }

    // Direct DB query using get_blog_prefix() — no switch.
    $table = $wpdb->get_blog_prefix( $blog_id ) . 'options';
    $row   = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT option_value, autoload FROM `{$table}` WHERE option_name = %s LIMIT 1",
            $option
        )
    );

    if ( null === $row ) {
        // Mark as not-found in cache.
        $notoptions           = is_array( $notoptions ) ? $notoptions : [];
        $notoptions[ $option ] = true;
        wp_cache_set( $blog_id, $notoptions, 'blog-notoptions' );
        return $default;
    }

    $value = maybe_unserialize( $row->option_value );

    return apply_filters( "blog_option_{$option}", $value, $blog_id );
}
```

### 4.2 Refactor `get_blog_option()` to use the helper

```php
// BEFORE (ms-blogs.php):
function get_blog_option( $id, $option, $default_value = false ) {
    $id = (int) $id;
    if ( empty( $id ) ) { $id = get_current_blog_id(); }

    if ( get_current_blog_id() === $id ) {
        return get_option( $option, $default_value );
    }

    switch_to_blog( $id );
    $value = get_option( $option, $default_value );
    restore_current_blog();

    return apply_filters( "blog_option_{$option}", $value, $id );
}

// AFTER:
function get_blog_option( $id, $option, $default_value = false ) {
    $id = (int) $id;
    if ( empty( $id ) ) { $id = get_current_blog_id(); }

    return _get_option_from_blog( $id, $option, $default_value );
}
```

### 4.3 Refactor `add_blog_option()`, `update_blog_option()`, `delete_blog_option()`

Same pattern: replace `switch_to_blog` + `add/update/delete_option` + `restore_current_blog`
with a direct `$wpdb->insert/update/delete` against the explicit table name:

```php
// update_blog_option() — AFTER:
function update_blog_option( $id, $option, $value, $deprecated = null ) {
    global $wpdb;
    $id = (int) $id;

    if ( null !== $deprecated ) {
        _deprecated_argument( __FUNCTION__, '3.1.0' );
    }

    if ( get_current_blog_id() === $id ) {
        return update_option( $option, $value );
    }

    $table  = $wpdb->get_blog_prefix( $id ) . 'options';
    $exists = $wpdb->get_var(
        $wpdb->prepare(
            "SELECT COUNT(*) FROM `{$table}` WHERE option_name = %s",
            $option
        )
    );

    $serialized = maybe_serialize( $value );

    if ( $exists ) {
        $result = $wpdb->update(
            $table,
            [ 'option_value' => $serialized ],
            [ 'option_name'  => $option ],
            [ '%s' ],
            [ '%s' ]
        );
    } else {
        $result = $wpdb->insert(
            $table,
            [ 'option_name' => $option, 'option_value' => $serialized, 'autoload' => 'yes' ],
            [ '%s', '%s', '%s' ]
        );
    }

    // Bust per-blog option caches.
    wp_cache_delete( $id, 'blog-alloptions' );
    wp_cache_delete( $id, 'blog-notoptions' );

    return false !== $result;
}
```

### 4.4 Refactor `WP_Site::get_details()`

`WP_Site::get_details()` (private, `class-wp-site.php:319`) fetches `blogname`, `siteurl`,
`post_count`, and `home` via `switch_to_blog`. Replace with four direct calls to
`_get_option_from_blog()`:

```php
// AFTER:
private function get_details() {
    $details = wp_cache_get( $this->blog_id, 'site-details' );

    if ( false === $details ) {
        $id      = (int) $this->blog_id;
        $details = new stdClass();
        foreach ( get_object_vars( $this ) as $key => $value ) {
            $details->$key = $value;
        }
        $details->blogname   = _get_option_from_blog( $id, 'blogname' );
        $details->siteurl    = _get_option_from_blog( $id, 'siteurl' );
        $details->post_count = _get_option_from_blog( $id, 'post_count', 0 );
        $details->home       = _get_option_from_blog( $id, 'home' );

        wp_cache_set( $this->blog_id, $details, 'site-details' );
    }

    $details = apply_filters_deprecated( 'blog_details', [ $details ], '4.7.0', 'site_details' );
    $details = apply_filters( 'site_details', $details );

    return $details;
}
```

### 4.5 Refactor `get_blog_post()`

`get_blog_post()` in `ms-functions.php:140` fetches a single post via `switch_to_blog`.
Replace with a direct `$wpdb->get_row()`:

```php
// AFTER:
function get_blog_post( $blog_id, $post_id ) {
    global $wpdb;

    $blog_id = (int) $blog_id;
    $post_id = (int) $post_id;

    if ( get_current_blog_id() === $blog_id ) {
        return get_post( $post_id );
    }

    $table = $wpdb->get_blog_prefix( $blog_id ) . 'posts';
    $post  = $wpdb->get_row(
        $wpdb->prepare( "SELECT * FROM `{$table}` WHERE ID = %d LIMIT 1", $post_id )
    );

    if ( ! $post ) {
        return null;
    }

    // Sanitize to match get_post() return type.
    return sanitize_post( new WP_Post( $post ), 'raw' );
}
```

---

## Part 5: Object-Cache Considerations

When adding `_get_option_from_blog()`, the cache key strategy must be:

- **Cache group:** `blog-options-{$blog_id}` or separate per-ID groups (e.g. `'options'` keyed
  under the blog's object-cache bucket — depends on the cache drop-in implementation)
- **Cache busting on write:** `add_blog_option`, `update_blog_option`, `delete_blog_option`
  must invalidate the same keys
- **alloptions cache:** `switch_to_blog` causes `wp_load_alloptions()` to run, which pre-warms
  all autoloaded options in one query. A non-switching helper should replicate this
  lazily — on first access for a given blog_id, fetch all autoloaded options in one query
  and cache them in `'blog-alloptions'`.

---

## Part 6: Functions Still Requiring `switch_to_blog()` After This Patch

These functions have deeper coupling to the switched context and are out of scope for an
initial patch:

| Function | Reason |
|---|---|
| `wp_initialize_site()` | Runs dozens of core operations on a new site's tables |
| `wp_uninitialize_site()` | Drops tables, clears all site data |
| Third-party plugin code using `switch_to_blog()` directly | Cannot be fixed in core |

---

## Summary of Proposed API Changes

| File | Change |
|---|---|
| `wp-includes/ms-blogs.php` | Add `_get_option_from_blog()` private helper |
| `wp-includes/ms-blogs.php` | Refactor `get_blog_option()` to use helper |
| `wp-includes/ms-blogs.php` | Refactor `update_blog_option()` to use direct `$wpdb` query |
| `wp-includes/ms-blogs.php` | Refactor `add_blog_option()` to use direct `$wpdb->insert` |
| `wp-includes/ms-blogs.php` | Refactor `delete_blog_option()` to use direct `$wpdb->delete` |
| `wp-includes/class-wp-site.php` | Refactor `WP_Site::get_details()` to use `_get_option_from_blog()` |
| `wp-includes/ms-functions.php` | Refactor `get_blog_post()` to use direct `$wpdb` query |

All changes exploit `$wpdb->get_blog_prefix( $blog_id )`, which is already public,
purpose-built, and side-effect-free.

---

## Quick Reference: What to Use Today

```php
// ✅ Structural site data (domain, path, status)
$site = get_site( $site_id );

// ✅ Batch site queries
$sites = get_sites([ 'network_id' => 1, 'fields' => 'ids' ]);

// ✅ Custom plugin data per-site (store here instead of get_option)
$val = get_site_meta( $site_id, 'my_plugin_key', true );
update_site_meta( $site_id, 'my_plugin_key', $val );

// ✅ Network-wide options
$val = get_network_option( get_current_network_id(), 'option_name' );

// ✅ blogname/siteurl/home (cached after first call — switch only fires once per request)
$name = get_blog_details( $site_id )->blogname;

// ⚠️ Core options for other sites — still uses switch today, target of this patch
$val = get_blog_option( $site_id, 'blogname' );
```
