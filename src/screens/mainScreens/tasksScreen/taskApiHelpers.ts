/**
 * Helper functions to transform human-readable UI task values
 * into exact backend DTO formats expected by Hosynq-backend (CreateTaskDto).
 */

// 1. Format date to YYYY-MM-DD
export const toIsoDateString = (dateVal?: string | Date): string => {
  if (!dateVal) {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  if (dateVal instanceof Date) {
    return `${dateVal.getFullYear()}-${String(dateVal.getMonth() + 1).padStart(2, '0')}-${String(dateVal.getDate()).padStart(2, '0')}`;
  }
  const trimmed = dateVal.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  // Fallback to today in YYYY-MM-DD
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// 2. Format 12-hour AM/PM or prefixed time to 24-hour HH:mm ("9:00 AM" -> "09:00", "Evening 6:00" -> "18:00", "by 6:00 PM" -> "18:00")
export const formatTimeTo24Hour = (timeStr?: string): string | undefined => {
  if (!timeStr) return undefined;
  const trimmed = timeStr.trim();
  if (/^([01]\d|2[0-3]):[0-5]\d$/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return undefined;
  let [_, h, m, meridiem] = match;
  let hours = parseInt(h, 10);
  const upper = trimmed.toUpperCase();

  let isPM = false;
  if (meridiem) {
    isPM = meridiem.toUpperCase() === 'PM';
  } else if (
    upper.includes('EVENING') ||
    upper.includes('AFTERNOON') ||
    upper.includes('NIGHT') ||
    upper.includes('PM')
  ) {
    isPM = true;
  } else if (upper.includes('MORNING') || upper.includes('AM')) {
    isPM = false;
  }

  if (isPM && hours < 12) hours += 12;
  if (!isPM && hours === 12 && (meridiem || upper.includes('MORNING') || upper.includes('AM'))) {
    hours = 0;
  }
  return `${String(hours).padStart(2, '0')}:${m}`;
};

// 3. Map repeat option to backend enum
export const mapRepeatToBackend = (repeatStr?: string): string | undefined => {
  if (!repeatStr) return undefined;
  const norm = repeatStr.toLowerCase().replace(/['’]/g, "'").trim();
  if (norm.includes("doesn't") || norm.includes('never') || norm === 'none') {
    return undefined;
  }
  if (norm.includes('day') || norm.includes('daily')) return 'DAILY';
  if (norm.includes('week') || norm.includes('weekly')) return 'WEEKLY';
  if (norm.includes('3 month') || norm.includes('quarter')) return 'EVERY_3_MONTHS';
  if (norm.includes('month') || norm.includes('monthly')) return 'MONTHLY';
  if (norm.includes('year') || norm.includes('yearly') || norm.includes('annual')) return 'YEARLY';
  if (norm.includes('custom')) return 'CUSTOM';
  return undefined;
};

// 4. Map reminder labels to backend enum
export const mapReminderToBackend = (reminderStr: string): string | null => {
  if (!reminderStr) return null;
  const norm = reminderStr.toLowerCase().replace(/['’]/g, "'").trim();
  if (norm.includes('due') || norm.includes("it's due")) return 'AT_DUE';
  if (norm.includes('1 hour') || norm.includes('one hour')) return 'ONE_HOUR_BEFORE';
  if (norm.includes('morning')) return 'MORNING_OF';
  if (norm.includes('1 day') || norm.includes('one day')) return 'ONE_DAY_BEFORE';
  if (norm.includes('1 week') || norm.includes('one week')) return 'ONE_WEEK_BEFORE';
  if (norm.includes('custom')) return 'CUSTOM';
  return null;
};

export const mapRemindersListToBackend = (list?: string[]): string[] => {
  if (!list || list.length === 0) return [];
  return list
    .map(mapReminderToBackend)
    .filter((item): item is string => Boolean(item));
};

// 5. Map viewers option to backend visibility enum
export const mapVisibilityToBackend = (
  option: 'everyone' | 'adults' | 'assignees'
): 'EVERYONE' | 'ADULTS_ONLY' | 'ASSIGNEES_ONLY' => {
  if (option === 'adults') return 'ADULTS_ONLY';
  if (option === 'assignees') return 'ASSIGNEES_ONLY';
  return 'EVERYONE';
};

// 6. Check if a string is a valid UUID
export const isUUID = (id: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

/**
 * Resolves a member name or ID into a valid member UUID.
 * Handles:
 * - Direct UUIDs
 * - Exact and case-insensitive full name matching (e.g. "Rupesh Sharma")
 * - "You" or "Priya" (current user)
 * - Member object ID/memberId fallbacks
 */
export const resolveMemberId = (
  nameOrId?: string,
  familyMembers?: any[],
  myMemberId?: string | null
): string | null => {
  if (!nameOrId) return null;
  const trimmed = nameOrId.trim();
  if (isUUID(trimmed)) {
    return trimmed;
  }

  const lower = trimmed.toLowerCase();
  const members = familyMembers || [];

  if (lower === 'you' || lower === 'priya') {
    if (myMemberId && isUUID(myMemberId)) return myMemberId;
    const youMember = members.find((m: any) => m.isYou);
    const youId = youMember?.memberId || youMember?.id;
    if (youId && isUUID(youId)) return youId;
  }

  // Exact match by fullName or name
  let matched = members.find((m: any) => {
    const fn = (m.fullName || m.name || '').trim().toLowerCase();
    return fn === lower;
  });

  // Partial match by fullName or name
  if (!matched) {
    matched = members.find((m: any) => {
      const fn = (m.fullName || m.name || '').trim().toLowerCase();
      return fn.length > 0 && (fn.includes(lower) || lower.includes(fn));
    });
  }

  // Fallback: match by memberId or id
  if (!matched) {
    matched = members.find((m: any) => (m.memberId || m.id) === trimmed);
  }

  const candidateId = matched?.memberId || matched?.id;
  if (candidateId && isUUID(candidateId)) {
    return candidateId;
  }

  return null;
};

/**
 * Resolves a member UUID or identifier to their human-friendly display name.
 */
export const resolveMemberDisplayName = (
  nameOrId?: string,
  familyMembers?: any[]
): string => {
  if (!nameOrId) return 'Member';
  const trimmed = nameOrId.trim();
  const lower = trimmed.toLowerCase();
  if (lower === 'you' || lower === 'priya') return 'You';

  const members = familyMembers || [];
  const matched = members.find(
    (m: any) =>
      (m.memberId && m.memberId === trimmed) ||
      (m.id && m.id === trimmed) ||
      (m.fullName && m.fullName.trim().toLowerCase() === lower) ||
      (m.name && m.name.trim().toLowerCase() === lower)
  );

  if (matched) {
    if (matched.isYou) return 'You';
    return matched.fullName || matched.name || trimmed;
  }

  return trimmed;
};

// 7. Format raw API date/ISO string to human-friendly display date (e.g. "Today", "Mon, 2 Nov")
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const formatTaskDueDate = (
  dueOn?: string | null,
  isToday?: boolean,
  isOverdue?: boolean
): string => {
  if (!dueOn) return 'Today';
  const trimmed = dueOn.trim();
  if (trimmed.toLowerCase() === 'today') return 'Today';
  if (trimmed.toLowerCase() === 'tomorrow') return 'Tomorrow';
  if (trimmed.toLowerCase() === 'yesterday') return 'Yesterday';

  // If already formatted like "Mon, 2 Nov" or "Sat, 31 Oct"
  if (/^[A-Za-z]{3},\s*\d{1,2}\s+[A-Za-z]{3}/.test(trimmed)) {
    return trimmed;
  }

  // Extract YYYY-MM-DD from ISO-8601 string (e.g. 2026-11-02T00:00:00.000Z or 2026-11-02)
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1; // 0-indexed
    const day = parseInt(isoMatch[3], 10);

    const taskDate = new Date(year, month, day);
    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffDays = Math.round(
      (taskDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (isToday || diffDays === 0) {
      return 'Today';
    }
    if (diffDays === 1) {
      return 'Tomorrow';
    }
    if (diffDays === -1) {
      return 'Yesterday';
    }

    const dayName = DAY_NAMES[taskDate.getDay()];
    const monthName = MONTH_NAMES[month];
    return `${dayName}, ${day} ${monthName}`;
  }

  // If standard Date parse succeeds
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    const dayName = DAY_NAMES[d.getDay()];
    const monthName = MONTH_NAMES[d.getMonth()];
    return `${dayName}, ${d.getDate()} ${monthName}`;
  }

  return trimmed;
};

// 8. Determine if a task is overdue based on dueOn / dueDate, dueTime, and current datetime
export const isTaskOverdue = (
  task?: {
    isOverdue?: boolean;
    isCompleted?: boolean;
    dueOn?: string | null;
    dueDate?: string | null;
    dueTime?: string | null;
    dueFormatted?: string | null;
  } | null,
  now: Date = new Date()
): boolean => {
  if (!task) return false;
  if (task.isCompleted) return false;
  if (task.isOverdue === true) return true;

  const rawDateStr = task.dueOn || task.dueDate || task.dueFormatted;
  if (!rawDateStr) return false;

  const trimmed = rawDateStr.trim().toLowerCase();
  let dueYear: number | undefined;
  let dueMonth: number | undefined;
  let dueDay: number | undefined;

  if (trimmed.startsWith('yesterday')) {
    return true;
  }

  const isoMatch = rawDateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    dueYear = parseInt(isoMatch[1], 10);
    dueMonth = parseInt(isoMatch[2], 10) - 1;
    dueDay = parseInt(isoMatch[3], 10);
  } else if (trimmed.startsWith('today')) {
    dueYear = now.getFullYear();
    dueMonth = now.getMonth();
    dueDay = now.getDate();
  } else if (trimmed.startsWith('tomorrow')) {
    const t = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    dueYear = t.getFullYear();
    dueMonth = t.getMonth();
    dueDay = t.getDate();
  } else {
    for (let m = 0; m < 12; m++) {
      if (trimmed.includes(MONTH_NAMES[m].toLowerCase())) {
        const dayMatch = trimmed.match(/\b(\d{1,2})\b/);
        if (dayMatch) {
          dueDay = parseInt(dayMatch[1], 10);
          dueMonth = m;
          const yearMatch = trimmed.match(/\b(20\d\d)\b/);
          dueYear = yearMatch ? parseInt(yearMatch[1], 10) : now.getFullYear();
          break;
        }
      }
    }
  }

  if (dueYear === undefined || dueMonth === undefined || dueDay === undefined) {
    return false;
  }

  // Parse dueTime if provided (e.g. "18:00", "09:00", "6:00 PM", "9:00 AM", "by 6:00 PM")
  let dueHour = 23;
  let dueMinute = 59;

  const rawTimeStr =
    task.dueTime ||
    (task.dueFormatted && task.dueFormatted.match(/by\s+([0-9:APMapm ]+)/i)?.[1]) ||
    (rawDateStr && rawDateStr.match(/by\s+([0-9:APMapm ]+)/i)?.[1]);

  if (rawTimeStr) {
    const timeNorm = rawTimeStr.replace(/^by\s+/i, '').trim();
    const match12 = timeNorm.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (match12) {
      let h = parseInt(match12[1], 10);
      const min = parseInt(match12[2], 10);
      const ampm = (match12[3] || '').toUpperCase();
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      dueHour = h;
      dueMinute = min;
    } else {
      const match24 = timeNorm.match(/^(\d{1,2}):(\d{2})$/);
      if (match24) {
        dueHour = parseInt(match24[1], 10);
        dueMinute = parseInt(match24[2], 10);
      }
    }
  }

  const dueDateTime = new Date(dueYear, dueMonth, dueDay, dueHour, dueMinute, 59, 999);
  return dueDateTime.getTime() < now.getTime();
};
