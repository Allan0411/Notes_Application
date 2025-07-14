import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, TextInput,
  SafeAreaView, Alert, StatusBar, TouchableOpacity, Animated, Dimensions, TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function HomeScreen({ navigation }) {
  const [note, setNote] = useState('');
  const [notesList, setNotesList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  const handleSaveNote = () => {
    if (note.trim() === '') {
      Alert.alert('Empty Note', 'Please write something!');
      return;
    }

    if (editId) {
      setNotesList(notesList.map(n =>
        n.id === editId ? { ...n, text: note, updatedAt: new Date().toISOString() } : n
      ));
      setEditId(null);
    } else {
      const newNote = {
        id: Date.now().toString(),
        text: note,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setNotesList([newNote, ...notesList]);
    }
    setNote('');
  };

  const handleDeleteNote = id => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
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
    ]);
  };

  const formatDate = dateStr => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openDrawer = () => {
    setDrawerVisible(true);
    Animated.timing(slideAnim, {
      toValue: SCREEN_WIDTH / 2,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_WIDTH,
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      setDrawerVisible(false);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4a5568" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="book" size={28} color="#fff" />
          <Text style={styles.headerTitle}>My Notes</Text>
        </View>
        <TouchableOpacity onPress={openDrawer}>
          <Ionicons name="menu" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Note Input */}
      <View style={styles.inputBox}>
        <TextInput
          placeholder="Write your note..."
          multiline
          maxLength={500}
          value={note}
          onChangeText={setNote}
          style={styles.input}
          placeholderTextColor="#999"
        />
        <Pressable
          onPress={handleSaveNote}
          disabled={!note.trim()}
          style={[styles.saveBtn, !note.trim() && styles.saveBtnDisabled]}
        >
          <Text style={styles.saveBtnText}>{editId ? '✏️ Update' : '➕ Save'}</Text>
        </Pressable>
      </View>

      {/* Notes List */}
      <FlatList
        data={notesList}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={<Text style={styles.emptyText}>📝 No notes yet</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('NoteDetail', { note: item })}
            style={styles.noteCard}
          >
            <View style={styles.noteRow}>
              <Text style={styles.noteDate}>{formatDate(item.updatedAt)}</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Pressable onPress={() => {
                  setEditId(item.id);
                  setNote(item.text);
                }}>
                  <Ionicons name="create" size={18} color="#333" />
                </Pressable>
                <Pressable onPress={() => handleDeleteNote(item.id)}>
                  <Ionicons name="trash" size={18} color="#d11a2a" />
                </Pressable>
              </View>
            </View>
            <Text style={styles.noteText} numberOfLines={3}>{item.text}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Right-side slide drawer */}
      {drawerVisible && (
        <>
          <TouchableWithoutFeedback onPress={closeDrawer}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>
          <Animated.View style={[styles.drawer, { left: slideAnim }]}>
            <TouchableOpacity onPress={() => {
              closeDrawer();
              navigation.navigate('DeletedNotes');
            }}>
              <Text style={styles.drawerItem}>🗑️ Deleted Notes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              closeDrawer();
              navigation.navigate('Reminders');
            }}>
              <Text style={styles.drawerItem}>⏰ Reminders</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              closeDrawer();
              navigation.navigate('Settings');
            }}>
              <Text style={styles.drawerItem}>⚙️ Settings</Text>
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#edf2f7' },
  header: {
    backgroundColor: '#4a5568',
    padding: 16,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  inputBox: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { height: 2 },
  },
  input: {
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    color: '#333',
  },
  saveBtn: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#4a5568',
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: '#ccc',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { height: 1 },
  },
  noteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  noteDate: {
    fontSize: 12,
    color: '#888',
  },
  noteText: {
    fontSize: 16,
    color: '#2d3748',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 30,
  },
  overlay: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    width: SCREEN_WIDTH / 2,
    height: '100%',
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
    elevation: 10,
    borderLeftWidth: 1,
    borderColor: '#ddd',
  },
  drawerItem: {
    fontSize: 18,
    paddingVertical: 16,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
});
