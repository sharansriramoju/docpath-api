import {
  createPatientDiagnosticRepository,
  deletePatientDiagnosticRepository,
  getPatientDiagnosticByIdRepository,
  getPatientDiagnosticsRepository,
  updatePatientDiagnosticRepository,
} from "../database/repositories/patientDiagnostics.repository";
import { ApiError } from "../errors/ApiError";
import {
  decryptPII,
  deleteFileFromS3,
  uploadFileToS3,
} from "../helpers/index.helper";

export const createPatientDiagnosticService = async (
  data: {
    patient_id: string;
    description?: string;
    created_by_id: string;
  },
  file: Express.Multer.File | undefined,
) => {
  let media_url: string | undefined;
  let media_key: string | undefined;
  let media_type: string | undefined;

  if (file) {
    const upload_result = await uploadFileToS3(file, "patient-diagnostics");
    media_url = upload_result.url;
    media_key = upload_result.key;
    media_type = file.mimetype;
  }

  return await createPatientDiagnosticRepository({
    patient_id: data.patient_id,
    description: data.description,
    media_url,
    media_key,
    media_type,
    created_by_id: data.created_by_id,
  });
};

export const getPatientDiagnosticsService = async (query: {
  patient_id: string;
  page: number;
  limit: number;
}) => {
  const offset = (query.page - 1) * query.limit;
  const { rows, count } = await getPatientDiagnosticsRepository({
    patient_id: query.patient_id,
    limit: query.limit,
    offset,
  });

  const decrypted_rows = rows.map((row) => {
    const plain = row.toJSON() as any;
    if (plain.created_by?.name) {
      plain.created_by.name = decryptPII(plain.created_by.name);
    }
    return plain;
  });

  return { rows: decrypted_rows, count };
};

export const getPatientDiagnosticByIdService = async (
  diagnostic_id: string,
) => {
  const diagnostic = await getPatientDiagnosticByIdRepository(diagnostic_id);
  if (!diagnostic) {
    throw new ApiError(404, "Patient diagnostic not found");
  }
  console.log("diagnostic", diagnostic);
  const plain = diagnostic.toJSON() as any;
  if (plain.created_by?.name) {
    plain.created_by.name = decryptPII(plain.created_by.name);
  }
  return plain;
};

export const updatePatientDiagnosticService = async (
  diagnostic_id: string,
  data: { description?: string },
  file: Express.Multer.File | undefined,
) => {
  const diagnostic = await getPatientDiagnosticByIdRepository(diagnostic_id);
  if (!diagnostic) {
    throw new ApiError(404, "Patient diagnostic not found");
  }

  const update_data: Record<string, string> = {};
  if (data.description !== undefined)
    update_data.description = data.description;

  if (file) {
    if (diagnostic.media_key) {
      await deleteFileFromS3(diagnostic.media_key);
    }
    const upload_result = await uploadFileToS3(file, "patient-diagnostics");
    update_data.media_url = upload_result.url;
    update_data.media_key = upload_result.key;
    update_data.media_type = file.mimetype;
  }

  if (Object.keys(update_data).length === 0) {
    throw new ApiError(
      400,
      "At least one of description or file must be provided",
    );
  }

  return await updatePatientDiagnosticRepository(diagnostic_id, update_data);
};

export const deletePatientDiagnosticService = async (diagnostic_id: string) => {
  const diagnostic = await getPatientDiagnosticByIdRepository(diagnostic_id);
  if (!diagnostic) {
    throw new ApiError(404, "Patient diagnostic not found");
  }

  if (diagnostic.media_key) {
    await deleteFileFromS3(diagnostic.media_key);
  }

  await deletePatientDiagnosticRepository(diagnostic_id);
};
