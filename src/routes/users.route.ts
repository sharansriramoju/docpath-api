import { Router } from "express";
import { validate } from "../middlewares/index.middleware";
import { createUserValidation } from "../validations/users.validation";
import { createUserController } from "../controller/users.controller";

export default (router: Router) => {
  router.post("/user", validate(createUserValidation), createUserController);
};
