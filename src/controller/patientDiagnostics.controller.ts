import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import {
  createPatientDiagnosticService,
  deletePatientDiagnosticService,
  getPatientDiagnosticByIdService,
  getPatientDiagnosticsService,
  updatePatientDiagnosticService,
} from "../services/patientDiagnostics.service";

export const createPatientDiagnosticController = asyncHandler(
  async (req: Request, res: Response) => {
    const diagnostic = await createPatientDiagnosticService(
      {
        patient_id: req.body.patient_id,
        description: req.body.description,
        created_by_id: req.session.user.user_id,
      },
      req.file,
    );
    return res.status(201).json({
      success: true,
      message: "Patient diagnostic created successfully",
      data: diagnostic,
    });
  },
);

export const getPatientDiagnosticsController = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await getPatientDiagnosticsService({
      patient_id: req.params.patient_id as string,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    });
    return res.status(200).json({
      success: true,
      message: "Patient diagnostics retrieved successfully",
      data,
    });
  },
);

export const getPatientDiagnosticByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const diagnostic = await getPatientDiagnosticByIdService(
      req.params.diagnostic_id as string,
    );
    return res.status(200).json({
      success: true,
      message: "Patient diagnostic retrieved successfully",
      data: diagnostic,
    });
  },
);

export const updatePatientDiagnosticController = asyncHandler(
  async (req: Request, res: Response) => {
    const diagnostic = await updatePatientDiagnosticService(
      req.params.diagnostic_id as string,
      { description: req.body.description },
      req.file,
    );
    return res.status(200).json({
      success: true,
      message: "Patient diagnostic updated successfully",
      data: diagnostic,
    });
  },
);

export const deletePatientDiagnosticController = asyncHandler(
  async (req: Request, res: Response) => {
    await deletePatientDiagnosticService(req.params.diagnostic_id as string);
    return res.status(200).json({
      success: true,
      message: "Patient diagnostic deleted successfully",
    });
  },
);
