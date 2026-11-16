import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarFilterState } from '../types';
import { CALENDAR_CATEGORIES, CALENDAR_FAMILY_MEMBERS } from '../mockData';

export interface FilterCalendarModalProps {
  visible: boolean;
  currentFilters: CalendarFilterState;
  onClose: () => void;
  onApplyFilters: (filters: CalendarFilterState) => void;
}

export const FilterCalendarModal: React.FC<FilterCalendarModalProps> = ({
  visible,
  currentFilters,
  onClose,
  onApplyFilters,
}) => {
  const insets = useSafeAreaInsets();
  const [showTypes, setShowTypes] = useState<
    ('events' | 'tasks' | 'important_dates')[]
  >(currentFilters.showTypes);
  const [selectedMember, setSelectedMember] = useState<string>(
    currentFilters.member
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    currentFilters.categories
  );

  const toggleType = (type: 'events' | 'tasks' | 'important_dates') => {
    setShowTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleCategory = (catName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catName)
        ? prev.filter((c) => c !== catName)
        : [...prev, catName]
    );
  };

  const handleReset = () => {
    setShowTypes(['events', 'tasks', 'important_dates']);
    setSelectedMember('everyone');
    setSelectedCategories([]);
  };

  const handleApply = () => {
    onApplyFilters({
      showTypes,
      member: selectedMember,
      categories: selectedCategories,
    });
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
          onPress={onClose}
          activeOpacity={1}
          accessibilityRole="button"
          accessibilityLabel="Close filter modal"
        />

        <View
          style={[
            styles.sheetContainer,
            { paddingBottom: Math.max(insets.bottom, 16) + 16 },
          ]}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* Title */}
          <Text style={styles.sheetTitle}>Filter calendar</Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* SHOW */}
            <Text style={styles.sectionHeader}>SHOW</Text>
            <View style={styles.chipsRow}>
              {(
                [
                  { id: 'events', label: 'Events' },
                  { id: 'tasks', label: 'Tasks' },
                  { id: 'important_dates', label: 'Important dates' },
                ] as const
              ).map((item) => {
                const isSelected = showTypes.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.filterChip,
                      isSelected && styles.filterChipSelected,
                    ]}
                    onPress={() => toggleType(item.id)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={item.label}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        isSelected && styles.filterChipTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* WHOSE CALENDAR */}
            <Text style={styles.sectionHeader}>WHOSE CALENDAR</Text>
            <View style={styles.chipsRow}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedMember === 'everyone' && styles.filterChipSelected,
                ]}
                onPress={() => setSelectedMember('everyone')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedMember === 'everyone' &&
                      styles.filterChipTextSelected,
                  ]}
                >
                  Everyone
                </Text>
              </TouchableOpacity>

              {CALENDAR_FAMILY_MEMBERS.map((m) => {
                const isSelected = selectedMember === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[
                      styles.filterChip,
                      isSelected && styles.filterChipSelected,
                    ]}
                    onPress={() => setSelectedMember(m.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        isSelected && styles.filterChipTextSelected,
                      ]}
                    >
                      {m.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* CATEGORY */}
            <Text style={styles.sectionHeader}>CATEGORY</Text>
            <View style={styles.chipsRow}>
              {CALENDAR_CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat.name);
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      isSelected && styles.categoryChipSelected,
                    ]}
                    onPress={() => toggleCategory(cat.name)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[styles.categoryDot, { backgroundColor: cat.color }]}
                    />
                    <Text
                      style={[
                        styles.categoryChipText,
                        isSelected && styles.categoryChipTextSelected,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Action Row */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={handleReset}
              activeOpacity={0.7}
            >
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyBtn}
              onPress={handleApply}
              activeOpacity={0.8}
            >
              <Text style={styles.applyBtnText}>Show items</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FilterCalendarModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
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
    maxHeight: '85%',
  },
  handle: {
    width: 40,
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
    marginBottom: 18,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A97AB',
    letterSpacing: 1.2,
    marginBottom: 10,
    marginTop: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 19,
    backgroundColor: '#122440',
    borderWidth: 1.5,
    borderColor: '#1F3352',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipSelected: {
    backgroundColor: '#F0913A',
    borderColor: '#F0913A',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  filterChipTextSelected: {
    color: '#0B1A2F',
    fontWeight: '700',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
    backgroundColor: '#122440',
    borderWidth: 1.5,
    borderColor: '#1F3352',
  },
  categoryChipSelected: {
    backgroundColor: '#F0913A',
    borderColor: '#F0913A',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  categoryChipTextSelected: {
    color: '#0B1A2F',
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
  },
  resetBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#1F3352',
    backgroundColor: '#122440',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#CAD4DF',
  },
  applyBtn: {
    flex: 2,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
