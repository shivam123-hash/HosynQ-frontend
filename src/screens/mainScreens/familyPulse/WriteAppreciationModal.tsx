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

export interface WriteAppreciationModalProps {
  visible: boolean;
  onClose: () => void;
  onPostAppreciation: (appreciation: {
    receiverName: string;
    message: string;
  }) => void;
}

const MEMBERS = [
  { id: '1', name: 'Rohan', initial: 'R', bgColor: Colors.avatarNavy, textColor: Colors.accentBlueSoft },
  { id: '2', name: 'Dadi', initial: 'D', bgColor: Colors.avatarGreen, textColor: Colors.accentGreenSoft },
  { id: '3', name: 'Anaya', initial: 'A', bgColor: Colors.avatarWine, textColor: Colors.accentPink },
  { id: '4', name: 'Aarav', initial: 'Aa', bgColor: Colors.avatarOlive, textColor: Colors.accentYellow },
];

const SUGGESTION_CHIPS = [
  'Thank you',
  'Proud of you',
  'You’re the best',
  'Well done',
];

export const WriteAppreciationModal: React.FC<WriteAppreciationModalProps> = ({
  visible,
  onClose,
  onPostAppreciation,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedMember, setSelectedMember] = useState('Rohan');
  const [message, setMessage] = useState(
    'Thank you for picking Aarav up from school every day this week.'
  );
  const [isFocused, setIsFocused] = useState(false);

  const handlePost = () => {
    onPostAppreciation({
      receiverName: selectedMember,
      message: message.trim(),
    });
    onClose();
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

              <Text style={styles.title}>Write an appreciation</Text>

              {/* Who are you thanking? */}
              <Text style={styles.sectionKicker}>WHO ARE YOU THANKING?</Text>
              <View style={styles.membersRow}>
                {MEMBERS.map((m) => {
                  const isSelected = selectedMember === m.name;
                  return (
                    <TouchableOpacity
                      key={m.id}
                      onPress={() => setSelectedMember(m.name)}
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
              </View>

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
                  selectionColor={Colors.primary}
                />
              </View>

              {/* Suggestion Chips */}
              <View style={styles.chipsWrap}>
                {SUGGESTION_CHIPS.map((chip) => (
                  <TouchableOpacity
                    key={chip}
                    onPress={() => setMessage(chip + ' ')}
                    activeOpacity={0.7}
                    style={styles.chip}
                  >
                    <Text style={styles.chipText}>{chip}</Text>
                  </TouchableOpacity>
                ))}
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
                  Everyone in The Sharma Family can see this.
                </Text>
              </View>

              {/* Post Button */}
              <TouchableOpacity
                onPress={handlePost}
                activeOpacity={0.8}
                style={styles.postBtn}
                accessibilityRole="button"
                accessibilityLabel="Post appreciation"
              >
                <Text style={styles.postBtnText}>Post appreciation</Text>
              </TouchableOpacity>
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
    marginBottom: 20,
  },
  sectionKicker: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  membersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    fontWeight: '700',
  },
  memberName: {
    fontSize: 13.5,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: 8,
  },
  memberNameSelected: {
    fontWeight: '700',
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
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#C5D2E0',
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
    fontWeight: '700',
    color: Colors.white,
  },
});

export default WriteAppreciationModal;

