import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View, Text, FlatList, Pressable,
  SafeAreaView, Alert, StatusBar, TouchableOpacity, Animated, Dimensions, TouchableWithoutFeedback, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import styles from '../styleSheets/HomeScreenStyles';
import { handleReadAloud } from '../utils/noteSpeaker';
import LoadingOverlay from '../components/LoadingOverlay';
import { buildThemedStyles } from '../utils/buildThemedStyles';
import { noteDetailsthemes as themes } from '../utils/themeColors';

import { ThemeContext } from '../ThemeContext';
import { ReadAloudContext } from '../ReadAloudContext'; // Import the correct context

import { deleteNote, fetchNotes as apiFetchNotes, fetchNoteById, updateNoteIsPrivate } from '../services/noteService';
import { fetchUserInfo } from '../services/userService';

import { lightColors, darkColors } from '../utils/themeColors';
import { normalizeNote } from '../utils/normalizeNote';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function HomeScreen({ navigation }) {
  const { activeTheme } = useContext(ThemeContext);
  const { speak, stop } = useContext(ReadAloudContext); 
  const theme = themes[activeTheme] || themes.light;
  const themedStyles = buildThemedStyles(theme, styles);
  const colors = activeTheme === 'dark' ? darkColors : lightColors;

  const [notesList, setNotesList] = useState([]);
  const [deletedNotes, setDeletedNotes] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const [speakingNoteId, setSpeakingNoteId] = useState(null);
  const [isFetchingNotes, setIsFetchingNotes] = useState(false);
  const [isMovingToBin, setIsMovingToBin] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });

  // Add state for sorting
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'

  useEffect(() => {
    return () => {
      try {
        stop();
        setSpeakingNoteId(null);
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

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchNotes = async () => {
    setIsFetchingNotes(true);
    try {
      const notes = await apiFetchNotes();
      const normalized = Array.isArray(notes) ? notes.map(normalizeNote) : [];
      const activeNotes = normalized.filter(note => note.isPrivate === false);
      const binNotes = normalized.filter(note => note.isPrivate === true).map(note => ({
        ...note,
        deletedAt: note.deletedAt || new Date().toISOString()
      }));
      setNotesList(activeNotes);
      setDeletedNotes(binNotes);
      await saveDeletedNotes(binNotes);
    } catch (error) {
      console.error('Fetch Notes error: ', error);
    } finally {
      setIsFetchingNotes(false);
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

  const handleDeleteNote = async (noteId) => {
    if (!noteId) {
      console.error("Note does not have a valid id or _id:", noteId);
      return;
    }
    setIsMovingToBin(true);
    try {
      await updateNoteIsPrivate(noteId, true);
      let noteToDelete = notesList.find(n => (n.id ?? n._id) === noteId);
      if (!noteToDelete) noteToDelete = {};
      setNotesList(prevNotes => prevNotes.filter(n => (n.id ?? n._id) !== noteId));
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
    } catch (error) {
      console.error("Error moving note to bin:", error);
    } finally {
      setIsMovingToBin(false);
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

  // Helper function to parse checklist items consistently
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
    
    const checklistItems = parseChecklistItems(note.checklistItems);
    if (checklistItems.length > 0) {
      const firstItem = checklistItems[0];
      return `☑️ ${firstItem.text || firstItem.title || 'Checklist item'}`;
    }
    
    // Check if drawing tool was used and saved in note
    if (note.drawings && (
      (Array.isArray(note.drawings) && note.drawings.length > 0) ||
      (typeof note.drawings === 'string' && note.drawings.trim() !== '' && note.drawings !== '[]')
    )) {
      return '🎨 Drawing';
    }
    return 'Empty note';
  };

  // Sort notes based on the sortOrder state
  const sortedNotes = [...notesList].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt);
    const dateB = new Date(b.updatedAt || b.createdAt);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
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

  // Group notes by month
  const groupedNotes = filteredNotes.reduce((acc, note) => {
    const noteDate = new Date(note.updatedAt || note.createdAt);
    const month = noteDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(note);
    return acc;
  }, {});

  const months = Object.keys(groupedNotes);
  const sortedMonths = months.sort((a, b) => {
    const dateA = new Date(a.replace(/(\w+) (\d+)/, '$1 1, $2'));
    const dateB = new Date(b.replace(/(\w+) (\d+)/, '$1 1, $2'));
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.headerText === '#fff' ? 'light-content' : 'dark-content'} backgroundColor={colors.headerBackground} />
      
      {/* Header with Sort Button */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground }]}>
        <View style={styles.titleRow}>
          <Ionicons name="book" size={28} color={colors.headerText} />
          <Text style={[styles.headerTitle, { color: colors.headerText }]}>My Notes</Text>
        </View>
        <View style={styles.headerRightButtons}>
          <TouchableOpacity onPress={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}>
            <Ionicons
              name={sortOrder === 'newest' ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline'}
              size={26}
              color={colors.headerText}
              style={{ marginRight: 10 }}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={openDrawer}>
            <Ionicons name="menu" size={26} color={colors.headerText} />
          </TouchableOpacity>
        </View>
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
      
      {/* Notes List grouped by month */}
      <FlatList
        data={sortedMonths}
        keyExtractor={item => item}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
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
        renderItem={({ item: month }) => (
          <View key={month}>
            <Text style={[styles.monthHeader, { color: colors.subText }]}>{month}</Text>
            {groupedNotes[month].map((note, index) => {
              const checklistItems = parseChecklistItems(note.checklistItems);
              const hasText = !!(note.textContents ?? note.text ?? '').trim();
              const hasChecklist = checklistItems.length > 0;
              const hasDrawings = !!(note.drawings && (
                (Array.isArray(note.drawings) && note.drawings.length > 0) ||
                (typeof note.drawings === 'string' && note.drawings.trim() !== '' && note.drawings !== '[]')
              ));

              return (
                <TouchableOpacity
                  key={note.id}
                  onPress={() => handleEditNote(note)}
                  style={[styles.noteCard, { backgroundColor: colors.cardBackground }]}
                >
                  <View style={styles.noteHeader}>
                    <View style={styles.noteInfo}>
                      <Text style={[styles.noteDate, { color: colors.subText }]}>
                        {formatDate(note.updatedAt, note.createdAt)}
                      </Text>
                    </View>
                    <View style={styles.noteActions}>
                      <Pressable
                        onPress={() => handleEditNote(note)}
                        style={styles.actionButton}
                      >
                        <Ionicons name="create" size={18} color={colors.iconColor} />
                      </Pressable>
                      <Pressable
                        onPress={() => handleDeleteNote(note.id)}
                        style={styles.actionButton}
                      >
                        <Ionicons name="trash" size={18} color={colors.deleteIcon} />
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          handleReadAloud({
                            note: note,
                            speakingNoteId,
                            setSpeakingNoteId,
                            fetchFullNoteById,
                            setNotesList,
                            speak,
                            stop
                          });
                        }}
                        style={styles.actionButton}
                      >
                        <Ionicons
                          name={speakingNoteId === note.id ? 'volume-mute' : 'volume-high'}
                          size={18}
                          color={colors.iconColor}
                        />
                      </Pressable>
                    </View>
                  </View>
                  <Text style={[styles.notePreview, { color: colors.text }]} numberOfLines={3}>
                    {getPreviewText(note)}
                  </Text>
                  <View style={[styles.contentIndicators, { borderTopColor: colors.borderColor }]}>
                    {hasText && (
                      <View style={styles.indicator}>
                        <Ionicons name="document-text" size={12} color={colors.subText} />
                        <Text style={[styles.indicatorText, { color: colors.subText }]}>Text</Text>
                      </View>
                    )}
                    {hasChecklist && (
                      <View style={styles.indicator}>
                        <Ionicons name="checkmark-circle" size={12} color={colors.subText} />
                        <Text style={[styles.indicatorText, { color: colors.subText }]}>
                          {checklistItems.length} items
                        </Text>
                      </View>
                    )}
                    {hasDrawings && (
                      <View style={styles.indicator}>
                        <Ionicons name="brush" size={12} color={colors.subText} />
                        <Text style={[styles.indicatorText, { color: colors.subText }]}>Drawing</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      />
      
      {/* Floating Add Note Button */}
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
      
      {/* Loading Overlays */}
      <LoadingOverlay
        visible={isFetchingNotes}
        text="Fetching notes..."
        themedStyles={themedStyles}
        styles={styles}
        theme={theme}
      />
      <LoadingOverlay
        visible={isMovingToBin}
        text="Moving note to bin..."
        themedStyles={themedStyles}
        styles={styles}
        theme={theme}
      />
    </SafeAreaView>
  );
}