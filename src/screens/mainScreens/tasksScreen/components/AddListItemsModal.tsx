import React, { useState, useEffect } from 'react';
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
import listsServices from '../../../../services/listsServices';
import { isUUID } from '../taskApiHelpers';
import { ListItemEntry } from '../types';
import CommonBtn from '../../../../components/CommonBtn';

import { Colors, Fonts, Typography } from '../../../../units';

export interface AddListItemsModalProps {
  visible: boolean;
  listId?: string;
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
  listId,
  onClose,
  onAddItems,
}) => {
  const insets = useSafeAreaInsets();
  const [itemName, setItemName] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [addedItems, setAddedItems] = useState<ListItemEntry[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>(PAST_SUGGESTIONS);

  useEffect(() => {
    if (visible && listId && isUUID(listId)) {
      listsServices
        .getSuggestions(listId)
        .then((res) => {
          if (res?.suggestions && res.suggestions.length > 0) {
            setSuggestions(res.suggestions.map((s) => s.name));
          }
        })
        .catch((err) => {
          console.log('[AddListItemsModal] Could not fetch suggestions:', err?.message || err);
        });
    }
  }, [visible, listId]);

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
    let finalItems = [...addedItems];
    const trimmed = itemName.trim();
    if (trimmed) {
      finalItems.push({
        id: `li-new-${Date.now()}-${Math.random()}`,
        title: trimmed,
        quantity: quantity.trim() || undefined,
        isCompleted: false,
      });
    }
    if (finalItems.length > 0) {
      onAddItems(finalItems);
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
            <Feather name="chevron-left" size={24} color={Colors.white} />
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
              placeholderTextColor={Colors.textSecondaryMuted}
              selectionColor={Colors.primary}
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
              <Feather name="plus" size={20} color={Colors.white} />
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
                placeholderTextColor={Colors.textLightMutedAlt}
                selectionColor={Colors.primary}
              />
            </View>
          </View>

          {/* Past Suggestions */}
          <Text style={styles.sectionEyebrow}>FROM YOUR PAST LISTS</Text>
          <View style={styles.suggestionsWrap}>
            {suggestions.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.suggestionChip}
                onPress={() => handleSuggestionPress(item)}
                activeOpacity={0.7}
              >
                <Feather
                  name="plus"
                  size={14}
                  color={Colors.textLightMutedAlt}
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
                      <Feather name="check" size={14} color={Colors.accentTealMint} />
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
                      <Feather name="x" size={16} color={Colors.textSecondaryMuted} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.bottomBar}>
          <CommonBtn
            title={
              addedItems.length > 0
                ? `Done · ${addedItems.length} added`
                : 'Done'
            }
            onPress={handleDone}
            backgroundColor={Colors.primary}
            height={52}
            borderRadius={26}
            fontSize={16}
          />
        </View>
      </View>
    </Modal>
  );
};

export default AddListItemsModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.transparent,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.size.titleSmall,
    fontFamily: Fonts.bold,
    color: Colors.white,
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
    backgroundColor: Colors.transparent,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingLeft: 18,
    paddingRight: 6,
    height: 56,
    marginBottom: 20,
  },
  textInput: {
    flex: 1,
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.semiBold,
    color: Colors.white,
  },
  addBtnInside: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
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
    fontSize: Typography.size.body,
    fontFamily: Fonts.medium,
    color: Colors.textLightMutedAlt,
  },
  quantityPill: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: Colors.transparent,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    justifyContent: 'center',
    minWidth: 100,
  },
  quantityInput: {
    fontSize: Typography.size.body,
    fontFamily: Fonts.semiBold,
    color: Colors.white,
    textAlign: 'center',
  },
  sectionEyebrow: {
    fontSize: Typography.size.captionSmall,
    fontFamily: Fonts.bold,
    letterSpacing: 1.2,
    color: Colors.textSecondaryMuted,
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
    borderRadius: 8,
    backgroundColor: Colors.transparent,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
  },
  plusIcon: {
    marginRight: 6,
  },
  suggestionText: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.semiBold,
    color: Colors.textLightMutedAlt,
  },
  addedJustNowSection: {
    marginBottom: 24,
  },
  addedCard: {
    backgroundColor: Colors.transparent,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    overflow: 'hidden',
  },
  addedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.transparent,
  },
  addedItemDivider: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderMutedAlt,
  },
  addedCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.accentTealMint,
    backgroundColor: Colors.transparent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  addedTextCol: {
    flex: 1,
  },
  addedItemTitle: {
    fontSize: Typography.size.bodyMedium,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginBottom: 2,
  },
  addedItemSubtitle: {
    fontSize: Typography.size.caption,
    color: Colors.textSecondaryMuted,
  },
  deleteBtn: {
    padding: 6,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: Colors.background,
  },
  doneBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
});

