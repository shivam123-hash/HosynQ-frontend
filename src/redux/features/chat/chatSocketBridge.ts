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
    const currentStore = getStore();
    if (!currentStore) return;

    currentStore.dispatch(socketMessageReceived(message));

    // If this thread is currently open on user screen, auto-mark as read
    const state = currentStore.getState() as any;
    const activeThreadId = state.chat?.activeThreadId;
    if (activeThreadId && activeThreadId === message.threadId && !message.isMine) {
      currentStore.dispatch(markChatThreadRead(message.threadId));
    }
  });

  // 2. Incoming emoji reaction
  chatSocket.onReaction((data) => {
    const currentStore = getStore();
    if (currentStore) {
      currentStore.dispatch(socketReactionReceived(data));
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
