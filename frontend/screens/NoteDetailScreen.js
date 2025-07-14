import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Alert, Modal, Dimensions, SafeAreaView, StatusBar, Pressable, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function NoteDetailScreen({ route, navigation }) {
  const { note } = route.params;
  
  // Note content states
  const [noteText, setNoteText] = useState(note.text);
  const [noteTitle, setNoteTitle] = useState(note.title || '');
  const [checklistItems, setChecklistItems] = useState([]);
  const [drawings, setDrawings] = useState([]);
  
  // UI states
  const [activeTab, setActiveTab] = useState('text'); // text, checklist, drawing
  const [showFontModal, setShowFontModal] = useState(false);
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Text formatting states
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('System');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [textAlign, setTextAlign] = useState('left');

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
    if (!noteText.trim() && !noteTitle.trim() && checklistItems.length === 0) {
      Alert.alert('Empty Note', 'Please add some content!');
      return;
    }

    const updatedNote = {
      ...note,
      text: noteText,
      title: noteTitle,
      checklistItems,
      drawings,
      fontSize,
      fontFamily,
      isBold,
      isItalic,
      textAlign,
      updatedAt: new Date().toISOString(),
    };

    // Here you would typically save to your state management or database
    console.log('Saving note:', updatedNote);
    Alert.alert('Success', 'Note saved successfully!');
    navigation.goBack();
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

  // Drawing functions
  const handleDrawingStart = (event) => {
    setIsDrawing(true);
    const { locationX, locationY } = event.nativeEvent;
    pathRef.current = `M${locationX},${locationY}`;
    setCurrentPath(pathRef.current);
  };

  const handleDrawingMove = (event) => {
    if (!isDrawing) return;
    const { locationX, locationY } = event.nativeEvent;
    pathRef.current += ` L${locationX},${locationY}`;
    setCurrentPath(pathRef.current);
  };

  const handleDrawingEnd = () => {
    if (isDrawing) {
      setDrawings([...drawings, pathRef.current]);
      setCurrentPath('');
      pathRef.current = '';
      setIsDrawing(false);
    }
  };

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
    
    // Mock AI summarization
    const summary = `Summary: ${noteText.substring(0, 100)}...`;
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#edf2f7" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#4a5568" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Note</Text>
        <TouchableOpacity onPress={saveNote}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'text' && styles.activeTab]}
          onPress={() => setActiveTab('text')}
        >
          <Ionicons name="document-text" size={20} color={activeTab === 'text' ? '#4a5568' : '#718096'} />
          <Text style={[styles.tabText, activeTab === 'text' && styles.activeTabText]}>Text</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'checklist' && styles.activeTab]}
          onPress={() => setActiveTab('checklist')}
        >
          <Ionicons name="checkbox" size={20} color={activeTab === 'checklist' ? '#4a5568' : '#718096'} />
          <Text style={[styles.tabText, activeTab === 'checklist' && styles.activeTabText]}>Checklist</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'drawing' && styles.activeTab]}
          onPress={() => setActiveTab('drawing')}
        >
          <Ionicons name="brush" size={20} color={activeTab === 'drawing' ? '#4a5568' : '#718096'} />
          <Text style={[styles.tabText, activeTab === 'drawing' && styles.activeTabText]}>Draw</Text>
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
              onTouchStart={handleDrawingStart}
              onTouchMove={handleDrawingMove}
              onTouchEnd={handleDrawingEnd}
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
        <TouchableOpacity style={styles.toolButton} onPress={() => setShowFormatModal(true)}>
          <Ionicons name="text" size={20} color="#4a5568" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.toolButton} onPress={() => setShowFontModal(true)}>
          <Ionicons name="font-family" size={20} color="#4a5568" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.toolButton} onPress={() => setIsBold(!isBold)}>
          <Ionicons name="bold" size={20} color={isBold ? "#4a5568" : "#718096"} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.toolButton} onPress={() => setIsItalic(!isItalic)}>
          <Ionicons name="italic" size={20} color={isItalic ? "#4a5568" : "#718096"} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.toolButton} onPress={() => {
          const aligns = ['left', 'center', 'right'];
          const currentIndex = aligns.indexOf(textAlign);
          const nextAlign = aligns[(currentIndex + 1) % aligns.length];
          setTextAlign(nextAlign);
        }}>
          <Ionicons name="text-outline" size={20} color="#4a5568" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.toolButton} onPress={aiSummarize}>
          <Ionicons name="bulb" size={20} color="#4a5568" />
        </TouchableOpacity>
      </View>

      {/* Font Modal */}
      <Modal visible={showFontModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Font</Text>
            <ScrollView>
              {fonts.map((font) => (
                <TouchableOpacity
                  key={font.value}
                  style={styles.fontOption}
                  onPress={() => {
                    setFontFamily(font.value);
                    setShowFontModal(false);
                  }}
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
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFontModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Format Modal */}
      <Modal visible={showFormatModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Font Size</Text>
            <View style={styles.fontSizeContainer}>
              {fontSizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[styles.fontSizeOption, fontSize === size && styles.selectedFontSize]}
                  onPress={() => setFontSize(size)}
                >
                  <Text style={[styles.fontSizeText, { fontSize: size }]}>{size}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFormatModal(false)}
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
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4a5568',
  },
  tabText: {
    fontSize: 14,
    color: '#718096',
  },
  activeTabText: {
    color: '#4a5568',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 18,
    fontWeight: 'bold',
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    minHeight: 300,
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
    height: 300,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginBottom: 12,
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
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
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
    marginBottom: 16,
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
