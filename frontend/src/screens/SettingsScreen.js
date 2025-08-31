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
import { ReadAloudContext } from '../ReadAloudContext'; 
import { SettingsContext } from '../SettingsContext'; // Import the new context here
import styles from '../styleSheets/SettingsScreenStyles';

const SettingsScreen = () => {
  const navigation = useNavigation();

  // Get the state and toggle function from the SettingsContext
  const { sharingEnabled, toggleSharing } = useContext(SettingsContext);
  
  // Get voiceSpeed and setVoiceSpeed from the context
  const { voiceSpeed, setVoiceSpeed } = useContext(ReadAloudContext); 
  const { themeMode, setThemeMode, activeTheme } = useContext(ThemeContext);
  const isDark = activeTheme === 'dark';

  const themeOptions = ['System', 'Light', 'Dark'];
  const backgroundColor = isDark ? '#1a202c' : '#f8f9fa';
  const textColor = isDark ? '#ffffff' : '#000000';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={{ backgroundColor: activeTheme === 'dark' ? '#2d384bff' : '#4a5568', paddingLeft: 10 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
            <Ionicons name="arrow-back" size={24} color={'#FFFFFF'} />
          </TouchableOpacity>
          <Text style={[styles.headerText, { color: '#FFFFFF' }]}>Settings</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Voice</Text>
        <View style={styles.optionRow}>
          <Text style={[styles.optionText, { color: textColor }]}>Voice Speed</Text>
          <View style={localStyles.speedControl}>
            <TouchableOpacity onPress={() => setVoiceSpeed(prev => Math.max(0.5, prev - 0.1))}>
              <Text style={[localStyles.speedButton, { color: textColor }]}>-</Text>
            </TouchableOpacity>
            <Text style={[localStyles.speedValue, { color: textColor }]}>{voiceSpeed.toFixed(1)}x</Text>
            <TouchableOpacity onPress={() => setVoiceSpeed(prev => Math.min(2.0, prev + 0.1))}>
              <Text style={[localStyles.speedButton, { color: textColor }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

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

        <Text style={[styles.sectionTitle, { color: textColor }]}>Sharing</Text>
        <View style={styles.optionRow}>
          <Text style={[styles.optionText, { color: textColor }]}>Enable sharing</Text>
          {/* This switch now controls the global state */}
          <Switch value={sharingEnabled} onValueChange={toggleSharing} />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const localStyles = StyleSheet.create({
  speedControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 100,
  },
  speedButton: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  speedValue: {
    fontSize: 16,
  },
});