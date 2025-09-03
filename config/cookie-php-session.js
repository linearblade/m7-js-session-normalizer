/*
 * Copyright (c) 2025 m7.org
 * License: MTL-10 (see LICENSE.md)
 */

/*
 * ---------------------------------------------------------------------
 * CookieSession Provider (Popup-based Authentication)
 * ---------------------------------------------------------------------
 *
 * 🔹 How external IdPs normally work (Google, GitHub, etc.)
 * - The parent app opens a popup to the IdP’s authorization URL.
 * - The user signs in on the IdP’s domain.
 * - The IdP redirects the popup to a callback URL that *you* host
 *   (e.g. /auth/callback.html).
 * - That callback page runs a small script to parse tokens/codes
 *   and calls: window.opener.postMessage({ type: "oauthCallback", ... })
 * - The parent receives this message, exchanges the code with the
 *   backend, and establishes a session (cookie or token).
 *
 * 🔹 How this provider abstracts the flow
 * - Since we control both the popup page and the backend, we can
 *   simplify: instead of redirecting back, our popup itself (login.html,
 *   signup.html, profile.html) directly posts back to the opener when
 *   the form succeeds.
 * - This lets us avoid the OAuth redirect/callback step entirely.
 * - The parent receives "loginSuccess", "signupSuccess", or
 *   "profileSuccess", and updates ctx.controller.user accordingly.
 * - Optionally, we refresh the session with getSession() to pull
 *   canonical user data from /api/auth/me.php.
 *
 * 🔹 How to adapt this for your own use
 * - If using your own backend (PHP, Node, etc.):
 *   - Point login/signup/profile popups at your endpoints.
 *   - Ensure those pages call postMessage() back to opener on success.
 *   - Update the response handler here if your backend’s JSON differs.
 *
 * - If using an external IdP (Google, GitHub, etc.):
 *   - Replace the popup URL with the IdP’s authorization endpoint.
 *   - Host a /auth/callback.html that receives the redirect.
 *   - In callback.html, parse the code/token and postMessage it back
 *     to the opener.
 *   - Modify this provider to exchange that code with your backend
 *     for a valid session cookie.
 *
 * 🔒 Security Notes
 * - Always validate event.origin in production when receiving messages.
 * - Never trust raw data from postMessage; always confirm session state
 *   by calling getSession() after success.
 * - Use HTTPS everywhere when dealing with authentication flows.
 *
 * ---------------------------------------------------------------------
 */


/**
 * Default config for CookieSession provider.
 * Useful for cookie/session-based auth flows.
 */
// module/global scoped trackers
let activeLogin = null; 
let activeSignup = null;  
let activeProfile = null;

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
	    avatar: rawUser.avatar || null,
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
    signup: {
        type: "fn",
        fn: (ctx, args) => {
            return new Promise((resolve, reject) => {
                // clean up previous signup attempt
                if (activeSignup) {
                    if (activeSignup.popup && !activeSignup.popup.closed) {
                        activeSignup.popup.close();
                    }
                    window.removeEventListener("message", activeSignup.handler);
                    clearInterval(activeSignup.timer);
                    activeSignup = null;
                }

                const width = 500, height = 650;
                const left = (window.screen.width / 2) - (width / 2);
                const top = (window.screen.height / 2) - (height / 2);

                const popup = window.open(
                    args?.url ?? "/signup.html",
                    "SignupPopup",
                    `width=${width},height=${height},top=${top},left=${left}`
                );

                if (!popup) return reject(new Error("Popup blocked"));

                const handler = (event) => {
                    if (!event.data || event.data.type !== "signupSuccess") return;

                    window.removeEventListener("message", handler);
                    clearInterval(timer);
                    activeSignup = null;

                    popup.close();
                    ctx.controller.user = event.data.user;
                    ctx.controller.validated = true;

                    resolve(event.data.user);
                };

                window.addEventListener("message", handler);

                const timer = setInterval(() => {
                    if (popup.closed) {
                        window.removeEventListener("message", handler);
                        clearInterval(timer);
                        activeSignup = null;
                        reject(new Error("Signup popup closed or timed out"));
                    }
                }, 500);

                // store active tracker
                activeSignup = { popup, handler, timer };
            });
        },
        args: { url: "/signup.html" }
    },
profile: {
    type: "fn",
    fn: (ctx, args) => {
        return new Promise((resolve, reject) => {
            if (activeProfile) {
                if (activeProfile.popup && !activeProfile.popup.closed) {
                    activeProfile.popup.close();
                }
                window.removeEventListener("message", activeProfile.handler);
                clearInterval(activeProfile.timer);
                activeProfile = null;
            }

            const width = 500, height = 600;
            const left = (window.screen.width / 2) - (width / 2);
            const top = (window.screen.height / 2) - (height / 2);

            const popup = window.open(
                args?.url ?? "/profile.html",
                "ProfilePopup",
                `width=${width},height=${height},top=${top},left=${left}`
            );

            if (!popup) return reject(new Error("Popup blocked"));

            const handler = async (event) => {
                if (!event.data || event.data.type !== "profileSuccess") return;

                window.removeEventListener("message", handler);
                clearInterval(timer);
                activeProfile = null;

                popup.close();

                const user = await ctx.controller.getSession();
                resolve(user);
            };

            window.addEventListener("message", handler);

            const timer = setInterval(async () => {
                if (popup.closed) {
                    window.removeEventListener("message", handler);
                    clearInterval(timer);
                    activeProfile = null;

                    // Always refresh session when popup closes
                    const user = await ctx.controller.getSession();
                    resolve(user);
                }
            }, 500);

            activeProfile = { popup, handler, timer };
        });
    },
    args: { url: "/profile.html" }
},

};
