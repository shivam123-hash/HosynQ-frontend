import { Platform } from 'react-native';
import {
  appleAuth,
  AppleRequestResponse,
  AppleCredentialState,
  AppleRequestResponseFullName,
} from '@invertase/react-native-apple-authentication';

export interface AppleUser {
  id: string;
  name: string | null;
  email: string | null;
  givenName?: string | null;
  familyName?: string | null;
}

export interface AppleAuthResult {
  success: boolean;
  user?: AppleUser;
  identityToken?: string | null;
  authorizationCode?: string | null;
  error?: string;
  cancelled?: boolean;
}

/**
 * Helper to format Given Name and Family Name into a clean single string.
 */
const formatFullName = (
  fullName?: AppleRequestResponseFullName | null,
): string | null => {
  if (!fullName) return null;
  const parts = [
    fullName.givenName,
    fullName.middleName,
    fullName.familyName,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : null;
};

/**
 * Checks if Apple Authentication is supported on the current device.
 * Returns true for iOS 13+ devices, false for Android or older iOS.
 */
export const isAppleAuthSupported = (): boolean => {
  return Platform.OS === 'ios' && !!appleAuth.isSupported;
};

/**
 * Triggers the native Apple Sign-In sheet on iOS.
 * Requests fullName and email scopes.
 */
export const signInWithApple = async (): Promise<AppleAuthResult> => {
  try {
    if (!isAppleAuthSupported()) {
      return {
        success: false,
        error: 'Apple Authentication is only supported on iOS devices (iOS 13+).',
      };
    }

    // Trigger the native Apple Sign-In authentication request
    const response: AppleRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
    });

    console.log('[AppleAuthService] Raw Apple response received for user ID:', response.user);

    // Verify credential state to confirm valid authentication
    const credentialState = await appleAuth.getCredentialStateForUser(
      response.user,
    );

    if (credentialState === appleAuth.State.AUTHORIZED) {
      const formattedName = formatFullName(response.fullName);

      const user: AppleUser = {
        id: response.user,
        email: response.email,
        name: formattedName,
        givenName: response.fullName?.givenName || null,
        familyName: response.fullName?.familyName || null,
      };

      return {
        success: true,
        user,
        identityToken: response.identityToken,
        authorizationCode: response.authorizationCode,
      };
    }

    return {
      success: false,
      error: 'Apple authorization was not in an authorized state.',
    };
  } catch (error: any) {
    console.log('[AppleAuthService] Error during Apple Sign-In:', error);

    // Handle user cancellation
    if (
      error?.code === appleAuth.Error.CANCELED ||
      error?.code === '1001' ||
      error?.message?.includes?.('canceled') ||
      error?.message?.includes?.('cancelled')
    ) {
      return {
        success: false,
        cancelled: true,
        error: 'User cancelled Apple Sign-In.',
      };
    }

    return {
      success: false,
      error: error?.message || 'Apple Sign-In failed. Please try again.',
    };
  }
};

/**
 * Check the current Apple credential state for an already authenticated user.
 */
export const checkAppleCredentialState = async (
  userId: string,
): Promise<AppleCredentialState> => {
  try {
    return await appleAuth.getCredentialStateForUser(userId);
  } catch (error) {
    console.error('[AppleAuthService] Error checking credential state:', error);
    return appleAuth.State.NOT_FOUND;
  }
};

