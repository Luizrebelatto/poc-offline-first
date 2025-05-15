import { Model } from '@nozbe/watermelondb'
import { field, date, readonly } from '@nozbe/watermelondb/decorators'

export default class Todo extends Model {
  static table = 'todos'

  @field('text') text!: string
  @field('completed') completed!: boolean
  @field('server_id') serverId?: string
  @field('is_synced') isSynced!: boolean
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
} 