import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
  SafeAreaView, Alert, StatusBar, TouchableOpacity, Animated, Dimensions, TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function HomeScreen({ navigation }) {
  const [notesList, setNotesList] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  const handleAddNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: '',
      text: '',
      checklistItems: [],
      drawings: [],
      fontSize: 16,
      fontFamily: 'System',
      isBold: false,
      isItalic: false,
      textAlign: 'left',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Navigate to NoteDetail screen with the new note
    navigation.navigate('NoteDetail', { 
      note: newNote, 
      isNewNote: true,
      onSave: (updatedNote) => {
        // Add the new note to the list
        setNotesList([updatedNote, ...notesList]);
      }
    });
  };

  const handleDeleteNote = id => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setNotesList(notesList.filter(note => note.id !== id));
        },
      },
    ]);
  };

  const handleEditNote = (note) => {
    navigation.navigate('NoteDetail', { 
      note: note,
      isNewNote: false,
      onSave: (updatedNote) => {
        // Update the existing note in the list
        setNotesList(notesList.map(n => 
          n.id === updatedNote.id ? updatedNote : n
        ));
      }
    });
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

  const getPreviewText = (note) => {
    if (note.title && note.title.trim()) {
      return note.title;
    }
    if (note.text && note.text.trim()) {
      return note.text;
    }
    if (note.checklistItems && note.checklistItems.length > 0) {
      const firstItem = note.checklistItems[0];
      return `☑️ ${firstItem.text || 'Checklist item'}`;
    }
    if (note.drawings && note.drawings.length > 0) {
      return '🎨 Drawing';
    }
    return 'Empty note';
  };

  const getNoteTypeIcon = (note) => {
    if (note.drawings && note.drawings.length > 0) {
      return 'brush';
    }
    if (note.checklistItems && note.checklistItems.length > 0) {
      return 'checkbox';
    }
    return 'document-text';
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

      {/* Add Note Button */}
      <View style={styles.addNoteContainer}>
        <TouchableOpacity style={styles.addNoteButton} onPress={handleAddNote}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addNoteText}>Add Note</Text>
        </TouchableOpacity>
      </View>

      {/* Notes List */}
      <FlatList
        data={notesList}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#cbd5e0" />
            <Text style={styles.emptyText}>No notes yet</Text>
            <Text style={styles.emptySubText}>Tap the "Add Note" button to create your first note</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleEditNote(item)}
            style={styles.noteCard}
          >
            <View style={styles.noteHeader}>
              <View style={styles.noteInfo}>
                <Ionicons 
                  name={getNoteTypeIcon(item)} 
                  size={16} 
                  color="#4a5568" 
                  style={styles.noteIcon}
                />
                <Text style={styles.noteDate}>{formatDate(item.updatedAt)}</Text>
              </View>
              <View style={styles.noteActions}>
                <Pressable 
                  onPress={() => handleEditNote(item)}
                  style={styles.actionButton}
                >
                  <Ionicons name="create" size={18} color="#4a5568" />
                </Pressable>
                <Pressable 
                  onPress={() => handleDeleteNote(item.id)}
                  style={styles.actionButton}
                >
                  <Ionicons name="trash" size={18} color="#d11a2a" />
                </Pressable>
              </View>
            </View>
            
            <Text style={styles.notePreview} numberOfLines={3}>
              {getPreviewText(item)}
            </Text>
            
            {/* Show content indicators */}
            <View style={styles.contentIndicators}>
              {item.text && item.text.trim() && (
                <View style={styles.indicator}>
                  <Ionicons name="document-text" size={12} color="#718096" />
                  <Text style={styles.indicatorText}>Text</Text>
                </View>
              )}
              {item.checklistItems && item.checklistItems.length > 0 && (
                <View style={styles.indicator}>
                  <Ionicons name="checkbox" size={12} color="#718096" />
                  <Text style={styles.indicatorText}>
                    {item.checklistItems.length} items
                  </Text>
                </View>
              )}
              {item.drawings && item.drawings.length > 0 && (
                <View style={styles.indicator}>
                  <Ionicons name="brush" size={12} color="#718096" />
                  <Text style={styles.indicatorText}>Drawing</Text>
                </View>
              )}
            </View>
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
            <TouchableOpacity onPress={() => {
              closeDrawer();
              navigation.navigate('HelpFeedback');
            }}>
              <Text style={styles.drawerItem}>❓ Help & Feedback</Text>
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#edf2f7' 
  },
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
  addNoteContainer: {
    padding: 16,
    alignItems: 'center',
  },
  addNoteButton: {
    backgroundColor: '#4a5568',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { height: 2 },
    elevation: 3,
  },
  addNoteText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#4a5568',
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#718096',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { height: 1 },
    elevation: 2,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  noteIcon: {
    marginRight: 6,
  },
  noteDate: {
    fontSize: 12,
    color: '#718096',
  },
  noteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  notePreview: {
    fontSize: 16,
    color: '#2d3748',
    lineHeight: 22,
    marginBottom: 8,
  },
  contentIndicators: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  indicatorText: {
    fontSize: 10,
    color: '#718096',
  },
  overlay: {
    position: 'absolute',
    top: 0, 
    bottom: 0, 
    left: 0, 
    right: 0,
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