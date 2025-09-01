# 📄 Common Session Configuration Contract

These fields are shared by all providers.
Every provider (Mock, Cookie, OAuth, etc.) should support these keys.

See [Config Overview](../OVERVIEW.md) for the full list of all available keys.

---

## 🔑 Core Fields

| Field               | Type                     | Required | Description                                                                                                                                                                     |
| ------------------- | ------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `provider`          | `string`                 | ✅        | Provider type. e.g. `"cookie"`, `"mock"`, `"oauth"`.                                                                                                                            |
| `default_validated` | `boolean`                | ❌        | Initial validated state. Default `false`.                                                                                                                                       |
| `default_user`      | `object`                 | ❌        | User object returned when no session is present. Example: `{ id:"anon", name:"Anonymous", roles:[] }`.                                                                          |
| `normalize_user`    | `function(ctx, rawUser)` | ❌        | Normalizes raw provider user data into a consistent app-facing shape. Falls back to `default_user` if no user present. If neither is present, `getUser()` should return `null`. |

---

## 🔑 Recommended Behaviors

All providers may define login/logout functionality. While not strictly required (e.g., for purely passive session checks), it is strongly recommended as it greatly improves usability in development and mock contexts.

* **Login**: See [LOGIN.md](../session/LOGIN.md).
* **Logout**: See [LOGOUT.md](../session/LOGOUT.md).

---

## Notes

* These fields form the **baseline contract** for all providers.
* Provider-specific extensions (e.g., cookies, fetch options) are documented in their own provider profiles (e.g., `COOKIE.md`).
