import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokenService } from './TokenServices';

const USER_DATA_KEY = 'user_data';
const MY_MEMBER_ID_KEY = 'my_member_id';
const CACHED_LIFE_PROFILE_KEY = 'cached_life_profile';

export interface StoredUserData {
  id?: string;
  phoneNumber?: string | null;
  name?: string | null;
  email?: string | null;
  role?: string;
  basicProfileComplete?: boolean;
  avatarUrl?: string | null;
  avatarColor?: string | null;
  memberId?: string | null;
  myMemberId?: string | null;
  [key: string]: any;
}

export const saveMyMemberId = async (memberId: string): Promise<void> => {
  try {
    if (!memberId) return;
    await AsyncStorage.setItem(MY_MEMBER_ID_KEY, memberId);

    // Also sync into stored user object if it exists
    const raw = await AsyncStorage.getItem(USER_DATA_KEY);
    const user = raw ? JSON.parse(raw) : {};
    user.memberId = memberId;
    user.myMemberId = memberId;
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('saveMyMemberId error:', error);
  }
};

export const getMyMemberId = async (): Promise<string | null> => {
  try {
    const id = await AsyncStorage.getItem(MY_MEMBER_ID_KEY);
    if (id) return id;
    const raw = await AsyncStorage.getItem(USER_DATA_KEY);
    const user = raw ? JSON.parse(raw) : null;
    return user?.myMemberId || user?.memberId || null;
  } catch (error) {
    console.error('getMyMemberId error:', error);
    return null;
  }
};

export const removeMyMemberId = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(MY_MEMBER_ID_KEY);
  } catch (error) {
    console.error('removeMyMemberId error:', error);
  }
};

export const saveUserData = async (payload: {
  user?: StoredUserData;
  accessToken?: string;
  refreshToken?: string;
  [key: string]: any;
}): Promise<void> => {
  try {
    if (payload?.user) {
      const mid = payload.user.myMemberId || payload.user.memberId;
      if (mid) {
        await AsyncStorage.setItem(MY_MEMBER_ID_KEY, mid);
      }
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
    const user = raw ? JSON.parse(raw) : null;
    const accessToken = await tokenService.getAccessToken();
    const refreshToken = await tokenService.getRefreshToken();
    const memberId = await AsyncStorage.getItem(MY_MEMBER_ID_KEY);
    if (user || accessToken || refreshToken || memberId) {
      return {
        ...(user || {}),
        accessToken: accessToken || user?.accessToken || null,
        refreshToken: refreshToken || user?.refreshToken || null,
        memberId: memberId || user?.memberId || user?.myMemberId || null,
        myMemberId: memberId || user?.myMemberId || user?.memberId || null,
      };
    }
    return null;
  } catch (error) {
    console.error('getUserData error:', error);
    return null;
  }
};

export const clearUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_DATA_KEY);
    await AsyncStorage.removeItem(MY_MEMBER_ID_KEY);
    await AsyncStorage.removeItem(CACHED_LIFE_PROFILE_KEY);
    await tokenService.clearTokens();
  } catch (error) {
    console.error('clearUserData error:', error);
  }
};

export const saveCachedLifeProfile = async (profileData: any): Promise<void> => {
  try {
    if (!profileData) return;
    await AsyncStorage.setItem(
      CACHED_LIFE_PROFILE_KEY,
      JSON.stringify(profileData)
    );
  } catch (error) {
    console.error('saveCachedLifeProfile error:', error);
  }
};

export const getCachedLifeProfile = async (): Promise<any | null> => {
  try {
    const raw = await AsyncStorage.getItem(CACHED_LIFE_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('getCachedLifeProfile error:', error);
    return null;
  }
};
