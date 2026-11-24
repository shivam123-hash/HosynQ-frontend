import { Platform } from 'react-native';

/**
 * Returns a human-friendly device info string to identify active device sessions
 * e.g. "iPhone (iOS 18.2)" or "Pixel 7 (Android 14)"
 */
export const getDeviceInfo = (): string => {
  if (Platform.OS === 'ios') {
    const systemName = (Platform.constants as any)?.systemName || 'iOS';
    const osVersion = (Platform.constants as any)?.osVersion || Platform.Version;
    const deviceType = Platform.isPad ? 'iPad' : 'iPhone';
    return `${deviceType} (${systemName} ${osVersion})`;
  } else if (Platform.OS === 'android') {
    const constants = (Platform.constants as any) || {};
    const model = constants.Model || 'Android Device';
    const release = constants.Release || Platform.Version;
    return `${model} (Android ${release})`;
  }
  return 'Mobile Device';
};

export default getDeviceInfo;

