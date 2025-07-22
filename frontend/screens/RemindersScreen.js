import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../ThemeContext';

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    paddingTop:50,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  contentText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  addButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
