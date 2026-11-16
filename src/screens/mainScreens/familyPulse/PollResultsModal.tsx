import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import Ionicons from '@react-native-vector-icons/ionicons';
import Colors from '../../../units/Colors';
import { PollItem } from './types';

export interface PollResultsModalProps {
  visible: boolean;
  onClose: () => void;
  poll?: PollItem;
  onAddToCalendar?: (eventTitle: string) => void;
  onShareInChat?: (poll: PollItem) => void;
}

const DEFAULT_POLL: PollItem = {
  id: 'poll-1',
  question: 'Sunday plan: where shall we go?',
  authorName: 'you',
  authorInitial: 'P',
  authorColor: Colors.avatarBrown,
  timeText: 'Today',
  status: 'closed',
  hasUserVoted: true,
  closesText: 'Closed',
  totalVotes: 5,
  options: [
    {
      id: 'opt-1',
      text: 'Picnic at Lodhi Garden',
      votes: 3,
      percentage: 60,
      isUserVoted: true,
      voterInitials: [
        { initial: 'P', bgColor: Colors.avatarBrown },
        { initial: 'R', bgColor: Colors.avatarNavy },
        { initial: 'Aa', bgColor: Colors.avatarOlive },
      ],
    },
    {
      id: 'opt-2',
      text: 'Movie at home',
      votes: 1,
      percentage: 20,
      voterInitials: [{ initial: 'A', bgColor: Colors.avatarWine }],
    },
    {
      id: 'opt-3',
      text: 'Visit Nani',
      votes: 1,
      percentage: 20,
      voterInitials: [{ initial: 'D', bgColor: Colors.avatarGreen }],
    },
  ],
};

export const PollResultsModal: React.FC<PollResultsModalProps> = ({
  visible,
  onClose,
  poll = DEFAULT_POLL,
  onAddToCalendar,
  onShareInChat,
}) => {
  const insets = useSafeAreaInsets();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `HosynQ Poll Results: ${poll.question} - Winner: ${poll.options[0]?.text || ''}`,
      });
    } catch {
      // Ignored
    }
  };

  const winningOption = poll.options[0];
  const otherOptions = poll.options.slice(1);

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
          <Text style={styles.headerTitle}>Poll results</Text>
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

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 120 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Status & Subtitle */}
          <View style={styles.statusRow}>
            <View style={styles.closedBadge}>
              <Feather
                name="lock"
                size={12}
                color={Colors.textSecondary}
                style={styles.lockIcon}
              />
              <Text style={styles.closedBadgeText}>Closed</Text>
            </View>
            <Text style={styles.votedSubtitle}>
              {poll.totalVotes} of 5 voted · Asked by {poll.authorName === 'you' ? 'you' : poll.authorName}
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
                  <Feather
                    name="check-circle"
                    size={16}
                    color={Colors.primary}
                    style={styles.checkCircle}
                  />
                </View>
                <Text style={styles.winnerPercentageText}>
                  {winningOption.votes} votes · {winningOption.percentage}%
                </Text>
              </View>

              {/* Progress Bar */}
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

              {/* Voter Avatars */}
              {winningOption.voterInitials && (
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
                      {opt.votes} vote · {opt.percentage}%
                    </Text>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        styles.otherProgressFill,
                        { width: `${opt.percentage}%` },
                      ]}
                    />
                  </View>

                  {/* Voter Avatars */}
                  {opt.voterInitials && (
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
          <View style={styles.aiPlanCard}>
            <Text style={styles.aiPlanSparkle}>✧</Text>
            <Text style={styles.aiPlanText}>
              Make it a plan? HosynQ can add “{winningOption?.text || 'Picnic at Lodhi Garden'}” to
              Sunday, 1 Nov.
            </Text>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <TouchableOpacity
            style={styles.calendarButton}
            onPress={() => onAddToCalendar && onAddToCalendar(winningOption?.text || '')}
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
            onPress={() => onShareInChat && onShareInChat(poll)}
            activeOpacity={0.7}
          >
            <Text style={styles.chatButtonText}>Share in Family chat</Text>
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
    fontWeight: '700',
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
  lockIcon: {
    marginRight: 5,
  },
  closedBadgeText: {
    color: '#BDC6D1',
    fontSize: 12,
    fontWeight: '600',
  },
  votedSubtitle: {
    color: '#8A97AB',
    fontSize: 13,
    fontWeight: '500',
  },
  questionTitle: {
    fontSize: 22,
    fontWeight: '800',
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
    fontWeight: '700',
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
    fontWeight: '700',
  },
  checkCircle: {
    marginLeft: 6,
  },
  winnerPercentageText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
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
    fontWeight: '700',
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
    fontWeight: '600',
  },
  otherPercentageText: {
    color: '#8FA0B5',
    fontSize: 13,
    fontWeight: '500',
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
    fontWeight: '500',
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
    fontWeight: '700',
  },
  chatButton: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default PollResultsModal;
