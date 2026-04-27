import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";

export const addDoctorRoutineController = asyncHandler(
  async (req: Request, res: Response) => {
    // Implement logic to add doctor routine here
  },
);
