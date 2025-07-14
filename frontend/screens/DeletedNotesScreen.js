// screens/DeletedNotesScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DeletedNotesScreen() {
  console.log('DeletedNotesScreen loaded'); // ✅ Debug log
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗑️ Deleted Notes</Text>
      <Text style={styles.message}>No deleted notes yet.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  message: {
    fontSize: 16,
    color: '#718096',
    marginTop: 10,
  },
});
