# 📄 Session Factory API Contract

The **SessionFactory** is responsible for creating and returning provider instances based on configuration objects. It acts as the entry point for consumers of the library.

---

## Purpose

* Provide a single function to instantiate providers (`MockSession`, `CookieSession`, etc.).
* Centralize configuration resolution and validation.
* Return a consistent interface (`SessionProvider` subclasses) regardless of the chosen provider.
* Enable future extensibility: new providers (e.g., `OAuthSession`, `JWTSession`) can be added by extending `SessionProvider` and updating the Factory switch.

---

## API

### `SessionFactory(net, config)`

* **Parameters**:

  * `config` (`object`) → A session configuration object. Must include a `provider` key (e.g., `"mock"`, `"cookie"`). All other fields are passed through as `options` to the provider constructor.
  * `net` (`Net` instance) → A required network utility (from [`m7Fetch`](https://github.com/linearblade/m7Fetch)) that providers use for requests.
* **Returns**:

  * A provider instance extending `SessionProvider`.

---

## Behavior

* Reads the `provider` field from the config.
* Instantiates the correct provider class:

  * `provider: "mock"` → returns `MockSession`
  * `provider: "cookie"` → returns `CookieSession`
  * Unknown provider → throws an explicit error.
* Passes `net` and the remaining `config` fields as options to the provider constructor.

---

## Example Flow

1. Consumer calls `SessionFactory(net, config)`.
2. Factory validates that `config.provider` is defined.
3. Factory switches on provider type and instantiates the proper class.
4. Factory returns an instance with a consistent runtime API (`getSession`, `login`, `logout`, etc.).

---

## Notes

* The Factory is the **primary entry point** for applications using `m7-js-session-normalizer`.
* Most consumers should import the Factory and let it decide which provider to instantiate based on config.
* Requires the [`m7Fetch`](https://github.com/linearblade/m7Fetch) repository to be defined for use.
