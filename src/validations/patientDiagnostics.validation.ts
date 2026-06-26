import z from "zod";

export const createPatientDiagnosticSchema = z.object({
  patient_id: z.uuid(),
  description: z.string().optional(),
});

export const diagnosticIdParamsSchema = z.object({
  diagnostic_id: z.uuid(),
});

export const patientIdParamsSchema = z.object({
  patient_id: z.uuid(),
});

export const getPatientDiagnosticsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const updatePatientDiagnosticSchema = z.object({
  description: z.string().optional(),
});
