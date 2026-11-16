import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import authServices, {
  SendEmailLinkPayload,
  SendEmailLinkResponse,
  EmailStatusResponse,
  AttachPhonePayload,
  AttachPhoneResponse,
  VerifyAttachedPhonePayload,
  VerifyAttachedPhoneResponse,
} from '../../../services/authServices';

export interface EmailAuthState {
  email: string | null;
  verificationId: string | null;
  status: 'idle' | 'pending' | 'verified' | 'expired' | 'claimed';
  loading: boolean;
  polling: boolean;
  error: string | null;
  resendCooldownSeconds: number;
  expiresInMinutes: number;
  devToken: string | null;
  devVerifyUrl: string | null;
  user: any | null;
  accessToken: string | null;
  refreshToken: string | null;
  needsPhone: boolean;
  nextStep: string | null;

  // Phone Attach state (managed within emailFlow)
  attachedPhoneNumber: string | null;
  phoneVerificationId: string | null;
  devPhoneOtp: string | null;
  phoneLoading: boolean;
  phoneError: string | null;
  phoneAttached: boolean;
  phoneCooldownSeconds: number;
}

const initialState: EmailAuthState = {
  email: null,
  verificationId: null,
  status: 'idle',
  loading: false,
  polling: false,
  error: null,
  resendCooldownSeconds: 60,
  expiresInMinutes: 15,
  devToken: null,
  devVerifyUrl: null,
  user: null,
  accessToken: null,
  refreshToken: null,
  needsPhone: false,
  nextStep: null,

  attachedPhoneNumber: null,
  phoneVerificationId: null,
  devPhoneOtp: null,
  phoneLoading: false,
  phoneError: null,
  phoneAttached: false,
  phoneCooldownSeconds: 60,
};

/** 1. Send Magic Link to Email */
export const sendEmailLink = createAsyncThunk<
  SendEmailLinkResponse,
  SendEmailLinkPayload,
  { rejectValue: string }
>('emailAuth/sendEmailLink', async (payload, { rejectWithValue }) => {
  try {
    console.log('[sendEmailLink API] Sending link to payload:', payload);
    const response = await authServices.sendEmailLink(payload);
    console.log('[sendEmailLink API] Success Response:', response);
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to send email link. Please try again.';
    console.log('[sendEmailLink API] Error Response:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});

/** 2. Poll Status to check if user clicked email link */
export const pollEmailStatus = createAsyncThunk<
  EmailStatusResponse,
  string,
  { rejectValue: string }
>('emailAuth/pollEmailStatus', async (verificationId, { rejectWithValue }) => {
  try {
    console.log('[pollEmailStatus API] Polling status for ID:', verificationId);
    const response = await authServices.getEmailStatus(verificationId);
    console.log('[pollEmailStatus API] Status Result:', response);
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to poll email status.';
    console.log('[pollEmailStatus API] Error:', errorMsg);
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});

/** 3. Dev Helper: Simulate link click via token */
export const simulateDevEmailClick = createAsyncThunk<
  any,
  string,
  { rejectValue: string }
>('emailAuth/simulateDevEmailClick', async (token, { rejectWithValue }) => {
  try {
    console.log('[simulateDevEmailClick] Consuming token:', token);
    const response = await authServices.consumeEmailLink(token);
    console.log('[simulateDevEmailClick] Response:', response);
    return response;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || 'Error consuming token'
    );
  }
});

/** 4. Attach Phone Number to Existing Account (POST /api/v1/auth/phone/attach) */
export const attachPhone = createAsyncThunk<
  AttachPhoneResponse,
  AttachPhonePayload,
  { rejectValue: string }
>('emailAuth/attachPhone', async (payload, { rejectWithValue }) => {
  try {
    console.log('[attachPhone API] Attaching phone to account:', payload);
    const response = await authServices.attachPhone(payload);
    console.log('[attachPhone API] Success Response:', response);
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to attach phone number.';
    console.log('[attachPhone API] Error Response:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});

/** 5. Verify OTP for Attached Phone (POST /api/v1/auth/verify-otp) */
export const verifyAttachedPhone = createAsyncThunk<
  VerifyAttachedPhoneResponse,
  VerifyAttachedPhonePayload,
  { rejectValue: string }
>('emailAuth/verifyAttachedPhone', async (payload, { rejectWithValue }) => {
  try {
    console.log('[verifyAttachedPhone API] Verifying OTP payload:', payload);
    const response = await authServices.verifyAttachedPhoneOtp(payload);
    console.log('[verifyAttachedPhone API] Success Response:', response);
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Invalid or expired OTP.';
    console.log('[verifyAttachedPhone API] Error Response:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});

const emailAuthSlice = createSlice({
  name: 'emailAuth',
  initialState,
  reducers: {
    clearEmailError: (state) => {
      state.error = null;
    },
    clearPhoneError: (state) => {
      state.phoneError = null;
    },
    resetEmailState: () => initialState,
    resetPhoneAttachState: (state) => {
      state.attachedPhoneNumber = null;
      state.phoneVerificationId = null;
      state.devPhoneOtp = null;
      state.phoneLoading = false;
      state.phoneError = null;
      state.phoneAttached = false;
      state.phoneCooldownSeconds = 60;
    },
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    setEmailVerificationId: (state, action: PayloadAction<string>) => {
      state.verificationId = action.payload;
    },
    setAttachedPhoneNumber: (state, action: PayloadAction<string>) => {
      state.attachedPhoneNumber = action.payload;
    },
    setAttachedPhoneVerificationId: (state, action: PayloadAction<string>) => {
      state.phoneVerificationId = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Send Email Link
    builder
      .addCase(sendEmailLink.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendEmailLink.fulfilled, (state, action) => {
        state.loading = false;
        state.email = action.payload.email;
        state.verificationId = action.payload.verificationId;
        state.resendCooldownSeconds =
          action.payload.resendCooldownSeconds || 60;
        state.expiresInMinutes = action.payload.expiresInMinutes || 15;
        state.devToken = action.payload.token || null;
        state.devVerifyUrl = action.payload.verifyUrl || null;
        state.status = 'pending';
      })
      .addCase(sendEmailLink.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to send email link';
      });

    // Poll Email Status
    builder
      .addCase(pollEmailStatus.pending, (state) => {
        state.polling = true;
      })
      .addCase(pollEmailStatus.fulfilled, (state, action) => {
        state.polling = false;
        state.status = action.payload.status;

        if (action.payload.status === 'verified') {
          state.accessToken = action.payload.accessToken || null;
          state.refreshToken = action.payload.refreshToken || null;
          state.user = action.payload.user || null;
          state.needsPhone = Boolean(action.payload.needsPhone);
          state.nextStep = action.payload.nextStep || null;
        }
      })
      .addCase(pollEmailStatus.rejected, (state, action) => {
        state.polling = false;
        // Polling errors don't necessarily abort the flow, but log error
        console.log('[pollEmailStatus] Poll tick rejected:', action.payload);
      });

    // Attach Phone Number
    builder
      .addCase(attachPhone.pending, (state) => {
        state.phoneLoading = true;
        state.phoneError = null;
      })
      .addCase(attachPhone.fulfilled, (state, action) => {
        state.phoneLoading = false;
        state.attachedPhoneNumber = action.payload.phoneNumber;
        state.phoneVerificationId = action.payload.verificationId;
        state.devPhoneOtp = action.payload.otp || null;
        state.phoneCooldownSeconds =
          action.payload.resendCooldownSeconds || 60;
      })
      .addCase(attachPhone.rejected, (state, action) => {
        state.phoneLoading = false;
        state.phoneError = action.payload || 'Failed to attach phone number';
      });

    // Verify Attached Phone OTP
    builder
      .addCase(verifyAttachedPhone.pending, (state) => {
        state.phoneLoading = true;
        state.phoneError = null;
      })
      .addCase(verifyAttachedPhone.fulfilled, (state, action) => {
        state.phoneLoading = false;
        state.phoneAttached = true;
        state.needsPhone = false;
        if (action.payload.user) {
          state.user = action.payload.user;
        }
      })
      .addCase(verifyAttachedPhone.rejected, (state, action) => {
        state.phoneLoading = false;
        state.phoneError = action.payload || 'Invalid or expired OTP';
      });
  },
});

export const {
  clearEmailError,
  clearPhoneError,
  resetEmailState,
  resetPhoneAttachState,
  setEmail,
  setEmailVerificationId,
  setAttachedPhoneNumber,
  setAttachedPhoneVerificationId,
} = emailAuthSlice.actions;

export default emailAuthSlice.reducer;
