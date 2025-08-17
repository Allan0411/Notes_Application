import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../ThemeContext';
import styles from '../styleSheets/SettingsScreenStyles'; // Import styles from the stylesheet

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [addToBottom, setAddToBottom] = useState(true);
  const [tickToBottom, setTickToBottom] = useState(true);
  const [linkPreview, setLinkPreview] = useState(true);
  const [enableSharing, setEnableSharing] = useState(true);

  const { themeMode, setThemeMode, activeTheme } = useContext(ThemeContext);
  const isDark = activeTheme === 'dark';

  const themeOptions = ['System', 'Light', 'Dark'];

  const backgroundColor = isDark ? '#1a202c' : '#f8f9fa';
  const textColor = isDark ? '#ffffff' : '#000000';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerText, { color: textColor }]}>Settings</Text>
        </View>

        {/* Display Options */}
        <Text style={[styles.sectionTitle, { color: textColor }]}>Display options</Text>
        <View style={styles.optionRow}>
          <Text style={[styles.optionText, { color: textColor }]}>Add new items to bottom</Text>
          <Switch value={addToBottom} onValueChange={setAddToBottom} />
        </View>
        <View style={styles.optionRow}>
          <Text style={[styles.optionText, { color: textColor }]}>Move ticked items to bottom</Text>
          <Switch value={tickToBottom} onValueChange={setTickToBottom} />
        </View>
        <View style={styles.optionRow}>
          <Text style={[styles.optionText, { color: textColor }]}>Display rich link previews</Text>
          <Switch value={linkPreview} onValueChange={setLinkPreview} />
        </View>

        {/* Theme */}
        <Text style={[styles.sectionTitle, { color: textColor }]}>Theme</Text>
        {themeOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={styles.optionRow}
            onPress={() => setThemeMode(option.toLowerCase())}
          >
            <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
            {themeMode === option.toLowerCase() && (
              <Ionicons name="checkmark" size={20} color="#2196F3" />
            )}
          </TouchableOpacity>
        ))}

        {/* Sharing */}
        <Text style={[styles.sectionTitle, { color: textColor }]}>Sharing</Text>
        <View style={styles.optionRow}>
          <Text style={[styles.optionText, { color: textColor }]}>Enable sharing</Text>
          <Switch value={enableSharing} onValueChange={setEnableSharing} />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;


