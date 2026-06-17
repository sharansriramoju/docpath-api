import { Router } from "express";
import {
  authorize,
  isAuthenticated,
  validate,
  validateParams,
  validateQuery,
} from "../middlewares/index.middleware";
import {
  createRoleSchema,
  getPermissionsSchema,
  getRolesSchema,
  roleIdParamsSchema,
  updateRoleSchema,
} from "../validations/roles.validation";
import {
  createRoleController,
  deleteRoleController,
  getPermissionsController,
  getRoleByIdController,
  getRolesController,
  updateRoleController,
} from "../controller/roles.controller";

export default (router: Router) => {
  // Catalogue of assignable permissions (needed to map them onto roles).
  router.get(
    "/permissions",
    isAuthenticated,
    authorize("read", "Roles"),
    validateQuery(getPermissionsSchema),
    getPermissionsController,
  );

  router.post(
    "/roles",
    isAuthenticated,
    authorize("create", "Roles"),
    validate(createRoleSchema),
    createRoleController,
  );
  router.get(
    "/roles",
    isAuthenticated,
    authorize("read", "Roles"),
    validateQuery(getRolesSchema),
    getRolesController,
  );
  router.get(
    "/roles/:role_id",
    isAuthenticated,
    validateParams(roleIdParamsSchema),
    authorize("read", "Roles"),
    getRoleByIdController,
  );
  router.put(
    "/roles/:role_id",
    isAuthenticated,
    validateParams(roleIdParamsSchema),
    authorize("update", "Roles"),
    validate(updateRoleSchema),
    updateRoleController,
  );
  router.delete(
    "/roles/:role_id",
    isAuthenticated,
    validateParams(roleIdParamsSchema),
    authorize("delete", "Roles"),
    deleteRoleController,
  );
};
