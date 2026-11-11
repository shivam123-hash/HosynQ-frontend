import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TaskFilterState, TaskPriority, TaskCategory } from '../types';
import { CATEGORY_META, PRIORITY_META, FAMILY_MEMBERS } from '../mockData';

export interface FilterTasksModalProps {
  visible: boolean;
  onClose: () => void;
  filters: TaskFilterState;
  onApplyFilters: (filters: TaskFilterState) => void;
  matchCount: number;
}

const FilterTasksModal: React.FC<FilterTasksModalProps> = ({
  visible,
  onClose,
  filters,
  onApplyFilters,
  matchCount,
}) => {
  const insets = useSafeAreaInsets();
  const [localFilters, setLocalFilters] = React.useState<TaskFilterState>(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters, visible]);

  const handleClearAll = () => {
    const cleared: TaskFilterState = {
      assignedTo: 'everyone',
      priority: 'all',
      category: 'all',
      due: 'any',
    };
    setLocalFilters(cleared);
  };

  const handleSave = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const dueOptions: { id: TaskFilterState['due']; label: string }[] = [
    { id: 'any', label: 'Any time' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'today', label: 'Today' },
    { id: 'this_week', label: 'This week' },
    { id: 'this_month', label: 'This month' },
  ];

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

          <Text style={styles.sheetTitle}>Filter tasks</Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* ASSIGNED TO */}
            <Text style={styles.sectionHeader}>ASSIGNED TO</Text>
            <View style={styles.chipsRow}>
              {FAMILY_MEMBERS.map((member) => {
                const isSelected = localFilters.assignedTo === member.id;
                return (
                  <TouchableOpacity
                    key={member.id}
                    style={[
                      styles.chip,
                      isSelected ? styles.activeChip : styles.inactiveChip,
                    ]}
                    onPress={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        assignedTo: member.id,
                      }))
                    }
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected
                          ? styles.activeChipText
                          : styles.inactiveChipText,
                      ]}
                    >
                      {member.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* PRIORITY */}
            <Text style={styles.sectionHeader}>PRIORITY</Text>
            <View style={styles.chipsRow}>
              {(['high', 'medium', 'low'] as TaskPriority[]).map((p) => {
                const isSelected = localFilters.priority === p;
                const meta = PRIORITY_META[p];
                return (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.chip,
                      isSelected ? styles.activeChip : styles.inactiveChip,
                    ]}
                    onPress={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        priority: prev.priority === p ? 'all' : p,
                      }))
                    }
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.chipDot,
                        { backgroundColor: meta.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        isSelected
                          ? styles.activeChipText
                          : styles.inactiveChipText,
                      ]}
                    >
                      {p === 'high' ? 'High' : p === 'medium' ? 'Medium' : 'Low'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* CATEGORY */}
            <Text style={styles.sectionHeader}>CATEGORY</Text>
            <View style={styles.chipsRow}>
              {(
                [
                  'household',
                  'family',
                  'personal',
                  'finance',
                  'health',
                  'travel',
                ] as TaskCategory[]
              ).map((cat) => {
                const isSelected = localFilters.category === cat;
                const meta = CATEGORY_META[cat];
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.chip,
                      isSelected ? styles.activeChip : styles.inactiveChip,
                    ]}
                    onPress={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        category: prev.category === cat ? 'all' : cat,
                      }))
                    }
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.chipDot,
                        { backgroundColor: meta.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        isSelected
                          ? styles.activeChipText
                          : styles.inactiveChipText,
                      ]}
                    >
                      {meta.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* DUE */}
            <Text style={styles.sectionHeader}>DUE</Text>
            <View style={styles.chipsRow}>
              {dueOptions.map((opt) => {
                const isSelected = localFilters.due === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.chip,
                      isSelected ? styles.activeChip : styles.inactiveChip,
                    ]}
                    onPress={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        due: opt.id,
                      }))
                    }
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected
                          ? styles.activeChipText
                          : styles.inactiveChipText,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Bottom Action Buttons */}
          <View style={styles.bottomButtonsRow}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearAll}
              activeOpacity={0.7}
            >
              <Text style={styles.clearButtonText}>Clear all</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.showButton}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={styles.showButtonText}>
                {`Show ${matchCount} tasks`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FilterTasksModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 12, 22, 0.75)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#0B1A2F',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: '#1F3352',
    maxHeight: '85%',
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3A4556',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#CAD4DF',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#8A97AB',
    marginTop: 14,
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    height: 38,
    borderRadius: 19,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  activeChip: {
    backgroundColor: '#F0913A',
  },
  inactiveChip: {
    backgroundColor: '#122440',
    borderWidth: 1.5,
    borderColor: '#1F3352',
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipText: {
    fontSize: 14,
  },
  activeChipText: {
    color: '#0B1A2F',
    fontWeight: '700',
  },
  inactiveChipText: {
    color: '#CAD4DF',
    fontWeight: '500',
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  clearButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#3A4556',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  showButton: {
    flex: 1.3,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  showButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B1A2F',
  },
});

