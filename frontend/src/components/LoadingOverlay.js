import React from 'react';
import { Modal, View, Text, ActivityIndicator } from 'react-native';

export default function LoadingOverlay({
  visible,
  text = "Loading...",
  themedStyles,
  styles,
  theme
}) {
  // Accept themedStyles, styles, and theme for integration
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
    >
      <View style={[styles.savingOverlay, { backgroundColor: theme.overlay }]}>
        <View style={themedStyles.savingContainer}>
          <ActivityIndicator size="large" color={theme.textSecondary} />
          <Text style={themedStyles.savingText}>{text}</Text>
        </View>
      </View>
    </Modal>
  );
}
