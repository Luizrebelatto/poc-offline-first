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
          const allTodos = await api.createTodo({
            text: todo.text,
            completed: todo.completed,
          })
          await database.write(async () => {
            await todo.update(record => {
              record.serverId = allTodos.id
              record.isSynced = true
            })
          })
        }
      } catch (error) {
        console.error('Sync error:', error)
      }
    }

    const allTodoss = await api.fetchTodos()
    
    await database.write(async () => {
      for (const allTodos of allTodoss) {
        const localTodo = await todosCollection
          .query(Q.where('server_id', allTodos.id))
          .fetch()

        if (localTodo.length === 0) {
          // Create new local todo
          await todosCollection.create(todo => {
            todo.text = allTodos.text
            todo.completed = allTodos.completed
            todo.serverId = allTodos.id
            todo.isSynced = true
          })
        } else {
          // Update existing local todo
          const todo = localTodo[0]
          if (todo.updatedAt.getTime() < allTodos.updated_at) {
            await todo.update(record => {
              record.text = allTodos.text
              record.completed = allTodos.completed
              record.isSynced = true
            })
          }
        }
      }
    })
  }
} 