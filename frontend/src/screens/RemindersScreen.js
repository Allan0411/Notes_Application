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
     return { text: 'Completed', style: getThemedStatusStyle('completed') };
    }
    if (timeDiff < 0) {
     return { text: 'Overdue', style: getThemedStatusStyle('overdue') };
    }
    if (minutesDiff <= 60) { // Within 1 hour
     return { text: 'Urgent', style: getThemedStatusStyle('urgent') };
    }
   return { text: 'Active', style: getThemedStatusStyle('active') };
  };

  // Get themed status styles
  const getThemedStatusStyle = (status) => {
    const baseStyles = {
      active: {
        backgroundColor: activeTheme === 'dark' ? '#1e3a8a' : '#EFF6FF',
        color: activeTheme === 'dark' ? '#93c5fd' : '#2563EB',
      },
      completed: {
        backgroundColor: activeTheme === 'dark' ? '#14532d' : '#F0FDF4',
        color: activeTheme === 'dark' ? '#86efac' : '#16A34A',
      },
      overdue: {
        backgroundColor: activeTheme === 'dark' ? '#7f1d1d' : '#FEF2F2',
        color: activeTheme === 'dark' ? '#fca5a5' : '#DC2626',
      },
      urgent: {
        backgroundColor: activeTheme === 'dark' ? '#92400e' : '#FEF3C7',
        color: activeTheme === 'dark' ? '#fcd34d' : '#D97706',
      },
    };
    return baseStyles[status] || baseStyles.active;
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
        { backgroundColor: theme.background, borderColor: theme.border },
        isCompleted && { backgroundColor: activeTheme === 'dark' ? '#374151' : '#eaeceeff' },
        urgent && {
          borderColor: activeTheme === 'dark' ? '#42506bff' : '#6f7897ff',
          borderLeftWidth: 2,
          borderLeftColor: activeTheme === 'dark' ? '#65789bff' : '#4a4b63ff',
        },
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
                  { color: theme.text },
                  isCompleted && { textDecorationLine: 'line-through', color: theme.textMuted }
                ]} 
                numberOfLines={1}
              >
                {reminder.noteTitle}
              </Text>
              <View style={styles.statusBadgeContainer}>
                <View style={[styles.statusBadge, statusInfo.style]}>
                  <Text style={[styles.statusText, { color: statusInfo.style.color }]}>
                    {statusInfo.text}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.cardHeaderRight}>
              <View style={styles.reminderTypeIcons}>
                {(reminder.reminderType === 'notification' || reminder.reminderType === 'both') && (
                  <View style={[styles.typeIcon, { backgroundColor: theme.surface }]}>
                    <Ionicons name="notifications" size={12} color={theme.textMuted} />
                  </View>
                )}
                {(reminder.reminderType === 'calendar' || reminder.reminderType === 'both') && (
                  <View style={[styles.typeIcon, { backgroundColor: theme.surface }]}>
                    <Ionicons name="calendar" size={12} color={theme.textMuted} />
                  </View>
                )}
                {reminder.repeatType !== 'none' && (
                  <View style={[styles.typeIcon, { backgroundColor: theme.surface }]}>
                    <Ionicons name="repeat" size={12} color={theme.textMuted} />
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.cardContent}>
            <Text 
              style={[
                styles.cardMessage,
                { color: theme.textSecondary },
                isCompleted && { color: theme.textMuted }
              ]} 
              numberOfLines={2}
            >
              {reminder.customMessage}
            </Text>

            <View style={[styles.cardDateTime, { borderTopColor: theme.border }]}>
              <View style={styles.dateTimeRow}>
                <Ionicons name="time-outline" size={14} color={theme.textMuted} />
                <Text style={[styles.dateTimeText, { color: theme.textSecondary }]}>
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
        <View style={[styles.cardActions, { borderTopColor: theme.border }]}>
          {reminder.status === 'active' && (
            <TouchableOpacity
              onPress={() => handleCompleteReminder(reminder.id)}
              style={[
                styles.actionButton,
                {
                  backgroundColor: activeTheme === 'dark' ? '#14532d' : '#F0FDF4',
                  borderColor: activeTheme === 'dark' ? '#22c55e' : '#BBF7D0',
                }
              ]}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark" size={16} color={activeTheme === 'dark' ? '#86efac' : '#16A34A'} />
              <Text style={[
                styles.actionButtonText,
                { color: activeTheme === 'dark' ? '#86efac' : '#16A34A' }
              ]}>
                Done
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => handleDeleteReminder(reminder.id)}
            style={[
              styles.actionButton,
              {
                backgroundColor: activeTheme === 'dark' ? '#3c3d3fff' : '#FEF2F2',
                borderColor: activeTheme === 'dark' ? '#ef4444' : '#FECACA',
              }
            ]}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={16} color={activeTheme === 'dark' ? '#fca5a5' : '#DC2626'} />
            <Text style={[
              styles.actionButtonText,
              { color: activeTheme === 'dark' ? '#fca5a5' : '#DC2626' }
            ]}>
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
        <View style={[styles.emptyStateIcon, { backgroundColor: theme.surface }]}>
          <Ionicons
            name={tab === 'upcoming' ? 'time-outline' : tab === 'completed' ? 'checkmark-circle' : 'list-outline'}
            size={32}
            color={theme.textMuted}
          />
        </View>
        <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
          {tab === 'upcoming' && 'No Upcoming Reminders'}
          {tab === 'all' && 'No Active Reminders'}
          {tab === 'completed' && 'No Completed Reminders'}
        </Text>
        <Text style={[styles.emptyStateMessage, { color: theme.textSecondary }]}>
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
      <SafeAreaView style={[themedStyles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={activeTheme === 'dark' ? 'light-content' : 'dark-content'} />

        {/* Header */}
        <View style={[
          themedStyles.header, 
          { 
            backgroundColor: activeTheme === 'dark' ? '#2d384bff': '#4a5568',
            borderBottomColor: activeTheme === 'dark' ? '#2d384bff' : '#4a5568',
          }
        ]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color="#e7e8ebff" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Reminders</Text>
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
        <Animated.View style={[
          styles.searchContainer, 
          { height: searchHeight, backgroundColor: theme.background, borderBottomColor: theme.border }
        ]}>
          {showSearch && (
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={18} color={theme.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Search reminders..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={theme.placeholder}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={theme.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </Animated.View>

        {/* Tabs */}
        <View style={[
          styles.tabContainer, 
          { 
            backgroundColor: theme.background, 
            borderBottomColor: theme.background 
          }
        ]}>
          {[
            { key: 'upcoming', label: 'Upcoming', icon: 'time-outline', count: upcomingReminders.length },
            { key: 'all', label: 'All', icon: 'list-outline', count: reminders.filter(r => r.status === 'active').length },
            { key: 'completed', label: 'Done', icon: 'checkmark-circle-outline', count: reminders.filter(r => r.status === 'completed').length },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                { backgroundColor: activeTheme === 'dark' ? '#4a5568' : '#e8eef7ff' },
                selectedTab === tab.key && { backgroundColor: activeTheme === 'dark' ? '#64748b' : '#5b6880ff' }
              ]}
              onPress={() => setSelectedTab(tab.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={selectedTab === tab.key ? '#FFFFFF' : theme.textMuted}
              />
              <Text style={[
                styles.tabText,
                { color: selectedTab === tab.key ? '#FFFFFF' : theme.textMuted }
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
          style={[styles.contentContainer, { backgroundColor: theme.background }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.textMuted}
              colors={[theme.textMuted]}
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
            backgroundColor: activeTheme === 'dark' ? 'rgba(26,32,44,0.8)' : 'rgba(255,255,255,0.8)',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Text style={{ color: theme.textMuted, marginTop: 8 }}>Loading...</Text>
          </View>
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}