/*
 * Copyright (c) 2025 m7.org
 * License: MTL-10 (see LICENSE.md)
 */
// SessionFactory.js
import { CookieSession }  from "./providers/CookieSession.js";
import { MockSession }    from "./providers/MockSession.js";
import { BffRefreshTokenSession} from "./BffRefreshTokenSession.js";
//import { OAuthSession } from "./providers/OAuthSession.js";

export function SessionFactory(net, config) {
    const { provider, ...options } = config ?? {};
    
    switch (provider) {
    case "bff" :
	return new BffRefreshTokenSession(net,options);
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
