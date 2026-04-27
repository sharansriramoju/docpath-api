import { Router } from "express";
import {
  authorize,
  isAuthenticated,
  validate,
} from "../middlewares/index.middleware";
import { createUserValidation } from "../validations/users.validation";
import {
  createUserController,
  getUserByPhoneController,
} from "../controller/users.controller";

export default (router: Router) => {
  router.post("/user", validate(createUserValidation), createUserController);
  router.get(
    "/patient/:phone",
    isAuthenticated,
    authorize("read", "Patients"),
    getUserByPhoneController,
  );
};
