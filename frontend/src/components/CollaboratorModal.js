// components/CollaboratorModal.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, Modal, TouchableOpacity, TextInput,
  Alert, FlatList, ActivityIndicator, ScrollView,
  SafeAreaView, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collaboratorService } from '../services/collaboratorService';

export default function CollaboratorModal ({
  visible,
  onClose,
  noteId,
  theme,
  themedStyles,
  styles
}) {
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Editor');
  const [inviting, setInviting] = useState(false);

  const roles = ['Viewer', 'Editor', 'Admin'];

  useEffect(() => {
    if (visible && noteId) {
      fetchCollaborators();
    }
  }, [visible, noteId]);

  const fetchCollaborators = async () => {
    setLoading(true);
    try {
      const data = await collaboratorService.getNoteCollaborators(noteId);
      setCollaborators(data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load collaborators: ' + error.message);
      setCollaborators([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setInviting(true);
    try {
      await collaboratorService.inviteCollaborator(noteId, inviteEmail, inviteRole);
      Alert.alert('Success', 'Invitation sent successfully!');
      setInviteEmail('');
      fetchCollaborators(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveCollaborator = (collaborator) => {
    Alert.alert(
      'Remove Collaborator',
      `Are you sure you want to remove ${collaborator.user?.username || collaborator.user?.email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await collaboratorService.removeCollaborator(noteId, collaborator.id);
              Alert.alert('Success', 'Collaborator removed successfully');
              fetchCollaborators();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove collaborator: ' + error.message);
            }
          }
        }
      ]
    );
  };

  const handleRoleChange = (collaborator, newRole) => {
    Alert.alert(
      'Change Role',
      `Change ${collaborator.user?.username || collaborator.user?.email}'s role to ${newRole}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change',
          onPress: async () => {
            try {
              await collaboratorService.updateCollaboratorRole(noteId, collaborator.id, newRole);
              Alert.alert('Success', 'Role updated successfully');
              fetchCollaborators();
            } catch (error) {
              Alert.alert('Error', 'Failed to update role: ' + error.message);
            }
          }
        }
      ]
    );
  };

  const renderCollaborator = ({ item }) => (
    <View style={[styles.collaboratorItem, { borderBottomColor: theme.border }]}>
      <View style={styles.collaboratorInfo}>
        <Text style={[styles.collaboratorName, { color: theme.text }]}>
          {item.user?.username || item.user?.email || 'Unknown User'}
        </Text>
        {item.user?.email && (
          <Text style={[styles.collaboratorEmail, { color: theme.textSecondary }]}>
            {item.user.email}
          </Text>
        )}
        <TouchableOpacity
          style={[styles.roleTag, { backgroundColor: theme.accent + '20' }]}
          onPress={() => {
            // Show role change options
            Alert.alert(
              'Change Role',
              'Select new role:',
              roles.map(role => ({
                text: role,
                onPress: () => role !== item.role && handleRoleChange(item, role)
              })).concat([{ text: 'Cancel', style: 'cancel' }])
            );
          }}
        >
          <Text style={[styles.roleText, { color: theme.accent }]}>
            {item.role} ▼
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={() => handleRemoveCollaborator(item)}
        style={styles.removeButton}
      >
        <Ionicons name="trash-outline" size={20} color={theme.error || '#ef4444'} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[styles.collaboratorModalContainer, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={theme.statusBar} backgroundColor={theme.background} />
        
        {/* Header */}
        <View style={[styles.collaboratorModalHeader, { borderBottomColor: theme.border }]}>
          <Text style={[styles.collaboratorModalTitle, { color: theme.text }]}>
            Manage Collaborators
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.collaboratorModalContent}>
          {/* Invite Section */}
          <View style={styles.inviteSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Invite New Collaborator
            </Text>
            
            <TextInput
              style={[
                styles.emailInput,
                {
                  backgroundColor: theme.inputBackground || theme.background,
                  borderColor: theme.border,
                  color: theme.text
                }
              ]}
              placeholder="Enter email address"
              value={inviteEmail}
              onChangeText={setInviteEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={theme.placeholder}
            />

            {/* Role Selection */}
            <View style={styles.roleSelection}>
              <Text style={[styles.roleLabel, { color: theme.text }]}>Role:</Text>
              <View style={styles.roleButtons}>
                {roles.map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleButton,
                      { 
                        backgroundColor: inviteRole === role ? theme.accent : 'transparent',
                        borderColor: theme.border 
                      }
                    ]}
                    onPress={() => setInviteRole(role)}
                  >
                    <Text style={[
                      styles.roleButtonText,
                      { 
                        color: inviteRole === role ? '#fff' : theme.text 
                      }
                    ]}>
                      {role}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.inviteButton,
                { 
                  backgroundColor: theme.accent,
                  opacity: inviting ? 0.7 : 1
                }
              ]}
              onPress={handleInvite}
              disabled={inviting}
            >
              {inviting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="person-add-outline" size={20} color="#fff" />
                  <Text style={styles.inviteButtonText}>Send Invitation</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Current Collaborators */}
          <View style={styles.collaboratorsSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Current Collaborators ({collaborators.length})
            </Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.accent} />
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                  Loading collaborators...
                </Text>
              </View>
            ) : collaborators.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={48} color={theme.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No collaborators yet
                </Text>
                <Text style={[styles.emptySubText, { color: theme.textMuted }]}>
                  Invite people to collaborate on this note
                </Text>
              </View>
            ) : (
              <FlatList
                data={collaborators}
                renderItem={renderCollaborator}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

//export default CollaboratorModal;