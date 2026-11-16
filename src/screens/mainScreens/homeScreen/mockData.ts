import {
  AttentionItem,
  EventItem,
  TaskItem,
  RecentlyDoneItem,
  FamilyMemberStatus,
  SmartSuggestion,
} from './types';

export const INITIAL_ATTENTION_ITEMS: AttentionItem[] = [
  {
    id: 'att-1',
    title: 'Pay school bus fee',
    subtitle: 'Overdue by 2 days · Rohan',
    type: 'urgent',
    isOverdue: true,
  },
  {
    id: 'att-2',
    title: 'Electricity bill · ₹2,840',
    subtitle: 'Due tomorrow · Priya',
    type: 'warning',
  },
  {
    id: 'att-3',
    title: "Rohan's passport expires",
    subtitle: 'In 45 days · 14 December',
    type: 'info',
  },
];

export const INITIAL_UPCOMING_EVENTS: EventItem[] = [
  {
    id: 'ev-1',
    time: '3:00',
    period: 'PM',
    title: "Aarav's PTM",
    location: "St. Mary's School",
    attendees: 'Rohan, Priya',
    category: 'Family',
  },
  {
    id: 'ev-2',
    time: '6:30',
    period: 'PM',
    title: 'Badminton class',
    location: 'Sports complex',
    attendees: 'Anaya',
    category: 'Personal',
  },
  {
    id: 'ev-3',
    time: '8:00',
    period: 'PM',
    title: "Dinner at Nani's",
    location: 'Model Town',
    attendees: 'Everyone',
    category: 'Family',
  },
];

export const INITIAL_PENDING_TASKS: TaskItem[] = [
  // Household (3)
  {
    id: 'task-1',
    title: 'Buy Diwali sweets and diyas',
    dueDate: 'Today',
    assignee: 'Priya',
    category: 'household',
    isCompleted: false,
    priority: 'high',
  },
  {
    id: 'task-2',
    title: 'Get kitchen tap fixed',
    dueDate: 'Saturday',
    assignee: 'Rohan',
    category: 'household',
    isCompleted: false,
    priority: 'medium',
  },
  {
    id: 'task-3',
    title: 'Clean the balcony',
    dueDate: 'Sunday',
    assignee: 'Anaya, Aarav',
    category: 'household',
    isCompleted: false,
    priority: 'low',
  },
  // Finance (2)
  {
    id: 'task-4',
    title: 'Pay electricity bill',
    dueDate: 'Tomorrow',
    assignee: 'Priya',
    category: 'finance',
    isCompleted: false,
    priority: 'high',
    frequency: 'Monthly',
  },
  {
    id: 'task-5',
    title: 'Pay school bus fee',
    dueDate: 'Overdue',
    assignee: 'Rohan',
    category: 'finance',
    isCompleted: false,
    priority: 'high',
    isOverdue: true,
  },
  // Health (1)
  {
    id: 'task-6',
    title: "Order Dadi's BP tablets",
    dueDate: 'Sunday',
    assignee: 'Priya',
    category: 'health',
    isCompleted: false,
    priority: 'high',
  },
  // Travel (1)
  {
    id: 'task-7',
    title: 'Check passport photo renewal requirements',
    dueDate: 'Next week',
    assignee: 'Rohan',
    category: 'travel',
    isCompleted: false,
    priority: 'medium',
  },
];

export const INITIAL_RECENTLY_DONE: RecentlyDoneItem[] = [
  {
    id: 'done-1',
    title: 'Submit science project',
    completedBy: 'Anaya',
    timeAgo: '2 hours ago',
  },
  {
    id: 'done-2',
    title: 'Book car service',
    completedBy: 'Rohan',
    timeAgo: 'This morning',
  },
];

export const INITIAL_FAMILY_MEMBERS: FamilyMemberStatus[] = [
  {
    id: 'mem-1',
    name: 'Rohan',
    initials: 'R',
    avatarBg: '#1E3A8A',
    status: 'At office',
    location: 'Cyber City',
    isSafe: true,
  },
  {
    id: 'mem-2',
    name: 'Anaya',
    initials: 'A',
    avatarBg: '#6B21A8',
    status: 'At home',
    location: 'Greenwood Estate',
    isSafe: true,
  },
  {
    id: 'mem-3',
    name: 'Aarav',
    initials: 'Aa',
    avatarBg: '#78350F',
    status: 'At school',
    location: "St. Mary's School",
    isSafe: true,
  },
  {
    id: 'mem-4',
    name: 'Dadi',
    initials: 'D',
    avatarBg: '#064E3B',
    status: 'At home',
    location: 'Greenwood Estate',
    isSafe: true,
  },
];

export const INITIAL_SMART_SUGGESTION: SmartSuggestion = {
  id: 'sug-1',
  text: 'Rohan leaves office around 6:00 PM. Remind him to pick up Nani’s birthday cake on the way?',
  state: 'pending',
};

