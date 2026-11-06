import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from '@react-native-vector-icons/feather';

export interface AppTopBarProps {
  userAvatarBg?: string;
  hasUnreadNotifications?: boolean;
  onAvatarPress?: () => void;
  onExplorePress?: () => void;
  onNotificationsPress?: () => void;
}

const AppTopBar: React.FC<AppTopBarProps> = ({
  userAvatarBg = '#F472B6',
  hasUnreadNotifications = true,
  onAvatarPress,
  onExplorePress,
  onNotificationsPress,
}) => {
  return (
    <View style={styles.container}>
      {/* User Avatar */}
      <TouchableOpacity
        onPress={onAvatarPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Open profile"
        style={[styles.avatarButton, { backgroundColor: userAvatarBg }]}
      >
        <Text style={styles.avatarEmoji}>👩🏻‍💼</Text>
      </TouchableOpacity>

      {/* Brand Title */}
      <Text style={styles.brandTitle}>HosynQ</Text>

      {/* Right Action Icons */}
      <View style={styles.rightActions}>
        <TouchableOpacity
          onPress={onExplorePress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Explore"
          style={styles.iconButton}
        >
          <Feather name="compass" size={20} color="#CAD4DF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNotificationsPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          style={styles.iconButton}
        >
          <Feather name="bell" size={20} color="#CAD4DF" />
          {hasUnreadNotifications && <View style={styles.notificationDot} />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default memo(AppTopBar);

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#0B1A2F',
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3A4B60',
    overflow: 'hidden',
  },
  avatarEmoji: {
    fontSize: 22,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F0913A',
    letterSpacing: 0.2,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#1F3352',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#F0913A',
  },
});

