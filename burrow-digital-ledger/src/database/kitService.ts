// Kit database service (BOBs, BOVs, Caches, etc.)
import { Kit, KitItem, KitWithItems, KitType } from '../types';
import {
  executeQuery,
  executeStatement,
  generateUUID,
  getCurrentTimestamp,
} from './db';

/**
 * Create a new kit
 */
export const createKit = async (
  kit: Omit<Kit, 'id' | 'created_at'>
): Promise<Kit> => {
  const id = generateUUID();
  const timestamp = getCurrentTimestamp();

  const newKit: Kit = {
    ...kit,
    id,
    created_at: timestamp,
  };

  const query = `
    INSERT INTO kits (id, name, description, kit_type, location_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  await executeStatement(query, [
    newKit.id,
    newKit.name,
    newKit.description || null,
    newKit.kit_type,
    newKit.location_id || null,
    newKit.created_at,
  ]);

  return newKit;
};

/**
 * Get all kits
 */
export const getAllKits = async (): Promise<KitWithItems[]> => {
  const kits = await executeQuery<Kit>('SELECT * FROM kits ORDER BY name');

  const kitsWithItems = await Promise.all(
    kits.map(async (kit) => {
      const items = await getKitItems(kit.id);
      const packedItems = items.filter((item) => item.is_packed).length;

      return {
        ...kit,
        items,
        total_items: items.length,
        packed_items: packedItems,
      };
    })
  );

  return kitsWithItems;
};

/**
 * Get kit by ID
 */
export const getKitById = async (id: string): Promise<KitWithItems | null> => {
  const query = 'SELECT * FROM kits WHERE id = ?';
  const results = await executeQuery<Kit>(query, [id]);

  if (results.length === 0) return null;

  const kit = results[0];
  const items = await getKitItems(id);
  const packedItems = items.filter((item) => item.is_packed).length;

  return {
    ...kit,
    items,
    total_items: items.length,
    packed_items: packedItems,
  };
};

/**
 * Update a kit
 */
export const updateKit = async (
  id: string,
  updates: Partial<Omit<Kit, 'id' | 'created_at'>>
): Promise<void> => {
  const fields = Object.keys(updates);

  if (fields.length === 0) return;

  const setClause = fields.map((field) => `${field} = ?`).join(', ');
  const values = fields.map((field) => (updates as any)[field]);

  const query = `UPDATE kits SET ${setClause} WHERE id = ?`;

  await executeStatement(query, [...values, id]);
};

/**
 * Delete a kit
 */
export const deleteKit = async (id: string): Promise<void> => {
  // Delete kit items first
  await executeStatement('DELETE FROM kit_items WHERE kit_id = ?', [id]);

  // Delete the kit
  await executeStatement('DELETE FROM kits WHERE id = ?', [id]);
};

/**
 * Add item to kit
 */
export const addItemToKit = async (
  kitId: string,
  assetId: string,
  quantityRequired: number = 1
): Promise<KitItem> => {
  const id = generateUUID();
  const timestamp = getCurrentTimestamp();

  const kitItem: KitItem = {
    id,
    kit_id: kitId,
    asset_id: assetId,
    quantity_required: quantityRequired,
    is_packed: false,
    last_verified: timestamp,
  };

  const query = `
    INSERT INTO kit_items (id, kit_id, asset_id, quantity_required, is_packed, last_verified)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  await executeStatement(query, [
    kitItem.id,
    kitItem.kit_id,
    kitItem.asset_id,
    kitItem.quantity_required,
    kitItem.is_packed ? 1 : 0,
    kitItem.last_verified,
  ]);

  return kitItem;
};

/**
 * Remove item from kit
 */
export const removeItemFromKit = async (
  kitId: string,
  assetId: string
): Promise<void> => {
  await executeStatement(
    'DELETE FROM kit_items WHERE kit_id = ? AND asset_id = ?',
    [kitId, assetId]
  );
};

/**
 * Update kit item
 */
export const updateKitItem = async (
  id: string,
  updates: Partial<Omit<KitItem, 'id' | 'kit_id' | 'asset_id'>>
): Promise<void> => {
  const fields = Object.keys(updates);

  if (fields.length === 0) return;

  const setClause = fields.map((field) => `${field} = ?`).join(', ');
  const values = fields.map((field) => {
    const value = (updates as any)[field];
    if (field === 'is_packed') {
      return value ? 1 : 0;
    }
    return value;
  });

  const query = `UPDATE kit_items SET ${setClause} WHERE id = ?`;

  await executeStatement(query, [...values, id]);
};

/**
 * Toggle item packed status
 */
export const toggleItemPacked = async (kitItemId: string): Promise<void> => {
  const query = `
    UPDATE kit_items
    SET is_packed = CASE WHEN is_packed = 1 THEN 0 ELSE 1 END
    WHERE id = ?
  `;

  await executeStatement(query, [kitItemId]);
};

/**
 * Get all items in a kit
 */
export const getKitItems = async (
  kitId: string
): Promise<(KitItem & { asset?: any })[]> => {
  const query = `
    SELECT
      ki.*,
      a.name as asset_name,
      a.category as asset_category,
      a.quantity_owned as asset_quantity_owned
    FROM kit_items ki
    LEFT JOIN assets a ON ki.asset_id = a.id
    WHERE ki.kit_id = ?
    ORDER BY a.name
  `;

  const results = await executeQuery<any>(query, [kitId]);

  return results.map((row) => ({
    id: row.id,
    kit_id: row.kit_id,
    asset_id: row.asset_id,
    quantity_required: row.quantity_required,
    is_packed: Boolean(row.is_packed),
    last_verified: row.last_verified,
    asset: row.asset_name
      ? {
          name: row.asset_name,
          category: row.asset_category,
          quantity_owned: row.asset_quantity_owned,
        }
      : undefined,
  }));
};

/**
 * Get kits by type
 */
export const getKitsByType = async (type: KitType): Promise<KitWithItems[]> => {
  const kits = await executeQuery<Kit>(
    'SELECT * FROM kits WHERE kit_type = ? ORDER BY name',
    [type]
  );

  const kitsWithItems = await Promise.all(
    kits.map(async (kit) => {
      const items = await getKitItems(kit.id);
      const packedItems = items.filter((item) => item.is_packed).length;

      return {
        ...kit,
        items,
        total_items: items.length,
        packed_items: packedItems,
      };
    })
  );

  return kitsWithItems;
};

/**
 * Mark all kit items as verified
 */
export const verifyAllKitItems = async (kitId: string): Promise<void> => {
  const timestamp = getCurrentTimestamp();

  await executeStatement(
    'UPDATE kit_items SET last_verified = ?, is_packed = 1 WHERE kit_id = ?',
    [timestamp, kitId]
  );
};

export default {
  createKit,
  getAllKits,
  getKitById,
  updateKit,
  deleteKit,
  addItemToKit,
  removeItemFromKit,
  updateKitItem,
  toggleItemPacked,
  getKitItems,
  getKitsByType,
  verifyAllKitItems,
};
