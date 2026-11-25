import { CalendarCategory } from './types';

export const CALENDAR_CATEGORIES: CalendarCategory[] = [
  {
    id: 'family',
    name: 'Family',
    color: '#3B82F6',
    description: 'Birthdays, dinners, school events',
  },
  {
    id: 'personal',
    name: 'Personal',
    color: '#10B981',
    description: 'Classes, hobbies, your own plans',
  },
  {
    id: 'household',
    name: 'Household',
    color: '#F59E0B',
    description: 'Deliveries, repairs, services',
  },
  {
    id: 'health',
    name: 'Health',
    color: '#A855F7',
    description: 'Doctor visits, check-ups',
  },
  {
    id: 'travel',
    name: 'Travel',
    color: '#06B6D4',
    description: 'Trips and journeys',
  },
  {
    id: 'bills',
    name: 'Bills and renewals',
    color: '#F43F5E',
    description: 'EMIs, insurance, subscriptions',
  },
  {
    id: 'work',
    name: 'Work',
    color: '#64748B',
    description: 'Meetings, deadlines',
  },
];
