import React, { useState, useRef, useContext, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Alert, Modal, Dimensions, SafeAreaView, StatusBar, PanResponder,
  Animated, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle } from 'react-native-svg';
import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Theme configuration
const themes = {
  light: {
    background: '#edf2f7',
    surface: '#ffffff',
    surfaceSecondary: '#f7fafc',
    primary: '#4a5568',
    primaryLight: '#718096',
    text: '#2d3748',
    textSecondary: '#4a5568',
    textMuted: '#718096',
    border: '#e2e8f0',
    borderLight: '#f7fafc',
    accent: '#38a169',
    danger: '#d11a2a',
    overlay: 'rgba(0,0,0,0.5)',
    placeholder: '#718096',
    drawingBanner: '#4a5568',
    statusBar: 'dark-content',
  },
  dark: {
    background: '#1a202c',
    surface: '#2d3748',
    surfaceSecondary: '#4a5568',
    primary: '#e2e8f0',
    primaryLight: '#cbd5e0',
    text: '#f7fafc',
    textSecondary: '#e2e8f0',
    textMuted: '#a0aec0',
    border: '#4a5568',
    borderLight: '#2d3748',
    accent: '#48bb78',
    danger: '#fc8181',
    overlay: 'rgba(0,0,0,0.7)',
    placeholder: '#a0aec0',
    drawingBanner: '#2d3748',
    statusBar: 'light-content',
  },
};

export default function NoteDetailScreen({ route, navigation }) {
  const { activeTheme } = useContext(ThemeContext);
  const theme = themes[activeTheme] || themes.light;
  
  const { note, onSave, isNewNote } = route.params;
  const [isSaving, setIsSaving] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  
  // Note content states
  const [noteText, setNoteText] = useState(note?.textContents || '');
  const [noteTitle, setNoteTitle] = useState(note?.title || '');
  const [checklistItems, setChecklistItems] = useState(note?.checklistItems || []);
  
  // UPDATED: Better drawings initialization with validation
  const [drawings, setDrawings] = useState(() => {
    if (note?.drawings && Array.isArray(note.drawings)) {
      console.log('Loaded drawings from note:', note.drawings.length);
      return note.drawings;
    }
    console.log('No drawings found in note, starting with empty array');
    return [];
  });
 
  // UI states
  const [activeTab, setActiveTab] = useState('text');
  const [showFontModal, setShowFontModal] = useState(false);
  const [showDrawingModal, setShowDrawingModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
 
  // Text formatting states
  const [fontSize, setFontSize] = useState(note?.fontSize || 16);
  const [fontFamily, setFontFamily] = useState(note?.fontFamily || 'System');
  const [isBold, setIsBold] = useState(note?.isBold || false);
  const [isItalic, setIsItalic] = useState(note?.isItalic || false);
  const [textAlign, setTextAlign] = useState(note?.textAlign || 'left');

  // Drawing tool states
  const [selectedTool, setSelectedTool] = useState('pen');
  const [selectedColor, setSelectedColor] = useState(activeTheme === 'dark' ? '#e2e8f0' : '#4a5568');
  const [brushSize, setBrushSize] = useState(2);
  const [eraserSize, setEraserSize] = useState(10);
  const [currentDrawing, setCurrentDrawing] = useState(null);

  // New states for scroll indicators
  const [brushScrollPosition, setBrushScrollPosition] = useState(0);
  const [brushScrollWidth, setBrushScrollWidth] = useState(0);
  const [brushContentWidth, setBrushContentWidth] = useState(0);

  const pathRef = useRef('');
  let lastUpdateTime = useRef(Date.now());
  const brushScrollRef = useRef(null);

  // Animations for slide menus
  const slideAnim = useRef(new Animated.Value(300)).current;
  const aiSlideAnim = useRef(new Animated.Value(300)).current;

  // ADDED: Monitor drawings state changes for debugging
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

  // ADDED: Drawing backup and recovery functions
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

  // ADDED: Initialize drawings with recovery support
  useEffect(() => {
    const initializeDrawings = async () => {
      let initialDrawings = [];
      
      // First, try to load from note data
      if (note?.drawings && Array.isArray(note.drawings)) {
        initialDrawings = note.drawings;
        console.log('Loaded drawings from note:', initialDrawings.length);
      } else if (!isNewNote) {
        // If editing existing note but no drawings, try to recover from backup
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

  // ADDED: Backup drawings whenever they change
  useEffect(() => {
    if (drawings.length > 0) {
      backupDrawings(drawings);
    }
  }, [drawings]);

  // Font options
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

  const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32];

  // Updated drawing tool options to include eraser
  const drawingTools = [
    { name: 'pen', icon: 'create', label: 'Pen' },
    { name: 'brush', icon: 'brush', label: 'Brush' },
    { name: 'highlighter', icon: 'color-fill', label: 'Highlighter' },
    { name: 'eraser', icon: 'remove-circle', label: 'Eraser' },
  ];

  const colors = [
    '#000000', '#4a5568', '#8099c5ff', '#012b7eff',
    '#e53e3e', '#f3ba49ff', '#38a169', '#3182ce',
    '#805ad5', '#d53f8c', '#ed8936', '#48bb78',
    '#4299e1', '#9f7aea', '#ed64a6', '#f56565',
  ];

  const brushSizes = [1, 2, 4, 8, 10, 12, 15, 20];
  const eraserSizes = [5, 10, 15, 20, 25, 30];

  // New function to handle scroll events and update indicators
  const handleBrushScroll = (event) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    setBrushScrollPosition(contentOffset.x);
    setBrushScrollWidth(layoutMeasurement.width);
    setBrushContentWidth(contentSize.width);
  };

  // Function to calculate scroll indicators
  const getScrollIndicators = () => {
    if (brushContentWidth <= brushScrollWidth) return [];
    
    const totalDots = 2; // Maximum number of dots to show
    const scrollPercentage = brushScrollPosition / (brushContentWidth - brushScrollWidth);
    const currentDot = Math.round(scrollPercentage * (totalDots - 1));
    
    return Array.from({ length: totalDots }, (_, index) => ({
      active: index === currentDot,
      key: index
    }));
  };

  // UPDATED: Save note function with drawings support
  const generateRandomId = () => Math.floor(100000 + Math.random() * 899999);

  // POST: Create new note
  const createNote = async (note) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      console.log('Sending payload:', {
        ...note,
        drawingsCount: note.drawings?.length || 0
      });
      console.log('Auth token:', token);

      const response = await fetch(API_BASE_URL + '/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(note)
      });

      console.log('Response status code:', response.status);
      console.log('Response status text:', response.statusText);

      const text = await response.text();
      if (!text) {
        throw new Error('Empty response from server');
      }
      return JSON.parse(text);

    } catch (err) {
      console.error('Error creating note:', err);
      throw err;
    }
  };

  // PUT: Update a note by id
  const updateNote = async (id, note) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      console.log('Updating note with drawings:', note.drawings?.length || 0);
      
      const response = await fetch(`${API_BASE_URL + '/notes'}/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(note)
      });
      
      console.log('Response status code:', response.status);
      console.log('Response status text:', response.statusText);
      
      const text = await response.text();
      console.log("response text: ", text);
      
      if (!text) {
        return true;
      }
      return JSON.parse(text);
    } catch (err) {
      console.error('Error updating note:', err);
      throw err;
    }
  };

  // UPDATED: Save note function with complete data
  const saveNote = async () => {
    console.log("Save button clicked");
    if (isSaving) return; // Prevent double taps

    if (!noteText.trim() && !noteTitle.trim() && checklistItems.length === 0 && drawings.length === 0) {
      Alert.alert('Empty Note', 'Please add some content!');
      return;
    }
   
    setIsSaving(true);
    
    // UPDATED: Include all note data including drawings
    let notePayload = {
      title: noteTitle || 'Untitled Note',
      textContents: noteText,
      checklistItems: checklistItems,
      drawings: drawings, // Include drawings array
      fontSize: fontSize,
      fontFamily: fontFamily,
      isBold: isBold,
      isItalic: isItalic,
      textAlign: textAlign,
      isArchived: false,
      isPrivate: false
    };

    console.log('Saving note with:', {
      title: notePayload.title,
      textLength: notePayload.textContents.length,
      checklistCount: notePayload.checklistItems.length,
      drawingsCount: notePayload.drawings.length
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
      } else {
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

    } catch (err) {
      Alert.alert('Error', 'There was a problem saving your note: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Menu action functions
  function handleSend() {
    hideMenu();
    Alert.alert('Send Note', 'Feature coming soon! You can share your note via email, messaging apps, or social media.');
  }

  function handleReminder() {
    hideMenu();
    Alert.alert('Set Reminder', 'Feature coming soon! You can set reminders for this note to notify you at specific times.');
  }

  function handleCollaborator() {
    hideMenu();
    Alert.alert('Add Collaborator', 'Feature coming soon! You can invite others to view and edit this note together.');
  }
 
  // Show/Hide menu functions
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
      const token = await AsyncStorage.getItem('authToken');

      console.log(actionType);
      const endpoint = `${API_BASE_URL}/${actionType}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text: noteText })
      });
      console.log("response: ", response);

      const text = await response.text();
      let data = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (err) {
          console.error('JSON parse error:', err);
          Alert.alert('Error', 'Server response not JSON!');
          return;
        }
      } else {
        Alert.alert('Error', 'No response from server.');
        return;
      }

      if (response.ok) {
        if (data && data.aiResponse) {
          handleAiResult(data.aiResponse, setNoteText, noteText);
        } else {
          Alert.alert('AI Result', JSON.stringify(data));
        }
      } else {
        Alert.alert('AI Error', data?.message || 'Could not process AI action.');
      }

    } catch (err) {
      console.error('AI API error:', err);
      Alert.alert('Error', 'There was a problem contacting the AI API.');
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Menu options (Save is removed)
  const menuOptions = [
    { id: 'send', label: 'Send', icon: 'send-outline', action: handleSend },
    { id: 'reminder', label: 'Reminder', icon: 'alarm-outline', action: handleReminder },
    { id: 'collaborator', label: 'Collaborator', icon: 'people-outline', action: handleCollaborator },
  ];

  // AI action options
  const aiOptions = [
    { id: 'summarize', label: 'Summarize', icon: 'analytics-outline', action: () => handleAiAction('summarize') },
    { id: 'shorten', label: 'Shorten', icon: 'remove-circle-outline', action: () => handleAiAction('shorten') },
    { id: 'expand', label: 'Expand', icon: 'add-circle-outline', action: () => handleAiAction('expand') },
    { id: 'formal', label: 'Make Formal', icon: 'school-outline', action: () => handleAiAction('make_formal') },
    { id: 'grammar', label: 'Fix Grammar', icon: 'checkmark-circle-outline', action: () => handleAiAction('fix_grammar') },
  ];

  // Checklist functions
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

  // Get stroke properties based on selected tool - Updated for eraser
  const getStrokeProperties = () => {
    switch (selectedTool) {
      case 'brush':
        return {
          strokeWidth: brushSize * 2,
          strokeOpacity: 0.8,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        };
      case 'highlighter':
        return {
          strokeWidth: brushSize * 3,
          strokeOpacity: 0.4,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        };
      case 'eraser':
        return {
          strokeWidth: eraserSize,
          strokeOpacity: 1,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        };
      default: // pen
        return {
          strokeWidth: brushSize,
          strokeOpacity: 1,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        };
    }
  };

  // ADDED: Improved drawing creation function
  const createDrawingObject = (path, tool = selectedTool) => {
    const baseDrawing = {
      id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
      path: path,
      color: selectedColor,
      tool: tool,
      timestamp: new Date().toISOString(),
      ...getStrokeProperties()
    };

    // Add tool-specific properties
    switch (tool) {
      case 'brush':
        return { ...baseDrawing, size: brushSize * 2 };
      case 'highlighter':
        return { ...baseDrawing, size: brushSize * 3 };
      case 'eraser':
        return { ...baseDrawing, size: eraserSize };
      default: // pen
        return { ...baseDrawing, size: brushSize };
    }
  };

  // Helper function to check if a point is within eraser distance of a path
  const isPointNearPath = (x, y, pathString, eraserRadius) => {
    const pathPoints = pathString.match(/\d+\.?\d*/g);
    if (!pathPoints || pathPoints.length < 2) return false;
   
    for (let i = 0; i < pathPoints.length - 1; i += 2) {
      const px = parseFloat(pathPoints[i]);
      const py = parseFloat(pathPoints[i + 1]);
      const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
      if (distance <= eraserRadius) {
        return true;
      }
    }
    return false;
  };

  // UPDATED: Drawing functions with eraser support and improved drawing creation
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => drawingMode,
    onMoveShouldSetPanResponder: () => drawingMode,
    onPanResponderGrant: (evt) => {
      if (!drawingMode) return;
      setIsDrawing(true);
      const { locationX, locationY } = evt.nativeEvent;
     
      if (selectedTool === 'eraser') {
        // For eraser, immediately start erasing at the touch point
        const updatedDrawings = drawings.filter(drawing =>
          !isPointNearPath(locationX, locationY, drawing.path, eraserSize / 2)
        );
        if (updatedDrawings.length !== drawings.length) {
          console.log('Erased drawings, remaining:', updatedDrawings.length);
          setDrawings(updatedDrawings);
        }
      } else {
        // For other tools, start a new path
        pathRef.current = `M${locationX},${locationY}`;
       
        const newDrawing = {
          path: pathRef.current,
          color: selectedColor,
          tool: selectedTool,
          ...getStrokeProperties(),
        };
       
        setCurrentDrawing(newDrawing);
      }
    },

    onPanResponderMove: (evt) => {
      if (!isDrawing || !drawingMode) return;
      const now = Date.now();
      if (now - lastUpdateTime.current < 16) return; // ~60 FPS
      lastUpdateTime.current = now;

      const { locationX, locationY } = evt.nativeEvent;
     
      if (selectedTool === 'eraser') {
        // Continue erasing as finger moves
        const updatedDrawings = drawings.filter(drawing =>
          !isPointNearPath(locationX, locationY, drawing.path, eraserSize / 2)
        );
        if (updatedDrawings.length !== drawings.length) {
          setDrawings(updatedDrawings);
        }
      } else {
        // Continue drawing path for other tools
        pathRef.current += ` L${locationX},${locationY}`;
       
        setCurrentDrawing(prev => ({
          ...prev,
          path: pathRef.current,
        }));
      }
    },

    onPanResponderRelease: () => {
      if (isDrawing && drawingMode) {
        if (selectedTool !== 'eraser' && currentDrawing && pathRef.current) {
          // Use the improved drawing creation function
          const finalDrawing = createDrawingObject(pathRef.current);
         
          console.log('Adding drawing:', finalDrawing.id, 'Tool:', finalDrawing.tool);
          setDrawings(prev => {
            const newDrawings = [...prev, finalDrawing];
            console.log('Total drawings after add:', newDrawings.length);
            return newDrawings;
          });
          setCurrentDrawing(null);
          pathRef.current = '';
        }
        setIsDrawing(false);
      }
    },
  });

  // UPDATED: Clear drawing with better confirmation
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
            console.log('Clearing all drawings');
            setDrawings([]);
            setCurrentDrawing(null);
            pathRef.current = '';
          },
        },
      ]
    );
  };

  // Toggle drawing mode
  const toggleDrawingMode = () => {
    setDrawingMode(!drawingMode);
    if (!drawingMode) {
      setShowDrawingModal(true);
    }
  };

  // Text formatting functions
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

  // Get current tool size for display
  const getCurrentToolSize = () => {
    return selectedTool === 'eraser' ? eraserSize : brushSize;
  };

  // ADDED: Drawing statistics function
  const getDrawingStats = () => {
    const stats = drawings.reduce((acc, drawing) => {
      acc.total++;
      acc.tools[drawing.tool] = (acc.tools[drawing.tool] || 0) + 1;
      return acc;
    }, { total: 0, tools: {} });
    
    console.log('Drawing statistics:', stats);
    return stats;
  };

  // Create themed styles
  const themedStyles = StyleSheet.create({
    container: {
      ...styles.container,
      backgroundColor: theme.background,
    },
    header: {
      ...styles.header,
      backgroundColor: theme.surface,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      ...styles.headerTitle,
      color: theme.text,
    },
    drawingModeBanner: {
      ...styles.drawingModeBanner,
      backgroundColor: theme.drawingBanner,
    },
    titleInput: {
      ...styles.titleInput,
      backgroundColor: theme.surface,
      borderColor: theme.border,
      color: theme.text,
    },
    textInput: {
      ...styles.textInput,
      backgroundColor: theme.surface,
      borderColor: theme.border,
      color: theme.text,
    },
    checklistContainer: {
      ...styles.checklistContainer,
      backgroundColor: theme.surface,
      borderColor: theme.border,
    },
    checklistText: {
      ...styles.checklistText,
      color: theme.text,
      borderBottomColor: theme.border,
    },
    addButtonText: {
      ...styles.addButtonText,
      color: theme.textSecondary,
    },
    toolbar: {
      ...styles.toolbar,
      backgroundColor: theme.surface,
      borderTopColor: theme.border,
    },
    toolButtonText: {
      ...styles.toolButtonText,
      color: theme.textSecondary,
    },
    activeToolButton: {
      ...styles.activeToolButton,
      backgroundColor: theme.primary,
    },
    slideMenu: {
      ...styles.slideMenu,
      backgroundColor: theme.surface,
    },
    slideMenuTitle: {
      ...styles.slideMenuTitle,
      color: theme.text,
    },
    slideMenuHandle: {
      ...styles.slideMenuHandle,
      backgroundColor: theme.border,
    },
    menuOptionText: {
      ...styles.menuOptionText,
      color: theme.text,
    },
    modalContent: {
      ...styles.modalContent,
      backgroundColor: theme.surface,
    },
    modalTitle: {
      ...styles.modalTitle,
      color: theme.text,
    },
    sectionTitle: {
      ...styles.sectionTitle,
      color: theme.text,
    },
    fontOption: {
      ...styles.fontOption,
      borderBottomColor: theme.borderLight,
    },
    selectedFontOption: {
      ...styles.selectedFontOption,
      backgroundColor: theme.surfaceSecondary,
    },
    fontText: {
      ...styles.fontText,
      color: theme.text,
    },
    selectedFontText: {
      ...styles.selectedFontText,
      color: theme.textSecondary,
    },
    fontSizeOption: {
      ...styles.fontSizeOption,
      borderColor: theme.border,
      backgroundColor: theme.surface,
    },
    selectedFontSize: {
      ...styles.selectedFontSize,
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    fontSizeText: {
      ...styles.fontSizeText,
      color: theme.text,
    },
    toolOption: {
      ...styles.toolOption,
      borderColor: theme.border,
      backgroundColor: theme.surfaceSecondary,
    },
    selectedTool: {
      ...styles.selectedTool,
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    toolLabel: {
      ...styles.toolLabel,
      color: theme.textSecondary,
    },
    brushSizeOption: {
      ...styles.brushSizeOption,
      borderColor: theme.border,
      backgroundColor: theme.surfaceSecondary,
    },
    selectedBrushSize: {
      ...styles.selectedBrushSize,
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    brushSizeText: {
      ...styles.brushSizeText,
      color: theme.textSecondary,
    },
    scrollDot: {
      ...styles.scrollDot,
      backgroundColor: theme.border,
    },
    activeDot: {
      ...styles.activeDot,
      backgroundColor: theme.primary,
    },
    savingContainer: {
      ...styles.savingContainer,
      backgroundColor: theme.surface,
    },
    savingText: {
      ...styles.savingText,
      color: theme.text,
    },
  });

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

        {/* Combined Text and Drawing Area */}
        {activeTab === 'text' && (
          <View style={styles.combinedTextDrawingArea} {...panResponder.panHandlers}>
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
              <Svg height="100%" width="100%" style={styles.svgOverlay}>
                {/* UPDATED: Better drawing rendering with validation */}
                {drawings
                  .filter(drawing => 
                    drawing && 
                    drawing.path && 
                    drawing.path.length > 0 &&
                    drawing.color
                  )
                  .map((drawing, index) => (
                    <Path
                      key={drawing.id || `drawing_${index}`}
                      d={drawing.path}
                      stroke={drawing.color}
                      strokeWidth={drawing.strokeWidth || 2}
                      strokeOpacity={drawing.strokeOpacity || 1}
                      strokeLinecap={drawing.strokeLinecap || 'round'}
                      strokeLinejoin={drawing.strokeLinejoin || 'round'}
                      fill="none"
                    />
                  ))
                }
                {currentDrawing && selectedTool !== 'eraser' && (
                  <Path
                    d={currentDrawing.path}
                    stroke={currentDrawing.color}
                    strokeWidth={currentDrawing.strokeWidth}
                    strokeOpacity={currentDrawing.strokeOpacity}
                    strokeLinecap={currentDrawing.strokeLinecap}
                    strokeLinejoin={currentDrawing.strokeLinejoin}
                    fill="none"
                  />
                )}
              </Svg>
            </View>
          </View>
        )}

        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <View style={themedStyles.checklistContainer}>
            {checklistItems.map((item) => (
              <View key={item.id} style={styles.checklistItem}>
                <TouchableOpacity onPress={() => toggleChecklistItem(item.id)}>
                  <Ionicons
                    name={item.checked ? "checkbox" : "square-outline"}
                    size={20}
                    color={item.checked ? theme.textSecondary : theme.textMuted}
                  />
                </TouchableOpacity>
                <TextInput
                  style={[themedStyles.checklistText, item.checked && styles.checkedText]}
                  value={item.text}
                  onChangeText={(text) => updateChecklistItem(item.id, text)}
                  placeholder="Add item..."
                  placeholderTextColor={theme.placeholder}
                />
                <TouchableOpacity onPress={() => deleteChecklistItem(item.id)}>
                  <Ionicons name="trash" size={18} color={theme.danger} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={addChecklistItem}>
              <Ionicons name="add" size={20} color={theme.textSecondary} />
              <Text style={themedStyles.addButtonText}>Add Item</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

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

      {/* Slide Menu Modal */}
      <Modal visible={showMenuModal} transparent animationType="none">
        <TouchableOpacity
          style={[styles.menuOverlay, { backgroundColor: theme.overlay }]}
          activeOpacity={1}
          onPress={hideMenu}
        >
          <Animated.View
            style={[
              themedStyles.slideMenu,
              { transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={themedStyles.slideMenuHandle} />
            <Text style={themedStyles.slideMenuTitle}>Note Options</Text>
           
            {menuOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.menuOption, { borderBottomColor: theme.borderLight }]}
                onPress={option.action}
              >
                <View style={styles.menuOptionContent}>
                  <Ionicons name={option.icon} size={22} color={theme.textSecondary} />
                  <Text style={themedStyles.menuOptionText}>{option.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
              </TouchableOpacity>
            ))}
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Font Modal */}
      <Modal visible={showFontModal} transparent animationType="slide">
        <TouchableOpacity
          style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}
          activeOpacity={1}
          onPress={() => setShowFontModal(false)}
        >
          <View style={themedStyles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={themedStyles.modalTitle}>Choose Font & Size</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowFontModal(false)}
              >
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
           
            {/* Font Family Section */}
            <Text style={themedStyles.sectionTitle}>Font Family</Text>
            <ScrollView style={[styles.fontSection, { borderColor: theme.border }]} showsVerticalScrollIndicator={false}>
              {fonts.map((font) => (
                <TouchableOpacity
                  key={font.value}
                  style={[
                    themedStyles.fontOption,
                    fontFamily === font.value && themedStyles.selectedFontOption
                  ]}
                  onPress={() => setFontFamily(font.value)}
                >
                  <Text style={[
                    themedStyles.fontText,
                    { fontFamily: font.value === 'System' ? undefined : font.value },
                    fontFamily === font.value && themedStyles.selectedFontText
                  ]}>
                    {font.name}
                  </Text>
                  {fontFamily === font.value && (
                    <Ionicons name="checkmark" size={20} color={theme.textSecondary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Font Size Section */}
            <Text style={themedStyles.sectionTitle}>Font Size</Text>
            <View style={styles.fontSizeContainer}>
              {fontSizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[themedStyles.fontSizeOption, fontSize === size && themedStyles.selectedFontSize]}
                  onPress={() => setFontSize(size)}
                >
                  <Text style={[themedStyles.fontSizeText, fontSize === size && styles.selectedFontSizeText]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Updated Drawing Tools Modal with Eraser Support and Scroll Indicators */}
      <Modal visible={showDrawingModal} transparent animationType="slide">
        <TouchableOpacity
          style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}
          activeOpacity={1}
          onPress={() => setShowDrawingModal(false)}
        >
          <View style={themedStyles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={themedStyles.modalTitle}>Drawing Tools</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowDrawingModal(false)}
              >
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
           
            {/* Tool Selection */}
            <Text style={themedStyles.sectionTitle}>Tools</Text>
            <View style={styles.toolsContainer}>
              {drawingTools.map((tool) => (
                <TouchableOpacity
                  key={tool.name}
                  style={[themedStyles.toolOption, selectedTool === tool.name && themedStyles.selectedTool]}
                  onPress={() => setSelectedTool(tool.name)}
                >
                  <Ionicons
                    name={tool.icon}
                    size={24}
                    color={selectedTool === tool.name ? '#fff' : theme.textSecondary}
                  />
                  <Text style={[themedStyles.toolLabel, selectedTool === tool.name && styles.selectedToolLabel]}>
                    {tool.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Color Selection - Hidden for Eraser */}
            {selectedTool !== 'eraser' && (
              <>
                <Text style={themedStyles.sectionTitle}>Colors</Text>
                <View style={styles.colorsContainer}>
                  {colors.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color, borderColor: theme.border },
                        selectedColor === color && [styles.selectedColor, { borderColor: theme.primary }]
                      ]}
                      onPress={() => setSelectedColor(color)}
                    >
                      {selectedColor === color && (
                        <Ionicons name="checkmark" size={16} color={color === '#000000' ? '#fff' : color === '#ffffff' ? '#000' : '#fff'} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Size Selection with Scroll Indicators */}
            <Text style={themedStyles.sectionTitle}>
              {selectedTool === 'eraser' ? 'Eraser Size' : 'Brush Size'}
            </Text>
            <ScrollView 
              ref={brushScrollRef}
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.brushSizeScrollView}
              onScroll={handleBrushScroll}
              scrollEventThrottle={16}
            >
              <View style={styles.brushSizeContainer}>
                {(selectedTool === 'eraser' ? eraserSizes : brushSizes).map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      themedStyles.brushSizeOption,
                      (selectedTool === 'eraser' ? eraserSize === size : brushSize === size) && themedStyles.selectedBrushSize
                    ]}
                    onPress={() => selectedTool === 'eraser' ? setEraserSize(size) : setBrushSize(size)}
                  >
                    <View style={[
                      styles.brushPreview,
                      {
                        width: Math.max(size / (selectedTool === 'eraser' ? 2 : 1), 8),
                        height: Math.max(size / (selectedTool === 'eraser' ? 2 : 1), 8),
                        backgroundColor: selectedTool === 'eraser' ? theme.surfaceSecondary : selectedColor,
                        borderRadius: Math.max(size / (selectedTool === 'eraser' ? 2 : 1), 8) / 2,
                        borderWidth: selectedTool === 'eraser' ? 2 : 0,
                        borderColor: selectedTool === 'eraser' ? theme.textSecondary : 'transparent'
                      }
                    ]} />
                    <Text style={[
                      themedStyles.brushSizeText,
                      (selectedTool === 'eraser' ? eraserSize === size : brushSize === size) && styles.selectedBrushSizeText
                    ]}>
                      {size}px
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Scroll Indicators */}
            {brushContentWidth > brushScrollWidth && (
              <View style={styles.scrollIndicatorContainer}>
                {getScrollIndicators().map((dot) => (
                  <View
                    key={dot.key}
                    style={[
                      themedStyles.scrollDot,
                      dot.active && themedStyles.activeDot
                    ]}
                  />
                ))}
              </View>
            )}

            {/* Clear Drawing Button */}
            <TouchableOpacity style={[styles.clearDrawingButton, { backgroundColor: theme.danger }]} onPress={clearDrawing}>
              <Ionicons name="trash" size={20} color="#fff" />
              <Text style={styles.clearDrawingText}>Clear All Drawings</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* AI Modal */}
      <Modal visible={showAiModal} transparent animationType="none">
        <TouchableOpacity
          style={[styles.menuOverlay, { backgroundColor: theme.overlay }]}
          activeOpacity={1}
          onPress={closeAiMenu}
        >
          <Animated.View
            style={[
              themedStyles.slideMenu,
              { transform: [{ translateY: aiSlideAnim }] }
            ]}
          >
            <View style={themedStyles.slideMenuHandle} />
            <Text style={themedStyles.slideMenuTitle}>AI Actions</Text>
           
            {aiOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.menuOption, { borderBottomColor: theme.borderLight }]}
                onPress={option.action}
              >
                <View style={styles.menuOptionContent}>
                  <Ionicons name={option.icon} size={22} color={theme.textSecondary} />
                  <Text style={themedStyles.menuOptionText}>{option.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
              </TouchableOpacity>
            ))}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
     {/* Saving Overlay */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={isSaving}
      >
        <View style={[styles.savingOverlay, { backgroundColor: theme.overlay }]}>
            <View style={themedStyles.savingContainer}>
                <ActivityIndicator size="large" color={theme.textSecondary} />
                <Text style={themedStyles.savingText}>Saving...</Text>
            </View>
        </View>
      </Modal>
      {/* AI Processing Overlay */}
    <Modal
        transparent={true}
        animationType="fade"
        visible={isAiProcessing}
    >
        <View style={[styles.savingOverlay, { backgroundColor: theme.overlay }]}>
            <View style={themedStyles.savingContainer}>
                <ActivityIndicator size="large" color={theme.textSecondary} />
                <Text style={themedStyles.savingText}>AI is doing its work...</Text>
            </View>
        </View>
      </Modal>
    </>
  );
}

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
    paddingTop: 46,
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
  // Drawing Mode Banner Styles
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
  // Combined Text and Drawing Area Styles
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
  drawingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  // Slide Menu Styles
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
  // Modal Styles
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
    marginBottom: 12,
    marginTop: 8,
  },
  // Font Modal Styles
  fontSection: {
    maxHeight: 200,
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 8,
  },
  fontOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  selectedFontOption: {
    backgroundColor: '#f7fafc',
  },
  fontText: {
    fontSize: 16,
  },
  selectedFontText: {
    fontWeight: '600',
  },
  fontSizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  fontSizeOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    minWidth: 50,
    alignItems: 'center',
  },
  selectedFontSize: {
    borderColor: '#4a5568',
  },
  fontSizeText: {
    fontWeight: '500',
  },
  selectedFontSizeText: {
    color: '#fff',
    fontWeight: '600',
  },
  // Drawing Tools Modal Styles
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
  // Scroll Indicator Styles
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
  // Clear Drawing Button Style
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
});