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


    async signup(ctx, credentials = {}) {
	return this._delegateAction('signup', ctx, credentials);
    }
    async login(ctx, credentials = {}) {
	return this._delegateAction('login', ctx, credentials);
    }

    async profile(ctx, data = null) {
	return this._delegateAction('profile', ctx, data);
	//not sure this will work the way I want it yet.
	/*
	if (data) {
	    // Update profile
	    return this._delegate('profile.update', ctx, data);
	} else {
	    // Fetch profile
	    return this._delegate('profile.get', ctx);
	}*/
    }

    /**
     * Generic delegate for session actions (login, signup, profile, etc.) - logout differs slightly, has its own function
     * @param {string} action - Action key in config (e.g. "login", "signup").
     * @param {object} args   - Arguments to pass (credentials, payload, etc.)
     * @returns {Promise<any>}
     */
    async _delegateAction(action, args = {}) {
	const cfg = this.options[action];

	if (!cfg) {
            throw new Error(`${action} config not defined for this provider.`);
	}

	// String shorthand → redirect
	if (typeof cfg === "string") {
            window.location.href = cfg;
            return;
	}

	// Explicit redirect type
	if (cfg.type === "redirect") {
            const url = cfg.url;
            // TODO: if args exist, append as querystring or form post
            window.location.href = url;
            return;
	}

	// Function type
	if (cfg.type === "fn") {
            const fn = this.getFunction(cfg.fn);
            if (!fn) throw new Error(`${action} function not defined.`);
            return fn(
		{ controller: this, options: this.options },
		{ ...cfg.args, ...args }
            );
	}

	throw new Error(`Unknown ${action} type: ${cfg.type}`);
    }

    
    /**
     * Perform a logout action.
     * @returns {Promise<void>} Resolves when complete.
     * // NOTE: logout intentionally does not use _delegateAction.
     * // Reason: logout must always clear local session state, while other actions
     * // (login/signup/profile) only set state if successful.
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
