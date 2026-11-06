import {
  BriefEventItem,
  BriefTaskItem,
  BriefWatchOutItem,
  DayWorkload,
  MemberWorkload,
  BriefComingUpItem,
  MonthStatItem,
  BriefSuggestion,
  ChecklistItem,
} from './types';

// ==========================================
// TODAY DATA (Pic 1)
// ==========================================
export const TODAY_AI_TEXT =
  'Aarav’s PTM is at 3:00 PM and Rohan is picking him up. The electricity bill of ₹2,840 is due tomorrow, and Dadi’s BP tablets run out on Sunday.';

export const TODAY_EVENTS: BriefEventItem[] = [
  {
    id: 'ev-1',
    time: '3:00',
    period: 'PM',
    title: "Aarav's PTM",
    location: "St. Mary's School · Rohan, Priya",
    attendees: 'Rohan, Priya',
    category: 'Family',
  },
  {
    id: 'ev-2',
    time: '6:30',
    period: 'PM',
    title: 'Badminton class',
    location: 'Sports complex · Anaya',
    attendees: 'Anaya',
    category: 'Personal',
  },
  {
    id: 'ev-3',
    time: '8:00',
    period: 'PM',
    title: "Dinner at Nani's",
    location: 'Model Town · Everyone',
    attendees: 'Everyone',
    category: 'Family',
  },
];

export const TODAY_DUE_TASKS: BriefTaskItem[] = [
  {
    id: 'task-1',
    title: 'Buy Diwali sweets and diyas',
    dueDate: 'Today',
    assignee: 'Priya',
    priority: 'high',
    isCompleted: false,
  },
  {
    id: 'task-2',
    title: 'Pay school bus fee',
    dueDate: 'Overdue by 2 days',
    assignee: 'Rohan',
    priority: 'high',
    isOverdue: true,
    isCompleted: false,
  },
];

export const TODAY_WATCH_OUT: BriefWatchOutItem[] = [
  {
    id: 'wo-1',
    iconName: 'clock',
    title: 'Electricity bill · ₹2,840',
    subtitle: 'Due tomorrow · Priya',
  },
  {
    id: 'wo-2',
    iconName: 'link-2',
    title: 'Dadi’s BP tablets',
    subtitle: 'Run out on Sunday · Refill task for Rohan',
  },
];

export const TODAY_SUGGESTION: BriefSuggestion = {
  id: 'sug-today',
  text: 'Rohan leaves office around 6:00 PM. Remind him to pick up Nani’s birthday cake on the way?',
  state: 'pending',
};

// ==========================================
// WEEK DATA (Pic 2)
// ==========================================
export const WEEK_AI_TEXT =
  'A busy week before Diwali. 4 events and 11 tasks, with Saturday the heaviest day. Train tickets to Jaipur still aren’t booked, and Nani’s birthday is on Wednesday.';

export const WEEK_DAYS: DayWorkload[] = [
  { dayLabel: 'FRI', dateNum: 30, taskCount: 3, isToday: true },
  { dayLabel: 'SAT', dateNum: 31, taskCount: 5, isHighlighted: true },
  { dayLabel: 'SUN', dateNum: 1, taskCount: 2 },
  { dayLabel: 'MON', dateNum: 2, taskCount: 2 },
  { dayLabel: 'TUE', dateNum: 3, taskCount: 1 },
  { dayLabel: 'WED', dateNum: 4, taskCount: 1 },
  { dayLabel: 'THU', dateNum: 5, taskCount: 1 },
];

export const WEEK_MEMBERS: MemberWorkload[] = [
  {
    id: 'm-priya',
    name: 'Priya',
    initials: 'P',
    avatarColor: '#4A2E1A',
    textColor: '#F6C08E',
    completedTasks: 5,
    totalTasks: 5,
    label: '5 tasks',
  },
  {
    id: 'm-rohan',
    name: 'Rohan',
    initials: 'R',
    avatarColor: '#1E3A66',
    textColor: '#8DB8F5',
    completedTasks: 4,
    totalTasks: 5,
    label: '4 tasks',
  },
  {
    id: 'm-anaya',
    name: 'Anaya',
    initials: 'A',
    avatarColor: '#4A1F3A',
    textColor: '#F2A3CC',
    completedTasks: 1,
    totalTasks: 5,
    label: '1 tasks',
  },
  {
    id: 'm-aarav',
    name: 'Aarav',
    initials: 'Aa',
    avatarColor: '#4A3A12',
    textColor: '#F2C14E',
    completedTasks: 1,
    totalTasks: 5,
    label: '1 tasks',
  },
];

export const WEEK_COMING_UP: BriefComingUpItem[] = [
  {
    id: 'cu-1',
    iconName: 'gift',
    title: 'Nani’s birthday',
    subtitle: 'Wednesday, 4 November',
    iconBorderColor: '#5A4128',
    iconColor: '#F6C08E',
  },
  {
    id: 'cu-2',
    iconName: 'navigation',
    title: 'Train tickets to Jaipur',
    subtitle: 'Not booked yet · Priya',
    isWarning: true,
    iconBorderColor: '#6B3A2A',
    iconColor: '#F0913A',
  },
  {
    id: 'cu-3',
    iconName: 'tool',
    title: 'Get kitchen tap fixed',
    subtitle: 'Saturday · Rohan',
    iconBorderColor: '#3A4556',
    iconColor: '#C9D1DC',
  },
];

export const WEEK_SUGGESTION: BriefSuggestion = {
  id: 'sug-week',
  text: 'Saturday is the busiest day. Move “Get kitchen tap fixed” to Sunday for Rohan?',
  state: 'pending',
};

// ==========================================
// MONTH DATA (Pic 4)
// ==========================================
export const MONTH_AI_TEXT =
  'The family finished 38 tasks in October, 6 more than September. In November, look out for Rohan’s passport renewal, the car insurance on the 18th and Aarav’s half-yearly exams.';

export const MONTH_STATS: MonthStatItem[] = [
  {
    id: 'stat-tasks',
    value: '38',
    label: 'Tasks done',
    badgeText: '+6 vs Sep',
    badgeType: 'positive',
  },
  {
    id: 'stat-events',
    value: '12',
    label: 'Events',
    badgeText: 'All attended',
    badgeType: 'neutral',
  },
  {
    id: 'stat-renewals',
    value: '3',
    label: 'Renewals',
    badgeText: 'On time',
    badgeType: 'neutral',
  },
];

export const MONTH_MEMBERS: MemberWorkload[] = [
  {
    id: 'm-priya-mo',
    name: 'Priya',
    initials: 'P',
    avatarColor: '#4A2E1A',
    textColor: '#F6C08E',
    completedTasks: 14,
    totalTasks: 14,
    label: '14 done',
  },
  {
    id: 'm-rohan-mo',
    name: 'Rohan',
    initials: 'R',
    avatarColor: '#1E3A66',
    textColor: '#8DB8F5',
    completedTasks: 11,
    totalTasks: 14,
    label: '11 done',
  },
  {
    id: 'm-anaya-mo',
    name: 'Anaya',
    initials: 'A',
    avatarColor: '#4A1F3A',
    textColor: '#F2A3CC',
    completedTasks: 9,
    totalTasks: 14,
    label: '9 done',
  },
  {
    id: 'm-aarav-mo',
    name: 'Aarav',
    initials: 'Aa',
    avatarColor: '#4A3A12',
    textColor: '#F2C14E',
    completedTasks: 4,
    totalTasks: 14,
    label: '4 done',
  },
];

export const MONTH_COMING_UP: BriefComingUpItem[] = [
  {
    id: 'm-cu-1',
    iconName: 'truck',
    title: 'Car insurance renewal',
    subtitle: '18 November · Rohan',
    iconBorderColor: '#3A4556',
    iconColor: '#C9D1DC',
  },
  {
    id: 'm-cu-2',
    iconName: 'file-text',
    title: 'Rohan’s passport',
    subtitle: 'Expires 14 December · start renewal now',
    isWarning: true,
    iconBorderColor: '#6B3A2A',
    iconColor: '#F0913A',
  },
  {
    id: 'm-cu-3',
    iconName: 'book-open',
    title: 'Aarav’s half-yearly exams',
    subtitle: 'From 23 November',
    iconBorderColor: '#3A4556',
    iconColor: '#C9D1DC',
  },
];

export const MONTH_SUGGESTION: BriefSuggestion = {
  id: 'sug-month',
  text: 'Rohan’s passport expires on 14 December. Add a task to book his renewal appointment this month?',
  state: 'pending',
};

// ==========================================
// EMPTY STATE DATA (Pic 3)
// ==========================================
export const EMPTY_CHECKLIST: ChecklistItem[] = [
  {
    id: 'chk-1',
    label: 'Invite someone in your family',
    isCompleted: true,
    statusText: 'Done',
  },
  {
    id: 'chk-2',
    label: 'Add 3 tasks',
    isCompleted: false,
    statusText: '1 of 3',
    isActionable: true,
  },
  {
    id: 'chk-3',
    label: 'Add an event',
    isCompleted: false,
    statusText: '0 of 1',
    isActionable: true,
  },
];

