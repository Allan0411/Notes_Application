import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Alert, Modal, Dimensions, SafeAreaView, StatusBar, PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function NoteDetailScreen({ route, navigation }) {
  const { note, onSave,isNewNote } = route.params;
  const [isSaving,setIsSaving]=useState(false);
  // Note content states
  const [noteText, setNoteText] = useState(note?.textContents || '');
  const [noteTitle, setNoteTitle] = useState(note?.title || '');
  const [checklistItems, setChecklistItems] = useState(note?.checklistItems || []);
  const [drawings, setDrawings] = useState(note?.drawings || []);
  
  // UI states
  const [activeTab, setActiveTab] = useState('text');
  const [showFontModal, setShowFontModal] = useState(false);
  const [showDrawingModal, setShowDrawingModal] = useState(false);
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
  const [selectedColor, setSelectedColor] = useState('#4a5568');
  const [brushSize, setBrushSize] = useState(2);
  const [currentDrawing, setCurrentDrawing] = useState(null);

  const pathRef = useRef('');
  let lastUpdateTime = useRef(Date.now());

  // Font options
  const fonts = [
    { name: 'System', value: 'System' },
    { name: 'Arial', value: 'Arial' },
    { name: 'Times New Roman', value: 'Times New Roman' },
    { name: 'Courier New', value: 'Courier New' },
    { name: 'Helvetica', value: 'Helvetica' },
  ];

  const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32];

  // Drawing tool options
  const drawingTools = [
    { name: 'pen', icon: 'create', label: 'Pen' },
    { name: 'brush', icon: 'brush', label: 'Brush' },
    { name: 'highlighter', icon: 'color-fill', label: 'Highlighter' },
  ];

  const colors = [
    '#000000', '#4a5568', '#2d3748', '#1a202c',
    '#e53e3e', '#d69e2e', '#38a169', '#3182ce',
    '#805ad5', '#d53f8c', '#ed8936', '#48bb78',
    '#4299e1', '#9f7aea', '#ed64a6', '#f56565',
  ];

  const brushSizes = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20];


  // Replace with your API endpoint(s)

// Simulate random integer for id (for new note creation)
const generateRandomId = () => Math.floor(100000 + Math.random() * 899999);

// POST: Create new note
const createNote = async (note) => {
  try {
  
    const token= await AsyncStorage.getItem('authToken');
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



// GET: Fetch a note by id
const fetchNoteById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL+'/Notes'}/${id}`);
    return await response.json();
  } catch (err) {
    console.error('Error fetching note:', err);
    throw err;
  }
};

// POST/PUT: Update a note by id
const updateNote = async (id, note) => {
  try {
    const token=await AsyncStorage.getItem('authToken');
    // If your API expects PUT or PATCH, change accordingly:
    const response = await fetch(`${API_BASE_URL+'/Notes'}/${id}`, {
      method: 'PUT', // or 'PUT' / 'PATCH' per your API
      headers: { 'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
       },
      body: JSON.stringify(note)
    });
     console.log('Response status code:', response.status);
      console.log('Response status text:', response.statusText);
    const text = await response.text();
    console.log("text: ",text)
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
    if(isSaving) return; //lmfao this is all it took to stop double taps

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
      if (onSave) onSave(created);
      Alert.alert('Success', 'Note created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
  // ONLY update existing note
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
    Alert.alert('Error', 'There was a problem saving your note.');
  }
  finally{
    setIsSaving(false);
  }
};



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
  });

  const getAlignmentIcon = () => {
    return '☲';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#edf2f7" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#4a5568" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Note Detail</Text>
        <TouchableOpacity onPress={saveNote} disabled={isSaving}>
          {isSaving?(
            <View style={styles.saveText}>
              <ActivityIndicator size="small" color="#4a5568" />
            <Text style={styles.saveText}>Saving...</Text>
            </View>
          ):(
           <Text style={styles.saveText}>Save</Text>
          )}
          
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <ScrollView style={styles.contentContainer}>
        {/* Title Input */}
        <TextInput
          style={[styles.titleInput, getTextStyle()]}
          placeholder="Note Title"
          value={noteTitle}
          onChangeText={setNoteTitle}
          placeholderTextColor="#718096"
        />

        {/* Text Tab */}
        {activeTab === 'text' && (
          <TextInput
            style={[styles.textInput, getTextStyle()]}
            placeholder="Write your note..."
            value={noteText}
            onChangeText={setNoteText}
            multiline
            placeholderTextColor="#718096"
          />
        )}

        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <View style={styles.checklistContainer}>
            {checklistItems.map((item) => (
              <View key={item.id} style={styles.checklistItem}>
                <TouchableOpacity onPress={() => toggleChecklistItem(item.id)}>
                  <Ionicons 
                    name={item.checked ? "checkbox" : "square-outline"} 
                    size={20} 
                    color={item.checked ? "#4a5568" : "#718096"} 
                  />
                </TouchableOpacity>
                <TextInput
                  style={[styles.checklistText, item.checked && styles.checkedText]}
                  value={item.text}
                  onChangeText={(text) => updateChecklistItem(item.id, text)}
                  placeholder="Add item..."
                  placeholderTextColor="#718096"
                />
                <TouchableOpacity onPress={() => deleteChecklistItem(item.id)}>
                  <Ionicons name="trash" size={18} color="#d11a2a" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={addChecklistItem}>
              <Ionicons name="add" size={20} color="#4a5568" />
              <Text style={styles.addButtonText}>Add Item</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Drawing Tab */}
        {activeTab === 'drawing' && (
          <View style={styles.drawingContainer}>
            {/* Drawing Tools Header */}
            <View style={styles.drawingToolsHeader}>
              <TouchableOpacity 
                style={styles.drawingSettingsButton} 
                onPress={() => setShowDrawingModal(true)}
              >
                <Ionicons name="settings" size={16} color="#4a5568" />
                <Text style={styles.drawingSettingsText}>Tools</Text>
              </TouchableOpacity>
              
              <View style={styles.currentToolInfo}>
                <View style={[styles.colorIndicator, { backgroundColor: selectedColor }]} />
                <Text style={styles.toolText}>{selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)}</Text>
                <Text style={styles.sizeText}>{brushSize}px</Text>
              </View>
              
              <TouchableOpacity style={styles.clearButton} onPress={clearDrawing}>
                <Ionicons name="trash" size={16} color="#d11a2a" />
              </TouchableOpacity>
            </View>

            <View
              style={styles.drawingArea}
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
      <View style={styles.toolbar}>
        {/* Content Type Buttons */}
        <TouchableOpacity 
          style={[styles.toolButton, activeTab === 'text' && styles.activeToolButton]} 
          onPress={() => setActiveTab('text')}
        >
          <Ionicons name="document-text" size={20} color={activeTab === 'text' ? '#fff' : '#4a5568'} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.toolButton, activeTab === 'checklist' && styles.activeToolButton]} 
          onPress={() => setActiveTab('checklist')}
        >
          <Ionicons name="list" size={20} color={activeTab === 'checklist' ? '#fff' : '#4a5568'} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.toolButton, activeTab === 'drawing' && styles.activeToolButton]} 
          onPress={() => setActiveTab('drawing')}
        >
          <Ionicons name="brush" size={20} color={activeTab === 'drawing' ? '#fff' : '#4a5568'} />
        </TouchableOpacity>

        {/* Formatting Tools */}
        <TouchableOpacity style={styles.toolButton} onPress={() => setShowFontModal(true)}>
          <Ionicons name="text" size={20} color="#4a5568" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.toolButton, isBold && styles.activeToolButton]} 
          onPress={() => setIsBold(!isBold)}
        >
          <Text style={[styles.toolButtonText, { fontWeight: 'bold' }, isBold && styles.activeToolButtonText]}>B</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.toolButton, isItalic && styles.activeToolButton]} 
          onPress={() => setIsItalic(!isItalic)}
        >
          <Text style={[styles.toolButtonText, { fontStyle: 'italic' }, isItalic && styles.activeToolButtonText]}>I</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.toolButton, styles.textAlignButton]} onPress={() => {
          const aligns = ['left', 'center', 'right'];
          const currentIndex = aligns.indexOf(textAlign);
          const nextAlign = aligns[(currentIndex + 1) % aligns.length];
          setTextAlign(nextAlign);
        }}>
          <Text style={styles.toolButtonText}>{getAlignmentIcon()}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.toolButton} onPress={aiSummarize}>
          <Ionicons name="bulb" size={20} color="#4a5568" />
        </TouchableOpacity>
      </View>

      {/* Font Modal */}
      <Modal visible={showFontModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Font & Size</Text>
            
            {/* Font Family Section */}
            <Text style={styles.sectionTitle}>Font Family</Text>
            <ScrollView style={styles.fontSection}>
              {fonts.map((font) => (
                <TouchableOpacity
                  key={font.value}
                  style={styles.fontOption}
                  onPress={() => setFontFamily(font.value)}
                >
                  <Text style={[styles.fontText, { fontFamily: font.value }]}>
                    {font.name}
                  </Text>
                  {fontFamily === font.value && (
                    <Ionicons name="checkmark" size={20} color="#4a5568" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Font Size Section */}
            <Text style={styles.sectionTitle}>Font Size</Text>
            <View style={styles.fontSizeContainer}>
              {fontSizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[styles.fontSizeOption, fontSize === size && styles.selectedFontSize]}
                  onPress={() => setFontSize(size)}
                >
                  <Text style={[styles.fontSizeText, fontSize === size && styles.selectedFontSizeText]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFontModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Drawing Tools Modal */}
      <Modal visible={showDrawingModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Drawing Tools</Text>
            
            {/* Tool Selection */}
            <Text style={styles.sectionTitle}>Tools</Text>
            <View style={styles.toolsContainer}>
              {drawingTools.map((tool) => (
                <TouchableOpacity
                  key={tool.name}
                  style={[styles.toolOption, selectedTool === tool.name && styles.selectedTool]}
                  onPress={() => setSelectedTool(tool.name)}
                >
                  <Ionicons 
                    name={tool.icon} 
                    size={24} 
                    color={selectedTool === tool.name ? '#fff' : '#4a5568'} 
                  />
                  <Text style={[styles.toolLabel, selectedTool === tool.name && styles.selectedToolLabel]}>
                    {tool.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Color Selection */}
            <Text style={styles.sectionTitle}>Colors</Text>
            <View style={styles.colorsContainer}>
              {colors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption, 
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColor
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <Ionicons name="checkmark" size={16} color={color === '#000000' ? '#fff' : '#000'} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Brush Size Selection */}
            <Text style={styles.sectionTitle}>Brush Size</Text>
            <View style={styles.brushSizeContainer}>
              {brushSizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[styles.brushSizeOption, brushSize === size && styles.selectedBrushSize]}
                  onPress={() => setBrushSize(size)}
                >
                  <View style={[styles.brushPreview, { width: size + 4, height: size + 4, backgroundColor: selectedColor }]} />
                  <Text style={[styles.brushSizeText, brushSize === size && styles.selectedBrushSizeText]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDrawingModal(false)}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#edf2f7',
    paddingTop: 50
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  saveText: {
    fontSize: 16,
    color: '#4a5568',
    fontWeight: '600',
    paddingLeft: 12,
  },
  contentContainer: {
    flex: 1,
    padding: 10,
  },
  titleInput: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 12,
    minHeight: 570,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  checklistContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    color: '#2d3748',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 4,
  },
  checkedText: {
    textDecorationLine: 'line-through',
    color: '#718096',
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
    color: '#4a5568',
  },
  drawingContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  drawingToolsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginBottom: 12,
  },
  drawingSettingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7fafc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  drawingSettingsText: {
    fontSize: 12,
    color: '#4a5568',
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
    borderColor: '#e2e8f0',
  },
  toolText: {
    fontSize: 12,
    color: '#4a5568',
    fontWeight: '500',
  },
  sizeText: {
    fontSize: 12,
    color: '#718096',
  },
  drawingArea: {
    height: 400,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  clearButton: {
    padding: 6,
  },
  toolbar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
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
    color: '#4a5568',
    fontWeight: '600',
  },
  activeToolButtonText: {
    color: '#fff',
  },
  textAlignButton: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#2d3748',
  },
  fontSection: {
    maxHeight: 150,
    marginBottom: 20,
  },
  fontOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  fontText: {
    fontSize: 16,
  },
  fontSizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  fontSizeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 40,
    alignItems: 'center',
  },
  selectedFontSize: {
    backgroundColor: '#4a5568',
    borderColor: '#4a5568',
  },
  fontSizeText: {
    color: '#2d3748',
  },
  selectedFontSizeText: {
    color: '#fff',
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
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f7fafc',
  },
  selectedTool: {
    backgroundColor: '#4a5568',
    borderColor: '#4a5568',
  },
  toolLabel: {
    fontSize: 12,
    color: '#4a5568',
    marginTop: 4,
    fontWeight: '500',
  },
  selectedToolLabel: {
    color: '#fff',
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedColor: {
    borderColor: '#4a5568',
    borderWidth: 3,
  },
  brushSizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  brushSizeOption: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f7fafc',
    minWidth: 60,
  },
  selectedBrushSize: {
    backgroundColor: '#4a5568',
    borderColor: '#4a5568',
  },
  brushPreview: {
    borderRadius: 10,
    marginBottom: 4,
  },
  brushSizeText: {
    fontSize: 12,
    color: '#4a5568',
    fontWeight: '500',
  },
  selectedBrushSizeText: {
    color: '#fff',
  },
  closeButton: {
    backgroundColor: '#4a5568',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  });