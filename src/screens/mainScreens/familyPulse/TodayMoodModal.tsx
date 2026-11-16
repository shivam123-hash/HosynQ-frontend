import React, { useState, useEffect } from 'react';
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

const MOOD_MINT_GREEN = '#4CC38A';

const MOODS: {
  id: MoodType;
  label: string;
  iconName: string;
  iconColor: string;
}[] = [
  {
    id: 'great',
    label: 'Great',
    iconName: 'smile',
    iconColor: MOOD_MINT_GREEN,
  },
  {
    id: 'good',
    label: 'Good',
    iconName: 'smile',
    iconColor: MOOD_MINT_GREEN,
  },
  {
    id: 'okay',
    label: 'Okay',
    iconName: 'meh',
    iconColor: Colors.accentYellow,
  },
  {
    id: 'tired',
    label: 'Tired',
    iconName: 'minus-circle',
    iconColor: Colors.accentBlueSoft,
  },
  {
    id: 'stressed',
    label: 'Stressed',
    iconName: 'frown',
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

  useEffect(() => {
    if (visible && currentMood) {
      setSelectedMood(currentMood);
    }
  }, [visible, currentMood]);

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
                      <Feather
                        name={item.iconName as any}
                        size={30}
                        color={item.iconColor}
                        style={styles.moodIcon}
                      />
                      <Text
                        style={[
                          styles.moodLabel,
                          isSelected && styles.moodLabelSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Confirmation status row */}
              <View style={styles.statusRow}>
                <Feather
                  name="check-circle"
                  size={18}
                  color={MOOD_MINT_GREEN}
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
                    size={16}
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
    borderColor: '#1E314B',
  },
  dragHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3A4B62',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: Colors.white,
    textAlign: 'left',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'left',
    lineHeight: 22,
    marginBottom: 22,
  },
  moodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 22,
  },
  moodCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 2,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: '#1E314B',
  },
  moodCardSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: Colors.cardBackground,
  },
  moodIcon: {
    marginBottom: 10,
  },
  moodLabel: {
    fontSize: 13.5,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  moodLabelSelected: {
    color: Colors.white,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 2,
  },
  statusIcon: {
    marginRight: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#C5D2E0',
    lineHeight: 20,
    flex: 1,
  },
  addNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  addNoteIcon: {
    marginRight: 8,
  },
  addNoteText: {
    fontSize: 16,
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

