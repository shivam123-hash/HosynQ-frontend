import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../../../units/Colors';
import { ChatMessage } from './types';

export interface JustUsModalProps {
  visible: boolean;
  onClose: () => void;
  isAvailable?: boolean;
  onInvitePartner?: () => void;
  onHideJustUs?: () => void;
}

const DEFAULT_JUST_US_MESSAGES: ChatMessage[] = [
  {
    id: 'ju-1',
    senderId: 'rohan',
    senderName: 'Rohan',
    senderInitial: 'R',
    senderColor: Colors.avatarNavy,
    nameColor: Colors.accentBlueSoft,
    text: 'Anniversary is on the 21st. Should we plan something?',
    timeText: '10:12 PM',
    isYou: false,
    status: 'delivered',
    dateSeparator: 'Yesterday',
  },
  {
    id: 'ju-2',
    senderId: 'you',
    senderName: 'You',
    senderInitial: 'P',
    senderColor: Colors.avatarBrown,
    nameColor: Colors.white,
    text: 'Yes! Lonavala for the weekend?',
    timeText: '10:14 PM',
    isYou: true,
    status: 'delivered',
  },
  {
    id: 'ju-3',
    senderId: 'rohan',
    senderName: 'Rohan',
    senderInitial: 'R',
    senderColor: Colors.avatarNavy,
    nameColor: Colors.accentBlueSoft,
    text: 'Booked the table for Saturday. Don’t tell the kids!',
    timeText: '1:05 PM',
    isYou: false,
    status: 'delivered',
    dateSeparator: 'Today',
  },
  {
    id: 'ju-4',
    senderId: 'you',
    senderName: 'You',
    senderInitial: 'P',
    senderColor: Colors.avatarBrown,
    nameColor: Colors.white,
    text: 'Perfect. I’ll ask Dadi to babysit.',
    timeText: '1:07 PM',
    isYou: true,
    status: 'delivered',
  },
];

export const JustUsModal: React.FC<JustUsModalProps> = ({
  visible,
  onClose,
  isAvailable: initialAvailable = true,
  onInvitePartner,
  onHideJustUs,
}) => {
  const insets = useSafeAreaInsets();
  const [isAvailable, setIsAvailable] = useState(initialAvailable);
  const [messages, setMessages] = useState<ChatMessage[]>(DEFAULT_JUST_US_MESSAGES);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const newMsg: ChatMessage = {
      id: `ju-${Date.now()}`,
      senderId: 'you',
      senderName: 'You',
      senderInitial: 'P',
      senderColor: Colors.avatarBrown,
      nameColor: Colors.white,
      text: inputText.trim(),
      timeText: 'Just now',
      isYou: true,
      status: 'delivered',
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={onClose}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <Feather name="chevron-left" size={24} color={Colors.white} />
            </TouchableOpacity>

            <View style={styles.headerTitleGroup}>
              <View style={styles.headerTitleRow}>
                <Feather
                  name="lock"
                  size={15}
                  color={Colors.accentPurple}
                  style={styles.headerLockIcon}
                />
                <Text style={styles.headerTitle}>Just Us</Text>
              </View>
              {isAvailable && (
                <Text style={styles.headerSubtitle}>You and Rohan · Private</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.circleButton}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Options"
              onPress={() => {
                Alert.alert(
                  'Just Us Options',
                  'Select action',
                  [
                    {
                      text: 'Toggle Available / Unavailable',
                      onPress: () => setIsAvailable((prev) => !prev),
                    },
                    { text: 'Cancel', style: 'cancel' },
                  ]
                );
              }}
            >
              <Feather name="more-horizontal" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {!isAvailable ? (
            /* Unavailable / Decision Needed View (CHT-11) */
            <View style={styles.unavailableContainer}>
              {/* Callout Banner */}
              <View style={styles.decisionBanner}>
                <Feather
                  name="flag"
                  size={16}
                  color={Colors.primary}
                  style={styles.flagIcon}
                />
                <Text style={styles.decisionBannerText}>
                  Needs decision: what single parents, or families without a couple,
                  see here.
                </Text>
              </View>

              {/* Center Lock Graphic */}
              <View style={styles.centerGraphicArea}>
                <View style={styles.outerRing}>
                  <View style={styles.innerRing}>
                    <Feather name="lock" size={32} color={Colors.primary} />
                  </View>
                </View>

                <Text style={styles.unavailableTitle}>Just Us is for couples</Text>
                <Text style={styles.unavailableSubtitle}>
                  A private chat for two partners in the family. Invite your partner
                  to start one. Children never see it.
                </Text>
              </View>

              {/* Bottom Buttons */}
              <View
                style={[
                  styles.unavailableBottomBar,
                  { paddingBottom: Math.max(insets.bottom, 20) },
                ]}
              >
                <TouchableOpacity
                  style={styles.inviteButton}
                  onPress={
                    onInvitePartner ||
                    (() => Alert.alert('Invite', 'Invite link copied.'))
                  }
                  activeOpacity={0.85}
                >
                  <Feather
                    name="user-plus"
                    size={18}
                    color={Colors.white}
                    style={styles.inviteIcon}
                  />
                  <Text style={styles.inviteButtonText}>Invite your partner</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.hideButton}
                  onPress={onHideJustUs || onClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.hideButtonText}>Hide Just Us</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* Populated Private Chat View (CHT-10) */
            <View style={styles.chatArea}>
              <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Privacy Banner */}
                <View style={styles.privacyBanner}>
                  <Feather
                    name="lock"
                    size={16}
                    color={Colors.textSecondary}
                    style={styles.bannerLockIcon}
                  />
                  <Text style={styles.privacyBannerText}>
                    Private and encrypted. Children can’t see this chat, and it never
                    appears in Pulse.
                  </Text>
                </View>

                {messages.map((msg) => (
                  <View key={msg.id}>
                    {/* Date Separator */}
                    {msg.dateSeparator && (
                      <View style={styles.dateSeparatorRow}>
                        <View style={styles.datePill}>
                          <Text style={styles.datePillText}>
                            {msg.dateSeparator}
                          </Text>
                        </View>
                      </View>
                    )}

                    {msg.isYou ? (
                      // Outgoing Message (Right)
                      <View style={styles.outgoingMessageContainer}>
                        <View style={styles.outgoingBubble}>
                          <Text style={styles.outgoingText}>{msg.text}</Text>
                        </View>
                        <View style={styles.outgoingMetaRow}>
                          <Text style={styles.metaTimeText}>{msg.timeText}</Text>
                          <Feather
                            name="check"
                            size={14}
                            color={Colors.accentTeal}
                          />
                        </View>
                      </View>
                    ) : (
                      // Incoming Message (Left)
                      <View style={styles.incomingMessageContainer}>
                        <View style={styles.incomingRow}>
                          <View
                            style={[
                              styles.avatarCircle,
                              { backgroundColor: msg.senderColor },
                            ]}
                          >
                            <Text style={styles.avatarInitial}>
                              {msg.senderInitial}
                            </Text>
                          </View>
                          <View style={styles.incomingContentGroup}>
                            <View style={styles.incomingBubble}>
                              <Text style={styles.incomingText}>{msg.text}</Text>
                            </View>
                            <Text style={styles.incomingTimeText}>
                              {msg.timeText}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>

              {/* Message Input Bar */}
              <View
                style={[
                  styles.inputBar,
                  { paddingBottom: Math.max(insets.bottom, 12) },
                ]}
              >
                <TouchableOpacity
                  style={styles.plusButton}
                  onPress={() => Alert.alert('Add', 'Attach photo or doc')}
                  activeOpacity={0.7}
                >
                  <Feather name="plus" size={20} color={Colors.white} />
                </TouchableOpacity>

                <View style={styles.inputPill}>
                  <TextInput
                    style={styles.messageInput}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Message Rohan"
                    placeholderTextColor={Colors.textPlaceholder}
                    onSubmitEditing={handleSendMessage}
                  />
                  <TouchableOpacity
                    style={styles.cameraIconBtn}
                    activeOpacity={0.7}
                  >
                    <Feather
                      name="camera"
                      size={18}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                {inputText.trim().length > 0 ? (
                  <TouchableOpacity
                    style={styles.micButton}
                    onPress={handleSendMessage}
                    activeOpacity={0.85}
                  >
                    <Feather name="send" size={18} color={Colors.white} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.micButton}
                    activeOpacity={0.85}
                  >
                    <Feather name="mic" size={18} color={Colors.white} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
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
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitleGroup: {
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLockIcon: {
    marginRight: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  unavailableContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  decisionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(240, 145, 58, 0.4)',
  },
  flagIcon: {
    marginRight: 12,
  },
  decisionBannerText: {
    flex: 1,
    color: Colors.textNearWhite,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  centerGraphicArea: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  outerRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(240, 145, 58, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(240, 145, 58, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  innerRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(240, 145, 58, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailableTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  unavailableSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  unavailableBottomBar: {
    paddingHorizontal: 20,
    gap: 12,
  },
  inviteButton: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteIcon: {
    marginRight: 8,
  },
  inviteButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  hideButton: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hideButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  chatArea: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 16,
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardElevated,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  bannerLockIcon: {
    marginRight: 10,
  },
  privacyBannerText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  dateSeparatorRow: {
    alignItems: 'center',
    marginVertical: 12,
  },
  datePill: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  datePillText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  outgoingMessageContainer: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  outgoingBubble: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    paddingHorizontal: 18,
    paddingVertical: 12,
    maxWidth: '80%',
  },
  outgoingText: {
    color: Colors.black,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  outgoingMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaTimeText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginRight: 4,
  },
  incomingMessageContainer: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  incomingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginBottom: 16,
  },
  avatarInitial: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  incomingContentGroup: {
    flex: 1,
  },
  incomingBubble: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  incomingText: {
    color: Colors.white,
    fontSize: 15,
    lineHeight: 20,
  },
  incomingTimeText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
    marginLeft: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    gap: 10,
  },
  plusButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputPill: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  messageInput: {
    flex: 1,
    color: Colors.white,
    fontSize: 15,
  },
  cameraIconBtn: {
    padding: 4,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default JustUsModal;
