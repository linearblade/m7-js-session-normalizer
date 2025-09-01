# 🌐 Fetch Contract (`fetch` key)

The **`fetch`** configuration defines **how to build a Net-compatible fetch object** for session validation. It does **not** execute the request directly — instead, it returns a descriptor consumed by the engine (`net.http.get` / `net.http.post`).

---

## 🔧 Signature

```js
/**
 * @param {Object} ctx - Context object containing:
 *   { controller: AuthProviderInstance, options: fullAuthOptions }
 * @param {Object} fetchOpts - The fetch config object { sessionUrl, method, fn }
 * @param {Object} cookieValues - Map of cookieName => cookieValue
 * @param {Object} options - Full auth options (legacy passthrough)
 * @returns {{ url: string, method: string, options: Object }} - Net-compatible fetch descriptor
 */
```

---

## 🔑 Fetch Config Shape

```js
fetch: {
  sessionUrl: "/api/auth/me.php",   // endpoint to validate session
  method: "GET",                     // default is POST
  fn: (ctx, fetchOpts, cookieValues, options) => {
    // optional mutator function to build a fetchObject
    return {
      url: fetchOpts.sessionUrl,
      method: fetchOpts.method,
      options: {
        credentials: "include",
        format: "full"
      }
    };
  }
}
```

* **`sessionUrl`**: Validation endpoint.
* **`method`**: HTTP method (defaults to `POST`).
* **`fn`**: Optional builder/mutator function. If defined, receives `(ctx, fetchOpts, cookieValues, options)` and must return a **fetchObject**. If `fn` is not defined, the engine calls `autoGenFetchObject(sessionUrl, method)`【64†source】.

---

## 🔑 FetchObject Shape

* **url**: `string` — Full URL to request.
* **method**: `string` — `GET` or `POST`.
* **options**: `Object` — Net-compatible options object:

  * `credentials`: always "include" (for cookies).
  * `format`: usually "full" to request structured Net response.
  * `headers?`: request headers (e.g., `{ "Content-Type": "application/json" }`).
  * `body?`: request payload for POST; Net handles serialization.

---

## ✅ Example Implementations

**Default JSON POST (autoGen)**

```js
fetch: {
  sessionUrl: "/api/auth/me.php",
  method: "POST"
}
```

**Custom GET with Query Param**

```js
fetch: {
  sessionUrl: "/api/auth/me.php",
  method: "GET",
  fn: (ctx, opts, cookies) => ({
    url: opts.sessionUrl + "?sid=" + cookies.PHPSESSID,
    method: "GET",
    options: { credentials: "include", format: "full" }
  })
}
```

**Form-encoded Body**

```js
fetch: {
  sessionUrl: "/api/auth/me.php",
  method: "POST",
  fn: (ctx, opts, cookies) => ({
    url: opts.sessionUrl,
    method: "POST",
    options: {
      credentials: "include",
      format: "full",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ sid: cookies.PHPSESSID })
    }
  })
}
```

---

## 📦 Engine Behavior

1. Engine collects cookies (`getCookieValues`).
2. If `fetch.fn` exists, it is called to build the fetchObject.
3. If not, `autoGenFetchObject(sessionUrl, method)` is used【64†source】. Note: if `sessionUrl` is null, `autoGenFetchObject` will return `null`. In that case, `request` must be defined.
4. The fetchObject is passed to Net:

   * `net.http.get(url, options)` if `method = GET`
   * `net.http.post(url, data, options)` if `method = POST`
5. If a `request` key is defined, it **overrides** the default Net fetch behavior — but the `fetchObject` will still be passed along (if defined).
6. ⚠️ If `request` is used, you must also define a custom `response`. If the response does not conform to `{ ok: true, body: { session info } }`, then you must shape it and return the session info — or use `user_normalization` to perform the shaping.

---

✅ Use the `fetch` key when you want to control **how** the validation request is built, while still relying on the engine to execute it.
