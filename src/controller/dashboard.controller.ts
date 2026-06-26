import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import {
  getAppointmentTrendsService,
  getNewPatientRegistrationsService,
  getPatientVolumeByLocationService,
  getPeakAppointmentHoursService,
  getTodayAppointmentsService,
  getTotalPatientsService,
} from "../services/dashboard.service";

export const getTotalPatientsController = asyncHandler(
  async (_req: Request, res: Response) => {
    const data = await getTotalPatientsService();
    return res.status(200).json({
      success: true,
      message: "Total patients retrieved successfully",
      data,
    });
  },
);

export const getTodayAppointmentsController = asyncHandler(
  async (_req: Request, res: Response) => {
    const data = await getTodayAppointmentsService();
    return res.status(200).json({
      success: true,
      message: "Today's appointments count retrieved successfully",
      data,
    });
  },
);

export const getAppointmentTrendsController = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await getAppointmentTrendsService({
      start_date: req.query.start_date as string,
      end_date: req.query.end_date as string,
      granularity: (req.query.granularity as "day" | "week" | "month") || "day",
    });
    return res.status(200).json({
      success: true,
      message: "Appointment trends retrieved successfully",
      data,
    });
  },
);

export const getPatientVolumeByLocationController = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await getPatientVolumeByLocationService({
      start_date: req.query.start_date as string | undefined,
      end_date: req.query.end_date as string | undefined,
    });
    return res.status(200).json({
      success: true,
      message: "Patient volume by location retrieved successfully",
      data,
    });
  },
);

export const getNewPatientRegistrationsController = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await getNewPatientRegistrationsService({
      start_date: req.query.start_date as string,
      end_date: req.query.end_date as string,
      granularity: (req.query.granularity as "day" | "week") || "day",
    });
    return res.status(200).json({
      success: true,
      message: "New patient registrations retrieved successfully",
      data,
    });
  },
);

export const getPeakAppointmentHoursController = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await getPeakAppointmentHoursService({
      start_date: req.query.start_date as string | undefined,
      end_date: req.query.end_date as string | undefined,
    });
    return res.status(200).json({
      success: true,
      message: "Peak appointment hours retrieved successfully",
      data,
    });
  },
);
