# 📄 Logout Contract (`logout` key)

The **`logout`** configuration defines how a session should be terminated. Like `login`, it is primarily a convenience feature: not required for session validation, but a useful place to centralize logout behavior across environments.

---

## 🔧 Signature

```js
/**
 * @param {Object} ctx - Context object containing:
 *   { controller: SessionProvider, options: fullAuthOptions }
 * @param {Object} args - Optional arguments passed into logout
 * @returns {Promise<boolean|void>} Resolves true on success, false on failure/cancel
 */
```

---

## ⚙️ Behavior

* If `logout` is not defined:

  * Default behavior is to **clear the session immediately** (`this.user = null; this.validated = false`)【136†source】.
* Supported forms:

  * **String shorthand** → redirect URL【136†source】.
  * **Redirect type** → `{ type: "redirect", url: "..." }`【136†source】.
  * **Function type** → `{ type: "fn", fn, args }`. Runs the provided function with `(ctx, {...args, ...credentials})`【136†source】.
* The function can:

  * Call a server logout endpoint
  * Show a confirmation prompt
  * Clear local state (mock/development use)【138†source】
* If the function returns truthy, the engine clears the session automatically【136†source】.

---

## ✅ Example Implementations

**Simple Redirect**

```js
logout: "/logout.html"
```

**Redirect Config Object**

```js
logout: {
  type: "redirect",
  url: "/sso/logout"
}
```

**Server Logout Call (CookieSession Example)**

```js
logout: {
  type: "fn",
  fn: async (ctx, args) => {
    if (window.confirm("Are you sure you want to log out?")) {
      await fetch("/api/auth/logout.php", { method: "POST", credentials: "include" });
      alert("You have been logged out.");
      return true;
    }
    return false;
  }
}
```

**Mock Logout (Development)**

```js
logout: {
  type: "fn",
  fn: async (ctx) => {
    alert("You have been logged out (mock).");
    return true;
  }
}
```

---

## 📦 Engine Flow

1. `logout(args)` calls the configured `logout` handler (if defined)【136†source】.
2. If type = string → redirect.
3. If type = redirect → navigate to provided URL.
4. If type = fn → executes the function with `(ctx, {...args})`.
5. If function returns truthy, `clearSession()` is called to reset `this.user` and `this.validated`【136†source】.
6. If not defined, `clearSession()` is invoked by default.

---

✅ Use the `logout` key to provide a **consistent and centralized logout flow**, whether that means redirecting to an external SSO, hitting a server endpoint, or clearing local mock data.
