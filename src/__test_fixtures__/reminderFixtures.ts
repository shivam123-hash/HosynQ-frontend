import {
  ReminderApi,
  ListRemindersResponse,
} from '../services/remindersServices';
import { ListNeedsAttentionResponse } from '../services/homeServices';

export const mockReminderMembersBasic = {
  myMemberId: 'baec54a3-5303-4909-b9c6-51e0f26cc74a',
  myRole: 'FAMILY_OWNER',
  members: [
    {
      memberId: 'baec54a3-5303-4909-b9c6-51e0f26cc74a',
      fullName: 'Rupesh Sharma',
      role: 'FAMILY_OWNER',
      isYou: true,
      hasAppAccount: true,
      userId: 'u-1',
    },
    {
      memberId: 'f3941dc1-9332-4bf5-9f7a-616b76854102',
      fullName: 'Priya Sharma',
      role: 'ADULT_MEMBER',
      isYou: false,
      hasAppAccount: true,
      userId: 'u-2',
      avatarColor: '#8B5CF6',
    },
    {
      memberId: 'c1111111-1111-4111-8111-111111111103',
      fullName: 'Aarav Sharma',
      role: 'DEPENDENT_CHILD_PROFILE',
      isYou: false,
      hasAppAccount: false,
      userId: null,
    },
  ],
};

export const mockUpcomingReminder: ReminderApi = {
  id: '6f9bd72b-40a7-4e10-9bfa-0ac5b2092e60',
  text: 'Call the plumber about the kitchen tap',
  remindOn: '2026-11-27',
  remindTime: '19:00',
  repeat: 'CUSTOM',
  repeatDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
  repeatEndsOn: '2026-12-31',
  status: 'UPCOMING',
  nextAt: '2026-11-27T13:30:00.000Z',
  lastSentAt: null,
  done: false,
  members: [
    {
      memberId: 'f3941dc1-9332-4bf5-9f7a-616b76854102',
      fullName: 'Priya Sharma',
      avatarUrl: null,
      avatarColor: '#8B5CF6',
      isMe: false,
    },
  ],
  createdBy: {
    memberId: 'baec54a3-5303-4909-b9c6-51e0f26cc74a',
    fullName: 'Rupesh Sharma',
    avatarUrl: null,
    avatarColor: null,
  },
  canEdit: true,
  createdAt: '2026-11-27T05:10:00.000Z',
};

export const mockRecipientOnlyReminder: ReminderApi = {
  ...mockUpcomingReminder,
  id: '6f9bd72b-40a7-4e10-9bfa-0ac5b2092e61',
  text: 'Pick up kids from school',
  remindTime: '15:30',
  repeat: null,
  repeatDays: [],
  repeatEndsOn: null,
  canEdit: false,
  members: [
    {
      memberId: 'baec54a3-5303-4909-b9c6-51e0f26cc74a',
      fullName: 'Rupesh Sharma',
      isMe: true,
    },
  ],
};

export const mockPastReminder: ReminderApi = {
  ...mockUpcomingReminder,
  id: '6f9bd72b-40a7-4e10-9bfa-0ac5b2092e62',
  text: 'Submit society maintenance receipt',
  status: 'PAST',
  done: true,
  repeat: null,
  repeatDays: [],
  repeatEndsOn: null,
};

export const mockRemindersListResponse: ListRemindersResponse = {
  success: true,
  counts: { upcoming: 2, past: 1 },
  reminders: [mockUpcomingReminder, mockRecipientOnlyReminder],
  pagination: {
    limit: 30,
    hasMore: false,
    nextCursor: null,
  },
};

export const mockNeedsAttentionResponse: ListNeedsAttentionResponse = {
  success: true,
  today: '2026-11-27',
  withinDays: 60,
  section: 'ALL',
  counts: {
    total: 4,
    overdue: 1,
    all: 4,
    dueSoon: 1,
    renewals: 1,
    importantDates: 1,
  },
  items: [
    {
      key: 'TASK:a1b2c3d4-0000-4000-8000-000000000001',
      source: 'TASK',
      id: 'a1b2c3d4-0000-4000-8000-000000000001',
      title: 'Pay school bus fee',
      group: 'FINANCE',
      on: '2026-11-25',
      time: null,
      daysLeft: -2,
      amount: null,
      people: [
        {
          memberId: 'baec54a3-5303-4909-b9c6-51e0f26cc74a',
          fullName: 'Rohan Sharma',
          avatarUrl: null,
          avatarColor: null,
        },
      ],
      section: 'OVERDUE',
    },
    {
      key: 'REMINDER:6f9bd72b-40a7-4e10-9bfa-0ac5b2092e60',
      source: 'REMINDER',
      id: '6f9bd72b-40a7-4e10-9bfa-0ac5b2092e60',
      title: 'Call the plumber about the kitchen tap',
      group: null,
      on: '2026-11-27',
      time: '19:00',
      daysLeft: 0,
      amount: null,
      people: [
        {
          memberId: 'f3941dc1-9332-4bf5-9f7a-616b76854102',
          fullName: 'Priya Sharma',
          avatarUrl: null,
          avatarColor: '#8B5CF6',
        },
      ],
      section: 'DUE_SOON',
    },
    {
      key: 'VAULT:0abcfba3-0000-4000-8000-000000000002:dueOn',
      source: 'VAULT',
      id: '0abcfba3-0000-4000-8000-000000000002',
      title: 'Car insurance',
      group: 'INSURANCE',
      on: '2026-12-12',
      time: null,
      daysLeft: 15,
      amount: 14250,
      people: [
        {
          memberId: 'f3941dc1-9332-4bf5-9f7a-616b76854102',
          fullName: 'Priya Sharma',
          avatarUrl: null,
          avatarColor: null,
        },
      ],
      section: 'RENEWALS',
    },
    {
      key: 'IMPORTANT_DATE:birthday:001',
      source: 'IMPORTANT_DATE',
      id: 'birthday:001',
      title: "Nani's birthday",
      group: 'BIRTHDAY',
      on: '2026-12-02',
      time: null,
      daysLeft: 5,
      amount: null,
      people: [],
      section: 'IMPORTANT_DATES',
    },
  ],
  pagination: {
    limit: 30,
    hasMore: false,
    nextCursor: null,
  },
};
