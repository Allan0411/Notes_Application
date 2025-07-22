import React, { useState,useEffect, use } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity,
  TextInput, Alert, ScrollView, Modal,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';
export default function UserProfile({ navigation }) {
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
  });

  const [editMode, setEditMode] = useState(false);
  const [editedInfo, setEditedInfo] = useState({ ...userInfo });
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchUserInfo=async()=>{
      try{
        const token=await AsyncStorage.getItem('authToken');
        if (!token)
          return;
        const res=await fetch(API_BASE_URL+"/Auth/me",{
          headers:{
            Authorization:`Bearer ${token}`,
          },

          });

          if(!res.ok)
            throw new Error ("failed to fetch")

          const data=await res.json();
          setUserInfo({
            name: data.username||'user',
            email:data.email ||'email'
          })

          setEditedInfo({
            name: data.username||'user',
            email:data.email ||'email'
          })
      }
      catch(err){
        console.error("Error fetching user info:", err);
        alert("couldnt fetch user info");
      }
    };
    fetchUserInfo();

  },[]);
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
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    // Here you would typically make an API call to change the password
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

  const formatJoinDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4a5568" />

      {/* Header */}
      <View style={styles.header}>
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
        {/* Profile Picture Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageLarge}>
            <Ionicons name="person" size={40} color="#fff" />
          </View>
          <View style={styles.onlineIndicatorLarge} />
          <Text style={styles.profileName}>{userInfo.name}</Text>
          <Text style={styles.profileEmail}>{userInfo.email}</Text>
        </View>

        {/* Profile Information */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          {/* Name Field */}
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Full Name</Text>
            {editMode ? (
              <TextInput
                style={styles.infoInput}
                value={editedInfo.name}
                onChangeText={(text) => setEditedInfo({ ...editedInfo, name: text })}
                placeholder="Enter your full name"
              />
            ) : (
              <Text style={styles.infoValue}>{userInfo.name}</Text>
            )}
          </View>

          {/* Email Field */}
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email Address</Text>
            {editMode ? (
              <TextInput
                style={styles.infoInput}
                value={editedInfo.email}
                onChangeText={(text) => setEditedInfo({ ...editedInfo, email: text })}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text style={styles.infoValue}>{userInfo.email}</Text>
            )}
          </View>

            {/* Edit Personal information */}
          {editMode && (
            <View style={styles.editActions}>
              <TouchableOpacity onPress={handleCancelEdit} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveProfile} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Security Section */}
        <View style={styles.securitySection}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          <TouchableOpacity
            style={styles.securityItem}
            onPress={() => setPasswordModalVisible(true)}
          >
            <View style={styles.securityItemLeft}>
              <Ionicons name="lock-closed" size={20} color="#4a5568" />
              <Text style={styles.securityItemText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e0" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={passwordModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity
                onPress={() => setPasswordModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#718096" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.passwordField}>
                <Text style={styles.passwordLabel}>Current Password</Text>
                <TextInput
                  style={styles.passwordInput}
                  value={passwordData.currentPassword}
                  onChangeText={(text) =>
                    setPasswordData({ ...passwordData, currentPassword: text })
                  }
                  placeholder="Enter current password"
                  secureTextEntry={true}
                />
              </View>

              <View style={styles.passwordField}>
                <Text style={styles.passwordLabel}>New Password</Text>
                <TextInput
                  style={styles.passwordInput}
                  value={passwordData.newPassword}
                  onChangeText={(text) =>
                    setPasswordData({ ...passwordData, newPassword: text })
                  }
                  placeholder="Enter new password"
                  secureTextEntry={true}
                />
              </View>

              <View style={styles.passwordField}>
                <Text style={styles.passwordLabel}>Confirm New Password</Text>
                <TextInput
                  style={styles.passwordInput}
                  value={passwordData.confirmPassword}
                  onChangeText={(text) =>
                    setPasswordData({ ...passwordData, confirmPassword: text })
                  }
                  placeholder="Confirm new password"
                  secureTextEntry={true}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setPasswordModalVisible(false)}
                style={styles.modalCancelButton}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleChangePassword}
                style={styles.modalSaveButton}
              >
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
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#4a5568',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 20,
  },
  profileImageLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4a5568',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  onlineIndicatorLarge: {
    position: 'absolute',
    top: 76,
    left: '50%',
    marginLeft: 20,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#38a169',
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#718096',
  },
  infoSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
  },
  infoItem: {
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 16,
    color: '#2d3748',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  infoInput: {
    fontSize: 16,
    color: '#2d3748',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a5568',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4a5568',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  securitySection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  securityItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityItemText: {
    fontSize: 16,
    color: '#2d3748',
    marginLeft: 12,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  passwordField: {
    marginBottom: 16,
  },
  passwordLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 8,
  },
  passwordInput: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a5568',
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: '#4a5568',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});