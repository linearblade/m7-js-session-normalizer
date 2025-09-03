# 📄 Signup Contract (`signup` key)

The **`signup`** configuration is an **optional convenience feature**, similar in design to the [`login`](LOGIN.md) key. It provides a consistent place to define how new user registration should be initiated. While not required for session validation, it is useful for development, mocking environments, or projects that want a single configuration for all auth-related flows.

---

## 🔧 Signature

```js
/**
 * @param {Object} ctx - Context object containing:
 *   { controller: SessionProvider, options: fullAuthOptions }
 * @param {Object} args - Arguments passed to signup (e.g., form fields)
 * @returns {Promise<User|void>} Resolves with a user object if registration also authenticates
 */
```

---

## ⚙️ Behavior

* If `signup` is not defined, the engine does nothing when `signup()` is called.
* Supported forms (mirroring `login`):

  * **String shorthand** → treated as a redirect URL.
  * **Redirect type** → `{ type: "redirect", url: "..." }`.
  * **Function type** → `{ type: "fn", fn, args }`. Runs the provided function with `(ctx, {...args, ...credentials})`.
* The function can:

  * Open a popup to a registration form.
  * Redirect to a signup page.
  * Show an inline SPA signup panel.
  * Mock new user creation in development.
* If signup also establishes a session, the function should set `ctx.controller.user` and `ctx.controller.validated = true`.

---

## ✅ Example Implementations

**Redirect to Registration Page**

```js
signup: "/signup.html"
```

**Popup Signup (similar to login)**

```js
signup: {
  type: "fn",
  fn: (ctx, args) => new Promise((resolve, reject) => {
    const popup = window.open(args?.url ?? "/signup.html", "SignupPopup", "width=500,height=600");
    if (!popup) return reject(new Error("Popup blocked"));

    const handler = (event) => {
      if (!event.data || event.data.type !== "signupSuccess") return;
      window.removeEventListener("message", handler);
      popup.close();
      ctx.controller.user = event.data.user;
      ctx.controller.validated = true;
      resolve(event.data.user);
    };

    window.addEventListener("message", handler);
  }),
  args: { url: "/signup.html" }
}
```

**Mock Signup (Development)**

```js
signup: {
  type: "fn",
  fn: async (ctx, args) => {
    ctx.controller.user = { id: args?.id ?? "newUser", name: args?.name ?? "New User" };
    ctx.controller.validated = true;
    return ctx.controller.user;
  }
}
```

---

## 📦 Engine Flow

1. `signup(credentials)` calls the configured `signup` handler (if defined).
2. If type = string → redirect.
3. If type = redirect → navigates to the provided URL.
4. If type = fn → executes the function, merges `args` and credentials, and awaits the result.
5. If successful and a user object is returned, sets `this.user` and `this.validated = true`.

---

✅ Use the `signup` key to consolidate **registration flows** with login/logout in the same config. This keeps all auth-related logic together while remaining optional.
