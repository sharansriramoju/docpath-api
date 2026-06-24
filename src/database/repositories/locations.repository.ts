import { Op, Transaction } from "sequelize";
import { Location } from "../models";
import { NotFoundError } from "../../errors/NotFoundError";

export const createLocationRepository = async (
  location_data: {
    name: string;
    latitude?: string;
    longitude?: string;
    google_maps_url: string;
    created_by_id: string;
  },
  t?: Transaction,
) => {
  const location = await Location.create(location_data, { transaction: t });
  return location.dataValues;
};

export const getLocationsRepository = async (query: {
  search?: string;
  limit?: number;
  offset?: number;
  status?: "active" | "inactive";
}) => {
  const where_clause: any = {};
  if (query.search) {
    where_clause.name = {
      [Op.iLike]: `%${query.search}%`,
    };
  }
  if (query.status) {
    where_clause.status = query.status;
  }
  const locations = await Location.findAndCountAll({
    where: where_clause,
    limit: query.limit,
    offset: query.offset,
  });
  return locations;
};

export const updateLocationRepository = async (
  location_data: {
    location_id: string;
    name?: string;
    latitude?: string;
    longitude?: string;
    google_maps_url?: string;
  },
  t?: Transaction,
) => {
  const location = await Location.findByPk(location_data.location_id, {
    transaction: t,
  });
  if (!location) {
    throw new NotFoundError("Location not found");
  }
  const [affected_count, updated_location] = await Location.update(location_data, {
    where: { location_id: location_data.location_id },
    transaction: t,
    returning: true,
  });
  if (affected_count === 0) {
    throw new NotFoundError("Failed to update location");
  }
  return updated_location[0];
};

export const getLocationByIdRepository = async (location_id: string) => {
  const location = await Location.findByPk(location_id);
  if (!location) {
    throw new NotFoundError("Location not found");
  }
  return location;
};
