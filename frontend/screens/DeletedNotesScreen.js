import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../ThemeContext';

export default function DeletedNotesScreen() {
  const { activeTheme } = useContext(ThemeContext);
  const navigation = useNavigation();
  const route = useRoute();
  const deletedNotes = route.params?.deletedNotes || [];

  const isDark = activeTheme === 'dark';
  const backgroundColor = isDark ? '#1a202c' : '#f8f9fa';
  const titleColor = isDark ? '#edf2f7' : '#2d3748';
  const messageColor = isDark ? '#a0aec0' : '#718096';
  const cardBg = isDark ? '#2d3748' : '#ffffff';
  const textColor = isDark ? '#edf2f7' : '#2d3748';

  const handleRestore = (noteId) => {
    // Replace with real logic (Firebase/global context update)
    console.log(`Restore note with ID: ${noteId}`);
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Back Arrow Header */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color={titleColor} />
      </TouchableOpacity>

      {/* Page Title */}
      <Text style={[styles.title, { color: titleColor }]}>🗑️ Deleted Notes</Text>

      {/* Empty State */}
      {deletedNotes.length === 0 ? (
        <Text style={[styles.message, { color: messageColor }]}>
          No deleted notes yet.
        </Text>
      ) : (
        <FlatList
          data={deletedNotes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={[styles.noteCard, { backgroundColor: cardBg }]}>
              <Text style={[styles.noteText, { color: textColor }]}>
                {item.title}
              </Text>
              <TouchableOpacity onPress={() => handleRestore(item.id)}>
                <Text style={styles.restoreText}>Restore</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    alignSelf: 'center',
    marginTop: 20,
  },
  listContainer: {
    paddingBottom: 24,
    paddingTop: 10,
  },
  noteCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  noteText: {
    fontSize: 16,
    marginBottom: 8,
  },
  restoreText: {
    color: '#3182ce',
    fontWeight: '500',
    alignSelf: 'flex-end',
  },
});
