import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { useAppDispatch, useAppSelector } from '../../../redux';
import {
  deletePollThunk,
  fetchPollsThunk,
  setSelectedPollLocal,
  voteOnPollThunk,
} from '../../../redux/features/pulse/pulseSlice';
import { isUUID } from '../../../redux/features/lists/listsSlice';
import { FamilyPollsSkeleton } from '../../../components/SkeletonLoader';
import Colors from '../../../units/Colors';
import { PollItem } from './types';
import {
  extractPulseMembersFromFamilyState,
  isJestTestEnv,
  mapApiPollToUi,
  scheduleAfterTransition,
} from './pulseApiHelpers';
import PulseModalContainer from './PulseModalContainer';
import PulseDialog, {
  INITIAL_PULSE_DIALOG_STATE,
  PulseDialogState,
} from './PulseDialog';

export interface FamilyPollsModalProps {
  visible: boolean;
  polls?: PollItem[];
  asModal?: boolean;
  onClose: () => void;
  onOpenCreatePoll?: () => void;
  onOpenPollResults?: (poll: PollItem) => void;
}

export const FamilyPollsModal: React.FC<FamilyPollsModalProps> = ({
  visible,
  polls: pollsProp,
  asModal = true,
  onClose,
  onOpenCreatePoll,
  onOpenPollResults,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const pulseState = useAppSelector((state) => state.pulse);
  const familyState = useAppSelector((state) => state.family);
  const isTestEnv = isJestTestEnv();

  const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active');
  const [localTestPolls, setLocalTestPolls] = useState<PollItem[]>(pollsProp || []);
  const [selectedOptions, setSelectedOptions] = useState<{ [pollId: string]: string[] }>({});
  const [refreshing, setRefreshing] = useState(false);
  const [dialog, setDialog] = useState<PulseDialogState>(INITIAL_PULSE_DIALOG_STATE);

  useEffect(() => {
    if (pollsProp) {
      setLocalTestPolls(pollsProp);
    }
  }, [pollsProp]);

  const members = useMemo(
    () => extractPulseMembersFromFamilyState(familyState),
    [familyState]
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

  const loadPolls = useCallback(
    async (tab: 'active' | 'closed', before?: string) => {
      if (pollsProp || isTestEnv) return;
      try {
        await dispatch(
          fetchPollsThunk({
            status: tab === 'closed' ? 'CLOSED' : 'ACTIVE',
            limit: 30,
            before,
          })
        ).unwrap();
      } catch {
        // Error surfaced in slice
      }
    },
    [dispatch, pollsProp, isTestEnv]
  );

  useEffect(() => {
    if (visible && !pollsProp && !isTestEnv) {
      return scheduleAfterTransition(() => {
        loadPolls(activeTab);
      });
    }
  }, [visible, activeTab, pollsProp, isTestEnv, loadPolls]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPolls(activeTab);
    setRefreshing(false);
  }, [activeTab, loadPolls]);

  const rawList =
    activeTab === 'closed' ? pulseState.closedPolls : pulseState.activePolls;
  const apiPolls = useMemo(
    () => (rawList || []).map((p) => mapApiPollToUi(p, memberLookup, myMemberId)),
    [rawList, memberLookup, myMemberId]
  );

  const displayPolls = pollsProp
    ? localTestPolls.filter((p) => p.status === activeTab)
    : apiPolls;

  const activeCount = pollsProp
    ? localTestPolls.filter((p) => p.status === 'active').length
    : pulseState.pollCounts.active || pulseState.activePolls.length;
  const closedCount = pollsProp
    ? localTestPolls.filter((p) => p.status === 'closed').length
    : pulseState.pollCounts.closed || pulseState.closedPolls.length;

  const submitVote = async (poll: PollItem, optionIds: string[]) => {
    if (pollsProp || isTestEnv || !isUUID(poll.id)) {
      const picked = optionIds[0];
      setLocalTestPolls((prev) =>
        prev.map((p) => {
          if (p.id !== poll.id) return p;
          const nextTotal = p.totalVotes + (p.hasUserVoted ? 0 : 1);
          return {
            ...p,
            hasUserVoted: true,
            totalVotes: nextTotal,
            options: p.options.map((opt) =>
              opt.id === picked
                ? {
                    ...opt,
                    votes: opt.votes + 1,
                    isUserVoted: true,
                    percentage: Math.round(((opt.votes + 1) / Math.max(nextTotal, 1)) * 100),
                  }
                : {
                    ...opt,
                    percentage: Math.round((opt.votes / Math.max(nextTotal, 1)) * 100),
                  }
            ),
          };
        })
      );
      return;
    }

    try {
      await dispatch(
        voteOnPollThunk({ pollId: poll.id, optionIds })
      ).unwrap();
    } catch (err: any) {
      setDialog({
        visible: true,
        type: 'danger',
        iconName: 'alert-circle',
        title: 'Vote not recorded',
        description: typeof err === 'string' ? err : 'Please try again.',
        primaryButtonText: 'OK',
        secondaryButtonText: '',
      });
    }
  };

  const handleSelectOption = (poll: PollItem, optionId: string) => {
    if (!poll.canVote && poll.status === 'closed') return;
    if (poll.allowMultiple) {
      setSelectedOptions((prev) => {
        const curr = prev[poll.id] || [];
        const next = curr.includes(optionId)
          ? curr.filter((x) => x !== optionId)
          : [...curr, optionId];
        return { ...prev, [poll.id]: next };
      });
      return;
    }
    setSelectedOptions((prev) => ({ ...prev, [poll.id]: [optionId] }));
    submitVote(poll, [optionId]);
  };

  const handleDeletePoll = (poll: PollItem) => {
    setDialog({
      visible: true,
      type: 'danger',
      title: 'Delete poll?',
      description: `Remove “${poll.question}” for the family?`,
      primaryButtonText: 'Delete',
      secondaryButtonText: 'Cancel',
      onConfirm: async () => {
        if (pollsProp || isTestEnv || !isUUID(poll.id)) {
          setLocalTestPolls((prev) => prev.filter((p) => p.id !== poll.id));
          setDialog(INITIAL_PULSE_DIALOG_STATE);
          return;
        }
        setDialog((prev) => ({ ...prev, loading: true }));
        try {
          await dispatch(deletePollThunk(poll.id)).unwrap();
          setDialog(INITIAL_PULSE_DIALOG_STATE);
        } catch (err: any) {
          setDialog({
            visible: true,
            type: 'danger',
            iconName: 'alert-circle',
            title: 'Delete failed',
            description: typeof err === 'string' ? err : 'Please try again.',
            primaryButtonText: 'OK',
            secondaryButtonText: '',
          });
        }
      },
    });
  };

  const openPollDetail = (poll: PollItem) => {
    const rawMatch = rawList.find((r) => r.id === poll.id) || null;
    if (rawMatch) {
      dispatch(setSelectedPollLocal(rawMatch));
    }
    onOpenPollResults?.(poll);
  };

  const nextCursor =
    activeTab === 'closed'
      ? pulseState.closedPollsNextCursor
      : pulseState.activePollsNextCursor;

  const hasLoadedActiveTab =
    activeTab === 'closed'
      ? pulseState.hasLoadedClosedPolls
      : pulseState.hasLoadedActivePolls;
  const showSkeleton =
    !pollsProp &&
    !isTestEnv &&
    !refreshing &&
    (pulseState.loadingPolls || !hasLoadedActiveTab);

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
            <Feather name="chevron-left" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Family polls</Text>
          <View style={styles.headerRightSpacer} />
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'active' && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab('active')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'active' && styles.tabTextActive,
              ]}
            >
              {activeCount > 0 ? `Active · ${activeCount}` : 'Active'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'closed' && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab('closed')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'closed' && styles.tabTextActive,
              ]}
            >
              {closedCount > 0 ? `Closed · ${closedCount}` : 'Closed'}
            </Text>
          </TouchableOpacity>
        </View>

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
            <FamilyPollsSkeleton />
          ) : displayPolls.length === 0 ? (
            <View style={styles.emptyCard}>
              <Feather
                name="bar-chart-2"
                size={28}
                color={Colors.primary}
                style={{ marginBottom: 10 }}
              />
              <Text style={styles.emptyTitle}>
                {activeTab === 'active' ? 'No active polls' : 'No closed polls'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'active'
                  ? 'Ask your family a question to decide weekend plans together.'
                  : 'Completed polls and their winning choices will appear here.'}
              </Text>
            </View>
          ) : (
            displayPolls.map((poll) => {
              const voterDots = poll.options
                .flatMap((o) => o.voterInitials || [])
                .slice(0, 3);
              const eligibleTotal =
                poll.eligibleCount || Math.max(members.length, 1);

              if (poll.hasUserVoted || poll.status === 'closed' || poll.canVote === false) {
                return (
                  <TouchableOpacity
                    key={poll.id}
                    style={styles.card}
                    onPress={() => openPollDetail(poll)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.cardTopRow}>
                      <View style={styles.authorGroup}>
                        <View
                          style={[
                            styles.authorAvatar,
                            { backgroundColor: poll.authorColor },
                          ]}
                        >
                          <Text style={styles.authorAvatarText}>
                            {poll.authorInitial}
                          </Text>
                        </View>
                        <Text style={styles.authorText}>
                          Asked by {poll.authorName} · {poll.timeText}
                        </Text>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        {poll.hasUserVoted && (
                          <View style={styles.votedBadge}>
                            <Text style={styles.votedBadgeText}>You voted</Text>
                          </View>
                        )}
                        {poll.canManage && (
                          <TouchableOpacity
                            onPress={() => handleDeletePoll(poll)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            accessibilityRole="button"
                            accessibilityLabel={`Delete poll ${poll.question}`}
                          >
                            <Feather name="trash-2" size={14} color={Colors.dangerCoral} />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    <Text style={styles.pollQuestion}>{poll.question}</Text>

                    <View style={styles.optionsList}>
                      {poll.options.map((opt) => (
                        <View key={opt.id} style={styles.votedOptionItem}>
                          <View style={styles.votedOptionLabelRow}>
                            <View style={styles.optionNameWithCheck}>
                              <Text style={styles.votedOptionName}>{opt.text}</Text>
                              {opt.isUserVoted && (
                                <View style={styles.checkCircle}>
                                  <Feather
                                    name="check"
                                    size={12}
                                    color={Colors.primary}
                                  />
                                </View>
                              )}
                            </View>
                            <Text
                              style={[
                                styles.votedOptionPercent,
                                opt.isUserVoted && styles.votedOptionPercentActive,
                              ]}
                            >
                              {opt.percentage}%
                            </Text>
                          </View>

                          <View style={styles.progressBarTrack}>
                            <View
                              style={[
                                styles.progressBarFill,
                                {
                                  width: `${opt.percentage}%`,
                                  backgroundColor: opt.isUserVoted
                                    ? Colors.primary
                                    : Colors.surfaceNavyLight,
                                },
                              ]}
                            />
                          </View>
                        </View>
                      ))}
                    </View>

                    <View style={styles.cardFooter}>
                      {voterDots.length > 0 && (
                        <View style={styles.avatarCluster}>
                          {voterDots.map((dot, idx) => (
                            <View
                              key={`dot-${idx}`}
                              style={[
                                styles.clusterDot,
                                idx > 0 && styles.clusterDotOverlap,
                                { backgroundColor: dot.bgColor },
                              ]}
                            >
                              <Text style={styles.clusterDotText}>{dot.initial}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      <Text style={styles.footerInfoText}>
                        {`${poll.totalVotes} of ${eligibleTotal} voted · ${poll.closesText}`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }

              // Unvoted Poll Card
              const pickedForPoll = selectedOptions[poll.id] || [];
              return (
                <View key={poll.id} style={styles.card}>
                  <View style={styles.cardTopRow}>
                    <View style={styles.authorGroup}>
                      <View
                        style={[
                          styles.authorAvatar,
                          { backgroundColor: poll.authorColor },
                        ]}
                      >
                        <Text style={styles.authorAvatarText}>
                          {poll.authorInitial}
                        </Text>
                      </View>
                      <Text style={styles.authorText}>
                        Asked by {poll.authorName} · {poll.timeText}
                      </Text>
                    </View>

                    <View style={styles.voteNowBadge}>
                      <Text style={styles.voteNowBadgeText}>Vote now</Text>
                    </View>
                  </View>

                  <Text style={styles.pollQuestion}>{poll.question}</Text>

                  <View style={styles.radioOptionsList}>
                    {poll.options.map((opt) => {
                      const isSelected = pickedForPoll.includes(opt.id);
                      return (
                        <TouchableOpacity
                          key={opt.id}
                          style={styles.radioOptionItem}
                          onPress={() => handleSelectOption(poll, opt.id)}
                          activeOpacity={0.7}
                        >
                          <View
                            style={[
                              styles.radioCircle,
                              isSelected && styles.radioCircleSelected,
                            ]}
                          >
                            {isSelected && <View style={styles.radioInnerDot} />}
                          </View>
                          <Text style={styles.radioOptionText}>{opt.text}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {poll.allowMultiple && pickedForPoll.length > 0 && (
                    <TouchableOpacity
                      style={styles.submitVoteBtn}
                      onPress={() => submitVote(poll, pickedForPoll)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.submitVoteBtnText}>Submit vote</Text>
                    </TouchableOpacity>
                  )}

                  <Text style={styles.unvotedFooterText}>
                    {`${poll.totalVotes} of ${eligibleTotal} voted · ${poll.closesText}`}
                  </Text>
                </View>
              );
            })
          )}

          {!pollsProp && nextCursor && (
            <TouchableOpacity
              style={styles.loadMoreBtn}
              onPress={() => loadPolls(activeTab, nextCursor)}
              activeOpacity={0.75}
            >
              <Text style={styles.loadMoreText}>Load more polls</Text>
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
            style={styles.createPollButton}
            onPress={onOpenCreatePoll}
            activeOpacity={0.85}
          >
            <Feather
              name="plus"
              size={18}
              color={Colors.white}
              style={styles.createPollIcon}
            />
            <Text style={styles.createPollButtonText}>Create poll</Text>
          </TouchableOpacity>
        </View>

        <PulseDialog
          dialog={dialog}
          onClose={() => setDialog(INITIAL_PULSE_DIALOG_STATE)}
        />
      </View>
    </PulseModalContainer>
  );
};

const styles = StyleSheet.create({
  inlineOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    elevation: 20,
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
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    letterSpacing: -0.2,
  },
  headerRightSpacer: {
    width: 44,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 24,
    marginHorizontal: 20,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabButton: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.black,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  authorGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  authorAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  authorAvatarText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
  },
  authorText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: 'Roboto-Medium',
    flexShrink: 1,
  },
  votedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.accentTeal,
  },
  votedBadgeText: {
    color: Colors.accentTeal,
    fontSize: 12,
    fontFamily: 'Roboto-SemiBold',
  },
  voteNowBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  voteNowBadgeText: {
    color: Colors.primary,
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
  },
  pollQuestion: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    marginBottom: 16,
    lineHeight: 22,
  },
  optionsList: {
    gap: 12,
    marginBottom: 16,
  },
  votedOptionItem: {
    gap: 6,
  },
  votedOptionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionNameWithCheck: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  votedOptionName: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
  },
  checkCircle: {
    marginLeft: 6,
  },
  votedOptionPercent: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: 'Roboto-SemiBold',
  },
  votedOptionPercentActive: {
    color: Colors.primary,
  },
  progressBarTrack: {
    height: 5,
    backgroundColor: Colors.surfaceNavyDark,
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 5,
    borderRadius: 2.5,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  clusterDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.cardBackground,
  },
  clusterDotOverlap: {
    marginLeft: -6,
  },
  clusterDotText: {
    color: Colors.white,
    fontSize: 9,
    fontFamily: 'Roboto-Bold',
  },
  footerInfoText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Roboto-Medium',
  },
  radioOptionsList: {
    gap: 10,
    marginBottom: 14,
  },
  radioOptionItem: {
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioCircleSelected: {
    borderColor: Colors.primary,
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  radioOptionText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
  },
  submitVoteBtn: {
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  submitVoteBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
  },
  unvotedFooterText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Roboto-Medium',
  },
  emptyCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
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
    borderTopColor: Colors.borderSubtle,
  },
  createPollButton: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createPollIcon: {
    marginRight: 8,
  },
  createPollButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
});

export default FamilyPollsModal;
