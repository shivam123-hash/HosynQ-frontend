import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import authServices, {
  UpdateProfilePayload,
  UpdateProfileResponse,
  UploadAvatarResponse,
} from '../../../services/authServices';

export interface BaseProfileState {
  fullName: string;
  gender: string;
  familyRole: string;
  avatarColor: string | null;
  avatarUrl: string | null;
  avatarLoading: boolean;
  avatarError: string | null;
  profileLoading: boolean;
  profileError: string | null;
  isProfileComplete: boolean;
  user: any | null;
}

const initialState: BaseProfileState = {
  fullName: 'Rupesh Sharma',
  gender: 'Male',
  familyRole: 'Father',
  avatarColor: 'amber',
  avatarUrl: null,
  avatarLoading: false,
  avatarError: null,
  profileLoading: false,
  profileError: null,
  isProfileComplete: false,
  user: null,
};

/** 1. Upload Profile Picture Or Avatar Color (POST /api/v1/auth/avatar) */
export const uploadAvatar = createAsyncThunk<
  UploadAvatarResponse,
  FormData,
  { rejectValue: string }
>('baseProfile/uploadAvatar', async (formData, { rejectWithValue }) => {
  try {
    console.log('[uploadAvatar API] Uploading avatar formdata...');
    const response = await authServices.uploadAvatar(formData);
    console.log('[uploadAvatar API] Success Response:', response);
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to update avatar.';
    console.log('[uploadAvatar API] Error Response:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});

/** 2. Update Basic Profile Details (PATCH /api/v1/auth/profile) */
export const updateBasicProfile = createAsyncThunk<
  UpdateProfileResponse,
  UpdateProfilePayload,
  { rejectValue: string }
>('baseProfile/updateBasicProfile', async (payload, { rejectWithValue }) => {
  try {
    console.log('[updateBasicProfile API] Submitting profile payload:', payload);
    const response = await authServices.updateProfile(payload);
    console.log('[updateBasicProfile API] Success Response:', response);
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to update profile details.';
    console.log('[updateBasicProfile API] Error Response:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});

const baseProfileSlice = createSlice({
  name: 'baseProfile',
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.profileError = null;
    },
    clearAvatarError: (state) => {
      state.avatarError = null;
    },
    setFullName: (state, action: PayloadAction<string>) => {
      state.fullName = action.payload;
    },
    setGender: (state, action: PayloadAction<string>) => {
      state.gender = action.payload;
    },
    setFamilyRole: (state, action: PayloadAction<string>) => {
      state.familyRole = action.payload;
    },
    setLocalAvatarColor: (state, action: PayloadAction<string>) => {
      state.avatarColor = action.payload;
      state.avatarUrl = null;
    },
    setLocalAvatarUrl: (state, action: PayloadAction<string>) => {
      state.avatarUrl = action.payload;
      state.avatarColor = null;
    },
    resetBaseProfileState: () => initialState,
  },
  extraReducers: (builder) => {
    // Upload Avatar
    builder
      .addCase(uploadAvatar.pending, (state) => {
        state.avatarLoading = true;
        state.avatarError = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.avatarLoading = false;
        state.avatarError = null;
        if (action.payload.user) {
          state.user = action.payload.user;
          state.avatarColor = action.payload.user.avatarColor || null;
          state.avatarUrl = action.payload.user.avatarUrl || null;
        }
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.avatarLoading = false;
        state.avatarError = action.payload || 'Failed to update avatar';
      });

    // Update Basic Profile
    builder
      .addCase(updateBasicProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(updateBasicProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profileError = null;
        state.isProfileComplete = true;
        if (action.payload.user) {
          state.user = action.payload.user;
          state.fullName = action.payload.user.fullName || state.fullName;
          state.gender = action.payload.user.gender || state.gender;
          state.familyRole = action.payload.user.familyRole || state.familyRole;
        }
      })
      .addCase(updateBasicProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload || 'Failed to update profile details';
      });
  },
});

export const {
  clearProfileError,
  clearAvatarError,
  setFullName,
  setGender,
  setFamilyRole,
  setLocalAvatarColor,
  setLocalAvatarUrl,
  resetBaseProfileState,
} = baseProfileSlice.actions;

export default baseProfileSlice.reducer;

