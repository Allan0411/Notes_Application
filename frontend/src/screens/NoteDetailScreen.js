 import { getAttachments as fetchAttachments } from '../services/attachmentService';
import React, { useState, useRef, useContext, useEffect } from 'react';
import {generateImageFromSketch, uploadImageToCloudinary} from '../services/cloudinaryUpload';
import { addAttachment } from '../services/attachmentService';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Alert, Modal, Dimensions, SafeAreaView, StatusBar, PanResponder,
  Animated, ActivityIndicator, Share, Platform,Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../ThemeContext';
import { SettingsContext } from '../SettingsContext';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import styles from '../styleSheets/NoteDetailScreenStyles';
import { requestAIAction } from '../services/aiService';

import { parseChecklistItems } from '../utils/parseChecklistItems';
import { noteDetailsthemes as themes } from '../utils/themeColors';

import DrawingCanvas from '../components/DrawingCanvas';
import Checklist from '../components/Checklist';

import { createNote, updateNote, updateNoteIsPrivate } from '../services/noteService';
import { buildNotePayload } from '../utils/buildNotePayload';

import { formatNoteAsHTML, formatNoteAsPlainText } from '../utils/formatNote';

import { buildThemedStyles } from '../utils/buildThemedStyles';
import LoadingOverlay from '../components/LoadingOverlay';
import MenuModal from '../components/MenuModal';
import DrawingToolsModal from '../components/DrawingToolsModal';
import FontPickerModal from '../components/FontPickerModal';
import CollaboratorModal from '../components/CollaboratorModal';
import ReminderModal from '../components/ReminderModal';
import reminderService from '../services/reminderService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
import {captureRef } from 'react-native-view-shot';

export default function NoteDetailScreen({ route, navigation }) {
  const { activeTheme } = useContext(ThemeContext);
  const { sharingEnabled } = useContext(SettingsContext);
  const theme = themes[activeTheme] || themes.light;
  const themedStyles = buildThemedStyles(theme, styles);
  const canvasRef=useRef(null);
  // Navigation/params/state
  const { note, onSave, isNewNote } = route.params;
  const [isSaving, setIsSaving] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [noteReminders, setNoteReminders] = useState([]);
  // Attachments state
  const [attachmentsList, setAttachmentsList] = useState(note?.attachments || []);

  // Function to fetch attachments (images) for the note
  // Fetch attachments from the backend using the attachmentService
 
  const getAttachments = async () => {
    if (!note?.id) {
      setAttachmentsList([]);
      return;
    }
    try {
      const attachments = await fetchAttachments(note.id);
      console.log(attachments);
      setAttachmentsList(Array.isArray(attachments) ? attachments : []);
      
    } catch (error) {
      console.error('Failed to fetch attachments:', error);
      setAttachmentsList([]);
    }
  };

  // Function to open image preview (can be replaced with a modal or navigation)
  // Inline image preview: show a modal with the image
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [imagePreviewAttachment, setImagePreviewAttachment] = useState(null);

  const openImagePreview = (attachment) => {
    if (!attachment || !attachment.storagePath) {
      Alert.alert('Error', 'No image available for preview.');
      return;
    }
    setImagePreviewAttachment(attachment);
    setImagePreviewVisible(true);
  };

  // Inline image preview modal component
  // Call <ImagePreviewModal visible={imagePreviewVisible} attachment={imagePreviewAttachment} onClose={() => setImagePreviewVisible(false)} />
  // somewhere in your render tree, e.g. just above </View> in your main return.
  const ImagePreviewModal = ({ visible, attachment, onClose }) => {
    if (!attachment) return null;
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.85)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 40, right: 20, zIndex: 2 }}
            onPress={onClose}
          >
            <Ionicons name="close" size={36} color="#fff" />
          </TouchableOpacity>
          <Image
            source={{ uri: attachment.storagePath }}
            style={{
              width: SCREEN_WIDTH * 0.9,
              height: SCREEN_HEIGHT * 0.7,
              resizeMode: 'contain',
              borderRadius: 12,
              backgroundColor: '#222'
            }}
          />
          {attachment.name && (
            <Text style={{
              color: '#fff',
              marginTop: 16,
              fontSize: 16,
              textAlign: 'center'
            }}>
              {attachment.name}
            </Text>
          )}
        </View>
      </Modal>
    );
  };

  // Note content state
  const [noteText, setNoteText] = useState(note?.textContents || '');
  const [noteTitle, setNoteTitle] = useState(note?.title || '');
  const [checklistItems, setChecklistItems] = useState(parseChecklistItems(note?.checklistItems));
  const [updatedAt, setUpdatedAt] = useState(note?.updatedAt || new Date().toISOString());

  // NEW: Text selection state
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [hasSelection, setHasSelection] = useState(false);
  const textInputRef = useRef(null);

  // Store formatted ranges for rich text rendering
  const [formattedRanges, setFormattedRanges] = useState(() => {
    if (note?.formattedRanges && Array.isArray(note.formattedRanges)) {
      return note.formattedRanges;
    }
    if (note?.formatting) {
      try {
        const formatting = typeof note.formatting === 'string'
          ? JSON.parse(note.formatting)
          : note.formatting;
        return formatting.ranges || [];
      } catch (e) {
        console.log('Failed to parse saved formatting ranges:', e);
      }
    }
    return [];
  });

  // Drawings state
  const [drawings, setDrawings] = useState(() => {
    if (note?.drawings && Array.isArray(note.drawings)) {
      console.log('Loaded drawings from note:', note.drawings.length);
      return note.drawings;
    }
    console.log('No drawings found in note, starting with empty array');
    return [];
  });

  // UI state
  const [activeTab, setActiveTab] = useState('text');
  const [showFontModal, setShowFontModal] = useState(false);
  const [showDrawingModal, setShowDrawingModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);

  const [boldMode, setBoldMode] = useState(false);
  const [italicMode, setItalicMode] = useState(false);


  // Text formatting state (now for default/global formatting)
  let formatting = {};
  if (note?.formatting) {
    try {
      formatting = typeof note.formatting === 'string'
        ? JSON.parse(note.formatting)
        : note.formatting;
    } catch (e) {
      formatting = {};
    }
  }
  const [fontSize, setFontSize] = useState(
    formatting.fontSize ?? note?.fontSize ?? 16
  );
  const [fontFamily, setFontFamily] = useState(
    formatting.fontFamily ?? note?.fontFamily ?? 'System'
  );
  const [isBold, setIsBold] = useState(
    formatting.isBold ?? note?.isBold ?? false
  );
  const [isItalic, setIsItalic] = useState(
    formatting.isItalic ?? note?.isItalic ?? false
  );
  const [textAlign, setTextAlign] = useState(
    formatting.textAlign ?? note?.textAlign ?? 'left'
  );

  // Drawing tool state
  const [selectedTool, setSelectedTool] = useState('pen');
  const [selectedColor, setSelectedColor] = useState(activeTheme === 'dark' ? '#e2e8f0' : '#4a5568');
  const [brushSize, setBrushSize] = useState(2);
  const [eraserSize, setEraserSize] = useState(10);
  const [currentDrawing, setCurrentDrawing] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Scroll indicator state
  const [brushScrollPosition, setBrushScrollPosition] = useState(0);
  const [brushScrollWidth, setBrushScrollWidth] = useState(0);
  const [brushContentWidth, setBrushContentWidth] = useState(0);

  // Refs
  const pathRef = useRef('');
  let lastUpdateTime = useRef(Date.now());
  const brushScrollRef = useRef(null);

  // Animation refs
  const slideAnim = useRef(new Animated.Value(300)).current;
  const aiSlideAnim = useRef(new Animated.Value(300)).current;
  const shareSlideAnim = useRef(new Animated.Value(300)).current;

  // NEW: Undo/Redo state for a single-step history
  const undoStack = useRef([]);
  const redoStack = useRef([]);

  // NEW: General purpose undo function
  const handleUndo = () => {
    if (undoStack.current.length > 0) {
      const lastAction = undoStack.current.pop();
      redoStack.current.push(lastAction);

      const { type, content } = lastAction;
      switch (type) {
        case 'title':
          setNoteTitle(content);
          break;
        case 'text':
          setNoteText(content);
          break;
        case 'checklist':
          setChecklistItems(content);
          break;
        case 'drawing':
          setDrawings(content);
          break;
      }
    }
  };

  // NEW: General purpose redo function
  const handleRedo = () => {
    if (redoStack.current.length > 0) {
      const lastAction = redoStack.current.pop();
      undoStack.current.push(lastAction);

      const { type, content } = lastAction;
      switch (type) {
        case 'title':
          setNoteTitle(content);
          break;
        case 'text':
          setNoteText(content);
          break;
        case 'checklist':
          setChecklistItems(content);
          break;
        case 'drawing':
          setDrawings(content);
          break;
      }
    }
  };

  // NEW: function to save previous state for undo
  const saveForUndo = (type, content) => {
    // Check if the new content is different from the last state in undoStack
    const lastUndo = undoStack.current[undoStack.current.length - 1];
    if (lastUndo && lastUndo.type === type && JSON.stringify(lastUndo.content) === JSON.stringify(content)) {
      return;
    }

    undoStack.current.push({ type, content });
    redoStack.current = []; // Clear redo stack on new action
  };

  // NEW: Handle text selection changes
  const handleSelectionChange = (event) => {
    const { selection } = event.nativeEvent;
    setSelectionStart(selection.start);
    setSelectionEnd(selection.end);
    setHasSelection(selection.start !== selection.end);
  };

  // FIXED: Apply formatting to selected text with proper range management
  const applyFormattingToSelection = (formatType) => {
    if (!hasSelection) {
      Alert.alert(
        'No Text Selected',
        'Please select text first to apply formatting.',
        [{ text: 'OK' }]
      );
      return;
    }

    const start = Math.min(selectionStart, selectionEnd);
    const end = Math.max(selectionStart, selectionEnd);

    const newRange = {
      start: start,
      end: end,
      type: formatType,
      id: Date.now().toString() + '_' + formatType
    };

    const existingRangeIndex = formattedRanges.findIndex(range =>
      range.start === start &&
      range.end === end &&
      range.type === formatType
    );

    let updatedRanges = [...formattedRanges];

    if (existingRangeIndex !== -1) {
      updatedRanges.splice(existingRangeIndex, 1);
    } else {
      updatedRanges = updatedRanges.filter(range => {
        if (range.type !== formatType) return true;
        return range.end <= start || range.start >= end;
      });

      updatedRanges.push(newRange);
    }

    setFormattedRanges(updatedRanges);
  };

  // FIXED: Check if selected text has formatting
  const isSelectionFormatted = (formatType) => {
    if (!hasSelection) return false;

    const start = Math.min(selectionStart, selectionEnd);
    const end = Math.max(selectionStart, selectionEnd);

    return formattedRanges.some(range =>
      range.start === start &&
      range.end === end &&
      range.type === formatType
    );
  };

  // FIXED: Render text with formatting applied - prevents content loss
  const renderFormattedText = () => {
    if (formattedRanges.length === 0 || !noteText) {
      return noteText || '';
    }

    try {
      const sortedRanges = [...formattedRanges]
        .filter(range => range.start < range.end && range.start >= 0 && range.end <= noteText.length)
        .sort((a, b) => a.start - b.start);

      const textParts = [];
      let lastIndex = 0;

      const rangeGroups = [];
      for (const range of sortedRanges) {
        let added = false;
        for (const group of rangeGroups) {
          if (group.start <= range.end && group.end >= range.start) {
            group.ranges.push(range);
            group.start = Math.min(group.start, range.start);
            group.end = Math.max(group.end, range.end);
            added = true;
            break;
          }
        }
        if (!added) {
          rangeGroups.push({
            start: range.start,
            end: range.end,
            ranges: [range]
          });
        }
      }

      rangeGroups.sort((a, b) => a.start - b.start);

      for (const group of rangeGroups) {
        if (group.start > lastIndex) {
          textParts.push({
            text: noteText.substring(lastIndex, group.start),
            formatting: []
          });
        }

        const formatTypes = [...new Set(group.ranges.map(r => r.type))];
        textParts.push({
          text: noteText.substring(group.start, group.end),
          formatting: formatTypes
        });

        lastIndex = group.end;
      }

      if (lastIndex < noteText.length) {
        textParts.push({
          text: noteText.substring(lastIndex),
          formatting: []
        });
      }

      return textParts;
    } catch (error) {
      console.error('Error rendering formatted text:', error);
      return noteText || '';
    }
  };

  // FIXED: Get text style for formatted portions - supports multiple formats
  const getFormattedTextStyle = (formattingArray) => {
    const baseStyle = getTextStyle();

    if (!formattingArray || formattingArray.length === 0) {
      return baseStyle;
    }

    let style = { ...baseStyle };

    formattingArray.forEach(formatting => {
      switch (formatting) {
        case 'bold':
          style.fontWeight = 'bold';
          break;
        case 'italic':
          style.fontStyle = 'italic';
          break;
      }
    });

    return style;
  };

  // FIXED: Update formatted ranges when text changes - prevents corruption
  const handleTextChange = (newText) => {
    saveForUndo('text', noteText);
    const oldLength = noteText.length;
    const newLength = newText.length;
    const textDiff = newLength - oldLength;

    if (textDiff !== 0 && formattedRanges.length > 0) {
      const changeStart = selectionStart;

      const updatedRanges = formattedRanges.map(range => {
        if (changeStart <= range.start) {
          const newStart = Math.max(0, range.start + textDiff);
          const newEnd = Math.max(newStart, range.end + textDiff);
          return {
            ...range,
            start: newStart,
            end: Math.min(newEnd, newLength)
          };
        } else if (changeStart < range.end) {
          const newEnd = Math.max(changeStart, range.end + textDiff);
          return {
            ...range,
            end: Math.min(newEnd, newLength)
          };
        }
        return range;
      }).filter(range =>
        range.start < range.end &&
        range.start >= 0 &&
        range.end <= newLength
      );

      setFormattedRanges(updatedRanges);
    }

    setNoteText(newText);
  };

  // FIXED: JSX Rich Text Rendering Section - Replace in your component
  const renderRichTextDisplay = () => {
    const formattedTextParts = renderFormattedText();

    if (typeof formattedTextParts === 'string') {
      return (
        <Text style={getTextStyle()}>
          {formattedTextParts || noteText}
        </Text>
      );
    }

    return (
      <Text style={getTextStyle()}>
        {formattedTextParts.map((part, index) => (
          <Text
            key={index}
            style={getFormattedTextStyle(part.formatting)}
          >
            {part.text}
          </Text>
        ))}
      </Text>
    );
  };

  // Reminder service
  useEffect(() => {
    const loadNoteReminders = async () => {
      if (note?.id) {
        try {
          const reminders = await reminderService.getRemindersForNote(note.id);
          setNoteReminders(reminders);
        } catch (error) {
          console.error('Error loading note reminders:', error);
        }
      }
    };
    loadNoteReminders();
  }, [note?.id]);

  const handleReminderCreated = (newReminder) => {
    setNoteReminders([...noteReminders, newReminder]);
    setShowReminderModal(false);
  };

  // Drawings debug
  useEffect(() => {
    console.log('Drawings updated:', drawings.length, 'total drawings');
    drawings.forEach((drawing, index) => {
      console.log(`Drawing ${index}:`, {
        id: drawing.id,
        pathLength: drawing.path?.length,
        color: drawing.color,
        tool: drawing.tool,
        hasTimestamp: !!drawing.timestamp
      });
    });
  }, [drawings]);

  // Drawings backup/recovery
  const backupDrawings = async (drawingsToBackup) => {
    try {
      const backupKey = `note_drawings_${note?.id || 'new'}`;
      await AsyncStorage.setItem(backupKey, JSON.stringify(drawingsToBackup));
      console.log('Drawings backed up successfully');
    } catch (error) {
      console.error('Failed to backup drawings:', error);
    }
  };

  const recoverDrawings = async () => {
    try {
      const backupKey = `note_drawings_${note?.id || 'new'}`;
      const backupData = await AsyncStorage.getItem(backupKey);
      if (backupData) {
        const recoveredDrawings = JSON.parse(backupData);
        console.log('Recovered drawings:', recoveredDrawings.length);
        return recoveredDrawings;
      }
    } catch (error) {
      console.error('Failed to recover drawings:', error);
    }
    return [];
  };

  // Drawings initialization with recovery
  useEffect(() => {
    const initializeDrawings = async () => {
      let initialDrawings = [];
      if (note?.drawings && Array.isArray(note.drawings)) {
        initialDrawings = note.drawings;
        console.log('Loaded drawings from note:', initialDrawings.length);
      } else if (!isNewNote) {
        const recoveredDrawings = await recoverDrawings();
        if (recoveredDrawings.length > 0) {
          initialDrawings = recoveredDrawings;
          console.log('Recovered drawings from backup:', recoveredDrawings.length);
        }
      }
      setDrawings(initialDrawings);
    };
    initializeDrawings();
  }, [note?.id]);

  // Drawings backup on change
  useEffect(() => {
    if (drawings.length > 0) {
      backupDrawings(drawings);
    }
  }, [drawings]);

  // Font options
  const fonts = [
    { name: 'System Default', value: 'System' },
    { name: 'Arial (Sans-serif)', value: 'Arial' },
    { name: 'Times New Roman (Serif)', value: 'Times New Roman' },
    { name: 'Courier New (Monospace)', value: 'Courier New' },
    { name: 'Impact (Bold)', value: 'Impact' },
    { name: 'Comic Sans MS (Casual)', value: 'Comic Sans MS' },
  ];

  const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32];

  const drawingTools = [
    { name: 'pen', icon: 'create', label: 'Pen' },
    { name: 'brush', icon: 'brush', label: 'Brush' },
    { name: 'highlighter', icon: 'color-fill', label: 'Highlighter' },
    { name: 'eraser', icon: 'remove-circle', label: 'Eraser' },
  ];

  const colors = [
    '#000000', '#8099c5ff', '#012b7eff', '#3182ce',
    '#e53e3e', '#f3ba49ff', '#38a169', '#a85353ff',
    '#805ad5', '#d53f8c', '#ed8936',
    '#4299e1', '#52a88eff', '#fdfa2cff', 
  ];

  const brushSizes = [1, 2, 4, 8, 10, 12, 15, 20];
  const eraserSizes = [5, 10, 15, 20, 25, 30];

  // Brush scroll indicator
  const handleBrushScroll = (event) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    setBrushScrollPosition(contentOffset.x);
    setBrushScrollWidth(layoutMeasurement.width);
    setBrushContentWidth(contentSize.width);
  };

  const getScrollIndicators = () => {
    if (brushContentWidth <= brushScrollWidth) return [];
    const totalDots = 2;
    const scrollPercentage = brushScrollPosition / (brushContentWidth - brushScrollWidth);
    const currentDot = Math.round(scrollPercentage * (totalDots - 1));
    return Array.from({ length: totalDots }, (_, index) => ({
      active: index === currentDot,
      key: index
    }));
  };

  // Save note function (keeping existing implementation)
  const saveNote = async () => {
    if (isSaving) return;

    if (!noteText.trim() && !noteTitle.trim() && checklistItems.length === 0 && drawings.length === 0) {
      Alert.alert('Empty Note', 'Please add some content!');
      return;
    }

    setIsSaving(true);

    const notePayload = buildNotePayload({
      title: noteTitle || 'Untitled Note',
      textContents: noteText,
      drawings,
      checklistItems,
      fontSize,
      fontFamily,
      isBold,
      isItalic,
      textAlign,
      isArchived: false,
      isPrivate: false,
      creatorUserId: note?.creatorUserId,
      formattedRanges: formattedRanges,
      formatting: {
        fontSize,
        fontFamily,
        isBold,
        isItalic,
        textAlign,
        ranges: formattedRanges
      }
    });

    try {
      if (isNewNote) {
        const created = await createNote(notePayload);
        if (onSave) onSave(created);

        const backupKey = `note_drawings_new`;
        await AsyncStorage.removeItem(backupKey);

        Alert.alert('Success', 'Note created successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('Home') }
        ]);
        
      } else {
        const updatePayload = buildNotePayload({
          title: noteTitle || 'Untitled Note',
          textContents: noteText,
          drawings,
          checklistItems,
          fontSize,
          fontFamily,
          isBold,
          isItalic,
          textAlign,
          isArchived: note?.isArchived || false,
          isPrivate: note?.isPrivate || false,
          creatorUserId: note?.creatorUserId,
          updatedAt: new Date().toISOString(),
          formattedRanges: formattedRanges,
          formatting: {
            fontSize,
            fontFamily,
            isBold,
            isItalic,
            textAlign,
            ranges: formattedRanges
          }
        });

        const updated = await updateNote(note?.id, updatePayload);
        if (onSave) {
          if (updated === true || updated == null) {
            onSave({ ...note, ...updatePayload });
          } else {
            onSave(updated);
          }
        }
        Alert.alert('Success', 'Note created successfully!', [
          { text: 'OK' }
        ]);
      }
      setUpdatedAt(notePayload.updatedAt);

    } catch (err) {
      Alert.alert('Error', 'There was a problem saving your note: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!note?.id) {
      Alert.alert('Error', 'Cannot delete an unsaved note.');
      return;
    }

    Alert.alert(
      "Move to Trash",
      "Are you sure you want to move this note to the trash?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Move",
          style: "destructive",
          onPress: async () => {
            setIsSaving(true);
            try {
              await updateNoteIsPrivate(note.id, true);
              if (onSave) onSave({ ...note, isPrivate: true });
              Alert.alert('Success', 'Note moved to trash.', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              console.error('Error moving note to trash:', error);
              Alert.alert('Error', 'Failed to move note to trash.');
            } finally {
              setIsSaving(false);
            }
          }
        }
      ]
    );
  };

  const exportAsPlainText = async () => {
    try {
      setIsExporting(true);
      const content = formatNoteAsPlainText({
        noteTitle,
        noteText,
        checklistItems,
        drawings,
        updatedAt,
        fontSize,
        fontFamily,
        isBold,
        isItalic,
        textAlign
      });
      const fileName = `${(noteTitle || 'Note').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.txt`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: 'Share Note as Text'
        });
      } else {
        await Share.share({
          message: content,
          title: noteTitle || 'Note'
        });
      }
      hideShareMenu();
    } catch (error) {
      console.error('Error exporting as text:', error);
      Alert.alert('Export Error', 'Failed to export note as text file.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPDF = async () => {
    try {
      setIsExporting(true);
      const htmlContent = formatNoteAsHTML({
        noteTitle,
        noteText,
        checklistItems,
        drawings,
        updatedAt,
        fontSize,
        fontFamily,
        isBold,
        isItalic,
        textAlign
      });
      const fileName = `${(noteTitle || 'Note').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.pdf`;
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
        width: 612,
        height: 792,
      });
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.moveAsync({
        from: uri,
        to: fileUri,
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Note as PDF'
        });
      } else {
        Alert.alert('PDF Created', `PDF saved to: ${fileUri}`);
      }
      hideShareMenu();
    } catch (error) {
      console.error('Error exporting as PDF:', error);
      Alert.alert('Export Error', 'Failed to export note as PDF file.');
    } finally {
      setIsExporting(false);
    }
  };

  function handleSend() {
    hideMenu();

    if (!sharingEnabled) {
      Alert.alert(
        "Sharing Disabled",
        "Please enable sharing in settings to use this feature.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    if (!noteText.trim() && !noteTitle.trim() && checklistItems.length === 0) {
      Alert.alert('Empty Note', 'Please add some content before sharing.');
      return;
    }
    showShareMenu();
  }

  const showShareMenu = () => {
    setShowShareModal(true);
    Animated.timing(shareSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideShareMenu = () => {
    Animated.timing(shareSlideAnim, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowShareModal(false);
    });
  };

  function handleReminder() {
    hideMenu();
    if (!noteTitle.trim() && !noteText.trim()) {
      Alert.alert('Empty Note', 'Please add a title or content before setting a reminder.');
      return;
    }
    setShowReminderModal(true);
  }

  function handleCollaborator() {
    hideMenu();
    if (!note?.id) {
      Alert.alert('Cannot Add Collaborators', 'Please save the note first before adding collaborators.');
      return;
    }
    setShowCollaboratorModal(true);
  }

  const showMenu = () => {
    setShowMenuModal(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideMenu = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowMenuModal(false);
    });
  };

  const openAiMenu = () => {
    setShowAiModal(true);
    Animated.timing(aiSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeAiMenu = () => {
    Animated.timing(aiSlideAnim, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowAiModal(false));
  };

  // --- REWRITE: AI result handler and AI action handler to use selected text if present ---

  function handleAiResult(aiText, setNoteText, noteText, selectionStart, selectionEnd, hasSelection) {
    // If there was a selection, offer to replace just the selected text, or add/replace all
    if (hasSelection && selectionStart !== selectionEnd) {
      Alert.alert(
        "AI Result",
        aiText,
        [
          {
            text: "Replace Selection",
            onPress: () => {
              // Replace only the selected text with aiText
              const start = Math.min(selectionStart, selectionEnd);
              const end = Math.max(selectionStart, selectionEnd);
              setNoteText(
                noteText.substring(0, start) +
                aiText +
                noteText.substring(end)
              );
            }
          },
          {
            text: "Add to End",
            onPress: () => setNoteText(noteText ? noteText + "\n" + aiText : aiText)
          },
          {
            text: "Replace All",
            onPress: () => setNoteText(aiText)
          },
          { text: "Cancel", style: "cancel" }
        ]
      );
    } else {
      // No selection, offer add/replace all
      Alert.alert(
        "AI Result",
        aiText,
        [
          { text: "Add", onPress: () => setNoteText(noteText ? noteText + "\n" + aiText : aiText) },
          { text: "Replace", onPress: () => setNoteText(aiText) },
          { text: "Cancel", style: "cancel" }
        ]
      );
    }
  }

  // This function will send only the selected text to AI if there is a selection, otherwise the whole noteText
  const handleAiAction = async (actionType) => {
    closeAiMenu();

    // Determine what text to send to AI: selected or all
    let textForAI = noteText;
    let selectionExists = hasSelection && selectionStart !== selectionEnd;
    if (selectionExists) {
      const start = Math.min(selectionStart, selectionEnd);
      const end = Math.max(selectionStart, selectionEnd);
      textForAI = noteText.substring(start, end);
    }

    if (!textForAI || !textForAI.trim()) {
      Alert.alert('No Content', 'Please add some text before using an AI action.');
      return;
    }
    setIsAiProcessing(true);
    try {
      const aiText = await requestAIAction(actionType, textForAI);
      handleAiResult(
        aiText,
        setNoteText,
        noteText,
        selectionStart,
        selectionEnd,
        selectionExists
      );
    } catch (err) {
      console.error('AI API error:', err);
      Alert.alert('Error', err.message || 'There was a problem contacting the AI API.');
    } finally {
      setIsAiProcessing(false);
    }
  };

  const menuOptions = [
    { id: 'send', label: 'Share', icon: 'share-outline', action: handleSend },
    { id: 'reminder', label: 'Reminder', icon: 'alarm-outline', action: handleReminder },
    { id: 'collaborator', label: 'Collaborator', icon: 'people-outline', action: handleCollaborator },
  ];

  const shareOptions = [
    { id: 'text', label: 'Export as Text (.txt)', icon: 'document-text-outline', action: exportAsPlainText },
    { id: 'pdf', label: 'Export as PDF (.pdf)', icon: 'document-outline', action: exportAsPDF },
  ];

  const aiOptions = [
    { id: 'summarize', label: 'Summarize', icon: 'analytics-outline', action: () => handleAiAction('summarize') },
    { id: 'shorten', label: 'Shorten', icon: 'remove-circle-outline', action: () => handleAiAction('shorten') },
    { id: 'expand', label: 'Expand', icon: 'add-circle-outline', action: () => handleAiAction('expand') },
    { id: 'formal', label: 'Make Formal', icon: 'school-outline', action: () => handleAiAction('make_formal') },
    { id: 'grammar', label: 'Fix Grammar', icon: 'checkmark-circle-outline', action: () => handleAiAction('fix_grammar') },
    { id: 'sketch-to-image', label: 'Sketch to image', icon: 'brush-outline', action: () => captureCanvas() },
   
  ];

  useEffect(() => {
    setChecklistItems(parseChecklistItems(note?.checklistItems));
  }, [note?.checklistItems]);

  const addChecklistItem = () => {
    saveForUndo('checklist', checklistItems);
    const newItem = {
      id: Date.now().toString(),
      text: '',
      checked: false,
    };
    setChecklistItems([...checklistItems, newItem]);
  };

  const updateChecklistItem = (id, text) => {
    saveForUndo('checklist', checklistItems);
    setChecklistItems(items =>
      items.map(item => item.id === id ? { ...item, text } : item)
    );
  };

  const toggleChecklistItem = (id) => {
    saveForUndo('checklist', checklistItems);
    setChecklistItems(items =>
      items.map(item => item.id === id ? { ...item, checked: !item.checked } : item)
    );
  };

  const deleteChecklistItem = (id) => {
    saveForUndo('checklist', checklistItems);
    setChecklistItems(items => items.filter(item => item.id !== id));
  };



  const clearDrawing = () => {
    Alert.alert(
      'Clear Drawing',
      `Are you sure you want to clear all ${drawings.length} drawings?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            saveForUndo('drawing', drawings);
            setDrawings([]);
            setCurrentDrawing(null);
            const backupKey = `note_drawings_${note?.id || 'new'}`;
            AsyncStorage.removeItem(backupKey);
          },
        },
      ],
    );
  };

  const toggleDrawingMode = () => {
    setDrawingMode(!drawingMode);
    console.log("isdrawing on?", drawingMode);
    if (!drawingMode) {
      setShowDrawingModal(true);
    }
  };

  const getTextStyle = () => {
    const getAndroidFontFamily = (fontName) => {
      if (Platform.OS !== 'android') {
        return fontName === 'System' ? undefined : fontName;
      }

      const androidFontMap = {
        'System': undefined,
        'Arial': 'sans-serif',
        'Times New Roman': 'serif',
        'Courier New': 'monospace',
        'Impact': 'sans-serif-black',
        'Comic Sans MS': 'casual',
      };

      return androidFontMap[fontName] || 'sans-serif';
    };

    return {
      fontSize,
      fontFamily: getAndroidFontFamily(fontFamily),
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
      textAlign,
      color: theme.text,
      lineHeight: fontSize * 1.4,
    };
  };

  const getAlignmentIcon = () => {
    return '☰';
  };

  const getCurrentToolSize = () => {
    return selectedTool === 'eraser' ? eraserSize : brushSize;
  };

  const getDrawingStats = () => {
    const stats = drawings.reduce((acc, drawing) => {
      acc.total++;
      acc.tools[drawing.tool] = (acc.tools[drawing.tool] || 0) + 1;
      return acc;
    }, { total: 0, tools: {} });
    console.log('Drawing statistics:', stats);
    return stats;
  };

 
  const captureCanvas = async () => {
    closeAiMenu();
    setIsAiProcessing(true); // Show overlay while processing
    try {
      // Capture the canvas with a white background
      // Ensure the background is white by using backgroundColor: '#ffffff'
      const uri = await captureRef(canvasRef, {
        format: 'jpeg',
        quality: 1,
        result: 'tmpfile',
        backgroundColor: '#ffffff' // Use full white hex code for clarity
      });
      console.log('Local canvas URI:', uri);

      // Build FormData directly with the local file
      const formData = new FormData();
      formData.append("file", {
        uri,
        type: "image/jpeg",
        name: "canvas.jpeg"
      });

      // Upload to your FastAPI endpoint
      const response = await fetch("https://74e54ed4b8e1.ngrok-free.app/generate-image-file", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      console.log("Cloudinary upload result:", result);
      // Use the async/await version of generateImageFromSketch (see file_context_0)
      const mypicurl = result.cloudinary_url;
      console.log("mypicurl: ", mypicurl);
      const sketch_response = await generateImageFromSketch(mypicurl);
      console.log(sketch_response);

      // Add as attachment to the note
      if (note?.id && sketch_response) {
        const attachmentData = {
          attachmentType: "image",
          storagePath: sketch_response
        };
        try {
          await addAttachment(note.id, attachmentData);
          
          console.log("Attachment added:", attachmentData); 
          // Move active tab to 'attachments' after adding
          setActiveTab && setActiveTab('attachments');
      Alert.alert('Success', 'Successfully generated image.', [
        {
          text: 'OK',
          onPress: async () => {
            if (getAttachments) {
              await getAttachments();
            }
          }
        }
      ]);
   
        } catch (err) {
          console.warn("Failed to add attachment:", err);
        }
      }
      
      return sketch_response || "";

    } catch (e) {
      console.warn("Canvas capture or upload failed", e);
      return null;
    } finally {
      setIsAiProcessing(false); // Hide AI overlay when done
    }
  };
  

  return (
    <>
      <SafeAreaView style={themedStyles.container}>
        <StatusBar barStyle={theme.statusBar} backgroundColor={theme.background} />

        <View style={themedStyles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
             <Text style={themedStyles.headerTitle}>Note Detail</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleUndo}
              disabled={undoStack.current.length === 0}
              style={{ marginRight: 10 }}
            >
              <Ionicons
                name="arrow-undo-outline"
                size={24}
                color={undoStack.current.length === 0 ? theme.textMuted : theme.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleRedo}
              disabled={redoStack.current.length === 0}
              style={{ marginRight: 10 }}
            >
              <Ionicons
                name="arrow-redo-outline"
                size={24}
                color={redoStack.current.length === 0 ? theme.textMuted : theme.textSecondary}
              />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleDeleteNote} style={{ marginRight: 10 }}>
              <Ionicons name="trash-outline" size={24} color="#cd0f0fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={saveNote} style={{ marginRight: 10 }}>
              <Ionicons name="checkmark-done-outline" size={28} color={theme.accent} />
            </TouchableOpacity>
            <TouchableOpacity onPress={showMenu}>
              <Ionicons name="ellipsis-vertical" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {drawingMode && (
          <View style={themedStyles.drawingModeBanner}>
            <View style={styles.drawingModeInfo}>
              {selectedTool !== 'eraser' && (
                <View style={[styles.colorIndicator, { backgroundColor: selectedColor, borderColor: theme.border }]} />
              )}
              <Text style={styles.drawingModeText}>
                Drawing Mode - {selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)} ({getCurrentToolSize()}px)
              </Text>
            </View>
            <TouchableOpacity onPress={() => setDrawingMode(false)} style={styles.exitDrawingButton}>
              <Text style={styles.exitDrawingText}>Exit</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView style={styles.contentContainer}>
          <TextInput
            style={[themedStyles.titleInput, getTextStyle()]}
            placeholder="Note Title"
            value={noteTitle}
            onChangeText={(text) => {
              saveForUndo('title', noteTitle);
              setNoteTitle(text);
            }}
            placeholderTextColor={theme.placeholder}
            editable={!drawingMode}
          />

          <Text style={[styles.updatedDate, { color: theme.textMuted }]}>
            Last Updated: {new Date(updatedAt).toLocaleString()}
          </Text>

          {activeTab === 'text' && (
            <View style={styles.combinedTextDrawingArea}>
              <TextInput
                ref={textInputRef}
                style={[
                  themedStyles.textInput,
                  getTextStyle(),
                  formattedRanges.length > 0 && { color: 'transparent' }
                ]}
                placeholder="Write your note..."
                value={noteText}
                onChangeText={handleTextChange}
                onSelectionChange={handleSelectionChange}
                multiline
                placeholderTextColor={theme.placeholder}
                editable={!drawingMode}
                selectTextOnFocus={false}
                cursorColor="black"
                selectionColor="rgba(59, 130, 246, 0.3)"
                selectionHandleColor="#3b82f6"
              />

              {formattedRanges.length > 0 && (
                <View style={styles.richTextOverlay} pointerEvents="none">
                  {renderRichTextDisplay()}
                </View>
              )}

              <View ref={canvasRef} style={styles.drawingOverlay} pointerEvents={drawingMode ? 'auto' : 'none'}>
                <DrawingCanvas
                  drawings={drawings}
                  setDrawings={(newDrawings) => {
                    saveForUndo('drawing', drawings);
                    setDrawings(newDrawings);
                  }}
                  currentDrawing={currentDrawing}
                  setCurrentDrawing={setCurrentDrawing}
                  selectTool={selectedTool}
                  selectedColor={selectedColor}
                  brushSize={brushSize}
                  eraserSize={eraserSize}
                  drawingMode={drawingMode}
                  style={styles.svgOverlay}
                />
              </View>
            </View>
          )}

          {/* Image list for attachments tab */}
          {activeTab === 'attachments' && (
           <>
             <ScrollView style={{ flex: 1, marginTop: 10 }}>
               <View style={styles.attachmentsContainer}>
                 {(attachmentsList || []).map((attachment, idx) => (
                   <TouchableOpacity
                     key={attachment.id || idx}
                     style={styles.attachmentItem}
                     onPress={() => {
                       if (typeof openImagePreview === 'function') {
                         openImagePreview(attachment);
                        } else {
                          Alert.alert('Preview', 'Image preview not implemented');
                        }
                      }}
                      activeOpacity={0.8}
                   >
                    <View style={styles.imageContainer}>
                      <Image
                       source={{ uri: attachment.storagePath }}
                       style={styles.attachmentImage}
                       resizeMode="cover"
                     />
                      <View style={styles.imageOverlay}>
                        <Ionicons name="expand-outline" size={20} color="#fff" />
                      </View>
                   </View>
                   {attachment.name && (
                     <Text style={[styles.attachmentName, { color: theme.text }]} numberOfLines={2}>
                       {attachment.name}
                      </Text>
                    )}
                 </TouchableOpacity>
              ))}
             {(!attachmentsList || attachmentsList.length === 0) && (
                <View style={styles.emptyAttachmentsContainer}>
                  <Ionicons name="images-outline" size={48} color={theme.textMuted} />
                  <Text style={[styles.emptyAttachmentsText, { color: theme.textMuted }]}>
                   No images found
                 </Text>
                  <Text style={[styles.emptyAttachmentsSubtext, { color: theme.textMuted }]}>
                   Generated images will appear here
                  </Text>
               </View>
              )}
           </View>
         </ScrollView>
    
           {/* Inline image preview modal */}
           <ImagePreviewModal
             visible={imagePreviewVisible}
             attachment={imagePreviewAttachment}
             onClose={() => setImagePreviewVisible(false)}
            />
         </>
        )}

          {activeTab === 'checklist' && (
            <Checklist
              items={checklistItems}
              addItem={addChecklistItem}
              updateItem={updateChecklistItem}
              toggleItem={toggleChecklistItem}
              deleteItem={deleteChecklistItem}
              theme={theme}
              themedStyles={themedStyles}
              styles={styles}
            />
          )}



        </ScrollView>

        <View style={themedStyles.toolbar}>
          <TouchableOpacity
            style={[styles.toolButton, activeTab === 'text' && themedStyles.activeToolButton]}
            onPress={() => setActiveTab('text')}
          >
            <Ionicons name="document-text" size={20} color={activeTab === 'text' ? '#fff' : theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolButton, activeTab === 'checklist' && themedStyles.activeToolButton]}
            onPress={() => setActiveTab('checklist')}
          >
            <Ionicons name="list" size={20} color={activeTab === 'checklist' ? '#fff' : theme.textSecondary} />
          </TouchableOpacity>

          
          <TouchableOpacity
            style={[styles.toolButton, drawingMode && themedStyles.activeToolButton]}
            onPress={() => {
              setActiveTab('text');
                toggleDrawingMode();
            
            }}
          >
            <Ionicons name="brush" size={20} color={drawingMode ? '#fff' : theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolButton} onPress={() => setShowFontModal(true)}>
            <Ionicons name="text" size={20} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toolButton,
              (hasSelection && isSelectionFormatted('bold')) && themedStyles.activeToolButton
            ]}
            onPress={() => applyFormattingToSelection('bold')}
          >
            <Text style={[
              themedStyles.toolButtonText,
              { fontWeight: 'bold' },
              (hasSelection && isSelectionFormatted('bold')) && styles.activeToolButtonText
            ]}>
              B
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toolButton,
              (hasSelection && isSelectionFormatted('italic')) && themedStyles.activeToolButton
            ]}
            onPress={() => applyFormattingToSelection('italic')}
          >
            <Text style={[
              themedStyles.toolButtonText,
              { fontStyle: 'italic' },
              (hasSelection && isSelectionFormatted('italic')) && styles.activeToolButtonText
            ]}>
              I
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.toolButton, styles.textAlignButton]} onPress={() => {
            const aligns = ['left', 'center', 'right'];
            const currentIndex = aligns.indexOf(textAlign);
            const nextAlign = aligns[(currentIndex + 1) % aligns.length];
            setTextAlign(nextAlign);
          }}>
            <Text style={themedStyles.toolButtonText}>{getAlignmentIcon()}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolButton} onPress={openAiMenu}>
            <Ionicons name="sparkles" size={20} color={theme.textSecondary} />
          </TouchableOpacity>

          {/* Attachments Tab Button */}

          {/* Attachments Tab Button */}
          <TouchableOpacity
            style={[styles.toolButton, activeTab === 'attachments' && themedStyles.activeToolButton]}
            onPress={async () => {
              setActiveTab('attachments');
              // Call the function to fetch attachments (images)
              if (typeof getAttachments === 'function') {
                await getAttachments(); 
                console.log("fetched attachemtns");// This should fetch and set the images in state
              } else {
                console.warn('getAttachments function not implemented');
              }
            }}
          >
            <Ionicons name="attach" size={20} color={activeTab === 'attachments' ? '#fff' : theme.textSecondary} />
          </TouchableOpacity>
          

        </View>

        <MenuModal
          visible={showMenuModal}
          onClose={hideMenu}
          title="Note Options"
          options={menuOptions}
          themedStyles={themedStyles}
          styles={styles}
          theme={theme}
          slideAnim={slideAnim}
        />

        <MenuModal
          visible={showShareModal}
          onClose={hideShareMenu}
          title="Choose Export Format"
          options={shareOptions.map(opt => ({
            ...opt, description: opt.id === 'text'
              ? 'Plain text format with basic formatting preserved'
              : 'Professional PDF document with rich formatting'
          }))}
          themedStyles={themedStyles}
          styles={styles}
          theme={theme}
          slideAnim={shareSlideAnim}
          optionType="share"
          disabled={isExporting}
        />

        <FontPickerModal
          visible={showFontModal}
          onClose={() => setShowFontModal(false)}
          themedStyles={themedStyles}
          styles={styles}
          theme={theme}
          fonts={fonts}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          fontSizes={fontSizes}
          fontSize={fontSize}
          setFontSize={setFontSize}
        />

        <DrawingToolsModal
          visible={showDrawingModal}
          onClose={() => setShowDrawingModal(false)}
          themedStyles={themedStyles}
          styles={styles}
          theme={theme}
          drawingTools={drawingTools}
          selectedTool={selectedTool}
          setSelectedTool={setSelectedTool}
          colors={colors}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          brushSizes={brushSizes}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          eraserSizes={eraserSizes}
          eraserSize={eraserSize}
          setEraserSize={setEraserSize}
          brushScrollRef={brushScrollRef}
          handleBrushScroll={handleBrushScroll}
          brushScrollWidth={brushScrollWidth}
          brushContentWidth={brushContentWidth}
          getScrollIndicators={getScrollIndicators}
          clearDrawing={clearDrawing}

        />

        <MenuModal
          visible={showAiModal}
          onClose={closeAiMenu}
          title="AI Actions"
          options={aiOptions}
          themedStyles={themedStyles}
          styles={styles}
          theme={theme}
          slideAnim={aiSlideAnim}
        />

      </SafeAreaView>

      {/* Overlays */}
      <LoadingOverlay
        visible={isSaving}
        text="Saving the note..."
        themedStyles={themedStyles}
        styles={styles}
        theme={theme}
      />
      <LoadingOverlay
        visible={isAiProcessing}
        text="AI is doing it's work"
        themedStyles={themedStyles}
        styles={styles}
        theme={theme}
      />

      <Modal
        transparent={true}
        animationType="fade"
        visible={isExporting}
      >
        <View style={[styles.savingOverlay, { backgroundColor: theme.overlay }]}>
          <View style={themedStyles.savingContainer}>
            <ActivityIndicator size="large" color={theme.textSecondary} />
            <Text style={themedStyles.savingText}>Exporting note...</Text>
          </View>
        </View>
      </Modal>

      <CollaboratorModal
        visible={showCollaboratorModal}
        onClose={() => setShowCollaboratorModal(false)}
        noteId={note?.id}
        theme={theme}
        themedStyles={themedStyles}
        styles={styles}
      />

      <ReminderModal
        visible={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        noteId={note?.id}
        noteTitle={noteTitle}
        theme={theme}
        themedStyles={themedStyles}
        styles={styles}
        onReminderCreated={handleReminderCreated}
      />

      {noteReminders.length > 0 && (
        <View style={[styles.reminderIndicator, { backgroundColor: theme.accent }]}>
          <Ionicons name="alarm" size={16} color="#fff" />
          <Text style={styles.reminderIndicatorText}>
            {noteReminders.length} reminder{noteReminders.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </>
  );
}


