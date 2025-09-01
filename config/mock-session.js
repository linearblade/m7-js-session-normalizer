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
