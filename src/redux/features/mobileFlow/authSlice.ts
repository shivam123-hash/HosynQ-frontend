import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import authServices, {
  SendOtpPayload,
  SendOtpResponse,
  VerifyOtpPayload,
  VerifyOtpResponse,
} from '../../../services/authServices';
import { getUserData, clearUserData } from '../../../units/asyncStorageManager';

export interface AuthState {
  isLoggedIn: boolean;
  user: any | null;
  accessToken: string | null;
  refreshToken: string | null;
  verificationId: string | null;
  activePhoneNumber: string | null;
  devPlaintextOtp: string | null;
  inFamily: boolean;
  nextStep: string | null;
  loading: boolean;
  error: string | null;
  resendCooldownSeconds: number;
}

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  verificationId: null,
  activePhoneNumber: null,
  devPlaintextOtp: null,
  inFamily: false,
  nextStep: null,
  loading: false,
  error: null,
  resendCooldownSeconds: 60,
};


export const sendOtp = createAsyncThunk<
  SendOtpResponse,
  SendOtpPayload,
  { rejectValue: string }
>('auth/sendOtp', async (payload, { rejectWithValue }) => {
  try {
    console.log('[sendOtp API] Requesting OTP for payload:', payload);
    const response = await authServices.sendOtp(payload);
    console.log('[sendOtp API] Success Response:', response);
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to send OTP. Please try again.';
    console.log('[sendOtp API] Error Response:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});

export const verifyOtp = createAsyncThunk<
  VerifyOtpResponse,
  VerifyOtpPayload,
  { rejectValue: string }
>('auth/verifyOtp', async (payload, { rejectWithValue, dispatch }) => {
  try {
    console.log('[verifyOtp API] Submitting payload:', payload);
    const response = await authServices.verifyOtp(payload);
    console.log('[verifyOtp API] Success Response:', response);
    dispatch(getProfile());
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to verify OTP. Please try again.';
    console.log('[verifyOtp API] Error Response:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});

export const loadInitialState = createAsyncThunk(
  'auth/loadInitialState',
  async (_, { dispatch }) => {
    try {
      const stored = await getUserData();
      if (stored?.accessToken) {
        dispatch(getProfile());
        return {
          user: stored,
          accessToken: stored.accessToken,
          isLoggedIn: true,
        };
      }
      return {
        user: null,
        accessToken: null,
        isLoggedIn: false,
      };
    } catch {
      return {
        user: null,
        accessToken: null,
        isLoggedIn: false,
      };
    }
  }
);

export const getProfile = createAsyncThunk<any, void, { rejectValue: string }>(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authServices.getProfile();
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || 'Failed to fetch profile'
      );
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await authServices.logout();
  await clearUserData();
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    setActivePhoneNumber: (state, action: PayloadAction<string>) => {
      state.activePhoneNumber = action.payload;
    },
    setVerificationId: (state, action: PayloadAction<string>) => {
      state.verificationId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.verificationId = action.payload.verificationId;
        state.activePhoneNumber = action.payload.phoneNumber;
        state.devPlaintextOtp = action.payload.otp || null;
        state.resendCooldownSeconds =
          action.payload.resendCooldownSeconds || 60;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to send OTP';
      });

    builder
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.accessToken = action.payload.accessToken || null;
        state.refreshToken = action.payload.refreshToken || null;
        state.user = action.payload.user || null;
        state.inFamily = action.payload.inFamily || false;
        state.nextStep = action.payload.nextStep || null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to verify OTP';
      });

    builder.addCase(loadInitialState.fulfilled, (state, action) => {
      state.isLoggedIn = action.payload.isLoggedIn;
      state.accessToken = action.payload.accessToken || null;
      state.user = action.payload.user || null;
    });

    builder.addCase(getProfile.fulfilled, (state, action) => {
      state.user = action.payload;
    });

    builder.addCase(logout.fulfilled, (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.verificationId = null;
      state.activePhoneNumber = null;
      state.devPlaintextOtp = null;
      state.error = null;
    });
  },
});

export const { clearAuthError, setActivePhoneNumber, setVerificationId } =
  authSlice.actions;

export default authSlice.reducer;

