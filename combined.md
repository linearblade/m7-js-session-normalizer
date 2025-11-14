

# --- begin: docs/AI_DISCLOSURE.md ---

# ⚙️ AI Disclosure Statement

This project incorporates the assistance of artificial intelligence tools in a supporting role to accelerate development and reduce repetitive labor.

Specifically, AI was used to:

* 🛠️ **Accelerate the creation of repetitive or boilerplate files**, such as configuration definitions and lookup logic.
* ✍️ **Improve documentation clarity**, formatting, and flow for both technical and general audiences.
* 🧠 **Act as a second set of eyes** for small but crucial errors — such as pointer handling, memory safety, and edge-case checks.
* 🌈 **Suggest enhancements** like emoji-infused logging to improve readability and human-friendly debug output.

---

## 🧑‍💻 Emoji Philosophy

I **like emoji**. They're easy for me to scan and read while debugging. Emoji make logs more human-friendly and give structure to otherwise noisy output.

Future versions may include a **configurable emoji-less mode** for those who prefer minimalism or need plaintext compatibility.

And hey — if you don't like them, the wonders of open source mean you're free to **delete them all**. 😄

---

## 🔧 Human-Directed Engineering

All core architecture, flow design, function strategy, and overall system engineering are **authored and owned by the developer**. AI was not used to generate the software's original design, security model, or protocol logic.

Every AI-assisted suggestion was critically reviewed, tested, and integrated under human judgment.

---

## 🤝 Philosophy

AI tools were used in the same spirit as modern compilers, linters, or search engines — as **assistants, not authors**. All decisions, final code, and system behavior remain the responsibility and intellectual output of the developer.


# --- end: docs/AI_DISCLOSURE.md ---



# --- begin: docs/contracts/config/OVERVIEW.md ---

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


# --- end: docs/contracts/config/OVERVIEW.md ---



# --- begin: docs/contracts/config/providers/COMMON.md ---

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


# --- end: docs/contracts/config/providers/COMMON.md ---



# --- begin: docs/contracts/config/providers/COOKIE.md ---

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


# --- end: docs/contracts/config/providers/COOKIE.md ---



# --- begin: docs/contracts/config/providers/MOCK.md ---

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


# --- end: docs/contracts/config/providers/MOCK.md ---



# --- begin: docs/contracts/config/session/CLIENT.md ---

# 🔑 Cookie Provider — `client` Key

The `client` configuration defines **local cookie-level validation** rules that run **before any server request** is made. This ensures obvious problems (e.g., missing cookies, malformed values) are caught early.

---

## 📦 Structure

```js
client: {
  cookies: ["PHPSESSID", "SESSION"],   // string or array of required cookie names
  validation: (ctx, cookieValues) => {   // optional validation function
    // return true | false | Promise<boolean>
  }
}
```

---

## 🔧 Behavior

* **`cookies`**

  * Accepts a string or array of cookie names.
  * `cookiesPresent()` in `CookieSession.js` checks these against `document.cookie`.
  * If any required cookie is missing, validation fails immediately【64†source】.

* **`validation`**

  * An optional function `(ctx, cookieValues)` that performs custom logic.
  * Context includes `{ controller, options }`.
  * If not provided, defaults to `true` (all cookies accepted)【64†source】.
  * If provided, the engine will:

    * Return `false` → stop login immediately.
    * Return `true` → continue to server validation.
    * Return a `Promise<boolean>` → awaited before proceeding【63†source】.

---

## ⚙️ Engine Flow (from `CookieSession.js`)

1. Collect all cookies via `getCookieValues()` → `{ name: value }` map【64†source】.
2. Run `cookiesPresent(cookieValues)` against `client.cookies` (if defined).
3. Run `clientValidation(cookieValues)` using `client.validation` (if defined).
4. Only if both steps pass does the session attempt server validation.

---

## ✅ Example Configurations

**Basic Required Cookie**

```js
client: {
  cookies: "PHPSESSID"
}
```

**Regex Validation**

```js
client: {
  cookies: "PHPSESSID",
  validation: (ctx, cookies) => /^[a-f0-9]{32}$/.test(cookies.PHPSESSID ?? "")
}
```

**JWT Signature Check**

```js
client: {
  cookies: ["JWT"],
  validation: async (ctx, cookies) => verifyJWTSignature(cookies.JWT, ctx.options.publicKey)
}
```

---

## 📝 Notes

* If `client` is not defined, the step is skipped (cookies treated as valid).
* This step never makes a network call — it only inspects `document.cookie` and optionally runs custom code.
* Best used for quick rejection of invalid sessions before hitting the server.


# --- end: docs/contracts/config/session/CLIENT.md ---



# --- begin: docs/contracts/config/session/COMMON.md ---

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


# --- end: docs/contracts/config/session/COMMON.md ---



# --- begin: docs/contracts/config/session/FETCH.md ---

# 🌐 Fetch Contract (`fetch` key)

The **`fetch`** configuration defines **how to build a Net-compatible fetch object** for session validation. It does **not** execute the request directly — instead, it returns a descriptor consumed by the engine (`net.http.get` / `net.http.post`).

---

## 🔧 Signature

```js
/**
 * @param {Object} ctx - Context object containing:
 *   { controller: AuthProviderInstance, options: fullAuthOptions }
 * @param {Object} fetchOpts - The fetch config object { sessionUrl, method, fn }
 * @param {Object} cookieValues - Map of cookieName => cookieValue
 * @param {Object} options - Full auth options (legacy passthrough)
 * @returns {{ url: string, method: string, options: Object }} - Net-compatible fetch descriptor
 */
```

---

## 🔑 Fetch Config Shape

```js
fetch: {
  sessionUrl: "/api/auth/me.php",   // endpoint to validate session
  method: "GET",                     // default is POST
  fn: (ctx, fetchOpts, cookieValues, options) => {
    // optional mutator function to build a fetchObject
    return {
      url: fetchOpts.sessionUrl,
      method: fetchOpts.method,
      options: {
        credentials: "include",
        format: "full"
      }
    };
  }
}
```

* **`sessionUrl`**: Validation endpoint.
* **`method`**: HTTP method (defaults to `POST`).
* **`fn`**: Optional builder/mutator function. If defined, receives `(ctx, fetchOpts, cookieValues, options)` and must return a **fetchObject**. If `fn` is not defined, the engine calls `autoGenFetchObject(sessionUrl, method)`【64†source】.

---

## 🔑 FetchObject Shape

* **url**: `string` — Full URL to request.
* **method**: `string` — `GET` or `POST`.
* **options**: `Object` — Net-compatible options object:

  * `credentials`: always "include" (for cookies).
  * `format`: usually "full" to request structured Net response.
  * `headers?`: request headers (e.g., `{ "Content-Type": "application/json" }`).
  * `body?`: request payload for POST; Net handles serialization.

---

## ✅ Example Implementations

**Default JSON POST (autoGen)**

```js
fetch: {
  sessionUrl: "/api/auth/me.php",
  method: "POST"
}
```

**Custom GET with Query Param**

```js
fetch: {
  sessionUrl: "/api/auth/me.php",
  method: "GET",
  fn: (ctx, opts, cookies) => ({
    url: opts.sessionUrl + "?sid=" + cookies.PHPSESSID,
    method: "GET",
    options: { credentials: "include", format: "full" }
  })
}
```

**Form-encoded Body**

```js
fetch: {
  sessionUrl: "/api/auth/me.php",
  method: "POST",
  fn: (ctx, opts, cookies) => ({
    url: opts.sessionUrl,
    method: "POST",
    options: {
      credentials: "include",
      format: "full",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ sid: cookies.PHPSESSID })
    }
  })
}
```

---

## 📦 Engine Behavior

1. Engine collects cookies (`getCookieValues`).
2. If `fetch.fn` exists, it is called to build the fetchObject.
3. If not, `autoGenFetchObject(sessionUrl, method)` is used【64†source】. Note: if `sessionUrl` is null, `autoGenFetchObject` will return `null`. In that case, `request` must be defined.
4. The fetchObject is passed to Net:

   * `net.http.get(url, options)` if `method = GET`
   * `net.http.post(url, data, options)` if `method = POST`
5. If a `request` key is defined, it **overrides** the default Net fetch behavior — but the `fetchObject` will still be passed along (if defined).
6. ⚠️ If `request` is used, you must also define a custom `response`. If the response does not conform to `{ ok: true, body: { session info } }`, then you must shape it and return the session info — or use `user_normalization` to perform the shaping.

---

✅ Use the `fetch` key when you want to control **how** the validation request is built, while still relying on the engine to execute it.


# --- end: docs/contracts/config/session/FETCH.md ---



# --- begin: docs/contracts/config/session/LOGIN.md ---

# 📄 Login Contract (`login` key)

The **`login`** configuration is an **optional convenience feature**. It allows session providers to define how a login should be initiated, making the session system a one-stop shop for both validation and user entry points. In production systems, login may be handled elsewhere — but for development, mocking, or simple apps, it can be integrated here. It's also a perfectly good place to keep your auth-related code organized — login/logout code has to live somewhere — it's just not strictly **necessary** for session management.

---

## 🔧 Signature

```js
/**
 * @param {Object} ctx - Context object containing:
 *   { controller: SessionProvider, options: fullAuthOptions }
 * @param {Object} args - Arguments or credentials passed to login
 * @returns {Promise<User|void>} Resolves with user object if successful
 */
```

---

## ⚙️ Behavior

* If `login` is **not defined**, calling `login()` will throw an error【136†source】.
* Supported forms:

  * **String shorthand** → treated as a redirect URL【136†source】.
  * **Redirect type** → `{ type: "redirect", url: "..." }`【136†source】.
  * **Function type** → `{ type: "fn", fn, args }`. Runs the provided function with `(ctx, {...args, ...credentials})`【136†source】.
* The function can:

  * Open a popup window
  * Redirect to an external login page
  * Display a local panel (SPA-style)
  * Mock user login for development【138†source】
* Convenience only — not required for session validation.

---

## ✅ Example Implementations

**Redirect to External Login**

```js
login: "/login.html"
```

**Redirect Config Object**

```js
login: {
  type: "redirect",
  url: "/sso/start"
}
```

**Popup Function (CookieSession Example)**

```js
login: {
  type: "fn",
  fn: (ctx, args) => new Promise((resolve, reject) => {
    const popup = window.open(args?.url ?? "/login.html", "LoginPopup", "width=500,height=600");
    if (!popup) return reject(new Error("Popup blocked"));

    const handler = (event) => {
      if (!event.data || event.data.type !== "loginSuccess") return;
      window.removeEventListener("message", handler);
      popup.close();
      ctx.controller.user = event.data.user;
      ctx.controller.validated = true;
      resolve(event.data.user);
    };

    window.addEventListener("message", handler);
  }),
  args: { url: "/login.html" }
}
```

**Mock Login (Development)**

```js
login: {
  type: "fn",
  fn: (ctx, args) => {
    ctx.controller.user = { id: args.id ?? "mock", name: args.name ?? "Mock User" };
    ctx.controller.validated = true;
    return ctx.controller.user;
  }
}
```

---

## 📦 Engine Flow

1. `login(credentials)` calls the `login` config defined in options【136†source】.
2. If type = string → redirect.
3. If type = redirect → redirect to specified URL.
4. If type = fn → executes the function, merges `args` and `credentials`, and awaits the result.
5. If successful, sets `this.user` and `this.validated = true`.

---

✅ Use the `login` key for **developer convenience, mocking, or integrated flows**. In production, you may choose to leave it undefined and handle login elsewhere.


# --- end: docs/contracts/config/session/LOGIN.md ---



# --- begin: docs/contracts/config/session/LOGOUT.md ---

# 📄 Logout Contract (`logout` key)

The **`logout`** configuration defines how a session should be terminated. Like `login`, it is primarily a convenience feature: not required for session validation, but a useful place to centralize logout behavior across environments.

---

## 🔧 Signature

```js
/**
 * @param {Object} ctx - Context object containing:
 *   { controller: SessionProvider, options: fullAuthOptions }
 * @param {Object} args - Optional arguments passed into logout
 * @returns {Promise<boolean|void>} Resolves true on success, false on failure/cancel
 */
```

---

## ⚙️ Behavior

* If `logout` is not defined:

  * Default behavior is to **clear the session immediately** (`this.user = null; this.validated = false`)【136†source】.
* Supported forms:

  * **String shorthand** → redirect URL【136†source】.
  * **Redirect type** → `{ type: "redirect", url: "..." }`【136†source】.
  * **Function type** → `{ type: "fn", fn, args }`. Runs the provided function with `(ctx, {...args, ...credentials})`【136†source】.
* The function can:

  * Call a server logout endpoint
  * Show a confirmation prompt
  * Clear local state (mock/development use)【138†source】
* If the function returns truthy, the engine clears the session automatically【136†source】.

---

## ✅ Example Implementations

**Simple Redirect**

```js
logout: "/logout.html"
```

**Redirect Config Object**

```js
logout: {
  type: "redirect",
  url: "/sso/logout"
}
```

**Server Logout Call (CookieSession Example)**

```js
logout: {
  type: "fn",
  fn: async (ctx, args) => {
    if (window.confirm("Are you sure you want to log out?")) {
      await fetch("/api/auth/logout.php", { method: "POST", credentials: "include" });
      alert("You have been logged out.");
      return true;
    }
    return false;
  }
}
```

**Mock Logout (Development)**

```js
logout: {
  type: "fn",
  fn: async (ctx) => {
    alert("You have been logged out (mock).");
    return true;
  }
}
```

---

## 📦 Engine Flow

1. `logout(args)` calls the configured `logout` handler (if defined)【136†source】.
2. If type = string → redirect.
3. If type = redirect → navigate to provided URL.
4. If type = fn → executes the function with `(ctx, {...args})`.
5. If function returns truthy, `clearSession()` is called to reset `this.user` and `this.validated`【136†source】.
6. If not defined, `clearSession()` is invoked by default.

---

✅ Use the `logout` key to provide a **consistent and centralized logout flow**, whether that means redirecting to an external SSO, hitting a server endpoint, or clearing local mock data.


# --- end: docs/contracts/config/session/LOGOUT.md ---



# --- begin: docs/contracts/config/session/NORMALIZE_USER.md ---

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


# --- end: docs/contracts/config/session/NORMALIZE_USER.md ---



# --- begin: docs/contracts/config/session/REQUEST.md ---

# 📄 Request Contract (`request` key)

The **`request`** configuration provides a **full override of the fetch pipeline**. Instead of letting the engine build and execute a Net-compatible `fetchObject`, you can define a custom request function that runs end-to-end.

---

## 🔧 Signature

```js
/**
 * @param {Object} ctx - Context object containing:
 *   { controller: CookieSession, options: fullAuthOptions }
 * @param {Object|null} fetchObject - The fetch descriptor built from `fetch` (if defined)
 * @param {Object} cookieValues - Map of cookieName => cookieValue
 * @param {Object} options - The full provider options
 * @returns {Promise<Response>} - A response-like object consumed by the `response` handler
 */
```

---

## ⚙️ Behavior

* **Overrides** the default fetch pipeline completely【114†source】.
* Still receives the `fetchObject` (if defined) for convenience — you can reuse its fields or ignore it【114†source】.
* Must return a **response-like object** that can be interpreted by the `response` function.

  * By default, the engine expects `{ ok: boolean, body: any }`.
  * If your response does not conform to `{ ok: true, body: { session info } }`, you must either:

    * Shape it in the `response` function, or
    * Use `user_normalization` to transform the user payload【114†source】.
* If neither `fetchObject` nor `request` is available, validation fails【114†source】.

---

## ✅ Example Implementations

**Custom XHR Wrapper**

```js
request: async (ctx, fetchObject, cookies, options) => {
  const res = await customXHR(fetchObject.url, {
    method: "POST",
    headers: { "X-Auth": cookies.PHPSESSID },
    withCredentials: true
  });
  return { ok: res.status === 200, body: await res.json() };
}
```

**GraphQL Request**

```js
request: async (ctx, fetchObject, cookies) => {
  const res = await fetch("/graphql", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "{ me { id name roles } }" })
  });
  return { ok: res.ok, body: await res.json() };
}
```

**WebSocket Request**

```js
request: async (ctx, fetchObject, cookies, options) => {
  return new Promise((resolve) => {
    mySocket.emit("validate", { sid: cookies.PHPSESSID }, (response) => {
      resolve({ ok: response.success, body: response });
    });
  });
}
```

---

## 📦 Engine Flow

1. Engine gathers cookies (`getCookieValues`).
2. If `request` is defined, it is called instead of the standard fetch pipeline【114†source】.
3. The returned response is passed into the `response` function (if defined)【114†source】.
4. The shaped result determines `this.user` and `this.validated`.

---

✅ Use the `request` key when you need **total control** over how validation is performed (e.g., non-HTTP transport, special headers, GraphQL, WebSockets).


# --- end: docs/contracts/config/session/REQUEST.md ---



# --- begin: docs/contracts/config/session/RESPONSE.md ---

# 📄 Response Contract (`response` key)

The **`response`** configuration defines how to interpret the result of a session validation request. It runs **after** `fetch` or `request` completes, and is responsible for shaping the returned data into a valid user object or validation flag.

---

## 🔧 Signature

```js
/**
 * @param {Object} ctx - Context object containing:
 *   { controller: CookieSession, options: fullAuthOptions }
 * @param {Object} res - The response object returned from Net or custom request
 * @param {Object} cookieValues - Map of cookieName => cookieValue
 * @param {Object} options - The full provider options
 * @returns {boolean | object | Promise<boolean|object>}
 *   - false → validation failed
 *   - true → validation succeeded, but no user object
 *   - object → treated as the user object
 */
```

---

## ⚙️ Behavior

* Called after `handleServerValidation` receives a response【114†source】.
* If not defined, defaults to:

  * `if (res.ok) this.user = res.body; else return false;`【114†source】.
* If defined, you can:

  * Return `false` → validation fails.
  * Return `true` → validation succeeds, but user remains `null`.
  * Return an `object` → becomes the `this.user` payload.
* Errors thrown inside `response` are caught; engine falls back to `false` (safer default)【114†source】.
* Common use: shape server responses that don’t conform to `{ ok: true, body: { session info } }`【113†source】.

---

## ✅ Example Implementations

**Default Shape (PHP Example)**

```js
response: async (ctx, res) => {
  if (!res.ok) return false;
  if (!res.body.ok) return false;
  return res.body.user; // Net returns parsed JSON body
}
```

**Boolean Result Only**

```js
response: async (ctx, res) => res.ok
```

**GraphQL Response Shaping**

```js
response: async (ctx, res) => {
  if (!res.ok || !res.body.data?.me) return false;
  return res.body.data.me;
}
```

**Custom Error Handling**

```js
response: async (ctx, res) => {
  try {
    if (res.status === 401) return false;
    return res.body.session;
  } catch (err) {
    console.error("response parse error", err);
    return false;
  }
}
```

---

## 📦 Engine Flow

1. `fetch` or `request` produces a `res` object.
2. If `response` is defined, it is awaited and interpreted【114†source】.
3. The return value sets `this.user` and `this.validated`.
4. If no `response` is provided, fallback logic sets `this.user = res.body` if `res.ok`.

---

✅ Use the `response` key to **adapt arbitrary server responses** into the session contract. It ensures flexibility for different backends (REST, PHP, GraphQL, etc.) while keeping the engine’s core validation flow consistent.


# --- end: docs/contracts/config/session/RESPONSE.md ---



# --- begin: docs/contracts/OVERVIEW.md ---

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


# --- end: docs/contracts/OVERVIEW.md ---



# --- begin: docs/contracts/runtime/FACTORY_API.md ---

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


# --- end: docs/contracts/runtime/FACTORY_API.md ---



# --- begin: docs/contracts/runtime/PROVIDER_API.md ---

# 📄 Provider API Contract

This document defines the **runtime API methods** exposed by session providers.
All providers extend from `SessionProvider` and implement a common set of methods. These methods operate at runtime and consume the configuration objects defined under `contracts/config/`.

---

## Core Methods

### `async getSession()`

* **Purpose**: Retrieve the current session. Must be implemented by each provider (e.g., CookieSession, MockSession).
* **Returns**:

  * A normalized user object, or `null` if no valid session.
* **Notes**:

  * The base class throws an error by default; subclasses must override.

---

### `getUser()`

* **Purpose**: Return the current normalized user object.
* **Behavior**:

  * If a session has already been retrieved, returns the stored session.
  * If no session exists, returns `default_user` if defined, otherwise `null`.
  * If `normalize_user` is defined in config, it will be applied to the stored user before returning.
* **Returns**:

  * Normalized user object, `default_user`, or `null`.

---

### `isLoggedIn()`

* **Purpose**: Quick check for session validity.
* **Returns**:

  * `true` if `this.validated` is true, otherwise `false`.

---

### `async login(credentials = {})`

* **Purpose**: Perform a login action according to the provider’s config.
* **Parameters**:

  * `credentials` (`object`) → Optional login data (username/password, token, etc.).
* **Behavior**:

  * If `login` config is a **string** → redirect to URL.
  * If `login.type === "redirect"` → redirect to `login.url`.
  * If `login.type === "fn"` → executes configured function `(ctx, args)` where `ctx = { controller, options }`. Must return a user object or Promise.
  * Throws if no `login` config is defined or if the function cannot be resolved.

---

### `async logout(args = {})`

* **Purpose**: Perform a logout action according to the provider’s config.
* **Parameters**:

  * `args` (`object`) → Optional arguments to pass to the logout function.
* **Behavior**:

  * If `logout.type === "fn"` → executes configured function `(ctx, args)`. If it resolves truthy, `clearSession()` is called.
  * Otherwise clears the session immediately.
  * If `logout` config is a **string** → redirect to URL.
  * If `logout.type === "redirect"` → redirect to `logout.url`.

---

### `clearSession()`

* **Purpose**: Reset local session state.
* **Behavior**:

  * Sets `this.user = null` and `this.validated = false`.
* **Usage**:

  * Called internally by `logout()` when appropriate, and may also be invoked directly in custom handlers via `ctx.controller.clearSession()`.

---

## Optional / Extension Methods

### `async getAuthHeaders()`

* **Purpose**: Return auth-related headers for API requests (e.g., `{ Authorization: "Bearer ..." }`).
* **Notes**:

  * Stubbed in the base class; may be overridden in subclasses (e.g., JWT/OAuth providers).

---

### `getFunction(value)`

* **Purpose**: Utility to resolve a function reference.
* **Behavior**:

  * If `value` is a function → returns it.
  * If `value` is a string and matches a function on `window` → returns that function.
  * Otherwise returns `null`.
* **Usage**:

  * Used internally by `login()` and `logout()` to resolve functions from config.

---

## Context Object (`ctx`)

Functions defined in config (`login.fn`, `logout.fn`, etc.) receive a `ctx` argument:

```js
ctx = {
  controller: this,      // reference to the provider instance
  options: this.options  // resolved config options for this provider
}
```

This ensures config functions always have access to both runtime state and config.


# --- end: docs/contracts/runtime/PROVIDER_API.md ---



# --- begin: docs/USE_POLICY.md ---

# 📘 m7-js-session-normalizer Use Policy

This document outlines how you may use m7-js-session-normalizer under the **Moderate Team License (MTL-10)** and what is expected of you as a user.

---

## ✅ Free Use — What You Can Do

You may use m7-js-session-normalizer **for free** if you fall under any of the following categories:

* **Individuals** using it for personal projects, learning, or experimentation
* **Academic institutions or researchers** using it for teaching, papers, or labs
* **Nonprofits and NGOs** using it internally without revenue generation
* **Startups or companies** with **10 or fewer users** of m7-js-session-normalizer internally

  * This includes development, deployment, and operational use

There is **no cost, license key, or approval required** for these use cases.

---

## 🚫 Commercial Restrictions

m7-js-session-normalizer **may not be used** in the following ways without a paid commercial license:

* As part of a **commercial product** that is sold, licensed, or monetized
* Embedded within a platform, device, or SaaS product offered to customers
* Internally at companies with **more than 10 users** working with m7-js-session-normalizer
* As a hosted service, API, or backend component for commercial delivery
* In resale, sublicensing, or redistribution as part of paid offerings

---

## 🔒 Definitions

* **User**: Anyone who installs, configures, modifies, integrates, or interacts with m7-js-session-normalizer as part of their role.
* **Commercial use**: Use in a context intended for revenue generation or business advantage (e.g. SaaS, enterprise ops, service platforms).

---

## 💼 Licensing for Larger or Commercial Use

If your company, product, or service falls outside the free use scope:

📩 **Contact us at \[[legal@m7.org](mailto:legal@m7.org)]** to arrange a commercial license.

Licensing is flexible and supports:

* Enterprise support and maintenance
* Extended deployment rights
* Integration into proprietary systems
* Long-term updates and private features

---

## 🤝 Community Guidelines

* Contributions are welcome under a Contributor License Agreement (CLA)
* Respect user limits — we reserve the right to audit compliance
* We appreciate feedback and security reports via \[[security@m7.org](mailto:security@m7.org)]

---

## 📝 Summary

| Use Case                            | Allowed?      |
| ----------------------------------- | ------------- |
| Hobby / personal projects           | ✅ Yes         |
| Research or academic use            | ✅ Yes         |
| Internal team use (≤ 10 people)     | ✅ Yes         |
| SaaS / resale / commercial platform | ❌ License req |
| Internal use by >10 users           | ❌ License req |

---

This policy supplements the terms in `LICENSE.md` and helps clarify user expectations.


# --- end: docs/USE_POLICY.md ---



# --- begin: LICENSE.md ---

Moderate Team Source-Available License (MTL-10)

Version 1.0 – May 2025Copyright (c) 2025 m7.org

1. Purpose

This license allows use of the software for both non-commercial and limited commercial purposes by small to moderate-sized teams. It preserves freedom for individuals and small businesses, while reserving large-scale commercial rights to the Licensor.

2. Grant of Use

You are granted a non-exclusive, worldwide, royalty-free license to use, modify, and redistribute the Software, subject to the following terms:

You may use the Software for any purpose, including commercial purposes, only if your organization or team consists of no more than 10 total users of the Software.

A “user” is defined as any person who develops with, maintains, integrates, deploys, or operates the Software.

You may modify and redistribute the Software under the same terms, but must retain this license in all distributed copies.

3. Restrictions

If your organization exceeds 10 users of the Software, you must obtain a commercial license from the Licensor.

You may not offer the Software as a hosted service, software-as-a-service (SaaS), or part of a commercial product intended for resale or third-party consumption, regardless of team size.

You may not sublicense, relicense, or alter the terms of this license.

4. Attribution and Notices

You must include this license text and a copyright notice in all copies or substantial portions of the Software.

You must clearly indicate any modifications made to the original Software.

5. No Warranty

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY.

6. Contact for Commercial Licensing

If your use case exceeds the permitted team size, or involves resale, SaaS, hosting, or enterprise deployment:

📧 Contact: legal@m7.org

Commercial licensing is available and encouraged for qualified use cases.

# --- end: LICENSE.md ---



# --- begin: README.md ---

# m7-js-session-normalizer

## Purpose

`m7-js-session-normalizer` provides a **unified abstraction for session management** in JavaScript applications. It standardizes how user sessions are detected, validated, and managed across different authentication strategies, so the rest of an application can remain agnostic to the specifics of the login system.

## Description

Modern applications often rely on different authentication mechanisms depending on environment or deployment: legacy PHP sessions with cookies, OAuth-based logins, JWT tokens, or mock providers for testing. This library **normalizes those differences** into a consistent interface.

It answers three core questions in a reliable, provider-agnostic way:

1. **Am I logged in?**
   Check whether a valid session exists using the configured provider.

2. **Who is the user?**
   Return a normalized user object, ensuring the application sees a stable shape regardless of backend differences.

3. **How do I log in or out?**
   Provide standard `login()` and `logout()` flows, delegating to provider-specific logic (redirects, popups, API calls, or inline mocks).

## Use Cases

* **Game engines and runtime shells** → Seamlessly swap between cookie sessions (production), OAuth flows (third-party), or mock sessions (development/testing).
* **Shared libraries or frameworks** → Expose a single session API without forcing downstream projects to care about the underlying auth method.
* **Legacy + modern hybrid systems** → Bridge old PHP session cookies with newer token-based APIs.
* **Testing and prototyping** → Drop in mock providers to simulate login/logout without touching a backend.

## Value

By separating session logic from application logic, `m7-js-session-normalizer` becomes the **pluggable access layer** for identity. Applications, editors, or multiplayer services can query session state and user identity without caring how authentication is implemented behind the scenes.

## Extensibility

The design supports multiple providers (e.g., Cookie, Mock, OAuth, JWT). New providers can be added without breaking the core API, ensuring long-term flexibility as authentication methods evolve.

## Design Principles

* **Provider-agnostic** → Works across cookie, token, OAuth, or mock flows without bias.
* **Minimal API surface** → Keeps the interface small and predictable (`getSession`, `getUser`, `login`, `logout`).
* **Framework-agnostic** → Usable in any environment (vanilla JS, game engines, SPAs, Node).
* **Pluggable** → Providers can be added or swapped without rewriting application code.

## Scope

This library does **not** implement user registration, password reset flows, token generation, encryption, or database-backed identity management. It focuses solely on normalizing session state and exposing a consistent interface for checking, retrieving, logging in, and logging out users.

## Target Audience

* **Framework and library authors** needing a stable session abstraction to build higher-level tools.
* **Game and simulation developers** wanting to switch between mock, cookie, or token sessions without rewriting game logic.
* **Hybrid legacy/modern maintainers** bridging PHP-style sessions with OAuth/JWT.
* **QA and prototyping teams** benefiting from fast mock sessions for testing user flows without backend dependencies.

## Why This Matters

Traditional web app stacks often depend on heavy frameworks (Node, Angular, Vite, etc.) with long setup and rebuild cycles. `m7-js-session-normalizer` avoids that overhead: it works in plain JavaScript without requiring a bundler or framework. This makes it especially useful for quick-start projects, lightweight engines, or embedded environments where speed of setup and minimal dependencies are critical.

## Requirements

This project requires [m7Fetch](https://github.com/linearblade/m7Fetch)  as its network layer.

## Quick Start

For complete configuration details, see [docs/contracts/OVERVIEW.md](./docs/contracts/OVERVIEW.md).

### Example 1 — Mock Session (no backend)

```html
<script type="module">
  import Net                  from './vendor/m7Fetch/src/index.js';
  import SessionFactory       from './vendor/m7-js-session-normalizer/src/index.js';
  import MockSession          from './vendor/m7-js-session-normalizer/config/mock-session.js';
  const net = new Net({absolute:true});
  const session = SessionFactory(net, MockSession);

  if (await session.getSession()) {
    console.log(session.getUser());
    // show logout link onclick = session.logout()
  } else {
    // show login link onclick = session.login()
  }
</script>
```

### Example 2 — Cookie + PHP Session

If you want to try PHP cookie-based auth, copy the **examples/php-auth/** folder into a web-accessible location, and configure `cookie-php-session.js` endpoints accordingly. Also make sure `login_page.html` is accessible.

```html
<script type="module">
  import Net                  from './vendor/m7Fetch/src/index.js';
  import SessionFactory       from './vendor/m7-js-session-normalizer/src/index.js';
  import phpSession           from './vendor/m7-js-session-normalizer/config/cookie-php-session.js';
  const net = new Net({absolute:true});
  const session = SessionFactory(net, phpSession);

  if (await session.getSession()) {
    console.log(session.getUser());
    // show logout link onclick = session.logout()
  } else {
    // show login link onclick = session.login()
  }
</script>
```

## 📜 License

See [`LICENSE.md`](LICENSE.md) for terms.
Free for personal, non-commercial use.
Commercial licensing available under M7 Moderate Team License (MTL-10).

## 🤖 AI Usage Disclosure

See [`docs/AI_DISCLOSURE.md`](docs/AI_DISCLOSURE.md) and [`docs/USE_POLICY.md`](docs/USE_POLICY.md) for details on permitted AI usage and operational security boundaries.

## 🛠️ Philosophy

> “Fewer assumptions. More control.”

`m7-js-session-normalizer` prefers **explicit** behavior and composability over frameworks that abstract away too much.

## 💬 Feedback / Security

* General inquiries: [legal@m7.org](mailto:legal@m7.org)
* Security issues: [security@m7.org](mailto:security@m7.org)


# --- end: README.md ---

