import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import {
  cancelAppointmentService,
  createAppointmentService,
  getAppointmentNotesService,
  getAppointmentsOverviewService,
  getAppointmentsService,
  rescheduleAppointmentService,
  updateAppointmentNotesService,
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

export const updateAppointmentNotesController = asyncHandler(
  async (req: Request, res: Response) => {
    const appointment = await updateAppointmentNotesService(
      req.params.appointment_id as string,
      {
        reason: req.body.reason,
        doctor_notes: req.body.doctor_notes,
        prescription: req.body.prescription,
      },
      req.session.ability,
    );
    return res.status(200).send({
      success: true,
      message: "Successfully updated the appointment notes.",
      data: appointment,
    });
  },
);

export const getAppointmentNotesController = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await getAppointmentNotesService(
      req.params.appointment_id as string,
      req.session.ability,
    );
    return res.status(200).send({
      success: true,
      message: "Successfully retrieved the appointment notes.",
      data,
    });
  },
);

export const rescheduleAppointmentController = asyncHandler(
  async (req: Request, res: Response) => {
    const appointment = await rescheduleAppointmentService(
      req.params.appointment_id as string,
      {
        date: req.body.date,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
      },
      req.session.ability,
    );
    return res.status(200).send({
      success: true,
      message: "Successfully rescheduled the appointment.",
      data: appointment,
    });
  },
);

export const cancelAppointmentController = asyncHandler(
  async (req: Request, res: Response) => {
    const appointment = await cancelAppointmentService(
      req.params.appointment_id as string,
      req.session.ability,
    );
    return res.status(200).send({
      success: true,
      message: "Successfully cancelled the appointment.",
      data: appointment,
    });
  },
);
