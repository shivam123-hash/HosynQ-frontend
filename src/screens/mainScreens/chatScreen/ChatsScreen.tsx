import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../../../units/Colors';
import AppTopBar from '../../../components/AppTopBar';
import { useAppDispatch, useAppSelector } from '../../../redux';
import {
  fetchChatThreads,
  fetchSharedSummary,
  setActiveThreadId,
  searchChatMessages,
} from '../../../redux/features/chat/chatSlice';
import { initChatSocketBridge } from '../../../redux/features/chat/chatSocketBridge';
import { ChatConversationModal } from './ChatConversationModal';
import { JustUsModal } from './JustUsModal';
import { ChatThreadItem, SharedSummaryItem } from './types';

export interface ChatsScreenProps {
  onProfilePress?: () => void;
  onNotificationsPress?: () => void;
  onExplorePress?: () => void;
  onCompassPress?: () => void;
  onOpenVault?: () => void;
  onNavigateToItem?: (type: 'TASK' | 'EVENT' | 'LIST', itemId: string, meta?: any) => void;
  autoOpenFamilyChat?: boolean;
  onFamilyChatOpened?: () => void;
}

// Helpers
const formatThreadTime = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const formatThreadSubtitle = (
  lastMessage: any,
  isJustUs: boolean = false
): string => {
  if (!lastMessage) return 'Say hello';

  if (isJustUs && lastMessage.ciphertext) {
    return 'Encrypted message';
  }

  const senderName = lastMessage.isMine
    ? 'You'
    : lastMessage.sender?.fullName || 'Member';

  if (lastMessage.kind === 'PHOTO') {
    return lastMessage.text ? `📷 ${lastMessage.text}` : '📷 Photo';
  }

  if (lastMessage.kind === 'ITEM') {
    const itemType = lastMessage.itemType || lastMessage.item?.type;
    if (itemType === 'TASK') return `${senderName}: Shared a task`;
    if (itemType === 'EVENT') return `${senderName}: Shared an event`;
    if (itemType === 'LIST') return `${senderName}: Shared a list`;
    return `${senderName}: Shared an item`;
  }

  if (lastMessage.text) {
    return `${senderName}: ${lastMessage.text}`;
  }

  return 'Say hello';
};

const DEFAULT_SHARED_ITEMS: SharedSummaryItem[] = [
  {
    id: 'sh-1',
    type: 'list',
    title: 'Diwali shopping',
    subtitle: 'List · 6 of 14 done · Shared by Dadi',
    iconName: 'list',
    iconBgColor: 'rgba(46, 196, 182, 0.15)',
    iconColor: Colors.accentTeal,
  },
  {
    id: 'sh-2',
    type: 'event',
    title: 'Aarav’s PTM',
    subtitle: 'Event · Fri, 6 Nov · Shared by you',
    iconName: 'calendar',
    iconBgColor: 'rgba(58, 142, 240, 0.15)',
    iconColor: Colors.accentBlue,
  },
];

export const ChatsScreen: React.FC<ChatsScreenProps> = ({
  onProfilePress,
  onNotificationsPress,
  onExplorePress,
  onCompassPress,
  onOpenVault,
  onNavigateToItem,
  autoOpenFamilyChat,
  onFamilyChatOpened,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  // Redux state
  const chatState = useAppSelector((state) => state.chat);
  const familyState = useAppSelector((state) => state.family);

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showFamilyChat, setShowFamilyChat] = useState(false);
  const [showJustUs, setShowJustUs] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState<string | undefined>(undefined);
  const [selectedJustUsPartner, setSelectedJustUsPartner] = useState<any>(null);

  // Initialize Socket.IO bridge and fetch initial chat threads
  useEffect(() => {
    initChatSocketBridge();
    dispatch(fetchChatThreads());
    dispatch(fetchSharedSummary());
  }, [dispatch]);

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchChatThreads()).unwrap().catch(() => {}),
        dispatch(fetchSharedSummary()).unwrap().catch(() => {}),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  // Handle Search submit / debounce
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const timer = setTimeout(() => {
        dispatch(searchChatMessages({ query: searchQuery.trim() }));
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, dispatch]);

  // Family details for member count
  const familyMembersCount = useMemo(() => {
    const list =
      familyState?.family?.members ||
      (familyState as any)?.familyMembers ||
      [];
    return list.length > 0 ? `${list.length} members` : 'Family chat';
  }, [familyState]);

  // Map Redux threads to UI list
  const threadsList: ChatThreadItem[] = useMemo(() => {
    const items: ChatThreadItem[] = [];

    // 1. Family Chat
    const fc = chatState.threads.familyChat;
    if (fc) {
      items.push({
        id: fc.id,
        kind: 'FAMILY',
        title: fc.title || 'Family chat',
        subtitle: formatThreadSubtitle(fc.lastMessage, false),
        timeText: formatThreadTime(fc.lastMessage?.createdAt || fc.lastReadAt),
        unreadCount: fc.unreadCount || 0,
        iconType: 'users',
        avatarColor: 'rgba(58, 142, 240, 0.2)',
      });
    } else {
      // Default placeholder while first fetch loads
      items.push({
        id: 'family',
        kind: 'FAMILY',
        title: 'Family chat',
        subtitle: 'Tap to chat with your family',
        timeText: '',
        unreadCount: 0,
        iconType: 'users',
        avatarColor: 'rgba(58, 142, 240, 0.2)',
      });
    }

    // 2. Just Us (Adults)
    const justUsList = chatState.threads.justUs;
    if (Array.isArray(justUsList) && justUsList.length > 0) {
      justUsList.forEach((ju) => {
        const partnerName = ju.partner?.fullName || 'Partner';
        items.push({
          id: ju.id,
          kind: 'JUST_US',
          title: `Just Us · ${partnerName}`,
          subtitle: formatThreadSubtitle(ju.lastMessage, true),
          timeText: formatThreadTime(ju.lastMessage?.createdAt || ju.lastReadAt),
          unreadCount: ju.unreadCount || 0,
          isPrivate: true,
          iconType: 'lock',
          avatarColor: 'rgba(157, 101, 229, 0.2)',
          partner: ju.partner,
        });
      });
    } else {
      items.push({
        id: 'just_us',
        kind: 'JUST_US',
        title: 'Just Us',
        subtitle: 'Tap to start private chat with partner',
        timeText: '',
        unreadCount: 0,
        isPrivate: true,
        iconType: 'lock',
        avatarColor: 'rgba(157, 101, 229, 0.2)',
      });
    }

    return items;
  }, [chatState.threads]);

  // Filtered threads by search
  const filteredThreads = useMemo(() => {
    if (!searchQuery.trim()) return threadsList;
    const q = searchQuery.toLowerCase().trim();
    return threadsList.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.subtitle.toLowerCase().includes(q)
    );
  }, [threadsList, searchQuery]);

  // Map Shared items from Redux sharedSummary
  const sharedItems: SharedSummaryItem[] = useMemo(() => {
    const summary = chatState.sharedSummary;
    if (!summary) return DEFAULT_SHARED_ITEMS;

    const list: SharedSummaryItem[] = [];

    if (Array.isArray(summary.lists) && summary.lists.length > 0) {
      const l = summary.lists[0];
      list.push({
        id: `sh-l-${l.id || 0}`,
        type: 'list',
        title: l.title || l.name || 'Shared list',
        subtitle: `List · ${l.doneCount || 0} of ${l.totalCount || l.itemsCount || 0} done`,
        iconName: 'list',
        iconBgColor: 'rgba(46, 196, 182, 0.15)',
        iconColor: Colors.accentTeal,
      });
    }

    if (Array.isArray(summary.events) && summary.events.length > 0) {
      const e = summary.events[0];
      list.push({
        id: `sh-e-${e.id || 0}`,
        type: 'event',
        title: e.title || 'Shared event',
        subtitle: `Event · ${e.date || 'Upcoming'}`,
        iconName: 'calendar',
        iconBgColor: 'rgba(58, 142, 240, 0.15)',
        iconColor: Colors.accentBlue,
      });
    }

    if (Array.isArray(summary.tasks) && summary.tasks.length > 0) {
      const t = summary.tasks[0];
      list.push({
        id: `sh-t-${t.id || 0}`,
        type: 'task',
        title: t.title || 'Shared task',
        subtitle: `Task · Due ${t.dueDate || 'Soon'}`,
        iconName: 'check-square',
        iconBgColor: 'rgba(16, 185, 129, 0.15)',
        iconColor: '#10B981',
      });
    }

    return list.length > 0 ? list : DEFAULT_SHARED_ITEMS;
  }, [chatState.sharedSummary]);

  const filteredShared = useMemo(() => {
    if (!searchQuery.trim()) return sharedItems;
    const q = searchQuery.toLowerCase().trim();
    return sharedItems.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.subtitle.toLowerCase().includes(q)
    );
  }, [sharedItems, searchQuery]);

  // Open Family Chat modal
  const handleOpenFamilyChat = useCallback(
    (threadId?: string) => {
      const realId = chatState.threads.familyChat?.id;
      const id = threadId && threadId !== 'family' ? threadId : realId || 'family';
      setSelectedThreadId(id);
      if (id !== 'family') {
        dispatch(setActiveThreadId(id));
      }
      setShowFamilyChat(true);
    },
    [dispatch, chatState.threads.familyChat]
  );

  // Auto-reopen Family Chat when returning from a shared item (Task, Event, List)
  useEffect(() => {
    if (autoOpenFamilyChat) {
      handleOpenFamilyChat();
      onFamilyChatOpened?.();
    }
  }, [autoOpenFamilyChat, handleOpenFamilyChat, onFamilyChatOpened]);

  // Open Just Us modal
  const handleOpenJustUs = useCallback(
    (threadItem: ChatThreadItem) => {
      const id = threadItem.id || 'just_us';
      setSelectedThreadId(id);
      setSelectedJustUsPartner(threadItem.partner || null);
      dispatch(setActiveThreadId(id));
      setShowJustUs(true);
    },
    [dispatch]
  );

  // Partner name for Just Us note
  const justUsPartnerName = useMemo(() => {
    const firstJu = chatState.threads.justUs?.[0];
    return firstJu?.partner?.fullName || 'your partner';
  }, [chatState.threads.justUs]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Bar */}
      <AppTopBar
        onAvatarPress={onProfilePress}
        onExplorePress={onExplorePress}
        onNotificationsPress={onNotificationsPress}
        onCompassPress={onCompassPress}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Title */}
        <Text style={styles.screenTitle}>Chats</Text>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Feather
            name="search"
            size={20}
            color="#8A97AB"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search messages"
            placeholderTextColor="#8A97AB"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="x" size={16} color="#8A97AB" />
            </TouchableOpacity>
          )}
        </View>

        {/* Chat Threads Card Container */}
        <View style={styles.threadsCard}>
          {chatState.threadsLoading && filteredThreads.length === 0 ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : (
            filteredThreads.map((thread, index) => {
              const isJustUs = thread.kind === 'JUST_US' || thread.id === 'just_us';
              return (
                <View key={thread.id}>
                  {index > 0 && <View style={styles.divider} />}
                  <TouchableOpacity
                    style={styles.threadItem}
                    onPress={() => {
                      if (isJustUs) {
                        handleOpenJustUs(thread);
                      } else {
                        handleOpenFamilyChat(thread.id);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    {/* Left Avatar Icon */}
                    <View
                      style={[
                        styles.avatarBox,
                        isJustUs
                          ? styles.avatarBoxJustUs
                          : styles.avatarBoxFamily,
                      ]}
                    >
                      <Feather
                        name={thread.iconType}
                        size={20}
                        color={
                          isJustUs ? Colors.accentPurple : Colors.accentBlue
                        }
                      />
                    </View>

                    {/* Thread Information */}
                    <View style={styles.threadTextGroup}>
                      <View style={styles.threadTitleRow}>
                        <Text style={styles.threadTitle}>{thread.title}</Text>
                        {thread.isPrivate && (
                          <View style={styles.privatePill}>
                            <Text style={styles.privatePillText}>Private</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.threadSubtitle} numberOfLines={1}>
                        {thread.subtitle}
                      </Text>
                    </View>

                    {/* Right Meta Column */}
                    <View style={styles.threadMetaGroup}>
                      <Text style={styles.threadTimeText}>{thread.timeText}</Text>
                      {thread.unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadBadgeText}>
                            {thread.unreadCount}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>

        {/* Privacy Note */}
        <View style={styles.privacyNoteRow}>
          <Feather
            name="lock"
            size={14}
            color="#8A97AB"
            style={styles.privacyLockIcon}
          />
          <Text style={styles.privacyNoteText}>
            Just Us is only for you and {justUsPartnerName}. Children can’t see it,
            and it never shows in Pulse.
          </Text>
        </View>

        {/* Section Header: Shared in Family chat */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Shared in Family chat</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleOpenFamilyChat()}
          >
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* Shared Items Card */}
        <View style={styles.sharedItemsCard}>
          {filteredShared.map((item, index) => (
            <View key={item.id}>
              {index > 0 && <View style={styles.divider} />}
              <TouchableOpacity
                style={styles.sharedItemRow}
                onPress={() => {
                  const type = item.type === 'task' ? 'TASK' : item.type === 'event' ? 'EVENT' : 'LIST';
                  if (onNavigateToItem) {
                    onNavigateToItem(type, item.id);
                  } else {
                    handleOpenFamilyChat();
                  }
                }}
                activeOpacity={0.7}
              >
                {/* Icon */}
                <View
                  style={[
                    styles.sharedIconBox,
                    { backgroundColor: item.iconBgColor },
                  ]}
                >
                  <Feather
                    name={item.iconName as any}
                    size={20}
                    color={item.iconColor}
                  />
                </View>

                {/* Text details */}
                <View style={styles.sharedTextGroup}>
                  <Text style={styles.sharedItemTitle}>{item.title}</Text>
                  <Text style={styles.sharedItemSubtitle}>{item.subtitle}</Text>
                </View>

                <Feather
                  name="chevron-right"
                  size={18}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Family Chat Modal (CHT-02, CHT-04, CHT-08, CHT-09) */}
      <ChatConversationModal
        visible={showFamilyChat}
        onClose={() => {
          setShowFamilyChat(false);
          dispatch(setActiveThreadId(null));
        }}
        threadId={selectedThreadId}
        title="Family chat"
        memberCountText={familyMembersCount}
        onOpenVault={onOpenVault}
        onNavigateToItem={(type, itemId, meta) => {
          setShowFamilyChat(false);
          dispatch(setActiveThreadId(null));
          onNavigateToItem?.(type, itemId, meta);
        }}
      />

      {/* Just Us Modal (CHT-10, CHT-11) */}
      <JustUsModal
        visible={showJustUs}
        onClose={() => {
          setShowJustUs(false);
          dispatch(setActiveThreadId(null));
        }}
        threadId={selectedThreadId}
        partner={selectedJustUsPartner}
        isAvailable={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  screenTitle: {
    fontSize: 32,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    letterSpacing: -0.4,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: Colors.white,
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    padding: 0,
  },
  threadsCard: {
    backgroundColor: '#131F33',
    borderRadius: 16,
    overflow: 'hidden',
  },
  loadingBox: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  threadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarBoxFamily: {
    backgroundColor: 'rgba(58, 142, 240, 0.15)',
  },
  avatarBoxJustUs: {
    backgroundColor: 'rgba(157, 101, 229, 0.15)',
  },
  threadTextGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  threadTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  threadTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    color: Colors.white,
  },
  privatePill: {
    backgroundColor: 'rgba(157, 101, 229, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  privatePillText: {
    fontSize: 11,
    fontFamily: 'Roboto-Medium',
    color: Colors.accentPurple,
  },
  threadSubtitle: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    color: Colors.textSecondary,
  },
  threadMetaGroup: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  threadTimeText: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: '#8A97AB',
    marginBottom: 6,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginLeft: 78,
  },
  privacyNoteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 14,
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  privacyLockIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  privacyNoteText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: '#8A97AB',
    lineHeight: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
    color: '#8A97AB',
    letterSpacing: 0.5,
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: Colors.primary,
  },
  sharedItemsCard: {
    backgroundColor: '#131F33',
    borderRadius: 16,
    overflow: 'hidden',
  },
  sharedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  sharedIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  sharedTextGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  sharedItemTitle: {
    fontSize: 15,
    fontFamily: 'Roboto-Medium',
    color: Colors.white,
    marginBottom: 2,
  },
  sharedItemSubtitle: {
    fontSize: 13,
    fontFamily: 'Roboto-Regular',
    color: '#8A97AB',
  },
});

export default ChatsScreen;
