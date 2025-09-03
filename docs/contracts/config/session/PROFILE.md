# 📄 Profile Contract (`profile` key)

The **`profile`** configuration is an **optional convenience feature**, similar in structure to [`login`](LOGIN.md) and [`signup`](SIGNUP.md). Its purpose is not to manage session validation, but to provide a consistent place to configure **profile viewing or editing flows**.

---

## 🔧 Signature

```js
/**
 * @param {Object} ctx - Context object containing:
 *   { controller: SessionProvider, options: fullAuthOptions }
 * @param {Object} args - Arguments passed into profile (e.g., user ID, view mode)
 * @returns {Promise<void>|Promise<any>} May resolve with profile data or nothing
 */
```

---

## ⚙️ Behavior

* If `profile` is not defined, the engine does nothing when `profile()` is called.
* Supported forms:

  * **String shorthand** → redirect to a profile page URL.
  * **Redirect type** → `{ type: "redirect", url: "..." }`.
  * **Function type** → `{ type: "fn", fn, args }`. Executes the function with `(ctx, {...args})`.
* Intended for:

  * Opening a profile editor popup or SPA panel.
  * Redirecting to a profile page.
  * Fetching or updating profile data via API.
* Unlike `login` or `signup`, this does **not** affect `ctx.controller.user` or validation state — it’s for auxiliary user profile management.

---

## ✅ Example Implementations

**Redirect to Profile Page**

```js
profile: "/profile.html"
```

**Open Profile Editor Popup**

```js
profile: {
  type: "fn",
  fn: (ctx, args) => {
    window.open(args?.url ?? "/profile.html", "ProfilePopup", "width=600,height=700");
  },
  args: { url: "/profile.html" }
}
```

**Fetch and Edit Profile Data**

```js
profile: {
  type: "fn",
  fn: async (ctx, args) => {
    const res = await fetch("/api/user/profile.php", { credentials: "include" });
    if (!res.ok) throw new Error("Profile fetch failed");
    const data = await res.json();
    // show UI editor, return data if needed
    return data;
  }
}
```

---

## 📦 Engine Flow

1. `profile(args)` calls the configured `profile` handler (if defined).
2. If type = string → redirect.
3. If type = redirect → navigate to given URL.
4. If type = fn → executes the function, merges args, and awaits the result.
5. No changes are made to session state — this is for profile management only.

---

✅ Use the `profile` key to centralize profile-related flows alongside `login`, `logout`, and `signup`, keeping all auth-adjacent features in one configuration.
