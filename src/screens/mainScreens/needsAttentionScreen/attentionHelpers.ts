import {
  HomeAttentionItemApi,
  NeedsAttentionSectionFilter,
  NeedsAttentionSectionName,
  NeedsAttentionSource,
} from '../../../services/homeServices';
import { format24HourTo12Hour } from '../addFlow/reminderApiHelpers';
import { AttentionItem as HomeAttentionItem } from '../homeScreen/types';
import {
  AttentionCategory,
  AttentionFilterType,
  AttentionItem as ScreenAttentionItem,
} from './types';

export const normalizeAttentionSource = (
  source?: string | null
): NeedsAttentionSource => {
  const upper = String(source || '').toUpperCase();
  if (upper === 'REMINDER') return 'REMINDER';
  if (upper === 'TASK') return 'TASK';
  if (upper === 'VAULT') return 'VAULT';
  if (upper === 'LIFE_PROFILE') return 'LIFE_PROFILE';
  if (upper === 'IMPORTANT_DATE') return 'IMPORTANT_DATE';
  return 'TASK';
};

export const mapFilterToBackendSection = (
  filter?: AttentionFilterType
): NeedsAttentionSectionFilter => {
  switch (filter) {
    case 'OVERDUE':
    case 'overdue':
      return 'OVERDUE';
    case 'DUE_SOON':
    case 'due_soon':
      return 'DUE_SOON';
    case 'RENEWALS':
    case 'renewals':
      return 'RENEWALS';
    case 'IMPORTANT_DATES':
    case 'important_dates':
      return 'IMPORTANT_DATES';
    default:
      return 'ALL';
  }
};

export const mapBackendSectionToCategory = (
  section: NeedsAttentionSectionName
): AttentionCategory => {
  switch (section) {
    case 'OVERDUE':
      return 'overdue';
    case 'DUE_SOON':
      return 'due_soon';
    case 'RENEWALS':
      return 'renewals';
    case 'IMPORTANT_DATES':
      return 'important_dates';
    default:
      return 'due_soon';
  }
};

const formatDateShort = (isoDate?: string | null): string => {
  if (!isoDate) return '';
  const clean = String(isoDate).slice(0, 10);
  const d = new Date(`${clean}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return clean;
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
};

const formatDaysLeftLabel = (daysLeft: number): string => {
  if (daysLeft < -1) return `Overdue by ${Math.abs(daysLeft)} days`;
  if (daysLeft === -1) return 'Overdue by 1 day';
  if (daysLeft === 0) return 'Today';
  if (daysLeft === 1) return 'Tomorrow';
  return `in ${daysLeft} days`;
};

const formatRelativeDateLabel = (
  on?: string | null,
  daysLeft: number = 0
): string => {
  if (daysLeft < 0) {
    return formatDaysLeftLabel(daysLeft);
  }
  if (daysLeft === 0) return 'Today';
  if (daysLeft === 1) return 'Tomorrow';
  return formatDateShort(on) || `in ${daysLeft} days`;
};

const formatPeopleNames = (item: HomeAttentionItemApi): string => {
  const list = item.people || [];
  if (list.length === 0) return '';
  return list
    .map((p) => (p.fullName || 'Member').trim().split(/\s+/)[0])
    .join(', ');
};

const resolveVaultIcon = (group?: string | null): string => {
  const g = String(group || '').toUpperCase();
  if (g === 'ASSET' || g === 'VEHICLE' || g === 'CAR' || g === 'MOTOR') {
    return 'truck';
  }
  if (g === 'INSURANCE') return 'shield';
  return 'file-text';
};

const buildFormattedTitle = (item: HomeAttentionItemApi): string => {
  if (item.source === 'VAULT' && typeof item.amount === 'number' && item.amount > 0) {
    return `${item.title} · ₹${item.amount.toLocaleString('en-IN')}`;
  }
  return item.title;
};

const buildFormattedSubtitle = (item: HomeAttentionItemApi): string => {
  const peopleStr = formatPeopleNames(item);
  const dateFormatted = formatDateShort(item.on);
  const daysLabel = formatDaysLeftLabel(item.daysLeft);
  const time12 = item.time ? format24HourTo12Hour(item.time) : '';

  switch (item.source) {
    case 'REMINDER': {
      const whenPart = formatRelativeDateLabel(item.on, item.daysLeft);
      return [whenPart, time12, peopleStr].filter(Boolean).join(' · ');
    }
    case 'TASK': {
      const duePart =
        item.daysLeft < 0
          ? daysLabel
          : item.daysLeft === 0
          ? 'Due today'
          : item.daysLeft === 1
          ? 'Due tomorrow'
          : dateFormatted || daysLabel;
      return [duePart, peopleStr].filter(Boolean).join(' · ');
    }
    case 'VAULT': {
      return [dateFormatted, daysLabel].filter(Boolean).join(' · ');
    }
    case 'LIFE_PROFILE': {
      return [peopleStr, dateFormatted, daysLabel].filter(Boolean).join(' · ');
    }
    case 'IMPORTANT_DATE': {
      return [dateFormatted, item.daysLeft === 0 ? 'Today' : daysLabel]
        .filter(Boolean)
        .join(' · ');
    }
    default:
      return [dateFormatted, peopleStr].filter(Boolean).join(' · ');
  }
};

const resolveVisuals = (
  item: HomeAttentionItemApi
): { iconName: string; iconColor: string; iconBorderColor: string } => {
  const isOverdue = item.daysLeft < 0 || item.section === 'OVERDUE';

  switch (item.source) {
    case 'REMINDER':
      return isOverdue
        ? { iconName: 'bell', iconColor: '#F07A5A', iconBorderColor: '#6B3A2A' }
        : { iconName: 'bell', iconColor: '#F6C08E', iconBorderColor: '#6E4924' };
    case 'TASK':
      return isOverdue
        ? {
            iconName: 'alert-circle',
            iconColor: '#F07A5A',
            iconBorderColor: '#6B3A2A',
          }
        : { iconName: 'clock', iconColor: '#C9D1DC', iconBorderColor: '#3A4556' };
    case 'VAULT':
      return {
        iconName: resolveVaultIcon(item.group),
        iconColor: isOverdue ? '#F07A5A' : '#CAD4DF',
        iconBorderColor: isOverdue ? '#6B3A2A' : '#3A4556',
      };
    case 'LIFE_PROFILE':
      return {
        iconName: 'file-text',
        iconColor: isOverdue ? '#F07A5A' : '#CAD4DF',
        iconBorderColor: isOverdue ? '#6B3A2A' : '#3A4556',
      };
    case 'IMPORTANT_DATE':
      return {
        iconName: 'gift',
        iconColor: '#F6C08E',
        iconBorderColor: '#5A4128',
      };
    default:
      return {
        iconName: 'alert-circle',
        iconColor: '#CAD4DF',
        iconBorderColor: '#3A4556',
      };
  }
};

export const mapHomeAttentionToScreenItem = (
  item: HomeAttentionItemApi
): ScreenAttentionItem => {
  const isOverdue = item.daysLeft < 0 || item.section === 'OVERDUE';
  const visuals = resolveVisuals(item);
  const category = mapBackendSectionToCategory(item.section);

  let hasRemindButton = false;
  let actionLabel: string | undefined;
  if (item.source === 'REMINDER') {
    hasRemindButton = true;
    actionLabel = 'Done';
  } else if (item.source === 'TASK' && item.daysLeft <= 0) {
    hasRemindButton = true;
    actionLabel = 'Remind';
  }

  return {
    id: item.key,
    key: item.key,
    rawId: item.id,
    category,
    backendSection: item.section,
    source: item.source,
    group: item.group,
    on: item.on,
    time: item.time,
    daysLeft: item.daysLeft,
    amount: item.amount,
    people: item.people,
    title: buildFormattedTitle(item),
    subtitle: buildFormattedSubtitle(item),
    iconName: visuals.iconName,
    iconBorderColor: visuals.iconBorderColor,
    iconColor: visuals.iconColor,
    isOverdue,
    hasRemindButton,
    actionLabel,
    assignee: formatPeopleNames(item),
    reminderId: item.source === 'REMINDER' ? item.id : undefined,
    taskId: item.source === 'TASK' ? item.id : undefined,
    done: false,
  };
};

export const mapHomeAttentionToHomeItem = (
  item: HomeAttentionItemApi
): HomeAttentionItem => {
  const isOverdue = item.daysLeft < 0 || item.section === 'OVERDUE';
  const itemType: HomeAttentionItem['type'] = isOverdue
    ? 'urgent'
    : item.source === 'REMINDER' || item.source === 'IMPORTANT_DATE'
    ? 'warning'
    : 'info';

  return {
    id: item.key,
    key: item.key,
    rawId: item.id,
    title: buildFormattedTitle(item),
    subtitle: buildFormattedSubtitle(item),
    type: itemType,
    isOverdue,
    source: item.source,
    group: item.group,
    on: item.on,
    time: item.time,
    daysLeft: item.daysLeft,
    amount: item.amount,
    backendSection: item.section,
    people: item.people,
    reminderId: item.source === 'REMINDER' ? item.id : undefined,
    taskId: item.source === 'TASK' ? item.id : undefined,
    done: false,
  };
};
