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
