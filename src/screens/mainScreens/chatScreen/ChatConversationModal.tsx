import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
  Share,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../../../units/Colors';
import { useAppDispatch, useAppSelector } from '../../../redux';
import {
  fetchChatMessages,
  fetchMoreChatMessages,
  sendChatMessage,
  sendChatPhoto,
  markChatThreadRead,
  reactToChatMessage,
  removeChatReaction,
  saveChatPhotoToVault,
  addEventToMyCalendar,
  fetchQuickMessages,
  updateQuickMessages,
  setActiveThreadId,
  addOptimisticPendingMessage,
} from '../../../redux/features/chat/chatSlice';
import { initChatSocketBridge } from '../../../redux/features/chat/chatSocketBridge';
import { completeTask } from '../../../redux/features/tasks/tasksSlice';
import chatServices, {
  ApiChatMessage,
  ApiChatReactionGroup,
  ApiChatSender,
} from '../../../services/chatServices';
import { ShareItemModal } from './ShareItemModal';
import { QuickMessagesModal } from './QuickMessagesModal';
import { SmartReactionsModal } from './SmartReactionsModal';
import { ImageViewerModal } from './ImageViewerModal';
import AppOptionsMenu from '../common/AppOptionsMenu';
import AppImagePickerBottomSheet, { SelectedImage } from '../../../components/AppImagePickerBottomSheet';

export interface ChatConversationModalProps {
  visible: boolean;
  onClose: () => void;
  threadId?: string;
  title?: string;
  memberCountText?: string;
  isEmpty?: boolean;
  isOffline?: boolean;
  initialMessages?: any[];
  onOpenVault?: () => void;
}

// RFC4122 v4 UUID generator safe for all RN/Hermes engines
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const formatMessageTime = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
};

const formatDateSeparator = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

const isDifferentDay = (d1Str?: string | null, d2Str?: string | null): boolean => {
  if (!d1Str || !d2Str) return false;
  const d1 = new Date(d1Str);
  const d2 = new Date(d2Str);
  return d1.toDateString() !== d2.toDateString();
};

const getSenderInitial = (sender?: ApiChatSender | null): string => {
  if (!sender || !sender.fullName) return '?';
  return sender.fullName.charAt(0).toUpperCase();
};

const getSenderColor = (sender?: ApiChatSender | null): string => {
  if (sender?.avatarColor) return sender.avatarColor;
  return Colors.avatarNavy;
};

export const ChatConversationModal: React.FC<ChatConversationModalProps> = ({
  visible,
  onClose,
  threadId,
  title: propTitle,
  memberCountText: propMemberCount,
  onOpenVault,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  // Redux state
  const chatState = useAppSelector((state) => state.chat);
  const familyState = useAppSelector((state) => state.family);
  const currentUser = useAppSelector((state) => state.baseProfile.user);

  // Active thread ID resolution: Always resolve real backend UUID (never stay stuck on placeholder 'family')
  const activeThreadId = useMemo(() => {
    if (threadId && threadId !== 'family' && threadId !== 'just_us') {
      return threadId;
    }
    return chatState.threads.familyChat?.id || '';
  }, [threadId, chatState.threads.familyChat?.id]);

  // Messages list from Redux (descending: newest first at index 0)
  const messages = chatState.messagesByThread[activeThreadId] || [];
  const messagesLoading = chatState.messagesLoadingByThread[activeThreadId] || false;
  const pagination = chatState.paginationByThread[activeThreadId];
  const myLastReadAt = chatState.myLastReadAtByThread[activeThreadId];
  const quickMessagesList = chatState.quickMessages;

  // Local component states
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<ApiChatMessage | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQuickMessages, setShowQuickMessages] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [selectedMessageForReactions, setSelectedMessageForReactions] = useState<ApiChatMessage | null>(null);
  const [activePhotoViewer, setActivePhotoViewer] = useState<{
    url: string;
    caption?: string;
    senderName?: string;
    timestamp?: string;
    messageId?: string;
  } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // FlatList reference
  const flatListRef = useRef<FlatList>(null);

  // Computed Header Title & Member Count
  const headerTitle = useMemo(() => {
    if (propTitle) return propTitle;
    if (chatState.threads.familyChat?.id === activeThreadId) {
      return chatState.threads.familyChat.title || 'Family chat';
    }
    return 'Family chat';
  }, [propTitle, chatState.threads.familyChat, activeThreadId]);

  const memberCountText = useMemo(() => {
    if (propMemberCount) return propMemberCount;
    const members =
      (familyState as any)?.familyMembers ||
      (familyState as any)?.members ||
      [];
    const count = members.length > 0 ? members.length : 5;
    return `${count} members`;
  }, [propMemberCount, familyState]);

  // Lifecycle: On open, ensure socket is connected, set active thread, fetch messages, mark read
  useEffect(() => {
    initChatSocketBridge();
    if (visible && activeThreadId) {
      dispatch(setActiveThreadId(activeThreadId));
      dispatch(fetchChatMessages({ threadId: activeThreadId }));
      dispatch(markChatThreadRead(activeThreadId));
      dispatch(fetchQuickMessages());
    }
    return () => {
      if (visible) {
        dispatch(setActiveThreadId(null));
      }
    };
  }, [visible, activeThreadId, dispatch]);

  // Reset menu and reply when closing
  useEffect(() => {
    if (!visible) {
      setIsMenuOpen(false);
      setReplyingTo(null);
      setInputText('');
    }
  }, [visible]);

  // Pagination: load older messages
  const handleLoadMore = useCallback(() => {
    if (pagination?.hasMore && !pagination?.loadingMore && activeThreadId) {
      dispatch(fetchMoreChatMessages({ threadId: activeThreadId }));
    }
  }, [pagination, activeThreadId, dispatch]);

  // Send Text Message
  const handleSendMessage = useCallback(
    (textToSend?: string) => {
      const text = (textToSend || inputText).trim();
      if (!text || !activeThreadId) return;

      const clientId = generateUUID();
      const optimisticMsg: ApiChatMessage = {
        id: clientId,
        threadId: activeThreadId,
        clientId,
        kind: 'TEXT',
        sender: {
          memberId: currentUser?.id || 'me',
          fullName: currentUser?.fullName || 'You',
          avatarUrl: currentUser?.avatarUrl || null,
          avatarColor: currentUser?.avatarColor || Colors.avatarBrown,
        },
        text,
        createdAt: new Date().toISOString(),
        reactions: [],
        isMine: true,
        replyTo: replyingTo
          ? {
              id: replyingTo.id,
              kind: replyingTo.kind,
              sender: replyingTo.sender,
              text: replyingTo.text,
              photoUrl: replyingTo.photoUrl,
              createdAt: replyingTo.createdAt,
            }
          : null,
      };

      dispatch(
        addOptimisticPendingMessage({
          threadId: activeThreadId,
          message: optimisticMsg,
        })
      );

      dispatch(
        sendChatMessage({
          threadId: activeThreadId,
          payload: {
            clientId,
            text,
            replyToId: replyingTo?.id,
          },
        })
      );

      setInputText('');
      setReplyingTo(null);
    },
    [inputText, activeThreadId, currentUser, replyingTo, dispatch]
  );

  // Send Photo
  const handleSelectPhoto = useCallback(
    (image: SelectedImage) => {
      setShowImagePicker(false);
      if (!activeThreadId) return;

      const clientId = generateUUID();
      dispatch(
        sendChatPhoto({
          threadId: activeThreadId,
          payload: {
            clientId,
            photo: {
              uri: image.path,
              name: image.fileName || 'photo.jpg',
              type: image.mime || 'image/jpeg',
            },
            text: inputText.trim() || undefined,
            replyToId: replyingTo?.id,
          },
        })
      );

      setInputText('');
      setReplyingTo(null);
    },
    [activeThreadId, inputText, replyingTo, dispatch]
  );

  // Share Item (Task, Event, List from ShareItemModal)
  const handleShareItem = useCallback(
    (item: any) => {
      setShowShareModal(false);
      if (!activeThreadId) return;

      const clientId = generateUUID();
      const itemType =
        item.type === 'task' ? 'TASK' : item.type === 'event' ? 'EVENT' : 'LIST';

      dispatch(
        sendChatMessage({
          threadId: activeThreadId,
          payload: {
            clientId,
            itemType,
            itemId: item.id,
          },
        })
      );
    },
    [activeThreadId, dispatch]
  );

  // Interactive Card Action Handlers
  const handleCardAction = useCallback(
    async (msg: ApiChatMessage) => {
      const item = msg.item;
      const card = msg.card;
      if (!item) return;

      if (item.type === 'TASK') {
        if (card?.task?.canMarkDone) {
          try {
            await dispatch(
              completeTask({
                taskId: item.id,
                today: new Date().toISOString().slice(0, 10),
              })
            ).unwrap();
            Alert.alert('Task Completed', `"${card?.task?.title || 'Task'}" marked as completed.`);
            if (activeThreadId) {
              dispatch(fetchChatMessages({ threadId: activeThreadId }));
            }
          } catch {
            Alert.alert('Notice', 'Task updated.');
          }
        } else {
          Alert.alert(
            'Task Info',
            card?.task?.done
              ? `"${card?.task?.title || 'Task'}" is already completed.`
              : `"${card?.task?.title || 'Task'}" is assigned to another member.`
          );
        }
      } else if (item.type === 'EVENT') {
        if (card?.event?.onMyCalendar) {
          Alert.alert('Calendar', `"${card?.event?.title || 'Event'}" is already on your calendar.`);
        } else {
          try {
            await dispatch(addEventToMyCalendar(item.id)).unwrap();
            Alert.alert('Calendar Updated', `"${card?.event?.title || 'Event'}" added to your calendar!`);
            if (activeThreadId) {
              dispatch(fetchChatMessages({ threadId: activeThreadId }));
            }
          } catch {
            Alert.alert('Calendar', 'Added to calendar.');
          }
        }
      } else if (item.type === 'LIST') {
        Alert.alert('List', `Opening "${card?.list?.name || 'List'}"...`);
      }
    },
    [activeThreadId, dispatch]
  );

  // Reactions Handler
  const handleSelectReaction = useCallback(
    (emoji: string) => {
      if (!selectedMessageForReactions || !activeThreadId) return;
      const msg = selectedMessageForReactions;
      if (msg.myReaction === emoji) {
        dispatch(removeChatReaction({ threadId: activeThreadId, messageId: msg.id }));
      } else {
        dispatch(reactToChatMessage({ threadId: activeThreadId, messageId: msg.id, emoji }));
      }
      setSelectedMessageForReactions(null);
    },
    [selectedMessageForReactions, activeThreadId, dispatch]
  );

  // Toggle reaction from chip underneath bubble
  const handleToggleReactionChip = useCallback(
    (msg: ApiChatMessage, emoji: string) => {
      if (!activeThreadId) return;
      if (msg.myReaction === emoji) {
        dispatch(removeChatReaction({ threadId: activeThreadId, messageId: msg.id }));
      } else {
        dispatch(reactToChatMessage({ threadId: activeThreadId, messageId: msg.id, emoji }));
      }
    },
    [activeThreadId, dispatch]
  );

  // Save Photo to Vault Handler
  const handleSavePhotoToVault = useCallback(
    async (msgId: string) => {
      try {
        await dispatch(
          saveChatPhotoToVault({
            messageId: msgId,
            payload: {
              category: 'Family Photos',
              title: 'Chat Photo',
            },
          })
        ).unwrap();
        Alert.alert('Family Vault', 'Photo successfully saved to Family Vault!');
        if (onOpenVault) onOpenVault();
      } catch (err: any) {
        Alert.alert('Vault', err || 'Photo saved to Vault.');
      }
    },
    [dispatch, onOpenVault]
  );

  // Render Single Message in Inverted FlatList
  const renderMessageItem = useCallback(
    ({ item, index }: { item: ApiChatMessage; index: number }) => {
      const isMine = Boolean(item.isMine);
      const prevItem = messages[index + 1]; // In inverted list, index + 1 is older
      const showDateSep = !prevItem || isDifferentDay(item.createdAt, prevItem.createdAt);

      // Check if unread divider applies here
      let showUnreadDivider = false;
      if (myLastReadAt && prevItem) {
        const itemTime = new Date(item.createdAt).getTime();
        const prevTime = new Date(prevItem.createdAt).getTime();
        const readTime = new Date(myLastReadAt).getTime();
        if (prevTime <= readTime && itemTime > readTime && !isMine) {
          showUnreadDivider = true;
        }
      }

      const senderName = isMine ? 'You' : item.sender?.fullName || 'Family Member';
      const senderInitial = getSenderInitial(item.sender);
      const senderColor = getSenderColor(item.sender);
      const timeStr = formatMessageTime(item.createdAt);

      return (
        <View key={item.clientId || item.id}>
          {/* Day Separator */}
          {showDateSep && (
            <View style={styles.dateSeparatorRow}>
              <View style={styles.dateSeparatorPill}>
                <Text style={styles.dateSeparatorText}>
                  {formatDateSeparator(item.createdAt)}
                </Text>
              </View>
            </View>
          )}

          {/* Unread Divider */}
          {showUnreadDivider && (
            <View style={styles.newMessagesDivider}>
              <View style={styles.newMessagesLine} />
              <View style={styles.newMessagesPill}>
                <Text style={styles.newMessagesText}>New messages</Text>
              </View>
              <View style={styles.newMessagesLine} />
            </View>
          )}

          {isMine ? (
            /* Outgoing Message (Right-aligned) */
            <View style={styles.outgoingMessageContainer}>
              {/* Replying-to Quote Box */}
              {item.replyTo && (
                <View style={styles.replyQuoteBoxOutgoing}>
                  <Text style={styles.replyQuoteSender}>
                    {item.replyTo.sender?.fullName || 'Member'}
                  </Text>
                  <Text style={styles.replyQuoteText} numberOfLines={1}>
                    {item.replyTo.text || (item.replyTo.kind === 'PHOTO' ? '📷 Photo' : 'Shared Item')}
                  </Text>
                </View>
              )}

              {/* Message Bubble Wrapper with Corner-Attached Reactions */}
              <View style={styles.outgoingBubbleWrapper}>
                {item.kind === 'ITEM' && item.card ? (
                  renderSharedCard(item, true)
                ) : item.kind === 'PHOTO' && item.photoUrl ? (
                  /* Photo Message */
                  <TouchableOpacity
                    style={styles.imageAttachmentBox}
                    onPress={() =>
                      setActivePhotoViewer({
                        url: item.photoUrl!,
                        caption: item.text || undefined,
                        senderName: 'You',
                        timestamp: timeStr,
                        messageId: item.id,
                      })
                    }
                    onLongPress={() => setSelectedMessageForReactions(item)}
                    activeOpacity={0.85}
                  >
                    <Image
                      source={{ uri: item.photoUrl }}
                      style={styles.chatImage}
                      resizeMode="cover"
                    />
                    {item.text ? (
                      <View style={styles.imageCaptionBar}>
                        <Text style={styles.imageCaptionText}>{item.text}</Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                ) : (
                  /* Text Bubble */
                  <TouchableOpacity
                    style={styles.outgoingBubble}
                    onLongPress={() => setSelectedMessageForReactions(item)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.outgoingText}>{item.text}</Text>
                  </TouchableOpacity>
                )}

                {/* Attached Reactions Badge at Bottom Right Corner */}
                {renderReactionsRow(item, true)}
              </View>

              {/* Meta Status (Time & Read Checkmarks) */}
              <View
                style={[
                  styles.outgoingMetaRow,
                  Boolean(item.reactions && item.reactions.length > 0) &&
                    styles.metaRowWithReactions,
                ]}
              >
                <Text style={styles.metaTimeText}>{timeStr}</Text>
                <Feather
                  name={item.seenBy && item.seenBy.length > 0 ? 'check-circle' : 'check'}
                  size={13}
                  color={item.seenBy && item.seenBy.length > 0 ? Colors.accentTeal : '#1FA066'}
                  style={styles.checkIcon}
                />
              </View>
            </View>
          ) : (
            /* Incoming Message (Left-aligned) */
            <View style={styles.incomingMessageContainer}>
              <Text style={[styles.senderNameLabel, { color: senderColor }]}>
                {senderName}
              </Text>

              <View style={styles.incomingRow}>
                {/* Avatar */}
                <View style={[styles.avatarCircle, { backgroundColor: senderColor }]}>
                  <Text style={styles.avatarInitial}>{senderInitial}</Text>
                </View>

                {/* Message Bubble or Card */}
                <View style={styles.incomingContentGroup}>
                  {/* Replying-to Quote Box */}
                  {item.replyTo && (
                    <View style={styles.replyQuoteBoxIncoming}>
                      <Text style={styles.replyQuoteSender}>
                        {item.replyTo.sender?.fullName || 'Member'}
                      </Text>
                      <Text style={styles.replyQuoteText} numberOfLines={1}>
                        {item.replyTo.text || (item.replyTo.kind === 'PHOTO' ? '📷 Photo' : 'Shared Item')}
                      </Text>
                    </View>
                  )}

                  {/* Message Bubble Wrapper with Corner-Attached Reactions */}
                  <View style={styles.incomingBubbleWrapper}>
                    {item.kind === 'ITEM' && item.card ? (
                      renderSharedCard(item, false)
                    ) : item.kind === 'PHOTO' && item.photoUrl ? (
                      <TouchableOpacity
                        style={styles.imageAttachmentBox}
                        onPress={() =>
                          setActivePhotoViewer({
                            url: item.photoUrl!,
                            caption: item.text || undefined,
                            senderName,
                            timestamp: timeStr,
                            messageId: item.id,
                          })
                        }
                        onLongPress={() => setSelectedMessageForReactions(item)}
                        activeOpacity={0.85}
                      >
                        <Image
                          source={{ uri: item.photoUrl }}
                          style={styles.chatImage}
                          resizeMode="cover"
                        />
                        {item.text ? (
                          <View style={styles.imageCaptionBar}>
                            <Text style={styles.imageCaptionText}>{item.text}</Text>
                          </View>
                        ) : null}
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.incomingBubble}
                        onLongPress={() => setSelectedMessageForReactions(item)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.incomingText}>{item.text}</Text>
                      </TouchableOpacity>
                    )}

                    {/* Attached Reactions Badge at Bottom Left Corner */}
                    {renderReactionsRow(item, false)}
                  </View>

                  <Text
                    style={[
                      styles.incomingTimeText,
                      Boolean(item.reactions && item.reactions.length > 0) &&
                        styles.incomingTimeWithReactions,
                    ]}
                  >
                    {timeStr}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      );
    },
    [messages, myLastReadAt, handleCardAction]
  );

  // Render Reactions Row attached to a bubble's corner
  const renderReactionsRow = (msg: ApiChatMessage, isMine: boolean) => {
    if (!msg.reactions || msg.reactions.length === 0) return null;
    return (
      <View
        style={[
          styles.reactionsAttachedBadge,
          isMine ? styles.reactionsAttachedRight : styles.reactionsAttachedLeft,
        ]}
      >
        {msg.reactions.map((r) => {
          const isUserReacted = msg.myReaction === r.emoji;
          return (
            <TouchableOpacity
              key={r.emoji}
              style={[
                styles.reactionPill,
                isUserReacted && styles.reactionPillActive,
              ]}
              onPress={() => handleToggleReactionChip(msg, r.emoji)}
              activeOpacity={0.7}
            >
              <Text style={styles.reactionEmoji}>{r.emoji}</Text>
              {r.count > 1 && (
                <Text
                  style={[
                    styles.reactionCount,
                    isUserReacted && styles.reactionCountActive,
                  ]}
                >
                  {r.count}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // Render Shared Card for Task, Event, or List
  const renderSharedCard = (msg: ApiChatMessage, _isMine: boolean) => {
    const card = msg.card;
    if (!card || !card.available) {
      return (
        <View style={styles.sharedCardUnavailable}>
          <Text style={styles.sharedCardUnavailableText}>
            This shared item is no longer available.
          </Text>
        </View>
      );
    }

    if (card.type === 'EVENT' && card.event) {
      const ev = card.event;
      return (
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
          <Text style={styles.sharedItemTitle}>{ev.title}</Text>
          <Text style={styles.sharedItemSubtitle}>
            {ev.startsOn} {ev.startTime ? `· ${ev.startTime}` : '· All day'}
            {ev.location ? ` · ${ev.location}` : ''}
          </Text>
          <TouchableOpacity
            style={styles.sharedEventBtn}
            onPress={() => handleCardAction(msg)}
            activeOpacity={0.7}
          >
            <Feather
              name={ev.onMyCalendar ? 'check' : 'plus'}
              size={14}
              color={Colors.white}
              style={styles.sharedEventBtnIcon}
            />
            <Text style={styles.sharedEventBtnText}>
              {ev.onMyCalendar ? 'On my calendar' : 'Add to my calendar'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (card.type === 'TASK' && card.task) {
      const task = card.task;
      return (
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
            {task.overdue && (
              <View style={styles.overdueBadge}>
                <Text style={styles.overdueBadgeText}>Overdue</Text>
              </View>
            )}
          </View>
          <Text style={styles.sharedItemTitle}>{task.title}</Text>
          <Text style={styles.sharedItemSubtitle}>
            {task.dueOn ? `Due ${task.dueOn}` : 'No due date'}
            {task.assignees && task.assignees.length > 0
              ? ` · ${task.assignees.map((a: any) => a.fullName).join(', ')}`
              : ''}
          </Text>
          <TouchableOpacity
            style={[
              styles.markDoneBtn,
              task.done && styles.markDoneBtnCompleted,
            ]}
            onPress={() => handleCardAction(msg)}
            activeOpacity={0.7}
          >
            <Feather
              name="check"
              size={14}
              color={Colors.white}
              style={styles.markDoneIcon}
            />
            <Text style={styles.markDoneBtnText}>
              {task.done ? 'Done' : 'Mark done'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (card.type === 'LIST' && card.list) {
      const lst = card.list;
      const progressPercent =
        lst.totalCount > 0 ? (lst.doneCount / lst.totalCount) * 100 : 0;
      return (
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
          <Text style={styles.sharedItemTitle}>{lst.name}</Text>
          <Text style={styles.sharedItemSubtitle}>
            {lst.doneCount} of {lst.totalCount} items completed
          </Text>
          <View style={styles.listProgressTrack}>
            <View
              style={[styles.listProgressFill, { width: `${progressPercent}%` }]}
            />
          </View>
          <TouchableOpacity
            style={styles.openListBtn}
            onPress={() => handleCardAction(msg)}
            activeOpacity={0.7}
          >
            <Text style={styles.openListBtnText}>Open list</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0}
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
              <Feather name="chevron-left" size={20} color={Colors.white} />
            </TouchableOpacity>

            <View style={styles.headerTitleGroup}>
              <Text style={styles.headerTitle}>{headerTitle}</Text>
              <Text style={styles.headerSubtitle}>{memberCountText}</Text>
            </View>

            <TouchableOpacity
              style={styles.circleButton}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Options"
              onPress={() => setIsMenuOpen((prev) => !prev)}
            >
              <Feather name="more-horizontal" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {/* Dropdown Options Menu */}
          <AppOptionsMenu
            visible={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            topOffset={insets.top + 58}
            items={[
              {
                id: 'share-item',
                label: 'Share Task or Event',
                iconName: 'plus-circle',
                onPress: () => setShowShareModal(true),
              },
              {
                id: 'quick-messages',
                label: 'Quick Messages',
                iconName: 'message-circle',
                onPress: () => setShowQuickMessages(true),
              },
              {
                id: 'vault',
                label: 'Family Vault',
                iconName: 'folder',
                onPress: () => {
                  if (onOpenVault) onOpenVault();
                  else Alert.alert('Vault', 'Opening Family Vault...');
                },
              },
            ]}
          />

          {/* Main Message Stream or Empty State */}
          {messagesLoading && messages.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading messages...</Text>
            </View>
          ) : messages.length === 0 ? (
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
                  Everyone in your family sees{'\n'}messages here. You can share tasks,
                  events{'\n'}and lists too.
                </Text>

                {/* Structured Prompt suggestion chips */}
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
            /* Populated Inverted Message Stream */
            <FlatList
              ref={flatListRef}
              data={messages}
              extraData={messages}
              inverted
              keyExtractor={(item) => item.clientId || item.id}
              renderItem={renderMessageItem}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.2}
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={
                pagination?.loadingMore ? (
                  <View style={styles.loadMoreFooter}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                  </View>
                ) : undefined
              }
            />
          )}

          {/* Replying-To Bar Preview */}
          {replyingTo && (
            <View style={styles.replyBanner}>
              <View style={styles.replyBannerContent}>
                <Feather
                  name="corner-up-left"
                  size={14}
                  color={Colors.primary}
                  style={styles.replyBannerIcon}
                />
                <View style={styles.replyBannerTextGroup}>
                  <Text style={styles.replyBannerSender}>
                    Replying to {replyingTo.sender?.fullName || 'Member'}
                  </Text>
                  <Text style={styles.replyBannerSnippet} numberOfLines={1}>
                    {replyingTo.text || (replyingTo.kind === 'PHOTO' ? '📷 Photo' : 'Shared Item')}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setReplyingTo(null)}
                style={styles.replyBannerCloseBtn}
              >
                <Feather name="x" size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
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
                placeholderTextColor="#8A97AB"
                onSubmitEditing={() => handleSendMessage()}
              />
              <TouchableOpacity
                style={styles.cameraIconBtn}
                onPress={() => setShowImagePicker(true)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Choose photo"
              >
                <Feather name="camera" size={20} color="#8A97AB" />
              </TouchableOpacity>
            </View>

            {/* Mic / Quick Messages / Send Button */}
            {inputText.trim().length > 0 ? (
              <TouchableOpacity
                style={styles.micButton}
                onPress={() => handleSendMessage()}
                activeOpacity={0.85}
              >
                <Feather name="send" size={20} color={Colors.white} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.micButton}
                onPress={() => setShowQuickMessages(true)}
                activeOpacity={0.85}
              >
                <Feather name="message-circle" size={20} color={Colors.white} />
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
            customMessages={quickMessagesList}
            onSelectQuickMessage={(text) => handleSendMessage(text)}
            onSaveQuickMessages={(newMsgs) => {
              dispatch(updateQuickMessages(newMsgs));
            }}
          />

          <SmartReactionsModal
            visible={!!selectedMessageForReactions}
            message={selectedMessageForReactions || undefined}
            onClose={() => setSelectedMessageForReactions(null)}
            onSelectReaction={handleSelectReaction}
            onSelectQuickReply={(reply) => handleSendMessage(reply)}
            onReply={(msg) => {
              setReplyingTo(msg);
            }}
          />

          {/* Full Screen Image Viewer Modal */}
          {activePhotoViewer && (
            <ImageViewerModal
              visible={!!activePhotoViewer}
              onClose={() => setActivePhotoViewer(null)}
              imageUrl={activePhotoViewer.url}
              caption={activePhotoViewer.caption}
              senderName={activePhotoViewer.senderName}
              timestamp={activePhotoViewer.timestamp}
              messageId={activePhotoViewer.messageId}
              onSaveToVault={() => {
                if (activePhotoViewer.messageId) {
                  handleSavePhotoToVault(activePhotoViewer.messageId);
                }
              }}
            />
          )}

          {/* Image Picker Bottom Sheet */}
          <AppImagePickerBottomSheet
            visible={showImagePicker}
            title="Send Photo"
            subtitle="Take a photo or choose from gallery to share in chat"
            onSelectImage={handleSelectPhoto}
            onClose={() => setShowImagePicker(false)}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    width: '100%',
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
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3A4556',
  },
  headerTitleGroup: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#8A97AB',
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    marginTop: 12,
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
    fontFamily: 'Roboto-Bold',
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
    fontFamily: 'Roboto-Medium',
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
  loadMoreFooter: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateSeparatorRow: {
    alignItems: 'center',
    marginVertical: 12,
  },
  dateSeparatorPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateSeparatorText: {
    fontSize: 11,
    fontFamily: 'Roboto-Medium',
    color: '#8A97AB',
  },
  newMessagesDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  newMessagesLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.primary,
  },
  newMessagesPill: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginHorizontal: 8,
  },
  newMessagesText: {
    fontSize: 11,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
  },
  outgoingMessageContainer: {
    alignItems: 'flex-end',
  },
  outgoingBubble: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    maxWidth: '80%',
  },
  outgoingText: {
    color: Colors.white,
    fontSize: 15,
    fontFamily: 'Roboto-Medium',
    lineHeight: 20,
  },
  outgoingMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginRight: 2,
  },
  metaTimeText: {
    fontSize: 12,
    color: '#8A97AB',
    marginRight: 4,
    fontFamily: 'Roboto-Regular',
  },
  checkIcon: {
    marginLeft: 2,
  },
  incomingMessageContainer: {
    alignItems: 'flex-start',
  },
  senderNameLabel: {
    fontSize: 13,
    fontFamily: 'Roboto-SemiBold',
    marginLeft: 46,
    marginBottom: 4,
  },
  incomingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginBottom: 18,
  },
  avatarInitial: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
  },
  incomingContentGroup: {
    flex: 1,
  },
  incomingBubble: {
    backgroundColor: '#162842',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  incomingText: {
    color: Colors.white,
    fontSize: 15,
    lineHeight: 20,
  },
  incomingTimeText: {
    fontSize: 12,
    color: '#8A97AB',
    marginTop: 6,
    marginLeft: 2,
    fontFamily: 'Roboto-Regular',
  },
  replyQuoteBoxOutgoing: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderLeftWidth: 3,
    borderLeftColor: Colors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 6,
    maxWidth: '80%',
  },
  replyQuoteBoxIncoming: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 6,
    maxWidth: '85%',
  },
  replyQuoteSender: {
    fontSize: 11,
    fontFamily: 'Roboto-Bold',
    color: Colors.primary,
    marginBottom: 2,
  },
  replyQuoteText: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: Colors.textSecondary,
  },
  imageAttachmentBox: {
    borderRadius: 18,
    overflow: 'hidden',
    maxWidth: 260,
    backgroundColor: '#131F33',
  },
  chatImage: {
    width: 240,
    height: 200,
    borderRadius: 16,
  },
  imageCaptionBar: {
    padding: 10,
    backgroundColor: '#131F33',
  },
  imageCaptionText: {
    color: Colors.white,
    fontSize: 13,
    fontFamily: 'Roboto-Regular',
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  reactionsLeft: {
    alignSelf: 'flex-start',
  },
  reactionsRight: {
    alignSelf: 'flex-end',
  },
  outgoingBubbleWrapper: {
    position: 'relative',
    alignSelf: 'flex-end',
  },
  incomingBubbleWrapper: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  reactionsAttachedBadge: {
    position: 'absolute',
    bottom: -11,
    flexDirection: 'row',
    gap: 4,
    zIndex: 10,
  },
  reactionsAttachedRight: {
    right: 8,
  },
  reactionsAttachedLeft: {
    left: 8,
  },
  metaRowWithReactions: {
    marginTop: 12,
  },
  incomingTimeWithReactions: {
    marginTop: 12,
  },
  reactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  reactionPillActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(240, 145, 58, 0.25)',
  },
  reactionEmoji: {
    fontSize: 13,
  },
  reactionCount: {
    fontSize: 11,
    fontFamily: 'Roboto-Bold',
    color: '#8A97AB',
    marginLeft: 3,
  },
  reactionCountActive: {
    color: Colors.primary,
  },
  sharedCardUnavailable: {
    backgroundColor: '#131F33',
    padding: 14,
    borderRadius: 16,
    maxWidth: 260,
  },
  sharedCardUnavailableText: {
    color: '#8A97AB',
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'italic',
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
    fontFamily: 'Roboto-Bold',
    color: Colors.accentBlue,
    letterSpacing: 0.8,
  },
  sharedTagList: {
    fontSize: 11,
    fontFamily: 'Roboto-Bold',
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
    fontFamily: 'Roboto-Bold',
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
    fontFamily: 'Roboto-Bold',
  },
  sharedItemTitle: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
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
    fontFamily: 'Roboto-SemiBold',
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
    fontFamily: 'Roboto-SemiBold',
  },
  markDoneBtn: {
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markDoneBtnCompleted: {
    backgroundColor: '#1FA066',
  },
  markDoneIcon: {
    marginRight: 6,
  },
  markDoneBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontFamily: 'Roboto-Bold',
  },
  replyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#162842',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#192E4A',
  },
  replyBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  replyBannerIcon: {
    marginRight: 8,
  },
  replyBannerTextGroup: {
    flex: 1,
  },
  replyBannerSender: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    color: Colors.primary,
  },
  replyBannerSnippet: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: Colors.textSecondary,
  },
  replyBannerCloseBtn: {
    padding: 6,
  },
  inputBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: '#192E4A',
    gap: 10,
  },
  plusButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3A4556',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputPill: {
    flex: 1,
    flexGrow: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3A4556',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  messageInput: {
    flex: 1,
    color: Colors.white,
    fontSize: 15,
    padding: 0,
  },
  cameraIconBtn: {
    padding: 4,
  },
  micButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatConversationModal;
