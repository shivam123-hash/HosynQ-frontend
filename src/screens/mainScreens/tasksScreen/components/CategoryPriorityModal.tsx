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

export interface CategoryPriorityModalProps {
  visible: boolean;
  initialCategory?: TaskCategory;
  initialPriority?: TaskPriority;
  onClose: () => void;
  onSave: (category: TaskCategory, priority: TaskPriority) => void;
}

const CATEGORY_LIST: { id: TaskCategory; label: string; dotColor: string }[] = [
  { id: 'household', label: 'Household', dotColor: '#F0913A' },
  { id: 'family', label: 'Family', dotColor: '#3B82F6' },
  { id: 'personal', label: 'Personal', dotColor: '#10B981' },
  { id: 'finance', label: 'Finance', dotColor: '#EF4444' },
  { id: 'health', label: 'Health', dotColor: '#8B5CF6' },
  { id: 'travel', label: 'Travel', dotColor: '#14B8A6' },
  { id: 'work', label: 'Work', dotColor: '#94A3B8' },
];

const PRIORITY_CARDS: {
  id: TaskPriority;
  title: string;
  subtitle: string;
  dotColor: string;
}[] = [
  { id: 'high', title: 'High', subtitle: 'Do first', dotColor: '#F87171' },
  { id: 'medium', title: 'Medium', subtitle: 'This week', dotColor: '#FBBF24' },
  { id: 'low', title: 'Low', subtitle: 'When free', dotColor: '#8A97AB' },
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
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={handleDone}
            activeOpacity={0.8}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContainer: {
    backgroundColor: '#0B1A2F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3A4556',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#CAD4DF',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#8A97AB',
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
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: '#1F3352',
    backgroundColor: '#122440',
    gap: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#F0913A',
    borderColor: '#F0913A',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  categoryChipTextSelected: {
    color: '#0B1A2F',
    fontWeight: '700',
  },
  priorityCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  priorityCard: {
    flex: 1,
    backgroundColor: '#122440',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#1F3352',
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  priorityCardSelected: {
    borderColor: '#F0913A',
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
  priorityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#CAD4DF',
    marginBottom: 4,
  },
  prioritySubtitle: {
    fontSize: 12,
    color: '#8A97AB',
  },
  doneBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
