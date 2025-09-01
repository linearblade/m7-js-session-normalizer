# 📄 Normalize User Contract (`normalize_user` key)

The **`normalize_user`** configuration defines how raw user data is transformed into a consistent, enriched user object. This function ensures downstream systems always work with a predictable shape, even when the backend response varies or fields are missing.

---

## 🔧 Signature

```js
/**
 * @param {Object} ctx - Context object containing:
 *   { controller: SessionProvider, options: fullAuthOptions }
 * @param {Object|null} rawUser - The unprocessed user object (may be null)
 * @returns {Object} - A normalized/enriched user object
 */
```

---

## ⚙️ Behavior

* Runs whenever `getUser()` is called【126†source】.
* If `normalize_user` is defined and is a function, it is called with `(ctx, rawUser)`【126†source】.
* If no `normalize_user` is defined:

  * Returns the raw `user` object if available.
  * Falls back to `default_user` if no user is present【126†source】.
* Ideal for **enriching or cleaning** user objects:

  * Adding default roles
  * Mapping inconsistent field names (`displayname` → `name`)
  * Ensuring required fields (`id`, `name`, `roles`) always exist

---

## ✅ Example Implementations

**Basic Normalizer**

```js
normalize_user: (ctx, rawUser) => rawUser ?? ctx.options.default_user
```

**Enforce Required Fields**

```js
normalize_user: (ctx, rawUser) => {
  if (!rawUser) return ctx.options.default_user;
  return {
    id: rawUser.id,
    name: rawUser.displayname || rawUser.name || "Anonymous",
    roles: rawUser.roles ?? []
  };
}
```

**Add Derived Properties**

```js
normalize_user: (ctx, rawUser) => {
  if (!rawUser) return ctx.options.default_user;
  return {
    ...rawUser,
    isAdmin: rawUser.roles?.includes("admin") || false,
    displayLabel: `${rawUser.name} (${rawUser.id})`
  };
}
```

---

## 📦 Engine Flow

1. Session provider sets `this.user` during validation.
2. When `getUser()` is called:

   * If `normalize_user` is provided, the raw user is passed to it【126†source】.
   * The returned value is the **canonical user object**.
   * If no user is present, `default_user` (if defined) is returned.

---

✅ Use `normalize_user` to guarantee that your application always receives a consistent user object, regardless of backend quirks or missing fields.
