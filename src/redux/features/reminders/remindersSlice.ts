import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import remindersServices, {
  CreateReminderPayload,
  ListRemindersQuery,
  ListRemindersResponse,
  ReminderApi,
  RemindersPagination,
  UpdateReminderPayload,
} from '../../../services/remindersServices';
import { isUUID } from '../lists/listsSlice';
import { fetchNeedsAttentionThunk } from '../home/needsAttentionSlice';

export interface RemindersState {
  upcoming: ReminderApi[];
  past: ReminderApi[];
  counts: {
    upcoming: number;
    past: number;
  };
  upcomingPagination: RemindersPagination | null;
  pastPagination: RemindersPagination | null;
  selectedReminder: ReminderApi | null;
  hasLoadedUpcoming: boolean;
  hasLoadedPast: boolean;
  loadingUpcoming: boolean;
  loadingPast: boolean;
  loadingMore: boolean;
  loadingDetail: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: RemindersState = {
  upcoming: [],
  past: [],
  counts: { upcoming: 0, past: 0 },
  upcomingPagination: null,
  pastPagination: null,
  selectedReminder: null,
  hasLoadedUpcoming: false,
  hasLoadedPast: false,
  loadingUpcoming: false,
  loadingPast: false,
  loadingMore: false,
  loadingDetail: false,
  submitting: false,
  error: null,
};

const extractErrorMessage = (err: any, fallback: string): string => {
  const msg = err?.response?.data?.message || err?.message || fallback;
  return Array.isArray(msg) ? msg.join(', ') : String(msg);
};

const mergeUniqueById = (existing: ReminderApi[], incoming: ReminderApi[]) => {
  const map = new Map<string, ReminderApi>();
  existing.forEach((r) => map.set(r.id, r));
  incoming.forEach((r) => map.set(r.id, r));
  return Array.from(map.values());
};

const syncNeedsAttention = (dispatch: any, getState: () => any) => {
  const state = getState?.();
  const activeSection = state?.needsAttention?.activeSection || 'ALL';
  const withinDays = state?.needsAttention?.withinDays ?? 60;
  dispatch(
    fetchNeedsAttentionThunk({
      section: activeSection,
      withinDays,
      limit: 30,
    })
  );
};

/** 1. Set a reminder (POST /api/v1/reminders) */
export const createReminderThunk = createAsyncThunk<
  ReminderApi,
  CreateReminderPayload,
  { rejectValue: string }
>('reminders/create', async (payload, { dispatch, getState, rejectWithValue }) => {
  try {
    const res = await remindersServices.createReminder(payload);
    dispatch(fetchRemindersThunk({ status: 'UPCOMING', limit: 30 }));
    syncNeedsAttention(dispatch, getState);
    return res.reminder;
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to set reminder.'));
  }
});

/** 2. List reminders (GET /api/v1/reminders?status=UPCOMING|PAST&limit=...&before=...) */
export const fetchRemindersThunk = createAsyncThunk<
  { data: ListRemindersResponse; status: 'UPCOMING' | 'PAST'; append: boolean },
  ListRemindersQuery | undefined,
  { rejectValue: string }
>('reminders/list', async (query, { rejectWithValue }) => {
  const status = query?.status === 'PAST' ? 'PAST' : 'UPCOMING';
  const trimmedBefore = query?.before?.trim();
  const append = Boolean(trimmedBefore && isUUID(trimmedBefore));
  try {
    const data = await remindersServices.listReminders({
      status,
      limit: query?.limit ?? 30,
      ...(append ? { before: trimmedBefore } : {}),
    });
    return { data, status, append };
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to load reminders.'));
  }
});

/** 3. Get one reminder (GET /api/v1/reminders/:id) */
export const fetchReminderDetailThunk = createAsyncThunk<
  ReminderApi,
  string,
  { rejectValue: string }
>('reminders/detail', async (id, { rejectWithValue }) => {
  if (!isUUID(id)) {
    return rejectWithValue('Invalid reminder ID.');
  }
  try {
    const res = await remindersServices.getReminderById(id);
    return res.reminder;
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Reminder not found.'));
  }
});

/** 4. Edit reminder or mark done (PATCH /api/v1/reminders/:id) */
export const updateReminderThunk = createAsyncThunk<
  ReminderApi,
  { id: string; payload: UpdateReminderPayload },
  { rejectValue: string }
>('reminders/update', async ({ id, payload }, { dispatch, getState, rejectWithValue }) => {
  if (!isUUID(id)) {
    return rejectWithValue('Invalid reminder ID.');
  }
  try {
    const res = await remindersServices.updateReminder(id, payload);
    dispatch(fetchRemindersThunk({ status: 'UPCOMING', limit: 30 }));
    dispatch(fetchRemindersThunk({ status: 'PAST', limit: 30 }));
    syncNeedsAttention(dispatch, getState);
    return res.reminder;
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to update reminder.'));
  }
});

/** 5. Undo or remove reminder (DELETE /api/v1/reminders/:id) */
export const deleteReminderThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('reminders/delete', async (id, { dispatch, getState, rejectWithValue }) => {
  if (!isUUID(id)) {
    return rejectWithValue('Invalid reminder ID.');
  }
  try {
    await remindersServices.deleteReminder(id);
    dispatch(fetchRemindersThunk({ status: 'UPCOMING', limit: 30 }));
    syncNeedsAttention(dispatch, getState);
    return id;
  } catch (err: any) {
    return rejectWithValue(extractErrorMessage(err, 'Failed to remove reminder.'));
  }
});

const remindersSlice = createSlice({
  name: 'reminders',
  initialState,
  reducers: {
    clearRemindersError: (state) => {
      state.error = null;
    },
    setSelectedReminderLocal: (
      state,
      action: PayloadAction<ReminderApi | null>
    ) => {
      state.selectedReminder = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // 1. Create
      .addCase(createReminderThunk.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createReminderThunk.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload) {
          state.upcoming = mergeUniqueById([action.payload], state.upcoming);
          state.counts.upcoming = Math.max(
            state.counts.upcoming + 1,
            state.upcoming.length
          );
        }
      })
      .addCase(createReminderThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to set reminder.';
      })

      // 2. List
      .addCase(fetchRemindersThunk.pending, (state, action) => {
        const trimmedBefore = action.meta.arg?.before?.trim();
        const isAppend = Boolean(trimmedBefore && isUUID(trimmedBefore));
        const status = action.meta.arg?.status === 'PAST' ? 'PAST' : 'UPCOMING';
        if (isAppend) {
          state.loadingMore = true;
        } else if (status === 'PAST') {
          state.loadingPast = true;
        } else {
          state.loadingUpcoming = true;
        }
        state.error = null;
      })
      .addCase(fetchRemindersThunk.fulfilled, (state, action) => {
        const { data, status, append } = action.payload;
        state.loadingMore = false;
        if (data.counts) {
          state.counts = data.counts;
        }
        if (status === 'PAST') {
          state.loadingPast = false;
          state.hasLoadedPast = true;
          state.past = append
            ? mergeUniqueById(state.past, data.reminders || [])
            : data.reminders || [];
          state.pastPagination = data.pagination || null;
        } else {
          state.loadingUpcoming = false;
          state.hasLoadedUpcoming = true;
          state.upcoming = append
            ? mergeUniqueById(state.upcoming, data.reminders || [])
            : data.reminders || [];
          state.upcomingPagination = data.pagination || null;
        }
      })
      .addCase(fetchRemindersThunk.rejected, (state, action) => {
        const status = action.meta.arg?.status === 'PAST' ? 'PAST' : 'UPCOMING';
        state.loadingMore = false;
        if (status === 'PAST') {
          state.loadingPast = false;
          state.hasLoadedPast = true;
        } else {
          state.loadingUpcoming = false;
          state.hasLoadedUpcoming = true;
        }
        state.error = action.payload || 'Failed to load reminders.';
      })

      // 3. Detail
      .addCase(fetchReminderDetailThunk.pending, (state) => {
        state.loadingDetail = true;
        state.error = null;
      })
      .addCase(fetchReminderDetailThunk.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.selectedReminder = action.payload;
      })
      .addCase(fetchReminderDetailThunk.rejected, (state, action) => {
        state.loadingDetail = false;
        state.error = action.payload || 'Reminder not found.';
      })

      // 4. Update / Mark Done
      .addCase(updateReminderThunk.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateReminderThunk.fulfilled, (state, action) => {
        state.submitting = false;
        const updated = action.payload;
        if (updated) {
          if (state.selectedReminder?.id === updated.id) {
            state.selectedReminder = updated;
          }
          if (updated.status === 'PAST' || updated.done) {
            state.upcoming = state.upcoming.filter((r) => r.id !== updated.id);
            state.past = mergeUniqueById([updated], state.past);
          } else {
            state.past = state.past.filter((r) => r.id !== updated.id);
            state.upcoming = mergeUniqueById([updated], state.upcoming);
          }
        }
      })
      .addCase(updateReminderThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to update reminder.';
      })

      // 5. Delete
      .addCase(deleteReminderThunk.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(deleteReminderThunk.fulfilled, (state, action) => {
        state.submitting = false;
        const deletedId = action.payload;
        state.upcoming = state.upcoming.filter((r) => r.id !== deletedId);
        state.past = state.past.filter((r) => r.id !== deletedId);
        if (state.selectedReminder?.id === deletedId) {
          state.selectedReminder = null;
        }
      })
      .addCase(deleteReminderThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to remove reminder.';
      });
  },
});

export const { clearRemindersError, setSelectedReminderLocal } =
  remindersSlice.actions;
export default remindersSlice.reducer;
