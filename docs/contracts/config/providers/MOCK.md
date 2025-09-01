# 📄 Session Config — Mock Provider Contract

The **MockSession provider** is used for local development, testing, and demo environments.
It simulates a login/logout flow without requiring a backend or cookies.

---

## 🔑 Core Fields

| Field               | Type                     | Required | Description                                                                                                                                                                        |
| ------------------- | ------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `provider`          | `string`                 | ✅        | Must be set to `"mock"`.                                                                                                                                                           |
| `default_validated` | `boolean`                | ❌        | Initial validated state. Default `false`.                                                                                                                                          |
| `default_user`      | `object`                 | ❌        | Fallback user when no session is active. Example: `{ id:"anon", name:"Anonymous", roles:[] }`.                                                                                     |
| `normalize_user`    | `function(ctx, rawUser)` | ❌        | Normalizes mock user data into a consistent shape. If omitted, returns `rawUser` or `default_user`.                                                                                |
| `login`             | `object`                 | ✅\*      | Defines how login is simulated. Must follow the [Login Contract](../session/LOGIN.md). While not strictly required, it is highly recommended for mocking and development contexts. |
| `logout`            | `object`                 | ✅\*        | Defines how logout is simulated. Must follow the [Logout Contract](../session/LOGOUT.md). See login above.                                                                                         |

---

## Notes

* `login` is optional in theory, but in practice almost always useful when mocking or developing.
* Mock providers allow you to quickly test flows without requiring any backend integration.
