import express from "express";
import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import "dotenv/config";
import { ForbiddenError } from "@casl/ability";
import { defineAbilityFor } from "../authorization/defineAbility";

const jwtSecret = process.env.HA_JWT_SECRET as string;

// Custom function to extract JWT from cookies
const extractJWTFromCookie = (req: express.Request) => {
  if (req && req.cookies) {
    return req.cookies["token"]; // Name of the cookie containing JWT
  }
  return null;
};

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromExtractors([extractJWTFromCookie]), // Custom extractor
  secretOrKey: jwtSecret,
};

passport.use(
  new JwtStrategy(jwtOptions, (jwtPayload, done) => {
    return done(null, jwtPayload);
  }),
);

export const isAuthenticated = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  passport.authenticate(
    "jwt",
    { session: false },
    async (err: any, user: any, info: any) => {
      if (err || !user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (!req.session.user) {
        return res
          .status(401)
          .json({ message: "Session expired, please login again" });
      }
      req.user = user;
      next();
      return;
    },
  )(req, res, next);
};

export const validate =
  (schema: any) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
      return;
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message:
          JSON.parse(err.message)[0].message +
            " at " +
            JSON.parse(err.message)[0].path || "Invalid request data",
      });
    }
  };

export const validateQuery =
  (schema: any) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      schema.parse(req.query);
      next();
      return;
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message:
          JSON.parse(err.message)[0].message +
            " at " +
            JSON.parse(err.message)[0].path || "Invalid query parameters",
      });
    }
  };

export function authorize(action: string, subject: string) {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const ability = defineAbilityFor(req.session.user);

    // optional: store ability if you want it later
    req.session.ability = ability;

    try {
      ForbiddenError.from(ability).throwUnlessCan(action, subject);

      return next();
    } catch (error) {
      return next(error);
    }
  };
}
