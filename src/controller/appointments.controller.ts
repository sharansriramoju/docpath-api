import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import {
  createAppointmentService,
  getAppointmentsOverviewService,
  getAppointmentsService,
} from "../services/appointments.service";

export const createAppointmentController = asyncHandler(
  async (req: Request, res: Response) => {
    const appointment = await createAppointmentService(
      {
        ...req.body,
        created_by_id: req.session.user.user_id,
      },
      req.session.ability,
    );
    return res.status(201).send({
      success: true,
      message: "successfully scheduled the appointment",
      data: appointment,
    });
  },
);

export const getAppointmentsController = asyncHandler(
  async (req: Request, res: Response) => {
    const appointments = await getAppointmentsService(
      {
        doctor_id: req.query.doctor_id as string | undefined,
        location_id: req.query.location_id as string,
        date: req.query.date as string | undefined,
      },
      req.session.user.user_id,
      req.session.ability,
    );
    return res.status(200).send({
      success: true,
      message: "Successfully retrieved the appointments.",
      data: appointments,
    });
  },
);

export const getAppointmentsOverviewController = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await getAppointmentsOverviewService(
      {
        doctor_id: req.query.doctor_id as string | undefined,
        view: req.query.view as "week" | "month" | "all",
        month: req.query.month as string | undefined,
        week_start: req.query.week_start as string | undefined,
        week_end: req.query.week_end as string | undefined,
      },
      req.session.user.user_id,
      req.session.ability,
    );
    return res.status(200).send({
      success: true,
      data,
      message:
        "Successfully retrieved appointment status counts for all locations.",
    });
  },
);
