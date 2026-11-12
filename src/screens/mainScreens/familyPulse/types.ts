export type MoodType = 'great' | 'good' | 'okay' | 'tired' | 'stressed';

export interface FamilyMemberPulse {
  id: string;
  name: string;
  displayName: string;
  initial: string;
  bgColor: string;
  textColor: string;
  role?: string;
  statusText?: string;
  mood?: {
    type: MoodType;
    label: string;
    note?: string;
  };
}

export interface AppreciationItem {
  id: string;
  senderId: string;
  senderName: string;
  senderInitial: string;
  senderColor: string;
  receiverId: string;
  receiverName: string;
  receiverInitial: string;
  receiverColor: string;
  timeText: string;
  message: string;
  heartsCount: number;
  starsCount: number;
  userReacted?: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
  isUserVoted?: boolean;
  voterInitials?: { initial: string; bgColor: string }[];
}

export interface PollItem {
  id: string;
  question: string;
  authorName: string;
  authorInitial: string;
  authorColor: string;
  timeText: string;
  status: 'active' | 'closed';
  hasUserVoted: boolean;
  options: PollOption[];
  totalVotes: number;
  closesText: string;
  isMostVotedWinner?: boolean;
}

export interface MilestoneItem {
  id: string;
  title: string;
  personName: string;
  personInitial: string;
  personColor: string;
  dateText: string;
  monthYear: string;
  authorText: string;
  reactionsCount: number;
  iconType: 'trophy' | 'book' | 'cake';
  hasPhoto?: boolean;
  categoryTag?: string;
}
