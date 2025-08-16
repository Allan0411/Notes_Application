import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../ThemeContext';
import styles from '../styleSheets/RemindersScreenStyles'; // Import styles from the stylesheet

export default function RemindersScreen({ navigation }) {
  const { activeTheme } = useContext(ThemeContext);
  const isDark = activeTheme === 'dark';

  const backgroundColor = isDark ? '#1a202c' : '#edf2f7';
  const headerBackground = isDark ? '#2d3748' : '#ffffff';
  const borderColor = isDark ? '#4a5568' : '#e2e8f0';
  const iconColor = isDark ? '#f7fafc' : '#4a5568';
  const titleColor = isDark ? '#f7fafc' : '#2d3748';
  const textColor = isDark ? '#e2e8f0' : '#4a5568';
  const buttonColor = isDark ? '#4fd1c5' : '#3182ce';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={backgroundColor} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerBackground, borderBottomColor: borderColor }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: titleColor }]}>Reminders</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.contentText, { color: textColor }]}>⏰ No reminders set yet.</Text>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: buttonColor }]}>
          <Text style={styles.addButtonText}>+ Add Reminder</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


