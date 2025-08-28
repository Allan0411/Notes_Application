import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import reminderService from '../services/reminderService';
import {ThemeContext} from '../ThemeContext';
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
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchAnimation] = useState(new Animated.Value(0));

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

  const toggleSearch = () => {
    const toValue = showSearch ? 0 : 1;
    setShowSearch(!showSearch);
    
    Animated.timing(searchAnimation, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
    
    if (showSearch) {
      setSearchQuery('');
    }
  };

  const handleCompleteReminder = async (reminderId) => {
    try {
      await reminderService.completeReminder(reminderId);
      loadReminders();
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
    navigation.navigate('NoteDetail', { noteId });
  };

  const getFilteredReminders = () => {
    let filtered = [];

    switch (selectedTab) {
      case 'upcoming':
        filtered = upcomingReminders;
        break;
      case 'all':
        filtered = reminders.filter((r) => r.status === 'active');
        break;
      case 'completed':
        filtered = reminders.filter((r) => r.status === 'completed');
        break;
      default:
        filtered = reminders;
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (reminder) =>
          reminder.noteTitle
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          reminder.customMessage
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  // Enhanced status calculation for better accuracy
  const getStatusInfo = (reminder) => {
   const reminderDate = new Date(reminder.reminderDateTime);
   const now = new Date();
   const timeDiff = reminderDate - now; // in milliseconds
   const hoursDiff = timeDiff / (1000 * 60 * 60);
   const minutesDiff = timeDiff / (1000 * 60);

    if (reminder.status === 'completed') {
     return { text: 'Completed', style: styles.statusCompleted };
    }
    if (timeDiff < 0) {
     return { text: 'Overdue', style: styles.statusOverdue };
    }
    if (minutesDiff <= 60) { // Within 1 hour
     return { text: 'Urgent', style: styles.statusUrgent };
    }
   return { text: 'Active', style: styles.statusActive };
  };

  // Enhanced urgent check
  const isUrgent = (reminder) => {
   const reminderDate = new Date(reminder.reminderDateTime);
   const now = new Date();
   const minutesDiff = (reminderDate - now) / (1000 * 60);
   return minutesDiff <= 60 && minutesDiff > 0 && reminder.status !== 'completed';
  };

  // Enhanced time formatting function
const formatReminderDate = (dateString) => {
  const reminderDate = new Date(dateString);
  const now = new Date();
  
  // Set both dates to midnight for accurate day comparison
  const reminderDay = new Date(reminderDate.getFullYear(), reminderDate.getMonth(), reminderDate.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Calculate difference in days
  const diffTime = reminderDay.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  // Handle different cases
  if (diffDays === 0) {
    // Same day - check if it's past or future
    if (reminderDate <= now) {
      const minutesDiff = Math.round((now - reminderDate) / (1000 * 60));
      if (minutesDiff < 60) {
        return minutesDiff <= 1 ? 'Just now' : `${minutesDiff} min ago`;
      } else {
        const hoursDiff = Math.round(minutesDiff / 60);
        return hoursDiff === 1 ? '1 hour ago' : `${hoursDiff} hours ago`;
      }
    } else {
      const minutesDiff = Math.round((reminderDate - now) / (1000 * 60));
      if (minutesDiff < 60) {
        return minutesDiff <= 1 ? 'In 1 min' : `In ${minutesDiff} min`;
      } else {
        const hoursDiff = Math.round(minutesDiff / 60);
        return hoursDiff === 1 ? 'In 1 hour' : `In ${hoursDiff} hours`;
      }
    }
  }
  
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
  
  // For dates beyond a week, show the actual date
  return reminderDate.toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric',
    year: reminderDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

  const ReminderCard = ({ reminder }) => {
    const statusInfo = getStatusInfo(reminder);
    const isPast = new Date(reminder.reminderDateTime) < new Date();
    const isCompleted = reminder.status === 'completed';
    const urgent = isUrgent(reminder);

    return (
      <View style={[
        styles.reminderCard,
        isCompleted && styles.completedCard,
        urgent && styles.urgentCard,
      ]}>
        <TouchableOpacity
          onPress={() => openNote(reminder.noteId)}
          style={styles.cardTouchable}
          activeOpacity={0.6}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text 
                style={[
                  styles.cardTitle,
                  isCompleted && styles.completedText
                ]} 
                numberOfLines={1}
              >
                {reminder.noteTitle}
              </Text>
              <View style={styles.statusBadgeContainer}>
                <View style={[styles.statusBadge, statusInfo.style]}>
                  <Text style={[styles.statusText, statusInfo.style]}>
                    {statusInfo.text}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.cardHeaderRight}>
              <View style={styles.reminderTypeIcons}>
                {(reminder.reminderType === 'notification' || reminder.reminderType === 'both') && (
                  <View style={styles.typeIcon}>
                    <Ionicons name="notifications" size={12} color="#6B7280" />
                  </View>
                )}
                {(reminder.reminderType === 'calendar' || reminder.reminderType === 'both') && (
                  <View style={styles.typeIcon}>
                    <Ionicons name="calendar" size={12} color="#6B7280" />
                  </View>
                )}
                {reminder.repeatType !== 'none' && (
                  <View style={styles.typeIcon}>
                    <Ionicons name="repeat" size={12} color="#6B7280" />
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.cardContent}>
            <Text 
              style={[
                styles.cardMessage,
                isCompleted && styles.completedText
              ]} 
              numberOfLines={2}
            >
              {reminder.customMessage}
            </Text>

            <View style={styles.cardDateTime}>
              <View style={styles.dateTimeRow}>
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text style={styles.dateTimeText}>
                  {formatReminderDate(reminder.reminderDateTime)} at{' '}
                  {new Date(reminder.reminderDateTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.cardActions}>
          {reminder.status === 'active' && (
            <TouchableOpacity
              onPress={() => handleCompleteReminder(reminder.id)}
              style={[styles.actionButton, styles.completeButton]}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark" size={16} color="#16A34A" />
              <Text style={[styles.actionButtonText, styles.completeButtonText]}>
                Done
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => handleDeleteReminder(reminder.id)}
            style={[styles.actionButton, styles.deleteButton]}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={16} color="#DC2626" />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const EmptyState = ({ tab }) => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateContent}>
        <View style={styles.emptyStateIcon}>
          <Ionicons
            name={tab === 'upcoming' ? 'time-outline' : tab === 'completed' ? 'checkmark-circle' : 'list-outline'}
            size={32}
            color="#9CA3AF"
          />
        </View>
        <Text style={styles.emptyStateTitle}>
          {tab === 'upcoming' && 'No Upcoming Reminders'}
          {tab === 'all' && 'No Active Reminders'}
          {tab === 'completed' && 'No Completed Reminders'}
        </Text>
        <Text style={styles.emptyStateMessage}>
          {tab === 'upcoming' && 'Create reminders for your notes to stay organized.'}
          {tab === 'all' && 'Set reminders when editing notes to track deadlines.'}
          {tab === 'completed' && 'Completed reminders will appear here.'}
        </Text>
      </View>
    </View>
  );

  const filteredReminders = getFilteredReminders();

  const searchHeight = searchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 60],
  });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={themedStyles.container}>
        <StatusBar barStyle={theme.statusbar} backgroundColor={theme.background} />

        {/* Header */}
        <View style={[themedStyles.header, { backgroundColor: '#4a5568' }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color="#e7e8ebff" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={themedStyles.headerTitle}>Reminders</Text>
          </View>
          
          <TouchableOpacity onPress={toggleSearch} style={styles.headerButton}>
            <Ionicons 
              name={showSearch ? "close" : "search"} 
              size={24} 
              color="#f5f6f8ff" 
            />
          </TouchableOpacity>
        </View>

        {/* Animated Search Bar */}
        <Animated.View style={[styles.searchContainer, { height: searchHeight }]}>
          {showSearch && (
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={18} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search reminders..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9CA3AF"
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </Animated.View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {[
            { key: 'upcoming', label: 'Upcoming', icon: 'time-outline', count: upcomingReminders.length },
            { key: 'all', label: 'All', icon: 'list-outline', count: reminders.filter(r => r.status === 'active').length },
            { key: 'completed', label: 'Done', icon: 'checkmark-circle-outline', count: reminders.filter(r => r.status === 'completed').length },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                selectedTab === tab.key && styles.activeTab
              ]}
              onPress={() => setSelectedTab(tab.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={selectedTab === tab.key ? '#FFFFFF' : '#6B7280'}
              />
              <Text style={[
                styles.tabText,
                selectedTab === tab.key && styles.activeTabText
              ]}>
                {tab.label}
              </Text>
              {tab.count > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>
                    {tab.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <ScrollView
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#6B7280"
              colors={['#6B7280']}
            />
          }
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

        </ScrollView>

        {loading && (
          <View style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(255,255,255,0.8)',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Text style={{ color: '#6B7280', marginTop: 8 }}>Loading...</Text>
          </View>
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}