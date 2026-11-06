import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface RepeatModalProps {
  visible: boolean;
  initialRepeat?: string;
  onClose: () => void;
  onSave: (repeat: string) => void;
}

const REPEAT_OPTIONS = [
  { id: 'none', title: 'Doesn’t repeat', subtitle: '' },
  { id: 'daily', title: 'Every day', subtitle: '' },
  { id: 'weekly', title: 'Every week', subtitle: 'On Mondays' },
  { id: 'monthly', title: 'Every month', subtitle: 'On the 2nd' },
  { id: 'quarterly', title: 'Every 3 months', subtitle: 'Fees, servicing' },
  { id: 'yearly', title: 'Every year', subtitle: 'Renewals, birthdays' },
  { id: 'custom', title: 'Custom', subtitle: 'Pick days and an end date' },
];

const RepeatModal: React.FC<RepeatModalProps> = ({
  visible,
  initialRepeat = 'Doesn’t repeat',
  onClose,
  onSave,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedRepeat, setSelectedRepeat] = useState<string>(initialRepeat);

  React.useEffect(() => {
    setSelectedRepeat(initialRepeat);
  }, [initialRepeat, visible]);

  const handleDone = () => {
    onSave(selectedRepeat);
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

          <Text style={styles.title}>Repeat</Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.optionsCard}>
              {REPEAT_OPTIONS.map((item, index) => {
                const isSelected =
                  selectedRepeat.toLowerCase() === item.title.toLowerCase() ||
                  (item.id === 'none' &&
                    selectedRepeat.toLowerCase().includes("doesn't"));

                const isLast = index === REPEAT_OPTIONS.length - 1;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.optionRow, !isLast && styles.rowDivider]}
                    onPress={() => setSelectedRepeat(item.title)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionTextCol}>
                      <Text style={styles.optionTitle}>{item.title}</Text>
                      {item.subtitle ? (
                        <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
                      ) : null}
                    </View>

                    {/* Radio Circle */}
                    <View
                      style={[
                        styles.radioCircle,
                        isSelected && styles.radioCircleSelected,
                      ]}
                    >
                      {isSelected && <View style={styles.radioInnerDot} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

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

export default RepeatModal;

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
    maxHeight: '88%',
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
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  optionsCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#1F3352',
  },
  optionTextCol: {
    flex: 1,
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
    marginTop: 2,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#3A4556',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#F0913A',
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
