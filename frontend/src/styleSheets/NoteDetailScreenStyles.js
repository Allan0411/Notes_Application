// NoteDetailScreenStyles.js

import { StyleSheet } from 'react-native';

  const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 35
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawingModeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  drawingModeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  drawingModeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  exitDrawingButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  exitDrawingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    padding: 10,
  },
  titleInput: {
    borderRadius: 4,
    padding: 12,
    borderWidth: 1,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  combinedTextDrawingArea: {
    position: 'relative',
    minHeight: 570,
  },
  textInput: {
    borderRadius: 4,
    padding: 12,
    minHeight: 570,
    textAlignVertical: 'top',
    borderWidth: 1,
  },
  // BOOKMARK: drawingOverlay
  drawingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex:10,
    backgroundColor: 'transparent',
  },
  svgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  checklistContainer: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    minHeight: 570,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  checklistText: {
    flex: 1,
    fontSize: 16,
    borderBottomWidth: 1,
    paddingVertical: 4,
  },
  checkedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
    marginTop: 16,
  },
  addButtonText: {
    fontSize: 16,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  toolbar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    justifyContent: 'space-around',
  },
  toolButton: {
    padding: 8,
    borderRadius: 6,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeToolButton: {
    backgroundColor: '#4a5568',
  },
  toolButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  activeToolButtonText: {
    color: '#fff',
  },
  textAlignButton: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  menuOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  slideMenu: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    paddingTop: 10,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  slideMenuHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  slideMenuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  menuOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  shareOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  shareOptionTextContainer: {
    flex: 1,
  },
  shareOptionText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  shareOptionDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    padding: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop:4,
  },
  fontSection: {
    maxHeight: 200, 
    marginHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
  },
  fontOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  selectedFontOption: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  fontText: {
    fontSize: 16,
    lineHeight: 20,
  },
  selectedFontText: {
    fontWeight: '600',
  },
  fontSizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  fontSizeOption: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    minWidth: 50,
  },
  selectedFontSize: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  fontSizeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedFontSizeText: {
    color: '#fff',
    fontWeight: '600',
  },
  toolsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  toolOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 2,
  },
  selectedTool: {
    borderColor: '#4a5568',
  },
  toolLabel: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
  selectedToolLabel: {
    color: '#fff',
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
    justifyContent: 'center',
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  selectedColor: {
    borderWidth: 4,
  },
  brushSizeScrollView: {
    marginBottom: 12,
  },
  brushSizeContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 4,
  },
  brushSizeOption: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 70,
  },
  selectedBrushSize: {
    borderColor: '#4a5568',
  },
  brushPreview: {
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  brushSizeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  selectedBrushSizeText: {
    color: '#fff',
  },
  scrollIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 12,
    gap: 6,
  },
  scrollDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.5,
  },
  activeDot: {
    opacity: 1,
    transform: [{ scale: 1.3 }],
  },
  clearDrawingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    marginTop: 10,
  },
  clearDrawingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  savingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingContainer: {
    borderRadius: 12,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  savingText: {
    marginLeft: 16,
    fontSize: 18,
    fontWeight: '500',
  },
  updatedDate: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: -5,
  },
  collaboratorModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  collaboratorModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  collaboratorModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  collaboratorModalContent: {
    flex: 1,
    padding: 20,
  },
  inviteSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  emailInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  roleSelection: {
    marginBottom: 20,
  },
  roleLabel: {
    fontSize: 14,
    marginBottom: 10,
    fontWeight: '500',
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  roleButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    gap: 8,
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  collaboratorsSection: {
    flex: 1,
  },
  collaboratorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
  },
  collaboratorInfo: {
    flex: 1,
  },
  collaboratorName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  collaboratorEmail: {
    fontSize: 14,
    marginBottom: 6,
  },
  roleTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  removeButton: {
    padding: 8,
    borderRadius: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  emptySubText: {
    marginTop: 5,
    fontSize: 14,
    textAlign: 'center',
  },
  reminderModalContainer: { // Reminder Modal Styles
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    marginTop: 'auto',
  },
  reminderSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reminderSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  reminderNoteTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dateTimeText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  reminderMessageInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#f8f9fa',
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    marginTop: 4,
  },
  reminderTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  reminderTypeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reminderTypeText: {
    marginLeft: 12,
    flex: 1,
  },
  reminderTypeLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  unavailableText: {
    fontSize: 12,
    marginTop: 2,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repeatOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  repeatOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  repeatOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
  },
  reminderCancelButton: {
    flex: 1,
    marginRight: 10,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  reminderCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  reminderCreateButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#3182ce',
  },
  reminderCreateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  reminderIndicator: {
    position: 'absolute',
    top: 80,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1000,
  },
  reminderIndicatorText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  fontPreviewSection: { //fontmodal styles
    backgroundColor: '#f8f9fa',
    padding: 10,
    marginHorizontal: 20,
    marginVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewText: {
    lineHeight: 24,
    textAlign: 'center',
  },
  fontOptionContent: {  // Enhanced Font Option Styles
    flex: 1,
    marginRight: 10,
  },
  fontSubText: {
    fontSize: 12,
    marginTop: 2,
    fontStyle: 'italic',
  },
  // Enhanced Font Size Styles
  fontSizeScrollContainer: {
    maxHeight: 80,
    marginHorizontal: 20,
  },
  fontSizeContainer: {
    paddingHorizontal: 4,
    paddingVertical: 7,
  },
  fontSizeLabel: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
modernApplyButton: {  // Modern Apply Button Styles
  marginHorizontal: 38,
  marginVertical: 10,
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  backgroundColor: '#3b82f6', // Will be overridden by theme.accent
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 8,
  // // Add subtle gradient effect for iOS
  // ...(Platform.OS === 'ios' && {
  //   shadowColor: '#3b82f6',
  //   shadowOpacity: 0.25,
  // }),
},
modernApplyButtonPressed: {
  transform: [{ scale: 0.98 }],
  shadowOpacity: 0.1,
  elevation: 4,
},

modernApplyButtonText: {
  color: '#ffffff',
  fontSize: 16,
  fontWeight: '600',
  letterSpacing: 0.5,
  marginLeft: 26,
  textAlign: 'center',
},

modernApplyButtonIcon: {
  opacity: 0.95,
},

// Alternative gradient style (if you want to add gradient backgrounds)
gradientApplyButton: {
  marginHorizontal: 20,
  marginVertical: 10,
  paddingVertical: 14,
  paddingHorizontal: 18,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  backgroundColor: 'transparent',
  overflow: 'hidden',
},

// Success state for apply button
applyButtonSuccess: {
  backgroundColor: '#10b981',
},

applyButtonSuccessText: {
  color: '#ffffff',
},
// Loading state for apply button
applyButtonLoading: {
  opacity: 0.7,
},
// Disabled state for apply button
applyButtonDisabled: {
  backgroundColor: '#9ca3af',
  shadowOpacity: 0,
  elevation: 0,
},

applyButtonDisabledText: {
  color: '#d1d5db',
},
  // Dark theme overrides for font preview
  fontPreviewSectionDark: {
    backgroundColor: '#2d3748',
  }
});

export default styles;