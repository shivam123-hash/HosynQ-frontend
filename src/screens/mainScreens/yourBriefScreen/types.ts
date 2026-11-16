export type BriefTimeframe = 'today' | 'week' | 'month';

export interface BriefEventItem {
  id: string;
  time: string;
  period: string; // 'AM' | 'PM'
  title: string;
  location: string;
  attendees: string;
  category: 'Family' | 'Personal';
}

export interface BriefTaskItem {
  id: string;
  title: string;
  dueDate: string;
  assignee: string;
  isCompleted?: boolean;
  priority?: 'high' | 'medium' | 'low';
  isOverdue?: boolean;
}

export interface BriefWatchOutItem {
  id: string;
  iconName: string;
  title: string;
  subtitle: string;
  isOverdue?: boolean;
}

export interface DayWorkload {
  dayLabel: string; // 'FRI', 'SAT', ...
  dateNum: number;  // 30, 31, ...
  taskCount: number;
  isHighlighted?: boolean;
  isToday?: boolean;
}

export interface MemberWorkload {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  textColor?: string;
  completedTasks: number;
  totalTasks: number;
  label: string; // e.g. '5 tasks' or '14 done'
}

export interface BriefComingUpItem {
  id: string;
  iconName: string;
  title: string;
  subtitle: string;
  isWarning?: boolean;
  iconBorderColor?: string;
  iconColor?: string;
}

export interface MonthStatItem {
  id: string;
  value: string;
  label: string;
  badgeText?: string;
  badgeType?: 'positive' | 'neutral';
}

export interface BriefSuggestion {
  id: string;
  text: string;
  state?: 'pending' | 'confirmed' | 'ignored';
}

export interface ChecklistItem {
  id: string;
  label: string;
  isCompleted: boolean;
  statusText: string;
  isActionable?: boolean;
}

