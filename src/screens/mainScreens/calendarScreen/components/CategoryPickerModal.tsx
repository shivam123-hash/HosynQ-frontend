import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CALENDAR_CATEGORIES } from '../mockData';

export interface CategoryPickerModalProps {
  visible: boolean;
  selectedCategoryName: string;
  onClose: () => void;
  onSelectCategory: (name: string, color: string) => void;
  asModal?: boolean;
}

export const CategoryPickerModal: React.FC<CategoryPickerModalProps> = ({
  visible,
  selectedCategoryName,
  onClose,
  onSelectCategory,
  asModal = true,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedName, setSelectedName] = useState(selectedCategoryName);

  useEffect(() => {
    setSelectedName(selectedCategoryName);
  }, [selectedCategoryName, visible]);

  if (!visible) return null;

  const currentCat =
    CALENDAR_CATEGORIES.find((c) => c.name === selectedName) ||
    CALENDAR_CATEGORIES[0];

  const handleDone = () => {
    onSelectCategory(currentCat.name, currentCat.color);
    onClose();
  };

  const content = (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={styles.backdrop}
        onPress={onClose}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel="Close category picker"
      />

      <View
        style={[
          styles.sheetContainer,
          { paddingBottom: Math.max(insets.bottom, 16) + 16 },
        ]}
      >
        {/* Handle */}
        <View style={styles.handle} />

        {/* Title & Subtitle (CAL-11) */}
        <Text style={styles.sheetTitle}>Category</Text>
        <Text style={styles.sheetSubtitle}>
          The colour shows on the calendar
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.categoriesCard}>
            {CALENDAR_CATEGORIES.map((cat, idx) => {
              const isSelected = selectedName === cat.name;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryRow, idx > 0 && styles.rowDivider]}
                  onPress={() => setSelectedName(cat.name)}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={cat.name}
                >
                  <View
                    style={[styles.colorDot, { backgroundColor: cat.color }]}
                  />

                  <View style={styles.catTextCol}>
                    <Text style={styles.catName}>{cat.name}</Text>
                    <Text style={styles.catDesc}>{cat.description}</Text>
                  </View>

                  {/* Radio circle */}
                  <View
                    style={[
                      styles.radioOuter,
                      isSelected && styles.radioOuterSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Done Button (CAL-11) */}
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={handleDone}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Done"
        >
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!asModal) {
    return content;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {content}
    </Modal>
  );
};

export default CategoryPickerModal;

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(3, 10, 20, 0.72)',
    justifyContent: 'flex-end',
    zIndex: 999,
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '88%',
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3A4556',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 13.5,
    color: '#8A97AB',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  categoriesCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderColor: '#1A2C46',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  catTextCol: {
    flex: 1,
  },
  catName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  catDesc: {
    fontSize: 12,
    color: '#8A97AB',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#3A4D6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#F0913A',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F0913A',
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
