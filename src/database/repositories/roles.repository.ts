import { Op, Transaction } from "sequelize";
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

// Add (or upsert) specific permission mappings to a role without touching the
// rest. Existing rows for the same permission_ids are cleared first so scope/
// conditions are refreshed and no duplicates are created.
export const addRolePermissionsRepository = async (
  role_id: number,
  permissions: {
    permission_id: string;
    scope?: "ALL" | "LIMITED";
    conditions?: object;
  }[],
  t?: Transaction,
) => {
  const permission_ids = permissions.map((p) => p.permission_id);
  await RolePermission.destroy({
    where: { role_id, permission_id: permission_ids },
    transaction: t,
  });
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

// Edit an existing mapping in place: change its scope, conditions, and/or
// which permission it points to (new_permission_id). Returns the number of
// rows updated (0 when the permission is not currently mapped to the role).
export const editRolePermissionRepository = async (
  role_id: number,
  permission_id: string,
  changes: {
    new_permission_id?: string;
    scope?: "ALL" | "LIMITED";
    conditions?: object | null;
  },
  t?: Transaction,
) => {
  const update_fields: any = {};
  if (changes.new_permission_id !== undefined)
    update_fields.permission_id = changes.new_permission_id;
  if (changes.scope !== undefined) update_fields.scope = changes.scope;
  if (changes.conditions !== undefined)
    update_fields.conditions = changes.conditions;

  const [affected_count] = await RolePermission.update(update_fields, {
    where: { role_id, permission_id },
    transaction: t,
  });
  return affected_count;
};

// Remove specific permission mappings from a role by permission_id.
export const removeRolePermissionsRepository = async (
  role_id: number,
  permission_ids: string[],
  t?: Transaction,
) => {
  await RolePermission.destroy({
    where: { role_id, permission_id: permission_ids },
    transaction: t,
  });
};

export const getRolesRepository = async (filters: {
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  const where: any = {};
  if (filters.search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${filters.search}%` } },
      { description: { [Op.iLike]: `%${filters.search}%` } },
    ];
  }

  // distinct keeps the count accurate despite the belongsToMany permissions join.
  return await Role.findAndCountAll({
    where,
    include: [permissionInclude],
    order: [["role_id", "ASC"]],
    limit: filters.limit,
    offset: filters.offset,
    distinct: true,
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

export const getAllPermissionsRepository = async (filters?: {
  search?: string;
}) => {
  const where: any = {};
  if (filters?.search) {
    // Match the search term against either the action or the subject.
    where[Op.or] = [
      { action: { [Op.iLike]: `%${filters.search}%` } },
      { subject: { [Op.iLike]: `%${filters.search}%` } },
    ];
  }

  return await Permission.findAll({
    where,
    attributes: ["permission_id", "action", "subject"],
    order: [
      ["subject", "ASC"],
      ["action", "ASC"],
    ],
  });
};
