import { Router } from "express";
import {
  authorize,
  isAuthenticated,
  validate,
  validateQuery,
} from "../middlewares/index.middleware";
import {
  addDoctorRoutineValidation,
  getDoctorRoutineValidation,
} from "../validations/doctorRoutine.validation";
import {
  addDoctorRoutineController,
  getDoctorRoutineController,
} from "../controller/doctorRoutine.controller";

export default (router: Router) => {
  router.post(
    "/doctor-routine",
    isAuthenticated,
    authorize("create", "DoctorRoutine"),
    validate(addDoctorRoutineValidation),
    addDoctorRoutineController,
  );
  router.get(
    "/doctor-routine",
    isAuthenticated,
    authorize("read", "DoctorRoutine"),
    validateQuery(getDoctorRoutineValidation),
    getDoctorRoutineController,
  );
};
