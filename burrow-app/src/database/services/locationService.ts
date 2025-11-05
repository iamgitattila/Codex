import { database } from '../index';
import { Location } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export class LocationService {
  async getAll(): Promise<Location[]> {
    const db = database.getDatabase();
    const rows = await db.getAllAsync('SELECT * FROM locations ORDER BY "order" ASC');
    return rows.map(this.mapRowToLocation);
  }

  async getById(id: string): Promise<Location | null> {
    const db = database.getDatabase();
    const rows = await db.getAllAsync('SELECT * FROM locations WHERE id = ?', [id]);
    return rows.length > 0 ? this.mapRowToLocation(rows[0]) : null;
  }

  async getByType(type: string): Promise<Location[]> {
    const db = database.getDatabase();
    const rows = await db.getAllAsync(
      'SELECT * FROM locations WHERE location_type = ? ORDER BY "order" ASC',
      [type]
    );
    return rows.map(this.mapRowToLocation);
  }

  async create(location: Omit<Location, 'id' | 'createdAt'>): Promise<Location> {
    const db = database.getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();

    await db.runAsync(
      'INSERT INTO locations (id, name, description, location_type, "order", created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, location.name, location.description || null, location.locationType, location.order, now]
    );

    return {
      ...location,
      id,
      createdAt: now,
    };
  }

  async update(id: string, updates: Partial<Location>): Promise<void> {
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
    if (updates.locationType !== undefined) {
      fields.push('location_type = ?');
      values.push(updates.locationType);
    }
    if (updates.order !== undefined) {
      fields.push('"order" = ?');
      values.push(updates.order);
    }

    values.push(id);

    if (fields.length > 0) {
      await db.runAsync(
        `UPDATE locations SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }
  }

  async delete(id: string): Promise<void> {
    const db = database.getDatabase();
    await db.runAsync('DELETE FROM locations WHERE id = ?', [id]);
  }

  async getCount(): Promise<number> {
    const db = database.getDatabase();
    const result = await db.getAllAsync('SELECT COUNT(*) as count FROM locations');
    return (result[0] as any)?.count || 0;
  }

  async getItemCount(locationId: string): Promise<number> {
    const db = database.getDatabase();
    const result = await db.getAllAsync(
      'SELECT COUNT(*) as count FROM assets WHERE location_id = ?',
      [locationId]
    );
    return (result[0] as any)?.count || 0;
  }

  private mapRowToLocation(row: any): Location {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      locationType: row.location_type,
      order: row.order,
      createdAt: row.created_at,
    };
  }
}

export const locationService = new LocationService();
