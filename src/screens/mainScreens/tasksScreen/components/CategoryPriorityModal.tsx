import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TaskCategory, TaskPriority } from '../types';
import CommonBtn from '../../../../components/CommonBtn';

import { Colors, Fonts, Typography } from '../../../../units';

export interface CategoryPriorityModalProps {
  visible: boolean;
  initialCategory?: TaskCategory;
  initialPriority?: TaskPriority;
  onClose: () => void;
  onSave: (category: TaskCategory, priority: TaskPriority) => void;
}

const CATEGORY_LIST: { id: TaskCategory; label: string; dotColor: string }[] = [
  { id: 'household', label: 'Household', dotColor: Colors.primary },
  { id: 'family', label: 'Family', dotColor: Colors.info },
  { id: 'personal', label: 'Personal', dotColor: Colors.success },
  { id: 'finance', label: 'Finance', dotColor: Colors.danger },
  { id: 'health', label: 'Health', dotColor: Colors.tagHealth },
  { id: 'travel', label: 'Travel', dotColor: Colors.accentTeal },
  { id: 'work', label: 'Work', dotColor: Colors.slateLight },
];

const PRIORITY_CARDS: {
  id: TaskPriority;
  title: string;
  subtitle: string;
  dotColor: string;
}[] = [
  { id: 'high', title: 'High', subtitle: 'Do first', dotColor: Colors.tagRedSoft },
  { id: 'medium', title: 'Medium', subtitle: 'This week', dotColor: Colors.tripYellowAccent },
  { id: 'low', title: 'Low', subtitle: 'When free', dotColor: Colors.textSecondaryMuted },
];

const CategoryPriorityModal: React.FC<CategoryPriorityModalProps> = ({
  visible,
  initialCategory = 'household',
  initialPriority = 'medium',
  onClose,
  onSave,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] =
    useState<TaskCategory>(initialCategory);
  const [selectedPriority, setSelectedPriority] =
    useState<TaskPriority>(initialPriority);

  React.useEffect(() => {
    setSelectedCategory(initialCategory);
    setSelectedPriority(initialPriority);
  }, [initialCategory, initialPriority, visible]);

  const handleDone = () => {
    onSave(selectedCategory, selectedPriority);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View
          style={[
            styles.sheetContainer,
            { paddingBottom: Math.max(insets.bottom, 16) + 16 },
          ]}
        >
          {/* Top Handle */}
          <View style={styles.handle} />

          <Text style={styles.title}>Category and priority</Text>

          {/* Section: Category */}
          <Text style={styles.sectionHeader}>CATEGORY</Text>
          <View style={styles.categoryChipsRow}>
            {CATEGORY_LIST.map((item) => {
              const isSelected = selectedCategory === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.categoryChip,
                    isSelected && styles.categoryChipSelected,
                  ]}
                  onPress={() => setSelectedCategory(item.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: item.dotColor },
                    ]}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && styles.categoryChipTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Section: Priority */}
          <Text style={styles.sectionHeader}>PRIORITY</Text>
          <View style={styles.priorityCardsRow}>
            {PRIORITY_CARDS.map((card) => {
              const isSelected = selectedPriority === card.id;
              return (
                <TouchableOpacity
                  key={card.id}
                  style={[
                    styles.priorityCard,
                    isSelected && styles.priorityCardSelected,
                  ]}
                  onPress={() => setSelectedPriority(card.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.priorityDot,
                      { backgroundColor: card.dotColor },
                    ]}
                  />
                  <Text style={styles.priorityTitle}>{card.title}</Text>
                  <Text style={styles.prioritySubtitle}>{card.subtitle}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Done Button */}
          <CommonBtn
            title="Done"
            onPress={handleDone}
            backgroundColor={Colors.primary}
            height={52}
            borderRadius={26}
            marginTop={24}
            fontSize={16}
          />
        </View>
      </View>
    </Modal>
  );
};

export default CategoryPriorityModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: Colors.tasksDarkOverlay,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContainer: {
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: Colors.borderBold,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderMutedAlt,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: Typography.size.titleLarge,
    fontFamily: Fonts.bold,
    color: Colors.textLightMutedAlt,
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: Typography.size.captionSmall,
    fontFamily: Fonts.bold,
    letterSpacing: 1.2,
    color: Colors.textSecondaryMuted,
    marginBottom: 12,
  },
  categoryChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    backgroundColor: Colors.transparent,
    gap: 8,
  },
  categoryChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  categoryChipText: {
    fontSize: Typography.size.body,
    fontFamily: Fonts.semiBold,
    color: Colors.textLightMutedAlt,
  },
  categoryChipTextSelected: {
    color: Colors.background,
    fontFamily: Fonts.bold,
  },
  priorityCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  priorityCard: {
    flex: 1,
    backgroundColor: Colors.transparent,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  priorityCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.transparent,
    borderWidth: 2,
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
  priorityTitle: {
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginBottom: 4,
  },
  prioritySubtitle: {
    fontSize: Typography.size.caption,
    color: Colors.textSecondaryMuted,
  },
  doneBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  doneBtnText: {
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
});
