import { ListType, TaskCategory, TaskPriority } from './types';

export const CATEGORY_META: Record<
  TaskCategory,
  { label: string; color: string; badgeBorder: string }
> = {
  household: {
    label: 'Household',
    color: '#F0913A',
    badgeBorder: '#6B3A2A',
  },
  family: {
    label: 'Family',
    color: '#3B82F6',
    badgeBorder: '#1E3A66',
  },
  personal: {
    label: 'Personal',
    color: '#10B981',
    badgeBorder: '#1E4E38',
  },
  finance: {
    label: 'Finance',
    color: '#F06A6A',
    badgeBorder: '#F06A6A',
  },
  health: {
    label: 'Health',
    color: '#8B5CF6',
    badgeBorder: '#3C2166',
  },
  travel: {
    label: 'Travel',
    color: '#14B8A6',
    badgeBorder: '#164E48',
  },
  work: {
    label: 'Work',
    color: '#94A3B8',
    badgeBorder: '#273C56',
  },
};

export const PRIORITY_META: Record<
  TaskPriority,
  { label: string; color: string }
> = {
  high: { label: 'High priority', color: '#F06A6A' },
  medium: { label: 'Medium', color: '#FBBF24' },
  low: { label: 'Low', color: '#94A3B8' },
};

export const START_SUGGESTIONS = [
  { id: 's-1', title: 'Pay electricity bill', dotColor: '#F87171' },
  { id: 's-2', title: 'Buy groceries', dotColor: '#F0913A' },
  { id: 's-3', title: 'Book a doctor visit', dotColor: '#8B5CF6' },
  { id: 's-4', title: 'Pay school fees', dotColor: '#3B82F6' },
];

export const LIST_TYPE_CONFIG: Record<
  ListType,
  { label: string; subtitle: string; icon: string; color: string; bg: string }
> = {
  grocery: {
    label: 'Grocery',
    subtitle: 'Food, home supplies',
    icon: 'shopping-cart',
    color: '#F0913A',
    bg: '#3D2517',
  },
  packing: {
    label: 'Packing',
    subtitle: 'Trips, hospital bag',
    icon: 'briefcase',
    color: '#2DD4BF',
    bg: '#13383B',
  },
  school: {
    label: 'School',
    subtitle: 'Books, uniforms, projects',
    icon: 'book',
    color: '#60A5FA',
    bg: '#152B4D',
  },
  party: {
    label: 'Party',
    subtitle: 'Guests, food, décor',
    icon: 'volume-2',
    color: '#C084FC',
    bg: '#2B1B40',
  },
  custom: {
    label: 'Custom',
    subtitle: 'Anything else',
    icon: 'list',
    color: '#34D399',
    bg: '#14382B',
  },
};
