import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationServices, {
  NotificationItemData,
  ListNotificationsQuery,
  ListNotificationsResponse,
  UnreadCountResponse,
} from '../../../services/notificationServices';

export interface NotificationsState {
  notifications: NotificationItemData[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  nextCursor: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  hasMore: false,
  nextCursor: null,
};

// 1. Fetch Notifications
export const fetchNotificationsThunk = createAsyncThunk<
  ListNotificationsResponse,
  ListNotificationsQuery | undefined,
  { rejectValue: string }
>('notifications/fetchNotifications', async (query, { rejectWithValue }) => {
  try {
    const res = await notificationServices.listNotifications(query);
    return res;
  } catch (err: any) {
    const errorMsg =
      err?.response?.data?.message || err?.message || 'Failed to fetch notifications.';
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const fetchNotifications = fetchNotificationsThunk;

// 2. Fetch Unread Count
export const fetchUnreadCountThunk = createAsyncThunk<
  UnreadCountResponse,
  void,
  { rejectValue: string }
>('notifications/fetchUnreadCount', async (_, { rejectWithValue }) => {
  try {
    const res = await notificationServices.getUnreadCount();
    return res;
  } catch (err: any) {
    const errorMsg =
      err?.response?.data?.message || err?.message || 'Failed to get unread count.';
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const fetchUnreadCount = fetchUnreadCountThunk;

// 3. Mark All As Read
export const markAllNotificationsReadThunk = createAsyncThunk<
  { unreadCount: number },
  void,
  { rejectValue: string }
>('notifications/markAllRead', async (_, { rejectWithValue }) => {
  try {
    const res = await notificationServices.markAllRead();
    return res;
  } catch (err: any) {
    const errorMsg =
      err?.response?.data?.message || err?.message || 'Failed to mark all as read.';
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const markAllNotificationsRead = markAllNotificationsReadThunk;

// 4. Mark Single Notification As Read
export const markNotificationReadThunk = createAsyncThunk<
  { id: string; unreadCount: number },
  string,
  { rejectValue: string }
>('notifications/markRead', async (notificationId, { rejectWithValue }) => {
  try {
    const res = await notificationServices.markRead(notificationId);
    return { id: notificationId, unreadCount: res.unreadCount };
  } catch (err: any) {
    const errorMsg =
      err?.response?.data?.message || err?.message || 'Failed to mark notification as read.';
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const markNotificationRead = markNotificationReadThunk;

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotificationsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder
      .addCase(fetchNotificationsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications || [];
        state.unreadCount = action.payload.unreadCount ?? state.unreadCount;
        state.hasMore = action.payload.pagination?.hasMore || false;
        state.nextCursor = action.payload.pagination?.nextCursor || null;
      })
      .addCase(fetchNotificationsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Unread count
    builder.addCase(fetchUnreadCountThunk.fulfilled, (state, action) => {
      state.unreadCount = action.payload.unreadCount ?? 0;
    });

    // Mark all read
    builder.addCase(markAllNotificationsReadThunk.fulfilled, (state, action) => {
      state.unreadCount = action.payload.unreadCount ?? 0;
      state.notifications = state.notifications.map((n) => ({
        ...n,
        readAt: n.readAt || new Date().toISOString(),
      }));
    });

    // Mark single read
    builder.addCase(markNotificationReadThunk.fulfilled, (state, action) => {
      state.unreadCount = action.payload.unreadCount ?? Math.max(0, state.unreadCount - 1);
      state.notifications = state.notifications.map((n) =>
        n.id === action.payload.id
          ? { ...n, readAt: n.readAt || new Date().toISOString() }
          : n
      );
    });
  },
});

export const { clearNotificationsError } = notificationsSlice.actions;
export default notificationsSlice.reducer;
