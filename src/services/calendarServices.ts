import apiClient from './apiClient';
import API_ROUTES from '../redux/endPoints/endPoints';

export interface CalendarFeedParams {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  today?: string;
  show?: ('EVENTS' | 'TASKS' | 'IMPORTANT_DATES')[];
  memberIds?: string[];
  categories?: string[];
}

export interface CreateEventPayload {
  title: string;
  notes?: string;
  location?: string;
  category?: string;
  forMemberId?: string;
  startsOn: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endsOn?: string; // YYYY-MM-DD
  endTime?: string; // HH:mm
  inviteeMemberIds?: string[];
  askToConfirm?: boolean;
  repeat?: string;
  repeatDays?: string[];
  repeatEndsOn?: string;
  reminders?: string[];
  customReminderTime?: string;
  remindInvitees?: boolean;
  sourceLabel?: string;
}

export interface UpdateEventPayload extends Partial<CreateEventPayload> {
  scope?: 'THIS_ONE' | 'THIS_AND_FUTURE' | 'ALL';
  occurrenceOn?: string;
}

export interface CancelEventPayload {
  scope?: 'THIS_ONE' | 'THIS_AND_FUTURE' | 'ALL';
  occurrenceOn?: string;
  note?: string;
}

export interface CreateImportantDatePayload {
  title: string;
  kind: 'BIRTHDAY' | 'ANNIVERSARY' | 'RENEWAL' | 'OTHER';
  onDate: string;
  repeatsYearly?: boolean;
  memberId?: string;
  notes?: string;
  reminderLeadDays?: number[];
  sharedWithAll?: boolean;
  visibleMemberIds?: string[];
}

export interface CalendarEventOccurrence {
  id: string;
  title: string;
  category: string;
  occurrenceOn: string;
  startsOn: string;
  startTime?: string | null;
  endsOn: string;
  endTime?: string | null;
  allDay: boolean;
  location?: string | null;
  notes?: string | null;
  forMember?: {
    memberId: string;
    fullName: string;
    avatarUrl?: string | null;
    avatarColor?: string | null;
  } | null;
  going?: Array<{
    memberId: string;
    fullName: string;
    avatarUrl?: string | null;
    avatarColor?: string | null;
  }>;
  invitees?: Array<{
    memberId: string;
    fullName: string;
    avatarUrl?: string | null;
    avatarColor?: string | null;
    response?: 'GOING' | 'NOT_GOING' | null;
  }>;
  askToConfirm?: boolean;
  reminders?: string[];
  repeat?: string | null;
  comments?: {
    count: number;
    latest: Array<{
      id: string;
      body: string;
      author: {
        memberId: string;
        fullName: string;
        avatarColor?: string;
      };
      isMine?: boolean;
      createdAt: string;
    }>;
  };
  myResponse?: 'GOING' | 'NOT_GOING' | null;
}

export interface CalendarFeedResponse {
  success: boolean;
  appliedFilters: any;
  events: CalendarEventOccurrence[];
  tasks: any[];
  importantDates: any[];
}

const calendarServices = {
  // 1. Fetch Calendar Feed (Events, Tasks, Important Dates)
  getFeed: async (params: CalendarFeedParams): Promise<CalendarFeedResponse> => {
    const response = await apiClient.get<CalendarFeedResponse>(API_ROUTES.CALENDAR_FEED, { params });
    return response.data;
  },

  // 2. Member Availability Check
  getAvailability: async (params: {
    on: string;
    startTime: string;
    endTime?: string;
    excludeEventId?: string;
  }) => {
    const response = await apiClient.get(API_ROUTES.CALENDAR_AVAILABILITY, { params });
    return response.data;
  },

  // 3. Create Event
  createEvent: async (payload: CreateEventPayload) => {
    const response = await apiClient.post(API_ROUTES.CALENDAR_EVENTS, payload);
    return response.data;
  },

  // 4. Get Event Detail
  getEvent: async (id: string, on?: string) => {
    const response = await apiClient.get(API_ROUTES.CALENDAR_EVENT_BY_ID(id, on));
    return response.data;
  },

  // 5. Update Event
  updateEvent: async (id: string, payload: UpdateEventPayload) => {
    const response = await apiClient.patch(API_ROUTES.CALENDAR_EVENT_BY_ID(id), payload);
    return response.data;
  },

  // 6. Cancel Event
  cancelEvent: async (id: string, payload: CancelEventPayload) => {
    const response = await apiClient.post(API_ROUTES.CALENDAR_EVENT_CANCEL(id), payload);
    return response.data;
  },

  // 7. Event RSVP Response
  respondToEvent: async (id: string, responseStatus: 'GOING' | 'NOT_GOING') => {
    const response = await apiClient.post(API_ROUTES.CALENDAR_EVENT_RESPONSE(id), { response: responseStatus });
    return response.data;
  },

  // 8. Get Event Comments
  getComments: async (id: string, before?: string, limit = 30) => {
    const response = await apiClient.get(API_ROUTES.CALENDAR_EVENT_COMMENTS(id), {
      params: { before, limit },
    });
    return response.data;
  },

  // 9. Post Event Comment
  addComment: async (id: string, body: string) => {
    const response = await apiClient.post(API_ROUTES.CALENDAR_EVENT_COMMENTS(id), { body });
    return response.data;
  },

  // 10. List Important Dates
  getImportantDates: async (params?: { kind?: string; today?: string }) => {
    const response = await apiClient.get(API_ROUTES.CALENDAR_IMPORTANT_DATES, { params });
    return response.data;
  },

  // 11. Create Important Date
  createImportantDate: async (payload: CreateImportantDatePayload) => {
    const response = await apiClient.post(API_ROUTES.CALENDAR_IMPORTANT_DATES, payload);
    return response.data;
  },

  // 12. Get Important Date Detail
  getImportantDate: async (key: string, today?: string) => {
    const response = await apiClient.get(API_ROUTES.CALENDAR_IMPORTANT_DATE_BY_KEY(key), { params: { today } });
    return response.data;
  },

  // 13. Update Important Date
  updateImportantDate: async (key: string, payload: Partial<CreateImportantDatePayload>) => {
    const response = await apiClient.patch(API_ROUTES.CALENDAR_IMPORTANT_DATE_BY_KEY(key), payload);
    return response.data;
  },

  // 14. Delete Important Date
  deleteImportantDate: async (key: string) => {
    const response = await apiClient.delete(API_ROUTES.CALENDAR_IMPORTANT_DATE_BY_KEY(key));
    return response.data;
  },
};

export default calendarServices;
