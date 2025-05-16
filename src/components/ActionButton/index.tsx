import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface IActionButton {
    type?: 'add' | 'delete';
    text: string;
    onPress: () => void;
}

export default function ActionButton(data: IActionButton) {
    return (
        <TouchableOpacity
            style={data.type === "delete" ? styles.deleteButton : styles.addButton}
            onPress={data.onPress}
        >
            <Text style={data.type === "delete" ? styles.deleteButtonText : styles.addButtonText}>{data.text}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    deleteButton: {
        padding: 5,
    },
    deleteButtonText: {
        fontSize: 24,
        color: '#ff4444',
        fontWeight: 'bold',
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
})





