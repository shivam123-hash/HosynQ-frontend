import {
  GoogleSignin,
  statusCodes,
  type User,
} from '@react-native-google-signin/google-signin';
import { GOOGLE_AUTH_CONFIG } from '../config/googleAuth';

export interface GoogleAuthResult {
  success: boolean;
  user?: User['user'];
  idToken?: string | null;
  serverAuthCode?: string | null;
  error?: string;
  cancelled?: boolean;
}

export const configureGoogleSignIn = (): void => {
  try {
    GoogleSignin.configure({
      webClientId: GOOGLE_AUTH_CONFIG.webClientId,
      iosClientId: GOOGLE_AUTH_CONFIG.iosClientId,
      offlineAccess: GOOGLE_AUTH_CONFIG.offlineAccess,
      scopes: GOOGLE_AUTH_CONFIG.scopes,
    });
  } catch (error: any) {
    console.error('Error configuring Google Sign-In:', error);
  }
};

export const signInWithGoogle = async (): Promise<GoogleAuthResult> => {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response: any = await GoogleSignin.signIn();

    // In latest @react-native-google-signin/google-signin, response structure has data
    const userInfo = response?.data || response;
    const user = userInfo?.user;
    const idToken = userInfo?.idToken;

    return {
      success: true,
      user,
      idToken,
      serverAuthCode: userInfo?.serverAuthCode ?? null,
    };
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      return { success: false, cancelled: true, error: 'User cancelled sign-in' };
    } else if (error.code === statusCodes.IN_PROGRESS) {
      return { success: false, error: 'Sign-in already in progress' };
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return {
        success: false,
        error: 'Google Play Services not available or outdated',
      };
    }
    return {
      success: false,
      error: error.message || 'Google Sign-In failed',
    };
  }
};

export const signOutGoogle = async (): Promise<void> => {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.error('Error signing out of Google:', error);
  }
};

export const getCurrentGoogleUser = async (): Promise<User | null> => {
  try {
    const user = await GoogleSignin.getCurrentUser();
    return user;
  } catch (error) {
    console.error('Error getting current Google user:', error);
    return null;
  }
};

