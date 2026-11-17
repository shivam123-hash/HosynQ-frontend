import { NativeModules, TurboModuleRegistry } from 'react-native';
import type { User } from '@react-native-google-signin/google-signin';
import { GOOGLE_AUTH_CONFIG } from '../config/googleAuth';

export interface GoogleAuthResult {
  success: boolean;
  user?: User['user'];
  idToken?: string | null;
  serverAuthCode?: string | null;
  error?: string;
  cancelled?: boolean;
}

// Check if RNGoogleSignin native module is registered in the current native binary
const isRNGoogleSigninAvailable = (): boolean => {
  try {
    const turbo = TurboModuleRegistry?.get ? TurboModuleRegistry.get('RNGoogleSignin') : null;
    const legacy = NativeModules?.RNGoogleSignin;
    return !!(turbo || legacy);
  } catch {
    return false;
  }
};

let GoogleSigninModule: any = null;
let statusCodesModule: any = null;

const getGoogleSignin = () => {
  if (GoogleSigninModule) {
    return { GoogleSignin: GoogleSigninModule, statusCodes: statusCodesModule };
  }

  // If running in Jest, allow require to use Jest mocks
  const isJest = typeof jest !== 'undefined';
  if (!isJest && !isRNGoogleSigninAvailable()) {
    return null;
  }

  try {
    const pkg = require('@react-native-google-signin/google-signin');
    GoogleSigninModule = pkg.GoogleSignin;
    statusCodesModule = pkg.statusCodes;
    return { GoogleSignin: GoogleSigninModule, statusCodes: statusCodesModule };
  } catch (error) {
    console.warn('[GoogleSignin] Failed to load native GoogleSignin module:', error);
    return null;
  }
};

export const configureGoogleSignIn = (): void => {
  const g = getGoogleSignin();
  if (!g || !g.GoogleSignin) {
    console.warn(
      '[GoogleSignIn] RNGoogleSignin native module is not registered in this binary. Run "cd ios && pod install" and rebuild the native app to enable Google Sign-In.'
    );
    return;
  }

  try {
    g.GoogleSignin.configure({
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
  const g = getGoogleSignin();
  if (!g || !g.GoogleSignin) {
    return {
      success: false,
      error:
        'Google Sign-In native module is not installed in the iOS binary. Please run "cd ios && pod install" and rebuild the app.',
    };
  }

  try {
    await g.GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response: any = await g.GoogleSignin.signIn();

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
    if (g.statusCodes && error.code === g.statusCodes.SIGN_IN_CANCELLED) {
      return { success: false, cancelled: true, error: 'User cancelled sign-in' };
    } else if (g.statusCodes && error.code === g.statusCodes.IN_PROGRESS) {
      return { success: false, error: 'Sign-in already in progress' };
    } else if (g.statusCodes && error.code === g.statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
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
  const g = getGoogleSignin();
  if (!g || !g.GoogleSignin) return;
  try {
    await g.GoogleSignin.signOut();
  } catch (error) {
    console.error('Error signing out of Google:', error);
  }
};

export const getCurrentGoogleUser = async (): Promise<User | null> => {
  const g = getGoogleSignin();
  if (!g || !g.GoogleSignin) return null;
  try {
    const user = await g.GoogleSignin.getCurrentUser();
    return user;
  } catch (error) {
    console.error('Error getting current Google user:', error);
    return null;
  }
};
