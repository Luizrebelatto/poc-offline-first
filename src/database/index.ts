import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import schema from './schema'
import Todo from './models/Todo'

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'todoAppDB',
  migrations: [],
  onSetUpError: error => {
    console.error('Failed to set up database:', error)
  }
})

export const database = new Database({
  adapter,
  modelClasses: [Todo],
}) 