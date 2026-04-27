import { Router } from "express";
import {
  authorize,
  isAuthenticated,
  validate,
  validateQuery,
} from "../middlewares/index.middleware";
import {
  createLocationValidation,
  getLocationsValidation,
  updateLocationValidation,
} from "../validations/locations.validation";
import {
  createLocationController,
  getActiveLocationsController,
  getLocationByIdController,
  getLocationsController,
  updateLocationController,
} from "../controller/locations.controller";

export default (router: Router) => {
  router.post(
    "/location",
    isAuthenticated,
    authorize("create", "Locations"),
    validate(createLocationValidation),
    createLocationController,
  );
  router.get(
    "/locations",
    isAuthenticated,
    authorize("read", "Locations"),
    validateQuery(getLocationsValidation),
    getLocationsController,
  );
  router.put(
    "/location",
    isAuthenticated,
    authorize("update", "Locations"),
    validate(updateLocationValidation),
    updateLocationController,
  );
  router.get(
    "/location/:location_id",
    isAuthenticated,
    authorize("read", "Locations"),
    getLocationByIdController,
  );
  router.get(
    "/locations/active",
    isAuthenticated,
    authorize("read", "Locations"),
    getActiveLocationsController,
  );
};
