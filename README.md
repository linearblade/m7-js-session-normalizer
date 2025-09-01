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
  import SessionFactory from './vendor/m7-js-session-normalizer/src/index.js';
  import MockSession from './vendor/m7-js-session-normalizer/config/mock-session.js';

  const session = SessionFactory(shell.net, MockSession);

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
  import SessionFactory from './vendor/m7-js-session-normalizer/src/index.js';
  import phpSession from './vendor/m7-js-session-normalizer/config/cookie-php-session.js';

  const session = SessionFactory(shell.net, phpSession);

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
