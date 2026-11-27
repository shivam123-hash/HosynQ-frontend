import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import homeServices, {
  BriefPeriod,
  HomeQuery,
  HomeResponse,
  HomeSectionData,
  HomeSectionType,
} from '../../../services/homeServices';

export interface HomeState {
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  error: string | null;
  hasLoadedInitial: boolean;
  today: string;
  sectionOrder: HomeSectionType[];
  sections: Partial<Record<HomeSectionType, any>>;
  pagination: {
    limit: number;
    hasMore: boolean;
    nextCursor: HomeSectionType | null;
  };
  activeBriefPeriod: BriefPeriod;
  briefLoading: boolean;
}

const initialState: HomeState = {
  loading: false,
  refreshing: false,
  loadingMore: false,
  error: null,
  hasLoadedInitial: false,
  today: '',
  sectionOrder: [],
  sections: {},
  pagination: {
    limit: 15,
    hasMore: false,
    nextCursor: null,
  },
  activeBriefPeriod: 'TODAY',
  briefLoading: false,
};

export const fetchHomePageThunk = createAsyncThunk<
  HomeResponse,
  { query: HomeQuery; isRefresh?: boolean; isLoadMore?: boolean },
  { rejectValue: string }
>('home/fetchPage', async ({ query }, { rejectWithValue }) => {
  try {
    const res = await homeServices.getHomePage(query);
    return res;
  } catch (err: any) {
    const msg =
      err?.response?.data?.message || err?.message || 'Could not load Home feed.';
    return rejectWithValue(Array.isArray(msg) ? msg.join(', ') : msg);
  }
});

export const fetchHomeSectionThunk = createAsyncThunk<
  { section: HomeSectionType; data: any; period?: BriefPeriod },
  { section: HomeSectionType; params?: Omit<HomeQuery, 'section'> },
  { rejectValue: string }
>('home/fetchSection', async ({ section, params }, { rejectWithValue }) => {
  try {
    const res = await homeServices.getHomeSection(section, params);
    const secData = res.sections.find((s) => s.type === section)?.data ?? null;
    return { section, data: secData, period: params?.period };
  } catch (err: any) {
    const msg =
      err?.response?.data?.message || err?.message || 'Could not update section.';
    return rejectWithValue(Array.isArray(msg) ? msg.join(', ') : msg);
  }
});

export const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    setActiveBriefPeriod: (state, action: PayloadAction<BriefPeriod>) => {
      state.activeBriefPeriod = action.payload;
    },
    updateLocalSectionData: (
      state,
      action: PayloadAction<{ section: HomeSectionType; data: any }>
    ) => {
      state.sections[action.payload.section] = action.payload.data;
    },
    resetHomeFeed: () => initialState,
  },
  extraReducers: (builder) => {
    // fetchHomePageThunk
    builder
      .addCase(fetchHomePageThunk.pending, (state, action) => {
        if (action.meta.arg.isRefresh) {
          state.refreshing = true;
        } else if (action.meta.arg.isLoadMore) {
          state.loadingMore = true;
        } else {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchHomePageThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.loadingMore = false;
        state.hasLoadedInitial = true;
        state.today = action.payload.today;
        state.pagination = action.payload.pagination;

        const isLoadMore = action.meta.arg.isLoadMore;
        if (isLoadMore) {
          // Append new sections
          action.payload.sections.forEach((sec) => {
            state.sections[sec.type] = sec.data;
            if (!state.sectionOrder.includes(sec.type)) {
              state.sectionOrder.push(sec.type);
            }
          });
        } else {
          // Replace sections
          const newMap: Partial<Record<HomeSectionType, any>> = {};
          const newOrder: HomeSectionType[] = [];
          action.payload.sections.forEach((sec) => {
            newMap[sec.type] = sec.data;
            newOrder.push(sec.type);
          });
          state.sections = newMap;
          state.sectionOrder = newOrder;
        }
      })
      .addCase(fetchHomePageThunk.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.loadingMore = false;
        state.error = action.payload || 'Failed to fetch home feed.';
      });

    // fetchHomeSectionThunk
    builder
      .addCase(fetchHomeSectionThunk.pending, (state, action) => {
        if (action.meta.arg.section === 'BRIEF') {
          state.briefLoading = true;
        }
      })
      .addCase(fetchHomeSectionThunk.fulfilled, (state, action) => {
        if (action.meta.arg.section === 'BRIEF') {
          state.briefLoading = false;
          if (action.payload.period) {
            state.activeBriefPeriod = action.payload.period;
          }
        }
        state.sections[action.payload.section] = action.payload.data;
      })
      .addCase(fetchHomeSectionThunk.rejected, (state, action) => {
        if (action.meta.arg.section === 'BRIEF') {
          state.briefLoading = false;
        }
      });
  },
});

export const { setActiveBriefPeriod, updateLocalSectionData, resetHomeFeed } =
  homeSlice.actions;

export default homeSlice.reducer;
