import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import lifeProfileServices, {
  LifeProfileSection,
  LifeProfileQueryParams,
  LifeProfileResponse,
} from '../../../services/lifeProfileServices';

export interface LifeProfileState {
  summary: any | null;
  personal: any | null;
  documents: any | null;
  health: any | null;
  vaccination: any | null;
  interests: any | null;
  loading: boolean;
  sectionLoading: {
    summary?: boolean;
    personal?: boolean;
    documents?: boolean;
    health?: boolean;
    vaccination?: boolean;
    interests?: boolean;
  };
  error: string | null;
}

const initialState: LifeProfileState = {
  summary: null,
  personal: null,
  documents: null,
  health: null,
  vaccination: null,
  interests: null,
  loading: false,
  sectionLoading: {},
  error: null,
};

/**
 * Fetch Life Profile Summary
 * GET /api/v1/family/members/:memberId/life-profile?view=summary
 */
export const fetchLifeProfileSummaryThunk = createAsyncThunk<
  LifeProfileResponse,
  { memberId: string },
  { rejectValue: string }
>('lifeProfile/fetchSummary', async ({ memberId }, { rejectWithValue }) => {
  try {
    console.log('[LifeProfile API] GET ?view=summary for memberId:', memberId);
    const response = await lifeProfileServices.getSummary(memberId);
    console.log('[LifeProfile API] Summary Success:', response);
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to fetch life profile summary.';
    console.log('[LifeProfile API] Summary Error:', errorMsg);
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});

/**
 * Fetch Life Profile Specific Section
 * GET /api/v1/family/members/:memberId/life-profile?section=:section
 * section: 'personal' | 'documents' | 'health' | 'vaccination' | 'interests'
 */
export const fetchLifeProfileSectionThunk = createAsyncThunk<
  { section: LifeProfileSection; data: LifeProfileResponse },
  { memberId: string; section: LifeProfileSection },
  { rejectValue: string }
>('lifeProfile/fetchSection', async ({ memberId, section }, { rejectWithValue }) => {
  try {
    console.log(`[LifeProfile API] GET ?section=${section} for memberId:`, memberId);
    const response = await lifeProfileServices.getLifeProfile(memberId, { section });
    console.log(`[LifeProfile API] section=${section} Success:`, response);
    return { section, data: response };
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      `Failed to fetch ${section} section.`;
    console.log(`[LifeProfile API] section=${section} Error:`, errorMsg);
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});

const lifeProfileSlice = createSlice({
  name: 'lifeProfile',
  initialState,
  reducers: {
    clearLifeProfileError: (state) => {
      state.error = null;
    },
    resetLifeProfileState: () => initialState,
  },
  extraReducers: (builder) => {
    // Summary
    builder.addCase(fetchLifeProfileSummaryThunk.pending, (state) => {
      state.loading = true;
      state.sectionLoading.summary = true;
      state.error = null;
    });
    builder.addCase(fetchLifeProfileSummaryThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.sectionLoading.summary = false;
      state.summary = action.payload;
    });
    builder.addCase(fetchLifeProfileSummaryThunk.rejected, (state, action) => {
      state.loading = false;
      state.sectionLoading.summary = false;
      state.error = action.payload || 'Failed to load summary';
    });

    // Section
    builder.addCase(fetchLifeProfileSectionThunk.pending, (state, action) => {
      const section = action.meta.arg.section;
      state.loading = true;
      state.sectionLoading[section] = true;
      state.error = null;
    });
    builder.addCase(fetchLifeProfileSectionThunk.fulfilled, (state, action) => {
      const { section, data } = action.payload;
      state.loading = false;
      state.sectionLoading[section] = false;
      state[section] = data;
    });
    builder.addCase(fetchLifeProfileSectionThunk.rejected, (state, action) => {
      const section = action.meta.arg.section;
      state.loading = false;
      state.sectionLoading[section] = false;
      state.error = action.payload || `Failed to load ${section}`;
    });
  },
});

export const { clearLifeProfileError, resetLifeProfileState } =
  lifeProfileSlice.actions;
export default lifeProfileSlice.reducer;

