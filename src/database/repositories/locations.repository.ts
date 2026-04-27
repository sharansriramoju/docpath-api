import { Op, Transaction } from "sequelize";
import { Location } from "../models";
import { NotFoundError } from "../../errors/NotFoundError";

export const createLocationRepository = async (
  locationData: {
    name: string;
    latitude?: string;
    longitude?: string;
    google_maps_url: string;
    created_by_id: string;
  },
  t?: Transaction,
) => {
  const location = await Location.create(locationData, { transaction: t });
  return location.dataValues;
};

export const getLocationsRepository = async (query: {
  search?: string;
  limit?: number;
  offset?: number;
  status?: "active" | "inactive";
}) => {
  const whereClause: any = {};
  if (query.search) {
    whereClause.name = {
      [Op.iLike]: `%${query.search}%`,
    };
  }
  if (query.status) {
    whereClause.status = query.status;
  }
  const locations = await Location.findAndCountAll({
    where: whereClause,
    limit: query.limit,
    offset: query.offset,
  });
  return locations;
};

export const updateLocationRepository = async (
  locationData: {
    location_id: string;
    name?: string;
    latitude?: string;
    longitude?: string;
    google_maps_url?: string;
  },
  t?: Transaction,
) => {
  const location = await Location.findByPk(locationData.location_id, {
    transaction: t,
  });
  if (!location) {
    throw new NotFoundError("Location not found");
  }
  const [affectedCount, updatedLocation] = await Location.update(locationData, {
    where: { location_id: locationData.location_id },
    transaction: t,
    returning: true,
  });
  if (affectedCount === 0) {
    throw new NotFoundError("Failed to update location");
  }
  return updatedLocation[0];
};

export const getLocationByIdRepository = async (location_id: string) => {
  const location = await Location.findByPk(location_id);
  if (!location) {
    throw new NotFoundError("Location not found");
  }
  return location;
};
