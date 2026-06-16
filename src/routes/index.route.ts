import { Router } from "express";
import usersRoute from "./users.route";
import authenticationRoute from "./authentication.route";
import locationsRoute from "./locations.route";
import doctorRoutineRoute from "./doctorRoutine.route";
import appointmentsRoute from "./appointments.route";
import rolesRoute from "./roles.route";

const router = Router();

export default (): Router => {
  usersRoute(router);
  authenticationRoute(router);
  locationsRoute(router);
  doctorRoutineRoute(router);
  appointmentsRoute(router);
  rolesRoute(router);
  return router;
};
