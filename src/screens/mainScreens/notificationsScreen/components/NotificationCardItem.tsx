import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { NotificationItem } from '../types';

export interface NotificationCardItemProps {
  item: NotificationItem;
  onPress?: (item: NotificationItem) => void;
  onApprove?: (item: NotificationItem) => void;
  onDecline?: (item: NotificationItem) => void;
  showDivider?: boolean;
}

const NotificationCardItem: React.FC<NotificationCardItemProps> = ({
  item,
  onPress,
  onApprove,
  onDecline,
  showDivider = true,
}) => {
  return (
    <View style={[styles.container, showDivider && styles.divider]}>
      <TouchableOpacity
        style={styles.touchableArea}
        activeOpacity={0.7}
        onPress={() => onPress?.(item)}
      >
        {/* Left Icon / Avatar */}
        <View style={styles.iconContainer}>
          {item.isAvatar ? (
            <View
              style={[
                styles.avatarCircle,
                { backgroundColor: item.avatarBg || '#1A3358' },
              ]}
            >
              <Text
                style={[
                  styles.avatarText,
                  { color: item.avatarColor || '#8DB8F5' },
                ]}
              >
                {item.avatarInitial || 'U'}
              </Text>
            </View>
          ) : item.iconSymbol ? (
            <View
              style={[
                styles.symbolCircle,
                {
                  borderColor: item.iconBorderColor || '#2A3E5E',
                  backgroundColor: item.iconBgColor || '#15253D',
                },
              ]}
            >
              <Text
                style={[
                  styles.symbolText,
                  { color: item.iconColor || '#F0913A' },
                ]}
              >
                {item.iconSymbol}
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.iconCircle,
                {
                  borderColor: item.iconBorderColor || '#1E4E38',
                  backgroundColor: item.iconBgColor || '#102820',
                },
              ]}
            >
              <Feather
                name={(item.iconName as any) || 'bell'}
                size={18}
                color={item.iconColor || '#4CC38A'}
              />
            </View>
          )}
        </View>

        {/* Center Details */}
        <View style={styles.contentContainer}>
          <Text style={styles.titleText}>{item.title}</Text>
          <Text style={styles.subtitleText}>{item.subtitle}</Text>

          {/* Action buttons (e.g. for join family request) */}
          {item.actionType === 'join_request' && (
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.approveButton}
                activeOpacity={0.8}
                onPress={() => onApprove?.(item)}
                accessibilityRole="button"
                accessibilityLabel="Approve request"
              >
                <Text style={styles.approveButtonText}>Approve</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.declineButton}
                activeOpacity={0.8}
                onPress={() => onDecline?.(item)}
                accessibilityRole="button"
                accessibilityLabel="Decline request"
              >
                <Text style={styles.declineButtonText}>Decline</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Right Info: Timestamp & Unread Dot */}
        <View style={styles.rightContainer}>
          <Text style={styles.timestampText}>{item.timestamp}</Text>
          {item.isUnread && <View style={styles.unreadDot} />}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default NotificationCardItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#1F3352',
  },
  touchableArea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  symbolCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  symbolText: {
    fontSize: 18,
    fontWeight: '700',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  contentContainer: {
    flex: 1,
    marginRight: 8,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#CAD4DF',
    lineHeight: 20,
  },
  subtitleText: {
    fontSize: 13,
    color: '#8A97AB',
    marginTop: 2,
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  approveButton: {
    height: 34,
    paddingHorizontal: 20,
    borderRadius: 17,
    backgroundColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveButtonText: {
    color: '#0B1A2F',
    fontWeight: '700',
    fontSize: 13,
  },
  declineButton: {
    height: 34,
    paddingHorizontal: 20,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: '#3A4556',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineButtonText: {
    color: '#CAD4DF',
    fontWeight: '600',
    fontSize: 13,
  },
  rightContainer: {
    alignItems: 'flex-end',
    minWidth: 50,
  },
  timestampText: {
    fontSize: 12,
    color: '#8A97AB',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F0913A',
    marginTop: 8,
  },
});
