import { sequelize } from "../database/models";
import { ApiError } from "../errors/ApiError";
import {
  createRoleRepository,
  deleteRoleRepository,
  getAllPermissionsRepository,
  getRoleByIdRepository,
  getRolesRepository,
  setRolePermissionsRepository,
  updateRoleRepository,
} from "../database/repositories/roles.repository";

type RolePermissionInput = {
  permission_id: string;
  scope?: "ALL" | "LIMITED";
  conditions?: object;
};

export const createRoleService = async (data: {
  name: string;
  description?: string;
  permissions?: RolePermissionInput[];
}) => {
  return await sequelize.transaction(async (t) => {
    const role = await createRoleRepository(
      { name: data.name, description: data.description },
      t,
    );
    if (data.permissions && data.permissions.length > 0) {
      await setRolePermissionsRepository(role.role_id, data.permissions, t);
    }
    return await getRoleByIdRepository(role.role_id, t);
  });
};

export const getRolesService = async () => {
  return await getRolesRepository();
};

export const getRoleByIdService = async (role_id: number) => {
  const role = await getRoleByIdRepository(role_id);
  if (!role) {
    throw new ApiError(404, "Role not found");
  }
  return role;
};

export const updateRoleService = async (
  role_id: number,
  data: {
    name?: string;
    description?: string;
    permissions?: RolePermissionInput[];
  },
) => {
  const existing = await getRoleByIdRepository(role_id);
  if (!existing) {
    throw new ApiError(404, "Role not found");
  }

  return await sequelize.transaction(async (t) => {
    const fields: { name?: string; description?: string } = {};
    if (data.name !== undefined) fields.name = data.name;
    if (data.description !== undefined) fields.description = data.description;
    if (Object.keys(fields).length > 0) {
      await updateRoleRepository(role_id, fields, t);
    }
    // A provided permissions array fully replaces the existing mapping.
    if (data.permissions !== undefined) {
      await setRolePermissionsRepository(role_id, data.permissions, t);
    }
    return await getRoleByIdRepository(role_id, t);
  });
};

export const deleteRoleService = async (role_id: number) => {
  const role = await getRoleByIdRepository(role_id);
  if (!role) {
    throw new ApiError(404, "Role not found");
  }
  // role_permissions cascade-delete; users keep their row but role_id is
  // set to null (per the User -> Role association).
  await deleteRoleRepository(role_id);
  return { role_id };
};

export const getPermissionsService = async () => {
  return await getAllPermissionsRepository();
};
