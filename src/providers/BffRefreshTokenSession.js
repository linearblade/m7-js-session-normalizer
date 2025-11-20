/**
 * Implements the BFF (Backend-for-Frontend) pattern with secure refresh token rotation.
 *
 * - Refresh token stored in an HttpOnly, Secure, SameSite=Lax cookie
 * - Access tokens are obtained via the BFF and kept in memory only
 * - Refresh token rotates on every use (OAuth 2.1 best practice)
 * - Tokens are bound to a client fingerprint to prevent replay and session theft
 *
 * @see https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps
 * @see https://oauth.net/2.1/
 */
/*
 * Copyright (c) 2025 m7.org
 * License: MTL-10 (see LICENSE.md)
 */



import SessionProvider from "./SessionProvider.js";

export class BffRefreshTokenSession extends SessionProvider {
    constructor(net,options = {}) {
	super(net,options);
    }


    /**
     * General-purpose cookie presence check.
     * Check if one or more cookies exist.
     *
     * @param {string|string[]|null} names
     *        - null → returns true if *any* cookies exist.
     *        - string/array → checks for specific cookie names.
     *
     * @param {boolean} isDefined
     *        - false (default) → only tests that the cookie key exists.
     *        - true → require cookie to have a *non-empty* value.
     *
     * @returns {boolean}
     */
    cookiesExist(names = null, isDefined = false) {
	const cookieValues = this.getCookieValues();

	// If no specific cookie names → return true if *any* cookies exist
	if (names === null) {
            return Object.keys(cookieValues).length > 0;
	}

	const list = Array.isArray(names) ? names : [names];

	for (const name of list) {
            // 1) Key must exist
            if (!(name in cookieValues)) return false;

            // 2) If requiring a defined value → must not be empty
            if (isDefined && (cookieValues[name] === "" || cookieValues[name] == null)) {
		return false;
            }
	}

	return true;
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

    /**
     * Parse document.cookie into a clean key/value object.
     *
     * This utility converts the browser's cookie string
     * (e.g. "a=1; b=2; =bad; c=3") into a normalized object:
     *   { a: "1", b: "2", c: "3" }
     *
     * Invalid or malformed entries are discarded, including:
     *   - cookies with no name (e.g. "=value")
     *   - entries missing "="
     *   - trailing empty segments
     *
     * @returns {Object} An object mapping cookie names to values.
     */
    getCookieValues() {
	return Object.fromEntries(
            document.cookie
		.split("; ")
		.map(c => c.split("=", 2))
		.filter(([k, v]) => k && v !== undefined)
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
	// 1. Read cookies (for client-side validation only)
	const cookieValues = this.getCookieValues();

	// BFF ALWAYS requires backend validation.
	// Cookies DO NOT indicate session validity.
	// This step ONLY applies optional client-side validation rules.
	if (!await this.clientValidation(cookieValues)) {
            console.warn("client side validation fail");
            return false;
	}

	const ctx = { controller: this, options: this.options };

	// 2. Construct server-side validation object
	const fetchOpts   = this?.options?.fetch || {};
	const fetchFn     = this.getFunction(fetchOpts?.fn);
	const fetchObject = fetchFn
              ? fetchFn(ctx, fetchOpts, cookieValues, this.options)
              : this.autoGenFetchObject(fetchOpts.sessionUrl, fetchOpts.method);

	const requestFn = this.getFunction(this.options.request);

	// 3. ALWAYS perform backend validation if possible
	if (fetchObject || requestFn) {
            const ok = await this.handleServerValidation(
		fetchObject,
		requestFn,
		cookieValues
            );

            this.validated = ok;
            return ok;
	}

	// 4. No server validation route → cannot validate BFF session
	this.user = null;
	this.validated = false;
	return false;
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


export default BffRefreshTokenSession;
