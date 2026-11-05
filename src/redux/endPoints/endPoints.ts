import { Platform } from 'react-native';

// Local development host configuration:
// iOS Simulator accesses localhost directly: http://localhost:5000/api/v1
// Android Emulator accesses host via 10.0.2.2: http://10.0.2.2:5000/api/v1
export const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:5000/api/v1',
  ios: 'http://localhost:5000/api/v1',
  default: 'http://localhost:5000/api/v1',
});

const API_ROUTES = {
  // Auth & Session Endpoints
  AUTH_SEND_OTP: 'auth/send-otp',
  AUTH_VERIFY_OTP: 'auth/verify-otp',
  AUTH_REFRESH: 'auth/refresh',
  AUTH_EMAIL_SEND_LINK: 'auth/email/send-link',
  AUTH_EMAIL_VERIFY: 'auth/email/verify',
  AUTH_EMAIL_STATUS: (verificationId: string) =>
    `auth/email/status/${verificationId}`,
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
  FAMILY_TRANSFER_OWNERSHIP: 'family/transfer-ownership',
  FAMILY_LIFE_PROFILE: 'family/life-profile',
};

export default API_ROUTES;

