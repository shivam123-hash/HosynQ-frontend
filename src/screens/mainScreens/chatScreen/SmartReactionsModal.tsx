import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  Clipboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../../../units/Colors';
import { ChatMessage } from './types';

export interface SmartReactionsModalProps {
  visible: boolean;
  message?: ChatMessage;
  onClose: () => void;
  onSelectReaction: (emoji: string) => void;
  onSelectQuickReply: (replyText: string) => void;
  onTurnIntoTask: (taskTitle: string) => void;
  onTurnIntoReminder: (reminderTitle: string) => void;
  onReply: (message: ChatMessage) => void;
}

const EMOJIS = ['❤️', '👍', '😊', '✅', '+'];

const DEFAULT_QUICK_REPLIES = [
  'I’ll get you at 7:30',
  'Papa will pick you up',
  'Take an auto, share ETA',
];

export const SmartReactionsModal: React.FC<SmartReactionsModalProps> = ({
  visible,
  message,
  onClose,
  onSelectReaction,
  onSelectQuickReply,
  onTurnIntoTask,
  onTurnIntoReminder,
  onReply,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedEmoji, setSelectedEmoji] = useState('👍');

  const handleCopy = () => {
    if (message?.text) {
      Clipboard.setString(message.text);
    }
    onClose();
  };

  const handleReactionPress = (emoji: string) => {
    setSelectedEmoji(emoji);
    onSelectReaction(emoji);
    onClose();
  };

  const handleQuickReplyPress = (reply: string) => {
    onSelectQuickReply(reply);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          {/* Floating Emoji Bar */}
          <View style={styles.floatingEmojiBar}>
            {EMOJIS.map((emoji) => {
              const isSelected = selectedEmoji === emoji;
              return (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.emojiBtn,
                    isSelected && styles.emojiBtnSelected,
                  ]}
                  onPress={() => handleReactionPress(emoji)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Bottom Sheet */}
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.sheetContainer,
                { paddingBottom: Math.max(insets.bottom, 20) },
              ]}
            >
              {/* Drag Handle */}
              <View style={styles.handleBar} />

              <Text style={styles.sheetTitle}>Smart reactions</Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Section 1: QUICK REPLIES */}
                <Text style={styles.sectionHeaderUpper}>QUICK REPLIES</Text>
                <View style={styles.quickRepliesWrap}>
                  {DEFAULT_QUICK_REPLIES.map((reply) => (
                    <TouchableOpacity
                      key={reply}
                      style={styles.replyChip}
                      onPress={() => handleQuickReplyPress(reply)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.replyChipText}>{reply}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Section 2: TURN INTO */}
                <View style={styles.turnIntoHeaderRow}>
                  <Feather
                    name="star"
                    size={14}
                    color={Colors.primary}
                    style={styles.starIcon}
                  />
                  <Text style={styles.turnIntoLabel}>TURN INTO</Text>
                </View>

                <View style={styles.turnIntoCard}>
                  {/* Task Row */}
                  <TouchableOpacity
                    style={styles.turnIntoRow}
                    onPress={() => {
                      onTurnIntoTask('Pick up Anaya at 7:30 PM');
                      onClose();
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.taskIconBox}>
                      <Feather
                        name="check-square"
                        size={18}
                        color={Colors.primary}
                      />
                    </View>
                    <View style={styles.turnIntoTextGroup}>
                      <Text style={styles.turnIntoTitle}>
                        Task: Pick up Anaya at 7:30 PM
                      </Text>
                      <Text style={styles.turnIntoSubtitle}>
                        Assign to Rohan · Lodhi Sports Complex
                      </Text>
                    </View>
                    <Feather
                      name="chevron-right"
                      size={18}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>

                  <View style={styles.divider} />

                  {/* Reminder Row */}
                  <TouchableOpacity
                    style={styles.turnIntoRow}
                    onPress={() => {
                      onTurnIntoReminder('Leave office at 7:05 PM');
                      onClose();
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.reminderIconBox}>
                      <Feather
                        name="bell"
                        size={18}
                        color={Colors.accentPurple}
                      />
                    </View>
                    <View style={styles.turnIntoTextGroup}>
                      <Text style={styles.turnIntoTitle}>
                        Reminder: Leave office at 7:05 PM
                      </Text>
                      <Text style={styles.turnIntoSubtitle}>For Rohan</Text>
                    </View>
                    <Feather
                      name="chevron-right"
                      size={18}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.footnoteText}>
                  Nothing is added until you confirm.
                </Text>

                {/* Bottom Action Buttons (Reply / Copy) */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      if (message) onReply(message);
                      onClose();
                    }}
                    activeOpacity={0.7}
                  >
                    <Feather
                      name="corner-up-left"
                      size={16}
                      color={Colors.white}
                      style={styles.actionIcon}
                    />
                    <Text style={styles.actionButtonText}>Reply</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleCopy}
                    activeOpacity={0.7}
                  >
                    <Feather
                      name="copy"
                      size={16}
                      color={Colors.primary}
                      style={styles.actionIcon}
                    />
                    <Text style={styles.actionButtonText}>Copy</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  floatingEmojiBar: {
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 28,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    gap: 12,
  },
  emojiBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBtnSelected: {
    backgroundColor: 'rgba(240, 145, 58, 0.2)',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  emojiText: {
    fontSize: 20,
  },
  sheetContainer: {
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.border,
    maxHeight: '80%',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderLight,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.3,
    marginBottom: 16,
  },
  sectionHeaderUpper: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  quickRepliesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  replyChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  replyChipText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  turnIntoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  starIcon: {
    marginRight: 6,
  },
  turnIntoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.8,
  },
  turnIntoCard: {
    backgroundColor: Colors.cardElevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  turnIntoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  taskIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(240, 145, 58, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reminderIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(157, 101, 229, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  turnIntoTextGroup: {
    flex: 1,
    marginRight: 8,
  },
  turnIntoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 2,
  },
  turnIntoSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderSubtle,
  },
  footnoteText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default SmartReactionsModal;
