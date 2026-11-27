import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Share,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAppDispatch, useAppSelector } from '../../../redux';
import {
  closePollThunk,
  deletePollThunk,
  fetchPollResultsThunk,
} from '../../../redux/features/pulse/pulseSlice';
import { isUUID } from '../../../redux/features/lists/listsSlice';
import { PollResultsSkeleton } from '../../../components/SkeletonLoader';
import Colors from '../../../units/Colors';
import { PollItem } from './types';
import {
  extractPulseMembersFromFamilyState,
  isJestTestEnv,
  mapApiPollToUi,
  scheduleAfterTransition,
} from './pulseApiHelpers';
import PulseModalContainer from './PulseModalContainer';
import SchedulePollEventModal from './SchedulePollEventModal';
import PulseDialog, {
  INITIAL_PULSE_DIALOG_STATE,
  PulseDialogState,
} from './PulseDialog';

export interface PollResultsModalProps {
  visible: boolean;
  onClose: () => void;
  pollId?: string | null;
  poll?: PollItem;
  externalLoading?: boolean;
  asModal?: boolean;
  onBrowseAllPolls?: () => void;
  onAddToCalendar?: (eventTitle: string) => void;
  onShareInChat?: (poll: PollItem) => void;
}

export const PollResultsModal: React.FC<PollResultsModalProps> = ({
  visible,
  onClose,
  pollId,
  poll: pollProp,
  externalLoading = false,
  asModal = true,
  onBrowseAllPolls,
  onAddToCalendar,
  onShareInChat,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const pulseState = useAppSelector((state) => state.pulse);
  const familyState = useAppSelector((state) => state.family);
  const isTestEnv = isJestTestEnv();

  const [refreshing, setRefreshing] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [closingPoll, setClosingPoll] = useState(false);
  const [dialog, setDialog] = useState<PulseDialogState>(INITIAL_PULSE_DIALOG_STATE);

  const resolvedPollId = pollId || pollProp?.id || null;

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

  const loadDetail = useCallback(async () => {
    if (isTestEnv || !resolvedPollId || !isUUID(resolvedPollId)) return;
    try {
      await dispatch(fetchPollResultsThunk(resolvedPollId)).unwrap();
    } catch {
      // handled cleanly
    }
  }, [dispatch, resolvedPollId, isTestEnv]);

  useEffect(() => {
    if (visible && !pollProp && !isTestEnv && resolvedPollId && isUUID(resolvedPollId)) {
      return scheduleAfterTransition(() => {
        loadDetail();
      });
    }
  }, [visible, pollProp, isTestEnv, resolvedPollId, loadDetail]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDetail();
    setRefreshing(false);
  }, [loadDetail]);

  const apiPoll = useMemo(() => {
    if (
      pulseState.selectedPoll &&
      (!resolvedPollId || pulseState.selectedPoll.id === resolvedPollId)
    ) {
      return mapApiPollToUi(pulseState.selectedPoll, memberLookup, myMemberId);
    }
    return null;
  }, [pulseState.selectedPoll, resolvedPollId, memberLookup, myMemberId]);

  const poll = apiPoll || pollProp || null;

  const handleShare = async () => {
    if (!poll) return;
    const winnerText = poll.options[0]?.text || '';
    try {
      await Share.share({
        message: `HosynQ Poll Results: ${poll.question} - Winner: ${winnerText}`,
      });
    } catch {
      // Ignored
    }
  };

  const handleClosePoll = () => {
    if (!poll || !isUUID(poll.id)) return;
    setDialog({
      visible: true,
      type: 'warning',
      iconName: 'lock',
      title: 'Close this poll?',
      description: 'Voting will end immediately and final results will be locked.',
      primaryButtonText: 'Close poll',
      secondaryButtonText: 'Cancel',
      onConfirm: async () => {
        setClosingPoll(true);
        setDialog((prev) => ({ ...prev, loading: true }));
        try {
          await dispatch(closePollThunk(poll.id)).unwrap();
          setDialog(INITIAL_PULSE_DIALOG_STATE);
        } catch (err: any) {
          setDialog({
            visible: true,
            type: 'danger',
            iconName: 'alert-circle',
            title: 'Could not close poll',
            description: typeof err === 'string' ? err : 'Please try again.',
            primaryButtonText: 'OK',
            secondaryButtonText: '',
          });
        } finally {
          setClosingPoll(false);
        }
      },
    });
  };

  const handleDeletePoll = () => {
    if (!poll || !isUUID(poll.id)) return;
    setDialog({
      visible: true,
      type: 'danger',
      title: 'Delete this poll?',
      description: `Remove “${poll.question}” for everyone in the family?`,
      primaryButtonText: 'Delete poll',
      secondaryButtonText: 'Cancel',
      onConfirm: async () => {
        setDialog((prev) => ({ ...prev, loading: true }));
        try {
          await dispatch(deletePollThunk(poll.id)).unwrap();
          setDialog(INITIAL_PULSE_DIALOG_STATE);
          onClose();
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

  const sortedOptions = useMemo(() => {
    if (!poll) return [];
    const topSet = new Set(poll.topOptionIds || []);
    return [...poll.options].sort((a, b) => {
      const aTop = topSet.has(a.id) ? 1 : 0;
      const bTop = topSet.has(b.id) ? 1 : 0;
      if (bTop !== aTop) return bTop - aTop;
      return (b.votes || 0) - (a.votes || 0);
    });
  }, [poll]);

  const winningOption = sortedOptions[0];
  const otherOptions = sortedOptions.slice(1);

  const showSkeleton =
    !pollProp &&
    !isTestEnv &&
    !refreshing &&
    (pulseState.loadingPollDetail || externalLoading || (!poll && Boolean(resolvedPollId)));

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
          <Text style={styles.headerTitle}>Poll results</Text>
          <View style={styles.headerRightGroup}>
            {poll?.canManage && isUUID(poll.id) && (
              <TouchableOpacity
                style={[styles.circleButton, { marginRight: 8 }]}
                onPress={handleDeletePoll}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Delete poll"
              >
                <Feather name="trash-2" size={18} color={Colors.dangerCoral} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.circleButton}
              onPress={handleShare}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Share results"
            >
              <Feather name="upload" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 140 },
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
            <PollResultsSkeleton />
          ) : !poll ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Poll not found</Text>
              <Text style={styles.emptySubtitle}>
                Pull down to refresh or browse all Family polls.
              </Text>
              {onBrowseAllPolls && (
                <TouchableOpacity
                  style={styles.browseAllBtn}
                  onPress={onBrowseAllPolls}
                  activeOpacity={0.8}
                >
                  <Text style={styles.browseAllBtnText}>View all family polls</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              {/* Status & Subtitle */}
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.closedBadge,
                    poll.status === 'active' && styles.activeBadge,
                  ]}
                >
                  <Feather
                    name={poll.status === 'closed' ? 'lock' : 'bar-chart-2'}
                    size={12}
                    color={poll.status === 'closed' ? Colors.textSecondary : Colors.primary}
                    style={styles.lockIcon}
                  />
                  <Text
                    style={[
                      styles.closedBadgeText,
                      poll.status === 'active' && styles.activeBadgeText,
                    ]}
                  >
                    {poll.status === 'closed' ? 'Closed' : 'Active'}
                  </Text>
                </View>
                <Text style={styles.votedSubtitle}>
                  {`${poll.totalVotes} of ${poll.eligibleCount || Math.max(members.length, 1)} voted · Asked by ${poll.authorName}`}
                </Text>
              </View>

              {/* Question Title */}
              <Text style={styles.questionTitle}>{poll.question}</Text>

              {/* Most Voted Winner Card */}
              {winningOption && (
                <View style={styles.winnerCard}>
                  <View style={styles.mostVotesHeader}>
                    <Ionicons
                      name="trophy-outline"
                      size={16}
                      color={Colors.primary}
                      style={styles.trophyIcon}
                    />
                    <Text style={styles.mostVotesLabel}>MOST VOTES</Text>
                  </View>

                  <View style={styles.optionTitleRow}>
                    <View style={styles.optionNameWithCheck}>
                      <Text style={styles.winnerOptionText}>{winningOption.text}</Text>
                      {winningOption.isUserVoted && (
                        <Feather
                          name="check-circle"
                          size={16}
                          color={Colors.primary}
                          style={styles.checkCircle}
                        />
                      )}
                    </View>
                    <Text style={styles.winnerPercentageText}>
                      {`${winningOption.votes} vote${winningOption.votes === 1 ? '' : 's'} · ${winningOption.percentage}%`}
                    </Text>
                  </View>

                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${winningOption.percentage}%`,
                          backgroundColor: Colors.primary,
                        },
                      ]}
                    />
                  </View>

                  {winningOption.voterInitials && winningOption.voterInitials.length > 0 && (
                    <View style={styles.votersRow}>
                      {winningOption.voterInitials.map((voter, idx) => (
                        <View
                          key={`winner-voter-${idx}`}
                          style={[
                            styles.voterAvatar,
                            styles.voterAvatarWinner,
                            idx > 0 && styles.voterAvatarOverlap,
                            { backgroundColor: voter.bgColor },
                          ]}
                        >
                          <Text style={styles.voterAvatarText}>{voter.initial}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Other Choices Card */}
              {otherOptions.length > 0 && (
                <View style={styles.otherOptionsCard}>
                  {otherOptions.map((opt, index) => (
                    <View
                      key={opt.id}
                      style={[
                        styles.otherOptionItem,
                        index > 0 && styles.otherOptionItemSpaced,
                      ]}
                    >
                      <View style={styles.optionTitleRow}>
                        <Text style={styles.otherOptionName}>{opt.text}</Text>
                        <Text style={styles.otherPercentageText}>
                          {`${opt.votes} vote${opt.votes === 1 ? '' : 's'} · ${opt.percentage}%`}
                        </Text>
                      </View>

                      <View style={styles.progressBarTrack}>
                        <View
                          style={[
                            styles.progressBarFill,
                            styles.otherProgressFill,
                            { width: `${opt.percentage}%` },
                          ]}
                        />
                      </View>

                      {opt.voterInitials && opt.voterInitials.length > 0 && (
                        <View style={styles.votersRow}>
                          {opt.voterInitials.map((voter, idx) => (
                            <View
                              key={`other-voter-${opt.id}-${idx}`}
                              style={[
                                styles.voterAvatar,
                                styles.voterAvatarOther,
                                idx > 0 && styles.voterAvatarOverlap,
                                { backgroundColor: voter.bgColor },
                              ]}
                            >
                              <Text style={styles.voterAvatarText}>{voter.initial}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* AI Plan Recommendation Card */}
              {winningOption && (
                <View style={styles.aiPlanCard}>
                  <Text style={styles.aiPlanSparkle}>✦</Text>
                  <Text style={styles.aiPlanText}>
                    {`Make it a plan? Add “${winningOption.text}” directly to the family calendar.`}
                  </Text>
                </View>
              )}

              {/* Close Poll Option for Creators/Admins */}
              {poll.status === 'active' && poll.canManage && isUUID(poll.id) && (
                <TouchableOpacity
                  style={styles.closePollBtn}
                  onPress={handleClosePoll}
                  disabled={closingPoll}
                  activeOpacity={0.75}
                >
                  {closingPoll ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <>
                      <Feather name="lock" size={16} color={Colors.primary} style={{ marginRight: 8 }} />
                      <Text style={styles.closePollBtnText}>Close poll & finalize winner</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        </ScrollView>

        {/* Bottom Actions */}
        {poll && winningOption && (
          <View
            style={[
              styles.bottomBar,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
          >
            <TouchableOpacity
              style={styles.calendarButton}
              onPress={() => {
                if (isTestEnv && onAddToCalendar) {
                  onAddToCalendar(winningOption.text);
                } else {
                  setShowScheduleModal(true);
                }
              }}
              activeOpacity={0.85}
            >
              <Feather
                name="calendar"
                size={18}
                color={Colors.white}
                style={styles.calendarBtnIcon}
              />
              <Text style={styles.calendarButtonText}>Add to calendar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => onShareInChat?.(poll)}
              activeOpacity={0.7}
            >
              <Text style={styles.chatButtonText}>Share in Family chat</Text>
            </TouchableOpacity>
          </View>
        )}

        <SchedulePollEventModal
          visible={showScheduleModal}
          asModal={false}
          defaultTitle={winningOption?.text || ''}
          pollQuestion={poll?.question}
          members={members}
          onClose={() => setShowScheduleModal(false)}
          onScheduled={(scheduledTitle) => {
            onAddToCalendar?.(scheduledTitle);
            setDialog({
              visible: true,
              type: 'warning',
              iconName: 'check-circle',
              title: 'Added to family calendar',
              description: `“${scheduledTitle}” has been scheduled on your family calendar.`,
              primaryButtonText: 'Done',
              secondaryButtonText: '',
            });
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
  browseAllBtn: {
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: Colors.primary,
  },
  browseAllBtnText: {
    color: Colors.white,
    fontSize: 13.5,
    fontFamily: 'Roboto-Bold',
  },
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
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
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
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    gap: 10,
  },
  closedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3A4556',
  },
  activeBadge: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(240, 145, 58, 0.12)',
  },
  lockIcon: {
    marginRight: 5,
  },
  closedBadgeText: {
    color: '#BDC6D1',
    fontSize: 12,
    fontFamily: 'Roboto-SemiBold',
  },
  activeBadgeText: {
    color: Colors.primary,
  },
  votedSubtitle: {
    color: '#8A97AB',
    fontSize: 13,
    fontFamily: 'Roboto-Medium',
    flexShrink: 1,
  },
  questionTitle: {
    fontSize: 22,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    letterSpacing: -0.3,
    lineHeight: 28,
    marginBottom: 20,
  },
  winnerCard: {
    backgroundColor: '#1A2B47',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    padding: 16,
    marginBottom: 14,
  },
  mostVotesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trophyIcon: {
    marginRight: 6,
  },
  mostVotesLabel: {
    color: Colors.primary,
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 0.8,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  optionNameWithCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  winnerOptionText: {
    color: Colors.white,
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
  },
  checkCircle: {
    marginLeft: 6,
  },
  winnerPercentageText: {
    color: Colors.primary,
    fontSize: 13,
    fontFamily: 'Roboto-SemiBold',
  },
  progressBarTrack: {
    height: 5,
    backgroundColor: '#1F3352',
    borderRadius: 2.5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: 5,
    borderRadius: 2.5,
  },
  otherProgressFill: {
    backgroundColor: '#3A4556',
  },
  votersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voterAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  voterAvatarWinner: {
    borderColor: '#1A2B47',
  },
  voterAvatarOther: {
    borderColor: '#122440',
  },
  voterAvatarOverlap: {
    marginLeft: -5,
  },
  voterAvatarText: {
    color: Colors.white,
    fontSize: 9,
    fontFamily: 'Roboto-Bold',
  },
  otherOptionsCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
  },
  otherOptionItem: {},
  otherOptionItemSpaced: {
    marginTop: 16,
  },
  otherOptionName: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
    flex: 1,
    marginRight: 8,
  },
  otherPercentageText: {
    color: '#8FA0B5',
    fontSize: 13,
    fontFamily: 'Roboto-Medium',
  },
  aiPlanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2B47',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1F3352',
    marginBottom: 16,
  },
  aiPlanSparkle: {
    fontSize: 18,
    lineHeight: 20,
    color: Colors.primary,
    marginRight: 12,
  },
  aiPlanText: {
    color: '#CAD4DF',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
    fontFamily: 'Roboto-Medium',
  },
  closePollBtn: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  closePollBtnText: {
    color: Colors.primary,
    fontSize: 14.5,
    fontFamily: 'Roboto-Bold',
  },
  emptyCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
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
    alignItems: 'center',
  },
  calendarButton: {
    width: '100%',
    height: 54,
    backgroundColor: Colors.primary,
    borderRadius: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  calendarBtnIcon: {
    marginRight: 8,
  },
  calendarButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
  chatButton: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
  },
});

export default PollResultsModal;
