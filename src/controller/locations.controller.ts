import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import {
  createLocationService,
  getActiveLocationsService,
  getLocationByIdService,
  getLocationsServices,
  updateLocationService,
} from "../services/locations.service";

export const createLocationController = asyncHandler(
  async (req: Request, res: Response) => {
    const location = await createLocationService(
      req.body,
      req.session.user.user_id,
    );
    return res.status(201).json({
      success: true,
      data: location,
      message: "Location created successfully",
    });
  },
);

export const getLocationsController = asyncHandler(
  async (req: Request, res: Response) => {
    // Implement logic to fetch locations here
    const locations = await getLocationsServices(req.query);
    return res.status(200).json({
      success: true,
      data: locations,
      message: "Locations fetched successfully",
    });
  },
);

export const updateLocationController = asyncHandler(
  async (req: Request, res: Response) => {
    const location = await updateLocationService(req.body);
    return res.status(200).json({
      success: true,
      data: location,
      message: "Location updated successfully",
    });
  },
);

export const getLocationByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    // Implement logic to fetch a single location by ID here
    const location = await getLocationByIdService(
      req.params.location_id as string,
    );
    return res.status(200).json({
      success: true,
      data: location,
      message: "Location fetched successfully",
    });
  },
);

export const getActiveLocationsController = asyncHandler(
  async (req: Request, res: Response) => {
    // Implement logic to fetch active locations here
    const locations = await getActiveLocationsService(req.query);
    return res.status(200).json({
      success: true,
      data: locations,
      message: "Active locations fetched successfully",
    });
  },
);
