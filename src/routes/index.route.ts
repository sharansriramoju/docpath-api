import { Router } from "express";
import usersRoute from "./users.route";
import authenticationRoute from "./authentication.route";
import locationsRoute from "./locations.route";

const router = Router();

export default (): Router => {
  usersRoute(router);
  authenticationRoute(router);
  locationsRoute(router);
  return router;
};
