// services/reminderService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Calendar from 'expo-calendar';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

const REMINDERS_STORAGE_KEY = 'note_reminders';
const CALENDAR_SOURCE_KEY = 'reminder_calendar_source';
const CALENDAR_ID_KEY = 'reminder_calendar_id';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class reminderService {
  constructor() {
    this.calendarId = null;
    this.initializeCalendar();
  }

  // Initialize calendar and request permissions
  async initializeCalendar() {
    try {
      // Request calendar permissions
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        console.log('Calendar permission denied');
        return false;
      }

      // Request notification permissions
      const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
      if (notificationStatus !== 'granted') {
        console.log('Notification permission denied');
      }

      // Get or create calendar
      await this.getOrCreateCalendar();
      return true;
    } catch (error) {
      console.error('Error initializing calendar:', error);
      return false;
    }
  }

  // Get or create a dedicated calendar for note reminders
  async getOrCreateCalendar() {
    try {
      // Check if we already have a calendar ID stored
      const storedCalendarId = await AsyncStorage.getItem(CALENDAR_ID_KEY);
      if (storedCalendarId) {
        // Verify the calendar still exists
        try {
          const calendar = await Calendar.getCalendarAsync(storedCalendarId);
          if (calendar) {
            this.calendarId = storedCalendarId;
            return storedCalendarId;
          }
        } catch (error) {
          console.log('Stored calendar no longer exists, creating new one');
        }
      }

      // Get calendar source
      let calendarSource;
      const storedSource = await AsyncStorage.getItem(CALENDAR_SOURCE_KEY);
      
      if (storedSource) {
        calendarSource = JSON.parse(storedSource);
      } else {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        calendarSource = calendars.find(cal => cal.source.name === 'Default') || calendars[0]?.source;
        
        if (calendarSource) {
          await AsyncStorage.setItem(CALENDAR_SOURCE_KEY, JSON.stringify(calendarSource));
        }
      }

      if (!calendarSource) {
        throw new Error('No calendar source available');
      }

      // Create new calendar
      const calendarId = await Calendar.createCalendarAsync({
        title: 'Note Reminders',
        color: '#3182CE',
        entityType: Calendar.EntityTypes.EVENT,
        sourceId: calendarSource.id,
        source: calendarSource,
        name: 'noteReminders',
        ownerAccount: 'personal',
        accessLevel: Calendar.CalendarAccessLevel.OWNER,
      });

      this.calendarId = calendarId;
      await AsyncStorage.setItem(CALENDAR_ID_KEY, calendarId);
      return calendarId;
    } catch (error) {
      console.error('Error creating calendar:', error);
      throw error;
    }
  }

  // Create a reminder
  async createReminder(reminderData) {
    try {
      const {
        noteId,
        noteTitle,
        reminderDate,
        reminderTime,
        reminderType = 'notification', // 'notification', 'calendar', 'both'
        customMessage,
        repeatType = 'none' // 'none', 'daily', 'weekly', 'monthly'
      } = reminderData;

      const reminderId = Date.now().toString();
      const reminderDateTime = this.combineDateTime(reminderDate, reminderTime);

      const reminder = {
        id: reminderId,
        noteId,
        noteTitle: noteTitle || 'Untitled Note',
        reminderDateTime: reminderDateTime.toISOString(),
        reminderType,
        customMessage: customMessage || `Reminder for: ${noteTitle || 'Untitled Note'}`,
        repeatType,
        status: 'active', // 'active', 'completed', 'cancelled'
        createdAt: new Date().toISOString(),
        notificationId: null,
        calendarEventId: null,
      };

      // Schedule notification if requested
      if (reminderType === 'notification' || reminderType === 'both') {
        reminder.notificationId = await this.scheduleNotification(reminder);
      }

      // Add to calendar if requested
      if (reminderType === 'calendar' || reminderType === 'both') {
        reminder.calendarEventId = await this.addToCalendar(reminder);
      }

      // Save to local storage
      await this.saveReminder(reminder);

      return reminder;
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  }

  // Schedule local notification
  async scheduleNotification(reminder) {
    try {
      const trigger = new Date(reminder.reminderDateTime);
      
      if (trigger <= new Date()) {
        throw new Error('Cannot schedule reminder in the past');
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Note Reminder',
          body: reminder.customMessage,
          data: {
            noteId: reminder.noteId,
            reminderId: reminder.id,
            type: 'reminder'
          },
        },
        trigger,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  // Add event to Google Calendar
  async addToCalendar(reminder) {
    try {
      if (!this.calendarId) {
        await this.getOrCreateCalendar();
      }

      const startDate = new Date(reminder.reminderDateTime);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

      const eventId = await Calendar.createEventAsync(this.calendarId, {
        title: `📝 ${reminder.noteTitle}`,
        notes: reminder.customMessage,
        startDate,
        endDate,
        allDay: false,
        alarms: [
          { relativeOffset: -15 }, // 15 minutes before
          { relativeOffset: -60 }, // 1 hour before
        ],
      });

      return eventId;
    } catch (error) {
      console.error('Error adding to calendar:', error);
      throw error;
    }
  }

  // Get all reminders
  async getAllReminders() {
    try {
      const remindersJson = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
      if (!remindersJson) return [];
      
      const reminders = JSON.parse(remindersJson);
      
      // Sort by reminder date (upcoming first)
      return reminders.sort((a, b) => 
        new Date(a.reminderDateTime) - new Date(b.reminderDateTime)
      );
    } catch (error) {
      console.error('Error getting reminders:', error);
      return [];
    }
  }

  // Get reminders for a specific note
  async getRemindersForNote(noteId) {
    try {
      const allReminders = await this.getAllReminders();
      return allReminders.filter(reminder => 
        reminder.noteId === noteId && reminder.status === 'active'
      );
    } catch (error) {
      console.error('Error getting reminders for note:', error);
      return [];
    }
  }

  // Update reminder
  async updateReminder(reminderId, updateData) {
    try {
      const reminders = await this.getAllReminders();
      const reminderIndex = reminders.findIndex(r => r.id === reminderId);
      
      if (reminderIndex === -1) {
        throw new Error('Reminder not found');
      }

      const existingReminder = reminders[reminderIndex];
      
      // Cancel existing notification and calendar event
      if (existingReminder.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(existingReminder.notificationId);
      }
      
      if (existingReminder.calendarEventId) {
        await Calendar.deleteEventAsync(existingReminder.calendarEventId);
      }

      // Update reminder data
      const updatedReminder = {
        ...existingReminder,
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      // Reschedule if the reminder is still active
      if (updatedReminder.status === 'active') {
        if (updatedReminder.reminderType === 'notification' || updatedReminder.reminderType === 'both') {
          updatedReminder.notificationId = await this.scheduleNotification(updatedReminder);
        }
        
        if (updatedReminder.reminderType === 'calendar' || updatedReminder.reminderType === 'both') {
          updatedReminder.calendarEventId = await this.addToCalendar(updatedReminder);
        }
      }

      reminders[reminderIndex] = updatedReminder;
      await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
      
      return updatedReminder;
    } catch (error) {
      console.error('Error updating reminder:', error);
      throw error;
    }
  }

  // Delete reminder
  async deleteReminder(reminderId) {
    try {
      const reminders = await this.getAllReminders();
      const reminder = reminders.find(r => r.id === reminderId);
      
      if (!reminder) {
        throw new Error('Reminder not found');
      }

      // Cancel notification
      if (reminder.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
      }

      // Delete calendar event
      if (reminder.calendarEventId) {
        await Calendar.deleteEventAsync(reminder.calendarEventId);
      }

      // Remove from storage
      const updatedReminders = reminders.filter(r => r.id !== reminderId);
      await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(updatedReminders));
      
      return true;
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  }

  // Mark reminder as completed
  async completeReminder(reminderId) {
    try {
      return await this.updateReminder(reminderId, {
        status: 'completed',
        completedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error completing reminder:', error);
      throw error;
    }
  }

  // Get upcoming reminders (next 7 days)
  async getUpcomingReminders(days = 7) {
    try {
      const allReminders = await this.getAllReminders();
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + days);

      return allReminders.filter(reminder => {
        const reminderDate = new Date(reminder.reminderDateTime);
        return (
          reminder.status === 'active' &&
          reminderDate >= now &&
          reminderDate <= futureDate
        );
      });
    } catch (error) {
      console.error('Error getting upcoming reminders:', error);
      return [];
    }
  }

  // Clean up past reminders
  async cleanupPastReminders() {
    try {
      const reminders = await this.getAllReminders();
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const activeReminders = reminders.filter(reminder => {
        const reminderDate = new Date(reminder.reminderDateTime);
        return (
          reminder.status === 'active' || 
          reminderDate > oneDayAgo ||
          reminder.status === 'completed'
        );
      });

      await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(activeReminders));
      return activeReminders.length;
    } catch (error) {
      console.error('Error cleaning up reminders:', error);
      return 0;
    }
  }

  // Helper method to combine date and time
  combineDateTime(date, time) {
    const dateObj = new Date(date);
    const timeObj = new Date(time);
    
    dateObj.setHours(
      timeObj.getHours(),
      timeObj.getMinutes(),
      timeObj.getSeconds(),
      timeObj.getMilliseconds()
    );
    
    return dateObj;
  }

  // Save reminder to local storage
  async saveReminder(reminder) {
    try {
      const existingReminders = await this.getAllReminders();
      const updatedReminders = [...existingReminders, reminder];
      await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(updatedReminders));
    } catch (error) {
      console.error('Error saving reminder:', error);
      throw error;
    }
  }

  // Check if calendar integration is available
  async isCalendarAvailable() {
    try {
      const { status } = await Calendar.getCalendarPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      return false;
    }
  }

  // Check if notifications are available
  async areNotificationsAvailable() {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      return false;
    }
  }
}

export default new reminderService();