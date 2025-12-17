import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export default class UserSetting extends Model {
  static table = 'user_settings';

  @field('setting_key') settingKey!: string;
  @field('setting_value') settingValue!: string;
  @readonly @date('updated_at') updatedAt!: Date;
}
