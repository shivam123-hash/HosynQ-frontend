import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Colors from '../../../units/Colors';
import { AppreciationItem } from './types';

export interface AppreciationWallModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenWrite?: () => void;
  onOpenReactionPack?: (item: AppreciationItem) => void;
  items?: AppreciationItem[];
}

const DEFAULT_ITEMS: AppreciationItem[] = [
  {
    id: 'appr-1',
    senderId: 'rohan',
    senderName: 'Rohan',
    senderInitial: 'R',
    senderColor: Colors.avatarNavy,
    senderTextColor: Colors.accentBlueSoft,
    receiverId: 'dadi',
    receiverName: 'Dadi',
    receiverInitial: 'D',
    receiverColor: Colors.avatarGreen,
    receiverTextColor: Colors.accentGreenSoft,
    timeText: 'Yesterday',
    message: 'Thank you for making kheer for Aarav’s class party. Everyone loved it!',
    heartsCount: 4,
    starsCount: 2,
    userReacted: true,
  },
  {
    id: 'appr-2',
    senderId: 'anaya',
    senderName: 'Anaya',
    senderInitial: 'A',
    senderColor: Colors.avatarWine,
    senderTextColor: Colors.accentPink,
    receiverId: 'you',
    receiverName: 'you',
    receiverInitial: 'P',
    receiverColor: Colors.avatarBrown,
    receiverTextColor: Colors.primarySubtle,
    timeText: 'Mon',
    message: 'Thanks Mumma for staying up to help with my science project.',
    heartsCount: 3,
    starsCount: 0,
    userReacted: false,
  },
  {
    id: 'appr-3',
    senderId: 'you',
    senderName: 'You',
    senderInitial: 'P',
    senderColor: Colors.avatarBrown,
    senderTextColor: Colors.primarySubtle,
    receiverId: 'aarav',
    receiverName: 'Aarav',
    receiverInitial: 'Aa',
    receiverColor: Colors.avatarOlive,
    receiverTextColor: Colors.accentYellow,
    timeText: 'Sun',
    message: 'So proud of you for reading to Dadi every night this week.',
    heartsCount: 2,
    starsCount: 4,
    userReacted: false,
  },
];

type FilterType = 'All' | 'For me' | 'From me';

export const AppreciationWallModal: React.FC<AppreciationWallModalProps> = ({
  visible,
  onClose,
  onOpenWrite,
  onOpenReactionPack,
  items = DEFAULT_ITEMS,
}) => {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [localItems, setLocalItems] = useState<AppreciationItem[]>(items);

  const filteredItems = localItems.filter((item) => {
    if (activeFilter === 'For me') {
      return item.receiverId === 'you' || item.receiverName.toLowerCase() === 'you';
    }
    if (activeFilter === 'From me') {
      return item.senderId === 'you' || item.senderName.toLowerCase() === 'you';
    }
    return true;
  });

  const handleToggleReaction = (itemId: string, type: 'heart' | 'star') => {
    setLocalItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        if (type === 'heart') {
          return {
            ...item,
            heartsCount: item.userReacted ? item.heartsCount - 1 : item.heartsCount + 1,
            userReacted: !item.userReacted,
          };
        }
        return {
          ...item,
          starsCount: item.starsCount + 1,
        };
      })
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Feather name="chevron-left" size={22} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Appreciation wall</Text>
        </View>

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          {(['All', 'For me', 'From me'] as FilterType[]).map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  isActive ? styles.filterChipActive : styles.filterChipInactive,
                ]}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive ? styles.filterChipTextActive : styles.filterChipTextInactive,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* List of cards */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 90 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {filteredItems.map((item) => (
            <View key={item.id} style={styles.card}>
              {/* Card Header Row */}
              <View style={styles.cardHeaderRow}>
                <View style={styles.actorsRow}>
                  {/* Sender Avatar */}
                  <View
                    style={[
                      styles.avatarCircle,
                      { backgroundColor: item.senderColor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.avatarInitial,
                        item.senderTextColor ? { color: item.senderTextColor } : null,
                      ]}
                    >
                      {item.senderInitial}
                    </Text>
                  </View>

                  <Feather
                    name="chevron-right"
                    size={14}
                    color={Colors.textSecondary}
                    style={styles.actorChevron}
                  />

                  {/* Receiver Avatar */}
                  <View
                    style={[
                      styles.avatarCircle,
                      { backgroundColor: item.receiverColor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.avatarInitial,
                        item.receiverTextColor ? { color: item.receiverTextColor } : null,
                      ]}
                    >
                      {item.receiverInitial}
                    </Text>
                  </View>

                  {/* Header Title Text */}
                  <Text style={styles.cardActorTitle} numberOfLines={1}>
                    <Text style={styles.actorNameBold}>{item.senderName}</Text>
                    <Text style={styles.thankedText}> thanked </Text>
                    <Text style={styles.actorNameBold}>{item.receiverName}</Text>
                  </Text>
                </View>

                {/* Time */}
                <Text style={styles.timeText}>{item.timeText}</Text>
              </View>

              {/* Message Body */}
              <Text style={styles.messageText}>{item.message}</Text>

              {/* Reactions Row */}
              <View style={styles.reactionsRow}>
                {item.id === 'appr-3' ? (
                  <>
                    {item.starsCount > 0 && (
                      <TouchableOpacity
                        style={styles.reactionPill}
                        onPress={() => handleToggleReaction(item.id, 'star')}
                        activeOpacity={0.7}
                      >
                        <Feather
                          name="star"
                          size={13}
                          color={Colors.textSecondary}
                        />
                        <Text style={styles.reactionCountText}>
                          {item.starsCount}
                        </Text>
                      </TouchableOpacity>
                    )}
                    {item.heartsCount > 0 && (
                      <TouchableOpacity
                        style={[
                          styles.reactionPill,
                          item.userReacted && styles.reactionPillActive,
                        ]}
                        onPress={() => handleToggleReaction(item.id, 'heart')}
                        activeOpacity={0.7}
                      >
                        <Feather
                          name="heart"
                          size={13}
                          color={
                            item.userReacted
                              ? Colors.primary
                              : Colors.textSecondary
                          }
                        />
                        <Text
                          style={[
                            styles.reactionCountText,
                            item.userReacted && styles.reactionCountTextActive,
                          ]}
                        >
                          {item.heartsCount}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <>
                    {item.heartsCount > 0 && (
                      <TouchableOpacity
                        style={[
                          styles.reactionPill,
                          item.userReacted && styles.reactionPillActive,
                        ]}
                        onPress={() => handleToggleReaction(item.id, 'heart')}
                        activeOpacity={0.7}
                      >
                        <Feather
                          name="heart"
                          size={13}
                          color={
                            item.userReacted
                              ? Colors.primary
                              : Colors.textSecondary
                          }
                        />
                        <Text
                          style={[
                            styles.reactionCountText,
                            item.userReacted && styles.reactionCountTextActive,
                          ]}
                        >
                          {item.heartsCount}
                        </Text>
                      </TouchableOpacity>
                    )}
                    {item.starsCount > 0 && (
                      <TouchableOpacity
                        style={styles.reactionPill}
                        onPress={() => handleToggleReaction(item.id, 'star')}
                        activeOpacity={0.7}
                      >
                        <Feather
                          name="star"
                          size={13}
                          color={Colors.textSecondary}
                        />
                        <Text style={styles.reactionCountText}>
                          {item.starsCount}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}

                {/* Plus button */}
                <TouchableOpacity
                  style={styles.plusButton}
                  onPress={() => onOpenReactionPack && onOpenReactionPack(item)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Add reaction"
                >
                  <Feather name="plus" size={14} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Bottom CTA Button */}
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <TouchableOpacity
            style={styles.writeButton}
            onPress={onOpenWrite}
            activeOpacity={0.85}
          >
            <Feather
              name="heart"
              size={18}
              color={Colors.white}
              style={styles.writeButtonIcon}
            />
            <Text style={styles.writeButtonText}>Write an appreciation</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    position: 'relative',
    minHeight: 48,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3A4556',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  filterChipInactive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3A4556',
  },
  filterChipText: {
    fontSize: 14.5,
  },
  filterChipTextActive: {
    color: '#0B1A2F',
    fontWeight: '700',
  },
  filterChipTextInactive: {
    color: '#99A3B1',
    fontWeight: '500',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 14,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E314B',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  actorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  actorChevron: {
    marginHorizontal: 6,
  },
  cardActorTitle: {
    marginLeft: 8,
    color: Colors.white,
    fontSize: 15,
    flexShrink: 1,
  },
  actorNameBold: {
    fontWeight: '700',
    color: Colors.white,
  },
  thankedText: {
    fontWeight: '400',
    color: Colors.white,
  },
  timeText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  messageText: {
    color: '#C5D2E0',
    fontSize: 14.5,
    lineHeight: 21,
    marginBottom: 14,
  },
  reactionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#2D3E56',
    gap: 6,
  },
  reactionPillActive: {
    backgroundColor: 'rgba(240, 145, 58, 0.08)',
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  reactionCountText: {
    color: Colors.white,
    fontSize: 12.5,
    fontWeight: '600',
  },
  reactionCountTextActive: {
    color: Colors.primary,
    fontSize: 12.5,
    fontWeight: '700',
  },
  plusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#3A4B62',
    borderStyle: 'dashed',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: '#1A293E',
  },
  writeButton: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  writeButtonIcon: {
    marginRight: 8,
  },
  writeButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AppreciationWallModal;
