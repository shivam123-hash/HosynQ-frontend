import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../../../units/Colors';

export type AskHosynQStage =
  | 'initial'
  | 'thinking'
  | 'clarifying'
  | 'proposed'
  | 'editing'
  | 'couldNotUnderstand';

export interface AskHosynQModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmAdded: (title: string) => void;
  onCancelProposal?: () => void;
  onMakeTask?: () => void;
  onMakeEvent?: () => void;
  initialStage?: AskHosynQStage;
  thinkingDurationMs?: number;
}

export const AskHosynQModal: React.FC<AskHosynQModalProps> = ({
  visible,
  onClose,
  onConfirmAdded,
  onCancelProposal,
  onMakeTask,
  onMakeEvent,
  initialStage,
  thinkingDurationMs = 700,
}) => {
  const insets = useSafeAreaInsets();
  const [stage, setStage] = useState<AskHosynQStage>(initialStage || 'initial');
  const [inputMessage, setInputMessage] = useState(
    "Add Aarav's PTM Friday 3 PM and remind both of us Thursday"
  );
  const [selectedFriday, setSelectedFriday] = useState('This Friday, 6 Nov');
  const [selectedTime, setSelectedTime] = useState('3:00 PM');

  // Proposal edit state
  const [eventTitle, setEventTitle] = useState("Aarav's PTM");
  const [eventWhen, _setEventWhen] = useState('Fri, 6 Nov · 3:00 – 3:45 PM');
  const [eventWhere, setEventWhere] = useState("St. Mary's School");
  const [eventCategory, _setEventCategory] = useState('Family');

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setStage(initialStage || 'initial');
    } else if (initialStage) {
      setStage(initialStage);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [visible, initialStage]);

  const triggerThinkingToProposed = () => {
    if (thinkingDurationMs === 0) {
      setStage('proposed');
      return;
    }
    setStage('thinking');
    timerRef.current = setTimeout(() => {
      setStage('proposed');
    }, thinkingDurationMs);
  };

  const handleSend = () => {
    if (stage === 'initial') {
      const lower = inputMessage.toLowerCase();
      if (lower.includes('sort') || lower.includes('dadi next week')) {
        setStage('couldNotUnderstand');
        setInputMessage('Book Dadi’s eye check-up');
        return;
      }
      triggerThinkingToProposed();
    } else if (stage === 'couldNotUnderstand' || stage === 'clarifying') {
      triggerThinkingToProposed();
    }
  };

  const handleSelectSuggestion = (text: string) => {
    setInputMessage(text);
    if (text.includes('Dadi')) {
      setStage('clarifying');
    } else {
      triggerThinkingToProposed();
    }
  };

  const handleConfirm = () => {
    onConfirmAdded(eventTitle);
    onClose();
  };

  const handleCancel = () => {
    onClose();
    if (stage === 'proposed') {
      onCancelProposal?.();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleCancel}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={
              stage === 'editing'
                ? () => setStage('proposed')
                : handleCancel
            }
            activeOpacity={0.7}
            style={styles.circleBtn}
            accessibilityRole="button"
            accessibilityLabel="Back or Close"
          >
            <Feather
              name={stage === 'editing' ? 'chevron-left' : 'x'}
              size={20}
              color={Colors.white}
            />
          </TouchableOpacity>

          <View style={styles.headerTitleRow}>
            {stage !== 'editing' && <Text style={styles.headerSparkle}>✦ </Text>}
            <Text style={styles.headerTitle}>
              {stage === 'editing' ? 'Edit before adding' : 'Ask HosynQ'}
            </Text>
          </View>

          <View style={styles.circleBtnPlaceholder} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* =========================================================================
                STAGE 1: INITIAL (ADD-19)
            ========================================================================= */}
            {stage === 'initial' && (
              <View style={styles.initialContainer}>
                {/* Center Star Badge */}
                <View style={styles.centerIconRing}>
                  <Text style={styles.centerSparkle}>✦</Text>
                </View>

                <Text style={styles.initialTitle}>What should I add?</Text>
                <Text style={styles.initialSubtitle}>
                  Type or say it the way you’d tell family. I’ll turn it into
                  tasks, events and reminders for you to check.
                </Text>

                <Text style={styles.trySectionHeading}>TRY ONE OF THESE</Text>

                <TouchableOpacity
                  onPress={() =>
                    handleSelectSuggestion(
                      'Remind Dadi about her BP tablets at 9 PM every day'
                    )
                  }
                  activeOpacity={0.7}
                  style={styles.suggestionCard}
                  accessibilityRole="button"
                  accessibilityLabel="Remind Dadi suggestion"
                >
                  <Text style={styles.suggestionText}>
                    Remind Dadi about her BP tablets at 9 PM every day
                  </Text>
                  <Feather name="chevron-right" size={18} color={Colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    handleSelectSuggestion(
                      'Grocery list for Saturday: milk, atta, dal, onions'
                    )
                  }
                  activeOpacity={0.7}
                  style={styles.suggestionCard}
                  accessibilityRole="button"
                  accessibilityLabel="Grocery list suggestion"
                >
                  <Text style={styles.suggestionText}>
                    Grocery list for Saturday: milk, atta, dal, onions
                  </Text>
                  <Feather name="chevron-right" size={18} color={Colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    handleSelectSuggestion(
                      'Rohan picks up Anaya from badminton at 7:30 tonight'
                    )
                  }
                  activeOpacity={0.7}
                  style={styles.suggestionCard}
                  accessibilityRole="button"
                  accessibilityLabel="Rohan pickup suggestion"
                >
                  <Text style={styles.suggestionText}>
                    Rohan picks up Anaya from badminton at 7:30 tonight
                  </Text>
                  <Feather name="chevron-right" size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            )}

            {/* =========================================================================
                STAGE 2: THINKING (ADD-20)
            ========================================================================= */}
            {stage === 'thinking' && (
              <View style={styles.chatFlow}>
                {/* User bubble */}
                <View style={styles.userBubble}>
                  <Text style={styles.userBubbleText}>
                    Add Aarav’s PTM Friday 3 PM and remind both of us Thursday
                  </Text>
                </View>

                {/* Assistant Thinking Indicator */}
                <View style={styles.botRow}>
                  <View style={styles.botIconBox}>
                    <Text style={styles.botSparkle}>✦</Text>
                  </View>
                  <View style={styles.thinkingBubble}>
                    <View style={styles.dotsRow}>
                      <View style={styles.orangeDot} />
                      <View style={[styles.orangeDot, styles.dotSpacing]} />
                      <View style={[styles.orangeDotMuted, styles.dotSpacing]} />
                    </View>
                    <Text style={styles.thinkingText}>
                      Working out the dates and people...
                    </Text>
                  </View>
                </View>

                {/* Skeleton Card */}
                <View style={styles.skeletonCard}>
                  <View style={styles.skeletonLine40} />
                  <View style={styles.skeletonLine80} />
                  <View style={styles.skeletonLine60} />
                  <View style={styles.skeletonLine50} />
                </View>
              </View>
            )}

            {/* =========================================================================
                STAGE 3: CLARIFYING (ADD-21)
            ========================================================================= */}
            {stage === 'clarifying' && (
              <View style={styles.chatFlow}>
                {/* User bubble */}
                <View style={styles.userBubble}>
                  <Text style={styles.userBubbleText}>
                    Add Aarav’s PTM Friday and remind us
                  </Text>
                </View>

                {/* Assistant prompt */}
                <View style={styles.botRow}>
                  <View style={styles.botIconBox}>
                    <Text style={styles.botSparkle}>✦</Text>
                  </View>
                  <View style={styles.botBubble}>
                    <Text style={styles.botText}>
                      Happy to. Two quick questions so I get it right:
                    </Text>
                  </View>
                </View>

                <View style={styles.clarifySection}>
                  <Text style={styles.clarifyHeading}>Which Friday?</Text>
                  <View style={styles.clarifyChipsRow}>
                    {['This Friday, 6 Nov', 'Next Friday, 13 Nov'].map(
                      (item) => (
                        <TouchableOpacity
                          key={item}
                          onPress={() => setSelectedFriday(item)}
                          activeOpacity={0.7}
                          style={[
                            styles.chip,
                            selectedFriday === item
                              ? styles.chipSelected
                              : styles.chipUnselected,
                          ]}
                          accessibilityRole="button"
                          accessibilityLabel={item}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              selectedFriday === item
                                ? styles.chipTextSelected
                                : styles.chipTextUnselected,
                            ]}
                          >
                            {item}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>

                  <Text style={[styles.clarifyHeading, styles.mt16]}>
                    What time is the meeting?
                  </Text>
                  <View style={styles.clarifyChipsRow}>
                    {['10:00 AM', '3:00 PM', 'Other time'].map((item) => (
                      <TouchableOpacity
                        key={item}
                        onPress={() => {
                          setSelectedTime(item);
                          setStage('thinking');
                          timerRef.current = setTimeout(() => {
                            setStage('proposed');
                          }, 700);
                        }}
                        activeOpacity={0.7}
                        style={[
                          styles.chip,
                          selectedTime === item
                            ? styles.chipSelected
                            : styles.chipUnselected,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={item}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            selectedTime === item
                              ? styles.chipTextSelected
                              : styles.chipTextUnselected,
                          ]}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* =========================================================================
                STAGE 4: PROPOSED ACTION CARD (ADD-22)
            ========================================================================= */}
            {stage === 'proposed' && (
              <View style={styles.chatFlow}>
                {/* User bubble */}
                <View style={styles.userBubble}>
                  <Text style={styles.userBubbleText}>
                    Add Aarav’s PTM Friday 3 PM and remind both of us Thursday
                  </Text>
                </View>

                {/* Assistant bubble */}
                <View style={styles.botRow}>
                  <View style={styles.botIconBox}>
                    <Text style={styles.botSparkle}>✦</Text>
                  </View>
                  <View style={styles.botBubble}>
                    <Text style={styles.botText}>
                      Here’s what I’ll add. Check it, then confirm.
                    </Text>
                  </View>
                </View>

                {/* Proposed Action Card with Orange Outline */}
                <View style={styles.proposalCard}>
                  {/* Event item */}
                  <View style={styles.proposalSection}>
                    <View style={styles.proposalSectionHeader}>
                      <Feather name="calendar" size={14} color={Colors.accentBlue} />
                      <Text style={styles.proposalEventTag}>CREATE EVENT</Text>
                    </View>
                    <Text style={styles.proposalItemTitle}>{eventTitle}</Text>
                    <View style={styles.proposalRow}>
                      <Feather name="clock" size={14} color={Colors.textSubtle} />
                      <Text style={styles.proposalRowText}>
                        Fri, 6 Nov · {selectedTime}
                      </Text>
                    </View>
                    <View style={styles.proposalRow}>
                      <Feather name="tag" size={14} color={Colors.textSubtle} />
                      <Text style={styles.proposalRowText}>{eventCategory}</Text>
                    </View>
                  </View>

                  <View style={styles.proposalDivider} />

                  {/* Reminder item */}
                  <View style={styles.proposalSection}>
                    <View style={styles.proposalSectionHeader}>
                      <Feather name="bell" size={14} color={Colors.accentPurple} />
                      <Text style={styles.proposalReminderTag}>REMINDER</Text>
                    </View>
                    <Text style={styles.proposalItemTitle}>
                      Aarav’s PTM tomorrow
                    </Text>
                    <View style={styles.proposalRow}>
                      <Feather name="clock" size={14} color={Colors.textSubtle} />
                      <Text style={styles.proposalRowText}>
                        Thu, 5 Nov · 7:00 PM
                      </Text>
                    </View>
                    <View style={styles.proposalRow}>
                      <Feather name="users" size={14} color={Colors.textSubtle} />
                      <Text style={styles.proposalRowText}>Priya and Rohan</Text>
                    </View>
                  </View>

                  {/* Action Buttons: Confirm, Edit, Cancel */}
                  <View style={styles.proposalActionsRow}>
                    <TouchableOpacity
                      onPress={handleConfirm}
                      activeOpacity={0.8}
                      style={styles.confirmBtn}
                      accessibilityRole="button"
                      accessibilityLabel="Confirm"
                    >
                      <Text style={styles.confirmBtnText}>Confirm</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setStage('editing')}
                      activeOpacity={0.7}
                      style={styles.editBtn}
                      accessibilityRole="button"
                      accessibilityLabel="Edit"
                    >
                      <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleCancel}
                      activeOpacity={0.7}
                      style={styles.cancelTextBtn}
                      accessibilityRole="button"
                      accessibilityLabel="Cancel proposal"
                    >
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* =========================================================================
                STAGE 5: COULDN'T UNDERSTAND (ADD-24)
            ========================================================================= */}
            {stage === 'couldNotUnderstand' && (
              <View style={styles.chatFlow}>
                {/* User bubble */}
                <View style={styles.userBubble}>
                  <Text style={styles.userBubbleText}>
                    sort the thing for dadi next week
                  </Text>
                </View>

                {/* Assistant bubble */}
                <View style={styles.botRow}>
                  <View style={styles.botIconBox}>
                    <Text style={styles.botSparkle}>✦</Text>
                  </View>
                  <View style={styles.botBubble}>
                    <Text style={styles.botText}>
                      Sorry, I’m not sure what to add. What needs doing, and
                      when? For example: “Book Dadi’s eye check-up next Tuesday.”
                    </Text>
                  </View>
                </View>

                {/* Choice buttons */}
                <View style={styles.choiceChipsCol}>
                  <TouchableOpacity
                    onPress={() => {
                      onClose();
                      onMakeTask?.();
                    }}
                    activeOpacity={0.7}
                    style={styles.choiceChip}
                    accessibilityRole="button"
                    accessibilityLabel="Make a task instead"
                  >
                    <Text style={styles.choiceChipText}>Make a task instead</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      onClose();
                      onMakeEvent?.();
                    }}
                    activeOpacity={0.7}
                    style={styles.choiceChip}
                    accessibilityRole="button"
                    accessibilityLabel="Make an event instead"
                  >
                    <Text style={styles.choiceChipText}>Make an event instead</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* =========================================================================
                STAGE 6: EDIT BEFORE ADDING (ADD-23)
            ========================================================================= */}
            {stage === 'editing' && (
              <View style={styles.editingFlow}>
                {/* Event Section Tag */}
                <View style={styles.editSectionKickerRow}>
                  <Feather name="calendar" size={14} color={Colors.accentBlue} />
                  <Text style={styles.editSectionKickerEvent}>EVENT</Text>
                </View>

                {/* Event Edit Card */}
                <View style={styles.editCardGroup}>
                  <View style={styles.editRow}>
                    <View style={styles.editCheckSquare}>
                      <Feather name="check" size={14} color={Colors.cardInsetDark} />
                    </View>
                    <Text style={styles.editFieldLabelOrange}>Title</Text>
                    <TextInput
                      value={eventTitle}
                      onChangeText={setEventTitle}
                      style={styles.editFieldInput}
                    />
                    <View style={styles.orangeCursor} />
                    <Feather name="chevron-right" size={16} color={Colors.textMutedAlt} />
                  </View>

                  <View style={styles.editRowDivider} />

                  <View style={styles.editRow}>
                    <Feather name="clock" size={16} color={Colors.textSubtle} style={styles.editIconLeft} />
                    <Text style={styles.editFieldLabel}>When</Text>
                    <Text style={styles.editFieldVal}>{eventWhen}</Text>
                    <Feather name="chevron-right" size={16} color={Colors.textMutedAlt} />
                  </View>

                  <View style={styles.editRowDivider} />

                  <View style={styles.editRow}>
                    <Feather name="map-pin" size={16} color={Colors.textSubtle} style={styles.editIconLeft} />
                    <Text style={styles.editFieldLabel}>Where</Text>
                    <TextInput
                      value={eventWhere}
                      onChangeText={setEventWhere}
                      style={styles.editFieldInput}
                    />
                    <Feather name="chevron-right" size={16} color={Colors.textMutedAlt} />
                  </View>

                  <View style={styles.editRowDivider} />

                  <View style={styles.editRow}>
                    <Feather name="tag" size={16} color={Colors.textSubtle} style={styles.editIconLeft} />
                    <Text style={styles.editFieldLabel}>Category</Text>
                    <Text style={styles.editFieldVal}>{eventCategory}</Text>
                    <Feather name="chevron-right" size={16} color={Colors.textMutedAlt} />
                  </View>

                  <View style={styles.editRowDivider} />

                  <View style={styles.editRow}>
                    <Feather name="users" size={16} color={Colors.textSubtle} style={styles.editIconLeft} />
                    <Text style={styles.editFieldLabel}>Invite</Text>
                    <View style={styles.avatarClusterRow}>
                      <View style={styles.avatarSmallPriya}>
                        <Text style={styles.avatarSmallTextPriya}>P</Text>
                      </View>
                      <View style={styles.avatarSmallRohan}>
                        <Text style={styles.avatarSmallTextRohan}>R</Text>
                      </View>
                      <Text style={styles.inviteNamesText}>Priya, Rohan</Text>
                    </View>
                    <Feather name="chevron-right" size={16} color={Colors.textMutedAlt} />
                  </View>
                </View>

                {/* Reminder Section Tag */}
                <View style={[styles.editSectionKickerRow, styles.mt20]}>
                  <Feather name="bell" size={14} color={Colors.accentPurple} />
                  <Text style={styles.editSectionKickerReminder}>REMINDER</Text>
                </View>

                {/* Reminder Edit Card */}
                <View style={styles.editCardGroup}>
                  <View style={styles.editRow}>
                    <Feather name="clock" size={16} color={Colors.textSubtle} style={styles.editIconLeft} />
                    <Text style={styles.editFieldLabel}>When</Text>
                    <Text style={styles.editFieldVal}>Thu, 5 Nov · 7:00 PM</Text>
                    <Feather name="chevron-right" size={16} color={Colors.textMutedAlt} />
                  </View>

                  <View style={styles.editRowDivider} />

                  <View style={styles.editRow}>
                    <Feather name="users" size={16} color={Colors.textSubtle} style={styles.editIconLeft} />
                    <Text style={styles.editFieldLabel}>Remind</Text>
                    <View style={styles.avatarClusterRow}>
                      <View style={styles.avatarSmallPriya}>
                        <Text style={styles.avatarSmallTextPriya}>P</Text>
                      </View>
                      <View style={styles.avatarSmallRohan}>
                        <Text style={styles.avatarSmallTextRohan}>R</Text>
                      </View>
                      <Text style={styles.inviteNamesText}>Priya, Rohan</Text>
                    </View>
                    <Feather name="chevron-right" size={16} color={Colors.textMutedAlt} />
                  </View>
                </View>

                {/* Confirm and Add Button */}
                <TouchableOpacity
                  onPress={handleConfirm}
                  activeOpacity={0.8}
                  style={styles.confirmAndAddBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Confirm and add"
                >
                  <Text style={styles.confirmAndAddBtnText}>Confirm and add</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* Bottom Chat / Input Bar (Shown in initial, thinking, clarifying, proposed, and couldNotUnderstand) */}
          {stage !== 'editing' && (
            <View
              style={[
                styles.bottomInputBar,
                { paddingBottom: Math.max(insets.bottom + 4, 12) },
              ]}
            >
              <View
                style={[
                  styles.inputOuter,
                  stage === 'initial' && styles.inputOuterActive,
                ]}
              >
                <TextInput
                  value={inputMessage}
                  onChangeText={setInputMessage}
                  placeholder={
                    stage === 'clarifying'
                      ? 'Or type your answer'
                      : 'Write a message'
                  }
                  placeholderTextColor={Colors.textMutedSoft}
                  style={styles.chatTextInput}
                />
                {stage === 'initial' && <View style={styles.orangeCursorInline} />}
              </View>

              <TouchableOpacity
                onPress={handleSend}
                activeOpacity={0.8}
                style={styles.sendBtn}
                accessibilityRole="button"
                accessibilityLabel="Send"
              >
                <Feather
                  name={
                    stage === 'initial' || stage === 'couldNotUnderstand'
                      ? 'send'
                      : 'mic'
                  }
                  size={18}
                  color={Colors.white}
                />
              </TouchableOpacity>
            </View>
          )}

          {stage !== 'editing' && (
            <Text style={styles.footerDisclaimer}>
              HosynQ suggests. Nothing is added until you confirm.
            </Text>
          )}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceSubtle,
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBtnPlaceholder: {
    width: 36,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSparkle: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  initialContainer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  centerIconRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.surfaceDeep,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  centerSparkle: {
    color: Colors.primary,
    fontSize: 28,
  },
  initialTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 10,
    textAlign: 'center',
  },
  initialSubtitle: {
    fontSize: 14,
    color: Colors.textSubtle,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
    marginBottom: 28,
  },
  trySectionHeading: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  suggestionCard: {
    width: '100%',
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.borderBold,
    marginBottom: 12,
  },
  suggestionText: {
    fontSize: 14,
    color: Colors.textNearWhiteSoft,
    lineHeight: 20,
    flex: 1,
    paddingRight: 10,
  },
  chatFlow: {
    paddingTop: 8,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primaryDark,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxWidth: '85%',
    marginBottom: 16,
  },
  userBubbleText: {
    fontSize: 15,
    color: Colors.cardInsetDark,
    fontWeight: '600',
    lineHeight: 20,
  },
  botRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  botIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(240, 145, 58, 0.12)',
  },
  botSparkle: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  botBubble: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: Colors.borderBold,
  },
  botText: {
    fontSize: 14,
    color: Colors.textNearWhiteAlt,
    lineHeight: 20,
  },
  thinkingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: Colors.borderBold,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  orangeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  orangeDotMuted: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(240, 145, 58, 0.4)',
  },
  dotSpacing: {
    marginLeft: 4,
  },
  thinkingText: {
    fontSize: 13,
    color: Colors.textLightMuted,
    fontWeight: '500',
  },
  skeletonCard: {
    marginLeft: 40,
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    padding: 18,
    marginTop: 6,
  },
  skeletonLine40: {
    width: '40%',
    height: 12,
    backgroundColor: Colors.surfaceNavy,
    borderRadius: 3,
    marginBottom: 10,
  },
  skeletonLine80: {
    width: '80%',
    height: 12,
    backgroundColor: Colors.surfaceNavy,
    borderRadius: 3,
    marginBottom: 10,
  },
  skeletonLine60: {
    width: '60%',
    height: 12,
    backgroundColor: Colors.surfaceNavy,
    borderRadius: 3,
    marginBottom: 10,
  },
  skeletonLine50: {
    width: '50%',
    height: 12,
    backgroundColor: Colors.surfaceNavy,
    borderRadius: 3,
  },
  clarifySection: {
    marginLeft: 40,
    marginTop: 6,
  },
  clarifyHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 8,
  },
  clarifyChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipUnselected: {
    backgroundColor: Colors.cardBackground,
    borderColor: Colors.borderBold,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: Colors.cardInsetDark,
    fontWeight: '700',
  },
  chipTextUnselected: {
    color: Colors.textSubtle,
  },
  proposalCard: {
    marginLeft: 40,
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    padding: 16,
    marginTop: 8,
  },
  proposalSection: {
    paddingVertical: 4,
  },
  proposalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  proposalEventTag: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentBlue,
    letterSpacing: 0.8,
  },
  proposalReminderTag: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentPurple,
    letterSpacing: 0.8,
  },
  proposalItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 6,
  },
  proposalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  proposalRowText: {
    fontSize: 13,
    color: Colors.textSubtle,
  },
  proposalDivider: {
    height: 1,
    backgroundColor: Colors.borderBold,
    marginVertical: 12,
  },
  proposalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 10,
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 22,
    height: 44,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  editBtn: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 22,
    height: 44,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderBold,
  },
  editBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  cancelTextBtn: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginLeft: 'auto',
  },
  cancelText: {
    color: Colors.textSubtle,
    fontSize: 14,
    fontWeight: '600',
  },
  choiceChipsCol: {
    marginLeft: 40,
    gap: 10,
    marginTop: 8,
  },
  choiceChip: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.borderBold,
  },
  choiceChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textNearWhiteAlt,
  },
  editingFlow: {
    paddingTop: 8,
  },
  editSectionKickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  editSectionKickerEvent: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentBlue,
    letterSpacing: 0.8,
  },
  editSectionKickerReminder: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentPurple,
    letterSpacing: 0.8,
  },
  editCardGroup: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    overflow: 'hidden',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  editCheckSquare: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  editIconLeft: {
    marginRight: 10,
  },
  editFieldLabel: {
    width: 70,
    fontSize: 14,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  editFieldLabelOrange: {
    width: 50,
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  editFieldInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.white,
    fontWeight: '600',
    paddingVertical: 0,
  },
  orangeCursor: {
    width: 2,
    height: 18,
    backgroundColor: Colors.primary,
    marginRight: 8,
  },
  orangeCursorInline: {
    width: 2,
    height: 18,
    backgroundColor: Colors.primary,
    marginLeft: 2,
  },
  editFieldVal: {
    flex: 1,
    fontSize: 14,
    color: Colors.white,
    fontWeight: '500',
  },
  avatarClusterRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarSmallPriya: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.avatarBrown,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmallTextPriya: {
    fontSize: 10,
    color: Colors.amberLight,
    fontWeight: '700',
  },
  avatarSmallRohan: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.surfaceElevated3,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -4,
  },
  avatarSmallTextRohan: {
    fontSize: 10,
    color: Colors.accentBlueLight,
    fontWeight: '700',
  },
  inviteNamesText: {
    fontSize: 13,
    color: Colors.white,
    marginLeft: 8,
  },
  editRowDivider: {
    height: 1,
    backgroundColor: Colors.surfaceElevated3,
    marginLeft: 16,
  },
  confirmAndAddBtn: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  confirmAndAddBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  bottomInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 10,
  },
  inputOuter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.borderBold,
    paddingHorizontal: 16,
    height: 48,
  },
  inputOuterActive: {
    borderColor: Colors.primary,
  },
  chatTextInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.white,
    paddingVertical: 0,
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerDisclaimer: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textTertiary,
    paddingBottom: 6,
    paddingTop: 4,
  },
  mt16: {
    marginTop: 16,
  },
  mt20: {
    marginTop: 20,
  },
});
