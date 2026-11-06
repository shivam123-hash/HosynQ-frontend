import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../../units/Colors';
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
} from './types';

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
  const [selectedFilter, setSelectedFilter] =
    useState<NotificationFilterType>(initialFilter);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Count unread notifications
  const unreadCount = useMemo(() => {
    if (isEmpty) return 0;
    return notifications.filter((n) => n.isUnread).length;
  }, [isEmpty, notifications]);

  // Mark all notifications as read
  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        isUnread: false,
      }))
    );
  }, []);

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

  // Handle Approve request
  const handleApprove = useCallback(
    (item: NotificationItem) => {
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
    [onApprove]
  );

  // Handle Decline request
  const handleDecline = useCallback(
    (item: NotificationItem) => {
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
    [onDecline]
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
              onItemPress={onItemPress}
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
