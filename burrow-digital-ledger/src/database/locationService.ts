// Location database service
import { Location, LocationType } from '../types';
import {
  executeQuery,
  executeStatement,
  generateUUID,
  getCurrentTimestamp,
} from './db';

/**
 * Create a new location
 */
export const createLocation = async (
  location: Omit<Location, 'id' | 'created_at'>
): Promise<Location> => {
  const id = generateUUID();
  const timestamp = getCurrentTimestamp();

  const newLocation: Location = {
    ...location,
    id,
    created_at: timestamp,
  };

  const query = `
    INSERT INTO locations (id, name, description, location_type, "order", created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  await executeStatement(query, [
    newLocation.id,
    newLocation.name,
    newLocation.description || null,
    newLocation.location_type,
    newLocation.order,
    newLocation.created_at,
  ]);

  return newLocation;
};

/**
 * Get all locations
 */
export const getAllLocations = async (): Promise<Location[]> => {
  const query = 'SELECT * FROM locations ORDER BY "order", name';
  return await executeQuery<Location>(query);
};

/**
 * Get location by ID
 */
export const getLocationById = async (id: string): Promise<Location | null> => {
  const query = 'SELECT * FROM locations WHERE id = ?';
  const results = await executeQuery<Location>(query, [id]);
  return results.length > 0 ? results[0] : null;
};

/**
 * Update a location
 */
export const updateLocation = async (
  id: string,
  updates: Partial<Omit<Location, 'id' | 'created_at'>>
): Promise<void> => {
  const fields = Object.keys(updates);

  if (fields.length === 0) return;

  const setClause = fields
    .map((field) => {
      if (field === 'order') {
        return `"order" = ?`;
      }
      return `${field} = ?`;
    })
    .join(', ');
  const values = fields.map((field) => (updates as any)[field]);

  const query = `UPDATE locations SET ${setClause} WHERE id = ?`;

  await executeStatement(query, [...values, id]);
};

/**
 * Delete a location
 */
export const deleteLocation = async (id: string): Promise<void> => {
  // Check if any assets are using this location
  const assetCountQuery = 'SELECT COUNT(*) as count FROM assets WHERE location_id = ?';
  const assetCount = await executeQuery<{ count: number }>(assetCountQuery, [id]);

  if (assetCount.length > 0 && assetCount[0].count > 0) {
    throw new Error('Cannot delete location that has assets assigned to it');
  }

  // Delete the location
  await executeStatement('DELETE FROM locations WHERE id = ?', [id]);
};

/**
 * Get locations by type
 */
export const getLocationsByType = async (type: LocationType): Promise<Location[]> => {
  const query = 'SELECT * FROM locations WHERE location_type = ? ORDER BY "order", name';
  return await executeQuery<Location>(query, [type]);
};

/**
 * Get location with asset count
 */
export const getLocationsWithAssetCount = async (): Promise<
  (Location & { asset_count: number })[]
> => {
  const query = `
    SELECT l.*, COUNT(a.id) as asset_count
    FROM locations l
    LEFT JOIN assets a ON l.id = a.location_id
    GROUP BY l.id
    ORDER BY l."order", l.name
  `;
  return await executeQuery<Location & { asset_count: number }>(query);
};

/**
 * Reorder locations
 */
export const reorderLocations = async (
  locationIds: string[]
): Promise<void> => {
  for (let i = 0; i < locationIds.length; i++) {
    await executeStatement(
      'UPDATE locations SET "order" = ? WHERE id = ?',
      [i + 1, locationIds[i]]
    );
  }
};

export default {
  createLocation,
  getAllLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
  getLocationsByType,
  getLocationsWithAssetCount,
  reorderLocations,
};
