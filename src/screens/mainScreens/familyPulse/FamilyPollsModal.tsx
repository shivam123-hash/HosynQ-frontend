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
import { PollItem } from './types';

export interface FamilyPollsModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenCreatePoll?: () => void;
  onOpenPollResults?: (poll: PollItem) => void;
}

const DEFAULT_POLLS: PollItem[] = [
  {
    id: 'poll-1',
    question: 'Sunday plan: where shall we go?',
    authorName: 'you',
    authorInitial: 'P',
    authorColor: Colors.avatarBrown,
    timeText: 'Today',
    status: 'active',
    hasUserVoted: true,
    totalVotes: 3,
    closesText: 'Closes Sat, 8:00 PM',
    options: [
      {
        id: 'opt-1-1',
        text: 'Picnic at Lodhi Garden',
        votes: 3,
        percentage: 60,
        isUserVoted: true,
      },
      {
        id: 'opt-1-2',
        text: 'Movie at home',
        votes: 1,
        percentage: 20,
      },
      {
        id: 'opt-1-3',
        text: 'Visit Nani',
        votes: 1,
        percentage: 20,
      },
    ],
  },
  {
    id: 'poll-2',
    question: 'Diwali dinner: what’s the main dish?',
    authorName: 'Dadi',
    authorInitial: 'D',
    authorColor: Colors.avatarGreen,
    timeText: 'Yesterday',
    status: 'active',
    hasUserVoted: false,
    totalVotes: 1,
    closesText: 'Closes Sun, 1 Nov',
    options: [
      { id: 'opt-2-1', text: 'Paneer butter masala', votes: 1, percentage: 100 },
      { id: 'opt-2-2', text: 'Veg biryani', votes: 0, percentage: 0 },
      { id: 'opt-2-3', text: 'Chole bhature', votes: 0, percentage: 0 },
    ],
  },
];

export const FamilyPollsModal: React.FC<FamilyPollsModalProps> = ({
  visible,
  onClose,
  onOpenCreatePoll,
  onOpenPollResults,
}) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active');
  const [polls, setPolls] = useState<PollItem[]>(DEFAULT_POLLS);
  const [selectedOptions, setSelectedOptions] = useState<{ [pollId: string]: string }>({});

  const handleSelectRadio = (pollId: string, optionId: string) => {
    setSelectedOptions((prev) => ({ ...prev, [pollId]: optionId }));
    // Simulate user voting
    setPolls((prev) =>
      prev.map((p) => {
        if (p.id !== pollId) return p;
        return {
          ...p,
          hasUserVoted: true,
          totalVotes: p.totalVotes + 1,
          options: p.options.map((opt) =>
            opt.id === optionId
              ? {
                  ...opt,
                  votes: opt.votes + 1,
                  isUserVoted: true,
                  percentage: Math.round(((opt.votes + 1) / (p.totalVotes + 1)) * 100),
                }
              : {
                  ...opt,
                  percentage: Math.round((opt.votes / (p.totalVotes + 1)) * 100),
                }
          ),
        };
      })
    );
  };

  const filteredPolls = polls.filter((p) =>
    activeTab === 'active' ? p.status === 'active' : p.status === 'closed'
  );

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
          <Text style={styles.headerTitle}>Family polls</Text>
          <View style={styles.headerRightSpacer} />
        </View>

        {/* Tabs: Active · 2 / Closed */}
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
              Active · 2
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
              Closed
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
        >
          {filteredPolls.map((poll) => {
            if (poll.hasUserVoted) {
              // Voted Poll Card
              return (
                <TouchableOpacity
                  key={poll.id}
                  style={styles.card}
                  onPress={() => onOpenPollResults && onOpenPollResults(poll)}
                  activeOpacity={0.85}
                >
                  {/* Top Author Row */}
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

                    <View style={styles.votedBadge}>
                      <Text style={styles.votedBadgeText}>You voted</Text>
                    </View>
                  </View>

                  {/* Question */}
                  <Text style={styles.pollQuestion}>{poll.question}</Text>

                  {/* Options with percentages */}
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

                        {/* Progress Bar */}
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

                  {/* Footer */}
                  <View style={styles.cardFooter}>
                    <View style={styles.avatarCluster}>
                      <View
                        style={[
                          styles.clusterDot,
                          { backgroundColor: Colors.avatarBrown },
                        ]}
                      >
                        <Text style={styles.clusterDotText}>P</Text>
                      </View>
                      <View
                        style={[
                          styles.clusterDot,
                          styles.clusterDotOverlap,
                          { backgroundColor: Colors.avatarNavy },
                        ]}
                      >
                        <Text style={styles.clusterDotText}>R</Text>
                      </View>
                      <View
                        style={[
                          styles.clusterDot,
                          styles.clusterDotOverlap,
                          { backgroundColor: Colors.avatarOlive },
                        ]}
                      >
                        <Text style={styles.clusterDotText}>Aa</Text>
                      </View>
                    </View>

                    <Text style={styles.footerInfoText}>
                      {poll.totalVotes} of 5 voted · {poll.closesText}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }

            // Unvoted Poll Card
            return (
              <View key={poll.id} style={styles.card}>
                {/* Top Author Row */}
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

                {/* Question */}
                <Text style={styles.pollQuestion}>{poll.question}</Text>

                {/* Radio Options */}
                <View style={styles.radioOptionsList}>
                  {poll.options.map((opt) => {
                    const isSelected = selectedOptions[poll.id] === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={styles.radioOptionItem}
                        onPress={() => handleSelectRadio(poll.id, opt.id)}
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

                {/* Footer */}
                <Text style={styles.unvotedFooterText}>
                  {poll.totalVotes} of 5 voted · {poll.closesText}
                </Text>
              </View>
            );
          })}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
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
    fontWeight: '600',
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
    fontWeight: '700',
  },
  authorText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
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
    fontWeight: '600',
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
    fontWeight: '700',
  },
  pollQuestion: {
    fontSize: 16,
    fontWeight: '700',
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
    fontWeight: '600',
  },
  checkCircle: {
    marginLeft: 6,
  },
  votedOptionPercent: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
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
    fontWeight: '700',
  },
  footerInfoText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
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
    fontWeight: '500',
  },
  unvotedFooterText: {
    color: Colors.textSecondary,
    fontSize: 12,
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
    fontWeight: '700',
  },
});

export default FamilyPollsModal;
