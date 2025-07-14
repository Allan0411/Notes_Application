import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function NoteDetailScreen({ route }) {
  const { note } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 Note Detail</Text>
      <ScrollView style={styles.contentBox}>
        <Text style={styles.content}>{note.text}</Text>
        <Text style={styles.date}>
          Last updated: {new Date(note.updatedAt).toLocaleString()}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#edf2f7', // Grey shade like HomeScreen
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
  },
  contentBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { height: 2 },
  },
  content: {
    fontSize: 18,
    lineHeight: 26,
    color: '#333',
  },
  date: {
    marginTop: 20,
    fontSize: 12,
    color: '#718096',
  },
});
