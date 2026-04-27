import { sequelize } from "../database/models";
import {
  createLocationRepository,
  getLocationByIdRepository,
  getLocationsRepository,
  updateLocationRepository,
} from "../database/repositories/locations.repository";

export const createLocationService = async (
  locationData: {
    name: string;
    latitude?: string;
    longitude?: string;
    google_maps_url: string;
  },
  user_id: string,
) => {
  return await sequelize.transaction(async (t) => {
    const location = await createLocationRepository(
      { ...locationData, created_by_id: user_id },
      t,
    );
    return location;
  });
};

export const getLocationsServices = async (query: {
  search?: string;
  limit?: string;
  page?: string;
  status?: string;
}) => {
  const limit = query.limit ? parseInt(query.limit, 10) : 10;
  const offset = query.page ? (parseInt(query.page, 10) - 1) * limit : 0;
  return await sequelize.transaction(async (t) => {
    return await getLocationsRepository({
      search: query.search,
      limit,
      offset,
      status: query.status as "active" | "inactive" | undefined,
    });
  });
};

export const updateLocationService = async (locationData: {
  location_id: string;
  name?: string;
  latitude?: string;
  longitude?: string;
  google_maps_url?: string;
}) => {
  return await sequelize.transaction(async (t) => {
    const location = await updateLocationRepository(locationData, t);
    return location;
  });
};

export const getLocationByIdService = async (location_id: string) => {
  return await sequelize.transaction(async (t) => {
    return await getLocationByIdRepository(location_id);
  });
};

export const getActiveLocationsService = async (query: {
  search?: string;
  limit?: string;
  page?: string;
}) => {
  const limit = query.limit ? parseInt(query.limit, 10) : 10;
  const offset = query.page ? (parseInt(query.page, 10) - 1) * limit : 0;
  return await sequelize.transaction(async (t) => {
    return await getLocationsRepository({
      status: "active",
      limit,
      offset,
      search: query.search,
    });
  });
};
