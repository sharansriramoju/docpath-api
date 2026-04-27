import { Router } from "express";
import {
  authorize,
  isAuthenticated,
  validate,
} from "../middlewares/index.middleware";
import { addDoctorRoutineValidation } from "../validations/doctorRoutine.validation";

export default (router: Router) => {
  router.post(
    "/doctor-routine",
    isAuthenticated,
    authorize("create", "DoctorRoutine"),
    validate(addDoctorRoutineValidation),
  );
};
