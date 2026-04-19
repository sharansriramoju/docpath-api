// src/types/express-session.d.ts
import "express-session";

declare module "express-session" {
  interface SessionData {
    user?: any;
    ability?: any;
    samlRequestInfo?: any;
    relayState?: string;
  }
}
