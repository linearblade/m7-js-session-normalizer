# 📄 Maximal Config Reference

This document lists all keys that may appear in a session config object.
Each key links to a detailed contract describing its shape and usage.

---

## Core

| Key                 | Type                   | Description                               | Spec Link                               |
| ------------------- | ---------------------- | ----------------------------------------- | --------------------------------------- |
| `provider`          | string                 | Provider type (mock, cookie, oauth, etc.) | [COMMON.md](COMMON.md)                  |
| `default_user`      | object                 | Fallback user object                      | [COMMON.md](COMMON.md)                  |
| `default_validated` | boolean                | Initial validated state (default false)   | [COMMON.md](COMMON.md)                  |
| `normalize_user`    | function(ctx, rawUser) | Normalizes raw user into consistent shape | [NORMALIZE\_USER.md](NORMALIZE_USER.md) |

---

## Login / Logout

| Key      | Type   | Description                        | Spec Link              |
| -------- | ------ | ---------------------------------- | ---------------------- |
| `login`  | object | Defines login flow (fn, redirect)  | [LOGIN.md](LOGIN.md)   |
| `logout` | object | Defines logout flow (fn, redirect) | [LOGOUT.md](LOGOUT.md) |

---

## Validation

| Key        | Type     | Description                           | Spec Link                  |
| ---------- | -------- | ------------------------------------- | -------------------------- |
| `client`   | object   | Client-side validation checks         | [CLIENT.md](CLIENT.md)     |
| `fetch`    | object   | Fetch options for validation endpoint | [FETCH.md](FETCH.md)       |
| `request`  | function | Custom request handler                | [REQUEST.md](REQUEST.md)   |
| `response` | function | Custom response handler               | [RESPONSE.md](RESPONSE.md) |

---

## Provider-Specific

| Provider | Special Keys                  | Notes                                   |
| -------- | ----------------------------- | --------------------------------------- |
| Mock     | none (basic only)             | See [MOCK.md](../providers/MOCK.md)     |
| Cookie   | `cookies`, `sessionUrl`, etc. | See [COOKIE.md](../providers/COOKIE.md) |
