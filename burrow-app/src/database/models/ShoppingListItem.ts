import { Model } from '@nozbe/watermelondb';
import { field, relation, readonly, date } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';

export default class ShoppingListItem extends Model {
  static table = 'shopping_list_items';
  static associations: Associations = {
    assets: { type: 'belongs_to', key: 'asset_id' },
  };

  @field('asset_id') assetId!: string;
  @field('current_quantity') currentQuantity!: number;
  @field('par_quantity') parQuantity!: number;
  @field('quantity_to_buy') quantityToBuy!: number;
  @field('priority') priority!: string;
  @field('source_url') sourceUrl?: string;
  @field('estimated_cost') estimatedCost?: number;
  @field('completed') completed!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('assets', 'asset_id') asset: any;
}
