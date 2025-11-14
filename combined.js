

# --- begin: config/cookie-php-session.js ---

  /*
 * Copyright (c) 2025 m7.org
 * License: MTL-10 (see LICENSE.md)
 */
/**
 * Default config for CookieSession provider.
 * Useful for cookie/session-based auth flows.
 */
let activeLogin = null; // module/global scoped tracker

export default {
    provider: "cookie",

    // Defaults
    default_validated: false,
    default_user: {
	id: "anon",
	name: "Anonymous",
	roles: []
    },

    // Normalizer ensures consistent user shape
    normalize_user: (ctx, rawUser) => {
	if (!rawUser) return ctx.options.default_user;
	return {
	    id: rawUser.id,
	    name: rawUser.displayname || rawUser.name,
	    roles: rawUser.roles || []
	};
    },
    client: {
	cookies: "PHPSESSID",
	validation: (ctx, cookies) => !!cookies.PHPSESSID,
    },
    //configure the endpoint , and mutate it if desired. see fetchobject
    fetch : {
	sessionUrl: "/api/auth/me.php", // your me.php endpoint
	method: "GET",
	//fetchFn(ctx,fetchOpts, cookieValues, this.options) //NOT async
	fn : null //use this to mutate if you want
    },
    // you can define a custom request if you have some custom requirements...
    //async requestFn(ctx, fetchObject, cookieValues, this.options);
    request: null,
    //unpack the server response.
    response:  async (ctx, res) => {
	//console.warn('in resp',ctx,res);
	if (!res.ok) return false;
	//this is server response specific. the auth example returns {ok:true, user:{...} }
	if (!res.body.ok) return false;
	return res.body.user; // Net returns parsed JSON body
    },

    login: {
	type: "fn",
	fn: (ctx, args) => {
	    return new Promise((resolve, reject) => {
		// If an old login attempt exists, clean it up
		if (activeLogin) {
		    if (activeLogin.popup && !activeLogin.popup.closed) {
			activeLogin.popup.close();
		    }
		    window.removeEventListener("message", activeLogin.handler);
		    clearInterval(activeLogin.timer);
		    activeLogin = null;
		}

		const width = 500, height = 600;
		const left = (window.screen.width / 2) - (width / 2);
		const top = (window.screen.height / 2) - (height / 2);

		const popup = window.open(
		    args?.url ?? "/login.html",
		    "LoginPopup",
		    `width=${width},height=${height},top=${top},left=${left}`
		);

		if (!popup) return reject(new Error("Popup blocked"));

		// Define handler
		const handler = (event) => {
		    if (!event.data || event.data.type !== "loginSuccess") return;

		    window.removeEventListener("message", handler);
		    clearInterval(timer);
		    activeLogin = null;

		    popup.close();
		    ctx.controller.user = event.data.user;
		    ctx.controller.validated = true;

		    resolve(event.data.user);
		};

		window.addEventListener("message", handler);

		// Timeout & closed-window check
		const timer = setInterval(() => {
		    if (popup.closed) {
			window.removeEventListener("message", handler);
			clearInterval(timer);
			activeLogin = null;
			reject(new Error("Login popup closed or timed out"));
		    }
		}, 500);

		// Save tracker
		activeLogin = { popup, handler, timer };
	    });
	},
	args: { url: "/login.html" }
    },
    // Logout (confirm + clear)
    logout: {
	type: "fn",
	fn: async (ctx, args) => {
	    if (window.confirm("Are you sure you want to log out?")) {
		// hit server logout endpoint too
		await fetch("/api/auth/logout.php", { method: "POST", credentials: "include" });
		alert("You have been logged out.");
		return true;
	    }
	    return false; // cancelled
	}
    },

};


# --- end: config/cookie-php-session.js ---



# --- begin: config/mock-session.js ---

  /*
 * Copyright (c) 2025 m7.org
 * License: MTL-10 (see LICENSE.md)
 */
/**
 * Default config for MockSession provider.
 * Useful for local development and testing without real login.
 */

export default {
    provider: "mock",
    
    // Preloaded user object (can be customized)
    default_validated : false,
    default_user: {
	id: "anon",
	name: "Anonymous",
	roles: []
    },
    normalize_user: (ctx,rawUser) => {
	if (!rawUser) return ctx.options.default_user;

	// Example: cookie session returns snake_case
	return {
	    id: rawUser.id,
	    name: rawUser.name,
	    roles: rawUser.roles ?? []
	};
    },
    
    login: {
	type: "fn",
	fn: (ctx, args) => {
	    return new Promise((resolve, reject) => {
		const width = 400, height = 300;
		const left = (window.screen.width / 2) - (width / 2);
		const top = (window.screen.height / 2) - (height / 2);

		// Open a blank popup
		const popup = window.open(
		    "",
		    "MockLoginPopup",
		    `width=${width},height=${height},top=${top},left=${left}`
		);

		if (!popup) {
		    return reject(new Error("Popup blocked"));
		}

		// Write HTML into the popup
		popup.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Mock Login</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          label { display:block; margin: 10px 0 5px; }
          input { width: 100%; padding: 6px; }
          button { margin-top: 15px; padding: 8px 12px; }
        </style>
      </head>
      <body>
        <h2>Mock Login</h2>
        <form id="mockLoginForm">
          <label>User ID</label>
          <input type="text" name="id" value="mockUser" required />
          <label>Name</label>
          <input type="text" name="name" value="Mock User" required />
          <button type="submit">Login</button>
        </form>
        <script>
          document.getElementById('mockLoginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const id = this.id.value || "mock";
            const name = this.name.value || "Mock User";
            window.opener.postMessage({
              type: "loginSuccess",
              user: { id, name }
            }, "*");
          });
        </script>
      </body>
      </html>
    `);

		// Wait for message from popup
		const handler = (event) => {
		    if (!event.data || event.data.type !== "loginSuccess") return;

		    window.removeEventListener("message", handler);
		    popup.close();

		    ctx.controller.user = event.data.user;
		    ctx.controller.validated = true;

		    resolve(event.data.user);
		};

		window.addEventListener("message", handler);
	    });
	}
    },
    logout: {
	type: "fn",
	fn: async (ctx, args) => {
	    if (window.confirm("Are you sure you want to log out?")) {
		alert("You have been logged out (mock).");
		return true;
	    }
	    return false; // cancelled
	}
    },

    
    // Optional login behavior (fn just replaces the mock user)
    basic_login: {
	type: "fn",
	fn: (ctx, args) => {
	    ctx.controller.user = {
		id: args?.id ?? "mock",
		name: args?.name ?? "Mock User",
		roles: args?.roles ?? ["tester"]
	    };
	    ctx.controller.validated = true;
	    return ctx.controller.user;
	}
    },

    // Optional logout behavior (fn clears the mock session)
    basic_logout: {
	type: "fn",
	fn: (ctx) => {
	    ctx.controller.user = null;
	    ctx.controller.validated = false;
	    return true;
	}
    }
};


# --- end: config/mock-session.js ---



# --- begin: src/index.js ---

/*
 * Copyright (c) 2025 m7.org
 * License: MTL-10 (see LICENSE.md)
 */
// Factory
export { SessionFactory } from "./SessionFactory.js";

// Providers
export { SessionProvider } from "./providers/SessionProvider.js";
export { CookieSession } from "./providers/CookieSession.js";

// Default = Factory (most common use case)
export { SessionFactory as default } from "./SessionFactory.js";


# --- end: src/index.js ---



# --- begin: src/providers/CookieSession.js ---

/*
 * Copyright (c) 2025 m7.org
 * License: MTL-10 (see LICENSE.md)
 */
// app/auth/CookieAuth.js
import SessionProvider from "./SessionProvider.js";

export class CookieSession extends SessionProvider {
    constructor(net,options = {}) {
	super(net,options);
    }

    cookiesPresent(cookieValues = null) {
	const requiredCookies = this?.options?.client?.cookies;
	if(!requiredCookies)
	    return true;

	if (!cookieValues)
	    cookieValues = this.getCookieValues();	    
	
	const cookieNames = Array.isArray(requiredCookies)
	      ? requiredCookies
	      : [requiredCookies];



	for (const name of cookieNames) {
	    if (!cookieValues[name]) return false;
	}
	return true;
    }

    getCookieValues() {
	// Turns "PHPSESSID=abc; another=xyz" → { PHPSESSID: "abc", another: "xyz" }
	return Object.fromEntries(
	    document.cookie.split("; ").map(c => c.split("=", 2))
	);
    }

    async clientValidation(cookieValues) {
	const fn = this.getFunction(this?.options?.client?.validation);
	if (!fn) return true; // no validator = pass
	const ctx = { controller: this, options: this.options };
	try {
	    return await fn(ctx, cookieValues);
	} catch (err) {
	    console.error("Client validation error:", err);
	    return false; // safer fallback
	}
    }


    async getSession() {
	// 1. Ensure required cookies are present
	const cookieValues = this.getCookieValues();

	if (!this.cookiesPresent(cookieValues)) {
	    console.warn('no cookies present');
	    return false;
	}


	// 2. Optional client-side cookie validation
	if (!await this.clientValidation(cookieValues)){
	    console.warn('client side validation fail');
	    return false;
	}
	const ctx = { controller: this, options: this.options };
	// 3. Server-side validation if possible
	const fetchOpts = this?.options?.fetch || {};
	const fetchFn = this.getFunction(fetchOpts?.fn);
	const fetchObject = fetchFn
	      ? fetchFn(ctx,fetchOpts, cookieValues, this.options)
	      : this.autoGenFetchObject(fetchOpts.sessionUrl, fetchOpts.method);

	const requestFn = this.getFunction(this.options.request);

	if (fetchObject || requestFn) {
	    const ok = await this.handleServerValidation(fetchObject, requestFn, cookieValues);
	    this.validated = ok;
	    return ok;
	}
	// 4. If no server validation, rely on cookies + clientValidation
	this.user = null;
	this.validated = true;
	return true;
    }


    /**
     * Handle server-side validation step.
     *
     * @param {Object|null} fetchObject - Standard fetch options (method, headers, body, etc.)
     * @param {Function|null} requestFn - Custom request override (url, cookieValues, options) => Promise<Response>
     * @param {Object} cookieValues     - Map of cookie name => value
     * @returns {Promise<boolean>}      - True if session valid, false otherwise
     */
    async handleServerValidation(fetchObject, requestFn, cookieValues) {
	let res;
	const ctx = { controller: this, options: this.options };

	if (requestFn) {
	    // Full override: let user handle the request
	    res = await requestFn(ctx, fetchObject, cookieValues, this.options);
	} else if (fetchObject) {
	    // Default: engine fetch (or net.fetch wrapper later)
	    res = fetchObject?.method == 'POST'
		? await this.net.http.post(fetchObject.url, fetchObject.data, fetchObject.options)
		: await this.net.http.get(fetchObject.url, fetchObject.options);

	} else {
	    return false; // no way to validate
	}

	// Response handler
	const responseFn = this.getFunction(this.options.response);
	if (responseFn) {
	    let result = null;
	    try {
		result = await responseFn(ctx, res, cookieValues, this.options);
	    } catch (err) {
		console.error("response validation error:", err);
		return false; // safer fallback
	    }

	    if (result === false) return false;

	    if (result === true) {
		this.user=null;
		return true; // valid but no user object
	    }

	    if (typeof result === "object" && result !== null) {
		this.user = result;
		return true;
	    }

	    return false; // anything else treated as invalid
	}
	console.warn('after response check');
	// Default: assume res.ok and JSON user
	if (res.ok) {
	    this.user = res.body;
	}

	return false;
    }


    /**
     * Generate a default Net-compatible fetch object.
     *
     * Used when no custom fetch function is provided.
     * Produces a shape that can be passed directly into
     * `net.http.get(url, options)` or `net.http.post(url, data, options)`.
     *
     * @param {string} url - Session validation endpoint
     * @param {string} [method="POST"] - HTTP method
     * @returns {{
     *   url: string,
     *   method: string,
     *   options: {
     *     credentials: string,
     *     format: string,
     *     headers?: Object,
     *     body?: Object
     *   }
     * }|null} - Net-compatible fetch descriptor, or null if no URL
     */
    autoGenFetchObject(url, method = "POST") {
	if (!url) return null;

	const m = (method || "POST").toUpperCase();

	const options = {
	    credentials: "include",
	    format: "full"
	};

	if (m === "POST") {
	    options.headers = { "Content-Type": "application/json" };
	    options.body = {}; // default empty payload; Net handles stringify
	}

	return { url, method: m, options };
    }

    
    
    
}


export default CookieSession;


# --- end: src/providers/CookieSession.js ---



# --- begin: src/providers/MockSession.js ---

/*
 * Copyright (c) 2025 m7.org
 * License: MTL-10 (see LICENSE.md)
 */
import { SessionProvider } from "./SessionProvider.js";

export class MockSession extends SessionProvider {
    constructor(net, options = {}) {
	super(net, options);

	// Preload user from options or use a default
	//this.user =options.user ?? { id: "mock", name: "Mock User" };
	//this.validated = true;
    }

    /**
     * Return the mock session/user immediately.
     * @returns {Promise<Object|null>}
     */
    async getSession(force = false) {
	return this.user;
    }

    /**
     * Clear mock session and reset state.
     */
    async logout(args = {}) {
	const logoutCfg = this.options.logout;

	// If a logout config exists, defer to SessionProvider's handling
	if (logoutCfg) {
	    return super.logout(args);
	}

	// Default mock logout
	this.user = null;
	this.validated = false;
    }

    /**
     * Recreate mock session with new args or default user.
     */
    async login(credentials = {}) {
	const loginCfg = this.options.login;
	console.warn(loginCfg);
	// If a login config exists, defer to SessionProvider's login handling
	if (loginCfg) {
	    return super.login(credentials);
	}

	// Default mock login
	this.user = {
	    id: credentials.id ?? "mock",
	    name: credentials.name ?? "Mock User",
	    ...credentials
	};
	this.validated = true;
	return this.user;
    }

    /**
     * For header-based consumers, return a fake header.
     */
    async getAuthHeaders() {
	return { "X-Mock-Auth": "enabled" };
    }
}


# --- end: src/providers/MockSession.js ---



# --- begin: src/providers/SessionProvider.js ---

/*
 * Copyright (c) 2025 m7.org
 * License: MTL-10 (see LICENSE.md)
 */
/**
 * SessionProvider Contract
 * All providers must implement these methods.
 */
export class SessionProvider{
    constructor(net, options = {}) {
	this.net = net;
	this.options = options;
	this.user = null;
	this.validated = options?.default_validated === true?true:false;
    }
    /**
     * Perform a login action.
     * @param {object} credentials Optional login data (username/password, token, etc.)
     * @returns {Promise<User>} Resolves with user object on success.
     */
    async login(credentials = {}) {
	const loginCfg = this.options.login;

	if (!loginCfg) {
	    throw new Error("Login config not defined for this provider.");
	}

	// String shorthand = redirect
	if (typeof loginCfg === "string") {
	    window.location.href = loginCfg;
	    return;
	}

	// Redirect type
	if (loginCfg.type === "redirect") {
	    const url = loginCfg.url;
	    // TODO: if args/credentials exist, append them as query or form
	    window.location.href = url;
	    return;
	}

	// Function type
	if (loginCfg.type === "fn") {
	    const fn = this.getFunction(loginCfg.fn);
	    if (!fn) throw new Error("Login function not defined.");
	    return fn({ controller: this, options: this.options }, {
		...loginCfg.args,
		...credentials
	    });
	}

	throw new Error(`Unknown login type: ${loginCfg.type}`);
    }

    /**
     * Perform a logout action.
     * @returns {Promise<void>} Resolves when complete.
     */
    async logout(args = {}) {
	const logoutCfg = this.options.logout;

	// Function type
	if (logoutCfg?.type === "fn") {
	    const fn = this.getFunction(logoutCfg.fn);
	    if (!fn) throw new Error("Logout function not defined.");

	    const resp = await fn(
		{ controller: this, options: this.options },
		{ ...logoutCfg.args, ...args }
	    );

	    if (resp) this.clearSession();
	    return;
	}

	// Default: clear immediately
	this.clearSession();

	if (!logoutCfg) return;

	// String shorthand = redirect
	if (typeof logoutCfg === "string") {
	    window.location.href = logoutCfg;
	    return;
	}

	// Redirect type
	if (logoutCfg.type === "redirect") {
	    const url = logoutCfg.url;
	    window.location.href = url;
	    return;
	}
    }

    clearSession() {
	this.user = null;
	this.validated = false;
    }
    
    /**
     * Retrieve the current user object.
     * @returns {Promise<User|null>} Resolves with user info, or null if not logged in.
     */
    /**
 * Retrieve a normalized user object.
 * Always runs through normalize_user() if provided.
 * Falls back to default_user if no user present.
 *
 * @returns {Object|null}
 */
    getUser() {
	const normalizer = this.options?.normalize_user;
	const rawUser = this.user;

	if (typeof normalizer === "function") {
	    return normalizer({ controller: this, options: this.options }, rawUser );
	}

	if (rawUser) return rawUser;

	return this.options?.default_user ?? null;
    }

    /**
     * Check if user is logged in.
     * @returns {boolean} True if a session/token/cookie is valid.
     */
    isLoggedIn(){
        return this.validated;
    }

    async getSession() {
	const msg = "getSession() must be implemented in a session provider class.";
	alert(msg);
	throw new Error(msg);
    }
    /**
     * Return auth-related headers for API requests.
     * @returns {Promise<object>} Key-value headers (e.g., { Authorization: "Bearer ..." })
     */
    async getAuthHeaders() {}

    
    getFunction(value) {
	if (typeof value === "function") return value;
	if (typeof value === "string" && typeof window[value] === "function") {
	    return window[value]; // return the actual function, not the string
	}
	return null;
    }

}
export default SessionProvider;


# --- end: src/providers/SessionProvider.js ---



# --- begin: src/SessionFactory.js ---

/*
 * Copyright (c) 2025 m7.org
 * License: MTL-10 (see LICENSE.md)
 */
// SessionFactory.js
import { CookieSession }  from "./providers/CookieSession.js";
import { MockSession }    from "./providers/MockSession.js";
//import { OAuthSession } from "./providers/OAuthSession.js";

export function SessionFactory(net, config) {
    const { provider, ...options } = config ?? {};
    
    switch (provider) {
    case "cookie":
	return new CookieSession(net, options);
    //case "oauth":
	//return new OAuthSession(options);
    case "mock":
	return new MockSession(net,options);
    default:
	throw new Error("provider must be specified");
    }
}

export default SessionFactory;


# --- end: src/SessionFactory.js ---

