import { StyleSheet } from 'react-native';

export function buildThemedStyles(theme, styles) {
  return StyleSheet.create({
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
    shareOption: {
      ...styles.shareOption,
      borderBottomColor: theme.borderLight,
    },
    shareOptionContent: {
      ...styles.shareOptionContent,
    },
    shareOptionText: {
      ...styles.shareOptionText,
      color: theme.text,
    },
    shareOptionDescription: {
      ...styles.shareOptionDescription,
      color: theme.textMuted,
    },
  });
}
