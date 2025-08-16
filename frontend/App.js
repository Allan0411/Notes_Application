import React, { useContext } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider, ThemeContext } from './ThemeContext';
import { StatusBar } from 'react-native';

import HomeScreen from './screens/HomeScreen';
import NoteDetailScreen from './screens/NoteDetailScreen';
import DeletedNotesScreen from './screens/DeletedNotesScreen';
import RemindersScreen from './screens/RemindersScreen';
import SettingsScreen from './screens/SettingsScreen';
import HelpFeedbackScreen from './screens/HelpFeedbackScreen';
import LogoutScreen from './screens/LogoutScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import UserProfile from './screens/UserProfile';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <Main />
    </ThemeProvider>
  );
}

function Main() {
 const { currentTheme } = useContext(ThemeContext);// ✅ useContext is better than Consumer
const isDark = currentTheme === 'dark';


  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
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