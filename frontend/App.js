import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import NoteDetailScreen from './screens/NoteDetailScreen';
import DeletedNotesScreen from './screens/DeletedNotesScreen';
import RemindersScreen from './screens/RemindersScreen';
import SettingsScreen from './screens/SettingsScreen';
import HelpFeedbackScreen from './screens/HelpFeedbackScreen';
<<<<<<< HEAD
import LogoutScreen from './screens/LogoutScreen'; 
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
=======
import LogoutScreen from './screens/LogoutScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
>>>>>>> 7d907b1 (Updated login and signup screens with modern UI)

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="NoteDetail" component={NoteDetailScreen} />
        <Stack.Screen name="DeletedNotes" component={DeletedNotesScreen} />
        <Stack.Screen name="Reminders" component={RemindersScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
<<<<<<< HEAD
        <Stack.Screen name="HelpFeedback" component={HelpFeedbackScreen} options={{ title: 'Help & Feedback' }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
        <Stack.Screen name="LogoutScreen" component={LogoutScreen} options={{ title: 'Logout' }} />
        <Stack.Screen name="Register" component={RegisterScreen} />
=======
        <Stack.Screen name="HelpFeedback" component={HelpFeedbackScreen} />
        <Stack.Screen name="LogoutScreen" component={LogoutScreen} />
>>>>>>> 7d907b1 (Updated login and signup screens with modern UI)
      </Stack.Navigator>
    </NavigationContainer>
  );
}
