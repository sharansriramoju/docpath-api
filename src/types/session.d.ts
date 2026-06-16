// src/types/express-session.d.ts
import "express-session";

declare module "express-session" {
  interface SessionData {
    user?: any;
    ability?: any;
    saml_request_info?: any;
    relay_state?: string;
  }
}
