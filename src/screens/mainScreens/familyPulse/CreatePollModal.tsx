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
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../../../units/Colors';
import DueDateTimeModal from '../tasksScreen/components/DueDateTimeModal';

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

interface FamilyMemberItem {
  id: string;
  name: string;
  role: string;
  initial: string;
  bgColor: string;
  textColor: string;
}

const POLL_MEMBERS: FamilyMemberItem[] = [
  { id: 'you', name: 'You', role: 'Priya', initial: 'P', bgColor: Colors.avatarBrown, textColor: Colors.primarySubtle },
  { id: 'rohan', name: 'Rohan', role: 'Husband', initial: 'R', bgColor: Colors.avatarNavy, textColor: Colors.accentBlueSoft },
  { id: 'dadi', name: 'Dadi', role: 'Grandmother', initial: 'D', bgColor: Colors.avatarGreen, textColor: Colors.accentGreenSoft },
  { id: 'anaya', name: 'Anaya', role: 'Daughter', initial: 'A', bgColor: Colors.avatarWine, textColor: Colors.accentPink },
  { id: 'aarav', name: 'Aarav', role: 'Son', initial: 'Aa', bgColor: Colors.avatarOlive, textColor: Colors.accentYellow },
];

const POLL_CLOSE_PRESETS = [
  { id: '24h', label: 'Tomorrow · 8:00 PM', sublabel: '24 hours from now' },
  { id: '3d', label: 'Sat, 31 Oct · 8:00 PM', sublabel: 'In 3 days' },
  { id: '1w', label: 'Fri, 6 Nov · 8:00 PM', sublabel: 'In 1 week' },
  { id: '2w', label: 'Fri, 13 Nov · 8:00 PM', sublabel: 'In 2 weeks' },
];

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
  const [isQuestionFocused, setIsQuestionFocused] = useState(false);
  const [isNewOptionFocused, setIsNewOptionFocused] = useState(false);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [closesText, setClosesText] = useState('Sat, 31 Oct · 8:00 PM');
  const [whoCanVote, setWhoCanVote] = useState('Everyone (5)');
  const [showClosesModal, setShowClosesModal] = useState(false);
  const [showCustomDueModal, setShowCustomDueModal] = useState(false);
  const [showWhoCanVoteModal, setShowWhoCanVoteModal] = useState(false);
  const [selectedVoterIds, setSelectedVoterIds] = useState<string[]>([
    'you',
    'rohan',
    'dadi',
    'anaya',
    'aarav',
  ]);

  const handleSelectPreset = (presetLabel: string) => {
    setClosesText(presetLabel);
    setShowClosesModal(false);
  };

  const handleOpenCustomPicker = () => {
    setShowClosesModal(false);
    setTimeout(() => {
      setShowCustomDueModal(true);
    }, 250);
  };

  const toggleVoter = (id: string) => {
    setSelectedVoterIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least one voter
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  };

  const selectPresetVoters = (type: 'everyone' | 'adults' | 'kids') => {
    if (type === 'everyone') {
      setSelectedVoterIds(['you', 'rohan', 'dadi', 'anaya', 'aarav']);
    } else if (type === 'adults') {
      setSelectedVoterIds(['you', 'rohan', 'dadi']);
    } else if (type === 'kids') {
      setSelectedVoterIds(['anaya', 'aarav']);
    }
  };

  const handleSaveWhoCanVote = () => {
    if (selectedVoterIds.length === 5) {
      setWhoCanVote('Everyone (5)');
    } else {
      const adultsOnly =
        selectedVoterIds.length === 3 &&
        selectedVoterIds.includes('you') &&
        selectedVoterIds.includes('rohan') &&
        selectedVoterIds.includes('dadi');
      const kidsOnly =
        selectedVoterIds.length === 2 &&
        selectedVoterIds.includes('anaya') &&
        selectedVoterIds.includes('aarav');

      if (adultsOnly) {
        setWhoCanVote('Only adults (3)');
      } else if (kidsOnly) {
        setWhoCanVote('Only kids (2)');
      } else if (selectedVoterIds.length === 1) {
        const member = POLL_MEMBERS.find((m) => m.id === selectedVoterIds[0]);
        setWhoCanVote(`${member?.name || '1 member'} only`);
      } else {
        setWhoCanVote(`${selectedVoterIds.length} members`);
      }
    }
    setShowWhoCanVoteModal(false);
  };

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
        <StatusBar barStyle="light-content" />

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
          <View
            style={[
              styles.questionInputContainer,
              isQuestionFocused && styles.questionInputContainerFocused,
            ]}
          >
            <TextInput
              style={styles.questionInput}
              value={question}
              onChangeText={setQuestion}
              onFocus={() => setIsQuestionFocused(true)}
              onBlur={() => setIsQuestionFocused(false)}
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
                    style={styles.deleteOptionButton}
                    onPress={() => handleRemoveOption(index)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove option ${option}`}
                  >
                    <Feather name="x" size={16} color="#8FA0B5" />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {isAddingOption ? (
              <View
                style={[
                  styles.addOptionInputRow,
                  isNewOptionFocused && styles.addOptionInputRowFocused,
                ]}
              >
                <TextInput
                  style={styles.newOptionInput}
                  value={newOptionText}
                  onChangeText={setNewOptionText}
                  onFocus={() => setIsNewOptionFocused(true)}
                  onBlur={() => setIsNewOptionFocused(false)}
                  placeholder="Enter option"
                  placeholderTextColor={Colors.textPlaceholder}
                  autoFocus
                  onSubmitEditing={handleAddOption}
                  selectionColor={Colors.primary}
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
                  false: '#26374D',
                  true: Colors.primary,
                }}
                thumbColor={Colors.white}
                ios_backgroundColor="#26374D"
              />
            </View>

            <View style={styles.divider} />

            {/* Closes */}
            <TouchableOpacity
              style={styles.settingActionRow}
              activeOpacity={0.7}
              onPress={() => setShowClosesModal(true)}
              accessibilityRole="button"
              accessibilityLabel="Change when poll closes"
            >
              <View style={styles.settingIconWrapper}>
                <Feather name="clock" size={20} color="#8FA0B5" />
              </View>
              <View style={styles.settingTextGroup}>
                <Text style={styles.settingSubLabel}>Closes</Text>
                <Text style={styles.settingValueText}>{closesText}</Text>
              </View>
              <View style={styles.settingChevronWrapper}>
                <Feather name="chevron-right" size={20} color="#8FA0B5" />
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Who can vote */}
            <TouchableOpacity
              style={styles.settingActionRow}
              activeOpacity={0.7}
              onPress={() => setShowWhoCanVoteModal(true)}
              accessibilityRole="button"
              accessibilityLabel="Change who can vote"
            >
              <View style={styles.settingIconWrapper}>
                <Feather name="users" size={20} color="#8FA0B5" />
              </View>
              <View style={styles.settingTextGroup}>
                <Text style={styles.settingSubLabel}>Who can vote</Text>
                <Text style={styles.settingValueText}>{whoCanVote}</Text>
              </View>
              <View style={styles.settingChevronWrapper}>
                <Feather name="chevron-right" size={20} color="#8FA0B5" />
              </View>
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

        {/* Poll Closes Duration Modal */}
        <Modal
          visible={showClosesModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowClosesModal(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setShowClosesModal(false)}
            />
            <View
              style={[
                styles.sheetContainer,
                { paddingBottom: Math.max(insets.bottom, 16) + 16 },
              ]}
            >
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Poll closes</Text>
              <Text style={styles.sheetSubtitle}>
                Choose when voting ends for this poll
              </Text>

              <View style={styles.sheetCard}>
                {POLL_CLOSE_PRESETS.map((preset, idx) => {
                  const isSelected = closesText === preset.label;
                  const isLast = idx === POLL_CLOSE_PRESETS.length - 1;
                  return (
                    <TouchableOpacity
                      key={preset.id}
                      style={[
                        styles.sheetRow,
                        !isLast && styles.sheetRowDivider,
                      ]}
                      onPress={() => handleSelectPreset(preset.label)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.sheetRowTextGroup}>
                        <Text style={styles.sheetRowTitle}>{preset.label}</Text>
                        <Text style={styles.sheetRowSub}>{preset.sublabel}</Text>
                      </View>
                      {isSelected ? (
                        <View style={styles.sheetCheckActive}>
                          <Feather name="check" size={14} color={Colors.white} />
                        </View>
                      ) : (
                        <View style={styles.sheetCheckInactive} />
                      )}
                    </TouchableOpacity>
                  );
                })}

                <View style={styles.sheetDivider} />

                <TouchableOpacity
                  style={styles.sheetRow}
                  onPress={handleOpenCustomPicker}
                  activeOpacity={0.7}
                >
                  <Feather
                    name="calendar"
                    size={18}
                    color={Colors.primary}
                    style={styles.sheetRowIcon}
                  />
                  <Text style={styles.sheetRowCustomText}>
                    Pick custom date & time...
                  </Text>
                  <Feather name="chevron-right" size={18} color="#8FA0B5" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Full Date & Time Picker */}
        <DueDateTimeModal
          visible={showCustomDueModal}
          initialDate={closesText.split('·')[0]?.trim() || 'Sat, 31 Oct'}
          initialTime={closesText.split('·')[1]?.trim() || '8:00 PM'}
          onClose={() => setShowCustomDueModal(false)}
          onSave={(_newDate, newFormatted, newTime) => {
            const formatted = newTime
              ? `${newFormatted} · ${newTime}`
              : newFormatted;
            setClosesText(formatted);
            setShowCustomDueModal(false);
          }}
        />

        {/* Who Can Vote Modal */}
        <Modal
          visible={showWhoCanVoteModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowWhoCanVoteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setShowWhoCanVoteModal(false)}
            />
            <View
              style={[
                styles.sheetContainer,
                { paddingBottom: Math.max(insets.bottom, 16) + 16 },
              ]}
            >
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Who can vote?</Text>
              <Text style={styles.sheetSubtitle}>
                Choose who in your family can participate in this poll
              </Text>

              {/* Quick Preset Filter Chips */}
              <View style={styles.filterChipsRow}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedVoterIds.length === 5 && styles.filterChipActive,
                  ]}
                  onPress={() => selectPresetVoters('everyone')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedVoterIds.length === 5 && styles.filterChipTextActive,
                    ]}
                  >
                    Everyone (5)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedVoterIds.length === 3 &&
                      selectedVoterIds.includes('you') &&
                      selectedVoterIds.includes('rohan') &&
                      selectedVoterIds.includes('dadi') &&
                      styles.filterChipActive,
                  ]}
                  onPress={() => selectPresetVoters('adults')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedVoterIds.length === 3 &&
                        selectedVoterIds.includes('you') &&
                        selectedVoterIds.includes('rohan') &&
                        selectedVoterIds.includes('dadi') &&
                        styles.filterChipTextActive,
                    ]}
                  >
                    Adults only (3)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedVoterIds.length === 2 &&
                      selectedVoterIds.includes('anaya') &&
                      selectedVoterIds.includes('aarav') &&
                      styles.filterChipActive,
                  ]}
                  onPress={() => selectPresetVoters('kids')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedVoterIds.length === 2 &&
                        selectedVoterIds.includes('anaya') &&
                        selectedVoterIds.includes('aarav') &&
                        styles.filterChipTextActive,
                    ]}
                  >
                    Kids only (2)
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Family Members List */}
              <View style={styles.sheetCard}>
                {POLL_MEMBERS.map((m, idx) => {
                  const isSelected = selectedVoterIds.includes(m.id);
                  const isLast = idx === POLL_MEMBERS.length - 1;
                  return (
                    <TouchableOpacity
                      key={m.id}
                      style={[
                        styles.memberVoteRow,
                        !isLast && styles.sheetRowDivider,
                      ]}
                      onPress={() => toggleVoter(m.id)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.voterAvatarCircle,
                          { backgroundColor: m.bgColor },
                        ]}
                      >
                        <Text
                          style={[
                            styles.voterAvatarText,
                            { color: m.textColor },
                          ]}
                        >
                          {m.initial}
                        </Text>
                      </View>

                      <View style={styles.voterInfoCol}>
                        <Text style={styles.voterName}>{m.name}</Text>
                        <Text style={styles.voterRole}>{m.role}</Text>
                      </View>

                      {isSelected ? (
                        <View style={styles.sheetCheckActive}>
                          <Feather name="check" size={14} color={Colors.white} />
                        </View>
                      ) : (
                        <View style={styles.sheetCheckInactive} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={styles.sheetDoneBtn}
                onPress={handleSaveWhoCanVote}
                activeOpacity={0.85}
              >
                <Text style={styles.sheetDoneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3A4556',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  headerRightSpacer: {
    width: 44,
    height: 44,
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
    borderWidth: 1,
    borderColor: '#1E314B',
    borderRadius: 27,
    paddingHorizontal: 20,
    height: 54,
    justifyContent: 'center',
    marginBottom: 20,
  },
  questionInputContainerFocused: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  questionInput: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '500',
    padding: 0,
    paddingVertical: 0,
    textAlignVertical: 'center',
    height: '100%',
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
    gap: 12,
    marginBottom: 20,
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
    borderColor: '#3A4556',
  },
  optionText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    marginRight: 10,
  },
  deleteOptionButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addOptionButton: {
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#3A4556',
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addOptionIcon: {
    marginRight: 8,
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
    borderColor: '#1E314B',
  },
  addOptionInputRowFocused: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E314B',
    overflow: 'hidden',
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    minHeight: 56,
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
    paddingHorizontal: 18,
    minHeight: 64,
    paddingVertical: 12,
  },
  settingIconWrapper: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingTextGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  settingSubLabel: {
    fontSize: 12,
    color: '#8FA0B5',
    marginBottom: 3,
    fontWeight: '400',
    lineHeight: 16,
  },
  settingValueText: {
    fontSize: 15,
    color: Colors.white,
    fontWeight: '600',
    lineHeight: 20,
  },
  settingChevronWrapper: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#1E314B',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: '#1E314B',
  },
  postButton: {
    height: 54,
    backgroundColor: Colors.primary,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContainer: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: '#1E314B',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3A4B62',
    alignSelf: 'center',
    marginBottom: 18,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 18,
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: '#3A4556',
  },
  filterChipActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(240, 145, 58, 0.12)',
  },
  filterChipText: {
    fontSize: 13,
    color: '#C5D2E0',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  sheetCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E314B',
    overflow: 'hidden',
    marginBottom: 20,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    height: 56,
  },
  sheetRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#1E314B',
  },
  sheetDivider: {
    height: 1,
    backgroundColor: '#1E314B',
  },
  sheetRowTextGroup: {
    flex: 1,
  },
  sheetRowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
  sheetRowSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sheetRowIcon: {
    marginRight: 12,
  },
  sheetRowCustomText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
    flex: 1,
  },
  sheetCheckActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCheckInactive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#3A4556',
  },
  memberVoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 58,
  },
  voterAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  voterAvatarText: {
    fontSize: 15,
    fontWeight: '700',
  },
  voterInfoCol: {
    flex: 1,
  },
  voterName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
  voterRole: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sheetDoneBtn: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetDoneBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CreatePollModal;
