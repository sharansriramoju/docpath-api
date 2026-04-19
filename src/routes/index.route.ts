import { Router } from "express";
import usersRoute from "./users.route";
import authenticationRoute from "./authentication.route";

const router = Router();

export default (): Router => {
  usersRoute(router);
  authenticationRoute(router);
  return router;
};
