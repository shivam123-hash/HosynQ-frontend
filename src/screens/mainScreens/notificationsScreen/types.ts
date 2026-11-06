export type NotificationFilterType = 'all' | 'unread' | 'tasks' | 'family';

export type NotificationCategory = 'family' | 'tasks' | 'brief' | 'renewals' | 'general';

export interface NotificationItem {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
  category: NotificationCategory;
  isUnread?: boolean;
  actionType?: 'join_request' | 'default';
  isAvatar?: boolean;
  avatarInitial?: string;
  avatarBg?: string;
  avatarColor?: string;
  iconName?: string;
  iconSymbol?: string;
  iconColor?: string;
  iconBorderColor?: string;
  iconBgColor?: string;
}

export interface NotificationSectionGroup {
  key: string;
  title: string;
  items: NotificationItem[];
}

export interface NotificationFilterPill {
  id: NotificationFilterType;
  label: string;
  count?: number;
}

