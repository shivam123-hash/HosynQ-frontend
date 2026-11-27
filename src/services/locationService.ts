import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export interface Coordinates {
  lat: number;
  lng: number;
}

let lastKnownCoords: Coordinates | null = null;

export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    try {
      Geolocation.requestAuthorization();
      return true;
    } catch {
      return false;
    }
  }

  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message:
            'HosynQ needs access to your location to display local weather and status.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('[locationService] Android permission request error:', err);
      return false;
    }
  }

  return false;
};

/**
 * Gets current device coordinates safely with a fallback.
 * Never throws — returns Coordinates or null.
 */
export const getCurrentCoordinates = async (
  timeoutMs = 4000
): Promise<Coordinates | null> => {
  return new Promise<Coordinates | null>((resolve) => {
    let settled = false;

    // Timeout safety fallback
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(lastKnownCoords);
      }
    }, timeoutMs);

    try {
      Geolocation.getCurrentPosition(
        (position) => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            const coords: Coordinates = {
              lat: Number(position.coords.latitude.toFixed(6)),
              lng: Number(position.coords.longitude.toFixed(6)),
            };
            lastKnownCoords = coords;
            resolve(coords);
          }
        },
        (error) => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            console.log('[locationService] getCurrentPosition error/denied:', error.message);
            resolve(lastKnownCoords);
          }
        },
        {
          enableHighAccuracy: false,
          timeout: timeoutMs,
          maximumAge: 60000, // 1 min cache
        }
      );
    } catch (err) {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        console.warn('[locationService] Geolocation call exception:', err);
        resolve(lastKnownCoords);
      }
    }
  });
};

export const getLastKnownCoordinates = (): Coordinates | null => lastKnownCoords;
