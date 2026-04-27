import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import {
  createUserService,
  getUserByPhoneService,
} from "../services/users.service";

export const createUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await createUserService(req.body);
    res
      .status(201)
      .json({ success: true, message: "User created successfully", user });
  },
);

export const getUserByPhoneController = asyncHandler(
  async (req: Request, res: Response) => {
    const { phone } = req.params as { phone: string };
    const user = await getUserByPhoneService(phone);
    res.status(200).json({ success: true, data: user });
  },
);
