import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import homeServices, {
  HomeAttentionItemApi,
  ListNeedsAttentionCounts,
  ListNeedsAttentionPagination,
  ListNeedsAttentionQuery,
  ListNeedsAttentionResponse,
  NeedsAttentionSectionFilter,
} from '../../../services/homeServices';

export interface NeedsAttentionState {
  items: HomeAttentionItemApi[];
  counts: ListNeedsAttentionCounts;
  activeSection: NeedsAttentionSectionFilter;
  withinDays: number;
  pagination: ListNeedsAttentionPagination | null;
  loading: boolean;
  loadingMore: boolean;
  hasLoaded: boolean;
  error: string | null;
}

const initialState: NeedsAttentionState = {
  items: [],
  counts: {
    total: 0,
    overdue: 0,
    all: 0,
    dueSoon: 0,
    renewals: 0,
    importantDates: 0,
  },
  activeSection: 'ALL',
  withinDays: 60,
  pagination: null,
  loading: false,
  loadingMore: false,
  hasLoaded: false,
  error: null,
};

const extractErrorMessage = (err: any, fallback: string): string => {
  const msg = err?.response?.data?.message || err?.message || fallback;
  return Array.isArray(msg) ? msg.join(', ') : String(msg);
};

const mergeUniqueByKey = (
  existing: HomeAttentionItemApi[],
  incoming: HomeAttentionItemApi[]
): HomeAttentionItemApi[] => {
  const map = new Map<string, HomeAttentionItemApi>();
  existing.forEach((item) => map.set(item.key, item));
  incoming.forEach((item) => map.set(item.key, item));
  return Array.from(map.values());
};

export const fetchNeedsAttentionThunk = createAsyncThunk<
  {
    data: ListNeedsAttentionResponse;
    section: NeedsAttentionSectionFilter;
    withinDays: number;
    append: boolean;
  },
  ListNeedsAttentionQuery | undefined,
  { rejectValue: string }
>('needsAttention/fetch', async (query, { rejectWithValue }) => {
  const section: NeedsAttentionSectionFilter = query?.section ?? 'ALL';
  const withinDays = typeof query?.withinDays === 'number' ? query.withinDays : 60;
  const trimmedBefore = query?.before?.trim();
  const append = Boolean(trimmedBefore);

  try {
    const data = await homeServices.getNeedsAttention({
      section,
      withinDays,
      limit: query?.limit ?? 30,
      ...(trimmedBefore ? { before: trimmedBefore } : {}),
      ...(query?.today ? { today: query.today } : {}),
    });
    return { data, section, withinDays, append };
  } catch (err: any) {
    return rejectWithValue(
      extractErrorMessage(err, 'Failed to load items needing attention.')
    );
  }
});

const needsAttentionSlice = createSlice({
  name: 'needsAttention',
  initialState,
  reducers: {
    setNeedsAttentionSection: (
      state,
      action: PayloadAction<NeedsAttentionSectionFilter>
    ) => {
      state.activeSection = action.payload;
    },
    clearNeedsAttentionError: (state) => {
      state.error = null;
    },
    removeNeedsAttentionItemById: (
      state,
      action: PayloadAction<{ source: HomeAttentionItemApi['source']; id: string }>
    ) => {
      state.items = state.items.filter(
        (item) =>
          !(item.source === action.payload.source && item.id === action.payload.id)
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNeedsAttentionThunk.pending, (state, action) => {
        const isAppend = Boolean(action.meta.arg?.before?.trim());
        if (isAppend) {
          state.loadingMore = true;
        } else {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchNeedsAttentionThunk.fulfilled, (state, action) => {
        const { data, section, withinDays, append } = action.payload;
        state.loading = false;
        state.loadingMore = false;
        state.hasLoaded = true;
        state.activeSection = data.section || section;
        state.withinDays =
          typeof data.withinDays === 'number' ? data.withinDays : withinDays;
        if (data.counts) {
          state.counts = data.counts;
        }
        state.items = append
          ? mergeUniqueByKey(state.items, data.items || [])
          : data.items || [];
        state.pagination = data.pagination || null;
      })
      .addCase(fetchNeedsAttentionThunk.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.hasLoaded = true;
        state.error = action.payload || 'Failed to load items needing attention.';
      });
  },
});

export const {
  setNeedsAttentionSection,
  clearNeedsAttentionError,
  removeNeedsAttentionItemById,
} = needsAttentionSlice.actions;
export default needsAttentionSlice.reducer;
