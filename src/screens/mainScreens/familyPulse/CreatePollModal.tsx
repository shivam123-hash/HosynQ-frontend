import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../../../units/Colors';

export interface CreatePollModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmitPoll: (pollData: {
    question: string;
    options: string[];
    allowMultiple: boolean;
    closesText: string;
    whoCanVote: string;
  }) => void;
}

export const CreatePollModal: React.FC<CreatePollModalProps> = ({
  visible,
  onClose,
  onSubmitPoll,
}) => {
  const insets = useSafeAreaInsets();
  const [question, setQuestion] = useState('What should we do on Sunday?');
  const [options, setOptions] = useState<string[]>([
    'Picnic at Lodhi Garden',
    'Movie at home',
    'Visit Nani',
  ]);
  const [newOptionText, setNewOptionText] = useState('');
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [closesText] = useState('Sat, 31 Oct · 8:00 PM');
  const [whoCanVote] = useState('Everyone (5)');

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, idx) => idx !== index));
  };

  const handleAddOption = () => {
    if (newOptionText.trim() && options.length < 6) {
      setOptions([...options, newOptionText.trim()]);
      setNewOptionText('');
      setIsAddingOption(false);
    }
  };

  const handleSubmit = () => {
    if (!question.trim() || options.length < 2) return;
    onSubmitPoll({
      question: question.trim(),
      options,
      allowMultiple,
      closesText,
      whoCanVote,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Feather name="x" size={20} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New poll</Text>
          <View style={styles.headerRightSpacer} />
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 90 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Question Section */}
          <Text style={styles.sectionLabel}>Question</Text>
          <View style={styles.questionInputContainer}>
            <TextInput
              style={styles.questionInput}
              value={question}
              onChangeText={setQuestion}
              placeholder="Ask a question..."
              placeholderTextColor={Colors.textPlaceholder}
              selectionColor={Colors.primary}
            />
          </View>

          {/* Options Header */}
          <View style={styles.optionsHeaderRow}>
            <Text style={styles.sectionHeaderUpper}>OPTIONS</Text>
            <Text style={styles.optionsSubtext}>Up to 6</Text>
          </View>

          {/* Options List */}
          <View style={styles.optionsList}>
            {options.map((option, index) => (
              <View key={`opt-${index}`} style={styles.optionItem}>
                <Text style={styles.optionText} numberOfLines={1}>
                  {option}
                </Text>
                {options.length > 2 && (
                  <TouchableOpacity
                    onPress={() => handleRemoveOption(index)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove option ${option}`}
                  >
                    <Feather name="x" size={16} color={Colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {isAddingOption ? (
              <View style={styles.addOptionInputRow}>
                <TextInput
                  style={styles.newOptionInput}
                  value={newOptionText}
                  onChangeText={setNewOptionText}
                  placeholder="Enter option"
                  placeholderTextColor={Colors.textPlaceholder}
                  autoFocus
                  onSubmitEditing={handleAddOption}
                />
                <TouchableOpacity
                  style={styles.saveOptionBtn}
                  onPress={handleAddOption}
                >
                  <Text style={styles.saveOptionText}>Add</Text>
                </TouchableOpacity>
              </View>
            ) : (
              options.length < 6 && (
                <TouchableOpacity
                  style={styles.addOptionButton}
                  onPress={() => setIsAddingOption(true)}
                  activeOpacity={0.7}
                >
                  <Feather
                    name="plus"
                    size={16}
                    color={Colors.primary}
                    style={styles.addOptionIcon}
                  />
                  <Text style={styles.addOptionText}>Add option</Text>
                </TouchableOpacity>
              )
            )}
          </View>

          {/* Settings Card */}
          <View style={styles.settingsCard}>
            {/* Allow more than one choice */}
            <View style={styles.settingRow}>
              <Text style={styles.settingTitle}>Allow more than one choice</Text>
              <Switch
                value={allowMultiple}
                onValueChange={setAllowMultiple}
                trackColor={{
                  false: Colors.surfaceMuted,
                  true: Colors.surfaceNavy,
                }}
                thumbColor={Colors.white}
              />
            </View>

            <View style={styles.divider} />

            {/* Closes */}
            <TouchableOpacity style={styles.settingActionRow} activeOpacity={0.7}>
              <Feather
                name="clock"
                size={18}
                color={Colors.textSecondary}
                style={styles.settingIcon}
              />
              <View style={styles.settingTextGroup}>
                <Text style={styles.settingSubLabel}>Closes</Text>
                <Text style={styles.settingValueText}>{closesText}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Who can vote */}
            <TouchableOpacity style={styles.settingActionRow} activeOpacity={0.7}>
              <Feather
                name="users"
                size={18}
                color={Colors.textSecondary}
                style={styles.settingIcon}
              />
              <View style={styles.settingTextGroup}>
                <Text style={styles.settingSubLabel}>Who can vote</Text>
                <Text style={styles.settingValueText}>{whoCanVote}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom CTA Button */}
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <TouchableOpacity
            style={styles.postButton}
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            <Text style={styles.postButtonText}>Post poll</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
  },
  headerRightSpacer: {
    width: 44,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sectionLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  questionInputContainer: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 20,
  },
  questionInput: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '500',
  },
  optionsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHeaderUpper: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.6,
  },
  optionsSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  optionsList: {
    gap: 10,
    marginBottom: 24,
  },
  optionItem: {
    height: 52,
    backgroundColor: Colors.cardBackground,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    marginRight: 10,
  },
  addOptionButton: {
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: Colors.borderMuted,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addOptionIcon: {
    marginRight: 6,
  },
  addOptionText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  addOptionInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 26,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  newOptionInput: {
    flex: 1,
    color: Colors.white,
    fontSize: 15,
  },
  saveOptionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.primary,
    borderRadius: 14,
  },
  saveOptionText: {
    color: Colors.black,
    fontWeight: '700',
    fontSize: 13,
  },
  settingsCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingTitle: {
    fontSize: 15,
    color: Colors.white,
    fontWeight: '500',
  },
  settingActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingIcon: {
    marginRight: 14,
  },
  settingTextGroup: {
    flex: 1,
  },
  settingSubLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  settingValueText: {
    fontSize: 15,
    color: Colors.white,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderSubtle,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  postButton: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CreatePollModal;
