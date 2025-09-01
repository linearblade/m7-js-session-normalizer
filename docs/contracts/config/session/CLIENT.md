# 🔑 Cookie Provider — `client` Key

The `client` configuration defines **local cookie-level validation** rules that run **before any server request** is made. This ensures obvious problems (e.g., missing cookies, malformed values) are caught early.

---

## 📦 Structure

```js
client: {
  cookies: ["PHPSESSID", "SESSION"],   // string or array of required cookie names
  validation: (ctx, cookieValues) => {   // optional validation function
    // return true | false | Promise<boolean>
  }
}
```

---

## 🔧 Behavior

* **`cookies`**

  * Accepts a string or array of cookie names.
  * `cookiesPresent()` in `CookieSession.js` checks these against `document.cookie`.
  * If any required cookie is missing, validation fails immediately【64†source】.

* **`validation`**

  * An optional function `(ctx, cookieValues)` that performs custom logic.
  * Context includes `{ controller, options }`.
  * If not provided, defaults to `true` (all cookies accepted)【64†source】.
  * If provided, the engine will:

    * Return `false` → stop login immediately.
    * Return `true` → continue to server validation.
    * Return a `Promise<boolean>` → awaited before proceeding【63†source】.

---

## ⚙️ Engine Flow (from `CookieSession.js`)

1. Collect all cookies via `getCookieValues()` → `{ name: value }` map【64†source】.
2. Run `cookiesPresent(cookieValues)` against `client.cookies` (if defined).
3. Run `clientValidation(cookieValues)` using `client.validation` (if defined).
4. Only if both steps pass does the session attempt server validation.

---

## ✅ Example Configurations

**Basic Required Cookie**

```js
client: {
  cookies: "PHPSESSID"
}
```

**Regex Validation**

```js
client: {
  cookies: "PHPSESSID",
  validation: (ctx, cookies) => /^[a-f0-9]{32}$/.test(cookies.PHPSESSID ?? "")
}
```

**JWT Signature Check**

```js
client: {
  cookies: ["JWT"],
  validation: async (ctx, cookies) => verifyJWTSignature(cookies.JWT, ctx.options.publicKey)
}
```

---

## 📝 Notes

* If `client` is not defined, the step is skipped (cookies treated as valid).
* This step never makes a network call — it only inspects `document.cookie` and optionally runs custom code.
* Best used for quick rejection of invalid sessions before hitting the server.
