import { io, Socket } from 'socket.io-client';
import { AppState, AppStateStatus } from 'react-native';
import { API_SOCKET_CHAT_URL } from '../redux/endPoints/endPoints';
import { tokenService } from '../units/TokenServices';
import { ApiChatMessage, ApiChatReactionGroup } from './chatServices';

export type ChatMessageCallback = (message: ApiChatMessage) => void;
export type ChatReactionCallback = (data: {
  threadId: string;
  messageId: string;
  reactions: ApiChatReactionGroup[];
}) => void;
export type ChatReadCallback = (data: {
  threadId: string;
  memberId: string;
  lastReadAt: string;
}) => void;
export type ChatErrorCallback = (error: { message?: string }) => void;
export type ChatReconnectCallback = () => void;

class ChatSocketManager {
  private socket: Socket | null = null;
  private currentToken: string | null = null;
  private appStateSubscription: any = null;
  private messageListeners = new Set<ChatMessageCallback>();
  private reactionListeners = new Set<ChatReactionCallback>();
  private readListeners = new Set<ChatReadCallback>();
  private errorListeners = new Set<ChatErrorCallback>();
  private reconnectListeners = new Set<ChatReconnectCallback>();
  private isConnecting: boolean = false;

  constructor() {
    this.setupAppStateListener();
  }

  /**
   * Monitor app foreground/background transitions.
   * On coming back to foreground ('active'), reconnect if needed and trigger refresh.
   */
  private setupAppStateListener() {
    this.appStateSubscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          console.log('[chatSocket] App resumed to foreground, verifying connection...');
          if (this.currentToken) {
            if (!this.socket || !this.socket.connected) {
              this.connect(this.currentToken);
            }
            // Notify active screens to sync missed messages
            this.notifyReconnect();
          }
        }
      }
    );
  }

  /**
   * Connect to Socket.IO namespace (/chat).
   * Endpoint: ${API_SOCKET_CHAT_URL} (without /api/v1).
   */
  public async connect(token?: string): Promise<Socket | null> {
    if (this.isConnecting) {
      return this.socket;
    }

    const authToken = token || (await tokenService.getAccessToken());
    if (!authToken) {
      console.log('[chatSocket] Cannot connect: No access token found');
      return null;
    }

    this.currentToken = authToken;

    // If already connected with same token, keep alive
    if (this.socket?.connected) {
      return this.socket;
    }

    this.isConnecting = true;
    console.log('[chatSocket] Connecting to:', API_SOCKET_CHAT_URL);

    try {
      if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
      }

      this.socket = io(API_SOCKET_CHAT_URL, {
        transports: ['websocket'],
        auth: { token: authToken },
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      this.bindSocketEvents();
      return this.socket;
    } catch (err) {
      console.error('[chatSocket] Connection setup error:', err);
      return null;
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Bind server socket events to subscriber callbacks
   */
  private bindSocketEvents() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[chatSocket] ✅ Connected successfully with socket id:', this.socket?.id);
      this.notifyReconnect();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[chatSocket] ⚠️ Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.log('[chatSocket] ❌ Connection error:', error?.message);
    });

    // 1. New incoming message
    this.socket.on('chat:message', (message: ApiChatMessage) => {
      console.log('[chatSocket] 📩 chat:message received:', message?.id, message?.kind);
      this.messageListeners.forEach((listener) => {
        try {
          listener(message);
        } catch (e) {
          console.error('[chatSocket] Error in message listener:', e);
        }
      });
    });

    // 2. Reaction changed (added/updated/removed)
    this.socket.on('chat:reaction', (data: { threadId: string; messageId: string; reactions: ApiChatReactionGroup[] }) => {
      console.log('[chatSocket] 👍 chat:reaction received for msg:', data?.messageId);
      this.reactionListeners.forEach((listener) => {
        try {
          listener(data);
        } catch (e) {
          console.error('[chatSocket] Error in reaction listener:', e);
        }
      });
    });

    // 3. Thread read receipt (✓✓)
    this.socket.on('chat:read', (data: { threadId: string; memberId: string; lastReadAt: string }) => {
      console.log('[chatSocket] 👀 chat:read received from member:', data?.memberId);
      this.readListeners.forEach((listener) => {
        try {
          listener(data);
        } catch (e) {
          console.error('[chatSocket] Error in read listener:', e);
        }
      });
    });

    // 4. Token expired / auth error
    this.socket.on('chat:error', (error: { message?: string }) => {
      console.log('[chatSocket] 🚨 chat:error received:', error?.message);
      this.errorListeners.forEach((listener) => {
        try {
          listener(error);
        } catch (e) {
          console.error('[chatSocket] Error in error listener:', e);
        }
      });
    });
  }

  /**
   * Called when access token refreshes. Reconnects socket with the new token.
   */
  public updateToken(newToken: string) {
    if (!newToken) return;
    console.log('[chatSocket] Updating socket auth token...');
    this.currentToken = newToken;
    if (this.socket) {
      this.socket.disconnect();
      this.socket.auth = { token: newToken };
      this.socket.connect();
    } else {
      this.connect(newToken);
    }
  }

  /**
   * Disconnect socket cleanly on user logout
   */
  public disconnect() {
    console.log('[chatSocket] Disconnecting socket...');
    this.currentToken = null;
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Check if socket is currently connected
   */
  public isConnected(): boolean {
    return Boolean(this.socket && this.socket.connected);
  }

  private notifyReconnect() {
    this.reconnectListeners.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.error('[chatSocket] Error in reconnect callback:', e);
      }
    });
  }

  // --- Subscriptions ---

  public onMessage(callback: ChatMessageCallback): () => void {
    this.messageListeners.add(callback);
    return () => this.messageListeners.delete(callback);
  }

  public onReaction(callback: ChatReactionCallback): () => void {
    this.reactionListeners.add(callback);
    return () => this.reactionListeners.delete(callback);
  }

  public onRead(callback: ChatReadCallback): () => void {
    this.readListeners.add(callback);
    return () => this.readListeners.delete(callback);
  }

  public onError(callback: ChatErrorCallback): () => void {
    this.errorListeners.add(callback);
    return () => this.errorListeners.delete(callback);
  }

  public onReconnect(callback: ChatReconnectCallback): () => void {
    this.reconnectListeners.add(callback);
    return () => this.reconnectListeners.delete(callback);
  }

  public destroy() {
    this.disconnect();
    this.appStateSubscription?.remove?.();
    this.messageListeners.clear();
    this.reactionListeners.clear();
    this.readListeners.clear();
    this.errorListeners.clear();
    this.reconnectListeners.clear();
  }
}

export const chatSocket = new ChatSocketManager();
export default chatSocket;
