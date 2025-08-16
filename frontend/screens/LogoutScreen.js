import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../ThemeContext'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styleSheets/LogoutScreenStyles'; // Import styles from the stylesheet

export default function LogoutScreen() {
  const navigation = useNavigation();
  const { activeTheme } = useContext(ThemeContext);

  const isDark = activeTheme === 'dark';

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?<your auth token will be destroyed>',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try{
              await AsyncStorage.removeItem('authToken');
              console.log('User logged out');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
            }
            catch(err){
              console.error('Error logging out:', err);
            }
            
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

