import { database } from '../index';
import { ShoppingListItem } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export class ShoppingListService {
  async getAll(): Promise<ShoppingListItem[]> {
    const db = database.getDatabase();
    const rows = await db.getAllAsync(`
      SELECT * FROM shopping_list
      WHERE completed = 0
      ORDER BY
        CASE priority
          WHEN 'Critical' THEN 1
          WHEN 'High' THEN 2
          WHEN 'Medium' THEN 3
          WHEN 'Low' THEN 4
        END
    `);
    return rows.map(this.mapRowToShoppingListItem);
  }

  async getById(id: string): Promise<ShoppingListItem | null> {
    const db = database.getDatabase();
    const rows = await db.getAllAsync('SELECT * FROM shopping_list WHERE id = ?', [id]);
    return rows.length > 0 ? this.mapRowToShoppingListItem(rows[0]) : null;
  }

  async create(item: Omit<ShoppingListItem, 'id' | 'createdAt'>): Promise<ShoppingListItem> {
    const db = database.getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO shopping_list (
        id, asset_id, current_quantity, par_quantity, quantity_to_buy,
        priority, source_url, estimated_cost, created_at, completed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, item.assetId, item.currentQuantity, item.parQuantity, item.quantityToBuy,
        item.priority, item.sourceUrl || null, item.estimatedCost || null, now, item.completed ? 1 : 0
      ]
    );

    return {
      ...item,
      id,
      createdAt: now,
    };
  }

  async update(id: string, updates: Partial<ShoppingListItem>): Promise<void> {
    const db = database.getDatabase();
    const fields = [];
    const values = [];

    if (updates.currentQuantity !== undefined) {
      fields.push('current_quantity = ?');
      values.push(updates.currentQuantity);
    }
    if (updates.parQuantity !== undefined) {
      fields.push('par_quantity = ?');
      values.push(updates.parQuantity);
    }
    if (updates.quantityToBuy !== undefined) {
      fields.push('quantity_to_buy = ?');
      values.push(updates.quantityToBuy);
    }
    if (updates.priority !== undefined) {
      fields.push('priority = ?');
      values.push(updates.priority);
    }
    if (updates.sourceUrl !== undefined) {
      fields.push('source_url = ?');
      values.push(updates.sourceUrl);
    }
    if (updates.estimatedCost !== undefined) {
      fields.push('estimated_cost = ?');
      values.push(updates.estimatedCost);
    }
    if (updates.completed !== undefined) {
      fields.push('completed = ?');
      values.push(updates.completed ? 1 : 0);
    }

    values.push(id);

    if (fields.length > 0) {
      await db.runAsync(
        `UPDATE shopping_list SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }
  }

  async delete(id: string): Promise<void> {
    const db = database.getDatabase();
    await db.runAsync('DELETE FROM shopping_list WHERE id = ?', [id]);
  }

  async markCompleted(id: string): Promise<void> {
    const db = database.getDatabase();
    await db.runAsync('UPDATE shopping_list SET completed = 1 WHERE id = ?', [id]);
  }

  async clearCompleted(): Promise<void> {
    const db = database.getDatabase();
    await db.runAsync('DELETE FROM shopping_list WHERE completed = 1');
  }

  async getTotalEstimatedCost(): Promise<number> {
    const db = database.getDatabase();
    const result = await db.getAllAsync(
      'SELECT SUM(estimated_cost) as total FROM shopping_list WHERE completed = 0 AND estimated_cost IS NOT NULL'
    );
    return (result[0] as any)?.total || 0;
  }

  private mapRowToShoppingListItem(row: any): ShoppingListItem {
    return {
      id: row.id,
      assetId: row.asset_id,
      currentQuantity: row.current_quantity,
      parQuantity: row.par_quantity,
      quantityToBuy: row.quantity_to_buy,
      priority: row.priority,
      sourceUrl: row.source_url,
      estimatedCost: row.estimated_cost,
      createdAt: row.created_at,
      completed: row.completed === 1,
    };
  }
}

export const shoppingListService = new ShoppingListService();
