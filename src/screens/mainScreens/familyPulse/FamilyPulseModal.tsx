import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  RefreshControl,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Ionicons from '@react-native-vector-icons/ionicons';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useAppDispatch, useAppSelector } from '../../../redux';
import { getMyFamilyBasicThunk } from '../../../redux/features/family/familySlice';
import {
  fetchPollResultsThunk,
  fetchPulseHomeThunk,
  reactToAppreciationThunk,
  reactToMilestoneThunk,
  removeAppreciationReactionThunk,
  removeMilestoneReactionThunk,
  setSelectedPollLocal,
  setTodayMoodThunk,
  voteOnPollThunk,
} from '../../../redux/features/pulse/pulseSlice';
import { isUUID } from '../../../redux/features/lists/listsSlice';
import { PulseHomeResponse } from '../../../services/pulseServices';
import { PulseHomeSkeleton } from '../../../components/SkeletonLoader';
import Colors from '../../../units/Colors';
import {
  AppreciationItem,
  FamilyMemberPulse,
  MilestoneItem,
  MoodType,
  PollItem,
} from './types';
import { TodayMoodModal } from './TodayMoodModal';
import { WriteAppreciationModal } from './WriteAppreciationModal';
import { AppreciationWallModal } from './AppreciationWallModal';
import { ReactionPackModal } from './ReactionPackModal';
import { FamilyPollsModal } from './FamilyPollsModal';
import { CreatePollModal } from './CreatePollModal';
import { PollResultsModal } from './PollResultsModal';
import { MilestonesModal } from './MilestonesModal';
import { AddMilestoneModal } from './AddMilestoneModal';
import { MilestoneDetailModal } from './MilestoneDetailModal';
import PulseModalContainer from './PulseModalContainer';
import PulseDialog, {
  INITIAL_PULSE_DIALOG_STATE,
  PulseDialogState,
} from './PulseDialog';
import {
  extractPulseMembersFromFamilyState,
  formatApiMoodLabel,
  getAvatarPaletteStyle,
  getPulseInitial,
  getReactionMeta,
  isJestTestEnv,
  mapApiAppreciationToUi,
  mapApiMilestoneToUi,
  mapApiMoodToUiType,
  mapApiPollToUi,
  MOOD_API_MAP,
  reactionApiToUiId,
  scheduleAfterTransition,
} from './pulseApiHelpers';

export interface FamilyPulseModalProps {
  visible: boolean;
  asModal?: boolean;
  onClose: () => void;
  isEmpty?: boolean;
  initialHomeData?: PulseHomeResponse | null;
}

export const FamilyPulseModal: React.FC<FamilyPulseModalProps> = ({
  visible,
  asModal = true,
  onClose,
  isEmpty,
  initialHomeData,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const pulseState = useAppSelector((state) => state.pulse);
  const familyState = useAppSelector((state) => state.family);

  const [refreshing, setRefreshing] = useState(false);
  const [localMoodOverride, setLocalMoodOverride] = useState<{
    mood: MoodType;
    note?: string;
  } | null>(null);
  const [dialog, setDialog] = useState<PulseDialogState>(INITIAL_PULSE_DIALOG_STATE);

  // Sub-modals visibility
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showWriteAppreciation, setShowWriteAppreciation] = useState(false);
  const [showAppreciationWall, setShowAppreciationWall] = useState(false);
  const [showPollsModal, setShowPollsModal] = useState(false);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [showPollResults, setShowPollResults] = useState(false);
  const [selectedPollForResults, setSelectedPollForResults] =
    useState<PollItem | null>(null);
  const [showMilestonesModal, setShowMilestonesModal] = useState(false);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [selectedDetailMilestone, setSelectedDetailMilestone] =
    useState<MilestoneItem | null>(null);

  // Shared ReactionPackModal target (appreciation OR milestone)
  const [reactionTarget, setReactionTarget] = useState<{
    kind: 'appreciation' | 'milestone';
    id: string;
    title: string;
    reactions?: AppreciationItem['reactions'];
  } | null>(null);

  useEffect(() => {
    if (!visible) {
      setShowMoodModal(false);
      setShowWriteAppreciation(false);
      setShowAppreciationWall(false);
      setShowPollsModal(false);
      setShowCreatePoll(false);
      setShowPollResults(false);
      setShowMilestonesModal(false);
      setShowAddMilestone(false);
      setSelectedDetailMilestone(null);
      setReactionTarget(null);
      return;
    }
    if (initialHomeData !== undefined || isJestTestEnv()) return;
    return scheduleAfterTransition(() => {
      dispatch(getMyFamilyBasicThunk());
      dispatch(fetchPulseHomeThunk());
    });
  }, [visible, initialHomeData, dispatch]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(getMyFamilyBasicThunk()),
        dispatch(fetchPulseHomeThunk()),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const homeData: PulseHomeResponse | null =
    initialHomeData !== undefined ? initialHomeData : pulseState?.home || null;

  const baseFamilyMembers = useMemo(
    () => extractPulseMembersFromFamilyState(familyState),
    [familyState]
  );

  // Merge mood check-ins from /pulse home with family roster
  const membersList: FamilyMemberPulse[] = useMemo(() => {
    const moodMembers = homeData?.moods?.members || [];
    if (moodMembers.length > 0) {
      const familyMap = new Map(baseFamilyMembers.map((m) => [m.id, m]));
      return moodMembers.map((mm, idx) => {
        const base = familyMap.get(mm.memberId);
        const fullName = mm.fullName || base?.name || 'Member';
        const firstName = fullName.split(/\s+/)[0] || fullName;
        const isYou = Boolean(mm.isMe || mm.isYou || base?.isYou);
        const palette = base
          ? { bgColor: base.bgColor, textColor: base.textColor }
          : getAvatarPaletteStyle(idx, mm.avatarColor);
        const uiMoodType =
          isYou && localMoodOverride
            ? localMoodOverride.mood
            : mapApiMoodToUiType(mm.mood);
        const moodNote =
          isYou && localMoodOverride ? localMoodOverride.note : mm.note;

        return {
          id: mm.memberId,
          name: firstName,
          displayName: isYou ? 'You' : firstName,
          initial: getPulseInitial(fullName),
          bgColor: palette.bgColor,
          textColor: palette.textColor,
          role: base?.role,
          familyRole: base?.familyRole,
          isYou,
          isAdult: base?.isAdult,
          hasAccount: base?.hasAccount,
          mood: uiMoodType
            ? {
                type: uiMoodType,
                apiMood: mm.mood || MOOD_API_MAP[uiMoodType].api,
                label: MOOD_API_MAP[uiMoodType].label || formatApiMoodLabel(mm.mood),
                note: moodNote || null,
              }
            : undefined,
        };
      });
    }

    return baseFamilyMembers.map((m) => {
      if (m.isYou && localMoodOverride) {
        return {
          ...m,
          mood: {
            type: localMoodOverride.mood,
            label: MOOD_API_MAP[localMoodOverride.mood].label,
            note: localMoodOverride.note || null,
          },
        };
      }
      return m;
    });
  }, [homeData?.moods?.members, baseFamilyMembers, localMoodOverride]);

  const memberLookup = useMemo(() => {
    const map = new Map<string, FamilyMemberPulse>();
    membersList.forEach((m) => map.set(m.id, m));
    return map;
  }, [membersList]);

  const myMember = useMemo(
    () => membersList.find((m) => m.isYou),
    [membersList]
  );

  const familyName =
    homeData?.familyName ||
    familyState?.basicFamilyData?.family?.name ||
    (familyState?.basicFamilyData as any)?.name ||
    familyState?.myFamilyData?.family?.name ||
    'Family';

  const latestAppreciation: AppreciationItem | null = useMemo(() => {
    if (!homeData?.latestAppreciation) return null;
    return mapApiAppreciationToUi(
      homeData.latestAppreciation,
      memberLookup,
      myMember?.id
    );
  }, [homeData?.latestAppreciation, memberLookup, myMember?.id]);

  const openPoll: PollItem | null = useMemo(() => {
    if (!homeData?.openPoll) return null;
    return mapApiPollToUi(homeData.openPoll, memberLookup, myMember?.id);
  }, [homeData?.openPoll, memberLookup, myMember?.id]);

  const latestMilestone: MilestoneItem | null = useMemo(() => {
    if (!homeData?.latestMilestone) return null;
    return mapApiMilestoneToUi(
      homeData.latestMilestone,
      memberLookup,
      myMember?.id
    );
  }, [homeData?.latestMilestone, memberLookup, myMember?.id]);

  const checkedInCount =
    homeData?.moods?.checkedIn ??
    membersList.filter((m) => Boolean(m.mood)).length;
  const totalMembersCount = homeData?.moods?.total ?? membersList.length;

  const myMoodType: MoodType | undefined =
    localMoodOverride?.mood ||
    myMember?.mood?.type ||
    mapApiMoodToUiType(homeData?.moods?.mine);

  const handleSelectMood = async (mood: MoodType, note = '') => {
    setLocalMoodOverride({ mood, note });
    if (isJestTestEnv()) return;

    const res = await dispatch(
      setTodayMoodThunk({
        mood: MOOD_API_MAP[mood].api,
        ...(note.trim() ? { note: note.trim() } : { note: '' }),
      })
    );
    if (setTodayMoodThunk.rejected.match(res)) {
      setDialog({
        visible: true,
        type: 'danger',
        iconName: 'alert-circle',
        title: 'Mood check-in failed',
        description: (res.payload as string) || 'Unable to save today mood.',
        primaryButtonText: 'OK',
        secondaryButtonText: '',
      });
    }
  };

  const handleQuickReactionSelect = async (_reactionId: string, apiCode: string) => {
    if (!reactionTarget || !isUUID(reactionTarget.id)) return;
    const currentMine = reactionTarget.reactions?.mine?.toUpperCase();

    if (reactionTarget.kind === 'appreciation') {
      if (currentMine === apiCode.toUpperCase()) {
        await dispatch(removeAppreciationReactionThunk(reactionTarget.id));
      } else {
        await dispatch(
          reactToAppreciationThunk({ id: reactionTarget.id, reaction: apiCode })
        );
      }
      return;
    }

    if (currentMine === apiCode.toUpperCase()) {
      await dispatch(removeMilestoneReactionThunk(reactionTarget.id));
    } else {
      await dispatch(
        reactToMilestoneThunk({ id: reactionTarget.id, reaction: apiCode })
      );
    }
  };

  const handleVoteOpenPollOption = async (optionId: string) => {
    if (!openPoll || openPoll.status !== 'active' || openPoll.canVote === false) {
      return;
    }
    if (!isUUID(openPoll.id)) return;
    await dispatch(voteOnPollThunk({ pollId: openPoll.id, optionIds: [optionId] }));
  };

  const handleOpenPollResults = (poll: PollItem) => {
    if (homeData?.openPoll && homeData.openPoll.id === poll.id) {
      dispatch(setSelectedPollLocal(homeData.openPoll));
    }
    if (isUUID(poll.id) && !isJestTestEnv()) {
      dispatch(fetchPollResultsThunk(poll.id));
    }
    setSelectedPollForResults(poll);
    setShowPollResults(true);
  };

  const renderMoodStatus = (mood?: FamilyMemberPulse['mood']) => {
    if (!mood) {
      return <Text style={styles.notYetText}>Not yet</Text>;
    }
    const meta = MOOD_API_MAP[mood.type];
    return (
      <View style={styles.moodStatusRow}>
        <Feather
          name={(meta?.icon as any) || 'smile'}
          size={12}
          color={meta?.color || Colors.accentGreenSoft}
          style={styles.moodStatusIcon}
        />
        <Text
          style={[
            styles.moodStatusText,
            { color: meta?.color || Colors.accentGreenSoft },
          ]}
        >
          {mood.label}
        </Text>
      </View>
    );
  };

  const isLoadingHome =
    initialHomeData === undefined &&
    isEmpty !== true &&
    !isJestTestEnv() &&
    !refreshing &&
    (Boolean(pulseState?.loadingHome) || !pulseState?.hasLoadedHome);

  const isEmptyState =
    isEmpty === true ||
    (!isLoadingHome &&
      initialHomeData === undefined &&
      Boolean(pulseState?.hasLoadedHome) &&
      (homeData?.isEmpty === true || (!homeData && membersList.length === 0)));

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
            style={styles.circleButton}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Feather name="chevron-left" size={22} color={Colors.white} />
          </TouchableOpacity>

          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerTitle}>Family Pulse</Text>
            <Text style={styles.headerSubtitle}>{familyName}</Text>
          </View>

          <View style={styles.headerRightSpacer} />
        </View>

        {isLoadingHome ? (
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.primary}
              />
            }
          >
            <PulseHomeSkeleton />
          </ScrollView>
        ) : isEmptyState ? (
          <View style={styles.emptyContainer}>
            <ScrollView
              contentContainerStyle={styles.emptyScrollContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor={Colors.primary}
                />
              }
            >
              <View style={styles.emptyContent}>
                <View style={styles.waveformOuterRing}>
                  <View style={styles.waveformInnerRing}>
                    <Feather name="activity" size={32} color={Colors.primary} />
                  </View>
                </View>

                <Text style={styles.emptyTitle}>Nothing in the pulse yet</Text>
                <Text style={styles.emptySubtitle}>
                  Share how you're feeling today, appreciate someone in the family,
                  or start a quick poll.
                </Text>
              </View>
            </ScrollView>

            <View
              style={[
                styles.emptyBottomBar,
                { paddingBottom: Math.max(insets.bottom + 12, 24) },
              ]}
            >
              <TouchableOpacity
                style={styles.emptyPrimaryBtn}
                onPress={() => setShowMoodModal(true)}
                activeOpacity={0.85}
              >
                <Feather
                  name="smile"
                  size={18}
                  color={Colors.white}
                  style={styles.btnIcon}
                />
                <Text style={styles.emptyPrimaryBtnText}>
                  Check in my mood today
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.emptySecondaryBtn}
                onPress={() => setShowWriteAppreciation(true)}
                activeOpacity={0.85}
              >
                <Feather
                  name="heart"
                  size={18}
                  color={Colors.white}
                  style={styles.btnIcon}
                />
                <Text style={styles.emptySecondaryBtnText}>
                  Write an appreciation
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.emptyTertiaryBtn}
                onPress={() => setShowCreatePoll(true)}
                activeOpacity={0.75}
              >
                <Text style={styles.emptyTertiaryBtnText}>Start a poll</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom + 24, 40) },
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
            {/* Today's Moods Card */}
            <View style={styles.moodCard}>
              <View style={styles.moodCardHeader}>
                <Text style={styles.moodCardHeaderTitle}>TODAY'S MOODS</Text>
                <Text style={styles.moodCardHeaderCount}>
                  {checkedInCount} of {totalMembersCount} checked in
                </Text>
              </View>

              <View style={styles.membersMoodRow}>
                {membersList.slice(0, 5).map((member) => {
                  const isNotCheckedIn = !member.mood;
                  return (
                    <TouchableOpacity
                      key={member.id}
                      style={styles.memberMoodItem}
                      activeOpacity={member.isYou ? 0.7 : 1}
                      onPress={() => {
                        if (member.isYou) setShowMoodModal(true);
                      }}
                    >
                      <View
                        style={[
                          styles.memberAvatarCircle,
                          { backgroundColor: member.bgColor },
                          isNotCheckedIn && styles.memberAvatarCircleNotCheckedIn,
                        ]}
                      >
                        <Text
                          style={[
                            styles.memberAvatarInitial,
                            { color: member.textColor },
                          ]}
                        >
                          {member.initial}
                        </Text>
                      </View>
                      <Text style={styles.memberMoodName} numberOfLines={1}>
                        {member.displayName}
                      </Text>
                      {renderMoodStatus(member.mood)}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Quick Action Buttons */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowWriteAppreciation(true)}
                activeOpacity={0.8}
              >
                <Feather
                  name="heart"
                  size={20}
                  color={Colors.primary}
                  style={styles.actionBtnIcon}
                />
                <Text style={styles.actionBtnText} numberOfLines={1}>
                  Appreciation
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowMoodModal(true)}
                activeOpacity={0.8}
              >
                <Feather
                  name="smile"
                  size={20}
                  color={Colors.primary}
                  style={styles.actionBtnIcon}
                />
                <Text style={styles.actionBtnText} numberOfLines={1}>
                  Mood
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowCreatePoll(true)}
                activeOpacity={0.8}
              >
                <View style={styles.pollBarsIconContainer}>
                  <View style={[styles.pollBar, styles.pollBarLeft]} />
                  <View style={[styles.pollBar, styles.pollBarCenter]} />
                  <View style={[styles.pollBar, styles.pollBarRight]} />
                </View>
                <Text style={styles.actionBtnText} numberOfLines={1}>
                  Poll
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowAddMilestone(true)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="trophy-outline"
                  size={20}
                  color={Colors.primary}
                  style={styles.actionBtnIcon}
                />
                <Text style={styles.actionBtnText} numberOfLines={1}>
                  Milestone
                </Text>
              </TouchableOpacity>
            </View>

            {/* Appreciation wall Section */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Appreciation wall</Text>
              <TouchableOpacity
                onPress={() => setShowAppreciationWall(true)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="See all appreciations"
              >
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            {latestAppreciation ? (
              <View style={styles.previewCard}>
                <View style={styles.previewCardHeader}>
                  <View style={styles.previewActorsGroup}>
                    <View
                      style={[
                        styles.smallAvatar,
                        { backgroundColor: latestAppreciation.senderColor },
                      ]}
                    >
                      <Text
                        style={[
                          styles.smallAvatarText,
                          {
                            color:
                              latestAppreciation.senderTextColor || Colors.white,
                          },
                        ]}
                      >
                        {latestAppreciation.senderInitial}
                      </Text>
                    </View>
                    <Feather
                      name="chevron-right"
                      size={12}
                      color={Colors.textSubtle}
                      style={styles.smallChevron}
                    />
                    <View
                      style={[
                        styles.smallAvatar,
                        { backgroundColor: latestAppreciation.receiverColor },
                      ]}
                    >
                      <Text
                        style={[
                          styles.smallAvatarText,
                          {
                            color:
                              latestAppreciation.receiverTextColor || Colors.white,
                          },
                        ]}
                      >
                        {latestAppreciation.receiverInitial}
                      </Text>
                    </View>
                    <Text style={styles.previewActorTitle} numberOfLines={1}>
                      {latestAppreciation.senderName} to{' '}
                      {latestAppreciation.receiverName}
                    </Text>
                  </View>
                  <Text style={styles.previewTimeText}>
                    {latestAppreciation.timeText}
                  </Text>
                </View>

                <Text style={styles.previewMessage}>
                  {latestAppreciation.message}
                </Text>

                <View style={styles.previewReactionsRow}>
                  {(latestAppreciation.reactions?.counts || [])
                    .filter((rc) => rc.count > 0)
                    .map((rc) => {
                      const isMine =
                        latestAppreciation.reactions?.mine?.toUpperCase() ===
                        rc.reaction.toUpperCase();
                      const meta = getReactionMeta(rc.reaction);
                      return (
                        <TouchableOpacity
                          key={rc.reaction}
                          style={[
                            styles.previewReactionPill,
                            isMine && {
                              backgroundColor: meta.tintBg,
                              borderColor: meta.color,
                            },
                          ]}
                          onPress={() =>
                            setReactionTarget({
                              kind: 'appreciation',
                              id: latestAppreciation.id,
                              title: `Appreciation from ${latestAppreciation.senderName}`,
                              reactions: latestAppreciation.reactions,
                            })
                          }
                          activeOpacity={0.75}
                        >
                          {meta.iconType === 'material' ? (
                            <MaterialIcons
                              name={meta.iconName as any}
                              size={14}
                              color={meta.color}
                            />
                          ) : (
                            <Feather
                              name={meta.iconName as any}
                              size={14}
                              color={meta.color}
                            />
                          )}
                          <Text
                            style={[
                              styles.previewReactionText,
                              isMine && { color: meta.color, fontFamily: 'Roboto-Bold' },
                            ]}
                          >
                            {isMine ? `${meta.label} · ${rc.count}` : rc.count}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}

                  <TouchableOpacity
                    style={styles.previewReactionPill}
                    onPress={() =>
                      setReactionTarget({
                        kind: 'appreciation',
                        id: latestAppreciation.id,
                        title: `Appreciation from ${latestAppreciation.senderName}`,
                        reactions: latestAppreciation.reactions,
                      })
                    }
                    activeOpacity={0.75}
                    accessibilityRole="button"
                    accessibilityLabel="React to appreciation"
                  >
                    <Feather name="plus" size={14} color={Colors.primary} />
                    {(!latestAppreciation.reactions?.counts ||
                      latestAppreciation.reactions.counts.length === 0) && (
                      <Text style={styles.previewReactionText}>React</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.sectionEmptyCard}
                onPress={() => setShowWriteAppreciation(true)}
                activeOpacity={0.8}
              >
                <Feather name="heart" size={18} color={Colors.primary} />
                <Text style={styles.sectionEmptyText}>
                  No appreciations yet — send the first thank-you note
                </Text>
              </TouchableOpacity>
            )}

            {/* Family poll Section */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Family poll</Text>
              <TouchableOpacity
                onPress={() => setShowPollsModal(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            {openPoll ? (
              <TouchableOpacity
                style={styles.previewCard}
                onPress={() => handleOpenPollResults(openPoll)}
                activeOpacity={0.9}
              >
                <Text style={styles.pollPreviewQuestion}>
                  {openPoll.question}
                </Text>

                {openPoll.options.slice(0, 3).map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={styles.pollPreviewOption}
                    activeOpacity={0.8}
                    onPress={() => handleVoteOpenPollOption(option.id)}
                  >
                    <View style={styles.pollPreviewLabelRow}>
                      <View style={styles.optionNameWithCheck}>
                        <Text style={styles.pollOptionName}>{option.text}</Text>
                        {option.isUserVoted ? (
                          <Feather
                            name="check"
                            size={15}
                            color={Colors.primary}
                            style={styles.checkIcon}
                          />
                        ) : null}
                      </View>
                      <Text
                        style={
                          option.isUserVoted
                            ? styles.pollOptionPercentActive
                            : styles.pollOptionPercent
                        }
                      >
                        {option.percentage}%
                      </Text>
                    </View>
                    <View style={styles.pollTrack}>
                      <View
                        style={[
                          styles.pollFill,
                          option.isUserVoted
                            ? styles.pollFillActive
                            : styles.pollFillInactive,
                          { width: `${Math.max(option.percentage, 3)}%` },
                        ]}
                      />
                    </View>
                  </TouchableOpacity>
                ))}

                <Text style={styles.pollPreviewFooter}>
                  {openPoll.totalVotes} of {openPoll.eligibleCount} voted ·{' '}
                  {openPoll.closesText}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.sectionEmptyCard}
                onPress={() => setShowCreatePoll(true)}
                activeOpacity={0.8}
              >
                <Feather name="bar-chart-2" size={18} color={Colors.primary} />
                <Text style={styles.sectionEmptyText}>
                  No open polls — create one to decide together
                </Text>
              </TouchableOpacity>
            )}

            {/* Milestones Section */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Milestones</Text>
              <TouchableOpacity
                onPress={() => setShowMilestonesModal(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            {latestMilestone ? (
              <TouchableOpacity
                style={styles.previewCard}
                onPress={() => setSelectedDetailMilestone(latestMilestone)}
                activeOpacity={0.85}
              >
                {latestMilestone.photos && latestMilestone.photos.length > 0 ? (
                  <Image
                    source={{ uri: latestMilestone.photos[0] }}
                    style={styles.milestonePreviewPhoto}
                    resizeMode="cover"
                  />
                ) : null}

                <View style={styles.milestoneCategoryRow}>
                  <Ionicons
                    name="trophy-outline"
                    size={15}
                    color={Colors.primary}
                    style={styles.awardIcon}
                  />
                  <Text style={styles.milestoneCategoryText}>
                    {latestMilestone.categoryTag ||
                      latestMilestone.personName.toUpperCase()}
                  </Text>
                </View>

                <Text style={styles.milestoneTitle}>{latestMilestone.title}</Text>

                <View style={styles.milestoneFooterRow}>
                  <Text style={styles.milestoneSubtext}>
                    {latestMilestone.dateText} · {latestMilestone.authorText}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.milestoneReactPill,
                      Boolean(latestMilestone.reactions?.mine) &&
                        styles.milestoneReactPillActive,
                    ]}
                    onPress={() =>
                      setReactionTarget({
                        kind: 'milestone',
                        id: latestMilestone.id,
                        title: latestMilestone.title,
                        reactions: latestMilestone.reactions,
                      })
                    }
                    activeOpacity={0.8}
                  >
                    <Feather
                      name="heart"
                      size={12}
                      color={
                        latestMilestone.reactions?.mine
                          ? Colors.primary
                          : Colors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.milestoneReactText,
                        Boolean(latestMilestone.reactions?.mine) &&
                          styles.milestoneReactTextActive,
                      ]}
                    >
                      {latestMilestone.reactionsCount}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.sectionEmptyCard}
                onPress={() => setShowAddMilestone(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="trophy-outline" size={18} color={Colors.primary} />
                <Text style={styles.sectionEmptyText}>
                  No milestones yet — add a family moment
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}

        {/* Sub-Screens (rendered as animated inline overlays for 60fps transitions) */}
        <AppreciationWallModal
          visible={showAppreciationWall}
          asModal={false}
          members={membersList}
          onClose={() => setShowAppreciationWall(false)}
          onOpenWrite={() => setShowWriteAppreciation(true)}
        />

        <FamilyPollsModal
          visible={showPollsModal}
          asModal={false}
          onClose={() => setShowPollsModal(false)}
          onOpenCreatePoll={() => setShowCreatePoll(true)}
          onOpenPollResults={(poll) => handleOpenPollResults(poll)}
        />

        <CreatePollModal
          visible={showCreatePoll}
          asModal={false}
          members={membersList}
          onClose={() => setShowCreatePoll(false)}
        />

        <PollResultsModal
          visible={showPollResults}
          asModal={false}
          pollId={selectedPollForResults?.id}
          poll={selectedPollForResults || undefined}
          onClose={() => setShowPollResults(false)}
        />

        <MilestonesModal
          visible={showMilestonesModal}
          asModal={false}
          members={membersList}
          onClose={() => setShowMilestonesModal(false)}
          onOpenAddMilestone={() => setShowAddMilestone(true)}
          onSelectMilestone={(ms) => setSelectedDetailMilestone(ms)}
        />

        <AddMilestoneModal
          visible={showAddMilestone}
          asModal={false}
          members={membersList}
          onClose={() => setShowAddMilestone(false)}
        />

        <MilestoneDetailModal
          visible={Boolean(selectedDetailMilestone)}
          asModal={false}
          milestone={selectedDetailMilestone}
          members={membersList}
          onClose={() => setSelectedDetailMilestone(null)}
          onMilestoneDeleted={() => setSelectedDetailMilestone(null)}
        />

        <TodayMoodModal
          visible={showMoodModal}
          asModal={false}
          currentMood={myMoodType}
          currentNote={myMember?.mood?.note}
          saving={pulseState?.submittingMood}
          onClose={() => setShowMoodModal(false)}
          onSelectMood={handleSelectMood}
        />

        <WriteAppreciationModal
          visible={showWriteAppreciation}
          asModal={false}
          members={membersList}
          familyName={familyName}
          onClose={() => setShowWriteAppreciation(false)}
        />

        <ReactionPackModal
          visible={Boolean(reactionTarget)}
          asModal={false}
          targetTitle={reactionTarget?.title}
          selectedReactionId={reactionApiToUiId(reactionTarget?.reactions?.mine)}
          reactionsSummary={reactionTarget?.reactions}
          members={membersList}
          onClose={() => setReactionTarget(null)}
          onSelectReaction={handleQuickReactionSelect}
          onRemoveReaction={async () => {
            if (!reactionTarget || !isUUID(reactionTarget.id)) return;
            if (reactionTarget.kind === 'appreciation') {
              await dispatch(removeAppreciationReactionThunk(reactionTarget.id));
            } else {
              await dispatch(removeMilestoneReactionThunk(reactionTarget.id));
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderMutedAlt,
  },
  headerTitleGroup: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSubtle,
    marginTop: 2,
  },
  headerRightSpacer: {
    width: 44,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  emptyScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  waveformOuterRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(240, 145, 58, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(240, 145, 58, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  waveformInnerRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(240, 145, 58, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyBottomBar: {
    paddingHorizontal: 20,
    gap: 12,
  },
  emptyPrimaryBtn: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPrimaryBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
  emptySecondaryBtn: {
    height: 52,
    backgroundColor: Colors.cardBackground,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySecondaryBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
  btnIcon: {
    marginRight: 8,
  },
  emptyTertiaryBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTertiaryBtnText: {
    color: Colors.primary,
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  moodCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  moodCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  moodCardHeaderTitle: {
    color: Colors.primary,
    fontSize: 11.5,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 0.8,
  },
  moodCardHeaderCount: {
    color: Colors.textSubtle,
    fontSize: 12.5,
    fontFamily: 'Roboto-Regular',
  },
  membersMoodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  memberMoodItem: {
    alignItems: 'center',
    flex: 1,
  },
  memberAvatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  memberAvatarCircleNotCheckedIn: {
    opacity: 0.45,
  },
  memberAvatarInitial: {
    fontSize: 17,
    fontFamily: 'Roboto-Bold',
  },
  memberMoodName: {
    fontSize: 12.5,
    fontFamily: 'Roboto-SemiBold',
    color: Colors.white,
    marginBottom: 4,
  },
  moodStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodStatusIcon: {
    marginRight: 4,
  },
  moodStatusText: {
    fontSize: 12,
    fontFamily: 'Roboto-SemiBold',
  },
  notYetText: {
    fontSize: 12,
    color: Colors.textSubtle,
    fontFamily: 'Roboto-Regular',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 28,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#243A5E',
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  actionBtnIcon: {
    marginBottom: 8,
  },
  pollBarsIconContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 20,
    gap: 4,
    marginBottom: 8,
    justifyContent: 'center',
  },
  pollBar: {
    width: 2.8,
    backgroundColor: Colors.primary,
    borderRadius: 1.5,
  },
  pollBarLeft: {
    height: 11,
  },
  pollBarCenter: {
    height: 18,
  },
  pollBarRight: {
    height: 8,
  },
  actionBtnText: {
    color: Colors.white,
    fontSize: 13.5,
    fontFamily: 'Roboto-SemiBold',
    textAlign: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    letterSpacing: -0.3,
  },
  seeAllText: {
    color: Colors.primary,
    fontSize: 14,
    fontFamily: 'Roboto-SemiBold',
  },
  sectionEmptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.cardBackground,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 24,
  },
  sectionEmptyText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 13.5,
    fontFamily: 'Roboto-Medium',
  },
  previewCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 24,
  },
  previewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  previewActorsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  smallAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallAvatarText: {
    fontSize: 13,
    fontFamily: 'Roboto-Bold',
  },
  smallChevron: {
    marginHorizontal: 6,
  },
  previewActorTitle: {
    marginLeft: 8,
    color: Colors.white,
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
    flexShrink: 1,
  },
  previewTimeText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: 'Roboto-Medium',
  },
  previewMessage: {
    color: Colors.textNearWhite,
    fontSize: 14.5,
    lineHeight: 21,
    marginBottom: 14,
  },
  previewReactionsRow: {
    flexDirection: 'row',
    gap: 9,
  },
  previewReactionPillActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 145, 58, 0.08)',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  previewReactionTextActive: {
    color: Colors.primary,
    fontSize: 13,
    fontFamily: 'Roboto-Bold',
  },
  previewReactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#243A5E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  previewReactionText: {
    color: Colors.white,
    fontSize: 13,
    fontFamily: 'Roboto-SemiBold',
  },
  pollPreviewQuestion: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    lineHeight: 22,
    marginBottom: 16,
  },
  pollPreviewOption: {
    marginBottom: 16,
  },
  pollPreviewLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  optionNameWithCheck: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pollOptionName: {
    color: Colors.white,
    fontSize: 15,
    fontFamily: 'Roboto-SemiBold',
  },
  checkIcon: {
    marginLeft: 8,
  },
  pollOptionPercent: {
    color: Colors.textSubtle,
    fontSize: 14.5,
    fontFamily: 'Roboto-SemiBold',
  },
  pollOptionPercentActive: {
    color: Colors.primary,
    fontSize: 14.5,
    fontFamily: 'Roboto-Bold',
  },
  pollTrack: {
    height: 6,
    backgroundColor: '#162844',
    borderRadius: 3,
    overflow: 'hidden',
  },
  pollFill: {
    height: 6,
    borderRadius: 3,
  },
  pollFillActive: {
    backgroundColor: Colors.primary,
  },
  pollFillInactive: {
    backgroundColor: '#273C56',
  },
  pollPreviewFooter: {
    color: Colors.textSubtle,
    fontSize: 13,
    marginTop: 2,
    fontFamily: 'Roboto-Regular',
  },
  milestonePreviewPhoto: {
    width: '100%',
    height: 132,
    borderRadius: 14,
    marginBottom: 12,
    backgroundColor: '#132238',
  },
  milestoneCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  awardIcon: {
    marginRight: 6,
  },
  milestoneCategoryText: {
    color: Colors.primary,
    fontSize: 11,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 0.6,
  },
  milestoneTitle: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
    color: Colors.white,
    marginBottom: 6,
  },
  milestoneFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  milestoneSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  milestoneReactPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#243A5E',
  },
  milestoneReactPillActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(240, 145, 58, 0.1)',
  },
  milestoneReactText: {
    fontSize: 12,
    fontFamily: 'Roboto-Medium',
    color: Colors.textSecondary,
  },
  milestoneReactTextActive: {
    color: Colors.primary,
    fontFamily: 'Roboto-Bold',
  },
});

export default FamilyPulseModal;
