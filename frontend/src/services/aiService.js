// src/services/aiService.js

//calls
//line 723 NoteDetailsScreen

import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper to get auth token
async function getAuthToken() {
  return await AsyncStorage.getItem('authToken');
}

// Makes an AI request for a given action type and note text
export async function requestAIAction(actionType, noteText) {
  const token = await getAuthToken();
  // Example endpoint: `${API_BASE_URL}/ai/summarize`
  const endpoint = `${API_BASE_URL}/${actionType}`;
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ text: noteText }),
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(text || `AI service error: ${response.status}`);
    }
    let result = null;
    try {
      result = JSON.parse(text);
    } catch {
      // Sometimes the API just returns plain text
      result = { aiResponse: text };
    }
    return result.aiResponse || result;
  } catch (err) {
    // Pass errors to the calling screen for user notification
    throw err;
  }
}

