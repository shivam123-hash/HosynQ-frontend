import {
  HomeAttentionPersonApi,
  NeedsAttentionSectionFilter,
  NeedsAttentionSectionName,
  NeedsAttentionSource,
} from '../../../services/homeServices';

export type AttentionCategory =
  | 'reminders'
  | 'past_reminders'
  | 'overdue'
  | 'due_soon'
  | 'renewals'
  | 'important_dates';

export type AttentionFilterType =
  | NeedsAttentionSectionFilter
  | 'all'
  | 'reminders'
  | 'past_reminders'
  | 'overdue'
  | 'due_soon'
  | 'renewals'
  | 'important_dates';

export interface AttentionFilterPillItem {
  id: AttentionFilterType;
  label: string;
  count: number;
}

export interface AttentionItem {
  id: string;
  key?: string;
  rawId?: string;
  category: AttentionCategory;
  title: string;
  subtitle: string;
  iconName: string;
  iconBorderColor?: string;
  iconColor?: string;
  isOverdue?: boolean;
  hasRemindButton?: boolean;
  actionLabel?: string;
  assignee?: string;
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

export interface AttentionSectionGroup {
  key: AttentionCategory;
  title: string;
  items: AttentionItem[];
}
