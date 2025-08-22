import React, { useState, useEffect, useContext, useRef } from 'react';
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
      await collaborationInviteService.respondtoInvite(inviteId, false);
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
  
  // New helper function to combine all readable content
  const getTextToSpeak = (note) => {
    let textToRead = '';
    
    if (note.title && note.title.trim()) {
      textToRead += `Title: ${note.title}. `;
    }
    
    if (note.textContents && note.textContents.trim()) {
      textToRead += `Note content: ${note.textContents}. `;
    }
    
    const checklistItems = parseChecklistItems(note.checklistItems);
    if (checklistItems.length > 0) {
      textToRead += 'Checklist items: ';
      checklistItems.forEach((item, index) => {
        textToRead += `${item.isCompleted ? 'Completed' : 'Not completed'}: ${item.text || item.title}. `;
      });
    }
    
    if (note.drawings && (
      (Array.isArray(note.drawings) && note.drawings.length > 0) ||
      (typeof note.drawings === 'string' && note.drawings.trim() !== '' && note.drawings !== '[]')
    )) {
      textToRead += 'This note also contains a drawing.';
    }
    
    return textToRead.trim();
  };

  const handleSpeakToggle = async (note) => {
    if (speakingNoteId === note.id) {
      stop();
      setSpeakingNoteId(null);
    } else {
      const fullNote = await fetchFullNoteById(note.id);
      const text = getTextToSpeak(fullNote);
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

  const renderNoteCard = (note) => {
    const checklistItems = parseChecklistItems(note.checklistItems);
    const hasText = !!(note.textContents ?? note.text ?? '').trim();
    const hasChecklist = checklistItems.length > 0;
    const hasDrawings = note.drawings && (
      (Array.isArray(note.drawings) && note.drawings.length > 0) ||
      (typeof note.drawings === 'string' && note.drawings.trim() !== '' && note.drawings !== '[]')
    );

    return (
      <TouchableOpacity
        key={note.id}
        onPress={() => handleEditNote(note)}
        style={[collabNotesStyles.noteCard, { 
          backgroundColor: colors.cardBackground,
          shadowColor: activeTheme === 'dark' ? '#000' : '#000',
        }]}
        activeOpacity={0.7}
      >
        {/* Note Header */}
        <View style={collabNotesStyles.noteHeader}>
          <View style={collabNotesStyles.noteMetadata}>
            <View style={[collabNotesStyles.collaborationBadge, { backgroundColor: colors.accentColor + '20' }]}>
              <Ionicons name="people" size={12} color={colors.accentColor} />
              <Text style={[collabNotesStyles.badgeText, { color: colors.accentColor }]}>
                Shared
              </Text>
            </View>
            <Text style={[collabNotesStyles.noteDate, { color: colors.subText }]}>
              {formatDate(note.updatedAt || note.createdAt)}
            </Text>
          </View>
          <View style={collabNotesStyles.noteActions}>
            <Pressable
              onPress={() => handleSpeakToggle(note)}
              style={[collabNotesStyles.actionButton, { backgroundColor: colors.background }]}
            >
              <Ionicons
                name={speakingNoteId === note.id ? 'volume-mute' : 'volume-high'}
                size={16}
                color={speakingNoteId === note.id ? colors.accentColor : colors.iconColor}
              />
            </Pressable>
          </View>
        </View>

        {/* Note Content Preview */}
        <Text style={[collabNotesStyles.noteTitle, { color: colors.text }]} numberOfLines={2}>
          {getPreviewText(note)}
        </Text>

        {/* Content Indicators */}
        <View style={collabNotesStyles.contentIndicators}>
          {hasText && (
            <View style={[collabNotesStyles.indicator, { backgroundColor: colors.background }]}>
              <Ionicons name="document-text" size={14} color={colors.accentColor} />
              <Text style={[collabNotesStyles.indicatorText, { color: colors.subText }]}>Text</Text>
            </View>
          )}
          {hasChecklist && (
            <View style={[collabNotesStyles.indicator, { backgroundColor: colors.background }]}>
              <Ionicons name="checkmark-circle" size={14} color={colors.accentColor} />
              <Text style={[collabNotesStyles.indicatorText, { color: colors.subText }]}>
                {checklistItems.length} items
              </Text>
            </View>
          )}
          {hasDrawings && (
            <View style={[collabNotesStyles.indicator, { backgroundColor: colors.background }]}>
              <Ionicons name="brush" size={14} color={colors.accentColor} />
              <Text style={[collabNotesStyles.indicatorText, { color: colors.subText }]}>Drawing</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={collabNotesStyles.emptyState}>
      <View style={[collabNotesStyles.emptyIconContainer, { backgroundColor: colors.accentColor + '10' }]}>
        <Ionicons name="people-outline" size={64} color={colors.accentColor} />
      </View>
      <Text style={[collabNotesStyles.emptyTitle, { color: colors.text }]}>
        No Shared Notes Yet
      </Text>
      <Text style={[collabNotesStyles.emptySubtitle, { color: colors.subText }]}>
        Notes shared with you will appear here.{'\n'}Start collaborating with others!
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[collabNotesStyles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={activeTheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.headerBackground}
      />

      {/* Modern Header */}
      <View style={[collabNotesStyles.header, { 
        backgroundColor: colors.headerBackground,
        borderBottomColor: activeTheme === 'dark' ? colors.borderColor : 'transparent',
      }]}>
        <View style={collabNotesStyles.headerContent}>
          <Pressable 
            onPress={() => navigation.goBack()} 
          >
            <Ionicons name="arrow-back" size={24} color={colors.headerText} />
          </Pressable>
          
          <View style={collabNotesStyles.titleContainer}>
            <View style={collabNotesStyles.titleRow}>
              <Text style={[collabNotesStyles.headerTitle, { color: colors.headerText }]}>
                Shared Notes
              </Text>
            </View>
            {collaboratedNotes.length > 0 && (
              <Text style={[collabNotesStyles.headerSubtitle, { color: colors.subText }]}>
                {collaboratedNotes.length} note{collaboratedNotes.length !== 1 ? 's' : ''} shared with you
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Notes List */}
      <FlatList
        data={groupedNotesArray}
        keyExtractor={([month]) => month}
        renderItem={({ item: [month, notes] }) => (
          <View style={collabNotesStyles.monthSection}>
            <Text style={[collabNotesStyles.monthHeader, { color: colors.subText }]}>
              {month}
            </Text>
            <View style={collabNotesStyles.notesGrid}>
              {notes.map(renderNoteCard)}
            </View>
          </View>
        )}
        contentContainerStyle={collabNotesStyles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[collabNotesStyles.floatingButton, { 
          backgroundColor: activeTheme === 'dark' ? '#4A5568' : '#718096',
          shadowColor: activeTheme === 'dark' ? '#000' : '#2D3748',
        }]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="mail-outline" size={24} color="white" />
        {pendingInvites.length > 0 && (
          <View style={collabNotesStyles.badge}>
            <Text style={collabNotesStyles.badgeText}>
              {pendingInvites.length > 99 ? '99+' : pendingInvites.length.toString()}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Loading Overlays */}
      {isFetchingNotes && (
        <View style={collabNotesStyles.loadingOverlay}>
          <View style={[collabNotesStyles.loadingContainer, { 
            backgroundColor: colors.cardBackground,
            shadowColor: activeTheme === 'dark' ? '#000' : '#2D3748',
          }]}>
            <Ionicons name="people-outline" size={32} color={colors.accentColor} />
            <Text style={[collabNotesStyles.loadingTitle, { color: colors.text }]}>
              Loading shared notes...
            </Text>
            <Text style={[collabNotesStyles.loadingSubtext, { color: colors.subText }]}>
              Fetching your collaborative content
            </Text>
            <View style={collabNotesStyles.loadingDots}>
              <View style={[collabNotesStyles.dot, { backgroundColor: colors.accentColor }]} />
              <View style={[collabNotesStyles.dot, { backgroundColor: colors.accentColor }]} />
              <View style={[collabNotesStyles.dot, { backgroundColor: colors.accentColor }]} />
            </View>
          </View>
        </View>
      )}

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

const collabNotesStyles = {
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    paddingTop: 25,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    marginLeft: 36,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  monthSection: {
    marginBottom: 24,
  },
  monthHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  notesGrid: {
    gap: 12,
  },
  noteCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  noteMetadata: {
    flex: 1,
    gap: 8,
  },
  collaborationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  noteDate: {
    fontSize: 12,
  },
  noteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 12,
  },
  contentIndicators: {
    flexDirection: 'row',
    gap: 8,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  indicatorText: {
    fontSize: 11,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 32,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF4757',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 3,
    borderColor: 'white',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  badgeText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 12,
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    maxWidth: 280,
    marginHorizontal: 20,
    elevation: 10,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.7,
  },
};