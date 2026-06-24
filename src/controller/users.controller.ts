import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import {
  createUserService,
  deleteUserService,
  getUserByIdService,
  getUsersService,
  updateUserService,
} from "../services/users.service";

export const createUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await createUserService(req.body);
    res
      .status(201)
      .json({ success: true, message: "User created successfully", user });
  },
);

export const getUsersController = asyncHandler(
  async (req: Request, res: Response) => {
    const users = await getUsersService({
      limit: req.query.limit as string | undefined,
      page: req.query.page as string | undefined,
      role_id: req.query.role_id as string | undefined,
      role_name: req.query.role_name as string | undefined,
      name: req.query.name as string | undefined,
      phone: req.query.phone as string | undefined,
      email: req.query.email as string | undefined,
    });
    return res.status(200).json({
      success: true,
      message: "Successfully retrieved the users.",
      data: users,
    });
  },
);

export const getUserByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await getUserByIdService(req.params.user_id as string);
    return res.status(200).json({
      success: true,
      message: "Successfully retrieved the user.",
      data: user,
    });
  },
);

export const updateUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await updateUserService(req.params.user_id as string, req.body);
    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  },
);

export const deleteUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await deleteUserService(req.params.user_id as string);
    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data,
    });
  },
);
