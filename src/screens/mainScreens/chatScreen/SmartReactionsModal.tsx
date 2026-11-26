import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Clipboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../../../units/Colors';

export interface SmartReactionsModalProps {
  visible: boolean;
  message?: any;
  onClose: () => void;
  onSelectReaction: (emoji: string) => void;
  onSelectQuickReply?: (replyText: string) => void;
  onTurnIntoTask?: (taskTitle: string) => void;
  onTurnIntoReminder?: (reminderTitle: string) => void;
  onReply: (message: any) => void;
}

const QUICK_EMOJIS = ['❤️', '👍', '😊', '✅'];

const EXTENDED_EMOJIS = [
  '❤️', '👍', '😊', '✅', '😂', '🔥',
  '🎉', '🙏', '👏', '💯', '🤔', '😍',
  '🥰', '🤣', '😭', '😮', '😢', '😡',
  '🤩', '🥳', '🙌', '🤝', '💪', '✨',
  '💔', '🚀', '⚡', '☕', '🎂', '🍕',
];

export const SmartReactionsModal: React.FC<SmartReactionsModalProps> = ({
  visible,
  message,
  onClose,
  onSelectReaction,
  onReply,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedEmoji, setSelectedEmoji] = useState('👍');
  const [showMoreEmojis, setShowMoreEmojis] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShowMoreEmojis(false);
    }
  }, [visible]);

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

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop touch to close modal */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Floating Emoji Bar */}
        <View style={styles.floatingEmojiBar}>
          {QUICK_EMOJIS.map((emoji) => {
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

          {/* Plus button to show / hide extended emojis */}
          <TouchableOpacity
            style={[
              styles.emojiBtn,
              showMoreEmojis && styles.emojiBtnSelected,
            ]}
            onPress={() => setShowMoreEmojis((prev) => !prev)}
            activeOpacity={0.7}
          >
            <Feather
              name={showMoreEmojis ? 'chevron-down' : 'plus'}
              size={20}
              color={showMoreEmojis ? Colors.primary : Colors.white}
            />
          </TouchableOpacity>
        </View>

        {/* Bottom Sheet */}
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
            {/* Extended Emojis Grid (When + button is clicked) */}
            {showMoreEmojis && (
              <View style={styles.moreEmojisContainer}>
                <View style={styles.moreEmojisHeaderRow}>
                  <Text style={styles.sectionHeaderUpper}>ALL REACTIONS</Text>
                  <TouchableOpacity
                    onPress={() => setShowMoreEmojis(false)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Feather name="x" size={16} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <View style={styles.moreEmojisGrid}>
                  {EXTENDED_EMOJIS.map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={styles.moreEmojiBtn}
                      onPress={() => handleReactionPress(emoji)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.moreEmojiText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

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
      </View>
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
    backgroundColor: Colors.surfaceSubtle,
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
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    letterSpacing: -0.3,
    marginBottom: 16,
  },
  moreEmojisContainer: {
    backgroundColor: Colors.cardElevated,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  moreEmojisHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  moreEmojisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  moreEmojiBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreEmojiText: {
    fontSize: 22,
  },
  sectionHeaderUpper: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    color: Colors.textSecondary,
    letterSpacing: 0.6,
    marginBottom: 10,
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
    fontFamily: 'Roboto-SemiBold',
  },
});

export default SmartReactionsModal;
