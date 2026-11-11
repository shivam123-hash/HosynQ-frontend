export type CalendarViewMode = 'day' | 'week' | 'month';

export interface CalendarFamilyMember {
  id: string;
  name: string;
  initial: string;
  color: string;
  textColor?: string;
}

export interface CalendarCategory {
  id: string;
  name: string;
  color: string;
  description: string;
}

export interface EventComment {
  id: string;
  authorId: string;
  authorName: string;
  authorInitial: string;
  authorColor: string;
  time: string;
  text: string;
  isCurrentUser?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "3:00 PM"
  endTime: string; // e.g. "3:45 PM"
  formattedDate: string; // e.g. "Fri, 30 Oct"
  formattedTime: string; // e.g. "3:00 – 3:45 PM"
  isAllDay: boolean;
  category: string;
  categoryColor: string;
  location: string;
  locationDetail?: string;
  forMemberId?: string;
  forMemberName?: string;
  forMemberInitial?: string;
  forMemberColor?: string;
  forMemberTextColor?: string;
  goingMemberIds: string[];
  goingMembers: {
    id: string;
    name: string;
    initial: string;
    color: string;
    textColor?: string;
  }[];
  reminders: string;
  repeat: string;
  notes?: string;
  sourceNote?: string;
  comments: EventComment[];
}

export interface CalendarTaskDue {
  id: string;
  title: string;
  dueDate: string;
  dueTime?: string;
  assignee: string;
  isOverdue?: boolean;
  overdueText?: string;
  isCompleted: boolean;
  memberId?: string;
}

export interface ImportantDateItem {
  id: string;
  title: string;
  subtitle: string;
  dateFormatted: string;
  daysLeft: number;
  timeRemainingText: string;
  type: 'birthday' | 'anniversary' | 'document' | 'other';
  section: 'this_month' | 'next_3_months' | 'later';
  personName: string;
  personInitial: string;
  personColor: string;
  reminders: string;
  whoSeesIt: string;
  documentTitle?: string;
  documentPath?: string;
  aiSuggestion?: string;
}

export interface CalendarFilterState {
  showTypes: ('events' | 'tasks' | 'important_dates')[];
  member: string;
  categories: string[];
}
