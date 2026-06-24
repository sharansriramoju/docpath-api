import {
  createLocationRepository,
  getLocationByIdRepository,
  getLocationsRepository,
  updateLocationRepository,
} from "../database/repositories/locations.repository";

export const createLocationService = async (
  location_data: {
    name: string;
    latitude?: string;
    longitude?: string;
    google_maps_url: string;
  },
  user_id: string,
) => {
  const location = await createLocationRepository({
    ...location_data,
    created_by_id: user_id,
  });
  return location;
};

export const getLocationsServices = async (query: {
  search?: string;
  limit?: string;
  page?: string;
  status?: string;
}) => {
  const limit = query.limit ? parseInt(query.limit, 10) : 10;
  const offset = query.page ? (parseInt(query.page, 10) - 1) * limit : 0;
  return await getLocationsRepository({
    search: query.search,
    limit,
    offset,
    status: query.status as "active" | "inactive" | undefined,
  });
};

export const updateLocationService = async (location_data: {
  location_id: string;
  name?: string;
  latitude?: string;
  longitude?: string;
  google_maps_url?: string;
}) => {
  const location = await updateLocationRepository(location_data);
  return location;
};

export const getLocationByIdService = async (location_id: string) => {
  return await getLocationByIdRepository(location_id);
};

export const getActiveLocationsService = async (query: {
  search?: string;
  limit?: string;
  page?: string;
}) => {
  const limit = query.limit ? parseInt(query.limit, 10) : 10;
  const offset = query.page ? (parseInt(query.page, 10) - 1) * limit : 0;
  return await getLocationsRepository({
    status: "active",
    limit,
    offset,
    search: query.search,
  });
};
