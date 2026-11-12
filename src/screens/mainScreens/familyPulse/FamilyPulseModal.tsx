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
import {
  MoodType,
  FamilyMemberPulse,
} from './types';
import { TodayMoodModal } from './TodayMoodModal';
import { WriteAppreciationModal } from './WriteAppreciationModal';
import { ReactionPackModal } from './ReactionPackModal';
import { FamilyPollsModal } from './FamilyPollsModal';
import { CreatePollModal } from './CreatePollModal';
import { PollResultsModal } from './PollResultsModal';
import { MilestonesModal } from './MilestonesModal';
import { AddMilestoneModal } from './AddMilestoneModal';

export interface FamilyPulseModalProps {
  visible: boolean;
  onClose: () => void;
  isEmpty?: boolean;
}

const DEFAULT_MEMBERS: FamilyMemberPulse[] = [
  {
    id: 'you',
    name: 'You',
    displayName: 'You',
    initial: 'P',
    bgColor: Colors.avatarBrown,
    textColor: Colors.white,
    mood: { type: 'good', label: 'Good' },
  },
  {
    id: 'rohan',
    name: 'Rohan',
    displayName: 'Rohan',
    initial: 'R',
    bgColor: Colors.avatarNavy,
    textColor: Colors.white,
    mood: { type: 'tired', label: 'Tired' },
  },
  {
    id: 'dadi',
    name: 'Dadi',
    displayName: 'Dadi',
    initial: 'D',
    bgColor: Colors.avatarGreen,
    textColor: Colors.white,
    mood: { type: 'great', label: 'Great' },
  },
  {
    id: 'anaya',
    name: 'Anaya',
    displayName: 'Anaya',
    initial: 'A',
    bgColor: Colors.avatarWine,
    textColor: Colors.white,
  },
  {
    id: 'aarav',
    name: 'Aarav',
    displayName: 'Aarav',
    initial: 'Aa',
    bgColor: Colors.avatarOlive,
    textColor: Colors.white,
  },
];

export const FamilyPulseModal: React.FC<FamilyPulseModalProps> = ({
  visible,
  onClose,
  isEmpty: initialEmpty = false,
}) => {
  const insets = useSafeAreaInsets();
  const [isEmpty, setIsEmpty] = useState(initialEmpty);
  const [members, setMembers] = useState<FamilyMemberPulse[]>(DEFAULT_MEMBERS);

  // Sub-modal states
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showWriteAppreciation, setShowWriteAppreciation] = useState(false);
  const [showReactionPack, setShowReactionPack] = useState(false);
  const [showPollsModal, setShowPollsModal] = useState(false);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [showPollResults, setShowPollResults] = useState(false);
  const [showMilestonesModal, setShowMilestonesModal] = useState(false);
  const [showAddMilestone, setShowAddMilestone] = useState(false);

  const handleSelectMood = (mood: MoodType, note?: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === 'you'
          ? {
              ...m,
              mood: {
                type: mood,
                label: mood.charAt(0).toUpperCase() + mood.slice(1),
                note,
              },
            }
          : m
      )
    );
    if (isEmpty) {
      setIsEmpty(false);
    }
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
            style={styles.circleButton}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Feather name="chevron-left" size={24} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerTitle}>Family Pulse</Text>
            <Text style={styles.headerSubtitle}>The Sharma Family</Text>
          </View>
          <View style={styles.headerRightSpacer} />
        </View>

        {isEmpty ? (
          /* Empty State (PUL-11) */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyContent}>
              {/* Concentric Circle Waveform */}
              <View style={styles.waveformOuterRing}>
                <View style={styles.waveformInnerRing}>
                  <Feather name="activity" size={32} color={Colors.primary} />
                </View>
              </View>

              <Text style={styles.emptyTitle}>It’s quiet in here</Text>
              <Text style={styles.emptySubtitle}>
                Share how you feel, thank someone or start a poll. Everyone in your
                family will see it here.
              </Text>
            </View>

            {/* Bottom Actions for Empty State */}
            <View
              style={[
                styles.emptyBottomBar,
                { paddingBottom: Math.max(insets.bottom, 20) },
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
                <Text style={styles.emptyPrimaryBtnText}>Share today’s mood</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.emptySecondaryBtn}
                onPress={() => setShowWriteAppreciation(true)}
                activeOpacity={0.7}
              >
                <Feather
                  name="heart"
                  size={18}
                  color={Colors.primary}
                  style={styles.btnIcon}
                />
                <Text style={styles.emptySecondaryBtnText}>
                  Write an appreciation
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.emptyTertiaryBtn}
                onPress={() => setShowCreatePoll(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.emptyTertiaryBtnText}>Create a poll</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Populated State (PUL-01) */
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + 40 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* TODAY'S MOOD Card */}
            <TouchableOpacity
              style={styles.moodCard}
              onPress={() => setShowMoodModal(true)}
              activeOpacity={0.85}
            >
              <View style={styles.moodCardHeader}>
                <Text style={styles.moodCardHeaderTitle}>TODAY’S MOOD</Text>
                <Text style={styles.moodCardHeaderCount}>3 of 5 checked in</Text>
              </View>

              <View style={styles.membersMoodRow}>
                {members.map((member) => (
                  <View key={member.id} style={styles.memberMoodItem}>
                    <View
                      style={[
                        styles.memberAvatarCircle,
                        { backgroundColor: member.bgColor },
                      ]}
                    >
                      <Text style={styles.memberAvatarInitial}>
                        {member.initial}
                      </Text>
                    </View>
                    <Text style={styles.memberMoodName}>{member.displayName}</Text>

                    {member.mood ? (
                      <View style={styles.moodStatusRow}>
                        <Feather
                          name={member.mood.type === 'tired' ? 'meh' : 'smile'}
                          size={12}
                          color={
                            member.mood.type === 'tired'
                              ? Colors.accentBlueSoft
                              : Colors.accentTeal
                          }
                          style={styles.moodStatusIcon}
                        />
                        <Text
                          style={[
                            styles.moodStatusText,
                            {
                              color:
                                member.mood.type === 'tired'
                                  ? Colors.accentBlueSoft
                                  : Colors.accentTeal,
                            },
                          ]}
                        >
                          {member.mood.label}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.notYetText}>Not yet</Text>
                    )}
                  </View>
                ))}
              </View>
            </TouchableOpacity>

            {/* Quick Action Buttons Row */}
            <View style={styles.actionButtonsRow}>
              {/* Thank someone */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowWriteAppreciation(true)}
                activeOpacity={0.7}
              >
                <Feather
                  name="heart"
                  size={20}
                  color={Colors.primary}
                  style={styles.actionBtnIcon}
                />
                <Text style={styles.actionBtnText}>Thank someone</Text>
              </TouchableOpacity>

              {/* New poll */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowCreatePoll(true)}
                activeOpacity={0.7}
              >
                <Feather
                  name="bar-chart-2"
                  size={20}
                  color={Colors.primary}
                  style={styles.actionBtnIcon}
                />
                <Text style={styles.actionBtnText}>New poll</Text>
              </TouchableOpacity>

              {/* Milestone */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowAddMilestone(true)}
                activeOpacity={0.7}
              >
                <Feather
                  name="award"
                  size={20}
                  color={Colors.primary}
                  style={styles.actionBtnIcon}
                />
                <Text style={styles.actionBtnText}>Milestone</Text>
              </TouchableOpacity>
            </View>

            {/* Appreciation wall Section */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Appreciation wall</Text>
              <TouchableOpacity
                onPress={() => setShowWriteAppreciation(false)}
                activeOpacity={0.7}
              >
                <Text
                  style={styles.seeAllText}
                  onPress={() => {
                    // Open full wall modal or trigger submodal
                  }}
                >
                  See all
                </Text>
              </TouchableOpacity>
            </View>

            {/* Appreciation Preview Card */}
            <View style={styles.previewCard}>
              <View style={styles.previewCardHeader}>
                <View style={styles.previewActorsGroup}>
                  <View
                    style={[
                      styles.smallAvatar,
                      { backgroundColor: Colors.avatarNavy },
                    ]}
                  >
                    <Text style={styles.smallAvatarText}>R</Text>
                  </View>
                  <Feather
                    name="chevron-right"
                    size={12}
                    color={Colors.textSecondary}
                    style={styles.smallChevron}
                  />
                  <View
                    style={[
                      styles.smallAvatar,
                      { backgroundColor: Colors.avatarGreen },
                    ]}
                  >
                    <Text style={styles.smallAvatarText}>D</Text>
                  </View>
                  <Text style={styles.previewActorTitle}>
                    Rohan thanked Dadi
                  </Text>
                </View>
                <Text style={styles.previewTimeText}>Yesterday</Text>
              </View>

              <Text style={styles.previewMessage}>
                Thank you for making kheer for Aarav’s class party. Everyone loved
                it!
              </Text>

              <View style={styles.previewReactionsRow}>
                <TouchableOpacity
                  style={styles.previewReactionPillActive}
                  onPress={() => setShowReactionPack(true)}
                >
                  <Feather name="heart" size={13} color={Colors.primary} />
                  <Text style={styles.previewReactionTextActive}>4</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.previewReactionPill}
                  onPress={() => setShowReactionPack(true)}
                >
                  <Feather name="star" size={13} color={Colors.textSecondary} />
                  <Text style={styles.previewReactionText}>2</Text>
                </TouchableOpacity>
              </View>
            </View>

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

            {/* Poll Preview Card */}
            <TouchableOpacity
              style={styles.previewCard}
              onPress={() => setShowPollResults(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.pollPreviewQuestion}>
                Sunday plan: where shall we go?
              </Text>

              <View style={styles.pollPreviewOption}>
                <View style={styles.pollPreviewLabelRow}>
                  <View style={styles.optionNameWithCheck}>
                    <Text style={styles.pollOptionName}>Picnic at Lodhi Garden</Text>
                    <Feather
                      name="check-circle"
                      size={14}
                      color={Colors.primary}
                      style={styles.checkIcon}
                    />
                  </View>
                  <Text style={styles.pollOptionPercentActive}>60%</Text>
                </View>
                <View style={styles.pollTrack}>
                  <View style={[styles.pollFill, styles.pollFill60]} />
                </View>
              </View>

              <View style={styles.pollPreviewOption}>
                <View style={styles.pollPreviewLabelRow}>
                  <Text style={styles.pollOptionName}>Movie at home</Text>
                  <Text style={styles.pollOptionPercent}>20%</Text>
                </View>
                <View style={styles.pollTrack}>
                  <View style={[styles.pollFill, styles.pollFill20]} />
                </View>
              </View>

              <View style={styles.pollPreviewOption}>
                <View style={styles.pollPreviewLabelRow}>
                  <Text style={styles.pollOptionName}>Visit Nani</Text>
                  <Text style={styles.pollOptionPercent}>20%</Text>
                </View>
                <View style={styles.pollTrack}>
                  <View style={[styles.pollFill, styles.pollFill20]} />
                </View>
              </View>

              <Text style={styles.pollPreviewFooter}>
                3 of 5 voted · Closes Sat, 8:00 PM
              </Text>
            </TouchableOpacity>

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

            {/* Milestone Preview Card */}
            <TouchableOpacity
              style={styles.previewCard}
              onPress={() => setShowMilestonesModal(true)}
              activeOpacity={0.85}
            >
              <View style={styles.milestoneCategoryRow}>
                <Feather
                  name="award"
                  size={14}
                  color={Colors.primary}
                  style={styles.awardIcon}
                />
                <Text style={styles.milestoneCategoryText}>ANAYA</Text>
              </View>
              <Text style={styles.milestoneTitle}>
                Reached the badminton semi-final
              </Text>
              <Text style={styles.milestoneSubtext}>
                Wed, 28 Oct · Added by Rohan · 6 reactions
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* Sub-Modals */}
        <TodayMoodModal
          visible={showMoodModal}
          onClose={() => setShowMoodModal(false)}
          onSelectMood={handleSelectMood}
        />

        <WriteAppreciationModal
          visible={showWriteAppreciation}
          onClose={() => setShowWriteAppreciation(false)}
          onPostAppreciation={(_appreciation) => {
            // Handled
          }}
        />

        <ReactionPackModal
          visible={showReactionPack}
          onClose={() => setShowReactionPack(false)}
          onSelectReaction={(_reactionId) => {
            // Handled
          }}
        />

        <FamilyPollsModal
          visible={showPollsModal}
          onClose={() => setShowPollsModal(false)}
          onOpenCreatePoll={() => {
            setShowPollsModal(false);
            setShowCreatePoll(true);
          }}
          onOpenPollResults={(_poll) => {
            setShowPollResults(true);
          }}
        />

        <CreatePollModal
          visible={showCreatePoll}
          onClose={() => setShowCreatePoll(false)}
          onSubmitPoll={(_pollData) => {
            // Handled
          }}
        />

        <PollResultsModal
          visible={showPollResults}
          onClose={() => setShowPollResults(false)}
        />

        <MilestonesModal
          visible={showMilestonesModal}
          onClose={() => setShowMilestonesModal(false)}
          onOpenAddMilestone={() => {
            setShowMilestonesModal(false);
            setShowAddMilestone(true);
          }}
        />

        <AddMilestoneModal
          visible={showAddMilestone}
          onClose={() => setShowAddMilestone(false)}
          onSaveMilestone={(_data) => {
            // Handled
          }}
        />
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
  headerTitleGroup: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerRightSpacer: {
    width: 44,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  emptyContent: {
    flex: 1,
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
    fontWeight: '800',
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
    fontWeight: '700',
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
    fontWeight: '700',
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
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  moodCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    marginBottom: 16,
  },
  moodCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  moodCardHeaderTitle: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  moodCardHeaderCount: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
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
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  memberAvatarInitial: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  memberMoodName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 4,
  },
  moodStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodStatusIcon: {
    marginRight: 3,
  },
  moodStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  notYetText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnIcon: {
    marginBottom: 6,
  },
  actionBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
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
  previewCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 20,
  },
  previewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  previewActorsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  smallAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallAvatarText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  smallChevron: {
    marginHorizontal: 4,
  },
  previewActorTitle: {
    marginLeft: 6,
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
  },
  previewTimeText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  previewMessage: {
    color: Colors.textNearWhite,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  previewReactionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  previewReactionPillActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  previewReactionTextActive: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  previewReactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  previewReactionText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  pollPreviewQuestion: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 14,
  },
  pollPreviewOption: {
    marginBottom: 10,
  },
  pollPreviewLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  optionNameWithCheck: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pollOptionName: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 6,
  },
  pollOptionPercent: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  pollOptionPercentActive: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  pollTrack: {
    height: 4,
    backgroundColor: Colors.surfaceNavyDark,
    borderRadius: 2,
    overflow: 'hidden',
  },
  pollFill: {
    height: 4,
    borderRadius: 2,
  },
  pollFill60: {
    width: '60%',
    backgroundColor: Colors.primary,
  },
  pollFill20: {
    width: '20%',
    backgroundColor: Colors.surfaceNavyLight,
  },
  pollPreviewFooter: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 6,
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
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  milestoneTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  milestoneSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});

export default FamilyPulseModal;
