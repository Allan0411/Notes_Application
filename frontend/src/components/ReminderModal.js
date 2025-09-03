// components/ReminderModal.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import reminderService from '../services/reminderService';

// Helper to open Google Calendar event creation
const openGoogleCalendar = ({ title, description, startDate, endDate }) => {
  // Google Calendar expects: YYYYMMDDTHHmmssZ
  const formatDate = (date) => {
    // Always use UTC for Google Calendar links
    const pad = (n) => (n < 10 ? '0' + n : n);
    return (
      date.getUTCFullYear().toString() +
      pad(date.getUTCMonth() + 1) +
      pad(date.getUTCDate()) +
      'T' +
      pad(date.getUTCHours()) +
      pad(date.getUTCMinutes()) +
      pad(date.getUTCSeconds()) +
      'Z'
    );
  };

  const start = formatDate(startDate);
  const end = formatDate(endDate);

  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&details=${encodeURIComponent(description)}&dates=${start}/${end}`;

  Linking.openURL(url).catch((err) => {
    Alert.alert('Error', 'Could not open Google Calendar');
    console.error('Google Calendar open error:', err);
  });
};

const ReminderModal = ({
  visible,
  onClose,
  noteId,
  noteTitle,
  theme,
  themedStyles,
  styles,
  onReminderCreated,
}) => {
  const [reminderDate, setReminderDate] = useState(new Date());
  const [reminderTime, setReminderTime] = useState(new Date());
  const [customMessage, setCustomMessage] = useState('');
  const [reminderType, setReminderType] = useState('notification');
  const [repeatType, setRepeatType] = useState('none');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [calendarAvailable, setCalendarAvailable] = useState(false);
  const [notificationsAvailable, setNotificationsAvailable] = useState(false);

  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const calendarPermission = await reminderService.isCalendarAvailable();
    const notificationPermission = await reminderService.areNotificationsAvailable();

    setCalendarAvailable(calendarPermission);
    setNotificationsAvailable(notificationPermission);

    // Default to available type if current selection isn't available
    if (reminderType === 'calendar' && !calendarPermission) {
      setReminderType(notificationPermission ? 'notification' : 'both');
    } else if (reminderType === 'notification' && !notificationPermission) {
      setReminderType(calendarPermission ? 'calendar' : 'both');
    }
  };

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      const now = new Date();
      const futureDate = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

      setReminderDate(futureDate);
      setReminderTime(futureDate);
      setCustomMessage(`Reminder for: ${noteTitle || 'Untitled Note'}`);
      setReminderType('notification');
      setRepeatType('none');
    }
  }, [visible, noteTitle]);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setReminderDate(selectedDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setReminderTime(selectedTime);
    }
  };

  // Add to Google Calendar if reminderType is 'calendar' or 'both'
  const addToGoogleCalendarIfNeeded = async (reminderDateTime, message) => {
    // Only do this on web or if user selected calendar/both
    if (
      (reminderType === 'calendar' || reminderType === 'both') &&
      (Platform.OS === 'web' || Platform.OS === 'android' || Platform.OS === 'ios')
    ) {
      // Google Calendar event duration: 1 hour by default
      const endDate = new Date(reminderDateTime.getTime() + 60 * 60 * 1000);

      openGoogleCalendar({
        title: noteTitle || 'Reminder',
        description: message,
        startDate: reminderDateTime,
        endDate,
      });
    }
  };

  const createReminder = async () => {
    try {
      setIsCreating(true);

      // Validation
      const reminderDateTime = new Date(reminderDate);
      reminderDateTime.setHours(
        reminderTime.getHours(),
        reminderTime.getMinutes(),
        0,
        0
      );

      if (reminderDateTime <= new Date()) {
        Alert.alert('Invalid Date', 'Please select a future date and time.');
        return;
      }

      if (!customMessage.trim()) {
        Alert.alert('Missing Message', 'Please enter a reminder message.');
        return;
      }

      const reminderData = {
        noteId,
        noteTitle,
        reminderDate: reminderDate.toISOString(),
        reminderTime: reminderTime.toISOString(),
        reminderType,
        customMessage: customMessage.trim(),
        repeatType,
      };

      const createdReminder = await reminderService.createReminder(reminderData);

      // Add to Google Calendar if needed (works on web, and opens Google Calendar app on mobile)
      await addToGoogleCalendarIfNeeded(reminderDateTime, customMessage.trim());

      if (onReminderCreated) {
        onReminderCreated(createdReminder);
      }

      Alert.alert(
        'Reminder Created',
        `Reminder set for ${reminderDateTime.toLocaleString()}`,
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      console.error('Error creating reminder:', error);
      Alert.alert('Error', error.message || 'Failed to create reminder');
    } finally {
      setIsCreating(false);
    }
  };

  const reminderTypeOptions = [
    {
      value: 'notification',
      label: 'Notification Only',
      icon: 'notifications',
      available: notificationsAvailable,
    },
    {
      value: 'calendar',
      label: 'Calendar Only',
      icon: 'calendar',
      available: true, // Always allow Google Calendar option (web/mobile)
    },
    {
      value: 'both',
      label: 'Both Notification & Calendar',
      icon: 'sync',
      available: notificationsAvailable, // Only allow if notifications are available
    },
  ];

  const repeatOptions = [
    { value: 'none', label: 'No Repeat' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  const formatDate = (date) => {
    return date.toLocaleDateString();
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
    >
      <View style={[styles.modalOverlay, { backgroundColor: theme.overlay || 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.reminderModalContainer, {
          backgroundColor: theme.surface || theme.background || '#fff',
          maxHeight: '90%',
          marginTop: 'auto',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingTop: 8,
        }]}>
          {/* Header */}
          <View style={[styles.modalHeader, {
            borderBottomWidth: 1,
            borderBottomColor: theme.border || '#e2e8f0',
            paddingHorizontal: 20,
            paddingVertical: 15,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }]}>
            <Text style={[styles.modalTitle, {
              fontSize: 20,
              fontWeight: '600',
              color: theme.text || '#333'
            }]}>Set Reminder</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.textSecondary || '#666'} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {/* Note Info */}
            <View style={[styles.reminderSection, {
              paddingHorizontal: 20,
              paddingVertical: 15,
              borderBottomWidth: 1,
              borderBottomColor: theme.border || '#f0f0f0'
            }]}>
              <Text style={[styles.reminderSectionTitle, {
                fontSize: 16,
                fontWeight: '600',
                marginBottom: 10,
                color: theme.text || '#333',
              }]}>Note</Text>
              <Text style={[styles.reminderNoteTitle, {
                fontSize: 18,
                fontWeight: '500',
                color: theme.textSecondary || '#666',
              }]} numberOfLines={2}>
                {noteTitle || 'Untitled Note'}
              </Text>
            </View>

            {/* Date Selection */}
            <View style={[styles.reminderSection, {
              paddingHorizontal: 20,
              paddingVertical: 15,
            }]}>
              <Text style={[styles.reminderSectionTitle, {
                fontSize: 16,
                fontWeight: '600',
                marginBottom: 10,
                color: theme.text || '#333',
              }]}>Date & Time</Text>

              <View style={[styles.dateTimeRow, {
                flexDirection: 'row',
                justifyContent: 'space-between',
              }]}>
                <TouchableOpacity
                  style={[styles.dateTimeButton, {
                    flex: 1,
                    marginRight: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 12,
                    backgroundColor: theme.surface || '#f8f9fa',
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: theme.border || '#e2e8f0',
                  }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar" size={20} color={theme.accent || '#3182ce'} />
                  <Text style={[styles.dateTimeText, {
                    marginLeft: 8,
                    fontSize: 16,
                    color: theme.text || '#333',
                  }]}>{formatDate(reminderDate)}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.dateTimeButton, {
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 12,
                    backgroundColor: theme.surface || '#f8f9fa',
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: theme.border || '#e2e8f0',
                  }]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Ionicons name="time" size={20} color={theme.accent || '#3182ce'} />
                  <Text style={[styles.dateTimeText, {
                    marginLeft: 8,
                    fontSize: 16,
                    color: theme.text || '#333',
                  }]}>{formatTime(reminderTime)}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Custom Message */}
            <View style={[styles.reminderSection, {
              paddingHorizontal: 20,
              paddingVertical: 15,
            }]}>
              <Text style={[styles.reminderSectionTitle, {
                fontSize: 16,
                fontWeight: '600',
                marginBottom: 10,
                color: theme.text || '#333',
              }]}>Message</Text>
              <TextInput
                style={[styles.reminderMessageInput, {
                  borderWidth: 1,
                  borderColor: theme.border || '#e2e8f0',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  minHeight: 80,
                  textAlignVertical: 'top',
                  backgroundColor: theme.surface || '#f8f9fa',
                  color: theme.text || '#333',
                }]}
                value={customMessage}
                onChangeText={setCustomMessage}
                placeholder="Enter reminder message..."
                placeholderTextColor={theme.placeholder || '#a0aec0'}
                multiline
                maxLength={200}
              />
              <Text style={[styles.characterCount, {
                textAlign: 'right',
                fontSize: 12,
                marginTop: 4,
                color: theme.textMuted || '#999'
              }]}>
                {customMessage.length}/200
              </Text>
            </View>

            {/* Reminder Type */}
            <View style={[styles.reminderSection, {
              paddingHorizontal: 20,
              paddingVertical: 15,
            }]}>
              <Text style={[styles.reminderSectionTitle, {
                fontSize: 16,
                fontWeight: '600',
                marginBottom: 10,
                color: theme.text || '#333',
              }]}>Reminder Type</Text>

              {reminderTypeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.reminderTypeOption,
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 12,
                      marginVertical: 4,
                      borderRadius: 8,
                      borderWidth: 1,
                      backgroundColor: reminderType === option.value ? (theme.accent || '#3182ce') + '20' : 'transparent',
                      borderColor: reminderType === option.value ? (theme.accent || '#3182ce') : (theme.border || '#e2e8f0'),
                      opacity: option.available ? 1 : 0.5,
                    },
                  ]}
                  onPress={() => option.available && setReminderType(option.value)}
                  disabled={!option.available}
                >
                  <View style={[styles.reminderTypeContent, {
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1,
                  }]}>
                    <Ionicons
                      name={option.icon}
                      size={20}
                      color={reminderType === option.value ? (theme.accent || '#3182ce') : (theme.textSecondary || '#666')}
                    />
                    <View style={[styles.reminderTypeText, {
                      marginLeft: 12,
                      flex: 1,
                    }]}>
                      <Text
                        style={[
                          styles.reminderTypeLabel,
                          {
                            fontSize: 16,
                            fontWeight: '500',
                            color: reminderType === option.value ? (theme.accent || '#3182ce') : (theme.text || '#333')
                          }
                        ]}
                      >
                        {option.label}
                      </Text>
                      {!option.available && (
                        <Text style={[styles.unavailableText, {
                          fontSize: 12,
                          marginTop: 2,
                          color: theme.textMuted || '#999'
                        }]}>
                          Permission required
                        </Text>
                      )}
                    </View>
                  </View>
                  <View
                    style={[
                      styles.radioButton,
                      {
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderColor: reminderType === option.value ? (theme.accent || '#3182ce') : (theme.border || '#e2e8f0'),
                        backgroundColor: reminderType === option.value ? (theme.accent || '#3182ce') : 'transparent',
                      }
                    ]}
                  >
                    {reminderType === option.value && (
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Repeat Options */}
            <View style={[styles.reminderSection, {
              paddingHorizontal: 20,
              paddingVertical: 15,
            }]}>
              <Text style={[styles.reminderSectionTitle, {
                fontSize: 16,
                fontWeight: '600',
                marginBottom: 10,
                color: theme.text || '#333',
              }]}>Repeat</Text>

              <View style={[styles.repeatOptionsContainer, {
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
              }]}>
                {repeatOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.repeatOption,
                      {
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                        borderWidth: 1,
                        backgroundColor: repeatType === option.value ? (theme.accent || '#3182ce') : (theme.surface || '#f1f5f9'),
                        borderColor: repeatType === option.value ? (theme.accent || '#3182ce') : (theme.border || '#e2e8f0'),
                      }
                    ]}
                    onPress={() => setRepeatType(option.value)}
                  >
                    <Text
                      style={[
                        styles.repeatOptionText,
                        {
                          fontSize: 14,
                          fontWeight: '500',
                          color: repeatType === option.value ? '#fff' : (theme.text || '#333'),
                        }
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={[styles.modalActions, {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 20,
            borderTopWidth: 1,
            borderTopColor: theme.border || '#e2e8f0',
            backgroundColor: theme.background || '#fff',
            gap: 12,
          }]}>
            <TouchableOpacity
              style={[
                styles.reminderCancelButton,
                {
                  flex: 1,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.surface || '#f8fafc',
                  borderWidth: 1.5,
                  borderColor: theme.border || '#e2e8f0',
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 2,
                }
              ]}
              onPress={onClose}
              disabled={isCreating}
              activeOpacity={0.8}
            >
              <Text style={[styles.reminderCancelText, {
                fontSize: 16,
                fontWeight: '600',
                color: theme.textSecondary || '#475569',
                letterSpacing: 0.3,
              }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.reminderCreateButton,
                {
                  flex: 1,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isCreating
                    ? (theme.textMuted || '#94a3b8')
                    : (theme.accent || '#3b82f6'),
                  shadowColor: theme.accent || '#3b82f6',
                  shadowOffset: {
                    width: 0,
                    height: isCreating ? 2 : 4,
                  },
                  shadowOpacity: isCreating ? 0.1 : 0.3,
                  shadowRadius: isCreating ? 4 : 8,
                  elevation: isCreating ? 2 : 6,
                }
              ]}
              onPress={createReminder}
              disabled={isCreating}
              activeOpacity={0.8}
            >
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {isCreating && (
                  <View style={{
                    marginRight: 8,
                    width: 16,
                    height: 16,
                  }}>
                    <Ionicons
                      name="hourglass"
                      size={16}
                      color={isCreating ? '#f1f5f9' : '#fff'}
                    />
                  </View>
                )}
                <Text style={[styles.reminderCreateText, {
                  fontSize: 16,
                  fontWeight: '700',
                  color: isCreating ? '#f1f5f9' : '#ffffff',
                  letterSpacing: 0.5,
                }]}>
                  {isCreating ? 'Creating...' : 'Create Reminder'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={reminderDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {/* Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            value={reminderTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )}
      </View>
    </Modal>
  );
};

export default ReminderModal;