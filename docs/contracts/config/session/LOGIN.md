# 📄 Login Contract (`login` key)

The **`login`** configuration is an **optional convenience feature**. It allows session providers to define how a login should be initiated, making the session system a one-stop shop for both validation and user entry points. In production systems, login may be handled elsewhere — but for development, mocking, or simple apps, it can be integrated here. It's also a perfectly good place to keep your auth-related code organized — login/logout code has to live somewhere — it's just not strictly **necessary** for session management.

---

## 🔧 Signature

```js
/**
 * @param {Object} ctx - Context object containing:
 *   { controller: SessionProvider, options: fullAuthOptions }
 * @param {Object} args - Arguments or credentials passed to login
 * @returns {Promise<User|void>} Resolves with user object if successful
 */
```

---

## ⚙️ Behavior

* If `login` is **not defined**, calling `login()` will throw an error【136†source】.
* Supported forms:

  * **String shorthand** → treated as a redirect URL【136†source】.
  * **Redirect type** → `{ type: "redirect", url: "..." }`【136†source】.
  * **Function type** → `{ type: "fn", fn, args }`. Runs the provided function with `(ctx, {...args, ...credentials})`【136†source】.
* The function can:

  * Open a popup window
  * Redirect to an external login page
  * Display a local panel (SPA-style)
  * Mock user login for development【138†source】
* Convenience only — not required for session validation.

---

## ✅ Example Implementations

**Redirect to External Login**

```js
login: "/login.html"
```

**Redirect Config Object**

```js
login: {
  type: "redirect",
  url: "/sso/start"
}
```

**Popup Function (CookieSession Example)**

```js
login: {
  type: "fn",
  fn: (ctx, args) => new Promise((resolve, reject) => {
    const popup = window.open(args?.url ?? "/login.html", "LoginPopup", "width=500,height=600");
    if (!popup) return reject(new Error("Popup blocked"));

    const handler = (event) => {
      if (!event.data || event.data.type !== "loginSuccess") return;
      window.removeEventListener("message", handler);
      popup.close();
      ctx.controller.user = event.data.user;
      ctx.controller.validated = true;
      resolve(event.data.user);
    };

    window.addEventListener("message", handler);
  }),
  args: { url: "/login.html" }
}
```

**Mock Login (Development)**

```js
login: {
  type: "fn",
  fn: (ctx, args) => {
    ctx.controller.user = { id: args.id ?? "mock", name: args.name ?? "Mock User" };
    ctx.controller.validated = true;
    return ctx.controller.user;
  }
}
```

---

## 📦 Engine Flow

1. `login(credentials)` calls the `login` config defined in options【136†source】.
2. If type = string → redirect.
3. If type = redirect → redirect to specified URL.
4. If type = fn → executes the function, merges `args` and `credentials`, and awaits the result.
5. If successful, sets `this.user` and `this.validated = true`.

---

✅ Use the `login` key for **developer convenience, mocking, or integrated flows**. In production, you may choose to leave it undefined and handle login elsewhere.
