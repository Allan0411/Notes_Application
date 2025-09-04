import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity,
  TextInput, Alert, ScrollView, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../ThemeContext';
import styles from '../styleSheets/UserProfileStyles'; // Import styles from the stylesheet
import { changeName,changePassword } from '../services/userService';

// Import a simple loading overlay (inline, since not in context)
function LoadingOverlay({ visible, message }) {
  if (!visible) return null;
  return (
    <View style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <View style={{
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 12,
        alignItems: 'center',
        minWidth: 180,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
      }}>
        <Text style={{ fontSize: 16, color: '#333' }}>{message || 'Loading...'}</Text>
      </View>
    </View>
  );
}

export default function UserProfile({ navigation }) {
  const { activeTheme } = useContext(ThemeContext);

  const colors = {
    light: {
      background: '#dde2e8ff',
      card: '#fff',
      text: '#2d3748',
      subtext: '#4a5568',
      border: '#e2e8f0',
      accent: '#4a5568',
      input: '#fff',
      overlay: 'rgba(0, 0, 0, 0.5)',
      disabled: '#a0aec0', // Changed to a more grayed out color
      disabledBackground: '#f7fafc', //
    },
    dark: {
      background: '#1a202c',
      card: '#2d3748',
      text: '#f8fafc',
      subtext: '#cbd5e0',
      border: '#4a5568',
      accent: '#899aaaff',
      input: '#4a5568',
      overlay: 'rgba(255, 255, 255, 0.1)',
      disabled: '#718096'
    },
  };

  const themeColors = colors[activeTheme] || colors.light;

  const [userInfo, setUserInfo] = useState({ name: '', email: '' });
  const [editMode, setEditMode] = useState(false);
  const [editedInfo, setEditedInfo] = useState({ ...userInfo });
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [changingPass,setChangingPass]=useState(false);

  // Use AsyncStorage to get username and email
  useEffect(() => {
    const getUserInfoFromStorage = async () => {
      try {
        setLoading(true);
        const username = await AsyncStorage.getItem('username');
        const email = await AsyncStorage.getItem('useremail');
        setUserInfo({
          name: username || 'User',
          email: email || 'email@example.com',
        });
        setEditedInfo({
          name: username || 'User',
          email: email || 'email@example.com',
        });
      } catch (err) {
        console.error("Error getting user info from storage:", err);
        alert("Couldn't get user info");
      } finally {
        setLoading(false);
      }
    };
    getUserInfoFromStorage();
  }, []);

  const handleSaveProfile = async () => {
    // Only allow changing the name, not the email
    try {
      const newName = editedInfo.name;
      if (!newName || newName.trim().length === 0) {
        Alert.alert('Error', 'Name cannot be empty');
        return;
      }
      setLoading(true);
      await changeName(newName);
      setUserInfo((prev) => ({ ...prev, name: newName }));
      setEditedInfo((prev) => ({ ...prev, name: newName }));
      await AsyncStorage.setItem('username', newName);
      setEditMode(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update name:', err);
      Alert.alert('Error', 'Failed to update name. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedInfo({ ...userInfo });
    setEditMode(false);
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      setChangingPass(true);
      await changePassword(currentPassword, newPassword);
      Alert.alert('Success', 'Password changed successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setPasswordModalVisible(false);
            setPasswordData({
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
            });
          },
        },
      ]);
    } catch (err) {
      console.error('Failed to change password:', err);
      Alert.alert('Error', 'Failed to change password. Please check your current password and try again.');
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={activeTheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={themeColors.accent} />

      {/* Loading overlay for changing name */}
      <LoadingOverlay visible={loading} message="Changing Name..." />

      <LoadingOverlay visible={changingPass} message="Changing Password...."/>
      <View style={[styles.header, { backgroundColor: themeColors.accent }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          onPress={editMode ? handleSaveProfile : () => setEditMode(true)}
          style={styles.editButton}
        >
          <Ionicons name={editMode ? "checkmark" : "create"} size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.profileSection, { backgroundColor: themeColors.card }]}>
          <View style={[styles.profileImageLarge, { backgroundColor: themeColors.accent }]}>
            <Ionicons name="person" size={40} color="#fff" />
          </View>
          {/* <View style={styles.onlineIndicatorLarge} /> */}
          <Text style={[styles.profileName, { color: themeColors.text }]}>{userInfo.name}</Text>
          <Text style={[styles.profileEmail, { color: themeColors.subtext }]}>{userInfo.email}</Text>
        </View>

        <View style={[styles.infoSection, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Personal Information</Text>

          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: themeColors.subtext }]}>Full Name</Text>
            {editMode ? (
              <TextInput
                style={[styles.infoInput, {
                  backgroundColor: themeColors.input,
                  color: themeColors.text,
                  borderColor: themeColors.border,
                }]}
                value={editedInfo.name}
                onChangeText={(text) => setEditedInfo({ ...editedInfo, name: text })}
                placeholder="Enter your full name"
                placeholderTextColor={themeColors.subtext}
                editable={true}
              />
            ) : (
              <Text style={[styles.infoValue, {
                backgroundColor: themeColors.input,
                color: themeColors.text,
              }]}>{userInfo.name}</Text>
            )}
          </View>

          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: themeColors.subtext }]}>Email Address</Text>
            {editMode ? (
              <TextInput
                style={[
                  styles.infoInput,
                  {
                    backgroundColor: '#f0f1f4', // light grey hex
                    color: themeColors.disabled,
                    borderColor: themeColors.border,
                  }
                ]}
                value={editedInfo.email}
                placeholder="Enter your email"
                placeholderTextColor={themeColors.subtext}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={false}
              />
            ) : (
              <Text style={[
                styles.infoValue,
                {
                  backgroundColor: themeColors.input,
                  color: themeColors.disabled,
                }
              ]}>{userInfo.email}</Text>
            )}
          </View>

          {editMode && (
            <View style={styles.editActions}>
              <TouchableOpacity style={[styles.cancelButton, { backgroundColor: themeColors.accent }]} onPress={handleCancelEdit}>
                <Text style={[styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.saveButton, { backgroundColor: themeColors.accent }]} onPress={handleSaveProfile}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={[styles.securitySection, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Security</Text>
          <TouchableOpacity
            style={styles.securityItem}
            onPress={() => setPasswordModalVisible(true)}
          >
            <View style={styles.securityItemLeft}>
              <Ionicons name="lock-closed" size={20} color={themeColors.subtext} />
              <Text style={[styles.securityItemText, { color: themeColors.text }]}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={themeColors.border} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Password Modal */}
      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: themeColors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>Change Password</Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                <Ionicons name="close" size={24} color={themeColors.subtext} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {['Current Password', 'New Password', 'Confirm New Password'].map((label, index) => {
                const key = ['currentPassword', 'newPassword', 'confirmPassword'][index];
                return (
                  <View style={styles.passwordField} key={key}>
                    <Text style={[styles.passwordLabel, { color: themeColors.subtext }]}>{label}</Text>
                    <TextInput
                      style={[styles.passwordInput, {
                        backgroundColor: themeColors.input,
                        color: themeColors.text,
                        borderColor: themeColors.border,
                      }]}
                      value={passwordData[key]}
                      onChangeText={(text) => setPasswordData({ ...passwordData, [key]: text })}
                      placeholder={`Enter ${label.toLowerCase()}`}
                      placeholderTextColor={themeColors.subtext}
                      secureTextEntry
                    />
                  </View>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setPasswordModalVisible(false)}>
                <Text style={[styles.modalCancelText, { color: themeColors.subtext }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.modalSaveButton, { backgroundColor: themeColors.accent }]} onPress={handleChangePassword}>
                <Text style={styles.modalSaveText}>Change Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    
    </SafeAreaView>
  );
}
