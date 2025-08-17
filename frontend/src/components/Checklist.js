import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * @note Checklist main component
 */
export default function Checklist({
  items,
  addItem,
  updateItem,
  toggleItem,
  deleteItem,
  theme,
  themedStyles,
  styles
}) {
  return (
    <View style={themedStyles.checklistContainer}>
      {items.map((item) => (
        <View key={item.id} style={styles.checklistItem}>
          <TouchableOpacity onPress={() => toggleItem(item.id)}>
            <Ionicons
              name={item.checked ? "checkbox" : "square-outline"}
              size={20}
              color={item.checked ? theme.textSecondary : theme.textMuted}
            />
          </TouchableOpacity>
          <TextInput
            style={[themedStyles.checklistText, item.checked && styles.checkedText]}
            value={item.text}
            onChangeText={(text) => updateItem(item.id, text)}
            placeholder="Add item..."
            placeholderTextColor={theme.placeholder}
          />
          <TouchableOpacity onPress={() => deleteItem(item.id)}>
            <Ionicons name="trash" size={18} color={theme.danger} />
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity style={styles.addButton} onPress={addItem}>
        <Ionicons name="add" size={20} color={theme.textSecondary} />
        <Text style={themedStyles.addButtonText}>Add Item</Text>
      </TouchableOpacity>
    </View>
  );
}
