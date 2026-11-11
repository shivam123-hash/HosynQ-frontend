import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';

export interface AddSheetModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTask: () => void;
  onSelectEvent: () => void;
  onSelectReminder: () => void;
  onSelectList: () => void;
  onSelectScan: () => void;
  onSelectUpload: () => void;
  onSelectAsk: () => void;
}

export const AddSheetModal: React.FC<AddSheetModalProps> = ({
  visible,
  onClose,
  onSelectTask,
  onSelectEvent,
  onSelectReminder,
  onSelectList,
  onSelectScan,
  onSelectUpload,
  onSelectAsk,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View
              style={[
                styles.sheetContainer,
                { paddingBottom: Math.max(insets.bottom + 16, 28) },
              ]}
            >
              {/* Drag Handle */}
              <View style={styles.dragHandle} />

              {/* Header */}
              <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>Add to HosynQ</Text>
                <TouchableOpacity
                  onPress={onClose}
                  activeOpacity={0.7}
                  style={styles.closeBtn}
                  accessibilityLabel="Close Add Sheet"
                  accessibilityRole="button"
                >
                  <Feather name="x" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* AI Prompt Bar */}
              <TouchableOpacity
                onPress={onSelectAsk}
                activeOpacity={0.85}
                style={styles.aiPromptBar}
                accessibilityRole="button"
                accessibilityLabel="Ask HosynQ to add something"
              >
                <View style={styles.aiLeftGroup}>
                  <Text style={styles.sparkleIcon}>✦</Text>
                  <Text style={styles.aiPlaceholder}>
                    Ask HosynQ to add something
                  </Text>
                </View>
                <View style={styles.micCircle}>
                  <Feather name="mic" size={17} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              {/* Hint under AI Prompt */}
              <Text style={styles.hintText}>
                Try “Remind Rohan to pay the bus fee on Friday”
              </Text>

              {/* 6 Quick Action Grid Cards */}
              <View style={styles.grid}>
                {/* 1. Task */}
                <TouchableOpacity
                  onPress={onSelectTask}
                  activeOpacity={0.7}
                  style={styles.card}
                  accessibilityRole="button"
                  accessibilityLabel="Add Task"
                >
                  <View style={[styles.iconCircle, styles.taskIconRing]}>
                    <Feather name="check-square" size={22} color="#F0913A" />
                  </View>
                  <Text style={styles.cardTitle}>Task</Text>
                  <Text style={styles.cardSubtitle}>Something to do</Text>
                </TouchableOpacity>

                {/* 2. Event */}
                <TouchableOpacity
                  onPress={onSelectEvent}
                  activeOpacity={0.7}
                  style={styles.card}
                  accessibilityRole="button"
                  accessibilityLabel="Add Event"
                >
                  <View style={[styles.iconCircle, styles.eventIconRing]}>
                    <Feather name="calendar" size={22} color="#3A8EF0" />
                  </View>
                  <Text style={styles.cardTitle}>Event</Text>
                  <Text style={styles.cardSubtitle}>Something at a time</Text>
                </TouchableOpacity>

                {/* 3. Reminder */}
                <TouchableOpacity
                  onPress={onSelectReminder}
                  activeOpacity={0.7}
                  style={styles.card}
                  accessibilityRole="button"
                  accessibilityLabel="Add Reminder"
                >
                  <View style={[styles.iconCircle, styles.reminderIconRing]}>
                    <Feather name="bell" size={22} color="#9D65E5" />
                  </View>
                  <Text style={styles.cardTitle}>Reminder</Text>
                  <Text style={styles.cardSubtitle}>
                    A nudge, by time or place
                  </Text>
                </TouchableOpacity>

                {/* 4. List */}
                <TouchableOpacity
                  onPress={onSelectList}
                  activeOpacity={0.7}
                  style={styles.card}
                  accessibilityRole="button"
                  accessibilityLabel="Add List"
                >
                  <View style={[styles.iconCircle, styles.listIconRing]}>
                    <Feather name="list" size={22} color="#2EC4B6" />
                  </View>
                  <Text style={styles.cardTitle}>List</Text>
                  <Text style={styles.cardSubtitle}>Groceries, packing</Text>
                </TouchableOpacity>

                {/* 5. Scan */}
                <TouchableOpacity
                  onPress={onSelectScan}
                  activeOpacity={0.7}
                  style={styles.card}
                  accessibilityRole="button"
                  accessibilityLabel="Scan Document"
                >
                  <View style={[styles.iconCircle, styles.scanIconRing]}>
                    <Feather name="maximize" size={22} color="#00C2CB" />
                  </View>
                  <Text style={styles.cardTitle}>Scan</Text>
                  <Text style={styles.cardSubtitle}>Bills, circulars</Text>
                </TouchableOpacity>

                {/* 6. Upload */}
                <TouchableOpacity
                  onPress={onSelectUpload}
                  activeOpacity={0.7}
                  style={styles.card}
                  accessibilityRole="button"
                  accessibilityLabel="Upload Document"
                >
                  <View style={[styles.iconCircle, styles.uploadIconRing]}>
                    <Feather name="image" size={22} color="#E84A5F" />
                  </View>
                  <Text style={styles.cardTitle}>Upload</Text>
                  <Text style={styles.cardSubtitle}>Photo or PDF</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 11, 18, 0.7)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#0B1A2F',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#1C2B3D',
  },
  dragHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334457',
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#182738',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiPromptBar: {
    backgroundColor: '#101F2F',
    borderWidth: 1.5,
    borderColor: '#F0913A',
    borderRadius: 24,
    paddingVertical: 10,
    paddingLeft: 16,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sparkleIcon: {
    color: '#F0913A',
    fontSize: 18,
    marginRight: 10,
    fontWeight: 'bold',
  },
  aiPlaceholder: {
    color: '#8E9BAE',
    fontSize: 15,
    fontWeight: '500',
  },
  micCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F0913A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintText: {
    color: '#7D8B9B',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  card: {
    width: '31.5%',
    backgroundColor: '#112030',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#192B3E',
    minHeight: 120,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginBottom: 10,
  },
  taskIconRing: {
    backgroundColor: 'rgba(240, 145, 58, 0.1)',
    borderColor: '#F0913A',
  },
  eventIconRing: {
    backgroundColor: 'rgba(58, 142, 240, 0.1)',
    borderColor: '#3A8EF0',
  },
  reminderIconRing: {
    backgroundColor: 'rgba(157, 101, 229, 0.1)',
    borderColor: '#9D65E5',
  },
  listIconRing: {
    backgroundColor: 'rgba(46, 196, 182, 0.1)',
    borderColor: '#2EC4B6',
  },
  scanIconRing: {
    backgroundColor: 'rgba(0, 194, 203, 0.1)',
    borderColor: '#00C2CB',
  },
  uploadIconRing: {
    backgroundColor: 'rgba(232, 74, 95, 0.1)',
    borderColor: '#E84A5F',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#7D8B9B',
    textAlign: 'center',
    lineHeight: 14,
  },
});
