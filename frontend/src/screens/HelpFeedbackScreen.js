import React, { useState, useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Linking, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../ThemeContext';
import styles from '../styleSheets/HelpFeedbackScreenStyles';

export default function HelpFeedbackScreen({ navigation }) {
  const { activeTheme } = useContext(ThemeContext);
  const isDark = activeTheme === 'dark';

  const helpResources = [
    {
      id: 1,
      title: 'How to use note app',
      icon: 'help-circle-outline',
      color: '#4285f4',
      content: `# Getting Started

Welcome to your Note App! This guide will help you quickly get up to speed. Our goal is to make capturing your ideas and organizing your life as easy as possible.

## Key Features
* **Create notes:** Quickly jot down thoughts, ideas, and reminders.
* **Add checklists:** Stay organized with interactive to-do lists.
* **Sketch ideas:** Use the drawing tool to doodle, create flowcharts, or sketch out concepts.
* **Search and sort:** Easily find any note with powerful search and sorting options.

## Your First Note
1.  On the main screen, tap the large **\`+\`** button in the bottom right corner.
2.  Add a title and start typing your note.
3.  Tap the back arrow or done button to save automatically.`,
    },
    {
      id: 2,
      title: 'Create or edit a note',
      icon: 'create-outline',
      color: '#34a853',
      content: `# Creating and Editing Notes

Our editor is designed to be simple and intuitive. You can add more than just text to your notes.

## Creating a New Note
1.  Go to your home screen.
2.  Tap the **\`+\`** button.
3.  The editor will open, ready for your input. Notes are saved automatically as you type.

## Editing an Existing Note
* From the main screen, simply **tap on any note** to open it for editing.
* You can edit the title or the content at any time.

## Using the Editor
* **Text:** Start typing directly in the note body.
* **Checklist:** To add a checklist, look for the **\`checkbox icon\`** in the editor toolbar.
* **Drawing:** To sketch, select the **\`drawing icon\`** from the toolbar to access a digital canvas.`,
    },
    {
      id: 3,
      title: 'Fix problems with note app',
      icon: 'build-outline',
      color: '#fbbc04',
      content: `# Troubleshooting Common Issues

If you're having trouble with the app, try these solutions.

## 1. App Not Syncing
* Check your internet connection.
* Ensure you are logged in to your account.
* Pull down from the top of the notes list to manually trigger a sync.

## 2. Crashes or Freezing
* Close the app and open it again.
* Check the app store for a new update.
* Restart your device.

## 3. General Issues
* Clear the app's cache from your device settings.
* If the problem persists, use the **Send Feedback** link to report the issue to our team. Please include a description of the problem and the steps to reproduce it.`,
    },
    {
      id: 4,
      title: 'Share notes, lists and drawings',
      icon: 'share-outline',
      color: '#ea4335',
      content: `# Sharing Your Content

Easily share notes with friends, family, or colleagues.

## How to Share
1.  **Open the note** you wish to share.
2.  Look for the **\`share icon\`** (typically an arrow or three dots) in the top right corner.
3.  A menu will appear with options to share the content via email, messaging apps, or other services on your device.

## Sharing Options
* **Text:** Notes with text or checklists are typically shared as a text file.
* **Image:** Drawings or mixed-media notes can be shared as an image file.`,
    },
  ];

  const handleBackPress = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  const handleResourcePress = (resource) => {
    navigation.navigate('HelpArticle', {
      title: resource.title,
      content: resource.content,
      isDark,
    });
  };

  const handleSendFeedback = () => {
    Linking.openURL('mailto:support@yourcompany.com?subject=Note App Feedback&body=Dear Support, ').catch(err => {
      Alert.alert("Error", "Could not open the email app. Please ensure you have one installed.");
      console.error('An error occurred', err);
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#1a202c' : '#f8f9fa' }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#1e1e1e' : '#4a5568'}
      />

      <View style={[styles.header, {
        borderBottomColor: isDark ? '#333' : '#e8eaed',
        backgroundColor: '#4a5568',
      }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color={'#FFFFFF'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>
          Help & Feedback
        </Text>
        <View style={styles.menuButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#9aa0a6' : '#5f6368' }]}>
            Popular help resources
          </Text>

          {helpResources.map((resource) => (
            <TouchableOpacity
              key={resource.id}
              style={styles.resourceItem}
              onPress={() => handleResourcePress(resource)}
            >
              <View style={[styles.iconContainer, { backgroundColor: resource.color }]}>
                <Ionicons name="help-circle-outline" size={20} color="#ffffff" />
              </View>
              <Text style={[styles.resourceText, { color: isDark ? '#e8eaed' : '#202124' }]}>
                {resource.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#9aa0a6' : '#5f6368' }]}>
            Got Ideas or Issues?
          </Text>

          <TouchableOpacity style={styles.helpOption} onPress={handleSendFeedback}>
            <View style={styles.helpOptionLeft}>
              <View style={styles.feedbackIcon}>
                <Ionicons name="chatbox-outline" size={20} color={isDark ? '#ffffff' : '#4285f4'} />
              </View>
              <View style={styles.helpOptionText}>
                <Text style={[styles.helpOptionTitle, { color: isDark ? '#ffffff' : '#202124' }]}>
                  Send Feedback
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
