import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const tokenService = {
  setTokens: async (access?: string | null, refresh?: string | null): Promise<void> => {
    try {
      if (access) {
        await AsyncStorage.setItem(ACCESS_TOKEN_KEY, access);
      }
      if (refresh) {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refresh);
      }
    } catch (error) {
      console.error('tokenService.setTokens error:', error);
    }
  },

  getAccessToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('tokenService.getAccessToken error:', error);
      return null;
    }
  },

  getRefreshToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('tokenService.getRefreshToken error:', error);
      return null;
    }
  },

  clearTokens: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('tokenService.clearTokens error:', error);
    }
  },
};

export default tokenService;
