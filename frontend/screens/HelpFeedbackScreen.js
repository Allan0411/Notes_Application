//./screens/HelpFeedbackScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, SafeAreaView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HelpFeedbackScreen () {
  const [searchQuery, setSearchQuery] = useState('');

  const helpResources = [
    {
      id: 1,
      title: 'How to use note app',
      icon: 'help-circle-outline',
      color: '#4285f4',
    },
    {
      id: 2,
      title: 'Create or edit a note',
      icon: 'create-outline',
      color: '#34a853',
    },
    {
      id: 3,
      title: 'Fix problems with note app',
      icon: 'build-outline',
      color: '#fbbc04',
    },
    {
      id: 4,
      title: 'Share notes, lists and drawings',
      icon: 'share-outline',
      color: '#ea4335',
    },
    // {
    //   id: 5,
    //   title: 'Archive notes and lists',
    //   icon: 'archive-outline',
    //   color: '#9aa0a6',
    // },
  ];

  const handleResourcePress = (resource) => {
    console.log(`Selected: ${resource.title}`);
    // Navigate to specific help content or open external link
  };

  const handleSearch = () => {
    console.log(`Searching for: ${searchQuery}`);
    // Implement search functionality
  };

  const handleHelpCommunity = () => {
    console.log('Opening Help Community');
    // Navigate to help community or open external link
  };

  const handleSendFeedback = () => {
    console.log('Opening Send Feedback');
    // Navigate to feedback form or open external link
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#4a5568"/>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Popular help resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular help resources</Text>
          
          {helpResources.map((resource) => (
            <TouchableOpacity
              key={resource.id}
              style={styles.resourceItem}
              onPress={() => handleResourcePress(resource)}
            >
              <View style={[styles.iconContainer, { backgroundColor: resource.color }]}>
                <Ionicons name={resource.icon} size={20} color="#ffffff" />
              </View>
              <Text style={styles.resourceText}>{resource.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search help */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.searchContainer} onPress={handleSearch}>
            <Ionicons name="search" size={20} color="#5f6368" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search help"
              placeholderTextColor="#9aa0a6"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
          </TouchableOpacity>
        </View>

        {/* Need more help section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Need more help?</Text>
          
          {/* Help Community */}
          <TouchableOpacity style={styles.helpOption} onPress={handleHelpCommunity}>
            <View style={styles.helpOptionLeft}>
              <View style={styles.communityIcon}>
                <Ionicons name="people" size={20} color="#ffffff" />
              </View>
              <View style={styles.helpOptionText}>
                <Text style={styles.helpOptionTitle}>Post to the Help Community</Text>
                <Text style={styles.helpOptionSubtitle}>Get answers from community members</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Send Feedback */}
          <TouchableOpacity style={styles.helpOption} onPress={handleSendFeedback}>
            <View style={styles.helpOptionLeft}>
              <View style={styles.feedbackIcon}>
                <Ionicons name="chatbox-outline" size={20} color="#4285f4" />
              </View>
              <View style={styles.helpOptionText}>
                <Text style={styles.helpOptionTitle}>Send Feedback</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaed',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#202124',
    flex: 1,
  },
  menuButton: {
    padding: 8,
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
    color: '#5f6368',
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
    color: '#202124',
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
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
    color: '#202124',
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
    color: '#202124',
    fontWeight: '400',
  },
  helpOptionSubtitle: {
    fontSize: 14,
    color: '#5f6368',
    marginTop: 2,
  },
});