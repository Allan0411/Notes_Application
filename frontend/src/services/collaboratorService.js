import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import  {fetchUserInfo} from './userService';
async function getAuthToken() {
  return await AsyncStorage.getItem('authToken');
}



export const collaboratorService = {
  async getNoteCollaborators(noteId) {
    try {
      console.log('Fetching collaborators for note:', noteId);
      const token = await AsyncStorage.getItem('authToken');
      console.log('Using token:', token);
      const response = await fetch(`${API_BASE_URL}/NotesUser/${noteId}/collaborators`, {
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

  async addCollaborator(noteId, userId, role = 'editor') {
    // Your backend expects UserId in request body (not email), so use userId instead
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/NotesUser/${noteId}/collaborators`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role }),
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

  async removeCollaborator(noteId, collaboratorUserId) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/NotesUser/${noteId}/collaborators/${collaboratorUserId}`, {
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

  async updateCollaboratorRole(noteId, collaboratorUserId, newRole) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/notes/${noteId}/collaborators/${collaboratorUserId}/role`, {
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
,
  async fetchCollaboratedNotes() {
    try {
      // Fetch all notes first
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE_URL}/notes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Fetch notes failed: ${res.status}`);
      const allNotes = await res.json();

      const data = await fetchUserInfo();
      const currentUserId = data.id;
      // For each note, fetch its collaborators in parallel
      const collaboratorLists = await Promise.all(
        allNotes.map(note => this.getNoteCollaborators(note.id))
      );

      // Filter notes where current user is a collaborator but NOT the owner
      const collaboratedNotes = allNotes.filter((note, idx) => {
        if (note.creatorUserId === currentUserId) return false;
        const collaborators = collaboratorLists[idx] || [];
        return collaborators.some(col => col.userId === currentUserId);
      });

      return collaboratedNotes;
    } catch (error) {
      console.error("Error fetching collaborated notes:", error);
      throw error;
    }
  }
  
};

//invites
export const collaborationInviteService = {
  async sendInvite(noteId, invitedUserId, role = 'editor') {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/CollaborationInvites`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ noteId, invitedUserId, role }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || `Failed to send invite: ${response.status}`);
    }
    return await response.json();
  },

  async getPendingInvites() {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/CollaborationInvites/pending`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log('invites: ',response );
    if (!response.ok) {
      throw new Error(`Failed to fetch pending invites: ${response.status}`);
    }
    return await response.json();
  },

  async respondToInvite(inviteId, accept) {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/CollaborationInvites/${inviteId}/respond`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accept),
    });

    if (!response.ok) {
      throw new Error(`Failed to respond to invite: ${response.status}`);
    }
    return await response.json();
  }
};
