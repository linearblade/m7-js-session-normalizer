# 📄 Response Contract (`response` key)

The **`response`** configuration defines how to interpret the result of a session validation request. It runs **after** `fetch` or `request` completes, and is responsible for shaping the returned data into a valid user object or validation flag.

---

## 🔧 Signature

```js
/**
 * @param {Object} ctx - Context object containing:
 *   { controller: CookieSession, options: fullAuthOptions }
 * @param {Object} res - The response object returned from Net or custom request
 * @param {Object} cookieValues - Map of cookieName => cookieValue
 * @param {Object} options - The full provider options
 * @returns {boolean | object | Promise<boolean|object>}
 *   - false → validation failed
 *   - true → validation succeeded, but no user object
 *   - object → treated as the user object
 */
```

---

## ⚙️ Behavior

* Called after `handleServerValidation` receives a response【114†source】.
* If not defined, defaults to:

  * `if (res.ok) this.user = res.body; else return false;`【114†source】.
* If defined, you can:

  * Return `false` → validation fails.
  * Return `true` → validation succeeds, but user remains `null`.
  * Return an `object` → becomes the `this.user` payload.
* Errors thrown inside `response` are caught; engine falls back to `false` (safer default)【114†source】.
* Common use: shape server responses that don’t conform to `{ ok: true, body: { session info } }`【113†source】.

---

## ✅ Example Implementations

**Default Shape (PHP Example)**

```js
response: async (ctx, res) => {
  if (!res.ok) return false;
  if (!res.body.ok) return false;
  return res.body.user; // Net returns parsed JSON body
}
```

**Boolean Result Only**

```js
response: async (ctx, res) => res.ok
```

**GraphQL Response Shaping**

```js
response: async (ctx, res) => {
  if (!res.ok || !res.body.data?.me) return false;
  return res.body.data.me;
}
```

**Custom Error Handling**

```js
response: async (ctx, res) => {
  try {
    if (res.status === 401) return false;
    return res.body.session;
  } catch (err) {
    console.error("response parse error", err);
    return false;
  }
}
```

---

## 📦 Engine Flow

1. `fetch` or `request` produces a `res` object.
2. If `response` is defined, it is awaited and interpreted【114†source】.
3. The return value sets `this.user` and `this.validated`.
4. If no `response` is provided, fallback logic sets `this.user = res.body` if `res.ok`.

---

✅ Use the `response` key to **adapt arbitrary server responses** into the session contract. It ensures flexibility for different backends (REST, PHP, GraphQL, etc.) while keeping the engine’s core validation flow consistent.
