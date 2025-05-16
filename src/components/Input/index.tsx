import React, { useState } from "react";
import { StyleSheet, View, TextInput } from "react-native";
import ActionButton from "../ActionButton";
import { database } from "../../database";
import Todo from "../../database/models/Todo";

interface IInput {
    loadTodos: () => void;
}

export default function Input({ loadTodos }:IInput) {
    const [text, setText] = useState('');

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

    return (
        <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Add a new task..."
          placeholderTextColor="#666"
        />
        <ActionButton
          onPress={addTodo}
          text='Add'
          type='add'
        />
      </View>
    );
}

const styles = StyleSheet.create({
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
})

