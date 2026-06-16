import { Router } from "express";
import {
  authorize,
  isAuthenticated,
  validate,
  validateQuery,
} from "../middlewares/index.middleware";
import {
  createAppointmentSchema,
  getAppointmentsOverviewSchema,
  getAppointmentsSchema,
} from "../validations/appointments.validation";
import {
  createAppointmentController,
  getAppointmentsController,
  getAppointmentsOverviewController,
} from "../controller/appointments.controller";

export default (router: Router) => {
  router.post(
    "/appointments",
    isAuthenticated,
    authorize("create", "Appointments"),
    validate(createAppointmentSchema),
    createAppointmentController,
  );
  router.get(
    "/appointments/overview",
    isAuthenticated,
    authorize("read", "Appointments"),
    validateQuery(getAppointmentsOverviewSchema),
    getAppointmentsOverviewController,
  );
  router.get(
    "/appointments",
    isAuthenticated,
    authorize("read", "Appointments"),
    validateQuery(getAppointmentsSchema),
    getAppointmentsController,
  );
};
