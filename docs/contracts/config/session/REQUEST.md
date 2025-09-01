# 📄 Request Contract (`request` key)

The **`request`** configuration provides a **full override of the fetch pipeline**. Instead of letting the engine build and execute a Net-compatible `fetchObject`, you can define a custom request function that runs end-to-end.

---

## 🔧 Signature

```js
/**
 * @param {Object} ctx - Context object containing:
 *   { controller: CookieSession, options: fullAuthOptions }
 * @param {Object|null} fetchObject - The fetch descriptor built from `fetch` (if defined)
 * @param {Object} cookieValues - Map of cookieName => cookieValue
 * @param {Object} options - The full provider options
 * @returns {Promise<Response>} - A response-like object consumed by the `response` handler
 */
```

---

## ⚙️ Behavior

* **Overrides** the default fetch pipeline completely【114†source】.
* Still receives the `fetchObject` (if defined) for convenience — you can reuse its fields or ignore it【114†source】.
* Must return a **response-like object** that can be interpreted by the `response` function.

  * By default, the engine expects `{ ok: boolean, body: any }`.
  * If your response does not conform to `{ ok: true, body: { session info } }`, you must either:

    * Shape it in the `response` function, or
    * Use `user_normalization` to transform the user payload【114†source】.
* If neither `fetchObject` nor `request` is available, validation fails【114†source】.

---

## ✅ Example Implementations

**Custom XHR Wrapper**

```js
request: async (ctx, fetchObject, cookies, options) => {
  const res = await customXHR(fetchObject.url, {
    method: "POST",
    headers: { "X-Auth": cookies.PHPSESSID },
    withCredentials: true
  });
  return { ok: res.status === 200, body: await res.json() };
}
```

**GraphQL Request**

```js
request: async (ctx, fetchObject, cookies) => {
  const res = await fetch("/graphql", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "{ me { id name roles } }" })
  });
  return { ok: res.ok, body: await res.json() };
}
```

**WebSocket Request**

```js
request: async (ctx, fetchObject, cookies, options) => {
  return new Promise((resolve) => {
    mySocket.emit("validate", { sid: cookies.PHPSESSID }, (response) => {
      resolve({ ok: response.success, body: response });
    });
  });
}
```

---

## 📦 Engine Flow

1. Engine gathers cookies (`getCookieValues`).
2. If `request` is defined, it is called instead of the standard fetch pipeline【114†source】.
3. The returned response is passed into the `response` function (if defined)【114†source】.
4. The shaped result determines `this.user` and `this.validated`.

---

✅ Use the `request` key when you need **total control** over how validation is performed (e.g., non-HTTP transport, special headers, GraphQL, WebSockets).
