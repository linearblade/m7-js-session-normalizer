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


    signup: {
        type: "fn",
        fn: (ctx, args) => {
            return new Promise((resolve, reject) => {
                const width = 400, height = 350;
                const left = (window.screen.width / 2) - (width / 2);
                const top = (window.screen.height / 2) - (height / 2);

                const popup = window.open(
                    "",
                    "MockSignupPopup",
                    `width=${width},height=${height},top=${top},left=${left}`
                );

                if (!popup) return reject(new Error("Popup blocked"));

                popup.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Mock Signup</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          label { display:block; margin: 10px 0 5px; }
          input { width: 100%; padding: 6px; }
          button { margin-top: 15px; padding: 8px 12px; }
        </style>
      </head>
      <body>
        <h2>Mock Signup</h2>
        <form id="mockSignupForm">
          <label>User ID</label>
          <input type="text" name="id" value="newUser" required />
          <label>Name</label>
          <input type="text" name="name" value="New User" required />
          <label>Email</label>
          <input type="email" name="email" value="user@example.com" required />
          <button type="submit">Create Account</button>
        </form>
        <script>
          document.getElementById('mockSignupForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const id = this.id.value || "newUser";
            const name = this.name.value || "New User";
            const email = this.email.value || "user@example.com";
            window.opener.postMessage({
              type: "signupSuccess",
              user: { id, name, email }
            }, "*");
          });
        </script>
      </body>
      </html>
    `);

                const handler = (event) => {
                    if (!event.data || event.data.type !== "signupSuccess") return;
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

    profile: {
        type: "fn",
        fn: (ctx, args) => {
            return new Promise((resolve, reject) => {
                const width = 400, height = 300;
                const left = (window.screen.width / 2) - (width / 2);
                const top = (window.screen.height / 2) - (height / 2);

                const popup = window.open(
                    "",
                    "MockProfilePopup",
                    `width=${width},height=${height},top=${top},left=${left}`
                );

                if (!popup) return reject(new Error("Popup blocked"));

                const current = ctx.controller.user || { id: "mock", name: "Mock User", avatar: "" };

                popup.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Mock Profile</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          label { display:block; margin: 10px 0 5px; }
          input { width: 100%; padding: 6px; }
          img.preview { display:block; margin: 10px 0; max-width: 150px; border: 1px solid #ccc; }
          button { margin-top: 15px; padding: 8px 12px; }
        </style>
      </head>
      <body>
        <h2>Mock Profile</h2>
        <form id="mockProfileForm">
          <label>Display Name</label>
          <input type="text" name="name" value="${current.name}" required />
          <label>Avatar URL</label>
          <input type="url" name="avatar" value="${current.avatar || ""}" />
          <img id="avatarPreview" class="preview" src="${current.avatar || ""}" />
          <button type="submit">Save Profile</button>
        </form>
        <script>
          const avatarInput = document.querySelector('input[name="avatar"]');
          const avatarPreview = document.getElementById('avatarPreview');
          avatarInput.addEventListener('input', () => {
            const url = avatarInput.value.trim();
            avatarPreview.src = url || "";
            avatarPreview.style.display = url ? "block" : "none";
          });
          document.getElementById('mockProfileForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const name = this.name.value;
            const avatar = this.avatar.value;
            window.opener.postMessage({
              type: "profileSuccess",
              user: { ...${JSON.stringify(current)}, name, avatar }
            }, "*");
          });
        </script>
      </body>
      </html>
    `);

                const handler = (event) => {
                    if (!event.data || event.data.type !== "profileSuccess") return;
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
