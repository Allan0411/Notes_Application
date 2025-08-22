import React from 'react';
import { Modal, TouchableOpacity, View, Text, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FontPickerModal({
  visible,
  onClose,
  themedStyles,
  styles,
  theme,
  fonts,
  fontFamily,
  setFontFamily,
  fontSizes,
  fontSize,
  setFontSize
}) {
  
  // Android-compatible font mapping
  const getAndroidFontFamily = (fontName) => {
    if (Platform.OS !== 'android') {
      return fontName === 'System' ? undefined : fontName;
    }
    
    // Android font mapping
    const androidFontMap = {
      'System': undefined,
      'Arial': 'sans-serif',
      'Courier New': 'monospace',
      'Times New Roman': 'serif',
      'Impact': 'sans-serif-black',
      'Comic Sans MS': 'casual',
    };
    
    return androidFontMap[fontName] || 'sans-serif';
  };

  // Preview text style for font options
  const getPreviewStyle = (fontValue) => ({
    fontFamily: getAndroidFontFamily(fontValue),
    fontSize: 16,
    color: theme.text
  });

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity
        style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={themedStyles.modalContent} onStartShouldSetResponder={() => true}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Text style={themedStyles.modalTitle}>Choose Font & Size</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Font Preview Section */}
          <View style={[styles.fontPreviewSection, { borderColor: theme.border }]}>
            <Text style={[
              themedStyles.previewLabel,
              { color: theme.textSecondary }
            ]}>
              Preview:
            </Text>
            <Text style={[
              themedStyles.previewText,
              {
                fontFamily: getAndroidFontFamily(fontFamily),
                fontSize: fontSize,
                color: theme.text
              }
            ]}>
              The quick brown fox jumps over the lazy dog
            </Text>
          </View>

          {/* Font Family Section */}
          <Text style={themedStyles.sectionTitle}>Font Family</Text>
          <ScrollView 
            style={[styles.fontSection, { borderColor: theme.border }]} 
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {fonts.map((font) => (
              <TouchableOpacity
                key={font.value}
                style={[
                  themedStyles.fontOption,
                  fontFamily === font.value && themedStyles.selectedFontOption
                ]}
                onPress={() => {
                  setFontFamily(font.value);
                  console.log('Font changed to:', font.value, 'Android mapping:', getAndroidFontFamily(font.value));
                }}
                activeOpacity={0.7}
              >
                <View style={styles.fontOptionContent}>
                  <Text style={[
                    themedStyles.fontText,
                    getPreviewStyle(font.value),
                    fontFamily === font.value && themedStyles.selectedFontText
                  ]}>
                    {font.name}
                  </Text>
                  <Text style={[
                    themedStyles.fontSubText,
                    { color: theme.textSecondary }
                  ]}>
                    Sample text preview
                  </Text>
                </View>
                {fontFamily === font.value && (
                  <Ionicons name="checkmark" size={20} color={theme.accent || theme.textSecondary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Font Size Section */}
          <Text style={themedStyles.sectionTitle}>Font Size</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.fontSizeScrollContainer}
            contentContainerStyle={styles.fontSizeContainer}
          >
            {fontSizes.map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  themedStyles.fontSizeOption,
                  fontSize === size && themedStyles.selectedFontSize
                ]}
                onPress={() => {
                  setFontSize(size);
                  console.log('Font size changed to:', size);
                }}
                activeOpacity={0.7}
              >
                <Text style={[
                  themedStyles.fontSizeText,
                  { color: theme.text },
                  fontSize === size && { color: theme.accent || '#fff' }
                ]}>
                  {size}
                </Text>
                <Text style={[
                  themedStyles.fontSizeLabel,
                  { color: theme.textSecondary },
                  fontSize === size && { color: theme.accent || '#fff' }
                ]}>
                  px
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Modern Apply Button */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[
                styles.modernApplyButton,
                { 
                  backgroundColor: theme.accent || '#3b82f6',
                  shadowColor: theme.accent || '#3b82f6'
                }
              ]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                {/* <Ionicons 
                  name="checkmark-circle" 
                  size={20} 
                  color="#fff" 
                  style={styles.buttonIcon}
                /> */}
                <Text style={styles.modernApplyButtonText}>
                  Apply Changes
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}