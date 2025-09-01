// ProfileScreenStyleSheet.js

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  backButton: { 
    padding: 4 
  },
  editButton: { 
    padding: 4 
  },
  content: { 
    flex: 1 
  },
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
  // Uncomment if you want online indicator
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
  profileName: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginTop: 4 
  },
  profileEmail: { 
    fontSize: 14, 
    marginBottom: 8 
  },
  infoSection: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginBottom: 12 
  },
  infoItem: { 
    marginBottom: 16 
  },
  infoLabel: { 
    fontSize: 14, 
    marginBottom: 4 
  },
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
  cancelButton: { 
    marginRight: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButtonText: { 
    color: '#fff', 
    fontWeight: 'bold' ,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
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
  securityItemLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 
  },
  securityItemText: { 
    fontSize: 16, 
    marginLeft: 8 
  },
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
  modalTitle: { 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  modalBody: { 
    marginTop: 16 
  },
  passwordField: { 
    marginBottom: 16 
  },
  passwordLabel: { 
    fontSize: 14, 
    marginBottom: 4 
  },
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
  modalCancelButton: { 
    marginRight: 16 
  },
  modalCancelText: { 
    fontSize: 14 
  },
  modalSaveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalSaveText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
});

export default styles;
