import {
  CalendarEvent,
  CalendarTaskDue,
  EventComment,
  CalendarFamilyMember,
} from './types';
import { CreateEventPayload, UpdateEventPayload } from '../../../services/calendarServices';

export const CATEGORY_COLORS: Record<string, string> = {
  FAMILY: '#3B82F6',
  PERSONAL: '#8B5CF6',
  HOUSEHOLD: '#F0913A',
  HEALTH: '#10B981',
  TRAVEL: '#14B8A6',
  FINANCE: '#EF4444',
  WORK: '#6366F1',
  SCHOOL: '#06B6D4',
  KIDS: '#F59E0B',
  OTHER: '#94A3B8',
};

export const getCategoryColor = (category?: string | null): string => {
  if (!category) return '#F0913A';
  const upper = category.toUpperCase().trim();
  return CATEGORY_COLORS[upper] || '#F0913A';
};

export const formatCategoryDisplay = (catName?: string | null): string => {
  if (!catName) return 'Family';
  const upper = catName.toUpperCase().trim();
  if (upper === 'FAMILY') return 'Family';
  if (upper === 'PERSONAL') return 'Personal';
  if (upper === 'HOUSEHOLD') return 'Household';
  if (upper === 'HEALTH') return 'Health';
  if (upper === 'TRAVEL') return 'Travel';
  if (upper === 'FINANCE' || upper === 'BILLS') return 'Bills';
  if (upper === 'WORK') return 'Work';
  if (upper === 'SCHOOL') return 'School';
  return catName.charAt(0).toUpperCase() + catName.slice(1).toLowerCase();
};

/** Formats 24h HH:mm to 12h clock "3:00 PM" */
export const formatTime12h = (time24?: string | null): string => {
  if (!time24) return '';
  const [hourStr, minStr] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minStr || '00'} ${ampm}`;
};

/** Converts 12h time string ("3:00 PM") or 24h string ("15:00") to strict 24h "HH:mm" */
export const to24HourTime = (timeStr?: string | null): string | undefined => {
  if (!timeStr || timeStr.toLowerCase().includes('all day')) return undefined;
  const trimmed = timeStr.trim();
  if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
    const [h, m] = trimmed.split(':');
    return `${h.padStart(2, '0')}:${m}`;
  }
  const match = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!match) return undefined;
  let hours = parseInt(match[1], 10);
  const minutes = match[2] || '00';
  const ampm = (match[3] || '').toUpperCase();

  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  return `${String(hours).padStart(2, '0')}:${minutes}`;
};

/** Maps UI repeat label to Backend Recurrence Frequency */
export const mapUiRepeatToBackend = (uiRepeat?: string | null): string | undefined => {
  if (!uiRepeat || uiRepeat === 'Doesn’t repeat' || uiRepeat === "Doesn't repeat") {
    return undefined;
  }
  const lower = uiRepeat.toLowerCase();
  if (lower.includes('weekday')) return 'DAILY';
  if (lower.includes('2 week') || lower.includes('two week') || lower.includes('biweek')) return 'WEEKLY';
  if (lower.includes('6 month')) return 'EVERY_6_MONTHS';
  if (lower.includes('3 month')) return 'EVERY_3_MONTHS';
  if (lower.includes('year')) return 'YEARLY';
  if (lower.includes('month')) return 'MONTHLY';
  if (lower.includes('week')) return 'WEEKLY';
  if (lower.includes('day')) return 'DAILY';
  if (lower.includes('custom')) return 'CUSTOM';
  return undefined;
};

/** Maps Backend Recurrence Frequency to UI repeat label */
export const mapBackendRepeatToUi = (freq?: string | null): string => {
  if (!freq || freq.toUpperCase() === 'NONE') return 'Doesn’t repeat';
  const upper = freq.toUpperCase();
  if (upper === 'DAILY') return 'Every day';
  if (upper === 'WEEKDAY') return 'Every weekday';
  if (upper === 'WEEKLY') return 'Every week';
  if (upper === 'BIWEEKLY' || upper === 'EVERY_2_WEEKS') return 'Every 2 weeks';
  if (upper === 'MONTHLY') return 'Every month';
  if (upper === 'EVERY_3_MONTHS') return 'Every 3 months';
  if (upper === 'EVERY_6_MONTHS') return 'Every 6 months';
  if (upper === 'YEARLY') return 'Every year';
  if (upper === 'CUSTOM') return 'Custom...';
  return freq;
};

/** Formats any repeat frequency or string cleanly for display */
export const formatDisplayRepeat = (freq?: string | null): string => {
  if (!freq || freq.toUpperCase() === 'NONE') return 'Doesn’t repeat';
  return mapBackendRepeatToUi(freq);
};

/** Allowed Calendar Reminders on the backend */
export const VALID_CALENDAR_REMINDERS = [
  'AT_START',
  'THIRTY_MIN_BEFORE',
  'TWO_HOURS_BEFORE',
  'EVENING_BEFORE',
  'ONE_DAY_BEFORE',
  'ONE_WEEK_BEFORE',
  'CUSTOM',
] as const;

export type ValidCalendarReminder = (typeof VALID_CALENDAR_REMINDERS)[number];

export const mapBackendReminderToUi = (backendReminder?: string | null): string => {
  if (!backendReminder) return '2 hours before';
  const trimmed = backendReminder.trim();
  if (trimmed.includes(',') || trimmed.includes('·')) {
    const parts = trimmed.split(/\s*[·,]\s*/).map((p) => mapBackendReminderToUi(p)).filter(Boolean);
    const unique = Array.from(new Set(parts));
    return unique.join(' · ');
  }
  const upper = trimmed.toUpperCase();
  if (upper === 'AT_START') return 'When it starts';
  if (upper === 'THIRTY_MIN_BEFORE') return '30 minutes before';
  if (upper === 'TWO_HOURS_BEFORE') return '2 hours before';
  if (upper === 'EVENING_BEFORE') return 'The evening before (7:00 PM)';
  if (upper === 'ONE_DAY_BEFORE') return '1 day before';
  if (upper === 'ONE_WEEK_BEFORE') return '1 week before';
  if (upper === 'CUSTOM') return 'Custom time';
  return backendReminder;
};

/** Formats any reminder(s) array or string cleanly into a unified display string (e.g. "1 day before · 2 hours before") */
export const formatDisplayReminders = (reminders?: string | string[] | null): string => {
  if (!reminders) return 'None';
  if (Array.isArray(reminders)) {
    const list = reminders
      .flatMap((s) => String(s).split(/\s*[·,]\s*/))
      .map((s) => mapBackendReminderToUi(s))
      .filter((s) => Boolean(s) && s !== 'None');
    const unique = Array.from(new Set(list));
    return unique.length > 0 ? unique.join(' · ') : 'None';
  }
  const str = String(reminders).trim();
  if (!str) return 'None';
  if (str.includes(',') || str.includes('·')) {
    const parts = str
      .split(/\s*[·,]\s*/)
      .map((s) => mapBackendReminderToUi(s))
      .filter((s) => Boolean(s) && s !== 'None');
    const unique = Array.from(new Set(parts));
    return unique.length > 0 ? unique.join(' · ') : 'None';
  }
  return mapBackendReminderToUi(str);
};

/** Maps UI reminder strings to Backend Reminder Enums, filtering out timed reminders for all-day events */
export const mapUiRemindersToBackend = (
  uiReminders?: string | string[] | null,
  isAllDay = false
): string[] => {
  if (!uiReminders) {
    return isAllDay ? ['ONE_DAY_BEFORE'] : ['TWO_HOURS_BEFORE'];
  }

  // Split any strings that contain ' · ' or commas into individual reminder items
  const rawList: string[] = Array.isArray(uiReminders)
    ? uiReminders.flatMap((s) => String(s).split(/\s*[·,]\s*/))
    : String(uiReminders).split(/\s*[·,]\s*/);

  const result: string[] = [];

  for (const item of rawList) {
    const raw = String(item).toUpperCase().trim();
    if (!raw) continue;
    const normalized = raw.replace(/[_\s-]+/g, ' ');

    if (
      raw === 'AT_START' ||
      normalized === 'WHEN IT STARTS' ||
      normalized.includes('ON THE DAY') ||
      normalized.includes('AT START')
    ) {
      result.push('AT_START');
    } else if (
      raw === 'THIRTY_MIN_BEFORE' ||
      normalized.includes('30 MIN') ||
      normalized.includes('THIRTY MIN')
    ) {
      if (!isAllDay) result.push('THIRTY_MIN_BEFORE');
    } else if (
      raw === 'TWO_HOURS_BEFORE' ||
      normalized.includes('2 HOUR') ||
      normalized.includes('TWO HOUR')
    ) {
      if (!isAllDay) result.push('TWO_HOURS_BEFORE');
    } else if (
      raw === 'EVENING_BEFORE' ||
      normalized.includes('EVENING') ||
      normalized.includes('7 00 PM') ||
      normalized.includes('7 PM')
    ) {
      result.push('EVENING_BEFORE');
    } else if (
      raw === 'ONE_DAY_BEFORE' ||
      normalized.includes('1 DAY') ||
      normalized.includes('ONE DAY') ||
      normalized.includes('DAY BEFORE')
    ) {
      result.push('ONE_DAY_BEFORE');
    } else if (
      raw === 'ONE_WEEK_BEFORE' ||
      normalized.includes('1 WEEK') ||
      normalized.includes('ONE WEEK') ||
      normalized.includes('WEEK BEFORE')
    ) {
      result.push('ONE_WEEK_BEFORE');
    } else if (raw === 'CUSTOM' || normalized.includes('CUSTOM')) {
      result.push('CUSTOM');
    }
  }

  const allowedOptions: readonly string[] = isAllDay
    ? ['AT_START', 'EVENING_BEFORE', 'ONE_DAY_BEFORE', 'ONE_WEEK_BEFORE', 'CUSTOM']
    : VALID_CALENDAR_REMINDERS;

  const filtered = Array.from(new Set(result)).filter((r) => allowedOptions.includes(r));
  return filtered.length > 0 ? filtered : isAllDay ? ['ONE_DAY_BEFORE'] : ['TWO_HOURS_BEFORE'];
};

export const isUUID = (str: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const WEEKDAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

export const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const parseIsoDate = (dateStr: string): Date => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

export const toIsoDateString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const addDaysToDate = (dateStr: string, days: number): string => {
  const d = parseIsoDate(dateStr);
  d.setDate(d.getDate() + days);
  return toIsoDateString(d);
};

export interface WeekDayItem {
  dayName: string;
  dayShort: string;
  dayNum: number;
  dateStr: string;
}

export const getWeekDaysForDate = (dateStr: string): WeekDayItem[] => {
  const target = parseIsoDate(dateStr);
  const dayOfWeek = target.getDay(); // 0 = Sun, 1 = Mon...
  const diffToMonday = (dayOfWeek + 6) % 7; // Monday = 0
  const monday = new Date(target.getFullYear(), target.getMonth(), target.getDate() - diffToMonday);

  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const items: WeekDayItem[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    items.push({
      dayName: dayNames[i],
      dayShort: dayNames[i],
      dayNum: d.getDate(),
      dateStr: toIsoDateString(d),
    });
  }
  return items;
};

export const formatFullDayLabel = (dateStr: string): string => {
  try {
    const parts = dateStr.split('-').map(Number);
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      const weekday = WEEKDAY_NAMES[d.getDay()];
      const day = d.getDate();
      const month = MONTH_NAMES[d.getMonth()];
      return `${weekday}, ${day} ${month}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

export const formatWeekRange = (mondayStr: string, sundayStr: string): string => {
  try {
    const [y1, m1, d1] = mondayStr.split('-').map(Number);
    const [y2, m2, d2] = sundayStr.split('-').map(Number);
    const m1Name = SHORT_MONTHS[m1 - 1];
    const m2Name = SHORT_MONTHS[m2 - 1];
    if (m1 === m2) {
      return `${d1} – ${d2} ${m1Name}`;
    }
    return `${d1} ${m1Name} – ${d2} ${m2Name}`;
  } catch {
    return `${mondayStr} – ${sundayStr}`;
  }
};

/** Formats YYYY-MM-DD to "Fri, 30 Oct" */
export const formatDateNice = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-').map(Number);
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weekday = days[d.getDay()];
      const day = d.getDate();
      const month = SHORT_MONTHS[d.getMonth()];
      return `${weekday}, ${day} ${month}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

/** Normalizes API RSVP values so PENDING / empty / unknown values become null */
export const normalizeRsvpResponse = (
  val: any
): 'GOING' | 'NOT_GOING' | null => {
  if (typeof val !== 'string') return null;
  const upper = val.toUpperCase().trim();
  if (upper === 'GOING') return 'GOING';
  if (upper === 'NOT_GOING') return 'NOT_GOING';
  return null;
};

/** Maps Backend Event detail to Frontend CalendarEvent */
export const mapApiEventToUiEvent = (e: any): CalendarEvent => {
  const rawStartsOn = e.occurrenceOn || e.startsOn || '';
  const startsOn = rawStartsOn.includes('T') ? rawStartsOn.split('T')[0] : rawStartsOn;
  const rawEndsOn = e.endsOn || rawStartsOn;
  const endsOn = rawEndsOn.includes('T') ? rawEndsOn.split('T')[0] : rawEndsOn;
  const startTime = formatTime12h(e.startTime);
  const endTime = formatTime12h(e.endTime);
  const formattedTime = e.allDay ? 'All Day' : endTime ? `${startTime} – ${endTime}` : startTime;
  const formattedDate = formatDateNice(startsOn) || startsOn;
  const cat = (e.category || 'FAMILY').toUpperCase();
  const categoryColor = getCategoryColor(cat);

  const rawGoing = Array.isArray(e.going)
    ? e.going
    : Array.isArray(e.goingMembers)
    ? e.goingMembers
    : [];
  const rawInvitees = Array.isArray(e.invitees) ? e.invitees : [];
  const goingFromInvitees = rawInvitees.filter(
    (i: any) => normalizeRsvpResponse(i.response) === 'GOING'
  );

  const combinedGoingMap = new Map<string, any>();
  for (const g of rawGoing) {
    const id = g.memberId || g.id;
    if (id) {
      combinedGoingMap.set(id, {
        id,
        name: g.fullName || g.name || 'Member',
        initial: (g.fullName || g.name || 'M')[0].toUpperCase(),
        color: g.avatarColor || g.color || '#1F3A66',
        textColor: g.textColor,
      });
    }
  }
  for (const inv of goingFromInvitees) {
    const id = inv.memberId || inv.id;
    if (id && !combinedGoingMap.has(id)) {
      combinedGoingMap.set(id, {
        id,
        name: inv.fullName || inv.name || 'Member',
        initial: (inv.fullName || inv.name || 'M')[0].toUpperCase(),
        color: inv.avatarColor || inv.color || '#1F3A66',
        textColor: inv.textColor,
      });
    }
  }

  const resolvedGoingMembers = Array.from(combinedGoingMap.values());
  const resolvedGoingMemberIds = resolvedGoingMembers.map((m) => m.id);
  if (resolvedGoingMemberIds.length === 0 && Array.isArray(e.goingMemberIds)) {
    resolvedGoingMemberIds.push(...e.goingMemberIds);
  }
  const resolvedInvitedMemberIds = rawInvitees
    .map((i: any) => i.memberId || i.id)
    .filter(Boolean);
  const resolvedInvitees =
    rawInvitees.length > 0
      ? rawInvitees
          .map((i: any) => ({
            id: i.memberId || i.id || '',
            name: i.fullName || i.name || 'Member',
            response: normalizeRsvpResponse(i.response),
          }))
          .filter((i: any) => Boolean(i.id))
      : undefined;

  const creatorObj =
    typeof e.creator === 'object' && e.creator
      ? e.creator
      : typeof e.createdBy === 'object' && e.createdBy
      ? e.createdBy
      : null;
  const resolvedCreatedByMemberId =
    e.createdByMemberId ||
    creatorObj?.memberId ||
    creatorObj?.id ||
    (typeof e.createdBy === 'string' ? e.createdBy : undefined) ||
    e.createdById;
  const resolvedCreatedById =
    e.createdById ||
    e.createdByUserId ||
    creatorObj?.userId ||
    resolvedCreatedByMemberId;

  const isCreatorFlag = Boolean(
    e.isCreator ||
      e.isMine ||
      creatorObj?.isMine ||
      creatorObj?.isYou ||
      (e.permissions && e.permissions.isCreator)
  );
  const myInviteeFromApi = rawInvitees.find((i: any) => i.isYou || i.isMine);
  const resolvedMyResponse =
    normalizeRsvpResponse(e.myResponse) ||
    normalizeRsvpResponse(myInviteeFromApi?.response) ||
    null;

  return {
    id: e.id || e.eventId || e._id || `evt-${Date.now()}`,
    title: e.title || 'Untitled Event',
    date: startsOn,
    endDate: endsOn,
    startTime: startTime || 'All day',
    endTime: endTime || '',
    formattedDate,
    formattedTime: formattedTime || 'All day',
    isAllDay: Boolean(
      e.allDay ||
      e.isAllDay ||
      (!e.startTime && !e.endTime) ||
      startTime === 'All day' ||
      e.startTime === 'All day' ||
      (e.startTime === '00:00' && (e.endTime === '23:59' || e.endTime === '24:00')) ||
      (startTime === '12:00 AM' && (endTime === '11:59 PM' || endTime === '12:00 AM'))
    ),
    category: formatCategoryDisplay(e.category),
    categoryColor,
    location: e.location || '',
    createdByMemberId: resolvedCreatedByMemberId,
    createdById: resolvedCreatedById,
    isCreator: isCreatorFlag,
    invitedMemberIds:
      resolvedInvitedMemberIds.length > 0
        ? resolvedInvitedMemberIds
        : Array.isArray(e.invitedMemberIds)
        ? e.invitedMemberIds
        : undefined,
    invitees: resolvedInvitees,
    forMemberId: e.forMember?.memberId,
    forMemberName: e.forMember?.fullName,
    forMemberInitial: e.forMember?.fullName ? e.forMember.fullName[0].toUpperCase() : undefined,
    forMemberColor: e.forMember?.avatarColor || '#3B82F6',
    goingMemberIds: resolvedGoingMemberIds,
    goingMembers: resolvedGoingMembers,
    reminders: formatDisplayReminders(e.reminders),
    repeat: formatDisplayRepeat(e.repeat || e.repeatFreq),
    notes: e.notes || '',
    sourceNote: e.sourceLabel || e.sourceNote,
    sourcePollId:
      e.pollId || (e.sourceType === 'PULSE_POLL' ? e.sourceId : undefined),
    comments: (e.comments?.latest || []).map((c: any) => ({
      id: c.id,
      authorId: c.author?.memberId || '',
      authorName: c.author?.fullName || 'Member',
      authorInitial: c.author?.fullName ? c.author.fullName[0].toUpperCase() : 'M',
      authorColor: c.author?.avatarColor || '#1F3A66',
      time: c.createdAt || 'Just now',
      text: c.body || '',
      isCurrentUser: Boolean(c.isMine),
    })),
    myResponse: resolvedMyResponse,
    askToConfirm: Boolean(e.askToConfirm),
    canEdit: e.permissions ? Boolean(e.permissions.canEdit) : true,
    canCancel: e.permissions ? Boolean(e.permissions.canCancel) : true,
    canRespond: e.permissions
      ? Boolean(e.permissions.canRespond) && !resolvedMyResponse && !isCreatorFlag
      : !resolvedMyResponse && !isCreatorFlag,
    backendCanRespond:
      typeof e.permissions?.canRespond === 'boolean'
        ? e.permissions.canRespond
        : undefined,
  };
};

/** Alias for mapApiEventToUiEvent for flexible import */
export const formatEventForUi = mapApiEventToUiEvent;

/** Maps API comments stream (GET /api/v1/calendar/events/:id/comments) to UI EventComment objects */
export const mapApiCommentsToUi = (comments: any[]): EventComment[] => {
  if (!Array.isArray(comments)) return [];
  return comments.map((c: any) => ({
    id: c.id || `comm-${Date.now()}-${Math.random()}`,
    authorId: c.author?.memberId || '',
    authorName: c.author?.fullName || (c.isMine ? 'You' : 'Member'),
    authorInitial: c.author?.fullName
      ? c.author.fullName.trim()[0].toUpperCase()
      : c.isMine
      ? 'Y'
      : 'M',
    authorColor: c.author?.avatarColor || '#1F3A66',
    time: c.createdAt ? formatDateNice(c.createdAt.split('T')[0]) || 'Just now' : 'Just now',
    text: c.body || '',
    isCurrentUser: Boolean(c.isMine),
  }));
};

/** Maps Backend Task to CalendarTaskDue */
export const mapApiTaskToCalendarTask = (t: any): CalendarTaskDue => {
  const cat = (t.category || 'HOUSEHOLD').toUpperCase();
  const categoryColor = getCategoryColor(cat);
  const rawDate = t.dueOn || t.dueDate || '';
  const cleanDate = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate;
  return {
    id: t.id,
    title: t.title,
    dueDate: cleanDate,
    dueTime: formatTime12h(t.dueTime),
    assignee: t.assignees?.[0]?.fullName || 'Unassigned',
    isOverdue: Boolean(t.isOverdue),
    isCompleted: Boolean(t.isCompleted),
    memberId: t.assignees?.[0]?.memberId,
    category: cat,
    categoryColor,
  };
};

/** Converts string to strict YYYY-MM-DD format */
export const toStrictIsoDate = (val?: string | null): string => {
  if (!val) return toIsoDateString(new Date());
  const trimmed = val.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) return toIsoDateString(d);
  return toIsoDateString(new Date());
};

/** Maps UI category label to strict backend enum (FAMILY, PERSONAL, HOUSEHOLD, HEALTH, TRAVEL, FINANCE, WORK) */
export const mapCategoryToBackend = (cat?: string | null): string => {
  if (!cat) return 'FAMILY';
  const upper = cat.toUpperCase().trim();
  if (upper.includes('BILL') || upper.includes('RENEW') || upper === 'FINANCE') return 'FINANCE';
  if (upper.includes('FAM')) return 'FAMILY';
  if (upper.includes('PERS')) return 'PERSONAL';
  if (upper.includes('HOUSE')) return 'HOUSEHOLD';
  if (upper.includes('HEALTH')) return 'HEALTH';
  if (upper.includes('TRAV')) return 'TRAVEL';
  if (upper.includes('WORK')) return 'WORK';
  return 'FAMILY';
};

/** Builds a fully validated, sanitized CreateEventPayload ready for the backend */
export const buildCreateEventPayload = (
  eventData: Partial<CalendarEvent>
): CreateEventPayload => {
  const startsOn = toStrictIsoDate(eventData.date);
  const endsOn = toStrictIsoDate(eventData.endDate || eventData.date);
  const isAllDay = Boolean(eventData.isAllDay);

  const starts24 = isAllDay ? '00:00' : (to24HourTime(eventData.startTime) || '10:00');
  let ends24 = isAllDay ? '23:59' : to24HourTime(eventData.endTime);
  if (!isAllDay && !ends24 && starts24) {
    const [h, m] = starts24.split(':').map(Number);
    ends24 = `${String(Math.min(23, h + 1)).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  const category = mapCategoryToBackend(eventData.category);
  const repeat = mapUiRepeatToBackend(eventData.repeat);
  const reminders = mapUiRemindersToBackend(eventData.reminders, isAllDay);

  const inviteeMemberIds = (eventData.goingMemberIds || []).filter((id) => isUUID(id));
  const forMemberId =
    eventData.forMemberId && isUUID(eventData.forMemberId)
      ? eventData.forMemberId
      : undefined;

  return {
    title: (eventData.title || 'Untitled Event').trim(),
    notes: eventData.notes ? eventData.notes.trim() : undefined,
    location: eventData.location ? eventData.location.trim() : undefined,
    category,
    startsOn,
    startTime: starts24,
    endsOn,
    endTime: ends24,
    inviteeMemberIds: inviteeMemberIds.length > 0 ? inviteeMemberIds : undefined,
    forMemberId,
    repeat,
    reminders,
    askToConfirm: true,
  };
};

/** Builds a fully validated, sanitized UpdateEventPayload ready for the backend */
export const buildUpdateEventPayload = (
  eventData: Partial<CalendarEvent>,
  scope?: 'THIS_ONE' | 'THIS_AND_FUTURE' | 'ALL',
  occurrenceOn?: string
): UpdateEventPayload => {
  const startsOn = eventData.date ? toStrictIsoDate(eventData.date) : undefined;
  const endsOn = eventData.endDate ? toStrictIsoDate(eventData.endDate) : startsOn;
  const isAllDay = Boolean(eventData.isAllDay);
  const starts24 = isAllDay ? '00:00' : to24HourTime(eventData.startTime);
  const ends24 = isAllDay ? '23:59' : to24HourTime(eventData.endTime);
  const category = eventData.category ? mapCategoryToBackend(eventData.category) : undefined;
  const repeat =
    scope === 'THIS_ONE' || !eventData.repeat
      ? undefined
      : mapUiRepeatToBackend(eventData.repeat);
  const reminders = eventData.reminders ? mapUiRemindersToBackend(eventData.reminders, isAllDay) : undefined;

  const inviteeMemberIds = eventData.goingMemberIds
    ? eventData.goingMemberIds.filter((id) => isUUID(id))
    : undefined;
  const forMemberId =
    eventData.forMemberId && isUUID(eventData.forMemberId)
      ? eventData.forMemberId
      : undefined;

  return {
    title: eventData.title ? eventData.title.trim() : undefined,
    notes: eventData.notes !== undefined ? eventData.notes.trim() : undefined,
    location: eventData.location !== undefined ? eventData.location.trim() : undefined,
    category,
    startsOn,
    startTime: starts24,
    endsOn,
    endTime: ends24,
    inviteeMemberIds,
    forMemberId,
    repeat,
    reminders,
    scope: scope || (repeat ? 'ALL' : undefined),
    occurrenceOn: occurrenceOn ? toStrictIsoDate(occurrenceOn) : startsOn,
  };
};

/**
 * Extracts and maps family members from Redux familyState across all possible response shapes
 * (basicFamilyData, family.members, myFamilyData, etc.).
 */
export const resolveMyMemberIdFromState = (
  familyState: any,
  authUserId?: string | null
): string | null => {
  if (!familyState && !authUserId) return null;
  const direct =
    familyState?.myMemberId ||
    familyState?.family?.myMemberId ||
    familyState?.myFamilyData?.family?.myMemberId ||
    familyState?.myFamilyData?.myMemberId ||
    familyState?.basicFamilyData?.myMemberId ||
    familyState?.basicFamilyData?.family?.myMemberId;
  if (direct) return String(direct);

  const memberLists = [
    familyState?.basicFamilyData?.members,
    familyState?.basicFamilyData?.family?.members,
    familyState?.myFamilyData?.family?.members,
    familyState?.myFamilyData?.members,
    familyState?.family?.members,
  ];
  for (const list of memberLists) {
    if (!Array.isArray(list)) continue;
    const match = list.find(
      (m: any) =>
        m?.isYou === true ||
        (authUserId && m?.userId && String(m.userId) === String(authUserId))
    );
    if (match) {
      const resolved = match.memberId || match.id || match._id;
      if (resolved) return String(resolved);
    }
  }
  return null;
};

export const extractFamilyMembersFromState = (
  familyState: any
): CalendarFamilyMember[] => {
  if (!familyState) return [];

  const candidates = [
    familyState.basicFamilyData,
    familyState.basicFamilyData?.family,
    familyState.basicFamilyData?.data,
    familyState.basicFamilyData?.data?.family,
    familyState.family,
    familyState.family?.family,
    familyState.family?.data,
    familyState.myFamilyData,
    familyState.myFamilyData?.family,
    familyState.myFamilyData?.data,
    familyState.myFamilyData?.data?.family,
    familyState,
  ];

  let rawList: any[] | undefined;

  for (const c of candidates) {
    if (!c) continue;
    if (Array.isArray(c) && c.length > 0) {
      rawList = c;
      break;
    }
    if (Array.isArray(c.members) && c.members.length > 0) {
      rawList = c.members;
      break;
    }
    if (Array.isArray(c.familyMembers) && c.familyMembers.length > 0) {
      rawList = c.familyMembers;
      break;
    }
    if (Array.isArray(c.data) && c.data.length > 0) {
      rawList = c.data;
      break;
    }
  }

  if (Array.isArray(rawList) && rawList.length > 0) {
    return rawList.map((m: any, idx: number) => {
      const fullName = m.fullName || m.name || (m.isYou ? 'You' : `Member ${idx + 1}`);
      const firstName = fullName.trim().split(' ')[0] || fullName;
      const initial = (firstName.trim()[0] || 'M').toUpperCase();
      return {
        id: String(m.memberId || m.id || m.userId || m._id || `m-${idx}`),
        name: m.isYou ? `${firstName} (you)` : firstName,
        initial,
        color: m.avatarColor || m.color || (idx % 2 === 0 ? '#1F3A66' : '#4A2E1A'),
        textColor: '#FFFFFF',
        isYou: Boolean(m.isYou),
      };
    });
  }

  return [];
};
