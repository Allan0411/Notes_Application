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
      // Change this to transparent
      backgroundColor: 'transparent',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 20,
      paddingTop: 40,
      backgroundColor: isDark ? '#2d3748' : '#4a5568',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#4a5568' : '#e2e8f0',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: isDark ? '#edf2f7' : '#ecececff',
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
      color: isDark ? '#cbd5e0' : '#000000ff',
      marginTop: 10,
      marginBottom: 30,
    },
    logoutButton: {
      backgroundColor: '#e53e3e',
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
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

export default styles;