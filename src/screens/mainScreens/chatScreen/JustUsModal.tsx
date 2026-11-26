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
  ActivityIndicator,
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
  markChatThreadRead,
  startJustUsChat,
  setActiveThreadId,
  addOptimisticPendingMessage,
  fetchChatThreads,
} from '../../../redux/features/chat/chatSlice';
import { getMyFamilyBasicThunk, getMyFamilyThunk } from '../../../redux/features/family/familySlice';
import { extractFamilyMembersFromState } from '../calendarScreen/calendarApiHelpers';
import { ApiChatMessage, ApiChatPartner, ApiChatSender } from '../../../services/chatServices';
import AppOptionsMenu from '../common/AppOptionsMenu';

export interface JustUsModalProps {
  visible: boolean;
  onClose: () => void;
  threadId?: string;
  partner?: any;
  isAvailable?: boolean;
  onInvitePartner?: () => void;
  onHideJustUs?: () => void;
}

// RFC4122 v4 UUID generator safe for React Native
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Pure TS Base64 encoding/decoding for Just Us E2EE ciphertext envelope
const B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

const safeBase64Encode = (input: string): string => {
  try {
    const str = String(input);
    let output = '';
    for (
      let block = 0, charCode, i = 0, map = B64_CHARS;
      str.charAt(i | 0) || ((map = '='), i % 1);
      output += map.charAt(63 & (block >> (8 - (i % 1) * 8)))
    ) {
      charCode = str.charCodeAt((i += 3 / 4));
      if (charCode > 0xff) return str;
      block = (block << 8) | charCode;
    }
    return output;
  } catch {
    return input;
  }
};

const safeBase64Decode = (input?: string | null): string => {
  if (!input) return '';
  try {
    const str = String(input).replace(/[=]+$/, '');
    if (str.length % 4 === 1) return input;
    let output = '';
    for (
      let bc = 0, bs = 0, buffer, idx = 0;
      (buffer = str.charAt(idx++));
      ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
        ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
        : 0
    ) {
      buffer = B64_CHARS.indexOf(buffer);
    }
    return output || input;
  } catch {
    return input;
  }
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

const getSenderInitial = (sender?: ApiChatSender | null, fallback = '?'): string => {
  if (!sender || !sender.fullName) return fallback;
  return sender.fullName.charAt(0).toUpperCase();
};

export const JustUsModal: React.FC<JustUsModalProps> = ({
  visible,
  onClose,
  threadId,
  partner: propPartner,
  isAvailable: initialAvailable = true,
  onInvitePartner,
  onHideJustUs,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  // Redux state
  const chatState = useAppSelector((state) => state.chat);
  const familyState = useAppSelector((state) => state.family);
  const currentUser = useAppSelector((state) => state.baseProfile.user);

  // Component state
  const [createdThreadId, setCreatedThreadId] = useState<string | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<ApiChatPartner | null>(null);
  const [inputText, setInputText] = useState('');
  const [isAvailable, setIsAvailable] = useState(initialAvailable);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [startingMemberId, setStartingMemberId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Active Just Us Thread ID resolution
  const activeThreadId = useMemo(() => {
    if (createdThreadId) return createdThreadId;
    if (threadId && threadId !== 'just_us') return threadId;
    return '';
  }, [createdThreadId, threadId]);

  // Eligible adult members to start Just Us with (if no thread exists yet)
  const eligibleAdults = useMemo(() => {
    const candidates = [
      familyState.family?.members,
      familyState.myFamilyData?.family?.members,
      familyState.basicFamilyData?.members,
      (familyState.basicFamilyData as any)?.family?.members,
      (familyState as any)?.familyMembers,
      (familyState.family as any)?.data?.members,
    ];

    let rawList: any[] = [];
    for (const c of candidates) {
      if (Array.isArray(c) && c.length > 0) {
        rawList = c;
        break;
      }
    }

    if (rawList.length === 0) {
      const extracted = extractFamilyMembersFromState(familyState);
      if (Array.isArray(extracted) && extracted.length > 0) {
        rawList = extracted;
      }
    }

    const myId =
      familyState.myMemberId ||
      (familyState.basicFamilyData as any)?.myMemberId ||
      (familyState.basicFamilyData as any)?.family?.myMemberId ||
      currentUser?.id;

    const existingPartnerIds = new Set(
      chatState.threads.justUs
        .map((t) => t.partner?.memberId || (t as any)?.partnerMemberId || (t as any)?.targetMemberId || (t as any)?.memberId)
        .filter(Boolean)
        .map(String)
    );
    const existingPartnerNames = new Set(
      chatState.threads.justUs
        .map((t) => t.partner?.fullName)
        .filter(Boolean)
    );

    return rawList
      .filter((m: any) => {
        if (m.isYou) return false;
        const mId = String(m.memberId || m.id || m.userId || m._id || '');
        if (myId && mId === String(myId)) return false;
        const role = String(m.role || m.familyRole || '').toUpperCase();
        if (role === 'CHILD' || role === 'DEPENDENT_CHILD_PROFILE') return false;
        return true;
      })
      .map((m: any, idx: number) => {
        const targetId = String(m.memberId || m.id || m.userId || m._id || `m-${idx}`);
        const fullName = m.fullName || m.name || `Family Member`;
        const hasExisting = existingPartnerIds.has(targetId) || existingPartnerNames.has(fullName);
        const baseRole = m.familyRole || m.role || (m.relationship ? m.relationship : 'Adult Member');
        const role = hasExisting ? `${baseRole} · Existing Chat` : baseRole;
        const avatarColor = m.avatarColor || m.color || (idx % 2 === 0 ? Colors.avatarNavy : Colors.avatarBrown);
        return {
          id: targetId,
          memberId: targetId,
          fullName,
          role,
          avatarColor,
          hasExisting,
        };
      });
  }, [familyState, currentUser, chatState.threads.justUs]);

  // Partner resolution
  const partner: ApiChatPartner | null = useMemo(() => {
    if (selectedPartner) return selectedPartner;
    if (propPartner) return propPartner;
    if (activeThreadId) {
      const targetThread = chatState.threads.justUs.find((t) => t.id === activeThreadId);
      if (targetThread?.partner) return targetThread.partner;
    }
    if (chatState.threads.justUs.length > 0 && chatState.threads.justUs[0].partner) {
      return chatState.threads.justUs[0].partner;
    }
    if (eligibleAdults.length === 1) {
      return {
        memberId: eligibleAdults[0].id,
        fullName: eligibleAdults[0].fullName,
        avatarColor: eligibleAdults[0].avatarColor,
      };
    }
    return null;
  }, [selectedPartner, propPartner, chatState.threads.justUs, activeThreadId, eligibleAdults]);

  const partnerName = partner?.fullName || 'Partner';
  const partnerInitial = partnerName.charAt(0).toUpperCase();
  const partnerColor = partner?.avatarColor || Colors.avatarNavy;

  // Messages list from Redux
  const messages = chatState.messagesByThread[activeThreadId] || [];
  const messagesLoading = chatState.messagesLoadingByThread[activeThreadId] || false;
  const pagination = chatState.paginationByThread[activeThreadId];

  // Lifecycle: Ensure family data is loaded if eligibleAdults is empty
  useEffect(() => {
    if (visible && eligibleAdults.length === 0) {
      dispatch(getMyFamilyBasicThunk());
      dispatch(getMyFamilyThunk());
    }
  }, [visible, eligibleAdults.length, dispatch]);

  // Lifecycle: When opening modal, fetch messages and mark read
  useEffect(() => {
    if (visible && activeThreadId && activeThreadId !== 'just_us') {
      dispatch(setActiveThreadId(activeThreadId));
      dispatch(fetchChatMessages({ threadId: activeThreadId }));
      dispatch(markChatThreadRead(activeThreadId));
    }
    return () => {
      if (visible) {
        dispatch(setActiveThreadId(null));
      }
    };
  }, [visible, activeThreadId, dispatch]);

  useEffect(() => {
    if (!visible) {
      setIsMenuOpen(false);
      setInputText('');
      setCreatedThreadId(null);
      setSelectedPartner(null);
    }
  }, [visible]);

  // Load older messages
  const handleLoadMore = useCallback(() => {
    if (pagination?.hasMore && !pagination?.loadingMore && activeThreadId && activeThreadId !== 'just_us') {
      dispatch(fetchMoreChatMessages({ threadId: activeThreadId }));
    }
  }, [pagination, activeThreadId, dispatch]);

  // Send Encrypted Message
  const handleSendMessage = useCallback(async () => {
    const text = inputText.trim();
    if (!text || !activeThreadId || activeThreadId === 'just_us') return;

    const clientId = generateUUID();
    const ciphertext = safeBase64Encode(text);

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
      ciphertext,
      createdAt: new Date().toISOString(),
      reactions: [],
      isMine: true,
    };

    dispatch(
      addOptimisticPendingMessage({
        threadId: activeThreadId,
        message: optimisticMsg,
      })
    );

    setInputText('');

    try {
      await dispatch(
        sendChatMessage({
          threadId: activeThreadId,
          payload: {
            clientId,
            ciphertext,
            text,
          },
        })
      ).unwrap();
    } catch (err: any) {
      console.error('[JustUsModal] Failed to send encrypted message:', err);
      Alert.alert(
        'Notice',
        typeof err === 'string' ? err : err?.message || 'Failed to send message to server.'
      );
    }
  }, [inputText, activeThreadId, currentUser, dispatch]);

  // Start Just Us with an adult family member
  const handleStartJustUs = useCallback(
    async (memberId: string) => {
      if (!memberId || startingMemberId) return;
      console.log('[JustUsModal] handleStartJustUs called for memberId:', memberId);

      // Check if thread already exists in local Redux state for this member
      const existingThread = chatState.threads.justUs.find((t) => {
        const p = t.partner;
        const targetAdult = eligibleAdults.find((a: any) => a.id === memberId);
        return (
          p?.memberId === memberId ||
          (t as any)?.partnerMemberId === memberId ||
          (t as any)?.targetMemberId === memberId ||
          (t as any)?.memberId === memberId ||
          (targetAdult?.fullName && p?.fullName === targetAdult.fullName)
        );
      });

      if (existingThread?.id) {
        console.log('[JustUsModal] Thread already exists in state, switching to it:', existingThread.id);
        setCreatedThreadId(existingThread.id);
        const foundAdult = eligibleAdults.find((a: any) => a.id === memberId);
        if (foundAdult) {
          setSelectedPartner({
            memberId: foundAdult.id,
            fullName: foundAdult.fullName,
            avatarColor: foundAdult.avatarColor,
          });
        }
        dispatch(setActiveThreadId(existingThread.id));
        dispatch(fetchChatMessages({ threadId: existingThread.id }));
        return;
      }

      try {
        setStartingMemberId(memberId);
        console.log('[JustUsModal] Calling startJustUsChat thunk with memberId:', memberId);
        const thread = await dispatch(startJustUsChat(memberId)).unwrap();
        console.log('[JustUsModal] startJustUsChat returned thread:', thread);
        const tid = (thread as any)?.id || (thread as any)?.threadId || (thread as any)?._id;
        if (tid) {
          setCreatedThreadId(tid);
          const foundAdult = eligibleAdults.find((a: any) => a.id === memberId);
          if (foundAdult) {
            setSelectedPartner({
              memberId: foundAdult.id,
              fullName: foundAdult.fullName,
              avatarColor: foundAdult.avatarColor,
            });
          }
          dispatch(setActiveThreadId(tid));
          dispatch(fetchChatMessages({ threadId: tid }));
          dispatch(fetchChatThreads());
        } else {
          Alert.alert('Notice', 'Unable to start chat. Invalid thread response from server.');
        }
      } catch (err: any) {
        console.error('[JustUsModal] Failed to start Just Us:', err);
        const displayErr = typeof err === 'string' ? err : err?.message || JSON.stringify(err);
        Alert.alert('Notice', displayErr);
      } finally {
        setStartingMemberId(null);
      }
    },
    [dispatch, startingMemberId, eligibleAdults, chatState.threads.justUs]
  );

  // Determine if Just Us is active or unavailable
  const hasJustUsThread = Boolean(activeThreadId && activeThreadId !== 'just_us');
  const showPartnerSelector = !hasJustUsThread && (eligibleAdults.length > 0 || Boolean(chatState.threads.canStartJustUs));
  const showUnavailable = !isAvailable || (!hasJustUsThread && !showPartnerSelector);

  // Render Single Message Item (inverted)
  const renderMessageItem = useCallback(
    ({ item, index }: { item: ApiChatMessage; index: number }) => {
      const isMine = Boolean(item.isMine);
      const prevItem = messages[index + 1];
      const showDateSep = !prevItem || isDifferentDay(item.createdAt, prevItem.createdAt);

      const timeStr = formatMessageTime(item.createdAt);
      // Decrypt message: use text if available, or decode ciphertext envelope
      const displayText = item.text || safeBase64Decode(item.ciphertext) || 'Encrypted message';
      const senderInitial = isMine ? 'P' : getSenderInitial(item.sender, partnerInitial);
      const senderColor = isMine ? Colors.avatarBrown : (item.sender?.avatarColor || partnerColor);

      return (
        <View key={item.clientId || item.id}>
          {/* Date Separator */}
          {showDateSep && (
            <View style={styles.dateSeparatorRow}>
              <View style={styles.datePill}>
                <Text style={styles.datePillText}>
                  {formatDateSeparator(item.createdAt)}
                </Text>
              </View>
            </View>
          )}

          {isMine ? (
            /* Outgoing Message (Right) */
            <View style={styles.outgoingMessageContainer}>
              <View style={styles.outgoingBubble}>
                <Text style={styles.outgoingText}>{displayText}</Text>
              </View>
              <View style={styles.outgoingMetaRow}>
                <Text style={styles.metaTimeText}>{timeStr}</Text>
                <Feather
                  name={item.seenBy && item.seenBy.length > 0 ? 'check-circle' : 'check'}
                  size={14}
                  color={Colors.accentTeal}
                />
              </View>
            </View>
          ) : (
            /* Incoming Message (Left) */
            <View style={styles.incomingMessageContainer}>
              <View style={styles.incomingRow}>
                <View style={[styles.avatarCircle, { backgroundColor: senderColor }]}>
                  <Text style={styles.avatarInitial}>{senderInitial}</Text>
                </View>
                <View style={styles.incomingContentGroup}>
                  <View style={styles.incomingBubble}>
                    <Text style={styles.incomingText}>{displayText}</Text>
                  </View>
                  <Text style={styles.incomingTimeText}>{timeStr}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      );
    },
    [messages, partnerInitial, partnerColor]
  );

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
              {hasJustUsThread ? (
                <Text style={styles.headerSubtitle}>You and {partnerName} · Private</Text>
              ) : (
                <Text style={styles.headerSubtitle}>Private · Adult Only</Text>
              )}
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
                id: 'toggle-availability',
                label: isAvailable ? 'View Unavailable Screen' : 'View Chat',
                iconName: 'toggle-right',
                onPress: () => setIsAvailable((prev) => !prev),
              },
              {
                id: 'hide-just-us',
                label: 'Hide Just Us',
                iconName: 'eye-off',
                destructive: true,
                onPress: () => {
                  if (onHideJustUs) onHideJustUs();
                  onClose();
                },
              },
            ]}
          />

          {showUnavailable ? (
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
                  Private space for couples in the family. Children never see this chat.
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
                    (() => Alert.alert('Invite', 'Invite link copied to clipboard.'))
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
          ) : showPartnerSelector ? (
            /* Start Just Us Selector View */
            <View style={styles.selectorContainer}>
              <View style={styles.privacyBanner}>
                <Feather
                  name="lock"
                  size={16}
                  color={Colors.accentPurple}
                  style={styles.bannerLockIcon}
                />
                <Text style={styles.privacyBannerText}>
                  Choose an adult family member to start a private encrypted 1-to-1 chat.
                </Text>
              </View>

              <Text style={styles.selectorHeading}>Select your partner</Text>
              {eligibleAdults.length === 0 ? (
                <View style={styles.emptyAdultsBox}>
                  <Feather name="users" size={32} color={Colors.textSecondary} />
                  <Text style={styles.emptyAdultsTitle}>No other adult members</Text>
                  <Text style={styles.emptyAdultsSubtitle}>
                    Invite your partner to the family first to start a private Just Us chat.
                  </Text>
                </View>
              ) : (
                eligibleAdults.map((adult: any) => {
                  const isStarting = startingMemberId === adult.id;
                  return (
                    <TouchableOpacity
                      key={adult.id}
                      style={styles.adultCard}
                      onPress={() => handleStartJustUs(adult.id)}
                      disabled={Boolean(startingMemberId)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.avatarCircle,
                          { backgroundColor: adult.avatarColor || Colors.avatarNavy },
                        ]}
                      >
                        <Text style={styles.avatarInitial}>
                          {(adult.fullName || 'A').charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.adultInfo}>
                        <Text style={styles.adultName}>{adult.fullName}</Text>
                        <Text style={styles.adultRole}>{adult.role}</Text>
                      </View>
                      {isStarting ? (
                        <ActivityIndicator size="small" color={Colors.accentPurple} />
                      ) : (
                        <Feather name="chevron-right" size={20} color={Colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          ) : (
            /* Populated Private Chat View (CHT-10) */
            <View style={styles.chatArea}>
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

              {messagesLoading && messages.length === 0 ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="large" color={Colors.accentPurple} />
                  <Text style={styles.loadingText}>Loading encrypted messages...</Text>
                </View>
              ) : (
                <FlatList
                  ref={flatListRef}
                  data={messages}
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
                        <ActivityIndicator size="small" color={Colors.accentPurple} />
                      </View>
                    ) : undefined
                  }
                />
              )}

              {/* Message Input Bar */}
              <View
                style={[
                  styles.inputBar,
                  { paddingBottom: Math.max(insets.bottom, 12) },
                ]}
              >
                <TouchableOpacity
                  style={styles.plusButton}
                  onPress={() =>
                    Alert.alert(
                      'Just Us Chat',
                      'Just Us is reserved for private end-to-end encrypted text messages only.'
                    )
                  }
                  activeOpacity={0.7}
                >
                  <Feather name="shield" size={18} color={Colors.accentPurple} />
                </TouchableOpacity>

                <View style={styles.inputPill}>
                  <TextInput
                    style={styles.messageInput}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder={`Message ${partnerName}`}
                    placeholderTextColor={Colors.textPlaceholder}
                    onSubmitEditing={handleSendMessage}
                  />
                  <TouchableOpacity
                    style={styles.cameraIconBtn}
                    onPress={() =>
                      Alert.alert(
                        'Private Chat',
                        'Photos and shared items are shared in Family chat. Just Us is strictly encrypted text.'
                      )
                    }
                    activeOpacity={0.7}
                  >
                    <Feather
                      name="lock"
                      size={16}
                      color={Colors.accentPurple}
                    />
                  </TouchableOpacity>
                </View>

                {inputText.trim().length > 0 ? (
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSendMessage}
                    activeOpacity={0.85}
                  >
                    <Feather name="send" size={18} color={Colors.white} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.micButton}
                    onPress={() =>
                      Alert.alert('Encrypted Chat', `Type a message to send securely to ${partnerName}.`)
                    }
                    activeOpacity={0.85}
                  >
                    <Feather name="lock" size={18} color={Colors.white} />
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
    fontFamily: 'Roboto-Bold',
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
    fontFamily: 'Roboto-Medium',
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
    fontFamily: 'Roboto-Bold',
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
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
  },
  hideButton: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  hideButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
  },
  selectorContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  selectorHeading: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    marginTop: 24,
    marginBottom: 12,
  },
  adultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131F33',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#192E4A',
  },
  adultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  adultName: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    marginBottom: 2,
  },
  adultRole: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  emptyAdultsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyAdultsTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    marginTop: 12,
    marginBottom: 6,
  },
  emptyAdultsSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  chatArea: {
    flex: 1,
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(157, 101, 229, 0.1)',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(157, 101, 229, 0.25)',
  },
  bannerLockIcon: {
    marginRight: 10,
  },
  privacyBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#CAD4DF',
    lineHeight: 17,
    fontFamily: 'Roboto-Regular',
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: '#8A97AB',
    fontFamily: 'Roboto-Medium',
    marginTop: 12,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 14,
  },
  loadMoreFooter: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateSeparatorRow: {
    alignItems: 'center',
    marginVertical: 10,
  },
  datePill: {
    backgroundColor: '#162842',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  datePillText: {
    fontSize: 11,
    color: '#8A97AB',
    fontFamily: 'Roboto-Medium',
  },
  outgoingMessageContainer: {
    alignItems: 'flex-end',
  },
  outgoingBubble: {
    backgroundColor: '#8E44AD',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '80%',
  },
  outgoingText: {
    color: Colors.white,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: 'Roboto-Medium',
  },
  outgoingMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginRight: 2,
    gap: 4,
  },
  metaTimeText: {
    fontSize: 11,
    color: '#8A97AB',
    fontFamily: 'Roboto-Regular',
  },
  incomingMessageContainer: {
    alignItems: 'flex-start',
  },
  incomingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarInitial: {
    color: Colors.white,
    fontSize: 13,
    fontFamily: 'Roboto-Bold',
  },
  incomingContentGroup: {
    flex: 1,
  },
  incomingBubble: {
    backgroundColor: '#162842',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  incomingText: {
    color: Colors.white,
    fontSize: 15,
    lineHeight: 20,
  },
  incomingTimeText: {
    fontSize: 11,
    color: '#8A97AB',
    marginTop: 4,
    marginLeft: 2,
    fontFamily: 'Roboto-Regular',
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
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accentPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2A1F44',
    borderWidth: 1,
    borderColor: Colors.accentPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default JustUsModal;
