import { Platform, NativeModules } from 'react-native';

/**
 * Local development host configuration:
 * Current Mac Wi-Fi IP: 192.168.1.11
 * (Find by running `ifconfig | grep "inet 192"` in Mac terminal)
 */
export const DEV_MACHINE_IP = '192.168.1.11';

/**
 * Automatically extracts the development host IP:
 * 1. Checks NativeModules.SourceCode.scriptURL (Metro packager IP)
 *    If Metro is accessed from 192.168.1.11, this dynamically resolves it!
 * 2. Falls back to DEV_MACHINE_IP (192.168.1.11) so real devices never call
 *    "localhost" (which points to the mobile device itself and causes Network Error).
 */
export const resolveDevHost = (): string => {
  try {
    const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;
    if (scriptURL) {
      const match = scriptURL.match(/^https?:\/\/([^:/]+)/i);
      const host = match?.[1];
      if (host) {
        // On iOS simulator, localhost routes directly to the Mac.
        // On Android physical devices, localhost hits the phone unless tcp:5000 is adb-reversed,
        // so prefer DEV_MACHINE_IP (which reaches the Mac over Wi-Fi on both physical device & emulator).
        if (host === 'localhost' || host === '127.0.0.1') {
          return Platform.OS === 'android' ? DEV_MACHINE_IP : 'localhost';
        }
        return host;
      }
    }
  } catch (e) {
    // fallback below
  }

  return DEV_MACHINE_IP;
};

export const API_BASE_URL = `http://${resolveDevHost()}:5000/api/v1`;
export const API_SOCKET_CHAT_URL = `http://${resolveDevHost()}:5000/chat`;

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
  FAMILY_MY_FAMILY_BASIC: 'family/my-family/basic',
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

  // Calendar Management Endpoints
  CALENDAR_FEED: 'calendar',
  CALENDAR_AVAILABILITY: 'calendar/availability',
  CALENDAR_EVENTS: 'calendar/events',
  CALENDAR_EVENT_BY_ID: (id: string, on?: string) =>
    `calendar/events/${id}${on ? `?on=${on}` : ''}`,
  CALENDAR_EVENT_CANCEL: (id: string) => `calendar/events/${id}/cancel`,
  CALENDAR_EVENT_RESPONSE: (id: string) => `calendar/events/${id}/response`,
  CALENDAR_EVENT_COMMENTS: (id: string) => `calendar/events/${id}/comments`,

  // Notifications Endpoints
  NOTIFICATIONS: 'notifications',
  NOTIFICATIONS_UNREAD_COUNT: 'notifications/unread-count',
  NOTIFICATIONS_READ_ALL: 'notifications/read-all',
  NOTIFICATION_MARK_READ: (id: string) => `notifications/${id}/read`,
  NOTIFICATIONS_REGISTER_DEVICE: 'notifications/devices',
  NOTIFICATIONS_SEND_TEST: 'notifications/test',

  // Trip Planner Endpoints (Postman Requests #1-#15)
  TRIPS: 'trips',
  TRIPS_COMMON_DATES: 'trips/common-dates',
  TRIP_BY_ID: (tripId: string) => `trips/${tripId}`,
  TRIP_CANCEL: (tripId: string) => `trips/${tripId}/cancel`,
  TRIP_PACKING_LIST: (tripId: string) => `trips/${tripId}/packing-list`,
  TRIP_BOOKINGS: (tripId: string) => `trips/${tripId}/bookings`,
  TRIP_BOOKING_BY_ID: (tripId: string, bookingId: string) =>
    `trips/${tripId}/bookings/${bookingId}`,

  // Family Pulse Endpoints (Postman Requests #1-#24)
  PULSE_HOME: 'pulse',
  PULSE_MOOD: 'pulse/mood',
  PULSE_APPRECIATIONS: 'pulse/appreciations',
  PULSE_APPRECIATION_BY_ID: (id: string) => `pulse/appreciations/${id}`,
  PULSE_APPRECIATION_REACTION: (id: string) => `pulse/appreciations/${id}/reaction`,
  PULSE_POLLS: 'pulse/polls',
  PULSE_POLL_BY_ID: (id: string) => `pulse/polls/${id}`,
  PULSE_POLL_VOTE: (id: string) => `pulse/polls/${id}/vote`,
  PULSE_POLL_CLOSE: (id: string) => `pulse/polls/${id}/close`,
  PULSE_MILESTONES: 'pulse/milestones',
  PULSE_MILESTONE_BY_ID: (id: string) => `pulse/milestones/${id}`,
  PULSE_MILESTONE_PHOTOS: (id: string) => `pulse/milestones/${id}/photos`,
  PULSE_MILESTONE_REACTION: (id: string) => `pulse/milestones/${id}/reaction`,

  // Family Vault Endpoints (Postman Requests #1-#9)
  VAULT_HOME: 'vault',
  VAULT_LIFE_PROFILE_DOCS: 'vault/life-profile-documents',
  VAULT_ITEMS: 'vault/items',
  VAULT_ITEM_BY_ID: (id: string) => `vault/items/${id}`,
  // Chat Endpoints
  CHAT_THREADS: 'chat/threads',
  CHAT_THREAD_MESSAGES: (threadId: string, queryParams?: { limit?: number; before?: string }) => {
    let url = `chat/threads/${threadId}/messages`;
    const params: string[] = [];
    if (queryParams?.limit) params.push(`limit=${queryParams.limit}`);
    if (queryParams?.before) params.push(`before=${encodeURIComponent(queryParams.before)}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return url;
  },
  CHAT_SEND_MESSAGE: (threadId: string) => `chat/threads/${threadId}/messages`,
  CHAT_SEND_PHOTO: (threadId: string) => `chat/threads/${threadId}/photos`,
  CHAT_THREAD_READ: (threadId: string) => `chat/threads/${threadId}/read`,
  CHAT_MESSAGE_REACTION: (messageId: string) => `chat/messages/${messageId}/reaction`,
  CHAT_MESSAGE_SAVE_TO_VAULT: (messageId: string) => `chat/messages/${messageId}/save-to-vault`,
  CALENDAR_EVENT_ADD_TO_MY_CALENDAR: (eventId: string) => `calendar/events/${eventId}/add-to-my-calendar`,
  CHAT_SEARCH: (query: string, limit: number = 20) => `chat/search?q=${encodeURIComponent(query)}&limit=${limit}`,
  CHAT_SHARED: 'chat/shared',
  CHAT_JUST_US: 'chat/just-us',
  CHAT_KEY: 'chat/key',
  CHAT_QUICK_MESSAGES: 'chat/quick-messages',
};

export default API_ROUTES;

