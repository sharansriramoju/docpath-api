import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import {
  addDoctorRoutineService,
  getDoctorRoutineService,
} from "../services/doctorRoutine.service";

export const addDoctorRoutineController = asyncHandler(
  async (req: Request, res: Response) => {
    // Implement logic to add doctor routine here
    const userId = req.session.user.user_id;
    const doctorRoutineData = await addDoctorRoutineService(
      {
        ...req.body,
        doctor_id: req.body.doctor_id || userId,
        created_by_id: userId,
      },
      req.session.ability,
    );
    res.status(201).json(doctorRoutineData);
  },
);

export const getDoctorRoutineController = asyncHandler(
  async (req: Request, res: Response) => {
    const doctor_id = req.query.doctor_id
      ? req.query.doctor_id
      : req.session.user.user_id;
    const not_self = req.query.doctor_id ? true : false;
    console.log("not self :", not_self);
    const abilty = req.session.ability;
    const routine = await getDoctorRoutineService(
      doctor_id,
      req.query,
      abilty,
      not_self,
    );
    return res.status(200).send({
      success: true,
      message: "Successfully fetched doctor routines",
      data: routine,
    });
  },
);
