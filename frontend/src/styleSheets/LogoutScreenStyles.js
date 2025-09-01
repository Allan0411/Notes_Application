// ThemedScreenStyleSheet.js

import { StyleSheet } from 'react-native';

/**
 * Returns a StyleSheet object themed for dark/light mode.
 * @param {boolean} isDark - true for dark mode, false for light mode
 */
const styles = (isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1a202c' : '#f7fafc',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 20,
      paddingTop: 40,
      backgroundColor: isDark ? '#2d3748' : '#475568ff',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#4a5568' : '#cbd5e0',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: isDark ? '#edf2f7' : '#f2f4f8ff',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? '#edf2f7' : '#030303ff',
    },
    message: {
      fontSize: 16,
      color: isDark ? '#cbd5e0' : '#4a5568',
      marginTop: 10,
      marginBottom: 30,
    },
    logoutButton: {
      // Use dynamic color for the button background
      backgroundColor: isDark ? '#c53030' : '#e53e3e',
      paddingHorizontal: 32,
      paddingVertical: 12,
      borderRadius: 8,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    buttonText: {
      // Use dynamic color for the button text
      color: isDark ? '#f7fafc' : '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

export default styles;