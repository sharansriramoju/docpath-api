import { Router } from "express";
import {
  authorize,
  isAuthenticated,
  validate,
  validateParams,
  validateQuery,
} from "../middlewares/index.middleware";
import {
  addDoctorRoutineSchema,
  doctorRoutineParamsSchema,
  getDoctorRoutineSchema,
  updateDoctorRoutineSchema,
} from "../validations/doctorRoutine.validation";
import {
  addDoctorRoutineController,
  getDoctorRoutineByIdController,
  getDoctorRoutineController,
  updateDoctorRoutineController,
} from "../controller/doctorRoutine.controller";

export default (router: Router) => {
  router.post(
    "/doctor-routine",
    isAuthenticated,
    authorize("create", "DoctorRoutine"),
    validate(addDoctorRoutineSchema),
    addDoctorRoutineController,
  );
  router.get(
    "/doctor-routine",
    isAuthenticated,
    authorize("read", "DoctorRoutine"),
    validateQuery(getDoctorRoutineSchema),
    getDoctorRoutineController,
  );
  router.get(
    "/doctor-routine/:doctor_id/:routine_id",
    isAuthenticated,
    validateParams(doctorRoutineParamsSchema),
    authorize("read", "DoctorRoutine"),
    getDoctorRoutineByIdController,
  );
  router.put(
    "/doctor-routine/:doctor_id/:routine_id",
    isAuthenticated,
    validateParams(doctorRoutineParamsSchema),
    authorize("update", "DoctorRoutine"),
    validate(updateDoctorRoutineSchema),
    updateDoctorRoutineController,
  );
};
