// screens/RemindersScreen.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { ThemeContext } from '../ThemeContext';
import reminderService from '../services/reminderService';
import { remindersthemes as themes } from '../utils/themeColors';
import { buildThemedStyles } from '../utils/buildThemedStyles';
import styles from '../styleSheets/RemindersScreenStyles';
import LoadingOverlay from '../components/LoadingOverlay';

export default function RemindersScreen({ navigation }) {
  const { activeTheme } = useContext(ThemeContext);
  const theme = themes[activeTheme] || themes.light;
  const themedStyles = buildThemedStyles(theme, styles);

  const [reminders, setReminders] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('upcoming'); // 'upcoming', 'all', 'completed'
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Load reminders when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadReminders();
    }, [])
  );

  const loadReminders = async () => {
    try {
      setLoading(true);
      const [allReminders, upcoming] = await Promise.all([
        reminderService.getAllReminders(),
        reminderService.getUpcomingReminders(7),
      ]);

      setReminders(allReminders);
      setUpcomingReminders(upcoming);

      // Clean up past reminders
      await reminderService.cleanupPastReminders();
    } catch (error) {
      console.error('Error loading reminders:', error);
      Alert.alert('Error', 'Failed to load reminders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReminders();
  };

  const handleCompleteReminder = async (reminderId) => {
    try {
      await reminderService.completeReminder(reminderId);
      loadReminders();
      Alert.alert('Success', 'Reminder marked as completed');
    } catch (error) {
      console.error('Error completing reminder:', error);
      Alert.alert('Error', 'Failed to complete reminder');
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await reminderService.deleteReminder(reminderId);
              loadReminders();
            } catch (error) {
              console.error('Error deleting reminder:', error);
              Alert.alert('Error', 'Failed to delete reminder');
            }
          },
        },
      ]
    );
  };

  const openNote = (noteId) => {
    // Navigate to note detail - you'll need to implement this based on your navigation structure
    navigation.navigate('NoteDetail', { noteId });
  };

  const getFilteredReminders = () => {
    let filtered = [];
    
    switch (selectedTab) {
      case 'upcoming':
        filtered = upcomingReminders;
        break;
      case 'all':
        filtered = reminders.filter(r => r.status === 'active');
        break;
      case 'completed':
        filtered = reminders.filter(r => r.status === 'completed');
        break;
      default:
        filtered = reminders;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(reminder =>
        reminder.noteTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reminder.customMessage.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getStatusColor = (reminder) => {
    const reminderDate = new Date(reminder.reminderDateTime);
    const now = new Date();
    const hoursDiff = (reminderDate - now) / (1000 * 60 * 60);

    if (reminder.status === 'completed') return theme.success;
    if (reminderDate < now) return theme.error;
    if (hoursDiff <= 1) return theme.warning;
    if (hoursDiff <= 24) return theme.accent;
    return theme.textSecondary;
  };

  const formatReminderDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
    
    return date.toLocaleDateString();
  };

  const ReminderCard = ({ reminder }) => {
    const statusColor = getStatusColor(reminder);
    const isPast = new Date(reminder.reminderDateTime) < new Date();

    return (
      <TouchableOpacity
        style={[themedStyles.reminderCard]}
        onPress={() => openNote(reminder.noteId)}
      >
        <View style={styles.reminderCardHeader}>
          <View style={styles.reminderCardTitle}>
            <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
            <Text style={themedStyles.reminderCardNoteTitle} numberOfLines={1}>
              {reminder.noteTitle}
            </Text>
          </View>
          
          <View style={styles.reminderCardActions}>
            {reminder.status === 'active' && !isPast && (
              <TouchableOpacity
                onPress={() => handleCompleteReminder(reminder.id)}
                style={styles.reminderAction}
              >
                <Ionicons name="checkmark-circle" size={24} color={theme.success} />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              onPress={() => handleDeleteReminder(reminder.id)}
              style={styles.reminderAction}
            >
              <Ionicons name="trash" size={20} color={theme.error} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={themedStyles.reminderCardMessage} numberOfLines={2}>
          {reminder.customMessage}
        </Text>

        <View style={styles.reminderCardFooter}>
          <View style={styles.reminderDateTime}>
            <Ionicons name="time" size={16} color={statusColor} />
            <Text style={[themedStyles.reminderCardDate, { color: statusColor }]}>
              {formatReminderDate(reminder.reminderDateTime)} at{' '}
              {new Date(reminder.reminderDateTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>

          <View style={styles.reminderType}>
            {(reminder.reminderType === 'notification' || reminder.reminderType === 'both') && (
              <Ionicons name="notifications" size={16} color={theme.textMuted} />
            )}
            {(reminder.reminderType === 'calendar' || reminder.reminderType === 'both') && (
              <Ionicons name="calendar" size={16} color={theme.textMuted} />
            )}
            {reminder.repeatType !== 'none' && (
              <Ionicons name="repeat" size={16} color={theme.textMuted} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyState = ({ tab }) => (
    <View style={styles.emptyState}>
      <Ionicons 
        name={tab === 'upcoming' ? 'time' : tab === 'completed' ? 'checkmark-done' : 'alarm'} 
        size={64} 
        color={theme.textMuted} 
      />
      <Text style={themedStyles.emptyStateTitle}>
        {tab === 'upcoming' && 'No Upcoming Reminders'}
        {tab === 'all' && 'No Active Reminders'}
        {tab === 'completed' && 'No Completed Reminders'}
      </Text>
      <Text style={themedStyles.emptyStateMessage}>
        {tab === 'upcoming' && 'Create reminders for your notes to stay organized'}
        {tab === 'all' && 'Set reminders when editing notes'}
        {tab === 'completed' && 'Completed reminders will appear here'}
      </Text>
    </View>
  );

  const filteredReminders = getFilteredReminders();

  return (
    <SafeAreaView style={themedStyles.container}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.background} />
      
      {/* Header */}
      <View style={themedStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
        <Text style={themedStyles.headerTitle}>Reminders</Text>
        <TouchableOpacity onPress={() => setShowSearch(!showSearch)}>
          <Ionicons name="search" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={themedStyles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.textMuted} />
          <TextInput
            style={themedStyles.searchInput}
            placeholder="Search reminders..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.placeholder}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Tab Selector */}
      <View style={themedStyles.tabContainer}>
        {[
          { key: 'upcoming', label: 'Upcoming', icon: 'time' },
          { key: 'all', label: 'All', icon: 'list' },
          { key: 'completed', label: 'Completed', icon: 'checkmark-done' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              selectedTab === tab.key && themedStyles.activeTab,
            ]}
            onPress={() => setSelectedTab(tab.key)}
          >
            <Ionicons
              name={tab.icon}
              size={18}
              color={selectedTab === tab.key ? '#fff' : theme.textSecondary}
            />
            <Text
              style={[
                themedStyles.tabText,
                selectedTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
            {/* Badge for count */}
            {tab.key === 'upcoming' && upcomingReminders.length > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: theme.error }]}>
                <Text style={styles.tabBadgeText}>{upcomingReminders.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Reminders List */}
      <ScrollView
        style={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredReminders.length === 0 ? (
          <EmptyState tab={selectedTab} />
        ) : (
          <View style={styles.remindersContainer}>
            {filteredReminders.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </View>
        )}

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={themedStyles.infoTitle}>About Reminders</Text>
          <Text style={themedStyles.infoText}>
            • Reminders can send notifications or add events to your calendar{'\n'}
            • Set reminders when editing notes using the menu button{'\n'}
            • Completed reminders are kept for reference{'\n'}
            • Past due reminders appear in red
          </Text>
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      <LoadingOverlay
        visible={loading}
        text="Loading reminders..."
        themedStyles={themedStyles}
        styles={styles}
        theme={theme}
      />
    </SafeAreaView>
  );
};