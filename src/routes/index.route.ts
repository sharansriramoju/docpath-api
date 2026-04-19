import { Router } from "express";
import usersRoute from "./users.route";

const router = Router();

export default (): Router => {
  usersRoute(router);
  return router;
};
