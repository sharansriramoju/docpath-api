import { Router } from "express";
import {
  authorize,
  isAuthenticated,
  validate,
} from "../middlewares/index.middleware";
import { addDoctorRoutineValidation } from "../validations/doctorRoutine.validation";
import { addDoctorRoutineController } from "../controller/doctorRoutine.controller";

export default (router: Router) => {
  router.post(
    "/doctor-routine",
    isAuthenticated,
    authorize("create", "DoctorRoutine"),
    validate(addDoctorRoutineValidation),
    addDoctorRoutineController,
  );
  // router.get("/docto");
};
