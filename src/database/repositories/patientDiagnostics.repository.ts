import { Transaction } from "sequelize";
import { PatientDiagnostic, User } from "../models";

export const createPatientDiagnosticRepository = async (
  data: {
    patient_id: string;
    media_url?: string;
    media_key?: string;
    media_type?: string;
    description?: string;
    created_by_id: string;
  },
  t?: Transaction,
) => {
  const diagnostic = await PatientDiagnostic.create(data, { transaction: t });
  return diagnostic.dataValues;
};

export const getPatientDiagnosticsRepository = async (filters: {
  patient_id: string;
  limit: number;
  offset: number;
}) => {
  const { rows, count } = await PatientDiagnostic.findAndCountAll({
    where: { patient_id: filters.patient_id },
    include: [
      {
        model: User,
        as: "created_by",
        attributes: ["user_id", "name"],
      },
    ],
    order: [["created_at", "DESC"]],
    limit: filters.limit,
    offset: filters.offset,
  });
  return { rows, count };
};

export const getPatientDiagnosticByIdRepository = async (
  diagnostic_id: string,
  t?: Transaction,
) => {
  return await PatientDiagnostic.findByPk(diagnostic_id, {
    include: [
      {
        model: User,
        as: "created_by",
        attributes: ["user_id", "name"],
      },
    ],
    transaction: t,
  });
};

export const updatePatientDiagnosticRepository = async (
  diagnostic_id: string,
  data: Partial<{
    media_url: string;
    media_key: string;
    media_type: string;
    description: string;
  }>,
  t?: Transaction,
) => {
  const [, updated] = await PatientDiagnostic.update(data, {
    where: { diagnostic_id },
    transaction: t,
    returning: true,
  });
  return updated[0];
};

export const deletePatientDiagnosticRepository = async (
  diagnostic_id: string,
  t?: Transaction,
) => {
  return await PatientDiagnostic.destroy({
    where: { diagnostic_id },
    transaction: t,
  });
};
