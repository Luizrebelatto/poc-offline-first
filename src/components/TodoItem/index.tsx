import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import ActionButton from "../ActionButton";
import { database } from "../../database";
import Todo from "../../database/models/Todo";


interface IActionButton {
    loadTodos: () => void;
    item: any;
}

export default function TodoItem({ loadTodos, item }: IActionButton) {
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

    return (
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
            <ActionButton
              text='x'
              type='delete'
              onPress={() => deleteTodo(item)}
            />
          </View>
    );
}

const styles = StyleSheet.create({
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
})