import React from 'react';
import { Modal, TouchableOpacity, View, Text, ScrollView } from 'react-native';
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
                style={[
                  themedStyles.fontSizeOption,
                  fontSize === size && themedStyles.selectedFontSize
                ]}
                onPress={() => setFontSize(size)}
              >
                <Text style={[
                  themedStyles.fontSizeText,
                  fontSize === size && styles.selectedFontSizeText
                ]}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
