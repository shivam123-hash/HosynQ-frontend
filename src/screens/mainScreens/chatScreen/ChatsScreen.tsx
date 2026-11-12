import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../../../units/Colors';
import AppTopBar from '../../../components/AppTopBar';
import { ChatConversationModal } from './ChatConversationModal';
import { JustUsModal } from './JustUsModal';
import { ChatThreadItem, SharedSummaryItem } from './types';

export interface ChatsScreenProps {
  onProfilePress?: () => void;
  onNotificationsPress?: () => void;
  onExplorePress?: () => void;
  onOpenVault?: () => void;
}

const DEFAULT_THREADS: ChatThreadItem[] = [
  {
    id: 'family',
    title: 'Family chat',
    subtitle: 'Anaya: Can someone pick me up after badminton?',
    timeText: '2:40 PM',
    unreadCount: 2,
    iconType: 'users',
    avatarColor: 'rgba(58, 142, 240, 0.2)',
  },
  {
    id: 'just_us',
    title: 'Just Us',
    subtitle: 'Rohan: Booked the table for Saturday',
    timeText: '1:05 PM',
    unreadCount: 1,
    isPrivate: true,
    iconType: 'lock',
    avatarColor: 'rgba(157, 101, 229, 0.2)',
  },
];

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
  onOpenVault,
}) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFamilyChat, setShowFamilyChat] = useState(false);
  const [showJustUs, setShowJustUs] = useState(false);

  const filteredThreads = DEFAULT_THREADS.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredShared = DEFAULT_SHARED_ITEMS.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Bar */}
      <AppTopBar
        onAvatarPress={onProfilePress}
        onExplorePress={onExplorePress}
        onNotificationsPress={onNotificationsPress}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.screenTitle}>Chats</Text>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Feather
            name="search"
            size={18}
            color={Colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search messages"
            placeholderTextColor={Colors.textPlaceholder}
          />
        </View>

        {/* Chat Threads Card Container */}
        <View style={styles.threadsCard}>
          {filteredThreads.map((thread, index) => {
            const isJustUs = thread.id === 'just_us';
            return (
              <View key={thread.id}>
                {index > 0 && <View style={styles.divider} />}
                <TouchableOpacity
                  style={styles.threadItem}
                  onPress={() => {
                    if (isJustUs) {
                      setShowJustUs(true);
                    } else {
                      setShowFamilyChat(true);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  {/* Left Avatar Icon */}
                  <View
                    style={[
                      styles.avatarBox,
                      { backgroundColor: thread.avatarColor },
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
          })}
        </View>

        {/* Privacy Note */}
        <View style={styles.privacyNoteRow}>
          <Feather
            name="lock"
            size={14}
            color={Colors.textSecondary}
            style={styles.privacyLockIcon}
          />
          <Text style={styles.privacyNoteText}>
            Just Us is only for you and Rohan. Children can’t see it, and it never
            shows in Pulse.
          </Text>
        </View>

        {/* Section Header: Shared in Family chat */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Shared in Family chat</Text>
          <TouchableOpacity activeOpacity={0.7}>
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
                onPress={() => setShowFamilyChat(true)}
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
        onClose={() => setShowFamilyChat(false)}
        title="Family chat"
        memberCountText="5 members"
        onOpenVault={onOpenVault}
      />

      {/* Just Us Modal (CHT-10, CHT-11) */}
      <JustUsModal
        visible={showJustUs}
        onClose={() => setShowJustUs(false)}
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
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.4,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: Colors.white,
    fontSize: 15,
  },
  threadsCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 12,
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
  threadTextGroup: {
    flex: 1,
    marginRight: 8,
  },
  threadTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  threadTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    marginRight: 8,
  },
  privatePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.accentPurple,
  },
  privatePillText: {
    color: Colors.accentPurple,
    fontSize: 11,
    fontWeight: '600',
  },
  threadSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  threadMetaGroup: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  threadTimeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderSubtle,
  },
  privacyNoteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 4,
    marginBottom: 28,
  },
  privacyLockIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  privacyNoteText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  seeAllText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  sharedItemsCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  sharedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  sharedIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  sharedTextGroup: {
    flex: 1,
    marginRight: 8,
  },
  sharedItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 2,
  },
  sharedItemSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});

export default ChatsScreen;
