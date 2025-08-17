import React from 'react';
import { Modal, TouchableOpacity, View, Text, Animated, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MenuModal({
  visible,
  onClose,
  title = '',
  options = [],
  themedStyles,
  styles,
  theme,
  slideAnim,
  optionType = 'menu', // 'menu', 'share', etc. if you want to adjust styling
  scroll = false, // allow long modals?
  disabled = false
}) {
  return (
    <Modal visible={visible} transparent animationType="none">
      <TouchableOpacity
        style={[styles.menuOverlay, { backgroundColor: theme.overlay }]}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            themedStyles.slideMenu,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={themedStyles.slideMenuHandle} />
          <Text style={themedStyles.slideMenuTitle}>{title}</Text>

          {scroll ? (
            <ScrollView>
              {options.map(opt => (
                <OptionButton
                  key={opt.id}
                  option={opt}
                  themedStyles={themedStyles}
                  styles={styles}
                  theme={theme}
                  optionType={optionType}
                  disabled={disabled}
                />
              ))}
            </ScrollView>
          ) : (
            options.map(opt => (
              <OptionButton
                key={opt.id}
                option={opt}
                themedStyles={themedStyles}
                styles={styles}
                theme={theme}
                optionType={optionType}
                disabled={disabled}
              />
            ))
          )}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

// Option Button as subcomponent for clean modularity
function OptionButton({
  option,
  themedStyles,
  styles,
  theme,
  optionType,
  disabled
}) {
  return (
    <TouchableOpacity
      key={option.id}
      style={
        optionType === 'share'
          ? themedStyles.shareOption
          : [styles.menuOption, { borderBottomColor: theme.borderLight }]
      }
      onPress={option.action}
      disabled={disabled}
    >
      <View
        style={
          optionType === 'share'
            ? themedStyles.shareOptionContent
            : styles.menuOptionContent
        }
      >
        <Ionicons name={option.icon} size={22} color={theme.textSecondary} />
        {optionType === 'share' ? (
          <View style={styles.shareOptionTextContainer}>
            <Text style={themedStyles.shareOptionText}>{option.label}</Text>
            <Text style={themedStyles.shareOptionDescription}>
              {option.description}
            </Text>
          </View>
        ) : (
          <Text style={themedStyles.menuOptionText}>{option.label}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
    </TouchableOpacity>
  );
}
