import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View, Text, FlatList, Pressable,
  SafeAreaView, StatusBar, TouchableOpacity, Animated, Dimensions, TouchableWithoutFeedback, TextInput, StyleSheet, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import styles from '../styleSheets/HomeScreenStyles';
import LoadingOverlay from '../components/LoadingOverlay';
import { buildThemedStyles } from '../utils/buildThemedStyles';
import { noteDetailsthemes as themes } from '../utils/themeColors';
import { ThemeContext } from '../ThemeContext';
import { ReadAloudContext } from '../ReadAloudContext';
import { fetchNotes as apiFetchNotes, fetchNoteById, updateNoteIsPrivate } from '../services/noteService';
import { fetchUserInfo } from '../services/userService';
import { lightColors, darkColors } from '../utils/themeColors';
import { normalizeNote } from '../utils/normalizeNote';
import LoginSuccessOverlay from '../utils/LoginSuccessOverlay';
import reminderService from '../services/reminderService';

import { collaboratorService } from '../services/collaboratorService';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function HomeScreen({ navigation }) {
  const { activeTheme } = useContext(ThemeContext);
  const { speak, stop } = useContext(ReadAloudContext);
  const theme = themes[activeTheme] || themes.light;
  const themedStyles = buildThemedStyles(theme, styles);
  const colors = activeTheme === 'dark' ? darkColors : lightColors;

  const route = useRoute();
  const [collaboratedNotes, setCollaboratedNotes] = useState([]);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const [notesList, setNotesList] = useState([]);
  const [deletedNotes, setDeletedNotes] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const [speakingNoteId, setSpeakingNoteId] = useState(null);
  const [isFetchingNotes, setIsFetchingNotes] = useState(false);
  const [isMovingToBin, setIsMovingToBin] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });
  const [sortOption, setSortOption] = useState('updatedAt');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const slideUpAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [isGridView, setIsGridView] = useState(false);

  // NEW: Multi-select state
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState([]);
  
  const [pendingDeletedNote, setPendingDeletedNote] = useState(null);
  const [undoBarVisible, setUndoBarVisible] = useState(false);
  const undoTimeout = useRef(null);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  useEffect(() => {
    if (route.params?.showLoginSuccess) {
      setShowSuccessOverlay(true);
      navigation.setParams({ showLoginSuccess: undefined });
    }
  }, [route.params?.showLoginSuccess]);

  useEffect(() => {
    return () => {
      try {
        stop();
        setSpeakingNoteId(null);
        if (undoTimeout.current) {
          clearTimeout(undoTimeout.current);
        }
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const saveDeletedNotes = async (notes) => {
    try {
      await AsyncStorage.setItem('deletedNotes', JSON.stringify(notes));
    } catch (error) {
      console.error('Error saving deleted notes:', error);
    }
  };

  // Fetch user info every time the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const fetchUserInfo1 = async () => {
        try {
          const user = await fetchUserInfo();
          if (user) {
            setUserInfo({
              name: user.username || 'Guest',
              email: user.email || 'email@example.com',
            });
            // Save user info to AsyncStorage as 'username' and 'useremail'
            if (user.username) {
              await AsyncStorage.setItem('username', user.username);
            }
            if (user.email) {
              await AsyncStorage.setItem('useremail', user.email);
            }
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      };
      fetchUserInfo1();
    }, [])
  );

  const fetchNotes = async () => {
    setIsFetchingNotes(true);
    try {
      const userIdStr = await AsyncStorage.getItem('userId');
      if (userIdStr) {
        const userId = parseInt(userIdStr, 10);
        const notes = await apiFetchNotes();
        const normalized = Array.isArray(notes) ? notes.map(normalizeNote) : [];
        const activeNotes = normalized.filter(note => note.isPrivate === false && note.creatorUserId === userId);
        const binNotes = normalized.filter(note => note.isPrivate === true).map(note => ({
          ...note,
          deletedAt: note.deletedAt || new Date().toISOString()
        }));

                // To check if this works, you can temporarily log the results:
                const notesWithCollabStatus = await Promise.all(
                  activeNotes.map(async (note) => {
                    try {
                      // Use checkCollaboratorCount to determine if there are multiple collaborators
                      const hasMultipleCollaborators = await collaboratorService.checkCollaboratorCount(note.id);
                      // Log for debugging
                      console.log(`Note ${note.id} hasMultipleCollaborators:`, hasMultipleCollaborators);
                      return { ...note, hasMultipleCollaborators };
                    } catch (error) {
                      console.error(`Error checking collaborator count for note ${note.id}:`, error);
                      return { ...note, hasMultipleCollaborators: false };
                    }
                  })
                  
                );

        
        const notesWithReminders = await Promise.all(
          activeNotes.map(async (note) => {
            try {
              const reminders = await reminderService.getRemindersForNote(note.id);
              const hasReminder = reminders.some(r => r.status === 'active' || r.status === 'pending');
              return { ...note, hasReminder };
            } catch (error) {
              console.error(`Error fetching reminders forf  note ${note.id}:`, error);
              return { ...note, hasReminder: false };
            }
          })
        );

        setNotesList(notesWithReminders);
        setNotesList(notesWithCollabStatus);
        setDeletedNotes(binNotes);
        await saveDeletedNotes(binNotes);
      }
    } catch (error) {
      console.error('Fetch Notes error: ', error);
    } finally {
      setIsFetchingNotes(false);
      setHasFetchedOnce(true);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchNotes();
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
    navigation.navigate('NoteDetail', {
      note: newNote,
      isNewNote: true,
      onSave: () => {
        fetchNotes();
      }
    });
  };

  const confirmDeletion = async (noteId) => {
    if (!noteId) return;
    setIsMovingToBin(true);
    try {
      await updateNoteIsPrivate(noteId, true);
      const noteToDelete = notesList.find(n => (n.id ?? n._id) === noteId) || {};
      const deletedNote = {
        ...noteToDelete,
        deletedAt: new Date().toISOString(),
        isPrivate: true
      };
      setDeletedNotes(prevDeleted => {
        const newDeleted = [...prevDeleted, deletedNote];
        saveDeletedNotes(newDeleted);
        return newDeleted;
      });
      setPendingDeletedNote(null);
    } catch (error) {
      console.error("Error moving note to bin:", error);
    } finally {
      setIsMovingToBin(false);
    }
  };

  const handleDeleteNote = (noteId) => {
    if (!noteId) {
      console.error("Note does not have a valid id or _id:", noteId);
      return;
    }
    const noteToHide = notesList.find(n => (n.id ?? n._id) === noteId);
    if (!noteToHide) return;
    setNotesList(prevNotes => prevNotes.filter(n => (n.id ?? n._id) !== noteId));
    setPendingDeletedNote(noteToHide);
    setUndoBarVisible(true);

    if (undoTimeout.current) {
      clearTimeout(undoTimeout.current);
    }
    undoTimeout.current = setTimeout(() => {
      setUndoBarVisible(false);
      confirmDeletion(noteId);
    }, 5000);
  };

  const handleUndoDeletion = () => {
    if (undoTimeout.current) {
      clearTimeout(undoTimeout.current);
    }
    setUndoBarVisible(false);
    if (pendingDeletedNote) {
      setNotesList(prevNotes => [pendingDeletedNote, ...prevNotes]);
      setPendingDeletedNote(null);
    }
  };

  const handleEditNote = (note) => {
    navigation.navigate('NoteDetail', {
      note: note,
      isNewNote: false,
      onSave: () => {
        fetchNotes();
      }
    });
  };

  const formatDate = (dateStr) => {
    if (dateStr && dateStr.length > 0) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    }
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const fetchFullNoteById = async (id) => {
    try {
      const note = await fetchNoteById(id);
      return note ? normalizeNote(note) : null;
    } catch (err) {
      console.error('fetchFullNoteById error:', err);
      return null;
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

  const openSortMenu = () => {
    setSortMenuVisible(true);
    Animated.timing(slideUpAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeSortMenu = () => {
    Animated.timing(slideUpAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setSortMenuVisible(false));
  };

  const parseChecklistItems = (checklistItems) => {
    if (!checklistItems) return [];
    if (Array.isArray(checklistItems)) return checklistItems;
    if (typeof checklistItems === 'string') {
      try {
        const parsed = JSON.parse(checklistItems);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const getTextToSpeak = (note) => {
    let textToRead = '';
    if (note.title && note.title.trim()) {
      textToRead += `Title: ${note.title}., `;
    }
    if (note.textContents && note.textContents.trim()) {
      textToRead += `Note content: ${note.textContents}. `;
    }
    const checklistItems = parseChecklistItems(note.checklistItems);
    if (checklistItems.length > 0) {
      textToRead += 'Checklist items: ';
      checklistItems.forEach((item, index) => {
        textToRead += `${item.checked ? 'Completed' : 'Not completed'}: ${item.text || item.title}. `;
      });
    }
    if (note.drawings && (
      (Array.isArray(note.drawings) && note.drawings.length > 0) ||
      (typeof note.drawings === 'string' && note.drawings.trim() !== '' && note.drawings !== '[]')
    )) {
      textToRead += 'This note also contains a drawing.';
    }
    console.log(textToRead);
    return textToRead.trim();
  };

  const handleSpeakToggle = async (note) => {
    if (speakingNoteId === note.id) {
      stop();
      setSpeakingNoteId(null);
    } else {
      const fullNote = await fetchFullNoteById(note.id);
      if (fullNote) {
        const text = getTextToSpeak(fullNote);
        speak(text, note.id);
        setSpeakingNoteId(note.id);
      }
    }
  };

  const handleSortSelection = (option) => {
    setSortOption(option);
    closeSortMenu();
  };

  const sortedNotes = [...notesList].sort((a, b) => {
    const dateA = new Date(a[sortOption]);
    const dateB = new Date(b[sortOption]);
    return dateB - dateA;
  });

  const filteredNotes = sortedNotes.filter(note => {
    const searchLower = searchQuery.toLowerCase();
    const checklistItems = parseChecklistItems(note.checklistItems);
    return (
      (note.title && note.title.toLowerCase().includes(searchLower)) ||
      ((note.textContents ?? note.text ?? '').toLowerCase().includes(searchLower)) ||
      (checklistItems && checklistItems.some(item =>
        (item.text ?? item.title ?? '').toLowerCase().includes(searchLower)
      ))
    );
  });

  const groupedNotes = filteredNotes.reduce((acc, note) => {
    const noteDate = new Date(note.updatedAt || note.createdAt);
    const month = noteDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(note);
    return acc;
  }, {});

  const groupedNotesArray = Object.entries(groupedNotes);

  const toggleViewMode = () => {
    setIsGridView(prev => !prev);
  };
  
  // NEW function to toggle multi-select mode
  const toggleMultiSelectMode = (noteId) => {
    setIsMultiSelectMode(true);
    setSelectedNotes([noteId]);
  };

  // NEW function to handle selecting/deselecting a note
  const toggleSelectNote = (noteId) => {
    setSelectedNotes(prevSelected => {
      if (prevSelected.includes(noteId)) {
        const newSelection = prevSelected.filter(id => id !== noteId);
        if (newSelection.length === 0) {
          setIsMultiSelectMode(false);
        }
        return newSelection;
      } else {
        return [...prevSelected, noteId];
      }
    });
  };
  
  // NEW function to handle bulk deletion
  const handleDeleteSelected = async () => {
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete ${selectedNotes.length} note(s)?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsMovingToBin(true);
            try {
              await Promise.all(selectedNotes.map(noteId => updateNoteIsPrivate(noteId, true)));
              setNotesList(prevNotes => prevNotes.filter(n => !selectedNotes.includes(n.id)));
              const deleted = notesList.filter(n => selectedNotes.includes(n.id)).map(n => ({
                ...n,
                deletedAt: new Date().toISOString(),
                isPrivate: true
              }));
              setDeletedNotes(prevDeleted => {
                const newDeleted = [...prevDeleted, ...deleted];
                saveDeletedNotes(newDeleted);
                return newDeleted;
              });

            } catch (error) {
              console.error("Error moving notes to bin:", error);
            } finally {
              setIsMovingToBin(false);
              setIsMultiSelectMode(false);
              setSelectedNotes([]);
            }
          },
        },
      ]
    );
  };

  const gridItemStyles = {
    noteCard: {
      width: '47%',
      margin: 8,
    },
    notePreview: {
      fontSize: 12,
    },
    noteHeader: {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    noteActions: {
      position: 'absolute',
      top: 10,
      right: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },
    noteDate: {
      fontSize: 10,
    },
    indicatorText: {
      fontSize: 10,
    },
    monthHeader: {
      marginTop: 20,
      marginBottom: 10,
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.headerText === '#fff' ? 'light-content' : 'dark-content'} backgroundColor={colors.headerBackground} />

      <View style={[styles.header, { backgroundColor: colors.headerBackground }]}>
        <View style={styles.titleRow}>
          {isMultiSelectMode ? (
            <TouchableOpacity onPress={() => { setIsMultiSelectMode(false); setSelectedNotes([]); }}>
              <Ionicons name="close-outline" size={28} color={colors.headerText} />
            </TouchableOpacity>
          ) : (
            <Ionicons name="book" size={28} color={colors.headerText} />
          )}
          <Text style={[styles.headerTitle, { color: colors.headerText }]}>
            {isMultiSelectMode ? `${selectedNotes.length} selected` : 'My Notes'}
          </Text>
        </View>
        <View style={styles.headerRightButtons}>
          {isMultiSelectMode ? (
            <TouchableOpacity onPress={handleDeleteSelected}>
              <Ionicons name="trash-bin-outline" size={26} color={colors.deleteIcon} />
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity onPress={toggleViewMode}>
                <Ionicons
                  name={isGridView ? 'list-outline' : 'grid-outline'}
                  size={26}
                  color={colors.headerText}
                  style={{ marginRight: 10 }}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={openSortMenu}>
                <Ionicons
                  name={'swap-vertical-outline'}
                  size={26}
                  color={colors.headerText}
                  style={{ marginRight: 10 }}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={openDrawer}>
                <Ionicons name="menu" size={26} color={colors.headerText} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {!isMultiSelectMode && (
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
      )}

      <FlatList
        data={groupedNotesArray}
        keyExtractor={([month]) => month}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          isGridView && { paddingHorizontal: 4 }
        ]}
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
        renderItem={({ item: [month, notes] }) => (
          
          <View key={month} style={{ width: '100%' }}>
            <Text style={[styles.monthHeader, { color: colors.subText }, isGridView && gridItemStyles.monthHeader]}>{month}</Text>
            
            <FlatList
                data={notes}
                keyExtractor={item => item.id}
                numColumns={isGridView ? 2 : 1}
                scrollEnabled={false}
                key={isGridView ? 'grid' : 'list'}
                columnWrapperStyle={isGridView ? { justifyContent: 'space-between', paddingHorizontal: 8 } : null}
                renderItem={({ item: note }) => {
                  const checklistItems = parseChecklistItems(note.checklistItems);
                  const hasText = !!(note.textContents ?? note.text ?? '').trim();
                  const hasChecklist = checklistItems.length > 0;
                  const hasDrawings = !!(note.drawings && (
                    (Array.isArray(note.drawings) && note.drawings.length > 0) ||
                    (typeof note.drawings === 'string' && note.drawings.trim() !== '' && note.drawings !== '[]')
                  ));
                 
                  
                  const isSelected = selectedNotes.includes(note.id);
                  
                  return (
                    <Pressable
                      key={note.id}
                      onPress={() => {
                        if (isMultiSelectMode) {
                          toggleSelectNote(note.id);
                        } else {
                          handleEditNote(note);
                        }
                      }}
                      onLongPress={() => toggleMultiSelectMode(note.id)}
                      style={[
                        styles.noteCard, 
                        { backgroundColor: colors.cardBackground },
                        isGridView && { 
                          flex: 1, 
                          marginHorizontal: 4, 
                          marginBottom: 8, 
                          minHeight: 0,
                          height: 'auto',
                          borderRadius: 12,
                          padding: 12,
                        },
                        isSelected && { borderWidth: 2, borderColor: colors.accentColor }
                      ]}
                    >
                      {isMultiSelectMode && (
                        <View style={localStyles.selectIndicator}>
                          <Ionicons
                            name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={isSelected ? colors.accentColor : colors.subText}
                          />
                        </View>
                      )}
                      <View style={[styles.noteHeader, isGridView && { 
                        flexDirection: 'row', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: 8,
                      }]}>
                        <View style={styles.noteInfo}>
                          <Text style={[styles.noteDate, { color: colors.subText }, isGridView && { fontSize: 10, marginBottom: 0 }]}>
                            {formatDate(note[sortOption] || note.createdAt || note.lastAccessed)}
                          </Text>
                        </View>
                        {!isMultiSelectMode && (
                          <View style={[styles.noteActions, isGridView && { 
                            position: 'relative', 
                            top: 0, 
                            right: 0, 
                            marginTop: 0, 
                            gap: 8,
                          }]}>
                            {note.hasReminder && (
                              <Pressable style={styles.actionButton}>
                                <Ionicons name="alarm-outline" size={18} color={'#008000'} />
                              </Pressable>
                            )}

                            {note.hasMultipleCollaborators && (
                                <Pressable style={styles.actionButton}>
                                  <Ionicons name="people" size={18} color="#90ee90" />
                                </Pressable>
                            )}
                           
                            <Pressable
                              onPress={() => handleDeleteNote(note.id)}
                              style={styles.actionButton}
                            >
                              <Ionicons name="trash" size={18} color={colors.deleteIcon} />
                            </Pressable>
                            <Pressable
                              onPress={() => handleSpeakToggle(note)}
                              style={styles.actionButton}
                            >
                              <Ionicons
                                name={speakingNoteId === note.id ? 'volume-mute' : 'volume-high'}
                                size={18}
                                color={colors.iconColor}
                              />
                            </Pressable>
                           
                          </View>
                        )}
                      </View>
                      
                      {note.title && note.title.trim() && (
                          <Text style={[styles.notePreview, { color: colors.text, fontWeight: 'bold' }, isGridView && { fontSize: 14 }]} numberOfLines={2}>
                              {note.title}
                          </Text>
                      )}
                      {(note.textContents && note.textContents.trim()) && (
                          <Text style={[styles.notePreview, { color: colors.text, marginTop: 4 }, isGridView && { fontSize: 12 }]} numberOfLines={3}>
                              {note.textContents}
                          </Text>
                      )}

                      <View style={[styles.contentIndicators, { borderTopColor: colors.borderColor, marginTop: 8 }]}>
                        {hasText && (
                          <View style={styles.indicator}>
                            <Ionicons name="document-text" size={12} color={colors.subText} />
                            <Text style={[styles.indicatorText, { color: colors.subText }, isGridView && { fontSize: 10 }]}>Text</Text>
                          </View>
                        )}
                        {hasChecklist && (
                          <View style={styles.indicator}>
                            <Ionicons name="checkmark-circle" size={12} color={colors.subText} />
                            <Text style={[styles.indicatorText, { color: colors.subText }, isGridView && { fontSize: 10 }]}>
                              {checklistItems.length} items
                            </Text>
                          </View>
                        )}
                        {hasDrawings && (
                          <View style={styles.indicator}>
                            <Ionicons name="brush" size={12} color={colors.subText} />
                            <Text style={[styles.indicatorText, { color: colors.subText }, isGridView && { fontSize: 10 }]}>Drawing</Text>
                          </View>
                        )}
                      </View>
                    </Pressable>
                  );
                }}
            />
          </View>
        )}
      />

      <TouchableOpacity style={[styles.fabButton, { backgroundColor: colors.headerBackground }]} onPress={handleAddNote}>
        <Ionicons name="add" size={28} color={colors.headerText} />
      </TouchableOpacity>

      {sortMenuVisible && (
        <TouchableWithoutFeedback onPress={closeSortMenu}>
          <View style={localStyles.fullScreenOverlay}>
            <Animated.View style={[localStyles.bottomSheet, { backgroundColor: colors.cardBackground, transform: [{ translateY: slideUpAnim }] }]}>
              <View style={[localStyles.bottomSheetHandle, { backgroundColor: colors.subText }]} />
              <Text style={[localStyles.bottomSheetTitle, { color: colors.text }]}>Sort Notes By</Text>

              <TouchableOpacity
                style={localStyles.sortItem}
                onPress={() => handleSortSelection('updatedAt')}
              >
                <Text style={[localStyles.sortText, { color: colors.text }]}>Oldest to Newest</Text>
                {sortOption === 'updatedAt' && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.accentColor} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={localStyles.sortItem}
                onPress={() => handleSortSelection('createdAt')}
              >
                <Text style={[localStyles.sortText, { color: colors.text }]}>Newest to Oldest</Text>
                {sortOption === 'createdAt' && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.accentColor} />
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      )}

      {undoBarVisible && (
        <View style={[localStyles.undoBar, { backgroundColor: colors.searchBackground }]}>
          <Text style={[localStyles.undoText, { color: colors.text }]}>Note moved to bin</Text>
          <TouchableOpacity onPress={handleUndoDeletion}>
            <Text style={[localStyles.undoButton, { color: colors.accentColor }]}>UNDO</Text>
          </TouchableOpacity>
        </View>
      )}

      {drawerVisible && (
        <>
          <TouchableWithoutFeedback onPress={closeDrawer}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>
          <Animated.View style={[styles.drawer, { left: slideAnim, backgroundColor: colors.drawerBackground }]}>
            <View style={[styles.drawerHeader, { backgroundColor: colors.drawerHeaderBackground, borderBottomColor: colors.borderColor }]}>
              <View style={styles.drawerTitleSection}>
                <Ionicons name="book" size={24} color={colors.iconColor} />
                <Text style={[styles.drawerTitle, { color: colors.text }]}>Notes</Text>
              </View>
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
              <TouchableOpacity onPress={closeDrawer} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.subText} />
              </TouchableOpacity>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.borderColor }]} />
            <View style={styles.drawerContent}>
              <TouchableOpacity
                onPress={() => {
                  closeDrawer();
                  navigation.navigate('DeletedNotes', {
                    deletedNotes: deletedNotes,
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
                    navigation.navigate('CollabNotes',{collaboratedNotes: collaboratedNotes});
                  }}
                  style={[styles.drawerMenuItem, { borderBottomColor: colors.borderColor }]}
                >
                  <View style={styles.menuIconContainer}>
                    <Ionicons name="people-outline" size={20} color={colors.iconColor} />
                  </View>
                  <Text style={[styles.drawerItemText, { color: colors.text }]}>My Collabs</Text>
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
              <View style={styles.menuSpacer} />
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

      {isFetchingNotes && !hasFetchedOnce && (
        <LoadingOverlay
          visible={true}
          text="Fetching notes..."
          themedStyles={themedStyles}
          styles={styles}
          theme={theme}
        />
      )}

      
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  fullScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    zIndex: 99,
  },
  bottomSheet: {
    width: '100%',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  bottomSheetHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    marginBottom: 16,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
    width: '100%',
    textAlign: 'left',
  },
  sortItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 10,
  },
  sortText: {
    fontSize: 16,
  },
  undoBar: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
    elevation: 5,
    zIndex: 100,
  },
  undoText: {
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  undoButton: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4, 4, 4, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  popup: {
    width: 250,
    borderRadius: 10,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  popupText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  popupOkButton: {
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  popupOkButtonText: {
    fontWeight: 'bold',
  },
  selectIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 1,
  },
});