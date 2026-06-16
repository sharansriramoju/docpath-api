import { Transaction } from "sequelize";
import { Permission, Role, RolePermission } from "../models";

const permissionInclude = {
  model: Permission,
  as: "permissions",
  through: { attributes: ["scope", "conditions"] },
  attributes: ["permission_id", "action", "subject"],
};

export const createRoleRepository = async (
  data: { name: string; description?: string },
  t?: Transaction,
) => {
  const role = await Role.create(data, { transaction: t });
  return role.dataValues;
};

// Replace the role's permission mappings with the provided set. Used by both
// create and update, so the destroy is a no-op for a freshly created role.
export const setRolePermissionsRepository = async (
  role_id: number,
  permissions: {
    permission_id: string;
    scope?: "ALL" | "LIMITED";
    conditions?: object;
  }[],
  t?: Transaction,
) => {
  await RolePermission.destroy({ where: { role_id }, transaction: t });
  if (permissions.length === 0) return;
  await RolePermission.bulkCreate(
    permissions.map((permission) => ({
      role_id,
      permission_id: permission.permission_id,
      scope: permission.scope,
      conditions: permission.conditions,
    })),
    { transaction: t },
  );
};

export const getRolesRepository = async () => {
  return await Role.findAll({
    include: [permissionInclude],
    order: [["role_id", "ASC"]],
  });
};

export const getRoleByIdRepository = async (
  role_id: number,
  t?: Transaction,
) => {
  return await Role.findByPk(role_id, {
    include: [permissionInclude],
    transaction: t,
  });
};

export const updateRoleRepository = async (
  role_id: number,
  data: { name?: string; description?: string },
  t?: Transaction,
) => {
  await Role.update(data, { where: { role_id }, transaction: t });
};

export const deleteRoleRepository = async (role_id: number, t?: Transaction) => {
  return await Role.destroy({ where: { role_id }, transaction: t });
};

export const getAllPermissionsRepository = async () => {
  return await Permission.findAll({
    attributes: ["permission_id", "action", "subject"],
    order: [
      ["subject", "ASC"],
      ["action", "ASC"],
    ],
  });
};
