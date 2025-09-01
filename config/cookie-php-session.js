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
