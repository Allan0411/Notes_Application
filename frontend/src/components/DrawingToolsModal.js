import React from 'react';
import { Modal, TouchableOpacity, View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DrawingToolsModal({
  visible,
  onClose,
  themedStyles,
  styles,
  theme,
  drawingTools,
  selectedTool,
  setSelectedTool,
  colors,
  selectedColor,
  setSelectedColor,
  brushSizes,
  brushSize,
  setBrushSize,
  eraserSizes,
  eraserSize,
  setEraserSize,
  brushScrollRef,
  handleBrushScroll,
  brushScrollWidth,
  brushContentWidth,
  getScrollIndicators,
  clearDrawing,
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity
        style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={themedStyles.modalContent} onStartShouldSetResponder={() => true}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Text style={themedStyles.modalTitle}>Drawing Tools</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={onClose}
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

          {/* Color Picker */}
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

          {/* Size Selector */}
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
                  onPress={() =>
                    selectedTool === 'eraser' ? setEraserSize(size) : setBrushSize(size)
                  }
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
  );
}
