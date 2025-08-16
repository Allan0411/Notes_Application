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
import styles from '../styleSheets/DeletedNotesScreenStyles'; // Import styles from the stylesheet

export default function DeletedNotesScreen() {
  const { activeTheme } = useContext(ThemeContext);
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get functions and data from route params
  const { 
    deletedNotes = [], 
    onRestore,
    onPermanentDelete,
    onCleanupOld // Add this for manual cleanup
  } = route.params || {};

  const [localDeletedNotes, setLocalDeletedNotes] = useState(deletedNotes);

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
            try {
              if (onRestore) {
                await onRestore(noteId);
                // Remove from local list
                setLocalDeletedNotes(prev => prev.filter(note => note.id !== noteId));
                
                // Optional: Navigate back to home to see the restored note
                // navigation.goBack();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to restore note');
              console.error('Restore error:', error);
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
            try {
              if (onPermanentDelete) {
                await onPermanentDelete(noteId);
                // Remove from local list
                setLocalDeletedNotes(prev => prev.filter(note => note.id !== noteId));
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete note permanently');
              console.error('Permanent delete error:', error);
            }
          },
        },
      ]
    );
  };

  const renderNoteItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.noteCard, { backgroundColor: colors.cardBg }]}
      activeOpacity={0.7}
    >
      <View style={styles.noteHeader}>
        <View style={styles.noteInfo}>
          <View style={[styles.noteTypeIndicator, { backgroundColor: colors.iconColor + '20' }]}>
            <Ionicons
              name={getNoteTypeIcon(item)}
              size={14}
              color={colors.iconColor}
            />
          </View>
          <View style={styles.noteDetails}>
            <Text style={[styles.noteDate, { color: colors.subTextColor }]}>
              Deleted {formatDate(item.deletedAt)}
            </Text>
            <Text style={[styles.expiryText, { color: colors.deleteColor }]}>
              {getDaysUntilDeletion(item.deletedAt)}
            </Text>
          </View>
        </View>
        
        {/* Minimalist action buttons */}
        <View style={styles.miniActions}>
          <TouchableOpacity
            style={[styles.miniActionButton, { backgroundColor: colors.restoreColor + '15' }]}
            onPress={() => handleRestore(item.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={16} color={colors.restoreColor} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.miniActionButton, { backgroundColor: colors.deleteColor + '15' }]}
            onPress={() => handlePermanentDelete(item.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash" size={16} color={colors.deleteColor} />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={[styles.notePreview, { color: colors.textColor }]} numberOfLines={3}>
        {getPreviewText(item)}
      </Text>

      {/* Content indicators */}
      <View style={styles.contentIndicators}>
        {(item.textContents ?? item.text ?? '').trim() && (
          <View style={[styles.indicator, { backgroundColor: colors.iconColor + '10' }]}>
            <Ionicons name="document-text" size={10} color={colors.subTextColor} />
            <Text style={[styles.indicatorText, { color: colors.subTextColor }]}>Text</Text>
          </View>
        )}
        {item.checklistItems && item.checklistItems.length > 0 && (
          <View style={[styles.indicator, { backgroundColor: colors.iconColor + '10' }]}>
            <Ionicons name="checkbox" size={10} color={colors.subTextColor} />
            <Text style={[styles.indicatorText, { color: colors.subTextColor }]}>
              {item.checklistItems.length} items
            </Text>
          </View>
        )}
        {item.drawings && item.drawings.length > 0 && (
          <View style={[styles.indicator, { backgroundColor: colors.iconColor + '10' }]}>
            <Ionicons name="brush" size={10} color={colors.subTextColor} />
            <Text style={[styles.indicatorText, { color: colors.subTextColor }]}>Drawing</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

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
        <View style={styles.placeholder} />
      </View>

      {/* Empty state with better visual hierarchy */}
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
            
            {/* Show warning for expired notes */}
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
            keyExtractor={(item) => item.id ? String(item.id) : Math.random().toString()}
            contentContainerStyle={styles.listContainer}
            renderItem={renderNoteItem}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </SafeAreaView>
  );
}

