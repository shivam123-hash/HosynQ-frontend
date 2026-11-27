import {
  HomeAttentionPersonApi,
  NeedsAttentionSectionName,
  NeedsAttentionSource,
} from '../../../services/homeServices';

export interface AttentionItem {
  id: string;
  key?: string;
  rawId?: string;
  title: string;
  subtitle: string;
  type: 'urgent' | 'warning' | 'info';
  isOverdue?: boolean;
  source?: NeedsAttentionSource | 'reminder' | 'task' | 'vault';
  group?: string | null;
  on?: string;
  time?: string | null;
  daysLeft?: number;
  amount?: number | null;
  backendSection?: NeedsAttentionSectionName;
  people?: HomeAttentionPersonApi[];
  reminderId?: string;
  done?: boolean;
  taskId?: string;
  vaultItem?: any;
}

export interface EventItem {
  id: string;
  time: string;
  period: string; // 'AM' | 'PM'
  title: string;
  location: string;
  attendees: string;
  category: 'Family' | 'Personal';
}

export interface TaskItem {
  id: string;
  title: string;
  dueDate: string;
  assignee: string;
  category: 'household' | 'finance' | 'health' | 'travel';
  isCompleted: boolean;
  priority: 'high' | 'medium' | 'low';
  isOverdue?: boolean;
  frequency?: string;
}

export interface RecentlyDoneItem {
  id: string;
  title: string;
  completedBy: string;
  timeAgo: string;
}

export interface FamilyMemberStatus {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  status: string;
  location: string;
  isSafe: boolean;
}

export interface SmartSuggestion {
  id: string;
  text: string;
  state: 'pending' | 'confirmed' | 'ignored';
  resultText?: string;
}

export type NavigationTab = 'home' | 'calendar' | 'chat' | 'tasks';
export type BriefTimeframe = 'today' | 'week' | 'month';
export type TaskFilterCategory = 'all' | 'household' | 'finance' | 'health' | 'travel';
