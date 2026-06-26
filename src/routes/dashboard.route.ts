import { Router } from "express";
import { isAuthenticated, validateQuery } from "../middlewares/index.middleware";
import {
  appointmentTrendsQuerySchema,
  dateRangeOptionalQuerySchema,
  newPatientRegistrationsQuerySchema,
} from "../validations/dashboard.validation";
import {
  getAppointmentTrendsController,
  getNewPatientRegistrationsController,
  getPatientVolumeByLocationController,
  getPeakAppointmentHoursController,
  getTodayAppointmentsController,
  getTotalPatientsController,
} from "../controller/dashboard.controller";

export default (router: Router) => {
  router.get(
    "/dashboard/total-patients",
    isAuthenticated,
    getTotalPatientsController,
  );
  router.get(
    "/dashboard/today-appointments",
    isAuthenticated,
    getTodayAppointmentsController,
  );
  router.get(
    "/dashboard/appointment-trends",
    isAuthenticated,
    validateQuery(appointmentTrendsQuerySchema),
    getAppointmentTrendsController,
  );
  router.get(
    "/dashboard/patient-volume-by-location",
    isAuthenticated,
    validateQuery(dateRangeOptionalQuerySchema),
    getPatientVolumeByLocationController,
  );
  router.get(
    "/dashboard/new-patient-registrations",
    isAuthenticated,
    validateQuery(newPatientRegistrationsQuerySchema),
    getNewPatientRegistrationsController,
  );
  router.get(
    "/dashboard/peak-appointment-hours",
    isAuthenticated,
    validateQuery(dateRangeOptionalQuerySchema),
    getPeakAppointmentHoursController,
  );
};
