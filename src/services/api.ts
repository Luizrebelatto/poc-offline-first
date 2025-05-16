const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

let allTodos: any[] = []

export const api = {
  async fetchTodos() {
    await delay(1000)
    return allTodos
  },

  async createTodo(todo: { text: string; completed: boolean }) {
    await delay(1000)
    const newTodo = {
      id: Date.now().toString(),
      ...todo,
      created_at: Date.now(),
      updated_at: Date.now(),
    }
    allTodos.push(newTodo)
    return newTodo
  },

  async updateTodo(id: string, updates: { text?: string; completed?: boolean }) {
    await delay(1000)
    const todo = allTodos.find(task => task.id === id)
    if (todo) {
      Object.assign(todo, { ...updates, updated_at: Date.now() })
      return todo
    }
    throw new Error('Todo not found')
  },

  async deleteTodo(id: string) {
    await delay(1000)
    const index = allTodos.findIndex(task => task.id === id)
    if (index !== -1) {
      allTodos.splice(index, 1)
      return true
    }
    throw new Error('Todo not found')
  }
} 