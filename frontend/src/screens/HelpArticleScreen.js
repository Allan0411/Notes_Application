import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useTheme } from '@react-navigation/native';
import Markdown from 'react-native-markdown-display';

export default function HelpArticleScreen({ route }) {
  const navigation = useNavigation();
  const { title, content, isDark } = route.params;
  const { colors } = useTheme();

  // Define styles for Markdown components based on the theme
  const markdownStyles = useMemo(() => StyleSheet.create({
    body: {
      color: isDark ? '#e8eaed' : '#202124',
      fontSize: 16,
      lineHeight: 24,
    },
    heading1: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#202124',
      marginTop: 20,
      marginBottom: 10,
    },
    heading2: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#202124',
      marginTop: 18,
      marginBottom: 8,
    },
    heading3: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#202124',
      marginTop: 16,
      marginBottom: 6,
    },
    list_item: {
      fontSize: 16,
      color: isDark ? '#e8eaed' : '#202124',
    },
    bullet_list_icon: {
      color: isDark ? '#e8eaed' : '#202124',
      fontSize: 12,
    },
    bullet_list: {
      marginBottom: 10,
    },
    strong: {
      fontWeight: 'bold',
    },
    // You can add more styles for other markdown elements like `link`, `image`, `blockquote`, etc.
  }), [isDark]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#1a202c' : '#f8f9fa' }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#1e1e1e' : '#4a5568'}
      />
      <View style={[styles.header, { backgroundColor: '#4a5568', borderBottomColor: isDark ? '#333' : '#e8eaed' }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fafafaff' : '#f0f0f0ff'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#efededff' : '#d5d6dbff' }]}>
          {title}
        </Text>
        <View style={styles.menuButton} />
      </View>
      <ScrollView style={styles.content}>
        <Markdown style={markdownStyles}>
          {content}
        </Markdown>
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
    padding: 20,
  },
});