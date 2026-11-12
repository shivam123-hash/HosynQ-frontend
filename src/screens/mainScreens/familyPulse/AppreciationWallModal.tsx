import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
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
    receiverId: 'dadi',
    receiverName: 'Dadi',
    receiverInitial: 'D',
    receiverColor: Colors.avatarGreen,
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
    receiverId: 'you',
    receiverName: 'you',
    receiverInitial: 'P',
    receiverColor: Colors.avatarBrown,
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
    receiverId: 'aarav',
    receiverName: 'Aarav',
    receiverInitial: 'Aa',
    receiverColor: Colors.avatarOlive,
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Feather name="chevron-left" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Appreciation wall</Text>
          <View style={styles.headerRightSpacer} />
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
                    <Text style={styles.avatarInitial}>{item.senderInitial}</Text>
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
                    <Text style={styles.avatarInitial}>{item.receiverInitial}</Text>
                  </View>

                  {/* Header Title Text */}
                  <Text style={styles.cardActorTitle} numberOfLines={1}>
                    {item.senderName} thanked {item.receiverName}
                  </Text>
                </View>

                {/* Time */}
                <Text style={styles.timeText}>{item.timeText}</Text>
              </View>

              {/* Message Body */}
              <Text style={styles.messageText}>{item.message}</Text>

              {/* Reactions Row */}
              <View style={styles.reactionsRow}>
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
                      size={14}
                      color={item.userReacted ? Colors.primary : Colors.textSecondary}
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
                    <Feather name="star" size={14} color={Colors.textSecondary} />
                    <Text style={styles.reactionCountText}>{item.starsCount}</Text>
                  </TouchableOpacity>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
  },
  headerRightSpacer: {
    width: 44,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterChipInactive: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: Colors.black,
  },
  filterChipTextInactive: {
    color: Colors.textSecondary,
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
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
  },
  timeText: {
    color: Colors.textMutedSoft,
    fontSize: 13,
    fontWeight: '500',
  },
  messageText: {
    color: Colors.textNearWhite,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  reactionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  reactionPillActive: {
    borderColor: Colors.primary,
  },
  reactionCountText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  reactionCountTextActive: {
    color: Colors.primary,
  },
  plusButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
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
    borderTopColor: Colors.borderSubtle,
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
    fontSize: 15,
    fontWeight: '700',
  },
});

export default AppreciationWallModal;
