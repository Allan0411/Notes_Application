import React, { useState } from 'react';
import {View,TextInput,Text,StyleSheet,FlatList,StatusBar,
  Pressable,SafeAreaView,Alert,} from 'react-native';

export default function App() {
  const [note, setNote] = useState('');
  const [notesList, setNotesList] = useState([]);
  const [editId, setEditId] = useState(null);

  const handleSaveNote = () => {
    if (note.trim() === '') {
      Alert.alert('Empty Note', 'Please write something before saving!');
      return;
    }

    if (editId) {
      const updatedList = notesList.map(n =>
        n.id === editId ? { ...n, text: note, updatedAt: new Date().toISOString() } : n
      );
      setNotesList(updatedList);
      setEditId(null);
    } else {
      const newNote = {
        id: Date.now().toString(),
        text: note,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setNotesList([...notesList, newNote]);
    }

    setNote('');
  };

  const handleDeleteNote = id => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setNotesList(notesList.filter(note => note.id !== id));
            if (editId === id) {
              setEditId(null);
              setNote('');
            }
          },
        },
      ]
    );
  };

  const handleEditNote = item => {
    setNote(item.text);
    setEditId(item.id);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📝</Text>
      <Text style={styles.emptyTitle}>No notes yet</Text>
      <Text style={styles.emptySubtitle}>Create your first note above</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Notes</Text>
        <Text style={styles.noteCount}>
          {notesList.length} {notesList.length === 1 ? 'note' : 'notes'}
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, editId && styles.inputEditing]}
          placeholder="Write your note..."
          placeholderTextColor="#999"
          multiline
          value={note}
          onChangeText={setNote}
          maxLength={500}
        />
        <Text style={styles.charCount}>{note.length}/500</Text>
        
        <Pressable
          style={[styles.saveButton, !note.trim() && styles.saveButtonDisabled]}
          onPress={handleSaveNote}
          disabled={!note.trim()}
        >
          <Text style={styles.saveButtonText}>
            {editId ? '✏️ Update Note' : ' Save Note'}
          </Text>
        </Pressable>

        {editId && (
          <Pressable
            style={styles.cancelButton}
            onPress={() => {
              setEditId(null);
              setNote('');
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={notesList}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={notesList.length === 0 && styles.listEmpty}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
        renderItem={({ item, index }) => (
          <View style={[styles.noteItem, index === 0 && styles.firstNoteItem]}>
            <View style={styles.noteHeader}>
              <Text style={styles.noteDate}>
                {formatDate(item.updatedAt)}
              </Text>
              <View style={styles.noteActions}>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => handleEditNote(item)}
                >
                  <Text style={styles.editIcon}>✏️</Text>
                </Pressable>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => handleDeleteNote(item.id)}
                >
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </Pressable>
              </View>
            </View>
            <Text style={styles.noteText} numberOfLines={0}>
              {item.text}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#667eea',
    paddingTop: 20,
    paddingBottom: 25,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  noteCount: {
    fontSize: 16,
    color: '#e0e6ff',
    opacity: 0.9,
  },
  inputContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    borderColor: '#e1e8ed',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    lineHeight: 24,
    backgroundColor: '#fafbfc',
  },
  inputEditing: {
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff',
  },
  charCount: {
    fontSize: 12,
    color: '#8e9aaf',
    textAlign: 'right',
    marginTop: 8,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#7b96f0d7',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f56565',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  firstNoteItem: {
    marginTop: 0,
  },
  noteItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  noteDate: {
    fontSize: 12,
    color: '#8e9aaf',
    fontWeight: '500',
  },
  noteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f7fafc',
  },
  editIcon: {
    fontSize: 16,
  },
  deleteIcon: {
    fontSize: 16,
  },
  noteText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2d3748',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.3,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8e9aaf',
    textAlign: 'center',
  },
});