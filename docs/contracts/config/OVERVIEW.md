# 📄 Maximal Config Reference

This document lists all keys that may appear in a session config object.
Each key links to a detailed contract describing its shape and usage.

---

## Core

| Key                 | Type                   | Description                               | Spec Link                               |
| ------------------- | ---------------------- | ----------------------------------------- | --------------------------------------- |
| `provider`          | string                 | Provider type (mock, cookie, oauth, etc.) | [COMMON.md](./session/COMMON.md)                  |
| `default_user`      | object                 | Fallback user object                      | [COMMON.md](./session/COMMON.md)                  |
| `default_validated` | boolean                | Initial validated state (default false)   | [COMMON.md](./session/COMMON.md)                  |
| `normalize_user`    | function(ctx, rawUser) | Normalizes raw user into consistent shape | [NORMALIZE\_USER.md](./session/NORMALIZE_USER.md) |

---

## Login / Logout

| Key      | Type   | Description                        | Spec Link              |
| -------- | ------ | ---------------------------------- | ---------------------- |
| `login`  | object | Defines login flow (fn, redirect)  | [LOGIN.md](./session/LOGIN.md)   |
| `logout` | object | Defines logout flow (fn, redirect) | [LOGOUT.md](./session/LOGOUT.md) |

---

## Validation

| Key        | Type     | Description                           | Spec Link                  |
| ---------- | -------- | ------------------------------------- | -------------------------- |
| `client`   | object   | Client-side validation checks         | [CLIENT.md](./session/CLIENT.md)     |
| `fetch`    | object   | Fetch options for validation endpoint | [FETCH.md](./session/FETCH.md)       |
| `request`  | function | Custom request handler                | [REQUEST.md](./session/REQUEST.md)   |
| `response` | function | Custom response handler               | [RESPONSE.md](./session/RESPONSE.md) |

---

## Provider-Specific

| Provider | Special Keys                  | Notes                                   |
| -------- | ----------------------------- | --------------------------------------- |
| Mock     | none (basic only)             | See [MOCK.md](./providers/MOCK.md)     |
| Cookie   | `cookies`, `sessionUrl`, etc. | See [COOKIE.md](./providers/COOKIE.md) |
