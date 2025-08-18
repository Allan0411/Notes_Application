// services/collaboratorService.js
import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const collaboratorService = {
  async getNoteCollaborators(noteId) {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/api/collaborators/note/${noteId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch collaborators: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching note collaborators:', error);
      throw error;
    }
  },

  async inviteCollaborator(noteId, email, role = 'Editor') {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/api/collaborators/note/${noteId}/invite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || `Failed to invite collaborator: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error inviting collaborator:', error);
      throw error;
    }
  },

  async removeCollaborator(noteId, collaboratorId) {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/api/collaborators/note/${noteId}/collaborator/${collaboratorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to remove collaborator: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error removing collaborator:', error);
      throw error;
    }
  },

  async updateCollaboratorRole(noteId, collaboratorId, newRole) {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/api/collaborators/note/${noteId}/collaborator/${collaboratorId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update collaborator role: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating collaborator role:', error);
      throw error;
    }
  }
};