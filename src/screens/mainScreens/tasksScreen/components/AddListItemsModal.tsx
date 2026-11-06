import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { ListItemEntry } from '../types';

export interface AddListItemsModalProps {
  visible: boolean;
  onClose: () => void;
  onAddItems: (newItems: ListItemEntry[]) => void;
}

const PAST_SUGGESTIONS = [
  'Gift wrap',
  'Batteries',
  'Toran',
  'Puja thali',
  'Mithai box',
  'Dry fruits',
  'Incense sticks',
  'Matchbox',
];

const AddListItemsModal: React.FC<AddListItemsModalProps> = ({
  visible,
  onClose,
  onAddItems,
}) => {
  const insets = useSafeAreaInsets();
  const [itemName, setItemName] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [addedItems, setAddedItems] = useState<ListItemEntry[]>([]);

  const handleAddItem = () => {
    const trimmed = itemName.trim();
    if (!trimmed) return;

    const newItem: ListItemEntry = {
      id: `li-new-${Date.now()}-${Math.random()}`,
      title: trimmed,
      quantity: quantity.trim() || undefined,
      isCompleted: false,
    };

    setAddedItems((prev) => [newItem, ...prev]);
    setItemName('');
    setQuantity('');
  };

  const handleSuggestionPress = (text: string) => {
    const newItem: ListItemEntry = {
      id: `li-sug-${Date.now()}-${Math.random()}`,
      title: text,
      isCompleted: false,
    };
    setAddedItems((prev) => [newItem, ...prev]);
  };

  const handleRemoveAddedItem = (id: string) => {
    setAddedItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleDone = () => {
    if (addedItems.length > 0) {
      onAddItems(addedItems);
    }
    setAddedItems([]);
    setItemName('');
    setQuantity('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Feather name="chevron-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Add items</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Main Item Input Row */}
          <View style={styles.inputPill}>
            <TextInput
              style={styles.textInput}
              value={itemName}
              onChangeText={setItemName}
              placeholder="e.g. Sparklers"
              placeholderTextColor="#8A97AB"
              selectionColor="#F0913A"
              returnKeyType="done"
              onSubmitEditing={handleAddItem}
            />
            <TouchableOpacity
              style={styles.addBtnInside}
              onPress={handleAddItem}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Add item"
            >
              <Feather name="plus" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Quantity or Note Row */}
          <View style={styles.quantityRow}>
            <Text style={styles.quantityLabel}>Quantity or note</Text>
            <View style={styles.quantityPill}>
              <TextInput
                style={styles.quantityInput}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="2 boxes"
                placeholderTextColor="#8A97AB"
                selectionColor="#F0913A"
              />
            </View>
          </View>

          {/* Past Suggestions */}
          <Text style={styles.sectionEyebrow}>FROM YOUR PAST LISTS</Text>
          <View style={styles.suggestionsWrap}>
            {PAST_SUGGESTIONS.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.suggestionChip}
                onPress={() => handleSuggestionPress(item)}
                activeOpacity={0.7}
              >
                <Feather
                  name="plus"
                  size={14}
                  color="#CAD4DF"
                  style={styles.plusIcon}
                />
                <Text style={styles.suggestionText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Added Just Now Section */}
          {addedItems.length > 0 && (
            <View style={styles.addedJustNowSection}>
              <Text style={styles.sectionEyebrow}>ADDED JUST NOW</Text>
              <View style={styles.addedCard}>
                {addedItems.map((item, idx) => (
                  <View
                    key={item.id}
                    style={[
                      styles.addedItemRow,
                      idx > 0 && styles.addedItemDivider,
                    ]}
                  >
                    <View style={styles.addedCheckCircle}>
                      <Feather name="check" size={14} color="#2DD4BF" />
                    </View>

                    <View style={styles.addedTextCol}>
                      <Text style={styles.addedItemTitle}>{item.title}</Text>
                      {Boolean(item.quantity) && (
                        <Text style={styles.addedItemSubtitle}>
                          {item.quantity}
                        </Text>
                      )}
                    </View>

                    <TouchableOpacity
                      onPress={() => handleRemoveAddedItem(item.id)}
                      style={styles.deleteBtn}
                      activeOpacity={0.7}
                    >
                      <Feather name="x" size={16} color="#8A97AB" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={handleDone}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Done, ${addedItems.length} added`}
          >
            <Text style={styles.doneBtnText}>
              {addedItems.length > 0
                ? `Done · ${addedItems.length} added`
                : 'Done'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AddListItemsModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#1F3352',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 44,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  inputPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2038',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#F0913A',
    paddingLeft: 18,
    paddingRight: 6,
    height: 56,
    marginBottom: 20,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addBtnInside: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#CAD4DF',
  },
  quantityPill: {
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 21,
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#1F3352',
    justifyContent: 'center',
    minWidth: 110,
  },
  quantityInput: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#8A97AB',
    marginBottom: 12,
  },
  suggestionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#1F3352',
  },
  plusIcon: {
    marginRight: 6,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  addedJustNowSection: {
    marginBottom: 24,
  },
  addedCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
  },
  addedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  addedItemDivider: {
    borderTopWidth: 1,
    borderColor: '#1A2C46',
  },
  addedCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#2DD4BF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  addedTextCol: {
    flex: 1,
  },
  addedItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  addedItemSubtitle: {
    fontSize: 12,
    color: '#8A97AB',
  },
  deleteBtn: {
    padding: 6,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: '#0B1A2F',
  },
  doneBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

