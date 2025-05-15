import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { database } from './src/database';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import { Q } from '@nozbe/watermelondb';
import { syncService } from './src/services/sync';
import Todo from './src/database/models/Todo';

function App() {
  const [text, setText] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadTodos();
    // Set up periodic sync
    const syncInterval = setInterval(sync, 30000); // Sync every 30 seconds
    return () => clearInterval(syncInterval);
  }, []);

  const loadTodos = async () => {
    const todosCollection = database.collections.get('todos');
    const todosList = await todosCollection.query().fetch() as Todo[];
    setTodos(todosList);
    setIsLoading(false);
  };

  const sync = async () => {
    setIsSyncing(true);
    try {
      await syncService.sync();
      await loadTodos();
    } catch (error) {
      console.error('Sync failed:', error);
    }
    setIsSyncing(false);
  };

  const addTodo = async () => {
    if (text.trim().length === 0) return;

    const todosCollection = database.collections.get('todos');
    await database.write(async () => {
      await todosCollection.create((todo: Todo) => {
        todo.text = text.trim();
        todo.completed = false;
        todo.isSynced = false;
      });
    });

    setText('');
    await loadTodos();
  };

  const toggleTodo = async (todo: Todo) => {
    await database.write(async () => {
      await todo.update(record => {
        record.completed = !record.completed;
        record.isSynced = false;
      });
    });
    await loadTodos();
  };

  const deleteTodo = async (todo: Todo) => {
    await database.write(async () => {
      await todo.destroyPermanently();
    });
    await loadTodos();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>My Todo List</Text>
        {isSyncing && (
          <ActivityIndicator size="small" color="white" style={styles.syncIndicator} />
        )}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Add a new task..."
          placeholderTextColor="#666"
        />
        <TouchableOpacity style={styles.addButton} onPress={addTodo}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.todoItem}>
            <TouchableOpacity
              style={styles.todoTextContainer}
              onPress={() => toggleTodo(item)}
            >
              <View style={[styles.checkbox, item.completed && styles.checked]} />
              <Text
                style={[
                  styles.todoText,
                  item.completed && styles.completedText,
                ]}
              >
                {item.text}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteTodo(item)}
            >
              <Text style={styles.deleteButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#4CAF50',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  syncIndicator: {
    marginLeft: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  todoTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginRight: 10,
  },
  checked: {
    backgroundColor: '#4CAF50',
  },
  todoText: {
    fontSize: 16,
    color: '#333',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  deleteButton: {
    padding: 5,
  },
  deleteButtonText: {
    fontSize: 24,
    color: '#ff4444',
    fontWeight: 'bold',
  },
});

export default withDatabase(App);
