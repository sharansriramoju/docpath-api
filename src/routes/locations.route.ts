import { Router } from "express";
import {
  authorize,
  isAuthenticated,
  validate,
  validateParams,
  validateQuery,
} from "../middlewares/index.middleware";
import {
  createLocationSchema,
  getLocationsSchema,
  locationIdParamsSchema,
  updateLocationSchema,
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
    validate(createLocationSchema),
    createLocationController,
  );
  router.get(
    "/locations",
    isAuthenticated,
    authorize("read", "Locations"),
    validateQuery(getLocationsSchema),
    getLocationsController,
  );
  router.put(
    "/location",
    isAuthenticated,
    authorize("update", "Locations"),
    validate(updateLocationSchema),
    updateLocationController,
  );
  router.get(
    "/location/:location_id",
    isAuthenticated,
    validateParams(locationIdParamsSchema),
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
