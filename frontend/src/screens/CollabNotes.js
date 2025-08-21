import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Pressable,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../ThemeContext';
import { lightColors, darkColors } from '../utils/themeColors';
import styles from '../styleSheets/HomeScreenStyles';
import LoadingOverlay from '../components/LoadingOverlay';
import PendingInvitesModal from '../components/PendingInvitesModal';

import { fetchNotes as apiFetchNotes, fetchNoteById } from '../services/noteService';
import { fetchUserInfo } from '../services/userService';
import { normalizeNote } from '../utils/normalizeNote';
import { collaborationInviteService } from '../services/collaboratorService';

import { ReadAloudContext } from '../ReadAloudContext';

export default function CollabNotes({ navigation }) {
  const { activeTheme } = useContext(ThemeContext);
  const { speak, stop } = useContext(ReadAloudContext);

  const colors = activeTheme === 'dark' ? darkColors : lightColors;

  const [collaboratedNotes, setCollaboratedNotes] = useState([]);
  const [isFetchingNotes, setIsFetchingNotes] = useState(false);
  const [userId, setUserId] = useState(null);
  const [speakingNoteId, setSpeakingNoteId] = useState(null);

  // Pending invites states
  const [pendingInvites, setPendingInvites] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingInvites, setLoadingInvites] = useState(true);

  const slideUpAnim = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    fetchUserAndNotes();
    loadPendingInvites();

    return () => {
      try {
        stop();
        setSpeakingNoteId(null);
      } catch (e) {}
    };
  }, []);

  const fetchUserAndNotes = async () => {
    setIsFetchingNotes(true);
    try {
      const user = await fetchUserInfo();
      setUserId(user?.id || null);

      const notes = await apiFetchNotes();
      const normalized = Array.isArray(notes) ? notes.map(normalizeNote) : [];

      const collab = normalized.filter(n => n.creatorUserId !== user?.id && n.isPrivate === false);
      setCollaboratedNotes(collab);
    } catch (err) {
      console.error('Error fetching collaborated notes: ', err);
    } finally {
      setIsFetchingNotes(false);
    }
  };

  const loadPendingInvites = async () => {
    setLoadingInvites(true);
    try {
      const invites = await collaborationInviteService.getPendingInvites();
      setPendingInvites(invites);
      if (invites.length > 0) setModalVisible(true);
    } catch (err) {
      console.error('Error loading pending invites:', err);
    } finally {
      setLoadingInvites(false);
    }
  };

  const handleAccept = async (inviteId) => {
    try {
      await collaborationInviteService.respondToInvite(inviteId, true);
      await loadPendingInvites();
      await fetchUserAndNotes();
    } catch (err) {
      console.error('Failed to accept invite:', err);
    }
  };

  const handleDecline = async (inviteId) => {
    try {
      await collaborationInviteService.respondToInvite(inviteId, false);
      await loadPendingInvites();
    } catch (err) {
      console.error('Failed to decline invite:', err);
    }
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const parseChecklistItems = (checklistItems) => {
    if (!checklistItems) return [];
    if (Array.isArray(checklistItems)) return checklistItems;
    if (typeof checklistItems === 'string') {
      try {
        const parsed = JSON.parse(checklistItems);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const getPreviewText = (note) => {
    if (note.title && note.title.trim()) return note.title;
    if (note.textContents && note.textContents.trim()) return note.textContents;
    if (note.text && note.text.trim()) return note.text;

    const checklistItems = parseChecklistItems(note.checklistItems);
    if (checklistItems.length > 0) {
      const firstItem = checklistItems[0];
      return `☑️ ${firstItem.text || firstItem.title || 'Checklist item'}`;
    }
    if (note.drawings && (
      (Array.isArray(note.drawings) && note.drawings.length > 0) ||
      (typeof note.drawings === 'string' && note.drawings.trim() !== '' && note.drawings !== '[]')
    )) {
      return '🎨 Drawing';
    }
    return 'Empty note';
  };

  const handleEditNote = (note) => {
    navigation.navigate('NoteDetail', {
      note: note,
      isNewNote: false,
      onSave: () => {
        fetchUserAndNotes();
      }
    });
  };

  const handleSpeakToggle = async (note) => {
    if (speakingNoteId === note.id) {
      stop();
      setSpeakingNoteId(null);
    } else {
      const fullNote = await fetchFullNoteById(note.id);
      const text = fullNote?.textContents || fullNote?.title || '';
      speak(text, note.id);
      setSpeakingNoteId(note.id);
    }
  };

  const groupedNotes = collaboratedNotes.reduce((acc, note) => {
    const noteDate = new Date(note.updatedAt || note.createdAt);
    const month = noteDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!acc[month]) acc[month] = [];
    acc[month].push(note);
    return acc;
  }, {});
  const groupedNotesArray = Object.entries(groupedNotes);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={activeTheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.headerBackground}
      />

      {/* App Bar */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground }]}>
        <View style={styles.titleRow}>
          <Ionicons name="people-outline" size={28} color={colors.headerText} />
          <Text style={[styles.headerTitle, { color: colors.headerText }]}>Collaborated Notes</Text>
        </View>
      </View>

      {/* List of notes */}
      <FlatList
        data={groupedNotesArray}
        keyExtractor={([month]) => month}
        renderItem={({ item: [month, notes] }) => (
          <View key={month}>
            <Text style={[styles.monthHeader, { color: colors.subText }]}>{month}</Text>
            {notes.map((note) => {
              const checklistItems = parseChecklistItems(note.checklistItems);
              const hasText = !!(note.textContents ?? note.text ?? '').trim();
              const hasChecklist = checklistItems.length > 0;
              const hasDrawings =
                note.drawings &&
                ((Array.isArray(note.drawings) && note.drawings.length > 0) ||
                  (typeof note.drawings === 'string' && note.drawings.trim() !== '' && note.drawings !== '[]'));

              return (
                <TouchableOpacity
                  key={note.id}
                  onPress={() => handleEditNote(note)}
                  style={[styles.noteCard, { backgroundColor: colors.cardBackground }]}
                >
                  <View style={styles.noteHeader}>
                    <View style={styles.noteInfo}>
                      <Text style={[styles.noteDate, { color: colors.subText }]}>
                        {formatDate(note.updatedAt || note.createdAt)}
                      </Text>
                    </View>
                    <View style={styles.noteActions}>
                      <Pressable
                        onPress={() => handleEditNote(note)}
                        style={styles.actionButton}
                      >
                        <Ionicons name="create-outline" size={18} color={colors.iconColor} />
                      </Pressable>
                      <Pressable
                        onPress={() => handleSpeakToggle(note)}
                        style={styles.actionButton}
                      >
                        <Ionicons
                          name={speakingNoteId === note.id ? 'volume-mute-outline' : 'volume-high-outline'}
                          size={18}
                          color={colors.iconColor}
                        />
                      </Pressable>
                    </View>
                  </View>
                  <Text style={[styles.notePreview, { color: colors.text }]} numberOfLines={3}>
                    {getPreviewText(note)}
                  </Text>

                  {/* indicators at bottom */}
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
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.subText }]}>
            No collaborated notes available.
          </Text>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Collaboration Requests Button */}
      {/* Floating Collaboration Requests Button */}
<TouchableOpacity
  style={[
    floatingButtonStyles.floatingButton,
    { backgroundColor: colors.accentColor, overflow: 'visible' }, // important
  ]}
  onPress={() => setModalVisible(true)}
  activeOpacity={0.8}
>
  <Ionicons name="people" size={24} color="white" />

  {pendingInvites.length > 0 && (
    <View style={floatingButtonStyles.badge}>
      <Text style={floatingButtonStyles.badgeText}>
        {pendingInvites.length.toString()}
      </Text>
    </View>
  )}
</TouchableOpacity>


      {/* Loading Overlays */}
      <LoadingOverlay
        visible={isFetchingNotes}
        text="Fetching collaborated notes..."
        themedStyles={styles}
        styles={styles}
        theme={activeTheme === 'dark' ? darkColors : lightColors}
      />

      {/* Pending Invites Modal */}
      <PendingInvitesModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        invites={pendingInvites}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
    </SafeAreaView>
  );
}

const floatingButtonStyles = {
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { height: 4 },
    shadowRadius: 8,
    overflow: 'visible', // ensures badge shows outside
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 99,
  },
  badgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
    includeFontPadding: false, // fixes Android clipping
    textAlignVertical: 'center',
  },
};

