import React, { useContext } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider, ThemeContext } from './src/ThemeContext';
import { ReadAloudProvider } from './src/ReadAloudContext';
import { StatusBar } from 'react-native';

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
import HelpArticleScreen from './src/screens/HelpArticleScreen'; // Import the new screen

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <ReadAloudProvider>
        <Main />
      </ReadAloudProvider>
    </ThemeProvider>
  );
}

function Main() {
  const { currentTheme } = useContext(ThemeContext);
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
          <Stack.Screen name="HelpArticle" component={HelpArticleScreen} />
          <Stack.Screen name="LogoutScreen" component={LogoutScreen} />
          <Stack.Screen name="UserProfile" component={UserProfile} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}