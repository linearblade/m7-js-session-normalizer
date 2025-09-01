# 📄 Common Contract (Core Keys)

The following keys are **shared across all providers**. They establish the baseline behavior and defaults for session handling.

---

## 🔑 `provider`

* **Type**: `string`
* **Required**: ✅
* **Description**: Identifies which provider implementation to use (e.g., `"cookie"`, `"mock"`).
* Used by the `SessionFactory` to determine which provider class to instantiate【156†source】.

---

## 🔑 `default_user`

* **Type**: `object`
* **Required**: ❌
* **Description**: Fallback user object when no authenticated session exists.
* Ensures that `getUser()` always returns a usable object, even if validation has not yet occurred【126†source】.
* Example:

  ```js
  default_user: {
    id: "anon",
    name: "Anonymous",
    roles: []
  }
  ```

---

## 🔑 `default_validated`

* **Type**: `boolean`
* **Required**: ❌
* **Default**: `false`
* **Description**: Sets the initial validation state of the provider【126†source】.

  * `true` → session is considered valid until proven otherwise.
  * `false` → session is considered invalid until validated by cookies/server.

---

✅ These common keys form the foundation of every provider configuration. They ensure a consistent baseline before layering in provider-specific options (e.g., `client`, `fetch`, `request`, `response`, `login`, `logout`).
