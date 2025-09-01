# 📄 Session Contracts Overview

The `m7-js-session-normalizer` documentation is divided into **configuration contracts** and **runtime contracts**.

---

## Configuration Contracts

Configuration contracts describe the shape of config objects passed into `SessionFactory`.
They define *what you declare* in order to use a session provider.
* [config/OVERVIEW.md](config/OVERVIEW.md) → summary of how the session config system is organized.

* `config/session/` → atomic building blocks:

  * [COMMON.md](config/session/COMMON.md)
  * [CLIENT.md](config/session/CLIENT.md)
  * [FETCH.md](config/session/FETCH.md)
  * [REQUEST.md](config/session/REQUEST.md)
  * [RESPONSE.md](config/session/RESPONSE.md)
  * [NORMALIZE\_USER.md](config/session/NORMALIZE_USER.md)
  * [LOGIN.md](config/session/LOGIN.md)
  * [LOGOUT.md](config/session/LOGOUT.md)

* `config/providers/` → provider-specific profiles that assemble the building blocks:

  * [COMMON.md](config/providers/COMMON.md)
  * [COOKIE.md](config/providers/COOKIE.md)
  * [MOCK.md](config/providers/MOCK.md)

---

## Runtime Contracts

Runtime contracts describe the **methods available on provider instances** returned by the factory.
They define *what you call* after a provider is created.

* [PROVIDER\_API.md](runtime/PROVIDER_API.md) → Base provider methods (`getSession`, `getUser`, `login`, `logout`, etc.).
* [FACTORY\_API.md](runtime/FACTORY_API.md) → Entry point for instantiating providers with configs.

---

## Lifecycle

1. **Choose or define a config** → See [config/providers/](config/providers/).
2. **Pass config into SessionFactory** → See [FACTORY\_API.md](runtime/FACTORY_API.md).
3. **Receive a provider instance** → See [PROVIDER\_API.md](runtime/PROVIDER_API.md).
4. **Call runtime methods** (`getSession`, `login`, `logout`, etc.) → Behavior depends on config + provider.

---

## Extending

To add a new provider:

1. Define its config contract in [config/providers/](config/providers/).
2. Extend `SessionProvider` with provider-specific logic.
3. Update the `SessionFactory` to recognize the new provider.
