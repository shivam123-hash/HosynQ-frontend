import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const rnBiometrics = new ReactNativeBiometrics({
  allowDeviceCredentials: true, // Enables Phone Passcode / PIN / Pattern fallback!
});

const BIOMETRIC_ENABLED_KEY = '@hosynq_biometric_enabled';
const BIOMETRIC_TYPE_KEY = '@hosynq_biometric_type';

export type BiometricOptionType = 'fingerprint' | 'facelock';

export interface BiometricAvailabilityResult {
  available: boolean;
  biometryType: 'FaceID' | 'TouchID' | 'Biometrics' | null;
  sensorName: string;
}

export interface AuthenticationResult {
  success: boolean;
  cancelled?: boolean;
  error?: string;
}

export const biometricService = {
  /**
   * 1. Check if the device hardware supports biometrics (FaceID / Fingerprint / Biometrics)
   */
  checkAvailability: async (): Promise<BiometricAvailabilityResult> => {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();

      let sensorName = 'Fingerprint / Biometrics';
      if (biometryType === BiometryTypes.FaceID) {
        sensorName = 'Face ID';
      } else if (biometryType === BiometryTypes.TouchID) {
        sensorName = 'Touch ID';
      } else if (biometryType === BiometryTypes.Biometrics) {
        sensorName = Platform.OS === 'android' ? 'Fingerprint' : 'Biometrics';
      }

      console.log('[biometricService] Sensor check result:', {
        available,
        biometryType,
        sensorName,
      });

      return {
        available: Boolean(available),
        biometryType: biometryType ?? null,
        sensorName,
      };
    } catch (error: any) {
      console.warn('[biometricService] Sensor availability error:', error);
      return {
        available: false,
        biometryType: null,
        sensorName: 'Device Lock',
      };
    }
  },

  /**
   * 2. Trigger the native Biometric (Face ID / Fingerprint) Prompt
   * Automatically falls back to Phone Passcode / PIN if failed or selected by user!
   */
  authenticate: async (
    promptMessage: string = 'Scan to unlock HosynQ'
  ): Promise<AuthenticationResult> => {
    try {
      console.log('[biometricService] Showing native biometric prompt...');
      const result = await rnBiometrics.simplePrompt({
        promptMessage,
        cancelButtonText: 'Cancel',
        fallbackPromptMessage: 'Use Device Passcode / PIN',
      });

      if (result.success) {
        console.log('[biometricService] ✅ Authentication successful!');
        return { success: true };
      } else {
        console.log('[biometricService] User cancelled authentication');
        return { success: false, cancelled: true };
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Authentication failed';
      console.log('[biometricService] ❌ Authentication error:', errorMsg);

      const isUserCancel =
        errorMsg.toLowerCase().includes('cancel') ||
        errorMsg.toLowerCase().includes('user');

      return {
        success: false,
        cancelled: isUserCancel,
        error: errorMsg,
      };
    }
  },

  /**
   * 3. Save user preference (Enabled & Chosen Type)
   */
  savePreference: async (
    enabled: boolean,
    type: BiometricOptionType
  ): Promise<void> => {
    try {
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, JSON.stringify(enabled));
      await AsyncStorage.setItem(BIOMETRIC_TYPE_KEY, type);
      console.log('[biometricService] Preference saved:', { enabled, type });
    } catch (error) {
      console.error('[biometricService] Error saving preference:', error);
    }
  },

  /**
   * 4. Get stored preference
   */
  getPreference: async (): Promise<{
    enabled: boolean;
    type: BiometricOptionType;
  }> => {
    try {
      const enabledRaw = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      const typeRaw = (await AsyncStorage.getItem(
        BIOMETRIC_TYPE_KEY
      )) as BiometricOptionType | null;

      return {
        enabled: enabledRaw ? JSON.parse(enabledRaw) : true,
        type: typeRaw || 'fingerprint',
      };
    } catch (error) {
      console.error('[biometricService] Error reading preference:', error);
      return {
        enabled: true,
        type: 'fingerprint',
      };
    }
  },

  /**
   * 5. Clear stored preference
   */
  clearPreference: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
      await AsyncStorage.removeItem(BIOMETRIC_TYPE_KEY);
    } catch (error) {
      console.error('[biometricService] Error clearing preference:', error);
    }
  },
};

export default biometricService;

