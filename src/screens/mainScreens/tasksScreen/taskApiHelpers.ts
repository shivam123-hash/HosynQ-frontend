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

// 2. Format 12-hour AM/PM to 24-hour HH:mm ("9:00 AM" -> "09:00")
export const formatTimeTo24Hour = (timeStr?: string): string | undefined => {
  if (!timeStr) return undefined;
  const trimmed = timeStr.trim();
  if (/^([01]\d|2[0-3]):[0-5]\d$/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return undefined;
  let [_, h, m, meridiem] = match;
  let hours = parseInt(h, 10);
  if (meridiem) {
    const isPM = meridiem.toUpperCase() === 'PM';
    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
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
