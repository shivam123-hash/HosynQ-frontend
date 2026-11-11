import React, { useState, useEffect } from 'react';
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

export interface AskHosynQModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmAdded: (title: string) => void;
}

type ScreenStage = 'initial' | 'clarifying' | 'proposed' | 'editing';

export const AskHosynQModal: React.FC<AskHosynQModalProps> = ({
  visible,
  onClose,
  onConfirmAdded,
}) => {
  const insets = useSafeAreaInsets();
  const [stage, setStage] = useState<ScreenStage>('initial');
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

  useEffect(() => {
    if (!visible) {
      setStage('initial');
    }
  }, [visible]);

  const handleSend = () => {
    if (stage === 'initial') {
      setStage('proposed');
    }
  };

  const handleSelectSuggestion = (text: string) => {
    setInputMessage(text);
    if (text.includes('Dadi')) {
      setStage('clarifying');
    } else {
      setStage('proposed');
    }
  };

  const handleConfirm = () => {
    onConfirmAdded(eventTitle);
    onClose();
  };

  const handleCancel = () => {
    onClose();
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
              color="#FFFFFF"
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
            {/* STAGE 1: INITIAL */}
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
                >
                  <Text style={styles.suggestionText}>
                    Remind Dadi about her BP tablets at 9 PM every day
                  </Text>
                  <Feather name="chevron-right" size={18} color="#F0913A" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    handleSelectSuggestion(
                      'Grocery list for Saturday: milk, atta, dal, onions'
                    )
                  }
                  activeOpacity={0.7}
                  style={styles.suggestionCard}
                >
                  <Text style={styles.suggestionText}>
                    Grocery list for Saturday: milk, atta, dal, onions
                  </Text>
                  <Feather name="chevron-right" size={18} color="#F0913A" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    handleSelectSuggestion(
                      'Rohan picks up Anaya from badminton at 7:30 tonight'
                    )
                  }
                  activeOpacity={0.7}
                  style={styles.suggestionCard}
                >
                  <Text style={styles.suggestionText}>
                    Rohan picks up Anaya from badminton at 7:30 tonight
                  </Text>
                  <Feather name="chevron-right" size={18} color="#F0913A" />
                </TouchableOpacity>
              </View>
            )}

            {/* STAGE 2: CLARIFYING */}
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
                  <View style={styles.botIconCircle}>
                    <Text style={styles.botSparkle}>✦</Text>
                  </View>
                  <View style={styles.botBubble}>
                    <Text style={styles.botText}>
                      Happy to. Two quick questions so I get it right:
                    </Text>
                  </View>
                </View>

                <View style={styles.clarifyCard}>
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
                          setStage('proposed');
                        }}
                        activeOpacity={0.7}
                        style={[
                          styles.chip,
                          selectedTime === item
                            ? styles.chipSelected
                            : styles.chipUnselected,
                        ]}
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

            {/* STAGE 3: PROPOSED */}
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
                  <View style={styles.botIconCircle}>
                    <Text style={styles.botSparkle}>✦</Text>
                  </View>
                  <View style={styles.botBubble}>
                    <Text style={styles.botText}>
                      Here’s what I’ll add. Check it, then confirm.
                    </Text>
                  </View>
                </View>

                {/* Proposed Action Card */}
                <View style={styles.proposalCard}>
                  {/* Event item */}
                  <View style={styles.proposalSection}>
                    <View style={styles.proposalSectionHeader}>
                      <Feather name="calendar" size={14} color="#3A8EF0" />
                      <Text style={styles.proposalEventTag}>CREATE EVENT</Text>
                    </View>
                    <Text style={styles.proposalItemTitle}>{eventTitle}</Text>
                    <View style={styles.proposalRow}>
                      <Feather name="clock" size={14} color="#8E9BAE" />
                      <Text style={styles.proposalRowText}>
                        Fri, 6 Nov · {selectedTime}
                      </Text>
                    </View>
                    <View style={styles.proposalRow}>
                      <Feather name="tag" size={14} color="#8E9BAE" />
                      <Text style={styles.proposalRowText}>{eventCategory}</Text>
                    </View>
                  </View>

                  <View style={styles.proposalDivider} />

                  {/* Reminder item */}
                  <View style={styles.proposalSection}>
                    <View style={styles.proposalSectionHeader}>
                      <Feather name="bell" size={14} color="#9D65E5" />
                      <Text style={styles.proposalReminderTag}>REMINDER</Text>
                    </View>
                    <Text style={styles.proposalItemTitle}>
                      Aarav’s PTM tomorrow
                    </Text>
                    <View style={styles.proposalRow}>
                      <Feather name="clock" size={14} color="#8E9BAE" />
                      <Text style={styles.proposalRowText}>
                        Thu, 5 Nov · 7:00 PM
                      </Text>
                    </View>
                    <View style={styles.proposalRow}>
                      <Feather name="users" size={14} color="#8E9BAE" />
                      <Text style={styles.proposalRowText}>Priya and Rohan</Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.proposalActionsRow}>
                    <TouchableOpacity
                      onPress={handleConfirm}
                      activeOpacity={0.8}
                      style={styles.confirmBtn}
                    >
                      <Text style={styles.confirmBtnText}>Confirm</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setStage('editing')}
                      activeOpacity={0.7}
                      style={styles.editBtn}
                    >
                      <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleCancel}
                      activeOpacity={0.7}
                      style={styles.cancelTextBtn}
                    >
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* STAGE 4: EDITING */}
            {stage === 'editing' && (
              <View style={styles.editingFlow}>
                {/* Event Edit Card */}
                <View style={styles.editCardGroup}>
                  <View style={styles.editCardHeader}>
                    <Feather name="calendar" size={14} color="#3A8EF0" />
                    <Text style={styles.proposalEventTag}>EVENT</Text>
                  </View>

                  <View style={styles.editRow}>
                    <Text style={styles.editFieldLabel}>Title</Text>
                    <TextInput
                      value={eventTitle}
                      onChangeText={setEventTitle}
                      style={styles.editFieldInput}
                    />
                    <Feather name="chevron-right" size={16} color="#5C6E82" />
                  </View>

                  <View style={styles.editRowDivider} />

                  <View style={styles.editRow}>
                    <Text style={styles.editFieldLabel}>When</Text>
                    <Text style={styles.editFieldVal}>{eventWhen}</Text>
                    <Feather name="chevron-right" size={16} color="#5C6E82" />
                  </View>

                  <View style={styles.editRowDivider} />

                  <View style={styles.editRow}>
                    <Text style={styles.editFieldLabel}>Where</Text>
                    <TextInput
                      value={eventWhere}
                      onChangeText={setEventWhere}
                      style={styles.editFieldInput}
                    />
                    <Feather name="chevron-right" size={16} color="#5C6E82" />
                  </View>

                  <View style={styles.editRowDivider} />

                  <View style={styles.editRow}>
                    <Text style={styles.editFieldLabel}>Category</Text>
                    <Text style={styles.editFieldVal}>{eventCategory}</Text>
                    <Feather name="chevron-right" size={16} color="#5C6E82" />
                  </View>
                </View>

                {/* Reminder Edit Card */}
                <View style={[styles.editCardGroup, styles.mt16]}>
                  <View style={styles.editCardHeader}>
                    <Feather name="bell" size={14} color="#9D65E5" />
                    <Text style={styles.proposalReminderTag}>REMINDER</Text>
                  </View>

                  <View style={styles.editRow}>
                    <Text style={styles.editFieldLabel}>When</Text>
                    <Text style={styles.editFieldVal}>Thu, 5 Nov · 7:00 PM</Text>
                    <Feather name="chevron-right" size={16} color="#5C6E82" />
                  </View>

                  <View style={styles.editRowDivider} />

                  <View style={styles.editRow}>
                    <Text style={styles.editFieldLabel}>Remind</Text>
                    <Text style={styles.editFieldVal}>Priya, Rohan</Text>
                    <Feather name="chevron-right" size={16} color="#5C6E82" />
                  </View>
                </View>

                {/* Confirm and Add Button */}
                <TouchableOpacity
                  onPress={handleConfirm}
                  activeOpacity={0.8}
                  style={[styles.confirmBtn, styles.confirmBtnFull]}
                >
                  <Text style={styles.confirmBtnText}>Confirm and add</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* Bottom Chat / Input Bar (Shown in initial, clarifying, and proposed stages) */}
          {stage !== 'editing' && (
            <View
              style={[
                styles.bottomInputBar,
                { paddingBottom: Math.max(insets.bottom, 12) },
              ]}
            >
              <View style={styles.inputOuter}>
                <TextInput
                  value={inputMessage}
                  onChangeText={setInputMessage}
                  placeholder={
                    stage === 'initial'
                      ? 'Ask HosynQ to add something'
                      : 'Write a message'
                  }
                  placeholderTextColor="#6D8096"
                  style={styles.chatTextInput}
                />
              </View>
              <TouchableOpacity
                onPress={handleSend}
                activeOpacity={0.8}
                style={styles.sendBtn}
              >
                <Feather
                  name={stage === 'initial' ? 'send' : 'mic'}
                  size={18}
                  color="#FFFFFF"
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
    backgroundColor: '#0B1A2F',
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
    borderBottomColor: '#162434',
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#162536',
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
    color: '#F0913A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
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
    backgroundColor: '#112030',
    borderWidth: 1.5,
    borderColor: '#F0913A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  centerSparkle: {
    color: '#F0913A',
    fontSize: 28,
  },
  initialTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  initialSubtitle: {
    fontSize: 14,
    color: '#8E9BAE',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
    marginBottom: 28,
  },
  trySectionHeading: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: '700',
    color: '#7D8B9B',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  suggestionCard: {
    width: '100%',
    backgroundColor: '#112030',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#192C3E',
    marginBottom: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    paddingRight: 10,
    lineHeight: 20,
  },
  chatFlow: {
    paddingTop: 8,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#F0913A',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxWidth: '85%',
    marginBottom: 16,
  },
  userBubbleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0A131F',
    lineHeight: 20,
  },
  botRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  botIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#112030',
    borderWidth: 1,
    borderColor: '#F0913A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  botSparkle: {
    color: '#F0913A',
    fontSize: 14,
  },
  botBubble: {
    flex: 1,
    backgroundColor: '#112030',
    borderRadius: 16,
    borderTopLeftRadius: 4,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1C2E42',
  },
  botText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  clarifyCard: {
    backgroundColor: '#112030',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1C2E42',
  },
  clarifyHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  clarifyChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: '#F0913A',
    borderColor: '#F0913A',
  },
  chipUnselected: {
    backgroundColor: '#132436',
    borderColor: '#20344A',
  },
  chipText: {
    fontSize: 13,
  },
  chipTextSelected: {
    color: '#0A131F',
    fontWeight: '700',
  },
  chipTextUnselected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  proposalCard: {
    backgroundColor: '#112030',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F0913A',
    padding: 16,
    marginTop: 6,
  },
  proposalSection: {
    paddingVertical: 4,
  },
  proposalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  proposalEventTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3A8EF0',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  proposalReminderTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9D65E5',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  proposalItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  proposalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  proposalRowText: {
    fontSize: 13,
    color: '#8E9BAE',
    marginLeft: 8,
  },
  proposalDivider: {
    height: 1,
    backgroundColor: '#1B2C3E',
    marginVertical: 12,
  },
  proposalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  confirmBtn: {
    backgroundColor: '#F0913A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnFull: {
    marginTop: 24,
    width: '100%',
  },
  mt16: {
    marginTop: 16,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editBtn: {
    borderWidth: 1,
    borderColor: '#2A3D54',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelTextBtn: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  cancelText: {
    fontSize: 14,
    color: '#7D8B9B',
    fontWeight: '500',
  },
  editingFlow: {
    paddingTop: 8,
  },
  editCardGroup: {
    backgroundColor: '#112030',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1C2E42',
  },
  editCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  editFieldLabel: {
    fontSize: 13,
    color: '#8E9BAE',
    width: 70,
  },
  editFieldInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    padding: 0,
  },
  editFieldVal: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editRowDivider: {
    height: 1,
    backgroundColor: '#18293B',
  },
  bottomInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: '#0B1A2F',
    gap: 10,
  },
  inputOuter: {
    flex: 1,
    backgroundColor: '#101F2F',
    borderWidth: 1.5,
    borderColor: '#F0913A',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 46,
    justifyContent: 'center',
  },
  chatTextInput: {
    fontSize: 14,
    color: '#FFFFFF',
    padding: 0,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0913A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerDisclaimer: {
    fontSize: 11,
    color: '#65778C',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
});
