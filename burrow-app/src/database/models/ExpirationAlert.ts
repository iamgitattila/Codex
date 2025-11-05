import { Model } from '@nozbe/watermelondb';
import { field, relation, readonly, date } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';

export default class ExpirationAlert extends Model {
  static table = 'expiration_alerts';
  static associations: Associations = {
    assets: { type: 'belongs_to', key: 'asset_id' },
  };

  @field('asset_id') assetId!: string;
  @date('expiration_date') expirationDate!: Date;
  @field('days_until_expiration') daysUntilExpiration!: number;
  @field('alert_sent') alertSent!: boolean;
  @date('alert_date') alertDate?: Date;
  @field('action_taken') actionTaken?: string;
  @date('action_date') actionDate?: Date;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('assets', 'asset_id') asset: any;
}
