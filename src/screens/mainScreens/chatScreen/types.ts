export interface SharedItemData {
  type: 'list' | 'event' | 'task';
  title: string;
  subtitle: string;
  meta?: string;
  progress?: { current: number; total: number };
  isOverdue?: boolean;
  actionLabel: string;
  isDone?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderInitial: string;
  senderColor: string;
  nameColor: string;
  text?: string;
  timeText: string;
  isYou: boolean;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  hasImage?: boolean;
  imageUrl?: string;
  imageCaption?: string;
  sharedItem?: SharedItemData;
  reactions?: { emoji: string; count: number; userReacted?: boolean }[];
  dateSeparator?: string;
}

export interface ChatThreadItem {
  id: 'family' | 'just_us';
  title: string;
  subtitle: string;
  timeText: string;
  unreadCount: number;
  isPrivate?: boolean;
  iconType: 'users' | 'lock';
  avatarColor: string;
}

export interface SharedSummaryItem {
  id: string;
  type: 'list' | 'event' | 'task';
  title: string;
  subtitle: string;
  iconName: string;
  iconBgColor: string;
  iconColor: string;
}

export interface QuickMessageItem {
  id: string;
  title: string;
  subtitle?: string;
  iconName: string;
  iconColor: string;
}

export interface SelectableShareItem {
  id: string;
  type: 'task' | 'event' | 'list';
  title: string;
  subtitle: string;
  iconName: string;
  iconColor: string;
  iconBgColor: string;
}
