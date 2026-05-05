import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { addDoctorRoutineService } from "../services/doctorRoutine.service";

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
