import { Model } from '@nozbe/watermelondb';
import { field, relation, readonly, date } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';

export default class KitItem extends Model {
  static table = 'kit_items';
  static associations: Associations = {
    kits: { type: 'belongs_to', key: 'kit_id' },
    assets: { type: 'belongs_to', key: 'asset_id' },
  };

  @field('kit_id') kitId!: string;
  @field('asset_id') assetId!: string;
  @field('quantity_required') quantityRequired!: number;
  @field('is_packed') isPacked!: boolean;
  @date('last_verified') lastVerified?: Date;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('kits', 'kit_id') kit: any;
  @relation('assets', 'asset_id') asset: any;
}
