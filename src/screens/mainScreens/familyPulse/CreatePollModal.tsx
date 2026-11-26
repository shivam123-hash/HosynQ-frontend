import React, { useState, useEffect, useMemo } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { useAppDispatch, useAppSelector } from '../../../redux';
import { createPollThunk } from '../../../redux/features/pulse/pulseSlice';
import { isUUID } from '../../../redux/features/lists/listsSlice';
import Colors from '../../../units/Colors';
import DueDateTimeModal from '../tasksScreen/components/DueDateTimeModal';
import { FamilyMemberPulse } from './types';
import {
  extractPulseMembersFromFamilyState,
  isJestTestEnv,
} from './pulseApiHelpers';
import PulseModalContainer from './PulseModalContainer';
import PulseDialog, {
  INITIAL_PULSE_DIALOG_STATE,
  PulseDialogState,
} from './PulseDialog';

export interface CreatePollModalProps {
  visible: boolean;
  asModal?: boolean;
  members?: FamilyMemberPulse[];
  onClose: () => void;
  onSubmitPoll?: (pollData: {
    question: string;
    options: string[];
    allowMultiple: boolean;
    closesText: string;
    closesAt?: string;
    whoCanVote: string;
    voterIds?: string[];
  }) => void;
}

const buildFuturePresetIso = (daysOffset: number, hour = 20): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

const formatCloseLabel = (iso: string): string => {
  const d = new Date(iso);
  const datePart = d.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const timePart = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${datePart} · ${timePart}`;
};

export const CreatePollModal: React.FC<CreatePollModalProps> = ({
  visible,
  asModal = true,
  members: membersProp,
  onClose,
  onSubmitPoll,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const familyState = useAppSelector((state) => state.family);
  const pulseState = useAppSelector((state) => state.pulse);
  const isTestEnv = isJestTestEnv();

  const members = useMemo(
    () =>
      membersProp && membersProp.length > 0
        ? membersProp
        : extractPulseMembersFromFamilyState(familyState),
    [membersProp, familyState]
  );

  const presets = useMemo(
    () => [
      { id: 'none', label: 'No deadline', sublabel: 'Stays open until manually closed', iso: '' },
      { id: '24h', label: 'Tomorrow · 8:00 PM', sublabel: '24 hours from now', iso: buildFuturePresetIso(1) },
      { id: '3d', label: `${formatCloseLabel(buildFuturePresetIso(3))}`, sublabel: 'In 3 days', iso: buildFuturePresetIso(3) },
      { id: '1w', label: `${formatCloseLabel(buildFuturePresetIso(7))}`, sublabel: 'In 1 week', iso: buildFuturePresetIso(7) },
    ],
    []
  );

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [newOptionText, setNewOptionText] = useState('');
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [isQuestionFocused, setIsQuestionFocused] = useState(false);
  const [isNewOptionFocused, setIsNewOptionFocused] = useState(false);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [closesText, setClosesText] = useState('No deadline');
  const [closesAtIso, setClosesAtIso] = useState<string>('');
  const [whoCanVote, setWhoCanVote] = useState(`Everyone (${Math.max(members.length, 1)})`);
  const [showClosesModal, setShowClosesModal] = useState(false);
  const [showCustomDueModal, setShowCustomDueModal] = useState(false);
  const [showWhoCanVoteModal, setShowWhoCanVoteModal] = useState(false);
  const [selectedVoterIds, setSelectedVoterIds] = useState<string[]>([]);
  const [dialog, setDialog] = useState<PulseDialogState>(INITIAL_PULSE_DIALOG_STATE);

  useEffect(() => {
    if (visible) {
      setQuestion('');
      setOptions(['', '']);
      setNewOptionText('');
      setIsAddingOption(false);
      setAllowMultiple(false);
      setClosesText('No deadline');
      setClosesAtIso('');
      const allIds = members.map((m) => m.id);
      setSelectedVoterIds(allIds);
      setWhoCanVote(
        allIds.length > 0 ? `Everyone (${allIds.length})` : 'Everyone'
      );
    }
  }, [visible, members]);

  const adultMembers = useMemo(
    () => members.filter((m) => m.isAdult !== false),
    [members]
  );
  const kidMembers = useMemo(
    () => members.filter((m) => m.isAdult === false),
    [members]
  );

  const handleSelectPreset = (label: string, iso: string) => {
    setClosesText(label);
    setClosesAtIso(iso);
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
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  };

  const selectPresetVoters = (type: 'everyone' | 'adults' | 'kids') => {
    if (type === 'everyone') {
      setSelectedVoterIds(members.map((m) => m.id));
    } else if (type === 'adults' && adultMembers.length > 0) {
      setSelectedVoterIds(adultMembers.map((m) => m.id));
    } else if (type === 'kids' && kidMembers.length > 0) {
      setSelectedVoterIds(kidMembers.map((m) => m.id));
    }
  };

  const handleSaveWhoCanVote = () => {
    if (selectedVoterIds.length === members.length) {
      setWhoCanVote(`Everyone (${members.length})`);
    } else if (
      adultMembers.length > 0 &&
      selectedVoterIds.length === adultMembers.length &&
      adultMembers.every((a) => selectedVoterIds.includes(a.id))
    ) {
      setWhoCanVote(`Only adults (${adultMembers.length})`);
    } else if (
      kidMembers.length > 0 &&
      selectedVoterIds.length === kidMembers.length &&
      kidMembers.every((k) => selectedVoterIds.includes(k.id))
    ) {
      setWhoCanVote(`Only kids (${kidMembers.length})`);
    } else if (selectedVoterIds.length === 1) {
      const m = members.find((mem) => mem.id === selectedVoterIds[0]);
      setWhoCanVote(`${m?.displayName || m?.name || '1 member'} only`);
    } else {
      setWhoCanVote(`${selectedVoterIds.length} members`);
    }
    setShowWhoCanVoteModal(false);
  };

  const handleUpdateOption = (index: number, val: string) => {
    setOptions((prev) => prev.map((opt, idx) => (idx === index ? val : opt)));
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

  const showWarning = (title: string, desc: string) => {
    setDialog({
      visible: true,
      type: 'warning',
      title,
      description: desc,
      primaryButtonText: 'OK',
      secondaryButtonText: '',
    });
  };

  const handleSubmit = async () => {
    const cleanQ = question.trim();
    const cleanOpts = options.map((o) => o.trim()).filter(Boolean);

    if (!cleanQ) {
      showWarning('Question required', 'Enter a question for your family (up to 140 characters).');
      return;
    }
    if (cleanOpts.length < 2) {
      showWarning('Add at least 2 options', 'Polls require between 2 and 6 choices.');
      return;
    }
    const lowerSet = new Set(cleanOpts.map((o) => o.toLowerCase()));
    if (lowerSet.size !== cleanOpts.length) {
      showWarning('Duplicate options', 'Each poll option must be unique.');
      return;
    }

    if (closesAtIso) {
      const parsedClose = new Date(closesAtIso);
      if (Number.isNaN(parsedClose.getTime()) || parsedClose.getTime() <= Date.now()) {
        showWarning('Invalid close time', 'Poll close time must be in the future.');
        return;
      }
    }

    const isEveryone =
      members.length > 0 && selectedVoterIds.length === members.length;
    const validVoterIds = isEveryone
      ? undefined
      : selectedVoterIds.filter((id) => isUUID(id));

    if (!isTestEnv) {
      try {
        await dispatch(
          createPollThunk({
            question: cleanQ.slice(0, 140),
            options: cleanOpts.map((o) => o.slice(0, 80)),
            allowMultiple,
            ...(closesAtIso ? { closesAt: closesAtIso } : {}),
            ...(validVoterIds && validVoterIds.length > 0
              ? { voterIds: validVoterIds }
              : {}),
          })
        ).unwrap();
        onSubmitPoll?.({
          question: cleanQ,
          options: cleanOpts,
          allowMultiple,
          closesText,
          closesAt: closesAtIso || undefined,
          whoCanVote,
          voterIds: validVoterIds,
        });
        onClose();
      } catch (err: any) {
        setDialog({
          visible: true,
          type: 'danger',
          iconName: 'alert-circle',
          title: 'Could not post poll',
          description: typeof err === 'string' ? err : 'Please try again.',
          primaryButtonText: 'OK',
          secondaryButtonText: '',
        });
      }
      return;
    }

    onSubmitPoll?.({
      question: cleanQ,
      options: cleanOpts,
      allowMultiple,
      closesText,
      closesAt: closesAtIso || undefined,
      whoCanVote,
      voterIds: validVoterIds,
    });
    onClose();
  };

  return (
    <PulseModalContainer
      visible={visible}
      asModal={asModal}
      variant="push"
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
              maxLength={140}
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
                <TextInput
                  style={styles.optionTextInput}
                  value={option}
                  onChangeText={(txt) => handleUpdateOption(index, txt)}
                  placeholder={`Option ${index + 1}`}
                  placeholderTextColor={Colors.textPlaceholder}
                  maxLength={80}
                  selectionColor={Colors.primary}
                />
                {options.length > 2 && (
                  <TouchableOpacity
                    style={styles.deleteOptionButton}
                    onPress={() => handleRemoveOption(index)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove option ${index + 1}`}
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
                  maxLength={80}
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
            disabled={pulseState.submittingAction}
            activeOpacity={0.85}
          >
            {pulseState.submittingAction ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.postButtonText}>Post poll</Text>
            )}
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
                {presets.map((preset, idx) => {
                  const isSelected = closesText === preset.label;
                  const isLast = idx === presets.length - 1;
                  return (
                    <TouchableOpacity
                      key={preset.id}
                      style={[
                        styles.sheetRow,
                        !isLast && styles.sheetRowDivider,
                      ]}
                      onPress={() => handleSelectPreset(preset.label, preset.iso)}
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
          initialDate={new Date().toISOString().slice(0, 10)}
          initialTime="8:00 PM"
          onClose={() => setShowCustomDueModal(false)}
          onSave={(_newDate, newFormatted, newTime, isoDate) => {
            const formatted = newTime
              ? `${newFormatted} · ${newTime}`
              : newFormatted;
            setClosesText(formatted);
            if (isoDate) {
              const target = new Date(`${isoDate}T20:00:00.000Z`);
              if (!Number.isNaN(target.getTime())) {
                setClosesAtIso(target.toISOString());
              }
            }
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
                    selectedVoterIds.length === members.length && styles.filterChipActive,
                  ]}
                  onPress={() => selectPresetVoters('everyone')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedVoterIds.length === members.length && styles.filterChipTextActive,
                    ]}
                  >
                    {`Everyone (${members.length})`}
                  </Text>
                </TouchableOpacity>

                {adultMembers.length > 0 && (
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      selectedVoterIds.length === adultMembers.length &&
                        adultMembers.every((a) => selectedVoterIds.includes(a.id)) &&
                        styles.filterChipActive,
                    ]}
                    onPress={() => selectPresetVoters('adults')}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedVoterIds.length === adultMembers.length &&
                          adultMembers.every((a) => selectedVoterIds.includes(a.id)) &&
                          styles.filterChipTextActive,
                      ]}
                    >
                      {`Adults only (${adultMembers.length})`}
                    </Text>
                  </TouchableOpacity>
                )}

                {kidMembers.length > 0 && (
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      selectedVoterIds.length === kidMembers.length &&
                        kidMembers.every((k) => selectedVoterIds.includes(k.id)) &&
                        styles.filterChipActive,
                    ]}
                    onPress={() => selectPresetVoters('kids')}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedVoterIds.length === kidMembers.length &&
                          kidMembers.every((k) => selectedVoterIds.includes(k.id)) &&
                          styles.filterChipTextActive,
                      ]}
                    >
                      {`Kids only (${kidMembers.length})`}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Family Members List */}
              <View style={styles.sheetCard}>
                {members.map((m, idx) => {
                  const isSelected = selectedVoterIds.includes(m.id);
                  const isLast = idx === members.length - 1;
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
                        <Text style={styles.voterName}>{m.displayName}</Text>
                        <Text style={styles.voterRole}>
                          {m.familyRole || (m.isAdult ? 'Adult' : 'Child')}
                        </Text>
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

        <PulseDialog
          dialog={dialog}
          onClose={() => setDialog(INITIAL_PULSE_DIALOG_STATE)}
        />
      </View>
    </PulseModalContainer>
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
    fontFamily: 'Roboto-Bold',
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
    fontFamily: 'Roboto-Medium',
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
    fontFamily: 'Roboto-Medium',
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
    fontFamily: 'Roboto-Bold',
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
  optionTextInput: {
    color: Colors.white,
    fontSize: 15,
    fontFamily: 'Roboto-Medium',
    flex: 1,
    marginRight: 10,
    padding: 0,
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
    fontFamily: 'Roboto-SemiBold',
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
    fontFamily: 'Roboto-Bold',
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
    fontFamily: 'Roboto-Medium',
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
    fontFamily: 'Roboto-Regular',
    lineHeight: 16,
  },
  settingValueText: {
    fontSize: 15,
    color: Colors.white,
    fontFamily: 'Roboto-SemiBold',
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
    fontFamily: 'Roboto-Bold',
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
    backgroundColor: '#122440',
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
    fontFamily: 'Roboto-Bold',
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
    flexWrap: 'wrap',
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
    fontFamily: 'Roboto-Medium',
  },
  filterChipTextActive: {
    color: Colors.primary,
    fontFamily: 'Roboto-Bold',
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
    fontFamily: 'Roboto-SemiBold',
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
    fontFamily: 'Roboto-SemiBold',
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
    fontFamily: 'Roboto-Bold',
  },
  voterInfoCol: {
    flex: 1,
  },
  voterName: {
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
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
    fontFamily: 'Roboto-Bold',
  },
});

export default CreatePollModal;
