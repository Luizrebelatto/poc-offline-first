const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

let serverTodos: any[] = []

export const api = {
  async fetchTodos() {
    await delay(1000)
    return serverTodos
  },

  async createTodo(todo: { text: string; completed: boolean }) {
    await delay(1000)
    const newTodo = {
      id: Date.now().toString(),
      ...todo,
      created_at: Date.now(),
      updated_at: Date.now(),
    }
    serverTodos.push(newTodo)
    return newTodo
  },

  async updateTodo(id: string, updates: { text?: string; completed?: boolean }) {
    await delay(1000)
    const todo = serverTodos.find(t => t.id === id)
    if (todo) {
      Object.assign(todo, { ...updates, updated_at: Date.now() })
      return todo
    }
    throw new Error('Todo not found')
  },

  async deleteTodo(id: string) {
    await delay(1000)
    const index = serverTodos.findIndex(t => t.id === id)
    if (index !== -1) {
      serverTodos.splice(index, 1)
      return true
    }
    throw new Error('Todo not found')
  }
} 