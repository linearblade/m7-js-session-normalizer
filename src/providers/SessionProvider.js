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
