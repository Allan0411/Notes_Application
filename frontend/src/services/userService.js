import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper to get token
async function getAuthToken() {
  return await AsyncStorage.getItem('authToken');
}

// GET user info
export async function fetchUserInfo() {
  const token = await getAuthToken();
  if (!token) throw new Error("No auth token found");
  try {
    const res = await fetch(`${API_BASE_URL}/Auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Fetch user info failed: ${res.status}`);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch (err) {
    console.error('Error fetching user info:', err);
    throw err;
  }
}


export async function getUserById(userId) {
  const token = await getAuthToken();
  if (!token) throw new Error("No auth token found");
  try {
    const res = await fetch(`${API_BASE_URL}/Users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Fetch user by ID failed: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error('Error fetching user by ID:', err);
    throw err;
  }
}

export async function getUserByEmail(email) {
  const token = await getAuthToken();
  if (!token) throw new Error("No auth token found");
  try {
    const res = await fetch(`${API_BASE_URL}/Users/byEmail/${encodeURIComponent(email)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Fetch user by email failed: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error('Error fetching user by email:', err);
    throw err;
  }
}
