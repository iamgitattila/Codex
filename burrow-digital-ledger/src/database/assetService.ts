// Asset database service
import {
  Asset,
  AssetWithLocation,
  AssetCategory,
  AssetSubcategory,
  RotationStatus,
  Condition,
} from '../types';
import {
  executeQuery,
  executeStatement,
  generateUUID,
  getCurrentTimestamp,
} from './db';

/**
 * Create a new asset
 */
export const createAsset = async (
  asset: Omit<Asset, 'id' | 'created_at' | 'updated_at'>
): Promise<Asset> => {
  const id = generateUUID();
  const timestamp = getCurrentTimestamp();

  const newAsset: Asset = {
    ...asset,
    id,
    created_at: timestamp,
    updated_at: timestamp,
  };

  const query = `
    INSERT INTO assets (
      id, name, category, subcategory, description, quantity_owned,
      quantity_par, unit_type, location_id, expiration_date, date_acquired,
      last_verified, cost_usd, source_url, barcode_ean, photo_path,
      notes, condition, rotation_status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await executeStatement(query, [
    newAsset.id,
    newAsset.name,
    newAsset.category,
    newAsset.subcategory || null,
    newAsset.description || null,
    newAsset.quantity_owned,
    newAsset.quantity_par || null,
    newAsset.unit_type || null,
    newAsset.location_id,
    newAsset.expiration_date || null,
    newAsset.date_acquired || null,
    newAsset.last_verified || null,
    newAsset.cost_usd || null,
    newAsset.source_url || null,
    newAsset.barcode_ean || null,
    newAsset.photo_path || null,
    newAsset.notes || null,
    newAsset.condition || null,
    newAsset.rotation_status,
    newAsset.created_at,
    newAsset.updated_at,
  ]);

  return newAsset;
};

/**
 * Get all assets
 */
export const getAllAssets = async (): Promise<AssetWithLocation[]> => {
  const query = `
    SELECT a.*, l.name as location_name, l.location_type
    FROM assets a
    LEFT JOIN locations l ON a.location_id = l.id
    ORDER BY a.created_at DESC
  `;
  return await executeQuery<AssetWithLocation>(query);
};

/**
 * Get asset by ID
 */
export const getAssetById = async (id: string): Promise<Asset | null> => {
  const query = 'SELECT * FROM assets WHERE id = ?';
  const results = await executeQuery<Asset>(query, [id]);
  return results.length > 0 ? results[0] : null;
};

/**
 * Update an asset
 */
export const updateAsset = async (
  id: string,
  updates: Partial<Omit<Asset, 'id' | 'created_at'>>
): Promise<void> => {
  const timestamp = getCurrentTimestamp();
  const fields = Object.keys(updates).filter((key) => key !== 'created_at');

  if (fields.length === 0) return;

  const setClause = fields.map((field) => `${field} = ?`).join(', ');
  const values = fields.map((field) => (updates as any)[field]);

  const query = `
    UPDATE assets
    SET ${setClause}, updated_at = ?
    WHERE id = ?
  `;

  await executeStatement(query, [...values, timestamp, id]);
};

/**
 * Delete an asset
 */
export const deleteAsset = async (id: string): Promise<void> => {
  // First delete related records
  await executeStatement('DELETE FROM kit_items WHERE asset_id = ?', [id]);
  await executeStatement('DELETE FROM expiration_alerts WHERE asset_id = ?', [id]);
  await executeStatement('DELETE FROM shopping_list WHERE asset_id = ?', [id]);

  // Then delete the asset
  await executeStatement('DELETE FROM assets WHERE id = ?', [id]);
};

/**
 * Get assets by location
 */
export const getAssetsByLocation = async (
  locationId: string
): Promise<AssetWithLocation[]> => {
  const query = `
    SELECT a.*, l.name as location_name, l.location_type
    FROM assets a
    LEFT JOIN locations l ON a.location_id = l.id
    WHERE a.location_id = ?
    ORDER BY a.category, a.name
  `;
  return await executeQuery<AssetWithLocation>(query, [locationId]);
};

/**
 * Get assets by category
 */
export const getAssetsByCategory = async (
  category: AssetCategory
): Promise<AssetWithLocation[]> => {
  const query = `
    SELECT a.*, l.name as location_name, l.location_type
    FROM assets a
    LEFT JOIN locations l ON a.location_id = l.id
    WHERE a.category = ?
    ORDER BY a.name
  `;
  return await executeQuery<AssetWithLocation>(query, [category]);
};

/**
 * Search assets by name
 */
export const searchAssets = async (searchTerm: string): Promise<AssetWithLocation[]> => {
  const query = `
    SELECT a.*, l.name as location_name, l.location_type
    FROM assets a
    LEFT JOIN locations l ON a.location_id = l.id
    WHERE a.name LIKE ? OR a.description LIKE ?
    ORDER BY a.name
  `;
  const likeTerm = `%${searchTerm}%`;
  return await executeQuery<AssetWithLocation>(query, [likeTerm, likeTerm]);
};

/**
 * Get assets expiring within specified days
 */
export const getExpiringAssets = async (days: number = 30): Promise<AssetWithLocation[]> => {
  const query = `
    SELECT a.*, l.name as location_name, l.location_type,
           julianday(a.expiration_date) - julianday('now') as days_until_expiration
    FROM assets a
    LEFT JOIN locations l ON a.location_id = l.id
    WHERE a.expiration_date IS NOT NULL
      AND julianday(a.expiration_date) - julianday('now') <= ?
      AND julianday(a.expiration_date) - julianday('now') >= 0
    ORDER BY a.expiration_date ASC
  `;
  return await executeQuery<AssetWithLocation>(query, [days]);
};

/**
 * Get expired assets
 */
export const getExpiredAssets = async (): Promise<AssetWithLocation[]> => {
  const query = `
    SELECT a.*, l.name as location_name, l.location_type
    FROM assets a
    LEFT JOIN locations l ON a.location_id = l.id
    WHERE a.expiration_date IS NOT NULL
      AND julianday(a.expiration_date) < julianday('now')
    ORDER BY a.expiration_date DESC
  `;
  return await executeQuery<AssetWithLocation>(query);
};

/**
 * Get assets below par level
 */
export const getAssetsBelowPar = async (): Promise<AssetWithLocation[]> => {
  const query = `
    SELECT a.*, l.name as location_name, l.location_type
    FROM assets a
    LEFT JOIN locations l ON a.location_id = l.id
    WHERE a.quantity_par IS NOT NULL
      AND a.quantity_owned < a.quantity_par
    ORDER BY a.name
  `;
  return await executeQuery<AssetWithLocation>(query);
};

/**
 * Get total inventory value
 */
export const getTotalInventoryValue = async (): Promise<number> => {
  const query = `
    SELECT COALESCE(SUM(cost_usd * quantity_owned), 0) as total_value
    FROM assets
    WHERE cost_usd IS NOT NULL
  `;
  const results = await executeQuery<{ total_value: number }>(query);
  return results.length > 0 ? results[0].total_value : 0;
};

/**
 * Get asset count by category
 */
export const getAssetCountByCategory = async (): Promise<
  { category: string; count: number }[]
> => {
  const query = `
    SELECT category, COUNT(*) as count
    FROM assets
    GROUP BY category
    ORDER BY count DESC
  `;
  return await executeQuery<{ category: string; count: number }>(query);
};

/**
 * Get asset by barcode
 */
export const getAssetByBarcode = async (barcode: string): Promise<Asset | null> => {
  const query = 'SELECT * FROM assets WHERE barcode_ean = ?';
  const results = await executeQuery<Asset>(query, [barcode]);
  return results.length > 0 ? results[0] : null;
};

export default {
  createAsset,
  getAllAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
  getAssetsByLocation,
  getAssetsByCategory,
  searchAssets,
  getExpiringAssets,
  getExpiredAssets,
  getAssetsBelowPar,
  getTotalInventoryValue,
  getAssetCountByCategory,
  getAssetByBarcode,
};
