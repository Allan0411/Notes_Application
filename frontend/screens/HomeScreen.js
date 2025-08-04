import React, { useState, useRef, useEffect, useContext, Suspense } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
  SafeAreaView, Alert, StatusBar, TouchableOpacity, Animated, Dimensions, TouchableWithoutFeedback, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
const SCREEN_WIDTH = Dimensions.get('window').width;
import { useFocusEffect } from '@react-navigation/native';

// Import the ThemeContext directly
import { ThemeContext } from '../ThemeContext'; // Correct path to your ThemeContext

// Define your color palettes directly in HomeScreen.js
// This needs to be consistent with what you'd expect for light/dark
const lightColors = {
  background: '#edf2f7',
  cardBackground: '#fff',
  text: '#2d3748',
  subText: '#718096',
  headerBackground: '#4a5568',
  headerText: '#fff',
  iconColor: '#4a5568',
  borderColor: '#e2e8f0',
  drawerBackground: '#fff',
  drawerHeaderBackground: '#f8fafc',
  searchBackground: '#fff',
  searchText: '#2d3748',
  searchPlaceholder: '#a0aec0',
  deleteIcon: '#d11a2a',
  onlineIndicator: '#38a169',
  logoutText: '#e53e3e',
};

const darkColors = {
  background: '#1a202c',
  cardBackground: '#2d3748',
  text: '#e2e8f0',
  subText: '#a0aec0',
  headerBackground: '#2d3748',
  headerText: '#fff',
  iconColor: '#cbd5e0',
  borderColor: '#4a5568',
  drawerBackground: '#2d3748',
  drawerHeaderBackground: '#1a202c',
  searchBackground: '#4a5568',
  searchText: '#e2e8f0',
  searchPlaceholder: '#cbd5e0',
  deleteIcon: '#fc8181',
  onlineIndicator: '#48bb78',
  logoutText: '#fc8181',
};


export default function HomeScreen({ navigation }) {
  // Use useContext to get the values provided by ThemeContext.Provider
  const { activeTheme } = useContext(ThemeContext);

  // Determine the current color palette based on activeTheme
  const colors = activeTheme === 'dark' ? darkColors : lightColors;

  const [notesList, setNotesList] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
  });
  //fetching data of user from the database. dont change this guys
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token)
          return;
        const res = await fetch(API_BASE_URL + "/Auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },

        });

        if (!res.ok)
          throw new Error("failed to fetch")

        const data = await res.json();
        setUserInfo({
          name: data.username || 'user',
          email: data.email || 'email'
        })

      }
      catch (err) {
        console.error("Error fetching user info:", err);
        alert("couldnt fetch user info");
      }
    };
    fetchUserInfo();

  }, []);

  //fetch notes titles
  const fetchNotes = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');

    const response = await fetch(API_BASE_URL+`/notes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

      const text = await response.text();  // Handle empty or invalid JSON

      if (!response.ok) {
        console.error('API error:', response.status);
        return;
      }

      const notes = text ? JSON.parse(text) : [];
      console.log('Fetched Notes:', notes);
      setNotesList(notes); // ✅ Update your noteList state
    } catch (error) {
      console.error('Fetch Notes error:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchNotes();
      // (OPTIONAL) fetchUserInfo() if needed, too.
    }, [])
  );


  const handleAddNote = () => {
    const newNote = {
      id: null,
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

  const handleDeleteAPI = async (id) => {

    const token=await AsyncStorage.getItem('authToken');
    try{
      const response=await fetch(API_BASE_URL+`/notes/${id}`,{
        method:'DELETE',
        headers:{
          'Content-Type':'application/json',
          'Authorization':`Bearer ${token}`
        }
      })

      console.log(response.text());
      console.log(response.status);
      if (response.ok) {
        alert("Note deleted successfully ");
        return true;
      }
      else {
        alert("error handling deletino of notes");
        return false;
      }

    }
    catch (err) {
      console.error("error while deleting: ", err);
      return false;
    }
  }

  const handleDeleteNote = id => {



    Alert.alert('Delete Note', `Are you sure you want to delete this note?${id}`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const success = await handleDeleteAPI(id);
          if (success) {
            setNotesList(notesList.filter(note => note.id !== id));
          }
          else {
            alert('Error deleting note.')
          }



        },
      },
    ]);


  };

  const handleEditNote = (note) => {
    console.log(note);
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
      toValue: SCREEN_WIDTH * 0.35,
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.headerText === '#fff' ? 'light-content' : 'dark-content'} backgroundColor={colors.headerBackground} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground }]}>
        <View style={styles.titleRow}>
          <Ionicons name="book" size={28} color={colors.headerText} />
          <Text style={[styles.headerTitle, { color: colors.headerText }]}>My Notes</Text>
        </View>
        <TouchableOpacity onPress={openDrawer}>
          <Ionicons name="menu" size={26} color={colors.headerText} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.searchBackground }]}>
          <Ionicons name="search" size={20} color={colors.subText} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.searchText }]}
            placeholder="Search notes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.searchPlaceholder}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.subText} />
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
            <Ionicons name="document-text-outline" size={64} color={colors.subText} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </Text>
            <Text style={[styles.emptySubText, { color: colors.subText }]}>
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
            style={[styles.noteCard, { backgroundColor: colors.cardBackground }]}
          >
            <View style={styles.noteHeader}>
              <View style={styles.noteInfo}>
                <Ionicons
                  name={getNoteTypeIcon(item)}
                  size={16}
                  color={colors.iconColor}
                  style={styles.noteIcon}
                />
                <Text style={[styles.noteDate, { color: colors.subText }]}>{formatDate(item.updatedAt)}</Text>
              </View>
              <View style={styles.noteActions}>
                <Pressable
                  onPress={() => handleEditNote(item)}
                  style={styles.actionButton}
                >
                  <Ionicons name="create" size={18} color={colors.iconColor} />
                </Pressable>
                <Pressable
                  onPress={() => handleDeleteNote(item.id)}
                  style={styles.actionButton}
                >
                  <Ionicons name="trash" size={18} color={colors.deleteIcon} />
                </Pressable>
              </View>
            </View>

            <Text style={[styles.notePreview, { color: colors.text }]} numberOfLines={3}>
              {getPreviewText(item)}
            </Text>

            {/* Show content indicators */}
            <View style={styles.contentIndicators}>
              {item.text && item.text.trim() && (
                <View style={styles.indicator}>
                  <Ionicons name="document-text" size={12} color={colors.subText} />
                  <Text style={[styles.indicatorText, { color: colors.subText }]}>Text</Text>
                </View>
              )}
              {item.checklistItems && item.checklistItems.length > 0 && (
                <View style={styles.indicator}>
                  <Ionicons name="checkbox" size={12} color={colors.subText} />
                  <Text style={[styles.indicatorText, { color: colors.subText }]}>
                    {item.checklistItems.length} items
                  </Text>
                </View>
              )}
              {item.drawings && item.drawings.length > 0 && (
                <View style={styles.indicator}>
                  <Ionicons name="brush" size={12} color={colors.subText} />
                  <Text style={[styles.indicatorText, { color: colors.subText }]}>Drawing</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Floating Add Note Button - Bottom Right */}
      <TouchableOpacity style={[styles.fabButton, { backgroundColor: colors.headerBackground }]} onPress={handleAddNote}>
        <Ionicons name="add" size={28} color={colors.headerText} />
      </TouchableOpacity>

      {/* Right-side slide drawer */}
      {drawerVisible && (
        <>
          <TouchableWithoutFeedback onPress={closeDrawer}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>
          <Animated.View style={[styles.drawer, { left: slideAnim, backgroundColor: colors.drawerBackground }]}>
            {/* Enhanced Drawer Header */}
            <View style={[styles.drawerHeader, { backgroundColor: colors.drawerHeaderBackground, borderBottomColor: colors.borderColor }]}>
              <View style={styles.drawerTitleSection}>
                <Ionicons name="book" size={24} color={colors.iconColor} />
                <Text style={[styles.drawerTitle, { color: colors.text }]}>Notes</Text>
              </View>

              {/* User Profile Section */}
              <TouchableOpacity
                style={[styles.userProfile, { backgroundColor: colors.cardBackground }]}
                onPress={() => {
                  closeDrawer();
                  navigation.navigate('UserProfile');
                }}
                activeOpacity={0.7}
              >
                <View style={styles.profileImageContainer}>
                  <View style={[styles.profileImage, { backgroundColor: colors.headerBackground }]}>
                    <Ionicons name="person" size={20} color={colors.headerText} />
                  </View>
                  <View style={[styles.onlineIndicator, { backgroundColor: colors.onlineIndicator, borderColor: colors.cardBackground }]} />
                </View>
                <View style={styles.userInfo}>
                  <Text style={[styles.userName, { color: colors.text }]}>{userInfo.name} </Text>
                  <Text style={[styles.userEmail, { color: colors.subText }]}>{userInfo.email}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.subText} />
              </TouchableOpacity>

              {/* Close Button */}
              <TouchableOpacity onPress={closeDrawer} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.subText} />
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={[styles.divider, { backgroundColor: colors.borderColor }]} />

            {/* Drawer Menu Items */}
            <View style={styles.drawerContent}>
              <TouchableOpacity
                onPress={() => {
                  closeDrawer();
                  navigation.navigate('DeletedNotes');
                }}
                style={[styles.drawerMenuItem, { borderBottomColor: colors.borderColor }]}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons name="trash-outline" size={20} color={colors.iconColor} />
                </View>
                <Text style={[styles.drawerItemText, { color: colors.text }]}>Deleted Notes</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.subText} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  closeDrawer();
                  navigation.navigate('Reminders');
                }}
                style={[styles.drawerMenuItem, { borderBottomColor: colors.borderColor }]}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons name="alarm-outline" size={20} color={colors.iconColor} />
                </View>
                <Text style={[styles.drawerItemText, { color: colors.text }]}>Reminders</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.subText} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  closeDrawer();
                  navigation.navigate('Settings');
                }}
                style={[styles.drawerMenuItem, { borderBottomColor: colors.borderColor }]}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons name="settings-outline" size={20} color={colors.iconColor} />
                </View>
                <Text style={[styles.drawerItemText, { color: colors.text }]}>Settings</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.subText} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  closeDrawer();
                  navigation.navigate('HelpFeedback');
                }}
                style={[styles.drawerMenuItem, { borderBottomColor: colors.borderColor }]}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons name="help-circle-outline" size={20} color={colors.iconColor} />
                </View>
                <Text style={[styles.drawerItemText, { color: colors.text }]}>Help & Feedback</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.subText} />
              </TouchableOpacity>

              {/* Spacer */}
              <View style={styles.menuSpacer} />

              {/* Logout with different styling */}
              <TouchableOpacity
                onPress={() => {
                  closeDrawer();
                  navigation.navigate('LogoutScreen');
                }}
                style={[styles.drawerMenuItem, styles.logoutMenuItem, { borderTopColor: colors.borderColor }]}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons name="log-out-outline" size={20} color={colors.logoutText} />
                </View>
                <Text style={[styles.drawerItemText, { color: colors.logoutText }]}>Logout</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.logoutText} />
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
  },
  header: {
    padding: 16,
    paddingTop: 10,
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
    fontWeight: 'bold',
    marginLeft: 10,
  },
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  noteCard: {
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
  },
  fabButton: {
    position: 'absolute',
    bottom: 24,
    right: 12,
    width: 60,
    height: 60,
    borderRadius: 30,
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
    borderBottomWidth: 1,
  },
  drawerTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
    borderWidth: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 30,
    right: 20,
    padding: 4,
  },
  divider: {
    height: 1,
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
  },
  menuIconContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 16,
  },
  drawerItemText: {
    fontSize: 16,
    flex: 1,
    fontWeight: '500',
  },
  menuSpacer: {
    flex: 1,
    minHeight: 20,
  },
  logoutMenuItem: {
    borderTopWidth: 1,
    marginTop: 10,
  },
  // No specific `logoutText` style needed here as it's directly applied with `color` prop
});