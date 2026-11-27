import apiClient from './apiClient';
import API_ROUTES from '../redux/endPoints/endPoints';

export type ReminderRepeatFreq =
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'EVERY_3_MONTHS'
  | 'YEARLY'
  | 'CUSTOM';

export type ReminderWeekday = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export type ReminderStatus = 'UPCOMING' | 'PAST';

export interface ReminderMemberApi {
  memberId: string;
  fullName: string;
  avatarUrl?: string | null;
  avatarColor?: string | null;
  isMe?: boolean;
}

export interface ReminderCreatorApi {
  memberId: string;
  fullName: string;
  avatarUrl?: string | null;
  avatarColor?: string | null;
}

export interface ReminderApi {
  id: string;
  text: string;
  remindOn: string;
  remindTime: string;
  repeat?: ReminderRepeatFreq | null;
  repeatDays?: string[];
  repeatEndsOn?: string | null;
  status: ReminderStatus;
  nextAt?: string | null;
  lastSentAt?: string | null;
  done: boolean;
  members: ReminderMemberApi[];
  createdBy?: ReminderCreatorApi | null;
  canEdit: boolean;
  createdAt?: string;
}

export interface CreateReminderPayload {
  text: string;
  remindOn: string;
  remindTime: string;
  memberIds?: string[];
  repeat?: ReminderRepeatFreq;
  repeatDays?: string[];
  repeatEndsOn?: string;
}

export interface ListRemindersQuery {
  status?: ReminderStatus;
  limit?: number;
  before?: string;
}

export interface RemindersPagination {
  limit: number;
  hasMore: boolean;
  nextCursor: string | null;
}

export interface ListRemindersResponse {
  success: boolean;
  counts: {
    upcoming: number;
    past: number;
  };
  reminders: ReminderApi[];
  pagination: RemindersPagination;
}

export interface UpdateReminderPayload {
  text?: string;
  remindOn?: string;
  remindTime?: string;
  memberIds?: string[];
  repeat?: ReminderRepeatFreq | null;
  repeatDays?: string[];
  repeatEndsOn?: string | null;
  done?: boolean;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const withRemindersApiLog = async <T>(
  apiTag: string,
  requestInfo: Record<string, any> | undefined,
  executor: () => Promise<T>
): Promise<T> => {
  console.log(`[Reminders API · ${apiTag}] Request:`, requestInfo ?? {});
  try {
    const res = await executor();
    console.log(`[Reminders API · ${apiTag}] Success Response (raw):`, res);
    try {
      console.log(
        `[Reminders API · ${apiTag}] Success Response (formatted):\n`,
        JSON.stringify(res, null, 2)
      );
    } catch {
      // ignore serialization issues
    }
    return res;
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Request failed';
    console.log(`[Reminders API · ${apiTag}] Error Response:`, {
      status: err?.response?.status,
      data: err?.response?.data,
      message: Array.isArray(msg) ? msg.join(', ') : msg,
      url: err?.config?.url,
    });
    throw err;
  }
};

const remindersServices = {
  /** 1. Set a reminder (POST /api/v1/reminders) */
  createReminder: (
    payload: CreateReminderPayload
  ): Promise<{ success: boolean; reminder: ReminderApi }> =>
    withRemindersApiLog('POST /reminders', { payload }, async () => {
      const res = await apiClient.post(API_ROUTES.REMINDERS, payload);
      return res.data?.reminder ? res.data : { success: true, reminder: res.data };
    }),

  /** 2. List reminders (GET /api/v1/reminders?status=UPCOMING|PAST&limit=...&before=...) */
  listReminders: (query?: ListRemindersQuery): Promise<ListRemindersResponse> => {
    const cleanParams: Record<string, any> = {
      status: query?.status === 'PAST' ? 'PAST' : 'UPCOMING',
      limit: typeof query?.limit === 'number' ? query.limit : 30,
    };
    const trimmedBefore = query?.before?.trim();
    if (trimmedBefore && UUID_REGEX.test(trimmedBefore)) {
      cleanParams.before = trimmedBefore;
    }

    return withRemindersApiLog('GET /reminders', { params: cleanParams }, async () => {
      const res = await apiClient.get<ListRemindersResponse>(API_ROUTES.REMINDERS, {
        params: cleanParams,
      });
      return res.data;
    });
  },

  /** 3. Get one reminder (GET /api/v1/reminders/:id) */
  getReminderById: (
    id: string
  ): Promise<{ success: boolean; reminder: ReminderApi }> =>
    withRemindersApiLog('GET /reminders/:id', { id }, async () => {
      const res = await apiClient.get(API_ROUTES.REMINDER_BY_ID(id));
      return res.data?.reminder ? res.data : { success: true, reminder: res.data };
    }),

  /** 4. Edit a reminder, or mark it done (PATCH /api/v1/reminders/:id) */
  updateReminder: (
    id: string,
    payload: UpdateReminderPayload
  ): Promise<{ success: boolean; reminder: ReminderApi }> =>
    withRemindersApiLog('PATCH /reminders/:id', { id, payload }, async () => {
      const res = await apiClient.patch(API_ROUTES.REMINDER_BY_ID(id), payload);
      return res.data?.reminder ? res.data : { success: true, reminder: res.data };
    }),

  /** 5. Undo or remove (DELETE /api/v1/reminders/:id) */
  deleteReminder: (id: string): Promise<{ success: boolean; message: string }> =>
    withRemindersApiLog('DELETE /reminders/:id', { id }, async () => {
      const res = await apiClient.delete(API_ROUTES.REMINDER_BY_ID(id));
      return res.data;
    }),
};

export default remindersServices;
