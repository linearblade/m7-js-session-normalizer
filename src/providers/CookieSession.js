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
