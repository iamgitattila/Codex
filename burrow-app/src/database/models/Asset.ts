import { Model } from '@nozbe/watermelondb';
import { field, relation, date, readonly } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';

export default class Asset extends Model {
  static table = 'assets';
  static associations: Associations = {
    locations: { type: 'belongs_to', key: 'location_id' },
    kit_items: { type: 'has_many', foreignKey: 'asset_id' },
    expiration_alerts: { type: 'has_many', foreignKey: 'asset_id' },
    shopping_list_items: { type: 'has_many', foreignKey: 'asset_id' },
  };

  @field('name') name!: string;
  @field('category') category!: string;
  @field('subcategory') subcategory?: string;
  @field('description') description?: string;
  @field('quantity_owned') quantityOwned!: number;
  @field('quantity_par') quantityPar?: number;
  @field('unit_type') unitType!: string;
  @field('location_id') locationId!: string;
  @date('expiration_date') expirationDate?: Date;
  @date('date_acquired') dateAcquired?: Date;
  @date('last_verified') lastVerified?: Date;
  @field('cost_usd') costUsd?: number;
  @field('source_url') sourceUrl?: string;
  @field('barcode_ean') barcodeEan?: string;
  @field('photo_path') photoPath?: string;
  @field('notes') notes?: string;
  @field('condition') condition?: string;
  @field('rotation_status') rotationStatus!: string;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('locations', 'location_id') location: any;
}
