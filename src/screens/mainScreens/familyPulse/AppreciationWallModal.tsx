import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useAppDispatch, useAppSelector } from '../../../redux';
import {
  deleteAppreciationThunk,
  fetchAppreciationsThunk,
  reactToAppreciationThunk,
  removeAppreciationReactionThunk,
} from '../../../redux/features/pulse/pulseSlice';
import { isUUID } from '../../../redux/features/lists/listsSlice';
import { AppreciationFilter } from '../../../services/pulseServices';
import { AppreciationWallSkeleton } from '../../../components/SkeletonLoader';
import Colors from '../../../units/Colors';
import { AppreciationItem, FamilyMemberPulse } from './types';
import {
  computeUpdatedReactionSummary,
  extractPulseMembersFromFamilyState,
  getReactionMeta,
  isJestTestEnv,
  mapApiAppreciationToUi,
  reactionApiToUiId,
  scheduleAfterTransition,
} from './pulseApiHelpers';
import PulseModalContainer from './PulseModalContainer';
import ReactionPackModal from './ReactionPackModal';
import PulseDialog, {
  INITIAL_PULSE_DIALOG_STATE,
  PulseDialogState,
} from './PulseDialog';

export interface AppreciationWallModalProps {
  visible: boolean;
  asModal?: boolean;
  onClose: () => void;
  onOpenWrite?: () => void;
  onOpenReactionPack?: (item: AppreciationItem) => void;
  items?: AppreciationItem[];
  members?: FamilyMemberPulse[];
}

type FilterType = 'All' | 'For me' | 'From me';

const FILTER_MAP: Record<FilterType, AppreciationFilter> = {
  All: 'ALL',
  'For me': 'FOR_ME',
  'From me': 'FROM_ME',
};

export const AppreciationWallModal: React.FC<AppreciationWallModalProps> = ({
  visible,
  asModal = true,
  onClose,
  onOpenWrite,
  onOpenReactionPack,
  items: itemsProp,
  members: membersProp,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const pulseState = useAppSelector((state) => state.pulse);
  const familyState = useAppSelector((state) => state.family);
  const isTestEnv = isJestTestEnv();

  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [refreshing, setRefreshing] = useState(false);
  const [localTestItems, setLocalTestItems] = useState<AppreciationItem[]>(itemsProp || []);
  const [reactionPackItemId, setReactionPackItemId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<PulseDialogState>(INITIAL_PULSE_DIALOG_STATE);

  useEffect(() => {
    if (itemsProp) {
      setLocalTestItems(itemsProp);
    }
  }, [itemsProp]);

  const members = useMemo(
    () =>
      membersProp && membersProp.length > 0
        ? membersProp
        : extractPulseMembersFromFamilyState(familyState),
    [membersProp, familyState]
  );
  const myMemberId = useMemo(() => {
    const me = members.find((m) => m.isYou);
    return (
      me?.id ||
      familyState?.basicFamilyData?.family?.myMemberId ||
      familyState?.myFamilyData?.family?.myMemberId ||
      null
    );
  }, [members, familyState]);

  const memberLookup = useMemo(
    () => new Map(members.map((m) => [m.id, m])),
    [members]
  );

  const loadAppreciations = useCallback(
    async (filter: FilterType, before?: string) => {
      if (itemsProp || isTestEnv) return;
      try {
        await dispatch(
          fetchAppreciationsThunk({
            filter: FILTER_MAP[filter],
            limit: 30,
            before,
          })
        ).unwrap();
      } catch {
        // Error surfaced in slice / dialog if needed
      }
    },
    [dispatch, itemsProp, isTestEnv]
  );

  useEffect(() => {
    if (visible && !itemsProp && !isTestEnv) {
      return scheduleAfterTransition(() => {
        loadAppreciations(activeFilter);
      });
    }
  }, [visible, activeFilter, itemsProp, isTestEnv, loadAppreciations]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAppreciations(activeFilter);
    setRefreshing(false);
  }, [activeFilter, loadAppreciations]);

  const apiItems = useMemo(
    () =>
      (pulseState.appreciations || []).map((a) =>
        mapApiAppreciationToUi(a, memberLookup, myMemberId)
      ),
    [pulseState.appreciations, memberLookup, myMemberId]
  );

  const displayItems = itemsProp ? localTestItems : apiItems;
  const filteredItems = itemsProp
    ? displayItems.filter((item) => {
        if (activeFilter === 'For me') {
          return item.receiverId === 'you' || item.receiverName.toLowerCase() === 'you';
        }
        if (activeFilter === 'From me') {
          return item.senderId === 'you' || item.senderName.toLowerCase() === 'you';
        }
        return true;
      })
    : displayItems;

  const applyLocalReactionUpdate = (
    itemId: string,
    nextApiCode: string | null
  ) => {
    setLocalTestItems((prev) =>
      prev.map((curr) => {
        if (curr.id !== itemId) return curr;
        const updatedReactions = computeUpdatedReactionSummary(
          curr.reactions,
          nextApiCode
        );
        const loveCount =
          updatedReactions.counts.find((c) => c.reaction === 'LOVE')?.count ?? 0;
        const otherCount = updatedReactions.counts
          .filter((c) => c.reaction !== 'LOVE')
          .reduce((sum, c) => sum + c.count, 0);
        return {
          ...curr,
          reactions: updatedReactions,
          userReacted: Boolean(updatedReactions.mine),
          heartsCount: loveCount,
          starsCount: otherCount,
        };
      })
    );
  };

  const handleSetOrToggleReaction = async (
    item: AppreciationItem,
    apiCode: string | null
  ) => {
    const isSameMine =
      Boolean(apiCode) &&
      item.reactions?.mine?.toUpperCase() === apiCode!.toUpperCase();
    const shouldRemove = !apiCode || isSameMine;

    if (itemsProp || isTestEnv || !isUUID(item.id)) {
      applyLocalReactionUpdate(item.id, shouldRemove ? null : apiCode);
      return;
    }

    try {
      if (shouldRemove) {
        await dispatch(removeAppreciationReactionThunk(item.id)).unwrap();
      } else {
        await dispatch(
          reactToAppreciationThunk({ id: item.id, reaction: apiCode! })
        ).unwrap();
      }
    } catch (err: any) {
      setDialog({
        visible: true,
        type: 'danger',
        iconName: 'alert-circle',
        title: 'Reaction failed',
        description:
          typeof err === 'string' ? err : 'Could not update reaction right now.',
        primaryButtonText: 'OK',
        secondaryButtonText: '',
      });
    }
  };

  const handleOpenReactionPicker = (item: AppreciationItem) => {
    if (onOpenReactionPack) {
      onOpenReactionPack(item);
      return;
    }
    setReactionPackItemId(item.id);
  };

  const handleDeleteConfirm = (item: AppreciationItem) => {
    setDialog({
      visible: true,
      type: 'danger',
      title: 'Delete appreciation?',
      description: `Remove your note for ${item.receiverName} from the Appreciation wall?`,
      primaryButtonText: 'Delete',
      secondaryButtonText: 'Cancel',
      onConfirm: async () => {
        if (itemsProp || isTestEnv || !isUUID(item.id)) {
          setLocalTestItems((prev) => prev.filter((it) => it.id !== item.id));
          setDialog(INITIAL_PULSE_DIALOG_STATE);
          return;
        }
        setDialog((prev) => ({ ...prev, loading: true }));
        try {
          await dispatch(deleteAppreciationThunk(item.id)).unwrap();
          setDialog(INITIAL_PULSE_DIALOG_STATE);
        } catch (err: any) {
          setDialog({
            visible: true,
            type: 'danger',
            iconName: 'alert-circle',
            title: 'Delete failed',
            description:
              typeof err === 'string' ? err : 'Could not remove appreciation.',
            primaryButtonText: 'OK',
            secondaryButtonText: '',
          });
        }
      },
    });
  };

  const renderReactionIcon = (apiCode: string, _active: boolean) => {
    const meta = getReactionMeta(apiCode);
    if (meta.iconType === 'material') {
      return <MaterialIcons name={meta.iconName as any} size={13} color={meta.color} />;
    }
    return <Feather name={meta.iconName as any} size={13} color={meta.color} />;
  };

  const reactionTargetItem = useMemo(
    () => displayItems.find((d) => d.id === reactionPackItemId) || null,
    [displayItems, reactionPackItemId]
  );

  const showSkeleton =
    !itemsProp &&
    !isTestEnv &&
    !refreshing &&
    (pulseState.loadingAppreciations || !pulseState.hasLoadedAppreciations);

  return (
    <PulseModalContainer
      visible={visible}
      asModal={asModal}
      variant="push"
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
        >
          {showSkeleton ? (
            <AppreciationWallSkeleton />
          ) : filteredItems.length === 0 ? (
            <View style={styles.emptyCard}>
              <Feather
                name="heart"
                size={28}
                color={Colors.primary}
                style={{ marginBottom: 10 }}
              />
              <Text style={styles.emptyTitle}>No appreciations yet</Text>
              <Text style={styles.emptySubtitle}>
                {activeFilter === 'All'
                  ? 'Brighten someone’s day by thanking a family member.'
                  : `No appreciations found under “${activeFilter}”.`}
              </Text>
            </View>
          ) : (
            filteredItems.map((item) => {
              const reactionCounts = item.reactions?.counts || [];
              return (
                <View key={item.id} style={styles.card}>
                  {/* Card Header Row */}
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.actorsRow}>
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

                      <Text style={styles.cardActorTitle} numberOfLines={1}>
                        <Text style={styles.actorNameBold}>{item.senderName}</Text>
                        <Text style={styles.thankedText}> thanked </Text>
                        <Text style={styles.actorNameBold}>{item.receiverName}</Text>
                      </Text>
                    </View>

                    <View style={styles.cardHeaderRight}>
                      <Text style={styles.timeText}>{item.timeText}</Text>
                      {item.canRemove && (
                        <TouchableOpacity
                          onPress={() => handleDeleteConfirm(item)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          style={styles.deleteIconBtn}
                          accessibilityRole="button"
                          accessibilityLabel="Delete appreciation"
                        >
                          <Feather name="trash-2" size={14} color={Colors.dangerCoral} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {Boolean(item.tag) && (
                    <View style={styles.tagPill}>
                      <Text style={styles.tagPillText}>{item.tag}</Text>
                    </View>
                  )}

                  {/* Message Body */}
                  <Text style={styles.messageText}>{item.message}</Text>

                  {/* Reactions Row */}
                  <View style={styles.reactionsRow}>
                    {(() => {
                      const activeCounts = reactionCounts
                        .filter((rc) => rc.count > 0)
                        .slice()
                        .sort((a, b) => b.count - a.count);

                      if (activeCounts.length > 0) {
                        return (
                          <>
                            {activeCounts.map((rc) => {
                              const isMine =
                                item.reactions?.mine?.toUpperCase() ===
                                rc.reaction.toUpperCase();
                              const meta = getReactionMeta(rc.reaction);
                              return (
                                <TouchableOpacity
                                  key={rc.reaction}
                                  style={[
                                    styles.reactionPill,
                                    isMine && {
                                      backgroundColor: meta.tintBg,
                                      borderColor: meta.color,
                                      borderWidth: 1.5,
                                    },
                                  ]}
                                  onPress={() =>
                                    handleSetOrToggleReaction(item, rc.reaction)
                                  }
                                  onLongPress={() => handleOpenReactionPicker(item)}
                                  activeOpacity={0.75}
                                  accessibilityRole="button"
                                  accessibilityLabel={`${meta.label} reaction (${rc.count})`}
                                  accessibilityState={{ selected: isMine }}
                                >
                                  {renderReactionIcon(rc.reaction, isMine)}
                                  {isMine ? (
                                    <Text
                                      style={[
                                        styles.reactionLabelMini,
                                        { color: meta.color },
                                      ]}
                                    >
                                      {meta.label} · {rc.count}
                                    </Text>
                                  ) : (
                                    <Text style={styles.reactionCountText}>
                                      {rc.count}
                                    </Text>
                                  )}
                                </TouchableOpacity>
                              );
                            })}
                            <TouchableOpacity
                              style={styles.plusButton}
                              onPress={() => handleOpenReactionPicker(item)}
                              activeOpacity={0.75}
                              accessibilityRole="button"
                              accessibilityLabel="Add reaction"
                            >
                              <Feather
                                name="plus"
                                size={14}
                                color={Colors.textSecondary}
                              />
                            </TouchableOpacity>
                          </>
                        );
                      }

                      return (
                        <>
                          <TouchableOpacity
                            style={styles.quickLoveEmptyBtn}
                            onPress={() => handleSetOrToggleReaction(item, 'LOVE')}
                            activeOpacity={0.75}
                            accessibilityRole="button"
                            accessibilityLabel="Love this appreciation"
                          >
                            <Feather name="heart" size={13} color="#F06A6A" />
                            <Text style={styles.quickLoveEmptyText}>Love it</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.reactPromptBtn}
                            onPress={() => handleOpenReactionPicker(item)}
                            activeOpacity={0.75}
                            accessibilityRole="button"
                            accessibilityLabel="Add reaction"
                          >
                            <Feather name="smile" size={13} color={Colors.primary} />
                            <Text style={styles.reactPromptText}>React</Text>
                          </TouchableOpacity>
                        </>
                      );
                    })()}
                  </View>
                </View>
              );
            })
          )}

          {!itemsProp && pulseState.appreciationsNextCursor && (
            <TouchableOpacity
              style={styles.loadMoreBtn}
              onPress={() =>
                loadAppreciations(activeFilter, pulseState.appreciationsNextCursor || undefined)
              }
              activeOpacity={0.75}
            >
              <Text style={styles.loadMoreText}>Load older appreciations</Text>
            </TouchableOpacity>
          )}
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

        <ReactionPackModal
          visible={Boolean(reactionTargetItem)}
          asModal={false}
          targetTitle={
            reactionTargetItem
              ? `${reactionTargetItem.senderName} thanked ${reactionTargetItem.receiverName}`
              : 'React to appreciation'
          }
          selectedReactionId={reactionApiToUiId(
            reactionTargetItem?.reactions?.mine
          )}
          reactionsSummary={reactionTargetItem?.reactions}
          members={members}
          onClose={() => setReactionPackItemId(null)}
          onSelectReaction={(_reactionId, apiCode) => {
            if (reactionTargetItem) {
              handleSetOrToggleReaction(reactionTargetItem, apiCode);
            }
          }}
          onRemoveReaction={() => {
            if (reactionTargetItem) {
              handleSetOrToggleReaction(reactionTargetItem, null);
            }
          }}
        />

        <PulseDialog
          dialog={dialog}
          onClose={() => setDialog(INITIAL_PULSE_DIALOG_STATE)}
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
    fontFamily: 'Roboto-Bold',
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
    fontFamily: 'Roboto-Bold',
  },
  filterChipTextInactive: {
    color: '#99A3B1',
    fontFamily: 'Roboto-Medium',
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
    fontFamily: 'Roboto-Bold',
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
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
  },
  thankedText: {
    fontFamily: 'Roboto-Regular',
    color: Colors.white,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: 'Roboto-Medium',
  },
  deleteIconBtn: {
    padding: 4,
  },
  tagPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(240, 145, 58, 0.14)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 8,
  },
  tagPillText: {
    color: Colors.primary,
    fontSize: 11.5,
    fontFamily: 'Roboto-SemiBold',
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
    flexWrap: 'wrap',
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
    fontFamily: 'Roboto-SemiBold',
  },
  reactionLabelMini: {
    fontSize: 12.5,
    fontFamily: 'Roboto-Bold',
  },
  reactionCountTextActive: {
    color: Colors.primary,
    fontSize: 12.5,
    fontFamily: 'Roboto-Bold',
  },
  quickLoveEmptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#101F36',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D3E56',
    gap: 6,
  },
  quickLoveEmptyText: {
    fontSize: 12.5,
    fontFamily: 'Roboto-SemiBold',
    color: Colors.textLightMuted,
  },
  reactPromptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 145, 58, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(240, 145, 58, 0.45)',
    borderStyle: 'dashed',
    gap: 6,
  },
  reactPromptText: {
    fontSize: 12.5,
    fontFamily: 'Roboto-Bold',
    color: Colors.primary,
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
  emptyCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E314B',
    padding: 24,
    alignItems: 'center',
    marginTop: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadMoreBtn: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3A4556',
  },
  loadMoreText: {
    color: Colors.primary,
    fontSize: 13.5,
    fontFamily: 'Roboto-SemiBold',
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
    fontFamily: 'Roboto-Bold',
  },
});

export default AppreciationWallModal;
