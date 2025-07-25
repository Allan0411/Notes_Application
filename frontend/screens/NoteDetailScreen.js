import React, { useState, useRef, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Alert, Modal, Dimensions, SafeAreaView, StatusBar, PanResponder,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';

// Import the ThemeContext directly from its path
import { ThemeContext } from '../ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Define your color palettes for light and dark modes
// These should match or be consistent with what you expect from your ThemeContext
const lightColors = {
  background: '#edf2f7',
  cardBackground: '#fff', // Used for main content areas like note inputs, drawing area
  text: '#2d3748',
  subText: '#718096',
  headerBackground: '#fff', // Header of NoteDetailScreen
  headerText: '#2d3748',
  iconColor: '#4a5568',
  borderColor: '#e2e8f0',
  toolbarBackground: '#fff',
  toolbarButton: '#4a5568', // For active toolbar buttons and main icons
  toolbarButtonText: '#4a5568',
  activeToolbarButtonBackground: '#4a5568',
  activeToolbarButtonText: '#fff',
  deleteIcon: '#d11a2a',
  placeholderText: '#718096',
  modalBackground: '#fff',
  modalHeaderBorder: '#e2e8f0',
  sectionTitle: '#2d3748',
  fontOptionBackground: '#fff',
  selectedFontOptionBackground: '#f7fafc',
  selectedFontOptionText: '#4a5568',
  fontSizeOptionBackground: '#fff',
  selectedFontSizeBackground: '#4a5568',
  selectedFontSizeText: '#fff',
  toolOptionBackground: '#f7fafc',
  selectedToolBackground: '#4a5568',
  selectedToolIcon: '#fff',
  selectedToolLabel: '#fff',
  colorOptionBorder: '#e2e8f0',
  selectedColorOptionBorder: '#4a5568',
  brushSizeOptionBackground: '#f7fafc',
  selectedBrushSizeBackground: '#4a5568',
  selectedBrushSizeText: '#fff',
  drawingAreaBackground: '#f8f9fa',
  transparentOverlay: 'rgba(0,0,0,0.5)',
  slideMenuBackground: '#fff',
  slideMenuHandle: '#e2e8f0',
  menuOptionBorder: '#f7fafc',
  // Special colors that might need adjustments based on the primary color
  whiteTextOnDark: '#fff', // For checkmark in dark color on light bg, or vice versa
  blackTextOnLight: '#000',
};

const darkColors = {
  background: '#1a202c',
  cardBackground: '#2d3748',
  text: '#e2e8f0',
  subText: '#a0aec0',
  headerBackground: '#2d3748',
  headerText: '#fff',
  iconColor: '#cbd5e0',
  borderColor: '#4a5568',
  toolbarBackground: '#2d3748',
  toolbarButton: '#a0aec0',
  toolbarButtonText: '#a0aec0',
  activeToolbarButtonBackground: '#4a5568',
  activeToolbarButtonText: '#fff',
  deleteIcon: '#fc8181',
  placeholderText: '#a0aec0',
  modalBackground: '#2d3748',
  modalHeaderBorder: '#4a5568',
  sectionTitle: '#e2e8f0',
  fontOptionBackground: '#2d3748',
  selectedFontOptionBackground: '#4a5568',
  selectedFontOptionText: '#fff',
  fontSizeOptionBackground: '#2d3748',
  selectedFontSizeBackground: '#4a5568',
  selectedFontSizeText: '#fff',
  toolOptionBackground: '#4a5568',
  selectedToolBackground: '#63b3ed', // A brighter blue for selection in dark mode
  selectedToolIcon: '#fff',
  selectedToolLabel: '#fff',
  colorOptionBorder: '#4a5568',
  selectedColorOptionBorder: '#63b3ed',
  brushSizeOptionBackground: '#4a5568',
  selectedBrushSizeBackground: '#63b3ed',
  selectedBrushSizeText: '#fff',
  drawingAreaBackground: '#1a202c',
  transparentOverlay: 'rgba(0,0,0,0.7)',
  slideMenuBackground: '#2d3748',
  slideMenuHandle: '#4a5568',
  menuOptionBorder: '#4a5568',
  // Special colors for contrast
  whiteTextOnDark: '#000', // For checkmark in dark color on light bg, or vice versa
  blackTextOnLight: '#fff',
};


export default function NoteDetailScreen({ route, navigation }) {
  const { note, isNewNote } = route.params;
  const [isSaving, setIsSaving] = useState(false);

  // Access the activeTheme from your ThemeContext
  const { activeTheme } = useContext(ThemeContext);
  // Determine the current color palette based on activeTheme
  const colors = activeTheme === 'dark' ? darkColors : lightColors;


  // Note content states
  const [noteText, setNoteText] = useState(note?.textContents || '');
  const [noteTitle, setNoteTitle] = useState(note?.title || '');
  const [checklistItems, setChecklistItems] = useState(note?.checklistItems || []);
  const [drawings, setDrawings] = useState(note?.drawings || []);

  // UI states
  const [activeTab, setActiveTab] = useState('text');
  const [showFontModal, setShowFontModal] = useState(false);
  const [showDrawingModal, setShowDrawingModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);

  // Text formatting states
  const [fontSize, setFontSize] = useState(note?.fontSize || 16);
  const [fontFamily, setFontFamily] = useState(note?.fontFamily || 'System');
  const [isBold, setIsBold] = useState(note?.isBold || false);
  const [isItalic, setIsItalic] = useState(note?.isItalic || false);
  const [textAlign, setTextAlign] = useState(note?.textAlign || 'left');

  // Drawing tool states
  const [selectedTool, setSelectedTool] = useState('pen');
  const [selectedColor, setSelectedColor] = useState('#4a5568'); // Initial color, might want to make this dynamic too
  const [brushSize, setBrushSize] = useState(2);
  const [currentDrawing, setCurrentDrawing] = useState(null);

  const pathRef = useRef('');
  let lastUpdateTime = useRef(Date.now());

  // Animation for slide menu
  const slideAnim = useRef(new Animated.Value(300)).current;

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

  // Drawing tool options
  const drawingTools = [
    { name: 'pen', icon: 'create', label: 'Pen' },
    { name: 'brush', icon: 'brush', label: 'Brush' },
    { name: 'highlighter', icon: 'color-fill', label: 'Highlighter' },
  ];

  const drawingColors = [ // Renamed to avoid conflict with `colors` from theme
    '#000000', '#4a5568', '#2d3748', '#1a202c',
    '#e53e3e', '#d69e2e', '#38a169', '#3182ce',
    '#805ad5', '#d53f8c', '#ed8936', '#48bb78',
    '#4299e1', '#9f7aea', '#ed64a6', '#f56565',
  ];

  const brushSizes = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20];



  // Save note function
  const generateRandomId = () => Math.floor(100000 + Math.random() * 899999);

  // POST: Create new note
  const createNote = async (note) => {
    try {

      const token = await AsyncStorage.getItem('authToken');
      console.log('Sending payload:', note);
      console.log('Auth token:', token);

      const response = await fetch(API_BASE_URL + '/Notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(note)
      });

      // Print HTTP status code!
      console.log('Response status code:', response.status);

      // Optionally print status text (most fetch implementations)
      console.log('Response status text:', response.statusText);

      // Carefully parse only if response has content
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
      // If your API expects PUT or PATCH, change accordingly:
      const response = await fetch(`${API_BASE_URL + '/Notes'}/${id}`, {
        method: 'PUT', // or 'PUT' / 'PATCH' per your API
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(note)
      });
      console.log('Response status code:', response.status);
      console.log('Response status text:', response.statusText);
      const text = await response.text();
      console.log("text: ", text)
      if (!text) {
        return true;
      }
      return JSON.parse(text)
    } catch (err) {
      console.error('Error updating note:', err);
      throw err;
    }
  };

  // Save note function
  const saveNote = async () => {
    console.log("burron clikect");
    if (isSaving) return; //lmfao this is all it took to stop double taps

    if (!noteText.trim() && !noteTitle.trim() && checklistItems.length === 0 && drawings.length === 0) {
      Alert.alert('Empty Note', 'Please add some content!');
      return;
    }

    setIsSaving(true);
    let notePayload = {
      id: note?.id || generateRandomId(),
      title: noteTitle || 'Untitled Note',
      textContents: noteText,
      s3Contents: "tempor est laboris",
      // ...other fields as needed
    };

    try {
      if (isNewNote) {
        // JUST CREATE, nothing else for a new note
        const created = await createNote(notePayload);
        // if (onSave) onSave(created); // REMOVED as per previous fix
        Alert.alert('Success', 'Note created successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        // ONLY update existing note
        const updated = await updateNote(note?.id, notePayload);
        // if (onSave) { // REMOVED as per previous fix
        //   if (updated === true || updated == null) {
        //     onSave({ ...note, ...notePayload });
        //   } else {
        //     onSave(updated);
        //   }
        // }
        Alert.alert('Success', 'Note updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }

    } catch (err) {
      Alert.alert('Error', 'There was a problem saving your note.', err.message);
    }
    finally {
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

  //menuOptions
  // Menu options
  const menuOptions = [
    { id: 'save', label: 'Save', icon: 'save-outline', action: async () => {
      hideMenu();
      await saveNote();
    } },
    { id: 'send', label: 'Send', icon: 'send-outline', action: handleSend },
    { id: 'reminder', label: 'Reminder', icon: 'alarm-outline', action: handleReminder },
    { id: 'collaborator', label: 'Collaborator', icon: 'people-outline', action: handleCollaborator },
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

  // Get stroke properties based on selected tool
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
      default: // pen
        return {
          strokeWidth: brushSize,
          strokeOpacity: 1,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        };
    }
  };

  // Drawing functions with PanResponder
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      setIsDrawing(true);
      const { locationX, locationY } = evt.nativeEvent;
      pathRef.current = `M${locationX},${locationY}`;

      const newDrawing = {
        path: pathRef.current,
        color: selectedColor,
        tool: selectedTool,
        ...getStrokeProperties(),
      };

      setCurrentDrawing(newDrawing);
    },

    onPanResponderMove: (evt) => {
      if (!isDrawing) return;
      const now = Date.now();
      if (now - lastUpdateTime.current < 16) return; // ~60 FPS
      lastUpdateTime.current = now;

      const { locationX, locationY } = evt.nativeEvent;
      pathRef.current += ` L${locationX},${locationY}`;

      setCurrentDrawing(prev => ({
        ...prev,
        path: pathRef.current,
      }));
    },

    onPanResponderRelease: () => {
      if (isDrawing && currentDrawing) {
        const finalDrawing = {
          ...currentDrawing,
          path: pathRef.current,
          id: Date.now().toString(),
        };

        setDrawings(prev => [...prev, finalDrawing]);
        setCurrentDrawing(null);
        pathRef.current = '';
        setIsDrawing(false);
      }
    },
  });

  const clearDrawing = () => {
    Alert.alert(
      'Clear Drawing',
      'Are you sure you want to clear all drawings?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setDrawings([]);
            setCurrentDrawing(null);
            pathRef.current = '';
          },
        },
      ]
    );
  };

  // AI Summarizer (mock function)
  const aiSummarize = () => {
    if (!noteText.trim()) {
      Alert.alert('No Content', 'Please add some text to summarize!');
      return;
    }

    const summary = noteText.length > 100 ?
      `Summary: ${noteText.substring(0, 100)}...` :
      `Summary: ${noteText}`;
    Alert.alert('AI Summary', summary);
  };

  // Text formatting functions
  const getTextStyle = () => ({
    fontSize,
    fontFamily: fontFamily === 'System' ? undefined : fontFamily,
    fontWeight: isBold ? 'bold' : 'normal',
    fontStyle: isItalic ? 'italic' : 'normal',
    textAlign,
    color: colors.text, // Apply text color
  });

  const getAlignmentIcon = () => {
    // Using distinct Ionicons that exist and can imply alignment
    switch(textAlign) {
      case 'left': return 'menu-outline'; // Generic lines, common for left align
      case 'center': return 'reorder-four-outline'; // Four lines, visually distinct
      case 'right': return 'reorder-two-outline'; // Two lines, distinct and simple
      default: return 'menu-outline';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* StatusBar color based on header background */}
      <StatusBar barStyle={activeTheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.headerBackground} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground, borderBottomColor: colors.borderColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.headerText }]}>Note Detail</Text>
        <TouchableOpacity onPress={showMenu}>
          <Ionicons name="ellipsis-vertical" size={24} color={colors.headerText} />
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <ScrollView style={styles.contentContainer}>
        {/* Title Input */}
        <TextInput
          style={[
            styles.titleInput,
            getTextStyle(),
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.borderColor,
              color: colors.text // Ensure text color is applied
            }
          ]}
          placeholder="Note Title"
          value={noteTitle}
          onChangeText={setNoteTitle}
          placeholderTextColor={colors.placeholderText}
        />

        {/* Text Tab */}
        {activeTab === 'text' && (
          <TextInput
            style={[
              styles.textInput,
              getTextStyle(),
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.borderColor,
                color: colors.text // Ensure text color is applied
              }
            ]}
            placeholder="Write your note..."
            value={noteText}
            onChangeText={setNoteText}
            multiline
            placeholderTextColor={colors.placeholderText}
          />
        )}

        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <View style={[styles.checklistContainer, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
            {checklistItems.map((item) => (
              <View key={item.id} style={styles.checklistItem}>
                <TouchableOpacity onPress={() => toggleChecklistItem(item.id)}>
                  <Ionicons
                    name={item.checked ? "checkbox" : "square-outline"}
                    size={20}
                    color={item.checked ? colors.iconColor : colors.subText}
                  />
                </TouchableOpacity>
                <TextInput
                  style={[
                    styles.checklistText,
                    item.checked && { textDecorationLine: 'line-through', color: colors.subText }, // Apply checked text color here
                    { color: colors.text, borderBottomColor: colors.borderColor } // Apply text color
                  ]}
                  value={item.text}
                  onChangeText={(text) => updateChecklistItem(item.id, text)}
                  placeholder="Add item..."
                  placeholderTextColor={colors.placeholderText}
                />
                <TouchableOpacity onPress={() => deleteChecklistItem(item.id)}>
                  <Ionicons name="trash" size={18} color={colors.deleteIcon} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={addChecklistItem}>
              <Ionicons name="add" size={20} color={colors.iconColor} />
              <Text style={[styles.addButtonText, { color: colors.iconColor }]}>Add Item</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Drawing Tab */}
        {activeTab === 'drawing' && (
          <View style={[styles.drawingContainer, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
            {/* Drawing Tools Header */}
            <View style={[styles.drawingToolsHeader, { borderBottomColor: colors.borderColor }]}>
              <TouchableOpacity
                style={[styles.drawingSettingsButton, { backgroundColor: colors.background }]}
                onPress={() => setShowDrawingModal(true)}
              >
                <Ionicons name="settings" size={16} color={colors.iconColor} />
                <Text style={[styles.drawingSettingsText, { color: colors.iconColor }]}>Tools</Text>
              </TouchableOpacity>

              <View style={styles.currentToolInfo}>
                <View style={[styles.colorIndicator, { backgroundColor: selectedColor, borderColor: colors.borderColor }]} />
                <Text style={[styles.toolText, { color: colors.iconColor }]}>{selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)}</Text>
                <Text style={[styles.sizeText, { color: colors.subText }]}>{brushSize}px</Text>
              </View>

              <TouchableOpacity style={styles.clearButton} onPress={clearDrawing}>
                <Ionicons name="trash" size={16} color={colors.deleteIcon} />
              </TouchableOpacity>
            </View>

            <View
              style={[styles.drawingArea, { borderColor: colors.borderColor, backgroundColor: colors.drawingAreaBackground }]}
              {...panResponder.panHandlers}
            >
              <Svg height="400" width="100%">
                {drawings.map((drawing, index) => (
                  <Path
                    key={drawing.id || index}
                    d={drawing.path}
                    stroke={drawing.color}
                    strokeWidth={drawing.strokeWidth}
                    strokeOpacity={drawing.strokeOpacity}
                    strokeLinecap={drawing.strokeLinecap}
                    strokeLinejoin={drawing.strokeLinejoin}
                    fill="none"
                  />
                ))}
                {currentDrawing && (
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
      </ScrollView>

      {/* Bottom Toolbar */}
      <View style={[styles.toolbar, { backgroundColor: colors.toolbarBackground, borderTopColor: colors.borderColor }]}>
        {/* Content Type Buttons */}
        <TouchableOpacity
          style={[
            styles.toolButton,
            activeTab === 'text' && styles.activeToolButton,
            activeTab === 'text' && { backgroundColor: colors.activeToolbarButtonBackground }
          ]}
          onPress={() => setActiveTab('text')}
        >
          <Ionicons name="document-text" size={20} color={activeTab === 'text' ? colors.activeToolbarButtonText : colors.toolbarButton} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toolButton,
            activeTab === 'checklist' && styles.activeToolButton,
            activeTab === 'checklist' && { backgroundColor: colors.activeToolbarButtonBackground }
          ]}
          onPress={() => setActiveTab('checklist')}
        >
          <Ionicons name="list" size={20} color={activeTab === 'checklist' ? colors.activeToolbarButtonText : colors.toolbarButton} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toolButton,
            activeTab === 'drawing' && styles.activeToolButton,
            activeTab === 'drawing' && { backgroundColor: colors.activeToolbarButtonBackground }
          ]}
          onPress={() => setActiveTab('drawing')}
        >
          <Ionicons name="brush" size={20} color={activeTab === 'drawing' ? colors.activeToolbarButtonText : colors.toolbarButton} />
        </TouchableOpacity>

        {/* Formatting Tools */}
        <TouchableOpacity style={styles.toolButton} onPress={() => setShowFontModal(true)}>
          <Ionicons name="text" size={20} color={colors.toolbarButton} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toolButton,
            isBold && styles.activeToolButton,
            isBold && { backgroundColor: colors.activeToolbarButtonBackground }
          ]}
          onPress={() => setIsBold(!isBold)}
        >
          <Text style={[styles.toolButtonText, { fontWeight: 'bold', color: isBold ? colors.activeToolbarButtonText : colors.toolbarButtonText }]}>B</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toolButton,
            isItalic && styles.activeToolButton,
            isItalic && { backgroundColor: colors.activeToolbarButtonBackground }
          ]}
          onPress={() => setIsItalic(!isItalic)}
        >
          <Text style={[styles.toolButtonText, { fontStyle: 'italic', color: isItalic ? colors.activeToolbarButtonText : colors.toolbarButtonText }]}>I</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.toolButton, {borderColor: colors.borderColor}]} onPress={() => {
          const aligns = ['left', 'center', 'right'];
          const currentIndex = aligns.indexOf(textAlign);
          const nextAlign = aligns[(currentIndex + 1) % aligns.length];
          setTextAlign(nextAlign);
        }}>
          <Ionicons name={getAlignmentIcon()} size={20} color={colors.toolbarButton} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolButton} onPress={aiSummarize}>
          <Ionicons name="bulb" size={20} color={colors.toolbarButton} />
        </TouchableOpacity>
      </View>

      {/* Slide Menu Modal */}
      <Modal visible={showMenuModal} transparent animationType="none">
        <TouchableOpacity
          style={[styles.menuOverlay, { backgroundColor: colors.transparentOverlay }]}
          activeOpacity={1}
          onPress={hideMenu}
        >
          <Animated.View
            style={[
              styles.slideMenu,
              {
                transform: [{ translateY: slideAnim }],
                backgroundColor: colors.slideMenuBackground,
              }
            ]}
          >
            <View style={[styles.slideMenuHandle, { backgroundColor: colors.slideMenuHandle }]} />
            <Text style={[styles.slideMenuTitle, { color: colors.text }]}>Note Options</Text>

            {menuOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.menuOption, { borderBottomColor: colors.menuOptionBorder }]}
                onPress={option.action}
              >
                <View style={styles.menuOptionContent}>
                  <Ionicons name={option.icon} size={22} color={colors.iconColor} />
                  <Text style={[styles.menuOptionText, { color: colors.text }]}>{option.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.subText} />
              </TouchableOpacity>
            ))}
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Font Modal */}
      <Modal visible={showFontModal} transparent animationType="slide">
        <TouchableOpacity
          style={[styles.modalOverlay, { backgroundColor: colors.transparentOverlay }]}
          activeOpacity={1}
          onPress={() => setShowFontModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.modalBackground }]} onStartShouldSetResponder={() => true}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.modalHeaderBorder }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Choose Font & Size</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowFontModal(false)}
              >
                <Ionicons name="close" size={24} color={colors.iconColor} />
              </TouchableOpacity>
            </View>

            {/* Font Family Section */}
            <Text style={[styles.sectionTitle, { color: colors.sectionTitle }]}>Font Family</Text>
            <ScrollView style={[styles.fontSection, { borderColor: colors.borderColor }]} showsVerticalScrollIndicator={false}>
              {fonts.map((font) => (
                <TouchableOpacity
                  key={font.value}
                  style={[
                    styles.fontOption,
                    { borderBottomColor: colors.menuOptionBorder, backgroundColor: colors.fontOptionBackground },
                    fontFamily === font.value && [styles.selectedFontOption, { backgroundColor: colors.selectedFontOptionBackground }]
                  ]}
                  onPress={() => setFontFamily(font.value)}
                >
                  <Text style={[
                    styles.fontText,
                    { fontFamily: font.value === 'System' ? undefined : font.value, color: colors.text },
                    fontFamily === font.value && [styles.selectedFontText, { color: colors.selectedFontOptionText }]
                  ]}>
                    {font.name}
                  </Text>
                  {fontFamily === font.value && (
                    <Ionicons name="checkmark" size={20} color={colors.iconColor} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Font Size Section */}
            <Text style={[styles.sectionTitle, { color: colors.sectionTitle }]}>Font Size</Text>
            <View style={styles.fontSizeContainer}>
              {fontSizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.fontSizeOption,
                    { borderColor: colors.borderColor, backgroundColor: colors.fontSizeOptionBackground },
                    fontSize === size && [styles.selectedFontSize, { backgroundColor: colors.selectedFontSizeBackground, borderColor: colors.selectedFontSizeBackground }]
                  ]}
                  onPress={() => setFontSize(size)}
                >
                  <Text style={[styles.fontSizeText, { color: colors.text }, fontSize === size && [styles.selectedFontSizeText, { color: colors.selectedFontSizeText }]]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Drawing Tools Modal */}
      <Modal visible={showDrawingModal} transparent animationType="slide">
        <TouchableOpacity
          style={[styles.modalOverlay, { backgroundColor: colors.transparentOverlay }]}
          activeOpacity={1}
          onPress={() => setShowDrawingModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.modalBackground }]} onStartShouldSetResponder={() => true}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.modalHeaderBorder }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Drawing Tools</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowDrawingModal(false)}
              >
                <Ionicons name="close" size={24} color={colors.iconColor} />
              </TouchableOpacity>
            </View>

            {/* Tool Selection */}
            <Text style={[styles.sectionTitle, { color: colors.sectionTitle }]}>Tools</Text>
            <View style={styles.toolsContainer}>
              {drawingTools.map((tool) => (
                <TouchableOpacity
                  key={tool.name}
                  style={[
                    styles.toolOption,
                    { borderColor: colors.borderColor, backgroundColor: colors.toolOptionBackground },
                    selectedTool === tool.name && [styles.selectedTool, { backgroundColor: colors.selectedToolBackground, borderColor: colors.selectedToolBackground }]
                  ]}
                  onPress={() => setSelectedTool(tool.name)}
                >
                  <Ionicons
                    name={tool.icon}
                    size={24}
                    color={selectedTool === tool.name ? colors.selectedToolIcon : colors.iconColor}
                  />
                  <Text style={[styles.toolLabel, { color: colors.iconColor }, selectedTool === tool.name && [styles.selectedToolLabel, { color: colors.selectedToolLabel }]]}>
                    {tool.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Color Selection */}
            <Text style={[styles.sectionTitle, { color: colors.sectionTitle }]}>Colors</Text>
            <View style={styles.colorsContainer}>
              {drawingColors.map((color) => ( // Using drawingColors
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color, borderColor: colors.colorOptionBorder },
                    selectedColor === color && [styles.selectedColor, { borderColor: colors.selectedColorOptionBorder }]
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={
                        // Logic to pick a contrasting color for the checkmark
                        color === '#000000' ? colors.whiteTextOnDark :
                        color === '#ffffff' ? colors.blackTextOnLight :
                        colors.whiteTextOnDark // Default to white for other colors
                      }
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Brush Size Selection */}
            <Text style={[styles.sectionTitle, { color: colors.sectionTitle }]}>Brush Size</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.brushSizeScrollView}>
              <View style={styles.brushSizeContainer}>
                {brushSizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.brushSizeOption,
                      { borderColor: colors.borderColor, backgroundColor: colors.brushSizeOptionBackground },
                      brushSize === size && [styles.selectedBrushSize, { backgroundColor: colors.selectedBrushSizeBackground, borderColor: colors.selectedBrushSizeBackground }]
                    ]}
                    onPress={() => setBrushSize(size)}
                  >
                    <View style={[
                      styles.brushPreview,
                      {
                        width: Math.max(size, 8),
                        height: Math.max(size, 8),
                        backgroundColor: selectedColor, // Brush preview color should be the selected drawing color
                        borderRadius: Math.max(size, 8) / 2
                      }
                    ]} />
                    <Text style={[styles.brushSizeText, { color: colors.iconColor }, brushSize === size && [styles.selectedBrushSizeText, { color: colors.selectedBrushSizeText }]]}>
                      {size}px
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
    marginBottom: 10, // Added margin for spacing
  },
  textInput: {
    borderRadius: 4,
    padding: 12,
    minHeight: 570,
    textAlignVertical: 'top',
    borderWidth: 1,
    marginBottom: 10, // Added margin for spacing
  },
  checklistContainer: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    minHeight: 570,
    marginBottom: 10, // Added margin for spacing
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
    // color will be applied dynamically
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
  drawingContainer: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    marginBottom: 10, // Added margin for spacing
  },
  drawingToolsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  drawingSettingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  drawingSettingsText: {
    fontSize: 12,
    fontWeight: '500',
  },
  currentToolInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  toolText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sizeText: {
    fontSize: 12,
  },
  drawingArea: {
    height: 400,
    borderWidth: 1,
    borderRadius: 8,
  },
  clearButton: {
    padding: 6,
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
    // Background color applied dynamically
  },
  toolButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  activeToolButtonText: {
    // Color applied dynamically
  },
  textAlignButton: {
    borderWidth: 1,
    // Border color applied dynamically
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
    // Background color applied dynamically
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
    // Background and border color applied dynamically
  },
  fontSizeText: {
    fontWeight: '500',
  },
  selectedFontSizeText: {
    fontWeight: '600',
  },
  // Drawing Tools Modal Styles
  toolsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
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
    // Background and border color applied dynamically
  },
  toolLabel: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
  selectedToolLabel: {
    // Color applied dynamically
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
    // Border color applied dynamically
  },
  brushSizeScrollView: {
    marginBottom: 10,
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
    // Background and border color applied dynamically
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
    // Color applied dynamically
  },
});