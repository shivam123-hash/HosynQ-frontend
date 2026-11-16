import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import familyServices, {
  CreateFamilyPayload,
  CreateFamilyResponse,
  CreateInvitationResponse,
  FamilyData,
  FamilyInvitationData,
  JoinFamilyPayload,
  JoinFamilyResponse,
  MyFamilyResponse,
  PendingJoinRequestData,
  PreviewInvitationData,
  PreviewInvitationPayload,
  PreviewInvitationResponse,
} from '../../../services/familyServices';

export interface FamilyState {
  family: FamilyData | null;
  familyCode: string | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  invitation: FamilyInvitationData | null;
  inviteLoading: boolean;
  inviteError: string | null;
  joinRequest: JoinFamilyResponse | null;
  joinLoading: boolean;
  joinError: string | null;
  previewData: PreviewInvitationData | null;
  previewLoading: boolean;
  previewError: string | null;
  myFamilyData: MyFamilyResponse | null;
  myFamilyLoading: boolean;
  myFamilyError: string | null;
}

const initialState: FamilyState = {
  family: null,
  familyCode: null,
  loading: false,
  error: null,
  success: false,
  invitation: null,
  inviteLoading: false,
  inviteError: null,
  joinRequest: null,
  joinLoading: false,
  joinError: null,
  previewData: null,
  previewLoading: false,
  previewError: null,
  myFamilyData: null,
  myFamilyLoading: false,
  myFamilyError: null,
};

/** Create Family Thunk (POST /api/v1/family/create) */
export const createFamilyThunk = createAsyncThunk<
  CreateFamilyResponse,
  CreateFamilyPayload,
  { rejectValue: string }
>('family/createFamily', async (payload, { rejectWithValue }) => {
  try {
    console.log('[createFamily API] Payload:', payload);
    const response = await familyServices.createFamily(payload);
    console.log('[createFamily API] Success Response:', response);
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to create family.';
    console.log('[createFamily API] Error Response:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});

export const createFamily = createFamilyThunk;

/** Create or get Family Invitation Link Thunk (POST /api/v1/family/invitations) */
export const createInvitationThunk = createAsyncThunk<
  CreateInvitationResponse,
  void,
  { rejectValue: string }
>('family/createInvitation', async (_, { rejectWithValue }) => {
  try {
    console.log('[createInvitation API] Requesting invite link...');
    const response = await familyServices.createInvitation();
    console.log('[createInvitation API] Success Response:', response);
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to generate invitation link.';
    console.log('[createInvitation API] Error Response:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});

export const createInvitation = createInvitationThunk;

/** Request Join Family Thunk (POST /api/v1/family/join-request) */
export const requestJoinFamilyThunk = createAsyncThunk<
  JoinFamilyResponse,
  JoinFamilyPayload,
  { rejectValue: string }
>('family/requestJoinFamily', async (payload, { rejectWithValue }) => {
  try {
    console.log('[requestJoinFamily API] Payload:', payload);
    const response = await familyServices.requestJoinFamily(payload);
    console.log('[requestJoinFamily API] Success Response:', response);
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to send join request.';
    console.log('[requestJoinFamily API] Error Response:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});

export const requestJoinFamily = requestJoinFamilyThunk;

/** Preview Family Invitation Link Thunk (POST /api/v1/family/invitations/preview) */
export const previewInvitationThunk = createAsyncThunk<
  PreviewInvitationResponse,
  PreviewInvitationPayload,
  { rejectValue: string }
>('family/previewInvitation', async (payload, { rejectWithValue }) => {
  try {
    console.log('[previewInvitation API] Payload:', payload);
    const response = await familyServices.previewInvitation(payload);
    console.log('[previewInvitation API] Success Response:', response);
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to preview invitation.';
    console.log('[previewInvitation API] Error Response:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});

export const previewInvitation = previewInvitationThunk;

/** Get My Family Status / Pending Request Thunk (GET /api/v1/family/my-family) */
export const getMyFamilyThunk = createAsyncThunk<
  MyFamilyResponse,
  void,
  { rejectValue: string }
>('family/getMyFamily', async (_, { rejectWithValue }) => {
  try {
    console.log('[getMyFamily API] Checking family status...');
    const response = await familyServices.getMyFamily();
    console.log('[getMyFamily API] Success Response:', response);
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to check family status.';
    console.log('[getMyFamily API] Error Response:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});

export const getMyFamily = getMyFamilyThunk;

const familySlice = createSlice({
  name: 'family',
  initialState,
  reducers: {
    clearFamilyError: (state) => {
      state.error = null;
    },
    clearInviteError: (state) => {
      state.inviteError = null;
    },
    clearJoinError: (state) => {
      state.joinError = null;
    },
    clearPreviewError: (state) => {
      state.previewError = null;
    },
    clearMyFamilyError: (state) => {
      state.myFamilyError = null;
    },
    resetFamilyState: () => initialState,
    setFamily: (state, action: PayloadAction<FamilyData>) => {
      state.family = action.payload;
      state.familyCode = action.payload.familyCode;
    },
    setInvitation: (state, action: PayloadAction<FamilyInvitationData>) => {
      state.invitation = action.payload;
    },
    setJoinRequest: (state, action: PayloadAction<JoinFamilyResponse>) => {
      state.joinRequest = action.payload;
    },
    setMyFamilyData: (state, action: PayloadAction<MyFamilyResponse>) => {
      state.myFamilyData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createFamilyThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createFamilyThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.family = action.payload.family;
        state.familyCode = action.payload.family.familyCode;
        state.success = true;
        state.error = null;
      })
      .addCase(createFamilyThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create family.';
        state.success = false;
      })
      .addCase(createInvitationThunk.pending, (state) => {
        state.inviteLoading = true;
        state.inviteError = null;
      })
      .addCase(createInvitationThunk.fulfilled, (state, action) => {
        state.inviteLoading = false;
        state.invitation = action.payload.invitation;
        state.inviteError = null;
      })
      .addCase(createInvitationThunk.rejected, (state, action) => {
        state.inviteLoading = false;
        state.inviteError =
          action.payload || 'Failed to generate invitation link.';
      })
      .addCase(requestJoinFamilyThunk.pending, (state) => {
        state.joinLoading = true;
        state.joinError = null;
      })
      .addCase(requestJoinFamilyThunk.fulfilled, (state, action) => {
        state.joinLoading = false;
        state.joinRequest = action.payload;
        state.joinError = null;
      })
      .addCase(requestJoinFamilyThunk.rejected, (state, action) => {
        state.joinLoading = false;
        state.joinError = action.payload || 'Failed to send join request.';
      })
      .addCase(previewInvitationThunk.pending, (state) => {
        state.previewLoading = true;
        state.previewError = null;
      })
      .addCase(previewInvitationThunk.fulfilled, (state, action) => {
        state.previewLoading = false;
        state.previewData = action.payload.invitation;
        state.previewError = null;
      })
      .addCase(previewInvitationThunk.rejected, (state, action) => {
        state.previewLoading = false;
        state.previewError = action.payload || 'Failed to preview invitation.';
      })
      .addCase(getMyFamilyThunk.pending, (state) => {
        state.myFamilyLoading = true;
        state.myFamilyError = null;
      })
      .addCase(getMyFamilyThunk.fulfilled, (state, action) => {
        state.myFamilyLoading = false;
        state.myFamilyData = action.payload;
        state.myFamilyError = null;
        if (action.payload.inFamily && action.payload.family) {
          state.family = action.payload.family;
          state.familyCode = action.payload.family.familyCode;
        }
      })
      .addCase(getMyFamilyThunk.rejected, (state, action) => {
        state.myFamilyLoading = false;
        state.myFamilyError = action.payload || 'Failed to check family status.';
      });
  },
});

export const {
  clearFamilyError,
  clearInviteError,
  clearJoinError,
  clearPreviewError,
  clearMyFamilyError,
  resetFamilyState,
  setFamily,
  setInvitation,
  setJoinRequest,
  setMyFamilyData,
} = familySlice.actions;

export default familySlice.reducer;

