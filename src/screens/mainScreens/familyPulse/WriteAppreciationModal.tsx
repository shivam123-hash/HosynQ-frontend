import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { useAppDispatch, useAppSelector } from '../../../redux';
import { createAppreciationThunk } from '../../../redux/features/pulse/pulseSlice';
import { isUUID } from '../../../redux/features/lists/listsSlice';
import Colors from '../../../units/Colors';
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

export interface WriteAppreciationModalProps {
  visible: boolean;
  asModal?: boolean;
  members?: FamilyMemberPulse[];
  familyName?: string;
  onClose: () => void;
  onPostAppreciation?: (appreciation: {
    receiverId?: string;
    receiverName: string;
    message: string;
    tag?: string;
  }) => void | Promise<void>;
}

const TAG_CHIPS = [
  'Thank you',
  'Proud of you',
  'High five',
  'Well done',
];

export const WriteAppreciationModal: React.FC<WriteAppreciationModalProps> = ({
  visible,
  asModal = true,
  members: membersProp,
  familyName: familyNameProp,
  onClose,
  onPostAppreciation,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const familyState = useAppSelector((state) => state.family);
  const pulseState = useAppSelector((state) => state.pulse);
  const isTestEnv = isJestTestEnv();

  const recipientMembers = useMemo(() => {
    const source =
      membersProp && membersProp.length > 0
        ? membersProp
        : extractPulseMembersFromFamilyState(familyState);
    // Cannot thank yourself (#4 validation rule)
    return source.filter((m) => !m.isYou && m.id !== 'you');
  }, [membersProp, familyState]);

  const resolvedFamilyName =
    familyNameProp ||
    pulseState.home?.familyName ||
    familyState.basicFamilyData?.family?.name ||
    familyState.myFamilyData?.family?.name ||
    'your family';

  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('Thank you');
  const [isFocused, setIsFocused] = useState(false);
  const [dialog, setDialog] = useState<PulseDialogState>(INITIAL_PULSE_DIALOG_STATE);

  useEffect(() => {
    if (visible) {
      setMessage('');
      setSelectedTag('Thank you');
      if (recipientMembers.length > 0) {
        setSelectedMemberId((prev) =>
          recipientMembers.some((m) => m.id === prev) ? prev : recipientMembers[0].id
        );
      } else {
        setSelectedMemberId('');
      }
    }
  }, [visible, recipientMembers]);

  const selectedMember =
    recipientMembers.find((m) => m.id === selectedMemberId) || recipientMembers[0];

  const handlePost = async () => {
    const trimmed = message.trim();
    if (!selectedMember) {
      setDialog({
        visible: true,
        type: 'warning',
        title: 'Add a family member first',
        description: 'Invite a family member to thank them in Family Pulse.',
        primaryButtonText: 'OK',
        secondaryButtonText: '',
      });
      return;
    }
    if (!trimmed) {
      setDialog({
        visible: true,
        type: 'warning',
        title: 'Message required',
        description: 'Write a short appreciation note (up to 280 characters).',
        primaryButtonText: 'OK',
        secondaryButtonText: '',
      });
      return;
    }

    if (!isTestEnv && isUUID(selectedMember.id)) {
      try {
        await dispatch(
          createAppreciationThunk({
            toMemberId: selectedMember.id,
            message: trimmed.slice(0, 280),
            tag: selectedTag ? selectedTag.slice(0, 40) : undefined,
          })
        ).unwrap();
        onPostAppreciation?.({
          receiverId: selectedMember.id,
          receiverName: selectedMember.name,
          message: trimmed,
          tag: selectedTag,
        });
        onClose();
      } catch (err: any) {
        setDialog({
          visible: true,
          type: 'danger',
          iconName: 'alert-circle',
          title: 'Could not post appreciation',
          description: typeof err === 'string' ? err : 'Please try again.',
          primaryButtonText: 'OK',
          secondaryButtonText: '',
        });
      }
      return;
    }

    onPostAppreciation?.({
      receiverId: selectedMember.id,
      receiverName: selectedMember.name,
      message: trimmed,
      tag: selectedTag,
    });
    onClose();
  };

  return (
    <PulseModalContainer
      visible={visible}
      asModal={asModal}
      variant="sheet"
      transparent
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

              <Text style={styles.title}>Write an appreciation</Text>

              {/* Who are you thanking? */}
              <Text style={styles.sectionKicker}>WHO ARE YOU THANKING?</Text>
              {recipientMembers.length === 0 ? (
                <Text style={styles.noMembersText}>
                  No other family members available yet.
                </Text>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.membersRow}
                >
                  {recipientMembers.map((m) => {
                    const isSelected = selectedMember?.id === m.id;
                    return (
                      <TouchableOpacity
                        key={m.id}
                        onPress={() => setSelectedMemberId(m.id)}
                        activeOpacity={0.7}
                        style={styles.memberCol}
                        accessibilityRole="button"
                        accessibilityLabel={`Thank ${m.name}`}
                      >
                        <View
                          style={[
                            styles.avatarCircle,
                            { backgroundColor: m.bgColor },
                            isSelected && styles.avatarCircleSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.avatarText,
                              { color: m.textColor },
                            ]}
                          >
                            {m.initial}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.memberName,
                            isSelected && styles.memberNameSelected,
                          ]}
                        >
                          {m.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}

              {/* Text Input with Orange Border on Focus */}
              <View
                style={[
                  styles.inputContainer,
                  isFocused && styles.inputContainerFocused,
                ]}
              >
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Write your note of appreciation..."
                  placeholderTextColor={Colors.textPlaceholder}
                  style={styles.textInput}
                  multiline
                  maxLength={280}
                  selectionColor={Colors.primary}
                />
                <Text style={styles.charCount}>{`${message.length}/280`}</Text>
              </View>

              {/* Tag / Prompt Chips */}
              <View style={styles.chipsWrap}>
                {TAG_CHIPS.map((chip) => {
                  const isTagActive = selectedTag === chip;
                  return (
                    <TouchableOpacity
                      key={chip}
                      onPress={() => setSelectedTag(chip)}
                      activeOpacity={0.7}
                      style={[styles.chip, isTagActive && styles.chipActive]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isTagActive && styles.chipTextActive,
                        ]}
                      >
                        {chip}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Privacy Footer */}
              <View style={styles.privacyRow}>
                <Feather
                  name="users"
                  size={15}
                  color={Colors.textSubtle}
                  style={styles.privacyIcon}
                />
                <Text style={styles.privacyText}>
                  {`Everyone in ${resolvedFamilyName} can see this.`}
                </Text>
              </View>

              {/* Post Button */}
              <TouchableOpacity
                onPress={handlePost}
                disabled={pulseState.submittingAction}
                activeOpacity={0.8}
                style={styles.postBtn}
                accessibilityRole="button"
                accessibilityLabel="Post appreciation"
              >
                {pulseState.submittingAction ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.postBtnText}>Post appreciation</Text>
                )}
              </TouchableOpacity>

              <PulseDialog
                dialog={dialog}
                onClose={() => setDialog(INITIAL_PULSE_DIALOG_STATE)}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </PulseModalContainer>
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
    fontFamily: 'Roboto-Bold',
    letterSpacing: -0.3,
    color: Colors.white,
    marginBottom: 20,
  },
  sectionKicker: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  noMembersText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 18,
  },
  membersRow: {
    flexDirection: 'row',
    gap: 18,
    marginBottom: 22,
    paddingHorizontal: 4,
  },
  memberCol: {
    alignItems: 'center',
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: 'transparent',
  },
  avatarCircleSelected: {
    borderColor: Colors.primary,
  },
  avatarText: {
    fontSize: 17,
    fontFamily: 'Roboto-Bold',
  },
  memberName: {
    fontSize: 13.5,
    fontFamily: 'Roboto-Medium',
    color: Colors.textSecondary,
    marginTop: 8,
  },
  memberNameSelected: {
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
  },
  inputContainer: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: '#1E314B',
    borderRadius: 20,
    padding: 16,
    minHeight: 120,
    marginBottom: 18,
    justifyContent: 'space-between',
  },
  inputContainerFocused: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  textInput: {
    fontSize: 15,
    color: Colors.white,
    lineHeight: 22,
    padding: 0,
    textAlignVertical: 'top',
    minHeight: 74,
  },
  charCount: {
    alignSelf: 'flex-end',
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 22,
  },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: '#3A4556',
  },
  chipActive: {
    backgroundColor: 'rgba(240, 145, 58, 0.16)',
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: '#C5D2E0',
  },
  chipTextActive: {
    color: Colors.primary,
    fontFamily: 'Roboto-Bold',
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    paddingHorizontal: 2,
  },
  privacyIcon: {
    marginRight: 8,
  },
  privacyText: {
    fontSize: 13.5,
    color: Colors.textSecondary,
  },
  postBtn: {
    height: 54,
    backgroundColor: Colors.primary,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postBtnText: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
  },
});

export default WriteAppreciationModal;
