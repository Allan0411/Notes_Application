import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import NoteDetailScreen from './screens/NoteDetailScreen';
import DeletedNotesScreen from './screens/DeletedNotesScreen';
import RemindersScreen from './screens/RemindersScreen';
import SettingsScreen from './screens/SettingsScreen';
import HelpFeedbackScreen from './screens/HelpFeedbackScreen';
import LogoutScreen from './screens/LogoutScreen'; 

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="NoteDetail" component={NoteDetailScreen} />
        <Stack.Screen name="DeletedNotes" component={DeletedNotesScreen} />
        <Stack.Screen name="Reminders" component={RemindersScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="HelpFeedback" component={HelpFeedbackScreen} options={{ title: 'Help & Feedback' }} />
        <Stack.Screen name="LogoutScreen" component={LogoutScreen} options={{ title: 'Logout' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
