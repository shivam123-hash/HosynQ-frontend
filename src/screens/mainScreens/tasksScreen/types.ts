export type TaskPriority = 'high' | 'medium' | 'low';

export type TaskCategory =
  | 'household'
  | 'family'
  | 'personal'
  | 'finance'
  | 'health'
  | 'travel'
  | 'work';

export type TaskDueDateType = 'overdue' | 'today' | 'this_week' | 'later';

export interface TaskComment {
  id: string;
  author: string;
  authorInitial: string;
  avatarBg?: string;
  avatarColor?: string;
  time: string;
  text: string;
  isYou?: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  dueDate: string;
  dueTime?: string;
  dueType: TaskDueDateType;
  dueFormatted?: string; // e.g. "Sat, 31 Oct · by 8:00 PM"
  assignee: string;
  assigneeInitial: string;
  assigneeAvatarBg?: string;
  assigneeAvatarColor?: string;
  amount?: string;
  category: TaskCategory;
  categoryLabel?: string;
  priority: TaskPriority;
  priorityLabel?: string;
  repeat?: string;
  reminders?: string;
  viewers?: string;
  notes?: string;
  createdBy?: string;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: string;
  isOverdue?: boolean;
  overdueDateText?: string;
  comments?: TaskComment[];
}

export type TasksMainTab = 'tasks' | 'lists';

export type TasksStatusTab = 'pending' | 'completed';

export interface TaskFilterState {
  assignedTo: string; // 'everyone' | member name
  priority: TaskPriority | 'all';
  category: TaskCategory | 'all';
  due: 'any' | 'overdue' | 'today' | 'this_week';
}

export interface FamilyMemberOption {
  id: string;
  name: string;
  initial: string;
  avatarBg: string;
  avatarColor: string;
  taskCount?: number;
}

