// Attachment service for frontend API calls

import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper to get auth token
async function getAuthToken() {
  return await AsyncStorage.getItem('authToken');
}

/**
 * Get all attachments for a note
 * @param {number} noteId
 * @returns {Promise<Array>} attachments array
 */
export async function getAttachments(noteId) {
  const token = await getAuthToken();
  const endpoint = `${API_BASE_URL}/notes/${noteId}/attachments`;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(await response.text() || 'Failed to fetch attachments');
  }
  return await response.json();
}

/**
 * Add an attachment to a note
 * @param {number} noteId
 * @param {Object} attachmentData - { attachmentType, storagePath }
 * @returns {Promise<Object>} created attachment
 */
export async function addAttachment(noteId, attachmentData) {
  const token = await getAuthToken();
  const endpoint = `${API_BASE_URL}/notes/${noteId}/attachments`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(attachmentData),
  });
  if (!response.ok) {
    throw new Error(await response.text() || 'Failed to add attachment');
  }
  return await response.json();
}

/**
 * Delete an attachment from a note
 * @param {number} noteId
 * @param {number} attachmentId
 * @returns {Promise<void>}
 */
export async function deleteAttachment(noteId, attachmentId) {
  const token = await getAuthToken();
  const endpoint = `${API_BASE_URL}/notes/${noteId}/attachments/${attachmentId}`;
  const response = await fetch(endpoint, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(await response.text() || 'Failed to delete attachment');
  }
}
