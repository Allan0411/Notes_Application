import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
  SafeAreaView, Alert, StatusBar, TouchableOpacity, Animated, Dimensions, TouchableWithoutFeedback, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';


const SCREEN_WIDTH = Dimensions.get('window').width;

export default function HomeScreen({ navigation }) {
  const [notesList, setNotesList] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
      toValue: SCREEN_WIDTH * 0.35, // Increased width - showing more of the drawer
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

  // Filter notes based on search query
  const filteredNotes = notesList.filter(note => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (note.title && note.title.toLowerCase().includes(searchLower)) ||
      (note.text && note.text.toLowerCase().includes(searchLower)) ||
      (note.checklistItems && note.checklistItems.some(item => 
        item.text && item.text.toLowerCase().includes(searchLower)
      ))
    );
  });

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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#718096" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#a0aec0"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#718096" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Notes List */}
      <FlatList
        data={filteredNotes}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#cbd5e0" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </Text>
            <Text style={styles.emptySubText}>
              {searchQuery 
                ? 'Try searching for something else' 
                : 'Tap the "+" button to create your first note'
              }
            </Text>
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

      {/* Floating Add Note Button - Bottom Right */}
      <TouchableOpacity style={styles.fabButton} onPress={handleAddNote}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Right-side slide drawer */}
      {drawerVisible && (
        <>
          <TouchableWithoutFeedback onPress={closeDrawer}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>
          <Animated.View style={[styles.drawer, { left: slideAnim }]}>
            {/* Enhanced Drawer Header */}
            <View style={styles.drawerHeader}>
              <View style={styles.drawerTitleSection}>
                <Ionicons name="book" size={24} color="#4a5568" />
                <Text style={styles.drawerTitle}>Notes</Text>
              </View>
              
              {/* User Profile Section */}
              <TouchableOpacity 
                style={styles.userProfile}
                onPress={() => {
                  closeDrawer();
                  navigation.navigate('UserProfile');
                }}
                activeOpacity={0.7}
              >
                <View style={styles.profileImageContainer}>
                  <View style={styles.profileImage}>
                    <Ionicons name="person" size={20} color="#fff" />
                  </View>
                  <View style={styles.onlineIndicator} />
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>User </Text>
                  <Text style={styles.userEmail}>user122@email.com</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#cbd5e0" />
              </TouchableOpacity>
              
              {/* Close Button */}
              <TouchableOpacity onPress={closeDrawer} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#718096" />
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Drawer Menu Items */}
            <View style={styles.drawerContent}>
              <TouchableOpacity 
                onPress={() => {
                  closeDrawer();
                  navigation.navigate('DeletedNotes');
                }}
                style={styles.drawerMenuItem}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons name="trash-outline" size={20} color="#718096" />
                </View>
                <Text style={styles.drawerItemText}>Deleted Notes</Text>
                <Ionicons name="chevron-forward" size={16} color="#cbd5e0" />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => {
                  closeDrawer();
                  navigation.navigate('Reminders');
                }}
                style={styles.drawerMenuItem}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons name="alarm-outline" size={20} color="#718096" />
                </View>
                <Text style={styles.drawerItemText}>Reminders</Text>
                <Ionicons name="chevron-forward" size={16} color="#cbd5e0" />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => {
                  closeDrawer();
                  navigation.navigate('Settings');
                }}
                style={styles.drawerMenuItem}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons name="settings-outline" size={20} color="#718096" />
                </View>
                <Text style={styles.drawerItemText}>Settings</Text>
                <Ionicons name="chevron-forward" size={16} color="#cbd5e0" />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => {
                  closeDrawer();
                  navigation.navigate('HelpFeedback');
                }}
                style={styles.drawerMenuItem}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons name="help-circle-outline" size={20} color="#718096" />
                </View>
                <Text style={styles.drawerItemText}>Help & Feedback</Text>
                <Ionicons name="chevron-forward" size={16} color="#cbd5e0" />
              </TouchableOpacity>

              {/* Spacer */}
              <View style={styles.menuSpacer} />

              {/* Logout with different styling */}
              <TouchableOpacity 
                onPress={() => {
                  closeDrawer();
                  navigation.navigate('LogoutScreen');
                }}
                style={[styles.drawerMenuItem, styles.logoutMenuItem]}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons name="log-out-outline" size={20} color="#e53e3e" />
                </View>
                <Text style={[styles.drawerItemText, styles.logoutText]}>Logout</Text>
                <Ionicons name="chevron-forward" size={16} color="#e53e3e" />
              </TouchableOpacity>
            </View>
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
  searchContainer: {
    padding: 16,
    backgroundColor: '#edf2f7',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { height: 1 },
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2d3748',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 80, 
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
  fabButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4a5568',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { height: 4 },
    shadowRadius: 6,
    elevation: 8,
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
    width: SCREEN_WIDTH * 0.65, // Increased width to 65%
    height: '100%',
    backgroundColor: '#fff',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: -2, height: 0 },
    shadowRadius: 8,
  },
  // Enhanced Drawer Styles
  drawerHeader: {
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  drawerTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
    marginLeft: 8,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { height: 1 },
    elevation: 2,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4a5568',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#38a169',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#718096',
  },
  closeButton: {
    position: 'absolute',
    top: 30,
    right: 20,
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 20,
  },
  drawerContent: {
    flex: 1,
    paddingTop: 20,
  },
  drawerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f7fafc',
  },
  menuIconContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 16,
  },
  drawerItemText: {
    fontSize: 16,
    color: '#2d3748',
    flex: 1,
    fontWeight: '500',
  },
  menuSpacer: {
    flex: 1,
    minHeight: 20,
  },
  logoutMenuItem: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginTop: 10,
  },
  logoutText: {
    color: '#e53e3e',
  },
});