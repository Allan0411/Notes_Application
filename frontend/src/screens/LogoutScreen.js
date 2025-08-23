import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // <-- Import LinearGradient
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
      'Are you sure you want to log out?',
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
    <LinearGradient
      colors={['#adbfd8ff', '#384150ff']} // A nice blend of a light color and a darker one
      style={localStyles.gradientContainer}
      start={{ x: 0, y: 0 }} // Starts at the top
      end={{ x: 0, y: 1 }} // Ends at the bottom
    >
      <SafeAreaView style={themedStyles.container}>
        <StatusBar barStyle='light-content' backgroundColor='transparent' translucent />
        
        <View style={themedStyles.header}>
          <View style={themedStyles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={isDark ? '#e2e8f0' : '#f1f2f4ff'} />
            </TouchableOpacity>
            <Text style={themedStyles.headerTitle}>Logout</Text>
          </View>
        </View>

        <View style={themedStyles.content}>
          <Text style={themedStyles.title}>🚪 Logout</Text>
          <Text style={themedStyles.message}>You are currently signed in.</Text>
          
          <TouchableOpacity style={localStyles.logoutButton} onPress={handleLogout}>
            <View style={localStyles.buttonContent}>
              <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
              <Text style={localStyles.buttonText}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const localStyles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  logoutButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    backgroundColor: '#f31010f0', // A vibrant  to match the gradient feel
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    textTransform: 'uppercase', // To match the image
  },
});