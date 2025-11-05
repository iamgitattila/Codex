import { Model } from '@nozbe/watermelondb';
import { field, relation, children, readonly, date } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';

export default class Kit extends Model {
  static table = 'kits';
  static associations: Associations = {
    locations: { type: 'belongs_to', key: 'location_id' },
    kit_items: { type: 'has_many', foreignKey: 'kit_id' },
  };

  @field('name') name!: string;
  @field('description') description?: string;
  @field('kit_type') kitType!: string;
  @field('location_id') locationId?: string;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('locations', 'location_id') location: any;
  @children('kit_items') kitItems: any;
}
