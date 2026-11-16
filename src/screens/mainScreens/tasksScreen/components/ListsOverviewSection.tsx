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
import { LIST_TYPE_CONFIG } from '../mockData';
import { TripData } from './tripPlanner';

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
              <Feather name="list" size={32} color="#F0913A" />
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
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => onCreateNewList()}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Create a list"
        >
          <Feather name="plus" size={20} color="#FFFFFF" style={styles.btnPlus} />
          <Text style={styles.createBtnText}>Create a list</Text>
        </TouchableOpacity>
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
          <Feather name="send" size={20} color="#2DD4BF" />
        </View>

        <View style={styles.vacationTextCol}>
          <Text style={styles.vacationEyebrow}>VACATION PLANNER</Text>
          <Text style={styles.vacationTitle}>{`${destinationCity} · ${shortDates}`}</Text>
          <Text style={styles.vacationSubtitle}>{tripSubtitle}</Text>
        </View>

        <Feather name="chevron-right" size={20} color="#2DD4BF" />
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
                    const bgColors = ['#78350F', '#1E3A8A', '#064E3B', '#581C87'];
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
            <Feather name="plus" size={24} color="#F0913A" />
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
    backgroundColor: '#0D2235',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#2DD4BF',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  airplaneCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#11424E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  vacationTextCol: {
    flex: 1,
  },
  vacationEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2DD4BF',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  vacationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  vacationSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8A97AB',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  listCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
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
    backgroundColor: 'transparent',
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
    borderColor: '#122440',
  },
  clusterInitial: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 10,
    lineHeight: 20,
  },
  listCardSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8A97AB',
    marginVertical: 6,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1A2C46',
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
    borderColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 145, 58, 0.04)',
  },
  dashedCenterCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#122440',
  },

  // Empty state styles
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  concentricOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(240, 145, 58, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  concentricMiddle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(240, 145, 58, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  concentricInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#172B47',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8A97AB',
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
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1F3352',
    backgroundColor: '#122440',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  dotOrange: {
    backgroundColor: '#F0913A',
  },
  dotTeal: {
    backgroundColor: '#2DD4BF',
  },
  dotBlue: {
    backgroundColor: '#60A5FA',
  },
  dotPurple: {
    backgroundColor: '#C084FC',
  },
  dotGreen: {
    backgroundColor: '#34D399',
  },
  clusterAvatarOverlap: {
    marginLeft: -6,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0913A',
    marginTop: 28,
  },
  btnPlus: {
    marginRight: 8,
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
