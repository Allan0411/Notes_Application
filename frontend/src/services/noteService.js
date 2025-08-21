import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper to get token for all requests
async function getAuthToken() {
  return await AsyncStorage.getItem('authToken');
}

// GET all notes
export async function fetchNotes() {
  const token = await getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/notes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Fetch notes failed: ${res.status}`);
    const text = await res.text();
    return text ? JSON.parse(text) : [];
  } catch (err) {
    console.error('Error fetching notes:', err);
    throw err;
  }
}

// GET note by ID
export async function fetchNoteById(id) {
  const token = await getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/notes/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // Log status and response for debugging
    console.log(`fetchNoteById: status=${res.status}, noteId=${id}`);

    const text = await res.text();
    console.log('fetchNoteById response:', text);

    if (!res.ok) {
      // Throw detailed error including response body if available
      throw new Error(text || `Fetch note failed with status ${res.status}`);
    }

    return text ? JSON.parse(text) : null;
  } catch (err) {
    console.error(`Error fetching note by id (${id}):`, err);
    throw err;
  }
}



// POST (create) new note
export async function createNote(note) {
  const token = await getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(note)
    });
    const text = await res.text();
    if (!res.ok) throw new Error(text || 'Note creation failed');
    return text ? JSON.parse(text) : null;
  } catch (err) {
    console.error('Error creating note:', err);
    throw err;
  }
}

// PUT (update) note by ID
export async function updateNote(id, note) {
  const token = await getAuthToken();
  try {
    const res = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(note)
    });
    const text = await res.text();
    if (!res.ok) throw new Error(text || 'Failed to update note');
    return text ? JSON.parse(text) : true;
  } catch (err) {
    console.error('Error updating note:', err);
    throw err;
  }
}

// DELETE note by ID
export async function deleteNote(id) {
  const token = await AsyncStorage.getItem('authToken');
  try {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('delete status', response.status);
    return response.ok;
  } catch (err) {
    console.error("error while deleting: ", err);
    return false;
  }
}

// PATCH isPrivate for a note by ID
export async function updateNoteIsPrivate(id, isPrivate) {
    const token = await getAuthToken();
    try {
      const res = await fetch(`${API_BASE_URL}/notes/${id}/private`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(isPrivate) // just true or false, as per your backend
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || 'Failed to update isPrivate');
      // You can return the updated note, or just true on success
      return text ? JSON.parse(text) : true;
    } catch (err) {
      console.error('Error updating isPrivate:', err);
      throw err;
    }
  }
  
  // PATCH isArchived for a note by ID
  export async function updateNoteIsArchived(id, isArchived) {
    const token = await getAuthToken();
    try {
      const res = await fetch(`${API_BASE_URL}/notes/${id}/archive`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(isArchived) // just true or false
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || 'Failed to update isArchived');
      return text ? JSON.parse(text) : true;
    } catch (err) {
      console.error('Error updating isArchived:', err);
      throw err;
    }
  }



