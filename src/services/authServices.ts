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
  name?: string;
  gender?: string;
  avatarColor?: string;
  basicProfileComplete?: boolean;
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
  updateProfile: async (payload: UpdateProfilePayload): Promise<any> => {
    try {
      const response = await apiClient.patch(API_ROUTES.AUTH_PROFILE, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /** 5. Log out current device */
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

