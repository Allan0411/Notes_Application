import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../ThemeContext';
import styles from '../styleSheets/DeletedNotesScreenStyles';
import { deleteNote, updateNoteIsPrivate } from '../services/noteService';
import LoadingOverlay from '../components/LoadingOverlay';
import { buildThemedStyles } from '../utils/buildThemedStyles';
import { noteDetailsthemes as themes } from '../utils/themeColors';

export default function DeletedNotesScreen() {
  const { activeTheme } = useContext(ThemeContext);
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get functions and data from route params
  const { 
    deletedNotes = [], 
    onCleanupOld
  } = route.params || {};

  const [localDeletedNotes, setLocalDeletedNotes] = useState(deletedNotes);
  const [isProcessing, setIsProcessing] = useState(false);

  // Theme setup
  const theme = themes[activeTheme] || themes.light;
  const themedStyles = buildThemedStyles(theme, styles);

  // Check for expired notes and show warning
  const getExpiredNotesCount = () => {
    const now = new Date();
    return localDeletedNotes.filter(note => {
      if (!note.deletedAt) return false;
      const deletedDate = new Date(note.deletedAt);
      const thirtyDaysLater = new Date(deletedDate);
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
      return now >= thirtyDaysLater;
    }).length;
  };

  const expiredCount = getExpiredNotesCount();

  const isDark = activeTheme === 'dark';
  const colors = {
    background: isDark ? '#1a202c' : '#f8f9fa',
    titleColor: isDark ? '#edf2f7' : '#2d3748',
    messageColor: isDark ? '#a0aec0' : '#718096',
    cardBg: isDark ? '#2d3748' : '#ffffff',
    textColor: isDark ? '#edf2f7' : '#2d3748',
    subTextColor: isDark ? '#a0aec0' : '#718096',
    headerBackground: isDark ? '#2d3748' : '#4a5568',
    headerText: '#fff',
    borderColor: isDark ? '#4a5568' : '#e2e8f0',
    restoreColor: '#38a169',
    deleteColor: '#e53e3e',
    iconColor: isDark ? '#cbd5e0' : '#4a5568',
    overlay: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)',
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Unknown date';
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Unknown date';
    }
  };

  const getDaysUntilDeletion = (deletedAt) => {
    try {
      const deletedDate = new Date(deletedAt);
      const now = new Date();
      const thirtyDaysLater = new Date(deletedDate);
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
      
      const msUntilDeletion = thirtyDaysLater - now;
      const daysUntilDeletion = Math.ceil(msUntilDeletion / (1000 * 60 * 60 * 24));
      
      if (daysUntilDeletion <= 0) return 'Expires today';
      if (daysUntilDeletion === 1) return '1 day left';
      return `${daysUntilDeletion} days left`;
    } catch (error) {
      return '30 days left';
    }
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

  const getPreviewText = (note) => {
    if (note.title && note.title.trim()) {
      return note.title.trim();
    }
    if (note.textContents && note.textContents.trim()) {
      return note.textContents.trim();
    }
    if (note.text && note.text.trim()) {
      return note.text.trim();
    }
    
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

  const handleRestore = (noteId) => {
    Alert.alert(
      'Restore Note',
      'Are you sure you want to restore this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'default',
          onPress: async () => {
            if (isProcessing) return;
            setIsProcessing(true);
            try {
              await updateNoteIsPrivate(noteId, false);
              setLocalDeletedNotes(prev => prev.filter(note => note.id !== noteId));
              Alert.alert('Success', 'Note restored successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to restore note');
              console.error('Restore error:', error);
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handlePermanentDelete = (noteId) => {
    Alert.alert(
      'Permanently Delete',
      'This action cannot be undone. Are you sure you want to permanently delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            if (isProcessing) return;
            setIsProcessing(true);
            try {
              const success = await deleteNote(noteId);
              if (success) {
                setLocalDeletedNotes(prev => prev.filter(note => note.id !== noteId));
                Alert.alert('Success', 'Note permanently deleted');
              } else {
                Alert.alert('Error', 'Failed to delete note permanently');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete note permanently');
              console.error('Permanent delete error:', error);
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };
  
  // NEW: Function to handle emptying the bin
  const handleEmptyBin = () => {
    if (localDeletedNotes.length === 0) {
      Alert.alert('Bin is empty', 'There are no notes to delete.');
      return;
    }

    Alert.alert(
      'Empty Bin',
      'Are you sure you want to permanently delete all notes in the bin? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            if (isProcessing) return;
            setIsProcessing(true);
            try {
              const deletionPromises = localDeletedNotes.map(note => deleteNote(note.id));
              await Promise.allSettled(deletionPromises);
              setLocalDeletedNotes([]); // Clear all notes from the local state
              Alert.alert('Success', 'Bin emptied successfully.');
            } catch (error) {
              console.error('Error emptying bin:', error);
              Alert.alert('Error', 'Failed to empty bin. Please try again.');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  const renderNoteItem = ({ item }) => {
    const checklistItems = parseChecklistItems(item.checklistItems);
    const hasText = !!(item.textContents ?? item.text ?? '').trim();
    const hasChecklist = checklistItems.length > 0;
    
    const hasDrawings = !!(item.drawings && (
      (Array.isArray(item.drawings) && item.drawings.length > 0) ||
      (typeof item.drawings === 'string' && item.drawings.trim() !== '' && item.drawings !== '[]')
    ));

    return (
      <TouchableOpacity 
        style={[styles.noteCard, { backgroundColor: colors.cardBg }]}
        activeOpacity={0.7}
      >
        <View style={styles.noteHeader}>
          <View style={styles.noteInfo}>
            <View style={styles.noteDetails}>
              <Text style={[styles.noteDate, { color: colors.subTextColor }]}>
                Deleted {formatDate(item.deletedAt)}
              </Text>
              <Text style={[styles.expiryText, { color: colors.deleteColor }]}>
                {getDaysUntilDeletion(item.deletedAt)}
              </Text>
            </View>
          </View>
          
          <View style={styles.miniActions}>
            <TouchableOpacity
              style={[
                styles.miniActionButton, 
                { 
                  backgroundColor: colors.restoreColor + '15',
                  opacity: isProcessing ? 0.5 : 1
                }
              ]}
              onPress={() => handleRestore(item.id)}
              activeOpacity={0.7}
              disabled={isProcessing}
            >
              <Ionicons name="refresh" size={16} color={colors.restoreColor} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.miniActionButton, 
                { 
                  backgroundColor: colors.deleteColor + '15',
                  opacity: isProcessing ? 0.5 : 1
                }
              ]}
              onPress={() => handlePermanentDelete(item.id)}
              activeOpacity={0.7}
              disabled={isProcessing}
            >
              <Ionicons name="trash" size={16} color={colors.deleteColor} />
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={[styles.notePreview, { color: colors.textColor }]} numberOfLines={3}>
          {getPreviewText(item)}
        </Text>

        <View style={styles.contentIndicators}>
          {hasText && (
            <View style={[styles.indicator, { backgroundColor: colors.iconColor + '10' }]}>
              <Ionicons name="document-text" size={10} color={colors.subTextColor} />
              <Text style={[styles.indicatorText, { color: colors.subTextColor }]}>Text</Text>
            </View>
          )}
          {hasChecklist && (
            <View style={[styles.indicator, { backgroundColor: colors.iconColor + '10' }]}>
              <Ionicons name="checkmark-circle" size={10} color={colors.subTextColor} />
              <Text style={[styles.indicatorText, { color: colors.subTextColor }]}>
                {checklistItems.length} items
              </Text>
            </View>
          )}
          {hasDrawings && (
            <View style={[styles.indicator, { backgroundColor: colors.iconColor + '10' }]}>
              <Ionicons name="brush" size={10} color={colors.subTextColor} />
              <Text style={[styles.indicatorText, { color: colors.subTextColor }]}>Drawing</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.headerBackground} 
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.headerText }]}>Deleted Notes</Text>
        {localDeletedNotes.length > 0 && (
          <TouchableOpacity onPress={handleEmptyBin} style={styles.emptyBinButton}>
            <Ionicons name="trash-bin-outline" size={24} color={colors.headerText} />
          </TouchableOpacity>
        )}
      </View>

      {/* Empty state */}
      {localDeletedNotes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconContainer, { backgroundColor: colors.iconColor + '10' }]}>
            <Ionicons name="trash-outline" size={48} color={colors.messageColor} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.titleColor }]}>
            Bin is empty
          </Text>
          <Text style={[styles.emptyMessage, { color: colors.messageColor }]}>
            Deleted notes will appear here and be automatically removed after 30 days.
          </Text>
        </View>
      ) : (
        <>
          {/* Stats header */}
          <View style={[styles.statsContainer, { backgroundColor: colors.cardBg }]}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.titleColor }]}>
                  {localDeletedNotes.length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.messageColor }]}>
                  {localDeletedNotes.length === 1 ? 'Note' : 'Notes'} in bin
                </Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.borderColor }]} />
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={16} color={colors.messageColor} />
                <Text style={[styles.statLabel, { color: colors.messageColor }]}>
                  Auto-delete after 30 days
                </Text>
              </View>
            </View>
            
            {/* Warning for expired notes */}
            {expiredCount > 0 && (
              <View style={[styles.warningContainer, { backgroundColor: colors.deleteColor + '15' }]}>
                <Ionicons name="warning-outline" size={16} color={colors.deleteColor} />
                <Text style={[styles.warningText, { color: colors.deleteColor }]}>
                  {expiredCount} {expiredCount === 1 ? 'note has' : 'notes have'} expired and will be cleaned up
                </Text>
              </View>
            )}
          </View>

          <FlatList
            data={localDeletedNotes}
            keyExtractor={(item, index) => {
              if (item && item.id) return `note-${item.id}`;
              if (item && item.deletedAt) return `deletedAt-${item.deletedAt}-${index}`;
              return `note-fallback-${index}`;
            }}
            contentContainerStyle={styles.listContainer}
            renderItem={renderNoteItem}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      {/* Loading overlay for processing */}
      <LoadingOverlay
        visible={isProcessing}
        text="Processing..."
        themedStyles={themedStyles}
        styles={styles}
        theme={theme}
      />
    </SafeAreaView>
  );
};