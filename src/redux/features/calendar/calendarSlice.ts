import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import calendarServices, {
  CalendarFeedParams,
  CreateEventPayload,
  UpdateEventPayload,
  CancelEventPayload,
} from '../../../services/calendarServices';

export interface CalendarState {
  feed: {
    events: any[];
    tasks: any[];
    appliedFilters: any | null;
  };
  selectedEvent: any | null;
  loading: boolean;
  detailLoading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: CalendarState = {
  feed: {
    events: [],
    tasks: [],
    appliedFilters: null,
  },
  selectedEvent: null,
  loading: false,
  detailLoading: false,
  actionLoading: false,
  error: null,
};

// 1. Fetch Feed Thunk
export const fetchCalendarFeedThunk = createAsyncThunk(
  'calendar/fetchFeed',
  async (params: CalendarFeedParams, { rejectWithValue }) => {
    try {
      const res = await calendarServices.getFeed(params);
      return res;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to fetch calendar feed');
    }
  }
);
export const fetchCalendarFeed = fetchCalendarFeedThunk;

// 2. Fetch Event Detail Thunk
export const fetchEventDetailThunk = createAsyncThunk(
  'calendar/fetchEventDetail',
  async ({ id, on }: { id: string; on?: string }, { rejectWithValue }) => {
    try {
      const res = await calendarServices.getEvent(id, on);
      return res.event;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to fetch event detail');
    }
  }
);
export const fetchEventDetail = fetchEventDetailThunk;

// 3. Create Event Thunk
export const createEventThunk = createAsyncThunk(
  'calendar/createEvent',
  async (payload: CreateEventPayload, { rejectWithValue }) => {
    try {
      console.log('[createEvent API] Creating event with payload:', payload);
      try {
        console.log('[createEvent API] Request Payload (formatted):\n', JSON.stringify(payload, null, 2));
      } catch {
        // ignore serialization errors
      }
      const res = await calendarServices.createEvent(payload);
      console.log('[createEvent API] Success Response (raw):', res);
      try {
        console.log('[createEvent API] Success Response (formatted):\n', JSON.stringify(res, null, 2));
      } catch {
        // ignore serialization errors
      }
      return res.event;
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create event';
      console.log('[createEvent API] Error Response:', {
        status: err?.response?.status,
        data: err?.response?.data,
        message: errorMsg,
      });
      return rejectWithValue(
        Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
      );
    }
  }
);
export const createEvent = createEventThunk;
export const createCalendarEvent = createEventThunk;

// 4. Update Event Thunk
export const updateEventThunk = createAsyncThunk(
  'calendar/updateEvent',
  async ({ id, payload }: { id: string; payload: UpdateEventPayload }, { rejectWithValue }) => {
    try {
      console.log('[updateEvent API] Updating event id:', id, 'payload:', payload);
      try {
        console.log('[updateEvent API] Request Payload (formatted):\n', JSON.stringify(payload, null, 2));
      } catch {
        // ignore serialization errors
      }
      const res = await calendarServices.updateEvent(id, payload);
      console.log('[updateEvent API] Success Response (raw):', res);
      try {
        console.log('[updateEvent API] Success Response (formatted):\n', JSON.stringify(res, null, 2));
      } catch {
        // ignore serialization errors
      }
      return res.event;
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update event';
      console.log('[updateEvent API] Error Response:', {
        status: err?.response?.status,
        data: err?.response?.data,
        message: errorMsg,
      });
      return rejectWithValue(
        Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
      );
    }
  }
);
export const updateEvent = updateEventThunk;
export const updateCalendarEvent = updateEventThunk;

// 5. Cancel Event Thunk
export const cancelEventThunk = createAsyncThunk(
  'calendar/cancelEvent',
  async ({ id, payload }: { id: string; payload: CancelEventPayload }, { rejectWithValue }) => {
    try {
      const res = await calendarServices.cancelEvent(id, payload);
      return { id, ...res };
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to cancel event');
    }
  }
);
export const cancelEvent = cancelEventThunk;
export const cancelCalendarEvent = cancelEventThunk;

// 6. Respond to Event Thunk
export const respondToEventThunk = createAsyncThunk(
  'calendar/respondToEvent',
  async ({ id, response }: { id: string; response: 'GOING' | 'NOT_GOING' }, { rejectWithValue }) => {
    try {
      const res = await calendarServices.respondToEvent(id, response);
      return res.event
        ? {
            ...res.event,
            myResponse: res.event.myResponse ?? response,
            permissions: {
              ...(res.event.permissions || {}),
              canRespond: false,
            },
          }
        : { id, myResponse: response, permissions: { canRespond: false } };
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to respond to event');
    }
  }
);
export const respondToEvent = respondToEventThunk;
export const respondToCalendarEvent = respondToEventThunk;

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    clearCalendarError: (state) => {
      state.error = null;
    },
    clearSelectedEvent: (state) => {
      state.selectedEvent = null;
    },
  },
  extraReducers: (builder) => {
    // Feed
    builder
      .addCase(fetchCalendarFeedThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCalendarFeedThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.feed.events = action.payload.events || [];
        state.feed.tasks = action.payload.tasks || [];
        state.feed.appliedFilters = action.payload.appliedFilters || null;
      })
      .addCase(fetchCalendarFeedThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Detail
    builder
      .addCase(fetchEventDetailThunk.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(fetchEventDetailThunk.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedEvent = action.payload;
      })
      .addCase(fetchEventDetailThunk.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload as string;
      });

    // Create Event
    builder.addCase(createEventThunk.fulfilled, (state, action) => {
      state.actionLoading = false;
      if (action.payload) {
        const exists = state.feed.events.some((e) => e.id === action.payload.id);
        if (!exists) {
          state.feed.events = [action.payload, ...state.feed.events];
        }
      }
    });

    // Update Event
    builder.addCase(updateEventThunk.fulfilled, (state, action) => {
      state.actionLoading = false;
      if (action.payload) {
        state.feed.events = state.feed.events.map((e) =>
          e.id === action.payload.id ? { ...e, ...action.payload } : e
        );
        if (state.selectedEvent?.id === action.payload.id) {
          state.selectedEvent = { ...state.selectedEvent, ...action.payload };
        }
      }
    });

    // Respond to Event
    builder.addCase(respondToEventThunk.fulfilled, (state, action) => {
      state.actionLoading = false;
      if (action.payload) {
        state.feed.events = state.feed.events.map((e) =>
          e.id === action.payload.id ? { ...e, ...action.payload } : e
        );
        if (state.selectedEvent?.id === action.payload.id) {
          state.selectedEvent = { ...state.selectedEvent, ...action.payload };
        }
      }
    });

    // Cancel Event
    builder.addCase(cancelEventThunk.fulfilled, (state, action) => {
      state.feed.events = state.feed.events.filter((e) => e.id !== action.payload.id);
      if (state.selectedEvent?.id === action.payload.id) {
        state.selectedEvent.cancelledAt = action.payload.cancelledAt;
      }
    });
  },
});

export const { clearCalendarError, clearSelectedEvent } = calendarSlice.actions;
export default calendarSlice.reducer;
