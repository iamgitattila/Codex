import { Model } from '@nozbe/watermelondb';
import { field, children, readonly, date } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';

export default class Location extends Model {
  static table = 'locations';
  static associations: Associations = {
    assets: { type: 'has_many', foreignKey: 'location_id' },
    kits: { type: 'has_many', foreignKey: 'location_id' },
  };

  @field('name') name!: string;
  @field('description') description?: string;
  @field('location_type') locationType!: string;
  @field('order') order!: number;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @children('assets') assets: any;
  @children('kits') kits: any;
}
