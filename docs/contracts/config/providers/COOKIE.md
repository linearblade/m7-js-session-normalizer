# 🍪 Session Config — Cookie Provider Contract

The **CookieSession provider** is used for environments where sessions are managed via cookies (e.g., legacy PHP backends or server-driven authentication). It validates cookies on the client and/or server, then retrieves user identity from a configured session endpoint.

---

## 🔑 Core Fields

| Field               | Type                     | Required | Description                                                                                       |
| ------------------- | ------------------------ | -------- | ------------------------------------------------------------------------------------------------- |
| `provider`          | `string`                 | ✅        | Must be set to `"cookie"`.                                                                        |
| `default_validated` | `boolean`                | ❌        | Initial validated state. Defaults to `false`.                                                     |
| `default_user`      | `object`                 | ❌        | Fallback user when no session is active. Example: `{ id: "anon", name: "Anonymous", roles: [] }`. |
| `normalize_user`    | `function(ctx, rawUser)` | ❌        | Normalizes raw user data into a consistent shape. Defaults to `rawUser` or `default_user`.        |
| `login`             | `object`                 | ❌        | Defines login behavior (redirect or API call). See [Login Contract](../session/LOGIN.md).         |
| `logout`            | `object`                 | ❌        | Defines logout behavior (redirect or API call). See [Logout Contract](../session/LOGOUT.md).      |

---

## 🔑 Validation Fields

| Field      | Type     | Required | Description                                                                                                                          |
| ---------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `client`   | `object` | ❌        | Client-side validation: required cookie(s), structure, and policy.                                                                   |
| `fetch`    | `object` | ✅        | Server validation parameters. Configures `sessionUrl` and fetch behavior. See [FETCH.md](../session/FETCH.md).                       |
| `request`  | `object` | ❌        | Optional: custom request object. Overrides `fetch.fn`, but still receives the `fetch` object for parameters.                         |
| `response` | `object` | ✅\*      | Defines how to parse the server response. Required if a custom request is used or when the server response differs from the default. |

---

## ⚙️ Behavior Notes

* **Login/Logout** are optional — cookies may be managed externally — but should be defined for completeness.
* **`fetch.sessionUrl`** is the key configuration for server validation.
* **`request`** (if defined) overrides `fetch.fn` and the default fetch pipeline. It still receives the `fetch` object (if defined) to supply request parameters to the custom handler if desired.
* **`response`** (if defined) replaces the default assumption of `{ ok: true, body: {} }`, where `body` is assumed to contain the session info. This is usually required with custom requests (unless they already conform to the default shape), or when the server returns a richer structure, e.g. `{ status: "ok", session: { ... }, ... }`.
* **Cookies** are always sent with `credentials: "include"` when using Net.

---

✅ Use this contract when normalizing cookie-based sessions across legacy or hybrid systems.
