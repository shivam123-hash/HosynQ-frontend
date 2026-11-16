import { AttentionFilterPillItem, AttentionSectionGroup } from './types';

export const ATTENTION_FILTER_PILLS: AttentionFilterPillItem[] = [
  { id: 'all', label: 'All 6', count: 6 },
  { id: 'overdue', label: 'Overdue 1', count: 1 },
  { id: 'due_soon', label: 'Due soon 2', count: 2 },
  { id: 'renewals', label: 'Renewals 2', count: 2 },
  { id: 'important_dates', label: 'Important 1', count: 1 },
];

export const ATTENTION_SECTIONS: AttentionSectionGroup[] = [
  {
    key: 'overdue',
    title: 'OVERDUE',
    items: [
      {
        id: 'att-overdue-1',
        category: 'overdue',
        title: 'Pay school bus fee',
        subtitle: 'Overdue by 2 days · Rohan',
        iconName: 'alert-circle',
        iconBorderColor: '#6B3A2A',
        iconColor: '#F07A5A',
        isOverdue: true,
        hasRemindButton: true,
        assignee: 'Rohan',
      },
    ],
  },
  {
    key: 'due_soon',
    title: 'DUE SOON',
    items: [
      {
        id: 'att-duesoon-1',
        category: 'due_soon',
        title: 'Electricity bill · ₹2,840',
        subtitle: 'Due tomorrow · Priya',
        iconName: 'clock',
        iconBorderColor: '#3A4556',
        iconColor: '#CAD4DF',
        assignee: 'Priya',
      },
      {
        id: 'att-duesoon-2',
        category: 'due_soon',
        title: 'Refill Dadi’s BP tablets',
        subtitle: 'Saturday · Rohan',
        iconName: 'link-2',
        iconBorderColor: '#3A4556',
        iconColor: '#CAD4DF',
        assignee: 'Rohan',
      },
    ],
  },
  {
    key: 'renewals',
    title: 'RENEWALS',
    items: [
      {
        id: 'att-renew-1',
        category: 'renewals',
        title: 'Car insurance',
        subtitle: '18 Nov · in 19 days',
        iconName: 'truck',
        iconBorderColor: '#3A4556',
        iconColor: '#CAD4DF',
      },
      {
        id: 'att-renew-2',
        category: 'renewals',
        title: 'Rohan’s passport',
        subtitle: '14 Dec · in 45 days',
        iconName: 'file-text',
        iconBorderColor: '#3A4556',
        iconColor: '#CAD4DF',
        assignee: 'Rohan',
      },
    ],
  },
  {
    key: 'important_dates',
    title: 'IMPORTANT DATES',
    items: [
      {
        id: 'att-dates-1',
        category: 'important_dates',
        title: 'Nani’s birthday',
        subtitle: 'Wed, 4 Nov · in 5 days',
        iconName: 'gift',
        iconBorderColor: '#5A4128',
        iconColor: '#F6C08E',
      },
    ],
  },
];

