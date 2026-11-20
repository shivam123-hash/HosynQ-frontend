import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import lifeProfileServices, {
  LifeProfileSection,
  LifeProfileQueryParams,
  LifeProfileResponse,
} from '../../../services/lifeProfileServices';
import {
  saveCachedLifeProfile,
  getCachedLifeProfile,
} from '../../../units/asyncStorageManager';

export interface LifeProfileState {
  full: any | null;
  summary: any | null;
  personal: any | null;
  documents: any | null;
  health: any | null;
  vaccination: any | null;
  interests: any | null;
  loading: boolean;
  sectionLoading: {
    full?: boolean;
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
  full: null,
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
 * Fetch Life Profile Full View
 * GET /api/v1/family/members/:memberId/life-profile?view=full
 */
export const fetchLifeProfileFullThunk = createAsyncThunk<
  LifeProfileResponse,
  { memberId: string },
  { rejectValue: string }
>('lifeProfile/fetchFull', async ({ memberId }, { rejectWithValue }) => {
  try {
    console.log(
      `[LifeProfile API] Requesting GET api/v1/family/members/${memberId}/life-profile?view=full`
    );
    const response = await lifeProfileServices.getFullProfile(memberId);
    console.log('[LifeProfile API] Full View Success Response:', response);
    await saveCachedLifeProfile(response);
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to fetch life profile full view.';
    console.log('[LifeProfile API] Full View Error Response:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});

/**
 * Load Cached Life Profile from AsyncStorage
 */
export const loadCachedLifeProfileThunk = createAsyncThunk(
  'lifeProfile/loadCached',
  async () => {
    try {
      const cached = await getCachedLifeProfile();
      return cached;
    } catch {
      return null;
    }
  }
);

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
  { section: LifeProfileSection; data: LifeProfileResponse; tab?: string },
  {
    memberId: string;
    section: LifeProfileSection;
    tab?: string;
    vaccineId?: string;
    view?: string;
  },
  { rejectValue: string }
>(
  'lifeProfile/fetchSection',
  async ({ memberId, section, tab, vaccineId, view }, { rejectWithValue }) => {
    try {
      console.log(
        `[LifeProfile API] GET ?section=${section}${view ? `&view=${view}` : ''}${
          tab ? `&tab=${tab}` : ''
        }${vaccineId ? `&vaccineId=${vaccineId}` : ''} for memberId:`,
        memberId,
      );
      const response = await lifeProfileServices.getLifeProfile(memberId, {
        section,
        view,
        tab,
        vaccineId,
      });
      console.log(`[LifeProfile API] section=${section} Success:`, response);
      return { section, data: response, tab };
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        `Failed to fetch ${section} section.`;
      console.log(`[LifeProfile API] section=${section} Error:`, errorMsg);
      return rejectWithValue(
        Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg,
      );
    }
  },
);

/**
 * Update Life Profile Section
 * PATCH /api/v1/family/members/:memberId/life-profile
 */
export const updateLifeProfileSectionThunk = createAsyncThunk<
  LifeProfileResponse,
  { memberId: string; payload: Record<string, any> },
  { rejectValue: string }
>('lifeProfile/updateSection', async ({ memberId, payload }, { rejectWithValue }) => {
  try {
    console.log(
      `[LifeProfile API] Requesting PATCH api/v1/family/members/${memberId}/life-profile`
    );
    console.log(
      '[LifeProfile API] PATCH Payload:',
      JSON.stringify(payload, null, 2)
    );
    const response = await lifeProfileServices.updateLifeProfile(memberId, payload);
    console.log(
      '[LifeProfile API] PATCH Success Response:',
      JSON.stringify(response, null, 2)
    );
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to update life profile section.';
    console.log('[LifeProfile API] PATCH Error Response:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});

/**
 * Scan Document & Extract Fields
 * POST /api/v1/family/members/:memberId/documents/scan
 */
export const scanDocumentThunk = createAsyncThunk<
  any,
  { memberId: string; formData: FormData },
  { rejectValue: string }
>('lifeProfile/scanDocument', async ({ memberId, formData }, { rejectWithValue }) => {
  try {
    console.log(
      `[LifeProfile API] Requesting POST api/v1/family/members/${memberId}/documents/scan`
    );
    const response = await lifeProfileServices.scanDocument(memberId, formData);
    console.log('[LifeProfile API] Scan Document Success Response:', response);
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to scan document.';
    console.log('[LifeProfile API] Scan Document Error Response:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});

/**
 * Delete Document
 * DELETE /api/v1/family/documents/:documentId
 */
export const deleteDocumentThunk = createAsyncThunk<
  { documentId: string; response: any },
  { documentId: string },
  { rejectValue: string }
>('lifeProfile/deleteDocument', async ({ documentId }, { rejectWithValue }) => {
  try {
    console.log(
      `[LifeProfile API] Requesting DELETE api/v1/family/documents/${documentId}`
    );
    const response = await lifeProfileServices.deleteDocument(documentId);
    console.log('[LifeProfile API] DELETE Document Success:', response);
    return { documentId, response };
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to delete document.';
    console.log('[LifeProfile API] DELETE Document Error:', errorMsg);
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});

/**
 * Delete Vaccine
 * DELETE /api/v1/family/vaccines/:vaccineId
 */
export const deleteVaccineThunk = createAsyncThunk<
  { vaccineId: string; response: any },
  { vaccineId: string },
  { rejectValue: string }
>('lifeProfile/deleteVaccine', async ({ vaccineId }, { rejectWithValue }) => {
  try {
    console.log(
      `[LifeProfile API] Requesting DELETE api/v1/family/vaccines/${vaccineId}`
    );
    const response = await lifeProfileServices.deleteVaccine(vaccineId);
    console.log('[LifeProfile API] DELETE Vaccine Success:', response);
    return { vaccineId, response };
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to delete vaccine.';
    console.log('[LifeProfile API] DELETE Vaccine Error:', errorMsg);
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
    setCachedLifeProfile: (state, action: PayloadAction<any>) => {
      if (action.payload && !state.full) {
        state.full = action.payload;
      }
    },
    resetLifeProfileState: () => initialState,
  },
  extraReducers: (builder) => {
    // Load Cached
    builder.addCase(loadCachedLifeProfileThunk.fulfilled, (state, action) => {
      if (action.payload && !state.full) {
        state.full = action.payload;
      }
    });

    // Full View (?view=full)
    builder.addCase(fetchLifeProfileFullThunk.pending, (state) => {
      state.loading = true;
      state.sectionLoading.full = true;
      state.error = null;
    });
    builder.addCase(fetchLifeProfileFullThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.sectionLoading.full = false;
      state.full = action.payload;
    });
    builder.addCase(fetchLifeProfileFullThunk.rejected, (state, action) => {
      state.loading = false;
      state.sectionLoading.full = false;
      state.error = action.payload || 'Failed to load full life profile';
    });

    // Summary (?view=summary)
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
      if (!state.sectionLoading) state.sectionLoading = {} as any;
      state.sectionLoading[section] = true;
      state.error = null;
    });
    builder.addCase(fetchLifeProfileSectionThunk.fulfilled, (state, action) => {
      const { section, data } = action.payload;
      state.loading = false;
      if (!state.sectionLoading) state.sectionLoading = {} as any;
      state.sectionLoading[section] = false;
      if (section === 'vaccination' && state.vaccination) {
        const prevData = (state.vaccination as any)?.data || state.vaccination;
        const incomingData = data?.data || data || {};
        state.vaccination = {
          ...state.vaccination,
          ...data,
          ...incomingData,
          vaccines: incomingData.vaccines !== undefined ? incomingData.vaccines : prevData.vaccines,
          growth: incomingData.growth !== undefined ? incomingData.growth : prevData.growth,
          summary: incomingData.summary !== undefined ? incomingData.summary : prevData.summary,
          milestones: incomingData.milestones !== undefined ? incomingData.milestones : prevData.milestones,
          data: {
            ...prevData,
            ...incomingData,
            vaccines: incomingData.vaccines !== undefined ? incomingData.vaccines : prevData.vaccines,
            growth: incomingData.growth !== undefined ? incomingData.growth : prevData.growth,
            summary: incomingData.summary !== undefined ? incomingData.summary : prevData.summary,
            milestones: incomingData.milestones !== undefined ? incomingData.milestones : prevData.milestones,
          },
        };
      } else {
        state[section] = data;
      }
    });
    builder.addCase(fetchLifeProfileSectionThunk.rejected, (state, action) => {
      const section = action.meta.arg.section;
      state.loading = false;
      if (!state.sectionLoading) state.sectionLoading = {} as any;
      state.sectionLoading[section] = false;
      state.error = action.payload || `Failed to load ${section}`;
    });

    // Update Section (PATCH api/v1/family/members/:memberId/life-profile)
    builder.addCase(updateLifeProfileSectionThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateLifeProfileSectionThunk.fulfilled, (state, action) => {
      state.loading = false;
      const payloadArg = action.meta.arg.payload;
      if (payloadArg?.personal) {
        state.personal = {
          ...(state.personal || {}),
          ...payloadArg.personal,
        };
      }
      if (payloadArg?.vaccination) {
        state.vaccination = {
          ...(state.vaccination || {}),
          ...payloadArg.vaccination,
          data: {
            ...((state.vaccination as any)?.data || {}),
            ...payloadArg.vaccination,
          },
        };
      }
      if (payloadArg?.interests) {
        state.interests = {
          ...(state.interests || {}),
          ...payloadArg.interests,
          data: {
            ...((state.interests as any)?.data || {}),
            ...payloadArg.interests,
          },
        };
      }
      if (action.payload?.data) {
        const updatedFull = {
          ...(state.full || {}),
          ...action.payload,
          data: {
            ...(state.full?.data || {}),
            ...action.payload.data,
          },
          progress: action.payload.progress || state.full?.progress,
        };
        state.full = updatedFull;
        saveCachedLifeProfile(updatedFull);
      }
    });
    builder.addCase(updateLifeProfileSectionThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to update life profile section';
    });

    // Scan Document
    builder.addCase(scanDocumentThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(scanDocumentThunk.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(scanDocumentThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to scan document';
    });

    // Delete Document
    builder.addCase(deleteDocumentThunk.fulfilled, (state, action) => {
      const docId = action.payload.documentId;
      if (Array.isArray(state.documents?.data?.documents)) {
        state.documents.data.documents = state.documents.data.documents.filter(
          (d: any) => d.id !== docId
        );
      } else if (Array.isArray(state.documents?.data)) {
        state.documents.data = state.documents.data.filter(
          (d: any) => d.id !== docId
        );
      }
      if (Array.isArray(state.full?.data?.documents)) {
        state.full.data.documents = state.full.data.documents.filter(
          (d: any) => d.id !== docId
        );
      }
    });

    // Delete Vaccine
    builder.addCase(deleteVaccineThunk.fulfilled, (state, action) => {
      const vId = action.payload.vaccineId;
      if (Array.isArray(state.vaccination?.data?.vaccines)) {
        state.vaccination.data.vaccines = state.vaccination.data.vaccines.filter(
          (v: any) => v.id !== vId
        );
      }
      if (Array.isArray(state.full?.data?.vaccination?.vaccines)) {
        state.full.data.vaccination.vaccines = state.full.data.vaccination.vaccines.filter(
          (v: any) => v.id !== vId
        );
      }
    });
  },
});

export const {
  clearLifeProfileError,
  setCachedLifeProfile,
  resetLifeProfileState,
} = lifeProfileSlice.actions;
export default lifeProfileSlice.reducer;

