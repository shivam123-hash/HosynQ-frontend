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
import { ChatMessage, SharedItemData } from './types';
import { ShareItemModal } from './ShareItemModal';
import { QuickMessagesModal } from './QuickMessagesModal';
import { SmartReactionsModal } from './SmartReactionsModal';
import { ImageViewerModal } from './ImageViewerModal';

export interface ChatConversationModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  memberCountText?: string;
  isEmpty?: boolean;
  isOffline?: boolean;
  initialMessages?: ChatMessage[];
  onOpenVault?: () => void;
}

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    senderId: 'dadi',
    senderName: 'Dadi',
    senderInitial: 'D',
    senderColor: Colors.avatarGreen,
    nameColor: Colors.accentGreenSoft,
    text: 'Diyas for tonight. Anaya, help me light them at 7?',
    timeText: '1:15 PM',
    isYou: false,
    status: 'delivered',
    hasImage: true,
    imageCaption: 'Diyas for tonight. Anaya, help me light them at 7?',
  },
  {
    id: 'msg-2',
    senderId: 'rohan',
    senderName: 'Rohan',
    senderInitial: 'R',
    senderColor: Colors.avatarNavy,
    nameColor: Colors.accentBlueSoft,
    text: 'I’ll be at the PTM by 2:55',
    timeText: '12:30 PM',
    isYou: false,
    status: 'delivered',
  },
  {
    id: 'msg-3',
    senderId: 'you',
    senderName: 'You',
    senderInitial: 'P',
    senderColor: Colors.avatarBrown,
    nameColor: Colors.white,
    text: 'Thanks! I’ll meet you at the gate.',
    timeText: '12:32 PM',
    isYou: true,
    status: 'delivered',
  },
  {
    id: 'msg-4',
    senderId: 'anaya',
    senderName: 'Anaya',
    senderInitial: 'A',
    senderColor: Colors.avatarWine,
    nameColor: Colors.accentPink,
    text: 'Can someone pick me up after badminton? Done by 7:30',
    timeText: '2:40 PM',
    isYou: false,
    status: 'delivered',
  },
  {
    id: 'msg-5',
    senderId: 'you',
    senderName: 'You',
    senderInitial: 'P',
    senderColor: Colors.avatarBrown,
    nameColor: Colors.white,
    text: 'I’ll ask Papa. He leaves office at 7.',
    timeText: '2:42 PM',
    isYou: true,
    status: 'delivered',
  },
];

export const ChatConversationModal: React.FC<ChatConversationModalProps> = ({
  visible,
  onClose,
  title = 'Family chat',
  memberCountText = '5 members',
  isEmpty: initialEmpty = false,
  isOffline: initialOffline = false,
  initialMessages = DEFAULT_MESSAGES,
  onOpenVault,
}) => {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialEmpty ? [] : initialMessages
  );
  const [inputText, setInputText] = useState('');
  const [isOffline, setIsOffline] = useState(initialOffline);

  // Sub-modal states
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQuickMessages, setShowQuickMessages] = useState(false);
  const [selectedMessageForReactions, setSelectedMessageForReactions] =
    useState<ChatMessage | null>(null);
  const [showImageViewer, setShowImageViewer] = useState(false);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'you',
      senderName: 'You',
      senderInitial: 'P',
      senderColor: Colors.avatarBrown,
      nameColor: Colors.white,
      text,
      timeText: 'Just now',
      isYou: true,
      status: isOffline ? 'failed' : 'delivered',
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
  };

  const handleRetryMessage = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, status: 'delivered', timeText: 'Just now' } : m
      )
    );
    setIsOffline(false);
  };

  const handleShareItem = (item: SharedItemData) => {
    const newMsg: ChatMessage = {
      id: `shared-${Date.now()}`,
      senderId: 'you',
      senderName: 'You',
      senderInitial: 'P',
      senderColor: Colors.avatarBrown,
      nameColor: Colors.white,
      timeText: 'Just now',
      isYou: true,
      status: 'delivered',
      sharedItem: item,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const handleCardAction = (item: SharedItemData) => {
    if (item.type === 'task') {
      Alert.alert('Task Completed', `"${item.title}" marked as done.`);
    } else if (item.type === 'event') {
      Alert.alert('Calendar Updated', `"${item.title}" added to your calendar.`);
    } else {
      Alert.alert('List Opened', `Opening "${item.title}".`);
    }
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
        <View
          style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}
        >
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
              <Text style={styles.headerTitle}>{title}</Text>
              <Text style={styles.headerSubtitle}>{memberCountText}</Text>
            </View>

            <TouchableOpacity
              style={styles.circleButton}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Options"
              onPress={() => {
                Alert.alert(
                  'Chat Options',
                  'Select action',
                  [
                    {
                      text: 'Toggle Offline / Online',
                      onPress: () => setIsOffline((prev) => !prev),
                    },
                    {
                      text: 'Clear Chat',
                      onPress: () => setMessages([]),
                    },
                    { text: 'Cancel', style: 'cancel' },
                  ]
                );
              }}
            >
              <Feather name="more-horizontal" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {/* Offline Banner (CHT-09) */}
          {isOffline && (
            <View style={styles.offlineBanner}>
              <Feather
                name="wifi-off"
                size={18}
                color={Colors.bannerErrorBorder}
                style={styles.offlineIcon}
              />
              <Text style={styles.offlineText}>
                No internet. Messages will send when you’re back online.
              </Text>
            </View>
          )}

          {/* Main Message Stream or Empty State */}
          {messages.length === 0 ? (
            /* Empty Chat (CHT-08) */
            <View style={styles.emptyContainer}>
              <View style={styles.emptyCenterContent}>
                {/* Concentric Circles Chat Graphic */}
                <View style={styles.emptyOuterRing}>
                  <View style={styles.emptyInnerRing}>
                    <Feather
                      name="message-square"
                      size={32}
                      color={Colors.primary}
                    />
                  </View>
                </View>

                <Text style={styles.emptyTitle}>Say hello to your family</Text>
                <Text style={styles.emptySubtitle}>
                  Everyone in The Sharma Family sees{'\n'}messages here. You can
                  share tasks, events{'\n'}and lists too.
                </Text>

                {/* Structured Prompt suggestion chips (2-tier layout) */}
                <View style={styles.chipsContainer}>
                  <View style={styles.topChipRow}>
                    <TouchableOpacity
                      style={styles.promptChip}
                      onPress={() => handleSendMessage('Good morning, everyone!')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.promptChipText}>
                        Good morning, everyone!
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.bottomChipsRow}>
                    <TouchableOpacity
                      style={styles.promptChip}
                      onPress={() => handleSendMessage('What’s for dinner?')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.promptChipText}>What’s for dinner?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.promptChip}
                      onPress={() => handleSendMessage('Who’s home tonight?')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.promptChipText}>
                        Who’s home tonight?
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            /* Populated Message Stream */
            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((msg) => {
                if (msg.isYou) {
                  // Outgoing Message (Right-aligned)
                  return (
                    <View key={msg.id} style={styles.outgoingMessageContainer}>
                      {/* Shared Item Card (CHT-04) */}
                      {msg.sharedItem ? (
                        <View style={styles.sharedCardEvent}>
                          <View style={styles.sharedTagRow}>
                            <Feather
                              name="calendar"
                              size={14}
                              color={Colors.accentBlue}
                              style={styles.sharedTagIcon}
                            />
                            <Text style={styles.sharedTagEvent}>EVENT</Text>
                          </View>
                          <Text style={styles.sharedItemTitle}>
                            {msg.sharedItem.title}
                          </Text>
                          <Text style={styles.sharedItemSubtitle}>
                            {msg.sharedItem.subtitle}
                          </Text>
                          <TouchableOpacity
                            style={styles.sharedEventBtn}
                            onPress={() => handleCardAction(msg.sharedItem!)}
                            activeOpacity={0.7}
                          >
                            <Feather
                              name="plus"
                              size={14}
                              color={Colors.white}
                              style={styles.sharedEventBtnIcon}
                            />
                            <Text style={styles.sharedEventBtnText}>
                              {msg.sharedItem.actionLabel}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.outgoingBubble,
                            msg.status === 'failed' && styles.outgoingBubbleFailed,
                          ]}
                          onLongPress={() => setSelectedMessageForReactions(msg)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.outgoingText}>{msg.text}</Text>
                        </TouchableOpacity>
                      )}

                      {/* Meta Status */}
                      {msg.status === 'failed' ? (
                        <TouchableOpacity
                          style={styles.failedStatusRow}
                          onPress={() => handleRetryMessage(msg.id)}
                          activeOpacity={0.7}
                        >
                          <Feather
                            name="alert-circle"
                            size={14}
                            color={Colors.dangerRed}
                            style={styles.failedIcon}
                          />
                          <Text style={styles.failedText}>Not sent. </Text>
                          <Text style={styles.retryText}>Tap to retry</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.outgoingMetaRow}>
                          <Text style={styles.metaTimeText}>{msg.timeText}</Text>
                          <Feather
                            name="check"
                            size={14}
                            color={Colors.accentTeal}
                            style={styles.checkIcon}
                          />
                        </View>
                      )}
                    </View>
                  );
                }

                // Incoming Message (Left-aligned)
                return (
                  <View key={msg.id} style={styles.incomingMessageContainer}>
                    <Text
                      style={[styles.senderNameLabel, { color: msg.nameColor }]}
                    >
                      {msg.senderName}
                    </Text>

                    <View style={styles.incomingRow}>
                      {/* Avatar */}
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

                      {/* Message Bubble or Card */}
                      <View style={styles.incomingContentGroup}>
                        {msg.sharedItem ? (
                          // Shared card inside message stream (CHT-04)
                          msg.sharedItem.type === 'list' ? (
                            <View style={styles.sharedCardList}>
                              <View style={styles.sharedTagRow}>
                                <Feather
                                  name="list"
                                  size={14}
                                  color={Colors.accentTeal}
                                  style={styles.sharedTagIcon}
                                />
                                <Text style={styles.sharedTagList}>LIST</Text>
                              </View>
                              <Text style={styles.sharedItemTitle}>
                                {msg.sharedItem.title}
                              </Text>
                              <Text style={styles.sharedItemSubtitle}>
                                {msg.sharedItem.subtitle}
                              </Text>
                              {/* Progress Track */}
                              <View style={styles.listProgressTrack}>
                                <View style={styles.listProgressFill} />
                              </View>
                              <TouchableOpacity
                                style={styles.openListBtn}
                                onPress={() => handleCardAction(msg.sharedItem!)}
                                activeOpacity={0.7}
                              >
                                <Text style={styles.openListBtnText}>
                                  Open list
                                </Text>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <View style={styles.sharedCardTask}>
                              <View style={styles.sharedTaskHeaderRow}>
                                <View style={styles.sharedTagRow}>
                                  <Feather
                                    name="check-square"
                                    size={14}
                                    color={Colors.dangerRed}
                                    style={styles.sharedTagIcon}
                                  />
                                  <Text style={styles.sharedTagTask}>TASK</Text>
                                </View>
                                {msg.sharedItem.isOverdue && (
                                  <View style={styles.overdueBadge}>
                                    <Text style={styles.overdueBadgeText}>
                                      Overdue
                                    </Text>
                                  </View>
                                )}
                              </View>
                              <Text style={styles.sharedItemTitle}>
                                {msg.sharedItem.title}
                              </Text>
                              <Text style={styles.sharedItemSubtitle}>
                                {msg.sharedItem.subtitle}
                              </Text>
                              <TouchableOpacity
                                style={styles.markDoneBtn}
                                onPress={() => handleCardAction(msg.sharedItem!)}
                                activeOpacity={0.7}
                              >
                                <Feather
                                  name="check"
                                  size={14}
                                  color={Colors.white}
                                  style={styles.markDoneIcon}
                                />
                                <Text style={styles.markDoneBtnText}>
                                  Mark done
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )
                        ) : (
                          <TouchableOpacity
                            style={styles.incomingBubble}
                            onLongPress={() => setSelectedMessageForReactions(msg)}
                            activeOpacity={0.85}
                          >
                            <Text style={styles.incomingText}>{msg.text}</Text>
                          </TouchableOpacity>
                        )}

                        {/* Image Attachment (Diya lamps) */}
                        {msg.hasImage && (
                          <TouchableOpacity
                            style={styles.imageAttachmentBox}
                            onPress={() => setShowImageViewer(true)}
                            activeOpacity={0.85}
                          >
                            {/* Diya Lamps Preview */}
                            <View style={styles.diyaAttachmentStage}>
                              {[0, 1, 2, 3, 4].map((idx) => (
                                <View
                                  key={`att-diya-${idx}`}
                                  style={styles.smallDiyaItem}
                                >
                                  <View style={styles.smallDiyaFlame} />
                                  <View style={styles.smallDiyaBowl} />
                                </View>
                              ))}
                            </View>
                          </TouchableOpacity>
                        )}

                        <Text style={styles.incomingTimeText}>
                          {msg.timeText}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}

          {/* Bottom Message Input Bar */}
          <View
            style={[
              styles.inputBar,
              { paddingBottom: Math.max(insets.bottom, 12) },
            ]}
          >
            {/* Plus Button */}
            <TouchableOpacity
              style={styles.plusButton}
              onPress={() => setShowShareModal(true)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Share options"
            >
              <Feather name="plus" size={20} color={Colors.white} />
            </TouchableOpacity>

            {/* Input Pill */}
            <View style={styles.inputPill}>
              <TextInput
                style={styles.messageInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Message"
                placeholderTextColor={Colors.textPlaceholder}
                onSubmitEditing={() => handleSendMessage()}
              />
              <TouchableOpacity
                style={styles.cameraIconBtn}
                onPress={() => setShowQuickMessages(true)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Quick messages"
              >
                <Feather
                  name="camera"
                  size={18}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Voice Mic / Send Button */}
            {inputText.trim().length > 0 ? (
              <TouchableOpacity
                style={styles.micButton}
                onPress={() => handleSendMessage()}
                activeOpacity={0.85}
              >
                <Feather name="send" size={18} color={Colors.white} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.micButton}
                onPress={() => setShowQuickMessages(true)}
                activeOpacity={0.85}
              >
                <Feather name="mic" size={18} color={Colors.white} />
              </TouchableOpacity>
            )}
          </View>

          {/* Sub-modals */}
          <ShareItemModal
            visible={showShareModal}
            onClose={() => setShowShareModal(false)}
            onShareItem={handleShareItem}
          />

          <QuickMessagesModal
            visible={showQuickMessages}
            onClose={() => setShowQuickMessages(false)}
            onSelectQuickMessage={(text) => handleSendMessage(text)}
          />

          <SmartReactionsModal
            visible={!!selectedMessageForReactions}
            message={selectedMessageForReactions || undefined}
            onClose={() => setSelectedMessageForReactions(null)}
            onSelectReaction={(_emoji) => {
              // Add reaction
            }}
            onSelectQuickReply={(reply) => handleSendMessage(reply)}
            onTurnIntoTask={(task) => {
              Alert.alert('Task Created', `"${task}" created.`);
            }}
            onTurnIntoReminder={(reminder) => {
              Alert.alert('Reminder Created', `"${reminder}" created.`);
            }}
            onReply={(msg) => {
              setInputText(`Replying to ${msg.senderName}: `);
            }}
          />

          <ImageViewerModal
            visible={showImageViewer}
            onClose={() => setShowImageViewer(false)}
            onSaveToVault={onOpenVault}
          />
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
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bannerErrorBg,
    marginHorizontal: 20,
    marginTop: 6,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.bannerErrorBorder,
  },
  offlineIcon: {
    marginRight: 10,
  },
  offlineText: {
    flex: 1,
    color: Colors.white,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyCenterContent: {
    alignItems: 'center',
    width: '100%',
  },
  emptyOuterRing: {
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: 'rgba(29, 50, 82, 0.4)',
    borderWidth: 1.5,
    borderColor: Colors.borderBold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  emptyInnerRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.3,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14.5,
    lineHeight: 22,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 320,
  },
  chipsContainer: {
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  topChipRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  bottomChipsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  promptChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  promptChipText: {
    color: Colors.textNearWhite,
    fontSize: 14,
    fontWeight: '500',
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
  outgoingMessageContainer: {
    alignItems: 'flex-end',
  },
  outgoingBubble: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    paddingHorizontal: 18,
    paddingVertical: 12,
    maxWidth: '80%',
  },
  outgoingBubbleFailed: {
    backgroundColor: '#8C562B',
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
  checkIcon: {
    marginLeft: 2,
  },
  failedStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  failedIcon: {
    marginRight: 4,
  },
  failedText: {
    color: Colors.dangerRed,
    fontSize: 12,
    fontWeight: '600',
  },
  retryText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  incomingMessageContainer: {
    alignItems: 'flex-start',
  },
  senderNameLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 40,
    marginBottom: 4,
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
  imageAttachmentBox: {
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  diyaAttachmentStage: {
    height: 120,
    backgroundColor: '#28170D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
  },
  smallDiyaItem: {
    alignItems: 'center',
  },
  smallDiyaFlame: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFE2B8',
    marginBottom: 4,
  },
  smallDiyaBowl: {
    width: 22,
    height: 8,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    backgroundColor: '#7A3F1D',
  },
  sharedCardEvent: {
    backgroundColor: Colors.cardElevated,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.accentBlue,
    padding: 16,
    width: 280,
  },
  sharedCardList: {
    backgroundColor: Colors.cardElevated,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.accentTeal,
    padding: 16,
    width: 260,
  },
  sharedCardTask: {
    backgroundColor: Colors.cardElevated,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.dangerRed,
    padding: 16,
    width: 260,
  },
  sharedTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sharedTagIcon: {
    marginRight: 6,
  },
  sharedTagEvent: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentBlue,
    letterSpacing: 0.8,
  },
  sharedTagList: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentTeal,
    letterSpacing: 0.8,
  },
  sharedTaskHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sharedTagTask: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.dangerRed,
    letterSpacing: 0.8,
  },
  overdueBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.dangerRed,
  },
  overdueBadgeText: {
    fontSize: 10,
    color: Colors.dangerRed,
    fontWeight: '700',
  },
  sharedItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  sharedItemSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  listProgressTrack: {
    height: 4,
    backgroundColor: Colors.surfaceNavyDark,
    borderRadius: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  listProgressFill: {
    height: 4,
    width: '45%',
    backgroundColor: Colors.accentTeal,
    borderRadius: 2,
  },
  sharedEventBtn: {
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sharedEventBtnIcon: {
    marginRight: 6,
  },
  sharedEventBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  openListBtn: {
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openListBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  markDoneBtn: {
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markDoneIcon: {
    marginRight: 6,
  },
  markDoneBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
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

export default ChatConversationModal;
