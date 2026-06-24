import { Router } from "express";
import {
  authorize,
  isAuthenticated,
  isDoctor,
  validate,
  validateParams,
  validateQuery,
} from "../middlewares/index.middleware";
import {
  appointmentIdParamsSchema,
  createAppointmentSchema,
  getAppointmentsOverviewSchema,
  getAppointmentsSchema,
  rescheduleAppointmentSchema,
  updateAppointmentNotesSchema,
} from "../validations/appointments.validation";
import {
  cancelAppointmentController,
  createAppointmentController,
  getAppointmentNotesController,
  getAppointmentsController,
  getAppointmentsOverviewController,
  rescheduleAppointmentController,
  updateAppointmentNotesController,
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
  router.patch(
    "/appointments/:appointment_id/notes",
    isAuthenticated,
    isDoctor,
    validateParams(appointmentIdParamsSchema),
    authorize("update", "Appointments"),
    validate(updateAppointmentNotesSchema),
    updateAppointmentNotesController,
  );
  router.get(
    "/appointments/:appointment_id/notes",
    isAuthenticated,
    isDoctor,
    validateParams(appointmentIdParamsSchema),
    authorize("read", "Appointments"),
    getAppointmentNotesController,
  );
  router.patch(
    "/appointments/:appointment_id/reschedule",
    isAuthenticated,
    validateParams(appointmentIdParamsSchema),
    authorize("update", "Appointments"),
    validate(rescheduleAppointmentSchema),
    rescheduleAppointmentController,
  );
  router.patch(
    "/appointments/:appointment_id/cancel",
    isAuthenticated,
    validateParams(appointmentIdParamsSchema),
    authorize("update", "Appointments"),
    cancelAppointmentController,
  );
};
