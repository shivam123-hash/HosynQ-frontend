import {
  PulseMilestoneType,
  PulseReactionsSummary,
} from '../../../services/pulseServices';

export type MoodType = 'great' | 'good' | 'okay' | 'tired' | 'stressed';

export interface FamilyMemberPulse {
  id: string;
  name: string;
  displayName: string;
  initial: string;
  bgColor: string;
  textColor: string;
  role?: string;
  familyRole?: string;
  isYou?: boolean;
  isAdult?: boolean;
  hasAccount?: boolean;
  statusText?: string;
  mood?: {
    type: MoodType;
    apiMood?: string;
    label: string;
    note?: string | null;
  };
}

export interface AppreciationItem {
  id: string;
  senderId: string;
  senderName: string;
  senderInitial: string;
  senderColor: string;
  senderTextColor?: string;
  receiverId: string;
  receiverName: string;
  receiverInitial: string;
  receiverColor: string;
  receiverTextColor?: string;
  timeText: string;
  message: string;
  tag?: string | null;
  heartsCount: number;
  starsCount: number;
  userReacted?: boolean;
  canRemove?: boolean;
  reactions?: PulseReactionsSummary;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
  isUserVoted?: boolean;
  memberIds?: string[];
  voterInitials?: { initial: string; bgColor: string; name?: string }[];
}

export interface PollItem {
  id: string;
  question: string;
  authorId?: string;
  authorName: string;
  authorInitial: string;
  authorColor: string;
  timeText: string;
  status: 'active' | 'closed';
  hasUserVoted: boolean;
  allowMultiple?: boolean;
  closesAt?: string | null;
  closedAt?: string | null;
  voterIds?: string[];
  eligibleCount?: number;
  topOptionIds?: string[];
  canVote?: boolean;
  canManage?: boolean;
  options: PollOption[];
  totalVotes: number;
  closesText: string;
  isMostVotedWinner?: boolean;
}

export interface MilestoneItem {
  id: string;
  title: string;
  memberId?: string | null;
  isFamily?: boolean;
  personName: string;
  personInitial: string;
  personColor: string;
  achievedOn?: string;
  milestoneType?: PulseMilestoneType | string;
  dateText: string;
  monthYear: string;
  authorText: string;
  reactionsCount: number;
  reactions?: PulseReactionsSummary;
  iconType: 'trophy' | 'book' | 'cake';
  hasPhoto?: boolean;
  photos?: string[];
  inLifeProfile?: boolean;
  sharedToPulse?: boolean;
  removal?: 'DELETE' | 'UNSHARE' | string | null;
  canManage?: boolean;
  categoryTag?: string;
}
