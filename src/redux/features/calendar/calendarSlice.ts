import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import calendarServices, {
  CalendarFeedParams,
  CreateEventPayload,
  UpdateEventPayload,
  CancelEventPayload,
  CreateImportantDatePayload,
} from '../../../services/calendarServices';

export interface CalendarState {
  feed: {
    events: any[];
    tasks: any[];
    importantDates: any[];
    appliedFilters: any | null;
  };
  selectedEvent: any | null;
  importantDatesList: any[];
  importantDateCounts: Record<string, number>;
  loading: boolean;
  detailLoading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: CalendarState = {
  feed: {
    events: [],
    tasks: [],
    importantDates: [],
    appliedFilters: null,
  },
  selectedEvent: null,
  importantDatesList: [],
  importantDateCounts: {},
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
      const res = await calendarServices.createEvent(payload);
      return res.event;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to create event');
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
      const res = await calendarServices.updateEvent(id, payload);
      return res.event;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to update event');
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
      return res.event;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to respond to event');
    }
  }
);
export const respondToEvent = respondToEventThunk;
export const respondToCalendarEvent = respondToEventThunk;

// 7. Fetch Important Dates Thunk
export const fetchImportantDatesThunk = createAsyncThunk(
  'calendar/fetchImportantDates',
  async (params: { kind?: string; today?: string } | undefined, { rejectWithValue }) => {
    try {
      const res = await calendarServices.getImportantDates(params);
      return res;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to fetch important dates');
    }
  }
);
export const fetchImportantDates = fetchImportantDatesThunk;

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
        state.feed.importantDates = action.payload.importantDates || [];
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

    // Cancel Event
    builder.addCase(cancelEventThunk.fulfilled, (state, action) => {
      state.feed.events = state.feed.events.filter((e) => e.id !== action.payload.id);
      if (state.selectedEvent?.id === action.payload.id) {
        state.selectedEvent.cancelledAt = action.payload.cancelledAt;
      }
    });

    // Important Dates
    builder.addCase(fetchImportantDatesThunk.fulfilled, (state, action) => {
      state.importantDatesList = action.payload.dates || [];
      state.importantDateCounts = action.payload.counts || {};
    });
  },
});

export const { clearCalendarError, clearSelectedEvent } = calendarSlice.actions;
export default calendarSlice.reducer;
