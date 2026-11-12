import apiClient from './apiClient';
import API_ROUTES from '../redux/endPoints/endPoints';
import { saveUserData, clearUserData } from '../units/asyncStorageManager';

export interface SendOtpPayload {
  phoneNumber: string;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  verificationId: string;
  phoneNumber: string;
  otp?: string;
  expiresInMinutes?: number;
  resendCooldownSeconds?: number;
}

export interface VerifyOtpPayload {
  verificationId: string;
  otp: string;
  deviceInfo?: string;
  consentAccepted?: boolean;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  isNewUser?: boolean;
  accessToken?: string;
  refreshToken?: string;
  inFamily?: boolean;
  nextStep?: 'BASIC_PROFILE' | 'HOME' | 'CREATE_OR_JOIN_FAMILY' | 'WAITING_FOR_APPROVAL';
  user?: any;
}

export interface UpdateProfilePayload {
  fullName?: string;
  gender?: string;
  familyRole?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  user: any;
}

export interface UploadAvatarResponse {
  success: boolean;
  message: string;
  user: any;
}

export interface SendEmailLinkPayload {
  email: string;
  deviceInfo?: string;
  consentAccepted?: boolean;
}

export interface SendEmailLinkResponse {
  success: boolean;
  message: string;
  verificationId: string;
  email: string;
  token?: string;
  verifyUrl?: string;
  expiresInMinutes?: number;
  resendCooldownSeconds?: number;
}

export interface EmailStatusResponse {
  status: 'pending' | 'verified' | 'expired' | 'claimed';
  email: string;
  accessToken?: string;
  refreshToken?: string;
  inFamily?: boolean;
  nextStep?: 'BASIC_PROFILE' | 'HOME' | 'CREATE_OR_JOIN_FAMILY' | 'WAITING_FOR_APPROVAL' | string;
  user?: any;
  needsPhone?: boolean;
  emailAttached?: boolean;
}

export interface AttachPhonePayload {
  phoneNumber: string;
}

export interface AttachPhoneResponse {
  success: boolean;
  message: string;
  verificationId: string;
  phoneNumber: string;
  otp?: string;
  expiresInMinutes?: number;
  resendCooldownSeconds?: number;
}

export interface VerifyAttachedPhonePayload {
  verificationId: string;
  otp: string;
  deviceInfo?: string;
}

export interface VerifyAttachedPhoneResponse {
  success: boolean;
  message: string;
  phoneAttached?: boolean;
  user?: any;
}

export const authServices = {
  sendOtp: async (payload: SendOtpPayload): Promise<SendOtpResponse> => {
    try {
      const response = await apiClient.post<SendOtpResponse>(
        API_ROUTES.AUTH_SEND_OTP,
        payload
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  verifyOtp: async (payload: VerifyOtpPayload): Promise<VerifyOtpResponse> => {
    try {
      const response = await apiClient.post<VerifyOtpResponse>(
        API_ROUTES.AUTH_VERIFY_OTP,
        payload
      );

      const data = response.data;
      if (data?.accessToken) {
        await saveUserData({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  /** 3. Get current authenticated user details */
  getProfile: async (): Promise<any> => {
    try {
      const response = await apiClient.get(API_ROUTES.AUTH_ME);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /** 4. Update user basic profile */
  updateProfile: async (
    payload: UpdateProfilePayload
  ): Promise<UpdateProfileResponse> => {
    try {
      const response = await apiClient.patch<UpdateProfileResponse>(
        API_ROUTES.AUTH_PROFILE,
        payload
      );
      const data = response.data;
      if (data?.user) {
        await saveUserData({ user: data.user });
      }
      return data;
    } catch (error) {
      throw error;
    }
  },

  /** 5. Upload profile picture or avatar color (POST /auth/avatar) */
  uploadAvatar: async (
    formData: FormData
  ): Promise<UploadAvatarResponse> => {
    try {
      const response = await apiClient.post<UploadAvatarResponse>(
        API_ROUTES.AUTH_AVATAR,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      const data = response.data;
      if (data?.user) {
        await saveUserData({ user: data.user });
      }
      return data;
    } catch (error) {
      throw error;
    }
  },

  /** 6. Send Magic Link to Email */
  sendEmailLink: async (
    payload: SendEmailLinkPayload
  ): Promise<SendEmailLinkResponse> => {
    try {
      const response = await apiClient.post<SendEmailLinkResponse>(
        API_ROUTES.AUTH_EMAIL_SEND_LINK,
        payload
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /** 6. Poll Email Link Verification Status */
  getEmailStatus: async (
    verificationId: string
  ): Promise<EmailStatusResponse> => {
    try {
      const response = await apiClient.get<EmailStatusResponse>(
        API_ROUTES.AUTH_EMAIL_STATUS(verificationId)
      );
      const data = response.data;
      if (data?.status === 'verified' && data.accessToken) {
        await saveUserData({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
      }
      return data;
    } catch (error) {
      throw error;
    }
  },

  /** 7. Consume Email Magic Link (direct link click or dev mode verification) */
  consumeEmailLink: async (token: string): Promise<any> => {
    try {
      const response = await apiClient.post(API_ROUTES.AUTH_EMAIL_VERIFY, {
        token,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /** 8. Attach phone number to authenticated account */
  attachPhone: async (
    payload: AttachPhonePayload
  ): Promise<AttachPhoneResponse> => {
    try {
      const response = await apiClient.post<AttachPhoneResponse>(
        API_ROUTES.AUTH_PHONE_ATTACH,
        payload
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /** 9. Verify OTP for attached phone */
  verifyAttachedPhoneOtp: async (
    payload: VerifyAttachedPhonePayload
  ): Promise<VerifyAttachedPhoneResponse> => {
    try {
      const response = await apiClient.post<VerifyAttachedPhoneResponse>(
        API_ROUTES.AUTH_VERIFY_OTP,
        payload
      );
      const data = response.data;
      if (data?.user) {
        await saveUserData({ user: data.user });
      }
      return data;
    } catch (error) {
      throw error;
    }
  },

  /** 10. Log out current device */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post(API_ROUTES.AUTH_LOGOUT);
    } catch (error) {
      console.warn('Backend logout warning:', error);
    } finally {
      await clearUserData();
    }
  },
};

export default authServices;

