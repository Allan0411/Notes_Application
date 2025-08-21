import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getUserById } from '../services/userService';
import { fetchNoteById } from '../services/noteService';

export default function PendingInvitesModal({ visible, onClose, invites, onAccept, onDecline }) {
  const [inviteDetails, setInviteDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (visible && invites.length > 0) {
      loadInviteDetails();
    } else {
      setInviteDetails([]);
    }
  }, [visible, invites]);

  const loadInviteDetails = async () => {
    setLoadingDetails(true);

    // Fetch inviter name and note title for each invite
    const detailedInvites = await Promise.all(
      invites.map(async (invite) => {
        let inviterName = `User ${invite.inviterUserId}`;
        let noteTitle = 'Unknown Note';

        try {
          const user = await getUserById(invite.inviterUserId);
          if (user?.username) inviterName = user.username;
        } catch (e) {
          console.warn(`Failed to fetch user ${invite.inviterUserId}:`, e);
        }

        try {
          const note = await fetchNoteById(invite.noteId);
          if (note?.title) noteTitle = note.title;
        } catch (e) {
          console.warn(`Failed to fetch note ${invite.noteId}:`, e);
        }

        return {
          ...invite,
          inviterName,
          noteTitle,
        };
      })
    );

    setInviteDetails(detailedInvites);
    setLoadingDetails(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.inviteItem}>
      <Text style={styles.inviteText}>
        user: <Text style={styles.inviterName}>{item.inviterName}</Text> wants to invite you to note: <Text style={styles.noteTitle}>{item.noteTitle}</Text> as the role: <Text style={styles.role}>{item.role}</Text>
      </Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onAccept(item.inviteId)} style={[styles.actionBtn, styles.acceptBtn]}>
          <Text style={styles.actionBtnText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDecline(item.inviteId)} style={[styles.actionBtn, styles.declineBtn]}>
          <Text style={styles.actionBtnText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Pending Collaboration Invites</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} />
            </TouchableOpacity>
          </View>
          {loadingDetails ? (
            <ActivityIndicator size="large" />
          ) : inviteDetails.length === 0 ? (
            <Text style={styles.emptyText}>No pending invites.</Text>
          ) : (
            <FlatList
              data={inviteDetails}
              keyExtractor={(item) => item.inviteId.toString()}
              renderItem={renderItem}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', padding:20 },
  container: { backgroundColor: '#fff', borderRadius: 12, maxHeight: '80%', padding: 16 },
  header: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 },
  title: { fontSize: 20, fontWeight: '600' },
  inviteItem: { marginBottom: 20 },
  inviteText: { fontSize: 16, marginBottom: 8 },
  inviterName: { fontWeight: '600', color: '#555' },
  noteTitle: { fontWeight: '600', color: '#444' },
  role: { fontWeight: '600', color: '#666' },
  actions: { flexDirection: 'row' },
  actionBtn: {
    flex: 1, padding: 10, borderRadius: 6, alignItems: 'center', marginHorizontal: 5,
    borderWidth: 1,
  },
  acceptBtn: {
    backgroundColor: '#f0f0f0', // light grey background
    borderColor: '#999',        // medium grey border
  },
  declineBtn: {
    backgroundColor: '#fafafa', // very light grey background
    borderColor: '#bbb',        // lighter grey border
  },
  actionBtnText: { color: '#333', fontWeight: '600' },
  emptyText: { textAlign: 'center', fontSize: 16, fontStyle: 'italic', marginVertical: 20 },
});
