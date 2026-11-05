import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokenService } from './tokenServices';

const USER_DATA_KEY = 'user_data';

export interface StoredUserData {
  id?: string;
  phoneNumber?: string | null;
  name?: string | null;
  email?: string | null;
  role?: string;
  basicProfileComplete?: boolean;
  avatarUrl?: string | null;
  avatarColor?: string | null;
  [key: string]: any;
}

export const saveUserData = async (payload: {
  user?: StoredUserData;
  accessToken?: string;
  refreshToken?: string;
  [key: string]: any;
}): Promise<void> => {
  try {
    if (payload?.user) {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(payload.user));
    }
    if (payload?.accessToken || payload?.refreshToken) {
      await tokenService.setTokens(payload.accessToken, payload.refreshToken);
    }
  } catch (error) {
    console.error('saveUserData error:', error);
  }
};

export const getUserData = async (): Promise<StoredUserData | null> => {
  try {
    const raw = await AsyncStorage.getItem(USER_DATA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('getUserData error:', error);
    return null;
  }
};

export const clearUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_DATA_KEY);
    await tokenService.clearTokens();
  } catch (error) {
    console.error('clearUserData error:', error);
  }
};

