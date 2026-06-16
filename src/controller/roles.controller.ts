import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import {
  createRoleService,
  deleteRoleService,
  getPermissionsService,
  getRoleByIdService,
  getRolesService,
  updateRoleService,
} from "../services/roles.service";

export const createRoleController = asyncHandler(
  async (req: Request, res: Response) => {
    const role = await createRoleService(req.body);
    return res.status(201).send({
      success: true,
      message: "Role created successfully",
      data: role,
    });
  },
);

export const getRolesController = asyncHandler(
  async (req: Request, res: Response) => {
    const roles = await getRolesService();
    return res.status(200).send({
      success: true,
      message: "Successfully retrieved the roles.",
      data: roles,
    });
  },
);

export const getRoleByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const role = await getRoleByIdService(Number(req.params.role_id));
    return res.status(200).send({
      success: true,
      message: "Successfully retrieved the role.",
      data: role,
    });
  },
);

export const updateRoleController = asyncHandler(
  async (req: Request, res: Response) => {
    const role = await updateRoleService(Number(req.params.role_id), req.body);
    return res.status(200).send({
      success: true,
      message: "Role updated successfully",
      data: role,
    });
  },
);

export const deleteRoleController = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await deleteRoleService(Number(req.params.role_id));
    return res.status(200).send({
      success: true,
      message: "Role deleted successfully",
      data,
    });
  },
);

export const getPermissionsController = asyncHandler(
  async (req: Request, res: Response) => {
    const permissions = await getPermissionsService();
    return res.status(200).send({
      success: true,
      message: "Successfully retrieved the permissions.",
      data: permissions,
    });
  },
);
