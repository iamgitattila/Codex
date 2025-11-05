import { database } from '../index';
import { Kit, KitItem } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export class KitService {
  async getAll(): Promise<Kit[]> {
    const db = database.getDatabase();
    const rows = await db.getAllAsync('SELECT * FROM kits ORDER BY name ASC');
    return rows.map(this.mapRowToKit);
  }

  async getById(id: string): Promise<Kit | null> {
    const db = database.getDatabase();
    const rows = await db.getAllAsync('SELECT * FROM kits WHERE id = ?', [id]);
    return rows.length > 0 ? this.mapRowToKit(rows[0]) : null;
  }

  async getByType(type: string): Promise<Kit[]> {
    const db = database.getDatabase();
    const rows = await db.getAllAsync(
      'SELECT * FROM kits WHERE kit_type = ? ORDER BY name ASC',
      [type]
    );
    return rows.map(this.mapRowToKit);
  }

  async create(kit: Omit<Kit, 'id' | 'createdAt'>): Promise<Kit> {
    const db = database.getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();

    await db.runAsync(
      'INSERT INTO kits (id, name, description, kit_type, location_id, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, kit.name, kit.description || null, kit.kitType, kit.locationId || null, now]
    );

    return {
      ...kit,
      id,
      createdAt: now,
    };
  }

  async update(id: string, updates: Partial<Kit>): Promise<void> {
    const db = database.getDatabase();
    const fields = [];
    const values = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.kitType !== undefined) {
      fields.push('kit_type = ?');
      values.push(updates.kitType);
    }
    if (updates.locationId !== undefined) {
      fields.push('location_id = ?');
      values.push(updates.locationId);
    }

    values.push(id);

    if (fields.length > 0) {
      await db.runAsync(
        `UPDATE kits SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }
  }

  async delete(id: string): Promise<void> {
    const db = database.getDatabase();
    await db.runAsync('DELETE FROM kits WHERE id = ?', [id]);
  }

  async getCount(): Promise<number> {
    const db = database.getDatabase();
    const result = await db.getAllAsync('SELECT COUNT(*) as count FROM kits');
    return (result[0] as any)?.count || 0;
  }

  // Kit Items
  async getKitItems(kitId: string): Promise<KitItem[]> {
    const db = database.getDatabase();
    const rows = await db.getAllAsync(
      'SELECT * FROM kit_items WHERE kit_id = ?',
      [kitId]
    );
    return rows.map(this.mapRowToKitItem);
  }

  async addKitItem(kitItem: Omit<KitItem, 'id'>): Promise<KitItem> {
    const db = database.getDatabase();
    const id = uuidv4();

    await db.runAsync(
      'INSERT INTO kit_items (id, kit_id, asset_id, quantity_required, is_packed, last_verified) VALUES (?, ?, ?, ?, ?, ?)',
      [id, kitItem.kitId, kitItem.assetId, kitItem.quantityRequired, kitItem.isPacked ? 1 : 0, kitItem.lastVerified || null]
    );

    return {
      ...kitItem,
      id,
    };
  }

  async updateKitItem(id: string, updates: Partial<KitItem>): Promise<void> {
    const db = database.getDatabase();
    const fields = [];
    const values = [];

    if (updates.quantityRequired !== undefined) {
      fields.push('quantity_required = ?');
      values.push(updates.quantityRequired);
    }
    if (updates.isPacked !== undefined) {
      fields.push('is_packed = ?');
      values.push(updates.isPacked ? 1 : 0);
    }
    if (updates.lastVerified !== undefined) {
      fields.push('last_verified = ?');
      values.push(updates.lastVerified);
    }

    values.push(id);

    if (fields.length > 0) {
      await db.runAsync(
        `UPDATE kit_items SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }
  }

  async removeKitItem(id: string): Promise<void> {
    const db = database.getDatabase();
    await db.runAsync('DELETE FROM kit_items WHERE id = ?', [id]);
  }

  async getKitProgress(kitId: string): Promise<{ packed: number; total: number }> {
    const db = database.getDatabase();
    const result = await db.getAllAsync(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_packed = 1 THEN 1 ELSE 0 END) as packed
      FROM kit_items
      WHERE kit_id = ?
    `, [kitId]);

    const row = result[0] as any;
    return {
      packed: row.packed || 0,
      total: row.total || 0,
    };
  }

  private mapRowToKit(row: any): Kit {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      kitType: row.kit_type,
      locationId: row.location_id,
      createdAt: row.created_at,
    };
  }

  private mapRowToKitItem(row: any): KitItem {
    return {
      id: row.id,
      kitId: row.kit_id,
      assetId: row.asset_id,
      quantityRequired: row.quantity_required,
      isPacked: row.is_packed === 1,
      lastVerified: row.last_verified,
    };
  }
}

export const kitService = new KitService();
