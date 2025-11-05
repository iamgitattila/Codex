import { database } from '../index';
import { Asset } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export class AssetService {
  async getAll(): Promise<Asset[]> {
    const db = database.getDatabase();
    const rows = await db.getAllAsync(`
      SELECT * FROM assets
      ORDER BY name ASC
    `);
    return rows.map(this.mapRowToAsset);
  }

  async getById(id: string): Promise<Asset | null> {
    const db = database.getDatabase();
    const rows = await db.getAllAsync('SELECT * FROM assets WHERE id = ?', [id]);
    return rows.length > 0 ? this.mapRowToAsset(rows[0]) : null;
  }

  async getByLocation(locationId: string): Promise<Asset[]> {
    const db = database.getDatabase();
    const rows = await db.getAllAsync(
      'SELECT * FROM assets WHERE location_id = ? ORDER BY name ASC',
      [locationId]
    );
    return rows.map(this.mapRowToAsset);
  }

  async getByCategory(category: string): Promise<Asset[]> {
    const db = database.getDatabase();
    const rows = await db.getAllAsync(
      'SELECT * FROM assets WHERE category = ? ORDER BY name ASC',
      [category]
    );
    return rows.map(this.mapRowToAsset);
  }

  async getExpiringSoon(days: number = 30): Promise<Asset[]> {
    const db = database.getDatabase();
    const rows = await db.getAllAsync(`
      SELECT * FROM assets
      WHERE expiration_date IS NOT NULL
      AND julianday(expiration_date) - julianday('now') <= ?
      AND julianday(expiration_date) - julianday('now') >= 0
      ORDER BY expiration_date ASC
    `, [days]);
    return rows.map(this.mapRowToAsset);
  }

  async getBelowPar(): Promise<Asset[]> {
    const db = database.getDatabase();
    const rows = await db.getAllAsync(`
      SELECT * FROM assets
      WHERE quantity_par IS NOT NULL
      AND quantity_owned < quantity_par
      ORDER BY (quantity_par - quantity_owned) DESC
    `);
    return rows.map(this.mapRowToAsset);
  }

  async search(query: string): Promise<Asset[]> {
    const db = database.getDatabase();
    const searchTerm = `%${query}%`;
    const rows = await db.getAllAsync(`
      SELECT * FROM assets
      WHERE name LIKE ? OR description LIKE ? OR notes LIKE ?
      ORDER BY name ASC
    `, [searchTerm, searchTerm, searchTerm]);
    return rows.map(this.mapRowToAsset);
  }

  async create(asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Promise<Asset> {
    const db = database.getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();

    await db.runAsync(`
      INSERT INTO assets (
        id, name, category, subcategory, description,
        quantity_owned, quantity_par, unit_type, location_id,
        expiration_date, date_acquired, last_verified, cost_usd,
        source_url, barcode_ean, photo_path, notes,
        condition, rotation_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, asset.name, asset.category, asset.subcategory || null,
      asset.description || null, asset.quantityOwned, asset.quantityPar || null,
      asset.unitType, asset.locationId, asset.expirationDate || null,
      asset.dateAcquired || null, asset.lastVerified || null, asset.costUsd || null,
      asset.sourceUrl || null, asset.barcodeEan || null, asset.photoPath || null,
      asset.notes || null, asset.condition, asset.rotationStatus, now, now
    ]);

    return {
      ...asset,
      id,
      createdAt: now,
      updatedAt: now,
    } as Asset;
  }

  async update(id: string, updates: Partial<Asset>): Promise<void> {
    const db = database.getDatabase();
    const now = new Date().toISOString();

    const fields = [];
    const values = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.category !== undefined) {
      fields.push('category = ?');
      values.push(updates.category);
    }
    if (updates.subcategory !== undefined) {
      fields.push('subcategory = ?');
      values.push(updates.subcategory);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.quantityOwned !== undefined) {
      fields.push('quantity_owned = ?');
      values.push(updates.quantityOwned);
    }
    if (updates.quantityPar !== undefined) {
      fields.push('quantity_par = ?');
      values.push(updates.quantityPar);
    }
    if (updates.unitType !== undefined) {
      fields.push('unit_type = ?');
      values.push(updates.unitType);
    }
    if (updates.locationId !== undefined) {
      fields.push('location_id = ?');
      values.push(updates.locationId);
    }
    if (updates.expirationDate !== undefined) {
      fields.push('expiration_date = ?');
      values.push(updates.expirationDate);
    }
    if (updates.dateAcquired !== undefined) {
      fields.push('date_acquired = ?');
      values.push(updates.dateAcquired);
    }
    if (updates.lastVerified !== undefined) {
      fields.push('last_verified = ?');
      values.push(updates.lastVerified);
    }
    if (updates.costUsd !== undefined) {
      fields.push('cost_usd = ?');
      values.push(updates.costUsd);
    }
    if (updates.sourceUrl !== undefined) {
      fields.push('source_url = ?');
      values.push(updates.sourceUrl);
    }
    if (updates.barcodeEan !== undefined) {
      fields.push('barcode_ean = ?');
      values.push(updates.barcodeEan);
    }
    if (updates.photoPath !== undefined) {
      fields.push('photo_path = ?');
      values.push(updates.photoPath);
    }
    if (updates.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updates.notes);
    }
    if (updates.condition !== undefined) {
      fields.push('condition = ?');
      values.push(updates.condition);
    }
    if (updates.rotationStatus !== undefined) {
      fields.push('rotation_status = ?');
      values.push(updates.rotationStatus);
    }

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    if (fields.length > 0) {
      await db.runAsync(
        `UPDATE assets SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }
  }

  async delete(id: string): Promise<void> {
    const db = database.getDatabase();
    await db.runAsync('DELETE FROM assets WHERE id = ?', [id]);
  }

  async getTotalValue(): Promise<number> {
    const db = database.getDatabase();
    const result = await db.getAllAsync(
      'SELECT SUM(cost_usd * quantity_owned) as total FROM assets WHERE cost_usd IS NOT NULL'
    );
    return (result[0] as any)?.total || 0;
  }

  async getCount(): Promise<number> {
    const db = database.getDatabase();
    const result = await db.getAllAsync('SELECT COUNT(*) as count FROM assets');
    return (result[0] as any)?.count || 0;
  }

  private mapRowToAsset(row: any): Asset {
    return {
      id: row.id,
      name: row.name,
      category: row.category,
      subcategory: row.subcategory,
      description: row.description,
      quantityOwned: row.quantity_owned,
      quantityPar: row.quantity_par,
      unitType: row.unit_type,
      locationId: row.location_id,
      expirationDate: row.expiration_date,
      dateAcquired: row.date_acquired,
      lastVerified: row.last_verified,
      costUsd: row.cost_usd,
      sourceUrl: row.source_url,
      barcodeEan: row.barcode_ean,
      photoPath: row.photo_path,
      notes: row.notes,
      condition: row.condition,
      rotationStatus: row.rotation_status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export const assetService = new AssetService();
