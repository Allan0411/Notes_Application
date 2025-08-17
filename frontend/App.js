import React, { useContext, useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider, ThemeContext } from './src/ThemeContext';
import { StatusBar, ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from './src/screens/HomeScreen';
import NoteDetailScreen from './src/screens/NoteDetailScreen';
import DeletedNotesScreen from './src/screens/DeletedNotesScreen';
import RemindersScreen from './src/screens/RemindersScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import HelpFeedbackScreen from './src/screens/HelpFeedbackScreen';
import LogoutScreen from './src/screens/LogoutScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import UserProfile from './src/screens/UserProfile';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <Main />
    </ThemeProvider>
  );
}

// Helper: Simulate token validation (replace with real logic)
async function isTokenValid() {
  try {
    const token = await AsyncStorage.getItem('authToken');
    // For demo: token exists and is not expired (add real validation as needed)
    if (token) {
      // Optionally, check expiry here
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

function Main() {
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === 'dark';

  const [initialRoute, setInitialRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On mount, check token and set initial route accordingly
    (async () => {
      const valid = await isTokenValid();
      setInitialRoute(valid ? 'Home' : 'Login');
      setLoading(false);
    })();
  }, []);

  if (loading || !initialRoute) {
    // Show splash/loading while checking token
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#000' : '#fff' }}>
        <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="NoteDetail" component={NoteDetailScreen} />
          <Stack.Screen name="DeletedNotes" component={DeletedNotesScreen} />
          <Stack.Screen name="Reminders" component={RemindersScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="HelpFeedback" component={HelpFeedbackScreen} />
          <Stack.Screen name="LogoutScreen" component={LogoutScreen} />
          <Stack.Screen name="UserProfile" component={UserProfile} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}