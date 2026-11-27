import apiClient from './apiClient';
import API_ROUTES from '../redux/endPoints/endPoints';

export type ChatItemType = 'TASK' | 'EVENT' | 'LIST';
export type ChatMessageKind = 'TEXT' | 'PHOTO' | 'ITEM';

export interface ApiChatSender {
  memberId: string;
  fullName: string | null;
  avatarUrl?: string | null;
  avatarColor?: string | null;
}

export interface ApiChatReactionGroup {
  emoji: string;
  count: number;
  memberIds: string[];
}

export interface ApiChatSharedCard {
  type: ChatItemType;
  available: boolean;
  task?: any;
  event?: any;
  list?: any;
}

export interface ApiChatMessageQuoted {
  id: string;
  kind: ChatMessageKind;
  sender: ApiChatSender | null;
  text: string | null;
  ciphertext?: string | null;
  photoUrl?: string | null;
  item?: { type: ChatItemType; id: string } | null;
  createdAt: string;
}

export interface ApiChatMessage {
  id: string;
  threadId: string;
  clientId?: string | null;
  kind: ChatMessageKind;
  sender: ApiChatSender | null; // null means former member
  text: string | null;
  ciphertext?: string | null;
  photoUrl?: string | null;
  item?: { type: ChatItemType; id: string } | null;
  replyTo?: ApiChatMessageQuoted | null;
  reactions: ApiChatReactionGroup[];
  createdAt: string;
  isMine?: boolean;
  myReaction?: string | null;
  seenBy?: Array<{ memberId: string; fullName: string | null }> | null;
  card?: ApiChatSharedCard | null;
}

export interface ApiChatLastMessage {
  id: string;
  kind: ChatMessageKind;
  sender: ApiChatSender | null;
  text: string | null;
  ciphertext?: string | null;
  itemType?: ChatItemType | null;
  createdAt: string;
  isMine?: boolean;
}

export interface ApiChatPartner {
  memberId: string;
  fullName: string | null;
  avatarUrl?: string | null;
  avatarColor?: string | null;
  user?: {
    chatPublicKey?: string | null;
  };
}

export interface ApiChatThreadSummary {
  id: string;
  kind: 'FAMILY' | 'JUST_US';
  title?: string;
  unreadCount: number;
  lastReadAt: string | null;
  lastMessage: ApiChatLastMessage | null;
  partner?: ApiChatPartner | null;
}

export interface GetChatThreadsResponse {
  success: boolean;
  familyChat: ApiChatThreadSummary;
  justUs: ApiChatThreadSummary[];
  canStartJustUs: boolean;
}

export interface GetChatMessagesResponse {
  success: boolean;
  myLastReadAt: string | null;
  messages: ApiChatMessage[];
  pagination: {
    limit: number;
    hasMore: boolean;
    nextCursor: string | null;
  };
}

export interface SendChatMessagePayload {
  clientId: string;
  text?: string;
  replyToId?: string;
  itemType?: ChatItemType;
  itemId?: string;
  ciphertext?: string;
}

export interface SendChatPhotoPayload {
  photo: {
    uri: string;
    type?: string;
    name?: string;
  };
  clientId: string;
  text?: string;
  replyToId?: string;
}

export interface SendChatMessageResponse {
  success: boolean;
  message: ApiChatMessage;
}

export interface MarkChatReadResponse {
  success: boolean;
  lastReadAt: string;
}

export interface ChatReactionResponse {
  success: boolean;
  reactions: ApiChatReactionGroup[];
}

export interface ChatSearchResponse {
  success: boolean;
  results: ApiChatMessage[];
}

export interface ChatSharedSummaryResponse {
  success: boolean;
  photos: any[];
  tasks: any[];
  events: any[];
  lists: any[];
}

export interface StartJustUsResponse {
  success: boolean;
  thread: ApiChatThreadSummary;
}

export interface QuickMessagesResponse {
  success: boolean;
  quickMessages: string[];
}

const chatServices = {
  // 1. Get chats list (GET /chat/threads)
  getThreads: async (): Promise<GetChatThreadsResponse> => {
    const response = await apiClient.get<GetChatThreadsResponse>(API_ROUTES.CHAT_THREADS);
    return response.data;
  },

  // 2. Get messages in a thread (GET /chat/threads/:id/messages?limit=30&before=...)
  getMessages: async (
    threadId: string,
    limit: number = 30,
    before?: string
  ): Promise<GetChatMessagesResponse> => {
    const url = API_ROUTES.CHAT_THREAD_MESSAGES(threadId, { limit, before });
    const response = await apiClient.get<GetChatMessagesResponse>(url);
    return response.data;
  },

  // 3. Send a message (POST /chat/threads/:id/messages)
  sendMessage: async (
    threadId: string,
    payload: SendChatMessagePayload
  ): Promise<SendChatMessageResponse> => {
    try {
      console.log('[chatServices.sendMessage] POST', API_ROUTES.CHAT_SEND_MESSAGE(threadId), 'payload:', payload);
      const response = await apiClient.post<SendChatMessageResponse>(
        API_ROUTES.CHAT_SEND_MESSAGE(threadId),
        payload
      );
      console.log('[chatServices.sendMessage] SUCCESS:', response.status, response.data);
      return response.data;
    } catch (err: any) {
      console.error(
        '[chatServices.sendMessage] ERROR status:',
        err?.response?.status,
        'data:',
        JSON.stringify(err?.response?.data),
        'message:',
        err?.message
      );
      throw err;
    }
  },

  // 4. Send a photo (POST /chat/threads/:id/photos)
  sendPhoto: async (
    threadId: string,
    payload: SendChatPhotoPayload
  ): Promise<SendChatMessageResponse> => {
    const formData = new FormData();
    formData.append('photo', {
      uri: payload.photo.uri,
      type: payload.photo.type || 'image/jpeg',
      name: payload.photo.name || `photo-${Date.now()}.jpg`,
    } as any);
    formData.append('clientId', payload.clientId);
    if (payload.text) {
      formData.append('text', payload.text);
    }
    if (payload.replyToId) {
      formData.append('replyToId', payload.replyToId);
    }

    const response = await apiClient.post<SendChatMessageResponse>(
      API_ROUTES.CHAT_SEND_PHOTO(threadId),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // 5. Mark thread as read (POST /chat/threads/:id/read)
  markRead: async (threadId: string): Promise<MarkChatReadResponse> => {
    const response = await apiClient.post<MarkChatReadResponse>(
      API_ROUTES.CHAT_THREAD_READ(threadId),
      {}
    );
    return response.data;
  },

  // 6. React with an emoji (PUT /chat/messages/:id/reaction)
  reactToMessage: async (
    messageId: string,
    emoji: string
  ): Promise<ChatReactionResponse> => {
    const response = await apiClient.put<ChatReactionResponse>(
      API_ROUTES.CHAT_MESSAGE_REACTION(messageId),
      { emoji }
    );
    return response.data;
  },

  // 7. Remove my reaction (DELETE /chat/messages/:id/reaction)
  removeReaction: async (messageId: string): Promise<ChatReactionResponse> => {
    const response = await apiClient.delete<ChatReactionResponse>(
      API_ROUTES.CHAT_MESSAGE_REACTION(messageId)
    );
    return response.data;
  },

  // 8. Save photo to Vault (POST /chat/messages/:id/save-to-vault)
  savePhotoToVault: async (
    messageId: string,
    payload: { category: string; title: string; notes?: string }
  ): Promise<{ success: boolean; vaultItem?: any }> => {
    const response = await apiClient.post<{ success: boolean; vaultItem?: any }>(
      API_ROUTES.CHAT_MESSAGE_SAVE_TO_VAULT(messageId),
      payload
    );
    return response.data;
  },

  // 9. Add shared event to my calendar (POST /calendar/events/:id/add-to-my-calendar)
  addSharedEventToMyCalendar: async (
    eventId: string
  ): Promise<{ success: boolean; event: any }> => {
    const response = await apiClient.post<{ success: boolean; event: any }>(
      API_ROUTES.CALENDAR_EVENT_ADD_TO_MY_CALENDAR(eventId),
      {}
    );
    return response.data;
  },

  // 10. Search messages (GET /chat/search?q=...)
  searchMessages: async (
    query: string,
    limit: number = 20
  ): Promise<ChatSearchResponse> => {
    const response = await apiClient.get<ChatSearchResponse>(
      API_ROUTES.CHAT_SEARCH(query, limit)
    );
    return response.data;
  },

  // 11. Shared in Family chat summary (GET /chat/shared)
  getSharedInFamilyChat: async (): Promise<ChatSharedSummaryResponse> => {
    const response = await apiClient.get<ChatSharedSummaryResponse>(
      API_ROUTES.CHAT_SHARED
    );
    return response.data;
  },

  // 12. Start Just Us chat with adult (POST /chat/just-us)
  startJustUs: async (memberId: string): Promise<StartJustUsResponse> => {
    try {
      console.log('[chatServices.startJustUs] POST', API_ROUTES.CHAT_JUST_US, 'with memberId:', memberId);
      const response = await apiClient.post<StartJustUsResponse>(
        API_ROUTES.CHAT_JUST_US,
        { memberId }
      );
      console.log('[chatServices.startJustUs] SUCCESS status:', response.status, 'data:', response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        '[chatServices.startJustUs] ERROR response status:',
        error?.response?.status,
        'data:',
        JSON.stringify(error?.response?.data),
        'message:',
        error?.message
      );
      throw error;
    }
  },

  // 13. Save my public key for Just Us (PUT /chat/key)
  savePublicKey: async (publicKey: string): Promise<{ success: boolean }> => {
    const response = await apiClient.put<{ success: boolean }>(
      API_ROUTES.CHAT_KEY,
      { publicKey }
    );
    return response.data;
  },

  // 14. Get quick messages (GET /chat/quick-messages)
  getQuickMessages: async (): Promise<QuickMessagesResponse> => {
    const response = await apiClient.get<QuickMessagesResponse>(
      API_ROUTES.CHAT_QUICK_MESSAGES
    );
    return response.data;
  },

  // 15. Save quick messages (PUT /chat/quick-messages)
  saveQuickMessages: async (
    quickMessages: string[]
  ): Promise<QuickMessagesResponse> => {
    const response = await apiClient.put<QuickMessagesResponse>(
      API_ROUTES.CHAT_QUICK_MESSAGES,
      { quickMessages }
    );
    return response.data;
  },

  // 16. Get Tasks list for share picker (GET /tasks?status=PENDING&limit=50)
  getTasksForShare: async (search?: string): Promise<{ success: boolean; tasks: any[] }> => {
    try {
      const params: Record<string, string> = { status: 'PENDING', limit: '50' };
      if (search?.trim()) {
        params.q = search.trim();
      }
      const response = await apiClient.get<any>(
        API_ROUTES.TASKS,
        { params }
      );
      const data = response.data;
      const tasks = data?.tasks || data?.data?.tasks || (Array.isArray(data) ? data : []);
      return { success: true, tasks };
    } catch (error) {
      console.warn('[chatServices.getTasksForShare] Error fetching tasks:', error);
      return { success: false, tasks: [] };
    }
  },

  // 17. Get Events list for share picker (GET /calendar?from=...&to=...)
  getEventsForShare: async (
    fromDate?: string,
    toDate?: string
  ): Promise<{ success: boolean; events: any[] }> => {
    try {
      const today = new Date();
      const todayStr = today.toISOString().slice(0, 10);
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - 14);
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + 90);

      const from = fromDate || pastDate.toISOString().slice(0, 10);
      const to = toDate || futureDate.toISOString().slice(0, 10);

      const response = await apiClient.get<any>(
        API_ROUTES.CALENDAR_FEED,
        {
          params: {
            from,
            to,
            today: todayStr,
          },
        }
      );
      const data = response.data;
      const events = data?.events || data?.data?.events || (Array.isArray(data) ? data : []);
      return { success: true, events };
    } catch (error) {
      console.warn('[chatServices.getEventsForShare] Error fetching events:', error);
      return { success: false, events: [] };
    }
  },

  // 18. Get Lists for share picker (GET /lists?archived=false)
  getListsForShare: async (): Promise<{ success: boolean; lists: any[] }> => {
    try {
      const response = await apiClient.get<any>(
        API_ROUTES.LISTS,
        {
          params: {
            archived: false,
          },
        }
      );
      const data = response.data;
      const lists = data?.lists || data?.data?.lists || (Array.isArray(data) ? data : []);
      return { success: true, lists };
    } catch (error) {
      console.warn('[chatServices.getListsForShare] Error fetching lists:', error);
      return { success: false, lists: [] };
    }
  },
};

export default chatServices;
