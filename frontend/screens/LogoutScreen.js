import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../ThemeContext'; // Make sure this is correct path

export default function LogoutScreen() {
  const navigation = useNavigation();
  const { activeTheme } = useContext(ThemeContext);

  const isDark = activeTheme === 'dark';

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {

            console.log('User logged out');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  const themedStyles = styles(isDark);

  return (
    <SafeAreaView style={themedStyles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#1a202c' : '#edf2f7'} />
      
      <View style={themedStyles.header}>
        <View style={themedStyles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#e2e8f0' : '#4a5568'} />
          </TouchableOpacity>
          <Text style={themedStyles.headerTitle}>Logout</Text>
        </View>
      </View>

      <View style={themedStyles.content}>
        <Text style={themedStyles.title}>🚪 Logout</Text>
        <Text style={themedStyles.message}>You are currently signed in.</Text>
        
        <TouchableOpacity style={themedStyles.logoutButton} onPress={handleLogout}>
          <Text style={themedStyles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = (isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1a202c' : '#edf2f7',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 20,
      backgroundColor: isDark ? '#2d3748' : '#fff',
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
      color: isDark ? '#edf2f7' : '#2d3748',
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
      color: isDark ? '#edf2f7' : '#2d3748',
    },
    message: {
      fontSize: 16,
      color: isDark ? '#cbd5e0' : '#718096',
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
