import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity,
  TextInput, Alert, ScrollView, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';
import { ThemeContext } from '../ThemeContext';

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

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) return;

        const res = await fetch(API_BASE_URL + "/Auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        setUserInfo({
          name: data.username || 'User',
          email: data.email || 'email@example.com'
        });

        setEditedInfo({
          name: data.username || 'User',
          email: data.email || 'email@example.com'
        });
      } catch (err) {
        console.error("Error fetching user info:", err);
        alert("Couldn't fetch user info");
      }
    };
    fetchUserInfo();
  }, []);

  const handleSaveProfile = () => {
    setUserInfo({ ...editedInfo });
    setEditMode(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleCancelEdit = () => {
    setEditedInfo({ ...userInfo });
    setEditMode(false);
  };

  const handleChangePassword = () => {
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
  };



  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={activeTheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={themeColors.accent} />

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
                style={[styles.infoInput, {
                  backgroundColor: themeColors.input,
                  color: themeColors.text,
                  borderColor: themeColors.border,
                }]}
                value={editedInfo.email}
                onChangeText={(text) => setEditedInfo({ ...editedInfo, email: text })}
                placeholder="Enter your email"
                placeholderTextColor={themeColors.subtext}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text style={[styles.infoValue, {
                backgroundColor: themeColors.input,
                color: themeColors.text,
              }]}>{userInfo.email}</Text>
            )}
          </View>


          {editMode && (
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                <Text style={[styles.cancelButtonText, { color: themeColors.subtext }]}>Cancel</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  backButton: { padding: 4 },
  editButton: { padding: 4 },
  content: { flex: 1 },
  profileSection: {

    alignItems: 'center',
    padding: 24,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  profileImageLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  // onlineIndicatorLarge: {
  //   position: 'absolute',
  //   bottom: 2,
  //   right: '40%',
  //   width: 14,
  //   height: 14,
  //   borderRadius: 7,
  //   backgroundColor: '#22c55e',
  //   borderWidth: 2,
  //   borderColor: '#fff',
  // },
  profileName: { fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  profileEmail: { fontSize: 14, marginBottom: 8 },
  infoSection: {

    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  infoItem: { marginBottom: 16 },
  infoLabel: { fontSize: 14, marginBottom: 4 },
  infoInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  infoValue: {
    padding: 10,
    fontSize: 16,
    borderRadius: 8,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  cancelButton: { marginRight: 16 },
  cancelButtonText: { fontSize: 14 },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,

  },
  saveButtonText: { color: '#fff', fontWeight: 'bold' },
  securitySection: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  securityItem: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',
    marginTop: 12,
  },
  securityItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  securityItemText: { fontSize: 16, marginLeft: 8 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

  },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  modalBody: { marginTop: 16 },
  passwordField: { marginBottom: 16 },
  passwordLabel: { fontSize: 14, marginBottom: 4 },
  passwordInput: {
    
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalCancelButton: { marginRight: 16 },
  modalCancelText: { fontSize: 14 },
  modalSaveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalSaveText: { color: '#fff', fontWeight: 'bold' },
});
