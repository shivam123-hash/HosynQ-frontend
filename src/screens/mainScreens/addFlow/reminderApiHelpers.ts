import { isUUID } from '../../../redux/features/lists/listsSlice';
import {
  ReminderApi,
  ReminderRepeatFreq,
} from '../../../services/remindersServices';
import Colors from '../../../units/Colors';

export interface ReminderMemberOption {
  id: string;
  name: string;
  firstName: string;
  displayName: string;
  initial: string;
  isYou: boolean;
  isChild: boolean;
  hasAppAccount: boolean;
  color: string;
  textColor: string;
}

const AVATAR_STYLES = [
  { color: Colors.avatarBrown, textColor: Colors.amberLight },
  { color: Colors.avatarNavy, textColor: Colors.accentBlueSoft },
  { color: Colors.avatarWine, textColor: Colors.accentPink },
  { color: Colors.avatarOlive, textColor: Colors.accentYellow },
  { color: Colors.avatarGreen, textColor: Colors.accentGreenSoft },
];

const IST_OFFSET_MS = 330 * 60 * 1000;

export const isJestTestEnv = (): boolean =>
  typeof (globalThis as any)?.process !== 'undefined' &&
  Boolean((globalThis as any).process?.env?.JEST_WORKER_ID);

export const scheduleReminderAfterTransition = (
  task: () => void
): (() => void) => {
  if (isJestTestEnv()) {
    task();
    return () => {};
  }
  let cancelled = false;
  const rafId = requestAnimationFrame(() => {
    if (!cancelled) {
      task();
    }
  });
  return () => {
    cancelled = true;
    cancelAnimationFrame(rafId);
  };
};

export const getIstDateParts = (
  epochMs = Date.now()
): {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  isoDate: string;
  hhmm: string;
} => {
  const ist = new Date(epochMs + IST_OFFSET_MS);
  const year = ist.getUTCFullYear();
  const month = ist.getUTCMonth() + 1;
  const day = ist.getUTCDate();
  const hours = ist.getUTCHours();
  const minutes = ist.getUTCMinutes();
  const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const hhmm = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  return { year, month, day, hours, minutes, isoDate, hhmm };
};

export const getIstTomorrowIsoDate = (epochMs = Date.now()): string => {
  return getIstDateParts(epochMs + 24 * 60 * 60 * 1000).isoDate;
};

export const isEveningTodayAvailableInIst = (epochMs = Date.now()): boolean => {
  const { hours } = getIstDateParts(epochMs);
  return hours < 19;
};

export const convertTo24HourHHmm = (timeStr?: string | null): string => {
  if (!timeStr) return '19:00';
  const trimmed = String(timeStr).trim();
  const match24 = trimmed.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (match24) {
    return `${match24[1].padStart(2, '0')}:${match24[2]}`;
  }
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let hour = parseInt(match12[1], 10);
    const min = match12[2];
    const period = match12[3].toUpperCase();
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return `${String(hour).padStart(2, '0')}:${min}`;
  }
  return '19:00';
};

export const format24HourTo12Hour = (hhmm?: string | null): string => {
  if (!hhmm) return '';
  const clean = convertTo24HourHHmm(hhmm);
  const [hStr, mStr] = clean.split(':');
  const h = parseInt(hStr, 10);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${mStr} ${period}`;
};

export const convertWhenChipToIstSchedule = (
  chipText: string,
  customIsoDate?: string,
  customTimeStr?: string,
  epochMs = Date.now()
): { remindOn: string; remindTime: string; rolledToTomorrow?: boolean } => {
  if (chipText === 'In 1 hour') {
    const plusOneHour = getIstDateParts(epochMs + 60 * 60 * 1000);
    return {
      remindOn: plusOneHour.isoDate,
      remindTime: plusOneHour.hhmm,
    };
  }

  if (chipText === 'This evening, 7:00 PM') {
    const todayIst = getIstDateParts(epochMs);
    if (todayIst.hours < 19) {
      return {
        remindOn: todayIst.isoDate,
        remindTime: '19:00',
        rolledToTomorrow: false,
      };
    }
    return {
      remindOn: getIstTomorrowIsoDate(epochMs),
      remindTime: '19:00',
      rolledToTomorrow: true,
    };
  }

  if (chipText === 'Tomorrow, 9:00 AM') {
    return {
      remindOn: getIstTomorrowIsoDate(epochMs),
      remindTime: '09:00',
    };
  }

  // Pick a time
  const todayIso = getIstDateParts(epochMs).isoDate;
  const isoDate =
    customIsoDate && /^\d{4}-\d{2}-\d{2}$/.test(customIsoDate)
      ? customIsoDate
      : todayIso;
  return {
    remindOn: isoDate,
    remindTime: convertTo24HourHHmm(customTimeStr || '19:00'),
  };
};

export const formatReminderScheduleLabel = (
  remindOn?: string | null,
  remindTime?: string | null,
  epochMs = Date.now()
): string => {
  if (!remindOn) return '';
  const dateIso = String(remindOn).slice(0, 10);
  const todayIso = getIstDateParts(epochMs).isoDate;
  const tomorrowIso = getIstTomorrowIsoDate(epochMs);
  const time12 = remindTime ? format24HourTo12Hour(remindTime) : '';

  let dayLabel = dateIso;
  if (dateIso === todayIso) {
    dayLabel = 'Today';
  } else if (dateIso === tomorrowIso) {
    dayLabel = 'Tomorrow';
  } else {
    const d = new Date(`${dateIso}T00:00:00Z`);
    if (!Number.isNaN(d.getTime())) {
      dayLabel = d.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        timeZone: 'UTC',
      });
    }
  }

  return time12 ? `${dayLabel} · ${time12}` : dayLabel;
};

export interface ReminderRepeatOption {
  label: string;
  apiValue: ReminderRepeatFreq | null;
}

export const REMINDER_REPEAT_OPTIONS: ReminderRepeatOption[] = [
  { label: 'Doesn’t repeat', apiValue: null },
  { label: 'Daily', apiValue: 'DAILY' },
  { label: 'Every week', apiValue: 'WEEKLY' },
  { label: 'Every month', apiValue: 'MONTHLY' },
  { label: 'Every 3 months', apiValue: 'EVERY_3_MONTHS' },
  { label: 'Every year', apiValue: 'YEARLY' },
  { label: 'Custom', apiValue: 'CUSTOM' },
];

export const REMINDER_WEEKDAYS = [
  'MON',
  'TUE',
  'WED',
  'THU',
  'FRI',
  'SAT',
  'SUN',
] as const;

export const mapUiRepeatToApi = (
  label?: string
): ReminderRepeatFreq | null => {
  const norm = (label || '').replace(/’/g, "'").trim().toLowerCase();
  switch (norm) {
    case 'daily':
    case 'every day':
      return 'DAILY';
    case 'every week':
    case 'weekly':
      return 'WEEKLY';
    case 'every month':
    case 'monthly':
      return 'MONTHLY';
    case 'every 3 months':
    case 'every_3_months':
      return 'EVERY_3_MONTHS';
    case 'every year':
    case 'yearly':
      return 'YEARLY';
    case 'custom':
      return 'CUSTOM';
    default:
      return null;
  }
};

export const mapApiRepeatToUi = (freq?: ReminderRepeatFreq | null): string => {
  switch (freq) {
    case 'DAILY':
      return 'Daily';
    case 'WEEKLY':
      return 'Every week';
    case 'MONTHLY':
      return 'Every month';
    case 'EVERY_3_MONTHS':
      return 'Every 3 months';
    case 'YEARLY':
      return 'Every year';
    case 'CUSTOM':
      return 'Custom';
    default:
      return 'Doesn’t repeat';
  }
};

export const formatRepeatSummary = (
  repeat?: ReminderRepeatFreq | null,
  repeatDays?: string[],
  repeatEndsOn?: string | null
): string => {
  if (!repeat) return 'Doesn’t repeat';
  const base = mapApiRepeatToUi(repeat);
  if (repeat !== 'CUSTOM') return base;
  const days = (repeatDays || []).join(', ');
  const end = repeatEndsOn ? `Ends ${repeatEndsOn.slice(0, 10)}` : '';
  return [base, days, end].filter(Boolean).join(' · ');
};

export const memberHasAppAccount = (m: any): boolean => {
  if (!m) return false;
  if (m.hasAccount === false || m.hasAppAccount === false || m.userId === null) {
    return false;
  }
  if (m.hasAccount === true || m.hasAppAccount === true) {
    return true;
  }
  if (typeof m.userId === 'string' && m.userId.trim().length > 0) {
    return true;
  }
  return Boolean(m.isYou || m.isMe);
};

export const extractReminderMembersFromFamilyState = (
  familyState: any
): {
  members: ReminderMemberOption[];
  myMemberId: string;
  isChild: boolean;
} => {
  const rawList =
    familyState?.basicFamilyData?.members ||
    familyState?.basicFamilyData?.family?.members ||
    familyState?.myFamilyData?.family?.members ||
    familyState?.myFamilyData?.members ||
    familyState?.family?.members ||
    [];

  const stateMyRole = String(
    familyState?.family?.myRole ||
      familyState?.basicFamilyData?.myRole ||
      familyState?.myFamilyData?.family?.myRole ||
      ''
  ).toUpperCase();

  let myMemberId = String(
    familyState?.myMemberId ||
      familyState?.family?.myMemberId ||
      familyState?.basicFamilyData?.myMemberId ||
      familyState?.myFamilyData?.family?.myMemberId ||
      ''
  );

  if (!Array.isArray(rawList)) {
    return {
      members: [],
      myMemberId,
      isChild: stateMyRole === 'DEPENDENT_CHILD_PROFILE' || stateMyRole === 'CHILD',
    };
  }

  let detectedIsChild =
    stateMyRole === 'DEPENDENT_CHILD_PROFILE' || stateMyRole === 'CHILD';

  const mapped: ReminderMemberOption[] = rawList
    .filter(memberHasAppAccount)
    .map((m: any, idx: number) => {
      const id = String(m.memberId || m.id || `member-${idx}`);
      const fullName = String(m.fullName || m.name || 'Member').trim();
      const firstName = fullName.split(/\s+/)[0] || fullName;
      const isYou = Boolean(m.isYou || m.isMe || (myMemberId && id === myMemberId));
      const roleStr = String(m.role || '').toUpperCase();
      const memberIsChild =
        roleStr === 'DEPENDENT_CHILD_PROFILE' ||
        roleStr === 'CHILD' ||
        (typeof m.age === 'number' && m.age < 18);

      if (isYou) {
        if (!myMemberId && isUUID(id)) myMemberId = id;
        if (memberIsChild) detectedIsChild = true;
      }

      const palette = AVATAR_STYLES[idx % AVATAR_STYLES.length];
      return {
        id,
        name: isYou ? 'You' : firstName,
        firstName,
        displayName: isYou ? `${firstName} (you)` : fullName,
        initial: firstName.charAt(0).toUpperCase() || 'M',
        isYou,
        isChild: memberIsChild,
        hasAppAccount: true,
        color: m.avatarColor || palette.color,
        textColor: palette.textColor,
      };
    });

  const restrictedMembers = detectedIsChild
    ? mapped.filter((m) => m.isYou || (myMemberId && m.id === myMemberId))
    : mapped;

  return {
    members: restrictedMembers,
    myMemberId,
    isChild: detectedIsChild,
  };
};

export const formatReminderRecipients = (reminder: ReminderApi): string => {
  const members = reminder.members || [];
  if (members.length === 0) return 'You';
  return members
    .map((m) => (m.isMe ? 'You' : (m.fullName || 'Member').split(/\s+/)[0]))
    .join(', ');
};
