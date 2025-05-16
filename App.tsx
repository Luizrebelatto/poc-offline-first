import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { database } from './src/database';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import { syncService } from './src/services/sync';
import Todo from './src/database/models/Todo';
import TodoItem from './src/components/TodoItem';
import Input from './src/components/Input';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadTodos();
    const syncInterval = setInterval(sync, 30000);
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

      <Input loadTodos={loadTodos}/>

      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TodoItem item={item} loadTodos={loadTodos}/>}
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
});

export default withDatabase(App);
