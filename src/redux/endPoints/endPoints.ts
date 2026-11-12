import { Platform } from 'react-native';

// Local development host configuration:
// - iOS Simulator accesses localhost: http://localhost:5000/api/v1
// - Real Android Device accesses via Mac's Wi-Fi IP: http://192.168.1.8:5000/api/v1
// - (Or if using USB cable with `adb reverse tcp:5000 tcp:5000`, localhost:5000 can be used)
const DEV_MACHINE_IP = '192.168.1.8';

export const API_BASE_URL = Platform.select({
  android: `http://${DEV_MACHINE_IP}:5000/api/v1`,
  ios: 'http://localhost:5000/api/v1',
  default: `http://${DEV_MACHINE_IP}:5000/api/v1`,
});

const API_ROUTES = {
  // Auth & Session Endpoints
  AUTH_SEND_OTP: 'auth/send-otp',
  AUTH_VERIFY_OTP: 'auth/verify-otp',
  AUTH_REFRESH: 'auth/refresh',
  AUTH_EMAIL_SEND_LINK: 'auth/email/send-link',
  AUTH_EMAIL_VERIFY: 'auth/email/verify',
  AUTH_EMAIL_STATUS: (verificationId: string) => `auth/email/status/${verificationId}`,
  AUTH_EMAIL_ATTACH: 'auth/email/attach',
  AUTH_PHONE_ATTACH: 'auth/phone/attach',
  AUTH_LOGOUT: 'auth/logout',
  AUTH_LOGOUT_ALL: 'auth/logout-all',
  AUTH_SESSIONS: 'auth/sessions',
  AUTH_REVOKE_SESSION: (sessionId: string) => `auth/sessions/${sessionId}`,
  AUTH_ME: 'auth/me',
  AUTH_PROFILE: 'auth/profile',
  AUTH_AVATAR: 'auth/avatar',
  AUTH_CONSENT: 'auth/consent',

  // Family Management Endpoints
  FAMILY_CREATE: 'family/create',
  FAMILY_JOIN_REQUEST: 'family/join-request',
  FAMILY_JOIN_PREVIEW: (familyId: string) => `family/preview/${familyId}`,
  FAMILY_MEMBERS: 'family/members',
  FAMILY_MEMBER_BY_ID: (memberId: string) => `family/members/${memberId}`,
  FAMILY_MEMBER_ROLE: (memberId: string) => `family/members/${memberId}/role`,
  FAMILY_INVITATIONS: 'family/invitations',
  FAMILY_INVITATION_PREVIEW: 'family/invitations/preview',
  FAMILY_MY_FAMILY: 'family/my-family',
  FAMILY_TRANSFER_OWNERSHIP: 'family/transfer-ownership',
  FAMILY_LIFE_PROFILE: 'family/life-profile',
};

export default API_ROUTES;

