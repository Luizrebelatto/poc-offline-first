import { database } from '../database'
import { api } from './api'
import { Q } from '@nozbe/watermelondb'

export const syncService = {
  async sync() {
    const todosCollection = database.collections.get('todos')
    
    const localChanges = await todosCollection
      .query(Q.where('is_synced', false))
      .fetch()

    for (const todo of localChanges) {
      try {
        if (todo.serverId) {
          await api.updateTodo(todo.serverId, {
            text: todo.text,
            completed: todo.completed,
          })
        } else {
          const serverTodo = await api.createTodo({
            text: todo.text,
            completed: todo.completed,
          })
          await database.write(async () => {
            await todo.update(record => {
              record.serverId = serverTodo.id
              record.isSynced = true
            })
          })
        }
      } catch (error) {
        console.error('Sync error:', error)
      }
    }

    const serverTodos = await api.fetchTodos()
    
    await database.write(async () => {
      for (const serverTodo of serverTodos) {
        const localTodo = await todosCollection
          .query(Q.where('server_id', serverTodo.id))
          .fetch()

        if (localTodo.length === 0) {
          // Create new local todo
          await todosCollection.create(todo => {
            todo.text = serverTodo.text
            todo.completed = serverTodo.completed
            todo.serverId = serverTodo.id
            todo.isSynced = true
          })
        } else {
          // Update existing local todo
          const todo = localTodo[0]
          if (todo.updatedAt.getTime() < serverTodo.updated_at) {
            await todo.update(record => {
              record.text = serverTodo.text
              record.completed = serverTodo.completed
              record.isSynced = true
            })
          }
        }
      }
    })
  }
} 