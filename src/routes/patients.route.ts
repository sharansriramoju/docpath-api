import { Router } from "express";
import {
  authorize,
  isAuthenticated,
  validate,
  validateParams,
  validateQuery,
} from "../middlewares/index.middleware";
import {
  createPatientSchema,
  getPatientsSchema,
  patientIdParamsSchema,
  updatePatientSchema,
} from "../validations/patients.validation";
import {
  createPatientController,
  deletePatientController,
  getPatientByIdController,
  getPatientByPhoneController,
  getPatientsController,
  updatePatientController,
} from "../controller/patients.controller";

export default (router: Router) => {
  router.post(
    "/patients",
    isAuthenticated,
    authorize("create", "Patients"),
    validate(createPatientSchema),
    createPatientController,
  );
  router.get(
    "/patient/:phone",
    isAuthenticated,
    authorize("read", "Patients"),
    getPatientByPhoneController,
  );
  router.get(
    "/patients",
    isAuthenticated,
    authorize("read", "Patients"),
    validateQuery(getPatientsSchema),
    getPatientsController,
  );
  router.get(
    "/patients/:user_id",
    isAuthenticated,
    validateParams(patientIdParamsSchema),
    authorize("read", "Patients"),
    getPatientByIdController,
  );
  router.put(
    "/patients/:user_id",
    isAuthenticated,
    validateParams(patientIdParamsSchema),
    authorize("update", "Patients"),
    validate(updatePatientSchema),
    updatePatientController,
  );
  router.delete(
    "/patients/:user_id",
    isAuthenticated,
    validateParams(patientIdParamsSchema),
    authorize("delete", "Patients"),
    deletePatientController,
  );
};
