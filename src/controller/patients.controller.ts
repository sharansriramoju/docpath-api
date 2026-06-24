import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import {
  createPatientService,
  deletePatientService,
  getPatientByIdService,
  getPatientByPhoneService,
  getPatientsService,
  updatePatientService,
} from "../services/patients.service";

export const createPatientController = asyncHandler(
  async (req: Request, res: Response) => {
    const patient = await createPatientService(req.body);
    return res.status(201).json({
      success: true,
      message: "Patient created successfully",
      data: patient,
    });
  },
);

export const getPatientsController = asyncHandler(
  async (req: Request, res: Response) => {
    const patients = await getPatientsService({
      limit: req.query.limit as string | undefined,
      page: req.query.page as string | undefined,
      name: req.query.name as string | undefined,
      phone: req.query.phone as string | undefined,
      email: req.query.email as string | undefined,
    });
    return res.status(200).json({
      success: true,
      message: "Successfully retrieved the patients.",
      data: patients,
    });
  },
);

export const getPatientByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const patient = await getPatientByIdService(req.params.user_id as string);
    return res.status(200).json({
      success: true,
      message: "Successfully retrieved the patient.",
      data: patient,
    });
  },
);

export const getPatientByPhoneController = asyncHandler(
  async (req: Request, res: Response) => {
    const { phone } = req.params as { phone: string };
    const patient = await getPatientByPhoneService(phone);
    return res.status(200).json({
      success: true,
      message: "Successfully retrieved the patient.",
      data: patient,
    });
  },
);

export const updatePatientController = asyncHandler(
  async (req: Request, res: Response) => {
    const patient = await updatePatientService(
      req.params.user_id as string,
      req.body,
    );
    return res.status(200).json({
      success: true,
      message: "Patient updated successfully",
      data: patient,
    });
  },
);

export const deletePatientController = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await deletePatientService(req.params.user_id as string);
    return res.status(200).json({
      success: true,
      message: "Patient deleted successfully",
      data,
    });
  },
);
