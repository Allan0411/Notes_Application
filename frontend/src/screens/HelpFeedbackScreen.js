import React, { useState, useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, SafeAreaView, StatusBar, Linking, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../ThemeContext';

export default function HelpFeedbackScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleSearch = () => {
    console.log(`Searching for: ${searchQuery}`);
  };

  const handleHelpCommunity = () => {
    const helpCommunityUrl = 'https://support.google.com/keep/community?hl=en'; 
    Linking.openURL(helpCommunityUrl).catch(err => {
      Alert.alert("Error", "Could not open the link. Please try again later.");
      console.error('An error occurred', err);
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

      <View style={[styles.header, { borderBottomColor: isDark ? '#333' : '#e8eaed' }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#ffffff' : '#202124'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#202124' }]}>
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
                <Ionicons name={resource.icon} size={20} color="#ffffff" />
              </View>
              <Text style={[styles.resourceText, { color: isDark ? '#e8eaed' : '#202124' }]}>
                {resource.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.searchContainer,
              { backgroundColor: isDark ? '#2c2c2c' : '#f1f3f4' },
            ]}
            onPress={handleSearch}
          >
            <Ionicons
              name="search"
              size={20}
              color={isDark ? '#c0c0c0' : '#5f6368'}
              style={styles.searchIcon}
            />
            <TextInput
              style={[styles.searchInput, { color: isDark ? '#ffffff' : '#202124' }]}
              placeholder="Search help"
              placeholderTextColor={isDark ? '#888' : '#9aa0a6'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#9aa0a6' : '#5f6368' }]}>
            Need more help?
          </Text>

          <TouchableOpacity style={styles.helpOption} onPress={handleHelpCommunity}>
            <View style={styles.helpOptionLeft}>
              <View style={styles.communityIcon}>
                <Ionicons name="people" size={20} color="#ffffff" />
              </View>
              <View style={styles.helpOptionText}>
                <Text style={[styles.helpOptionTitle, { color: isDark ? '#ffffff' : '#202124' }]}>
                  Post to the Help Community
                </Text>
                <Text style={[styles.helpOptionSubtitle, { color: isDark ? '#aaaaaa' : '#5f6368' }]}>
                  Get answers from community members
                </Text>
              </View>
            </View>
          </TouchableOpacity>

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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    flex: 1,
  },
  menuButton: {
    padding: 8,
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  resourceText: {
    fontSize: 16,
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  helpOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  helpOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  communityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4285f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  feedbackIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  helpOptionText: {
    flex: 1,
  },
  helpOptionTitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  helpOptionSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
});