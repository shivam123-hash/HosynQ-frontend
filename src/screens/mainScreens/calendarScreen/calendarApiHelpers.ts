import { CalendarEvent, CalendarTaskDue, ImportantDateItem } from './types';

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

/** Formats 24h HH:mm to 12h clock "3:00 PM" */
export const formatTime12h = (time24?: string | null): string => {
  if (!time24) return '';
  const [hourStr, minStr] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minStr || '00'} ${ampm}`;
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

/** Maps Backend Event detail to Frontend CalendarEvent */
export const mapApiEventToUiEvent = (e: any): CalendarEvent => {
  const rawStartsOn = e.occurrenceOn || e.startsOn || '';
  const startsOn = rawStartsOn.includes('T') ? rawStartsOn.split('T')[0] : rawStartsOn;
  const startTime = formatTime12h(e.startTime);
  const endTime = formatTime12h(e.endTime);
  const formattedTime = e.allDay ? 'All Day' : endTime ? `${startTime} – ${endTime}` : startTime;
  const formattedDate = formatDateNice(startsOn) || startsOn;
  const cat = (e.category || 'FAMILY').toUpperCase();
  const categoryColor = getCategoryColor(cat);

  return {
    id: e.id,
    title: e.title || 'Untitled Event',
    date: startsOn,
    startTime: startTime || 'All day',
    endTime: endTime || '',
    formattedDate,
    formattedTime: formattedTime || 'All day',
    isAllDay: Boolean(e.allDay),
    category: cat,
    categoryColor,
    location: e.location || '',
    forMemberId: e.forMember?.memberId,
    forMemberName: e.forMember?.fullName,
    forMemberInitial: e.forMember?.fullName ? e.forMember.fullName[0].toUpperCase() : undefined,
    forMemberColor: e.forMember?.avatarColor || '#3B82F6',
    goingMemberIds: (e.going || []).map((g: any) => g.memberId),
    goingMembers: (e.going || []).map((g: any) => ({
      id: g.memberId,
      name: g.fullName,
      initial: g.fullName ? g.fullName[0].toUpperCase() : 'U',
      color: g.avatarColor || '#1F3A66',
    })),
    reminders: Array.isArray(e.reminders) ? e.reminders.join(', ') : '1 hour before',
    repeat: e.repeat || 'Doesn’t repeat',
    notes: e.notes || '',
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
  };
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

/** Maps Backend Important Date to UI ImportantDateItem */
export const mapApiImportantDateToUiItem = (item: any): ImportantDateItem => {
  const kind = (item.kind || item.type || 'other').toLowerCase();
  const validKind: ImportantDateItem['type'] =
    kind === 'birthday' ? 'birthday' : kind === 'anniversary' ? 'anniversary' : kind === 'document' ? 'document' : 'other';

  const section: ImportantDateItem['section'] =
    item.section === 'next_3_months' ? 'next_3_months' : item.section === 'later' ? 'later' : 'this_month';

  const personName = item.person?.fullName || item.personName || '';
  const personInitial = (personName.trim()[0] || 'M').toUpperCase();

  return {
    id: item.key || item.id || `imp-${Date.now()}`,
    title: item.title || 'Important Date',
    subtitle: item.years ? `Turning ${item.years}` : item.subtitle || '',
    dateFormatted: formatDateNice(item.date) || item.dateFormatted || item.date || '',
    daysLeft: typeof item.daysLeft === 'number' ? item.daysLeft : 0,
    timeRemainingText: item.timeRemainingText || (item.daysLeft !== undefined ? `in ${item.daysLeft} days` : ''),
    type: validKind,
    section,
    personName,
    personInitial,
    personColor: item.person?.avatarColor || item.personColor || '#F59E0B',
    reminders: item.reminders || '',
    whoSeesIt: item.whoSeesIt || 'Everyone',
    documentTitle: item.documentTitle,
    documentPath: item.documentPath,
    aiSuggestion: item.aiSuggestion,
  };
};
