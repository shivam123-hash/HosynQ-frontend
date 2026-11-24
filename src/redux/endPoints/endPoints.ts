import { Platform, NativeModules } from 'react-native';

/**
 * Local development host configuration:
 * Current Mac Wi-Fi IP: 192.168.1.18
 * (Find by running `ifconfig | grep "inet 192"` in Mac terminal)
 */
export const DEV_MACHINE_IP = '192.168.1.18';

/**
 * Automatically extracts the development host IP:
 * 1. Checks NativeModules.SourceCode.scriptURL (Metro packager IP)
 *    If Metro is accessed from 192.168.1.18, this dynamically resolves it!
 * 2. Falls back to DEV_MACHINE_IP (192.168.1.18) so real devices never call
 *    "localhost" (which points to the mobile device itself and causes Network Error).
 */
export const resolveDevHost = (): string => {
  try {
    const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;
    if (scriptURL) {
      const match = scriptURL.match(/^https?:\/\/([^:/]+)/i);
      const host = match?.[1];
      if (host) {
        // When Metro is on localhost (standard React Native with adb reverse on Android, or simulator on iOS),
        // localhost routes directly to Mac with zero Wi-Fi or firewall latency!
        if (host === 'localhost' || host === '127.0.0.1') {
          return 'localhost';
        }
        return host;
      }
    }
  } catch (e) {
    // fallback below
  }

  // On Android, localhost connects via adb reverse tcp:5000 tcp:5000 (or emulator loopback)
  if (Platform.OS === 'android') {
    return 'localhost';
  }

  return DEV_MACHINE_IP;
};

export const API_BASE_URL = `http://${resolveDevHost()}:5000/api/v1`;

const API_ROUTES = {
  // Auth & Session Endpoints
  AUTH_SEND_OTP: 'auth/send-otp',
  AUTH_VERIFY_OTP: 'auth/verify-otp',
  AUTH_GOOGLE: 'auth/google',
  AUTH_APPLE: 'auth/apple',
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
  FAMILY_REQUESTS: 'family/requests',
  FAMILY_REQUEST_APPROVE: (requestId: string) => `family/requests/${requestId}/approve`,
  FAMILY_REQUEST_REJECT: (requestId: string) => `family/requests/${requestId}/reject`,
  FAMILY_MEMBER_INVITES: 'family/member-invites',
  FAMILY_MEMBER_INVITE_BY_ID: (inviteId: string) => `family/member-invites/${inviteId}`,
  FAMILY_MEMBER_INVITES_MINE: 'family/member-invites/mine',
  FAMILY_MEMBER_INVITE_ACCEPT: (inviteId: string) => `family/member-invites/${inviteId}/accept`,
  FAMILY_MEMBER_INVITE_DECLINE: (inviteId: string) => `family/member-invites/${inviteId}/decline`,
  FAMILY_JOIN_PREVIEW: (familyId: string) => `family/preview/${familyId}`,
  FAMILY_MEMBERS: 'family/members',
  FAMILY_MEMBER_BY_ID: (memberId: string) => `family/members/${memberId}`,
  FAMILY_MEMBER_ROLE: (memberId: string) => `family/members/${memberId}/role`,
  FAMILY_INVITATIONS: 'family/invitations',
  FAMILY_INVITATION_BY_ID: (invitationId: string) => `family/invitations/${invitationId}`,
  FAMILY_INVITATION_PREVIEW: 'family/invitations/preview',
  FAMILY_MY_FAMILY: 'family/my-family',
  FAMILY_TRANSFER_OWNERSHIP: 'family/transfer-ownership',
  FAMILY_LEAVE: 'family/leave',
  FAMILY_DELETE: 'family',
  FAMILY_LIFE_PROFILE: 'family/life-profile',
  FAMILY_DOCUMENT_DELETE: (documentId: string) => `family/documents/${documentId}`,
  FAMILY_MEMBER_LIFE_PROFILE: (
    memberId: string,
    queryParams?: {
      view?: string;
      section?: string;
      documentId?: string;
      tab?: string;
      vaccineId?: string;
    }
  ) => {
    let url = `family/members/${memberId}/life-profile`;
    const params: string[] = [];
    if (queryParams?.view) {
      params.push(`view=${queryParams.view}`);
    }
    if (queryParams?.section) {
      params.push(`section=${queryParams.section}`);
    }
    if (queryParams?.documentId) {
      params.push(`documentId=${queryParams.documentId}`);
    }
    if (queryParams?.tab) {
      params.push(`tab=${queryParams.tab}`);
    }
    if (queryParams?.vaccineId) {
      params.push(`vaccineId=${queryParams.vaccineId}`);
    }
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    return url;
  },
  FAMILY_MEMBER_SCAN_DOCUMENT: (memberId: string) =>
    `family/members/${memberId}/documents/scan`,
  FAMILY_MEMBER_MEDICINES: (memberId: string) =>
    `family/members/${memberId}/medicines`,
  FAMILY_MEDICINE_BY_ID: (medicineId: string) =>
    `family/medicines/${medicineId}`,
  FAMILY_VACCINE_BY_ID: (vaccineId: string) =>
    `family/vaccines/${vaccineId}`,

  // Tasks Management Endpoints
  TASKS: 'tasks',
  TASKS_WORKLOAD: 'tasks/workload',
  TASK_BY_ID: (taskId: string) => `tasks/${taskId}`,
  TASK_COMPLETE: (taskId: string) => `tasks/${taskId}/complete`,
  TASK_REOPEN: (taskId: string) => `tasks/${taskId}/reopen`,
  TASK_REASSIGN: (taskId: string) => `tasks/${taskId}/reassign`,
  TASK_REMINDER_STATE: (taskId: string) => `tasks/${taskId}/reminder`,
  TASK_REMIND: (taskId: string) => `tasks/${taskId}/remind`,
  TASK_COMMENTS: (taskId: string) => `tasks/${taskId}/comments`,

  // Lists Management Endpoints
  LISTS: 'lists',
  LIST_BY_ID: (listId: string) => `lists/${listId}`,
  LIST_DUPLICATE: (listId: string) => `lists/${listId}/duplicate`,
  LIST_CLEAR_DONE: (listId: string) => `lists/${listId}/clear-done`,
  LIST_SUGGESTIONS: (listId: string) => `lists/${listId}/suggestions`,
  LIST_ITEMS: (listId: string) => `lists/${listId}/items`,
  LIST_ITEM_BY_ID: (listId: string, itemId: string) => `lists/${listId}/items/${itemId}`,
};

export default API_ROUTES;

