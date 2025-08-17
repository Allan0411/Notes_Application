import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
  SafeAreaView, Alert, StatusBar, TouchableOpacity, Animated, Dimensions, TouchableWithoutFeedback, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import styles from '../styleSheets/HomeScreenStyles'; // Import styles from the stylesheet




// Import the ThemeContext
import { ThemeContext } from '../ThemeContext';

// Import deleteNote from noteService
import { deleteNote,fetchNotes as apiFetchNotes } from '../services/noteService';

import {lightColors,darkColors} from '../utils/themeColors'
//normalizing notes 
import { normalizeNote } from '../utils/normalizeNote';

const SCREEN_WIDTH = Dimensions.get('window').width;



export default function HomeScreen({ navigation }) {
  // Use useContext to get the values provided by ThemeContext.Provider
  const { activeTheme } = useContext(ThemeContext);

  // Determine the current color palette based on activeTheme
  const colors = activeTheme === 'dark' ? darkColors : lightColors;

  const [notesList, setNotesList] = useState([]);
  const [deletedNotes, setDeletedNotes] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const [speakingNoteId, setSpeakingNoteId] = useState(null);

  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    return () => {
      try {
        Speech.stop();
        setSpeakingNoteId(null);
      } catch (e) {
        // ignore
      }
    };
  }, []);

  // Auto-cleanup old deleted notes (30 days)
  const cleanupOldDeletedNotes = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const filteredNotes = deletedNotes.filter(note => {
        if (!note.deletedAt) return true; // Keep notes without deletion date
        const deletedDate = new Date(note.deletedAt);
        return deletedDate > thirtyDaysAgo; // Keep notes deleted less than 30 days ago
      });

      // If any notes were removed, update storage
      if (filteredNotes.length !== deletedNotes.length) {
        const removedCount = deletedNotes.length - filteredNotes.length;
        setDeletedNotes(filteredNotes);
        await saveDeletedNotes(filteredNotes);
        
        console.log(`Auto-deleted ${removedCount} notes older than 30 days`);
        
        // Optional: Show notification to user
        if (removedCount > 0) {
          // You could show a toast or subtle notification here
          // Alert.alert('Cleanup', `${removedCount} old notes were automatically deleted`);
        }
      }
    } catch (error) {
      console.error('Error during auto-cleanup:', error);
    }
  };

  // Load deleted notes from AsyncStorage and perform cleanup
  const loadDeletedNotes = async () => {
    try {
      const stored = await AsyncStorage.getItem('deletedNotes');
      if (stored) {
        const notes = JSON.parse(stored);
        setDeletedNotes(notes);
        
        // Perform auto-cleanup after loading
        setTimeout(() => {
          cleanupOldDeletedNotes();
        }, 1000); // Delay cleanup by 1 second to avoid blocking UI
      }
    } catch (error) {
      console.error('Error loading deleted notes:', error);
    }
  };

  // Save deleted notes to AsyncStorage
  const saveDeletedNotes = async (notes) => {
    try {
      await AsyncStorage.setItem('deletedNotes', JSON.stringify(notes));
    } catch (error) {
      console.error('Error saving deleted notes:', error);
    }
  };

  // Load deleted notes on component mount and set up periodic cleanup
  useEffect(() => {
    loadDeletedNotes();
    
    // Set up periodic cleanup (runs every hour when app is active)
    const cleanupInterval = setInterval(() => {
      if (deletedNotes.length > 0) {
        cleanupOldDeletedNotes();
      }
    }, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(cleanupInterval);
  }, [deletedNotes.length]);

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
        // don't spam with alert on background fetches
      }
    };
    fetchUserInfo();

  }, []);

  //fetch notes titles

  //@note fetching notes
  const fetchNotes=async()=>{
    try{
      const notes= await apiFetchNotes();
      const normalized=Array.isArray(notes)
        ?notes.map(normalizeNote):[];

      setNotesList(normalized);
    }
    catch(error){
      console.error('Fetch Notes error: ', error);
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      fetchNotes();
      loadDeletedNotes(); // Also reload deleted notes when screen comes into focus
      
      // Optional: Show a brief message if there are restored notes
      const checkForRestoredNotes = async () => {
        try {
          const restoredFlag = await AsyncStorage.getItem('noteRestored');
          if (restoredFlag === 'true') {
            // Clear the flag
            await AsyncStorage.removeItem('noteRestored');
            // You could show a toast or brief message here if desired
            // Alert.alert('Note Restored', 'Your note has been restored successfully');
          }
        } catch (error) {
          // Ignore errors
        }
      };
      
      checkForRestoredNotes();
    }, [])
  );

  const handleAddNote = () => {
    const newNote = {
      id: null,
      title: '',
      textContents: '',
      checklistItems: [],
      drawings: [],
      fontSize: 16,
      fontFamily: 'System',
      isBold: false,
      isItalic: false,
      textAlign: 'left',
    };

    // Navigate to NoteDetail screen with the new note
    navigation.navigate('NoteDetail', {
      note: newNote,
      isNewNote: true,
      onSave: () => {
        // Re-fetch notes to ensure the list is up-to-date
        fetchNotes();
      }
    });
  };

  // Enhanced delete function that moves notes to bin instead of permanently deleting
  const handleDeleteNote = (id) => {
    Alert.alert('Move to Bin', `Are you sure you want to move this note to the bin?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Move to Bin',
        style: 'destructive',
        onPress: async () => {
          // Find the note to delete
          const noteToDelete = notesList.find(note => note.id === id);
          if (!noteToDelete) {
            Alert.alert('Error', 'Note not found');
            return;
          }

          // Add deletion timestamp for tracking
          const deletedNote = {
            ...noteToDelete,
            deletedAt: new Date().toISOString()
          };

          // Add to deleted notes
          const updatedDeletedNotes = [...deletedNotes, deletedNote];
          setDeletedNotes(updatedDeletedNotes);
          await saveDeletedNotes(updatedDeletedNotes);

          // Try to delete from API (but keep in local bin regardless)
          let apiSuccess = false;
          try {
            apiSuccess = await deleteNote(id);
          } catch (e) {
            apiSuccess = false;
          }
          
          if (apiSuccess) {
            // Remove from active notes list
            setNotesList(notesList.filter(note => note.id !== id));
            Alert.alert('Success', 'Note moved to bin successfully');
          } else {
            // Even if API fails, we keep it in local bin and remove from active list
            // This ensures the user experience is consistent
            setNotesList(notesList.filter(note => note.id !== id));
            Alert.alert('Note Moved', 'Note moved to bin (will sync when connection is restored)');
          }
        },
      },
    ]);
  };

  // Function to restore a note from the bin
  const restoreNote = async (noteId) => {
    try {
      const noteToRestore = deletedNotes.find(note => note.id === noteId);
      if (!noteToRestore) {
        Alert.alert('Error', 'Note not found in bin');
        return;
      }

      // Create a clean note object without deletion timestamp
      const { deletedAt, ...cleanNote } = noteToRestore;
      cleanNote.updatedAt = new Date().toISOString();

      // Try to restore to API (create new note since original was deleted)
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        try {
          const response = await fetch(API_BASE_URL + '/notes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              title: cleanNote.title || '',
              textContents: cleanNote.textContents || cleanNote.text || '',
              checklistItems: cleanNote.checklistItems || [],
              drawings: cleanNote.drawings || [],
              // Include any other fields your API expects
            })
          });

          if (response.ok) {
            const newNote = await response.json();
            // Use the new note data from API (with new ID)
            const normalizedNote = {
              id: newNote.id ?? newNote._id ?? null,
              title: newNote.title ?? cleanNote.title ?? '',
              textContents: newNote.textContents ?? newNote.text ?? cleanNote.textContents ?? cleanNote.text ?? '',
              checklistItems: Array.isArray(newNote.checklistItems) ? newNote.checklistItems : (cleanNote.checklistItems || []),
              drawings: Array.isArray(newNote.drawings) ? newNote.drawings : (cleanNote.drawings || []),
              createdAt: newNote.createdAt ?? new Date().toISOString(),
              updatedAt: newNote.updatedAt ?? new Date().toISOString(),
              ...newNote
            };

            // Add to notes list
            setNotesList(prev => [normalizedNote, ...prev]);
            
            // Remove from deleted notes
            const updatedDeletedNotes = deletedNotes.filter(note => note.id !== noteId);
            setDeletedNotes(updatedDeletedNotes);
            await saveDeletedNotes(updatedDeletedNotes);

            // Set flag for restored note
            await AsyncStorage.setItem('noteRestored', 'true');

            Alert.alert('Success', 'Note restored successfully');
            return;
          } else {
            console.warn('API restore failed:', response.status);
          }
        } catch (apiError) {
          console.error('API restore error:', apiError);
        }
      }

      // Fallback: restore locally even if API fails
      // Generate a new temporary ID for the restored note
      const tempId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const localRestoredNote = {
        ...cleanNote,
        id: cleanNote.id || tempId, // Keep original ID if exists, otherwise use temp
        tempRestore: true, // Flag to indicate this needs to be synced to server
      };

      // Add to notes list
      setNotesList(prev => [localRestoredNote, ...prev]);
      
      // Remove from deleted notes
      const updatedDeletedNotes = deletedNotes.filter(note => note.id !== noteId);
      setDeletedNotes(updatedDeletedNotes);
      await saveDeletedNotes(updatedDeletedNotes);

      // Set flag for restored note
      await AsyncStorage.setItem('noteRestored', 'true');

      Alert.alert('Restored Locally', 'Note restored locally. Will sync when connection is available.');
      
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert('Error', 'Failed to restore note');
    }
  };

  // Function to permanently delete a note from bin
  const permanentlyDeleteNote = async (noteId) => {
    Alert.alert(
      'Permanently Delete',
      'This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            const updatedDeletedNotes = deletedNotes.filter(note => note.id !== noteId);
            setDeletedNotes(updatedDeletedNotes);
            await saveDeletedNotes(updatedDeletedNotes);
            Alert.alert('Deleted', 'Note permanently deleted');
          },
        },
      ]
    );
  };

  const handleEditNote = (note) => {
    navigation.navigate('NoteDetail', {
      note: note,
      isNewNote: false,
      onSave: () => {
        // Re-fetch notes to ensure the list is up-to-date
        fetchNotes();
      }
    });
  };

  // updated formatDate with fallbacks: updatedAt -> createdAt -> now
  const formatDate = (dateStr, createdAtStr) => {
    let d = new Date(dateStr);
    if (isNaN(d.getTime()) && createdAtStr) {
      d = new Date(createdAtStr);
    }
    if (isNaN(d.getTime())) {
      d = new Date();
    }
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper: fetch full note from API by id (returns normalized note)
  const fetchFullNoteById = async (id) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return null;
      const res = await fetch(API_BASE_URL + `/notes/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        console.warn('Failed to fetch full note', res.status);
        return null;
      }
      const n = await res.json();
      const note = {
        id: n.id ?? n._id ?? null,
        title: n.title ?? '',
        textContents: n.textContents ?? n.text ?? '',
        checklistItems: Array.isArray(n.checklistItems) ? n.checklistItems : (Array.isArray(n.checklist) ? n.checklist : []),
        drawings: Array.isArray(n.drawings) ? n.drawings : [],
        createdAt: n.createdAt ?? n.created_at ?? null,
        updatedAt: n.updatedAt ?? n.updated_at ?? null,
        ...n
      };
      return note;
    } catch (err) {
      console.error('fetchFullNoteById error:', err);
      return null;
    }
  };

  // Read Aloud / TTS toggle function - now fetches full note if needed and tracks which note is being spoken
  const handleReadAloud = async (note) => {
    try {
      // If currently speaking this note, stop
      if (speakingNoteId === note.id) {
        Speech.stop();
        setSpeakingNoteId(null);
        return;
      }

      // Stop any existing speech before starting new
      Speech.stop();

      let fullNote = note;

      // If the list item doesn't include text/checklist/drawings, try to fetch full note from API
      const hasText = fullNote.textContents && String(fullNote.textContents).trim().length > 0;
      const hasTextAlt = fullNote.text && String(fullNote.text).trim().length > 0;
      const hasChecklist = Array.isArray(fullNote.checklistItems) && fullNote.checklistItems.length > 0;
      const hasDrawings = Array.isArray(fullNote.drawings) && fullNote.drawings.length > 0;

      if (!hasText && !hasTextAlt && !hasChecklist && !hasDrawings && fullNote.id) {
        const fetched = await fetchFullNoteById(fullNote.id);
        if (fetched) {
          fullNote = fetched;
          // also update the list entry so next time we don't need to fetch
          setNotesList(prev => prev.map(n => n.id === fullNote.id ? fullNote : n));
        } else {
          // fallback: try to find in AsyncStorage (if you store notes locally)
          try {
            const localRaw = await AsyncStorage.getItem('notes_local') || await AsyncStorage.getItem('NOTES');
            const parsed = localRaw ? JSON.parse(localRaw) : null;
            if (parsed) {
              const found = parsed.find(n => n.id === fullNote.id || n._id === fullNote.id);
              if (found) {
                fullNote = {
                  id: found.id ?? found._id ?? null,
                  title: found.title ?? '',
                  textContents: found.textContents ?? found.text ?? '',
                  checklistItems: Array.isArray(found.checklistItems) ? found.checklistItems : [],
                  drawings: Array.isArray(found.drawings) ? found.drawings : [],
                  createdAt: found.createdAt ?? found.created_at ?? null,
                  updatedAt: found.updatedAt ?? found.updated_at ?? null,
                  ...found
                };
                setNotesList(prev => prev.map(n => n.id === fullNote.id ? fullNote : n));
              }
            }
          } catch (err) {
            // ignore local fallback errors
          }
        }
      }

      // Build content to speak: title -> textContents/text -> checklist -> drawings -> last updated time
      const contentParts = [];

      if (fullNote.title && String(fullNote.title).trim()) {
        contentParts.push(fullNote.title.trim());
      }

      // Prefer textContents (your API), fallback to text
      const body = (fullNote.textContents && String(fullNote.textContents).trim()) ? fullNote.textContents.trim() :
        (fullNote.text && String(fullNote.text).trim()) ? fullNote.text.trim() : '';

      if (body) {
        contentParts.push(body);
      }

      if (fullNote.checklistItems && fullNote.checklistItems.length > 0) {
        const checklistStrings = fullNote.checklistItems.map((it, idx) => {
          const t = it && (it.text ?? it.title) ? (it.text ?? it.title) : '';
          const checked = it && (it.checked === true || it.isChecked === true);
          return `${idx + 1}. ${t}${checked ? ' (completed)' : ''}`;
        }).filter(Boolean);
        if (checklistStrings.length) {
          contentParts.push('Checklist: ' + checklistStrings.join('. '));
        }
      }

      if (fullNote.drawings && fullNote.drawings.length > 0) {
        contentParts.push(`This note contains ${fullNote.drawings.length} drawings.`);
      }

      // Optionally include the last-updated timestamp for clarity (we do not modify it)
      const updatedAt = fullNote.updatedAt || fullNote.createdAt || null;
      if (updatedAt) {
        try {
          const d = new Date(updatedAt);
          if (!isNaN(d.getTime())) {
            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            contentParts.push(`Last updated on ${dateStr} at ${timeStr}`);
          }
        } catch (err) {
          // ignore formatting errors
        }
      }

      const content = contentParts.join('. ').trim();

      // Debug log to verify what's being spoken
      console.log('TTS content for note id', fullNote.id, ':', content);

      if (content) {
        setSpeakingNoteId(fullNote.id);
        Speech.speak(content, {
          rate: 1.0,
          pitch: 1.0,
          onDone: () => setSpeakingNoteId(null),
          onStopped: () => setSpeakingNoteId(null),
          onError: (e) => {
            console.error('Speech error:', e);
            setSpeakingNoteId(null);
          },
        });
      } else {
        // Note appears empty
        setSpeakingNoteId(fullNote.id);
        Speech.speak('This note is empty.', {
          onDone: () => setSpeakingNoteId(null),
          onStopped: () => setSpeakingNoteId(null),
          onError: () => setSpeakingNoteId(null),
        });
      }
    } catch (err) {
      console.error('handleReadAloud error:', err);
      setSpeakingNoteId(null);
    }
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
    if (note.textContents && note.textContents.trim()) {
      return note.textContents;
    }
    if (note.text && note.text.trim()) {
      return note.text;
    }
    if (note.checklistItems && note.checklistItems.length > 0) {
      const firstItem = note.checklistItems[0];
      return `☑️ ${firstItem.text || firstItem.title || 'Checklist item'}`;
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
      ((note.textContents ?? note.text ?? '').toLowerCase().includes(searchLower)) ||
      (note.checklistItems && note.checklistItems.some(item =>
        (item.text ?? item.title ?? '').toLowerCase().includes(searchLower)
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
        keyExtractor={item => (item.id ? String(item.id) : Math.random().toString())}
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
                <Text style={[styles.noteDate, { color: colors.subText }]}>
                  {formatDate(item.updatedAt, item.createdAt)}
                </Text>
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

                {/* Read Aloud button (toggle) */}
                <Pressable
                  onPress={() => handleReadAloud(item)}
                  style={styles.actionButton}
                >
                  <Ionicons
                    name={speakingNoteId === item.id ? 'volume-mute' : 'volume-high'}
                    size={18}
                    color={colors.iconColor}
                  />
                </Pressable>
              </View>
            </View>

            <Text style={[styles.notePreview, { color: colors.text }]} numberOfLines={3}>
              {getPreviewText(item)}
            </Text>

            {/* Show content indicators */}
            <View style={styles.contentIndicators}>
              {(item.textContents ?? item.text ?? '').trim() ? (
                <View style={styles.indicator}>
                  <Ionicons name="document-text" size={12} color={colors.subText} />
                  <Text style={[styles.indicatorText, { color: colors.subText }]}>Text</Text>
                </View>
              ) : null}
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
                  navigation.navigate('DeletedNotes', { 
                    deletedNotes: deletedNotes,
                    onRestore: restoreNote,
                    onPermanentDelete: permanentlyDeleteNote,
                    onCleanupOld: cleanupOldDeletedNotes
                  });
                }}
                style={[styles.drawerMenuItem, { borderBottomColor: colors.borderColor }]}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons name="trash-outline" size={20} color={colors.iconColor} />
                </View>
                <Text style={[styles.drawerItemText, { color: colors.text }]}>Deleted Notes</Text>
                {deletedNotes.length > 0 && (
                  <View style={[styles.notificationBadge, { backgroundColor: colors.deleteIcon }]}>
                    <Text style={styles.badgeText}>{deletedNotes.length}</Text>
                  </View>
                )}
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
