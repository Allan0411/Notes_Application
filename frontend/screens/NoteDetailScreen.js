import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Alert, Modal, Dimensions, SafeAreaView, StatusBar, PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function NoteDetailScreen({ route, navigation }) {
  const { note, onSave } = route.params;
  
  // Note content states
  const [noteText, setNoteText] = useState(note?.text || '');
  const [noteTitle, setNoteTitle] = useState(note?.title || '');
  const [checklistItems, setChecklistItems] = useState(note?.checklistItems || []);
  const [drawings, setDrawings] = useState(note?.drawings || []);
  
  // UI states
  const [activeTab, setActiveTab] = useState('text');
  const [showFontModal, setShowFontModal] = useState(false);
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Text formatting states
  const [fontSize, setFontSize] = useState(note?.fontSize || 16);
  const [fontFamily, setFontFamily] = useState(note?.fontFamily || 'System');
  const [isBold, setIsBold] = useState(note?.isBold || false);
  const [isItalic, setIsItalic] = useState(note?.isItalic || false);
  const [textAlign, setTextAlign] = useState(note?.textAlign || 'left');

  const pathRef = useRef('');

  // Font options
  const fonts = [
    { name: 'System', value: 'System' },
    { name: 'Arial', value: 'Arial' },
    { name: 'Times New Roman', value: 'Times New Roman' },
    { name: 'Courier New', value: 'Courier New' },
    { name: 'Helvetica', value: 'Helvetica' },
  ];

  const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32];

  // Save note function
  const saveNote = () => {
    if (!noteText.trim() && !noteTitle.trim() && checklistItems.length === 0 && drawings.length === 0) {
      Alert.alert('Empty Note', 'Please add some content!');
      return;
    }

    const updatedNote = {
      id: note?.id || Date.now().toString(),
      text: noteText,
      title: noteTitle || 'Untitled Note',
      checklistItems,
      drawings,
      fontSize,
      fontFamily,
      isBold,
      isItalic,
      textAlign,
      createdAt: note?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Call the onSave callback to update the home screen
    if (onSave) {
      onSave(updatedNote);
    }
    
    Alert.alert('Success', 'Note saved successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
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

  // Drawing functions with PanResponder
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      setIsDrawing(true);
      const { locationX, locationY } = evt.nativeEvent;
      pathRef.current = `M${locationX},${locationY}`;
      setCurrentPath(pathRef.current);
    },
    onPanResponderMove: (evt) => {
      if (!isDrawing) return;
      const { locationX, locationY } = evt.nativeEvent;
      pathRef.current += ` L${locationX},${locationY}`;
      setCurrentPath(pathRef.current);
    },
    onPanResponderRelease: () => {
      if (isDrawing) {
        setDrawings([...drawings, pathRef.current]);
        setCurrentPath('');
        pathRef.current = '';
        setIsDrawing(false);
      }
    },
  });

  const clearDrawing = () => {
    setDrawings([]);
    setCurrentPath('');
    pathRef.current = '';
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
    switch (textAlign) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
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
        <TouchableOpacity onPress={saveNote}>
          <Text style={styles.saveText}>Save</Text>
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
            <View
              style={styles.drawingArea}
              {...panResponder.panHandlers}
            >
              <Svg height="300" width="100%">
                {drawings.map((path, index) => (
                  <Path
                    key={index}
                    d={path}
                    stroke="#4a5568"
                    strokeWidth="2"
                    fill="none"
                  />
                ))}
                {currentPath && (
                  <Path
                    d={currentPath}
                    stroke="#4a5568"
                    strokeWidth="2"
                    fill="none"
                  />
                )}
              </Svg>
            </View>
            <TouchableOpacity style={styles.clearButton} onPress={clearDrawing}>
              <Ionicons name="trash" size={16} color="#d11a2a" />
              <Text style={styles.clearButtonText}>Clear Drawing</Text>
            </TouchableOpacity>
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
          <Ionicons name="bold" size={20} color={isBold ? '#fff' : '#4a5568'} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.toolButton, isItalic && styles.activeToolButton]} 
          onPress={() => setIsItalic(!isItalic)}
        >
          <Ionicons name="italic" size={20} color={isItalic ? '#fff' : '#4a5568'} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.toolButton} onPress={() => {
          const aligns = ['left', 'center', 'right'];
          const currentIndex = aligns.indexOf(textAlign);
          const nextAlign = aligns[(currentIndex + 1) % aligns.length];
          setTextAlign(nextAlign);
        }}>
          <Ionicons name={getAlignmentIcon()} size={20} color="#4a5568" />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#edf2f7',
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
    paddingLeft : 12,
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
  drawingArea: {
    height: 500,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  clearButtonText: {
    color: '#d11a2a',
    fontSize: 14,
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
  },
  activeToolButton: {
    backgroundColor: '#4a5568',
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
