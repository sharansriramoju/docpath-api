import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { createUserService } from "../services/users.service";

export const createUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await createUserService(req.body);
    res
      .status(201)
      .json({ success: true, message: "User created successfully", user });
  },
);
