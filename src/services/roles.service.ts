import { sequelize } from "../database/models";
import { ApiError } from "../errors/ApiError";
import {
  addRolePermissionsRepository,
  createRoleRepository,
  deleteRoleRepository,
  editRolePermissionRepository,
  getAllPermissionsRepository,
  getRoleByIdRepository,
  getRolesRepository,
  removeRolePermissionsRepository,
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

export const getRolesService = async (query: {
  search?: string;
  limit?: string;
  page?: string;
}) => {
  const limit = query.limit ? parseInt(query.limit, 10) : 10;
  const offset = query.page ? (parseInt(query.page, 10) - 1) * limit : 0;
  return await getRolesRepository({ search: query.search, limit, offset });
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
    add_permissions?: RolePermissionInput[];
    edit_permissions?: {
      permission_id: string;
      new_permission_id?: string;
      scope?: "ALL" | "LIMITED";
      conditions?: object | null;
    }[];
    remove_permissions?: string[];
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
    // Order: edits modify existing mappings, then removals, then additions.
    // For a permission_id present in more than one list, additions win.
    if (data.edit_permissions && data.edit_permissions.length > 0) {
      for (const edit of data.edit_permissions) {
        const affected = await editRolePermissionRepository(
          role_id,
          edit.permission_id,
          {
            new_permission_id: edit.new_permission_id,
            scope: edit.scope,
            conditions: edit.conditions,
          },
          t,
        );
        if (affected === 0) {
          throw new ApiError(
            404,
            `Permission ${edit.permission_id} is not mapped to this role`,
          );
        }
      }
    }
    if (data.remove_permissions && data.remove_permissions.length > 0) {
      await removeRolePermissionsRepository(role_id, data.remove_permissions, t);
    }
    if (data.add_permissions && data.add_permissions.length > 0) {
      await addRolePermissionsRepository(role_id, data.add_permissions, t);
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

export const getPermissionsService = async (query: { search?: string }) => {
  return await getAllPermissionsRepository(query);
};
