import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import chatServices, {
  ApiChatMessage,
  ApiChatReactionGroup,
  ApiChatThreadSummary,
  GetChatMessagesResponse,
  GetChatThreadsResponse,
  SendChatMessagePayload,
  SendChatPhotoPayload,
  SendChatMessageResponse,
} from '../../../services/chatServices';

export interface ChatState {
  threads: {
    familyChat: ApiChatThreadSummary | null;
    justUs: ApiChatThreadSummary[];
    canStartJustUs: boolean;
  };
  threadsLoading: boolean;
  threadsError: string | null;

  activeThreadId: string | null;

  messagesByThread: Record<string, ApiChatMessage[]>;
  messagesLoadingByThread: Record<string, boolean>;
  messagesErrorByThread: Record<string, string | null>;

  paginationByThread: Record<
    string,
    {
      limit: number;
      hasMore: boolean;
      nextCursor: string | null;
      loadingMore: boolean;
    }
  >;

  myLastReadAtByThread: Record<string, string | null>;

  quickMessages: string[];
  quickMessagesLoading: boolean;

  sharedSummary: {
    photos: any[];
    tasks: any[];
    events: any[];
    lists: any[];
  } | null;
  sharedSummaryLoading: boolean;

  searchResults: ApiChatMessage[];
  searchLoading: boolean;

  socketConnected: boolean;
}

const initialState: ChatState = {
  threads: {
    familyChat: null,
    justUs: [],
    canStartJustUs: false,
  },
  threadsLoading: false,
  threadsError: null,

  activeThreadId: null,

  messagesByThread: {},
  messagesLoadingByThread: {},
  messagesErrorByThread: {},

  paginationByThread: {},
  myLastReadAtByThread: {},

  quickMessages: [
    'On my way',
    "Dinner's ready",
    'Can someone pick up groceries?',
    'Please call me',
    'Almost there',
  ],
  quickMessagesLoading: false,

  sharedSummary: null,
  sharedSummaryLoading: false,

  searchResults: [],
  searchLoading: false,

  socketConnected: false,
};

// --- Async Thunks ---

/** 1. Fetch Chats List (GET /chat/threads) */
export const fetchChatThreads = createAsyncThunk<
  GetChatThreadsResponse,
  void,
  { rejectValue: string }
>('chat/fetchThreads', async (_, { rejectWithValue }) => {
  try {
    const res = await chatServices.getThreads();
    return res;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || err?.message || 'Failed to fetch chats'
    );
  }
});

/** 2. Fetch Messages in a thread (GET /chat/threads/:id/messages?limit=30) */
export const fetchChatMessages = createAsyncThunk<
  { threadId: string; response: GetChatMessagesResponse },
  { threadId: string; limit?: number },
  { rejectValue: string }
>('chat/fetchMessages', async ({ threadId, limit = 30 }, { rejectWithValue }) => {
  try {
    const res = await chatServices.getMessages(threadId, limit);
    return { threadId, response: res };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || err?.message || 'Failed to fetch messages'
    );
  }
});

/** 3. Fetch Older Messages (Pagination) */
export const fetchMoreChatMessages = createAsyncThunk<
  { threadId: string; response: GetChatMessagesResponse },
  { threadId: string; limit?: number },
  { state: { chat: ChatState }; rejectValue: string }
>('chat/fetchMoreMessages', async ({ threadId, limit = 30 }, { getState, rejectWithValue }) => {
  try {
    const pagination = getState().chat.paginationByThread[threadId];
    const cursor = pagination?.nextCursor;
    if (!cursor || !pagination?.hasMore) {
      return rejectWithValue('No more messages to load');
    }
    const res = await chatServices.getMessages(threadId, limit, cursor);
    return { threadId, response: res };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || err?.message || 'Failed to fetch more messages'
    );
  }
});

/** 4. Send Message (POST /chat/threads/:id/messages) */
export const sendChatMessage = createAsyncThunk<
  { threadId: string; message: ApiChatMessage; clientId: string },
  { threadId: string; payload: SendChatMessagePayload },
  { rejectValue: string }
>('chat/sendMessage', async ({ threadId, payload }, { rejectWithValue }) => {
  try {
    const res = await chatServices.sendMessage(threadId, payload);
    return { threadId, message: res.message, clientId: payload.clientId };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || err?.message || 'Failed to send message'
    );
  }
});

/** 5. Send Photo (POST /chat/threads/:id/photos) */
export const sendChatPhoto = createAsyncThunk<
  { threadId: string; message: ApiChatMessage; clientId: string },
  { threadId: string; payload: SendChatPhotoPayload },
  { rejectValue: string }
>('chat/sendPhoto', async ({ threadId, payload }, { rejectWithValue }) => {
  try {
    const res = await chatServices.sendPhoto(threadId, payload);
    return { threadId, message: res.message, clientId: payload.clientId };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || err?.message || 'Failed to send photo'
    );
  }
});

/** 6. Mark Thread as Read (POST /chat/threads/:id/read) */
export const markChatThreadRead = createAsyncThunk<
  { threadId: string; lastReadAt: string },
  string,
  { rejectValue: string }
>('chat/markRead', async (threadId, { rejectWithValue }) => {
  try {
    const res = await chatServices.markRead(threadId);
    return { threadId, lastReadAt: res.lastReadAt };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || err?.message || 'Failed to mark thread read'
    );
  }
});

/** 7. React to Message (PUT /chat/messages/:id/reaction) */
export const reactToChatMessage = createAsyncThunk<
  { messageId: string; threadId: string; reactions: ApiChatReactionGroup[] },
  { messageId: string; threadId: string; emoji: string },
  { rejectValue: string }
>('chat/react', async ({ messageId, threadId, emoji }, { rejectWithValue }) => {
  try {
    const res = await chatServices.reactToMessage(messageId, emoji);
    return { messageId, threadId, reactions: res.reactions };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || err?.message || 'Failed to react to message'
    );
  }
});

/** 8. Remove Reaction (DELETE /chat/messages/:id/reaction) */
export const removeChatReaction = createAsyncThunk<
  { messageId: string; threadId: string; reactions: ApiChatReactionGroup[] },
  { messageId: string; threadId: string },
  { rejectValue: string }
>('chat/unreact', async ({ messageId, threadId }, { rejectWithValue }) => {
  try {
    const res = await chatServices.removeReaction(messageId);
    return { messageId, threadId, reactions: res.reactions };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || err?.message || 'Failed to remove reaction'
    );
  }
});

/** 9. Save Photo to Vault (POST /chat/messages/:id/save-to-vault) */
export const saveChatPhotoToVault = createAsyncThunk<
  { messageId: string; vaultItem: any },
  { messageId: string; payload: { category: string; title: string; notes?: string } },
  { rejectValue: string }
>('chat/saveToVault', async ({ messageId, payload }, { rejectWithValue }) => {
  try {
    const res = await chatServices.savePhotoToVault(messageId, payload);
    return { messageId, vaultItem: res.vaultItem };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || err?.message || 'Failed to save to Vault'
    );
  }
});

/** 10. Add Shared Event to My Calendar (POST /calendar/events/:id/add-to-my-calendar) */
export const addEventToMyCalendar = createAsyncThunk<
  { eventId: string; event: any },
  string,
  { rejectValue: string }
>('chat/addToCalendar', async (eventId, { rejectWithValue }) => {
  try {
    const res = await chatServices.addSharedEventToMyCalendar(eventId);
    return { eventId, event: res.event };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || err?.message || 'Failed to add event to calendar'
    );
  }
});

/** 11. Search Messages (GET /chat/search?q=...) */
export const searchChatMessages = createAsyncThunk<
  ApiChatMessage[],
  { query: string; limit?: number },
  { rejectValue: string }
>('chat/search', async ({ query, limit = 20 }, { rejectWithValue }) => {
  try {
    const res = await chatServices.searchMessages(query, limit);
    return res.results;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || err?.message || 'Search failed'
    );
  }
});

/** 12. Fetch Shared Summary (GET /chat/shared) */
export const fetchSharedSummary = createAsyncThunk<
  { photos: any[]; tasks: any[]; events: any[]; lists: any[] },
  void,
  { rejectValue: string }
>('chat/fetchSharedSummary', async (_, { rejectWithValue }) => {
  try {
    const res = await chatServices.getSharedInFamilyChat();
    return {
      photos: res.photos || [],
      tasks: res.tasks || [],
      events: res.events || [],
      lists: res.lists || [],
    };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || err?.message || 'Failed to fetch shared items'
    );
  }
});

/** 13. Start Just Us Chat (POST /chat/just-us) */
export const startJustUsChat = createAsyncThunk<
  ApiChatThreadSummary,
  string,
  { rejectValue: string }
>('chat/startJustUs', async (memberId, { rejectWithValue }) => {
  try {
    const res = await chatServices.startJustUs(memberId);
    return res.thread;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || err?.message || 'Failed to start Just Us chat'
    );
  }
});

/** 14. Fetch Quick Messages (GET /chat/quick-messages) */
export const fetchQuickMessages = createAsyncThunk<
  string[],
  void,
  { rejectValue: string }
>('chat/fetchQuickMessages', async (_, { rejectWithValue }) => {
  try {
    const res = await chatServices.getQuickMessages();
    return res.quickMessages || [];
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || err?.message || 'Failed to fetch quick messages'
    );
  }
});

/** 15. Update Quick Messages (PUT /chat/quick-messages) */
export const updateQuickMessages = createAsyncThunk<
  string[],
  string[],
  { rejectValue: string }
>('chat/updateQuickMessages', async (quickMessages, { rejectWithValue }) => {
  try {
    const res = await chatServices.saveQuickMessages(quickMessages);
    return res.quickMessages || quickMessages;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || err?.message || 'Failed to save quick messages'
    );
  }
});

// --- Slice Definition ---

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveThreadId(state, action: PayloadAction<string | null>) {
      state.activeThreadId = action.payload;
    },
    setSocketConnected(state, action: PayloadAction<boolean>) {
      state.socketConnected = action.payload;
    },
    clearSearch(state) {
      state.searchResults = [];
      state.searchLoading = false;
    },

    // Optimistic pending message bubble while waiting for server response
    addOptimisticPendingMessage(
      state,
      action: PayloadAction<{ threadId: string; message: ApiChatMessage }>
    ) {
      const { threadId, message } = action.payload;
      if (!state.messagesByThread[threadId]) {
        state.messagesByThread[threadId] = [];
      }
      // Newest first: unshift to front
      state.messagesByThread[threadId].unshift(message);

      // Update thread lastMessage preview
      const thread =
        state.threads.familyChat?.id === threadId
          ? state.threads.familyChat
          : state.threads.justUs.find((t) => t.id === threadId);
      if (thread) {
        thread.lastMessage = {
          id: message.id,
          kind: message.kind,
          sender: message.sender,
          text: message.text,
          ciphertext: message.ciphertext,
          itemType: message.item?.type || null,
          createdAt: message.createdAt,
          isMine: true,
        };
      }
    },

    // Real-time socket event: Incoming message
    socketMessageReceived(state, action: PayloadAction<ApiChatMessage>) {
      const message = action.payload;
      const threadId = message.threadId;

      if (!state.messagesByThread[threadId]) {
        state.messagesByThread[threadId] = [];
      }

      const list = state.messagesByThread[threadId];
      // Check if message already exists by ID or by clientId
      const existingIdx = list.findIndex(
        (m) =>
          m.id === message.id ||
          (Boolean(message.clientId) && m.clientId === message.clientId)
      );

      if (existingIdx !== -1) {
        // Replace optimistic placeholder with confirmed server message
        list[existingIdx] = message;
      } else {
        // Newest first: prepend
        list.unshift(message);
      }

      // Update Threads list preview
      let targetThread: ApiChatThreadSummary | null = null;
      if (state.threads.familyChat && state.threads.familyChat.id === threadId) {
        targetThread = state.threads.familyChat;
      } else {
        const found = state.threads.justUs.find((t) => t.id === threadId);
        if (found) targetThread = found;
      }

      if (targetThread) {
        targetThread.lastMessage = {
          id: message.id,
          kind: message.kind,
          sender: message.sender,
          text: message.text,
          ciphertext: message.ciphertext,
          itemType: message.item?.type || null,
          createdAt: message.createdAt,
          isMine: Boolean(message.isMine),
        };

        // If thread is NOT currently active and message is from someone else, increment unreadCount
        if (state.activeThreadId !== threadId && !message.isMine) {
          targetThread.unreadCount = (targetThread.unreadCount || 0) + 1;
        }
      }
    },

    // Real-time socket event: Reactions updated
    socketReactionReceived(
      state,
      action: PayloadAction<{
        threadId: string;
        messageId: string;
        reactions: ApiChatReactionGroup[];
      }>
    ) {
      const { threadId, messageId, reactions } = action.payload;
      const messages = state.messagesByThread[threadId];
      if (messages) {
        const target = messages.find((m) => m.id === messageId);
        if (target) {
          target.reactions = reactions;
        }
      }
    },

    // Real-time socket event: Read receipt (✓✓)
    socketReadReceived(
      state,
      action: PayloadAction<{
        threadId: string;
        memberId: string;
        lastReadAt: string;
      }>
    ) {
      const { threadId, memberId, lastReadAt } = action.payload;
      const messages = state.messagesByThread[threadId];
      if (messages && messages.length > 0) {
        const readTime = new Date(lastReadAt).getTime();
        messages.forEach((m) => {
          if (m.isMine) {
            const msgTime = new Date(m.createdAt).getTime();
            if (msgTime <= readTime) {
              if (!m.seenBy) m.seenBy = [];
              if (!m.seenBy.some((s) => s.memberId === memberId)) {
                m.seenBy.push({ memberId, fullName: null });
              }
            }
          }
        });
      }
    },
  },
  extraReducers: (builder) => {
    // 1. Fetch Threads
    builder
      .addCase(fetchChatThreads.pending, (state) => {
        state.threadsLoading = true;
        state.threadsError = null;
      })
      .addCase(fetchChatThreads.fulfilled, (state, action) => {
        state.threadsLoading = false;
        state.threads.familyChat = action.payload.familyChat || null;
        state.threads.justUs = action.payload.justUs || [];
        state.threads.canStartJustUs = action.payload.canStartJustUs;
      })
      .addCase(fetchChatThreads.rejected, (state, action) => {
        state.threadsLoading = false;
        state.threadsError = action.payload || 'Failed to fetch chats';
      });

    // 2. Fetch Messages
    builder
      .addCase(fetchChatMessages.pending, (state, action) => {
        const threadId = action.meta.arg.threadId;
        state.messagesLoadingByThread[threadId] = true;
        state.messagesErrorByThread[threadId] = null;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        const { threadId, response } = action.payload;
        state.messagesLoadingByThread[threadId] = false;
        state.messagesByThread[threadId] = response.messages || [];
        state.myLastReadAtByThread[threadId] = response.myLastReadAt;
        state.paginationByThread[threadId] = {
          limit: response.pagination.limit,
          hasMore: response.pagination.hasMore,
          nextCursor: response.pagination.nextCursor,
          loadingMore: false,
        };

        // Reset unread count for this thread locally
        if (state.threads.familyChat?.id === threadId) {
          state.threads.familyChat.unreadCount = 0;
        } else {
          const found = state.threads.justUs.find((t) => t.id === threadId);
          if (found) found.unreadCount = 0;
        }
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        const threadId = action.meta.arg.threadId;
        state.messagesLoadingByThread[threadId] = false;
        state.messagesErrorByThread[threadId] = action.payload || 'Failed to fetch messages';
      });

    // 3. Fetch More Messages
    builder
      .addCase(fetchMoreChatMessages.pending, (state, action) => {
        const threadId = action.meta.arg.threadId;
        if (state.paginationByThread[threadId]) {
          state.paginationByThread[threadId].loadingMore = true;
        }
      })
      .addCase(fetchMoreChatMessages.fulfilled, (state, action) => {
        const { threadId, response } = action.payload;
        if (!state.messagesByThread[threadId]) {
          state.messagesByThread[threadId] = [];
        }
        // Append older messages to end of newest-first list
        state.messagesByThread[threadId] = [
          ...state.messagesByThread[threadId],
          ...(response.messages || []),
        ];
        state.paginationByThread[threadId] = {
          limit: response.pagination.limit,
          hasMore: response.pagination.hasMore,
          nextCursor: response.pagination.nextCursor,
          loadingMore: false,
        };
      })
      .addCase(fetchMoreChatMessages.rejected, (state, action) => {
        const threadId = action.meta.arg.threadId;
        if (state.paginationByThread[threadId]) {
          state.paginationByThread[threadId].loadingMore = false;
        }
      });

    // 4. Send Message (REST confirmation)
    builder.addCase(sendChatMessage.fulfilled, (state, action) => {
      const { threadId, message, clientId } = action.payload;
      const list = state.messagesByThread[threadId];
      if (list) {
        const idx = list.findIndex((m) => m.clientId === clientId || m.id === message.id);
        if (idx !== -1) {
          list[idx] = message;
        } else {
          list.unshift(message);
        }
      }
    });

    // 5. Send Photo (REST confirmation)
    builder.addCase(sendChatPhoto.fulfilled, (state, action) => {
      const { threadId, message, clientId } = action.payload;
      const list = state.messagesByThread[threadId];
      if (list) {
        const idx = list.findIndex((m) => m.clientId === clientId || m.id === message.id);
        if (idx !== -1) {
          list[idx] = message;
        } else {
          list.unshift(message);
        }
      }
    });

    // 6. Mark Read
    builder.addCase(markChatThreadRead.fulfilled, (state, action) => {
      const { threadId, lastReadAt } = action.payload;
      state.myLastReadAtByThread[threadId] = lastReadAt;
      if (state.threads.familyChat?.id === threadId) {
        state.threads.familyChat.unreadCount = 0;
      } else {
        const found = state.threads.justUs.find((t) => t.id === threadId);
        if (found) found.unreadCount = 0;
      }
    });

    // 7. Reactions
    builder.addCase(reactToChatMessage.fulfilled, (state, action) => {
      const { threadId, messageId, reactions } = action.payload;
      const messages = state.messagesByThread[threadId];
      if (messages) {
        const target = messages.find((m) => m.id === messageId);
        if (target) target.reactions = reactions;
      }
    });
    builder.addCase(removeChatReaction.fulfilled, (state, action) => {
      const { threadId, messageId, reactions } = action.payload;
      const messages = state.messagesByThread[threadId];
      if (messages) {
        const target = messages.find((m) => m.id === messageId);
        if (target) target.reactions = reactions;
      }
    });

    // 8. Shared Summary
    builder
      .addCase(fetchSharedSummary.pending, (state) => {
        state.sharedSummaryLoading = true;
      })
      .addCase(fetchSharedSummary.fulfilled, (state, action) => {
        state.sharedSummaryLoading = false;
        state.sharedSummary = action.payload;
      })
      .addCase(fetchSharedSummary.rejected, (state) => {
        state.sharedSummaryLoading = false;
      });

    // 9. Quick Messages
    builder.addCase(fetchQuickMessages.fulfilled, (state, action) => {
      if (action.payload && action.payload.length > 0) {
        state.quickMessages = action.payload;
      }
    });
    builder.addCase(updateQuickMessages.fulfilled, (state, action) => {
      state.quickMessages = action.payload;
    });

    // 10. Search
    builder
      .addCase(searchChatMessages.pending, (state) => {
        state.searchLoading = true;
      })
      .addCase(searchChatMessages.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchChatMessages.rejected, (state) => {
        state.searchLoading = false;
        state.searchResults = [];
      });

    // 11. Start Just Us
    builder.addCase(startJustUsChat.fulfilled, (state, action) => {
      const thread = action.payload;
      const existing = state.threads.justUs.find((t) => t.id === thread.id);
      if (!existing) {
        state.threads.justUs.unshift(thread);
      }
    });
  },
});

export const {
  setActiveThreadId,
  setSocketConnected,
  clearSearch,
  addOptimisticPendingMessage,
  socketMessageReceived,
  socketReactionReceived,
  socketReadReceived,
} = chatSlice.actions;

export default chatSlice.reducer;
