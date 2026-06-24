import { Router } from "express";
import {
  authorize,
  isAuthenticated,
  validate,
  validateParams,
  validateQuery,
} from "../middlewares/index.middleware";
import { upload } from "../middlewares/upload.middleware";
import {
  createPatientDiagnosticSchema,
  diagnosticIdParamsSchema,
  getPatientDiagnosticsQuerySchema,
  patientIdParamsSchema,
  updatePatientDiagnosticSchema,
} from "../validations/patientDiagnostics.validation";
import {
  createPatientDiagnosticController,
  deletePatientDiagnosticController,
  getPatientDiagnosticByIdController,
  getPatientDiagnosticsController,
  updatePatientDiagnosticController,
} from "../controller/patientDiagnostics.controller";

export default (router: Router) => {
  router.post(
    "/patient-diagnostics",
    isAuthenticated,
    authorize("create", "PatientDiagnostics"),
    upload.single("file"),
    validate(createPatientDiagnosticSchema),
    createPatientDiagnosticController,
  );
  router.get(
    "/patient-diagnostics/patient/:patient_id",
    isAuthenticated,
    authorize("read", "PatientDiagnostics"),
    validateParams(patientIdParamsSchema),
    validateQuery(getPatientDiagnosticsQuerySchema),
    getPatientDiagnosticsController,
  );
  router.get(
    "/patient-diagnostics/:diagnostic_id",
    isAuthenticated,
    authorize("read", "PatientDiagnostics"),
    validateParams(diagnosticIdParamsSchema),
    getPatientDiagnosticByIdController,
  );
  router.put(
    "/patient-diagnostics/:diagnostic_id",
    isAuthenticated,
    authorize("update", "PatientDiagnostics"),
    validateParams(diagnosticIdParamsSchema),
    upload.single("file"),
    validate(updatePatientDiagnosticSchema),
    updatePatientDiagnosticController,
  );
  router.delete(
    "/patient-diagnostics/:diagnostic_id",
    isAuthenticated,
    authorize("delete", "PatientDiagnostics"),
    validateParams(diagnosticIdParamsSchema),
    deletePatientDiagnosticController,
  );
};
