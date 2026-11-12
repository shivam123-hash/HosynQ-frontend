import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../../../units/Colors';
import { MoodType } from './types';

export interface TodayMoodModalProps {
  visible: boolean;
  currentMood?: MoodType;
  onClose: () => void;
  onSelectMood: (mood: MoodType, note?: string) => void;
}

const MOODS: {
  id: MoodType;
  label: string;
  iconName: string;
  circleColor: string;
  iconColor: string;
}[] = [
  {
    id: 'great',
    label: 'Great',
    iconName: 'smile',
    circleColor: 'rgba(46, 196, 182, 0.15)',
    iconColor: Colors.accentTeal,
  },
  {
    id: 'good',
    label: 'Good',
    iconName: 'smile',
    circleColor: 'rgba(46, 196, 182, 0.15)',
    iconColor: Colors.accentTeal,
  },
  {
    id: 'okay',
    label: 'Okay',
    iconName: 'meh',
    circleColor: 'rgba(242, 193, 77, 0.15)',
    iconColor: Colors.accentYellow,
  },
  {
    id: 'tired',
    label: 'Tired',
    iconName: 'minus-circle',
    circleColor: 'rgba(58, 142, 240, 0.15)',
    iconColor: Colors.accentBlue,
  },
  {
    id: 'stressed',
    label: 'Stressed',
    iconName: 'frown',
    circleColor: 'rgba(232, 74, 95, 0.15)',
    iconColor: Colors.accentRed,
  },
];

export const TodayMoodModal: React.FC<TodayMoodModalProps> = ({
  visible,
  currentMood = 'good',
  onClose,
  onSelectMood,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedMood, setSelectedMood] = useState<MoodType>(currentMood);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState('');

  const handleSelect = (mood: MoodType) => {
    setSelectedMood(mood);
    onSelectMood(mood, note);
  };

  const handleSaveNote = () => {
    onSelectMood(selectedMood, note);
    setShowNoteInput(false);
  };

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
                styles.sheet,
                { paddingBottom: Math.max(insets.bottom + 16, 28) },
              ]}
            >
              <View style={styles.dragHandle} />

              <Text style={styles.title}>How are you today?</Text>
              <Text style={styles.subtitle}>
                One tap. Your family sees it in Pulse until midnight.
              </Text>

              {/* Mood Buttons Row */}
              <View style={styles.moodRow}>
                {MOODS.map((item) => {
                  const isSelected = selectedMood === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => handleSelect(item.id)}
                      activeOpacity={0.7}
                      style={[
                        styles.moodCard,
                        isSelected && styles.moodCardSelected,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={item.label}
                    >
                      <View
                        style={[
                          styles.moodIconCircle,
                          { backgroundColor: item.circleColor },
                        ]}
                      >
                        <Feather
                          name={item.iconName as any}
                          size={24}
                          color={item.iconColor}
                        />
                      </View>
                      <Text style={styles.moodLabel}>{item.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Confirmation status row */}
              <View style={styles.statusRow}>
                <Feather
                  name="check-circle"
                  size={16}
                  color={Colors.accentTeal}
                  style={styles.statusIcon}
                />
                <Text style={styles.statusText}>
                  Shared with your family. You can change it any time today.
                </Text>
              </View>

              {/* Add Note Section */}
              {showNoteInput ? (
                <View style={styles.noteInputContainer}>
                  <TextInput
                    value={note}
                    onChangeText={setNote}
                    placeholder="Add a short note about your day..."
                    placeholderTextColor={Colors.textPlaceholder}
                    style={styles.noteInput}
                    autoFocus
                  />
                  <TouchableOpacity
                    onPress={handleSaveNote}
                    activeOpacity={0.7}
                    style={styles.saveNoteBtn}
                  >
                    <Text style={styles.saveNoteBtnText}>Done</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setShowNoteInput(true)}
                  activeOpacity={0.7}
                  style={styles.addNoteBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Add a note"
                >
                  <Feather
                    name="edit-2"
                    size={15}
                    color={Colors.primary}
                    style={styles.addNoteIcon}
                  />
                  <Text style={styles.addNoteText}>
                    {note ? `Note: "${note}"` : 'Add a note'}
                  </Text>
                </TouchableOpacity>
              )}
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
    backgroundColor: 'rgba(5, 11, 18, 0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.cardBackground,
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
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSubtle,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  moodCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: Colors.surfaceSubtle,
    marginHorizontal: 3,
    borderWidth: 1.5,
    borderColor: Colors.transparent,
  },
  moodCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceNavyDark,
  },
  moodIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  statusIcon: {
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: Colors.textSubtle,
    textAlign: 'center',
    lineHeight: 16,
    flexShrink: 1,
  },
  addNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  addNoteIcon: {
    marginRight: 6,
  },
  addNoteText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  noteInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  noteInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: Colors.white,
  },
  saveNoteBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  saveNoteBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
});

export default TodayMoodModal;

