import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import Ionicons from '@react-native-vector-icons/ionicons';
import { ListGroup, ListType } from '../types';
import { LIST_TYPE_CONFIG } from '../constants';
import { TripData } from './tripPlanner';
import CommonBtn from '../../../../components/CommonBtn';

import { Colors, Fonts, Typography } from '../../../../units';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const renderTypeIcon = (type: ListType, color: string) => {
  switch (type) {
    case 'grocery':
      return <Ionicons name="cart-outline" size={18} color={color} />;
    case 'packing':
      return <Ionicons name="bag-handle-outline" size={16} color={color} />;
    case 'school':
      return <Ionicons name="school-outline" size={16} color={color} />;
    case 'party':
      return <Ionicons name="sparkles-outline" size={16} color={color} />;
    case 'custom':
      return <Ionicons name="list-outline" size={18} color={color} />;
  }
};

export interface ListsOverviewSectionProps {
  lists: ListGroup[];
  tripData?: TripData;
  onSelectList: (list: ListGroup) => void;
  onCreateNewList: (prefillType?: ListType) => void;
  onOpenVacationPlanner?: () => void;
}

const ListsOverviewSection: React.FC<ListsOverviewSectionProps> = ({
  lists,
  tripData,
  onSelectList,
  onCreateNewList,
  onOpenVacationPlanner,
}) => {
  let completedSteps = 0;
  if (tripData?.step1Done) completedSteps += 1;
  if (tripData?.step2Done) completedSteps += 1;
  const destinationCity = tripData?.destination?.split(',')[0].trim() || 'Jaipur';
  const rawDates = tripData?.datesText || 'Fri 13 – Mon 16 Nov';
  const shortDates = rawDates
    .replace(/^[A-Za-z]{3}\s*/, '')
    .replace(/\s+[A-Za-z]{3}\s+/, ' ')
    .replace(/\s*–\s*/, '–');
  const tripSubtitle = completedSteps === 0
    ? 'Start with Step 1: Find common dates'
    : `${completedSteps} of 4 steps done`;

  // Empty State matching LST-02
  if (lists.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        {/* Concentric Circles Icon */}
        <View style={styles.concentricOuter}>
          <View style={styles.concentricMiddle}>
            <View style={styles.concentricInner}>
              <Feather name="list" size={32} color={Colors.primary} />
            </View>
          </View>
        </View>

        <Text style={styles.emptyTitle}>No lists yet</Text>
        <Text style={styles.emptySubtitle}>
          Make a shared list for groceries, packing, school or a party. Everyone
          sees what’s left in real time.
        </Text>

        {/* Suggestion Filter Pills */}
        <View style={styles.suggestionPillsRow}>
          <TouchableOpacity
            style={styles.suggestionPill}
            onPress={() => onCreateNewList('grocery')}
            activeOpacity={0.7}
          >
            <View style={[styles.dot, styles.dotOrange]} />
            <Text style={styles.suggestionText}>Grocery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.suggestionPill}
            onPress={() => onCreateNewList('packing')}
            activeOpacity={0.7}
          >
            <View style={[styles.dot, styles.dotTeal]} />
            <Text style={styles.suggestionText}>Packing</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.suggestionPill}
            onPress={() => onCreateNewList('school')}
            activeOpacity={0.7}
          >
            <View style={[styles.dot, styles.dotBlue]} />
            <Text style={styles.suggestionText}>School</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.suggestionPillsRow}>
          <TouchableOpacity
            style={styles.suggestionPill}
            onPress={() => onCreateNewList('party')}
            activeOpacity={0.7}
          >
            <View style={[styles.dot, styles.dotPurple]} />
            <Text style={styles.suggestionText}>Party</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.suggestionPill}
            onPress={() => onCreateNewList('custom')}
            activeOpacity={0.7}
          >
            <View style={[styles.dot, styles.dotGreen]} />
            <Text style={styles.suggestionText}>Custom</Text>
          </TouchableOpacity>
        </View>

        {/* Create List Button */}
        <CommonBtn
          title="Create a list"
          onPress={() => onCreateNewList()}
          backgroundColor={Colors.primary}
          height={52}
          borderRadius={26}
          marginTop={28}
          fontSize={16}
          leftComponent={
            <Feather name="plus" size={20} color={Colors.white} style={styles.btnPlus} />
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Featured Banner Card: Vacation Planner (LST-01) */}
      <TouchableOpacity
        style={styles.vacationBanner}
        onPress={onOpenVacationPlanner}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Vacation Planner: Jaipur, 13-16 Nov"
      >
        <View style={styles.airplaneCircle}>
          <Ionicons name="airplane-outline" size={24} color={Colors.background} />
        </View>

        <View style={styles.vacationTextCol}>
          <Text style={styles.vacationEyebrow}>VACATION PLANNER</Text>
          <Text style={styles.vacationTitle}>{`${destinationCity} · ${shortDates}`}</Text>
          <Text style={styles.vacationSubtitle}>{tripSubtitle}</Text>
        </View>

        <Feather name="chevron-right" size={20} color={Colors.accentTealMint} />
      </TouchableOpacity>

      {/* 2-Column Grid of Lists (LST-01) */}
      <View style={styles.gridContainer}>
        {lists.map((list) => {
          const config = LIST_TYPE_CONFIG[list.type] || LIST_TYPE_CONFIG.custom;
          const totalItems = list.items.length;
          const doneItems = list.items.filter((i) => i.isCompleted).length;
          const leftItems = totalItems - doneItems;
          const progressPercent =
            totalItems > 0 ? (doneItems / totalItems) * 100 : 0;

          return (
            <TouchableOpacity
              key={list.id}
              style={styles.listCard}
              onPress={() => onSelectList(list)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`${list.title}, ${leftItems} of ${totalItems} left`}
            >
              {/* Card Header Row: Icon & Avatars Cluster */}
              <View style={styles.cardHeaderRow}>
                <View style={[styles.typeIconCircle, { borderColor: config.color }]}>
                  {renderTypeIcon(list.type, config.color)}
                </View>

                {/* Avatar Cluster */}
                <View style={styles.avatarCluster}>
                  {list.sharedWith.slice(0, 3).map((name, idx) => {
                    const initial = name.slice(0, name === 'Aarav' ? 2 : 1);
                    const bgColors = [Colors.tripYellowBg, Colors.tripBlueBg, Colors.tripGreenBg, Colors.tripPurpleBg];
                    const bg = bgColors[idx % bgColors.length];
                    return (
                      <View
                        key={idx}
                        style={[
                          styles.clusterAvatar,
                          idx > 0 && styles.clusterAvatarOverlap,
                          { backgroundColor: bg },
                        ]}
                      >
                        <Text style={styles.clusterInitial}>{initial}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Title */}
              <Text style={styles.listCardTitle} numberOfLines={2}>
                {list.title}
              </Text>

              {/* Left count subtitle */}
              <Text style={styles.listCardSubtitle}>
                {leftItems === 0
                  ? 'All done'
                  : `${leftItems} of ${totalItems} left`}
              </Text>

              {/* Progress Bar */}
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(Math.max(progressPercent, 6), 100)}%`,
                      backgroundColor: config.color,
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Dashed "+ New List" Card */}
        <TouchableOpacity
          style={styles.dashedCard}
          onPress={() => onCreateNewList()}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Add new list"
        >
          <View style={styles.dashedCenterCircle}>
            <Feather name="plus" size={24} color={Colors.primary} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ListsOverviewSection;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  vacationBanner: {
    backgroundColor: Colors.tripBannerBg,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.accentTealMint,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  airplaneCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accentTealMint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  vacationTextCol: {
    flex: 1,
  },
  vacationEyebrow: {
    fontSize: Typography.size.captionSmall,
    fontFamily: Fonts.bold,
    color: Colors.accentTealMint,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  vacationTitle: {
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginBottom: 3,
  },
  vacationSubtitle: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.medium,
    color: Colors.textSecondaryMuted,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  listCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    backgroundColor: Colors.transparent,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    padding: 14,
    minHeight: 156,
    justifyContent: 'space-between',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.transparent,
  },
  avatarCluster: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clusterAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.cardBackground,
  },
  clusterInitial: {
    fontSize: Typography.size.micro,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  listCardTitle: {
    fontSize: Typography.size.bodyMedium,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginTop: 10,
    lineHeight: 20,
  },
  listCardSubtitle: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.medium,
    color: Colors.textSecondaryMuted,
    marginVertical: 6,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.surfaceNavyAlt,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  dashedCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    minHeight: 156,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.tasksDashedCardBg,
  },
  dashedCenterCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.transparent,
  },

  // Empty state styles
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  concentricOuter: {
    width: 120,
    height: 120,
    borderRadius: 70,
    backgroundColor: Colors.tasksOrangeTintSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  concentricMiddle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: Colors.tasksOrangeTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  concentricInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.tasksCardDivider,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: Typography.size.titleLarge,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: Typography.size.body,
    color: Colors.textSecondaryMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 320,
  },
  suggestionPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  suggestionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.borderMutedAlt,
    backgroundColor: Colors.transparent,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  dotOrange: {
    backgroundColor: Colors.primary,
  },
  dotTeal: {
    backgroundColor: Colors.accentTealMint,
  },
  dotBlue: {
    backgroundColor: Colors.tripBlueAccent,
  },
  dotPurple: {
    backgroundColor: Colors.tripPurpleAccent,
  },
  dotGreen: {
    backgroundColor: Colors.tripGreenMint,
  },
  clusterAvatarOverlap: {
    marginLeft: -6,
  },
  suggestionText: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Fonts.semiBold,
    color: Colors.textLightMutedAlt,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    marginTop: 28,
  },
  btnPlus: {
    marginRight: 8,
  },
  createBtnText: {
    fontSize: Typography.size.subtitle,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
});
