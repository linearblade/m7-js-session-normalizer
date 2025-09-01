# 📄 Provider API Contract

This document defines the **runtime API methods** exposed by session providers.
All providers extend from `SessionProvider` and implement a common set of methods. These methods operate at runtime and consume the configuration objects defined under `contracts/config/`.

---

## Core Methods

### `async getSession()`

* **Purpose**: Retrieve the current session. Must be implemented by each provider (e.g., CookieSession, MockSession).
* **Returns**:

  * A normalized user object, or `null` if no valid session.
* **Notes**:

  * The base class throws an error by default; subclasses must override.

---

### `getUser()`

* **Purpose**: Return the current normalized user object.
* **Behavior**:

  * If a session has already been retrieved, returns the stored session.
  * If no session exists, returns `default_user` if defined, otherwise `null`.
  * If `normalize_user` is defined in config, it will be applied to the stored user before returning.
* **Returns**:

  * Normalized user object, `default_user`, or `null`.

---

### `isLoggedIn()`

* **Purpose**: Quick check for session validity.
* **Returns**:

  * `true` if `this.validated` is true, otherwise `false`.

---

### `async login(credentials = {})`

* **Purpose**: Perform a login action according to the provider’s config.
* **Parameters**:

  * `credentials` (`object`) → Optional login data (username/password, token, etc.).
* **Behavior**:

  * If `login` config is a **string** → redirect to URL.
  * If `login.type === "redirect"` → redirect to `login.url`.
  * If `login.type === "fn"` → executes configured function `(ctx, args)` where `ctx = { controller, options }`. Must return a user object or Promise.
  * Throws if no `login` config is defined or if the function cannot be resolved.

---

### `async logout(args = {})`

* **Purpose**: Perform a logout action according to the provider’s config.
* **Parameters**:

  * `args` (`object`) → Optional arguments to pass to the logout function.
* **Behavior**:

  * If `logout.type === "fn"` → executes configured function `(ctx, args)`. If it resolves truthy, `clearSession()` is called.
  * Otherwise clears the session immediately.
  * If `logout` config is a **string** → redirect to URL.
  * If `logout.type === "redirect"` → redirect to `logout.url`.

---

### `clearSession()`

* **Purpose**: Reset local session state.
* **Behavior**:

  * Sets `this.user = null` and `this.validated = false`.
* **Usage**:

  * Called internally by `logout()` when appropriate, and may also be invoked directly in custom handlers via `ctx.controller.clearSession()`.

---

## Optional / Extension Methods

### `async getAuthHeaders()`

* **Purpose**: Return auth-related headers for API requests (e.g., `{ Authorization: "Bearer ..." }`).
* **Notes**:

  * Stubbed in the base class; may be overridden in subclasses (e.g., JWT/OAuth providers).

---

### `getFunction(value)`

* **Purpose**: Utility to resolve a function reference.
* **Behavior**:

  * If `value` is a function → returns it.
  * If `value` is a string and matches a function on `window` → returns that function.
  * Otherwise returns `null`.
* **Usage**:

  * Used internally by `login()` and `logout()` to resolve functions from config.

---

## Context Object (`ctx`)

Functions defined in config (`login.fn`, `logout.fn`, etc.) receive a `ctx` argument:

```js
ctx = {
  controller: this,      // reference to the provider instance
  options: this.options  // resolved config options for this provider
}
```

This ensures config functions always have access to both runtime state and config.
