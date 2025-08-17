import React, { useState, useRef, useContext, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Alert, Modal, Dimensions, SafeAreaView, StatusBar, PanResponder,
  Animated, ActivityIndicator, Share, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../ThemeContext';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import styles from '../styleSheets/NoteDetailScreenStyles'; // Import styles from the stylesheet
import { requestAIAction } from '../services/aiService';

import { parseChecklistItems } from '../utils/parseChecklistItems';
import {noteDetailsthemes as themes} from '../utils/themeColors'

import DrawingCanvas from '../components/DrawingCanvas';
import Checklist from '../components/Checklist';

import {createNote,updateNote} from '../services/noteService';
import { buildNotePayload } from '../utils/buildNotePayload';

import {formatNoteAsHTML,formatNoteAsPlainText} from '../utils/formatNote';

import { buildThemedStyles } from '../utils/buildThemedStyles';
import LoadingOverlay from '../components/LoadingOverlay';
import MenuModal from '../components/MenuModal';
import DrawingToolsModal from '../components/DrawingToolsModal';
import FontPickerModal from '../components/FontPickerModal';

//@note imports

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');


export default function NoteDetailScreen({ route, navigation }) {
  const { activeTheme } = useContext(ThemeContext);
  const theme = themes[activeTheme] || themes.light;
  const themedStyles=buildThemedStyles(theme,styles);
  // @note navigation/params/state
  const { note, onSave, isNewNote } = route.params;
  const [isSaving, setIsSaving] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // @note note content state
  const [noteText, setNoteText] = useState(note?.textContents || '');
  const [noteTitle, setNoteTitle] = useState(note?.title || '');
  const [checklistItems, setChecklistItems] = useState(parseChecklistItems(note?.checklistItems));
  const [updatedAt, setUpdatedAt] = useState(note?.updatedAt || new Date().toISOString());

  // @note drawings state
  const [drawings, setDrawings] = useState(() => {
    if (note?.drawings && Array.isArray(note.drawings)) {
      console.log('Loaded drawings from note:', note.drawings.length);
      return note.drawings;
    }
    console.log('No drawings found in note, starting with empty array');
    return [];
  });

  // @note UI state
  const [activeTab, setActiveTab] = useState('text');
  const [showFontModal, setShowFontModal] = useState(false);
  const [showDrawingModal, setShowDrawingModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);

  // @note text formatting state
  // Parse formatting JSON if present, otherwise fallback to note fields or defaults
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

  // @note drawing tool state
  const [selectedTool, setSelectedTool] = useState('pen');
  const [selectedColor, setSelectedColor] = useState(activeTheme === 'dark' ? '#e2e8f0' : '#4a5568');
  const [brushSize, setBrushSize] = useState(2);
  const [eraserSize, setEraserSize] = useState(10);
  const [currentDrawing, setCurrentDrawing] = useState(null);

  // @note scroll indicator state
  const [brushScrollPosition, setBrushScrollPosition] = useState(0);
  const [brushScrollWidth, setBrushScrollWidth] = useState(0);
  const [brushContentWidth, setBrushContentWidth] = useState(0);

  // @note refs
  const pathRef = useRef('');
  let lastUpdateTime = useRef(Date.now());
  const brushScrollRef = useRef(null);

  // @note animation refs
  const slideAnim = useRef(new Animated.Value(300)).current;
  const aiSlideAnim = useRef(new Animated.Value(300)).current;
  const shareSlideAnim = useRef(new Animated.Value(300)).current;

  // @note drawings debug
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

  // @note drawings backup/recovery
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

  // @note drawings initialization with recovery
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

  // @note drawings backup on change
  useEffect(() => {
    if (drawings.length > 0) {
      backupDrawings(drawings);
    }
  }, [drawings]);

  // @note font options
  const fonts = [
    { name: 'System', value: 'System' },
    { name: 'Arial', value: 'Arial' },
    { name: 'Times New Roman', value: 'Times New Roman' },
    { name: 'Courier New', value: 'Courier New' },
    { name: 'Helvetica', value: 'Helvetica' },
    { name: 'Georgia', value: 'Georgia' },
    { name: 'Trebuchet MS', value: 'Trebuchet MS' },
    { name: 'Impact', value: 'Impact' },
    { name: 'Comic Sans MS', value: 'Comic Sans MS' },
    { name: 'Roboto', value: 'Roboto' },
    { name: 'Open Sans', value: 'Open Sans' },
  ];

  // @note font size options
  const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32];

  // @note drawing tool options
  const drawingTools = [
    { name: 'pen', icon: 'create', label: 'Pen' },
    { name: 'brush', icon: 'brush', label: 'Brush' },
    { name: 'highlighter', icon: 'color-fill', label: 'Highlighter' },
    { name: 'eraser', icon: 'remove-circle', label: 'Eraser' },
  ];

  // @note color palette
  const colors = [
    '#000000', '#4a5568', '#8099c5ff', '#012b7eff',
    '#e53e3e', '#f3ba49ff', '#38a169', '#3182ce',
    '#805ad5', '#d53f8c', '#ed8936', '#48bb78',
    '#4299e1', '#9f7aea', '#ed64a6', '#f56565',
  ];

  // @note brush/eraser size options
  const brushSizes = [1, 2, 4, 8, 10, 12, 15, 20];
  const eraserSizes = [5, 10, 15, 20, 25, 30];

  // @note brush scroll indicator
  const handleBrushScroll = (event) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    setBrushScrollPosition(contentOffset.x);
    setBrushScrollWidth(layoutMeasurement.width);
    setBrushContentWidth(contentSize.width);
  };

  // @note brush scroll indicator dots
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

  // @note crud
  // POST: Create new note
  // @note save
  // Save note function
  const saveNote = async () => {
    if (isSaving) return; // Prevent double taps

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
    });
    try {
      if (isNewNote) {
        const created = await createNote(notePayload);
        if (onSave) onSave(created);

        // Clear backup after successful save
        const backupKey = `note_drawings_new`;
        await AsyncStorage.removeItem(backupKey);

        Alert.alert('Success', 'Note created successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } 
      
      else {
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
          isArchived: note?.isArchived || false,
          isPrivate: note?.isPrivate || false,
          creatorUserId: note?.creatorUserId,
          updatedAt: new Date().toISOString(),
          // Add other fields if needed
        });

        const updated = await updateNote(note?.id, notePayload);
        if (onSave) {
          if (updated === true || updated == null) {
            onSave({ ...note, ...notePayload });
          } else {
            onSave(updated);
          }
        }
        Alert.alert('Success', 'Note updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
      setUpdatedAt(notePayload.updatedAt);

    } catch (err) {
      Alert.alert('Error', 'There was a problem saving your note: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };


  // @note export
  // Export as plain text
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
        textAlign});
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

  // Export as PDF
  const exportAsPDF = async () => {
    try {
      setIsExporting(true);
      console.log("noteTitle", noteTitle);
      console.log("noteText", noteText);
console.log("checklistItems", checklistItems);
console.log("drawings", drawings);

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
        textAlign}
      );
      console.log(htmlContent);
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

  // @note share
  // Enhanced share function with format selection
  function handleSend() {
    hideMenu();
    if (!noteText.trim() && !noteTitle.trim() && checklistItems.length === 0) {
      Alert.alert('Empty Note', 'Please add some content before sharing.');
      return;
    }
    showShareMenu();
  }

  // Share menu functions
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

  // @note reminder/collaborator
  function handleReminder() {
    hideMenu();
    Alert.alert('Set Reminder', 'Feature coming soon! You can set reminders for this note to notify you at specific times.');
  }

  function handleCollaborator() {
    hideMenu();
    Alert.alert('Add Collaborator', 'Feature coming soon! You can invite others to view and edit this note together.');
  }

  // @note menu show/hide
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

  // @note ai
  // Menu options
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

  // Handle AI Result
  function handleAiResult(aiText, setNoteText, noteText) {
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

  const handleAiAction = async (actionType) => {
    closeAiMenu();
    if (!noteText) {
      Alert.alert('No Content', 'Please add some text before using an AI action.');
      return;
    }
    setIsAiProcessing(true);
    try {
      const aiText = await requestAIAction(actionType, noteText);
      handleAiResult(aiText, setNoteText, noteText);
    } catch (err) {
      console.error('AI API error:', err);
      Alert.alert('Error', err.message || 'There was a problem contacting the AI API.');
    } finally {
      setIsAiProcessing(false);
    }
  };

  // @note menu options
  // Menu options (Updated Send label to Share)
  const menuOptions = [
    { id: 'send', label: 'Share', icon: 'share-outline', action: handleSend },
    { id: 'reminder', label: 'Reminder', icon: 'alarm-outline', action: handleReminder },
    { id: 'collaborator', label: 'Collaborator', icon: 'people-outline', action: handleCollaborator },
  ];

  // Share format options
  const shareOptions = [
    { id: 'text', label: 'Export as Text (.txt)', icon: 'document-text-outline', action: exportAsPlainText },
    { id: 'pdf', label: 'Export as PDF (.pdf)', icon: 'document-outline', action: exportAsPDF },
  ];

  // AI action options
  const aiOptions = [
    { id: 'summarize', label: 'Summarize', icon: 'analytics-outline', action: () => handleAiAction('summarize') },
    { id: 'shorten', label: 'Shorten', icon: 'remove-circle-outline', action: () => handleAiAction('shorten') },
    { id: 'expand', label: 'Expand', icon: 'add-circle-outline', action: () => handleAiAction('expand') },
    { id: 'formal', label: 'Make Formal', icon: 'school-outline', action: () => handleAiAction('make_formal') },
    { id: 'grammar', label: 'Fix Grammar', icon: 'checkmark-circle-outline', action: () => handleAiAction('fix_grammar') },
  ];

  // @note checklist
  // Checklist functions
  useEffect(() => {
    setChecklistItems(parseChecklistItems(note?.checklistItems));
  }, [note?.checklistItems]);
  

  const addChecklistItem = () => {
    const newItem = {
      id: Date.now().toString(),
      text: '',
      checked: false,
    };
    setChecklistItems([...checklistItems, newItem]);
  };

  const updateChecklistItem = (id, text) => {
    setChecklistItems(items =>
      items.map(item => item.id === id ? { ...item, text } : item)
    );
  };

  const toggleChecklistItem = (id) => {
    setChecklistItems(items =>
      items.map(item => item.id === id ? { ...item, checked: !item.checked } : item)
    );
  };

  const deleteChecklistItem = (id) => {
    setChecklistItems(items => items.filter(item => item.id !== id));
  };

  // Clear drawing with better confirmation
// @note clearDrawings handler
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
          setDrawings([]);                 // clear all strokes
          setCurrentDrawing(null);         // clear preview/unfinished stroke
          // Optional: clean up backup data if needed
          const backupKey = `note_drawings_${note?.id || 'new'}`;
          AsyncStorage.removeItem(backupKey);
          // Optionally: clear out pathRef if used locally
          // pathRef.current = '';
        },
      },
    ],

  );
};


  // Toggle drawing mode
  const toggleDrawingMode = () => {
    setDrawingMode(!drawingMode);
    console.log("isdrawing on?",drawingMode);
    if (!drawingMode) {
      setShowDrawingModal(true);
    }
  };

  // @note text formatting
  const getTextStyle = () => ({
    fontSize,
    fontFamily: fontFamily === 'System' ? undefined : fontFamily,
    fontWeight: isBold ? 'bold' : 'normal',
    fontStyle: isItalic ? 'italic' : 'normal',
    textAlign,
    color: theme.text,
  });

  const getAlignmentIcon = () => {
    return '☰';
  };

  // @note drawing tool size
  const getCurrentToolSize = () => {
    return selectedTool === 'eraser' ? eraserSize : brushSize;
  };

  // @note drawing stats
  const getDrawingStats = () => {
    const stats = drawings.reduce((acc, drawing) => {
      acc.total++;
      acc.tools[drawing.tool] = (acc.tools[drawing.tool] || 0) + 1;
      return acc;
    }, { total: 0, tools: {} });
    console.log('Drawing statistics:', stats);
    return stats;
  };

 
  
  // @note render
  return (
    <>
    <SafeAreaView style={themedStyles.container}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.background} />
     
      {/* Header with Save Checkmark */}
      <View style={themedStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
        <Text style={themedStyles.headerTitle}>Note Detail</Text>
        <View style={styles.headerActions}>
            <TouchableOpacity onPress={saveNote} style={{marginRight: 10}}>
                <Ionicons name="checkmark-done-outline" size={28} color={theme.accent} />
            </TouchableOpacity>
            <TouchableOpacity onPress={showMenu}>
                <Ionicons name="ellipsis-vertical" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
        </View>
      </View>

      {/* Updated Drawing Mode Banner */}
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

      {/* Content Area */}
      <ScrollView style={styles.contentContainer}>
        {/* Title Input */}
        <TextInput
          style={[themedStyles.titleInput, getTextStyle()]}
          placeholder="Note Title"
          value={noteTitle}
          onChangeText={setNoteTitle}
          placeholderTextColor={theme.placeholder}
          editable={!drawingMode}
        />

        <Text style={[styles.updatedDate, {color: theme.textMuted}]}>
          Last Updated: {new Date(updatedAt).toLocaleString()}
        </Text>

        {/* @note text/drawing area */}
        {activeTab === 'text' && (
          <View style={styles.combinedTextDrawingArea} >
            {/* Text Input */}
            <TextInput
              style={[themedStyles.textInput, getTextStyle()]}
              placeholder="Write your note..."
              value={noteText}
              onChangeText={setNoteText}
              multiline
              placeholderTextColor={theme.placeholder}
              editable={!drawingMode}
            />
           
            {/* Drawing Overlay */}
            <View style={styles.drawingOverlay} pointerEvents={drawingMode ? 'auto' : 'none'}>
              {/*@note drawing canvas;*/}

            <DrawingCanvas
              drawings={drawings}
              setDrawings={setDrawings}
              currentDrawing={currentDrawing}
              setCurrentDrawing={setCurrentDrawing}
              selectTool={selectedTool}
              selectedColor={selectedColor}
              brushSize={brushSize}
              eraserSize={eraserSize}
              drawingMode={drawingMode}
              style={styles.svgOverlay}
              // ...any other relevant drawing props
            />
            </View>
          </View>
        )}

        {/* @note checklist */}
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

      {/* @note toolbar */}
      {/* Bottom Toolbar - Updated to remove drawing tab and add drawing toggle */}
      <View style={themedStyles.toolbar}>
        {/* Content Type Buttons */}
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
       
        {/* Drawing Mode Toggle Button */}
        <TouchableOpacity
          style={[styles.toolButton, drawingMode && themedStyles.activeToolButton]}
          onPress={toggleDrawingMode}
        >
          <Ionicons name="brush" size={20} color={drawingMode ? '#fff' : theme.textSecondary} />
        </TouchableOpacity>

        {/* Formatting Tools */}
        <TouchableOpacity style={styles.toolButton} onPress={() => setShowFontModal(true)}>
          <Ionicons name="text" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
       
        <TouchableOpacity
          style={[styles.toolButton, isBold && themedStyles.activeToolButton]}
          onPress={() => setIsBold(!isBold)}
        >
          <Text style={[themedStyles.toolButtonText, { fontWeight: 'bold' }, isBold && styles.activeToolButtonText]}>B</Text>
        </TouchableOpacity>
       
        <TouchableOpacity
          style={[styles.toolButton, isItalic && themedStyles.activeToolButton]}
          onPress={() => setIsItalic(!isItalic)}
        >
          <Text style={[themedStyles.toolButtonText, { fontStyle: 'italic' }, isItalic && styles.activeToolButtonText]}>I</Text>
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
      </View>

      {/* @note menu modal */}
      <MenuModal
        visible={showMenuModal}
        onClose={hideMenu}
        title="Note Options"
        options={menuOptions} // [{id,icon,label,action}]
        themedStyles={themedStyles}
        styles={styles}
        theme={theme}
        slideAnim={slideAnim}
      />

      {/* @note share modal */}
      <MenuModal
      visible={showShareModal}
      onClose={hideShareMenu}
      title="Choose Export Format"
      options={shareOptions.map(opt=>({...opt,description: opt.id === 'text'
        ? 'Plain text format with basic formatting preserved'
        : 'Professional PDF document with rich formatting'}))}
      themedStyles={themedStyles}
      styles={styles}
      theme={theme}
      slideAnim={shareSlideAnim}
      optionType="share"
      disabled={isExporting}
    />

      {/* @note font modal */}
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

      {/* @note drawing tools modal */}
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

      {/* @note ai modal */}
      <MenuModal
        visible={showAiModal}
        onClose={closeAiMenu}
        title="AI Actions"
        options={aiOptions} // [{ id, label, icon, action }]
        themedStyles={themedStyles}
        styles={styles}
        theme={theme}
        slideAnim={aiSlideAnim}
      />

    </SafeAreaView>
     {/* @note overlays */}
      {/* Saving Overlay */}
      <LoadingOverlay
        visible={isSaving}
        text="Saving the note..."
        themedStyles={themedStyles}
        styles={styles}
        theme={theme}
      />

      {/* AI Processing Overlay */}
      <LoadingOverlay
        visible={isAiProcessing}
        text="AI is doing it's work"
        themedStyles={themedStyles}
        styles={styles}
        theme={theme}
      />

      {/* Export Processing Overlay */}
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
    </>
  );
}
