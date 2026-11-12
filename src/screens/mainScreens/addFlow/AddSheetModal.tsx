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
import Colors from '../../../units/Colors';

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
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                >
                  <Feather name="x" size={20} color={Colors.white} />
                </TouchableOpacity>
              </View>

              {/* AI Prompt Input Bar */}
              <TouchableOpacity
                onPress={onSelectAsk}
                activeOpacity={0.8}
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
                  <Feather name="mic" size={17} color={Colors.white} />
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
                    <Feather name="check-square" size={22} color={Colors.primary} />
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
                    <Feather name="calendar" size={22} color={Colors.accentBlue} />
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
                    <Feather name="bell" size={22} color={Colors.accentPurple} />
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
                    <Feather name="list" size={22} color={Colors.accentTeal} />
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
                    <Feather name="maximize" size={22} color={Colors.accentCyan} />
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
                    <Feather name="image" size={22} color={Colors.accentRed} />
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
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.borderBold,
  },
  dragHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderMuted,
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
    color: Colors.white,
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceCardDark,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiPromptBar: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 26,
    height: 52,
    paddingLeft: 18,
    paddingRight: 6,
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
    color: Colors.primary,
    fontSize: 20,
    marginRight: 10,
    fontWeight: 'bold',
  },
  aiPlaceholder: {
    color: Colors.textSubtle,
    fontSize: 15,
    fontWeight: '500',
  },
  micCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintText: {
    color: Colors.textTertiary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  card: {
    width: '31%',
    backgroundColor: Colors.cardBackground,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderBold,
    minHeight: 126,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginBottom: 12,
  },
  taskIconRing: {
    backgroundColor: 'rgba(240, 145, 58, 0.12)',
    borderColor: Colors.primary,
  },
  eventIconRing: {
    backgroundColor: 'rgba(58, 142, 240, 0.12)',
    borderColor: Colors.accentBlue,
  },
  reminderIconRing: {
    backgroundColor: 'rgba(157, 101, 229, 0.12)',
    borderColor: Colors.accentPurple,
  },
  listIconRing: {
    backgroundColor: 'rgba(46, 196, 182, 0.12)',
    borderColor: Colors.accentTeal,
  },
  scanIconRing: {
    backgroundColor: 'rgba(0, 194, 203, 0.12)',
    borderColor: Colors.accentCyan,
  },
  uploadIconRing: {
    backgroundColor: 'rgba(232, 74, 95, 0.12)',
    borderColor: Colors.accentRed,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 11,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 15,
  },
});
