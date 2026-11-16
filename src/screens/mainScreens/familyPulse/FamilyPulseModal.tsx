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
import Ionicons from '@react-native-vector-icons/ionicons';
import Colors from '../../../units/Colors';
import {
  MoodType,
  FamilyMemberPulse,
  AppreciationItem,
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
    textColor: Colors.primarySubtle,
    mood: { type: 'good', label: 'Good' },
  },
  {
    id: 'rohan',
    name: 'Rohan',
    displayName: 'Rohan',
    initial: 'R',
    bgColor: Colors.avatarNavy,
    textColor: Colors.accentBlueSoft,
    mood: { type: 'tired', label: 'Tired' },
  },
  {
    id: 'dadi',
    name: 'Dadi',
    displayName: 'Dadi',
    initial: 'D',
    bgColor: Colors.avatarGreen,
    textColor: Colors.accentGreenSoft,
    mood: { type: 'great', label: 'Great' },
  },
  {
    id: 'anaya',
    name: 'Anaya',
    displayName: 'Anaya',
    initial: 'A',
    bgColor: Colors.avatarWine,
    textColor: Colors.accentPink,
  },
  {
    id: 'aarav',
    name: 'Aarav',
    displayName: 'Aarav',
    initial: 'Aa',
    bgColor: Colors.avatarOlive,
    textColor: Colors.accentYellow,
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
  const [showAppreciationWall, setShowAppreciationWall] = useState(false);
  const [showWriteAppreciation, setShowWriteAppreciation] = useState(false);
  const [showReactionPack, setShowReactionPack] = useState(false);
  const [selectedAppreciationItem, setSelectedAppreciationItem] = useState<AppreciationItem | null>(null);
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
              { paddingBottom: Math.max(insets.bottom, 20) + 24 },
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
                        !member.mood && styles.memberAvatarCircleNotCheckedIn,
                      ]}
                    >
                      <Text
                        style={[
                          styles.memberAvatarInitial,
                          { color: member.textColor || Colors.white },
                        ]}
                      >
                        {member.initial}
                      </Text>
                    </View>
                    <Text style={styles.memberMoodName}>{member.displayName}</Text>

                    {member.mood ? (
                      <View style={styles.moodStatusRow}>
                        <Feather
                          name={
                            member.mood.type === 'tired'
                              ? 'minus-circle'
                              : member.mood.type === 'stressed'
                              ? 'frown'
                              : member.mood.type === 'okay'
                              ? 'meh'
                              : 'smile'
                          }
                          size={12}
                          color={
                            member.mood.type === 'tired'
                              ? Colors.accentBlueSoft
                              : member.mood.type === 'stressed'
                              ? Colors.accentRed
                              : member.mood.type === 'okay'
                              ? Colors.accentYellow
                              : '#4CC38A'
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
                                  : member.mood.type === 'stressed'
                                  ? Colors.accentRed
                                  : member.mood.type === 'okay'
                                  ? Colors.accentYellow
                                  : '#4CC38A',
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
                <View style={styles.pollBarsIconContainer}>
                  <View style={[styles.pollBar, styles.pollBarLeft]} />
                  <View style={[styles.pollBar, styles.pollBarCenter]} />
                  <View style={[styles.pollBar, styles.pollBarRight]} />
                </View>
                <Text style={styles.actionBtnText}>New poll</Text>
              </TouchableOpacity>

              {/* Milestone */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowAddMilestone(true)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="trophy-outline"
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
                onPress={() => setShowAppreciationWall(true)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="See all appreciations"
              >
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            {/* Appreciation Preview Card */}
            <TouchableOpacity
              style={styles.previewCard}
              onPress={() => setShowAppreciationWall(true)}
              activeOpacity={0.85}
            >
              <View style={styles.previewCardHeader}>
                <View style={styles.previewActorsGroup}>
                  <View
                    style={[
                      styles.smallAvatar,
                      { backgroundColor: Colors.avatarNavy },
                    ]}
                  >
                    <Text
                      style={[
                        styles.smallAvatarText,
                        { color: Colors.accentBlueSoft },
                      ]}
                    >
                      R
                    </Text>
                  </View>
                  <Feather
                    name="chevron-right"
                    size={13}
                    color={Colors.textSecondary}
                    style={styles.smallChevron}
                  />
                  <View
                    style={[
                      styles.smallAvatar,
                      { backgroundColor: Colors.avatarGreen },
                    ]}
                  >
                    <Text
                      style={[
                        styles.smallAvatarText,
                        { color: Colors.accentGreenSoft },
                      ]}
                    >
                      D
                    </Text>
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
                  activeOpacity={0.7}
                >
                  <Feather name="heart" size={13} color={Colors.primary} />
                  <Text style={styles.previewReactionTextActive}>4</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.previewReactionPill}
                  onPress={() => setShowReactionPack(true)}
                  activeOpacity={0.7}
                >
                  <Feather name="star" size={13} color={Colors.white} />
                  <Text style={styles.previewReactionText}>2</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            {/* Family poll Section */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Family poll</Text>
              <TouchableOpacity
                onPress={() => setShowPollsModal(true)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="See all polls"
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
                      size={15}
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
                <Ionicons
                  name="trophy-outline"
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

        <AppreciationWallModal
          visible={showAppreciationWall}
          onClose={() => setShowAppreciationWall(false)}
          onOpenWrite={() => {
            setShowAppreciationWall(false);
            setShowWriteAppreciation(true);
          }}
          onOpenReactionPack={(item) => {
            setSelectedAppreciationItem(item);
            setShowReactionPack(true);
          }}
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
          targetTitle={
            selectedAppreciationItem
              ? `To ${selectedAppreciationItem.senderName}’s thanks for ${selectedAppreciationItem.receiverName}`
              : 'To Rohan’s thanks for Dadi'
          }
          onClose={() => setShowReactionPack(false)}
          onSelectReaction={(_reactionId) => {
            setShowReactionPack(false);
          }}
          onRemoveReaction={() => {
            setShowReactionPack(false);
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
    fontWeight: '700',
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
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  moodCardHeaderCount: {
    color: Colors.textSubtle,
    fontSize: 12.5,
    fontWeight: '400',
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
    fontWeight: '700',
  },
  memberMoodName: {
    fontSize: 12.5,
    fontWeight: '600',
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
    fontWeight: '600',
  },
  notYetText: {
    fontSize: 12,
    color: Colors.textSubtle,
    fontWeight: '400',
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
    fontWeight: '600',
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
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.3,
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
    fontWeight: '700',
  },
  smallChevron: {
    marginHorizontal: 6,
  },
  previewActorTitle: {
    marginLeft: 8,
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
  },
  previewTimeText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
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
    fontWeight: '700',
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
    fontWeight: '600',
  },
  pollPreviewQuestion: {
    fontSize: 16,
    fontWeight: '700',
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
    fontWeight: '600',
  },
  checkIcon: {
    marginLeft: 8,
  },
  pollOptionPercent: {
    color: Colors.textSubtle,
    fontSize: 14.5,
    fontWeight: '600',
  },
  pollOptionPercentActive: {
    color: Colors.primary,
    fontSize: 14.5,
    fontWeight: '700',
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
  pollFill60: {
    width: '60%',
    backgroundColor: Colors.primary,
  },
  pollFill20: {
    width: '20%',
    backgroundColor: '#273C56',
  },
  pollPreviewFooter: {
    color: Colors.textSubtle,
    fontSize: 13,
    marginTop: 2,
    fontWeight: '400',
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
