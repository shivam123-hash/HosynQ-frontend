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
  endDate?: string; // YYYY-MM-DD
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
  createdByMemberId?: string;
  createdById?: string;
  isCreator?: boolean;
  invitedMemberIds?: string[];
  invitees?: Array<{
    id: string;
    name: string;
    response?: 'GOING' | 'NOT_GOING' | null;
  }>;
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
  myResponse?: 'GOING' | 'NOT_GOING' | null;
  askToConfirm?: boolean;
  canEdit?: boolean;
  canCancel?: boolean;
  canRespond?: boolean;
  backendCanRespond?: boolean;
  scope?: 'THIS_ONE' | 'THIS_AND_FUTURE' | 'ALL';
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
  category?: string;
  categoryColor?: string;
}

export interface CalendarFilterState {
  showTypes: ('events' | 'tasks')[];
  member: string;
  categories: string[];
}
