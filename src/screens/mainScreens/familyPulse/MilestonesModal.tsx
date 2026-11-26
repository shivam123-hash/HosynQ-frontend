import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Ionicons from '@react-native-vector-icons/ionicons';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useAppDispatch, useAppSelector } from '../../../redux';
import {
  fetchMilestonesThunk,
  reactToMilestoneThunk,
  removeMilestoneReactionThunk,
} from '../../../redux/features/pulse/pulseSlice';
import { isUUID } from '../../../redux/features/lists/listsSlice';
import { MilestonesSkeleton } from '../../../components/SkeletonLoader';
import Colors from '../../../units/Colors';
import { FamilyMemberPulse, MilestoneItem } from './types';
import PulseModalContainer from './PulseModalContainer';
import ReactionPackModal from './ReactionPackModal';
import MilestoneDetailModal from './MilestoneDetailModal';
import {
  extractPulseMembersFromFamilyState,
  isJestTestEnv,
  mapApiMilestoneToUi,
  reactionApiToUiId,
  scheduleAfterTransition,
} from './pulseApiHelpers';

export interface MilestonesModalProps {
  visible: boolean;
  asModal?: boolean;
  onClose: () => void;
  onOpenAddMilestone?: () => void;
  onSelectMilestone?: (milestone: MilestoneItem) => void;
  milestones?: MilestoneItem[];
  members?: FamilyMemberPulse[];
}

export const MilestonesModal: React.FC<MilestonesModalProps> = ({
  visible,
  asModal = true,
  onClose,
  onOpenAddMilestone,
  onSelectMilestone,
  milestones: milestonesProp,
  members: membersProp,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const pulseState = useAppSelector((state) => state.pulse);
  const familyState = useAppSelector((state) => state.family);

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDetailMilestone, setSelectedDetailMilestone] =
    useState<MilestoneItem | null>(null);
  const [reactionTargetMilestone, setReactionTargetMilestone] =
    useState<MilestoneItem | null>(null);

  const membersList = useMemo(() => {
    if (membersProp && membersProp.length > 0) return membersProp;
    return extractPulseMembersFromFamilyState(familyState);
  }, [membersProp, familyState]);

  const memberLookup = useMemo(() => {
    const map = new Map<string, FamilyMemberPulse>();
    membersList.forEach((m) => map.set(m.id, m));
    return map;
  }, [membersList]);

  const myMemberId = useMemo(
    () => membersList.find((m) => m.isYou)?.id || null,
    [membersList]
  );

  const filterChips = useMemo(() => {
    const chips: Array<{ id: string; label: string }> = [
      { id: 'all', label: 'All' },
    ];
    membersList.forEach((m) => {
      chips.push({ id: m.id, label: m.name });
    });
    chips.push({ id: 'family', label: 'Family' });
    return chips;
  }, [membersList]);

  const buildFilterParams = useCallback(
    (filterId: string, before?: string) => {
      if (filterId === 'family') {
        return { family: true, limit: 50, ...(before ? { before } : {}) };
      }
      if (filterId !== 'all') {
        return { memberId: filterId, limit: 50, ...(before ? { before } : {}) };
      }
      return { limit: 50, ...(before ? { before } : {}) };
    },
    []
  );

  useEffect(() => {
    if (!visible) return;
    if (milestonesProp !== undefined || isJestTestEnv()) return;
    return scheduleAfterTransition(() => {
      dispatch(fetchMilestonesThunk(buildFilterParams(activeFilter)));
    });
  }, [visible, activeFilter, milestonesProp, dispatch, buildFilterParams]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchMilestonesThunk(buildFilterParams(activeFilter))).unwrap();
    } catch {
      // handled gracefully
    } finally {
      setRefreshing(false);
    }
  }, [activeFilter, buildFilterParams, dispatch]);

  const handleLoadMore = () => {
    if (!pulseState?.milestonesNextCursor || pulseState?.loadingMilestones) return;
    dispatch(
      fetchMilestonesThunk(
        buildFilterParams(activeFilter, pulseState.milestonesNextCursor)
      )
    );
  };

  const sourceList: MilestoneItem[] = useMemo(() => {
    if (milestonesProp !== undefined) {
      return milestonesProp;
    }
    return (pulseState?.milestones || []).map((ms) =>
      mapApiMilestoneToUi(ms, memberLookup, myMemberId)
    );
  }, [milestonesProp, pulseState?.milestones, memberLookup, myMemberId]);

  const filteredMilestones = useMemo(() => {
    if (activeFilter === 'all') return sourceList;
    if (activeFilter === 'family') {
      return sourceList.filter(
        (m) => m.isFamily || m.personName.toLowerCase() === 'family'
      );
    }
    const targetMember = memberLookup.get(activeFilter);
    return sourceList.filter(
      (m) =>
        m.memberId === activeFilter ||
        (targetMember &&
          m.personName.toLowerCase() === targetMember.name.toLowerCase())
    );
  }, [sourceList, activeFilter, memberLookup]);

  // Group chronologically by monthYear
  const groupedSections = useMemo(() => {
    const sections: { monthYear: string; items: MilestoneItem[] }[] = [];
    filteredMilestones.forEach((item) => {
      const existing = sections.find((s) => s.monthYear === item.monthYear);
      if (existing) {
        existing.items.push(item);
      } else {
        sections.push({ monthYear: item.monthYear, items: [item] });
      }
    });
    return sections;
  }, [filteredMilestones]);

  const handleOpenMilestone = (item: MilestoneItem) => {
    if (onSelectMilestone) {
      onSelectMilestone(item);
      return;
    }
    setSelectedDetailMilestone(item);
  };

  const handleSelectReaction = async (_reactionId: string, apiCode: string) => {
    if (!reactionTargetMilestone || !isUUID(reactionTargetMilestone.id)) return;
    const currentMine = reactionTargetMilestone.reactions?.mine?.toUpperCase();
    if (currentMine === apiCode.toUpperCase()) {
      await dispatch(removeMilestoneReactionThunk(reactionTargetMilestone.id));
    } else {
      await dispatch(
        reactToMilestoneThunk({ id: reactionTargetMilestone.id, reaction: apiCode })
      );
    }
  };

  const renderCategoryIcon = (iconType: MilestoneItem['iconType']) => {
    if (iconType === 'book') {
      return <Feather name="book-open" size={18} color="#3A8EF0" />;
    }
    if (iconType === 'cake') {
      return <MaterialIcons name="cake" size={19} color={Colors.primary} />;
    }
    return <Ionicons name="trophy-outline" size={18} color={Colors.primary} />;
  };

  const renderReactionPill = (item: MilestoneItem) => {
    const hasReacted = Boolean(item.reactions?.mine);
    return (
      <TouchableOpacity
        style={[styles.reactionBadge, hasReacted && styles.reactionBadgeActive]}
        onPress={() => setReactionTargetMilestone(item)}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`React to ${item.title}`}
      >
        <Feather
          name="heart"
          size={12}
          color={hasReacted ? Colors.primary : '#8A97AB'}
        />
        <Text
          style={[
            styles.reactionBadgeText,
            hasReacted && styles.reactionBadgeTextActive,
          ]}
        >
          {item.reactionsCount}
        </Text>
      </TouchableOpacity>
    );
  };

  const isLoading =
    milestonesProp === undefined &&
    !isJestTestEnv() &&
    !refreshing &&
    (Boolean(pulseState?.loadingMilestones) || !pulseState?.hasLoadedMilestones);

  return (
    <PulseModalContainer
      visible={visible}
      asModal={asModal}
      variant="push"
      onRequestClose={onClose}
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
            <Feather name="chevron-left" size={22} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Milestones</Text>
          <View style={styles.headerRightSpacer} />
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterRow}
        >
          {filterChips.map((chip) => {
            const isActive = activeFilter === chip.id;
            return (
              <TouchableOpacity
                key={chip.id}
                style={[
                  styles.filterChip,
                  isActive ? styles.filterChipActive : styles.filterChipInactive,
                ]}
                onPress={() => setActiveFilter(chip.id)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={chip.label}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive
                      ? styles.filterChipTextActive
                      : styles.filterChipTextInactive,
                  ]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom + 90, 108) },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
        >
          {isLoading ? (
            <MilestonesSkeleton />
          ) : groupedSections.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="trophy-outline" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No milestones yet</Text>
              <Text style={styles.emptySubtitle}>
                Save your family's big moments, firsts, and proud achievements here.
              </Text>
            </View>
          ) : (
            groupedSections.map((section) => (
              <View key={section.monthYear} style={styles.monthSection}>
                <Text style={styles.monthHeader}>{section.monthYear}</Text>

                <View style={styles.itemsList}>
                  {section.items.map((item) => {
                    const photoUri = item.photos?.[0];
                    if (photoUri || item.hasPhoto) {
                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={styles.featuredCard}
                          activeOpacity={0.85}
                          onPress={() => handleOpenMilestone(item)}
                          accessibilityRole="button"
                          accessibilityLabel={item.title}
                        >
                          {photoUri ? (
                            <Image
                              source={{ uri: photoUri }}
                              style={styles.featuredPhotoImage}
                              resizeMode="cover"
                            />
                          ) : null}

                          <View style={styles.featuredBody}>
                            <View style={styles.categoryRow}>
                              <MaterialIcons
                                name="emoji-events"
                                size={15}
                                color={Colors.primary}
                                style={styles.awardIcon}
                              />
                              <Text style={styles.categoryTagText}>
                                {item.categoryTag || item.personName.toUpperCase()}
                              </Text>
                            </View>

                            <Text style={styles.featuredTitle}>{item.title}</Text>

                            <View style={styles.footerMetaRow}>
                              <Text style={styles.featuredSubtext}>
                                {`${item.dateText} · ${item.authorText}`}
                              </Text>
                              {renderReactionPill(item)}
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    }

                    const isBlueIcon = item.iconType === 'book';
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.standardRow}
                        activeOpacity={0.85}
                        onPress={() => handleOpenMilestone(item)}
                        accessibilityRole="button"
                        accessibilityLabel={item.title}
                      >
                        <View
                          style={[
                            styles.iconBox,
                            isBlueIcon ? styles.iconBoxBlue : styles.iconBoxOrange,
                          ]}
                        >
                          {renderCategoryIcon(item.iconType)}
                        </View>
                        <View style={styles.standardRowTextGroup}>
                          <Text style={styles.standardTitle}>{item.title}</Text>
                          <Text style={styles.standardSubtitle}>
                            {`${item.dateText} · ${item.authorText}`}
                          </Text>
                        </View>
                        <View style={styles.rowRightMeta}>
                          {renderReactionPill(item)}
                          <Feather name="chevron-right" size={18} color="#6D7D94" />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))
          )}

          {milestonesProp === undefined && pulseState?.milestonesNextCursor ? (
            <TouchableOpacity
              style={styles.loadMoreBtn}
              onPress={handleLoadMore}
              disabled={pulseState?.loadingMilestones}
              activeOpacity={0.8}
            >
              {pulseState?.loadingMilestones ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Text style={styles.loadMoreText}>Load earlier milestones</Text>
              )}
            </TouchableOpacity>
          ) : null}
        </ScrollView>

        {/* Sticky Bottom CTA */}
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <TouchableOpacity
            style={styles.addMilestoneBtn}
            onPress={onOpenAddMilestone}
            activeOpacity={0.85}
          >
            <Feather
              name="plus"
              size={18}
              color={Colors.white}
              style={styles.addBtnIcon}
            />
            <Text style={styles.addMilestoneBtnText}>Add milestone</Text>
          </TouchableOpacity>
        </View>

        {/* Built-in Detail & Reaction Modals when used standalone */}
        <MilestoneDetailModal
          visible={Boolean(selectedDetailMilestone)}
          asModal={false}
          milestone={selectedDetailMilestone}
          members={membersList}
          onClose={() => setSelectedDetailMilestone(null)}
          onMilestoneDeleted={() => setSelectedDetailMilestone(null)}
        />

        <ReactionPackModal
          visible={Boolean(reactionTargetMilestone)}
          asModal={false}
          targetTitle={reactionTargetMilestone?.title}
          selectedReactionId={reactionApiToUiId(
            reactionTargetMilestone?.reactions?.mine
          )}
          reactionsSummary={reactionTargetMilestone?.reactions}
          members={membersList}
          onClose={() => setReactionTargetMilestone(null)}
          onSelectReaction={handleSelectReaction}
          onRemoveReaction={async () => {
            if (reactionTargetMilestone && isUUID(reactionTargetMilestone.id)) {
              await dispatch(
                removeMilestoneReactionThunk(reactionTargetMilestone.id)
              );
            }
          }}
        />
      </View>
    </PulseModalContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 4,
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
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  headerRightSpacer: {
    width: 44,
    height: 44,
  },
  filterScroll: {
    flexGrow: 0,
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
    fontFamily: 'Roboto-Bold',
  },
  filterChipTextInactive: {
    color: '#CAD4DF',
    fontFamily: 'Roboto-Medium',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  emptyCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 28,
    alignItems: 'center',
    marginTop: 12,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(240, 145, 58, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13.5,
    fontFamily: 'Roboto-Medium',
    color: '#8A97AB',
    textAlign: 'center',
    lineHeight: 20,
  },
  monthSection: {
    marginBottom: 20,
  },
  monthHeader: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    color: '#8A97AB',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  itemsList: {
    gap: 12,
  },
  featuredCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
  },
  featuredPhotoImage: {
    height: 156,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: '#132238',
  },
  featuredBody: {
    padding: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  awardIcon: {
    marginRight: 6,
  },
  categoryTagText: {
    color: Colors.primary,
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 0.8,
  },
  featuredTitle: {
    fontSize: 17,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  footerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  featuredSubtext: {
    fontSize: 13,
    color: '#8A97AB',
    fontFamily: 'Roboto-Medium',
    flex: 1,
  },
  standardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconBoxBlue: {
    backgroundColor: 'rgba(58, 142, 240, 0.12)',
    borderWidth: 1.5,
    borderColor: '#3A8EF0',
  },
  iconBoxOrange: {
    backgroundColor: 'rgba(240, 145, 58, 0.12)',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  standardRowTextGroup: {
    flex: 1,
    marginRight: 8,
  },
  standardTitle: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    marginBottom: 4,
  },
  standardSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
    fontFamily: 'Roboto-Medium',
  },
  rowRightMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#15253E',
    borderWidth: 1,
    borderColor: '#253957',
  },
  reactionBadgeActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(240, 145, 58, 0.14)',
  },
  reactionBadgeText: {
    fontSize: 12,
    fontFamily: 'Roboto-Medium',
    color: '#8A97AB',
  },
  reactionBadgeTextActive: {
    color: Colors.primary,
    fontFamily: 'Roboto-Bold',
  },
  loadMoreBtn: {
    marginTop: 8,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#293B59',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreText: {
    fontSize: 13.5,
    fontFamily: 'Roboto-SemiBold',
    color: Colors.primary,
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
  addMilestoneBtn: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnIcon: {
    marginRight: 8,
  },
  addMilestoneBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
});

export default MilestonesModal;
