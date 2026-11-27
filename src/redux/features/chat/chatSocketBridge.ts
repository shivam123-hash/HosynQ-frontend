import { getStore } from '../../storeRegistry';
import chatSocket from '../../../services/chatSocket';
import {
  socketMessageReceived,
  socketReactionReceived,
  socketReadReceived,
  setSocketConnected,
  fetchChatThreads,
  markChatThreadRead,
} from './chatSlice';

let isBridgeInitialized = false;

/**
 * Initializes the connection between live Socket.IO events and the Redux store.
 * Call this once when user logs in or app initializes.
 */
export const initChatSocketBridge = (accessToken?: string) => {
  const store = getStore();
  if (!store) {
    console.warn('[chatSocketBridge] Cannot init: Redux store not ready');
    return;
  }

  // Connect socket with token
  chatSocket.connect(accessToken).then((socket) => {
    if (socket) {
      store.dispatch(setSocketConnected(socket.connected));
    }
  });

  if (isBridgeInitialized) {
    return;
  }
  isBridgeInitialized = true;

  // 1. Incoming live message
  chatSocket.onMessage((message) => {
    console.log('[chatSocketBridge] 📩 onMessage dispatching to Redux:', message?.id, message?.threadId);
    const currentStore = getStore();
    if (!currentStore) return;

    // Check if the message is from current user
    const state = currentStore.getState() as any;
    const myMemberId =
      state.family?.myMemberId ||
      state.family?.myFamilyData?.family?.myMemberId ||
      state.family?.family?.myMemberId ||
      state.baseProfile?.user?.memberId ||
      state.baseProfile?.user?.myMemberId;
    const currentUserId = state.baseProfile?.user?.id;
    const isMine =
      (Boolean(myMemberId) && message.sender?.memberId === myMemberId) ||
      (Boolean(currentUserId) &&
        ((message as any).senderId === currentUserId ||
          (message.sender as any)?.userId === currentUserId ||
          (message.sender as any)?.id === currentUserId));

    const enrichedMessage = {
      ...message,
      isMine: message.isMine !== undefined ? message.isMine : isMine,
    };

    currentStore.dispatch(socketMessageReceived(enrichedMessage));

    // If this thread is currently open on user screen, auto-mark as read
    const activeThreadId = state.chat?.activeThreadId;
    const threadId = message.threadId || (message as any).thread_id;
    if (activeThreadId && threadId && activeThreadId === threadId && !isMine) {
      currentStore.dispatch(markChatThreadRead(threadId));
    }
  });

  // 2. Incoming emoji reaction
  chatSocket.onReaction((data) => {
    const currentStore = getStore();
    if (currentStore) {
      const state = currentStore.getState() as any;
      const myMemberId =
        state.family?.myMemberId ||
        state.family?.myFamilyData?.family?.myMemberId ||
        state.family?.family?.myMemberId ||
        state.baseProfile?.user?.memberId ||
        state.baseProfile?.user?.myMemberId;

      currentStore.dispatch(
        socketReactionReceived({
          ...data,
          myMemberId,
        })
      );
    }
  });

  // 3. Incoming read receipt (✓✓)
  chatSocket.onRead((data) => {
    const currentStore = getStore();
    if (currentStore) {
      currentStore.dispatch(socketReadReceived(data));
    }
  });

  // 4. On socket reconnect (sync threads and missed messages)
  chatSocket.onReconnect(() => {
    const currentStore = getStore();
    if (currentStore) {
      currentStore.dispatch(setSocketConnected(true));
      currentStore.dispatch(fetchChatThreads());
    }
  });
};

/**
 * Disconnect socket on user logout and reset bridge state
 */
export const teardownChatSocketBridge = () => {
  chatSocket.disconnect();
  const store = getStore();
  if (store) {
    store.dispatch(setSocketConnected(false));
  }
};
