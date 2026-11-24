import apiClient from './apiClient';
import API_ROUTES from '../redux/endPoints/endPoints';

export interface NotificationItemData {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  readAt: string | null;
  createdAt: string;
}

export interface ListNotificationsQuery {
  filter?: 'ALL' | 'UNREAD';
  limit?: number;
  before?: string;
}

export interface ListNotificationsResponse {
  success: boolean;
  unreadCount: number;
  notifications: NotificationItemData[];
  pagination: {
    limit: number;
    hasMore: boolean;
    nextCursor: string | null;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  unreadCount: number;
}

const notificationServices = {
  listNotifications: async (
    query?: ListNotificationsQuery
  ): Promise<ListNotificationsResponse> => {
    const response = await apiClient.get<ListNotificationsResponse>(
      API_ROUTES.NOTIFICATIONS,
      { params: query }
    );
    return response.data;
  },

  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const response = await apiClient.get<UnreadCountResponse>(
      API_ROUTES.NOTIFICATIONS_UNREAD_COUNT
    );
    return response.data;
  },

  markAllRead: async (): Promise<{ success: boolean; unreadCount: number }> => {
    const response = await apiClient.post<{ success: boolean; unreadCount: number }>(
      API_ROUTES.NOTIFICATIONS_READ_ALL,
      {}
    );
    return response.data;
  },

  markRead: async (
    notificationId: string
  ): Promise<{ success: boolean; unreadCount: number }> => {
    const response = await apiClient.patch<{ success: boolean; unreadCount: number }>(
      API_ROUTES.NOTIFICATION_MARK_READ(notificationId),
      {}
    );
    return response.data;
  },

  registerDevice: async (payload: {
    token: string;
    platform: 'IOS' | 'ANDROID';
    deviceId?: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      API_ROUTES.NOTIFICATIONS_REGISTER_DEVICE,
      payload
    );
    return response.data;
  },
};

export default notificationServices;
