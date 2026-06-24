import { Router } from "express";
import {
  authorize,
  isAuthenticated,
  validate,
  validateParams,
  validateQuery,
} from "../middlewares/index.middleware";
import {
  createUserSchema,
  getUsersSchema,
  updateUserSchema,
  userIdParamsSchema,
} from "../validations/users.validation";
import {
  createUserController,
  deleteUserController,
  getUserByIdController,
  getUsersController,
  updateUserController,
} from "../controller/users.controller";

export default (router: Router) => {
  router.post(
    "/users",
    validate(createUserSchema),
    authorize("create", "User"),
    createUserController,
  );
  router.get(
    "/users",
    isAuthenticated,
    authorize("read", "User"),
    validateQuery(getUsersSchema),
    getUsersController,
  );
  router.get(
    "/user/:user_id",
    isAuthenticated,
    validateParams(userIdParamsSchema),
    authorize("read", "User"),
    getUserByIdController,
  );
  router.put(
    "/users/:user_id",
    isAuthenticated,
    validateParams(userIdParamsSchema),
    authorize("update", "User"),
    validate(updateUserSchema),
    updateUserController,
  );
  router.delete(
    "/users/:user_id",
    isAuthenticated,
    validateParams(userIdParamsSchema),
    authorize("delete", "User"),
    deleteUserController,
  );
};
