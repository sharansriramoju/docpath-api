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
  updateDoctorRoutineValidation,
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
  router.get(
    "/doctor-routine/:doctor_id/:routine_id",
    isAuthenticated,
    authorize("read", "DoctorRoutine"),
    getDoctorRoutineByIdController,
  );
  router.put(
    "/doctor-routine/:doctor_id/:routine_id",
    isAuthenticated,
    authorize("update", "DoctorRoutine"),
    validate(updateDoctorRoutineValidation),
    updateDoctorRoutineController,
  );
};
