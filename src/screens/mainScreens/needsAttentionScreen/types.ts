export type AttentionCategory = 'overdue' | 'due_soon' | 'renewals' | 'important_dates';

export type AttentionFilterType = 'all' | 'overdue' | 'due_soon' | 'renewals' | 'important_dates';

export interface AttentionFilterPillItem {
  id: AttentionFilterType;
  label: string;
  count: number;
}

export interface AttentionItem {
  id: string;
  category: AttentionCategory;
  title: string;
  subtitle: string;
  iconName: string;
  iconBorderColor?: string;
  iconColor?: string;
  isOverdue?: boolean;
  hasRemindButton?: boolean;
  assignee?: string;
}

export interface AttentionSectionGroup {
  key: AttentionCategory;
  title: string;
  items: AttentionItem[];
}

