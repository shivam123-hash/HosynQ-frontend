import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../../units/Colors';
import { useAppDispatch, useAppSelector } from '../../../redux';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../../redux/features/notifications/notificationsSlice';
import { NotificationItemData } from '../../../services/notificationServices';
import {
  NotificationsHeader,
  NotificationsFilterPills,
  NotificationSectionCard,
  NotificationsEmptyState,
} from './components';
import { INITIAL_NOTIFICATIONS } from './mockData';
import {
  NotificationFilterType,
  NotificationItem,
  NotificationSectionGroup,
  NotificationCategory,
} from './types';

const isUUID = (str: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

const mapNotificationDataToItem = (item: NotificationItemData): NotificationItem => {
  const isUnread = !item.readAt;
  const typeLower = (item.type || '').toLowerCase();

  let category: NotificationCategory = 'general';
  let iconName = 'bell';
  let iconBgColor = '#1E293B';
  let iconColor = '#8EB7F5';
  let isAvatar = false;
  let avatarInitial: string | undefined = undefined;
  let avatarBg: string | undefined = undefined;

  if (typeLower.includes('task')) {
    category = 'tasks';
    iconName = 'check-square';
    iconBgColor = 'rgba(16, 185, 129, 0.15)';
    iconColor = '#10B981';
  } else if (
    typeLower.includes('family') ||
    typeLower.includes('member') ||
    typeLower.includes('join')
  ) {
    category = 'family';
    iconName = 'users';
    iconBgColor = 'rgba(240, 146, 58, 0.15)';
    iconColor = '#F0913A';
    isAvatar = true;
    avatarInitial = item.title ? item.title.trim()[0].toUpperCase() : 'F';
    avatarBg = '#F0913A';
  } else if (typeLower.includes('event') || typeLower.includes('calendar')) {
    category = 'general';
    iconName = 'calendar';
    iconBgColor = 'rgba(59, 130, 246, 0.15)';
    iconColor = '#3B82F6';
  } else if (typeLower.includes('renew') || typeLower.includes('doc')) {
    category = 'renewals';
    iconName = 'file-text';
    iconBgColor = 'rgba(245, 158, 11, 0.15)';
    iconColor = '#F59E0B';
  }

  const diffMs = Date.now() - new Date(item.createdAt).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  let timeAgo = 'Just now';
  if (diffDays > 0) {
    timeAgo = `${diffDays}d ago`;
  } else if (diffHours > 0) {
    timeAgo = `${diffHours}h ago`;
  } else if (diffMins > 0) {
    timeAgo = `${diffMins}m ago`;
  }

  return {
    id: item.id,
    category,
    iconName,
    iconBgColor,
    iconColor,
    isAvatar,
    avatarInitial,
    avatarBg,
    title: item.title,
    subtitle: item.body,
    timestamp: timeAgo,
    isUnread,
    actionType: typeLower.includes('join') ? 'join_request' : 'default',
  };
};

export interface NotificationsScreenProps {
  isEmpty?: boolean;
  initialFilter?: NotificationFilterType;
  onBack?: () => void;
  onOpenPreferences?: () => void;
  onItemPress?: (item: NotificationItem) => void;
  onApprove?: (item: NotificationItem) => void;
  onDecline?: (item: NotificationItem) => void;
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  isEmpty = false,
  initialFilter = 'all',
  onBack,
  onOpenPreferences,
  onItemPress,
  onApprove,
  onDecline,
}) => {
  const dispatch = useAppDispatch();
  const notificationsState = useAppSelector((state) => state.notifications);

  const [selectedFilter, setSelectedFilter] =
    useState<NotificationFilterType>(initialFilter);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const apiNotifications = notificationsState?.notifications;
  useEffect(() => {
    if (apiNotifications && apiNotifications.length > 0) {
      setNotifications(apiNotifications.map(mapNotificationDataToItem));
    }
  }, [apiNotifications]);

  // Count unread notifications
  const unreadCount = useMemo(() => {
    if (isEmpty) return 0;
    return notifications.filter((n) => n.isUnread).length;
  }, [isEmpty, notifications]);

  // Mark all notifications as read
  const handleMarkAllRead = useCallback(() => {
    dispatch(markAllNotificationsRead());
    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        isUnread: false,
      }))
    );
  }, [dispatch]);

  // Filter items based on active pill
  const filteredItems = useMemo<NotificationItem[]>(() => {
    if (isEmpty) return [];

    switch (selectedFilter) {
      case 'unread':
        return notifications.filter((item) => item.isUnread);
      case 'tasks':
        return notifications.filter((item) => item.category === 'tasks');
      case 'family':
        return notifications.filter((item) => item.category === 'family');
      case 'all':
      default:
        return notifications;
    }
  }, [isEmpty, selectedFilter, notifications]);

  // Group filtered items into Today and Yesterday sections
  const sections = useMemo<NotificationSectionGroup[]>(() => {
    const todayIds = ['notif-1', 'notif-2', 'notif-3', 'notif-4'];
    const yesterdayIds = ['notif-5', 'notif-6', 'notif-7'];

    const todayItems = filteredItems.filter((item) =>
      todayIds.includes(item.id)
    );
    const yesterdayItems = filteredItems.filter((item) =>
      yesterdayIds.includes(item.id)
    );

    const result: NotificationSectionGroup[] = [];
    if (todayItems.length > 0) {
      result.push({
        key: 'today',
        title: 'TODAY',
        items: todayItems,
      });
    }
    if (yesterdayItems.length > 0) {
      result.push({
        key: 'yesterday',
        title: 'YESTERDAY',
        items: yesterdayItems,
      });
    }

    // In case there are items not in today/yesterday presets
    const remainingItems = filteredItems.filter(
      (item) => !todayIds.includes(item.id) && !yesterdayIds.includes(item.id)
    );
    if (remainingItems.length > 0) {
      result.push({
        key: 'earlier',
        title: 'EARLIER',
        items: remainingItems,
      });
    }

    return result;
  }, [filteredItems]);

  // Handle Item Press (mark single notification as read if UUID)
  const handleNotificationPress = useCallback(
    (item: NotificationItem) => {
      if (item.isUnread && isUUID(item.id)) {
        dispatch(markNotificationRead(item.id));
      }
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isUnread: false } : n))
      );
      onItemPress?.(item);
    },
    [dispatch, onItemPress]
  );

  // Handle Approve request
  const handleApprove = useCallback(
    (item: NotificationItem) => {
      if (isUUID(item.id)) {
        dispatch(markNotificationRead(item.id));
      }
      if (onApprove) {
        onApprove(item);
      } else {
        Alert.alert(
          'Request Approved',
          `${item.title} has been accepted into your family.`
        );
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === item.id
              ? {
                  ...n,
                  isUnread: false,
                  actionType: 'default',
                  subtitle: 'Approved · Joined The Sharma Family',
                }
              : n
          )
        );
      }
    },
    [dispatch, onApprove]
  );

  // Handle Decline request
  const handleDecline = useCallback(
    (item: NotificationItem) => {
      if (isUUID(item.id)) {
        dispatch(markNotificationRead(item.id));
      }
      if (onDecline) {
        onDecline(item);
      } else {
        Alert.alert(
          'Request Declined',
          `The join request has been declined.`
        );
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === item.id
              ? {
                  ...n,
                  isUnread: false,
                  actionType: 'default',
                  subtitle: 'Declined request',
                }
              : n
          )
        );
      }
    },
    [dispatch, onDecline]
  );

  const isCurrentEmpty = isEmpty || filteredItems.length === 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />

      {/* Screen Header */}
      <NotificationsHeader
        onBack={onBack}
        onMarkAllRead={handleMarkAllRead}
        showMarkAllRead={!isCurrentEmpty && unreadCount > 0}
      />

      {/* Filter Tabs / Pills */}
      <NotificationsFilterPills
        selectedFilter={selectedFilter}
        onSelectFilter={setSelectedFilter}
        unreadCount={unreadCount}
      />

      {/* Content Area */}
      {isCurrentEmpty ? (
        <ScrollView
          contentContainerStyle={styles.emptyScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <NotificationsEmptyState
            onOpenPreferences={
              onOpenPreferences ||
              (() => Alert.alert('Preferences', 'Notification preferences.'))
            }
          />
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {sections.map((section) => (
            <NotificationSectionCard
              key={section.key}
              section={section}
              onItemPress={handleNotificationPress}
              onApprove={handleApprove}
              onDecline={handleDecline}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  emptyScrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
});
