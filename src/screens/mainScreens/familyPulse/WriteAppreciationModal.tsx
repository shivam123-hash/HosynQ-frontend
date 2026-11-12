import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
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
                          styles.avatarOuter,
                          isSelected && styles.avatarOuterSelected,
                        ]}
                      >
                        <View
                          style={[
                            styles.avatarCircle,
                            { backgroundColor: m.bgColor },
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

              {/* Text Input with Orange Border */}
              <View style={styles.inputContainer}>
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Write your note of appreciation..."
                  placeholderTextColor={Colors.textPlaceholder}
                  style={styles.textInput}
                  multiline
                />
              </View>

              {/* Suggestion Chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
              >
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
              </ScrollView>

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
    borderColor: Colors.borderBold,
  },
  dragHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderMuted,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 18,
  },
  sectionKicker: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSubtle,
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  membersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 6,
  },
  memberCol: {
    alignItems: 'center',
  },
  avatarOuter: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.transparent,
  },
  avatarOuterSelected: {
    borderColor: Colors.primary,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 17,
    fontWeight: '700',
  },
  memberName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSubtle,
    marginTop: 6,
  },
  memberNameSelected: {
    color: Colors.white,
  },
  inputContainer: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 16,
    padding: 16,
    minHeight: 104,
    marginBottom: 16,
  },
  textInput: {
    fontSize: 15,
    color: Colors.white,
    lineHeight: 22,
    padding: 0,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.borderBold,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSubtle,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  privacyIcon: {
    marginRight: 8,
  },
  privacyText: {
    fontSize: 12.5,
    color: Colors.textSubtle,
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

